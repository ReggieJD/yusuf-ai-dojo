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


// ===================== YELLOW — arena scoreboard at night =====================
worlds.yellow = {
  css: `
:root{--bg:#0f1b2d;--bg2:#fff1c1;--ink:#16181d;--muted:#4a4f5c;--card:#fffbea;--line:#16181d26;
--accent:#ffd23f;--accent-ink:#16181d;--accent2:#1d4ed8;--radius:10px;--band:#ffd23f;--sensei:#fff7d6;
--font-head:Impact,Haettenschweiler,"Arial Narrow Bold","Franklin Gothic Bold",sans-serif;--head-weight:400;--head-track:.02em;--head-case:uppercase;
--shadow:0 0 0 3px #16181d, 0 10px 0 #0006}
body{background-color:#0f1b2d;background-image:radial-gradient(#ffd23f22 1.5px,transparent 1.6px),linear-gradient(180deg,#132743,#0f1b2d 60%);background-size:18px 18px,100% 100%}
.hero,.hero h1,.world-map .hero h1,.belt-test .hero h1{color:#fffbea}
.hero .hook,.wm-progress p{color:#c9d3e6}
footer.site{color:#9fb0cc}
.card{border:none}
.sec-title .ico{border-radius:6px;background:#16181d;color:#ffd23f;box-shadow:inset 0 0 0 2px #ffd23f}
.hero .kicker{border-radius:4px;font-family:var(--font-head);letter-spacing:.12em;font-weight:400}
.hanko{position:absolute;right:6px;top:26px;padding:6px 10px;border:3px solid #ffd23f;color:#ffd23f;border-radius:6px;font:400 .8rem/1.1 var(--font-head);text-transform:uppercase;letter-spacing:.1em;transform:rotate(-4deg);text-align:center;background:#0f1b2d}
.board{display:inline-flex;align-items:center;gap:12px;background:#16181d;border:4px solid #3a4258;border-radius:14px;padding:10px 16px;margin-bottom:10px;box-shadow:0 0 0 4px #0f1b2d,0 0 24px #ffd23f33}
.board .num{font:400 2.6rem/1 var(--font-head);color:#ffd23f;text-shadow:0 0 8px #ffd23f88;letter-spacing:.08em;background:repeating-linear-gradient(0deg,#0000 0 3px,#0003 3px 4px);-webkit-background-clip:text;padding:0 4px}
.board .em{font-size:2.6rem;animation:dribble 1.8s ease-in-out infinite}
@keyframes dribble{50%{transform:translateY(-6px)}}
.board .lbl{font:700 .7rem/1.2 var(--font-body);color:#9fb0cc;text-transform:uppercase;letter-spacing:.14em}
details.challenge{background:repeating-linear-gradient(90deg,#fffbea 0 30px,#fff1c1 30px 60px)}
.world-map .wm-path::before{border-left-color:#ffd23f66}
.btn{border-radius:8px}
`,
  hero: (l, i) => `<div class="board" aria-hidden="true"><span class="em">${l.emoji}</span><span><span class="lbl">Home</span><br><span class="num">${String(i + 1).padStart(2, '0')}</span></span></div>`,
  stamp: 'Yellow<br>Belt',
};

