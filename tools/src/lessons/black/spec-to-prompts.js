module.exports = {
  hook: 'A spec is the plan. Prompts are the orders you give the builder, one clear step at a time. Turn a chess-clock spec into a winning prompt plan.',
  story: [
    ['sensei', 'Pros don’t paste a whole app idea into one giant prompt and hope, {{nick}}. They build <b>step by step</b>.'],
    ['sensei', 'First prompt: <b>context</b> (who it’s for, what it is) plus the most important feature. Then one feature per prompt. Then test, and fix bugs with <b>precise</b> prompts.'],
    ['you', 'Why one feature at a time?'],
    ['sensei', 'Small steps are easier for the AI to get right and easier for YOU to test. If something breaks, you know exactly which step did it. Just like debugging your ninja algorithm back in the White Belt!'],
  ],
  activity: {
    title: 'The Prompt Plan',
    instructions: 'Use the Chess Clock spec below. Round 1: pick the better prompt in 3 matchups. Round 2: put the build prompts in the smartest order.',
    css: `
.sp2-spec{border:2px solid #f5c54288;border-radius:12px;padding:10px 12px;background:var(--bg2);font-size:.95rem}
.sp2-spec b{color:#f5c542}
.sp2-vs{display:grid;gap:8px;margin:10px 0}
@media(min-width:680px){.sp2-vs{grid-template-columns:1fr 1fr}}
.sp2-vs button{text-align:left;min-height:80px;border-radius:12px;border:2px solid #f5c54266;background:var(--card);color:var(--ink);padding:10px;font:600 .9rem/1.45 ui-monospace,Menlo,monospace;cursor:pointer}
.sp2-vs button:hover{border-color:#f5c542}
.sp2-pool,.sp2-out{display:grid;gap:6px;padding:8px;border-radius:12px;background:var(--bg2);margin-bottom:8px;min-height:50px}
.sp2-pool button{text-align:left;min-height:48px;border-radius:10px;border:2px solid #f5c542;background:var(--card);color:var(--ink);padding:8px 10px;font:600 .88rem/1.4 var(--font-body);cursor:pointer}
.sp2-out span{display:block;padding:8px 10px;border-radius:10px;background:#f5c542;color:#141414;font:700 .88rem/1.4 var(--font-body)}
`,
    js: function (el, api) {
      var D = api.D;
      var VS = [
        ['Starting prompt', 'Build a chess clock web app for two players at my chess club (ages 9–14), used on one tablet. Start with just this: two big timers, 5 minutes each. Tapping your side stops your clock and starts your opponent’s.', 'Make a chess clock app with every feature ever and make it perfect.', 'Context + one core feature beats “everything, perfect.”'],
        ['Adding a feature', 'Now add a settings screen where we can choose 1, 3, 5 or 10 minutes before the game starts. Don’t change how the timers work.', 'Also add settings and sounds and themes and online play and a leaderboard.', 'One feature at a time, plus “don’t change what already works.”'],
        ['Fixing a bug', 'Bug: when a clock reaches 0:00 it keeps counting into negative numbers (−0:01, −0:02). It should stop at 0:00 and show “Time’s up!” Please fix only this.', 'It’s broken, fix it.', 'Describe what happened, what should happen, and keep the fix focused.'],
      ];
      var ORDER = ['1️⃣ Context + two timers that switch when tapped', '2️⃣ Add a pause button', '3️⃣ Add time-choice settings (1, 3, 5, 10 minutes)', '4️⃣ Test everything, then fix bugs one by one with precise prompts'];
      var S = api.load(), r = S.r || 0, picked = S.picked || [];
      function render() {
        var h = '<div class="sp2-spec"><b>SPEC · Chess Clock.</b> For: players at my chess club (ages 9–14) on one shared tablet. Problem: we don’t have a real clock at practice. Features: two timers that switch on tap · a pause button · choose 1/3/5/10 minutes. NOT: no accounts, no ads, no online play. Works when: after tapping, the other clock counts down, and each clock stops at 0:00.</div>';
        if (r < VS.length) {
          var v = VS[r], opts = D.shuffle([[1, v[1]], [0, v[2]]]);
          h += '<p style="font-weight:800;margin:12px 0 0">Round 1 · Matchup ' + (r + 1) + ' of 3: ' + v[0] + '. Which prompt is better?</p><div class="sp2-vs">' + opts.map(function (o) { return '<button type="button" data-ok="' + o[0] + '">“' + o[1] + '”</button>'; }).join('') + '</div><p class="feedback" id="sp2-f" aria-live="polite"></p>';
        } else if (picked.length < ORDER.length) {
          h += '<p style="font-weight:800;margin:12px 0 0">Round 2 · Tap the build prompts in the best order:</p><div class="sp2-out" aria-live="polite">' + picked.map(function (i) { return '<span>' + ORDER[i].slice(3) + '</span>'; }).join('') + '</div><div class="sp2-pool">' + D.shuffle(ORDER.map(function (o, i) { return i; }).filter(function (i) { return picked.indexOf(i) < 0; })).map(function (i) { return '<button type="button" data-o="' + i + '">' + ORDER[i].slice(3) + '</button>'; }).join('') + '</div><p class="feedback" id="sp2-f2" aria-live="polite"></p>';
        } else {
          h += '<div class="sp2-out">' + ORDER.map(function (o) { return '<span>' + o + '</span>'; }).join('') + '</div><p class="feedback ok">🏆 That’s a pro prompt plan: context first, core feature, one feature at a time, then test and fix precisely. You could build this chess clock for real in the Code Playground lesson!</p>';
          api.done();
        }
        el.innerHTML = h;
        D.$all('[data-ok]', el).forEach(function (b) { b.addEventListener('click', function () { var f = D.$('#sp2-f', el); if (b.getAttribute('data-ok') === '1') { D.sfx('good'); f.className = 'feedback ok'; f.textContent = '✅ ' + VS[r][3]; D.$all('[data-ok]', el).forEach(function (x) { x.disabled = true; }); r++; api.save({ r: r }); setTimeout(render, 1500); } else { D.sfx('bad'); b.disabled = true; f.className = 'feedback no'; f.textContent = 'Which one gives the builder clear, focused instructions?'; } }); });
        D.$all('[data-o]', el).forEach(function (b) { b.addEventListener('click', function () { var i = +b.getAttribute('data-o'); if (i === picked.length) { picked.push(i); api.save({ picked: picked }); D.sfx('good'); render(); } else { D.sfx('bad'); var f = D.$('#sp2-f2', el); f.className = 'feedback no'; f.textContent = 'Start with the core of the app, then add one feature at a time, then test.'; } }); });
      }
      render();
    },
  },
  quiz: [
    { q: 'What should your FIRST prompt to an app builder include?', a: ['Context (who it’s for, what it is) plus the most important feature', 'Every feature you can imagine', 'Just the app’s name', 'Your home address'], c: 0, why: 'Start small and clear.' },
    { q: 'Why add features one at a time?', a: ['Each step is easier to get right and easier to test', 'AI can only read one word', 'It’s slower on purpose', 'No reason'], c: 0, why: 'Small steps = fewer surprises.' },
    { q: 'Which is the best bug-fix prompt?', a: ['“When the clock hits 0:00 it goes negative. It should stop at 0:00 and say Time’s up. Fix only this.”', '“Broken. Fix.”', '“Make it better.”', '“Redo the whole app.”'], c: 0, why: 'What happened, what should happen, and a focused request.' },
    { q: 'Why say “don’t change how the timers work” when adding settings?', a: ['So the AI doesn’t accidentally break a feature that already works', 'To confuse the AI', 'Because timers can’t change', 'It’s not useful'], c: 0, why: 'Protect what works.' },
  ],
  challenge: {
    title: 'Context Is King',
    intro: 'Adding the right context makes prompts dramatically better. Which added detail helps MOST? Get 3 of 4.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'Prompt: “Make a quiz app.” Best detail to add?', a: ['“For 5th graders studying planets, 10 multiple-choice questions”', '“Make it awesome”', '“Use the color blue somewhere”', '“Please”'], c: 0, why: 'Audience + topic + size.' },
        { q: 'Prompt: “Make a timer.” Best detail to add?', a: ['“For karate drills: 30 seconds of work, 10 seconds of rest, 8 rounds, with a beep between”', '“A nice one”', '“Make it fast”', '“The best timer ever”'], c: 0, why: 'Exact behavior the builder can implement.' },
        { q: 'Prompt: “Make it look better.” Best detail to add?', a: ['“Bigger buttons for small screens, dark background, bright yellow numbers”', '“More better”', '“Like a real app”', '“Cooler”'], c: 0, why: 'Concrete visual instructions.' },
        { q: 'Which context should you NEVER put in a prompt?', a: ['Your full name, school, address or passwords', 'The app’s audience', 'The features you want', 'The colors you like'], c: 0, why: 'Protect personal information. Always.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
