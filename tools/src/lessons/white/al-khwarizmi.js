// Grid-programming engine shared by the activity and challenge (each gets its own copy when serialized).
function makeGridGame(el, api, levels, opts) {
  var D = api.D;
  var DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]], ARROW = ['⬆', '➡', '⬇', '⬅'];
  var lv = 0, prog = [], running = false, beaten = {};
  el.innerHTML = '<div class="gg"><div class="gg-head"><b data-g="title"></b><span class="pill" data-g="limit"></span></div>' +
    '<div class="gg-board" data-g="board" role="img"></div>' +
    '<div class="gg-pal" aria-label="Command blocks"></div>' +
    '<div class="gg-prog-wrap"><span class="gg-label">Your algorithm (tap a block to remove it):</span><ol class="gg-prog" data-g="prog" aria-live="polite"></ol></div>' +
    '<div class="row"><button type="button" class="btn primary" data-g="run">▶ Run</button><button type="button" class="btn" data-g="undo">↶ Undo</button><button type="button" class="btn" data-g="clear">🗑 Clear</button></div>' +
    '<p class="feedback" data-g="fb" aria-live="polite"></p><div class="row" data-g="levels"></div></div>';
  var BLOCKS = [['F', '⬆️ Forward'], ['L', '↰ Turn left'], ['R', '↱ Turn right']];
  if (opts.repeat) BLOCKS = BLOCKS.concat([['2', '🔁 ×2'], ['3', '🔁 ×3'], ['4', '🔁 ×4'], ['5', '🔁 ×5']]);
  var pal = D.$('.gg-pal', el);
  pal.innerHTML = BLOCKS.map(function (b) { return '<button type="button" class="gg-blk b' + (/\d/.test(b[0]) ? 'N' : b[0]) + '" data-b="' + b[0] + '">' + b[1] + '</button>'; }).join('') +
    (opts.repeat ? '<p class="gg-tip">🔁 A repeat block repeats the <b>next</b> block. So “🔁 ×3, ⬆️ Forward” moves forward 3 times.</p>' : '');
  function L() { return levels[lv]; }
  function name(b) { return { F: '⬆️ Forward', L: '↰ Left', R: '↱ Right' }[b] || ('🔁 ×' + b); }
  function renderProg() {
    var p = D.$('[data-g="prog"]', el);
    p.innerHTML = prog.length ? prog.map(function (b, i) { return '<li><button type="button" class="gg-blk b' + (/\d/.test(b) ? 'N' : b) + '" data-i="' + i + '" aria-label="Step ' + (i + 1) + ': ' + name(b) + '. Tap to remove.">' + name(b) + '</button></li>'; }).join('') : '<li class="gg-empty">Empty — tap blocks above to build your algorithm.</li>';
    D.$all('button', p).forEach(function (b) { b.addEventListener('click', function () { if (running) return; prog.splice(+b.getAttribute('data-i'), 1); renderProg(); }); });
    var lim = L().limit; D.$('[data-g="limit"]', el).textContent = lim ? ('Blocks: ' + prog.length + ' / ' + lim) : ('Blocks: ' + prog.length);
    D.$('[data-g="limit"]', el).style.background = lim && prog.length > lim ? 'var(--bad-bg)' : '';
  }
  function draw(pos, dir, trail, crash) {
    var l = L(), n = l.size, h = '';
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var k = x + ',' + y, cls = 'gg-cell', c = '';
      if (l.walls.indexOf(k) >= 0) { cls += ' wall'; c = '🪨'; }
      if (trail && trail[k]) cls += ' trail';
      if (x === l.goal[0] && y === l.goal[1]) { cls += ' goal'; c = api.T.items ? api.T.items[0] : '⭐'; }
      if (x === pos[0] && y === pos[1]) { cls += ' me' + (crash ? ' crash' : ''); c = '<span class="gg-me">' + D.esc(D.avatar()) + '</span><span class="gg-dir">' + ARROW[dir] + '</span>'; }
      h += '<div class="' + cls + '">' + c + '</div>';
    }
    var b = D.$('[data-g="board"]', el); b.style.gridTemplateColumns = 'repeat(' + n + ',1fr)'; b.innerHTML = h;
    b.setAttribute('aria-label', 'Grid ' + n + ' by ' + n + '. Your ninja is at column ' + (pos[0] + 1) + ', row ' + (pos[1] + 1) + ', facing ' + ['up', 'right', 'down', 'left'][dir] + '. The goal is at column ' + (l.goal[0] + 1) + ', row ' + (l.goal[1] + 1) + '.');
  }
  function expand() { // turn repeat prefixes into a flat list of moves
    var out = [], k = 1;
    for (var i = 0; i < prog.length; i++) { var b = prog[i]; if (/\d/.test(b)) { k *= +b; continue; } for (var j = 0; j < k; j++) out.push(b); k = 1; }
    return out;
  }
  function loadLevel(i) {
    lv = i; prog = []; running = false;
    D.$('[data-g="title"]', el).textContent = L().title;
    D.$('[data-g="fb"]', el).className = 'feedback'; D.$('[data-g="fb"]', el).innerHTML = L().hint || '';
    draw(L().start, L().dir); renderProg(); levelsBar();
  }
  function levelsBar() {
    D.$('[data-g="levels"]', el).innerHTML = levels.map(function (l, i) { return '<button type="button" class="btn small" data-l="' + i + '" ' + (i > 0 && !beaten[i - 1] && !beaten[i] ? 'disabled' : '') + ' aria-current="' + (i === lv) + '">' + (beaten[i] ? '✅ ' : '') + 'Level ' + (l.n || i + 1) + '</button>'; }).join('');
    D.$all('[data-l]', el).forEach(function (b) { b.addEventListener('click', function () { if (!running) loadLevel(+b.getAttribute('data-l')); }); });
  }
  D.$all('.gg-pal .gg-blk', el).forEach(function (b) { b.addEventListener('click', function () { if (running) return; if (prog.length >= 30) return; prog.push(b.getAttribute('data-b')); renderProg(); D.sfx('click'); }); });
  D.$('[data-g="undo"]', el).addEventListener('click', function () { if (!running) { prog.pop(); renderProg(); } });
  D.$('[data-g="clear"]', el).addEventListener('click', function () { if (!running) { prog = []; renderProg(); draw(L().start, L().dir); D.$('[data-g="fb"]', el).textContent = ''; } });
  D.$('[data-g="run"]', el).addEventListener('click', function () {
    if (running) return;
    var l = L(), fb = D.$('[data-g="fb"]', el);
    if (!prog.length) { fb.className = 'feedback no'; fb.textContent = 'Your algorithm is empty! Add some blocks.'; return; }
    if (/\d/.test(prog[prog.length - 1])) { fb.className = 'feedback no'; fb.textContent = '🐞 Bug: a repeat block at the end has nothing to repeat.'; return; }
    if (l.limit && prog.length > l.limit) { fb.className = 'feedback no'; fb.textContent = '🐞 Too many blocks! This level allows ' + l.limit + '. Can repeat blocks make it shorter?'; return; }
    var moves = expand(), pos = l.start.slice(), dir = l.dir, trail = {}, step = 0;
    running = true; fb.className = 'feedback'; fb.textContent = 'Running…';
    trail[pos.join(',')] = 1; draw(pos, dir, trail);
    var delay = D.reducedMotion() ? 60 : 320;
    (function next() {
      if (step >= moves.length) {
        running = false;
        if (pos[0] === l.goal[0] && pos[1] === l.goal[1]) win(); else { fb.className = 'feedback no'; fb.textContent = '🐞 The algorithm finished, but your ninja didn’t reach the goal. Debug it: which step went wrong?'; D.sfx('bad'); }
        return;
      }
      var m = moves[step++];
      if (m === 'L') dir = (dir + 3) % 4; else if (m === 'R') dir = (dir + 1) % 4;
      else {
        var nx = pos[0] + DIRS[dir][0], ny = pos[1] + DIRS[dir][1];
        if (nx < 0 || ny < 0 || nx >= l.size || ny >= l.size || l.walls.indexOf(nx + ',' + ny) >= 0) {
          draw(pos, dir, trail, true); running = false; fb.className = 'feedback no';
          fb.textContent = '💥 Crash on move ' + step + '! Your ninja hit ' + (l.walls.indexOf(nx + ',' + ny) >= 0 ? 'a rock' : 'the edge') + '. Debug your algorithm and try again.'; D.sfx('bad'); return;
        }
        pos = [nx, ny]; trail[pos.join(',')] = 1; D.sfx('step');
      }
      draw(pos, dir, trail); setTimeout(next, delay);
    })();
    function win() {
      beaten[lv] = true; fb.className = 'feedback ok';
      fb.innerHTML = '🎯 Goal reached with ' + prog.length + ' block' + (prog.length === 1 ? '' : 's') + '! ' + (l.win || '');
      D.sfx('win'); levelsBar();
      var all = levels.every(function (_, i) { return beaten[i]; });
      if (all) { api.done(); fb.innerHTML += ' <b>All levels complete!</b>'; }
      else if (lv + 1 < levels.length) { fb.innerHTML += ' <button type="button" class="btn small primary" data-g="next">Next level →</button>'; D.$('[data-g="next"]', el).addEventListener('click', function () { loadLevel(lv + 1); }); }
    }
  });
  loadLevel(0);
}

