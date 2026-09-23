module.exports = {
  how: 'Race the 🤖 to the 🏆! Before each race, the robot practices the maze using <b>reinforcement learning</b>: more practice runs every level. Move with the arrow buttons or arrow keys. Beat the robot 5 times to win. Lose a race and you lose a life.',
  connect: 'The robot uses <b>Q-learning</b>: it tries moves, gets a small penalty for every step and a big reward at the trophy, and slowly learns which move is best from each square. With a few practice runs it wanders. With hundreds, it finds the shortest path. Reinforcement learning like this, plus huge amounts of practice, helped AIs master games like Go.',
  css: `
.mr-info{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-weight:700;margin-bottom:8px}
.mr-grid{display:grid;max-width:380px;margin:0 auto;border:3px solid #5ef2ff;border-radius:8px;overflow:hidden;background:#0b0620}
.mr-c{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:clamp(12px,4.2vw,22px);line-height:1;position:relative}
.mr-w{background:#5b3fb0;box-shadow:inset 0 0 0 1px #0b062033}
.mr-p{background:#0b0620}
.mr-trail{background:#ff5edb22}
.mr-ctl{display:grid;grid-template-columns:repeat(3,64px);grid-template-rows:repeat(2,56px);gap:6px;justify-content:center;margin-top:10px}
.mr-ctl button{font-size:1.4rem}
.mr-msg{text-align:center;font-weight:700;min-height:1.5em;margin-top:8px}
.mr-bar{height:10px;border-radius:5px;background:#1c1240;overflow:hidden;margin:6px 0}
.mr-bar i{display:block;height:100%;background:#5ef2ff;width:0}
`,
  js: function (el, G) {
    var D = G.D;
    var gen = el.__gen = (el.__gen || 0) + 1;
    function alive() { return el.__gen === gen && el.isConnected; }
    var CELLS = 6, N = CELLS * 2 + 1;
    var EPISODES = [5, 30, 45, 100, 600], STEP_MS = [650, 600, 560, 540, 500];
    var lives = 3, score = 0, level = 1, grid, me, bot, goal, racing = false, timer = null, botPath = [];
    var DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    function makeMaze() {
      var g = []; for (var y = 0; y < N; y++) { g.push([]); for (var x = 0; x < N; x++) g[y].push(1); }
      var seen = {}, stack = [[0, 0]]; seen['0,0'] = 1; g[1][1] = 0;
      while (stack.length) {
        var c = stack[stack.length - 1];
        var nb = D.shuffle(DIRS).map(function (d) { return [c[0] + d[0], c[1] + d[1], d]; }).filter(function (n) { return n[0] >= 0 && n[1] >= 0 && n[0] < CELLS && n[1] < CELLS && !seen[n[0] + ',' + n[1]]; });
        if (!nb.length) { stack.pop(); continue; }
        var n = nb[0]; seen[n[0] + ',' + n[1]] = 1;
        g[c[1] * 2 + 1 + n[2][1]][c[0] * 2 + 1 + n[2][0]] = 0; g[n[1] * 2 + 1][n[0] * 2 + 1] = 0;
        stack.push([n[0], n[1]]);
      }
      // Knock out a few extra walls so there are loops (makes wandering more tempting).
      for (var k = 0; k < 4; k++) { var yy = 1 + Math.floor(Math.random() * (N - 2)), xx = 1 + Math.floor(Math.random() * (N - 2)); if ((yy + xx) % 2 === 1) g[yy][xx] = 0; }
      return g;
    }
    function open(p) { return p[0] >= 0 && p[1] >= 0 && p[0] < N && p[1] < N && !grid[p[1]][p[0]]; }
    function key(p) { return p[0] + ',' + p[1]; }
    function bfs(from) {
      var prev = {}, q = [from]; prev[key(from)] = null;
      while (q.length) { var c = q.shift(); if (c[0] === goal[0] && c[1] === goal[1]) break; DIRS.forEach(function (d, i) { var n = [c[0] + d[0], c[1] + d[1]]; if (open(n) && !(key(n) in prev)) { prev[key(n)] = [c, i]; q.push(n); } }); }
      var path = [], k = key(goal); while (prev[k]) { path.unshift(prev[k][1]); k = key(prev[k][0]); } return path;
    }
    function train(Q, episodes) {
      var alpha = 0.5, gamma = 0.95, eps = 0.2;
      function q(s) { return Q[s] || (Q[s] = [0, 0, 0, 0]); }
      for (var e = 0; e < episodes; e++) {
        var s = [1, 1];
        for (var t = 0; t < 400; t++) {
          var qs = q(key(s)), a;
          if (Math.random() < eps) a = Math.floor(Math.random() * 4);
          else { var m = Math.max.apply(null, qs), best = [0, 1, 2, 3].filter(function (i) { return qs[i] === m; }); a = best[Math.floor(Math.random() * best.length)]; }
          var n = [s[0] + DIRS[a][0], s[1] + DIRS[a][1]], r = -1;
          if (!open(n)) { n = s; r = -2; }
          var done = n[0] === goal[0] && n[1] === goal[1]; if (done) r = 50;
          qs[a] += alpha * (r + (done ? 0 : gamma * Math.max.apply(null, q(key(n)))) - qs[a]);
          s = n; if (done) break;
        }
      }
      return Q;
    }
    function greedyPath(Q) {
      // The trained robot follows its best-known move; unexplored squares mean random guesses.
      var s = [1, 1], path = [s], visits = {};
      for (var t = 0; t < 300; t++) {
        if (s[0] === goal[0] && s[1] === goal[1]) break;
        var qs = Q[key(s)] || [0, 0, 0, 0];
        visits[key(s)] = (visits[key(s)] || 0) + 1;
        var m = Math.max.apply(null, qs), best = [0, 1, 2, 3].filter(function (i) { return qs[i] === m; });
        var a = visits[key(s)] > 2 ? Math.floor(Math.random() * 4) : best[Math.floor(Math.random() * best.length)];
        var n = [s[0] + DIRS[a][0], s[1] + DIRS[a][1]];
        if (open(n)) s = n;
        path.push(s);
      }
      return path;
    }
    function draw() {
      var h = '';
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var w = grid[y][x], t = '';
        if (x === goal[0] && y === goal[1]) t = '🏆';
        if (bot[0] === x && bot[1] === y) t = '🤖';
        if (me[0] === x && me[1] === y) t = t === '🤖' ? '<span style="font-size:.62em;letter-spacing:-.2em">🥷🤖</span>' : '🥷';
        h += '<div class="mr-c ' + (w ? 'mr-w' : 'mr-p') + '">' + t + '</div>';
      }
      D.$('.mr-grid', el).innerHTML = h;
    }
    function stop() { racing = false; if (timer) { clearInterval(timer); timer = null; } }
    function move(i) {
      if (!racing) return;
      var n = [me[0] + DIRS[i][0], me[1] + DIRS[i][1]];
      if (!open(n)) return;
      me = n; D.sfx('step'); draw();
      if (me[0] === goal[0] && me[1] === goal[1]) result(true);
    }
    function result(won) {
      stop();
      var msg = D.$('.mr-msg', el);
      if (won) {
        score += 20 + level * 10 + Math.max(0, botPath.length - bot.idx); G.hud({ score: score }); D.sfx('good');
        if (level >= 5) return setTimeout(function () { G.end(score, true, 'You beat a robot trained on ' + EPISODES[4] + ' practice runs. Humans are fast learners too!'); }, 900);
        msg.textContent = '🥷 You win the race! The robot will practice more before the next one…';
        level++; setTimeout(setup, 1800);
      } else {
        lives--; G.hud({ lives: lives }); D.sfx('bad');
        if (lives <= 0) return setTimeout(function () { G.end(score, false, 'The robot practiced ' + EPISODES[level - 1] + ' times and found a ' + (botPath.length - 1) + '-step route. Lots of practice + rewards = a strong learner.'); }, 900);
        msg.textContent = '🤖 The robot got there first. Try this level again with a new maze.';
        setTimeout(setup, 1800);
      }
    }
    function setup() {
      if (!alive()) return;
      stop();
      grid = makeMaze(); me = [1, 1]; goal = [N - 2, N - 2]; bot = [1, 1]; bot.idx = 0;
      G.hud({ score: score, level: level, lives: lives });
      el.innerHTML = '<div class="mr-info"><span>Level ' + level + ': robot practice runs: <b>' + EPISODES[level - 1] + '</b></span></div><div class="mr-bar" aria-hidden="true"><i></i></div><div class="mr-grid" style="grid-template-columns:repeat(' + N + ',1fr)" role="img" aria-label="Maze. You and the robot start top-left; the trophy is bottom-right."></div>' +
        '<div class="mr-ctl"><span></span><button type="button" class="btn" data-d="0" aria-label="Up">⬆️</button><span></span><button type="button" class="btn" data-d="3" aria-label="Left">⬅️</button><button type="button" class="btn" data-d="2" aria-label="Down">⬇️</button><button type="button" class="btn" data-d="1" aria-label="Right">➡️</button></div><p class="mr-msg" aria-live="polite">🤖 Robot is practicing…</p>';
      draw();
      D.$all('[data-d]', el).forEach(function (b) { b.addEventListener('click', function () { move(+b.getAttribute('data-d')); }); });
      // Train in small chunks so the page never freezes, and show progress.
      var Q = {}, done = 0, total = EPISODES[level - 1], bar = D.$('.mr-bar i', el);
      (function chunk() {
        if (!alive()) return;
        var k = Math.min(20, total - done);
        train(Q, k);
        done += k;
        bar.style.width = Math.round(done / total * 100) + '%';
        if (done < total) return setTimeout(chunk, 16);
        botPath = greedyPath(Q);
        el.__path = bfs([1, 1]);
        var msg = D.$('.mr-msg', el); msg.textContent = 'Ready… 3';
        var c = 3;
        var cd = setInterval(function () {
          if (!alive()) return clearInterval(cd);
          c--; if (c > 0) { msg.textContent = 'Ready… ' + c; return; }
          clearInterval(cd); msg.textContent = 'GO! 🏁'; racing = true;
          timer = setInterval(function () {
            if (!alive()) return stop();
            bot.idx = Math.min(bot.idx + 1, botPath.length - 1);
            var p = botPath[bot.idx]; bot[0] = p[0]; bot[1] = p[1]; draw();
            if (bot[0] === goal[0] && bot[1] === goal[1]) result(false);
          }, STEP_MS[level - 1]);
        }, 700);
      })();
    }
    function onKey(e) {
      if (!alive()) return document.removeEventListener('keydown', onKey);
      var m = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[e.key];
      if (m != null && racing) { e.preventDefault(); move(m); }
    }
    document.addEventListener('keydown', onKey);
    setup();
  },
};
