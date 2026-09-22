module.exports = {
  hook: 'Companies stick “AI” labels on everything. Can you tell the real AI from the ordinary machines?',
  story: [
    ['narr', '🕵️ CASE FILE #3: The Mystery of the Fake AIs'],
    ['sensei', 'Detective {{nick}}, we have a problem. Everything in the market is suddenly labeled “AI-powered”: toasters, toothbrushes, even water bottles.'],
    ['you', 'So how do I know what’s really AI?'],
    ['sensei', 'Use the sensei’s test. Ask: <b>does it recognize, predict, decide or create using patterns?</b> Or does it just follow one fixed rule?'],
    ['sensei', 'Remember: <b>automatic</b> is not the same as <b>intelligent</b>. And looking like a robot proves nothing. Sort the evidence!'],
  ],
  activity: {
    title: 'The AI Sorting Machine',
    instructions: 'A card slides in. Sort it: 🤖 AI or 🔧 Not AI. On a keyboard, use ← for Not AI and → for AI. On a touchscreen, you can swipe.',
    css: `
.sm{max-width:520px;margin:0 auto;text-align:center}
.sm-bar{display:flex;justify-content:space-between;font-weight:800;margin-bottom:10px}
.sm-stage{position:relative;height:230px;perspective:800px}
.sm-card{position:absolute;inset:0;margin:auto;width:min(100%,340px);height:210px;border-radius:22px;background:var(--card);border:3px solid var(--ink);box-shadow:0 10px 0 var(--ink);display:flex;flex-direction:column;justify-content:center;align-items:center;padding:18px;gap:6px;touch-action:pan-y;user-select:none;animation:smIn .35s ease-out;transition:transform .3s, opacity .3s}
.sm-card .e{font-size:3.2rem}
.sm-card p{font-weight:800;font-size:1.15rem;margin:0}
.sm-card.left{transform:translateX(-140%) rotate(-18deg);opacity:0}.sm-card.right{transform:translateX(140%) rotate(18deg);opacity:0}
@keyframes smIn{from{transform:translateY(-30px) scale(.9);opacity:0}}
.sm-btns{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
.sm-btns .btn{min-height:64px;font-size:1.1rem}
.sm-why{min-height:4.5em;margin-top:12px;padding:10px;border-radius:12px}
.sm-why.ok{background:var(--good-bg);color:#0d3b22}.sm-why.no{background:var(--bad-bg);color:#5c130e}
.sm-bins{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px;text-align:left;font-size:.85rem}
.sm-bins div{background:var(--bg2);border-radius:12px;padding:8px;min-height:60px}
`,
    js: function (el, api) {
      var D = api.D;
      var cards = D.shuffle([
        ['🚪', 'Automatic doors that open when you walk up', 0, 'A motion sensor plus one rule: “someone’s close → open”. Automatic, but not intelligent.'],
        ['🌡️', 'A thermostat that learns your family’s schedule', 1, 'It learns patterns from when you’re home and predicts when to heat or cool.'],
        ['🧸', 'A wind-up toy robot that walks forward', 0, 'It LOOKS like a robot, but a spring isn’t intelligence. Looks don’t make something AI!'],
        ['🧹', 'A robot vacuum that maps rooms and avoids socks', 1, 'Many robot vacuums build a map of your home, and some use cameras with AI to recognize obstacles.'],
        ['♟️', 'A chess app that chooses its own moves', 1, 'Chess AI searches through possible moves and scores positions to decide what to play.'],
        ['🕰️', 'A digital clock', 0, 'It counts seconds with a steady electronic beat. Precise, but no smarts.'],
        ['📷', 'A camera app that translates a sign in another language', 1, 'It recognizes the letters in the image, then an AI translation model translates them.'],
        ['📺', 'A TV remote', 0, 'Press a button, send a signal. That’s it.'],
        ['✍️', 'A chatbot that writes a story for you', 1, 'It generates new text by predicting words, using patterns learned from huge amounts of writing.'],
        ['🛗', 'Elevator buttons', 0, 'Press 5, go to floor 5. A simple rule.'],
        ['🎵', 'A music app that builds a playlist for your mood', 1, 'It learns from what you and others listen to and recommends songs that fit.'],
        ['🥤', 'A vending machine that drops a snack when you pay', 0, 'Coin in, snack out: fixed rules.'],
      ]);
      var i = 0, right = 0, streak = 0, best = 0, busy = false, bins = { 1: [], 0: [] };
      var ALL = cards.slice(), S = api.load();
      if (S.order && S.order.length === ALL.length) { cards = S.order.map(function (t) { return ALL.filter(function (c) { return c[1] === t; })[0]; }).filter(Boolean); if (cards.length !== ALL.length) cards = ALL; else { i = S.i || 0; right = S.right || 0; best = S.best || 0; bins = S.bins || bins; } }
      function persist() { api.save({ order: cards.map(function (c) { return c[1]; }), i: i, right: right, best: best, bins: bins }); }
      el.innerHTML = '<div class="sm"><div class="sm-bar"><span id="sm-n"></span><span id="sm-streak"></span></div><div class="sm-stage" id="sm-stage"></div>' +
        '<div class="sm-btns"><button type="button" class="btn" id="sm-no">🔧 Not AI</button><button type="button" class="btn primary" id="sm-yes">🤖 AI</button></div>' +
        '<div class="sm-why" id="sm-why" aria-live="polite"></div><div class="sm-bins"><div><b>🔧 Not AI</b><div id="sm-b0"></div></div><div><b>🤖 AI</b><div id="sm-b1"></div></div></div></div>';
      var stage = D.$('#sm-stage', el), why = D.$('#sm-why', el);
      function show() {
        D.$('#sm-n', el).textContent = 'Card ' + Math.min(i + 1, cards.length) + ' / ' + cards.length + ' · ✅ ' + right;
        D.$('#sm-streak', el).textContent = streak > 1 ? '🔥 ' + streak + ' in a row' : '';
        if (i >= cards.length) return end();
        var c = cards[i];
        stage.innerHTML = '<div class="sm-card" id="sm-card"><span class="e" aria-hidden="true">' + c[0] + '</span><p>' + c[1] + '</p></div>';
        swipe(D.$('#sm-card', el)); busy = false;
      }
      function answer(v) {
        if (busy || i >= cards.length) return; busy = true;
        var c = cards[i], ok = v === c[2];
        if (ok) { right++; streak++; best = Math.max(best, streak); D.sfx('good'); } else { streak = 0; D.sfx('bad'); }
        why.className = 'sm-why ' + (ok ? 'ok' : 'no');
        why.innerHTML = (ok ? '✅ <b>Correct!</b> ' : '❌ <b>It’s ' + (c[2] ? 'AI' : 'not AI') + '.</b> ') + c[3];
        bins[c[2]].push(c[0]); D.$('#sm-b' + c[2], el).textContent = bins[c[2]].join(' ');
        var card = D.$('#sm-card', el); if (card) card.classList.add(v ? 'right' : 'left');
        i++; persist(); setTimeout(show, D.reducedMotion() ? 50 : 380);
      }
      function end() {
        stage.innerHTML = '<div class="sm-card" style="animation:none"><span class="e" aria-hidden="true">' + (right >= 10 ? '🏆' : '🕵️') + '</span><p>Case closed! ' + right + ' / ' + cards.length + '</p><p style="font-weight:600;font-size:.95rem">Best streak: ' + best + '</p><button type="button" class="btn small" id="sm-again">↻ Sort again</button></div>';
        D.$('#sm-again', el).addEventListener('click', function () { cards = D.shuffle(cards); i = 0; right = 0; streak = 0; bins = { 1: [], 0: [] }; persist(); D.$('#sm-b0', el).textContent = ''; D.$('#sm-b1', el).textContent = ''; why.textContent = ''; why.className = 'sm-why'; show(); });
        api.done();
      }
      function swipe(card) {
        var x0 = null;
        card.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
        card.addEventListener('pointermove', function (e) { if (x0 == null) return; var dx = e.clientX - x0; card.style.transform = 'translateX(' + dx + 'px) rotate(' + dx / 12 + 'deg)'; });
        function up(e) { if (x0 == null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 80) answer(dx > 0 ? 1 : 0); else card.style.transform = ''; }
        card.addEventListener('pointerup', up); card.addEventListener('pointercancel', function () { x0 = null; card.style.transform = ''; });
      }
      D.$('#sm-yes', el).addEventListener('click', function () { answer(1); });
      D.$('#sm-no', el).addEventListener('click', function () { answer(0); });
      el.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { answer(1); e.preventDefault(); } if (e.key === 'ArrowLeft') { answer(0); e.preventDefault(); } });
      D.$('#sm-b0', el).textContent = bins[0].join(' '); D.$('#sm-b1', el).textContent = bins[1].join(' ');
      if (i > 0 && i < cards.length) { why.className = 'sm-why'; why.textContent = '💾 Welcome back! You’d sorted ' + i + ' cards.'; }
      show();
    },
  },
  quiz: [
    { q: 'A toy looks exactly like a robot, but it can only walk forward when you wind it up. Is it AI?', a: ['No — looking like a robot doesn’t make something AI', 'Yes — all robots are AI', 'Yes — it moves by itself', 'Only if it has flashing lights'], c: 0, why: 'AI is about what a system can do — recognize, predict, decide, create — not what it looks like.' },
    { q: 'Which clue BEST suggests something uses AI?', a: ['It recognizes, predicts or decides using patterns learned from data', 'It uses electricity', 'It has a screen', 'It’s expensive'], c: 0, why: 'Lots of machines use electricity and screens. The AI clue is learned patterns used to recognize, predict, decide or create.' },
    { q: 'Automatic doors open all by themselves. Why aren’t they usually called AI?', a: ['They follow one simple rule: sensor detects motion → open', 'They’re too slow', 'They’re made of glass', 'Doors can never use AI'], c: 0, why: 'Automatic ≠ intelligent. A sensor plus one rule is automation, not AI.' },
    { q: 'A company says its toaster is “AI-powered”. What should a smart thinker do?', a: ['Ask what it actually recognizes, predicts or learns — a label alone doesn’t prove it', 'Believe it — companies are always right', 'Assume it’s dangerous', 'Throw the toaster away'], c: 0, why: '“AI” is a popular marketing word. Ask what the product really does before you believe the label.' },
  ],
  challenge: {
    title: 'The Gray Zone',
    intro: 'Real life isn’t always black and white. For each item choose <b>AI</b>, <b>Not AI</b> or <b>It depends!</b> Get 4 of 5 to win.',
    css: `.gz{display:grid;gap:12px}.gz-item{padding:12px;border-radius:12px;border:2px solid var(--line);background:var(--bg)}.gz-item p{margin:0 0 8px;font-weight:700}.gz-item .row button{flex:1;min-width:90px}.gz-item.ok{border-color:var(--good)}.gz-item.no{border-color:var(--bad)}.gz-why{margin-top:8px;font-size:.93rem}`,
    js: function (el, api) {
      var D = api.D;
      var items = [
        ['👾 An enemy in a video game that chases you', 'd', 'Game designers call it “AI”, but it’s usually hand-written rules like “if the player is close, chase”. That’s not machine learning. A few newer games do use learning, so: it depends!'],
        ['💡 A “smart” light that turns on at sunset', 'n', 'It follows a schedule rule. The word “smart” in a product name doesn’t mean AI.'],
        ['📝 A spell-checker', 'd', 'Old spell-checkers just compared your words to a dictionary list (rules). Many modern ones use machine learning to guess what you meant. It depends on the checker!'],
        ['🏭 A factory robot arm that welds the same spot all day', 'n', 'Many factory robots just repeat exact programmed motions. Impressive machines, but not AI.'],
        ['🔎 A web search engine that ranks the best results', 'a', 'Modern search engines use machine learning to understand your question and rank pages.'],
      ];
      var done = 0, right = 0;
      function render(fresh) {
        done = 0; right = 0; if (fresh) api.save({ ans: {} });
        el.innerHTML = '<div class="gz">' + items.map(function (it, i) {
          return '<div class="gz-item" data-i="' + i + '"><p>' + it[0] + '</p><div class="row"><button type="button" class="btn small" data-v="a">🤖 AI</button><button type="button" class="btn small" data-v="n">🔧 Not AI</button><button type="button" class="btn small" data-v="d">🤔 It depends!</button></div><div class="gz-why" aria-live="polite"></div></div>';
        }).join('') + '</div><p class="feedback" id="gz-sum" aria-live="polite"></p>';
        D.$all('.gz-item button', el).forEach(function (b) {
          b.addEventListener('click', function () {
            var box = b.closest('.gz-item'), it = items[+box.getAttribute('data-i')];
            if (box.classList.contains('ok') || box.classList.contains('no')) return;
            var ok = b.getAttribute('data-v') === it[1]; done++; if (ok) right++;
            var A = api.load().ans || {}; A[box.getAttribute('data-i')] = b.getAttribute('data-v'); api.save({ ans: A });
            box.classList.add(ok ? 'ok' : 'no'); D.$all('button', box).forEach(function (x) { x.disabled = true; });
            box.querySelector('.gz-why').innerHTML = (ok ? '✅ ' : '❌ Best answer: <b>' + { a: 'AI', n: 'Not AI', d: 'It depends' }[it[1]] + '</b>. ') + it[2];
            D.sfx(ok ? 'good' : 'bad');
            if (done === items.length) {
              var s = D.$('#gz-sum', el);
              if (right >= 4) { s.className = 'feedback ok'; s.textContent = right + '/5 — you can handle the gray zone. That’s expert-level thinking.'; api.done(); }
              else { s.className = 'feedback no'; s.innerHTML = right + '/5. Read the explanations and <button type="button" class="btn small" id="gz-again">try again</button>'; D.$('#gz-again', el).addEventListener('click', function () { render(true); }); }
            }
          });
        });
      }
      render();
      var A0 = api.load().ans || {};
      Object.keys(A0).forEach(function (i) { var b = D.$('.gz-item[data-i="' + i + '"] button[data-v="' + A0[i] + '"]', el); if (b) b.click(); });
    },
  },
};
