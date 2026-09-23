#!/usr/bin/env node
// Automated QA: opens every page in Chromium (phone + desktop sizes), fails on console errors,
// horizontal overflow or broken internal links, then plays through lesson flows.
// Usage: node tools/qa.js [filter]
const http = require('http');
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const ROOT = path.resolve(__dirname, '..');
const filter = process.argv[2] || '';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

function serve() {
  return new Promise((res) => {
    const srv = http.createServer((req, resp) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f)) { resp.writeHead(404); return resp.end('404'); }
      resp.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(resp);
    }).listen(0, () => res(srv));
  });
}

function allPages() {
  const out = [];
  (function walk(d) {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (['tools', '.git', 'node_modules'].includes(f)) continue;
      if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.html')) out.push(path.relative(ROOT, p));
    }
  })(ROOT);
  return out.sort();
}

const results = [];
function record(page, ok, note) { results.push({ page, ok, note }); console.log(`${ok ? '✅' : '❌'} ${page}${note ? ' — ' + note : ''}`); }

// Scripted play-throughs that complete each lesson's activity.
const FLOWS = require('./qa-flows');

(async () => {
  const srv = await serve();
  const base = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? undefined : undefined });
  const pages = allPages().filter((p) => p.includes(filter));
  let failures = 0;

  for (const vp of [{ name: 'phone', width: 375, height: 740 }, { name: 'desktop', width: 1280, height: 900 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: vp.name === 'phone' });
    for (const rel of pages) {
      const pg = await ctx.newPage();
      const errors = [];
      pg.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
      pg.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
      pg.on('requestfailed', (r) => errors.push('requestfailed: ' + r.url()));
      pg.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:')) errors.push('external request: ' + r.url()); });
      await pg.goto(base + rel, { waitUntil: 'load' });
      await pg.waitForTimeout(150);
      // horizontal overflow
      const over = await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (over > 1) errors.push(`horizontal overflow ${over}px`);
      // internal links resolve
      const links = await pg.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
      for (const h of links) {
        if (/^(https?:|mailto:|#|data:|blob:)/.test(h)) continue;
        const target = path.normalize(path.join(path.dirname(path.join(ROOT, rel)), h.split('#')[0]));
        if (!fs.existsSync(target)) errors.push('broken link: ' + h);
      }
      // external links only on parents page, and clearly labeled
      const ext = links.filter((h) => /^https?:/.test(h));
      if (ext.length && rel !== 'parents.html') errors.push('external links outside parents page: ' + ext.join(', '));
      // images need alt
      const noAlt = await pg.$$eval('img:not([alt])', (x) => x.length);
      if (noAlt) errors.push(noAlt + ' images without alt');
      // buttons need accessible names
      const unnamed = await pg.$$eval('button', (bs) => bs.filter((b) => !(b.textContent.trim() || b.getAttribute('aria-label'))).length);
      if (unnamed) errors.push(unnamed + ' buttons without a name');
      if (errors.length) failures++;
      record(`[${vp.name}] ${rel}`, !errors.length, errors.join(' | '));
      await pg.close();
    }
    await ctx.close();
  }

  // ---- play-throughs (phone size) ----
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', (e) => errs.push(e.message));
  pg.on('dialog', (d) => d.accept());
  await pg.goto(base + 'index.html');
  // onboarding picker
  await pg.click('[data-go="2"]'); await pg.click('.pk-av >> nth=2'); await pg.click('[data-go="3"]'); await pg.click('#pk-done');
  const prof = await pg.evaluate(() => Dojo.profile());
  record('flow: onboarding picker saves profile', !!(prof && prof.nick && prof.avatar && prof.themes.length), JSON.stringify(prof));

  for (const [id, flow] of Object.entries(FLOWS)) {
    if (id.startsWith('test:')) continue;
    if (filter && !id.includes(filter) && !filter.includes('flow')) continue;
    errs.length = 0;
    await pg.goto(base + 'worlds/' + id + '.html');
    let note = '';
    try {
      await flow.activity(pg);
      await pg.waitForTimeout(300);
      const act = await pg.evaluate((i) => !!(Dojo.state().lessons[i] || {}).act, id);
      if (!act) throw new Error('activity did not complete');
      // quiz: answer everything correctly by matching choice text
      const qs = await pg.evaluate(() => window.LESSON.quiz.length);
      for (let k = 0; k < qs; k++) {
        await pg.evaluate(() => {
          const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent; };
          const q = window.LESSON.quiz.find((x) => txt(Dojo.fill(x.q)) === document.querySelector('.qz-q').textContent);
          const want = txt(Dojo.fill(q.a[q.c]));
          [...document.querySelectorAll('.qz-choice')].find((b) => b.textContent === want).click();
        });
        await pg.click('.qz-next');
      }
      const st = await pg.evaluate((i) => Dojo.state().lessons[i], id);
      if (!st.done || st.quiz.best !== qs) throw new Error('lesson not marked done: ' + JSON.stringify(st));
      // challenge
      if (flow.challenge) {
        await pg.click('#challenge-box > summary');
        await pg.waitForFunction(() => document.querySelector('#challenge').children.length > 0);
        await flow.challenge(pg);
        await pg.waitForTimeout(300);
        const ch = await pg.evaluate((i) => !!Dojo.state().lessons[i].ch, id);
        if (!ch) throw new Error('challenge did not complete');
      }
      // progress persists after reload
      await pg.reload();
      const kept = await pg.evaluate((i) => Dojo.state().lessons[i] && Dojo.state().lessons[i].done, id);
      if (!kept) throw new Error('progress lost after reload');
      const ck = await pg.$$eval('.steps li.on', (x) => x.length);
      note = `checklist ${ck}/3`;
      if (errs.length) throw new Error(errs.join(' | '));
      record('flow: ' + id, true, note);
    } catch (e) { failures++; record('flow: ' + id, false, e.message.split('\n')[0]); }
  }

  // belt tests for worlds whose lessons are all complete
  const worlds = await pg.evaluate(() => Dojo.C.worlds.filter((w) => w.built).map((w) => w.id));
  for (const w of worlds) {
    if (filter && !w.includes(filter) && !filter.includes('flow')) continue;
    const tflow = FLOWS['test:' + w];
    if (!tflow) continue;
    errs.length = 0;
    try {
      // make sure all lessons are done (flows above may be filtered)
      await pg.evaluate((wid) => { const W = Dojo.worldById(wid); W.lessons.forEach((l) => { const s = Dojo.state(); s.lessons[wid + '/' + l.id] = Object.assign({ act: true, quiz: { best: 3, total: 3 }, done: '2026-01-01' }, s.lessons[wid + '/' + l.id] || {}); }); Dojo.save(); }, w);
      await pg.goto(base + 'worlds/' + w + '/belt-test.html');
      for (let k = 0; k < 10; k++) {
        await pg.evaluate(() => {
          const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent; };
          const q = window.TEST_QUIZ.find((x) => txt(Dojo.fill(x.q)) === document.querySelector('.qz-q').textContent);
          [...document.querySelectorAll('.qz-choice')].find((b) => b.textContent === txt(Dojo.fill(q.a[q.c]))).click();
        });
        await pg.click('.qz-next');
      }
      await pg.waitForTimeout(700);
      await tflow(pg);
      await pg.waitForSelector('.ceremony', { timeout: 8000 });
      await pg.click('.cer-ok');
      const belt = await pg.evaluate((wid) => Dojo.state().belts[wid], w);
      if (!belt) throw new Error('belt not awarded');
      if (errs.length) throw new Error(errs.join(' | '));
      record('flow: belt test ' + w, true);
    } catch (e) { failures++; record('flow: belt test ' + w, false, e.message.split('\n')[0]); }
  }

  // certificate unlocks after the Black Belt
  if (!filter || filter.includes('black') || filter.includes('flow')) {
    await pg.goto(base + 'certificate.html');
    const ok = await pg.evaluate(() => !document.getElementById('cert').hidden && document.querySelector('.c-name').textContent === 'Yusuf');
    const hasBlack = await pg.evaluate(() => !!Dojo.state().belts.black);
    if (hasBlack) { record('flow: certificate shows after Black Belt', ok); if (!ok) failures++; }
    const builder = await pg.evaluate(() => !!Dojo.state().badges.builder);
    if (hasBlack) { record('flow: Master Builder badge from final project', builder); if (!builder) failures++; }
  }

  // daily dojo streak
  if (!filter || filter.includes('daily') || filter.includes('flow')) {
    try {
      await pg.goto(base + 'daily.html');
      for (let k = 0; k < 5; k++) { await pg.click('.qz-choice >> nth=0'); await pg.click('.qz-next'); }
      const s = await pg.evaluate(() => Dojo.streakNow());
      record('flow: daily dojo streak', s === 1, 'streak=' + s);
      if (s !== 1) failures++;
    } catch (e) { failures++; record('flow: daily dojo', false, e.message.split('\n')[0]); }
  }

  // autosave: leave mid-activity / mid-quiz, come back, and everything is restored
  if (!filter || filter.includes('save') || filter.includes('flow')) {
    const c2 = await browser.newContext({ viewport: { width: 390, height: 800 } });
    const p2 = await c2.newPage(); const e2 = [];
    p2.on('pageerror', (e) => e2.push(e.message));
    const check = (name, ok, note) => { if (!ok) failures++; record('autosave: ' + name, ok, note); };
    try {
      await p2.goto(base + 'worlds/white/is-it-ai.html');
      for (let k = 0; k < 3; k++) { await p2.click('#sm-yes'); await p2.waitForTimeout(450); }
      await p2.reload(); await p2.waitForTimeout(300);
      const n = await p2.textContent('#sm-n');
      check('sorting game resumes at card 4', /Card 4 \/ 12/.test(n), n);
      // quiz mid-way
      const qs = await p2.$$('#quiz .qz-choice');
      await qs[0].click(); await p2.click('#quiz .qz-next');
      await (await p2.$$('#quiz .qz-choice'))[0].click();
      await p2.reload(); await p2.waitForTimeout(300);
      const qc = await p2.textContent('#quiz .qz-count');
      check('quiz resumes at question 3', /Question 3 of/.test(qc), qc);
      // grid levels + blocks
      await p2.goto(base + 'worlds/white/al-khwarizmi.html');
      for (const b of ['F', 'F', 'F']) await p2.click(`#activity .gg-pal [data-b="${b}"]`);
      await p2.click('#activity [data-g="run"]');
      await p2.waitForFunction(() => /Goal reached/.test(document.querySelector('#activity [data-g="fb"]').textContent), null, { timeout: 15000 });
      await p2.click('#activity [data-g="next"]');
      await p2.click('#activity .gg-pal [data-b="L"]');
      await p2.reload(); await p2.waitForTimeout(300);
      const title = await p2.textContent('#activity [data-g="title"]');
      const blocks = await p2.$$eval('#activity [data-g="prog"] .gg-blk', (x) => x.length);
      check('algorithm dojo resumes on level 2 with saved blocks', /Level 2/.test(title) && blocks === 1, title + ' / blocks=' + blocks);
      // hub continue button points to the last unfinished lesson
      await p2.goto(base + 'index.html'); await p2.waitForTimeout(200);
      if (await p2.$('#picker:not([hidden])')) { await p2.click('[data-go="2"]'); await p2.click('[data-go="3"]'); await p2.click('#pk-done'); }
      const href = await p2.getAttribute('#cont-btn', 'href');
      check('hub Continue returns to last lesson', href === 'worlds/white/al-khwarizmi.html', href);
      // picker only on first visit
      await p2.reload(); await p2.waitForTimeout(200);
      check('ninja picker does not reappear', !!(await p2.$('#picker[hidden]')));
      check('no page errors', !e2.length, e2.join(' | '));
    } catch (e) { failures++; record('autosave', false, e.message.split('\n')[0]); }
    await c2.close();
  }

  // arcade: locked with no badges, then every game is played through to a win
  if (!filter || filter.includes('arcade') || filter.includes('flow')) {
    const c3 = await browser.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true });
    const p3 = await c3.newPage(); const e3 = [];
    p3.on('pageerror', (e) => e3.push(e.message));
    const SOLVE = {
      'pattern-ninja': () => { const el = document.getElementById('stage'); (el.__ans || []).forEach((i) => { const b = el.querySelector('.pn-grid button[data-i="' + i + '"]'); if (b && !b.disabled) b.click(); }); },
      'data-dunk': () => { const el = document.getElementById('stage'); const b = el.querySelector('.dd-opts button[data-i="' + el.__ans + '"]'); if (b && !b.disabled) b.click(); },
      'neural-penalty-kicks': () => {
        const el = document.getElementById('stage'); const go = el.querySelector('#pk-go'); const rt = el.querySelector('#pk-retry');
        if (rt) return rt.click();
        if (!go) return;
        ['w1', 'w2', 'b'].forEach((k, i) => { const r = el.querySelector('#pk-' + k); r.value = el.__sol[i]; r.dispatchEvent(new Event('input')); });
        el.querySelector('#pk-go').click();
      },
      'minimax-checkmate': () => {
        const el = document.getElementById('stage'); const s = el.__sol; if (!s || el.__qaSol === s) return; el.__qaSol = s;
        el.querySelector('[data-sq="' + s[0] + '"]').click(); el.querySelector('[data-sq="' + s[1] + '"]').click();
      },
      'token-tetris': () => { const el = document.getElementById('stage'); if (el.__toks) el.__toks[el.__ans].click(); },
      'maze-race': () => {
        const el = document.getElementById('stage'); const m = el.querySelector('.mr-msg');
        if (!m || !/GO!/.test(m.textContent) || el.__qaPath === el.__path) return; el.__qaPath = el.__path;
        el.__path.forEach((d) => el.querySelector('[data-d="' + d + '"]').click());
      },
      'bias-detective': () => { const el = document.getElementById('stage'); const b = el.querySelector('.bd-opts button[data-i="' + el.__ans + '"]'); if (b && !b.disabled) b.click(); },
      'spot-the-fake': () => { const el = document.getElementById('stage'); const b = el.querySelector('.sf-opts button[data-k="' + el.__ans + '"]'); if (b && !b.disabled) b.click(); },
    };
    for (const [id, solve] of Object.entries(SOLVE)) {
      e3.length = 0;
      try {
        await p3.goto(base + 'arcade/' + id + '.html');
        await p3.evaluate(() => { const s = Dojo.state(); s.unlockAll = false; s.badges = {}; Dojo.save(); });
        await p3.reload();
        if (!(await p3.$('.ar-lock'))) throw new Error('not locked with 0 badges');
        await p3.evaluate(() => { Dojo.state().unlockAll = true; Dojo.save(); });
        await p3.reload();
        await p3.click('#ar-start');
        const t0 = Date.now();
        while (!(await p3.$('#ar-again'))) {
          if (Date.now() - t0 > 180000) throw new Error('timed out');
          await p3.evaluate(solve).catch(() => {});
          await p3.waitForTimeout(120);
        }
        const h = await p3.textContent('.ar-screen h2');
        const rec = await p3.evaluate((g) => Dojo.state().arcade[g], id);
        if (h !== 'You win!' || !rec || rec.wins !== 1) throw new Error('result: ' + h + ' ' + JSON.stringify(rec));
        // replay starts a fresh game
        await p3.click('#ar-again');
        await p3.waitForTimeout(400);
        if (await p3.$('#ar-again')) throw new Error('replay did not start');
        if (e3.length) throw new Error(e3.join(' | '));
        record('arcade: ' + id + ' locks, plays to a win, replays', true, 'score ' + rec.best);
      } catch (e) { failures++; record('arcade: ' + id, false, e.message.split('\n')[0]); }
    }
    await c3.close();
  }

  await browser.close(); srv.close();
  const bad = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - bad}/${results.length} checks passed.`);
  process.exit(bad ? 1 : 0);
})();
