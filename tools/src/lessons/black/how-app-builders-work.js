module.exports = {
  hook: 'Tools like Replit and Base44 let you describe an app in plain words, and AI writes the code. Learn what really happens behind the “Build” button.',
  story: [
    ['sensei', 'Welcome to the final world, {{nick}}. You’ve learned how AI works. Now you’ll learn to <b>build with it</b>.'],
    ['sensei', '<b>AI app builders</b>, like Replit and Base44, let you describe an app in words. An AI model (a language model, just like you studied!) writes the code. You preview it, test it, and tell it what to fix.'],
    ['you', 'So the AI does everything?'],
    ['sensei', 'No! <b>You</b> are the architect. The AI is a very fast builder that follows instructions and makes mistakes. The clearer your plan and the better your testing, the better your app. Real builders have their own age rules, so always use them with a trusted adult.'],
  ],
  activity: {
    title: 'Behind the Build Button',
    instructions: 'Part 1: put the app-building loop in order. Part 2: try two prompts in the build simulator and compare the apps they make.',
    css: `
.ab-pool,.ab-out{display:flex;flex-wrap:wrap;gap:8px;min-height:56px;padding:8px;border-radius:12px;background:var(--bg2);margin-bottom:8px}
.ab-pool button{min-height:48px;padding:8px 12px;border-radius:10px;border:2px solid #f5c542;background:var(--card);font:700 .92rem var(--font-body);color:var(--ink);cursor:pointer}
.ab-out span{min-height:44px;padding:8px 12px;border-radius:10px;background:#f5c542;color:#141414;font-weight:800;display:inline-flex;align-items:center}
.ab-sim{display:grid;gap:10px;margin-top:10px}
@media(min-width:700px){.ab-sim{grid-template-columns:1fr 1fr}}
.ab-prompt{border:2px solid #f5c54266;border-radius:12px;padding:10px;background:var(--bg2)}
.ab-prompt p{font:600 .92rem/1.5 ui-monospace,Menlo,monospace;margin:0 0 8px}
.ab-prev{border-radius:12px;overflow:hidden;border:3px solid #f5c542;background:#fff;min-height:220px}
.ab-prev iframe{width:100%;height:260px;border:0;display:block;background:#fff}
.ab-q{background:var(--bg2);border-radius:12px;padding:10px 12px;margin-top:10px}
.ab-q .row button{flex:1 1 160px}
`,
    js: function (el, api) {
      var D = api.D;
      var STEPS = ['💬 You describe the app', '🧠 The AI plans and writes code', '👀 The app preview runs', '🧪 You test it', '🗣️ You tell the AI what to fix', '🔁 Repeat until it’s great'];
      var APP_A = '<!doctype html><html><body style="font-family:serif;margin:10px"><p>Score: <span id=s>0</span></p><button onclick="s.textContent=+s.textContent+1">add</button></body></html>';
      var APP_B = '<!doctype html><html><head><style>body{margin:0;font-family:system-ui,sans-serif;background:#0f1b2d;color:#fff;text-align:center;padding:10px}.t{display:inline-block;width:44%;background:#16233a;border-radius:12px;padding:8px;margin:2px}.n{font:900 44px system-ui;color:#ffd23f}button{font:800 16px system-ui;margin:3px;padding:10px 12px;border-radius:10px;border:0;background:#ffd23f}h3{margin:4px 0}</style></head><body><h3>🏀 Scoreboard</h3><div class=t>HOME<div class=n id=h>0</div><button onclick="h.textContent=+h.textContent+1">+1</button><button onclick="h.textContent=+h.textContent+2">+2</button><button onclick="h.textContent=+h.textContent+3">+3</button></div><div class=t>AWAY<div class=n id=a>0</div><button onclick="a.textContent=+a.textContent+1">+1</button><button onclick="a.textContent=+a.textContent+2">+2</button><button onclick="a.textContent=+a.textContent+3">+3</button></div><p><button onclick="h.textContent=0;a.textContent=0">Reset</button></p></body></html>';
      var S = api.load(), picked = S.picked || [], tried = S.tried || {}, asked = !!S.asked;
      function render() {
        var h = '<h3>Part 1 · The build loop</h3><p>Tap the steps in order:</p><div class="ab-out" aria-live="polite">' + picked.map(function (i, k) { return '<span>' + (k + 1) + '. ' + STEPS[i] + '</span>'; }).join('') + '</div>';
        if (picked.length < STEPS.length) h += '<div class="ab-pool">' + D.shuffle(STEPS.map(function (s, i) { return i; }).filter(function (i) { return picked.indexOf(i) < 0; })).map(function (i) { return '<button type="button" data-st="' + i + '">' + STEPS[i] + '</button>'; }).join('') + '</div><p class="feedback" id="ab-f1" aria-live="polite"></p>';
        else {
          h += '<p class="feedback ok">✅ That’s the loop! Building with AI is NOT one magic click. It’s describe → build → test → fix, over and over.</p>';
          h += '<h3>Part 2 · The build simulator</h3><p>Same AI, two prompts. Press Build on each and compare. (This simulator shows pre-made results so you can compare fairly. It isn’t connected to a real AI.)</p><div class="ab-sim"><div class="ab-prompt"><p>Prompt A: “make a score thing”</p><button type="button" class="btn small" data-b="A">🔨 Build A</button></div><div class="ab-prompt"><p>Prompt B: “Build a basketball scoreboard for two teams, HOME and AWAY. Each team gets +1, +2 and +3 buttons. Add a Reset button. Big yellow numbers on a dark background, easy to tap on a phone.”</p><button type="button" class="btn small" data-b="B">🔨 Build B</button></div></div><div class="ab-sim" id="ab-prev"></div>';
          if (tried.A && tried.B) h += '<div class="ab-q"><p><b>Why was app B so much better?</b></p><div class="row">' + D.shuffle([[1, 'Prompt B was a clear spec: who, what features, what style'], [0, 'B was luckier'], [0, 'Longer prompts are always better, no matter what they say']]).map(function (o) { return '<button type="button" class="btn small" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p></div>';
          if (asked) h += '<p class="feedback ok">🏆 You know the secret: AI builders are only as good as your instructions and your testing. Next lesson: writing a great spec.</p>';
        }
        el.innerHTML = h;
        var prev = D.$('#ab-prev', el);
        if (prev) prev.innerHTML = ['A', 'B'].map(function (k) { return tried[k] ? '<div><p style="margin:0 0 4px;font-weight:800">Result ' + k + ':</p><div class="ab-prev"><iframe sandbox="allow-scripts" title="App built from prompt ' + k + '" srcdoc="' + (k === 'A' ? APP_A : APP_B).replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '"></iframe></div></div>' : ''; }).join('');
        D.$all('[data-st]', el).forEach(function (b) { b.addEventListener('click', function () { var i = +b.getAttribute('data-st'); if (i === picked.length) { picked.push(i); api.save({ picked: picked }); D.sfx('good'); render(); } else { D.sfx('bad'); var f = D.$('#ab-f1', el); f.className = 'feedback no'; f.textContent = 'Not next. What has to happen before that?'; } }); });
        D.$all('[data-b]', el).forEach(function (b) { b.addEventListener('click', function () { tried[b.getAttribute('data-b')] = 1; api.save({ tried: tried }); D.sfx('click'); render(); }); });
        D.$all('[data-ok]', el).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-ok') === '1') { asked = true; api.save({ asked: true }); D.sfx('win'); render(); } else { D.sfx('bad'); b.disabled = true; } }); });
        if (asked) api.done();
      }
      render();
    },
  },
  quiz: [
    { q: 'What does an AI app builder do?', a: ['Turns your plain-language description into code you can preview, test and improve', 'Builds apps with no instructions at all', 'Only makes games', 'Replaces the need to test'], c: 0, why: 'You describe; the AI writes code; you test and guide.' },
    { q: 'What kind of AI writes the code in these tools?', a: ['A language model, like the ones in the Brown Belt', 'A chess engine', 'A calculator', 'A camera'], c: 0, why: 'Code is text, so language models can write it, and they can make mistakes, too.' },
    { q: 'Why did Prompt B build a better app?', a: ['It clearly described the users, features and style', 'It used more exclamation marks', 'It was typed faster', 'It was random'], c: 0, why: 'Clear specs → better builds.' },
    { q: 'Before using a real AI app builder, you should…', a: ['Check its age rules and use it with a trusted adult', 'Share your home address for better results', 'Skip testing', 'Give it your password'], c: 0, why: 'Real tools have terms and age limits. Use them safely and with supervision.' },
  ],
  challenge: {
    title: 'Architect or Builder?',
    intro: 'Who should do each job: <b>you</b> (the architect) or the <b>AI</b> (the fast builder)? Get 4 of 5.',
    js: function (el, api) {
      api.D.sorter(el, api, {
        choices: [['y', '🧑‍🎨 You'], ['a', '🤖 AI']],
        items: [
          ['Decide who the app is for and what problem it solves', 'y', 'Only you know your goal and your users.'],
          ['Type out hundreds of lines of code quickly', 'a', 'That’s what the AI builder is fast at.'],
          ['Test whether the app actually works the way you want', 'y', 'The AI can’t know what you wanted unless you check.'],
          ['Decide what personal information the app should NEVER collect', 'y', 'Safety and privacy choices belong to people.'],
          ['Suggest a first draft of the layout', 'a', 'AI drafts are a great starting point. Then you judge them.'],
        ],
        need: 4, win: 'You’re the architect: goals, safety and testing are your job. The AI is your speedy builder.',
      });
    },
  },
};