// ===================== ORANGE — sunset inventor's workshop (blueprints + gears) =====================
worlds.orange = {
  css: `
:root{--bg:#fff3e6;--bg2:#ffe2c4;--ink:#2b1a0e;--muted:#6b4a33;--card:#fffaf4;--line:#2b1a0e24;
--accent:#e8590c;--accent-ink:#fff;--accent2:#1c5d99;--radius:14px;--band:#e8590c;--sensei:#fff4e8;
--font-head:"Trebuchet MS","Gill Sans","Segoe UI",sans-serif;--head-weight:800;
--shadow:0 5px 0 #b3470a55, 0 14px 28px #6b2d0a22}
body{background-color:#fff3e6;background-image:linear-gradient(#1c5d9912 1px,transparent 1px),linear-gradient(90deg,#1c5d9912 1px,transparent 1px),linear-gradient(180deg,#ffd8a8 0,#fff3e6 420px);background-size:26px 26px,26px 26px,100% 100%}
.card{border:2px solid #2b1a0e22;background-image:radial-gradient(circle at 12px 12px,#c2a38a 3px,transparent 3.5px),radial-gradient(circle at calc(100% - 12px) 12px,#c2a38a 3px,transparent 3.5px);background-repeat:no-repeat}
.sec-title .ico{border-radius:50%;background:#1c5d99}
.hero .kicker{background:#1c5d99}
.gears{position:relative;width:150px;height:120px;margin-bottom:6px}
.gears svg{position:absolute}
.gears .g1{left:0;top:6px;width:96px;animation:spin 9s linear infinite}
.gears .g2{left:78px;top:0;width:64px;animation:spin 6s linear infinite reverse}
.gears .em{position:absolute;left:30px;top:36px;font-size:2.2rem}
@keyframes spin{to{transform:rotate(360deg)}}
.hanko{position:absolute;right:6px;top:26px;width:78px;height:78px;border-radius:50%;border:3px dashed #1c5d99;color:#1c5d99;display:grid;place-items:center;text-align:center;font:800 .72rem/1.1 var(--font-head);text-transform:uppercase;transform:rotate(-10deg)}
details.challenge{background:repeating-linear-gradient(45deg,#fffaf4 0 14px,#ffe2c4 14px 16px)}
`,
  hero: (l, i) => {
    const gear = (c) => `<svg viewBox="0 0 100 100"><path fill="${c}" stroke="#2b1a0e" stroke-width="3" d="M50 8l7 0 3 12 9 4 11-6 5 5-6 11 4 9 12 3 0 7-12 3-4 9 6 11-5 5-11-6-9 4-3 12-7 0-3-12-9-4-11 6-5-5 6-11-4-9-12-3 0-7 12-3 4-9-6-11 5-5 11 6 9-4z"/><circle cx="50" cy="50" r="16" fill="#fffaf4" stroke="#2b1a0e" stroke-width="3"/></svg>`;
    const cols = ['#ff8c42', '#ffb570', '#f76707', '#ffa94d', '#ff922b', '#fd7e14'];
    return `<div class="gears" aria-hidden="true"><span class="g1">${gear(cols[i % 6])}</span><span class="g2">${gear('#1c5d99')}</span><span class="em">${l.emoji}</span></div>`;
  },
  stamp: 'Orange<br>Belt',
};

// ===================== GREEN — glowing bio-lab =====================
worlds.green = {
  css: `
:root{--bg:#062a24;--bg2:#dff7ec;--ink:#0d2b1d;--muted:#3d5c4f;--card:#f4fff9;--line:#0d2b1d22;
--accent:#16a36b;--accent-ink:#fff;--accent2:#0b6e8a;--radius:24px;--band:#2ec27e;--sensei:#e6fff3;
--font-head:ui-rounded,"SF Pro Rounded","Nunito","Varela Round","Segoe UI",system-ui,sans-serif;--head-weight:800;
--shadow:0 0 0 1px #2ec27e44, 0 12px 40px #00000055}
body{background-color:#062a24;background-image:radial-gradient(circle at 15% 10%,#2ec27e33,transparent 40%),radial-gradient(circle at 85% 30%,#0b6e8a44,transparent 45%),radial-gradient(#2ec27e26 1px,transparent 1.5px);background-size:100% 100%,100% 100%,22px 22px}
.hero,.hero h1{color:#eafff4}.hero .hook,.wm-progress p{color:#a8d8c2} footer.site{color:#8fbfa9}
.card{border:1px solid #2ec27e55}
.sec-title .ico{border-radius:50%;background:radial-gradient(circle at 35% 30%,#7df0b8,#16a36b);box-shadow:0 0 14px #2ec27e88}
.hero .kicker{background:#2ec27e;color:#062a24}
.neuron{width:150px;height:130px;margin-bottom:6px;position:relative}
.neuron svg{position:absolute;inset:0}
.neuron .core{animation:glow 2.8s ease-in-out infinite}
.neuron .sig{stroke-dasharray:6 10;animation:flow 1.6s linear infinite}
.neuron .em{position:absolute;left:52px;top:42px;font-size:2.3rem}
@keyframes glow{50%{opacity:.75}} @keyframes flow{to{stroke-dashoffset:-32}}
.hanko{position:absolute;right:6px;top:26px;width:74px;height:74px;border-radius:50%;border:2px solid #7df0b8;color:#7df0b8;display:grid;place-items:center;text-align:center;font:800 .72rem/1.1 var(--font-head);text-transform:uppercase;box-shadow:0 0 16px #2ec27e55}
details.challenge{background:linear-gradient(135deg,#f4fff9,#dff7ec);border-radius:24px}
`,
  hero: (l, i) => `<div class="neuron" aria-hidden="true"><svg viewBox="0 0 150 130">
<line class="sig" x1="8" y1="20" x2="75" y2="65" stroke="#7df0b8" stroke-width="3"/><line class="sig" x1="4" y1="65" x2="75" y2="65" stroke="#7df0b8" stroke-width="3"/><line class="sig" x1="10" y1="112" x2="75" y2="65" stroke="#7df0b8" stroke-width="3"/><line class="sig" x1="75" y1="65" x2="146" y2="65" stroke="#ffd23f" stroke-width="4"/>
<circle cx="8" cy="20" r="6" fill="#0b6e8a"/><circle cx="4" cy="65" r="6" fill="#0b6e8a"/><circle cx="10" cy="112" r="6" fill="#0b6e8a"/>
<circle class="core" cx="75" cy="65" r="${34 + (i % 3) * 2}" fill="#16a36b" stroke="#7df0b8" stroke-width="4"/></svg><span class="em">${l.emoji}</span></div>`,
  stamp: 'Green<br>Belt',
};

