// Per-world art direction. Each world gets its own palette, type, texture, hero art and motion.
// hero(lesson, i) returns the SVG/HTML for the lesson banner art.

const svgURI = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;

const worlds = {};

// ===================== WHITE — ink brush on rice paper =====================
worlds.white = {
  css: `
:root{--bg:#f7f2e6;--bg2:#ece3cf;--ink:#1b1b1b;--muted:#5a5247;--card:#fffdf6;--line:#1b1b1b26;
--accent:#b8241b;--accent-ink:#fff;--accent2:#1f3a60;--radius:6px;--band:#b8241b;--sensei:#fbf7ec;
--font-head:"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif;--head-weight:700;
--shadow:0 1px 0 #1b1b1b30, 0 10px 24px #3b2a1014}
body{background-color:var(--bg);background-image:
 radial-gradient(circle at 20% 10%,#ffffff80 0,transparent 40%),
 radial-gradient(circle at 85% 70%,#e9dcc0 0,transparent 45%),
 ${svgURI('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2"/><feColorMatrix values="0 0 0 0 .45 0 0 0 0 .38 0 0 0 0 .25 0 0 0 .07 0"/></filter><rect width="160" height="160" filter="url(#n)"/></svg>')}}
.card{border:none;border-left:6px solid var(--ink);border-radius:4px 14px 14px 4px}
.sec-title .ico{border-radius:50%;background:var(--accent);box-shadow:inset 0 0 0 3px #fff6}
.sec-title h2{position:relative;padding-bottom:6px}
.sec-title h2::after{content:"";position:absolute;left:0;bottom:-4px;width:120px;height:10px;background:${svgURI('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 10"><path d="M2 6 C30 1 60 9 118 3" stroke="#1b1b1b" stroke-width="4" fill="none" stroke-linecap="round" opacity=".75"/></svg>')} no-repeat;background-size:contain}
.hero-enso{width:150px;height:150px;position:relative;display:grid;place-items:center;margin:0 0 6px -8px}
.hero-enso svg{position:absolute;inset:0}
.hero-enso path{stroke-dasharray:420;stroke-dashoffset:420;animation:brush 1.6s .2s ease-out forwards}
.hero-enso .em{font-size:3.6rem;animation:inkIn .8s 1.2s both}
@keyframes brush{to{stroke-dashoffset:0}}
@keyframes inkIn{from{opacity:0;transform:scale(.7)}}
.hero .kicker{border-radius:3px;font-family:var(--font-head);letter-spacing:.12em}
.hanko{position:absolute;right:6px;top:28px;width:74px;height:74px;border:3px solid var(--accent);color:var(--accent);border-radius:10px;display:grid;place-items:center;font:700 .72rem/1.1 var(--font-head);text-align:center;transform:rotate(8deg);opacity:.85;padding:4px;text-transform:uppercase;letter-spacing:.06em}
@media (max-width:520px){.hanko{width:58px;height:58px;font-size:.6rem;top:20px}}
details.challenge{background:repeating-linear-gradient(90deg,var(--card) 0 22px,#f1e8d3 22px 23px);border-radius:6px}
.btn{border-radius:6px}
`,
  hero: (l, i) => {
    const strokes = ['#1b1b1b', '#b8241b', '#1f3a60', '#1b1b1b', '#2f5d3a', '#b8241b'];
    return `<div class="hero-enso" aria-hidden="true"><svg viewBox="0 0 150 150"><path d="M112 30 C 80 6, 24 22, 20 72 C 16 122, 76 146, 116 118 C 146 96, 140 52, 118 38" fill="none" stroke="${strokes[i % strokes.length]}" stroke-width="11" stroke-linecap="round" opacity=".88"/></svg><span class="em">${l.emoji}</span></div>`;
  },
  stamp: 'White<br>Belt',
};

module.exports = { worlds, svgURI };
