module.exports = {
  quiz: [
    { q: 'A game tree shows…', a: ['Every possible move, then every reply, branching out', 'The players’ scores', 'A list of rules', 'A picture of a tree'], c: 0, why: 'Branches = possible futures.' },
    { q: 'In Stick Duel (take 1 or 2; last stick wins), you want to leave your opponent…', a: ['A multiple of 3', 'An odd number', 'Exactly 1', 'A multiple of 2'], c: 0, why: 'Multiples of 3 are losing positions for whoever has to move.' },
    { q: 'Minimax assumes the opponent…', a: ['Plays their best move', 'Plays randomly', 'Makes mistakes on purpose', 'Doesn’t move'], c: 0, why: 'Plan for the toughest reply.' },
    { q: 'With perfect play, tic-tac-toe ends in…', a: ['A draw', 'A win for X', 'A win for O', 'Nobody knows'], c: 0, why: 'Both sides can always avoid losing.' },
    { q: 'A chess evaluation function…', a: ['Scores a position when the engine can’t search to the end', 'Picks the board color', 'Times each move', 'Lists the rules'], c: 0, why: 'Depth-limited search + scoring.' },
    { q: 'Queen (9) takes a rook (5), then gets captured by a pawn. Net?', a: ['−4', '+5', '+14', '0'], c: 0, why: '+5 − 9 = −4.' },
    { q: 'Reinforcement learning means…', a: ['Learning by trial and error from rewards and penalties', 'Copying labeled examples', 'Memorizing a map', 'Following fixed rules'], c: 0, why: 'Try, get feedback, improve.' },
    { q: 'In Maze Sensei, why did a −1 cost per step help?', a: ['It rewarded shorter paths, so the agent learned to hurry', 'It made the maze smaller', 'It removed walls', 'It had no effect'], c: 0, why: 'Rewards shape behavior.' },
    { q: 'An AI rewarded for points instead of finishing might…', a: ['Find a loophole that gets points without doing the real goal', 'Always finish first', 'Refuse to play', 'Become perfect'], c: 0, why: 'AI optimizes exactly what’s rewarded.' },
    { q: 'Exploring means…', a: ['Trying less-known options to learn more', 'Always using the best-known option', 'Stopping', 'Cheating'], c: 0, why: 'Explore to discover; exploit to benefit.' },
    { q: 'The winning strategy in the drill simulator was…', a: ['Balance: explore a bit, then mostly exploit', 'Pure random', 'Stick with the first choice', 'Never play'], c: 0, why: 'Balance beats both extremes.' },
    { q: 'Most video-game enemy AI uses…', a: ['State machines and hand-written rules', 'Giant neural networks', 'Real brains', 'Nothing'], c: 0, why: 'Rules make fun, fair enemies.' },
    { q: 'When a guard in a state machine sees the player, it switches from Patrol to…', a: ['Chase', 'Flee', 'Sleep', 'Delete'], c: 0, why: 'Event → new state.' },
  ],
  project: {
    title: 'Strategy Tournament',
    intro: 'Three rounds. Round 1: beat the perfect Stick Bot starting from 10 sticks (you go first). Round 2: find the minimax move. Round 3: design a reward.',
    css: `
.tn-r{background:var(--bg2);border-radius:14px;padding:12px;margin-bottom:12px}
.tn-r.done{background:#e3f6ea}
.tn-sticks{font-size:1.7rem;letter-spacing:3px;word-break:break-all}
.tn-b{display:grid;grid-template-columns:repeat(3,70px);grid-template-rows:repeat(3,70px);gap:5px;background:#1d0f33;padding:5px;border-radius:12px;width:max-content}
.tn-b button{border:0;border-radius:8px;background:#fbf7ff;font:900 2rem var(--font-body);cursor:pointer;color:#1d0f33}
.tn-r .row button{flex:1 1 170px}
`,
    js: function (el, api) {
      var D = api.D, S = api.load(), step = S.step || 0, n = S.n != null ? S.n : 10, log = S.log || [];
      var BOARD = ['X', 'X', '', '', 'O', '', '', '', 'O'];
      function render() {
        var h = '<div class="tn-r' + (step > 0 ? ' done' : '') + '"><p><b>Round 1 · Stick Duel:</b> take 1 or 2; whoever takes the last stick wins. The bot plays perfectly!</p>';
        if (step > 0) h += '<p>✅ You won by always leaving a multiple of 3!</p>';
        else h += '<div class="tn-sticks" aria-label="' + n + ' sticks">' + new Array(n + 1).join('🥢') + '</div><p>' + n + ' left. ' + (log.slice(-2).join(' · ')) + '</p><div class="row"><button type="button" class="btn small" data-t="1">Take 1</button><button type="button" class="btn small" data-t="2" ' + (n < 2 ? 'disabled' : '') + '>Take 2</button><button type="button" class="btn small" id="tn-reset">↻ Restart at 10</button></div>';
        h += '</div>';
        if (step >= 1) {
          h += '<div class="tn-r' + (step > 1 ? ' done' : '') + '"><p><b>Round 2 · Minimax:</b> You are ❌. Where would a minimax player move?</p><div class="tn-b">' + BOARD.map(function (v, i) { return '<button type="button" data-sq="' + i + '" ' + (v || step > 1 ? 'disabled' : '') + ' aria-label="Square ' + (i + 1) + (v ? ': ' + v : ': empty') + '">' + (v === 'X' ? '❌' : v === 'O' ? '⭕' : step > 1 && i === 2 ? '❌' : '') + '</button>'; }).join('') + '</div><p class="feedback" id="tn-f2" aria-live="polite">' + (step > 1 ? '✅ Winning move: complete the top row!' : '') + '</p></div>';
        }
        if (step >= 2) {
          h += '<div class="tn-r' + (step > 2 ? ' done' : '') + '"><p><b>Round 3 · Reward design:</b> You’re training a robot vacuum with reinforcement learning. Which reward is best?</p>' + (step > 2 ? '<p>✅ +1 for each clean square, and a small cost per minute: it learns to clean well AND fast.</p>' : '<div class="row">' + D.shuffle([[1, '+1 per newly cleaned square, small penalty per minute'], [0, '+1 every time it bumps into something'], [0, '+1 for moving, no matter where']]).map(function (o) { return '<button type="button" class="btn small" data-rw="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" id="tn-f3" aria-live="polite"></p>') + '</div>';
        }
        if (step >= 3) h += '<p class="feedback ok">🏆 Tournament champion! Search, minimax and reward design: the core of game AI.</p>';
        el.innerHTML = h;
        D.$all('[data-t]', el).forEach(function (b) { b.addEventListener('click', function () { take(+b.getAttribute('data-t')); }); });
        var rs = D.$('#tn-reset', el); if (rs) rs.addEventListener('click', function () { n = 10; log = []; api.save({ n: n, log: log }); render(); });
        D.$all('[data-sq]', el).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-sq') === '2') { step = 2; api.save({ step: 2 }); D.sfx('good'); render(); } else { D.sfx('bad'); b.disabled = true; var f = D.$('#tn-f2', el); f.className = 'feedback no'; f.textContent = 'Is there a move that wins RIGHT NOW?'; } }); });
        D.$all('[data-rw]', el).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-rw') === '1') { step = 3; api.save({ step: 3 }); D.sfx('win'); render(); } else { D.sfx('bad'); b.disabled = true; var f = D.$('#tn-f3', el); f.className = 'feedback no'; f.textContent = 'What would the robot learn to do with that reward? Something silly!'; } }); });
        if (step >= 3) api.done();
      }
      function take(k) {
        n -= k; log.push('You took ' + k);
        if (n === 0) { step = 1; api.save({ step: 1, n: n, log: log }); D.sfx('win'); render(); return; }
        var bk = n % 3 || 1; n -= bk; log.push('Bot took ' + bk);
        if (n === 0) { log.push('Bot took the last stick. Restart and try again!'); D.sfx('bad'); }
        api.save({ n: n, log: log }); render();
        if (n === 0) { n = 10; log = ['Bot won. New game!']; api.save({ n: n, log: log }); setTimeout(render, 1200); }
      }
      render();
    },
  },
};
