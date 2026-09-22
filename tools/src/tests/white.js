const { makeGridGame, GRID_CSS } = require('../lessons/white/al-khwarizmi.js');

module.exports = {
  quiz: [
    { q: 'Which is the best example of machine learning?', a: ['A spam filter that learned from millions of labeled emails', 'A light switch', 'A calculator adding 2 + 2', 'A wind-up toy'], c: 0, why: 'Machine learning finds patterns in examples. The spam filter learned from labeled emails; the others follow fixed rules.' },
    { q: 'What is an algorithm?', a: ['A precise, step-by-step set of instructions for solving a problem', 'A robot', 'A kind of computer chip', 'A random guess'], c: 0, why: 'Algorithms are exact steps in order, like the programs you built for your ninja.' },
    { q: 'The word “algorithm” comes from…', a: ['The name of al-Khwarizmi, a scholar in Baghdad about 1,200 years ago', 'An ancient Greek robot', 'A 1990s video game', 'The inventor of the internet'], c: 0, why: 'His name, written in Latin as “Algoritmi,” became “algorithm.”' },
    { q: 'What does the Turing Test check?', a: ['Whether a judge can tell a machine from a human by chatting with both', 'How fast a computer runs', 'Whether a robot can walk', 'How much memory a computer has'], c: 0, why: 'Alan Turing’s 1950 “imitation game” is about conversation, not speed or strength.' },
    { q: 'Is every robot powered by AI?', a: ['No — many robots just repeat programmed motions', 'Yes, every single one', 'Only toy robots', 'Only robots with wheels'], c: 0, why: 'A robot is a body. AI is software. You can have either one without the other.' },
    { q: 'Which is automatic but NOT AI?', a: ['Doors that open when a sensor detects motion', 'Face unlock on a phone', 'Video recommendations', 'A chatbot'], c: 0, why: 'Sensor + one rule = automation. The others recognize, predict or create using learned patterns.' },
    { q: 'LearnBot was taught with lots of wrongly labeled faces. What happens?', a: ['It learns the wrong pattern and makes more mistakes', 'It fixes the labels itself', 'Labels don’t matter', 'It becomes a RuleBot'], c: 0, why: 'Learning machines learn whatever their examples teach, mistakes included.' },
    { q: 'Which task is best solved with plain rules?', a: ['Checking whether a chess move is legal', 'Recognizing voices', 'Recommending songs', 'Reading messy handwriting'], c: 0, why: 'Chess rules are exact and written down. The others involve messy patterns that are better learned.' },
    { q: 'A chatbot types: “I feel sad today.” Which statement is most accurate?', a: ['It learned to use feeling words from human writing; there’s no evidence it actually feels sad', 'It definitely feels sad', 'It is secretly a human', 'Chatbots can’t write about feelings'], c: 0, why: 'AI can produce feeling words without evidence of real feelings behind them.' },
    { q: 'What is “hype”?', a: ['Claims that make something sound more amazing or scarier than it really is', 'A type of AI', 'A computer virus', 'A careful scientific study'], c: 0, why: 'Watch for words like EVERYTHING, ALWAYS, NEVER and tiny timelines.' },
    { q: 'Why is AI most likely to be wrong in very rare situations?', a: ['It learned from data with few examples like that situation', 'Rare situations break computers', 'AI refuses to work on rare days', 'AI is never wrong'], c: 0, why: 'AI learns patterns from its data. If it has barely seen something, it can’t have learned it well.' },
    { q: 'What trick did the old chatbot ELIZA often use?', a: ['Turning your words back into a question', 'Doing perfect math', 'Showing videos', 'Reading your mind'], c: 0, why: '“Why do you ask what I had for breakfast?” ELIZA reflected your words back instead of truly answering.' },
    { q: 'What does “debugging” mean?', a: ['Finding and fixing mistakes in instructions or code', 'Removing insects from a computer', 'Deleting a program', 'Making a program slower'], c: 0, why: 'When the ninja crashed, you found the wrong step and fixed it. That’s debugging!' },
    { q: 'What does every machine-learning system need in order to learn?', a: ['Data — lots of examples', 'A robot body', 'A human brain inside', 'Nothing at all'], c: 0, why: 'No data, no learning. Examples are the fuel of machine learning.' },
  ],
  project: {
    title: 'Inspector + Algorithm Kata',
    intro: 'Part A: inspect 6 gadgets like an AI expert. Part B: guide your ninja through the Sensei’s Maze with an efficient algorithm. Complete both!',
    css: GRID_CSS + `
.gi{display:grid;gap:10px;margin-bottom:18px}
.gi-item{border:2px solid var(--line);border-radius:12px;padding:12px;background:var(--bg)}
.gi-item p{margin:0 0 8px;font-weight:700}
.gi-item .row button{flex:1;min-width:80px}
.gi-item.ok{border-color:var(--good);background:var(--good-bg)}
.gi-step2{margin-top:8px}
.gi-why{font-size:.92rem;margin-top:6px}
#bt-maze[hidden]{display:none}
`,
    js: new Function('el', 'api', makeGridGame.toString() + `
      var D = api.D;
      var G = [
        ['🚗 A car that brakes by itself when its camera spots a person ahead', 'r', 'It recognizes people in camera images using a trained vision model.'],
        ['⏲️ A kitchen timer', 'n', 'Counts down and beeps. A fixed rule, not AI.'],
        ['🛒 An online store that predicts what you’ll want to buy next', 'p', 'It predicts from patterns in what you and other shoppers bought.'],
        ['🎨 An app that creates a picture from your description', 'c', 'Generative AI creates brand-new images from patterns it learned.'],
        ['🔦 A flashlight that turns on when you shake it', 'n', 'A motion switch. Automatic, not intelligent.'],
        ['🎙️ An app that turns your speech into subtitles', 'r', 'Speech recognition AI recognizes the words you say.'],
      ];
      var solved = 0;
      el.innerHTML = '<h3>Part A · Gadget Inspector</h3><p>For each gadget: is it AI? If yes, what’s its main skill?</p><div class="gi">' + G.map(function (g, i) {
        return '<div class="gi-item" data-i="' + i + '"><p>' + g[0] + '</p><div class="row"><button type="button" class="btn small" data-v="n">🔧 Not AI</button><button type="button" class="btn small" data-v="r">👁️ AI: Recognizes</button><button type="button" class="btn small" data-v="p">🔮 AI: Predicts</button><button type="button" class="btn small" data-v="c">🎨 AI: Creates</button></div><div class="gi-why" aria-live="polite"></div></div>';
      }).join('') + '</div><p class="feedback" id="gi-fb" aria-live="polite"></p><div id="bt-maze" hidden><h3>Part B · The Sensei’s Maze</h3><div id="bt-maze-game"></div></div>';
      D.$all('.gi-item button', el).forEach(function (b) {
        b.addEventListener('click', function () {
          var box = b.closest('.gi-item'), g = G[+box.getAttribute('data-i')];
          if (box.classList.contains('ok')) return;
          var why = box.querySelector('.gi-why');
          if (b.getAttribute('data-v') === g[1]) {
            box.classList.add('ok'); D.$all('button', box).forEach(function (x) { x.disabled = true; });
            why.textContent = '✅ ' + g[2]; solved++; D.sfx('good');
            var A = api.load().gi || {}; A[box.getAttribute('data-i')] = 1; api.save({ gi: A });
            if (solved === G.length) {
              D.$('#gi-fb', el).className = 'feedback ok'; D.$('#gi-fb', el).textContent = 'Inspection complete! Now for the final kata…';
              var m = D.$('#bt-maze', el); m.hidden = false;
              makeGridGame(D.$('#bt-maze-game', el), { D: D, T: api.T, done: api.done, save: api.save, load: api.load }, [
                { n: '★', title: 'The Sensei’s Maze (max 11 blocks)', size: 7, start: [0, 6], dir: 1, goal: [6, 0],
                  walls: ['4,6', '4,5', '4,4', '6,6', '6,5', '6,4', '3,2', '4,2', '5,2', '0,3', '1,3', '2,3', '1,1'], limit: 11,
                  hint: 'Your ninja faces right ➡. Find the path, then squeeze it into 11 blocks with repeats.', win: 'The sensei nods. Your algorithm is flawless.' },
              ], { repeat: true });
              m.scrollIntoView({ behavior: D.reducedMotion() ? 'auto' : 'smooth', block: 'start' });
            }
          } else { b.disabled = true; why.textContent = '❌ Not quite — ask: does it recognize, predict, create, or just follow a rule?'; D.sfx('bad'); }
        });
      });
      var GI = api.load().gi || {};
      Object.keys(GI).forEach(function (i) { var b = D.$('.gi-item[data-i="' + i + '"] button[data-v="' + G[i][1] + '"]', el); if (b) b.click(); });`),
  },
};
