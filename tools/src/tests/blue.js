module.exports = {
  quiz: [
    { q: 'A digital image is…', a: ['A grid of pixels, each stored as numbers', 'A tiny painting inside the screen', 'A sound', 'A single number'], c: 0, why: 'Pixels → numbers.' },
    { q: 'rgb(0, 255, 0) is…', a: ['Bright green', 'Red', 'Black', 'White'], c: 0, why: 'Only the green light is on.' },
    { q: 'Red light + green light makes…', a: ['Yellow', 'Purple', 'Brown', 'Black'], c: 0, why: 'Light mixes differently from paint.' },
    { q: 'An image 20 × 10 pixels with RGB colors stores how many numbers?', a: ['600', '200', '30', '60'], c: 0, why: '20 × 10 = 200 pixels × 3 = 600.' },
    { q: 'An edge filter lights up…', a: ['Where brightness changes suddenly', 'Everywhere', 'Only in flat areas', 'Only on blue pixels'], c: 0, why: 'Edges = sudden changes.' },
    { q: 'A blur filter works by…', a: ['Averaging each pixel with its neighbors', 'Deleting pixels', 'Making pixels brighter', 'Flipping the image'], c: 0, why: 'Average the neighborhood → smooth.' },
    { q: 'In a vision network, filter numbers are…', a: ['Learned during training, like weights', 'Always hand-typed by people', 'Random forever', 'Stored in the camera'], c: 0, why: 'Filters are weights!' },
    { q: 'Our Draw & Guess matcher decided by…', a: ['Comparing the dots of your drawing with stored templates', 'Asking the internet', 'Random guessing', 'Reading your mind'], c: 0, why: 'Closest template wins.' },
    { q: 'Sampling a sound means…', a: ['Measuring the wave many times per second and storing numbers', 'Playing it louder', 'Deleting noise', 'Drawing it'], c: 0, why: 'Each sample is one number.' },
    { q: 'With far too few samples…', a: ['The stored shape loses the real wave', 'The sound gets better', 'Nothing changes', 'It becomes a picture'], c: 0, why: 'Not enough measurements = lost detail.' },
    { q: 'Image networks detect features in which order?', a: ['Edges → shapes → parts → objects', 'Objects → edges → pixels', 'Random order', 'Only objects'], c: 0, why: 'Simple to complex, layer by layer.' },
    { q: 'A vision AI trained only on daytime photos may struggle…', a: ['At night — the photos look different from its training data', 'Never', 'Only on Tuesdays', 'With black-and-white photos only'], c: 0, why: 'Unfamiliar conditions cause mistakes.' },
    { q: 'Small stickers fooling a stop-sign detector is an example of…', a: ['An adversarial example', 'A perfect model', 'A sound wave', 'Data cleaning'], c: 0, why: 'Tiny, tricky changes can fool some AIs.' },
  ],
  project: {
    title: 'Camera AI Mini-Lab',
    intro: 'Build the first steps of a robot camera: mix a color, decode a picture, pick the right edge map, and choose a sample rate for its microphone.',
    css: `
.cl-step{background:var(--bg2);padding:12px;margin-bottom:12px;border:3px solid transparent}
.cl-step.done{border-color:#2a9d8f;background:#e3f6ea}
.cl-sl label{display:grid;grid-template-columns:60px 1fr 40px;gap:8px;align-items:center;font-weight:800}
.cl-sl input{width:100%;min-height:40px}
.cl-sw{width:70px;height:40px;border:3px solid #0a1a33;display:inline-block;vertical-align:middle;margin-right:8px}
.cl-g{display:grid;grid-template-columns:repeat(6,1fr);gap:2px;background:#0a1a33;padding:2px;max-width:200px}
.cl-g button{aspect-ratio:1;border:0;background:#fff;cursor:pointer;min-width:0}
.cl-g button[aria-pressed="true"]{background:#0a1a33;box-shadow:inset 0 0 0 1px #1f6feb}
.cl-nums{font:700 .9rem/1.35 ui-monospace,Menlo,monospace;background:#0a1a33;color:#7fb2ff;padding:8px;white-space:pre;display:inline-block}
.cl-opts{display:flex;gap:10px;flex-wrap:wrap}
.cl-opts button{border:3px solid #0a1a33;background:#fff;padding:6px;cursor:pointer}
.cl-mini{display:grid;grid-template-columns:repeat(6,14px);gap:1px;background:#0a1a33}
.cl-mini i{width:14px;height:14px;display:block}
`,
    js: function (el, api) {
      var D = api.D, S = api.load(), step = S.step || 0, c = S.c || [0, 0, 0], G = S.g || ['000000', '000000', '000000', '000000', '000000', '000000'];
      var PLUS = ['000000', '001100', '011110', '011110', '001100', '000000'];
      function edgeOf(p) { return p.map(function (row, y) { return row.split('').map(function (v, x) { var n = 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var yy = y + d[1], xx = x + d[0]; var nv = yy < 0 || yy > 5 || xx < 0 || xx > 5 ? '0' : p[yy][xx]; if (nv !== v) n++; }); return v === '1' && n ? '1' : '0'; }).join(''); }); }
      function mini(p) { return '<div class="cl-mini" aria-hidden="true">' + p.join('').split('').map(function (v) { return '<i style="background:' + (v === '1' ? '#0a1a33' : '#fff') + '"></i>'; }).join('') + '</div>'; }
      function render() {
        var h = '';
        h += '<div class="cl-step' + (step > 0 ? ' done' : '') + '"><p><b>1 · Color sensor:</b> Mix <b>pure red</b> (red full, green and blue off).</p>' + (step > 0 ? '<p>✅ rgb(255, 0, 0)</p>' : '<div class="cl-sl">' + ['Red', 'Green', 'Blue'].map(function (n, i) { return '<label>' + n + '<input type="range" min="0" max="255" step="15" data-c="' + i + '" value="' + c[i] + '"><b data-cv="' + i + '">' + c[i] + '</b></label>'; }).join('') + '</div><p><span class="cl-sw" id="cl-sw" style="background:rgb(' + c.join(',') + ')"></span></p>') + '</div>';
        if (step >= 1) h += '<div class="cl-step' + (step > 1 ? ' done' : '') + '"><p><b>2 · Decode:</b> Paint the grid to match the numbers (1 = dark).</p><div class="row" style="align-items:flex-start"><div class="cl-nums">' + PLUS.join('\n').replace(/(\d)/g, '$1 ') + '</div><div class="cl-g" id="cl-g">' + G.map(function (r, y) { return r.split('').map(function (v, x) { return '<button type="button" data-x="' + x + '" data-y="' + y + '" aria-pressed="' + (v === '1') + '" aria-label="Row ' + (y + 1) + ' column ' + (x + 1) + '" ' + (step > 1 ? 'disabled' : '') + '></button>'; }).join(''); }).join('') + '</div></div></div>';
        if (step >= 2) {
          var right = edgeOf(PLUS), wrongA = PLUS, wrongB = ['111111', '100001', '100001', '100001', '100001', '111111'];
          var opts = D.shuffle([[1, right], [0, wrongA], [0, wrongB]]);
          h += '<div class="cl-step' + (step > 2 ? ' done' : '') + '"><p><b>3 · Edge detector:</b> Which grid shows the EDGES of your shape (dark pixels touching light ones)?</p>' + (step > 2 ? mini(right) : '<div class="cl-opts">' + opts.map(function (o) { return '<button type="button" data-e="' + o[0] + '" aria-label="' + (o[0] ? 'Option' : 'Option') + '">' + mini(o[1]) + '</button>'; }).join('') + '</div><p class="feedback" id="cl-f3" aria-live="polite"></p>') + '</div>';
        }
        if (step >= 3) h += '<div class="cl-step' + (step > 3 ? ' done' : '') + '"><p><b>4 · Microphone:</b> Which sample rate lets the robot record voices clearly?</p>' + (step > 3 ? '<p>✅ Thousands of samples per second, like 16,000 or 44,100.</p>' : '<div class="row">' + D.shuffle([[1, 'Thousands of samples per second (like 16,000)'], [0, '2 samples per second'], [0, '1 sample per minute']]).map(function (o) { return '<button type="button" class="btn small" data-s="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" id="cl-f4" aria-live="polite"></p>') + '</div>';
        if (step >= 4) h += '<p class="feedback ok">🏆 Camera AI online: colors → pixels → edges → sound. You built the “senses” layer of a robot!</p>';
        el.innerHTML = h;
        D.$all('[data-c]', el).forEach(function (r) { r.addEventListener('input', function () { c[+r.getAttribute('data-c')] = +r.value; api.save({ c: c }); D.$('[data-cv="' + r.getAttribute('data-c') + '"]', el).textContent = r.value; D.$('#cl-sw', el).style.background = 'rgb(' + c.join(',') + ')'; if (c[0] === 255 && c[1] === 0 && c[2] === 0) { step = 1; api.save({ step: 1 }); D.sfx('good'); render(); } }); });
        D.$all('#cl-g button', el).forEach(function (b) { b.addEventListener('click', function () { var x = +b.getAttribute('data-x'), y = +b.getAttribute('data-y'), r = G[y].split(''); r[x] = r[x] === '1' ? '0' : '1'; G[y] = r.join(''); api.save({ g: G }); if (G.join('') === PLUS.join('')) { step = 2; api.save({ step: 2 }); D.sfx('good'); } render(); var again = D.$('#cl-g button[data-x="' + x + '"][data-y="' + y + '"]', el); if (again && step === 1) again.focus(); }); });
        D.$all('[data-e]', el).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-e') === '1') { step = 3; api.save({ step: 3 }); D.sfx('good'); render(); } else { D.sfx('bad'); b.disabled = true; D.$('#cl-f3', el).className = 'feedback no'; D.$('#cl-f3', el).textContent = 'Edges are only the border of the shape. The middle should be empty.'; } }); });
        D.$all('[data-s]', el).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-s') === '1') { step = 4; api.save({ step: 4 }); D.sfx('win'); render(); } else { D.sfx('bad'); b.disabled = true; D.$('#cl-f4', el).className = 'feedback no'; D.$('#cl-f4', el).textContent = 'Far too few measurements to capture a voice.'; } }); });
        if (step >= 4) api.done();
      }
      render();
    },
  },
};
