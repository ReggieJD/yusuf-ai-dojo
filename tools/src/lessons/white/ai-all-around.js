module.exports = {
  hook: 'AI rarely looks like a robot. It hides inside your phone, your games and your maps. Can you find it?',
  story: [
    ['sensei', '{{nick}}, how many times do you think you used AI today?'],
    ['you', 'Um… zero? I haven’t talked to any robots.'],
    ['sensei', 'Ha! AI almost never looks like a robot. It hides inside everyday things: your phone, your apps, your maps.'],
    ['sensei', '<b>Artificial intelligence</b> means computer systems that do jobs that usually need human smarts: <b>recognizing</b> faces, <b>understanding</b> speech, <b>predicting</b> what comes next, <b>recommending</b>, and <b>creating</b>.'],
    ['sensei', 'But not every gadget is AI. A light switch just follows one rule. Your mission: walk through a whole day and uncover the hidden AI.'],
  ],
  activity: {
    title: 'A Day of Hidden AI',
    instructions: 'Tap each object in the day. Decide: is there AI inside, or is it a plain machine? Find all 12.',
    css: `
.day{display:grid;gap:12px}
.day-scene{border-radius:16px;padding:12px;border:2px solid var(--line);background:linear-gradient(135deg,var(--sky1),var(--sky2))}
.day-scene h3{margin:0 0 8px;font-size:1rem;display:flex;gap:8px;align-items:center}
.day-items{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}
.day-item{background:#ffffffe6;border:2px solid #1b1b1b33;border-radius:12px;padding:10px;text-align:left;cursor:pointer;font:600 .95rem/1.3 var(--font-body);color:#1b1b1b;min-height:80px;display:flex;gap:8px;align-items:center;min-width:0;overflow-wrap:anywhere}
.day-item .e{font-size:1.8rem}
.day-item.ai{border-color:#1b7f4b;background:#e3f6ea}.day-item.plain{border-color:#667085;background:#f2f4f7}
.day-item .tag{display:block;font-size:.75rem;font-weight:800;margin-top:2px}
.day-pop{border:3px solid #1b1b1b;border-radius:16px;background:var(--card);padding:14px;margin-top:10px}
.day-pop .row button{flex:1}
.day-score{position:sticky;top:64px;z-index:5;background:var(--accent);color:var(--accent-ink);border-radius:999px;padding:6px 14px;font-weight:800;display:inline-block;margin-bottom:8px}
`,
    js: function (el, api) {
      var D = api.D;
      var scenes = [
        ['🌅', 'Morning', '#ffe8cc', '#fff4e6', [
          ['⏰', 'Alarm clock that rings at 7:00', 0, 'It follows one fixed rule: when the time is 7:00, ring. No recognizing, predicting or learning.'],
          ['📱', 'Phone that unlocks when it sees your face', 1, 'Face unlock uses a model trained on huge numbers of face images, so it can recognize YOUR face from new angles.']]],
        ['🚗', 'On the way', '#d0ebff', '#e7f5ff', [
          ['🗺️', 'Map app that predicts when you’ll arrive', 1, 'It learns patterns from lots of trip and traffic data to predict how long the drive will take.'],
          ['🚦', 'Traffic light that changes every 60 seconds', 0, 'A timer rule. Some cities use smarter systems, but a fixed timer is not AI.']]],
        ['🏫', 'School', '#d3f9d8', '#ebfbee', [
          ['⌨️', 'Keyboard that suggests your next word', 1, 'It predicts likely next words using patterns learned from lots of text — a tiny cousin of chatbots.'],
          ['🧮', 'Calculator', 0, 'Exact math rules, the same every time. Super useful, not AI.']]],
        ['🌤️', 'Afternoon', '#fff3bf', '#fff9db', [
          ['📺', 'Video app that recommends what to watch', 1, 'It finds patterns in what you and millions of similar viewers watched, then predicts what you might like.'],
          ['🍿', 'Microwave with a 2-minute button', 0, 'It heats for exactly the time you choose. A rule, not intelligence.']]],
        ['🌆', 'Evening', '#e5dbff', '#f3f0ff', [
          ['📸', 'Photo app that finds every picture of your dog', 1, 'Image-recognition AI learned what dogs look like from many labeled photos.'],
          ['💡', 'Light switch', 0, 'Flip it and the circuit connects. No smarts involved.']]],
        ['🌙', 'Night', '#dbe4ff', '#edf2ff', [
          ['🗣️', 'Voice assistant that answers “What’s the weather?”', 1, 'Speech-recognition AI turns your voice into words, then the assistant looks up the answer.'],
          ['📧', 'Email app that moves junk mail to spam', 1, 'Spam filters learn from millions of emails that people marked as spam.']]],
      ];
      var total = 0; scenes.forEach(function (s) { total += s[4].length; });
      var found = 0, right = 0, answered = {};
      el.innerHTML = '<span class="day-score" id="day-score" aria-live="polite"></span><div class="day">' + scenes.map(function (s, si) {
        return '<div class="day-scene" style="--sky1:' + s[2] + ';--sky2:' + s[3] + '"><h3><span aria-hidden="true">' + s[0] + '</span>' + s[1] + '</h3><div class="day-items">' +
          s[4].map(function (it, ii) { return '<button type="button" class="day-item" data-k="' + si + '-' + ii + '"><span class="e" aria-hidden="true">' + it[0] + '</span><span>' + it[1] + '<span class="tag"></span></span></button>'; }).join('') +
          '</div><div class="day-pop-slot"></div></div>';
      }).join('') + '</div><p class="feedback" id="day-end" aria-live="polite"></p>';
      function score() { D.$('#day-score', el).textContent = '🔎 Checked ' + found + ' / ' + total + ' · ✅ ' + right + ' right'; }
      score();
      D.$all('.day-item', el).forEach(function (b) {
        b.addEventListener('click', function () {
          var k = b.getAttribute('data-k'); if (answered[k]) return;
          var p = k.split('-'), it = scenes[+p[0]][4][+p[1]];
          var slot = b.closest('.day-scene').querySelector('.day-pop-slot');
          slot.innerHTML = '<div class="day-pop"><p><b>' + it[1] + '</b> — AI or not?</p><div class="row"><button type="button" class="btn small" data-v="1">🤖 AI inside</button><button type="button" class="btn small" data-v="0">🔧 Plain machine</button></div></div>';
          var first = slot.querySelector('button'); first.focus();
          D.$all('button', slot).forEach(function (c) {
            c.addEventListener('click', function () {
              answered[k] = true; found++;
              var ok = +c.getAttribute('data-v') === it[2]; if (ok) right++;
              b.classList.add(it[2] ? 'ai' : 'plain');
              b.querySelector('.tag').textContent = (it[2] ? '🤖 AI inside' : '🔧 Plain machine') + (ok ? ' ✓' : ' — you said ' + (it[2] ? 'plain' : 'AI'));
              slot.innerHTML = '<div class="day-pop"><p>' + (ok ? '✅ ' : '❌ ') + it[3] + '</p></div>';
              D.sfx(ok ? 'good' : 'bad'); score();
              if (found === total) {
                var end = D.$('#day-end', el);
                end.className = 'feedback ok';
                end.innerHTML = 'You found them all — ' + right + ' of ' + total + ' judged right. That’s 7 AIs in one ordinary day! AI is already part of your life, so understanding it is a superpower.';
                api.done();
              }
            });
          });
        });
      });
    },
  },
  quiz: [
    { q: 'Which of these uses AI?', a: ['A phone that unlocks when it recognizes your face', 'A light switch', 'A calculator', 'An alarm clock set for 7:00'], c: 0, why: 'Recognizing a face — from new angles, in different light — takes learned patterns. The others just follow fixed rules.' },
    { q: 'How does a video app guess what you might like?', a: ['It finds patterns in what you and similar viewers watched', 'It asks your friends', 'It picks totally at random', 'A person watches everything with you'], c: 0, why: 'Recommendation systems learn from what millions of people watched, liked and skipped, then predict what you’ll enjoy.' },
    { q: 'Why isn’t a simple alarm clock AI?', a: ['It follows one fixed rule — it doesn’t recognize, predict or learn anything', 'It’s too small', 'It doesn’t use electricity', 'AI can’t tell time'], c: 0, why: 'Being automatic isn’t the same as being intelligent. “Ring at 7:00” is a single rule.' },
    { q: 'You type “basketball” and your keyboard suggests “practice”. What is it doing?', a: ['Predicting a likely next word from patterns in lots of text', 'Reading your mind', 'Copying your friend’s messages', 'Guessing totally at random'], c: 0, why: 'It learned which words often come next. Chatbots use a much bigger version of the same idea!' },
  ],
  challenge: {
    title: 'Where Did It Learn That?',
    intro: 'Every AI learned from data. Match each AI to the data it learned from: tap an AI, then tap its data. Then answer the final riddle.',
    css: `
.mt{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.mt-col{display:grid;gap:8px;align-content:start}
.mt button{min-height:64px;text-align:left;padding:10px;border-radius:12px;border:2px solid var(--line);background:var(--bg);font:600 .92rem/1.3 var(--font-body);cursor:pointer;color:var(--ink)}
.mt button[aria-pressed="true"]{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent)}
.mt button.matched{background:var(--good-bg);border-color:var(--good);color:#0d3b22;cursor:default}
.mt-riddle{margin-top:14px}
`,
    js: function (el, api) {
      var D = api.D;
      var pairs = [
        ['📱 Face unlock', 'Many photos of faces'],
        ['🗺️ Traffic predictions', 'Records of past trips and traffic speeds'],
        ['⌨️ Next-word suggestions', 'Huge amounts of written text'],
        ['📺 Video recommendations', 'What millions of viewers watched and liked'],
        ['📧 Spam filter', 'Emails that people marked as spam'],
      ];
      var right = D.shuffle(pairs.map(function (p, i) { return i; }));
      var sel = null, matched = 0, misses = 0;
      el.innerHTML = '<div class="mt"><div class="mt-col" aria-label="AI systems">' + pairs.map(function (p, i) { return '<button type="button" data-a="' + i + '" aria-pressed="false">' + p[0] + '</button>'; }).join('') +
        '</div><div class="mt-col" aria-label="Training data">' + right.map(function (i) { return '<button type="button" data-d="' + i + '">' + pairs[i][1] + '</button>'; }).join('') + '</div></div><p class="feedback" id="mt-fb" aria-live="polite"></p><div id="mt-riddle" class="mt-riddle"></div>';
      var fb = D.$('#mt-fb', el);
      D.$all('[data-a]', el).forEach(function (b) {
        b.addEventListener('click', function () {
          if (b.classList.contains('matched')) return;
          sel = +b.getAttribute('data-a');
          D.$all('[data-a]', el).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          fb.textContent = 'Now tap the data it learned from.'; fb.className = 'feedback';
        });
      });
      D.$all('[data-d]', el).forEach(function (b) {
        b.addEventListener('click', function () {
          if (b.classList.contains('matched')) return;
          if (sel == null) { fb.textContent = 'Tap an AI on the left first.'; return; }
          var d = +b.getAttribute('data-d');
          if (d === sel) {
            matched++; b.classList.add('matched'); b.disabled = true;
            var a = D.$('[data-a="' + sel + '"]', el); a.classList.add('matched'); a.disabled = true; a.setAttribute('aria-pressed', 'false');
            fb.className = 'feedback ok'; fb.textContent = '✅ Match! ' + pairs[sel][0].slice(2) + ' learned from ' + pairs[sel][1].toLowerCase() + '.'; D.sfx('good'); sel = null;
            if (matched === pairs.length) riddle();
          } else { misses++; fb.className = 'feedback no'; fb.textContent = '❌ Not that one — think about what the AI needs to see lots of.'; D.sfx('bad'); }
        });
      });
      function riddle() {
        var r = D.$('#mt-riddle', el);
        r.innerHTML = '<p><b>Final riddle:</b> A huge snowstorm hits your city — the first one in 50 years. The map app’s arrival time is way off. Why?</p>' +
          '<div class="qz-choices"><button type="button" class="qz-choice" data-v="0">The app is broken and needs a new phone</button><button type="button" class="qz-choice" data-v="1">It learned from past trips, and it has almost never seen traffic like this</button><button type="button" class="qz-choice" data-v="0">Snow blocks all phone signals</button></div><p class="feedback" aria-live="polite"></p>';
        D.$all('.qz-choice', r).forEach(function (c) {
          c.addEventListener('click', function () {
            var f = r.querySelector('.feedback');
            if (c.getAttribute('data-v') === '1') {
              c.classList.add('right'); f.className = 'feedback ok';
              f.textContent = '✅ Exactly. AI learns patterns from its data. Rare situations it has barely seen are where it’s most likely to be wrong. (Matches: ' + misses + ' miss' + (misses === 1 ? '' : 'es') + '.)';
              D.$all('.qz-choice', r).forEach(function (x) { x.disabled = true; });
              api.done();
            } else { c.classList.add('wrong'); c.disabled = true; f.className = 'feedback no'; f.textContent = 'Not quite. Think about where the app’s “knowledge” comes from.'; D.sfx('bad'); }
          });
        });
      }
    },
  },
};
