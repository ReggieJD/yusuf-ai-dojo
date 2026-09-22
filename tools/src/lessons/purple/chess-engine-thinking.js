module.exports = {
  hook: 'Chess engines can’t search to the end of the game, so they score positions with an evaluation function. Think like an engine: count, look ahead, decide.',
  story: [
    ['sensei', '{{nick}}, you know how to play chess. Did you know the best chess engines are far stronger than any human, and have been for years?'],
    ['sensei', 'But even engines can’t search every possible game. So they search a few moves ahead, then <b>score</b> each position with an <b>evaluation function</b>: a formula that estimates who’s winning.'],
    ['you', 'What’s in the formula?'],
    ['sensei', 'The simplest part is <b>material</b>: pawn = 1, knight = 3, bishop = 3, rook = 5, queen = 9. Real engines add much more, like king safety and active pieces. Let’s think like an engine.'],
  ],
  activity: {
    title: 'Engine Mode',
    instructions: 'Three engine jobs: evaluate a position, choose a capture by looking 2 moves ahead, and upgrade your evaluation function.',
    css: `
.ce-board{display:grid;grid-template-columns:22px repeat(5,1fr);gap:0;max-width:300px;margin:8px 0;border-radius:10px;overflow:hidden;box-shadow:0 0 0 3px #1d0f33}
.ce-board span{aspect-ratio:1;display:grid;place-items:center;font-size:2rem;line-height:1}
.ce-board .l{background:#efe4ff}.ce-board .d{background:#9d7ad6}
.ce-board .c{font:800 .72rem var(--font-body);background:#1d0f33;color:#e0c3ff;aspect-ratio:auto}
.ce-board .hl{box-shadow:inset 0 0 0 4px #ffd23f}
.ce-vals{display:flex;flex-wrap:wrap;gap:6px;font-weight:800;margin:6px 0}
.ce-vals span{background:#fff;border:2px solid #1d0f3333;border-radius:10px;padding:4px 8px}
.ce-step{background:var(--bg2);border-radius:14px;padding:12px;margin-bottom:12px}
.ce-step.done{background:#e3f6ea}
.ce-step .row button{flex:1 1 170px}
.ce-look{width:100%;border-collapse:collapse;background:#fff;margin-top:8px;font-size:.9rem}
.ce-look th,.ce-look td{border:1px solid #1d0f3322;padding:6px;text-align:left}
`,
    js: function (el, api) {
      var D = api.D, S = api.load(), step = S.step || 0;
      var G = { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙', k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
      function board(rows, hl) {
        var h = '<div class="ce-board" role="img" aria-label="' + rows.map(function (r, i) { return 'rank ' + (5 - i) + ': ' + r.replace(/\./g, '-'); }).join('; ') + '">';
        rows.forEach(function (r, y) { h += '<span class="c">' + (5 - y) + '</span>'; for (var x = 0; x < 5; x++) { var sq = 'abcde'[x] + (5 - y); h += '<span class="' + ((x + y) % 2 ? 'd' : 'l') + (hl && hl.indexOf(sq) >= 0 ? ' hl' : '') + '">' + (G[r[x]] || '') + '</span>'; } });
        return h + '<span class="c"></span>' + 'abcde'.split('').map(function (f) { return '<span class="c">' + f + '</span>'; }).join('') + '</div>';
      }
      function ask(opts, cb, wrongMsg) {
        return { html: '<div class="row">' + D.shuffle(opts.map(function (o) { return '<button type="button" class="btn small" data-ok="' + o[0] + '">' + o[1] + '</button>'; })).join('') + '</div><p class="feedback" aria-live="polite"></p>', wire: function (box) { D.$all('[data-ok]', box).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-ok') === '1') { D.sfx('good'); cb(); } else { D.sfx('bad'); b.disabled = true; var f = box.querySelector('.feedback'); f.className = 'feedback no'; f.textContent = wrongMsg; } }); }); } };
      }
      function render() {
        var h = '<div class="ce-vals" aria-label="Piece values"><span>♙ = 1</span><span>♘ = 3</span><span>♗ = 3</span><span>♖ = 5</span><span>♕ = 9</span><span>♔ = priceless</span></div>';
        var boxes = [];
        // step 1
        var s1 = ask([[1, 'White is ahead by 2'], [0, 'Black is ahead by 2'], [0, 'It’s exactly even']], function () { step = Math.max(step, 1); api.save({ step: step }); render(); }, 'Add up each side: White ♕♖♙♙♙ vs Black ♜♝♞♟♟♟♟.');
        h += '<div class="ce-step' + (step >= 1 ? ' done' : '') + '"><p><b>Job 1 · Evaluate:</b> Count material. Who’s ahead?</p>' + board(['.r.k.', 'pbpnp', '..Q.p', 'PP.P.', '..RK.']) + (step >= 1 ? '<p>✅ White: 9 + 5 + 1 + 1 + 1 = 17. Black: 5 + 3 + 3 + 1 + 1 + 1 + 1 = 15. <b>White +2.</b></p>' : s1.html) + '</div>';
        if (step < 1) boxes.push(s1);
        if (step >= 1) {
          var s2 = ask([[1, '♕ Queen takes the knight on e3'], [0, '♕ Queen takes the rook on c4']], function () { step = Math.max(step, 2); api.save({ step: step }); render(); }, 'Look 2 moves ahead: after Queen takes rook, can Black take your queen?');
          h += '<div class="ce-step' + (step >= 2 ? ' done' : '') + '"><p><b>Job 2 · Look ahead:</b> White to move. The rook on c4 is worth more… but check what Black can do NEXT.</p>' + board(['kp...', '..r..', '....n', '.....', 'K.Q..'], ['c4', 'e3', 'b5']) +
            (step >= 2 ? '<table class="ce-look"><caption class="sr-only">Two-move lookahead</caption><tr><th>Move</th><th>After Black replies</th><th>Net</th></tr><tr><td>♕×♜ c4 (+5)</td><td>♟ b5 takes ♕ (−9)</td><td><b>−4</b> 😱</td></tr><tr><td>♕×♞ e3 (+3)</td><td>Nothing can take back</td><td><b>+3</b> ✅</td></tr></table><p>✅ A greedy one-move engine grabs the rook. A two-move engine sees the trap.</p>' : s2.html) + '</div>';
          if (step < 2) boxes.push(s2);
        }
        if (step >= 2) {
          var s3 = ask([[1, 'King safety, active pieces and pawn structure'], [0, 'The color of the board squares'], [0, 'How long each move took']], function () { step = 3; api.save({ step: 3 }); render(); }, 'Think about what makes a position good even when material is equal.');
          h += '<div class="ce-step' + (step >= 3 ? ' done' : '') + '"><p><b>Job 3 · Upgrade:</b> Material alone misses a lot. Which extra ideas do strong engines include in their evaluation?</p>' + (step >= 3 ? '<p>✅ Modern engines also look at king safety, piece activity, pawn structure and more, and some learn their evaluation with neural networks!</p>' : s3.html) + '</div>';
          if (step < 3) boxes.push(s3);
        }
        if (step >= 3) h += '<p class="feedback ok">🏆 Engine mode complete: evaluate → search ahead → pick the best score. Real engines do this for millions of positions every second.</p>';
        el.innerHTML = h;
        var stepEls = D.$all('.ce-step', el); boxes.forEach(function (bx) { bx.wire(stepEls[stepEls.length - 1]); });
        if (step >= 3) api.done();
      }
      render();
    },
  },
  quiz: [
    { q: 'What is an evaluation function?', a: ['A formula that scores who’s winning in a position', 'A chess clock', 'A list of openings', 'The rules of chess'], c: 0, why: 'Engines use it when they can’t search to the end.' },
    { q: 'In simple material counting, a rook is worth…', a: ['5', '3', '9', '1'], c: 0, why: 'Pawn 1, knight 3, bishop 3, rook 5, queen 9.' },
    { q: 'Why was taking the rook a mistake?', a: ['Black could recapture the queen next move, losing more than you gained', 'Rooks can’t be captured', 'Queens can’t move diagonally', 'It wasn’t a mistake'], c: 0, why: '+5 − 9 = −4. Looking ahead reveals traps.' },
    { q: 'Roughly how many positions can a top chess engine examine per second on a fast computer?', a: ['Millions', 'About 10', 'Exactly 1', 'None — it guesses'], c: 0, why: 'Speed + good evaluation + smart search = superhuman play.' },
  ],
  challenge: {
    title: 'Material Math',
    intro: 'Quick material calculations, engine-style. Get 3 of 4.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'You trade your knight (3) for their rook (5). Net change?', a: ['+2 for you', '−2 for you', '+8', '0'], c: 0, why: 'You gain 5 and lose 3: +2. Chess players call this “winning the exchange.”' },
        { q: 'White has ♕♖♖ (no pawns). Black has ♕♖♗♘ (no pawns). Who is ahead?', a: ['Black, by 1', 'White, by 1', 'Even', 'Black, by 5'], c: 0, why: 'White: 9 + 5 + 5 = 19. Black: 9 + 5 + 3 + 3 = 20. Black is ahead by 1.' },
        { q: 'Your queen (9) captures a pawn (1), then gets captured. Net?', a: ['−8', '+1', '+8', '0'], c: 0, why: '+1 − 9 = −8. Ouch!' },
        { q: 'Two positions have equal material, but in one your king has no protection. How would a good evaluation function score it?', a: ['Lower, because king safety matters', 'Exactly the same', 'Higher', 'It can’t tell'], c: 0, why: 'Good evaluations include more than material.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
