module.exports = {
  hook: 'Even black belts ask for backup. Learn which situations call for a trusted adult, and build your own backup team.',
  story: [
    ['sensei', 'Here’s a secret, {{nick}}: the strongest ninjas know when to call for backup.'],
    ['sensei', 'Online, some situations are too big to handle alone: something scary or upsetting, someone asking for photos or secrets, money, health questions, or anything that just feels <b>off</b>.'],
    ['you', 'What if I get in trouble for telling?'],
    ['sensei', 'A trusted adult wants to help you, not punish you. Telling them is brave and smart. Let’s practice spotting backup moments, and pick your backup team.'],
  ],
  activity: {
    title: 'Call for Backup',
    instructions: 'Part 1: pick at least 2 kinds of trusted adults for your backup team. Part 2: decide which situations need a trusted adult.',
    css: `
.ta-team{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px}
.ta-team button{min-height:48px;border-radius:999px;border:2px solid #f5c54288;background:var(--bg2);color:var(--ink);padding:6px 14px;font:700 .95rem var(--font-body);cursor:pointer}
.ta-team button[aria-pressed="true"]{background:#f5c542;color:#141414}
`,
    js: function (el, api) {
      var D = api.D;
      var TEAM = ['👨‍👩‍👦 Parent or guardian', '👵 Grandparent or older relative', '🧑‍🏫 Teacher', '🥋 Coach or sensei', '🧑‍⚕️ School counselor', '🧑‍💼 Other adult you trust'];
      var S = api.load(), team = S.team || {};
      el.innerHTML = '<h3>Part 1 · My backup team</h3><p>Tap at least 2. (This stays only on your device.)</p><div class="ta-team">' + TEAM.map(function (t, i) { return '<button type="button" data-t="' + i + '" aria-pressed="' + !!team[i] + '">' + t + '</button>'; }).join('') + '</div><h3>Part 2 · Backup moments</h3><div id="ta-sort"></div>';
      var sorterBuilt = false;
      function part2() {
        var n = Object.keys(team).filter(function (k) { return team[k]; }).length, box = D.$('#ta-sort', el);
        if (n < 2) { box.innerHTML = '<p>Pick at least 2 backup-team members first.</p>'; sorterBuilt = false; return; }
        if (sorterBuilt) return; sorterBuilt = true;
        D.sorter(box, api, {
          choices: [['t', '📣 Tell a trusted adult'], ['m', '🙂 I can handle it']],
          items: [
            ['A chatbot says something that makes you feel scared or upset', 't', 'Feelings matter. Talk to someone you trust.'],
            ['Someone you met online asks for a photo of you', 't', 'Always tell an adult. Never send photos to people you met online.'],
            ['You want to ask an AI to explain photosynthesis', 'm', 'A great learning question with no personal info. Go for it!'],
            ['An app asks you to sign up and enter your birthday and a card number', 't', 'Sign-ups and payments are grown-up decisions.'],
            ['You see a fake video of a classmate going around', 't', 'This could hurt someone. An adult can help stop it.'],
            ['An AI gives you advice about a medicine or an injury', 't', 'Health questions need real adults and professionals.'],
            ['You’re choosing which color to make your app’s buttons', 'm', 'Your creative call!'],
          ],
          need: 6, win: 'You know when to call for backup. That’s black-belt wisdom.',
        });
      }
      D.$all('[data-t]', el).forEach(function (b) { b.addEventListener('click', function () { var i = b.getAttribute('data-t'); team[i] = !team[i]; b.setAttribute('aria-pressed', team[i] ? 'true' : 'false'); api.save({ team: team }); D.sfx('click'); part2(); }); });
      part2();
    },
  },
  quiz: [
    { q: 'Who is a trusted adult?', a: ['A grown-up you know well who you can go to when something feels wrong', 'Anyone online who says they’re an adult', 'A chatbot', 'A stranger with a nice profile picture'], c: 0, why: 'Someone you know in real life and trust.' },
    { q: 'Someone online says, “Don’t tell your parents about our chats.” What does that mean?', a: ['Big red flag — tell a trusted adult right away', 'It’s a fun secret', 'They’re being nice', 'Nothing'], c: 0, why: 'Asking for secrecy is a classic warning sign.' },
    { q: 'If you tell a trusted adult about something that went wrong online, you are being…', a: ['Brave and smart', 'A tattletale', 'Weak', 'Silly'], c: 0, why: 'Getting backup is a strength.' },
    { q: 'Which question is fine to ask an AI on your own?', a: ['“How do volcanoes erupt?”', '“Which medicine should I take?”', '“Should I meet this online friend in person?”', '“Can I use my parent’s credit card?”'], c: 0, why: 'Learning questions: yes. Safety, health and money: get an adult.' },
  ],
  challenge: {
    title: 'What Would You Say?',
    intro: 'Practice the words. Pick the best way to ask for help. Get 2 of 3.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'You saw something online that scared you.', a: ['“Can I show you something I saw online? It made me feel weird.”', 'Say nothing and hope it goes away', 'Delete the app and hide your tablet', 'Ask a stranger online what to do'], c: 0, why: 'Simple, honest words work best.' },
        { q: 'You accidentally shared your address in a game chat.', a: ['“I made a mistake online and I need help fixing it.”', 'Pretend it never happened', 'Share more to make it look normal', 'Blame the game'], c: 0, why: 'Adults can help change settings, report, or block.' },
        { q: 'An AI app wants you to sign up.', a: ['“Can you check if this app is okay for my age and help me set it up?”', 'Sign up with a fake age', 'Use a friend’s account', 'Give it your parent’s password'], c: 0, why: 'Honesty about age rules keeps you safe.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 2) api.done(); } });
    },
  },
};
