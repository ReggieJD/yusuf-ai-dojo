module.exports = {
  hook: '90% accuracy sounds amazing. But a lazy model can score 95% without doing anything useful. Learn to read the scoreboard like an expert.',
  story: [
    ['sensei', 'Every model gets a report card, {{nick}}. The most famous number is <b>accuracy</b>: how many answers it got right, out of all of them.'],
    ['sensei', 'If a model gets 45 right out of 50, that’s 45 ÷ 50 = 0.9, or <b>90%</b>.'],
    ['you', 'So higher accuracy always means a better model?'],
    ['sensei', 'Usually… but not always. Some models get a great score while missing the one thing that matters most. Today you’ll catch one red-handed.'],
  ],
  activity: {
    title: 'Read the Scoreboard',
    instructions: 'Three rounds: count the model’s score, catch the lazy model, then pick what matters most.',
    css: `
.ac-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin:10px 0}
.ac-grid span{aspect-ratio:1;border-radius:6px;display:grid;place-items:center;font-size:.9rem;font-weight:900}
.ac-grid .r{background:#e3f6ea;color:#1b7f4b}.ac-grid .w{background:#fde7e4;color:#b3261e}
.ac-grid .spam{outline:3px solid #e8590c;outline-offset:-3px}
.ac-box{background:var(--bg2);border-radius:12px;padding:12px;margin-top:10px}
.ac-box .row button{flex:1 1 90px}
.ac-models{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}
.ac-m{border-radius:12px;padding:10px;border:2px solid #2b1a0e33;background:#fff}
.ac-m b{font-size:1.4rem;display:block}
.ac-stage{font-weight:800;color:var(--muted)}
`,
    js: function (el, api) {
      var D = api.D, S = api.load(), step = S.step || 0;
      function grid(n, wrongAt, spamAt) {
        var h = '<div class="ac-grid" aria-hidden="true">';
        for (var i = 0; i < n; i++) { var w = wrongAt.indexOf(i) >= 0; h += '<span class="' + (w ? 'w' : 'r') + (spamAt && spamAt.indexOf(i) >= 0 ? ' spam' : '') + '">' + (w ? '✗' : '✓') + '</span>'; }
        return h + '</div>';
      }
      function ask(q, opts, right, why, next) {
        return '<p><b>' + q + '</b></p><div class="row" data-q>' + D.shuffle(opts.map(function (o, i) { return '<button type="button" class="btn small" data-i="' + i + '">' + o + '</button>'; })).join('') + '</div><p class="feedback" aria-live="polite"></p>';
      }
      function wire(right, why, next) {
        D.$all('[data-q] button', el).forEach(function (b) {
          b.addEventListener('click', function () {
            var f = el.querySelector('[data-q] + .feedback');
            if (+b.getAttribute('data-i') === right) { D.sfx('good'); f.className = 'feedback ok'; f.innerHTML = '✅ ' + why; D.$all('[data-q] button', el).forEach(function (x) { x.disabled = true; }); step = next; api.save({ step: step }); setTimeout(render, 1600); }
            else { D.sfx('bad'); b.disabled = true; f.className = 'feedback no'; f.textContent = 'Not quite — try again.'; }
          });
        });
      }
      function render() {
        if (step === 0) {
          el.innerHTML = '<p class="ac-stage">Round 1 of 3</p><p>A spam filter checked 20 emails. ✓ = right, ✗ = wrong.</p>' + grid(20, [4, 13]) + '<div class="ac-box">' + ask('What is its accuracy?', ['90%', '80%', '100%', '2%']) + '</div>';
          wire(0, '18 right ÷ 20 total = 0.9 = <b>90%</b>.', 1);
        } else if (step === 1) {
          var spamAt = [7, 23, 41, 66, 88];
          el.innerHTML = '<p class="ac-stage">Round 2 of 3 · The lazy model</p><p>100 emails: <b>95 are real, only 5 are spam</b> (outlined in orange). A lazy model just says “NOT spam” for everything.</p>' + grid(100, spamAt, spamAt) +
            '<div class="ac-models"><div class="ac-m">😴 Lazy model<b>95% accurate</b>Spam caught: 0 of 5</div><div class="ac-m">🧠 Real model<b>93% accurate</b>Spam caught: 4 of 5</div></div><div class="ac-box">' + ask('Which model is actually more useful as a spam filter?', ['The real model — it catches spam, which is the whole point', 'The lazy model — 95% is higher', 'They are equally good']) + '</div>';
          wire(0, 'The lazy model has higher accuracy but catches ZERO spam. When one class is rare, accuracy alone can fool you. Experts also check <b>how many of the important cases were caught</b>.', 2);
        } else if (step === 2) {
          el.innerHTML = '<p class="ac-stage">Round 3 of 3</p><div class="ac-box">' + ask('A model helps doctors spot a rare illness in scans. Which mistake is usually worse?', ['Missing a sick person (saying “healthy” when they’re sick)', 'Flagging a healthy person for a second check', 'Both mistakes are always exactly equal']) + '</div>';
          wire(0, 'Missing a real case can be dangerous, while a false alarm usually just means another check. Which mistakes matter most depends on the job, and people decide that, not the AI.', 3);
        } else {
          el.innerHTML = '<p class="feedback ok">🏆 Scoreboard mastered! You know how to calculate accuracy AND when not to trust it.</p>';
          api.done();
        }
      }
      render();
    },
  },
  quiz: [
    { q: 'A model gets 45 out of 50 right. What is its accuracy?', a: ['90%', '45%', '50%', '95%'], c: 0, why: '45 ÷ 50 = 0.9 = 90%.' },
    { q: 'Only 5 of 100 emails are spam. A model that ALWAYS says “not spam” scores…', a: ['95% accuracy, while catching zero spam', '0% accuracy', '5% accuracy', '100% accuracy'], c: 0, why: 'High accuracy can hide total failure on the rare class.' },
    { q: 'Why can accuracy be misleading?', a: ['When one class is rare, a model can score high while missing the important cases', 'Accuracy is always wrong', 'Accuracy can’t be calculated', 'It only works for images'], c: 0, why: 'Always ask: accurate at WHAT?' },
    { q: 'Who decides which mistakes matter most for an AI in a hospital?', a: ['People — doctors, patients and engineers — based on what’s at stake', 'The AI decides by itself', 'Nobody', 'The computer’s manufacturer'], c: 0, why: 'Choosing what counts as “good enough” is a human decision.' },
  ],
  challenge: {
    title: 'Percent Power',
    intro: 'Quick-fire accuracy math. Get 4 of 5 right!',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: '30 right out of 40. Accuracy?', a: ['75%', '70%', '30%', '80%'], c: 0, why: '30 ÷ 40 = 0.75 = 75%.' },
        { q: '99 right out of 100. Accuracy?', a: ['99%', '9.9%', '100%', '1%'], c: 0, why: '99 ÷ 100 = 99%.' },
        { q: 'A model is 80% accurate on 200 photos. How many did it get right?', a: ['160', '80', '180', '120'], c: 0, why: '80% of 200 = 0.8 × 200 = 160.' },
        { q: 'Model A: 90% accurate. Model B: 88% accurate but catches twice as many dangerous cases. For a safety alarm, which is better?', a: ['Model B', 'Model A', 'Neither can be judged'], c: 0, why: 'For safety, catching dangerous cases usually matters more than 2% accuracy.' },
        { q: 'A model is 100% accurate on its training data but 60% on new data. What’s likely going on?', a: ['It memorized the training data (overfitting)', 'It’s a perfect model', 'The new data is wrong', 'Accuracy is broken'], c: 0, why: 'A big gap between training and test scores is a classic sign of overfitting. That’s next lesson!' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 4) api.done(); } });
    },
  },
};
