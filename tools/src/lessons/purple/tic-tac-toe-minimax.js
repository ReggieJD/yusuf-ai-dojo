module.exports = {
  hook: 'Upgrade a tic-tac-toe bot from “random” to “unbeatable,” one brain at a time. Then try to beat the minimax bot. (Spoiler: you can’t.)',
  story: [
    ['sensei', '{{nick}}, tic-tac-toe is small enough that a computer can search the <b>entire</b> game tree: every possible game, all the way to the end.'],
    ['sensei', 'The trick is called <b>minimax</b>. The AI imagines every move. For each one, it assumes <b>you</b> will play your very best reply, and then its best reply to that, all the way to the end. Then it picks the move whose worst case is the best.'],
    ['you', 'So it’s like expecting the opponent to be perfect?'],
    ['sensei', 'Exactly. That’s why a minimax player never loses at tic-tac-toe. Let’s upgrade our bot, level by level.'],
  ],
  activity: {
    title: 'Build the Unbeatable Bot',
    instructions: 'You are ❌ and always go first. Mission 1: beat the Random bot. Mission 2: switch the bot’s brain to Minimax and play 2 full games. Turn on “Show the AI’s thoughts” to see its scores.',
    css: `
.tt-wrap{display:grid;gap:12px}
@media(min-width:680px){.tt-wrap{grid-template-columns:auto 1fr}}
.tt-board{display:grid;grid-template-columns:repeat(3,92px);grid-template-rows:repeat(3,92px);gap:6px;background:#1d0f33;padding:6px;border-radius:16px;box-shadow:0 0 0 3px #b983ff,0 0 24px #7b2ff766}
@media(max-width:400px){.tt-board{grid-template-columns:repeat(3,84px);grid-template-rows:repeat(3,84px)}}
.tt-board button{border:0;border-radius:10px;background:#fbf7ff;font:900 2.4rem var(--font-body);cursor:pointer;position:relative;color:#1d0f33}
.tt-board button:disabled{cursor:default}
.tt-board button .sc{position:absolute;bottom:4px;right:6px;font:800 .72rem var(--font-body);padding:1px 5px;border-radius:6px}
.sc.w{background:#caffbf}.sc.d{background:#e9e3f5}.sc.l{background:#ffd6d6}
.tt-board button.hot{background:#ffe9a8}
.tt-brain{display:grid;gap:6px}
.tt-brain button{min-height:48px;text-align:left;padding:8px 12px;border-radius:12px;border:2px solid #1d0f33;background:#fff;font:700 .92rem var(--font-body);cursor:pointer;color:#1d0f33}
.tt-brain button[aria-pressed="true"]{background:#7b2ff7;color:#fff}
.tt-status{font-weight:800;font-size:1.05rem;margin:8px 0}
.tt-m{background:var(--bg2);border-radius:14px;padding:10px 12px;margin-top:8px}
.tt-m .row button{flex:1 1 150px}
.tt-toggle{display:flex;gap:8px;align-items:center;font-weight:700;min-height:44px}
.tt-toggle input{width:22px;height:22px}
`,
    js: function (el, api) {
      var D = api.D;
      var LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
      function winner(b) { for (var i = 0; i < 8; i++) { var l = LINES[i]; if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return b[l[0]]; } return b.indexOf('') < 0 ? 'draw' : null; }
      function minimax(b, turn, depth) { // score from O's (the bot’s) point of view
        var w = winner(b); if (w === 'O') return 10 - depth; if (w === 'X') return depth - 10; if (w === 'draw') return 0;
        var best = turn === 'O' ? -99 : 99;
        for (var i = 0; i < 9; i++) if (!b[i]) { b[i] = turn; var s = minimax(b, turn === 'O' ? 'X' : 'O', depth + 1); b[i] = ''; best = turn === 'O' ? Math.max(best, s) : Math.min(best, s); }
        return best;
      }
      var BRAINS = { random: '🎲 Random: picks any empty square', rules: '📏 Rules: win if it can, block if it must, else random', minimax: '🧠 Minimax: searches every possible future' };
      var S = api.load(), brain = S.brain || 'random', b = S.b || ['', '', '', '', '', '', '', '', ''], m = S.m || 0, mmGames = S.mm || 0, show = !!S.show;
      el.innerHTML = '<div class="tt-wrap"><div><div class="tt-board" id="tt-b" role="grid" aria-label="Tic-tac-toe board"></div><p class="tt-status" id="tt-s" aria-live="polite"></p><button type="button" class="btn small" id="tt-new">↻ New game</button></div>' +
        '<div><p style="font-weight:800;margin:0 0 6px">Bot brain:</p><div class="tt-brain">' + Object.keys(BRAINS).map(function (k) { return '<button type="button" data-br="' + k + '">' + BRAINS[k] + '</button>'; }).join('') + '</div><label class="tt-toggle"><input type="checkbox" id="tt-show"' + (show ? ' checked' : '') + '> Show the AI’s thoughts (scores for your moves)</label><div class="tt-m" id="tt-m" aria-live="polite"></div></div></div>';
      function botMove() {
        var empty = b.map(function (v, i) { return v ? -1 : i; }).filter(function (i) { return i >= 0; });
        if (brain === 'random') return empty[Math.floor(Math.random() * empty.length)];
        if (brain === 'rules') {
          for (var who of ['O', 'X']) for (var k = 0; k < empty.length; k++) { var i = empty[k]; b[i] = who; var w = winner(b); b[i] = ''; if (w === who) return i; }
          return empty[Math.floor(Math.random() * empty.length)];
        }
        var best = -99, pick = empty[0];
        D.shuffle(empty).forEach(function (i) { b[i] = 'O'; var s = minimax(b, 'X', 1); b[i] = ''; if (s > best) { best = s; pick = i; } });
        return pick;
      }
      function draw() {
        var w = winner(b), yourTurn = !w;
        var scores = {};
        if (show && yourTurn) b.forEach(function (v, i) { if (!v) { b[i] = 'X'; scores[i] = minimax(b, 'O', 1); b[i] = ''; } });
        D.$('#tt-b', el).innerHTML = b.map(function (v, i) {
          var sc = scores[i], lbl = sc == null ? '' : sc < 0 ? '<span class="sc w">you win</span>' : sc === 0 ? '<span class="sc d">draw</span>' : '<span class="sc l">you lose</span>';
          return '<button type="button" data-i="' + i + '" ' + (v || !yourTurn ? 'disabled' : '') + ' aria-label="Square ' + (i + 1) + ': ' + (v === 'X' ? 'X' : v === 'O' ? 'O' : 'empty') + '">' + (v === 'X' ? '❌' : v === 'O' ? '⭕' : '') + lbl + '</button>';
        }).join('');
        D.$('#tt-s', el).textContent = w ? (w === 'X' ? '🏆 You win!' : w === 'O' ? '🤖 The bot wins.' : '🤝 Draw!') : 'Your move (❌)';
        D.$all('[data-br]', el).forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-br') === brain ? 'true' : 'false'); });
        D.$all('#tt-b button', el).forEach(function (x) { x.addEventListener('click', function () { play(+x.getAttribute('data-i')); }); });
        mission();
      }
      function finish(w) {
        if (m === 0 && w === 'X' && brain === 'random') { m = 1; D.sfx('win'); D.toast('🎯 Random bot defeated!'); }
        else if (brain === 'minimax' && m >= 1) { mmGames++; if (w !== 'O') D.sfx('good'); if (m === 1 && mmGames >= 2) m = 2; }
        api.save({ m: m, mm: mmGames });
      }
      function play(i) {
        if (b[i] || winner(b)) return;
        b[i] = 'X'; D.sfx('click');
        var w = winner(b);
        if (!w) { b[botMove()] = 'O'; w = winner(b); }
        api.save({ b: b });
        if (w) finish(w);
        draw();
      }
      function mission() {
        var box = D.$('#tt-m', el);
        if (m === 0) box.innerHTML = '<p><b>Mission 1:</b> Set the brain to 🎲 Random and beat it.</p>';
        else if (m === 1) box.innerHTML = '<p><b>Mission 2:</b> Switch to 🧠 Minimax and finish 2 games. (' + mmGames + '/2) Can you win?</p>';
        else if (m === 2) {
          box.innerHTML = '<p><b>Mission 3:</b> Why couldn’t you beat the Minimax bot?</p><div class="row">' + D.shuffle([[1, 'It checked every possible future and always picked the move with the best worst case'], [0, 'It cheated'], [0, 'It got lucky']]).map(function (o) { return '<button type="button" class="btn small" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p>';
          D.$all('[data-ok]', box).forEach(function (x) { x.addEventListener('click', function () { if (x.getAttribute('data-ok') === '1') { m = 3; api.save({ m: 3 }); D.sfx('win'); mission(); } else { D.sfx('bad'); x.disabled = true; box.querySelector('.feedback').className = 'feedback no'; box.querySelector('.feedback').textContent = 'Turn on “Show the AI’s thoughts.” What do those scores come from?'; } }); });
        } else { box.innerHTML = '<p class="feedback ok">🏆 You built an unbeatable bot! Minimax never loses at tic-tac-toe. With perfect play from both sides, every game ends in a draw.</p>'; api.done(); }
      }
      D.$all('[data-br]', el).forEach(function (x) { x.addEventListener('click', function () { brain = x.getAttribute('data-br'); b = ['', '', '', '', '', '', '', '', '']; api.save({ brain: brain, b: b }); D.sfx('click'); draw(); }); });
      D.$('#tt-new', el).addEventListener('click', function () { b = ['', '', '', '', '', '', '', '', '']; api.save({ b: b }); draw(); });
      D.$('#tt-show', el).addEventListener('change', function () { show = this.checked; api.save({ show: show }); draw(); });
      draw();
    },
  },
  quiz: [
    { q: 'What does minimax assume about its opponent?', a: ['That the opponent will play their best possible move', 'That the opponent will make mistakes', 'That the opponent plays randomly', 'Nothing'], c: 0, why: 'Plan for the toughest opponent, and you’re never surprised.' },
    { q: 'Why can minimax play PERFECT tic-tac-toe?', a: ['The game tree is small enough to search completely', 'Tic-tac-toe has only one move', 'It reads your mind', 'It changes the rules'], c: 0, why: 'There are only a few hundred thousand possible games, which is easy for a computer.' },
    { q: 'If both players play perfectly, how does tic-tac-toe end?', a: ['In a draw', 'X always wins', 'O always wins', 'It never ends'], c: 0, why: 'That’s why you couldn’t beat the minimax bot.' },
    { q: 'The “Rules” bot (win if you can, block if you must) was better than Random but beatable. Why?', a: ['It only looked one move ahead, so it missed traps that take two moves to set up', 'Its rules were illegal', 'It was too slow', 'It wasn’t beatable'], c: 0, why: 'Deeper search sees traps that shallow rules miss, like a fork.' },
  ],
  challenge: {
    title: 'Minimax by Hand',
    intro: 'Scores: +1 = you win, 0 = draw, −1 = you lose. You pick the MAX, your opponent picks the MIN. Get 2 of 3.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'Your move A leads to positions your opponent can choose from, scored +1 and −1. Move B leads to positions scored 0 and 0. Which is safer?', a: ['B — a perfect opponent would push A down to −1', 'A — it has a +1', 'Both are equal', 'Neither'], c: 0, why: 'Minimax takes the worst case of each move: A’s worst is −1 and B’s worst is 0, so B is better.' },
        { q: 'Move C’s replies score +1 and +1. Move D’s replies score 0 and +1. Which does minimax choose?', a: ['C — its worst case is still +1', 'D', 'Either', 'Neither'], c: 0, why: 'C wins no matter what the opponent does.' },
        { q: 'Why don’t chess engines use plain minimax all the way to the end of the game?', a: ['The chess tree is far too big, so they search a limited depth and score positions instead', 'Minimax doesn’t work for chess', 'Chess has no winner', 'They do'], c: 0, why: 'Depth limits + an evaluation function + pruning tricks (like alpha-beta). That’s the next lesson!' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 2) api.done(); } });
    },
  },
};
