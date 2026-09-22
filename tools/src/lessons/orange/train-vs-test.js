module.exports = {
  hook: 'If you know the exact test questions ahead of time, a perfect score proves nothing. The same is true for AI. Split your data the fair way.',
  story: [
    ['sensei', '{{nick}}, imagine your teacher hands out a practice sheet, and then the real test has the EXACT same questions.'],
    ['you', 'Easy 100%!'],
    ['sensei', 'But did you <b>learn</b> anything, or just remember the answers? You can’t tell from that score.'],
    ['sensei', 'AI engineers split their data into two piles. The <b>training set</b> is what the model learns from. The <b>test set</b> is hidden until the end, like a surprise exam. Only the test score shows whether the model really learned.'],
    ['sensei', 'Let’s build a spam filter and test it the fair way… and the cheating way.'],
  ],
  activity: {
    title: 'The Fair Test',
    instructions: 'Tap emails to move them into the 🔒 Test pile (4–6 emails, with both spam and real ones). Then run both tests and compare.',
    css: `
.tt-list{display:grid;gap:8px}
@media(min-width:640px){.tt-list{grid-template-columns:1fr 1fr}}
.tt-mail{display:flex;gap:8px;align-items:center;text-align:left;border:2px solid #2b1a0e33;border-radius:12px;padding:10px;background:#fff;cursor:pointer;font:600 .92rem/1.3 var(--font-body);color:#2b1a0e;min-height:56px}
.tt-mail .tag{margin-left:auto;flex:none;font-size:.72rem;font-weight:800;padding:3px 8px;border-radius:999px;background:#ffe2c4}
.tt-mail.test{border-color:#1c5d99;background:#e7f0fb}
.tt-mail.test .tag{background:#1c5d99;color:#fff}
.tt-mail .kind{flex:none;font-size:1.3rem}
.tt-count{font-weight:800;margin:10px 0}
.tt-scores{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.tt-score{border-radius:14px;padding:12px;text-align:center;background:var(--bg2);border:2px solid transparent}
.tt-score b{display:block;font-size:2rem}
.tt-score.cheat{border-color:#b3261e44}
.tt-score.fair{border-color:#1b7f4b66}
`,
    js: function (el, api) {
      var D = api.D;
      // [subject, isSpam]; features: number of "!" and number of "free/win/prize" words
      var M = [
        ['FREE PRIZE!!! Click now!!!', 1], ['Win a FREE phone!!', 1], ['You WON!!! Claim your gift', 1], ['FREE coins for your game!!!', 1], ['Last chance to win!!! FREE!!!', 1], ['Claim your free reward!', 1],
        ['Practice moved to 5pm', 0], ['Mom: dinner at 7!', 0], ['Science project notes', 0], ['Great game today!', 0], ['Library open during free period', 0], ['Coach: bring water!!', 0],
      ];
      function feat(s) { return [(s.match(/!/g) || []).length, (s.match(/free|win|won|prize|claim/gi) || []).length]; }
      var S = api.load(), test = S.test || {}, ran = S.ran || {};
      el.innerHTML = '<div class="tt-list" id="tt-list"></div><p class="tt-count" id="tt-count" aria-live="polite"></p><div class="row"><button type="button" class="btn" id="tt-cheat">😈 Test on the TRAINING emails</button><button type="button" class="btn primary" id="tt-fair">🔒 Test on the hidden TEST emails</button></div><div class="tt-scores" id="tt-scores"></div><p class="feedback" id="tt-fb" aria-live="polite"></p>';
      function render() {
        D.$('#tt-list', el).innerHTML = M.map(function (m, i) {
          var f = feat(m[0]);
          return '<button type="button" class="tt-mail' + (test[i] ? ' test' : '') + '" data-i="' + i + '" aria-pressed="' + !!test[i] + '"><span class="kind" aria-label="' + (m[1] ? 'spam' : 'real email') + '">' + (m[1] ? '🚫' : '✉️') + '</span><span>' + m[0] + '<br><small>“!” × ' + f[0] + ' · prize words × ' + f[1] + '</small></span><span class="tag">' + (test[i] ? '🔒 TEST' : '📚 TRAIN') + '</span></button>';
        }).join('');
        D.$all('.tt-mail', el).forEach(function (b) { b.addEventListener('click', function () { var i = b.getAttribute('data-i'); test[i] = !test[i]; if (!test[i]) delete test[i]; ran = {}; api.save({ test: test, ran: ran }); D.sfx('click'); render(); D.$('#tt-scores', el).innerHTML = ''; D.$('#tt-fb', el).textContent = ''; }); });
        var n = Object.keys(test).length, spam = Object.keys(test).filter(function (i) { return M[i][1]; }).length;
        D.$('#tt-count', el).textContent = '🔒 Test pile: ' + n + ' email' + (n === 1 ? '' : 's') + ' (' + spam + ' spam, ' + (n - spam) + ' real) · 📚 Training pile: ' + (M.length - n);
      }
      function valid() {
        var ids = Object.keys(test), spam = ids.filter(function (i) { return M[i][1]; }).length, fb = D.$('#tt-fb', el);
        if (ids.length < 4 || ids.length > 6) { fb.className = 'feedback no'; fb.textContent = 'Put 4 to 6 emails in the test pile. Enough to test, but most data should still be for training.'; return false; }
        if (!spam || spam === ids.length) { fb.className = 'feedback no'; fb.textContent = 'Your test pile needs BOTH spam and real emails, or it can’t check both skills.'; return false; }
        return true;
      }
      function score(on) {
        var train = M.map(function (m, i) { return i; }).filter(function (i) { return !test[i]; });
        var right = 0;
        on.forEach(function (i) {
          var f = feat(M[i][0]), best = 1e9, lab = 0;
          train.forEach(function (j) { var g = feat(M[j][0]), d = Math.pow(f[0] - g[0], 2) + Math.pow(f[1] - g[1], 2) + (j === +i ? 0 : 0.001); if (d < best) { best = d; lab = M[j][1]; } });
          if (lab === M[i][1]) right++;
        });
        return Math.round(100 * right / on.length);
      }
      function show() {
        var box = D.$('#tt-scores', el), h = '';
        if (ran.cheat != null) h += '<div class="tt-score cheat">😈 Tested on training data<b>' + ran.cheat + '%</b>It had already seen every answer.</div>';
        if (ran.fair != null) h += '<div class="tt-score fair">🔒 Tested on hidden data<b>' + ran.fair + '%</b>A fair, honest score.</div>';
        box.innerHTML = h;
        if (ran.cheat != null && ran.fair != null) {
          var fb = D.$('#tt-fb', el); fb.className = 'feedback ok';
          fb.innerHTML = ran.cheat === 100 && ran.fair < 100 ? '🎯 See the gap? Testing on training data looked perfect (' + ran.cheat + '%), but the fair test shows the true skill (' + ran.fair + '%). That’s why engineers ALWAYS keep a hidden test set.' : '🎯 Testing on training data always looks great, because the model has already seen those exact answers. Only the hidden test set gives an honest score. Engineers never skip it!';
          api.done();
        }
      }
      D.$('#tt-cheat', el).addEventListener('click', function () { if (!valid()) return; ran.cheat = score(M.map(function (m, i) { return i; }).filter(function (i) { return !test[i]; })); api.save({ ran: ran }); D.sfx('click'); show(); });
      D.$('#tt-fair', el).addEventListener('click', function () { if (!valid()) return; ran.fair = score(Object.keys(test)); api.save({ ran: ran }); D.sfx('good'); show(); });
      render(); show();
    },
  },
  quiz: [
    { q: 'What is the test set for?', a: ['Checking how well a model works on examples it has never seen', 'Training the model faster', 'Storing extra labels', 'Making the data bigger'], c: 0, why: 'The test set is a surprise exam. The model never learns from it.' },
    { q: 'A model scores 100% when tested on its own training data. What does that prove?', a: ['Not much — it may have just memorized those examples', 'It is perfect', 'It will never make mistakes', 'The test set is useless'], c: 0, why: 'You can’t judge learning with questions the model already saw.' },
    { q: 'Why should the test pile include BOTH spam and real emails?', a: ['So it checks the model’s skill on both classes', 'To make it longer', 'It doesn’t matter', 'Real emails can’t be tested'], c: 0, why: 'A test with only one class can’t show whether the model handles the other.' },
    { q: 'Most of the data usually goes to…', a: ['Training — the model needs lots of examples to learn from', 'Testing', 'The trash', 'Neither'], c: 0, why: 'A common split is roughly 80% training and 20% testing.' },
  ],
  challenge: {
    title: 'Leak Detective',
    intro: 'A <b>data leak</b> is when test answers sneak into training, which makes scores look better than they really are. Spot which situations are leaks. Get 4 of 5.',
    js: function (el, api) {
      api.D.sorter(el, api, {
        choices: [['l', '🚰 Leak!'], ['f', '✅ Fair']],
        items: [
          ['The same 50 photos are used for BOTH training and testing.', 'l', 'The model has already seen the test photos.'],
          ['20% of photos are locked away before training, and only used at the end.', 'f', 'The classic fair split.'],
          ['An engineer keeps tweaking the model until it gets 100% on the test set, then reports that score.', 'l', 'Tuning on the test set lets it slowly “learn” the test. Teams keep a separate final test set for this reason.'],
          ['Duplicate copies of the same email ended up in both piles.', 'l', 'The model saw the “test” email during training.'],
          ['The test emails were collected a month AFTER the training emails.', 'f', 'Testing on newer data is a tough, honest check.'],
        ],
        need: 4, win: 'You think like a careful AI engineer. Leaks are one of the most common ways AI results get exaggerated.',
      });
    },
  },
};
