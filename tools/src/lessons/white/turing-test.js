module.exports = {
  hook: 'In 1950, Alan Turing asked: “Can machines think?” Then he invented a game to test it. Today, you are the judge.',
  story: [
    ['sensei', 'In <b>1950</b>, a brilliant British mathematician named <b>Alan Turing</b> asked a giant question: <i>“Can machines think?”</i>'],
    ['sensei', 'Turing is one of the founders of computer science. During World War II he helped crack secret enemy codes.'],
    ['sensei', '“Thinking” is hard to define, so Turing proposed a game instead. A <b>judge</b> chats by typing with two hidden players: one human, one machine.'],
    ['you', 'And if the judge can’t tell which one is the machine?'],
    ['sensei', 'Then the machine passes. Today we call it the <b>Turing Test</b>. Put on your judge’s robe, {{nick}}. Five rounds. Find the bots.'],
  ],
  activity: {
    title: 'Judge the Chat',
    instructions: 'Each round, the judge asks a question and two hidden players answer. Pick <b>A</b>, <b>B</b>, or <b>Can’t tell</b>, then read the clue.',
    css: `
.tt-q{background:#1f3a60;color:#fff;border-radius:16px 16px 16px 4px;padding:12px 14px;font-weight:700;margin-bottom:12px}
.tt-ans{display:grid;gap:10px}
@media(min-width:640px){.tt-ans{grid-template-columns:1fr 1fr}}
.tt-a{border:2px solid var(--line);border-radius:4px 16px 16px 16px;padding:12px 14px;background:var(--bg);min-height:96px}
.tt-a b{display:block;font-size:.8rem;letter-spacing:.1em;color:var(--muted)}
.tt-a.bot{border-color:var(--accent);background:#fde7e4}
.tt-pick{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px}
.tt-pick .btn{padding:8px;font-size:.95rem}
.tt-clue{margin-top:12px;padding:12px;border-radius:12px;background:var(--bg2)}
.tt-round{font-weight:800;color:var(--muted);margin-bottom:6px}
`,
    js: function (el, api) {
      var D = api.D;
      var rounds = [
        { q: 'What did you have for breakfast?', A: 'Toast with jam. I also spilled orange juice all over my homework. Great start to the day 😅', B: 'Why do you ask what I had for breakfast?', bot: 'B', clue: 'Old chatbots like <b>ELIZA</b> (from the 1960s) often turned your words back into a question instead of answering. It was a clever trick, but it gave them away.' },
        { q: 'What’s 38,427 × 9,613?', A: '369,398,751.', B: 'Uhh… no idea. Can I use a calculator? Do I HAVE to?', bot: 'A', clue: 'An instant, perfect answer to a giant multiplication is a machine giveaway. In Turing’s own 1950 paper, his example machine <b>pauses</b> and even gets a sum slightly wrong, like a person might!' },
        { q: 'How do you feel about rainy days?', A: 'Rainy days can feel cozy for many people, while others find them gloomy. Some enjoy reading indoors, while others prefer sunny weather for outdoor activities.', B: 'honestly I love them if I don’t have practice lol. if I do it’s the WORST', bot: 'A', clue: 'Answer A talks about what “many people” think instead of giving its own opinion. It’s polished and balanced, a common style for AI assistants.' },
        { q: 'Tell me about your weekend.', A: 'My cousin came over and we built a massive couch-cushion fort. Then my little brother knocked it down in about four seconds.', B: 'It was great! We went hiking with my family and saw an amazing sunset from the top of the trail.', bot: 'both', clue: '<b>Plot twist: BOTH answers were written by a chatbot.</b> Modern AI can write very human-sounding text in a short chat. Sometimes you truly can’t tell.' },
        { q: 'What does your house smell like right now?', A: 'I don’t have a sense of smell or a house — I’m an AI, so I can’t smell anything.', B: 'Popcorn. Someone burned it. AGAIN.', bot: 'A', clue: 'Some chatbots are designed to be honest about being AI. That’s a good thing! But not every bot is built that way.' },
      ];
      var r = 0, right = 0, S = api.load();
      if (S.r > 0 && S.r <= rounds.length) { r = S.r; right = S.right || 0; }
      function show() {
        if (r >= rounds.length) return end();
        var R = rounds[r];
        el.innerHTML = '<p class="tt-round">Round ' + (r + 1) + ' of ' + rounds.length + ' · Score ' + right + '</p><div class="tt-q">🧑‍⚖️ Judge: ' + R.q + '</div>' +
          '<div class="tt-ans"><div class="tt-a" id="tt-A"><b>PLAYER A</b>' + R.A + '</div><div class="tt-a" id="tt-B"><b>PLAYER B</b>' + R.B + '</div></div>' +
          '<div class="tt-pick" role="group" aria-label="Which player is the bot?"><button type="button" class="btn" data-v="A">🤖 A is the bot</button><button type="button" class="btn" data-v="B">🤖 B is the bot</button><button type="button" class="btn" data-v="both">🤷 Can’t tell</button></div><div id="tt-out" aria-live="polite"></div>';
        D.$all('.tt-pick button', el).forEach(function (b) {
          b.addEventListener('click', function () {
            var v = b.getAttribute('data-v'), ok = v === R.bot; if (ok) right++;
            api.save({ r: r + 1, right: right });
            D.$all('.tt-pick button', el).forEach(function (x) { x.disabled = true; });
            if (R.bot === 'both') { D.$('#tt-A', el).classList.add('bot'); D.$('#tt-B', el).classList.add('bot'); } else D.$('#tt-' + R.bot, el).classList.add('bot');
            D.$('#tt-out', el).innerHTML = '<div class="tt-clue"><p><b>' + (ok ? '✅ Good judging!' : '❌ Fooled you!') + '</b> ' + R.clue + '</p><button type="button" class="btn primary small" id="tt-next">' + (r + 1 < rounds.length ? 'Next round →' : 'See the verdict') + '</button></div>';
            D.sfx(ok ? 'good' : 'bad');
            var nx = D.$('#tt-next', el); nx.focus(); nx.addEventListener('click', function () { r++; show(); });
          });
        });
      }
      function end() {
        el.innerHTML = '<div class="tt-clue"><h3>⚖️ Final verdict: ' + right + ' / ' + rounds.length + '</h3><p>' + (right >= 4 ? 'Sharp judging!' : 'Those bots were sneaky!') + ' Here’s the big idea: modern chatbots can fool many people in short chats. But passing the Turing Test only shows a machine can <b>imitate</b> human conversation. It doesn’t prove it understands, feels or thinks the way you do.</p><button type="button" class="btn small" id="tt-again">↻ Judge again</button></div>';
        D.$('#tt-again', el).addEventListener('click', function () { r = 0; right = 0; api.save({ r: 0, right: 0 }); show(); });
        api.done();
      }
      show();
      if (r > 0 && r < rounds.length) el.insertAdjacentHTML('afterbegin', '<p class="saved-note">💾 Welcome back! Resuming at round ' + (r + 1) + '.</p>');
    },
  },
  quiz: [
    { q: 'What is the Turing Test?', a: ['A judge chats with a hidden human and a hidden machine and tries to tell which is which', 'A test of how fast a computer is', 'A math exam for robots', 'A chess game against a computer'], c: 0, why: 'Turing called it the “imitation game.” The question is whether the machine’s conversation can pass for a human’s.' },
    { q: 'Who proposed it, and when?', a: ['Alan Turing, in 1950', 'Al-Khwarizmi, about 1,200 years ago', 'A chatbot, in 2022', 'Nobody knows'], c: 0, why: 'Alan Turing described it in his 1950 paper “Computing Machinery and Intelligence.”' },
    { q: 'A chatbot fools a judge in a short chat. What does that prove?', a: ['It can imitate human conversation — not that it understands or has feelings', 'It is alive', 'It is smarter than every human', 'It never makes mistakes'], c: 0, why: 'Imitating conversation is impressive, but it isn’t the same as understanding or feeling.' },
    { q: 'Why was the instant answer to 38,427 × 9,613 a clue?', a: ['Most people can’t multiply huge numbers instantly and perfectly', 'Humans can’t do math', 'Bots can’t do math', 'The answer was wrong'], c: 0, why: 'Superhuman speed can give a machine away. Being TOO perfect is a clue!' },
  ],
  challenge: {
    title: 'The Judge’s Toolkit',
    intro: 'Expert judges need strategy. Answer these tough questions (3 of 4 to win).',
    js: function (el, api) {
      var D = api.D;
      D.quiz(el, [
        { q: 'Which question is best for catching an OLD-fashioned chatbot?', a: ['Ask a follow-up about something it said a few messages ago', 'Ask “Are you a bot?”', 'Say hello', 'Ask its favorite color'], c: 0, why: 'Old chatbots barely remembered the conversation, so follow-ups tripped them up. And a bot can simply lie if you ask “Are you a bot?”' },
        { q: 'A chatbot answers every question smoothly. Does that mean it understands like a person?', a: ['Not necessarily — it may be producing likely-sounding words without understanding like you do', 'Yes — smooth answers prove understanding', 'Yes — computers never pretend', 'No — chatbots can’t write sentences'], c: 0, why: 'Smooth language can come from patterns learned from huge amounts of text. Sounding smart and understanding are different things.' },
        { q: 'You’re chatting online and can’t tell if it’s a person or a bot. What’s the smartest move?', a: ['Be careful what you share either way, and ask a trusted adult if something feels off', 'Share your address to test it', 'Assume it’s definitely a human', 'Assume bots can’t trick you'], c: 0, why: 'Online you can’t always know who — or what — you’re talking to. Protect your personal info no matter what.' },
        { q: 'If a machine passes the Turing Test, what has it shown?', a: ['That it can imitate human conversation well enough to fool judges', 'That it has feelings', 'That it is alive', 'That it is always right'], c: 0, why: 'The test measures imitation of conversation, not feelings, life or truthfulness.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