// ===================== BLUE — camera HUD & pixels =====================
worlds.blue = {
  css: `
:root{--bg:#e8f1ff;--bg2:#d6e6ff;--ink:#0a1a33;--muted:#3b4f70;--card:#ffffff;--line:#0a1a3326;
--accent:#1f6feb;--accent-ink:#fff;--accent2:#0a4bb5;--radius:4px;--band:#3a86ff;--sensei:#eef5ff;
--font-head:"SFMono-Regular",Menlo,Consolas,"Liberation Mono","Courier New",monospace;--head-weight:800;--head-track:-.01em;
--shadow:6px 6px 0 #0a1a33}
body{background-color:#e8f1ff;background-image:linear-gradient(#1f6feb14 2px,transparent 2px),linear-gradient(90deg,#1f6feb14 2px,transparent 2px);background-size:16px 16px}
.card{border:3px solid #0a1a33;border-radius:4px}
.sec-title .ico{border-radius:0;background:#0a1a33;color:#7fb2ff}
.hero .kicker{border-radius:0;background:#0a1a33;color:#7fb2ff;font-family:var(--font-head)}
.btn{border-radius:2px;box-shadow:4px 4px 0 var(--ink)}
.viewfinder{position:relative;width:140px;height:120px;display:grid;place-items:center;margin-bottom:12px;background:repeating-linear-gradient(0deg,#0000 0 3px,#1f6feb10 3px 4px)}
.viewfinder i{position:absolute;width:26px;height:26px;border:4px solid #1f6feb}
.viewfinder i:nth-child(1){left:0;top:0;border-right:0;border-bottom:0}.viewfinder i:nth-child(2){right:0;top:0;border-left:0;border-bottom:0}
.viewfinder i:nth-child(3){left:0;bottom:0;border-right:0;border-top:0}.viewfinder i:nth-child(4){right:0;bottom:0;border-left:0;border-top:0}
.viewfinder .em{font-size:3rem;image-rendering:pixelated;animation:focus 1.4s ease-out both}
.viewfinder .rec{position:absolute;left:34px;bottom:4px;font:700 .7rem var(--font-head);color:#b3261e}
@keyframes focus{from{filter:blur(6px);transform:scale(1.2)}}
.hanko{position:absolute;right:6px;top:26px;padding:6px 8px;border:3px solid #0a1a33;background:#fff;color:#0a1a33;font:800 .7rem/1.2 var(--font-head);text-transform:uppercase;text-align:center;box-shadow:4px 4px 0 #1f6feb}
details.challenge{border-radius:4px;background:repeating-linear-gradient(0deg,#fff 0 8px,#eef5ff 8px 16px)}
`,
  hero: (l, i) => `<div class="viewfinder" aria-hidden="true"><i></i><i></i><i></i><i></i><span class="em">${l.emoji}</span><span class="rec">● REC ${String(i + 1).padStart(3, '0')}</span></div>`,
  stamp: 'Blue<br>Belt',
};

