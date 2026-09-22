module.exports = {
  hook: 'Image AIs see in layers: first edges, then shapes, then parts, then whole objects. Walk through the layers like a vision network does.',
  story: [
    ['sensei', 'You’ve seen pixels, colors and edge filters, {{nick}}. Now let’s put it all together.'],
    ['sensei', 'An image-recognition network works in <b>layers</b>. Early layers find simple <b>features</b> like edges. Middle layers combine edges into shapes: circles, corners, triangles. Later layers combine shapes into <b>parts</b> like ears or wheels, and the last layer names the object.'],
    ['you', 'Who tells it to look for ears and wheels?'],
    ['sensei', 'Nobody! During training, the network discovers useful features on its own from millions of labeled photos. Researchers found this out by studying what each layer responds to. Let’s be the network.'],
  ],
  activity: {
    title: 'Layer by Layer',
    instructions: 'For each picture, look at the edges (Layer 1), then choose the TWO features that best help recognize it (Layers 2–3). The final layer then names it.',
    css: `
.hs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;text-align:center;margin-bottom:10px}
.hs-l{font:800 .72rem var(--font-head)}
.hs-img{display:grid;grid-template-columns:repeat(12,1fr);border:3px solid #0a1a33;max-width:150px;margin:4px auto 0}
.hs-img i{aspect-ratio:1;display:block}
.hs-arrow{align-self:center;font-size:1.4rem}
.hs-feat{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.hs-feat button{min-height:56px;border:3px solid #0a1a33;background:#fff;font:700 .92rem var(--font-body);cursor:pointer;padding:6px;color:#0a1a33}
.hs-feat button[aria-pressed="true"]{background:#1f6feb;color:#fff}
.hs-out{background:#0a1a33;color:#7fb2ff;font:800 1rem var(--font-head);padding:10px 12px;margin-top:10px}
.hs-prog{display:flex;gap:6px;margin-bottom:8px}.hs-prog span{flex:1;height:8px;background:var(--line)}.hs-prog span.on{background:#1f6feb}
`,
    js: function (el, api) {
      var D = api.D;
      var PAL = { '.': [236, 243, 255], k: [26, 26, 46], o: [255, 140, 66], p: [255, 150, 180], w: [255, 255, 255], b: [120, 190, 255], r: [230, 57, 70], g: [150, 150, 160], y: [240, 200, 120] };
      var PICS = [
        { name: 'CAT', art: ['.k........k.', '.kk......kk.', '.kokkkkkkok.', '.koooooooook', 'kooooooooook', 'kookooookook', 'kooooooooook', 'koooooppoook', 'kwoookkooowk', '.kooooooook.', '..kkookookk.', '....kkkk....'],
          feats: [['🔺 Pointy triangle ears', 1], ['👀 Round eyes + whisker lines', 1], ['🛞 Round wheels at the bottom', 0], ['🪟 A row of windows', 0]] },
        { name: 'CAR', art: ['............', '............', '...kkkkkk...', '..kbbkbbbk..', '.kbbbkbbbbk.', 'krrrrrrrrrrk', 'krrrrrrrrrrk', 'kkkrrrrrrkkk', '.kkk....kkk.', '.kgk....kgk.', '.kkk....kkk.', '............'],
          feats: [['🛞 Two round wheels at the bottom', 1], ['🪟 Windows on top of a long body', 1], ['🔺 Pointy ears', 0], ['〰️ Whiskers', 0]] },
        { name: 'HOUSE', art: ['.....kk.....', '....kkkk....', '...kkkkkk...', '..kkkkkkkk..', '.kkkkkkkkkk.', '..yyyyyyyy..', '..ybbyybby..', '..ybbyybby..', '..yyyyyyyy..', '..yyykkyyy..', '..yyykkyyy..', '..yyykkyyy..'],
          feats: [['🔺 A big triangle roof', 1], ['⬛ Square windows and a door', 1], ['🛞 Wheels', 0], ['〰️ Whiskers', 0]] },
      ];
      var S = api.load(), r = S.r || 0, pick = {};
      function lum(c) { return (c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114) / 255; }
      function grid(cells) { return '<div class="hs-img" aria-hidden="true">' + cells.map(function (c) { return '<i style="background:rgb(' + c.join(',') + ')"></i>'; }).join('') + '</div>'; }
      function render() {
        if (r >= PICS.length) {
          el.innerHTML = '<div class="hs-out">🧠 All three recognized!</div><p class="feedback ok">🏆 You walked through the layers: pixels → edges → shapes → parts → object. In a real network, nobody hand-picks these features. The network learns them because they help it get answers right.</p>';
          api.done(); return;
        }
        var P = PICS[r], cols = [], L = [];
        P.art.forEach(function (row) { for (var x = 0; x < 12; x++) { var c = PAL[row[x]] || PAL['.']; cols.push(c); L.push(lum(c)); } });
        var edges = L.map(function (v, i) { var x = i % 12, y = Math.floor(i / 12), s = 8 * v; for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; var xx = x + dx, yy = y + dy; s -= (xx < 0 || yy < 0 || xx > 11 || yy > 11) ? lum(PAL['.']) : L[yy * 12 + xx]; } var e = Math.min(1, Math.abs(s) / 2.2), g = Math.round(255 - e * 230); return [g, g, 255]; });
        pick = {};
        el.innerHTML = '<div class="hs-prog" aria-hidden="true">' + PICS.map(function (_, i) { return '<span class="' + (i <= r ? 'on' : '') + '"></span>'; }).join('') + '</div>' +
          '<div class="hs"><div><span class="hs-l">INPUT · PIXELS</span>' + grid(cols) + '</div><div><span class="hs-l">LAYER 1 · EDGES</span>' + grid(edges) + '</div><div><span class="hs-l">LAYERS 2–3 · ?</span><div class="hs-img" style="display:grid;place-items:center;font-size:2rem;aspect-ratio:1;grid-template-columns:1fr">❓</div></div></div>' +
          '<p><b>Picture ' + (r + 1) + ' of 3:</b> Pick the TWO features a network would combine to recognize this.</p><div class="hs-feat">' + D.shuffle(P.feats.map(function (f, i) { return '<button type="button" data-i="' + i + '" aria-pressed="false">' + f[0] + '</button>'; })).join('') + '</div><p class="feedback" id="hs-fb" aria-live="polite"></p>';
        D.$all('.hs-feat button', el).forEach(function (b) {
          b.addEventListener('click', function () {
            var i = +b.getAttribute('data-i'); pick[i] = !pick[i]; b.setAttribute('aria-pressed', pick[i] ? 'true' : 'false'); D.sfx('click');
            var chosen = Object.keys(pick).filter(function (k) { return pick[k]; }).map(Number), fb = D.$('#hs-fb', el);
            if (chosen.length < 2) { fb.className = 'feedback'; fb.textContent = ''; return; }
            if (chosen.length > 2) { fb.className = 'feedback no'; fb.textContent = 'Only two! Tap one again to un-pick it.'; return; }
            if (chosen.every(function (k) { return P.feats[k][1]; })) {
              D.sfx('win'); fb.className = 'feedback ok'; fb.innerHTML = '✅ Features combined → <b>Final layer: “' + P.name + '” (very confident)</b>';
              D.$all('.hs-feat button', el).forEach(function (x) { x.disabled = true; });
              r++; api.save({ r: r }); setTimeout(render, 1700);
            } else { D.sfx('bad'); fb.className = 'feedback no'; fb.textContent = 'One of those features isn’t in this picture. Look at the edges again!'; }
          });
        });
      }
      render();
    },
  },
  quiz: [
    { q: 'What do the EARLY layers of an image network usually detect?', a: ['Simple features like edges', 'Whole objects', 'Names of objects', 'Sounds'], c: 0, why: 'Early layers find edges and simple textures.' },
    { q: 'What do LATER layers do?', a: ['Combine simpler features into parts and whole objects', 'Delete the image', 'Add color', 'Nothing'], c: 0, why: 'Edges → shapes → parts → objects.' },
    { q: 'Who decides which features the network looks for?', a: ['The network learns them during training', 'A person draws every feature by hand', 'The camera', 'The features are random forever'], c: 0, why: 'Training discovers useful features automatically.' },
    { q: 'What is a feature in AI vision?', a: ['A useful clue in the image, like an edge, corner or shape', 'A camera setting', 'A type of photo', 'An error'], c: 0, why: 'Features are clues the model uses to decide.' },
  ],
  challenge: {
    title: 'Fooling the Eye',
    intro: 'AI vision is powerful, but it has weak spots. Get 3 of 4.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'Researchers showed that a few carefully placed stickers on a stop sign could make some vision AIs misread it. What does that show?', a: ['AI can be fooled by small changes that wouldn’t fool a person', 'Stickers are illegal', 'AI can’t see signs at all', 'Humans are always fooled too'], c: 0, why: 'These are called adversarial examples, and they’re an active area of safety research.' },
        { q: 'A vision AI was trained mostly on daytime photos. What might happen at night?', a: ['It may make more mistakes, because night photos look different from its training data', 'It will be perfect', 'It will turn on a flashlight', 'Nothing changes'], c: 0, why: 'Models struggle with conditions they rarely saw in training.' },
        { q: 'An AI labels every photo containing snow as “wolf”, because most wolf photos in its training set had snow. This is…', a: ['A shortcut: it learned the background instead of the animal', 'Perfect learning', 'A hardware bug', 'Impossible'], c: 0, why: 'Models can latch onto accidental patterns. Careful testing catches this.' },
        { q: 'What’s the best way to make a vision AI more reliable?', a: ['Train and test it on lots of varied images: different lighting, angles and places', 'Only use one perfect photo', 'Make the screen brighter', 'Never test it'], c: 0, why: 'Variety in data = robustness in the real world.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
