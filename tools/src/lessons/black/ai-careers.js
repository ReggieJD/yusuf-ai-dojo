module.exports = {
  hook: 'Data scientist. Robotics engineer. Game AI designer. AI ethicist. Discover the careers where people build and guide AI, and find your match.',
  story: [
    ['sensei', 'Here’s the truth about AI, {{nick}}: <b>people</b> are behind every part of it. People collect the data, design the models, test them, make them fair, and decide how they’re used.'],
    ['sensei', 'That means huge opportunities. AI touches sports, medicine, games, space, art, music, law and more.'],
    ['you', 'Do I have to be a math genius?'],
    ['sensei', 'Math helps a lot, and you’ve been doing plenty of it! But AI teams also need designers, writers, ethicists, testers and people who understand sports or animals or medicine. Let’s find your match.'],
  ],
  activity: {
    title: 'Career Match',
    instructions: 'Answer 4 quick questions to find your AI career matches. Then open at least 3 career cards to learn more.',
    css: `
.cm-q{background:var(--bg2);border-radius:12px;padding:10px 12px;margin-bottom:10px}
.cm-q .row button{flex:1 1 150px}
.cm-q .row button[aria-pressed="true"]{background:#f5c542;color:#141414}
.cm-cards{display:grid;gap:8px}
@media(min-width:640px){.cm-cards{grid-template-columns:1fr 1fr}}
.cm-card{border:2px solid #f5c54255;border-radius:12px;background:var(--bg2)}
.cm-card>summary{cursor:pointer;padding:10px 12px;font-weight:800;list-style:none;min-height:48px;display:flex;gap:8px;align-items:center}
.cm-card>summary::-webkit-details-marker{display:none}
.cm-card.match{border-color:#f5c542;box-shadow:0 0 0 2px #f5c542}
.cm-card .b{padding:0 12px 12px;font-size:.93rem}
.cm-card .b b{color:#f5c542}
`,
    js: function (el, api) {
      var D = api.D;
      var CAREERS = {
        ds: ['📊 Data Scientist', 'Finds answers hidden in data, like which training plan wins more games, and often builds AI models.', 'Math, statistics, coding (Python), curiosity', 'Track your own sports stats in a spreadsheet and look for patterns.'],
        ml: ['🧠 Machine Learning Engineer', 'Builds and trains the AI models inside apps, from recommendations to speech recognition.', 'Coding, math, patience for experiments', 'Try training a simple model with a free, kid-friendly tool, with an adult.'],
        rob: ['🤖 Robotics Engineer', 'Designs robots that use AI to see, move and help, from warehouse bots to Mars rovers.', 'Physics, building, coding, problem-solving', 'Join a robotics club or build with a beginner robotics kit.'],
        game: ['👾 Game AI Designer', 'Creates the behaviors of game characters, like the guard state machine you built!', 'Game design, coding, creativity, testing', 'Design a board game, then write rules for a computer opponent.'],
        eth: ['⚖️ AI Ethicist / Policy Expert', 'Makes sure AI is fair, safe and respects privacy, and helps write rules for how it’s used.', 'Reading, writing, debate, understanding people', 'Discuss AI fairness questions with your family or class.'],
        ux: ['🎨 AI Product Designer', 'Designs how people use AI apps so they’re clear, helpful and kind.', 'Art, empathy, testing ideas with users', 'Sketch an app screen and ask friends to try it.'],
        sport: ['🏀 Sports Data Analyst', 'Uses data and AI to scout players, plan strategy and prevent injuries.', 'Sports knowledge, statistics, charts', 'Chart your team’s stats like in Stats Court!'],
        med: ['🩺 Medical AI Researcher', 'Builds AI that helps doctors spot diseases in scans, or helps scientists study the body, like AlphaFold, which predicts the shapes of proteins.', 'Biology, math, coding, care for people', 'Learn about how the human body works, and keep practicing math.'],
      };
      var QS = [
        ['What sounds most fun?', [['Finding patterns in numbers', ['ds', 'sport']], ['Building machines', ['rob', 'ml']], ['Making games or art', ['game', 'ux']], ['Debating what’s fair', ['eth']]]],
        ['Pick a project:', [['Predict next season’s champion', ['sport', 'ds']], ['Teach a robot to walk', ['rob', 'ml']], ['Design a video-game villain', ['game']], ['Help doctors catch illness early', ['med', 'ml']]]],
        ['Your superpower:', [['Math and logic', ['ds', 'ml']], ['Creativity', ['ux', 'game']], ['Caring about people', ['eth', 'med']], ['Building and fixing things', ['rob']]]],
        ['Favorite belt so far:', [['Yellow (data)', ['ds', 'sport']], ['Green (neural networks)', ['ml', 'med']], ['Purple (game AI)', ['game', 'rob']], ['Black (AI citizen)', ['eth', 'ux']]]],
      ];
      var S = api.load(), ans = S.ans || {}, opened = S.opened || {};
      function matches() { var sc = {}; Object.keys(ans).forEach(function (q) { QS[q][1][ans[q]][1].forEach(function (c) { sc[c] = (sc[c] || 0) + 1; }); }); return Object.keys(sc).sort(function (a, b) { return sc[b] - sc[a]; }).slice(0, 2); }
      function render() {
        var done = Object.keys(ans).length === QS.length, top = done ? matches() : [];
        var h = QS.map(function (q, i) { return '<div class="cm-q"><p><b>' + (i + 1) + '. ' + q[0] + '</b></p><div class="row">' + q[1].map(function (o, j) { return '<button type="button" class="btn small" data-q="' + i + '" data-o="' + j + '" aria-pressed="' + (ans[i] === j) + '">' + o[0] + '</button>'; }).join('') + '</div></div>'; }).join('');
        if (done) h += '<p class="feedback ok">⭐ Your top matches: <b>' + top.map(function (c) { return CAREERS[c][0]; }).join(' and ') + '</b>. Open cards to learn more (open at least 3).</p>';
        h += '<div class="cm-cards">' + Object.keys(CAREERS).map(function (k) { var c = CAREERS[k]; return '<details class="cm-card' + (top.indexOf(k) >= 0 ? ' match' : '') + '" data-c="' + k + '"' + (opened[k] ? ' open' : '') + '><summary>' + c[0] + (top.indexOf(k) >= 0 ? ' ⭐' : '') + '</summary><div class="b"><p>' + c[1] + '</p><p><b>Skills:</b> ' + c[2] + '</p><p><b>Start now:</b> ' + c[3] + '</p></div></details>'; }).join('') + '</div><p class="feedback" id="cm-m" aria-live="polite"></p>';
        el.innerHTML = h;
        D.$all('[data-q]', el).forEach(function (b) { b.addEventListener('click', function () { ans[b.getAttribute('data-q')] = +b.getAttribute('data-o'); api.save({ ans: ans }); D.sfx('click'); render(); }); });
        D.$all('.cm-card', el).forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) { opened[d.getAttribute('data-c')] = 1; api.save({ opened: opened }); check(); } }); });
        check();
      }
      function check() {
        var n = Object.keys(opened).length, done = Object.keys(ans).length === QS.length, m = D.$('#cm-m', el);
        m.textContent = (done ? '✅' : '⬜') + ' Answer all 4 · ' + (n >= 3 ? '✅' : '⬜') + ' Open 3 career cards (' + Math.min(n, 3) + '/3)';
        if (done && n >= 3) { m.className = 'feedback ok'; m.textContent += ' · 🏆 The future of AI needs people like you!'; api.done(); }
      }
      render();
    },
  },
  quiz: [
    { q: 'Who is behind every part of AI?', a: ['People: collecting data, designing, testing and deciding how it’s used', 'Nobody — AI builds itself', 'Only robots', 'Only one company'], c: 0, why: 'AI is a human project.' },
    { q: 'What does a data scientist do?', a: ['Finds answers in data and often builds models', 'Fixes cars', 'Designs clothes', 'Flies planes'], c: 0, why: 'Data → insights.' },
    { q: 'What does an AI ethicist focus on?', a: ['Making AI fair, safe and respectful of privacy', 'Making AI faster only', 'Selling AI', 'Painting'], c: 0, why: 'The “should we?” questions.' },
    { q: 'Which is TRUE about AI careers?', a: ['AI teams need many skills: coding, math, design, writing, ethics, and knowledge of other fields', 'Only math geniuses can work in AI', 'AI careers don’t exist', 'You must be an adult to start learning'], c: 0, why: 'Many paths, and you’ve already started!' },
  ],
  challenge: {
    title: 'AI in Every Field',
    intro: 'Match each job to how AI can help it. Get 3 of 4.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'A doctor', a: ['AI can help spot signs of disease in scans, with the doctor making the final call', 'AI replaces all doctors today', 'AI can’t help doctors', 'AI chooses medicine alone'], c: 0, why: 'AI assists; people decide.' },
        { q: 'A soccer coach', a: ['AI can analyze match data and video to find patterns', 'AI plays the matches', 'AI can’t watch video', 'AI picks the team colors'], c: 0, why: 'Sports analytics is a growing field.' },
        { q: 'A wildlife scientist', a: ['AI can identify animals in thousands of camera-trap photos', 'AI scares animals away', 'AI can’t see animals', 'AI names the animals'], c: 0, why: 'Computer vision saves scientists huge amounts of time.' },
        { q: 'A game studio', a: ['AI can drive characters, test levels, and help create art and code', 'AI makes games illegal', 'AI can’t be used in games', 'AI only makes the title screen'], c: 0, why: 'From state machines to generative tools.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
