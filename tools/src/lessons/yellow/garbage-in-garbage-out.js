module.exports = {
  hook: 'Feed an AI junk and it learns junk. Clean up a messy training set and watch the AI’s accuracy climb.',
  story: [
    ['sensei', 'A fruit stand built an AI to sort bananas into <b>ripe</b> and <b>not ripe</b> using their color. It keeps making mistakes, {{nick}}.'],
    ['you', 'Is the AI broken?'],
    ['sensei', 'The AI is fine. Its <b>training data</b> is not. Someone labeled green bananas “ripe”… and someone even added a photo of a <b>shoe</b>!'],
    ['sensei', 'Programmers have a saying: <b>“Garbage in, garbage out.”</b> Bad data in means bad answers out. Your job: clean the data and retrain.'],
  ],
  activity: {
    title: 'Clean the Training Data',
    instructions: 'Tap any example that looks wrong to throw it in the trash 🗑️ (tap again to restore it). Then press Train and check the accuracy on 10 new bananas. Reach 100%!',
    css: `
.gi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(98px,1fr));gap:8px}
.gi-ex{position:relative;border:3px solid #16181d;border-radius:12px;background:#fff;padding:8px 4px;text-align:center;cursor:pointer;font:700 .8rem var(--font-body);min-height:112px;color:#16181d}
.gi-ex .e{font-size:2.2rem;display:block}
.gi-ex .lab{display:inline-block;margin-top:4px;padding:2px 8px;border-radius:999px;font-size:.75rem}
.gi-ex .lab.r{background:#ffd23f}.gi-ex .lab.u{background:#95d5b2}
.gi-ex.trash{opacity:.45;border-style:dashed;background:#eee}
.gi-ex.trash::after{content:"🗑️";position:absolute;top:4px;right:6px;font-size:1.1rem}
.gi-res{margin-top:12px;background:#fff;border-radius:12px;padding:12px;border:2px solid #16181d22}
.gi-test{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.gi-test span{display:inline-flex;flex-direction:column;align-items:center;padding:4px 6px;border-radius:8px;font-size:.72rem;font-weight:700;min-width:48px}
.gi-test .ok{background:#e3f6ea}.gi-test .no{background:#fde7e4}
.gi-test i{font-style:normal;font-size:1.4rem}
`,
    js: function (el, api) {
      var D = api.D;
      // [emoji, yellowness 0-100, label 'r' ripe / 'u' not ripe, isGarbage, whyGarbage]
      var X = [
        ['🍌', 80, 'r'], ['🍌', 20, 'u'], ['🍌', 10, 'r', 1, 'A very green banana labeled “ripe”: wrong label!'], ['🍌', 90, 'r'], ['🍌', 30, 'u'], ['👟', 5, 'r', 1, 'That’s a shoe! Not a banana at all.'],
        ['🍌', 75, 'r'], ['🍌', 15, 'u'], ['🍌', 92, 'u', 1, 'A bright yellow banana labeled “not ripe”: wrong label!'], ['🍌', 85, 'r'], ['🍌', 25, 'u'], ['🍌', 15, 'r', 1, 'Green banana labeled “ripe”: wrong label!'],
        ['🍌', 70, 'r'], ['🍌', 35, 'u'], ['🍌', 95, 'r'], ['🍌', 10, 'u'],
      ];
      var TEST = [30, 42, 47, 49, 53, 58, 62, 70, 20, 85]; // truly ripe when yellowness > 50
      var S = api.load(), trash = S.trash || {};
      function look(v) { return 'filter:hue-rotate(' + Math.round((100 - v) * 0.55) + 'deg) saturate(' + (0.8 + v / 250) + ')'; }
      el.innerHTML = '<div class="gi-grid">' + X.map(function (x, i) {
        return '<button type="button" class="gi-ex' + (trash[i] ? ' trash' : '') + '" data-i="' + i + '" aria-pressed="' + !!trash[i] + '" aria-label="Example ' + (i + 1) + ': ' + (x[0] === '👟' ? 'a shoe' : 'banana, ' + x[1] + '% yellow') + ', labeled ' + (x[2] === 'r' ? 'ripe' : 'not ripe') + '"><span class="e" style="' + (x[0] === '🍌' ? look(x[1]) : '') + '" aria-hidden="true">' + x[0] + '</span>' + (x[0] === '🍌' ? x[1] + '% yellow' : 'shoe?!') + '<br><span class="lab ' + x[2] + '">' + (x[2] === 'r' ? 'label: ripe' : 'label: not ripe') + '</span></button>';
      }).join('') + '</div><p class="row" style="margin-top:12px"><button type="button" class="btn primary" id="gi-train">🧠 Train &amp; test</button><span class="pill" id="gi-count"></span></p><div id="gi-res" aria-live="polite"></div>';
      function count() { D.$('#gi-count', el).textContent = (X.length - Object.keys(trash).filter(function (k) { return trash[k]; }).length) + ' examples kept'; }
      D.$all('.gi-ex', el).forEach(function (b) {
        b.addEventListener('click', function () { var i = b.getAttribute('data-i'); trash[i] = !trash[i]; b.classList.toggle('trash', trash[i]); b.setAttribute('aria-pressed', trash[i]); api.save({ trash: trash }); count(); D.sfx('click'); });
      });
      function train(quiet) {
        var keep = X.filter(function (x, i) { return !trash[i]; });
        var R = keep.filter(function (x) { return x[2] === 'r'; }), U = keep.filter(function (x) { return x[2] === 'u'; });
        var box = D.$('#gi-res', el);
        if (!R.length || !U.length) { box.innerHTML = '<p class="feedback no">The AI needs examples of BOTH ripe and not-ripe bananas to learn the difference!</p>'; return; }
        var mean = function (a) { return a.reduce(function (s, x) { return s + x[1]; }, 0) / a.length; };
        var th = (mean(R) + mean(U)) / 2, right = 0;
        var cells = TEST.map(function (v) { var p = v > th, ok = p === (v > 50); if (ok) right++; return '<span class="' + (ok ? 'ok' : 'no') + '"><i style="' + look(v) + '" aria-hidden="true">🍌</i>' + v + '% · ' + (p ? 'ripe' : 'not') + (ok ? ' ✓' : ' ✗') + '</span>'; }).join('');
        var pct = right * 10, junk = X.filter(function (x, i) { return x[3] && !trash[i]; }).length;
        box.innerHTML = '<div class="gi-res"><p><b>The AI learned:</b> “ripe if more than ' + Math.round(th) + '% yellow.” <b>Accuracy on 10 new bananas: ' + pct + '%</b></p><div class="meter" aria-hidden="true"><i style="width:' + pct + '%"></i></div><div class="gi-test">' + cells + '</div>' +
          (pct === 100 ? '<p class="feedback ok">🏆 100%! Clean data → a sharp AI. You just did one of the most important jobs in AI: <b>data cleaning</b>.</p>' : '<p class="feedback no">' + (junk ? 'Still ' + junk + ' bad example' + (junk > 1 ? 's' : '') + ' hiding in the data. Look for wrong labels (and anything that isn’t a banana!).' : 'Hmm — did you throw away some good examples? Restore them and try again.') + '</p>') + '</div>';
        api.save({ trained: true });
        if (pct === 100) { if (!quiet) D.sfx('win'); api.done(); } else if (!quiet) D.sfx('bad');
      }
      D.$('#gi-train', el).addEventListener('click', function () { train(); });
      count(); if (S.trained) train(true);
    },
  },
  quiz: [
    { q: 'What does “garbage in, garbage out” mean?', a: ['If the data going in is bad, the results coming out will be bad', 'Computers eat trash', 'Always delete your data', 'AI cleans garbage automatically'], c: 0, why: 'An AI can only be as good as the data it learns from.' },
    { q: 'Why did the banana AI make mistakes before you cleaned the data?', a: ['Wrong labels and a shoe photo pulled its “ripe” line to the wrong place', 'Bananas are impossible to sort', 'The AI was lazy', 'There were too many good examples'], c: 0, why: 'The mislabeled examples shifted where the AI drew the line between ripe and not ripe.' },
    { q: 'Which is an example of “garbage” training data?', a: ['A cat photo labeled “dog”', 'A clear dog photo labeled “dog”', 'A lot of correctly labeled photos', 'A photo taken in good light'], c: 0, why: 'Wrong labels teach the wrong pattern.' },
    { q: 'What’s a data scientist’s job before training an AI?', a: ['Check and clean the data', 'Delete half the data at random', 'Add random photos', 'Nothing — just train it'], c: 0, why: 'Data scientists often spend MORE time cleaning data than building models!' },
  ],
  challenge: {
    title: 'Diagnose the Dataset',
    intro: 'Each AI below has a data problem. Pick the real problem. Get 3 of 4.',
    js: function (el, api) {
      api.D.sorter(el, api, {
        choices: [['m', '👥 Missing groups'], ['u', '📏 Mixed-up units'], ['s', '🤏 Too little data'], ['t', '🤬 Toxic examples']],
        items: [
          ['A face-unlock AI trained only on photos of adults struggles with kids’ faces.', 'm', 'Kids were missing from the training data, so the AI never learned their faces.'],
          ['A weather AI’s data has some temperatures in °F and some in °C, all mixed together.', 'u', '30 °C is hot but 30 °F is freezing! Mixed units confuse the AI.'],
          ['A spam filter was trained on only 10 emails.', 's', 'Ten examples can’t show all the tricks spammers use. More data is needed.'],
          ['A chatbot trained on lots of rude internet comments starts being rude.', 't', 'It learned rudeness from its examples. Teams filter harmful data carefully.'],
        ],
        need: 3, win: 'You can diagnose data problems like a pro. Most real AI failures start with data like this.',
      });
    },
  },
};
