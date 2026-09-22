module.exports = {
  hook: 'Every great app starts as a clear plan called a spec. Turn your idea into a spec so clear that any builder, human or AI, could build it.',
  story: [
    ['sensei', 'Before a ninja fights, they plan. Before an app is built, it needs a <b>spec</b> (short for specification), {{nick}}.'],
    ['sensei', 'A spec answers: <b>Who</b> is it for? What <b>problem</b> does it solve? What are the must-have <b>features</b>? What should it <b>NOT</b> do? And how will you <b>know it works</b>?'],
    ['you', 'Why not just tell the AI “make me a cool app”?'],
    ['sensei', 'Because “cool” means nothing to a computer! The Spec Doctor will flag fuzzy words like that. Let’s write a spec. Need an idea? Try a {{T.name}} app!'],
  ],
  activity: {
    title: 'The Spec Builder',
    instructions: 'Fill in every part of the spec. The Spec Doctor checks each one and flags vague words. When all parts pass, you get a printable spec card.',
    css: `
.sp-ideas{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.sp-ideas button{min-height:40px;border-radius:999px;border:1px solid #f5c54288;background:var(--bg2);color:var(--ink);padding:4px 12px;font:700 .85rem var(--font-body);cursor:pointer}
.sp-f{display:grid;gap:10px}
.sp-f label{display:grid;gap:4px;font-weight:800}
.sp-f input,.sp-f textarea{min-height:44px;border-radius:10px;border:2px solid #f5c54255;background:#111;color:#f3f1ea;padding:8px 10px;font:600 1rem var(--font-body)}
.sp-f textarea{min-height:64px;resize:vertical}
.sp-f .doc{font-weight:700;font-size:.85rem}
.sp-f .doc.ok{color:#3ccf7a}.sp-f .doc.no{color:#ffb4a8}
.sp-card{margin-top:14px;border:3px solid #f5c542;border-radius:14px;padding:14px;background:#141414}
.sp-card h3{color:#f5c542;margin:0 0 6px}
.sp-card dt{font-weight:800;color:#f5c542;margin-top:8px}
.sp-card dd{margin:2px 0 0}
`,
    js: function (el, api) {
      var D = api.D, T = api.T;
      var VAGUE = ['cool', 'awesome', 'stuff', 'things', 'everything', 'nice', 'good', 'best', 'amazing', 'epic', 'whatever'];
      var F = [['name', 'App name', 'e.g. Free-Throw Tracker', 1, 'input'], ['users', 'Who is it for?', 'e.g. Kids on my basketball team, ages 10–13', 3, 'input'], ['problem', 'What problem does it solve?', 'e.g. We forget how many free throws we make each practice', 5, 'textarea'], ['f1', 'Must-have feature 1', 'e.g. Tap a button to log a made or missed shot', 3, 'input'], ['f2', 'Must-have feature 2', 'e.g. Show today’s percentage in big numbers', 3, 'input'], ['f3', 'Must-have feature 3', 'e.g. Save each practice so I can see my progress', 3, 'input'], ['not', 'What should it NOT do?', 'e.g. No accounts, no ads, no collecting names or photos', 3, 'input'], ['test', 'How will you know it works?', 'e.g. If I log 7 makes out of 10, it shows 70%', 5, 'textarea']];
      var IDEAS = ['⏱️ ' + T.name + ' practice timer', '📊 Stat tracker for ' + T.group, '🧠 Quiz game about ' + T.name, '🗓️ Habit tracker for training', '🃏 Flashcards for AI terms'];
      var S = api.load(), V = S.v || {};
      el.innerHTML = '<p style="font-weight:700;margin:0 0 6px">Idea starters (tap to use as the name):</p><div class="sp-ideas">' + IDEAS.map(function (i) { return '<button type="button" data-idea="' + D.esc(i) + '">' + D.esc(i) + '</button>'; }).join('') + '</div><div class="sp-f">' +
        F.map(function (f) { var tag = f[4] === 'textarea' ? '<textarea data-f="' + f[0] + '" maxlength="220" placeholder="' + D.esc(f[2]) + '">' + D.esc(V[f[0]] || '') + '</textarea>' : '<input data-f="' + f[0] + '" maxlength="120" placeholder="' + D.esc(f[2]) + '" value="' + D.esc(V[f[0]] || '') + '">'; return '<label>' + f[1] + tag + '<span class="doc" data-d="' + f[0] + '" aria-live="polite"></span></label>'; }).join('') + '</div><div id="sp-out"></div>';
      function check(f) {
        var v = (V[f[0]] || '').trim(), words = (v.match(/[A-Za-z0-9’']+/g) || []), bad = words.filter(function (w) { return VAGUE.indexOf(w.toLowerCase()) >= 0; });
        if (words.length < f[3]) return [false, '🩺 Needs more detail (at least ' + f[3] + ' word' + (f[3] > 1 ? 's' : '') + ').'];
        if (f[0] !== 'name' && bad.length) return [false, '🩺 Vague word spotted: “' + bad[0] + '.” What exactly do you mean?'];
        return [true, '✅ Clear!'];
      }
      function render() {
        var all = true;
        F.forEach(function (f) { var r = check(f), d = D.$('[data-d="' + f[0] + '"]', el); d.className = 'doc ' + (r[0] ? 'ok' : (V[f[0]] ? 'no' : '')); d.textContent = V[f[0]] ? r[1] : ''; if (!r[0]) all = false; });
        var out = D.$('#sp-out', el);
        if (!all) { out.innerHTML = ''; return; }
        out.innerHTML = '<div class="sp-card" id="sp-card"><h3>📋 SPEC: ' + D.esc(V.name) + '</h3><dl><dt>For</dt><dd>' + D.esc(V.users) + '</dd><dt>Problem</dt><dd>' + D.esc(V.problem) + '</dd><dt>Must-have features</dt><dd>1. ' + D.esc(V.f1) + '<br>2. ' + D.esc(V.f2) + '<br>3. ' + D.esc(V.f3) + '</dd><dt>It will NOT</dt><dd>' + D.esc(V.not) + '</dd><dt>It works when</dt><dd>' + D.esc(V.test) + '</dd></dl></div><div class="row" style="margin-top:10px"><button type="button" class="btn small" id="sp-print">🖨️ Print my spec card</button></div><p class="feedback ok">🏆 A real spec! It will travel with you to the final Black Belt Project.</p>';
        D.$('#sp-print', el).addEventListener('click', function () {
          var w = window.open('', '_blank'); if (!w) return;
          w.document.write('<!doctype html><title>Spec: ' + D.esc(V.name) + '</title><body style="font-family:Georgia,serif;max-width:640px;margin:30px auto;line-height:1.5">' + D.$('#sp-card', el).innerHTML.replace(/color:#f5c542/g, '') + '<p style="margin-top:30px;color:#555">Made in Yusuf’s AI Dojo</p></body>');
          w.document.close(); w.focus(); w.print();
        });
        api.done();
      }
      D.$all('[data-f]', el).forEach(function (i) { i.addEventListener('input', function () { V[i.getAttribute('data-f')] = i.value; api.save({ v: V }); render(); }); });
      D.$all('[data-idea]', el).forEach(function (b) { b.addEventListener('click', function () { V.name = b.getAttribute('data-idea').replace(/^\S+\s/, ''); D.$('[data-f="name"]', el).value = V.name; api.save({ v: V }); render(); }); });
      render();
    },
  },
  quiz: [
    { q: 'What is a spec?', a: ['A clear description of what an app should do, for whom, and how you know it works', 'A pair of glasses', 'A type of bug', 'The app’s code'], c: 0, why: 'Specification = the plan.' },
    { q: 'Why did the Spec Doctor flag words like “cool” and “awesome”?', a: ['They’re vague — a builder can’t know what you actually mean', 'They’re rude', 'They’re too short', 'Computers can’t read them'], c: 0, why: 'Specific beats vague, every time.' },
    { q: 'Why include what the app should NOT do?', a: ['To set limits, like not collecting personal info or showing ads', 'To make the spec longer', 'It isn’t useful', 'So the AI adds those things'], c: 0, why: 'Limits keep apps safe and focused.' },
    { q: 'Which is the best “how will you know it works?” line?', a: ['“If I log 7 makes out of 10, it shows 70%.”', '“It works well.”', '“It’s awesome.”', '“The AI says it works.”'], c: 0, why: 'A testable, specific check.' },
  ],
  challenge: {
    title: 'Spec Surgeon',
    intro: 'Pick the clearer version of each spec line. Get 4 of 5.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'Feature line:', a: ['“A 60-second countdown timer with a loud beep at the end”', '“A cool timer thing”'], c: 0, why: 'Exact time + exact behavior.' },
        { q: 'Who is it for?', a: ['“My soccer team, ages 10–12, using a tablet at practice”', '“Everyone”'], c: 0, why: '“Everyone” gives the builder nothing to design for.' },
        { q: 'NOT-do line:', a: ['“No sign-ups, no chat with strangers, no photos”', '“Nothing bad”'], c: 0, why: 'Specific limits are enforceable.' },
        { q: 'Test line:', a: ['“After 3 correct answers, the score shows 3”', '“The quiz is good”'], c: 0, why: 'You can actually check it.' },
        { q: 'Problem line:', a: ['“We waste practice time arguing about whose turn it is”', '“Practice could be better”'], c: 0, why: 'A real, specific problem to solve.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 4) api.done(); } });
    },
  },
};
