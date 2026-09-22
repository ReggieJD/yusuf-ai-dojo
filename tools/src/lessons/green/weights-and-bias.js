// Shared "linear neuron" playground used by the activity and the challenge.
function linearGame(el, api, levels, saveKey) {
  var D = api.D;
  var S = api.load(), st = S[saveKey] || {}, lv = st.lv || 0, beaten = st.beaten || {}, W = { w1: 0, w2: 0, b: 0 };
  el.innerHTML = '<div class="lg"><div class="lg-head"><b data-l="title"></b><span class="pill" data-l="acc"></span></div><div class="lg-plot" data-l="plot"></div>' +
    '<div class="lg-sl">' + [['w1', 'Weight 1 (→ across)', -2, 2, 0.5], ['w2', 'Weight 2 (↑ up)', -2, 2, 0.5], ['b', 'Bias (shift)', -5, 5, 0.5]].map(function (s) { return '<label><span>' + s[1] + ': <b data-l="v-' + s[0] + '">0</b></span><input type="range" data-w="' + s[0] + '" min="' + s[2] + '" max="' + s[3] + '" step="' + s[4] + '" value="0"></label>'; }).join('') + '</div>' +
    '<p class="lg-eq" data-l="eq"></p><p class="feedback" data-l="fb" aria-live="polite"></p><div class="row" data-l="nav"></div></div>';
  function L() { return levels[lv]; }
  function out(p) { return W.w1 * p[0] + W.w2 * p[1] + W.b; }
  function draw() {
    var l = L(), N = 20, size = 300, cell = size / N, sc = function (v) { return (v + 5) / 10 * size; }, h = '';
    for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) { var x = -5 + (i + 0.5) * 10 / N, y = 5 - (j + 0.5) * 10 / N; h += '<rect x="' + (i * cell) + '" y="' + (j * cell) + '" width="' + (cell + 0.5) + '" height="' + (cell + 0.5) + '" fill="' + (out([x, y]) > 0 ? '#caf0dc' : '#fde2e2') + '"/>'; }
    var right = 0;
    var pts = l.pts.map(function (p) { var ok = (out(p) > 0) === !!p[2]; if (ok) right++; var cx = sc(p[0]), cy = size - sc(p[1]); return p[2] ? '<circle cx="' + cx + '" cy="' + cy + '" r="10" fill="#16a36b" stroke="' + (ok ? '#0d2b1d' : '#b3261e') + '" stroke-width="' + (ok ? 2 : 4) + '"/>' : '<rect x="' + (cx - 9) + '" y="' + (cy - 9) + '" width="18" height="18" fill="#d64545" stroke="' + (ok ? '#0d2b1d' : '#b3261e') + '" stroke-width="' + (ok ? 2 : 4) + '"/>'; }).join('');
    D.$('[data-l="plot"]', el).innerHTML = '<svg viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="Plot with ' + l.pts.length + ' points. Green circles should land in the green zone, red squares in the red zone. ' + right + ' of ' + l.pts.length + ' are correct.">' + h + '<line x1="0" y1="150" x2="300" y2="150" stroke="#0d2b1d22"/><line x1="150" y1="0" x2="150" y2="300" stroke="#0d2b1d22"/>' + pts + '</svg>';
    D.$('[data-l="acc"]', el).textContent = right + ' / ' + l.pts.length + ' correct';
    D.$('[data-l="eq"]', el).innerHTML = 'Neuron: <b>' + W.w1 + '</b> × across + <b>' + W.w2 + '</b> × up + <b>' + W.b + '</b> &gt; 0 → 🟢';
    ['w1', 'w2', 'b'].forEach(function (k) { D.$('[data-l="v-' + k + '"]', el).textContent = W[k]; });
    return right === l.pts.length;
  }
  function nav() {
    D.$('[data-l="nav"]', el).innerHTML = levels.map(function (l, i) { return '<button type="button" class="btn small" data-g="' + i + '" ' + (i > 0 && !beaten[i - 1] && !beaten[i] ? 'disabled' : '') + ' aria-current="' + (i === lv) + '">' + (beaten[i] ? '✅ ' : '') + l.name + '</button>'; }).join('');
    D.$all('[data-g]', el).forEach(function (b) { b.addEventListener('click', function () { load(+b.getAttribute('data-g')); }); });
  }
  function persist() { var o = {}; o[saveKey] = { lv: lv, beaten: beaten, w: W }; api.save(o); }
  function load(i, keepW) {
    lv = i; if (!keepW) W = { w1: 0, w2: 0, b: 0 };
    D.$all('[data-w]', el).forEach(function (r) { r.value = W[r.getAttribute('data-w')]; });
    D.$('[data-l="title"]', el).textContent = L().title;
    var fb = D.$('[data-l="fb"]', el); fb.className = 'feedback'; fb.innerHTML = L().hint;
    nav(); draw(); persist(); if (L().impossible) impossible();
  }
  function impossible() {
    var fb = D.$('[data-l="fb"]', el);
    fb.innerHTML = L().hint + '<div class="row" style="margin-top:8px"><button type="button" class="btn small" data-imp="1">🚫 Impossible with one straight line!</button></div>';
    D.$('[data-imp]', el).addEventListener('click', function () { fb.className = 'feedback ok'; fb.innerHTML = '✅ Correct! One neuron can only draw ONE straight line, and no single line separates these. This puzzle (called <b>XOR</b>) is famous. The fix: connect several neurons into a <b>network</b>. That’s your next lesson!'; win(); });
  }
  function win() {
    beaten[lv] = true; persist(); D.sfx('win'); nav();
    if (levels.every(function (_, i) { return beaten[i]; })) api.done();
    else if (lv + 1 < levels.length) { var fb = D.$('[data-l="fb"]', el); fb.insertAdjacentHTML('beforeend', ' <button type="button" class="btn small primary" data-next>Next level →</button>'); D.$('[data-next]', el).addEventListener('click', function () { load(lv + 1); }); }
  }
  D.$all('[data-w]', el).forEach(function (r) {
    r.addEventListener('input', function () {
      W[r.getAttribute('data-w')] = +r.value; persist();
      var ok = draw();
      if (ok && !L().impossible && !beaten[lv]) { var fb = D.$('[data-l="fb"]', el); fb.className = 'feedback ok'; fb.innerHTML = '✅ ' + L().win; win(); }
    });
  });
  if (st.w) W = st.w;
  load(lv, true);
}

