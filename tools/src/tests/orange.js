module.exports = {
  quiz: [
    { q: 'What does a classifier do?', a: ['Sorts examples into classes', 'Draws charts', 'Stores passwords', 'Makes music'], c: 0, why: 'Classifiers sort things into groups.' },
    { q: 'What are features?', a: ['The measurements a model uses to decide, like shine or size', 'The labels', 'The test set', 'Bugs'], c: 0, why: 'Features are the model’s clues.' },
    { q: 'Why keep a hidden test set?', a: ['To check the model on examples it has never seen', 'To train faster', 'To hide mistakes', 'It isn’t needed'], c: 0, why: 'Only unseen data gives an honest score.' },
    { q: 'A model is tested on its own training data and scores 100%. This…', a: ['Doesn’t prove it learned — it may have memorized', 'Proves it’s perfect', 'Means the test set is broken', 'Is impossible'], c: 0, why: 'Seen questions can’t measure learning.' },
    { q: 'What is 36 right out of 40 as accuracy?', a: ['90%', '36%', '40%', '80%'], c: 0, why: '36 ÷ 40 = 0.9.' },
    { q: 'If only 2 of 100 cases are the rare, important class, a model that always says “not important” scores…', a: ['98% accuracy, while catching none of the important cases', '2%', '50%', '0%'], c: 0, why: 'Accuracy can hide total failure on rare cases.' },
    { q: 'Overfitting means…', a: ['Memorizing training data so the model fails on new data', 'A model that’s too simple', 'Too much test data', 'A broken computer'], c: 0, why: 'Memorizing ≠ understanding.' },
    { q: 'Training score 99%, test score 60%. Diagnosis?', a: ['Overfitting', 'Underfitting', 'A perfect model', 'A data type'], c: 0, why: 'A huge gap = overfitting.' },
    { q: 'A decision tree decides by…', a: ['Asking a series of yes/no questions', 'Rolling dice', 'Copying the last answer', 'Guessing colors'], c: 0, why: 'Questions lead down branches to a leaf.' },
    { q: 'Why are decision trees easy to explain?', a: ['You can follow each question to see why it decided', 'They are always right', 'They have no questions', 'They use no data'], c: 0, why: 'Their reasoning is visible.' },
    { q: 'k-nearest neighbors labels a new example using…', a: ['The labels of the most similar known examples', 'Random guesses', 'The biggest number', 'The last example added'], c: 0, why: 'Neighbors vote.' },
    { q: 'Why might k = 5 be safer than k = 1?', a: ['One unusual example can’t decide on its own', 'Five is lucky', 'It uses less data', 'It never makes mistakes'], c: 0, why: 'More voters smooth out weird examples.' },
    { q: 'What is a data leak?', a: ['When test answers sneak into training and make scores look too good', 'A spilled drink on a laptop', 'Missing data', 'A kind of chart'], c: 0, why: 'Leaks make models seem better than they are.' },
  ],
  project: {
    title: 'Model Maker',
    intro: 'A fruit shop wants an AI that spots ripe mangoes. Lead the project from data to a trustworthy score.',
    css: `
.mm-step{background:var(--bg2);border-radius:12px;padding:12px;margin-bottom:12px}
.mm-step.done{background:#e3f6ea}
.mm-step .row button{flex:1 1 160px;text-align:left}
.mm-score{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}
.mm-score div{background:#fff;border-radius:10px;padding:8px;text-align:center;font-weight:800}
.mm-score b{font-size:1.5rem;display:block}
`,
    js: function (el, api) {
      var D = api.D, S = api.load(), step = S.step || 0;
      var STEPS = [
        { q: '<b>1 · Split the data.</b> You have 100 labeled mango photos. How do you split them?', o: [['Train on 80, lock 20 away for the final test', 1], ['Train on all 100, then test on the same 100', 0], ['Test on 95, train on only 5', 0]], ok: 'Most data for learning, plus a hidden set for an honest test.', no: 'Think: honest test, AND enough data to learn from.' },
        { q: '<b>2 · Choose features.</b> Which features should the model look at?', o: [['Skin color and softness', 1], ['The sticker brand on the mango', 0], ['The photo’s file name', 0]], ok: 'Color and softness really change as mangoes ripen.', no: 'Would that clue actually change when a mango ripens?' },
        { q: '<b>3 · Diagnose.</b> Your first model scores <b>99% on training</b> but <b>61% on the hidden test</b>. What’s wrong, and what’s a good fix?', o: [['Overfitting — use a simpler model or more varied training photos', 1], ['Underfitting — make it way more complex', 0], ['Nothing — report 99%!', 0]], ok: 'A big train/test gap means memorizing. Simplify, or give it more varied data.', no: 'Compare the two scores. What does a huge gap mean?' },
        { q: '<b>4 · Final score.</b> The improved model gets 17 of the 20 hidden test photos right. What accuracy do you report?', o: [['85%', 1], ['17%', 0], ['99%', 0], ['100%', 0]], ok: '17 ÷ 20 = 0.85 = 85%, an honest score from unseen data. Ship it (and keep testing)!', no: 'Divide the number right by the total.' },
      ];
      function render() {
        var h = STEPS.map(function (s, i) {
          if (i > step) return '';
          var done = i < step;
          return '<div class="mm-step' + (done ? ' done' : '') + '" data-s="' + i + '"><p>' + s.q + '</p>' + (done ? '<p class="feedback ok">✅ ' + s.ok + '</p>' : '<div class="row">' + D.shuffle(s.o.map(function (o, j) { return '<button type="button" class="btn small" data-ok="' + o[1] + '">' + o[0] + '</button>'; })).join('') + '</div><p class="feedback" aria-live="polite"></p>') + (i === 2 && step >= 2 ? '<div class="mm-score"><div>📚 Training<b>99%</b></div><div>🔒 Hidden test<b>61%</b></div></div>' : '') + '</div>';
        }).join('');
        el.innerHTML = h + (step >= STEPS.length ? '<p class="feedback ok">🏆 Project complete: fair split → smart features → overfitting fixed → honest score. That’s the real machine-learning workflow.</p>' : '');
        D.$all('[data-ok]', el).forEach(function (b) {
          b.addEventListener('click', function () {
            var box = b.closest('.mm-step'), f = box.querySelector('.feedback');
            if (b.getAttribute('data-ok') === '1') { D.sfx('good'); step++; api.save({ step: step }); render(); }
            else { D.sfx('bad'); b.disabled = true; f.className = 'feedback no'; f.textContent = STEPS[+box.getAttribute('data-s')].no; }
          });
        });
        if (step >= STEPS.length) api.done();
      }
      render();
    },
  },
};
