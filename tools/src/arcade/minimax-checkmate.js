// Mate-in-1 puzzles. Board: 64 squares, index = rank*8 + file (a1 = 0, h8 = 63).
// Uppercase = White, lowercase = Black. White always moves.
const PUZZLES = [
  { name: 'Back-Rank Slam', w: { Kg1: 1, Ra1: 1 }, b: { Kg8: 1, Pf7: 1, Pg7: 1, Ph7: 1 } },
  { name: 'Rook Wall', w: { Ke1: 1, Ra7: 1, Rb1: 1 }, b: { Ke8: 1 } },
  { name: 'Queen Kiss', w: { Kg6: 1, Qa7: 1 }, b: { Kh8: 1 } },
  { name: 'Arabian Mate', w: { Ka1: 1, Rb7: 1, Nf6: 1 }, b: { Kh8: 1, Pa6: 1 } },
  { name: 'Rook Ladder', w: { Ke1: 1, Rg7: 1, Rh1: 1 }, b: { Ka8: 1 } },
  { name: 'Knight Backup', w: { Ka1: 1, Qh5: 1, Ng5: 1 }, b: { Kh8: 1, Rf8: 1, Pf7: 1, Pg7: 1, Ph7: 1 } },
  { name: 'Long Diagonal', w: { Kc1: 1, Qd4: 1, Bb2: 1 }, b: { Kg8: 1, Pf7: 1, Ph7: 1 } },
  { name: 'Smothered Mate', w: { Ka1: 1, Ng5: 1 }, b: { Kh8: 1, Rg8: 1, Pg7: 1, Ph7: 1 } },
  { name: 'X-Ray Queen', w: { Kg1: 1, Qd1: 1 }, b: { Kb8: 1, Pa7: 1, Pb7: 1, Pc7: 1 } },
  { name: 'Scholar’s Mate', w: { Ke1: 1, Qh5: 1, Bc4: 1, Bc1: 1, Nb1: 1, Ng1: 1, Ra1: 1, Rh1: 1, Pa2: 1, Pb2: 1, Pc2: 1, Pd2: 1, Pe4: 1, Pf2: 1, Pg2: 1, Ph2: 1 },
    b: { Ke8: 1, Qd8: 1, Ra8: 1, Rh8: 1, Bc8: 1, Bf8: 1, Nc6: 1, Nf6: 1, Pa7: 1, Pb7: 1, Pc7: 1, Pd7: 1, Pe5: 1, Pf7: 1, Pg7: 1, Ph7: 1 } },
];

