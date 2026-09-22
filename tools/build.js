#!/usr/bin/env node
// Builds every page of Yusuf's AI Dojo as a self-contained HTML file (inline CSS + JS).
// Usage: node tools/build.js
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '..');
const SRC = path.join(__dirname, 'src');
const read = (p) => fs.readFileSync(path.join(SRC, p), 'utf8');

const { worlds, themes, arcade } = require('./src/curriculum');
const { worlds: art } = require('./src/themes');
const BASE_CSS = read('base.css');
const RUNTIME = read('runtime.js');
const LESSON_JS = read('lesson.js');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
const fnSrc = (f) => (f ? '(' + f.toString() + ')' : 'null');

// The curriculum data every page carries (small, and it lets each file work alone).
const CURRIC = {
  worlds: worlds.map((w) => ({
    id: w.id, name: w.name, world: w.world, color: w.color, ink: w.ink, emoji: w.emoji, blurb: w.blurb, built: !!w.built,
    lessons: w.lessons.map((l) => ({ id: l.id, title: l.title, emoji: l.emoji, min: l.min, term: l.term, def: l.def })),
  })),
  themes,
  arcade: arcade.filter((g) => g.built).map((g) => ({ id: g.id, title: g.title, emoji: g.emoji, need: g.need, blurb: g.blurb, concept: g.concept })),
};

const FOOTER = (root) => `<footer class="site"><div class="wrap">Built for Yusuf with 🥋 · Progress is saved only on this device · <a href="${root}parents.html">For parents</a></div></footer>`;

function page({ title, desc, root, css = '', worldCss = '', body, scripts = [], meta = {}, bodyClass = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc || "Yusuf's AI Dojo — learn how AI works, how to use it well, and how to build with it.")}">
<meta name="referrer" content="no-referrer">
<meta name="robots" content="noindex">
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🥋</text></svg>')}">
<style>
${BASE_CSS}
${worldCss}
${css}
</style>
</head>
<body class="${bodyClass}">
<a class="sr-only" href="#main">Skip to content</a>
<header id="dojo-bar"><a class="db-home" href="${root}index.html">🏯 Dojo</a></header>
<noscript><div class="wrap"><p>This dojo needs JavaScript turned on to run its games and quizzes.</p></div></noscript>
${body}
${FOOTER(root)}
<script>
window.CURRIC=${json(CURRIC)};
window.PAGE=${json(Object.assign({ root }, meta))};
${RUNTIME}
</script>
${scripts.map((s) => `<script>\n${s}\n</script>`).join('\n')}
</body>
</html>
`;
}

function write(rel, html) {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, html);
  written.push(rel);
}
const written = [];

// ---------------- lessons ----------------
function buildLesson(w, wi, l, li) {
  const mod = require(`./src/lessons/${w.id}/${l.id}.js`);
  const A = art[w.id];
  const root = '../../';
  const next = li + 1 < w.lessons.length
    ? { href: `${w.lessons[li + 1].id}.html`, label: `Next: ${w.lessons[li + 1].title} →` }
    : { href: 'belt-test.html', label: `${w.name} Test →` };
  const prev = li > 0 ? { href: `${w.lessons[li - 1].id}.html`, label: `← ${w.lessons[li - 1].title}` } : { href: 'index.html', label: `← ${w.world}` };
  const LESSON = { id: `${w.id}/${l.id}`, title: l.title, story: mod.story, quiz: mod.quiz };
  if (!mod.quiz || mod.quiz.length < 3 || mod.quiz.length > 5) throw new Error(`${w.id}/${l.id}: quiz must have 3-5 questions`);
  mod.quiz.forEach((q, k) => { if (!(q.c >= 0 && q.c < q.a.length) || !q.why) throw new Error(`${w.id}/${l.id}: bad quiz q${k + 1}`); });
  const body = `
