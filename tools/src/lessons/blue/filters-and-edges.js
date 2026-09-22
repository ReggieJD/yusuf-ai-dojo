module.exports = {
  hook: 'A filter is a tiny grid of numbers that slides across an image. Draw something, then watch the edge detector find its outline, live.',
  story: [
    ['sensei', 'How does a self-driving car spot the edge of a road, {{nick}}? Or a phone find the outline of your face?'],
    ['sensei', 'One of the first tricks is a <b>filter</b>: a small grid of numbers, usually 3 × 3, that slides over every pixel and does a little math with its neighbors.'],
    ['you', 'What kind of math?'],
    ['sensei', 'Multiply and add, just like a neuron! One filter finds <b>edges</b>, the places where brightness suddenly changes. Another <b>blurs</b>. Draw something and try them. In image-recognition networks, filters like these are exactly what the early layers learn.'],
  ],
  activity: {
    title: 'The Filter Lab',
    instructions: 'Draw on the left grid (tap or drag), then pick a filter. The right grid shows the result. Try the Edge filter AND the Blur filter, then answer the question.',
    css: `
.fl{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.fl-g{display:grid;grid-template-columns:repeat(20,1fr);border:3px solid #0a1a33;background:#0a1a33;gap:1px;touch-action:none;user-select:none}
.fl-g i{aspect-ratio:1;background:#fff;display:block}
.fl-g.in i.on{background:#0a1a33}
.fl-cap{font:800 .8rem var(--font-head);text-align:center;margin:4px 0}
.fl-f{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}
.fl-f button{min-height:46px;padding:6px 12px;border:3px solid #0a1a33;background:#fff;font:800 .9rem var(--font-head);cursor:pointer;color:#0a1a33}
.fl-f button[aria-pressed="true"]{background:#1f6feb;color:#fff}
.fl-k{display:inline-grid;grid-template-columns:repeat(3,38px);gap:2px;font:800 .9rem ui-monospace,monospace;text-align:center;margin:4px 0}
.fl-k span{background:#0a1a33;color:#7fb2ff;padding:6px 0}
.fl-q{background:var(--bg2);padding:10px 12px;margin-top:10px}
.fl-q .row button{flex:1 1 150px}
`,
    js: function (el, api) {
      var D = api.D, N = 20;
      var K = {
        none: { name: 'No filter', k: [[0, 0, 0], [0, 1, 0], [0, 0, 0]], div: 1 },
        edge: { name: '🔲 Edge', k: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], div: 1, abs: true },
        blur: { name: '🌫️ Blur', k: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], div: 9 },
        sharp: { name: '✨ Sharpen', k: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]], div: 1 },
      };
      var S = api.load(), img = S.img || [], f = S.f || 'none', used = S.used || {}, q = S.q || 0;
      if (img.length !== N * N) { img = []; for (var i = 0; i < N * N; i++) img.push(0); }
      el.innerHTML = '<div class="fl"><div><p class="fl-cap">✏️ YOUR DRAWING</p><div class="fl-g in" id="fl-in" role="img" aria-label="Drawing grid"></div></div><div><p class="fl-cap" id="fl-cap2"></p><div class="fl-g" id="fl-out" role="img" aria-label="Filtered result"></div></div></div>' +
        '<div class="row" style="margin-top:8px"><button type="button" class="btn small" id="fl-sample">🟦 Draw a sample shape</button><button type="button" class="btn small" id="fl-clear">🧽 Clear</button></div>' +
        '<div class="fl-f" role="group" aria-label="Filters">' + Object.keys(K).map(function (k) { return '<button type="button" data-f="' + k + '">' + K[k].name + '</button>'; }).join('') + '</div><div id="fl-k"></div><div class="fl-q" id="fl-q" aria-live="polite"></div>';
      var inG = D.$('#fl-in', el), outG = D.$('#fl-out', el);
      inG.innerHTML = img.map(function (v, i) { return '<i data-i="' + i + '" class="' + (v ? 'on' : '') + '"></i>'; }).join('');
      outG.innerHTML = img.map(function () { return '<i></i>'; }).join('');
      function apply() {
        var F = K[f], out = [], mx = 0;
        for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
          var s = 0;
          for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) { var yy = y + dy, xx = x + dx; var v = yy < 0 || xx < 0 || yy >= N || xx >= N ? 0 : img[yy * N + xx]; s += v * F.k[dy + 1][dx + 1]; }
          s = s / F.div; if (F.abs) s = Math.abs(s); out.push(s); mx = Math.max(mx, Math.abs(s));
        }
        var cells = outG.children;
        out.forEach(function (v, i) { var t = Math.max(0, Math.min(1, F.abs ? v / 8 * 1.6 : v)); var g = Math.round(255 - t * 255); cells[i].style.background = 'rgb(' + g + ',' + g + ',' + Math.min(255, g + 20) + ')'; });
        D.$('#fl-cap2', el).textContent = '🖥️ AFTER: ' + F.name.replace(/^\S+ /, '').toUpperCase();
        D.$('#fl-k', el).innerHTML = '<p style="margin:0;font-weight:700">The 3 × 3 filter' + (F.div > 1 ? ' (÷ ' + F.div + ')' : '') + ':</p><div class="fl-k" aria-label="Filter numbers">' + F.k.map(function (r) { return r.map(function (v) { return '<span>' + v + '</span>'; }).join(''); }).join('') + '</div>';
        D.$all('[data-f]', el).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-f') === f ? 'true' : 'false'); });
      }
      function ink() { return img.reduce(function (a, b) { return a + b; }, 0); }
      function mission() {
        var box = D.$('#fl-q', el);
        if (!(used.edge && used.blur)) { box.innerHTML = '<p><b>Mission:</b> Draw at least 15 pixels, then try ' + (used.edge ? '✅' : '⬜') + ' Edge and ' + (used.blur ? '✅' : '⬜') + ' Blur.</p>'; return; }
        if (q) { box.innerHTML = '<p class="feedback ok">🏆 Filter scientist! The edge filter lights up only where dark meets light. Its numbers add up to 0, so flat areas cancel out. Real vision AIs learn thousands of filters like this on their own.</p>'; api.done(); return; }
        box.innerHTML = '<p><b>Question:</b> Where did the Edge filter light up?</p><div class="row">' + D.shuffle([[1, 'Only where dark pixels meet light pixels'], [0, 'Everywhere equally'], [0, 'Only in the middle of big dark areas']]).map(function (o) { return '<button type="button" class="btn small" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p>';
        D.$all('[data-ok]', box).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-ok') === '1') { q = 1; api.save({ q: 1 }); D.sfx('win'); mission(); } else { D.sfx('bad'); b.disabled = true; box.querySelector('.feedback').className = 'feedback no'; box.querySelector('.feedback').textContent = 'Switch back to Edge and look at the middle of your shape.'; } }); });
      }
      var painting = null;
      function paintAt(e) {
        var t = document.elementFromPoint(e.clientX, e.clientY);
        if (!t || !t.hasAttribute('data-i') || t.parentNode !== inG) return;
        var i = +t.getAttribute('data-i'); if (painting == null) painting = img[i] ? 0 : 1;
        if (img[i] !== painting) { img[i] = painting; t.className = painting ? 'on' : ''; apply(); }
      }
      inG.addEventListener('pointerdown', function (e) { e.preventDefault(); painting = null; paintAt(e); inG.setPointerCapture(e.pointerId); });
      inG.addEventListener('pointermove', function (e) { if (painting != null && e.buttons) paintAt(e); });
      inG.addEventListener('pointerup', function () { painting = null; api.save({ img: img }); mission(); });
      D.$('#fl-sample', el).addEventListener('click', function () {
        img = img.map(function (_, i) { var x = i % N, y = Math.floor(i / N); return (x >= 5 && x <= 14 && y >= 5 && y <= 14) || (Math.hypot(x - 15, y - 4) < 3) ? 1 : 0; });
        Array.prototype.forEach.call(inG.children, function (c, i) { c.className = img[i] ? 'on' : ''; });
        api.save({ img: img }); apply(); mission();
      });
      D.$('#fl-clear', el).addEventListener('click', function () { img = img.map(function () { return 0; }); Array.prototype.forEach.call(inG.children, function (c) { c.className = ''; }); api.save({ img: img }); apply(); });
      D.$all('[data-f]', el).forEach(function (b) {
        b.addEventListener('click', function () {
          f = b.getAttribute('data-f');
          if (ink() >= 15 && (f === 'edge' || f === 'blur')) used[f] = 1;
          api.save({ f: f, used: used }); D.sfx('click'); apply(); mission();
        });
      });
      apply(); mission();
    },
  },
  quiz: [
    { q: 'What is an image filter?', a: ['A small grid of numbers that slides over an image, doing multiply-and-add math', 'A pair of sunglasses', 'A way to delete photos', 'A type of camera'], c: 0, why: 'Filters combine each pixel with its neighbors using their numbers.' },
    { q: 'An edge filter lights up where…', a: ['Brightness changes suddenly, like the border of a shape', 'The image is all one color', 'There is no image', 'The pixels are blue'], c: 0, why: 'Edges are sudden changes.' },
    { q: 'Why is finding edges useful for AI vision?', a: ['Edges outline objects, a first step to recognizing them', 'Edges make images colorful', 'It isn’t useful', 'Edges are the only thing AI can see'], c: 0, why: 'Outlines help find shapes, which help find objects.' },
    { q: 'In a real image-recognition network, where do filters come from?', a: ['The network learns its own filter numbers during training', 'People draw them by hand for every photo', 'They come from the camera', 'They’re random forever'], c: 0, why: 'Training adjusts filter numbers just like weights, because they ARE weights!' },
  ],
  challenge: {
    title: 'Filter by Hand',
    intro: 'Be the filter! Multiply each pixel by the matching filter number, then add them all up. Get 2 of 3.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'Edge filter (8 in the middle, −1 all around). All 9 pixels are 1 (a flat dark area). Result?', a: ['0', '8', '9', '−8'], c: 0, why: '8×1 + 8×(−1) = 0. Flat areas cancel out: no edge!' },
        { q: 'Same edge filter. The middle pixel is 1, and all 8 neighbors are 0. Result?', a: ['8', '0', '−8', '1'], c: 0, why: '8×1 + (−1)×0 × 8 = 8. A lonely dot is all edge!' },
        { q: 'Blur filter (all 1s, then ÷ 9). Three of the nine pixels are 1, the rest 0. Result?', a: ['1/3 (about 0.33)', '3', '9', '0'], c: 0, why: '3 ÷ 9 = 1/3. Blur averages the neighborhood.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 2) api.done(); } });
    },
  },
};
