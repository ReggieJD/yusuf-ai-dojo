module.exports = {
  hook: 'AI learns from labeled examples, so someone has to do the labeling. Today that someone is you. Careful: some of these are tricky!',
  story: [
    ['sensei', '{{nick}}, a team is building an animal-spotting AI for a nature park. They need training data.'],
    ['sensei', 'They have photos, but photos alone aren’t enough. Each one needs a <b>label</b>: the correct answer, like “bird” or “fish.” Labeled examples are how most AI learns.'],
    ['you', 'That sounds easy.'],
    ['sensei', 'Is it? A penguin can’t fly — is it still a bird? A dolphin lives in the sea — is it a fish? If the labels are wrong, the AI learns wrong. Real AI companies pay people to label carefully, and they double-check each other’s work.'],
  ],
  activity: {
    title: 'The Labeling Station',
    instructions: 'Label all 12 animals as Mammal, Bird, Fish or Reptile. Then submit your dataset for a quality check. Fix any mistakes until it’s perfect.',
    css: `
.lb{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.lb-card{border:3px solid #16181d;border-radius:12px;background:#fff;padding:10px;text-align:center}
.lb-card .e{font-size:2.6rem;display:block}
.lb-card b{display:block;margin-bottom:6px}
.lb-card select{width:100%;min-height:44px;border-radius:8px;border:2px solid #16181d55;font:700 .95rem var(--font-body);background:#fffbea;color:#16181d}
.lb-card.ok{border-color:#1b7f4b;background:#e3f6ea}.lb-card.no{border-color:#b3261e;background:#fde7e4}
.lb-card .hint{font-size:.82rem;margin-top:6px}
.lb-bar{display:flex;align-items:center;gap:12px;margin:12px 0;flex-wrap:wrap}
.lb-bar .meter{flex:1;min-width:160px}
`,
    js: function (el, api) {
      var D = api.D;
      var A = [
        ['🐶', 'Dog', 'm'], ['🦅', 'Eagle', 'b'], ['🐟', 'Goldfish', 'f'], ['🐬', 'Dolphin', 'm', 'Dolphins breathe air, are warm-blooded and feed their babies milk: mammals, not fish!'],
        ['🐧', 'Penguin', 'b', 'Penguins can’t fly, but they have feathers and lay eggs: birds!'], ['🦇', 'Bat', 'm', 'Bats fly, but they have fur and feed their babies milk: mammals!'],
        ['🐍', 'Snake', 'r'], ['🦈', 'Shark', 'f', 'Sharks breathe with gills: they’re fish.'], ['🐢', 'Turtle', 'r'],
        ['🐋', 'Whale', 'm', 'Whales are the biggest mammals on Earth. They breathe air through a blowhole.'], ['🦆', 'Duck', 'b'], ['🐊', 'Crocodile', 'r'],
      ];
      var N = { m: 'Mammal', b: 'Bird', f: 'Fish', r: 'Reptile' };
      var S = api.load(), L = S.labels || {};
      el.innerHTML = '<div class="lb">' + A.map(function (a, i) {
        return '<div class="lb-card" data-i="' + i + '"><span class="e" aria-hidden="true">' + a[0] + '</span><b>' + a[1] + '</b><select aria-label="Label for ' + a[1] + '"><option value="">Choose a label…</option>' + Object.keys(N).map(function (k) { return '<option value="' + k + '">' + N[k] + '</option>'; }).join('') + '</select><div class="hint" aria-live="polite"></div></div>';
      }).join('') + '</div><div class="lb-bar"><button type="button" class="btn primary" id="lb-go">📤 Submit dataset</button><div class="meter" aria-hidden="true"><i id="lb-m"></i></div><b id="lb-pct"></b></div><p class="feedback" id="lb-fb" aria-live="polite"></p>';
      D.$all('.lb-card', el).forEach(function (c) {
        var i = c.getAttribute('data-i'), s = c.querySelector('select');
        if (L[i]) s.value = L[i];
        s.addEventListener('change', function () { L[i] = s.value; api.save({ labels: L }); c.classList.remove('ok', 'no'); c.querySelector('.hint').textContent = ''; });
      });
      function submit(quiet) {
        var right = 0, blank = 0;
        D.$all('.lb-card', el).forEach(function (c) {
          var i = +c.getAttribute('data-i'), v = c.querySelector('select').value, h = c.querySelector('.hint');
          if (!v) { blank++; return; }
          var ok = v === A[i][2]; if (ok) right++;
          c.classList.toggle('ok', ok); c.classList.toggle('no', !ok);
          h.textContent = ok ? (A[i][3] ? '✅ ' + A[i][3] : '') : '❌ Hmm — think about how it breathes, its skin, and how babies are fed.';
        });
        var pct = Math.round(100 * right / A.length);
        D.$('#lb-m', el).style.width = pct + '%'; D.$('#lb-pct', el).textContent = 'Label quality: ' + pct + '%';
        var fb = D.$('#lb-fb', el);
        if (blank) { fb.className = 'feedback no'; fb.textContent = blank + ' animal' + (blank > 1 ? 's are' : ' is') + ' still unlabeled.'; return; }
        api.save({ submitted: true });
        if (right === A.length) {
          fb.className = 'feedback ok'; fb.innerHTML = '🏆 100% label quality! The AI can now learn from a clean dataset. Notice the tricky ones: bats, dolphins, whales and penguins. Wrong labels there would have taught the AI a <b>false pattern</b>, like “things that swim are fish.”';
          if (!quiet) D.sfx('win'); api.done();
        } else { fb.className = 'feedback no'; fb.textContent = (A.length - right) + ' label' + (A.length - right > 1 ? 's need' : ' needs') + ' fixing. Real labeling teams check and fix mistakes too. Change them and submit again!'; if (!quiet) D.sfx('bad'); }
      }
      D.$('#lb-go', el).addEventListener('click', function () { submit(); });
      if (S.submitted) submit(true);
    },
  },
  quiz: [
    { q: 'What is a label in machine learning?', a: ['The correct answer attached to an example, like tagging a photo “bird”', 'A sticker on a computer', 'The name of the AI', 'A type of chart'], c: 0, why: 'Labels are the answers the AI learns from. Photo + label = a training example.' },
    { q: 'If many dolphins were labeled “fish,” what might the AI learn?', a: ['A false pattern like “anything that swims is a fish”', 'Nothing — it would ignore them', 'It would fix the labels automatically', 'It would learn faster'], c: 0, why: 'AI copies the patterns in its labels, including the mistakes.' },
    { q: 'Why do real AI teams often have several people label the same item?', a: ['To catch mistakes and disagreements, so labels are more accurate', 'Because labeling is too easy', 'To make the dataset smaller', 'It’s a rule of computers'], c: 0, why: 'When labelers disagree, it flags a tricky or unclear example to double-check.' },
    { q: 'You only collect data about favorite sports at a basketball camp. What’s the problem?', a: ['The sample is biased — it doesn’t represent all kids', 'Nothing, that’s perfect data', 'Basketball data can’t be collected', 'The data is too colorful'], c: 0, why: 'Where you collect data matters. A basketball camp will over-represent basketball fans.' },
  ],
  challenge: {
    title: 'Survey Detective',
    intro: 'You want to collect data about what sports kids like. Which collection methods are <b>👍 Good</b> and which are <b>👎 Bad</b>? Get 5 of 6.',
    js: function (el, api) {
      api.D.sorter(el, api, {
        choices: [['g', '👍 Good'], ['b', '👎 Bad']],
        items: [
          ['“What is your favorite sport?”', 'g', 'Clear, neutral and simple.'],
          ['“Don’t you agree that soccer is the best sport?”', 'b', 'A <b>leading question</b>: it pushes people toward one answer.'],
          ['“Do you like sports and video games?”', 'b', 'Two questions in one: a “yes” doesn’t tell you which one they like.'],
          ['“How many hours of sport did you play last week?”', 'g', 'Specific and measurable.'],
          ['Only asking kids at a basketball camp', 'b', 'A <b>biased sample</b>: basketball fans will be over-counted.'],
          ['Asking kids from many different schools and clubs', 'g', 'A varied sample represents more kids fairly.'],
        ],
        need: 5, win: 'Good data starts with good questions and fair sampling. That’s real data-scientist thinking!',
      });
    },
  },
};