// ===================== PURPLE — neon strategy arcade =====================
worlds.purple = {
  css: `
:root{--bg:#1a0b2e;--bg2:#efe4ff;--ink:#1d0f33;--muted:#4e3d6b;--card:#fbf7ff;--line:#1d0f3326;
--accent:#7b2ff7;--accent-ink:#fff;--accent2:#6a1fd1;--radius:16px;--band:#b983ff;--sensei:#f3eaff;
--font-head:"Arial Black","Segoe UI Black","Helvetica Neue",Arial,sans-serif;--head-weight:900;
--shadow:0 0 0 2px #b983ff66, 0 14px 40px #00000066}
body{background-color:#1a0b2e;background-image:linear-gradient(180deg,#1a0b2e 0,#2d0f4f 380px,#1a0b2e 900px),linear-gradient(#b983ff1f 1px,transparent 1px),linear-gradient(90deg,#b983ff1f 1px,transparent 1px);background-size:100% 100%,40px 40px,40px 40px;background-blend-mode:normal,screen,screen}
.hero,.hero h1{color:#fff}.hero h1{text-shadow:0 0 18px #b983ff99}.hero .hook,.wm-progress p{color:#d6c4f5} footer.site{color:#b9a6da}
.card{border:none}
.sec-title .ico{background:#1d0f33;color:#e0c3ff;box-shadow:0 0 0 2px #b983ff,0 0 12px #b983ff88}
.hero .kicker{background:transparent;color:#e0c3ff;border:2px solid #b983ff;box-shadow:0 0 12px #b983ff66}
.neon{width:130px;height:130px;border-radius:50%;display:grid;place-items:center;margin-bottom:8px;border:4px solid #e0c3ff;box-shadow:0 0 0 4px #7b2ff7,0 0 30px #b983ffaa,inset 0 0 30px #7b2ff788;background:#1d0f33;animation:hum 4s ease-in-out infinite}
.neon .em{font-size:3.2rem}
@keyframes hum{50%{box-shadow:0 0 0 4px #7b2ff7,0 0 44px #b983ffcc,inset 0 0 36px #7b2ff7aa}}
.hanko{position:absolute;right:6px;top:26px;padding:8px 10px;border:2px solid #ff7ad9;color:#ff7ad9;border-radius:10px;font:900 .72rem/1.1 var(--font-head);text-transform:uppercase;text-align:center;box-shadow:0 0 12px #ff7ad966;transform:rotate(6deg)}
details.challenge{background:repeating-linear-gradient(135deg,#fbf7ff 0 16px,#efe4ff 16px 32px)}
`,
  hero: (l) => `<div class="neon" aria-hidden="true"><span class="em">${l.emoji}</span></div>`,
  stamp: 'Purple<br>Belt',
};