const GRID_CSS = `
.gg-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px}
.gg-board{display:grid;gap:4px;max-width:360px;margin:0 auto 12px;background:#1b1b1b;padding:6px;border-radius:12px}
.gg-cell{aspect-ratio:1;background:#f3ead6;border-radius:6px;display:grid;place-items:center;font-size:1.3rem;position:relative}
.gg-cell.wall{background:#8d7b68}
.gg-cell.trail{background:#ffd6a5}
.gg-cell.goal{background:#caffbf;box-shadow:inset 0 0 0 3px #1b7f4b}
.gg-cell.me{background:#ffadad}
.gg-cell.crash{background:#b3261e}
.gg-me{font-size:1.4rem}
.gg-dir{position:absolute;right:2px;bottom:0;font-size:.8rem;font-weight:900;color:#1b1b1b}
.gg-pal{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
.gg-blk{min-height:48px;padding:6px 12px;border-radius:10px;border:2px solid #1b1b1b;font:700 .95rem var(--font-body);cursor:pointer;color:#1b1b1b}
.gg-blk.bF{background:#a0c4ff}.gg-blk.bL{background:#ffd6a5}.gg-blk.bR{background:#fdffb6}.gg-blk.bN{background:#bdb2ff}
.gg-tip{flex-basis:100%;font-size:.9rem;margin:4px 0 0}
.gg-label{font-weight:700;font-size:.9rem}
.gg-prog{list-style:none;display:flex;flex-wrap:wrap;gap:6px;padding:10px;min-height:66px;background:var(--bg2);border-radius:12px;margin:6px 0 12px}
.gg-prog .gg-blk{min-height:44px;font-size:.85rem}
.gg-empty{color:var(--muted);font-style:italic}
[data-g="levels"]{margin-top:10px}
[data-g="levels"] [aria-current="true"]{background:var(--accent);color:var(--accent-ink)}
`;

