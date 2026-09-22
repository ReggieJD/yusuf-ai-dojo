module.exports = {
  hook: 'Real code, running live. Open five mini apps: a scoreboard, a chess clock, flashcards, a training timer and a quiz. Then remix them your way.',
  story: [
    ['sensei', 'This is it, {{nick}}: real <b>code</b>. The same HTML, CSS and JavaScript that AI app builders write for you.'],
    ['sensei', '<b>HTML</b> is the structure (buttons, text). <b>CSS</b> is the style (colors, sizes). <b>JavaScript</b> is the behavior (what happens when you tap).'],
    ['you', 'Can I break it?'],
    ['sensei', 'Break it, fix it, remix it! Everything runs safely inside this page, and “Reset code” brings back the original. Builders who can READ code get far more out of AI tools, because they can spot and fix what the AI got wrong.'],
  ],
  activity: {
    title: 'The Live Code Dojo',
    instructions: 'Open at least 3 different apps. Then change something in one app’s code (the lines marked “Try changing me!”) and watch the preview update live.',
    css: `
.cp-tabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.cp-tabs button{min-height:44px;border-radius:999px;border:2px solid #f5c54288;background:var(--bg2);color:var(--ink);padding:6px 12px;font:700 .88rem var(--font-body);cursor:pointer}
.cp-tabs button[aria-pressed="true"]{background:#f5c542;color:#141414;border-color:#f5c542}
.cp{display:grid;gap:10px}
@media(min-width:860px){.cp{grid-template-columns:1fr 1fr}}
.cp textarea{width:100%;min-height:340px;border-radius:12px;border:2px solid #f5c54255;background:#0b0b0b;color:#e6e6e6;font:500 13px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;padding:10px;resize:vertical;tab-size:2}
.cp iframe{width:100%;min-height:340px;border:3px solid #f5c542;border-radius:12px;background:#fff}
.cp-ideas{background:var(--bg2);border-radius:12px;padding:10px 12px;margin-top:8px;font-size:.93rem}
.cp-ideas ul{margin:4px 0 0;padding-left:1.2em}
.cp-m{font-weight:800;margin:8px 0}
`,
    js: function (el, api) {
      var D = api.D;
      var APPS = [
        { id: 'score', name: '🏀 Scoreboard', ideas: ['Change the team names', 'Change the number color', 'Add a +4 button (look how the +3 button works!)'],
          code: `<!doctype html>
<html>
<head>
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, sans-serif; text-align: center; margin: 0; padding: 12px;
         background: #0f1b2d; color: white; }            /* 🎨 Try changing me! */
  .team { display: inline-block; width: 45%; background: #16233a; border-radius: 14px; padding: 10px; }
  .score { font-size: 56px; font-weight: 900; color: #ffd23f; } /* 🎨 Try changing me! */
  button { font-size: 18px; font-weight: 800; padding: 10px 14px; margin: 3px; border: 0; border-radius: 10px; background: #ffd23f; }
</style>
</head>
<body>
  <h2>🏀 Game Day</h2>
  <div class="team">
    <h3 id="homeName">HOME</h3>
    <div class="score" id="home">0</div>
    <button onclick="add('home', 1)">+1</button>
    <button onclick="add('home', 2)">+2</button>
    <button onclick="add('home', 3)">+3</button>
  </div>
  <div class="team">
    <h3 id="awayName">AWAY</h3>
    <div class="score" id="away">0</div>
    <button onclick="add('away', 1)">+1</button>
    <button onclick="add('away', 2)">+2</button>
    <button onclick="add('away', 3)">+3</button>
  </div>
  <p><button onclick="resetAll()">Reset</button></p>
<script>
  // ✏️ Try changing me! Put your team names here:
  document.getElementById('homeName').textContent = 'HAWKS';
  document.getElementById('awayName').textContent = 'TIGERS';

  function add(team, points) {
    var el = document.getElementById(team);
    el.textContent = Number(el.textContent) + points;
  }
  function resetAll() {
    document.getElementById('home').textContent = 0;
    document.getElementById('away').textContent = 0;
  }
<\/script>
</body>
</html>` },
        { id: 'clock', name: '♟️ Chess Clock', ideas: ['Change the starting time to 1 minute', 'Change what it says when time runs out', 'Change the active player’s color'],
          code: `<!doctype html>
<html>
<head>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; display: flex; flex-direction: column; height: 100vh; }
  .clock { flex: 1; border: 0; font-size: 60px; font-weight: 900; background: #ddd; color: #222; }
  .active { background: #7b2ff7; color: white; }  /* 🎨 Try changing me! */
</style>
</head>
<body>
  <button class="clock" id="p1" onclick="tap(1)">3:00</button>
  <button class="clock" id="p2" onclick="tap(2)">3:00</button>
<script>
  var START_SECONDS = 180;   // ✏️ Try changing me! (180 seconds = 3 minutes)
  var time = { 1: START_SECONDS, 2: START_SECONDS };
  var running = 0;           // whose clock is ticking (0 = nobody yet)

  function show(p) {
    var s = time[p];
    var text = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    if (s <= 0) text = "TIME'S UP!";   // ✏️ Try changing me!
    document.getElementById('p' + p).textContent = text;
  }
  function tap(p) {
    // Tapping YOUR clock starts your opponent's clock
    running = (p === 1) ? 2 : 1;
    document.getElementById('p1').className = 'clock' + (running === 1 ? ' active' : '');
    document.getElementById('p2').className = 'clock' + (running === 2 ? ' active' : '');
  }
  setInterval(function () {
    if (running && time[running] > 0) { time[running]--; show(running); }
  }, 1000);
  show(1); show(2);
<\/script>
</body>
</html>` },
        { id: 'cards', name: '🃏 AI Flashcards', ideas: ['Add your own card to the list', 'Change the card color', 'Make it show the meaning first'],
          code: `<!doctype html>
<html>
<head>
<style>
  body { font-family: Georgia, serif; text-align: center; background: #f3e5c4; margin: 0; padding: 16px; }
  #card { background: #fffdf6; border: 4px solid #8b5a2b; border-radius: 18px; min-height: 160px;   /* 🎨 Try changing me! */
          display: flex; align-items: center; justify-content: center; font-size: 24px; padding: 16px; cursor: pointer; }
  button { font-size: 18px; padding: 10px 16px; margin: 10px 4px; border-radius: 10px; border: 2px solid #8b5a2b; background: white; }
</style>
</head>
<body>
  <h2>🃏 AI Flashcards</h2>
  <div id="card" onclick="flip()"></div>
  <button onclick="next()">Next card ➡️</button>
  <p id="count"></p>
<script>
  // ✏️ Try changing me! Add a card: ['Term', 'Meaning'],
  var cards = [
    ['Algorithm', 'A precise, step-by-step set of instructions'],
    ['Token', 'A chunk of text a language model reads'],
    ['Overfitting', 'Memorizing training data instead of learning the pattern'],
    ['Pixel', 'One tiny square of color in an image'],
  ];
  var i = 0, showingMeaning = false;
  function draw() {
    document.getElementById('card').textContent = showingMeaning ? cards[i][1] : cards[i][0];
    document.getElementById('count').textContent = 'Card ' + (i + 1) + ' of ' + cards.length + ' · tap the card to flip';
  }
  function flip() { showingMeaning = !showingMeaning; draw(); }
  function next() { i = (i + 1) % cards.length; showingMeaning = false; draw(); }
  draw();
<\/script>
</body>
</html>` },
        { id: 'timer', name: '🥋 Training Timer', ideas: ['Change the work and rest times', 'Change the number of rounds', 'Change the background colors for WORK and REST'],
          code: `<!doctype html>
<html>
<head>
<style>
  body { font-family: system-ui, sans-serif; text-align: center; margin: 0; padding: 16px; transition: background .3s; }
  #big { font-size: 72px; font-weight: 900; }
  #mode { font-size: 28px; font-weight: 800; }
  button { font-size: 20px; padding: 12px 20px; border-radius: 12px; border: 0; background: #1b1b1b; color: #f5c542; }
</style>
</head>
<body>
  <h2>🥋 Kata Interval Timer</h2>
  <div id="mode">Ready?</div>
  <div id="big">0</div>
  <p id="round"></p>
  <button onclick="start()">Start</button>
<script>
  var WORK = 20;    // ✏️ Try changing me! seconds of work
  var REST = 10;    // ✏️ Try changing me! seconds of rest
  var ROUNDS = 4;   // ✏️ Try changing me!
  var WORK_COLOR = '#ffd6d6', REST_COLOR = '#d6ffe0';   // 🎨 Try changing me!

  var timer = null;
  function start() {
    clearInterval(timer);
    var round = 1, working = true, left = WORK;
    function paint() {
      document.getElementById('mode').textContent = working ? '💥 WORK!' : '😮‍💨 REST';
      document.getElementById('big').textContent = left;
      document.getElementById('round').textContent = 'Round ' + round + ' of ' + ROUNDS;
      document.body.style.background = working ? WORK_COLOR : REST_COLOR;
    }
    paint();
    timer = setInterval(function () {
      left--;
      if (left < 0) {
        if (!working && round === ROUNDS) { clearInterval(timer); document.getElementById('mode').textContent = '🏆 Done! Bow to your sensei.'; return; }
        if (!working) round++;
        working = !working;
        left = working ? WORK : REST;
      }
      paint();
    }, 1000);
  }
<\/script>
</body>
</html>` },
        { id: 'quiz', name: '❓ Quiz Game', ideas: ['Change a question and its answers', 'Add a 4th question', 'Change the message at the end'],
          code: `<!doctype html>
<html>
<head>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; background: #1a0b2e; color: white; }
  button.choice { display: block; width: 100%; margin: 6px 0; padding: 12px; font-size: 17px; border-radius: 10px; border: 0; background: #efe4ff; }
  #msg { font-weight: 800; min-height: 1.5em; }
</style>
</head>
<body>
  <h2>❓ Dojo Quiz</h2>
  <p id="q"></p>
  <div id="choices"></div>
  <p id="msg"></p>
<script>
  // ✏️ Try changing me! [question, [choices...], index of the right choice]
  var QUESTIONS = [
    ['How many points is a basketball free throw worth?', ['1', '2', '3'], 0],
    ['Which chess piece moves in an L shape?', ['Bishop', 'Knight', 'Rook'], 1],
    ['What does AI learn patterns from?', ['Data', 'Magic', 'Luck'], 0],
  ];
  var n = 0, score = 0;
  function show() {
    if (n >= QUESTIONS.length) {
      document.getElementById('q').textContent = 'You scored ' + score + ' out of ' + QUESTIONS.length + '! 🏆'; // ✏️ Try changing me!
      document.getElementById('choices').innerHTML = '';
      return;
    }
    var item = QUESTIONS[n];
    document.getElementById('q').textContent = item[0];
    var box = document.getElementById('choices');
    box.innerHTML = '';
    item[1].forEach(function (text, i) {
      var b = document.createElement('button');
      b.className = 'choice'; b.textContent = text;
      b.onclick = function () {
        if (i === item[2]) { score++; document.getElementById('msg').textContent = '✅ Correct!'; }
        else { document.getElementById('msg').textContent = '❌ Nope, it was ' + item[1][item[2]]; }
        n++; show();
      };
      box.appendChild(b);
    });
  }
  show();
<\/script>
</body>
</html>` },
      ];
      var S = api.load(), cur = S.cur || 'score', edits = S.edits || {}, opened = S.opened || {}, timer = null;
      function app(id) { return APPS.filter(function (a) { return a.id === id; })[0]; }
      el.innerHTML = '<div class="cp-tabs" role="group" aria-label="Choose an app">' + APPS.map(function (a) { return '<button type="button" data-app="' + a.id + '">' + a.name + '</button>'; }).join('') + '</div><div class="cp"><div><label for="cp-code" class="sr-only">Code editor</label><textarea id="cp-code" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea><div class="row"><button type="button" class="btn small" id="cp-run">▶ Run</button><button type="button" class="btn small" id="cp-reset">↺ Reset code</button></div></div><div><iframe id="cp-frame" sandbox="allow-scripts" title="Live preview"></iframe></div></div><div class="cp-ideas" id="cp-ideas"></div><p class="cp-m" id="cp-m" aria-live="polite"></p>';
      var ta = D.$('#cp-code', el), fr = D.$('#cp-frame', el);
      function run() { fr.srcdoc = ta.value; }
      function mission() {
        var n = Object.keys(opened).length, edited = Object.keys(edits).some(function (k) { return edits[k] !== app(k).code; });
        var m = D.$('#cp-m', el);
        m.innerHTML = (n >= 3 ? '✅' : '⬜') + ' Open 3 apps (' + Math.min(n, 3) + '/3) · ' + (edited ? '✅' : '⬜') + ' Remix one app’s code';
        if (n >= 3 && edited) { m.innerHTML += '<br>🏆 You’re coding! Now you can read and tweak what AI builders write for you. That’s a real superpower.'; api.done(); }
      }
      function load(id) {
        cur = id; opened[id] = 1; api.save({ cur: cur, opened: opened });
        ta.value = edits[id] != null ? edits[id] : app(id).code; run();
        D.$all('[data-app]', el).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-app') === id ? 'true' : 'false'); });
        D.$('#cp-ideas', el).innerHTML = '<b>Remix ideas for ' + app(id).name + ':</b><ul>' + app(id).ideas.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>';
        mission();
      }
      D.$all('[data-app]', el).forEach(function (b) { b.addEventListener('click', function () { load(b.getAttribute('data-app')); D.sfx('click'); }); });
      ta.addEventListener('input', function () { edits[cur] = ta.value; api.save({ edits: edits }); clearTimeout(timer); timer = setTimeout(function () { run(); mission(); }, 600); });
      D.$('#cp-run', el).addEventListener('click', function () { run(); mission(); });
      D.$('#cp-reset', el).addEventListener('click', function () { delete edits[cur]; api.save({ edits: edits }); load(cur); });
      load(cur);
    },
  },
  quiz: [
    { q: 'What does HTML do?', a: ['Gives a page its structure, like buttons and text', 'Makes it colorful', 'Makes sounds', 'Trains AI'], c: 0, why: 'HTML = structure.' },
    { q: 'What does CSS do?', a: ['Styles the page: colors, sizes, layout', 'Stores passwords', 'Counts points', 'Sends email'], c: 0, why: 'CSS = style.' },
    { q: 'What does JavaScript do?', a: ['Adds behavior, like what happens when you tap a button', 'Only changes fonts', 'Nothing', 'Prints paper'], c: 0, why: 'JavaScript = behavior.' },
    { q: 'Why is it useful to read code even if AI writes it?', a: ['You can understand, check and fix what the AI got wrong', 'You never need to', 'To make the AI jealous', 'Because AI code never has bugs'], c: 0, why: 'Reading code makes you a much stronger builder.' },
  ],
  challenge: {
    title: 'Code Detective',
    intro: 'Read the code snippets and predict what happens. Get 3 of 4.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'In the scoreboard, add(\'home\', 2) runs. The home score was 5. What is it now?', a: ['7', '52', '2', '5'], c: 0, why: 'Number(5) + 2 = 7. (Without Number(), text “5” + 2 would be “52”!)' },
        { q: 'In the chess clock, START_SECONDS = 60. What does each clock show at the start?', a: ['1:00', '60:00', '0:60', '6:00'], c: 0, why: '60 seconds = 1 minute and 0 seconds.' },
        { q: 'In the timer, WORK = 20 and REST = 10 with ROUNDS = 4. How long does the whole workout take (roughly)?', a: ['About 2 minutes', 'About 30 seconds', 'About 10 minutes', 'About 4 seconds'], c: 0, why: '(20 + 10) × 4 = 120 seconds = 2 minutes.' },
        { q: 'In the quiz, a question’s right-answer index is 1, with choices [\'Bishop\', \'Knight\', \'Rook\']. Which is correct?', a: ['Knight', 'Bishop', 'Rook', 'None'], c: 0, why: 'Counting starts at 0: Bishop = 0, Knight = 1, Rook = 2. Programmers count from zero!' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
