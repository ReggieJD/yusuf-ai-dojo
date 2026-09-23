module.exports = {
  how: 'Study the examples: ✅ tiles follow a secret rule and ❌ tiles don’t. Figure out the rule, then slice every tile that follows it. Wrong slices cost a life. Clear 5 levels to win.',
  connect: 'This is <b>supervised learning</b>. An AI gets labeled examples (✅ / ❌), finds a rule that explains them, then uses it on new data it has never seen. More varied examples make the rule easier to find, for you and for the AI.',
  css: `
.pn-ex{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.pn-col{background:#1c1240;border-radius:12px;padding:8px}
.pn-col h3{margin:0 0 6px;font-size:.95rem}
.pn-row{display:flex;flex-wrap:wrap;gap:4px}
.pn-t{display:inline-flex;align-items:center;justify-content:center;border-radius:10px;background:#0b0620;border:2px solid #ffffff22;line-height:1}
.pn-ex .pn-t{width:40px;height:40px}
.pn-t.big{font-size:30px}.pn-t.small{font-size:17px}
.pn-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:360px;margin:0 auto}
.pn-grid button.pn-t{aspect-ratio:1;width:100%;min-height:56px;cursor:pointer;color:inherit;font-family:inherit}
.pn-grid button.pn-t:hover{border-color:#5ef2ff}
.pn-grid button.cut{background:#0f3b27;border-color:#3ee08f;opacity:.55}
.pn-grid button.miss{background:#3d0f1c;border-color:#ff6b8a}
.pn-msg{text-align:center;min-height:1.5em;font-weight:700}
.pn-key{font-size:.8rem;color:#c3b8ea;text-align:center;margin:6px 0 0}
`,
  js: function (el, G) {
    var D = G.D;
    var COLORS = [['pink', '#ff5edb'], ['cyan', '#5ef2ff'], ['yellow', '#ffd23f'], ['green', '#3ee08f']];
    var SHAPES = [['circle', '●'], ['triangle', '▲'], ['square', '■'], ['star', '★']];
    var SIZES = ['big', 'small'];
    var all = [];
    COLORS.forEach(function (c, ci) { SHAPES.forEach(function (s, si) { SIZES.forEach(function (z) { all.push({ c: ci, s: si, z: z }); }); }); });
    function rnd(n) { return Math.floor(Math.random() * n); }
    // Candidate rules, from simple to tricky.
    function singles() {
      var r = [];
      COLORS.forEach(function (c, i) { r.push({ t: 1, txt: 'it is ' + c[0], f: function (x) { return x.c === i; } }); });
      SHAPES.forEach(function (s, i) { r.push({ t: 2, txt: 'it is a ' + s[0], f: function (x) { return x.s === i; } }); });
      SIZES.forEach(function (z) { r.push({ t: 3, txt: 'it is ' + z, f: function (x) { return x.z === z; } }); });
      return r;
    }
    function pairs() {
      var r = [];
      COLORS.forEach(function (c, i) {
        SIZES.forEach(function (z) { r.push({ t: 4, txt: 'it is ' + z + ' AND ' + c[0], f: function (x) { return x.c === i && x.z === z; } }); });
        SHAPES.forEach(function (s, j) { r.push({ t: 5, txt: 'it is a ' + s[0] + ' but NOT ' + c[0], f: function (x) { return x.s === j && x.c !== i; } }); });
      });
      return r;
    }
    var CANDS = singles().concat(pairs());
    var lives = 3, score = 0, level = 1, rule, grid, left;
    function tileHtml(x, tag, i) {
      var label = x.z + ' ' + COLORS[x.c][0] + ' ' + SHAPES[x.s][0];
      var attrs = ' class="pn-t ' + x.z + '" style="color:' + COLORS[x.c][1] + '" title="' + label + '"';
      if (tag === 'button') return '<button type="button"' + attrs + ' data-i="' + i + '" aria-label="' + label + '">' + SHAPES[x.s][1] + '</button>';
      return '<span' + attrs + ' role="img" aria-label="' + label + '">' + SHAPES[x.s][1] + '</span>';
    }
    function makeLevel() {
      var type = level <= 3 ? [1, 2, 3][level - 1] : level;
      var pool = CANDS.filter(function (r) { return r.t === type; });
      for (var tries = 0; tries < 400; tries++) {
        rule = pool[rnd(pool.length)];
        var pos = D.shuffle(all.filter(rule.f)).slice(0, 4), neg = D.shuffle(all.filter(function (x) { return !rule.f(x); })).slice(0, 4);
        if (pos.length < 3) continue;
        var ex = pos.concat(neg);
        // The examples must point to exactly one rule, so the puzzle is fair.
        var fits = CANDS.filter(function (r) { return ex.every(function (x) { return r.f(x) === rule.f(x); }); });
        if (fits.length !== 1) continue;
        // New tiles to judge: 3-6 that follow the rule, the rest don't (tiles can repeat).
        var yes = all.filter(rule.f), no = all.filter(function (x) { return !rule.f(x); }), m = 3 + rnd(4), g = [];
        for (var k = 0; k < 12; k++) g.push(k < m ? yes[rnd(yes.length)] : no[rnd(no.length)]);
        g = D.shuffle(g);
        return { pos: pos, neg: neg, grid: g };
      }
      return null;
    }
    function play() {
      var L = makeLevel();
      grid = L.grid; left = grid.filter(rule.f).length;
      el.__ans = grid.map(function (x, i) { return rule.f(x) ? i : -1; }).filter(function (i) { return i >= 0; });
      G.hud({ score: score, level: level, lives: lives });
      el.innerHTML = '<div class="pn-ex"><div class="pn-col"><h3>✅ Follows the rule</h3><div class="pn-row">' + L.pos.map(function (x) { return tileHtml(x); }).join('') + '</div></div><div class="pn-col"><h3>❌ Breaks the rule</h3><div class="pn-row">' + L.neg.map(function (x) { return tileHtml(x); }).join('') + '</div></div></div>' +
        '<p class="pn-msg" aria-live="polite">Level ' + level + ': slice all <b>' + left + '</b> tiles that follow the rule.' + (level >= 4 ? ' Hint: this rule uses TWO clues.' : '') + '</p><div class="pn-grid">' + grid.map(function (x, i) { return tileHtml(x, 'button', i); }).join('') + '</div><p class="pn-key">Tip: hover or long-press a tile to read its name.</p>';
      var msg = D.$('.pn-msg', el);
      D.$all('.pn-grid button', el).forEach(function (b) {
        b.addEventListener('click', function () {
          var x = grid[+b.getAttribute('data-i')];
          b.disabled = true;
          if (rule.f(x)) {
            b.classList.add('cut'); score += 10; left--; D.sfx('good'); G.hud({ score: score });
            if (left === 0) {
              score += 10 * lives; G.hud({ score: score });
              msg.innerHTML = '🥷 Clean! The rule was: <b>' + rule.txt + '</b>.';
              D.$all('.pn-grid button', el).forEach(function (o) { o.disabled = true; });
              if (level >= 5) return setTimeout(function () { G.end(score, true, 'You cracked all 5 secret rules. That’s how a model learns from labeled data.'); }, 900);
              level++; setTimeout(play, 1400);
            } else msg.innerHTML = 'Nice slice! <b>' + left + '</b> to go.';
          } else {
            b.classList.add('miss'); lives--; D.sfx('bad'); G.hud({ lives: lives });
            if (lives <= 0) return setTimeout(function () { G.end(score, false, 'The rule was: <b>' + rule.txt + '</b>. Study both columns: what do ALL the ✅ tiles share that NONE of the ❌ tiles have?'); }, 700);
            msg.textContent = 'Not that one! It breaks the rule. Compare the ✅ and ❌ columns again.';
          }
        });
      });
    }
    play();
  },
};