module.exports = {
  hook: 'The word “algorithm” is about 1,200 years old, and it comes from a person’s name. Discover whose, then write algorithms of your own.',
  story: [
    ['sensei', 'Travel back with me, {{nick}}. About 1,200 years ago, in the city of Baghdad, stood the <b>House of Wisdom</b>, a famous center of learning where scholars studied math, astronomy and more.'],
    ['sensei', 'One of its great scholars was <b>Muhammad ibn Musa al-Khwarizmi</b>. He wrote a book explaining how to calculate with the digits 0–9 that came from India, the same digits you use today.'],
    ['sensei', 'Centuries later his book was translated into Latin, and his name was written as <b>“Algoritmi.”</b> Step-by-step calculating became known as “algorism,” and over time that word became <b>algorithm</b>.'],
    ['you', 'Wait, so “algorithm” is someone’s name?!'],
    ['sensei', 'It is! And another of his books had <i>al-jabr</i> in its title. That gave us the word <b>algebra</b>. Today every AI runs on algorithms: precise, step-by-step instructions. Let’s write some.'],
  ],
  activity: {
    title: 'Algorithm Dojo',
    instructions: 'Build an algorithm that moves your ninja to the goal ({{T.emoji}}). Add blocks, then press Run. If your ninja crashes, find the bug and fix it. That’s called <b>debugging</b>. Beat all 3 levels.',
    css: GRID_CSS,
    js: new Function('el', 'api', makeGridGame.toString() + `
      makeGridGame(el, api, [
        { title: 'Level 1 · First steps', size: 5, start: [0, 4], dir: 1, goal: [3, 4], walls: [], hint: 'Your ninja faces right ➡. How many steps forward to reach the goal?', win: 'Every step was exact. That’s what makes it an algorithm.' },
        { title: 'Level 2 · Turn the corner', size: 5, start: [0, 4], dir: 0, goal: [3, 1], walls: ['1,4', '1,3', '2,3', '3,3'], hint: 'Your ninja faces up ⬆. You’ll need a turn. “Turn right” means YOUR ninja’s right.', win: 'Turning is about the ninja’s point of view, not yours. Precise thinking!' },
        { title: 'Level 3 · Repeat power', size: 6, start: [0, 5], dir: 0, goal: [3, 0], walls: ['1,2', '1,3', '2,4', '3,2', '4,4'], hint: 'New blocks! Try “🔁 ×5” then “⬆️ Forward” instead of 5 Forward blocks.', win: 'Repeat blocks make algorithms shorter and easier to read.' },
      ], { repeat: true });`),
  },
  quiz: [
    { q: 'Where does the word “algorithm” come from?', a: ['The name of the scholar al-Khwarizmi', 'A type of robot', 'A Greek word for “computer”', 'A video game from the 1980s'], c: 0, why: 'When al-Khwarizmi’s book was translated into Latin, his name became “Algoritmi.” Over time that turned into “algorithm.”' },
    { q: 'What is an algorithm?', a: ['A precise, step-by-step set of instructions for solving a problem', 'Any kind of robot', 'A computer screen', 'A lucky guess'], c: 0, why: 'Recipes, dance routines and the moves in your Algorithm Dojo are all algorithms: exact steps in order.' },
    { q: 'Your ninja crashed into a rock on move 4. What’s the best thing to do?', a: ['Find the step that went wrong and fix it — that’s debugging', 'Give up', 'Add random blocks until it works', 'Blame the computer'], c: 0, why: 'The computer did exactly what you said. Debugging means finding where the instructions went wrong and fixing them.' },
    { q: 'Why is a repeat block useful?', a: ['It makes programs shorter and easier to read when a step repeats', 'It makes the ninja run faster', 'It lets you skip testing', 'It picks moves at random'], c: 0, why: 'Programmers call this a loop. Loops are everywhere in real code.' },
    { q: 'Which word ALSO comes from one of al-Khwarizmi’s books?', a: ['Algebra', 'Robot', 'Pixel', 'Internet'], c: 0, why: 'His book on solving equations had “al-jabr” in its title, and that became “algebra.”' },
  ],
  challenge: {
    title: 'The Block Budget',
    intro: 'Real programmers try to write <b>efficient</b> algorithms. These levels have a strict block limit, so you MUST use repeat blocks cleverly.',
    css: '',
    js: new Function('el', 'api', makeGridGame.toString() + `
      makeGridGame(el, api, [
        { n: 4, title: 'Level 4 · The long way round (max 8 blocks)', size: 6, start: [0, 5], dir: 0, goal: [4, 5], walls: ['2,1', '2,2', '2,3', '2,4', '2,5', '3,3', '5,2'], limit: 8, hint: 'There’s a wall in the middle. Go up and over it. Count the steps in each straight line!', win: 'Efficient AND correct. Nice.' },
        { n: 5, title: 'Level 5 · The U-turn (max 8 blocks)', size: 6, start: [0, 0], dir: 2, goal: [5, 0], walls: ['1,0', '2,0', '3,0', '4,0', '2,2', '3,3', '1,4', '4,2'], limit: 8, hint: 'Your ninja faces down ⬇. Think in straight lines: down, across, up.', win: 'You think like a real programmer.' },
      ], { repeat: true });`),
  },
};
module.exports.makeGridGame = makeGridGame;
module.exports.GRID_CSS = GRID_CSS;
