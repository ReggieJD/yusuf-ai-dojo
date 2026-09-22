module.exports = {
  quiz: [
    { q: 'A token is…', a: ['A chunk of text a language model reads, like a word or part of one', 'A game coin', 'A password', 'A full page'], c: 0, why: 'Models read and write tokens.' },
    { q: 'Tokens are turned into…', a: ['Numbers', 'Pictures', 'Sounds', 'Nothing'], c: 0, why: 'Math needs numbers.' },
    { q: 'At their core, chatbots generate text by…', a: ['Predicting the next token again and again', 'Copying a single website', 'Looking up every answer in a list', 'Reading minds'], c: 0, why: 'Next-token prediction.' },
    { q: 'A language model learns word patterns from…', a: ['Huge amounts of training text', 'A single dictionary', 'Its feelings', 'Nowhere'], c: 0, why: 'Patterns in text → predictions.' },
    { q: 'An embedding is…', a: ['A list of numbers placing a word on a meaning map', 'A font', 'A spelling rule', 'A picture'], c: 0, why: 'Similar meanings → nearby positions.' },
    { q: 'king − man + woman ≈', a: ['queen', 'kitten', 'robot', 'banana'], c: 0, why: 'Meaning directions line up.' },
    { q: 'High temperature makes a model’s word choices…', a: ['More random and surprising', 'Always the most likely', 'More truthful', 'Slower'], c: 0, why: 'Temperature controls randomness.' },
    { q: 'For factual homework help, a good temperature is…', a: ['Low', 'As high as possible', 'It doesn’t matter', 'Negative'], c: 0, why: 'Predictable beats surprising for facts.' },
    { q: 'A hallucination is…', a: ['A false or made-up claim stated as if true', 'A screen glitch', 'A dream', 'A special feature'], c: 0, why: 'Confident ≠ correct.' },
    { q: 'A chatbot cites a book. Before using it, you should…', a: ['Check the book really exists and says that', 'Trust it', 'Share it immediately', 'Ask the chatbot if it’s sure and trust the answer'], c: 0, why: 'Fake citations happen.' },
    { q: 'A great prompt usually includes…', a: ['Task, audience, format, limits and rules', 'Only “please”', 'Lots of exclamation marks', 'Compliments for the AI'], c: 0, why: 'Clarity wins.' },
    { q: 'If a prompt gives a bad answer, you should…', a: ['Improve the prompt and try again', 'Give up', 'Type it louder', 'Trust the bad answer'], c: 0, why: 'Prompting is iterative.' },
    { q: 'Lowering the temperature makes a model…', a: ['More predictable, but not guaranteed correct', 'Always correct', 'Unable to answer', 'More creative'], c: 0, why: 'Randomness ≠ truth.' },
  ],
  project: {
    title: 'Prompt Lab Pro',
    intro: 'Write a real, professional-quality prompt for {{T.group}}: an AI helper that makes a practice plan. Then choose the settings and check the AI’s work like a pro.',
    css: `
.pl-f{display:grid;gap:8px}
.pl-f label{display:grid;gap:4px;font-weight:800}
.pl-f input{min-height:44px;border-radius:10px;border:2px solid #8b5a2b55;padding:6px 10px;font:600 1rem var(--font-body);background:#fffdf7;color:#2d1f12}
.pl-f small{font-weight:600;color:var(--muted)}
.pl-prev{font:600 .95rem/1.5 ui-monospace,Menlo,monospace;background:#fff;border:2px solid #8b5a2b44;border-radius:10px;padding:10px;white-space:pre-wrap;margin:10px 0}
.pl-step{background:var(--bg2);border-radius:10px;padding:10px 12px;margin-top:10px}
.pl-step .row button{flex:1 1 150px}
`,
    js: function (el, api) {
      var D = api.D, S = api.load(), F = S.F || { role: '', task: '', aud: '', fmt: '', lim: '' }, step = S.step || 0;
      var FIELDS = [['role', '🎭 Role', 'e.g. Act as a friendly coach'], ['task', '🎯 Task', 'e.g. Make a practice plan for our team'], ['aud', '👥 Audience', 'e.g. For kids aged 10–12'], ['fmt', '📋 Format', 'e.g. A numbered list'], ['lim', '📏 Limits & rules', 'e.g. 30 minutes total, no heavy weights']];
      el.innerHTML = '<div class="pl-f">' + FIELDS.map(function (f) { return '<label>' + f[1] + '<input data-f="' + f[0] + '" maxlength="120" value="' + D.esc(F[f[0]]) + '" placeholder="' + f[2] + '"><small data-h="' + f[0] + '"></small></label>'; }).join('') + '</div><p style="font-weight:800;margin:10px 0 0">Your prompt:</p><div class="pl-prev" id="pl-prev" aria-live="polite"></div><div id="pl-steps"></div>';
      function words(s) { return (s.trim().match(/\S+/g) || []).length; }
      function draw() {
        var ok = FIELDS.every(function (f) { return words(F[f[0]]) >= 2; });
        FIELDS.forEach(function (f) { D.$('[data-h="' + f[0] + '"]', el).textContent = words(F[f[0]]) >= 2 ? '✅' : 'Write at least 2 words'; });
        var prompt = FIELDS.map(function (f) { return F[f[0]].trim(); }).filter(Boolean).join('. ').replace(/\.\./g, '.');
        D.$('#pl-prev', el).textContent = prompt || '(start typing above)';
        var n = words(prompt), est = Math.round(n * 4 / 3), box = D.$('#pl-steps', el), h = '';
        if (!ok) { box.innerHTML = '<p class="pl-step">Fill in all 5 parts to continue.</p>'; return; }
        if (step < 1) step = 1;
        h += '<div class="pl-step"><p><b>1 · Tokens:</b> Your prompt has ' + n + ' words. About how many tokens is that?</p>' + (step > 1 ? '<p>✅ About ' + est + ' tokens (roughly 4 tokens for every 3 words).</p>' : '<div class="row">' + D.shuffle([[1, 'About ' + est], [0, 'About ' + Math.max(1, Math.round(n / 5))], [0, 'About ' + n * 10]]).map(function (o) { return '<button type="button" class="btn small" data-s="1" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>') + '</div>';
        if (step >= 2) h += '<div class="pl-step"><p><b>2 · Settings:</b> You want a reliable practice plan, not a wild one. Temperature?</p>' + (step > 2 ? '<p>✅ Low-to-medium: steady and sensible.</p>' : '<div class="row">' + D.shuffle([[1, 'Low to medium'], [0, 'Maximum!'], [0, 'It never matters']]).map(function (o) { return '<button type="button" class="btn small" data-s="2" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>') + '</div>';
        if (step >= 3) h += '<div class="pl-step"><p><b>3 · Check the work:</b> The AI’s plan includes: “Sprint for 45 minutes without water breaks, as recommended by the World Sports Council.” What do you do?</p>' + (step > 3 ? '<p>✅ Flag it! It breaks your 30-minute limit, it’s unsafe, and the “source” needs checking. Ask a coach or trusted adult.</p>' : '<div class="row">' + D.shuffle([[1, 'Flag it: it breaks my limits, it’s unsafe, and the source needs checking'], [0, 'Use it — it cites a council'], [0, 'Share it with the whole team right away']]).map(function (o) { return '<button type="button" class="btn small" data-s="3" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>') + '</div>';
        if (step >= 4) h += '<p class="feedback ok">🏆 Prompt Lab Pro complete: a clear prompt, sensible settings, and a critical eye. That’s how experts use AI.</p>';
        box.innerHTML = h;
        D.$all('[data-ok]', box).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-ok') === '1') { step = +b.getAttribute('data-s') + 1; api.save({ step: step }); D.sfx(step >= 4 ? 'win' : 'good'); draw(); } else { D.sfx('bad'); b.disabled = true; } }); });
        if (step >= 4) api.done();
      }
      D.$all('[data-f]', el).forEach(function (i) { i.addEventListener('input', function () { F[i.getAttribute('data-f')] = i.value; api.save({ F: F }); draw(); }); });
      draw();
    },
  },
};
