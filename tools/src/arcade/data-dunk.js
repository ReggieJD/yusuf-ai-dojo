module.exports = {
  how: 'A chart appears with a shot clock. Read it and pick the right answer before time runs out. Every 2 correct answers moves you up a level and makes the clock faster. Get 10 right to win. You have 3 lives.',
  connect: 'AI runs on <b>data</b>, and people who build AI read charts all day: which group is biggest, how far apart two numbers are, whether results are fair. Reading a chart quickly and <i>correctly</i> is a real data-science skill.',
  css: `
.dd-q{font-weight:800;font-size:1.05rem;margin:8px 0}
.dd-chart{background:#0b0620;border-radius:12px;padding:10px 12px}
.dd-chart h3{margin:0 0 8px;font-size:.9rem;color:#c3b8ea}
.dd-bar{display:grid;grid-template-columns:84px 1fr;gap:8px;align-items:center;margin:6px 0}
.dd-bar span{font-weight:700;font-size:.9rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dd-track{position:relative;height:22px}
.dd-fill{height:22px;border-radius:0 4px 4px 0;background:#5ef2ff}
.dd-val{position:absolute;top:1px;font:800 .85rem ui-monospace,Menlo,monospace;color:#f4f0ff;padding-left:6px}
.dd-clock{height:10px;border-radius:5px;background:#1c1240;overflow:hidden;margin:10px 0}
.dd-clock i{display:block;height:100%;background:#ff5edb;width:100%}
.dd-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.dd-opts button{min-height:48px}
.dd-msg{min-height:1.5em;font-weight:700;margin-top:8px}
`,
  js: function (el, G) {
    var D = G.D, T = G.T;
    var SETS = [
      { title: 'Points scored this season', names: ['Tigers', 'Hawks', 'Sharks', 'Wolves', 'Comets'], unit: 'pts' },
      { title: 'Chess games won this month', names: ['Knights', 'Rooks', 'Bishops', 'Pawns', 'Queens'], unit: 'wins' },
      { title: 'Minutes of training this week', names: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], unit: 'min' },
      { title: 'Goals scored this season', names: ['Red FC', 'Blue FC', 'Gold FC', 'Green FC', 'Star FC'], unit: 'goals' },
      { title: 'Apps built at the AI club', names: ['Games', 'Quizzes', 'Timers', 'Scoreboards', 'Flashcards'], unit: 'apps' },
    ];
    var lives = 3, score = 0, level = 1, right = 0, timer = null;
    function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
    function uniqueVals(n, lo, hi) { var s = {}; var out = []; while (out.length < n) { var v = rnd(lo, hi); if (!s[v]) { s[v] = 1; out.push(v); } } return out; }
    function numOpts(ans, spread) {
      var o = [ans], guard = 0;
      while (o.length < 4 && guard++ < 100) { var v = ans + rnd(-spread, spread); if (v >= 0 && o.indexOf(v) < 0) o.push(v); }
      while (o.length < 4) o.push(ans + o.length * 3);
      return D.shuffle(o);
    }
    function question() {
      var set = SETS[rnd(0, SETS.length - 1)];
      var n = Math.min(3 + Math.floor(level / 2), 5);
      var names = set.names.slice(0, n), vals = uniqueVals(n, 3, 40);
      var kinds = ['max', 'min'];
      if (level >= 2) kinds.push('diff');
      if (level >= 3) kinds.push('total');
      if (level >= 4) kinds.push('rank2');
      var k = kinds[rnd(0, kinds.length - 1)], q, opts, ans;
      var sorted = vals.map(function (v, i) { return [v, i]; }).sort(function (a, b) { return b[0] - a[0]; });
      if (k === 'max') { q = 'Which one is the HIGHEST?'; ans = names[sorted[0][1]]; opts = D.shuffle(names.slice()).slice(0, 4); if (opts.indexOf(ans) < 0) opts[0] = ans; }
      else if (k === 'min') { q = 'Which one is the LOWEST?'; ans = names[sorted[n - 1][1]]; opts = D.shuffle(names.slice()).slice(0, 4); if (opts.indexOf(ans) < 0) opts[0] = ans; }
      else if (k === 'rank2') { q = 'Which one is in SECOND place?'; ans = names[sorted[1][1]]; opts = D.shuffle(names.slice()).slice(0, 4); if (opts.indexOf(ans) < 0) opts[0] = ans; }
      else if (k === 'diff') { var a = sorted[0], b = sorted[n - 1]; q = 'How many more ' + set.unit + ' does ' + names[a[1]] + ' have than ' + names[b[1]] + '?'; ans = a[0] - b[0]; opts = numOpts(ans, 6); }
      else { var t = vals.reduce(function (s, v) { return s + v; }, 0); q = 'What is the TOTAL of all the bars?'; ans = t; opts = numOpts(ans, 12); }
      opts = D.shuffle(opts);
      return { set: set, names: names, vals: vals, q: q, ans: ans, opts: opts };
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function next() {
      stop();
      if (!el.isConnected) return;
      var Q = question(), max = Math.max.apply(null, Q.vals);
      var secs = [15, 13, 11, 9, 8][Math.min(level, 5) - 1], t0 = Date.now(), done = false;
      el.__ans = Q.opts.indexOf(Q.ans);
      G.hud({ score: score, level: level, lives: lives });
      el.innerHTML = '<div class="dd-chart" role="img" aria-label="' + Q.set.title + ': ' + Q.names.map(function (nm, i) { return nm + ' ' + Q.vals[i]; }).join(', ') + '"><h3>' + T.emoji + ' ' + Q.set.title + '</h3>' +
        Q.names.map(function (nm, i) { var w = Math.round(Q.vals[i] / max * 78); return '<div class="dd-bar"><span>' + nm + '</span><div class="dd-track"><div class="dd-fill" style="width:' + w + '%"></div><span class="dd-val" style="left:' + w + '%">' + Q.vals[i] + '</span></div></div>'; }).join('') +
        '</div><div class="dd-clock" aria-hidden="true"><i></i></div><p class="dd-q">' + Q.q + '</p><div class="dd-opts">' + Q.opts.map(function (o, i) { return '<button type="button" class="btn" data-i="' + i + '">' + o + '</button>'; }).join('') + '</div><p class="dd-msg" aria-live="polite"></p>';
      var bar = D.$('.dd-clock i', el), msg = D.$('.dd-msg', el);
      function finish(ok, why) {
        if (done) return; done = true; stop();
        D.$all('.dd-opts button', el).forEach(function (b) { b.disabled = true; if (+b.getAttribute('data-i') === el.__ans) b.classList.add('primary'); });
        if (ok) {
          var bonus = Math.max(0, Math.round(secs - (Date.now() - t0) / 1000));
          score += 10 + bonus; right++; D.sfx('good'); msg.textContent = '🏀 Swish! +' + (10 + bonus) + (bonus ? ' (time bonus!)' : '');
          if (right % 2 === 0 && level < 5) level++;
        } else { lives--; D.sfx('bad'); msg.textContent = why + ' The answer was ' + Q.ans + '.'; }
        G.hud({ score: score, level: level, lives: lives });
        if (right >= 10) return setTimeout(function () { G.end(score, true, 'Ten charts, read fast and right. That’s data-scientist speed.'); }, 900);
        if (lives <= 0) return setTimeout(function () { G.end(score, false, 'Tip: find the question first, THEN scan the bars for just what it asks.'); }, 900);
        setTimeout(next, ok ? 900 : 1800);
      }
      timer = setInterval(function () {
        if (!el.isConnected) return stop();
        var left = secs - (Date.now() - t0) / 1000;
        bar.style.width = Math.max(0, left / secs * 100) + '%';
        if (left <= 0) finish(false, '⏱️ Shot clock!');
      }, 100);
      D.$all('.dd-opts button', el).forEach(function (b) {
        b.addEventListener('click', function () { finish(+b.getAttribute('data-i') === el.__ans, '❌ Airball!'); });
      });
    }
    next();
  },
};
