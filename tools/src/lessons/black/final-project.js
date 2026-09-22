module.exports = {
  hook: 'Your Black Belt Project: design your own AI-powered app, from idea to spec to prompts to test plan, and print it as a professional project page.',
  story: [
    ['sensei', 'This is your final kata, {{nick}}. Everything you’ve learned comes together here.'],
    ['sensei', 'You’ll design your <b>own AI-powered app</b>: the idea, the spec, how its AI works and how it could go wrong, the prompts to build it, and a test plan to prove it works and stays safe.'],
    ['you', 'And then I can actually build it?'],
    ['sensei', 'With a trusted adult and a real AI app builder, yes! And you’ll print a project page to show everyone. <b>Iteration</b> is the key: build, test, fix, repeat. Begin!'],
  ],
  activity: {
    title: 'Design Your AI App',
    instructions: 'Work through all 6 steps. Everything saves automatically, so you can stop and come back anytime. The last step makes your printable project page.',
    css: `
.fp-steps{display:flex;gap:4px;margin-bottom:12px}
.fp-steps span{flex:1;height:10px;border-radius:5px;background:#333}
.fp-steps span.on{background:#f5c542}
.fp-f{display:grid;gap:10px}
.fp-f label{display:grid;gap:4px;font-weight:800;min-width:0}
.fp-f input,.fp-f select,.fp-f textarea{width:100%;max-width:100%;min-width:0}
.fp-f input,.fp-f textarea,.fp-f select{min-height:44px;border-radius:10px;border:2px solid #f5c54255;background:#111;color:#f3f1ea;padding:8px 10px;font:600 1rem var(--font-body)}
.fp-f textarea{min-height:70px;resize:vertical}
.fp-f .hint{font-weight:600;font-size:.85rem;color:var(--muted)}
.fp-ck label{display:flex;gap:8px;align-items:flex-start;font-weight:700;min-height:40px}
.fp-ck input{width:22px;height:22px;flex:none;accent-color:#f5c542}
.fp-nav{display:flex;justify-content:space-between;gap:8px;margin-top:14px;flex-wrap:wrap}
.fp-sheet{border:3px solid #f5c542;border-radius:14px;padding:14px;background:#141414}
.fp-sheet h3{color:#f5c542}
.fp-sheet h4{color:#f5c542;margin:12px 0 4px}
.fp-sheet pre{white-space:pre-wrap;font:600 .88rem/1.5 ui-monospace,Menlo,monospace;background:#0b0b0b;padding:8px;border-radius:8px;margin:0}
`,
    js: function (el, api) {
      var D = api.D, S = api.load(), P = S.p || {}, step = S.step || 0;
      var spec = (D.saveGet('act', 'black/idea-to-spec') || {}).v || {};
      ['name', 'users', 'problem', 'f1', 'f2', 'f3', 'not', 'test'].forEach(function (k) { if (P[k] == null && spec[k]) P[k] = spec[k]; });
      var AITYPES = [['recognize', '👁️ Recognizes things (images, sounds, handwriting)'], ['predict', '🔮 Predicts something (scores, what’s next)'], ['recommend', '🎯 Recommends (drills, songs, puzzles)'], ['create', '🎨 Creates (stories, quiz questions, art)'], ['chat', '💬 Chats and explains (a study buddy)']];
      var STEPS = [
        { t: '1 · The idea', f: [['name', 'App name', 1, 'input', 'e.g. Kata Coach'], ['ai', 'What does its AI do?', 0, 'select'], ['pitch', 'One-sentence pitch', 6, 'textarea', 'e.g. An app that watches my practice timer and recommends which drill to do next based on my weak spots.']] },
        { t: '2 · The spec', f: [['users', 'Who is it for?', 3, 'input'], ['problem', 'What problem does it solve?', 5, 'textarea'], ['f1', 'Feature 1', 3, 'input'], ['f2', 'Feature 2', 3, 'input'], ['f3', 'Feature 3', 3, 'input'], ['not', 'It will NOT…', 3, 'input', 'e.g. collect names, photos or locations; show ads'], ['test', 'It works when…', 5, 'textarea']] },
        { t: '3 · Think like an AI engineer', f: [['data', 'What data would the AI need to learn from or use?', 5, 'textarea', 'e.g. My past practice logs: drill names, minutes, and how I rated each one'], ['wrong', 'How could the AI be WRONG? What will you do about it?', 6, 'textarea', 'e.g. It might recommend the same drill too often, so I’ll add a “try something new” button'], ['fair', 'How could it be unfair or unsafe? How will you prevent it?', 6, 'textarea', 'e.g. It should work for beginners too, so I’ll test it with kids of different levels']] },
        { t: '4 · Prompts', f: [['p1', 'Starter prompt (context + core feature)', 15, 'textarea'], ['p2', 'Follow-up prompt (feature 2)', 6, 'textarea'], ['p3', 'Follow-up prompt (feature 3)', 6, 'textarea']] },
        { t: '5 · Test plan & safety', f: [['t1', 'Test 1', 5, 'input'], ['t2', 'Test 2', 5, 'input'], ['t3', 'Test 3', 5, 'input'], ['t4', 'Privacy test', 5, 'input']], checks: [['c1', 'My app never asks for personal information'], ['c2', 'I will build it with a trusted adult and follow the tool’s age rules'], ['c3', 'I will test that it works fairly for different users'], ['c4', 'I will fact-check anything the AI states as fact']] },
        { t: '6 · Project page', f: [] },
      ];
      function words(s) { return ((s || '').trim().match(/\S+/g) || []).length; }
      function autofill(i) {
        if (i === 3) {
          if (!P.p1) P.p1 = 'Build a web app called ' + (P.name || 'my app') + ' for ' + (P.users || 'kids') + '. Problem: ' + (P.problem || '') + ' Start with only this feature: ' + (P.f1 || '') + '. Make it simple, with big buttons that are easy to tap on a phone. Do not collect any personal information.';
          if (!P.p2) P.p2 = 'Now add this feature: ' + (P.f2 || '') + '. Don’t change how the existing features work.';
          if (!P.p3) P.p3 = 'Now add this feature: ' + (P.f3 || '') + '. Keep everything else the same.';
        }
        if (i === 4) {
          if (!P.t1) P.t1 = 'Check that ' + (P.f1 || 'feature 1') + ' works: ' + (P.test || '');
          if (!P.t2) P.t2 = 'Check that ' + (P.f2 || 'feature 2') + ' works as expected';
          if (!P.t3) P.t3 = 'Try weird input (empty, huge numbers) and make sure nothing breaks';
          if (!P.t4) P.t4 = 'Go through every screen: no field asks for a name, address, school or photo';
        }
      }
      function valid(i) {
        var s = STEPS[i], bad = s.f.filter(function (f) { return f[3] === 'select' ? !P[f[0]] : words(P[f[0]]) < f[2]; });
        if (s.checks) bad = bad.concat(s.checks.filter(function (c) { return !P[c[0]]; }));
        return bad.length === 0;
      }
      function field(f) {
        var v = D.esc(P[f[0]] || ''), ph = f[4] ? ' placeholder="' + D.esc(f[4]) + '"' : '', need = f[3] === 'select' ? '' : '<span class="hint" data-h="' + f[0] + '">' + (words(P[f[0]]) >= f[2] ? '✅' : 'At least ' + f[2] + ' word' + (f[2] > 1 ? 's' : '')) + '</span>';
        if (f[3] === 'select') return '<label>' + f[1] + '<select data-f="' + f[0] + '"><option value="">Choose…</option>' + AITYPES.map(function (a) { return '<option value="' + a[0] + '"' + (P.ai === a[0] ? ' selected' : '') + '>' + a[1] + '</option>'; }).join('') + '</select></label>';
        return '<label>' + f[1] + (f[3] === 'textarea' ? '<textarea data-f="' + f[0] + '" data-min="' + f[2] + '" maxlength="600"' + ph + '>' + v + '</textarea>' : '<input data-f="' + f[0] + '" data-min="' + f[2] + '" maxlength="160"' + ph + ' value="' + v + '">') + need + '</label>';
      }
      function sheet() {
        var ai = AITYPES.filter(function (a) { return a[0] === P.ai; })[0];
        return '<div class="fp-sheet" id="fp-sheet"><h3>🏁 ' + D.esc(P.name) + '</h3><p><i>' + D.esc(P.pitch) + '</i></p><p>Designed by <b>' + D.student + '</b> (a.k.a. ' + D.esc(D.nick()) + ') · Black Belt Project · Yusuf’s AI Dojo</p>' +
          '<h4>🤖 AI feature</h4><p>' + (ai ? ai[1] : '') + '</p><h4>📋 Spec</h4><p><b>For:</b> ' + D.esc(P.users) + '<br><b>Problem:</b> ' + D.esc(P.problem) + '<br><b>Features:</b> 1. ' + D.esc(P.f1) + ' · 2. ' + D.esc(P.f2) + ' · 3. ' + D.esc(P.f3) + '<br><b>It will NOT:</b> ' + D.esc(P.not) + '<br><b>It works when:</b> ' + D.esc(P.test) + '</p>' +
          '<h4>🧠 AI engineering</h4><p><b>Data:</b> ' + D.esc(P.data) + '<br><b>Could be wrong because:</b> ' + D.esc(P.wrong) + '<br><b>Fairness & safety:</b> ' + D.esc(P.fair) + '</p>' +
          '<h4>💬 Build prompts</h4><pre>1. ' + D.esc(P.p1) + '\n\n2. ' + D.esc(P.p2) + '\n\n3. ' + D.esc(P.p3) + '</pre><h4>🧪 Test plan</h4><p>☐ ' + D.esc(P.t1) + '<br>☐ ' + D.esc(P.t2) + '<br>☐ ' + D.esc(P.t3) + '<br>☐ ' + D.esc(P.t4) + '</p><h4>🛡️ Safety promises</h4><p>✔ No personal information · ✔ Built with a trusted adult, following age rules · ✔ Tested for fairness · ✔ Facts checked</p></div>';
      }
      function render() {
        if (step === 3 || step === 4) autofill(step);
        var s = STEPS[step], h = '<div class="fp-steps" aria-hidden="true">' + STEPS.map(function (_, i) { return '<span class="' + (i <= step ? 'on' : '') + '"></span>'; }).join('') + '</div><h3>' + s.t + '</h3>';
        if (step < 5) {
          h += '<div class="fp-f">' + s.f.map(field).join('') + '</div>';
          if (s.checks) h += '<div class="fp-ck" style="margin-top:10px">' + s.checks.map(function (c) { return '<label><input type="checkbox" data-c="' + c[0] + '"' + (P[c[0]] ? ' checked' : '') + '> ' + c[1] + '</label>'; }).join('') + '</div>';
          if (step === 3) h += '<p class="hint" style="margin-top:6px">✨ We drafted these from your spec. Make them your own!</p>';
        } else {
          h += sheet() + '<div class="row" style="margin-top:10px"><button type="button" class="btn primary" id="fp-print">🖨️ Print my project page</button></div><p class="feedback ok">🏆 Project complete, Master Builder! Now go build it for real with a trusted adult, then test, fix and repeat. That’s iteration.</p>';
        }
        h += '<div class="fp-nav">' + (step > 0 ? '<button type="button" class="btn" id="fp-back">← Back</button>' : '<span></span>') + (step < 5 ? '<button type="button" class="btn primary" id="fp-next">Next →</button>' : '') + '</div><p class="feedback" id="fp-fb" aria-live="polite"></p>';
        el.innerHTML = h;
        D.$all('[data-f]', el).forEach(function (i) {
          i.addEventListener(i.tagName === 'SELECT' ? 'change' : 'input', function () {
            P[i.getAttribute('data-f')] = i.value; api.save({ p: P });
            var hint = D.$('[data-h="' + i.getAttribute('data-f') + '"]', el), min = +i.getAttribute('data-min');
            if (hint) hint.textContent = words(i.value) >= min ? '✅' : 'At least ' + min + ' word' + (min > 1 ? 's' : '');
          });
        });
        D.$all('[data-c]', el).forEach(function (c) { c.addEventListener('change', function () { P[c.getAttribute('data-c')] = c.checked; api.save({ p: P }); }); });
        var nx = D.$('#fp-next', el); if (nx) nx.addEventListener('click', function () { if (!valid(step)) { var f = D.$('#fp-fb', el); f.className = 'feedback no'; f.textContent = 'Finish every part of this step first (look for the ✅ checks).'; D.sfx('bad'); return; } step++; api.save({ step: step, p: P }); D.sfx('good'); render(); el.scrollIntoView({ block: 'start', behavior: D.reducedMotion() ? 'auto' : 'smooth' }); });
        var bk = D.$('#fp-back', el); if (bk) bk.addEventListener('click', function () { step--; api.save({ step: step }); render(); });
        var pr = D.$('#fp-print', el);
        if (pr) pr.addEventListener('click', function () {
          var w = window.open('', '_blank'); if (!w) return;
          w.document.write('<!doctype html><title>' + D.esc(P.name) + ' · Black Belt Project</title><style>body{font-family:Georgia,serif;max-width:720px;margin:24px auto;padding:0 16px;line-height:1.5;color:#111}h3{font-size:1.8rem;margin:0}h4{margin:16px 0 4px;border-bottom:2px solid #9a7b1a}pre{white-space:pre-wrap;font:14px/1.5 Menlo,monospace;background:#f5f1e6;padding:10px;border-radius:6px}</style><body>' + D.$('#fp-sheet', el).innerHTML + '</body>');
          w.document.close(); w.focus(); w.print();
        });
        if (step === 5) { var st = D.state(); st.project = { name: P.name, saved: D.today() }; D.save(); D.checkBadges(); api.done(); }
      }
      render();
    },
  },
  quiz: [
    { q: 'What does iteration mean?', a: ['Improving something in repeated rounds: build, test, fix, repeat', 'Doing something once perfectly', 'Giving up after one try', 'Deleting your work'], c: 0, why: 'Every great app is iterated.' },
    { q: 'Why did your project plan include how the AI could be WRONG?', a: ['So you can plan how to catch and handle mistakes', 'To make it longer', 'AI is never wrong', 'No reason'], c: 0, why: 'Great builders plan for failure.' },
    { q: 'Why does every project include a privacy test?', a: ['To make sure the app never collects personal information it shouldn’t', 'Tests are decoration', 'To make the app slower', 'Privacy doesn’t matter'], c: 0, why: 'Privacy by design.' },
    { q: 'What’s the most important thing to do before building your app with a real AI tool?', a: ['Involve a trusted adult and check the tool’s age rules', 'Share your password with it', 'Skip the spec', 'Build it in secret'], c: 0, why: 'Safe builders build together.' },
  ],
  challenge: {
    title: 'Pitch Perfect',
    intro: 'Great builders can explain their app in one clear sentence. Pick the best pitch for each app. Get 2 of 3.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'A timer app for karate practice:', a: ['“A karate interval timer that beeps between rounds so I can train without watching the clock.”', '“The coolest app ever.”', '“It’s a timer.”'], c: 0, why: 'Who, what, and why, in one sentence.' },
        { q: 'A chess puzzle app:', a: ['“Daily mate-in-one puzzles that track my streak so I improve a little every day.”', '“Chess stuff.”', '“An app better than all other apps.”'], c: 0, why: 'Specific and motivating.' },
        { q: 'A study helper:', a: ['“A quiz buddy that asks me questions one at a time and only gives hints, so I actually learn.”', '“It does my homework.”', '“A smart AI thing.”'], c: 0, why: 'Clear, and it helps you learn instead of skipping the thinking.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 2) api.done(); } });
    },
  },
};
