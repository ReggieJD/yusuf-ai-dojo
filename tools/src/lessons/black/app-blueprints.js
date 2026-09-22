module.exports = {
  hook: 'Five ready-to-build App Blueprints, each with a spec, a starter prompt and a test checklist. Take them to a real AI app builder with a trusted adult.',
  story: [
    ['sensei', 'You can plan, prompt, test and read code, {{nick}}. Time to pick a real project.'],
    ['sensei', 'Here are five <b>App Blueprints</b>. Each has a <b>spec</b>, a <b>starter prompt</b> you can copy into a tool like Replit or Base44, and a <b>test checklist</b> to prove it works.'],
    ['you', 'Can I use them right now?'],
    ['sensei', 'With a trusted adult, yes! Real AI builders have their own age rules and accounts, so a grown-up should set things up with you. And remember: never put personal information into your prompts or your app.'],
  ],
  activity: {
    title: 'Blueprint Vault',
    instructions: 'Open all 5 blueprints. Copy a starter prompt (or mark it as read), and tick at least 3 checklist items on one blueprint as if you’d tested it. Your checks are saved.',
    css: `
.bp{border:2px solid #f5c54266;border-radius:14px;margin-bottom:10px;background:var(--bg2);overflow:hidden}
.bp>summary{list-style:none;cursor:pointer;padding:12px 14px;font:800 1.05rem var(--font-head);display:flex;gap:10px;align-items:center;min-height:56px}
.bp>summary::-webkit-details-marker{display:none}
.bp>summary .lv{margin-left:auto;font:700 .75rem var(--font-body);background:#f5c542;color:#141414;border-radius:999px;padding:3px 10px}
.bp-body{padding:0 14px 14px}
.bp-body h4{color:#f5c542;margin:10px 0 4px}
.bp-body ul{margin:0;padding-left:1.2em}
.bp-prompt{font:600 .9rem/1.5 ui-monospace,Menlo,monospace;background:#0b0b0b;border:1px solid #f5c54255;border-radius:10px;padding:10px;white-space:pre-wrap}
.bp-check label{display:flex;gap:8px;align-items:flex-start;padding:6px 0;min-height:40px;cursor:pointer}
.bp-check input{width:22px;height:22px;flex:none;margin-top:2px;accent-color:#f5c542}
.bp-note{border-left:4px solid #f5c542;padding:8px 12px;background:#221d0a;border-radius:0 10px 10px 0;margin-bottom:12px}
`,
    js: function (el, api) {
      var D = api.D;
      var BP = [
        { id: 'stats', icon: '🏀', name: 'Free-Throw Stat Tracker', lv: 'Starter',
          spec: ['For: me and my teammates at practice', 'Problem: we forget how our shooting improves', 'Features: tap Made / Missed · live percentage · a list of past practices', 'NOT: no accounts, no names, no photos, no ads', 'Works when: 7 makes out of 10 shows 70%'],
          prompt: 'Build a simple free-throw tracker web app for a kid basketball player to use on a phone at practice. Big “Made” and “Missed” buttons. Show makes, attempts and the percentage in large numbers. Add a “Save practice” button that stores today’s result on this device only (no accounts, no personal info) and shows a list of past practices with dates. Use a dark background and big, easy-to-tap buttons.',
          tests: ['Tap Made 7 times and Missed 3 times: it shows 7/10 and 70%', 'Save the practice and reload the page: it’s still in the list', 'There’s nowhere that asks for a name, photo or email', 'Every button is easy to tap on a phone'] },
        { id: 'chess', icon: '♟️', name: 'Chess Puzzle Trainer', lv: 'Medium',
          spec: ['For: kids at my chess club', 'Problem: we want quick daily puzzle practice', 'Features: show a “mate in 1” puzzle · check the move · count a streak', 'NOT: no online play, no chat', 'Works when: the correct move says “Correct!” and adds 1 to the streak'],
          prompt: 'Build a chess puzzle trainer web app for kids aged 9–14. Show one “mate in 1” puzzle at a time on a board. The player taps a piece, then a square. If the move is the correct checkmate, show “Correct!” and add 1 to a streak counter; if not, show “Try again” and let them retry. Include 5 puzzles and a “Next puzzle” button. No online play, no chat and no accounts.',
          tests: ['The correct move shows “Correct!” and the streak goes up by 1', 'A wrong move shows “Try again” and does NOT increase the streak', 'All 5 puzzles are real checkmates (check each one with a chess board!)', 'The board is readable on a phone'] },
        { id: 'belt', icon: '🥋', name: 'Martial Arts Training Log', lv: 'Starter',
          spec: ['For: me, training for my next belt', 'Problem: I lose track of what I practiced', 'Features: pick a skill · log minutes · weekly total', 'NOT: no sharing, no photos', 'Works when: logging 20 + 15 minutes shows 35 for the week'],
          prompt: 'Build a martial-arts training log web app for a 12-year-old. A drop-down of skills (kicks, blocks, forms, sparring, stretching), a minutes box, and an “Add” button. Show today’s entries and a total for this week. Store data only on this device. No sharing features, no photos, no accounts. Friendly dojo style with big buttons.',
          tests: ['Add 20 minutes of kicks and 15 of forms: the week total says 35', 'Reload the page: entries are still there', 'Adding 0 or a negative number is blocked with a friendly message', 'No personal info is requested anywhere'] },
        { id: 'quiz', icon: '🧠', name: 'AI Terms Quiz Game', lv: 'Medium',
          spec: ['For: my classmates learning about AI', 'Problem: AI words are confusing at first', 'Features: 10 multiple-choice questions · explanation after each · final score', 'NOT: no leaderboard with names', 'Works when: 8 right answers shows 8/10'],
          prompt: 'Build a quiz game web app that teaches AI vocabulary to kids aged 10–13. 10 multiple-choice questions about terms like algorithm, data, label, overfitting, neural network, token and hallucination. After each answer, show whether it was right and a one-sentence explanation. Show the final score at the end with a “Play again” button that shuffles the questions. Keep definitions accurate and simple. No leaderboards or names.',
          tests: ['Answering 8 correctly shows a score of 8/10', 'Every explanation is accurate (check them against Dojo Scrolls!)', '“Play again” shuffles the question order', 'A wrong answer shows the correct one'] },
        { id: 'drill', icon: '⚽', name: 'Soccer Drill Randomizer', lv: 'Advanced',
          spec: ['For: my soccer team’s warm-ups', 'Problem: warm-ups get boring', 'Features: random drill cards · countdown timer per drill · skip button', 'NOT: nothing unsafe — only age-appropriate drills', 'Works when: each drill shows for exactly its time, then the next one appears'],
          prompt: 'Build a soccer warm-up drill randomizer web app for a youth team (ages 10–12). Store a list of 12 safe, age-appropriate drills, each with a name, a one-line description and a time in seconds. “Start” picks a random drill and counts down its time, then automatically moves to another random drill with a short beep. Add Pause and Skip buttons. Big, readable text for a tablet on the sideline.',
          tests: ['A 30-second drill counts down from 30 to 0, then changes', 'Skip immediately shows a different drill', 'Pause stops the countdown, and pressing again resumes it', 'An adult coach checked that every drill is safe'] },
      ];
      var S = api.load(), open = S.open || {}, checks = S.checks || {}, copied = !!S.copied;
      el.innerHTML = '<div class="bp-note">👪 <b>With a trusted adult:</b> Real AI builders (like Replit or Base44) have their own age rules and sign-up steps. Ask a grown-up to set things up with you, and never type personal info into prompts.</div>' + BP.map(function (b) {
        return '<details class="bp" data-bp="' + b.id + '"' + (open[b.id] ? ' open' : '') + '><summary><span aria-hidden="true">' + b.icon + '</span>' + b.name + '<span class="lv">' + b.lv + '</span></summary><div class="bp-body"><h4>📋 Spec</h4><ul>' + b.spec.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul><h4>💬 Starter prompt</h4><div class="bp-prompt">' + b.prompt + '</div><div class="row" style="margin-top:6px"><button type="button" class="btn small" data-copy="' + b.id + '">📋 Copy prompt</button></div><h4>🧪 Test checklist</h4><div class="bp-check">' + b.tests.map(function (t, i) { var k = b.id + i; return '<label><input type="checkbox" data-ck="' + k + '"' + (checks[k] ? ' checked' : '') + '> ' + t + '</label>'; }).join('') + '</div></div></details>';
      }).join('') + '<p class="feedback" id="bp-m" aria-live="polite"></p>';
      function mission() {
        var nOpen = Object.keys(open).length, best = 0;
        BP.forEach(function (b) { var n = b.tests.filter(function (t, i) { return checks[b.id + i]; }).length; best = Math.max(best, n); });
        var m = D.$('#bp-m', el);
        m.innerHTML = (nOpen >= 5 ? '✅' : '⬜') + ' Open all 5 (' + nOpen + '/5) · ' + (copied ? '✅' : '⬜') + ' Copy a starter prompt · ' + (best >= 3 ? '✅' : '⬜') + ' Tick 3 checks on one blueprint';
        if (nOpen >= 5 && copied && best >= 3) { m.className = 'feedback ok'; m.innerHTML += '<br>🏆 Blueprint vault unlocked! Pick one to build for real, with a trusted adult, and use the checklist to prove it works.'; api.done(); }
      }
      D.$all('details.bp', el).forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) { open[d.getAttribute('data-bp')] = 1; api.save({ open: open }); mission(); } }); });
      D.$all('[data-ck]', el).forEach(function (c) { c.addEventListener('change', function () { checks[c.getAttribute('data-ck')] = c.checked; api.save({ checks: checks }); D.sfx('click'); mission(); }); });
      D.$all('[data-copy]', el).forEach(function (b) {
        b.addEventListener('click', function () {
          var text = BP.filter(function (x) { return x.id === b.getAttribute('data-copy'); })[0].prompt;
          function ok() { copied = true; api.save({ copied: true }); b.textContent = '✅ Copied!'; D.toast('📋 Prompt copied'); mission(); }
          try { if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(ok, ok); else { var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) { /* ignore */ } t.remove(); ok(); } } catch (e) { ok(); }
        });
      });
      mission();
    },
  },
  quiz: [
    { q: 'What three parts does every App Blueprint have?', a: ['A spec, a starter prompt and a test checklist', 'A logo, a price and an ad', 'Only code', 'A password and a username'], c: 0, why: 'Plan → prompt → prove it works.' },
    { q: 'Before using a real AI app builder, what should you do?', a: ['Check its age rules and use it with a trusted adult', 'Sign up alone with a fake birthday', 'Share your address for better results', 'Skip it'], c: 0, why: 'Safety and honesty first.' },
    { q: 'Why does the chess blueprint say to check each puzzle with a real chess board?', a: ['AI can make mistakes, even in puzzles, so you must verify', 'Chess boards are required by law', 'To slow you down', 'No reason'], c: 0, why: 'Remember the Brown Belt: confident isn’t the same as correct.' },
    { q: 'Why do the blueprints say “store data only on this device” and “no names”?', a: ['To protect privacy: apps should collect as little personal info as possible', 'Because devices are faster', 'To make the app bigger', 'Names are illegal'], c: 0, why: 'Privacy by design.' },
  ],
  challenge: {
    title: 'Blueprint Reviewer',
    intro: 'You’re reviewing blueprints from other young builders. Spot the problem in each one. Get 3 of 4.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'A blueprint says: “Features: users post their full name, school and a selfie.”', a: ['Privacy problem — remove the personal info', 'Great feature', 'Needs more selfies', 'No problem'], c: 0, why: 'Apps for kids should never collect this.' },
        { q: 'A test checklist says only: “It works.”', a: ['Not testable — needs specific actions and expected results', 'Perfect test', 'Too long', 'No problem'], c: 0, why: 'A test must be able to clearly pass or fail.' },
        { q: 'A starter prompt says: “Make an app that’s like, really good.”', a: ['Too vague — no users, features or limits', 'Excellent prompt', 'Too specific', 'No problem'], c: 0, why: 'Vague in, vague out.' },
        { q: 'A blueprint adds a chat feature with strangers for a kids’ game.', a: ['Safety problem — chatting with strangers needs strong protections and adult oversight', 'Great idea, no changes needed', 'Needs more strangers', 'No problem'], c: 0, why: 'Safety is part of good design.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