const LG_CSS = `
.lg-head{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap}
.lg-plot{max-width:340px;margin:0 auto;border-radius:16px;overflow:hidden;border:3px solid #0d2b1d}
.lg-plot svg{display:block;width:100%;height:auto}
.lg-sl{display:grid;gap:6px;margin-top:10px}
.lg-sl label{display:grid;gap:2px;font-weight:700;font-size:.92rem}
.lg-sl input{width:100%;min-height:40px;accent-color:#16a36b}
.lg-eq{font-family:ui-monospace,Menlo,monospace;background:var(--bg2);border-radius:12px;padding:8px 10px;font-size:.9rem;margin:8px 0}
[data-l="nav"] [aria-current="true"]{background:var(--accent);color:var(--accent-ink)}
`;

module.exports = {
  hook: 'Weights tilt the line. Bias slides it. Use three sliders to teach a neuron to separate green from red, with no math degree required.',
  story: [
    ['sensei', 'Last lesson, the weights were fixed. Now YOU control them, {{nick}}.'],
    ['sensei', 'When a neuron looks at two numbers, like how far across and how far up a point is, it’s really drawing a <b>line</b>. Points on one side make it fire (green). Points on the other side don’t (red).'],
    ['you', 'And the sliders move the line?'],
    ['sensei', 'Yes! The <b>weights</b> turn and tilt the line. The <b>bias</b> slides it without turning it, like moving the starting line on a track. <b>Training</b> an AI means finding good values for exactly these numbers, just automatically.'],
  ],
  activity: {
    title: 'Slide the Line',
    instructions: 'Move the sliders until every 🟢 green circle sits in the green zone and every 🟥 red square sits in the red zone. Beat both levels.',
    css: LG_CSS,
    js: new Function('el', 'api', linearGame.toString() + `
      linearGame(el, api, [
        { name: 'Level 1', title: 'Level 1 · Left vs right', pts: [[3, 2, 1], [4, -1, 1], [2, -3, 1], [3.5, 0.5, 1], [-2, 1, 0], [-3, -2, 0], [-1, 3, 0], [0, -1, 0]], hint: 'Green points are on the RIGHT. Which weight cares about “across”? Then use the bias to slide the line.', win: 'Weight 1 made “across” matter, and the bias slid the line into place.' },
        { name: 'Level 2', title: 'Level 2 · The diagonal', pts: [[3, 2, 1], [1, 4, 1], [4, 0.5, 1], [2, 2, 1], [0, 0, 0], [-2, 1, 0], [1, -2, 0], [-1, -3, 0]], hint: 'Now green is up AND to the right. You’ll need BOTH weights, then slide with the bias.', win: 'Two weights tilted the line diagonally. You trained a neuron by hand!' },
      ], 'act');`),
  },
  quiz: [
    { q: 'In the playground, what did changing the weights do to the line?', a: ['Turned and tilted it', 'Changed its color', 'Deleted points', 'Nothing'], c: 0, why: 'Weights control the line’s direction.' },
    { q: 'What did the bias do?', a: ['Slid the line without turning it', 'Made the line curvy', 'Added more points', 'Changed the labels'], c: 0, why: 'Bias shifts the line, like moving a starting line.' },
    { q: 'What does “training” an AI mostly mean?', a: ['Automatically finding good values for weights and biases', 'Teaching it to exercise', 'Adding more colors', 'Deleting the data'], c: 0, why: 'Training = tuning millions of weights and biases so the model makes fewer mistakes.' },
    { q: 'Big AI models can have…', a: ['Billions of weights', 'Exactly three weights', 'No weights', 'Only biases'], c: 0, why: 'Large language models have billions of adjustable numbers.' },
  ],
  challenge: {
    title: 'Expert Levels',
    intro: 'Two harder puzzles. One is solvable. One might be impossible… if you think so, say so!',
    css: LG_CSS,
    js: new Function('el', 'api', linearGame.toString() + `
      linearGame(el, api, [
        { name: 'Level 3', title: 'Level 3 · Upside-down diagonal', pts: [[3, 0, 1], [2, -2, 1], [4, 1, 1], [0, -3, 1], [0, 0, 0], [-2, 1, 0], [1, 2, 0], [-3, -3, 0]], hint: 'Green is to the lower right. Try a NEGATIVE weight!', win: 'A negative weight flipped the direction. Nice!' },
        { name: 'Level 4', title: 'Level 4 · The XOR puzzle', impossible: true, pts: [[3, 3, 1], [-3, -3, 1], [3, -3, 0], [-3, 3, 0]], hint: 'Green in two opposite corners, red in the other two. Try to separate them with the sliders…' },
      ], 'ch');`),
  },
};
