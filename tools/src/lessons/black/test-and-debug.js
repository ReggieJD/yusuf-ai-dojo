module.exports = {
  hook: 'AI-built apps have bugs. Every app does! Test a scoreboard like a pro QA tester, write the perfect bug report, and verify the fix.',
  story: [
    ['sensei', 'An AI builder just made this scoreboard for {{T.group}}, {{nick}}. It LOOKS finished. Is it?'],
    ['sensei', 'Pro teams never trust an app until it’s <b>tested</b>. A tester follows a <b>test checklist</b>: do this, expect that. If what happens isn’t what you expected, you’ve found a <b>bug</b>.'],
    ['you', 'And then I tell the AI to fix it?'],
    ['sensei', 'With a <b>great bug report</b>: what you did, what happened, and what should have happened. Then you test again, because fixes can break other things!'],
  ],
  activity: {
    title: 'QA Tester Mode',
    instructions: 'Step 1: use the app, then mark each test ✅ Pass or ❌ Fail. Step 2: choose the best bug report. Step 3: re-test the fixed app.',
    css: `
.td-app{background:#0f1b2d;color:#fff;border-radius:14px;padding:12px;text-align:center;border:3px solid #f5c542;max-width:420px}
.td-app h4{margin:0 0 6px;font-size:1rem}
.td-t{display:inline-block;width:46%;background:#16233a;border-radius:12px;padding:8px;margin:2px;vertical-align:top}
.td-n{font:900 2.4rem system-ui;color:#ffd23f}
.td-app button{font:800 15px system-ui;margin:3px;padding:10px 12px;border-radius:10px;border:0;background:#ffd23f;color:#141414;cursor:pointer;min-height:44px}
.td-tests{display:grid;gap:8px;margin-top:10px}
.td-test{display:grid;gap:6px;background:var(--bg2);border-radius:12px;padding:10px}
@media(min-width:640px){.td-test{grid-template-columns:1fr auto}}
.td-test .row button{min-width:92px}
.td-test.ok{box-shadow:inset 0 0 0 2px #3ccf7a}.td-test.no{box-shadow:inset 0 0 0 2px #ff6b6b}
.td-rep{display:grid;gap:8px;margin-top:10px}
.td-rep button{text-align:left;min-height:64px;border-radius:12px;border:2px solid #f5c54266;background:var(--card);color:var(--ink);padding:10px;font:600 .9rem/1.45 ui-monospace,Menlo,monospace;cursor:pointer}
`,
    js: function (el, api) {
      var D = api.D;
      var TESTS = [['+1 on HOME adds exactly 1 point', 'pass1'], ['+2 on HOME adds exactly 2 points', 'pass2'], ['+3 on AWAY adds exactly 3 points', 'pass3'], ['Reset sets BOTH scores to 0', 'reset']];
      var S = api.load(), stage = S.stage || 0, marks = S.marks || {}, h0 = 0, a0 = 0;
      function truth(k, fixed) { if (fixed) return 'p'; return k === 'pass2' || k === 'reset' ? 'f' : 'p'; }
      function app(fixed) {
        return '<div class="td-app" role="group" aria-label="Scoreboard app' + (fixed ? ', fixed version' : '') + '"><h4>🏀 ' + (fixed ? 'Scoreboard v2 (fixed)' : 'Scoreboard v1') + '</h4><div class="td-t">HOME<div class="td-n" data-sc="h">0</div><button type="button" data-add="h1">+1</button><button type="button" data-add="h2">+2</button><button type="button" data-add="h3">+3</button></div><div class="td-t">AWAY<div class="td-n" data-sc="a">0</div><button type="button" data-add="a1">+1</button><button type="button" data-add="a2">+2</button><button type="button" data-add="a3">+3</button></div><p style="margin:6px 0 0"><button type="button" data-add="reset">Reset</button></p></div>';
      }
      function wireApp(fixed) {
        h0 = 0; a0 = 0;
        D.$all('[data-add]', el).forEach(function (b) {
          b.addEventListener('click', function () {
            var k = b.getAttribute('data-add');
            if (k === 'reset') { h0 = 0; if (fixed) a0 = 0; }
            else { var n = +k[1]; if (!fixed && k === 'h2') n = 3; if (k[0] === 'h') h0 += n; else a0 += n; }
            D.$('[data-sc="h"]', el).textContent = h0; D.$('[data-sc="a"]', el).textContent = a0; D.sfx('click');
          });
        });
      }
      function tests(fixed) {
        return '<div class="td-tests">' + TESTS.map(function (t) { var m = marks[(fixed ? 'v2' : 'v1') + t[1]]; return '<div class="td-test' + (m ? (m === truth(t[1], fixed) ? ' ok' : ' no') : '') + '" data-t="' + t[1] + '"><span>🧪 ' + t[0] + '</span><div class="row"><button type="button" class="btn small" data-m="p">✅ Pass</button><button type="button" class="btn small" data-m="f">❌ Fail</button></div></div>'; }).join('') + '</div><p class="feedback" id="td-f" aria-live="polite"></p>';
      }
      function render() {
        var h = '';
        if (stage === 0) h = '<h3>Step 1 · Test v1</h3>' + app(false) + tests(false);
        else if (stage === 1) h = '<h3>Step 2 · Report the bugs</h3><p>You found 2 bugs. Which bug report will get the best fix from an AI builder?</p><div class="td-rep">' + D.shuffle([[1, '“Two bugs: (1) Tapping +2 on HOME adds 3 points; it should add 2. (2) Reset only clears HOME; it should set both HOME and AWAY to 0. Please fix only these two things.”'], [0, '“The scoreboard is broken and bad. Fix everything.”'], [0, '“Make the buttons a different color.”']]).map(function (o) { return '<button type="button" data-rep="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" id="td-f" aria-live="polite"></p>';
        else if (stage === 2) h = '<h3>Step 3 · Re-test v2</h3><p>The builder says it fixed the bugs. Never trust, always test!</p>' + app(true) + tests(true);
        else h = '<p class="feedback ok">🏆 QA master! You tested, reported precisely, and verified the fix. This test → report → fix → re-test loop is how real software teams work, with or without AI.</p>';
        el.innerHTML = h;
        if (stage === 0 || stage === 2) {
          var fixed = stage === 2; wireApp(fixed);
          D.$all('.td-test', el).forEach(function (row) {
            D.$all('[data-m]', row).forEach(function (b) {
              b.addEventListener('click', function () {
                var k = row.getAttribute('data-t'), v = b.getAttribute('data-m'); marks[(fixed ? 'v2' : 'v1') + k] = v; api.save({ marks: marks });
                var right = v === truth(k, fixed); row.className = 'td-test ' + (right ? 'ok' : 'no'); D.sfx(right ? 'good' : 'bad');
                var f = D.$('#td-f', el);
                if (!right) { f.className = 'feedback no'; f.textContent = 'Hmm, try that test again on the app. Watch the numbers carefully!'; }
                var allRight = TESTS.every(function (t) { return marks[(fixed ? 'v2' : 'v1') + t[1]] === truth(t[1], fixed); });
                if (allRight) { f.className = 'feedback ok'; f.textContent = fixed ? '✅ All tests pass on v2!' : '✅ Tests done: you caught 2 bugs!'; stage++; api.save({ stage: stage }); setTimeout(render, 1300); }
              });
            });
          });
        }
        D.$all('[data-rep]', el).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-rep') === '1') { D.sfx('good'); stage = 2; api.save({ stage: 2 }); render(); } else { D.sfx('bad'); b.disabled = true; var f = D.$('#td-f', el); f.className = 'feedback no'; f.textContent = 'A good report says what you did, what happened, and what should happen.'; } }); });
        if (stage >= 3) api.done();
      }
      render();
    },
  },
  quiz: [
    { q: 'What is a bug?', a: ['A mistake that makes a program behave differently than it should', 'An insect in the computer', 'A new feature', 'A type of test'], c: 0, why: 'Expected ≠ actual → bug.' },
    { q: 'What makes a great bug report?', a: ['What you did, what happened, and what should have happened', '“It’s broken”', 'Lots of angry emojis', 'Nothing — just redo the app'], c: 0, why: 'Precise reports get precise fixes.' },
    { q: 'After the AI says “Fixed!”, you should…', a: ['Test again, because fixes can miss things or break other parts', 'Trust it completely', 'Delete the tests', 'Publish immediately'], c: 0, why: 'Verify every fix.' },
    { q: 'A test checklist is useful because…', a: ['It makes sure you check every important behavior the same way each time', 'It makes the app faster', 'It’s required by law', 'It isn’t useful'], c: 0, why: 'Consistent testing catches problems early.' },
  ],
  challenge: {
    title: 'Write the Test',
    intro: 'Good testers write tests that can clearly pass or fail. Pick the best test for each feature. Get 3 of 4.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'Feature: a 30-second training timer.', a: ['“Start it: after 30 seconds it beeps and shows 0:00”', '“The timer is nice”', '“It has a button”', '“It works”'], c: 0, why: 'Specific action + expected result.' },
        { q: 'Feature: a quiz that counts correct answers.', a: ['“Answer 3 right and 1 wrong: the score shows 3/4”', '“The quiz is fun”', '“Questions appear”', '“No errors”'], c: 0, why: 'You can check the exact number.' },
        { q: 'Feature: the app never asks for personal info.', a: ['“Go through every screen: there is no field for name, school, address or photo”', '“It seems safe”', '“The AI said it’s safe”', '“Skip this test”'], c: 0, why: 'Privacy deserves real tests too.' },
        { q: 'Feature: works on a phone.', a: ['“Open it on a phone: every button is easy to tap and nothing is cut off”', '“It works on my laptop so it’s fine”', '“Phones are the same as laptops”', '“No need”'], c: 0, why: 'Test where people will actually use it.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
