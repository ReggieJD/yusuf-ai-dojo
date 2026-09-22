module.exports = {
  hook: 'One student memorizes the answers. Another understands the pattern. On a NEW test, who wins? Turn the wiggle dial and find out.',
  story: [
    ['sensei', 'Two students, {{nick}}. <b>Memo</b> memorizes every practice answer, word for word. <b>Pat</b> learns the pattern behind them.'],
    ['sensei', 'On the practice sheet, Memo scores 100%. But on a new test with new questions, Memo freezes, and Pat does great.'],
    ['you', 'So memorizing isn’t learning.'],
    ['sensei', 'Exactly! AI models can do the same thing. When a model memorizes its training data, including the random noise, it’s called <b>overfitting</b>. It looks perfect in training and fails in real life.'],
    ['sensei', 'Here’s a model drawing a curve through data. Turn up its <b>wiggliness</b> (its complexity) and watch what happens.'],
  ],
  activity: {
    title: 'The Wiggle Dial',
    instructions: '1) Turn the dial all the way to 7. 2) Reveal the hidden test points. 3) Find the wiggliness with the LOWEST test mistakes and lock it in.',
    css: `
.of-plot{background:#fff;border-radius:12px;border:2px solid #2b1a0e22;padding:6px}
.of-plot svg{width:100%;height:auto;display:block}
.of-ctrl{display:grid;gap:8px;margin-top:10px}
.of-ctrl input{width:100%;min-height:44px;accent-color:#e8590c}
.of-bars{display:grid;gap:6px;margin-top:6px}
.of-bar{display:grid;grid-template-columns:130px 1fr 54px;gap:8px;align-items:center;font-weight:700;font-size:.9rem}
.of-bar .meter{height:16px}
.of-bar.test .meter>i{background:#1c5d99}
.of-tip{background:var(--bg2);border-radius:12px;padding:10px 12px;margin-top:10px;font-weight:600}
`,
    js: function (el, api) {
      var D = api.D;
      var TX = [-0.95, -0.7, -0.45, -0.2, 0.05, 0.3, 0.55, 0.8], TY = [-1.257, -0.922, -0.277, -0.142, 0.343, 0.318, 0.583, 0.298];
      var SX = [-0.85, -0.6, -0.33, -0.08, 0.18, 0.42, 0.68, 0.92], SY = [-1.203, -0.548, -0.234, 0.193, 0.256, 0.487, 0.372, 0.411];
      function fit(d) {
        var n = d + 1, A = [], b = [], i, j;
        for (i = 0; i < n; i++) { A.push([]); for (j = 0; j < n; j++) A[i].push(0); b.push(0); }
        TX.forEach(function (x, k) { var p = []; for (i = 0; i < n; i++) p.push(Math.pow(x, i)); for (i = 0; i < n; i++) { b[i] += p[i] * TY[k]; for (j = 0; j < n; j++) A[i][j] += p[i] * p[j]; } });
        for (i = 0; i < n; i++) A[i][i] += 1e-9;
        for (var c = 0; c < n; c++) {
          var m = c; for (var r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[m][c])) m = r;
          var t = A[c]; A[c] = A[m]; A[m] = t; t = b[c]; b[c] = b[m]; b[m] = t;
          for (r = 0; r < n; r++) { if (r === c) continue; var f = A[r][c] / A[c][c]; for (j = c; j < n; j++) A[r][j] -= f * A[c][j]; b[r] -= f * b[c]; }
        }
        return b.map(function (v, k) { return v / A[k][k]; });
      }
      function ev(w, x) { var s = 0; for (var i = 0; i < w.length; i++) s += w[i] * Math.pow(x, i); return s; }
      function err(w, xs, ys) { return 100 * xs.reduce(function (s, x, i) { return s + Math.pow(ev(w, x) - ys[i], 2); }, 0) / xs.length; }
      var S = api.load(), deg = S.deg || 1, seen7 = !!S.seen7, reveal = !!S.reveal;
      el.innerHTML = '<div class="of-plot" id="of-plot"></div><div class="of-ctrl"><label for="of-d"><b>Wiggliness (model complexity): <span id="of-dv"></span></b></label><input type="range" id="of-d" min="1" max="7" step="1" value="' + deg + '">' +
        '<div class="of-bars"><div class="of-bar"><span>📚 Training mistakes</span><div class="meter" aria-hidden="true"><i id="of-tr"></i></div><span id="of-trv"></span></div><div class="of-bar test"><span>🔒 Test mistakes</span><div class="meter" aria-hidden="true"><i id="of-te"></i></div><span id="of-tev"></span></div></div>' +
        '<div class="row"><button type="button" class="btn" id="of-rev">👀 Reveal hidden test points</button><button type="button" class="btn primary" id="of-lock">🔒 Lock in this wiggliness</button></div></div><div class="of-tip" id="of-tip" aria-live="polite"></div>';
      var dial = D.$('#of-d', el);
      function draw() {
        deg = +dial.value; var w = fit(deg), W = 340, H = 220;
        var X = function (x) { return 20 + (x + 1) / 2 * (W - 40); }, Y = function (y) { return H / 2 - y * 70; };
        var path = ''; for (var k = 0; k <= 120; k++) { var x = -1 + k / 60, y = Math.max(-1.6, Math.min(1.6, ev(w, x))); path += (k ? 'L' : 'M') + X(x).toFixed(1) + ' ' + Y(y).toFixed(1); }
        var tr = err(w, TX, TY), te = err(w, SX, SY);
        D.$('#of-plot', el).innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Curve with wiggliness ' + deg + ' drawn through 8 training points' + (reveal ? ' and 8 hidden test points' : '') + '."><clipPath id="ofc"><rect x="0" y="0" width="' + W + '" height="' + H + '"/></clipPath><line x1="20" x2="' + (W - 20) + '" y1="' + (H / 2) + '" y2="' + (H / 2) + '" stroke="#2b1a0e14"/>' +
          '<path clip-path="url(#ofc)" d="' + path + '" fill="none" stroke="#e8590c" stroke-width="3"/>' +
          TX.map(function (x, i) { return '<circle cx="' + X(x) + '" cy="' + Y(TY[i]) + '" r="6" fill="#2b1a0e"/>'; }).join('') +
          (reveal ? SX.map(function (x, i) { return '<circle cx="' + X(x) + '" cy="' + Y(SY[i]) + '" r="6" fill="#fff" stroke="#1c5d99" stroke-width="3"/>'; }).join('') : '') +
          '<text x="24" y="16" font-size="11" fill="#6b4a33">● training data' + (reveal ? '   ○ hidden test data' : '') + '</text></svg>';
        D.$('#of-dv', el).textContent = deg + (deg === 1 ? ' (straight line)' : deg >= 6 ? ' (super wiggly!)' : '');
        var cap = function (v) { return Math.min(100, v / 40 * 100); };
        D.$('#of-tr', el).style.width = cap(tr) + '%'; D.$('#of-trv', el).textContent = tr.toFixed(1);
        D.$('#of-te', el).style.width = reveal ? cap(te) + '%' : '0'; D.$('#of-tev', el).textContent = reveal ? (te > 99 ? '99+' : te.toFixed(1)) : '???';
        var tip = D.$('#of-tip', el);
        if (!seen7) tip.textContent = 'Step 1: turn the dial up to 7 and watch the training mistakes.';
        else if (!reveal) tip.textContent = 'Training mistakes: ' + tr.toFixed(1) + '. At 7 it’s ZERO, a “perfect” memorizer! Now reveal the hidden test points…';
        else tip.innerHTML = deg >= 6 ? '😱 The super-wiggly curve passes through every training dot but swings wildly between them. It <b>memorized the noise</b>, so it fails on new data. That’s overfitting!' : deg === 1 ? 'A straight line is too simple to follow the curve. That’s called <b>underfitting</b>.' : 'Step 3: find the wiggliness where the <b>blue</b> test bar is lowest, then lock it in.';
      }
      dial.addEventListener('input', function () { if (+dial.value === 7 && !seen7) { seen7 = true; D.sfx('good'); } api.save({ deg: +dial.value, seen7: seen7 }); draw(); });
      D.$('#of-rev', el).addEventListener('click', function () { if (!seen7) { D.$('#of-tip', el).textContent = 'First turn the dial to 7!'; return; } reveal = true; api.save({ reveal: true }); D.sfx('click'); draw(); });
      D.$('#of-lock', el).addEventListener('click', function () {
        var tip = D.$('#of-tip', el);
        if (!reveal) { tip.textContent = 'Reveal the test points first. You need them to judge fairly!'; return; }
        var errs = []; for (var d = 1; d <= 7; d++) errs.push(err(fit(d), SX, SY));
        var best = errs.indexOf(Math.min.apply(null, errs)) + 1;
        if (deg === best) { tip.innerHTML = '🏆 Wiggliness ' + best + ' is the sweet spot: simple enough to ignore the noise, flexible enough to follow the real pattern. That’s <b>understanding</b>, not memorizing. Just like Pat!'; D.sfx('win'); api.save({ locked: true }); api.done(); }
        else { tip.textContent = 'Not the lowest blue bar yet. Try other settings and compare the test mistakes.'; D.sfx('bad'); }
      });
      draw();
      if (S.locked && reveal) D.$('#of-lock', el).click();
    },
  },
  quiz: [
    { q: 'What is overfitting?', a: ['When a model memorizes its training data so closely that it fails on new data', 'When a model is too small to run', 'When data is missing', 'When a model is perfect'], c: 0, why: 'Overfitting = memorizing instead of understanding.' },
    { q: 'The super-wiggly curve had ZERO training mistakes. Why was that bad?', a: ['It memorized the random noise, so it made big mistakes on new points', 'Zero mistakes is always good', 'It was too slow', 'It used the wrong colors'], c: 0, why: 'Perfect on training data + terrible on test data = overfitting.' },
    { q: 'How can engineers catch overfitting?', a: ['Compare the training score with the test score on hidden data', 'Only look at the training score', 'Make the model more wiggly', 'Delete the test set'], c: 0, why: 'A big gap between training and test scores is the warning sign.' },
    { q: 'A straight line that can’t follow the curve at all is…', a: ['Underfitting — too simple', 'Overfitting', 'Perfect', 'A data leak'], c: 0, why: 'Too simple = underfit. Too complex = overfit. The goal is the sweet spot.' },
  ],
  challenge: {
    title: 'Fit Doctor',
    intro: 'Diagnose each model: <b>Overfit</b> (memorized), <b>Underfit</b> (too simple), or <b>Good fit</b>. Get 4 of 5.',
    js: function (el, api) {
      api.D.sorter(el, api, {
        choices: [['o', '🤯 Overfit'], ['u', '😴 Underfit'], ['g', '✅ Good fit']],
        items: [
          ['Training score 100%, test score 55%.', 'o', 'A huge gap: it memorized the training data.'],
          ['Training score 52%, test score 50%, on a problem people solve easily.', 'u', 'It’s bad at everything, even the training data: too simple.'],
          ['Training score 94%, test score 91%.', 'g', 'Strong on both, with a small gap. Healthy learning!'],
          ['A face-unlock AI works on the 10 photos you trained it with, but fails when you get a haircut.', 'o', 'It memorized those exact photos instead of learning your face.'],
          ['A model that predicts “sunny” every single day, no matter the weather data.', 'u', 'It ignores the data completely: as simple as it gets.'],
        ],
        need: 4, win: 'Diagnosis complete, Dr. Ninja. Spotting overfitting is one of the most important skills in machine learning.',
      });
    },
  },
};
