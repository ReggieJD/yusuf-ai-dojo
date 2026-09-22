module.exports = {
  hook: 'Some people say AI is magic. Others say it’s a monster. A true ninja sees clearly. Time to bust some myths.',
  story: [
    ['sensei', 'Every day you’ll hear wild things about AI, {{nick}}. “AI knows everything!” “AI has feelings!” “AI will take over tomorrow!”'],
    ['sensei', 'Some of it is true. A lot of it is <b>hype</b>: claims that make AI sound more amazing, or scarier, than it really is.'],
    ['you', 'So how do I tell the difference?'],
    ['sensei', 'The way {{T.hero}} studies an opponent: calmly, with evidence. AI is powerful and useful. It’s also made of math, code and data, and it makes mistakes.'],
    ['sensei', 'Grab your myth-busting hammer. Every statement is either a <b>MYTH</b> or a <b>FACT</b>.'],
  ],
  activity: {
    title: 'Myth Busters',
    instructions: 'Read each statement. Smash 💥 MYTH or stamp ✅ FACT. Bust all 10!',
    css: `
.mb{max-width:560px;margin:0 auto}
.mb-card{position:relative;border-radius:18px;border:3px dashed var(--ink);background:var(--card);padding:26px 18px;min-height:170px;display:grid;place-items:center;text-align:center;overflow:hidden}
.mb-card p{font:700 1.25rem/1.35 var(--font-head);margin:0}
.mb-stamp{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-14deg) scale(1);font:900 2.4rem/1 var(--font-head);padding:6px 18px;border:5px solid;border-radius:10px;opacity:.9;letter-spacing:.08em;animation:stamp .35s ease-out}
.mb-stamp.myth{color:#b8241b;border-color:#b8241b;background:#fff8}
.mb-stamp.fact{color:#1b7f4b;border-color:#1b7f4b;background:#fff8}
@keyframes stamp{from{transform:translate(-50%,-50%) rotate(-14deg) scale(2.2);opacity:0}}
.mb-btns{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
.mb-btns .btn{min-height:60px;font-size:1.1rem}
.mb-why{margin-top:12px;padding:12px;border-radius:12px;background:var(--bg2);min-height:3em}
.mb-meter{display:flex;gap:4px;margin-bottom:10px}.mb-meter i{flex:1;height:10px;border-radius:5px;background:var(--line)}.mb-meter i.ok{background:var(--good)}.mb-meter i.no{background:var(--bad)}
`,
    js: function (el, api) {
      var D = api.D;
      var S = [
        ['AI is always right.', 0, 'AI makes mistakes, and sometimes it sounds very confident while it’s wrong. Double-check anything important.'],
        ['A lot of AI learns from data made by people.', 1, 'Photos, writing, clicks and ratings: much of AI learns from human-made data, including our mistakes and unfairness.'],
        ['Today’s AI has feelings, just like you.', 0, 'AI can talk about feelings because it learned from human writing. Scientists have no evidence that today’s AI actually feels anything.'],
        ['AI can be unfair or biased.', 1, 'If the data is unbalanced or unfair, the AI can learn that unfairness. That’s why testing for fairness matters.'],
        ['Robots and AI are the same thing.', 0, 'A robot is a machine body. AI is software. Many AIs, like chatbots, have no body, and many robots use no AI at all.'],
        ['AI is built from math, code and data.', 1, 'No magic inside! Just lots of numbers, clever algorithms and data.'],
        ['AI can make up “facts” that sound true.', 1, 'Chatbots can produce false information in a confident voice. You’ll learn why in the Brown Belt.'],
        ['AI is already better than humans at everything.', 0, 'AI beats humans at some narrow tasks, like chess. But it still struggles with many things people find easy.'],
        ['Using AI to learn is great — if you still think for yourself.', 1, 'AI can explain, quiz and inspire you. But if it does all your thinking, your brain doesn’t get stronger.'],
        ['Training big AI models takes huge amounts of computing power and electricity.', 1, 'Big models are trained in data centers packed with powerful computers running for weeks or longer.'],
      ];
      var order = D.shuffle(S), i = 0, marks = [], right = 0, busy = false, sv = api.load();
      if (sv.order && sv.order.length === S.length) {
        var o2 = sv.order.map(function (t) { return S.filter(function (x) { return x[0] === t; })[0]; });
        if (o2.every(Boolean)) { order = o2; i = sv.i || 0; right = sv.right || 0; marks = sv.marks || []; }
      }
      function persist() { api.save({ order: order.map(function (x) { return x[0]; }), i: i, right: right, marks: marks }); }
      function show() {
        if (i >= order.length) return end();
        busy = false;
        el.innerHTML = '<div class="mb"><div class="mb-meter" aria-hidden="true">' + order.map(function (_, k) { return '<i class="' + (marks[k] || '') + '"></i>'; }).join('') + '</div>' +
          '<div class="mb-card" id="mb-card"><p>“' + order[i][0] + '”</p></div>' +
          '<div class="mb-btns"><button type="button" class="btn" data-v="0">💥 MYTH</button><button type="button" class="btn primary" data-v="1">✅ FACT</button></div><div class="mb-why" id="mb-why" aria-live="polite">Statement ' + (i + 1) + ' of ' + order.length + '</div></div>';
        D.$all('.mb-btns button', el).forEach(function (b) { b.addEventListener('click', function () { pick(+b.getAttribute('data-v')); }); });
      }
      function pick(v) {
        if (busy) return; busy = true;
        var s = order[i], ok = v === s[1]; if (ok) right++; marks[i] = ok ? 'ok' : 'no';
        i++; persist(); i--;
        D.$('#mb-card', el).insertAdjacentHTML('beforeend', '<span class="mb-stamp ' + (s[1] ? 'fact' : 'myth') + '" aria-hidden="true">' + (s[1] ? 'FACT' : 'BUSTED') + '</span>');
        D.$all('.mb-btns button', el).forEach(function (x) { x.disabled = true; });
        D.$('#mb-why', el).innerHTML = (ok ? '✅ <b>Right!</b> ' : '❌ <b>That’s a ' + (s[1] ? 'fact' : 'myth') + '.</b> ') + s[2] + ' <button type="button" class="btn small primary" id="mb-next">' + (i + 1 < order.length ? 'Next →' : 'Finish') + '</button>';
        D.sfx(ok ? 'good' : 'bad');
        var n = D.$('#mb-next', el); n.focus(); n.addEventListener('click', function () { i++; show(); });
      }
      function end() {
        el.innerHTML = '<div class="mb"><div class="mb-card"><p>🔨 You busted ' + right + ' of ' + order.length + '!<br><span style="font-weight:600;font-size:1rem">Clear eyes. No hype. No fear. That’s the ninja way.</span></p></div><p class="row" style="justify-content:center;margin-top:12px"><button type="button" class="btn small" id="mb-again">↻ Play again</button></p></div>';
        D.$('#mb-again', el).addEventListener('click', function () { order = D.shuffle(S); i = 0; marks = []; right = 0; persist(); show(); });
        api.done();
      }
      show();
    },
  },
  quiz: [
    { q: 'Is every robot an AI?', a: ['No — a robot is a machine body, and it may or may not use AI', 'Yes, always', 'Only if it can talk', 'Only if it’s made of metal'], c: 0, why: 'Robots are bodies; AI is software. A factory arm that repeats one motion isn’t AI, and a chatbot is AI with no body.' },
    { q: 'Why might an AI system be unfair?', a: ['It learned from data that was unbalanced or unfair', 'AI is mean on purpose', 'Computers dislike people', 'AI can never be unfair'], c: 0, why: 'AI learns patterns from its data. If the data is unfair, the patterns can be too.' },
    { q: 'A headline says: “AI Is Now Smarter Than Humans At EVERYTHING!” This is…', a: ['Hype — AI is great at some narrow tasks but struggles with many others', 'Totally true', 'A proven scientific fact', 'Impossible to judge'], c: 0, why: 'Watch for words like EVERYTHING, ALWAYS, NEVER. Real progress is impressive, but it’s narrower than hype suggests.' },
    { q: 'Which is TRUE about today’s AI?', a: ['It can make up facts that sound true', 'It is always right', 'It has feelings like people', 'It doesn’t need any data'], c: 0, why: 'AI can be confidently wrong. That’s why fact-checking is a key AI skill.' },
  ],
  challenge: {
    title: 'Hype Detector',
    intro: 'Headlines can be tricky. Label each one <b>🚨 Hype</b> or <b>👍 Accurate</b>. Get 5 of 6 to win.',
    css: `.hd{display:grid;gap:10px}.hd-item{border:2px solid var(--line);border-radius:12px;padding:12px;background:var(--bg)}.hd-item p{margin:0 0 8px;font:700 1.02rem/1.35 var(--font-head)}.hd-item .row button{flex:1}.hd-item.ok{border-color:var(--good)}.hd-item.no{border-color:var(--bad)}.hd-why{font-size:.93rem;margin-top:6px}`,
    js: function (el, api) {
      var D = api.D;
      var H = [
        ['“AI ROBOTS WILL REPLACE EVERY TEACHER BY NEXT YEAR!”', 'h', 'ALL-CAPS, “every,” and a super-short timeline are hype alarms. AI may change jobs, but claims like this aren’t backed by evidence.'],
        ['“Study finds AI tool helped doctors spot some diseases in scans, but it still made mistakes”', 'a', 'Specific, balanced, and it mentions limits. That’s how careful reporting sounds.'],
        ['“This AI Is Basically a Human Brain!!”', 'h', 'AI neurons are loosely inspired by brains, but today’s AI works very differently from a human brain.'],
        ['“Chess engines have been stronger than the best human players for years”', 'a', 'True. Since Deep Blue beat Kasparov in 1997, engines have become far stronger than any human.'],
        ['“New AI can read your mind through your phone screen”', 'h', 'No AI can read your thoughts through a screen. Big, spooky claims need big evidence.'],
        ['“Chatbots can write fluent text but sometimes invent false information”', 'a', 'Accurate and balanced: a strength AND a weakness.'],
      ];
      var n = 0, r = 0;
      function render(fresh) {
        n = 0; r = 0; if (fresh) api.save({ ans: {} });
        el.innerHTML = '<div class="hd">' + H.map(function (h, i) { return '<div class="hd-item" data-i="' + i + '"><p>' + h[0] + '</p><div class="row"><button type="button" class="btn small" data-v="h">🚨 Hype</button><button type="button" class="btn small" data-v="a">👍 Accurate</button></div><div class="hd-why" aria-live="polite"></div></div>'; }).join('') + '</div><p class="feedback" id="hd-sum" aria-live="polite"></p>';
        D.$all('.hd-item button', el).forEach(function (b) {
          b.addEventListener('click', function () {
            var box = b.closest('.hd-item'), h = H[+box.getAttribute('data-i')];
            if (box.classList.contains('ok') || box.classList.contains('no')) return;
            var ok = b.getAttribute('data-v') === h[1]; n++; if (ok) r++;
            var A = api.load().ans || {}; A[box.getAttribute('data-i')] = b.getAttribute('data-v'); api.save({ ans: A });
            box.classList.add(ok ? 'ok' : 'no'); D.$all('button', box).forEach(function (x) { x.disabled = true; });
            box.querySelector('.hd-why').innerHTML = (ok ? '✅ ' : '❌ ') + h[2]; D.sfx(ok ? 'good' : 'bad');
            if (n === H.length) {
              var s = D.$('#hd-sum', el);
              if (r >= 5) { s.className = 'feedback ok'; s.textContent = r + '/6 — your hype detector is finely tuned!'; api.done(); }
              else { s.className = 'feedback no'; s.innerHTML = r + '/6. Look for exaggeration words, then <button type="button" class="btn small" id="hd-again">try again</button>'; D.$('#hd-again', el).addEventListener('click', function () { render(true); }); }
            }
          });
        });
      }
      render();
      var A0 = api.load().ans || {};
      Object.keys(A0).forEach(function (i) { var b = D.$('.hd-item[data-i="' + i + '"] button[data-v="' + A0[i] + '"]', el); if (b) b.click(); });
    },
  },
};
