module.exports = {
  hook: 'The same AI can give a useless answer or a perfect one, depending on how you ask. Snap prompt pieces together and unlock better results.',
  story: [
    ['sensei', '{{nick}}, a <b>prompt</b> is what you tell an AI. A vague prompt gets a vague answer. A clear prompt gets a great one.'],
    ['sensei', 'Great prompts usually include: the <b>task</b> (what to do), the <b>audience</b> or context (who it’s for), the <b>format</b> (list? story?), <b>limits</b> (how long?), and any <b>rules</b> (what to avoid).'],
    ['you', 'So it’s like giving a teammate really clear instructions?'],
    ['sensei', 'Exactly! The AI can’t read your mind, so it can only use what you give it. Solve three prompt puzzles. Watch how each piece changes the answer.'],
  ],
  activity: {
    title: 'Prompt Puzzles',
    instructions: 'Turn prompt pieces on and off, and the practice bot’s answer updates live. (It’s a simulation built into this page, not a real AI, so you can see exactly what each piece changes.) Meet every requirement to solve each puzzle. Some pieces are useless… don’t be fooled!',
    css: `
.pp-goal{background:#2d1f12;color:#fbe9c9;border-radius:10px;padding:10px 12px}
.pp-goal ul{margin:4px 0 0;padding-left:1.2em}
.pp-goal li.ok{color:#9ae6b4}.pp-goal li.ok::marker{content:"✅ "}
.pp-pieces{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}
.pp-pieces button{min-height:46px;border-radius:999px;border:2px dashed #8b5a2b;background:#fffdf7;padding:6px 12px;font:700 .9rem var(--font-body);cursor:pointer;color:#2d1f12;text-align:left}
.pp-pieces button[aria-pressed="true"]{border-style:solid;background:#8b5a2b;color:#fff}
.pp-prompt{font:600 .98rem/1.5 ui-monospace,Menlo,monospace;background:#fff;border:2px solid #8b5a2b44;border-radius:10px;padding:10px;white-space:pre-wrap}
.pp-bot{background:#fbf1dc;border-radius:12px 12px 12px 2px;padding:10px 12px;margin-top:10px;font-size:.97rem;white-space:pre-wrap}
.pp-meter{margin-top:8px}
.pp-nav{margin-top:10px}
.pp-nav [aria-current="true"]{background:var(--accent);color:var(--accent-ink)}
`,
    js: function (el, api) {
      var D = api.D;
      var P = [
        { name: 'Warm-up plan', base: 'Give me a warm-up for basketball practice.',
          pieces: [['aud', 'I’m 11 years old.'], ['len', 'Keep it to 3 steps.'], ['fmt', 'Use a numbered list.'], ['junk', 'Make it super awesome!!!']],
          req: [['aud', 'Right for an 11-year-old'], ['len', 'Exactly 3 steps'], ['fmt', 'A numbered list']],
          out: function (f) {
            var steps = f.aud ? ['Jog around the court for 2 minutes', 'Do 10 arm circles each way', 'Make 10 easy layups on each side', 'Practice dribbling in place for 1 minute', 'Stretch your legs for 1 minute', 'Shoot 5 free throws'] : ['Perform a dynamic mobility sequence', 'Complete plyometric activation drills', 'Execute high-intensity defensive slides', 'Do a lower-body band routine', 'Run full-court transition sprints', 'Finish with form shooting'];
            steps = f.len ? steps.slice(0, 3) : steps;
            return f.fmt ? steps.map(function (s, i) { return (i + 1) + '. ' + s; }).join('\n') : 'Here’s a warm-up: ' + steps.join(', then ').toLowerCase() + '. ' + (f.junk ? 'This is super awesome!!!' : '');
          } },
        { name: 'Story', base: 'Write a story about a robot.',
          pieces: [['genre', 'Make it a funny detective mystery.'], ['hero', 'The hero is a ninja cat named Byte.'], ['len', 'Keep it under 60 words.'], ['junk', 'Please please please.']],
          req: [['genre', 'Funny detective mystery'], ['hero', 'Stars Byte the ninja cat'], ['len', 'Under 60 words']],
          out: function (f) {
            var who = f.hero ? 'Byte, the ninja cat,' : 'The robot';
            var s = f.genre ? who + ' found a crime scene: the dojo’s cookie jar was EMPTY. Crumbs led to the robot vacuum. “Case closed!” said ' + (f.hero ? 'Byte' : 'the robot') + '. The vacuum just beeped guiltily. Turns out it had been “cleaning up” cookies all week.' : who + ' woke up in a factory. It looked around at the machines. It learned many things about the world and about itself over many long days and nights, thinking about what it meant to be a robot in a big, confusing world full of questions, lights, gears, and people who came and went every single day.';
            return f.len ? s.split(' ').slice(0, 55).join(' ') : s + (f.genre ? ' The end. ' + 'Later, ' + (f.hero ? 'Byte' : 'the robot') + ' opened a detective agency, solved 12 more cases, wrote a book about them, went on a tour, and spent a long, long time explaining every clue to everyone who asked, one by one.' : '');
          } },
        { name: 'Study buddy', base: 'Help me study the water cycle.',
          pieces: [['role', 'Act as a friendly quiz coach.'], ['fmt', 'Ask me 3 questions, one at a time.'], ['rule', 'Don’t tell me the answers until I try.'], ['junk', 'You are the smartest AI ever.']],
          req: [['role', 'Acts like a coach'], ['fmt', 'Asks questions one at a time'], ['rule', 'Doesn’t give away the answers']],
          out: function (f) {
            if (f.fmt && f.rule) return (f.role ? 'Hey, study champ! 💪 ' : '') + 'Question 1 of 3: When the sun heats water in a lake, what happens to it? Take your best guess, and I’ll tell you if you’re right!';
            if (f.fmt) return (f.role ? 'Let’s go, champ! ' : '') + 'Question 1: What happens when the sun heats water? (Answer: it evaporates and becomes water vapor.)';
            return (f.role ? 'Great question, champ! ' : '') + 'The water cycle has four stages: evaporation (water turns into vapor), condensation (vapor forms clouds), precipitation (rain or snow falls), and collection (water gathers in oceans and lakes). Now you know it all!';
          } },
      ];
      var S = api.load(), lv = S.lv || 0, on = S.on || {}, solved = S.solved || {};
      function flags() { var f = {}; (on[lv] || []).forEach(function (k) { f[k] = true; }); return f; }
      function render() {
        var p = P[lv], f = flags(), met = p.req.filter(function (r) { return f[r[0]]; }).length;
        var prompt = [p.base].concat(p.pieces.filter(function (x) { return f[x[0]]; }).map(function (x) { return x[1]; })).join(' ');
        el.innerHTML = '<div class="pp-goal"><b>Puzzle ' + (lv + 1) + ' of 3 · ' + p.name + '.</b> Get an answer that is:<ul>' + p.req.map(function (r) { return '<li class="' + (f[r[0]] ? 'ok' : '') + '">' + r[1] + '</li>'; }).join('') + '</ul></div>' +
          '<div class="pp-pieces" role="group" aria-label="Prompt pieces">' + p.pieces.map(function (x) { return '<button type="button" data-k="' + x[0] + '" aria-pressed="' + !!f[x[0]] + '">➕ ' + x[1] + '</button>'; }).join('') + '</div>' +
          '<p style="font-weight:800;margin:0 0 4px">Your prompt:</p><div class="pp-prompt">' + D.esc(prompt) + '</div><div class="pp-bot" aria-live="polite"><b>🤖 Practice bot:</b>\n' + D.esc(p.out(f)) + '</div>' +
          '<div class="pp-meter"><div class="meter" aria-hidden="true"><i style="width:' + Math.round(met / p.req.length * 100) + '%"></i></div><p style="font-weight:800;margin:4px 0">Requirements met: ' + met + '/' + p.req.length + (f.junk ? ' · 🤔 That extra piece didn’t help, did it?' : '') + '</p></div>' +
          (met === p.req.length ? '<p class="feedback ok">✅ Puzzle solved! ' + (lv + 1 < P.length ? '<button type="button" class="btn small primary" id="pp-next">Next puzzle →</button>' : '') + '</p>' : '') +
          '<div class="row pp-nav">' + P.map(function (x, i) { return '<button type="button" class="btn small" data-lv="' + i + '" aria-current="' + (i === lv) + '" ' + (i > 0 && !solved[i - 1] && !solved[i] ? 'disabled' : '') + '>' + (solved[i] ? '✅ ' : '') + x.name + '</button>'; }).join('') + '</div>';
        if (met === p.req.length && !solved[lv]) { solved[lv] = true; api.save({ solved: solved }); D.sfx('win'); render(); return; }
        if (P.every(function (_, i) { return solved[i]; })) { el.insertAdjacentHTML('beforeend', '<p class="feedback ok">🏆 All puzzles solved! Clear task + audience + format + limits + rules = great prompts. Notice that hype like “super awesome!!!” or “smartest AI ever” didn’t improve anything.</p>'); api.done(); }
        D.$all('[data-k]', el).forEach(function (b) { b.addEventListener('click', function () { var k = b.getAttribute('data-k'), cur = on[lv] || []; var i = cur.indexOf(k); if (i >= 0) cur.splice(i, 1); else cur.push(k); on[lv] = cur; api.save({ on: on }); D.sfx('click'); render(); var again = D.$('[data-k="' + k + '"]', el); if (again) again.focus(); }); });
        var nx = D.$('#pp-next', el); if (nx) nx.addEventListener('click', function () { lv++; api.save({ lv: lv }); render(); });
        D.$all('[data-lv]', el).forEach(function (b) { b.addEventListener('click', function () { lv = +b.getAttribute('data-lv'); api.save({ lv: lv }); render(); }); });
      }
      render();
    },
  },
  quiz: [
    { q: 'What is a prompt?', a: ['The instructions and information you give an AI', 'A type of robot', 'A computer virus', 'The AI’s answer'], c: 0, why: 'Your words shape the output.' },
    { q: 'Which prompt will probably get the best result?', a: ['“Write a 4-line funny poem about a soccer-playing dog, for a 10-year-old.”', '“poem”', '“Write something good.”', '“You are amazing!!!”'], c: 0, why: 'Specific task + audience + length + style.' },
    { q: 'Adding “You are the smartest AI ever!” to a prompt usually…', a: ['Doesn’t make the answer more accurate — clear instructions matter more', 'Makes it always correct', 'Unlocks secret powers', 'Breaks the AI'], c: 0, why: 'Hype isn’t information. Clarity is.' },
    { q: 'In the study-buddy puzzle, why was “Don’t tell me the answers until I try” a smart rule?', a: ['It makes the AI help you learn, instead of doing the thinking for you', 'It makes the AI faster', 'It hides the AI’s mistakes', 'It was a useless piece'], c: 0, why: 'Use AI to learn, not to skip thinking. More in the Black Belt!' },
  ],
  challenge: {
    title: 'Fix This Prompt',
    intro: 'Each prompt is missing something important. What should you add? Get 3 of 4.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: '“Make a workout.” (You want something short for a kid who plays soccer.)', a: ['Add audience and limits: “for an 11-year-old soccer player, 10 minutes”', 'Add “please”', 'Add emojis', 'Nothing is missing'], c: 0, why: 'Who it’s for, and how long.' },
        { q: '“Tell me about space.” (You need 5 fun facts for a class poster.)', a: ['Add format and purpose: “Give 5 short, fun facts for a class poster”', 'Make it all caps', 'Add “you’re the best AI”', 'Ask for a 50-page essay'], c: 0, why: 'Format + purpose shape the answer.' },
        { q: '“Explain fractions.” (You keep getting confused by long explanations.)', a: ['Add a style: “Explain simply with a pizza example, in 3 short sentences”', 'Add more question marks', 'Ask it to be serious', 'Nothing'], c: 0, why: 'Tell the AI HOW you learn best.' },
        { q: 'Your prompt got a weird answer. Best next move?', a: ['Improve the prompt with clearer details and try again', 'Give up on AI forever', 'Type the same thing louder', 'Assume the answer is right anyway'], c: 0, why: 'Prompting is iterative: adjust and retry, just like debugging.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
