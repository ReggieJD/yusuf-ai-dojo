module.exports = {
  hook: '“Tell me who your neighbors are, and I’ll tell you who you are.” Classify soccer players by looking at the players most similar to them.',
  story: [
    ['sensei', 'A soccer scout sees a new player, {{nick}}. Striker or defender? The scout thinks: “Who does this player remind me of?”'],
    ['sensei', 'That’s the <b>nearest-neighbor</b> method. Put every known player on a map using their stats. A new player gets the same label as the players <b>closest</b> to them.'],
    ['you', 'What’s the k for, in “k-nearest neighbors”?'],
    ['sensei', 'k is <b>how many neighbors vote</b>. With k = 1, the single closest player decides. With k = 5, the five closest vote. Watch how that changes things!'],
  ],
  activity: {
    title: 'The Scout’s Map',
    instructions: 'Three missions: predict mystery player A, find a spot where k = 1 and k = 5 disagree, then explain why.',
    css: `
.nn-plot{background:#fff;border-radius:12px;border:2px solid #2b1a0e22;padding:6px;touch-action:manipulation}
.nn-plot svg{width:100%;height:auto;display:block;cursor:crosshair}
.nn-k{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:10px 0}
.nn-k button{min-width:56px;min-height:44px;border-radius:10px;border:2px solid #2b1a0e;background:#fff;font:800 1rem var(--font-body);cursor:pointer;color:#2b1a0e}
.nn-k button[aria-pressed="true"]{background:#e8590c;color:#fff}
.nn-pred{font-weight:800;font-size:1.05rem}
.nn-task{background:var(--bg2);border-radius:12px;padding:12px;margin-top:10px}
.nn-task .row button{flex:1 1 130px}
`,
    js: function (el, api) {
      var D = api.D;
      var PTS = [[5, 1, 'S'], [4.5, 0.5, 'S'], [4, 1.5, 'S'], [5.5, 2, 'S'], [3.5, 1, 'S'], [4.8, 2.6, 'S'], [2.2, 3.6, 'S'],
        [1, 5, 'D'], [0.5, 4, 'D'], [1.5, 5.5, 'D'], [2, 4.5, 'D'], [1, 3.5, 'D'], [2.5, 5, 'D'], [1.6, 2.9, 'D']];
      var S = api.load(), step = S.step || 0, k = S.k || 1, M = S.m || [4.2, 1.2];
      var W = 320, H = 270, X = function (v) { return 34 + v / 6 * (W - 48); }, Y = function (v) { return H - 32 - v / 6 * (H - 48); };
      function near(p, kk) { return PTS.map(function (q, i) { return { i: i, d: Math.hypot(q[0] - p[0], q[1] - p[1]), c: q[2] }; }).sort(function (a, b) { return a.d - b.d; }).slice(0, kk); }
      function vote(p, kk) { var n = near(p, kk), s = n.filter(function (x) { return x.c === 'S'; }).length; return s * 2 > n.length ? 'S' : 'D'; }
      var NAME = { S: '⚽ Striker', D: '🛡️ Defender' };
      el.innerHTML = '<div class="nn-plot" id="nn-plot"></div><div class="nn-k" role="group" aria-label="How many neighbors vote">k = ' + [1, 3, 5].map(function (v) { return '<button type="button" data-k="' + v + '" aria-pressed="' + (v === k) + '">' + v + '</button>'; }).join('') + '<span class="nn-pred" id="nn-pred" aria-live="polite"></span></div><div class="nn-task" id="nn-task" aria-live="polite"></div>';
      function draw() {
        var n = near(M, k);
        var lines = n.map(function (x) { var q = PTS[x.i]; return '<line x1="' + X(M[0]) + '" y1="' + Y(M[1]) + '" x2="' + X(q[0]) + '" y2="' + Y(q[1]) + '" stroke="#e8590c" stroke-width="2" stroke-dasharray="4 3"/>'; }).join('');
        var dots = PTS.map(function (q) { return q[2] === 'S' ? '<circle cx="' + X(q[0]) + '" cy="' + Y(q[1]) + '" r="8" fill="#1c5d99"/><text x="' + X(q[0]) + '" y="' + (Y(q[1]) + 4) + '" font-size="10" text-anchor="middle" fill="#fff">S</text>' : '<rect x="' + (X(q[0]) - 8) + '" y="' + (Y(q[1]) - 8) + '" width="16" height="16" rx="3" fill="#6b4a33"/><text x="' + X(q[0]) + '" y="' + (Y(q[1]) + 4) + '" font-size="10" text-anchor="middle" fill="#fff">D</text>'; }).join('');
        var ticks = [0, 2, 4, 6].map(function (v) { return '<text x="' + X(v) + '" y="' + (H - 16) + '" font-size="10" text-anchor="middle" fill="#6b4a33">' + v + '</text><text x="26" y="' + (Y(v) + 3) + '" font-size="10" text-anchor="end" fill="#6b4a33">' + v + '</text>'; }).join('');
        D.$('#nn-plot', el).innerHTML = '<svg id="nn-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Map of players: shots per game across, tackles per game up. Blue circles are strikers, brown squares are defenders. The mystery player is at ' + M[0].toFixed(1) + ' shots, ' + M[1].toFixed(1) + ' tackles."><rect x="' + X(0) + '" y="' + Y(6) + '" width="' + (X(6) - X(0)) + '" height="' + (Y(0) - Y(6)) + '" fill="#fffaf4" stroke="#2b1a0e22"/>' + ticks + lines + dots +
          '<g><circle cx="' + X(M[0]) + '" cy="' + Y(M[1]) + '" r="11" fill="#ffd23f" stroke="#2b1a0e" stroke-width="2"/><text x="' + X(M[0]) + '" y="' + (Y(M[1]) + 5) + '" font-size="13" text-anchor="middle" font-weight="900">?</text></g>' +
          '<text x="' + (W / 2 + 10) + '" y="' + (H - 2) + '" font-size="11" text-anchor="middle" font-weight="700" fill="#2b1a0e">⚽ Shots per game →</text><text x="10" y="' + (H / 2) + '" font-size="11" text-anchor="middle" font-weight="700" fill="#2b1a0e" transform="rotate(-90 10 ' + (H / 2) + ')">🛡️ Tackles per game →</text></svg>';
        D.$('#nn-pred', el).textContent = (step >= 1 ? 'Prediction with k=' + k + ': ' + NAME[vote(M, k)] : '');
        D.$('#nn-svg', el).addEventListener('click', function (e) {
          if (step < 1) return;
          var r = e.currentTarget.getBoundingClientRect(), sx = (e.clientX - r.left) / r.width * W, sy = (e.clientY - r.top) / r.height * H;
          M = [Math.max(0, Math.min(6, (sx - 34) / (W - 48) * 6)), Math.max(0, Math.min(6, (H - 32 - sy) / (H - 48) * 6))];
          api.save({ m: M }); draw(); if (step === 1) checkDisagree();
        });
      }
      function checkDisagree() {
        var a = vote(M, 1), b = vote(M, 5), box = D.$('#nn-task', el);
        var f = box.querySelector('.feedback');
        if (a !== b) { D.sfx('win'); step = 2; api.save({ step: 2 }); f.className = 'feedback ok'; f.innerHTML = '✅ Found one! k=1 says ' + NAME[a] + ' but k=5 says ' + NAME[b] + '. One unusual player nearby swings k=1, while five voters outvote it.'; setTimeout(task, 1800); }
        else { f.className = 'feedback'; f.textContent = 'Here, k=1 and k=5 both say ' + NAME[a] + '. Keep hunting — try near the odd striker hiding among the defenders.'; }
      }
      function task() {
        var box = D.$('#nn-task', el);
        if (step === 0) {
          box.innerHTML = '<p><b>Mission 1:</b> Mystery player A takes <b>4.2 shots</b> and makes <b>1.2 tackles</b> per game (the yellow “?”). Look at the neighbors. What are they?</p><div class="row">' + D.shuffle(['S', 'D']).map(function (c) { return '<button type="button" class="btn small" data-c="' + c + '">' + NAME[c] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p>';
          D.$all('[data-c]', box).forEach(function (b) { b.addEventListener('click', function () { var f = box.querySelector('.feedback'); if (b.getAttribute('data-c') === 'S') { D.sfx('good'); f.className = 'feedback ok'; f.textContent = '✅ All the closest players are strikers, so A is labeled a striker.'; step = 1; api.save({ step: 1 }); draw(); setTimeout(task, 1500); } else { D.sfx('bad'); b.disabled = true; f.className = 'feedback no'; f.textContent = 'Look at the dashed line: who is closest to the “?”'; } }); });
        } else if (step === 1) {
          box.innerHTML = '<p><b>Mission 2:</b> Tap anywhere on the map to move the mystery player. Switch between k=1 and k=5. Find a spot where they give <b>different</b> answers!</p><p class="feedback" aria-live="polite"></p>';
        } else if (step === 2) {
          box.innerHTML = '<p><b>Mission 3:</b> Why is k=5 often safer than k=1?</p><div class="row">' + D.shuffle([[1, 'One weird example can’t decide everything by itself'], [0, 'Bigger numbers are always better'], [0, 'k=5 is faster to calculate']]).map(function (o) { return '<button type="button" class="btn small" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p>';
          D.$all('[data-ok]', box).forEach(function (b) { b.addEventListener('click', function () { var f = box.querySelector('.feedback'); if (b.getAttribute('data-ok') === '1') { D.sfx('win'); step = 3; api.save({ step: 3 }); task(); } else { D.sfx('bad'); b.disabled = true; f.className = 'feedback no'; f.textContent = 'Think about that odd striker hiding among the defenders.'; } }); });
        } else { box.innerHTML = '<p class="feedback ok">🏆 Scout certified! With more voters, one unusual example can’t fool the model as easily. (But make k too big and far-away players get a vote too. Balance again!)</p>'; api.done(); }
      }
      D.$all('.nn-k button', el).forEach(function (b) { b.addEventListener('click', function () { k = +b.getAttribute('data-k'); api.save({ k: k }); D.$all('.nn-k button', el).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); draw(); if (step === 1) checkDisagree(); }); });
      draw(); task();
    },
  },
  quiz: [
    { q: 'How does nearest neighbor label a new example?', a: ['It copies the label of the most similar known examples', 'It picks a random label', 'It asks a human every time', 'It always says the most common label'], c: 0, why: 'Similar examples usually share a label.' },
    { q: 'What does k mean in k-nearest neighbors?', a: ['How many nearby examples get to vote', 'How many features there are', 'The speed of the computer', 'The number of classes'], c: 0, why: 'k = 1: the single closest decides. k = 5: the five closest vote.' },
    { q: 'A striker who makes lots of tackles sits among the defenders. With k = 1, a new player right next to them is labeled…', a: ['Striker, even though most neighbors are defenders', 'Defender, always', 'Both', 'Nothing'], c: 0, why: 'With k = 1, one unusual example decides alone.' },
    { q: 'What did the two axes on the map stand for?', a: ['Two features: shots and tackles per game', 'Time and date', 'Name and age', 'Color and size'], c: 0, why: 'Each feature becomes a direction on the map. Distance = how different two players are.' },
  ],
  challenge: {
    title: 'Similarity Everywhere',
    intro: '“Find the most similar” powers lots of real AI. Match each app to how it uses similarity. Get 3 of 4.',
    js: function (el, api) {
      api.D.sorter(el, api, {
        choices: [['y', '✅ Uses similarity'], ['n', '❌ Doesn’t']],
        items: [
          ['A music app: “People who liked this song also liked…”', 'y', 'It finds listeners similar to you and recommends what they enjoyed.'],
          ['A photo app that finds pictures that look like the one you picked', 'y', 'It compares images to find the closest matches.'],
          ['A calculator adding 2 + 2', 'n', 'Pure arithmetic rules, no comparing examples.'],
          ['A shopping site showing items similar to the one you’re viewing', 'y', 'Items are placed on a “map,” and neighbors get recommended.'],
        ],
        need: 3, win: 'Similarity is one of the simplest and most powerful ideas in AI. You’ll see it again with word maps in the Brown Belt!',
      });
    },
  },
};
