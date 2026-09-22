module.exports = {
  hook: 'Two robots guard the dojo gate. One follows rules. One learns from examples. Which one does the job better?',
  story: [
    ['sensei', 'Welcome to the dojo, {{nick}}. Before you can master AI, you must learn the two ways a computer can act smart.'],
    ['sensei', 'The first way is <b>rules</b>. A person writes exact instructions: <i>IF this happens, THEN do that.</i> Like a referee with a rulebook.'],
    ['you', 'And the second way?'],
    ['sensei', '<b>Learning.</b> Instead of writing every rule, we show the computer lots of examples, and it finds the pattern itself. That is called <b>machine learning</b>.'],
    ['sensei', 'Two robots guard our gate today: <b>RuleBot</b> and <b>LearnBot</b>. Their job is to tell happy visitors from grumpy ones. Let’s see who does it better. Even {{T.hero}} had to start with the basics!'],
  ],
  activity: {
    title: 'RuleBot vs LearnBot',
    instructions: 'Round 1: give RuleBot ONE rule and watch it guard the gate. Round 2: teach LearnBot with examples. Compare their scores!',
    css: `
.rv-round{border:2px dashed var(--line);border-radius:14px;padding:14px;margin-bottom:14px}
.rv-round h3{display:flex;align-items:center;gap:8px}
.rv-rules{display:grid;gap:8px;grid-template-columns:1fr}
@media(min-width:560px){.rv-rules{grid-template-columns:1fr 1fr}}
.rv-rule{text-align:left;padding:12px;border-radius:12px;border:2px solid var(--ink);background:var(--bg);font:600 1rem var(--font-body);cursor:pointer;min-height:52px;color:var(--ink)}
.rv-rule[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink)}
.rv-faces{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:10px;margin-top:12px}
.rv-face{background:var(--bg);border-radius:12px;padding:6px;text-align:center;border:2px solid var(--line);position:relative}
.rv-face svg{width:64px;height:64px;display:block;margin:0 auto}
.rv-face .verdict{font-size:.8rem;font-weight:700;min-height:1.3em}
.rv-face.right{border-color:var(--good);background:var(--good-bg)} .rv-face.wrong{border-color:var(--bad);background:var(--bad-bg)}
.rv-face .mark{position:absolute;top:2px;right:6px;font-weight:900}
.rv-lbl{display:flex;gap:4px;justify-content:center;margin-top:4px}
.rv-lbl button{flex:1;min-height:44px;border-radius:10px;border:2px solid var(--line);background:var(--card);font-size:1.3rem;cursor:pointer}
.rv-lbl button[aria-pressed="true"]{border-color:var(--ink);background:var(--accent);}
.rv-score{font-size:1.1rem;font-weight:800;margin-top:10px}
.rv-bots{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
.rv-bot{text-align:center;padding:10px;border-radius:12px;background:var(--bg2)} .rv-bot b{font-size:1.6rem;display:block}
`,
    js: function (el, api) {
      var D = api.D;
      // m = mouth curve (+ smile, - frown), b = eyebrows (+ relaxed, - angry). Happy only if both are positive.
      var COLORS = { y: '#ffd23f', b: '#8ecae6', p: '#ffafcc', g: '#95d5b2' };
      var train = [[.9, .8, 'y', 0], [-.8, .6, 'b', 0], [.7, -1, 'p', 1], [.8, .7, 'g', 1], [-.7, -1, 'y', 0], [.6, .9, 'b', 0], [.9, -.9, 'g', 0], [-.6, .8, 'p', 1]];
      var test = [[.8, .8, 'p', 0], [-.8, -.8, 'g', 0], [.7, -1, 'y', 1], [.9, .6, 'b', 1], [-.6, .7, 'y', 0], [.6, -.9, 'b', 0], [.7, .9, 'g', 0], [.5, .7, 'y', 1], [-.9, .9, 'b', 1], [.8, -.8, 'p', 0]];
      function truth(f) { return f[0] > 0 && f[1] > 0; }
      function face(f) {
        var m = f[0], b = f[1], c = COLORS[f[2]];
        var by = b > 0 ? 22 : 26, tilt = b > 0 ? -3 : 6;
        var hat = f[3] ? '<rect x="12" y="11" width="56" height="8" rx="3" fill="#d62828" stroke="#1d1d1f" stroke-width="2"/><path d="M66 13 l9 -5 l-2 10z" fill="#d62828" stroke="#1d1d1f" stroke-width="2"/>' : '';
        return '<svg viewBox="0 0 80 80" role="img" aria-label="' + (m > 0 ? 'smiling' : 'frowning') + ' face with ' + (b > 0 ? 'relaxed' : 'angry') + ' eyebrows' + (f[3] ? ', wearing a headband' : '') + '">' +
          '<circle cx="40" cy="42" r="32" fill="' + c + '" stroke="#1d1d1f" stroke-width="3"/>' + hat +
          '<line x1="20" y1="' + (by - tilt) + '" x2="34" y2="' + (by + tilt) + '" stroke="#1d1d1f" stroke-width="4" stroke-linecap="round"/>' +
          '<line x1="46" y1="' + (by + tilt) + '" x2="60" y2="' + (by - tilt) + '" stroke="#1d1d1f" stroke-width="4" stroke-linecap="round"/>' +
          '<circle cx="29" cy="36" r="4" fill="#1d1d1f"/><circle cx="51" cy="36" r="4" fill="#1d1d1f"/>' +
          '<path d="M24 54 Q40 ' + (54 + m * 18) + ' 56 54" fill="none" stroke="#1d1d1f" stroke-width="4" stroke-linecap="round"/></svg>';
      }
      var RULES = [
        { id: 'mouth', label: '😊 IF the mouth curves up → Happy', fn: function (f) { return f[0] > 0; } },
        { id: 'brows', label: '🤨 IF the eyebrows are relaxed → Happy', fn: function (f) { return f[1] > 0; } },
        { id: 'yellow', label: '💛 IF the face is yellow → Happy', fn: function (f) { return f[2] === 'y'; } },
        { id: 'band', label: '🎌 IF wearing a headband → Happy', fn: function (f) { return !!f[3]; } },
      ];
      var ruleScore = null, labels = {};
      el.innerHTML =
        '<div class="rv-round" id="rv1"><h3>🤖 Round 1 · Program RuleBot</h3><p>Pick the ONE rule RuleBot will use to decide who is happy.</p><div class="rv-rules">' +
        RULES.map(function (r) { return '<button type="button" class="rv-rule" data-r="' + r.id + '" aria-pressed="false">' + r.label + '</button>'; }).join('') +
        '</div><div id="rv1-out" aria-live="polite"></div></div>' +
        '<div class="rv-round" id="rv2" hidden><h3>🧠 Round 2 · Teach LearnBot</h3><p>LearnBot gets no rules. Tap 😊 or 😠 to label each training face. LearnBot measures each face’s <b>mouth</b> and <b>eyebrows</b>, then copies the label of the most similar face you taught it.</p>' +
        '<div class="rv-faces" id="rv-train"></div><p class="row" style="margin-top:12px"><button type="button" class="btn primary" id="rv-go" disabled>Train LearnBot (label all 8 first)</button></p><div id="rv2-out" aria-live="polite"></div></div>';

      function runTest(predict, outEl, who) {
        var right = 0;
        var html = '<div class="rv-faces">' + test.map(function (f) {
          var p = predict(f), ok = p === truth(f); if (ok) right++;
          return '<div class="rv-face ' + (ok ? 'right' : 'wrong') + '">' + face(f) + '<div class="verdict">' + (p ? '😊 Happy' : '😠 Grumpy') + '</div><span class="mark" aria-label="' + (ok ? 'correct' : 'wrong') + '">' + (ok ? '✓' : '✗') + '</span></div>';
        }).join('') + '</div>';
        outEl.innerHTML = '<p class="rv-score">' + who + ' guarded the gate: <b>' + right + ' / 10</b> correct.</p>' + html;
        return right;
      }

      D.$all('.rv-rule', el).forEach(function (b) {
        b.addEventListener('click', function () {
          D.$all('.rv-rule', el).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          var r = RULES.filter(function (x) { return x.id === b.getAttribute('data-r'); })[0];
          var out = D.$('#rv1-out', el);
          ruleScore = runTest(r.fn, out, 'RuleBot');
          var tips = {
            mouth: 'Good thinking! But look at the misses: <b>sneaky grins</b> — a smile with angry eyebrows. One rule couldn’t catch them.',
            brows: 'Clever! Eyebrows are a strong clue. But RuleBot missed <b>frowning faces</b> with relaxed eyebrows. One rule wasn’t enough.',
            yellow: 'Color has nothing to do with mood, so RuleBot is basically guessing. A rule is only as good as the idea behind it.',
            band: 'A headband doesn’t tell you someone’s mood. RuleBot followed your rule perfectly — the rule itself was the problem.',
          };
          out.innerHTML += '<p class="feedback">' + tips[r.id] + ' You could keep adding rules… but real faces have <i>thousands</i> of details: lighting, angles, glasses, hair. Writing rules for all of them is nearly impossible.</p>' +
            '<p class="row"><button type="button" class="btn" id="rv-next">Next: try LearnBot →</button> <span class="pill">Or tap another rule to test it</span></p>';
          D.$('#rv-next', el).addEventListener('click', function () { var r2 = D.$('#rv2', el); r2.hidden = false; r2.scrollIntoView({ behavior: D.reducedMotion() ? 'auto' : 'smooth', block: 'start' }); });
          D.sfx('click');
        });
      });

      var tr = D.$('#rv-train', el);
      tr.innerHTML = train.map(function (f, i) {
        return '<div class="rv-face" data-i="' + i + '">' + face(f) + '<div class="rv-lbl"><button type="button" data-v="1" aria-pressed="false" aria-label="Label face ' + (i + 1) + ' happy">😊</button><button type="button" data-v="0" aria-pressed="false" aria-label="Label face ' + (i + 1) + ' grumpy">😠</button></div></div>';
      }).join('');
      D.$all('.rv-lbl button', tr).forEach(function (b) {
        b.addEventListener('click', function () {
          var card = b.closest('.rv-face'), i = +card.getAttribute('data-i');
          labels[i] = b.getAttribute('data-v') === '1';
          D.$all('button', card).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          var n = Object.keys(labels).length, go = D.$('#rv-go', el);
          go.disabled = n < 8; go.textContent = n < 8 ? 'Train LearnBot (' + n + ' / 8 labeled)' : 'Train LearnBot 🧠';
          D.sfx('click');
        });
      });
      D.$('#rv-go', el).addEventListener('click', function () {
        function predict(f) {
          var best = 1e9, lab = false;
          train.forEach(function (t, i) { var d = Math.pow(t[0] - f[0], 2) + Math.pow(t[1] - f[1], 2); if (d < best) { best = d; lab = labels[i]; } });
          return lab;
        }
        var out = D.$('#rv2-out', el);
        var s = runTest(predict, out, 'LearnBot');
        var wrongLabels = train.filter(function (f, i) { return labels[i] !== truth(f); }).length;
        var msg = wrongLabels === 0
          ? 'LearnBot found the pattern from your examples — including the sneaky-grin clue that nobody wrote as a rule. <b>That’s machine learning.</b>'
          : 'Hmm — ' + wrongLabels + ' of your labels didn’t match the faces’ real moods, and LearnBot learned those mistakes too. <b>A learning machine is only as good as its examples.</b> Try relabeling!';
        out.innerHTML += '<div class="rv-bots"><div class="rv-bot">🤖 RuleBot<b>' + (ruleScore == null ? '–' : ruleScore) + '/10</b></div><div class="rv-bot">🧠 LearnBot<b>' + s + '/10</b></div></div><p class="feedback">' + msg + '</p>';
        D.sfx(s >= 9 ? 'win' : 'good');
        if (ruleScore != null) api.done();
      });
    },
  },
  quiz: [
    { q: 'What’s the big difference between RuleBot and LearnBot?', a: ['RuleBot follows rules a person wrote; LearnBot found a pattern in labeled examples', 'LearnBot is a robot and RuleBot is not', 'RuleBot is always wrong', 'LearnBot doesn’t need any examples'], c: 0, why: 'RuleBot only knows the exact rule you gave it. LearnBot built its own way of deciding from the examples you labeled.' },
    { q: 'What would happen if you labeled lots of happy faces as grumpy while teaching LearnBot?', a: ['LearnBot would learn the wrong pattern and make more mistakes', 'LearnBot would notice and fix your labels', 'Nothing — labels don’t matter', 'LearnBot would refuse to learn'], c: 0, why: 'A learning machine learns from the examples it gets — including the mistakes. Bad examples teach bad patterns.' },
    { q: 'Which job is easiest to do with a simple rule?', a: ['Turning minutes into seconds', 'Recognizing faces in photos', 'Understanding slang in messages', 'Guessing which song you’ll like next'], c: 0, why: 'Minutes × 60 = seconds, every single time. The others have too many messy details for simple rules.' },
    { q: 'Why do face-recognition systems use machine learning instead of hand-written rules?', a: ['Real faces have too many details and variations to write rules for all of them', 'Writing rules is against the law', 'Machine learning never makes mistakes', 'Computers can’t follow rules'], c: 0, why: 'Lighting, angles, glasses, hair… nobody can write a rule for every case. So we let the computer learn patterns from lots of examples. It still makes mistakes sometimes!' },
  ],
  challenge: {
    title: 'Rules or Learning?',
    intro: 'Real engineers choose the right tool for the job. For each task, decide: would you write <b>rules</b> or use <b>machine learning</b>? Get at least 6 of 8 right.',
    css: `
.rl-item{display:grid;gap:8px;padding:12px;border-radius:12px;background:var(--bg);margin-bottom:10px;border:2px solid var(--line)}
.rl-item p{margin:0;font-weight:700}
.rl-item .row button{flex:1;min-height:48px}
.rl-item.ok{border-color:var(--good)} .rl-item.no{border-color:var(--bad)}
.rl-why{font-size:.93rem}
`,
    js: function (el, api) {
      var D = api.D;
      var items = [
        ['Turning minutes into seconds', 'r', 'Multiply by 60. One exact rule works every time.'],
        ['Recognizing your friend’s voice on the phone', 'l', 'Voices change with mood, colds and background noise. Way too many details for rules.'],
        ['Checking if a chess move is legal', 'r', 'The rules of chess are exact and written down, so a rulebook works perfectly.'],
        ['Recommending videos you might like', 'l', 'Your taste is a pattern hidden in what you’ve watched. Learning systems find it from lots of data.'],
        ['Sorting emails into spam or not spam', 'l', 'Spammers keep changing their tricks. Spam filters learn from millions of labeled examples.'],
        ['A traffic light that changes every 60 seconds', 'r', 'A simple timer rule. No learning needed.'],
        ['Reading messy handwriting', 'l', 'Everyone writes differently. Handwriting readers learn from huge sets of examples.'],
        ['Adding up the points scored in a basketball game', 'r', '2 points, 3 points, free throws — exact rules you can write down.'],
      ];
      var answered = {}, right = 0;
      function render() {
        answered = {}; right = 0;
        el.innerHTML = items.map(function (it, i) {
          return '<div class="rl-item" data-i="' + i + '"><p>' + (i + 1) + '. ' + it[0] + '</p><div class="row"><button type="button" class="btn small" data-v="r">📏 Rules</button><button type="button" class="btn small" data-v="l">🧠 Learning</button></div><div class="rl-why" aria-live="polite"></div></div>';
        }).join('') + '<p class="feedback" id="rl-sum" aria-live="polite"></p>';
        D.$all('.rl-item button', el).forEach(function (b) {
          b.addEventListener('click', function () {
            var box = b.closest('.rl-item'), i = +box.getAttribute('data-i');
            if (answered[i]) return; answered[i] = true;
            var ok = b.getAttribute('data-v') === items[i][1]; if (ok) right++;
            box.classList.add(ok ? 'ok' : 'no'); D.$all('button', box).forEach(function (x) { x.disabled = true; });
            D.$('.rl-why', box).innerHTML = (ok ? '✅ ' : '❌ Best answer: <b>' + (items[i][1] === 'r' ? 'Rules' : 'Learning') + '</b>. ') + items[i][2];
            D.sfx(ok ? 'good' : 'bad');
            if (Object.keys(answered).length === items.length) {
              var sum = D.$('#rl-sum', el);
              if (right >= 6) { sum.className = 'feedback ok'; sum.textContent = 'You scored ' + right + '/8. You think like an AI engineer!'; api.done(); }
              else { sum.className = 'feedback no'; sum.innerHTML = 'You scored ' + right + '/8. Read the explanations, then <button type="button" class="btn small" id="rl-again">try again</button>'; D.$('#rl-again', el).addEventListener('click', render); }
            }
          });
        });
      }
      render();
    },
  },
};
