// Scripted play-throughs used by qa.js. Each activity/challenge function drives the page until done() fires.
const clickAll = async (pg, sel) => { for (const h of await pg.$$(sel)) { if (await h.isEnabled()) await h.click(); } };
const grid = async (pg, root, prog) => {
  for (const b of prog) await pg.click(`${root} .gg-pal [data-b="${b}"]`);
  await pg.click(`${root} [data-g="run"]`);
  await pg.waitForFunction((r) => /Goal reached|Crash|didn’t reach/.test(document.querySelector(r + ' [data-g="fb"]').textContent), root, { timeout: 20000 });
  const t = await pg.textContent(`${root} [data-g="fb"]`);
  if (!/Goal reached/.test(t)) throw new Error('grid level failed: ' + t);
};
const gridNext = async (pg, root) => { const n = await pg.$(`${root} [data-g="next"]`); if (n) await n.click(); };

module.exports = {
  'white/rules-vs-learning': {
    activity: async (pg) => {
      await pg.click('.rv-rule[data-r="mouth"]');
      await pg.click('#rv-next');
      // label faces correctly: happy only if smiling AND relaxed brows (read from aria-label)
      const faces = await pg.$$('#rv-train .rv-face');
      for (const f of faces) {
        const lab = await f.$eval('svg', (s) => s.getAttribute('aria-label'));
        const happy = lab.startsWith('smiling') && lab.includes('relaxed');
        await (await f.$(`button[data-v="${happy ? 1 : 0}"]`)).click();
      }
      await pg.click('#rv-go');
    },
    challenge: async (pg) => {
      const ans = ['r', 'l', 'r', 'l', 'l', 'r', 'l', 'r'];
      const items = await pg.$$('.rl-item');
      for (let i = 0; i < items.length; i++) await (await items[i].$(`button[data-v="${ans[i]}"]`)).click();
    },
  },
  'white/ai-all-around': {
    activity: async (pg) => {
      const n = await pg.$$eval('.day-item', (x) => x.length);
      for (let i = 0; i < n; i++) {
        await pg.click(`.day-item >> nth=${i}`);
        await pg.click('.day-pop button >> nth=0');
      }
    },
    challenge: async (pg) => {
      for (let i = 0; i < 5; i++) { await pg.click(`[data-a="${i}"]`); await pg.click(`[data-d="${i}"]`); }
      await pg.click('#mt-riddle .qz-choice[data-v="1"]');
    },
  },
  'white/is-it-ai': {
    activity: async (pg) => {
      for (let i = 0; i < 12; i++) { await pg.click('#sm-yes'); await pg.waitForTimeout(450); }
    },
    challenge: async (pg) => {
      const ans = ['d', 'n', 'd', 'n', 'a'];
      for (let i = 0; i < 5; i++) await pg.click(`.gz-item[data-i="${i}"] button[data-v="${ans[i]}"]`);
    },
  },
  'white/al-khwarizmi': {
    activity: async (pg) => {
      const r = '#activity';
      await grid(pg, r, ['F', 'F', 'F']); await gridNext(pg, r);
      await grid(pg, r, ['F', 'F', 'F', 'R', 'F', 'F', 'F']); await gridNext(pg, r);
      await grid(pg, r, ['5', 'F', 'R', '3', 'F']);
    },
    challenge: async (pg) => {
      const r = '#challenge';
      await grid(pg, r, ['5', 'F', 'R', '4', 'F', 'R', '5', 'F']); await gridNext(pg, r);
      await grid(pg, r, ['5', 'F', 'L', '5', 'F', 'L', '5', 'F']);
    },
  },
  'white/turing-test': {
    activity: async (pg) => {
      const bots = ['B', 'A', 'A', 'both', 'A'];
      for (const b of bots) { await pg.click(`.tt-pick [data-v="${b}"]`); await pg.click('#tt-next'); }
    },
    challenge: async (pg) => {
      for (let k = 0; k < 4; k++) {
        await pg.evaluate(() => { const bs = [...document.querySelectorAll('#challenge .qz-choice')]; bs.find((b) => b.getAttribute('data-k') === '0').click(); });
        await pg.click('#challenge .qz-next');
      }
    },
  },
  'white/ai-myths': {
    activity: async (pg) => {
      for (let i = 0; i < 10; i++) { await pg.click('.mb-btns [data-v="1"]'); await pg.click('#mb-next'); }
    },
    challenge: async (pg) => {
      const ans = ['h', 'a', 'h', 'a', 'h', 'a'];
      for (let i = 0; i < 6; i++) await pg.click(`.hd-item[data-i="${i}"] button[data-v="${ans[i]}"]`);
    },
  },
  'test:white': async (pg) => {
    const ans = ['r', 'n', 'p', 'c', 'n', 'r'];
    for (let i = 0; i < 6; i++) await pg.click(`.gi-item[data-i="${i}"] button[data-v="${ans[i]}"]`);
    await grid(pg, '#bt-maze-game', ['3', 'F', 'L', '3', 'F', 'R', '3', 'F', 'L', '3', 'F']);
  },
};
