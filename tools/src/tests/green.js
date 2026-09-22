module.exports = {
  quiz: [
    { q: 'An artificial neuron…', a: ['Multiplies inputs by weights, adds them up, and decides how strongly to fire', 'Is a real brain cell', 'Stores photos', 'Only works with words'], c: 0, why: 'Multiply, add, decide.' },
    { q: 'A weight tells the neuron…', a: ['How much an input matters', 'What color to be', 'When to shut down', 'The final answer'], c: 0, why: 'Bigger weight = more influence.' },
    { q: 'Inputs 1 and 1 with weights 2 and 3, bias −4. Total?', a: ['1', '5', '9', '−4'], c: 0, why: '2 + 3 − 4 = 1.' },
    { q: 'What does the bias do to a neuron’s line?', a: ['Slides it without turning it', 'Deletes it', 'Makes it curved', 'Colors it'], c: 0, why: 'Weights turn it; bias shifts it.' },
    { q: 'ReLU with a total of −7 outputs…', a: ['0', '−7', '7', '1'], c: 0, why: 'ReLU blocks negatives.' },
    { q: 'Why are activation functions needed?', a: ['Without them, stacked neurons act like one straight-line calculation', 'They speed up the internet', 'They make neurons colorful', 'They aren’t needed'], c: 0, why: 'They let networks learn curvy, complex patterns.' },
    { q: 'Why did the XOR puzzle need a network?', a: ['One neuron draws one straight line, and XOR needs more', 'XOR is too big', 'Networks are faster', 'It didn’t'], c: 0, why: 'Layers combine simple lines into complex shapes.' },
    { q: 'What is a hidden layer?', a: ['Neurons between the inputs and the output', 'A secret password', 'Deleted neurons', 'The final answer'], c: 0, why: 'Hidden layers do the middle thinking.' },
    { q: 'Gradient descent means…', a: ['Taking small steps downhill on the error to improve the model', 'Climbing to the highest error', 'Picking random weights', 'Deleting bad data'], c: 0, why: 'Downhill on error = better model.' },
    { q: 'A learning rate that is way too big will…', a: ['Overshoot and make the error worse', 'Always reach the bottom instantly', 'Stop the model forever', 'Delete the weights'], c: 0, why: 'Giant steps jump over the valley.' },
    { q: 'The training loop is…', a: ['Predict → measure loss → nudge weights → repeat', 'Guess once and stop', 'Delete → restart', 'Print → save → quit'], c: 0, why: 'Round and round until the loss is low.' },
    { q: 'What is the loss?', a: ['A score of how wrong the model is', 'Missing data', 'The number of layers', 'Computer speed'], c: 0, why: 'Training shrinks the loss.' },
    { q: 'Gradient descent can get stuck in…', a: ['A small dip that isn’t the deepest valley', 'The internet', 'A hidden layer', 'The bias'], c: 0, why: 'Starting points matter.' },
  ],
  project: {
    title: 'Neuron Engineer',
    intro: 'A coach wants a “Great game?” predictor from two stats: shots on goal and mistakes. Tune ONE neuron so it’s right about all 6 past games.',
    css: `
.ne-sl{display:grid;gap:6px}
.ne-sl label{display:grid;font-weight:700;font-size:.92rem}
.ne-sl input{width:100%;min-height:40px;accent-color:#16a36b}
.ne-tt{width:100%;border-collapse:collapse;margin-top:10px;text-align:center;background:#fff;font-size:.9rem}
.ne-tt th,.ne-tt td{border:1px solid #0d2b1d22;padding:6px}
.ne-tt thead th{background:#0d2b1d;color:#dff7ec}
.ne-tt .ok{background:#e3f6ea}.ne-tt .no{background:#fde7e4}
.ne-eq{font-family:ui-monospace,Menlo,monospace;background:var(--bg2);border-radius:12px;padding:8px 10px;font-size:.88rem;margin:8px 0}
`,
    js: function (el, api) {
      var D = api.D, S = api.load(), W = S.w || { a: 0, b: 0, c: 0 }, stage = S.stage || 0;
      var G = [[8, 2, 1], [5, 1, 1], [9, 5, 1], [3, 4, 0], [6, 5, 0], [2, 1, 0]];
      el.innerHTML = '<div class="ne-sl">' + [['a', '⚽ Weight for shots', -2, 2], ['b', '😬 Weight for mistakes', -2, 2], ['c', '➕ Bias', -5, 5]].map(function (s) { return '<label>' + s[1] + ': <b data-v="' + s[0] + '"></b><input type="range" data-w="' + s[0] + '" min="' + s[2] + '" max="' + s[3] + '" step="0.5" value="' + W[s[0]] + '"></label>'; }).join('') +
        '</div><p class="ne-eq" id="ne-eq"></p><table class="ne-tt"><caption class="sr-only">Past games</caption><thead><tr><th scope="col">Game</th><th scope="col">Shots</th><th scope="col">Mistakes</th><th scope="col">Total</th><th scope="col">Neuron says</th><th scope="col">Really</th></tr></thead><tbody id="ne-tt"></tbody></table><div id="ne-q" aria-live="polite"></div>';
      function draw() {
        var right = 0;
        D.$('#ne-tt', el).innerHTML = G.map(function (g, i) { var t = W.a * g[0] + W.b * g[1] + W.c, p = t > 0 ? 1 : 0, ok = p === g[2]; if (ok) right++; return '<tr class="' + (ok ? 'ok' : 'no') + '"><td>' + (i + 1) + '</td><td>' + g[0] + '</td><td>' + g[1] + '</td><td>' + t + '</td><td>' + (p ? '🌟 Great' : '😐 Not great') + '</td><td>' + (g[2] ? '🌟' : '😐') + '</td></tr>'; }).join('');
        ['a', 'b', 'c'].forEach(function (k) { D.$('[data-v="' + k + '"]', el).textContent = W[k]; });
        D.$('#ne-eq', el).innerHTML = 'total = ' + W.a + ' × shots + ' + W.b + ' × mistakes + ' + W.c + ' → Great if total &gt; 0 · <b>' + right + '/6 correct</b>';
        if (right === 6 && stage === 0) { stage = 1; api.save({ stage: 1 }); D.sfx('good'); }
        question();
      }
      function question() {
        var box = D.$('#ne-q', el);
        if (stage === 0) { box.innerHTML = '<p class="feedback">Tip: should mistakes push the total UP or DOWN?</p>'; return; }
        if (stage === 1) {
          box.innerHTML = '<div class="ne-eq" style="font-family:inherit"><p><b>✅ 6/6! Final question:</b> Your weight for mistakes is negative. What does that mean?</p><div class="row">' + D.shuffle([[1, 'More mistakes make a great game LESS likely'], [0, 'Mistakes don’t matter'], [0, 'More mistakes make a great game MORE likely']]).map(function (o) { return '<button type="button" class="btn small" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p></div>';
          D.$all('[data-ok]', box).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-ok') === '1') { stage = 2; api.save({ stage: 2 }); D.sfx('win'); question(); } else { D.sfx('bad'); b.disabled = true; box.querySelector('.feedback').className = 'feedback no'; box.querySelector('.feedback').textContent = 'A negative weight pushes the total down.'; } }); });
          return;
        }
        box.innerHTML = '<p class="feedback ok">🏆 Neuron engineered! You chose weights and a bias that fit real data, which is exactly what training does automatically.</p>'; api.done();
      }
      D.$all('[data-w]', el).forEach(function (r) { r.addEventListener('input', function () { W[r.getAttribute('data-w')] = +r.value; api.save({ w: W }); draw(); }); });
      draw();
    },
  },
};