<main id="main" class="wrap lesson l-${l.id}">
  <section class="hero">
    <div class="hanko" aria-hidden="true">${A.stamp}</div>
    ${A.hero(l, li)}
    <span class="kicker">${esc(w.name)} · Lesson ${li + 1} of ${w.lessons.length}</span>
    <h1>${esc(l.title)}</h1>
    <p class="hook fill">${mod.hook}</p>
    <ul class="steps" aria-label="Lesson checklist">
      <li data-step="act"><span class="ck" aria-hidden="true"></span>Activity</li>
      <li data-step="quiz"><span class="ck" aria-hidden="true"></span>Quiz</li>
      <li data-step="ch"><span class="ck" aria-hidden="true"></span>Challenge <small>(bonus)</small></li>
    </ul>
    <p class="nudge" id="nudge" hidden>👋 New here? <a href="${root}index.html">Pick your ninja name and favorite themes</a> so the lessons can be all about you.</p>
  </section>

  <section class="card story-card" aria-labelledby="h-story">
    <div class="sec-title"><span class="ico" aria-hidden="true">📜</span><h2 id="h-story">The Story</h2></div>
    <div id="story"></div>
  </section>

  <section class="card act-card" aria-labelledby="h-act">
    <div class="sec-title"><span class="ico" aria-hidden="true">🥋</span><h2 id="h-act">Do It: ${esc(mod.activity.title)}</h2></div>
    <p class="instructions fill">${mod.activity.instructions}</p>
    <div id="activity" class="activity">${mod.activity.html || ''}</div>
  </section>

  <section class="card" id="quiz-sec" aria-labelledby="h-quiz">
    <div class="sec-title"><span class="ico" aria-hidden="true">🧠</span><h2 id="h-quiz">Quick Quiz</h2></div>
    <p class="quiz-hint">Tip: do the activity first — the answers are hiding in there.</p>
    <div id="quiz"></div>
  </section>

  <details class="challenge" id="challenge-box">
    <summary><span class="flame" aria-hidden="true">🔥</span><span>Challenge Mode: ${esc(mod.challenge.title)}</span><span class="tag">+30 XP</span></summary>
    <div class="challenge-body"><div><p class="fill">${mod.challenge.intro}</p><div id="challenge"></div></div></div>
  </details>

  <section class="card" aria-labelledby="h-term">
    <div class="sec-title"><span class="ico" aria-hidden="true">🔑</span><h2 id="h-term">Key Term</h2></div>
    <div class="term"><span class="scroll" aria-hidden="true">📜</span><dl><dt>${esc(l.term)}</dt><dd>${esc(l.def)}</dd></dl></div>
    <p><a href="${root}scrolls.html">See all your Dojo Scrolls →</a></p>
  </section>

  <section class="card complete" id="complete" hidden>
    <h2>🎉 Lesson complete!</h2>
    <p>You earned this one. Keep the momentum going.</p>
    <a class="btn primary" href="${next.href}">${esc(next.label)}</a>
  </section>

  <nav class="lesson-nav" aria-label="Lesson navigation">
    <a class="btn" href="${prev.href}">${esc(prev.label)}</a>
    <a class="btn primary" href="${next.href}">${esc(next.label)}</a>
  </nav>
</main>`;
  const scripts = [
    `window.LESSON=${json(LESSON)};\nwindow.ACTIVITY=${fnSrc(mod.activity.js)};\nwindow.CHALLENGE=${fnSrc(mod.challenge.js)};`,
    `(function(){var D=window.Dojo,T=D.theme('lesson');D.$all('.fill').forEach(function(e){e.innerHTML=D.fill(e.innerHTML,T);});})();`,
    LESSON_JS,
  ];
  write(`worlds/${w.id}/${l.id}.html`, page({
    title: `${l.title} · ${w.name} · Yusuf's AI Dojo`,
    desc: l.def, root, worldCss: A.css, css: (mod.activity.css || '') + '\n' + (mod.challenge.css || ''),
    body, scripts, meta: { type: 'lesson', id: `${w.id}/${l.id}`, world: w.id }, bodyClass: `world-${w.id}`,
  }));
}

// ---------------- generic pages (hub, world maps, tests, extras) ----------------
function buildPage(rel, mod, ctx) {
  const p = mod(ctx);
  write(rel, page(Object.assign({ root: ctx.root }, p)));
}

const ctx0 = { worlds, themes, arcade, art, esc, json, fnSrc };
for (const w of worlds) {
  if (!w.built) continue;
  const wi = worlds.indexOf(w);
  w.lessons.forEach((l, li) => buildLesson(w, wi, l, li));
  buildPage(`worlds/${w.id}/index.html`, require('./src/pages/world.js'), Object.assign({}, ctx0, { root: '../../', w, wi }));
  buildPage(`worlds/${w.id}/belt-test.html`, require('./src/pages/belt-test.js'), Object.assign({}, ctx0, { root: '../../', w, wi, test: require(`./src/tests/${w.id}.js`) }));
}
for (const name of ['index', 'parents', 'scrolls', 'badges', 'daily', 'certificate']) {
  buildPage(`${name}.html`, require(`./src/pages/${name}.js`), Object.assign({}, ctx0, { root: './' }));
}
if (arcade.some((g) => g.built)) {
  buildPage('arcade/index.html', require('./src/pages/arcade.js'), Object.assign({}, ctx0, { root: '../' }));
  for (const g of arcade.filter((x) => x.built)) {
    buildPage(`arcade/${g.id}.html`, require(`./src/arcade/${g.id}.js`), Object.assign({}, ctx0, { root: '../', game: g }));
  }
}

console.log(`Built ${written.length} pages.`);
