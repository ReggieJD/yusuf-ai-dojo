module.exports = {
  hook: 'Predict. Measure the mistake. Nudge the weights. Repeat. Watch a neuron train itself, one loop at a time.',
  story: [
    ['sensei', 'You tuned weights by hand, {{nick}}. Real AIs have billions of weights. Nobody could tune those by hand!'],
    ['sensei', 'So the computer runs a <b>training loop</b>: <b>1)</b> make predictions, <b>2)</b> measure how wrong they are (the <b>loss</b>), <b>3)</b> nudge every weight a little bit downhill, <b>4)</b> repeat, thousands or millions of times.'],
    ['you', 'It’s gradient descent again!'],
    ['sensei', 'Exactly! Let’s watch a neuron learn to separate two teams of points, with no hand-tuning at all.'],
  ],
  activity: {
    title: 'Watch It Learn',
    instructions: 'Press “Train 1 loop” and watch the line, the loss and the accuracy change. Keep training until accuracy hits 100% and the loss drops below 0.20.',
    css: `
.hl{display:grid;gap:10px}
@media(min-width:680px){.hl{grid-template-columns:1.1fr .9fr}}
.hl-plot,.hl-loss{background:#fff;border-radius:18px;border:2px solid #0d2b1d18;padding:6px}
.hl-plot svg,.hl-loss svg{width:100%;height:auto;display:block}
.hl-loop{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:8px 0}
.hl-loop span{border-radius:12px;padding:6px 2px;text-align:center;font:800 .72rem var(--font-body);background:var(--bg2);color:#0d2b1d;transition:background .2s}
.hl-loop span.on{background:#16a36b;color:#fff}
.hl-stats{display:flex;gap:12px;flex-wrap:wrap;font-weight:800}
`,
    js: function (el, api) {
      var D = api.D;
      var P = [[0.6, 0.4, 1], [0.3, 0.7, 1], [0.8, 0.8, 1], [0.5, 0.2, 1], [0.2, 0.5, 1], [-0.6, -0.3, 0], [-0.2, -0.7, 0], [-0.8, -0.6, 0], [-0.4, 0, 0], [0, -0.4, 0]];
      var S = api.load(), w = S.w || [-1.2, 0.6], b = S.b != null ? S.b : 0.8, hist = S.hist || [], lr = 1.5, busy = false;
      function sg(z) { return 1 / (1 + Math.exp(-z)); }
      function loss() { return P.reduce(function (a, p) { var y = sg(w[0] * p[0] + w[1] * p[1] + b); y = Math.min(1 - 1e-9, Math.max(1e-9, y)); return a - (p[2] ? Math.log(y) : Math.log(1 - y)); }, 0) / P.length; }
      function acc() { return P.filter(function (p) { return (w[0] * p[0] + w[1] * p[1] + b > 0) === !!p[2]; }).length; }
      if (!hist.length) hist.push(loss());
      el.innerHTML = '<div class="hl-loop" aria-hidden="true"><span data-s="0">1 · Predict</span><span data-s="1">2 · Measure loss</span><span data-s="2">3 · Nudge weights</span><span data-s="3">4 · Repeat</span></div><div class="hl"><div class="hl-plot" id="hl-plot"></div><div><div class="hl-loss" id="hl-loss"></div><div class="hl-stats" id="hl-stats" aria-live="polite"></div></div></div>' +
        '<div class="row" style="margin-top:10px"><button type="button" class="btn primary" id="hl-1">🔁 Train 1 loop</button><button type="button" class="btn" id="hl-10">⏩ Train 10 loops</button><button type="button" class="btn small" id="hl-r">↺ Start over</button></div><p class="feedback" id="hl-fb" aria-live="polite"></p>';
      function draw() {
        var W = 260, X = function (v) { return (v + 1) / 2 * W; }, Y = function (v) { return W - (v + 1) / 2 * W; }, h = '', N = 16, c = W / N;
        for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) { var x = -1 + (i + 0.5) * 2 / N, y = 1 - (j + 0.5) * 2 / N, p = sg(w[0] * x + w[1] * y + b); h += '<rect x="' + (i * c) + '" y="' + (j * c) + '" width="' + (c + 0.5) + '" height="' + (c + 0.5) + '" fill="rgba(22,163,107,' + (p * 0.45).toFixed(2) + ')"/>'; }
        var dots = P.map(function (p) { return p[2] ? '<circle cx="' + X(p[0]) + '" cy="' + Y(p[1]) + '" r="9" fill="#16a36b" stroke="#0d2b1d" stroke-width="2"/>' : '<rect x="' + (X(p[0]) - 8) + '" y="' + (Y(p[1]) - 8) + '" width="16" height="16" fill="#d64545" stroke="#0d2b1d" stroke-width="2"/>'; }).join('');
        D.$('#hl-plot', el).innerHTML = '<svg viewBox="0 0 ' + W + ' ' + W + '" role="img" aria-label="Points and the neuron’s confidence shading. Accuracy ' + acc() + ' of 10.">' + h + dots + '</svg>';
        var LW = 220, LH = 120, mx = Math.max.apply(null, hist.concat([1]));
        var pts = hist.map(function (v, i) { return (10 + i / Math.max(1, hist.length - 1) * (LW - 20)).toFixed(1) + ',' + (LH - 14 - v / mx * (LH - 30)).toFixed(1); }).join(' ');
        D.$('#hl-loss', el).innerHTML = '<svg viewBox="0 0 ' + LW + ' ' + LH + '" role="img" aria-label="Loss over time, now ' + loss().toFixed(2) + '"><text x="10" y="12" font-size="11" fill="#3d5c4f" font-weight="700">Loss (lower = better)</text><line x1="10" y1="' + (LH - 14) + '" x2="' + (LW - 10) + '" y2="' + (LH - 14) + '" stroke="#0d2b1d22"/><polyline points="' + pts + '" fill="none" stroke="#0b6e8a" stroke-width="2.5"/><text x="' + (LW - 10) + '" y="' + (LH - 2) + '" font-size="10" text-anchor="end" fill="#3d5c4f">training loops →</text></svg>';
        var a = acc(), l = loss();
        D.$('#hl-stats', el).innerHTML = '<span>🔁 Loops: ' + (hist.length - 1) + '</span><span>📉 Loss: ' + l.toFixed(2) + '</span><span>🎯 Accuracy: ' + a + '/10</span>';
        var fb = D.$('#hl-fb', el);
        if (a === 10 && l < 0.2) { fb.className = 'feedback ok'; fb.innerHTML = '🏆 Trained! Nobody told the neuron where to put the line. It found it by repeating predict → measure → nudge. Big AIs do exactly this, just with billions of weights and loads of data.'; api.done(); }
        else fb.textContent = a === 10 ? 'All points are correct! Keep training to make the neuron more CONFIDENT. That lowers the loss.' : '';
      }
      function step() {
        var g = [0, 0], gb = 0;
        P.forEach(function (p) { var y = sg(w[0] * p[0] + w[1] * p[1] + b), d = y - p[2]; g[0] += d * p[0]; g[1] += d * p[1]; gb += d; });
        w = [w[0] - lr * g[0] / P.length, w[1] - lr * g[1] / P.length]; b -= lr * gb / P.length; hist.push(loss());
      }
      function flash(k, done) {
        var spans = D.$all('.hl-loop span', el), i = 0;
        (function go() { spans.forEach(function (s, j) { s.classList.toggle('on', j === i); }); i++; if (i < 4) setTimeout(go, D.reducedMotion() ? 10 : 140); else { setTimeout(function () { spans.forEach(function (s) { s.classList.remove('on'); }); done(); }, 120); } })();
      }
      function train(n) {
        if (busy) return; busy = true; D.sfx('step');
        flash(0, function () { for (var i = 0; i < n; i++) step(); api.save({ w: w, b: b, hist: hist.slice(-200) }); draw(); busy = false; });
      }
      D.$('#hl-1', el).addEventListener('click', function () { train(1); });
      D.$('#hl-10', el).addEventListener('click', function () { train(10); });
      D.$('#hl-r', el).addEventListener('click', function () { w = [-1.2, 0.6]; b = 0.8; hist = [loss()]; api.save({ w: w, b: b, hist: hist }); draw(); });
      draw();
    },
  },
  quiz: [
    { q: 'What are the steps of the training loop, in order?', a: ['Predict → measure the loss → nudge the weights → repeat', 'Nudge → delete → predict → stop', 'Measure → give up → restart', 'Repeat → predict → guess → print'], c: 0, why: 'This loop runs over and over until the loss is low enough.' },
    { q: 'What is the loss?', a: ['A score of how wrong the model’s predictions are', 'The number of weights', 'Lost data', 'The model’s speed'], c: 0, why: 'Training tries to make the loss smaller.' },
    { q: 'As training went on, what happened to the loss chart?', a: ['It went down — the neuron got less wrong', 'It went up forever', 'It stayed flat', 'It disappeared'], c: 0, why: 'Each loop nudged the weights downhill.' },
    { q: 'All 10 points were correct, but training still lowered the loss. Why?', a: ['The neuron became more confident in its correct answers', 'It started getting answers wrong', 'Loss is random', 'The points moved'], c: 0, why: 'Loss rewards being right AND sure. That’s why it kept dropping.' },
  ],
  challenge: {
    title: 'Loop Order',
    intro: 'Put the training loop in order by tapping the steps from first to last.',
    css: `.lo-pool,.lo-out{display:flex;flex-wrap:wrap;gap:8px;min-height:56px;padding:8px;border-radius:14px;background:var(--bg2);margin-bottom:8px}.lo-pool button,.lo-out span{min-height:48px;padding:8px 12px;border-radius:12px;border:2px solid #0d2b1d;background:#fff;font:700 .92rem var(--font-body);color:#0d2b1d}.lo-out span{background:#16a36b;color:#fff}`,
    js: function (el, api) {
      var D = api.D, STEPS = ['🔮 Make predictions', '📏 Measure the loss', '🔧 Nudge the weights downhill', '🔁 Repeat until the loss is low'];
      var picked = [];
      function render() {
        var left = D.shuffle(STEPS.map(function (s, i) { return i; }).filter(function (i) { return picked.indexOf(i) < 0; }));
        el.innerHTML = '<p><b>Tap in order:</b></p><div class="lo-out" aria-live="polite">' + picked.map(function (i, k) { return '<span>' + (k + 1) + '. ' + STEPS[i] + '</span>'; }).join('') + '</div><div class="lo-pool">' + left.map(function (i) { return '<button type="button" data-i="' + i + '">' + STEPS[i] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p>';
        D.$all('.lo-pool button', el).forEach(function (b) {
          b.addEventListener('click', function () {
            var i = +b.getAttribute('data-i'), f = el.querySelector('.feedback');
            if (i === picked.length) { picked.push(i); D.sfx('good'); render(); if (picked.length === 4) { el.querySelector('.feedback').className = 'feedback ok'; el.querySelector('.feedback').textContent = '🏆 Perfect loop! This exact cycle trains everything from spam filters to chatbots.'; api.done(); } }
            else { D.sfx('bad'); f.className = 'feedback no'; f.textContent = 'Not next. What must happen before you can measure a mistake?'; }
          });
        });
      }
      render();
    },
  },
};
