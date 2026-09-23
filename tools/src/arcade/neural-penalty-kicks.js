module.exports = {
  how: 'Your goalkeeper is a single neuron. It looks at two clues about each shooter, multiplies them by <b>weights</b>, adds a <b>bias</b>, and dives RIGHT if the total is above 0, LEFT if not. Tune the sliders until it predicts the past shots, then face 5 new kicks. Save 4 or more to pass a level. Beat 5 levels to win.',
  connect: 'This is how a real <b>neuron</b> in a neural network works: clues × weights + bias → decision. Training means adjusting the weights and bias until the predictions match the data. You are doing by hand what the training algorithm does automatically, millions of times over.',
  css: `
.pk-wrap{display:grid;gap:12px}
@media(min-width:720px){.pk-wrap{grid-template-columns:260px 1fr}}
.pk-plot{background:#0b0620;border-radius:12px;padding:6px;max-width:260px;margin:0 auto;width:100%}
.pk-plot svg{display:block;width:100%;height:auto}
.pk-sl label{display:grid;grid-template-columns:1fr auto;gap:2px 8px;font-weight:700;margin:6px 0}
.pk-sl input{grid-column:1/3;width:100%;accent-color:#ff5edb;min-height:32px}
.pk-sl output{font:800 1rem ui-monospace,Menlo,monospace;color:#5ef2ff}
.pk-acc{font-weight:800}
.pk-legend{font-size:.8rem;color:#c3b8ea;margin:4px 0 0}
.pk-goal{position:relative;height:120px;border:4px solid #f4f0ff;border-bottom:0;border-radius:6px 6px 0 0;background:repeating-linear-gradient(90deg,#ffffff10 0 12px,transparent 12px 24px),repeating-linear-gradient(0deg,#ffffff10 0 12px,transparent 12px 24px);max-width:360px;margin:8px auto 0;overflow:hidden}
.pk-keeper,.pk-ball{position:absolute;bottom:6px;font-size:40px;line-height:1;transition:left .45s ease}
.pk-keeper{left:calc(50% - 20px)}
.pk-ball{font-size:26px;left:calc(50% - 13px);bottom:-40px;transition:left .45s ease,bottom .45s ease}
.pk-shots{display:flex;gap:6px;justify-content:center;margin:8px 0;font-size:1.3rem}
.pk-msg{text-align:center;font-weight:700;min-height:1.5em}
@media (prefers-reduced-motion:reduce){.pk-keeper,.pk-ball{transition:none}}
`,
  js: function (el, G) {
    var D = G.D;
    // Hidden "true" rules for each level (w1, w2, b). All reachable with the sliders.
    var RULES = [[1, 0, 0], [0, -1, 0], [1, 1, -0.5], [2, -1, 0], [1, -1, 1]];
    var CLUES = [['Hips point', 'left ← → right'], ['Eyes look', 'left ← → right']];
    var lives = 3, score = 0, level = 1, w = [0, 0, 0], train;
    function z(p, v) { return v[0] * p[0] + v[1] * p[1] + v[2]; }
    function side(p, v) { return z(p, v) > 0 ? 1 : -1; }
    function points(n, margin) {
      var r = RULES[level - 1], norm = Math.sqrt(r[0] * r[0] + r[1] * r[1]), out = [], guard = 0;
      while (out.length < n && guard++ < 5000) {
        var p = [Math.round((Math.random() * 2 - 1) * 10) / 10, Math.round((Math.random() * 2 - 1) * 10) / 10];
        if (Math.abs(z(p, r)) / norm < margin) continue;
        out.push({ x: p, y: side(p, r) });
      }
      var R = out.filter(function (q) { return q.y > 0; }).length;
      if (R < 2 || R > n - 2) return points(n, margin);
      return out;
    }
    function acc() { return train.filter(function (q) { return side(q.x, w) === q.y; }).length; }
    function sx(v) { return 20 + (v + 1) * 110; }
    function sy(v) { return 240 - (v + 1) * 110; }
    function plot() {
      // Decision line w1*x + w2*y + b = 0, clipped to the plot square.
      var line = '';
      if (w[0] || w[1]) {
        var pts = [];
        [-1, 1].forEach(function (x) { if (w[1]) { var y = -(w[0] * x + w[2]) / w[1]; if (y >= -1 && y <= 1) pts.push([x, y]); } });
        [-1, 1].forEach(function (y) { if (w[0]) { var x = -(w[1] * y + w[2]) / w[0]; if (x >= -1 && x <= 1) pts.push([x, y]); } });
        if (pts.length >= 2) line = '<line x1="' + sx(pts[0][0]) + '" y1="' + sy(pts[0][1]) + '" x2="' + sx(pts[1][0]) + '" y2="' + sy(pts[1][1]) + '" stroke="#ffd23f" stroke-width="3" stroke-dasharray="6 4"/>';
      }
      // Shade the "dive RIGHT" half of the square (clip the square against the boundary line).
      var sq = [[-1, -1], [1, -1], [1, 1], [-1, 1]], poly = [];
      sq.forEach(function (a, i) {
        var b = sq[(i + 1) % 4], za = z(a, w), zb = z(b, w);
        if (za > 0) poly.push(a);
        if ((za > 0) !== (zb > 0)) { var t = za / (za - zb); poly.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
      });
      var cells = poly.length > 2 ? '<polygon points="' + poly.map(function (p) { return sx(p[0]) + ',' + sy(p[1]); }).join(' ') + '" fill="#ff5edb" opacity=".16"/>' : '';
      var dots = train.map(function (q) {
        var ok = side(q.x, w) === q.y;
        return '<g><circle cx="' + sx(q.x[0]) + '" cy="' + sy(q.x[1]) + '" r="11" fill="' + (q.y > 0 ? '#ff5edb' : '#5ef2ff') + '" stroke="' + (ok ? '#0b0620' : '#ffffff') + '" stroke-width="' + (ok ? 2 : 3) + '"/><text x="' + sx(q.x[0]) + '" y="' + (sy(q.x[1]) + 5) + '" text-anchor="middle" font-size="14" font-weight="900" fill="#0b0620">' + (q.y > 0 ? 'R' : 'L') + '</text></g>';
      }).join('');
      return '<svg viewBox="4 0 252 262" role="img" aria-label="Past shots plotted by hips (across) and eyes (up). ' + acc() + ' of ' + train.length + ' predicted correctly."><rect x="20" y="20" width="220" height="220" fill="none" stroke="#ffffff33"/>' + cells +
        '<line x1="130" y1="20" x2="130" y2="240" stroke="#ffffff22"/><line x1="20" y1="130" x2="240" y2="130" stroke="#ffffff22"/>' + line + dots +
        '<text x="130" y="14" text-anchor="middle" font-size="10" fill="#c3b8ea">eyes look right ↑</text><text x="22" y="258" font-size="10" fill="#c3b8ea">← hips left</text><text x="240" y="258" text-anchor="end" font-size="10" fill="#c3b8ea">hips right →</text></svg>';
    }
    function tune() {
      train = points(10, 0.15);
      w = [0, 0, 0];
      el.__sol = RULES[level - 1];
      G.hud({ score: score, level: level, lives: lives });
      el.innerHTML = '<div class="pk-wrap"><div><div class="pk-plot" id="pk-plot">' + plot() + '</div><p class="pk-legend"><b>R</b>/<b>L</b> dots = where past shots went. Pink shading = where your neuron dives RIGHT. The yellow dashed line is its decision boundary. White-ringed dots are wrong.</p></div>' +
        '<div class="pk-sl"><p><b>Level ' + level + ':</b> set the weights so the neuron predicts the past shots.</p>' +
        [['w1', 'Weight for “' + CLUES[0][0] + '”'], ['w2', 'Weight for “' + CLUES[1][0] + '”'], ['b', 'Bias']].map(function (s, i) { return '<label>' + s[1] + ' <output id="pk-o' + i + '">0</output><input type="range" id="pk-' + s[0] + '" min="-3" max="3" step="0.5" value="0"></label>'; }).join('') +
        '<p class="pk-acc" aria-live="polite" id="pk-acc"></p><button type="button" class="btn primary" id="pk-go">⚽ Face 5 kicks</button></div></div>';
      function upd() {
        ['w1', 'w2', 'b'].forEach(function (k, i) { w[i] = +D.$('#pk-' + k, el).value; D.$('#pk-o' + i, el).textContent = w[i]; });
        D.$('#pk-plot', el).innerHTML = plot();
        var a = acc();
        D.$('#pk-acc', el).textContent = 'Past shots predicted: ' + a + ' / ' + train.length + (a === train.length ? ' 🎯 Perfect fit!' : '');
      }
      D.$all('input[type=range]', el).forEach(function (r) { r.addEventListener('input', upd); });
      upd();
      D.$('#pk-go', el).addEventListener('click', kicks);
    }
    function kicks() {
      var tests = points(5, 0.25), n = 0, saves = 0;
      el.innerHTML = '<p class="pk-msg" aria-live="polite">Here they come…</p><div class="pk-goal" aria-hidden="true"><span class="pk-keeper">🧤</span><span class="pk-ball">⚽</span></div><div class="pk-shots" aria-label="Kick results"></div>';
      var keeper = D.$('.pk-keeper', el), ball = D.$('.pk-ball', el), msg = D.$('.pk-msg', el), shots = D.$('.pk-shots', el);
      function one() {
        if (!el.isConnected) return;
        if (n >= 5) return after();
        var t = tests[n++], dive = side(t.x, w), saved = dive === t.y;
        keeper.style.left = 'calc(50% - 20px)'; ball.style.left = 'calc(50% - 13px)'; ball.style.bottom = '-40px';
        msg.textContent = 'Kick ' + n + ': hips ' + (t.x[0] > 0 ? 'right' : 'left') + ' (' + t.x[0] + '), eyes ' + (t.x[1] > 0 ? 'right' : 'left') + ' (' + t.x[1] + ')';
        setTimeout(function () {
          keeper.style.left = dive > 0 ? 'calc(78% - 20px)' : 'calc(22% - 20px)';
          ball.style.left = t.y > 0 ? 'calc(80% - 13px)' : 'calc(20% - 13px)'; ball.style.bottom = '40px';
          setTimeout(function () {
            if (saved) { saves++; score += 10; D.sfx('good'); } else D.sfx('bad');
            shots.insertAdjacentHTML('beforeend', '<span role="img" aria-label="' + (saved ? 'saved' : 'goal') + '">' + (saved ? '🧤' : '🥅') + '</span>');
            msg.textContent += saved ? ' → SAVED!' : ' → goal…';
            G.hud({ score: score });
            setTimeout(one, 900);
          }, 550);
        }, 500);
      }
      function after() {
        if (saves >= 4) {
          score += 20; G.hud({ score: score });
          if (level >= 5) return G.end(score, true, 'Five levels of perfectly tuned weights. You trained a neuron by hand!');
          msg.innerHTML = '🧤 ' + saves + '/5 saved! Your neuron generalized to NEW shots. Next level has a new shooter…';
          level++; setTimeout(tune, 2000);
        } else {
          lives--; G.hud({ lives: lives });
          if (lives <= 0) return G.end(score, false, 'Tip: get the past-shots score to ' + train.length + '/' + train.length + ' before facing the kicks. Try one slider at a time and watch the yellow line move.');
          msg.innerHTML = 'Only ' + saves + '/5 saved. Re-tune and try again (new shots, same shooter).';
          var b = document.createElement('p'); b.style.textAlign = 'center';
          b.innerHTML = '<button type="button" class="btn primary" id="pk-retry">🔧 Re-tune</button>';
          el.appendChild(b);
          var keep = w.slice();
          D.$('#pk-retry', el).addEventListener('click', function () { var tr = train; tune(); train = tr; setW(keep); });
        }
      }
      one();
    }
    function setW(v) { ['w1', 'w2', 'b'].forEach(function (k, i) { var r = D.$('#pk-' + k, el); r.value = v[i]; r.dispatchEvent(new Event('input')); }); }
    tune();
  },
};