module.exports = {
  data: PUZZLES,
  how: 'Each board is <b>White to move and checkmate in one</b>. Tap a white piece, then tap where it should go. A legal move that isn’t checkmate costs a life. 10 puzzles over 5 levels. Stuck? The 🔎 Search button shows which piece to move (costs 5 points).',
  connect: 'Chess engines use <b>search</b>: they try every legal move, look at every reply, and pick the move that is best even against the opponent’s best answer. That’s called <b>minimax</b>. After each puzzle you’ll see how many moves a search had to check.',
  css: `
.mm-top{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px}
.mm-board{display:grid;grid-template-columns:repeat(8,1fr);max-width:400px;margin:0 auto;border:4px solid #5ef2ff;border-radius:8px;overflow:hidden;box-shadow:0 0 20px #5ef2ff33}
.mm-board button{aspect-ratio:1;border:0;padding:0;font-size:clamp(22px,8.5vw,40px);line-height:1;cursor:pointer;position:relative;font-family:"Segoe UI Symbol","Noto Sans Symbols 2","DejaVu Sans",serif}
.mm-board button.l{background:#e8dcff}.mm-board button.d{background:#8a6fd1}
.mm-board button .w{color:#fff;text-shadow:0 0 2px #000,0 0 2px #000,0 1px 3px #000}
.mm-board button .b{color:#1a1030;text-shadow:0 0 1px #fff}
.mm-board button.sel{box-shadow:inset 0 0 0 4px #ff5edb}
.mm-board button.tgt::after{content:"";position:absolute;inset:36%;border-radius:50%;background:#ff5edb99}
.mm-board button.hint{box-shadow:inset 0 0 0 4px #ffd23f}
.mm-board button.last{box-shadow:inset 0 0 0 4px #3ee08f}
.mm-board button:focus-visible{outline:3px solid #ffd23f;outline-offset:-3px}
.mm-files{display:grid;grid-template-columns:repeat(8,1fr);max-width:400px;margin:2px auto 0;text-align:center;font-size:.75rem;color:#c3b8ea}
.mm-msg{text-align:center;font-weight:700;min-height:1.5em;margin-top:8px}
`,
  js: function (el, G) {
    var D = G.D;
    var PUZ = el.__puzzles || window.GAME_DATA;
    var GLYPH = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' };
    var NAMES = { K: 'king', Q: 'queen', R: 'rook', B: 'bishop', N: 'knight', P: 'pawn' };
    var FILES = 'abcdefgh';
    function sqName(i) { return FILES[i % 8] + (Math.floor(i / 8) + 1); }
    function parse(p) {
      var b = []; for (var i = 0; i < 64; i++) b.push('');
      Object.keys(p.w).forEach(function (k) { b[FILES.indexOf(k[1]) + (+k[2] - 1) * 8] = k[0]; });
      Object.keys(p.b).forEach(function (k) { b[FILES.indexOf(k[1]) + (+k[2] - 1) * 8] = k[0].toLowerCase(); });
      return b;
    }
    function isW(c) { return c && c === c.toUpperCase(); }
    function own(c, white) { return c && (white ? isW(c) : !isW(c)); }
    // Every square the piece on `from` attacks or can move to (ignoring checks).
    function moves(b, from, attacksOnly) {
      var c = b[from], white = isW(c), t = c.toUpperCase(), out = [], f = from % 8, r = Math.floor(from / 8);
      function add(ff, rr) {
        if (ff < 0 || ff > 7 || rr < 0 || rr > 7) return false;
        var to = rr * 8 + ff, x = b[to];
        if (own(x, white)) { if (attacksOnly) out.push(to); return false; }
        out.push(to); return !x;
      }
      function slide(dirs) { dirs.forEach(function (d) { for (var k = 1; k < 8; k++) if (!add(f + d[0] * k, r + d[1] * k)) break; }); }
      var ROOK = [[1, 0], [-1, 0], [0, 1], [0, -1]], BISH = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      if (t === 'R') slide(ROOK);
      else if (t === 'B') slide(BISH);
      else if (t === 'Q') slide(ROOK.concat(BISH));
      else if (t === 'N') [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]].forEach(function (d) { add(f + d[0], r + d[1]); });
      else if (t === 'K') ROOK.concat(BISH).forEach(function (d) { add(f + d[0], r + d[1]); });
      else if (t === 'P') {
        var dir = white ? 1 : -1, rr = r + dir;
        if (rr >= 0 && rr <= 7) {
          [f - 1, f + 1].forEach(function (ff) {
            if (ff < 0 || ff > 7) return;
            var to = rr * 8 + ff;
            if (attacksOnly || (b[to] && !own(b[to], white))) out.push(to);
          });
          if (!attacksOnly && !b[rr * 8 + f]) {
            out.push(rr * 8 + f);
            if (r === (white ? 1 : 6) && !b[(r + 2 * dir) * 8 + f]) out.push((r + 2 * dir) * 8 + f);
          }
        }
      }
      return out;
    }
    function attacked(b, sq, byWhite) {
      for (var i = 0; i < 64; i++) if (own(b[i], byWhite) && moves(b, i, true).indexOf(sq) >= 0) return true;
      return false;
    }
    function play(b, m) { var n = b.slice(); n[m[1]] = n[m[0]]; n[m[0]] = ''; if (n[m[1]] === 'P' && m[1] >= 56) n[m[1]] = 'Q'; if (n[m[1]] === 'p' && m[1] < 8) n[m[1]] = 'q'; return n; }
    function inCheck(b, white) { var k = b.indexOf(white ? 'K' : 'k'); return attacked(b, k, !white); }
    function legal(b, white) {
      var out = [];
      for (var i = 0; i < 64; i++) if (own(b[i], white)) moves(b, i).forEach(function (to) { var m = [i, to]; if (!inCheck(play(b, m), white)) out.push(m); });
      return out;
    }
    function isMate(b) { return inCheck(b, false) && legal(b, false).length === 0; }
    el.__engine = { parse: parse, legal: legal, play: play, isMate: isMate, inCheck: inCheck };
    if (el.__engineOnly) return;

    var lives = 3, score = 0, idx = 0, board, sel = -1, locked = false, hinted = false;
    function render(last) {
      var h = '<div class="mm-top"><b>Puzzle ' + (idx + 1) + '/' + PUZ.length + ': ' + PUZ[idx].name + '</b><button type="button" class="btn small" id="mm-hint"' + (hinted || locked ? ' disabled' : '') + '>🔎 Search (−5)</button></div><div class="mm-board" role="grid" aria-label="Chess board, White to move">';
      var mine = sel >= 0 ? legal(board, true).filter(function (m) { return m[0] === sel; }).map(function (m) { return m[1]; }) : [];
      for (var r = 7; r >= 0; r--) for (var f = 0; f < 8; f++) {
        var i = r * 8 + f, c = board[i];
        var cls = ((r + f) % 2 ? 'l' : 'd') + (i === sel ? ' sel' : '') + (mine.indexOf(i) >= 0 ? ' tgt' : '') + (last && last.indexOf(i) >= 0 ? ' last' : '') + (el.__hint === i && !locked ? ' hint' : '');
        var label = sqName(i) + (c ? ', ' + (isW(c) ? 'white ' : 'black ') + NAMES[c.toUpperCase()] : ', empty');
        h += '<button type="button" class="' + cls + '" data-sq="' + i + '" aria-label="' + label + '">' + (c ? '<span class="' + (isW(c) ? 'w' : 'b') + '">' + GLYPH[c.toUpperCase()] + '︎</span>' : '') + '</button>';
      }
      h += '</div><div class="mm-files" aria-hidden="true">' + FILES.split('').map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div><p class="mm-msg" aria-live="polite">' + (el.__msg || 'White to move. Find checkmate!') + '</p>';
      el.innerHTML = h;
      D.$all('.mm-board button', el).forEach(function (btn) { btn.addEventListener('click', function () { tap(+btn.getAttribute('data-sq')); }); });
      var hb = D.$('#mm-hint', el);
      hb.addEventListener('click', function () { hinted = true; score = Math.max(0, score - 5); G.hud({ score: score }); el.__hint = el.__sol[0]; el.__msg = '🔎 Search says: the winning move uses the highlighted piece.'; render(); });
    }
    function tap(i) {
      if (locked) return;
      if (own(board[i], true)) { sel = i; el.__msg = 'Selected the ' + NAMES[board[i]] + ' on ' + sqName(i) + '. Now tap a target square.'; D.sfx('click'); return render(); }
      if (sel < 0) return;
      var m = legal(board, true).filter(function (x) { return x[0] === sel && x[1] === i; })[0];
      if (!m) { el.__msg = 'That’s not a legal move for that piece.'; sel = -1; return render(); }
      var after = play(board, m);
      if (isMate(after)) {
        locked = true; board = after; sel = -1;
        var all = legal(parse(PUZ[idx]), true), mates = all.filter(function (x) { return isMate(play(parse(PUZ[idx]), x)); }).length;
        score += hinted ? 10 : 20; D.sfx('good'); G.hud({ score: score });
        el.__msg = '♟️ CHECKMATE! A search engine would check all ' + all.length + ' of your legal moves; only ' + mates + ' ' + (mates === 1 ? 'is' : 'are') + ' mate.';
        render(m);
        idx++;
        if (idx >= PUZ.length) return setTimeout(function () { G.end(score, true, 'All 10 mates found. You searched like an engine!'); }, 1800);
        setTimeout(load, 2200);
      } else {
        var check = inCheck(after, false), esc = legal(after, false)[0];
        lives--; D.sfx('bad'); G.hud({ lives: lives });
        el.__msg = (check ? 'Check, but not mate: Black escapes with ' : 'Not even check: Black can reply ') + (esc ? NAMES[after[esc[0]].toUpperCase()] + ' to ' + sqName(esc[1]) : 'anything') + '. Search the replies!';
        sel = -1;
        if (lives <= 0) { locked = true; render([m[0], m[1]]); return setTimeout(function () { G.end(score, false, 'Tip: for each checking move, ask “where can the king run, and can anything block or capture?”'); }, 1800); }
        render();
      }
    }
    function load() {
      board = parse(PUZ[idx]); sel = -1; locked = false; hinted = false; el.__hint = -1; el.__msg = '';
      el.__sol = legal(board, true).filter(function (x) { return isMate(play(board, x)); })[0];
      G.hud({ score: score, level: Math.floor(idx / 2) + 1, lives: lives });
      render();
    }
    load();
  },
};
