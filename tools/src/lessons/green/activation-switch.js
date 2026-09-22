module.exports = {
  hook: 'A neuron adds things up, then its activation function decides what comes out. Meet the three most famous switches.',
  story: [
    ['sensei', 'After a neuron adds up its weighted inputs, it has one number: the <b>total</b>. What happens next, {{nick}}?'],
    ['sensei', 'The total passes through an <b>activation function</b>, a rule that turns it into the neuron’s output. Different neurons use different rules.'],
    ['you', 'Why not just output the total?'],
    ['sensei', 'Great question, and you’ll answer it yourself at the end. First, meet the three most famous activation functions: <b>Step</b>, <b>ReLU</b> and <b>Sigmoid</b>.'],
  ],
  activity: {
    title: 'The Switch Lab',
    instructions: 'Slide the total from −6 to 6 and watch the three outputs. Then match each function to its description.',
    css: `
.as-graphs{display:grid;gap:10px}
@media(min-width:640px){.as-graphs{grid-template-columns:repeat(3,1fr)}}
.as-g{background:#fff;border-radius:16px;border:2px solid #0d2b1d18;padding:8px;text-align:center}
.as-g svg{width:100%;height:auto;display:block}
.as-g b{display:block}
.as-g .val{font:800 1.1rem ui-monospace,Menlo,monospace;color:#0b6e8a}
.as-sl{margin:12px 0}
.as-sl input{width:100%;min-height:44px;accent-color:#16a36b}
.as-match{display:grid;gap:8px}
.as-q{background:var(--bg2);border-radius:14px;padding:10px 12px}
.as-q p{margin:0 0 6px;font-weight:700}
.as-q .row button{flex:1 1 90px}
.as-q.ok{background:#e3f6ea}
`,
    js: function (el, api) {
      var D = api.D;
      var F = {
        step: { name: 'Step', f: function (z) { return z > 0 ? 1 : 0; }, lo: 0, hi: 1 },
        relu: { name: 'ReLU', f: function (z) { return Math.max(0, z); }, lo: 0, hi: 6 },
        sig: { name: 'Sigmoid', f: function (z) { return 1 / (1 + Math.exp(-z)); }, lo: 0, hi: 1 },
      };
      var S = api.load(), z = S.z != null ? S.z : -2, got = S.got || {};
      var Q = [['all', 'An all-or-nothing switch: outputs exactly 0 or 1.', 'step'], ['pass', 'Blocks negatives (outputs 0) but lets positive totals pass straight through.', 'relu'], ['smooth', 'A smooth S-curve that squeezes any total into a number between 0 and 1.', 'sig']];
      el.innerHTML = '<div class="as-sl"><label for="as-z"><b>Total going into the neuron: <span id="as-zv"></span></b></label><input id="as-z" type="range" min="-6" max="6" step="0.5" value="' + z + '"></div><div class="as-graphs" id="as-graphs"></div><h3 style="margin-top:14px">Match them!</h3><div class="as-match">' +
        Q.map(function (q) { return '<div class="as-q" data-q="' + q[0] + '"><p>' + q[1] + '</p><div class="row">' + Object.keys(F).map(function (k) { return '<button type="button" class="btn small" data-f="' + k + '">' + F[k].name + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p></div>'; }).join('') + '</div><div id="as-final" aria-live="polite"></div>';
      function graphs() {
        z = +D.$('#as-z', el).value; D.$('#as-zv', el).textContent = z;
        D.$('#as-graphs', el).innerHTML = Object.keys(F).map(function (k) {
          var fn = F[k], W = 160, H = 110, X = function (v) { return 10 + (v + 6) / 12 * (W - 20); }, Y = function (v) { return H - 14 - (v - fn.lo) / (fn.hi - fn.lo) * (H - 28); };
          var d = ''; for (var i = 0; i <= 96; i++) { var v = -6 + i / 8; d += (i ? 'L' : 'M') + X(v).toFixed(1) + ' ' + Y(fn.f(v)).toFixed(1); }
          var o = fn.f(z);
          return '<div class="as-g"><b>' + fn.name + '</b><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + fn.name + ' graph. At total ' + z + ' the output is ' + o.toFixed(2) + '"><line x1="' + X(0) + '" y1="6" x2="' + X(0) + '" y2="' + (H - 10) + '" stroke="#0d2b1d22"/><line x1="10" y1="' + Y(fn.lo) + '" x2="' + (W - 10) + '" y2="' + Y(fn.lo) + '" stroke="#0d2b1d22"/><path d="' + d + '" fill="none" stroke="#16a36b" stroke-width="3"/><circle cx="' + X(z) + '" cy="' + Y(o) + '" r="7" fill="#ffd23f" stroke="#0d2b1d" stroke-width="2"/></svg><span class="val">out = ' + (Math.round(o * 100) / 100) + '</span></div>';
        }).join('');
      }
      function final() {
        var box = D.$('#as-final', el);
        if (Object.keys(got).length < 3) return;
        if (got.why) { box.innerHTML = '<p class="feedback ok">🏆 Switch Lab complete! Activation functions give networks their power to learn curvy, complicated patterns.</p>'; api.done(); return; }
        box.innerHTML = '<div class="as-q"><p>Final question: why not just output the total, with no activation function?</p><div class="row">' + D.shuffle([[1, 'Without them, stacking many neurons still acts like ONE straight-line calculation'], [0, 'Activation functions make the computer faster'], [0, 'There is no reason — they’re just decoration']]).map(function (o) { return '<button type="button" class="btn small" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p></div>';
        D.$all('[data-ok]', box).forEach(function (b) { b.addEventListener('click', function () { var f = box.querySelector('.feedback'); if (b.getAttribute('data-ok') === '1') { got.why = 1; api.save({ got: got }); D.sfx('win'); final(); } else { D.sfx('bad'); b.disabled = true; f.className = 'feedback no'; f.textContent = 'Think about the XOR puzzle: straight lines weren’t enough.'; } }); });
      }
      D.$('#as-z', el).addEventListener('input', function () { api.save({ z: +this.value }); graphs(); });
      D.$all('.as-q[data-q]', el).forEach(function (box) {
        var q = Q.filter(function (x) { return x[0] === box.getAttribute('data-q'); })[0];
        function mark() { box.classList.add('ok'); box.querySelector('.feedback').className = 'feedback ok'; box.querySelector('.feedback').textContent = '✅ ' + F[q[2]].name + '!'; D.$all('button', box).forEach(function (x) { x.disabled = true; }); }
        if (got[q[0]]) mark();
        D.$all('button', box).forEach(function (b) {
          b.addEventListener('click', function () {
            if (b.getAttribute('data-f') === q[2]) { got[q[0]] = 1; api.save({ got: got }); D.sfx('good'); mark(); final(); }
            else { D.sfx('bad'); b.disabled = true; var f = box.querySelector('.feedback'); f.className = 'feedback no'; f.textContent = 'Slide the total and watch the shapes again.'; }
          });
        });
      });
      graphs(); final();
    },
  },
  quiz: [
    { q: 'What does an activation function do?', a: ['Turns a neuron’s total into its output', 'Turns the computer on', 'Adds more data', 'Labels the examples'], c: 0, why: 'Total in → activation rule → output.' },
    { q: 'ReLU gets a total of −3. What does it output?', a: ['0', '−3', '3', '1'], c: 0, why: 'ReLU turns every negative into 0.' },
    { q: 'ReLU gets a total of 4. What does it output?', a: ['4', '0', '1', '−4'], c: 0, why: 'Positive totals pass straight through.' },
    { q: 'Which activation squeezes any number into a smooth value between 0 and 1?', a: ['Sigmoid', 'ReLU', 'Step', 'None'], c: 0, why: 'Sigmoid is the smooth S-curve.' },
  ],
  challenge: {
    title: 'Chain Reaction',
    intro: 'Neurons pass outputs to other neurons. Trace the numbers through! Get 2 of 3.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'Neuron A (ReLU) gets a total of 5. Its output goes to neuron B with weight 2, and B has a bias of −4. What is B’s total?', a: ['6', '10', '1', '−4'], c: 0, why: 'A outputs 5 (ReLU). 5 × 2 − 4 = 6.' },
        { q: 'Neuron A (ReLU) gets −5 instead. Same weight 2 and bias −4 for B. What is B’s total?', a: ['−4', '−14', '6', '0'], c: 0, why: 'ReLU outputs 0, so 0 × 2 − 4 = −4.' },
        { q: 'If B uses a Step activation (fires only if its total > 0), does B fire in each case?', a: ['Yes when A got 5; no when A got −5', 'Yes both times', 'No both times', 'Only when A got −5'], c: 0, why: 'B’s totals were 6 (fires) and −4 (no fire).' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 2) api.done(); } });
    },
  },
};
