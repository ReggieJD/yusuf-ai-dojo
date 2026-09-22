module.exports = {
  hook: 'Draw a shape and the computer guesses what it is, using a simple pattern matcher built right into this page. Can you get it to guess right three times?',
  story: [
    ['sensei', 'Time to play a game against the machine, {{nick}}. You draw, it guesses.'],
    ['sensei', 'This page has a small, honest <b>pattern matcher</b>. It turns your drawing into <b>32 dots</b>, each one just two numbers (how far across and how far down), then compares that dot pattern with stored <b>templates</b> of shapes it knows. The closest match wins.'],
    ['you', 'Is that how big AI apps recognize drawings?'],
    ['sensei', 'Big ones use neural networks trained on millions of drawings, so they’re much better at messy doodles. Ours is simpler, which means you can see exactly how it thinks, and find its weak spots!'],
  ],
  activity: {
    title: 'Draw & Guess',
    instructions: 'Draw the shape the sensei asks for, using one big drawing that fills the box. Then press Guess! Get 3 correct guesses.',
    css: `
.dg{display:grid;gap:12px}
@media(min-width:680px){.dg{grid-template-columns:auto 1fr}}
.dg-pad{position:relative;width:260px;max-width:100%}
.dg-pad canvas{width:100%;aspect-ratio:1;border:3px solid #0a1a33;background:#fff;touch-action:none;display:block;cursor:crosshair}
.dg-ask{font:800 1.1rem var(--font-head);background:#0a1a33;color:#7fb2ff;padding:8px 12px;margin-bottom:8px}
.dg-bars{display:grid;gap:6px}
.dg-bar{display:grid;grid-template-columns:90px 1fr 44px;gap:8px;align-items:center;font-weight:800;font-size:.9rem}
.dg-bar .meter>i{background:#1f6feb}
.dg-bar.top .meter>i{background:#2a9d8f}
.dg-mini{width:150px;border:2px solid #0a1a33;margin-top:8px;background:#fff}
.dg-mini svg{display:block;width:100%;height:auto}
.dg-score{font-weight:800;margin-top:6px}
`,
    js: function (el, api) {
      var D = api.D, SZ = 240, LW = 14;
      var SHAPES = {
        circle: { n: '⭕ Circle', d: function (c) { c.beginPath(); c.arc(120, 120, 90, 0, Math.PI * 2); c.stroke(); } },
        square: { n: '⬜ Square', d: function (c) { c.strokeRect(30, 30, 180, 180); } },
        triangle: { n: '🔺 Triangle', d: function (c) { c.beginPath(); c.moveTo(120, 25); c.lineTo(215, 210); c.lineTo(25, 210); c.closePath(); c.stroke(); } },
        x: { n: '❌ X', d: function (c) { c.beginPath(); c.moveTo(30, 30); c.lineTo(210, 210); c.moveTo(210, 30); c.lineTo(30, 210); c.stroke(); } },
      };
      // $P point-cloud recognizer (Vatavu, Anthony & Wobbrock, 2012): resample → scale → center → greedy cloud match.
      var N = 32;
      function resample(strokes) {
        var pts = [], len = 0, i, j;
        strokes.forEach(function (st) { for (i = 1; i < st.length; i++) len += Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]); });
        var I = len / (N - 1), D0 = 0, out = [];
        strokes.forEach(function (st) {
          if (!st.length) return; var q = st.slice(); out.push(q[0]);
          for (j = 1; j < q.length; j++) {
            var d = Math.hypot(q[j][0] - q[j - 1][0], q[j][1] - q[j - 1][1]);
            if (D0 + d >= I && d > 0) { var t = (I - D0) / d, n = [q[j - 1][0] + t * (q[j][0] - q[j - 1][0]), q[j - 1][1] + t * (q[j][1] - q[j - 1][1])]; out.push(n); q.splice(j, 0, n); D0 = 0; }
            else D0 += d;
          }
        });
        while (out.length < N) out.push(out[out.length - 1]);
        return out.slice(0, N);
      }
      function normalize(strokes) {
        var p = resample(strokes), x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        p.forEach(function (q) { x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); });
        var s = Math.max(x1 - x0, y1 - y0, 1), cx = 0, cy = 0;
        p = p.map(function (q) { return [(q[0] - x0) / s, (q[1] - y0) / s]; });
        p.forEach(function (q) { cx += q[0] / N; cy += q[1] / N; });
        return p.map(function (q) { return [q[0] - cx, q[1] - cy]; });
      }
      function cloudDist(a, b, start) {
        var used = [], sum = 0, i = start;
        do {
          var best = 1e9, idx = -1;
          for (var j = 0; j < N; j++) if (!used[j]) { var d = Math.hypot(a[i][0] - b[j][0], a[i][1] - b[j][1]); if (d < best) { best = d; idx = j; } }
          used[idx] = true; sum += (1 - ((i - start + N) % N) / N) * best; i = (i + 1) % N;
        } while (i !== start);
        return sum;
      }
      function match(a, b) { var step = Math.floor(Math.pow(N, 0.5)), m = 1e9; for (var i = 0; i < N; i += step) m = Math.min(m, cloudDist(a, b, i), cloudDist(b, a, i)); return m; }
      function arcPts(cx, cy, r, a0) { var o = []; for (var k = 0; k <= 36; k++) { var t = a0 + k / 36 * Math.PI * 2; o.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); } return o; }
      var TPL = {
        circle: [[arcPts(120, 120, 90, 0)], [arcPts(120, 120, 90, -Math.PI / 2)], [arcPts(120, 120, 90, Math.PI)]],
        square: [[[[30, 30], [210, 30], [210, 210], [30, 210], [30, 30]]], [[[30, 30], [30, 210], [210, 210], [210, 30], [30, 30]]], [[[30, 30], [210, 30], [210, 210]], [[30, 30], [30, 210], [210, 210]]]],
        triangle: [[[[120, 25], [215, 210], [25, 210], [120, 25]]], [[[120, 25], [25, 210], [215, 210], [120, 25]]], [[[25, 210], [120, 25], [215, 210], [25, 210]]]],
        x: [[[[30, 30], [210, 210]], [[210, 30], [30, 210]]]],
      };
      Object.keys(TPL).forEach(function (k) { TPL[k] = TPL[k].map(normalize); });
      var strokes = [];
      var S = api.load(), wins = S.wins || {}, order = ['circle', 'square', 'triangle', 'x'], ask = S.ask || 'circle';
      el.innerHTML = '<div class="dg"><div class="dg-pad"><p class="dg-ask" id="dg-ask" aria-live="polite"></p><canvas id="dg-c" width="' + SZ + '" height="' + SZ + '" aria-label="Drawing pad. Draw with your finger or mouse."></canvas><div class="row" style="margin-top:8px"><button type="button" class="btn primary" id="dg-go">🤖 Guess!</button><button type="button" class="btn small" id="dg-clr">🧽 Clear</button><button type="button" class="btn small" id="dg-skip">⏭ Other shape</button></div></div>' +
        '<div><div class="dg-bars" id="dg-bars" aria-live="polite"><p>Draw, then press Guess to see the machine’s confidence for each shape.</p></div><p style="margin:10px 0 0;font-weight:700">What the machine sees (32 dots):</p><div class="dg-mini" id="dg-mini" aria-hidden="true"></div><p class="dg-score" id="dg-score"></p><p class="feedback" id="dg-fb" aria-live="polite"></p></div></div>';
      var cv = D.$('#dg-c', el), cx = cv.getContext('2d'); cx.lineWidth = LW; cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.strokeStyle = '#0a1a33';
      var drawing = false, last = null;
      function pos(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * SZ, (e.clientY - r.top) / r.height * SZ]; }
      cv.addEventListener('pointerdown', function (e) { e.preventDefault(); drawing = true; last = pos(e); strokes.push([last]); cv.setPointerCapture(e.pointerId); cx.beginPath(); cx.arc(last[0], last[1], LW / 2, 0, Math.PI * 2); cx.fillStyle = '#0a1a33'; cx.fill(); });
      cv.addEventListener('pointermove', function (e) { if (!drawing) return; var p = pos(e); cx.beginPath(); cx.moveTo(last[0], last[1]); cx.lineTo(p[0], p[1]); cx.stroke(); last = p; strokes[strokes.length - 1].push(p); });
      cv.addEventListener('pointerup', function () { drawing = false; });
      function prompt() { D.$('#dg-ask', el).textContent = 'Draw a: ' + SHAPES[ask].n; D.$('#dg-score', el).textContent = '✅ Correct guesses: ' + Object.keys(wins).length + ' / 3 ' + Object.keys(wins).map(function (k) { return SHAPES[k].n.split(' ')[0]; }).join(' '); }
      function clear() { cx.clearRect(0, 0, SZ, SZ); strokes = []; D.$('#dg-mini', el).innerHTML = ''; }
      function next() { var left = order.filter(function (k) { return !wins[k] && k !== ask; }); ask = left.length ? left[0] : order.filter(function (k) { return k !== ask; })[0]; api.save({ ask: ask }); clear(); prompt(); }
      D.$('#dg-clr', el).addEventListener('click', clear);
      D.$('#dg-skip', el).addEventListener('click', next);
      D.$('#dg-go', el).addEventListener('click', function () {
        var fb = D.$('#dg-fb', el), ink = 0;
        strokes.forEach(function (st) { for (var i = 1; i < st.length; i++) ink += Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]); });
        if (ink < 60) { fb.className = 'feedback no'; fb.textContent = ink ? 'That’s too tiny to recognize. Draw it bigger!' : 'The pad is empty. Draw first!'; return; }
        var P = normalize(strokes);
        D.$('#dg-mini', el).innerHTML = '<svg viewBox="-0.65 -0.65 1.3 1.3">' + P.map(function (q) { return '<circle cx="' + q[0].toFixed(3) + '" cy="' + q[1].toFixed(3) + '" r="0.03" fill="#1f6feb"/>'; }).join('') + '</svg>';
        var sims = Object.keys(TPL).map(function (k) { return [k, Math.min.apply(null, TPL[k].map(function (t) { return match(P, t); }))]; });
        var ex = sims.map(function (s) { return Math.exp(-s[1] * 2.2); }), tot = ex.reduce(function (a, b) { return a + b; }, 0);
        var ranked = sims.map(function (s, i) { return [s[0], ex[i] / tot]; }).sort(function (a, b) { return b[1] - a[1]; });
        D.$('#dg-bars', el).innerHTML = ranked.map(function (x, i) { return '<div class="dg-bar' + (i === 0 ? ' top' : '') + '"><span>' + SHAPES[x[0]].n + '</span><div class="meter"><i style="width:' + Math.round(x[1] * 100) + '%"></i></div><span>' + Math.round(x[1] * 100) + '%</span></div>'; }).join('');
        var top = ranked[0][0];
        if (top === ask) {
          wins[ask] = 1; api.save({ wins: wins }); D.sfx('win');
          fb.className = 'feedback ok'; fb.textContent = '🤖 “I think it’s a ' + SHAPES[top].n.split(' ')[1].toLowerCase() + '!” Correct!';
          if (Object.keys(wins).length >= 3) { fb.textContent += ' 🏆 Three correct! You saw the whole process: drawing → grid of numbers → compare with templates → best match.'; prompt(); api.done(); return; }
          setTimeout(next, 1400);
        } else { D.sfx('bad'); fb.className = 'feedback no'; fb.textContent = '🤖 “I think it’s a ' + SHAPES[top].n.split(' ')[1].toLowerCase() + '.” Wrong! Clear and draw it bigger and neater, or tap “Other shape.”'; }
        prompt();
      });
      prompt();
    },
  },
  quiz: [
    { q: 'What did the pattern matcher do with your drawing first?', a: ['Turned it into dots, each stored as numbers', 'Sent it to the internet', 'Printed it', 'Colored it in'], c: 0, why: 'Drawing → numbers. Always numbers!' },
    { q: 'How did it decide what you drew?', a: ['It compared your dots with stored templates and picked the closest match', 'It guessed randomly', 'It read your mind', 'It asked another person'], c: 0, why: 'Closest match wins. That’s pattern matching.' },
    { q: 'Why might a messy or tiny drawing fool it?', a: ['It no longer looks much like any stored template', 'Computers dislike messy drawings', 'Tiny drawings are invisible', 'It never gets fooled'], c: 0, why: 'Simple template matching struggles with shapes it doesn’t expect.' },
    { q: 'How do big drawing-recognition AIs get better at messy doodles?', a: ['They train neural networks on millions of real drawings', 'They use bigger screens', 'They only accept neat drawings', 'They have no data'], c: 0, why: 'More varied examples = better at the messiness of real life.' },
  ],
  challenge: {
    title: 'Machine vs Human',
    intro: 'Think like an AI researcher. Get 3 of 4.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'Our matcher squishes every drawing to the same size first. Why is that smart?', a: ['A small circle and a big circle should still both count as circles', 'It saves ink', 'It makes drawings prettier', 'It isn’t smart'], c: 0, why: 'Making the input size-independent is a classic trick.' },
        { q: 'A child draws a cat. Our matcher only knows circle, square, triangle and X. What happens?', a: ['It still picks one of those four — it can’t say “cat” because it never learned cats', 'It says “cat”', 'It crashes', 'It learns “cat” automatically'], c: 0, why: 'A model can only choose from what it was built or trained to know.' },
        { q: 'Google’s Quick, Draw! game collected millions of doodles from players. What were those drawings useful for?', a: ['Training data for doodle-recognizing neural networks', 'Printing posters', 'Nothing', 'Measuring screen sizes'], c: 0, why: 'Each doodle labeled with its prompt is a training example.' },
        { q: 'What do you do better than our matcher?', a: ['Recognize messy, weird or partly-hidden drawings using real understanding and experience', 'Multiply huge numbers instantly', 'Store 256 numbers perfectly', 'Nothing'], c: 0, why: 'Humans are amazing at flexible recognition, and AI is still catching up in many cases.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
