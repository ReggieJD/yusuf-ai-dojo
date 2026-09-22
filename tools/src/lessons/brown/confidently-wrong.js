module.exports = {
  hook: 'Chatbots can state made-up facts in a totally confident voice. Become a fact-checker: verify each claim against real sources.',
  story: [
    ['sensei', 'Here’s something important, {{nick}}. A language model predicts <b>likely-sounding</b> words. Likely-sounding is not the same as <b>true</b>.'],
    ['sensei', 'So chatbots sometimes invent facts, names, dates, even book titles and quotes, and say them confidently. This is called a <b>hallucination</b>.'],
    ['you', 'Why doesn’t it just say “I don’t know”?'],
    ['sensei', 'Its job is producing fluent text, and nothing inside automatically checks facts. Some newer tools can search the web and are trained to admit when they’re unsure, which helps a lot, but mistakes still happen. So YOU must check. Let’s train your fact-checking eye.'],
  ],
  activity: {
    title: 'The Fact-Check Dojo',
    instructions: 'The chatbot made 6 claims. Check each one against the Source Library, then mark it ✅ Verified or 🚩 Made up / false. Get at least 5 right.',
    css: `
.fc{display:grid;gap:12px}
@media(min-width:720px){.fc{grid-template-columns:1.2fr 1fr}}
.fc-bot{background:#fffdf7;border:2px solid #8b5a2b44;border-radius:10px;padding:10px}
.fc-claim{border-bottom:1px dashed #8b5a2b44;padding:8px 0}
.fc-claim:last-child{border:0}
.fc-claim p{margin:0 0 6px}
.fc-claim .row button{flex:1 1 110px}
.fc-claim.ok{background:#e3f6ea}.fc-claim.no{background:#fde7e4}
.fc-why{font-size:.9rem;margin-top:4px}
.fc-lib{background:#2d1f12;color:#fbe9c9;border-radius:10px;padding:10px 12px;font-size:.92rem}
.fc-lib h3{color:#fbe9c9;margin:0 0 6px;font-size:1rem}
.fc-lib dt{font-weight:800;color:#f5c542;margin-top:8px}
.fc-lib dd{margin:2px 0 0}
`,
    js: function (el, api) {
      var D = api.D;
      var C = [
        ['The Eiffel Tower is in Paris, France.', 1, 'Matches the encyclopedia entry.'],
        ['Basketball was invented by Dr. James Naismith in 1891.', 1, 'The sports history entry confirms it.'],
        ['Chess was invented by a computer company in 1950.', 0, 'False. Chess grew out of older games played in India about 1,400 years ago.'],
        ['Octopuses have three hearts.', 1, 'The animal facts entry confirms it. Weird but true!'],
        ['Dr. Maya Lindqvist won the 2019 Nobel Prize for inventing chess robots.', 0, 'Made up! No such person appears on the prize list, and there’s no Nobel Prize for inventing robots. A classic hallucination: a realistic-sounding name and date.'],
        ['The book “The Secret Robot Heart” by Sam Lee (2015) proved robots have feelings.', 0, 'Made-up book, plus a false claim. Fake citations are a common chatbot mistake, so always check that a source really exists.'],
      ];
      var S = api.load(), A = S.A || {};
      el.innerHTML = '<div class="fc"><div class="fc-bot"><p style="font-weight:800;margin:0 0 4px">🤖 DojoBot says:</p>' + C.map(function (c, i) { return '<div class="fc-claim" data-i="' + i + '"><p>“' + c[0] + '”</p><div class="row"><button type="button" class="btn small" data-v="1">✅ Verified</button><button type="button" class="btn small" data-v="0">🚩 Made up / false</button></div><div class="fc-why" aria-live="polite"></div></div>'; }).join('') + '</div>' +
        '<aside class="fc-lib" aria-label="Source Library"><h3>📚 Source Library</h3><dl>' +
        '<dt>Encyclopedia: Eiffel Tower</dt><dd>An iron tower in Paris, France, completed in 1889.</dd>' +
        '<dt>Sports history: Basketball</dt><dd>Invented in December 1891 by Dr. James Naismith, a teacher in Springfield, Massachusetts.</dd>' +
        '<dt>Games history: Chess</dt><dd>Developed from older board games played in India around 1,400 years ago, then spread through Persia and beyond.</dd>' +
        '<dt>Animal facts: Octopus</dt><dd>Has three hearts, blue blood and eight arms.</dd>' +
        '<dt>Official Nobel Prize list, 2019</dt><dd>Prizes went to real, well-documented scientists. There is no prize category for inventing robots, and no “Maya Lindqvist” on the list.</dd>' +
        '<dt>Library catalog search: “The Secret Robot Heart”</dt><dd>No results found.</dd>' +
        '</dl></aside></div><p class="feedback" id="fc-fb" aria-live="polite"></p>';
      function pick(box, v, quiet) {
        var i = +box.getAttribute('data-i'); if (box.classList.contains('ok') || box.classList.contains('no')) return;
        var ok = +v === C[i][1]; box.classList.add(ok ? 'ok' : 'no'); A[i] = v; api.save({ A: A });
        D.$all('button', box).forEach(function (b) { b.disabled = true; });
        box.querySelector('.fc-why').textContent = (ok ? '✅ ' : '❌ ') + C[i][2]; if (!quiet) D.sfx(ok ? 'good' : 'bad');
        var done = Object.keys(A).length, right = Object.keys(A).filter(function (k) { return +A[k] === C[k][1]; }).length, fb = D.$('#fc-fb', el);
        if (done === C.length) {
          if (right >= 5) { fb.className = 'feedback ok'; fb.innerHTML = '🏆 ' + right + '/6. Fact-checker certified! Notice the hallucinations sounded just as confident as the true facts. <b>Confidence is not evidence.</b>'; api.done(); }
          else { fb.className = 'feedback no'; fb.innerHTML = right + '/6. Read the explanations, then <button type="button" class="btn small" id="fc-again">try again</button>'; D.$('#fc-again', el).addEventListener('click', function () { A = {}; api.save({ A: A }); D.$all('.fc-claim', el).forEach(function (c) { c.classList.remove('ok', 'no'); c.querySelector('.fc-why').textContent = ''; D.$all('button', c).forEach(function (b) { b.disabled = false; }); }); fb.textContent = ''; }); }
        }
      }
      D.$all('.fc-claim button', el).forEach(function (b) { b.addEventListener('click', function () { pick(b.closest('.fc-claim'), b.getAttribute('data-v')); }); });
      Object.keys(A).forEach(function (i) { pick(D.$('.fc-claim[data-i="' + i + '"]', el), A[i], true); });
    },
  },
  quiz: [
    { q: 'What is an AI “hallucination”?', a: ['When an AI states something false or made-up as if it were true', 'When the screen flickers', 'When an AI dreams at night', 'A special effect in games'], c: 0, why: 'Fluent + confident + false = hallucination.' },
    { q: 'Why do language models sometimes make things up?', a: ['They generate likely-sounding text, and nothing inside automatically checks it’s true', 'They want to trick you', 'They are broken', 'They never make things up'], c: 0, why: 'Plausible ≠ correct.' },
    { q: 'A chatbot gives you a quote with a book title and author. What should you do?', a: ['Check that the book and quote really exist before using them', 'Use it right away', 'Assume famous-sounding means real', 'Ask the chatbot if it’s sure, and trust the answer'], c: 0, why: 'Fake citations are common. The chatbot saying “I’m sure” doesn’t make it true.' },
    { q: 'Which claims deserve the MOST careful checking?', a: ['Specific names, dates, numbers, quotes and sources', 'Simple greetings', 'Jokes you asked for', 'Nothing needs checking'], c: 0, why: 'Specific details are where made-up facts hide.' },
  ],
  challenge: {
    title: 'Fact-Checker’s Toolkit',
    intro: 'Pick the best move in each situation. Get 3 of 4.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'For a school report, a chatbot says a famous scientist was born in 1875. Best move?', a: ['Check the date in a reliable source like an encyclopedia or a trusted website', 'Trust it — it sounded sure', 'Change it to 1900', 'Ask the chatbot again and use whichever answer comes up'], c: 0, why: 'Reliable sources beat confidence.' },
        { q: 'Two reliable sources agree, but the chatbot says something different. Who wins?', a: ['The reliable sources', 'The chatbot', 'Whoever sounds cooler', 'Nobody'], c: 0, why: 'Cross-checking multiple good sources is a pro habit.' },
        { q: 'A chatbot gives medical advice about an injury. Best move?', a: ['Talk to a parent or a doctor — don’t rely on a chatbot for health decisions', 'Follow it exactly', 'Share it with friends as fact', 'Ignore the injury'], c: 0, why: 'Important decisions need trusted adults and real experts.' },
        { q: 'Which habit makes you BEST at using AI?', a: ['Use it for ideas and explanations, but verify important facts yourself', 'Never use AI', 'Believe everything it says', 'Only use it at night'], c: 0, why: 'Smart users treat AI like a helpful but fallible teammate.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
