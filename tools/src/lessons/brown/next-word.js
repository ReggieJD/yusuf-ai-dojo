module.exports = {
  hook: 'A chatbot writes by guessing the next word, again and again. Race a tiny language model at guessing, then build a sentence with it.',
  story: [
    ['sensei', 'Here’s the biggest secret of chatbots, {{nick}}: at their core, they’re <b>next-word predictors</b>. Well, next-<i>token</i> predictors!'],
    ['sensei', 'A <b>language model</b> is trained on enormous amounts of text. It learns which tokens tend to follow which. Then it writes one token at a time, each time asking: “What’s likely to come next?”'],
    ['you', 'That’s it? Just guessing the next word?'],
    ['sensei', 'Just that, done by a gigantic neural network with billions of weights, trained on a huge library of text. Our mini model only learned from 30 dojo sentences, so you can see exactly how it works.'],
  ],
  activity: {
    title: 'Guess the Next Word',
    instructions: 'Round 1: guess the next word 5 times and compare with the model. Round 2: build a 6+ word sentence by tapping the model’s suggestions.',
    css: `
.nw-sent{font:700 1.25rem/1.4 Georgia,serif;background:#fffdf7;border:2px solid #8b5a2b44;border-radius:10px;padding:12px;min-height:3em}
.nw-sent .blank{display:inline-block;min-width:70px;border-bottom:3px dashed #8b5a2b;margin-left:4px}
.nw-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}
.nw-opts button{min-height:50px;border-radius:10px;border:2px solid #2d1f12;background:#fff;font:700 1rem var(--font-body);cursor:pointer;color:#2d1f12}
.nw-bars{display:grid;gap:5px;margin:8px 0}
.nw-bar{display:grid;grid-template-columns:110px 1fr 46px;gap:8px;align-items:center;font-weight:700;font-size:.92rem;cursor:pointer;background:none;border:0;padding:4px;text-align:left;border-radius:8px;min-height:40px;color:inherit;font-family:inherit}
.nw-bar:hover,.nw-bar:focus{background:#f3e5c4}
.nw-bar .meter>i{background:#8b5a2b}
.nw-score{font-weight:800}
.nw-q{background:var(--bg2);border-radius:10px;padding:10px 12px;margin-top:10px}
.nw-q .row button{flex:1 1 150px}
`,
    js: function (el, api) {
      var D = api.D;
      var CORPUS = ['the ninja practiced every morning', 'the ninja kicked the ball', 'the ninja kicked the bag', 'the ninja bowed to the sensei', 'the sensei smiled at the ninja', 'the sensei taught the class', 'the class practiced every morning', 'the class bowed to the sensei', 'the robot kicked the ball', 'the robot learned from data', 'the robot learned every day', 'the ninja learned from the sensei', 'the ball flew into the goal', 'the ball flew over the wall', 'the team scored a goal', 'the team won the game', 'the team practiced every day', 'every morning the ninja trained', 'every day the robot learned', 'a ninja never gives up', 'a robot never sleeps', 'the sensei never gives up', 'the ninja trained with the team', 'the robot played with the team', 'the team cheered for the ninja', 'the ninja scored a goal', 'the goal was amazing', 'the game was amazing', 'the sensei was proud', 'the ninja was ready'];
      var BI = {};
      CORPUS.forEach(function (s) { var w = ('<s> ' + s + ' </s>').split(' '); for (var i = 0; i < w.length - 1; i++) { BI[w[i]] = BI[w[i]] || {}; BI[w[i]][w[i + 1]] = (BI[w[i]][w[i + 1]] || 0) + 1; } });
      function probs(w) { var n = BI[w] || {}, t = 0; for (var k in n) t += n[k]; return Object.keys(n).map(function (k) { return [k, n[k] / t]; }).sort(function (a, b) { return b[1] - a[1]; }); }
      var ROUND1 = [['the ninja'], ['the ball flew'], ['the team'], ['the sensei'], ['the robot learned']];
      var S = api.load(), r1 = S.r1 || 0, match = S.match || 0, built = S.built || ['<s>'], asked = !!S.asked;
      function render() {
        var h = '';
        if (r1 < ROUND1.length) {
          var ctx = ROUND1[r1][0], last = ctx.split(' ').pop(), P = probs(last), opts = D.shuffle(P.slice(0, 2).map(function (p) { return p[0]; }).concat(['banana', 'purple'].filter(function (x) { return !P.some(function (p) { return p[0] === x; }); })).slice(0, 4));
          h += '<p class="nw-score">Round 1 · Guess ' + (r1 + 1) + ' of 5 · You matched the model ' + match + ' time' + (match === 1 ? '' : 's') + '</p><div class="nw-sent">' + ctx + ' <span class="blank"></span></div><div class="nw-opts">' + opts.map(function (o) { return '<button type="button" data-g="' + o + '">' + (o === '</s>' ? '(end)' : o) + '</button>'; }).join('') + '</div><div id="nw-reveal" aria-live="polite"></div>';
        } else {
          var lastW = built[built.length - 1], P2 = probs(lastW), words = built.filter(function (w) { return w !== '<s>' && w !== '</s>'; });
          h += '<p class="nw-score">Round 2 · Build a sentence (6+ words). Tap a word to add it. The bars are the model’s probabilities.</p><div class="nw-sent">' + (words.join(' ') || '…') + (lastW === '</s>' ? ' <b>.</b>' : ' <span class="blank"></span>') + '</div>';
          if (lastW !== '</s>') h += '<div class="nw-bars">' + P2.map(function (p) { return '<button type="button" class="nw-bar" data-w="' + p[0] + '"><span>' + (p[0] === '</s>' ? '⏹ (end)' : p[0]) + '</span><span class="meter"><i style="width:' + Math.round(p[1] * 100) + '%"></i></span><span>' + Math.round(p[1] * 100) + '%</span></button>'; }).join('') + '</div>';
          h += '<div class="row"><button type="button" class="btn small" id="nw-reset">↺ Start a new sentence</button></div>';
          if (lastW === '</s>' && words.length >= 6) {
            if (!asked) h += '<div class="nw-q"><p><b>Does the model understand what a ninja or a goal is?</b></p><div class="row">' + D.shuffle([[1, 'No — it only learned which words tend to follow which'], [0, 'Yes — it has watched ninjas play soccer'], [0, 'Yes — it feels excited about goals']]).map(function (o) { return '<button type="button" class="btn small" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p></div>';
            else h += '<p class="feedback ok">🏆 You just generated text the way a language model does: one likely word at a time. Big models look at far more context than one word, which is why they sound so much smarter. But the core idea is the same.</p>';
          } else if (lastW === '</s>') h += '<p class="feedback no">That sentence has only ' + words.length + ' words. Start a new one and make it 6 or more!</p>';
        }
        el.innerHTML = h;
        D.$all('[data-g]', el).forEach(function (b) {
          b.addEventListener('click', function () {
            var ctx = ROUND1[r1][0], P = probs(ctx.split(' ').pop()), top = P[0][0], g = b.getAttribute('data-g'), ok = g === top;
            if (ok) match++; D.sfx(ok ? 'good' : 'click');
            D.$all('[data-g]', el).forEach(function (x) { x.disabled = true; });
            D.$('#nw-reveal', el).innerHTML = '<p>' + (ok ? '✅ You matched the model!' : 'The model’s top guess was <b>“' + top + '”</b>.') + '</p><div class="nw-bars">' + P.map(function (p) { return '<div class="nw-bar"><span>' + (p[0] === '</s>' ? '(end)' : p[0]) + '</span><span class="meter"><i style="width:' + Math.round(p[1] * 100) + '%"></i></span><span>' + Math.round(p[1] * 100) + '%</span></div>'; }).join('') + '</div><button type="button" class="btn small primary" id="nw-next">Next →</button>';
            r1++; api.save({ r1: r1, match: match });
            D.$('#nw-next', el).addEventListener('click', render);
          });
        });
        D.$all('button.nw-bar[data-w]', el).forEach(function (b) { b.addEventListener('click', function () { built.push(b.getAttribute('data-w')); api.save({ built: built }); D.sfx('click'); render(); }); });
        var rs = D.$('#nw-reset', el); if (rs) rs.addEventListener('click', function () { built = ['<s>']; api.save({ built: built }); render(); });
        D.$all('[data-ok]', el).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-ok') === '1') { asked = true; api.save({ asked: true }); D.sfx('win'); render(); } else { D.sfx('bad'); b.disabled = true; var f = el.querySelector('.nw-q .feedback'); f.className = 'feedback no'; f.textContent = 'Think about what the model learned from: 30 sentences, and nothing else.'; } }); });
        if (asked) api.done();
      }
      render();
    },
  },
  quiz: [
    { q: 'At their core, chatbots work by…', a: ['Predicting the next token, over and over', 'Looking up every answer in a giant list', 'Copying one website', 'Reading your mind'], c: 0, why: 'One likely token at a time: that’s how text gets generated.' },
    { q: 'Where does a language model learn which words tend to follow which?', a: ['From the huge amounts of text it was trained on', 'From a dictionary only', 'From your feelings', 'It is born knowing'], c: 0, why: 'Patterns in training text → predictions.' },
    { q: 'Our mini model only looked at the ONE previous word. Big models…', a: ['Look at much more of the conversation, which helps them sound more sensible', 'Look at zero words', 'Only look at the last letter', 'Work exactly the same'], c: 0, why: 'More context = better predictions.' },
    { q: 'Does predicting likely words mean the model always tells the truth?', a: ['No — a likely-sounding sentence can still be false', 'Yes, always', 'Only on weekends', 'Only for short answers'], c: 0, why: 'Likely ≠ true. That’s the heart of the “confidently wrong” lesson.' },
  ],
  challenge: {
    title: 'Be the Language Model',
    intro: 'You are the model. Pick the most likely next word! Get 4 of 5.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: '“Once upon a …”', a: ['time', 'banana', 'robot', 'Tuesday'], c: 0, why: 'This phrase appears constantly in stories.' },
        { q: '“The capital of France is …”', a: ['Paris', 'pizza', 'blue', 'running'], c: 0, why: 'A pattern seen countless times in text.' },
        { q: '“Peanut butter and …”', a: ['jelly', 'gravel', 'homework', 'Mars'], c: 0, why: 'A super common pairing in English text.' },
        { q: '“The goalkeeper dove and caught the …”', a: ['ball', 'sandwich', 'cloud', 'keyboard'], c: 0, why: 'Context words like “goalkeeper” make “ball” very likely.' },
        { q: 'Why can a model guess “Paris” without “knowing” geography the way you do?', a: ['That pattern appeared many times in its training text', 'It visited Paris', 'It has a built-in atlas', 'Luck'], c: 0, why: 'Statistical patterns can look like knowledge, and often they’re right. But not always!' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 4) api.done(); } });
    },
  },
};
