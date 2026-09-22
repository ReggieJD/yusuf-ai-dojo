module.exports = {
  hook: 'A decision tree is a machine that plays 20 Questions. Build one that predicts whether dojo training moves outside, and aim for a perfect score.',
  story: [
    ['sensei', 'When the weather is nice, our dojo trains outside, {{nick}}. I’ve kept records of 8 days: the weather, and whether we trained outside.'],
    ['sensei', 'A <b>decision tree</b> is a model made of yes/no questions. Each answer sends you down a branch until you reach a decision, called a <b>leaf</b>.'],
    ['you', 'Like a flowchart!'],
    ['sensei', 'Exactly. Your job: pick the questions. The tree fills in each leaf with whatever happened most often on those days. Can you build a tree that gets all 8 days right?'],
  ],
  activity: {
    title: 'Grow a Decision Tree',
    instructions: 'Choose the first question (the root). Then choose a follow-up question for each branch, or let it decide right there. Aim for 8/8.',
    css: `
.dt-tree{display:grid;gap:10px;text-align:center}
.dt-node{display:inline-block;background:#1c5d99;color:#fff;border-radius:14px;padding:8px 10px;font-weight:800;max-width:100%}
.dt-node select{margin-top:6px;width:100%;min-height:44px;border-radius:10px;border:2px solid #fff;font:700 .92rem var(--font-body);color:#2b1a0e;background:#fffaf4}
.dt-kids{display:grid;grid-template-columns:1fr 1fr;gap:10px;position:relative}
.dt-branch{border:2px dashed #2b1a0e44;border-radius:14px;padding:8px;background:#fffaf4}
.dt-branch .yn{font-weight:900;color:#e8590c;display:block;margin-bottom:4px}
.dt-leaf{display:inline-block;margin:4px 2px 0;padding:6px 10px;border-radius:999px;font-weight:800;font-size:.9rem}
.dt-leaf.y{background:#caffbf}.dt-leaf.n{background:#ffd6d6}
.dt-sub{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:6px;font-size:.8rem}
.dt-days{width:100%;border-collapse:collapse;margin-top:12px;font-size:.88rem;background:#fff}
.dt-days th,.dt-days td{border:1px solid #2b1a0e22;padding:5px;text-align:center}
.dt-days thead th{background:#2b1a0e;color:#fff}
.dt-days .ok{background:#e3f6ea}.dt-days .no{background:#fde7e4}
.dt-wrap{overflow-x:auto}
`,
    js: function (el, api) {
      var D = api.D;
      var Q = { rain: '☔ Is it raining?', wind: '💨 Is it windy?', hot: '🥵 Hotter than 30 °C?', mon: '📅 Is it Monday?' };
      // [rain, wind, hot, monday, trainedOutside]
      var DAYS = [[0, 0, 0, 1, 1], [1, 0, 0, 0, 0], [0, 1, 0, 0, 0], [0, 0, 1, 0, 1], [1, 1, 0, 1, 0], [0, 0, 0, 0, 1], [0, 1, 1, 1, 0], [1, 0, 1, 0, 0]];
      var IDX = { rain: 0, wind: 1, hot: 2, mon: 3 };
      var S = api.load(), T = S.tree || { root: '', yes: '', no: '' };
      function majority(rows) { if (!rows.length) return 1; var y = rows.filter(function (r) { return r[4]; }).length; return y * 2 >= rows.length ? 1 : 0; }
      function leaf(rows) { var v = majority(rows); return '<span class="dt-leaf ' + (v ? 'y' : 'n') + '">' + (v ? '🌤️ Outside' : '🏠 Inside') + ' <small>(' + rows.length + ' day' + (rows.length === 1 ? '' : 's') + ')</small></span>'; }
      function predict(r) {
        if (!T.root) return majority(DAYS);
        var branch = r[IDX[T.root]] ? 'yes' : 'no', rows = DAYS.filter(function (d) { return d[IDX[T.root]] === r[IDX[T.root]]; });
        var q = T[branch];
        if (!q) return majority(rows);
        return majority(rows.filter(function (d) { return d[IDX[q]] === r[IDX[q]]; }));
      }
      function sel(name, val, allowLeaf) {
        return '<select data-n="' + name + '" aria-label="' + (name === 'root' ? 'Root question' : 'Question for the ' + name + ' branch') + '"><option value="">' + (allowLeaf ? '🍃 Decide here (leaf)' : 'Pick the first question…') + '</option>' + Object.keys(Q).map(function (k) { return '<option value="' + k + '"' + (k === val ? ' selected' : '') + '>' + Q[k] + '</option>'; }).join('') + '</select>';
      }
      function render() {
        var h = '<div class="dt-tree"><div><div class="dt-node">ROOT' + sel('root', T.root, false) + '</div></div>';
        if (T.root) {
          h += '<div class="dt-kids">' + ['yes', 'no'].map(function (b) {
            var rows = DAYS.filter(function (d) { return d[IDX[T.root]] === (b === 'yes' ? 1 : 0); });
            var inner = '<span class="yn">' + (b === 'yes' ? 'YES ↙' : 'NO ↘') + '</span><div class="dt-node" style="background:#6b4a33">' + sel(b, T[b], true) + '</div>';
            if (T[b]) { var q = IDX[T[b]]; inner += '<div class="dt-sub"><div><b>yes</b><br>' + leaf(rows.filter(function (d) { return d[q]; })) + '</div><div><b>no</b><br>' + leaf(rows.filter(function (d) { return !d[q]; })) + '</div></div>'; }
            else inner += '<div>' + leaf(rows) + '</div>';
            return '<div class="dt-branch">' + inner + '</div>';
          }).join('') + '</div>';
        }
        h += '</div>';
        var right = 0;
        var tbl = '<div class="dt-wrap"><table class="dt-days"><caption class="sr-only">Training records</caption><thead><tr><th scope="col">Day</th><th scope="col">☔</th><th scope="col">💨</th><th scope="col">🥵</th><th scope="col">Mon?</th><th scope="col">Really</th><th scope="col">Tree says</th></tr></thead><tbody>' +
          DAYS.map(function (d, i) { var p = predict(d), ok = p === d[4]; if (ok) right++; return '<tr class="' + (ok ? 'ok' : 'no') + '"><td>' + (i + 1) + '</td><td>' + (d[0] ? 'yes' : '–') + '</td><td>' + (d[1] ? 'yes' : '–') + '</td><td>' + (d[2] ? 'yes' : '–') + '</td><td>' + (d[3] ? 'yes' : '–') + '</td><td>' + (d[4] ? '🌤️' : '🏠') + '</td><td>' + (p ? '🌤️' : '🏠') + (ok ? ' ✓' : ' ✗') + '</td></tr>'; }).join('') + '</tbody></table></div>';
        el.innerHTML = h + tbl + '<p class="feedback" id="dt-fb" aria-live="polite"></p>';
        var fb = D.$('#dt-fb', el);
        fb.className = 'feedback ' + (right === 8 ? 'ok' : '');
        fb.innerHTML = '🎯 Tree accuracy: <b>' + right + '/8</b>' + (right === 8 ? ' — perfect! Your tree learned the rule: train outside only when it’s <b>not raining AND not windy</b>. Heat and Mondays didn’t matter, and your tree figured that out from the data.' : T.root === 'mon' || T.root === 'hot' ? ' — hmm, does that question really split outside days from inside days?' : ' — keep growing!');
        if (right === 8) api.done();
        D.$all('select', el).forEach(function (s) {
          s.addEventListener('change', function () { var n = s.getAttribute('data-n'); T[n] = s.value; if (n === 'root') { T.yes = ''; T.no = ''; } api.save({ tree: T }); D.sfx('click'); render(); var again = D.$('select[data-n="' + n + '"]', el); if (again) again.focus(); });
        });
      }
      render();
    },
  },
  quiz: [
    { q: 'What is a decision tree?', a: ['A model that decides by asking a series of yes/no questions', 'A real tree with sensors', 'A list of random guesses', 'A type of chart'], c: 0, why: 'Each question splits the data until a decision (a leaf) is reached.' },
    { q: 'Which question was most useless for predicting outdoor training?', a: ['Is it Monday?', 'Is it raining?', 'Is it windy?', 'All were equally useful'], c: 0, why: 'The day of the week had nothing to do with the outcome.' },
    { q: 'What is a “leaf” in a decision tree?', a: ['The end of a branch, where the tree gives its answer', 'The first question', 'A bug', 'A missing value'], c: 0, why: 'Questions are branches; answers are leaves.' },
    { q: 'Why do people like decision trees?', a: ['You can read them and see exactly WHY the model decided', 'They never make mistakes', 'They don’t need data', 'They only work outdoors'], c: 0, why: 'Trees are “explainable”: you can follow each step. Many AI models are much harder to explain.' },
  ],
  challenge: {
    title: 'The Best First Question',
    intro: 'Good trees ask the most useful question first: the one that splits the data into the “purest” groups. Get 2 of 3.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'You must guess a secret animal from 8: cat, dog, eagle, owl, shark, salmon, snake, lizard. Best FIRST question?', a: ['“Does it have feathers, fur, fins or scales?” (splits into 4 groups of 2)', '“Is it a cat?”', '“Is its name 3 letters long?”', '“Is it an owl?”'], c: 0, why: 'A question that splits the group evenly cuts the possibilities fastest.' },
        { q: 'A question sends 8 “outside” days left and 8 “inside” days right. Is that a great split?', a: ['Yes — each side is pure (only one answer)', 'No — the groups are the same size', 'It depends on the day of the week', 'Trees can’t split 16 days'], c: 0, why: 'Pure groups mean the tree can decide right away.' },
        { q: 'Why not grow a tree with a separate branch for every single day in the data?', a: ['It would memorize those exact days and overfit', 'Trees can only have 2 branches', 'It would be too colorful', 'It would never finish'], c: 0, why: 'Super-deep trees memorize. Real systems limit how deep trees can grow.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 2) api.done(); } });
    },
  },
};
