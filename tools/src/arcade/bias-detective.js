const CASES = [
  { ai: 'Voice Coach AI', task: 'understands spoken commands', groups: ['Kids’ voices', 'Adults’ voices'], data: [5, 95], cause: 'It was trained mostly on adult voices.' },
  { ai: 'Tryout Bot', task: 'rates soccer players fairly', groups: ['Club B players', 'Club A players'], data: [10, 90], cause: 'It saw very few Club B tryouts during training.' },
  { ai: 'Photo Tagger', task: 'recognizes people in photos', groups: ['Photos taken indoors', 'Photos taken outdoors'], data: [12, 88], cause: 'Its training photos were almost all taken outdoors.' },
  { ai: 'Handwriting Reader', task: 'reads handwritten answers', groups: ['Left-handed writers', 'Right-handed writers'], data: [8, 92], cause: 'Its training samples came mostly from right-handed writers.' },
  { ai: 'Move Coach', task: 'checks karate form from video', groups: ['Short students', 'Tall students'], data: [15, 85], cause: 'Most training videos showed tall students.' },
  { ai: 'Shot Tracker', task: 'counts made basketball shots', groups: ['Courts in the evening', 'Courts in daylight'], data: [10, 90], cause: 'It was trained on daylight videos, so dim light confuses it.' },
  { ai: 'Accent Helper', task: 'turns speech into text', groups: ['Speakers with accent X', 'Speakers with accent Y'], data: [7, 93], cause: 'Its training recordings had very few speakers with accent X.' },
  { ai: 'Chess Tutor Bot', task: 'recommends practice puzzles', groups: ['New players', 'Club players'], data: [6, 94], cause: 'It learned almost only from games by experienced club players.' },
];
module.exports = {
  data: CASES,
  how: 'You’re a fairness detective. Each case shows test results for different groups of people. Find the AI that treats one group unfairly, figure out why, and pick the right fix. 10 cases over 5 levels. 3 lives.',
  connect: 'Real AI teams do <b>fairness testing</b>: they split test results by group instead of trusting one overall score. A high average can hide a big gap. And the fix is usually better, more balanced <b>data</b> plus testing every group again.',
  css: `
.bd-case{background:#0b0620;border-radius:12px;padding:10px 12px;margin-bottom:10px}
.bd-case h3{margin:0 0 4px;font-size:1rem;color:#5ef2ff}
.bd-case .ov{font:800 .9rem ui-monospace,Menlo,monospace;color:#ffd23f}
.bd-bar{display:grid;grid-template-columns:minmax(90px,38%) 1fr;gap:8px;align-items:center;margin:5px 0;font-size:.85rem}
.bd-track{position:relative;height:18px}
.bd-fill{height:18px;border-radius:0 4px 4px 0}
.bd-val{position:absolute;top:0;font:800 .8rem ui-monospace,Menlo,monospace;padding-left:6px}
.bd-cases{display:grid;gap:10px}
@media(min-width:720px){.bd-cases.n2{grid-template-columns:1fr 1fr}.bd-cases.n3{grid-template-columns:1fr 1fr 1fr}}
.bd-q{font-weight:800;margin:8px 0}
.bd-opts{display:grid;gap:8px}
.bd-opts button{text-align:left;min-height:48px}
.bd-msg{min-height:1.5em;font-weight:700;margin-top:8px}
.bd-data{font-size:.85rem;margin:6px 0}
`,
  js: function (el, G) {
    var D = G.D, CASES = window.GAME_DATA || el.__data;
    var lives = 3, score = 0, n = 0;
    function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
    function results(c, fair) {
      // Accuracy per group (percent). Fair = within 3 points. Unfair = a big gap for the rare group.
      var hi = rnd(90, 97);
      var acc = fair ? [hi - rnd(0, 3), hi] : [hi - rnd(18, 30), hi];
      var ov = Math.round((acc[0] * c.data[0] + acc[1] * c.data[1]) / 100);
      return { acc: acc, ov: ov };
    }
    function card(c, R, label, showOv) {
      return '<div class="bd-case"><h3>' + label + c.ai + '</h3><div style="font-size:.85rem">Job: ' + c.task + '</div>' + (showOv ? '<div class="ov">Overall accuracy: ' + R.ov + '%</div>' : '') +
        c.groups.map(function (g, i) { return '<div class="bd-bar"><span>' + g + '</span><div class="bd-track"><div class="bd-fill" style="width:' + (R.acc[i] * 0.8) + '%;background:' + (i ? '#5ef2ff' : '#ff5edb') + '"></div><span class="bd-val" style="left:' + (R.acc[i] * 0.8) + '%">' + R.acc[i] + '%</span></div></div>'; }).join('') + '</div>';
    }
    function ask(q, opts, right, why, then) {
      opts = D.shuffle(opts.map(function (o, i) { return [o, i === 0]; }));
      el.__ans = opts.map(function (o) { return o[1]; }).indexOf(true);
      var box = document.createElement('div');
      box.innerHTML = '<p class="bd-q">' + q + '</p><div class="bd-opts">' + opts.map(function (o, i) { return '<button type="button" class="btn" data-i="' + i + '">' + o[0] + '</button>'; }).join('') + '</div><p class="bd-msg" aria-live="polite"></p>';
      el.appendChild(box);
      var msg = D.$('.bd-msg', box);
      D.$all('button', box).forEach(function (b) {
        b.addEventListener('click', function () {
          var ok = +b.getAttribute('data-i') === el.__ans;
          D.$all('button', box).forEach(function (x) { x.disabled = true; if (+x.getAttribute('data-i') === el.__ans) x.classList.add('primary'); });
          if (ok) { score += 10; D.sfx('good'); msg.textContent = '🔍 ' + right; }
          else { lives--; D.sfx('bad'); msg.textContent = '❌ ' + why; }
          G.hud({ score: score, lives: lives });
          if (lives <= 0) return setTimeout(function () { G.end(score, false, 'Detective tip: never trust one overall score. Compare every group, and look at what data the AI learned from.'); }, 1800);
          setTimeout(then, ok ? 1400 : 2600);
        });
      });
    }
    function nextCase() {
      if (n >= 10) return G.end(score, true, 'Ten cases cracked. You test AI the way fairness engineers do: group by group.');
      var level = Math.floor(n / 2) + 1; n++;
      G.hud({ score: score, level: level, lives: lives });
      var pool = D.shuffle(CASES.slice());
      el.innerHTML = '<p><b>Case ' + n + ' of 10</b></p>';
      if (level <= 2 || level === 4) {
        // Which AI is unfair? From level 2 the unfair one can have the HIGHEST overall score.
        var k = level === 1 ? 2 : 3, cs = pool.slice(0, k), bad = rnd(0, k - 1), Rs;
        for (var t = 0; t < 50; t++) {
          Rs = cs.map(function (c, i) { return results(c, i !== bad); });
          if (level === 1) break;
          var top = Rs.map(function (r) { return r.ov; }), mx = Math.max.apply(null, top);
          if (Rs[bad].ov === mx && top.filter(function (v) { return v === mx; }).length === 1) break;
        }
        el.insertAdjacentHTML('beforeend', '<div class="bd-cases n' + k + '">' + cs.map(function (c, i) { return card(c, Rs[i], ['A', 'B', 'C'][i] + ') ', level >= 2); }).join('') + '</div>');
        var names = cs.map(function (c, i) { return ['A', 'B', 'C'][i] + ') ' + c.ai; });
        var opts = [names[bad]].concat(names.filter(function (_, i) { return i !== bad; }));
        if (level >= 2) opts.push('The one with the lowest overall score');
        ask('Which AI treats one group unfairly?', opts,
          names[bad] + ' has a ' + (Rs[bad].acc[1] - Rs[bad].acc[0]) + '-point gap between groups.' + (level >= 2 && Rs[bad].ov === Math.max.apply(null, Rs.map(function (r) { return r.ov; })) ? ' Its overall score looked the best. The average hid the gap!' : ''),
          'Look for the biggest GAP between the two bars inside one card, not the highest or lowest number.', nextCase);
      } else if (level === 3) {
        var c = pool[0], R = results(c, false);
        el.insertAdjacentHTML('beforeend', card(c, R, '', true) + '<div class="bd-case bd-data"><b>Training data:</b> ' + c.groups[0] + ': ' + c.data[0] + '% of examples · ' + c.groups[1] + ': ' + c.data[1] + '% of examples</div>');
        ask('What is the most likely cause of the gap?', [c.cause, 'The AI dislikes ' + c.groups[0].toLowerCase(), 'The computer was too slow', 'The ' + c.groups[0].toLowerCase() + ' group did something wrong'],
          'Unbalanced training data: the AI barely practiced on that group.', 'AIs don’t have likes or dislikes. Check how much training data each group had.', nextCase);
      } else {
        var c2 = pool[0], R2 = results(c2, false);
        el.insertAdjacentHTML('beforeend', card(c2, R2, '', true));
        ask('You’re on the team. What’s the best fix?', ['Collect more good examples from ' + c2.groups[0].toLowerCase() + ', retrain, then test every group again', 'Just report the overall score so it looks good', 'Remove the ' + c2.groups[0].toLowerCase() + ' from the test so the gap disappears', 'Nothing. Computers are always fair'],
          'Better, balanced data plus re-testing each group. That’s how real teams fix bias.', 'Hiding or deleting a group hides the problem. It doesn’t fix it.', nextCase);
      }
    }
    nextCase();
  },
};