// ===================== BROWN — the old library of talking machines =====================
worlds.brown = {
  css: `
:root{--bg:#efe2c6;--bg2:#e4d2ab;--ink:#2d1f12;--muted:#5e4a33;--card:#fbf5e6;--line:#2d1f1226;
--accent:#8b5a2b;--accent-ink:#fff;--accent2:#6b3f14;--radius:8px;--band:#8b5a2b;--sensei:#fbf1dc;
--font-head:Georgia,"Book Antiqua","Palatino Linotype",serif;--head-weight:700;
--shadow:0 2px 0 #2d1f1233, 0 14px 30px #5e4a3326}
body{background-color:#efe2c6;background-image:radial-gradient(circle at 30% 20%,#fff8e855,transparent 50%),repeating-linear-gradient(90deg,#8b5a2b0d 0 2px,transparent 2px 60px)}
.card{border:1px solid #8b5a2b55;background-image:repeating-linear-gradient(180deg,transparent 0 31px,#8b5a2b12 31px 32px)}
.sec-title .ico{border-radius:4px;background:#6b3f14}
.hero .kicker{border-radius:2px;font-family:var(--font-head);font-style:italic;letter-spacing:.06em}
.book{width:170px;height:118px;position:relative;margin-bottom:8px}
.book svg{position:absolute;inset:0}
.book .em{position:absolute;left:62px;top:24px;font-size:2.6rem;animation:float 3s ease-in-out infinite}
@keyframes float{50%{transform:translateY(-8px)}}
.hanko{position:absolute;right:6px;top:26px;width:76px;height:76px;border-radius:50%;background:#8b1e1e;color:#fbe9c9;display:grid;place-items:center;text-align:center;font:700 .7rem/1.1 var(--font-head);text-transform:uppercase;box-shadow:inset 0 0 0 3px #5c1010,0 3px 0 #0003}
details.challenge{background:linear-gradient(#fbf5e6,#f3e5c4)}
`,
  hero: (l) => `<div class="book" aria-hidden="true"><svg viewBox="0 0 170 118"><path d="M85 30 C60 18 30 16 8 22 L8 108 C30 102 60 104 85 116 Z" fill="#fbf5e6" stroke="#2d1f12" stroke-width="3"/><path d="M85 30 C110 18 140 16 162 22 L162 108 C140 102 110 104 85 116 Z" fill="#fbf5e6" stroke="#2d1f12" stroke-width="3"/><path d="M20 44 h50 M20 58 h44 M20 72 h50 M100 44 h50 M106 58 h44 M100 72 h50" stroke="#8b5a2b55" stroke-width="3"/></svg><span class="em">${l.emoji}</span></div>`,
  stamp: 'Brown<br>Belt',
};

// ===================== BLACK — gold-on-black master dojo =====================
worlds.black = {
  css: `
:root{--bg:#0d0d0d;--bg2:#2a2a2a;--ink:#f3f1ea;--muted:#c9c4b5;--card:#1b1b1b;--line:#f5c54233;
--accent:#f5c542;--accent-ink:#141414;--accent2:#f5c542;--radius:12px;--band:#1b1b1b;--sensei:#f3f1ea;
--good:#3ccf7a;--good-bg:#153d27;--bad:#ff6b6b;--bad-bg:#4a1717;
--font-head:Copperplate,"Copperplate Gothic Light","Palatino Linotype",Palatino,Georgia,serif;--head-weight:700;--head-track:.04em;
--shadow:0 0 0 1px #f5c54255, 0 18px 40px #000a}
body{background-color:#0d0d0d;background-image:radial-gradient(circle at 50% -10%,#f5c54226,transparent 50%),repeating-linear-gradient(45deg,#ffffff05 0 2px,transparent 2px 12px)}
a{color:#f5c542}
.btn{box-shadow:0 4px 0 #f5c542;border-color:#f5c542}
.btn:active{box-shadow:0 1px 0 #f5c542}
.qz-feedback.ok p,.qz-choice.right{color:#d9ffe8}.qz-feedback.no p,.qz-choice.wrong{color:#ffe0e0}
.complete,.complete h2{color:#d9ffe8}
.sec-title .ico{background:#f5c542;color:#141414}
.hero h1{background:linear-gradient(90deg,#f5c542,#fff3c4,#f5c542);-webkit-background-clip:text;background-clip:text;color:transparent}
.goldseal{width:130px;height:130px;border-radius:50%;display:grid;place-items:center;margin-bottom:8px;background:radial-gradient(circle at 35% 30%,#fff3c4,#f5c542 40%,#9a7b1a 100%);border:4px solid #f5c542;box-shadow:0 0 0 6px #1b1b1b,0 0 0 8px #f5c54288,0 0 40px #f5c54244}
.goldseal .em{font-size:3.1rem;filter:drop-shadow(0 2px 0 #0006)}
.hanko{position:absolute;right:6px;top:26px;padding:8px 10px;border:2px solid #f5c542;color:#f5c542;border-radius:4px;font:700 .72rem/1.1 var(--font-head);text-transform:uppercase;letter-spacing:.1em;text-align:center}
details.challenge{background:repeating-linear-gradient(135deg,#1b1b1b 0 18px,#222 18px 20px);border-color:#f5c542}
details.challenge>summary .tag{background:#f5c542;color:#141414}
#dojo-bar{background:#0d0d0de6}
`,
  hero: (l) => `<div class="goldseal" aria-hidden="true"><span class="em">${l.emoji}</span></div>`,
  stamp: 'Black<br>Belt',
};

module.exports = { worlds, svgURI };
