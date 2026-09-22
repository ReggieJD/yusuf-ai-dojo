module.exports = {
  hook: 'Game AIs win by imagining the future: every move, every reply, every reply to that. Explore a game tree, then use it to beat the bot.',
  story: [
    ['sensei', 'Welcome to the strategy arena, {{nick}}. How does {{T.hero}} think in a big moment? “If I do this, they’ll do that, then I’ll…”'],
    ['sensei', 'Game AIs do the same thing, but super fast. They build a <b>game tree</b>: the current position at the top, every possible move as a branch, every reply as another branch, and so on.'],
    ['you', 'That sounds huge!'],
    ['sensei', 'For chess, it’s astronomically huge. So we’ll start with a tiny game: <b>Stick Duel</b>. There’s a pile of sticks. On your turn, take 1 or 2. Whoever takes the <b>LAST</b> stick wins.'],
  ],
  activity: {
    title: 'Stick Duel',
    instructions: 'Part 1: expand the game tree for 4 sticks and find the winning move. Part 2: beat the Stick Bot in a real game starting with 7 sticks.',
    css: `
.st-tree{background:#fff;border-radius:16px;border:2px solid #1d0f3322;padding:10px;overflow-x:auto}
.st-node{display:inline-flex;flex-direction:column;align-items:center;margin:0 3px;vertical-align:top}
.st-node>button{min-width:52px;min-height:44px;border-radius:12px;border:3px solid #1d0f33;background:#f3eaff;font:800 .82rem var(--font-body);cursor:pointer;color:#1d0f33;padding:4px 6px}
.st-node>button.win{background:#caffbf}.st-node>button.lose{background:#ffd6d6}
.st-node>button[aria-expanded="true"]{box-shadow:0 0 0 3px #b983ff}
.st-kids{display:flex;margin-top:6px;padding-top:6px;border-top:2px solid #7b2ff744}
.st-edge{font-size:.7rem;font-weight:800;color:#6a1fd1}
.st-sticks{font-size:2rem;letter-spacing:4px;text-align:center;min-height:2.6rem;word-break:break-all}
.st-game{background:#1d0f33;color:#fff;border-radius:16px;padding:14px;margin-top:12px;text-align:center}
.st-game .btn{margin:4px}
.st-q{background:var(--bg2);border-radius:14px;padding:10px 12px;margin-top:10px}
.st-q .row button{flex:1 1 120px}
`,
    js: function (el, api) {
      var D = api.D, S = api.load(), open = S.open || {}, part = S.part || 0;
      function winning(n) { return n % 3 !== 0; } // with take-1-or-2, you win if the sticks are NOT a multiple of 3
      function node(n, path, depth, turn) {
        var id = path, exp = !!open[id] && n > 0, lbl = n === 0 ? (turn === 'you' ? 'Bot took last 😢' : 'You took last 🏆') : '🥢×' + n;
        var cls = n === 0 ? (turn === 'you' ? 'lose' : 'win') : '';
        var h = '<div class="st-node"><button type="button" class="' + cls + '" data-id="' + id + '" aria-expanded="' + exp + '" ' + (n === 0 ? 'disabled' : '') + ' aria-label="' + n + ' sticks, ' + (turn === 'you' ? 'your' : 'bot’s') + ' turn">' + lbl + (n ? '<br><small>' + (turn === 'you' ? 'your turn' : 'bot’s turn') + '</small>' : '') + '</button>';
        if (exp) h += '<div class="st-kids">' + [1, 2].filter(function (t) { return t <= n; }).map(function (t) { return '<div style="text-align:center"><div class="st-edge">take ' + t + '</div>' + node(n - t, id + t, depth + 1, turn === 'you' ? 'bot' : 'you') + '</div>'; }).join('') + '</div>';
        return h + '</div>';
      }
      function render() {
        var nOpen = Object.keys(open).length;
        var h = '<div class="st-tree" id="st-tree">' + node(4, 'r', 0, 'you') + '</div><p style="font-weight:700;margin:6px 0">Tap a position to see what can happen next. Expanded: ' + nOpen + ' (open at least 4)</p>';
        if (part === 0 && nOpen >= 4) h += '<div class="st-q"><p><b>With 4 sticks on YOUR turn, what should you take?</b></p><div class="row">' + D.shuffle([[1, 'Take 1 (leave 3)'], [0, 'Take 2 (leave 2)']]).map(function (o) { return '<button type="button" class="btn small" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p></div>';
        if (part >= 1) h += '<div class="st-q"><p class="feedback ok">✅ Leave the bot 3 sticks: whether it takes 1 or 2, YOU take the last one. By looking down the tree, you found a guaranteed win!</p></div>' + game();
        el.innerHTML = h;
        D.$all('#st-tree button[data-id]', el).forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-id'); open[id] = !open[id]; if (!open[id]) delete open[id]; api.save({ open: open }); D.sfx('click'); render(); var again = D.$('[data-id="' + id + '"]', el); if (again) again.focus(); }); });
        D.$all('[data-ok]', el).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-ok') === '1') { part = 1; api.save({ part: 1 }); D.sfx('good'); render(); } else { D.sfx('bad'); b.disabled = true; var f = b.closest('.st-q').querySelector('.feedback'); f.className = 'feedback no'; f.textContent = 'Follow that branch: with 2 left, the bot can take both and win.'; } }); });
        wireGame();
      }
      var G = S.g || { n: 7, turn: 'you', log: [] };
      function game() {
        var h = '<div class="st-game"><h3 style="color:#fff;margin:0 0 6px">Part 2 · Beat the Stick Bot</h3><div class="st-sticks" aria-label="' + G.n + ' sticks left">' + (G.n ? new Array(G.n + 1).join('🥢') : '—') + '</div><p>' + G.n + ' stick' + (G.n === 1 ? '' : 's') + ' left · ' + (G.over ? (G.over === 'you' ? '🏆 YOU WIN!' : '🤖 Bot wins.') : G.turn === 'you' ? 'Your turn' : 'Bot is thinking…') + '</p>';
        if (!G.over) h += '<button type="button" class="btn" data-take="1" ' + (G.turn !== 'you' ? 'disabled' : '') + '>Take 1</button><button type="button" class="btn" data-take="2" ' + (G.turn !== 'you' || G.n < 2 ? 'disabled' : '') + '>Take 2</button>';
        else h += '<button type="button" class="btn" id="st-again">↻ Play again</button>';
        h += '<p style="font-size:.85rem;opacity:.85;margin:8px 0 0">' + (G.log.slice(-4).join(' · ') || 'Hint: try to leave the bot a multiple of 3.') + '</p></div>';
        if (S.won) h += '<p class="feedback ok">🏆 You beat the bot by thinking ahead, exactly like a search algorithm!</p>';
        return h;
      }
      function wireGame() {
        D.$all('[data-take]', el).forEach(function (b) { b.addEventListener('click', function () { take('you', +b.getAttribute('data-take')); }); });
        var again = D.$('#st-again', el); if (again) again.addEventListener('click', function () { G = { n: 7, turn: 'you', log: [] }; api.save({ g: G }); render(); });
      }
      function take(who, k) {
        G.n -= k; G.log.push((who === 'you' ? 'You' : 'Bot') + ' took ' + k);
        if (G.n === 0) { G.over = who; if (who === 'you') { S.won = true; api.save({ won: true }); D.sfx('win'); api.done(); } else D.sfx('bad'); }
        else G.turn = who === 'you' ? 'bot' : 'you';
        api.save({ g: G }); render();
        if (!G.over && G.turn === 'bot') setTimeout(function () { var k2 = G.n % 3 || (Math.random() < 0.5 || G.n < 2 ? 1 : 2); take('bot', Math.min(k2, G.n)); }, D.reducedMotion() ? 50 : 700);
      }
      render();
      if (S.won) api.done();
      if (part >= 1 && !G.over && G.turn === 'bot') setTimeout(function () { take('bot', G.n % 3 || 1); }, 400);
    },
  },
  quiz: [
    { q: 'What is a game tree?', a: ['A map of every possible move, then every reply, and so on', 'A tree drawn in a game', 'A list of players', 'A chess piece'], c: 0, why: 'Each branch is a possible future.' },
    { q: 'In Stick Duel (take 1 or 2; last stick wins), what should you leave your opponent?', a: ['A multiple of 3 (like 3 or 6)', 'Exactly 2', 'An even number', 'It doesn’t matter'], c: 0, why: 'Whatever they take from a multiple of 3, you can take enough to leave the next multiple of 3, all the way down to 0.' },
    { q: 'Why can’t a chess AI build the WHOLE game tree?', a: ['It’s astronomically huge — far more positions than any computer can check', 'Chess has no moves', 'Trees are illegal in chess', 'It can, easily'], c: 0, why: 'There are more possible chess games than atoms in the observable universe (a famous estimate).' },
    { q: 'What does “searching” mean for a game AI?', a: ['Exploring possible future moves to find the best one', 'Googling the answer', 'Looking for lost pieces', 'Guessing randomly'], c: 0, why: 'Search = exploring the tree.' },
  ],
  challenge: {
    title: 'Count the Futures',
    intro: 'Game trees grow FAST. Get 2 of 3.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'Tic-tac-toe: the first player has 9 possible moves. Then the second player has 8. How many different ways can the first two moves go?', a: ['72', '17', '9', '81'], c: 0, why: '9 × 8 = 72, and that’s only two moves deep!' },
        { q: 'If every position has 30 possible moves, how many positions are 2 moves deep?', a: ['900', '60', '30', '3,000'], c: 0, why: '30 × 30 = 900. Three moves deep: 27,000!' },
        { q: 'Since trees explode like this, what do chess engines do?', a: ['Search as deep as they can, skip clearly bad branches, and score positions they can’t finish', 'Check every possible game to the end', 'Give up', 'Play randomly'], c: 0, why: 'Smart shortcuts + an evaluation function. More in two lessons!' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 2) api.done(); } });
    },
  },
};
