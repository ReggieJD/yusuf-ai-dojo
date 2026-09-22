module.exports = {
  hook: 'Nobody gives this little ninja a map. It explores, bumps into walls, falls into pits, and slowly learns the way to the sacred scroll.',
  story: [
    ['sensei', 'How did you learn to ride a bike, {{nick}}? Nobody gave you a formula. You tried, wobbled, fell, and got better.'],
    ['sensei', 'That’s <b>reinforcement learning</b>. An <b>agent</b> tries actions and gets <b>rewards</b> (good!) or <b>penalties</b> (ouch!). Over many tries, it learns which moves lead to the best rewards.'],
    ['you', 'So it learns from its own mistakes?'],
    ['sensei', 'Exactly. Our apprentice gets <b>+10</b> for reaching the scroll 📜, <b>−10</b> for a pit 🕳️, and <b>−1</b> for every step, so it learns to hurry. Each square keeps a score for each direction. Those scores are its memory. Train it!'],
  ],
  activity: {
    title: 'Train the Apprentice',
    instructions: 'Press “Train 1 try” to watch one attempt, or “Train 50 tries” to speed things up. Arrows show what the apprentice has learned. Keep training until its best path is the SHORTEST path.',
    css: `
.mz{display:grid;gap:12px}
@media(min-width:700px){.mz{grid-template-columns:auto 1fr}}
.mz-grid{display:grid;grid-template-columns:repeat(6,50px);grid-template-rows:repeat(6,50px);gap:3px;background:#1d0f33;padding:4px;border-radius:14px;box-shadow:0 0 0 3px #b983ff}
@media(max-width:400px){.mz-grid{grid-template-columns:repeat(6,46px);grid-template-rows:repeat(6,46px)}}
.mz-grid span{border-radius:8px;display:grid;place-items:center;font-size:1.3rem;position:relative;font-weight:900;color:#1d0f33}
.mz-grid .wall{background:#4b3a66!important}
.mz-grid .me{outline:3px solid #ffd23f;outline-offset:-3px}
.mz-grid .path{box-shadow:inset 0 0 0 3px #16a36b}
.mz-stats{display:flex;gap:10px;flex-wrap:wrap;font-weight:800;margin:6px 0}
.mz-chart{background:#fff;border-radius:12px;border:2px solid #1d0f3322;padding:6px}
.mz-chart svg{width:100%;height:auto;display:block}
.mz-q{background:var(--bg2);border-radius:14px;padding:10px 12px;margin-top:10px}
.mz-q .row button{flex:1 1 150px}
`,
    js: function (el, api) {
      var D = api.D, W = 6, H = 6, START = [0, 5], GOAL = [5, 0];
      var WALL = { '1,3': 1, '2,3': 1, '3,3': 1, '4,3': 1, '2,1': 1, '3,1': 1, '4,1': 1, '5,1': 1 }, PIT = { '1,2': 1, '3,4': 1, '4,2': 1 };
      var MOVES = [[0, -1], [1, 0], [0, 1], [-1, 0]], ARR = ['↑', '→', '↓', '←'];
      var S = api.load(), Q = S.Q || {}, eps = S.eps || 0, hist = S.hist || [], asked = !!S.asked, busy = false;
      function key(p) { return p[0] + ',' + p[1]; }
      function q(p) { var k = key(p); return Q[k] || (Q[k] = [0, 0, 0, 0]); }
      function stepFrom(p, a) {
        var n = [p[0] + MOVES[a][0], p[1] + MOVES[a][1]];
        if (n[0] < 0 || n[1] < 0 || n[0] >= W || n[1] >= H || WALL[key(n)]) return { p: p, r: -1, end: false };
        if (PIT[key(n)]) return { p: n, r: -10, end: true };
        if (n[0] === GOAL[0] && n[1] === GOAL[1]) return { p: n, r: 10, end: true };
        return { p: n, r: -1, end: false };
      }
      function best(p) { var v = q(p), m = Math.max.apply(null, v), c = []; v.forEach(function (x, i) { if (x === m) c.push(i); }); return c[Math.floor(Math.random() * c.length)]; }
      function episode(record) {
        var p = START.slice(), path = [p], steps = 0, e = Math.max(0.05, 0.4 * Math.pow(0.985, eps));
        while (steps < 100) {
          var a = Math.random() < e ? Math.floor(Math.random() * 4) : best(p), res = stepFrom(p, a), qq = q(p);
          var target = res.r + (res.end ? 0 : 0.9 * Math.max.apply(null, q(res.p)));
          qq[a] += 0.5 * (target - qq[a]); p = res.p; steps++; if (record) path.push(p);
          if (res.end) break;
        }
        eps++; hist.push(steps); if (hist.length > 120) hist.shift();
        return path;
      }
      function greedyPath() { var p = START.slice(), seen = {}, path = [p]; for (var i = 0; i < 40; i++) { var v = Q[key(p)]; if (!v) return null; var a = v.indexOf(Math.max.apply(null, v)); var r = stepFrom(p, a); if (r.p === p || seen[key(r.p)]) return null; seen[key(r.p)] = 1; p = r.p; path.push(p); if (r.end) return PIT[key(p)] ? null : path; } return null; }
      function shortest() { var qd = [[START, 0]], seen = {}; seen[key(START)] = 1; while (qd.length) { var c = qd.shift(); if (c[0][0] === GOAL[0] && c[0][1] === GOAL[1]) return c[1]; MOVES.forEach(function (m) { var n = [c[0][0] + m[0], c[0][1] + m[1]]; if (n[0] < 0 || n[1] < 0 || n[0] >= W || n[1] >= H || WALL[key(n)] || PIT[key(n)] || seen[key(n)]) return; seen[key(n)] = 1; qd.push([n, c[1] + 1]); }); } return -1; }
      var SHORT = shortest();
      el.innerHTML = '<div class="mz"><div><div class="mz-grid" id="mz-g" role="img"></div></div><div><div class="row"><button type="button" class="btn primary" id="mz-1">👣 Train 1 try</button><button type="button" class="btn" id="mz-50">⏩ Train 50 tries</button><button type="button" class="btn small" id="mz-r">↺ Forget everything</button></div><div class="mz-stats" id="mz-s" aria-live="polite"></div><div class="mz-chart" id="mz-c"></div><div class="mz-q" id="mz-q" aria-live="polite"></div></div></div>';
      function draw(me, trail) {
        var gp = greedyPath(), onPath = {}; (gp || []).forEach(function (p) { onPath[key(p)] = 1; });
        var allV = Object.keys(Q).map(function (k) { return Math.max.apply(null, Q[k]); }), hi = Math.max.apply(null, allV.concat([1])), lo = Math.min.apply(null, allV.concat([-1]));
        var h = '';
        for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) {
          var k = x + ',' + y, cls = [], c = '', bg = '#fbf7ff';
          if (WALL[k]) cls.push('wall');
          else if (PIT[k]) c = '🕳️';
          else if (x === GOAL[0] && y === GOAL[1]) c = '📜';
          else if (Q[k]) { var v = Q[k], m = Math.max.apply(null, v), t = (m - lo) / (hi - lo || 1); bg = 'hsl(' + Math.round(10 + t * 120) + ',70%,' + Math.round(88 - t * 18) + '%)'; if (v.some(function (z) { return z !== 0; })) c = ARR[v.indexOf(m)]; }
          if (x === START[0] && y === START[1] && !c) c = '🏁';
          if (me && me[0] === x && me[1] === y) { c = D.esc(D.avatar()); cls.push('me'); }
          if (onPath[k]) cls.push('path');
          h += '<span class="' + cls.join(' ') + '" style="' + (WALL[k] ? '' : 'background:' + bg) + '">' + c + '</span>';
        }
        var g = D.$('#mz-g', el); g.innerHTML = h;
        g.setAttribute('aria-label', 'Maze. ' + (gp ? 'The apprentice’s best path reaches the scroll in ' + (gp.length - 1) + ' steps.' : 'The apprentice has not found a safe path yet.'));
        var recent = hist.slice(-20);
        D.$('#mz-s', el).innerHTML = '<span>🎯 Tries: ' + eps + '</span><span>👣 Last try: ' + (hist.length ? hist[hist.length - 1] : '–') + ' steps</span><span>🧭 Best path: ' + (gp ? (gp.length - 1) + ' steps' : 'not yet') + '</span><span>🏆 Shortest possible: ' + SHORT + '</span>';
        var CW = 260, CH = 90, mx = Math.max.apply(null, hist.concat([20]));
        D.$('#mz-c', el).innerHTML = '<svg viewBox="0 0 ' + CW + ' ' + CH + '" role="img" aria-label="Steps per try over time"><text x="6" y="12" font-size="10" fill="#4e3d6b" font-weight="700">Steps per try (lower = smarter)</text>' + (hist.length > 1 ? '<polyline fill="none" stroke="#7b2ff7" stroke-width="2" points="' + hist.map(function (v, i) { return (6 + i / (hist.length - 1) * (CW - 12)).toFixed(1) + ',' + (CH - 6 - v / mx * (CH - 22)).toFixed(1); }).join(' ') + '"/>' : '') + '</svg>';
        mission(gp);
      }
      function mission(gp) {
        var box = D.$('#mz-q', el), solved = gp && gp.length - 1 === SHORT;
        if (!solved) { box.innerHTML = '<p><b>Goal:</b> Train until the green-outlined best path is ' + SHORT + ' steps, the shortest possible.</p>'; return; }
        if (!asked) {
          box.innerHTML = '<p>✅ Shortest path learned! <b>Why did the apprentice learn to hurry instead of wandering?</b></p><div class="row">' + D.shuffle([[1, 'Every step cost −1, so shorter paths earned more total reward'], [0, 'Someone programmed the path'], [0, 'It got bored']]).map(function (o) { return '<button type="button" class="btn small" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p>';
          D.$all('[data-ok]', box).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-ok') === '1') { asked = true; api.save({ asked: true }); D.sfx('win'); mission(gp); } else { D.sfx('bad'); b.disabled = true; box.querySelector('.feedback').className = 'feedback no'; box.querySelector('.feedback').textContent = 'Look at the rewards again: +10, −10, and −1 per step.'; } }); });
          return;
        }
        box.innerHTML = '<p class="feedback ok">🏆 Your apprentice learned the maze through pure trial and error, with no map and no rules. This same idea helped AIs master games like Go, and helps robots learn to walk.</p>'; api.done();
      }
      function persist() { api.save({ Q: Q, eps: eps, hist: hist }); }
      D.$('#mz-1', el).addEventListener('click', function () {
        if (busy) return; busy = true; var path = episode(true), i = 0; D.sfx('step');
        (function anim() { draw(path[i]); i++; if (i < path.length) setTimeout(anim, D.reducedMotion() ? 10 : 90); else { busy = false; persist(); draw(); } })();
      });
      D.$('#mz-50', el).addEventListener('click', function () { if (busy) return; for (var i = 0; i < 50; i++) episode(false); persist(); D.sfx('click'); draw(); });
      D.$('#mz-r', el).addEventListener('click', function () { if (busy) return; Q = {}; eps = 0; hist = []; asked = false; api.save({ Q: Q, eps: 0, hist: [], asked: false }); draw(); });
      draw();
    },
  },
  quiz: [
    { q: 'What is reinforcement learning?', a: ['Learning by trial and error, using rewards and penalties', 'Memorizing a map', 'Copying labeled examples', 'Deleting bad data'], c: 0, why: 'Try, get feedback, improve.' },
    { q: 'At the start, the apprentice wandered randomly. Why?', a: ['It hadn’t learned anything yet, so exploring was the only way to discover rewards', 'It was broken', 'The maze moved', 'It was programmed to be lost'], c: 0, why: 'No experience = no knowledge. It had to explore.' },
    { q: 'What were the arrows on the squares?', a: ['The direction the apprentice learned is best from each square', 'Wind', 'Decoration', 'The walls'], c: 0, why: 'They show its learned scores (its memory).' },
    { q: 'What real achievement used reinforcement learning?', a: ['AlphaGo learning to beat top Go players', 'Calculators adding numbers', 'Light switches', 'Printing books'], c: 0, why: 'AlphaGo combined neural networks, search and reinforcement learning.' },
  ],
  challenge: {
    title: 'Reward Design',
    intro: 'The rewards you choose shape what an agent learns. Sometimes in surprising ways! Get 3 of 4.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'If steps cost NOTHING (0 instead of −1), what might happen?', a: ['The agent may not bother taking the shortest path', 'It learns faster, always', 'It stops moving', 'Nothing changes at all'], c: 0, why: 'Without a cost for time, there’s less reason to hurry.' },
        { q: 'A boat-racing AI earns points for hitting targets along the course. What might it learn?', a: ['To circle around hitting the same targets over and over instead of finishing the race', 'To always finish first', 'To stop playing', 'To delete the targets'], c: 0, why: 'This really happened in a well-known experiment. Agents do what’s rewarded, not what you meant.' },
        { q: 'Why add a big penalty for pits?', a: ['So the agent learns to avoid dangerous squares', 'To make it faster at falling', 'Pits give points', 'No reason'], c: 0, why: 'Penalties teach “don’t go there.”' },
        { q: 'What’s the big lesson for AI builders?', a: ['Design rewards carefully, because the AI optimizes exactly what you reward', 'Rewards don’t matter', 'Always use huge rewards', 'Let the AI choose its own rewards'], c: 0, why: 'Getting goals right is a key part of AI safety.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
