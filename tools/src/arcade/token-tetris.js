const PROMPTS = [
  ['The goalkeeper dove and caught the', 'ball', ['banana', 'Tuesday']],
  ['Checkmate! The king has nowhere to', 'go', ['sandwich', 'purple']],
  ['He dribbled past two defenders and scored a', 'goal', ['pillow', 'cloud']],
  ['After school I practice my karate', 'kicks', ['spoons', 'windows']],
  ['The referee blew the', 'whistle', ['pancake', 'giraffe']],
  ['She shot the basketball and it went through the', 'hoop', ['toaster', 'moon']],
  ['Once upon a', 'time', ['keyboard', 'melon']],
  ['Peanut butter and', 'jelly', ['homework', 'socks']],
  ['The early bird catches the', 'worm', ['bus', 'Wi-Fi']],
  ['I opened my laptop and typed my', 'password', ['elbow', 'volcano']],
  ['In chess, the horse-shaped piece is called the', 'knight', ['duck', 'spoon']],
  ['To bow before class, I stepped onto the', 'mat', ['ceiling', 'noodle']],
  ['The crowd cheered when the final buzzer', 'sounded', ['swam', 'baked']],
  ['Thank you very', 'much', ['orange', 'soccer']],
  ['The sun rises in the', 'east', ['fridge', 'shoe']],
  ['My app crashed, so I read the error', 'message', ['giraffe', 'pizza']],
  ['Brush your', 'teeth', ['clouds', 'goals']],
  ['The AI predicts the next', 'word', ['elephant', 'sock']],
  ['A black belt takes years of hard', 'work', ['cheese', 'rain']],
  ['Ready, set,', 'go', ['lamp', 'seven']],
  ['He moved his pawn two squares on the first', 'move', ['nap', 'tree']],
  ['Happy birthday to', 'you', ['broccoli', 'Wi-Fi']],
  ['The soccer team wore matching', 'jerseys', ['volcanoes', 'clouds']],
  ['Knock knock. Who’s', 'there', ['pancake', 'Mars']],
];
module.exports = {
  data: PROMPTS,
  how: 'A sentence appears and three tokens fall. Tap the one a language model would most likely predict next, before it hits the stack. Wrong taps, or letting the right token land, add a block to your stack. 5 blocks and it’s over. Survive 20 sentences to win. Keys 1, 2, 3 work too.',
  connect: 'Chatbots write by <b>next-token prediction</b>: they look at the words so far and give every possible next token a probability, then pick one. The likely token wins most of the time. That’s why chatbots sound fluent. It’s also why they can sound confident when they’re wrong.',
  css: `
.tt-prompt{background:#0b0620;border-radius:12px;padding:10px 12px;font-weight:800;font-size:1.05rem;min-height:3em}
.tt-prompt i{color:#ff5edb;font-style:normal}
.tt-well{position:relative;height:300px;margin-top:10px;border:2px solid #5ef2ff55;border-radius:12px;overflow:hidden;background:linear-gradient(#5ef2ff08 1px,transparent 1px) 0 0/100% 30px}
.tt-lane{position:absolute;top:0;bottom:0;width:33.33%}
.tt-lane+.tt-lane{border-left:1px dashed #5ef2ff33}
.tt-tok{position:absolute;left:6%;width:88%;min-height:48px;border-radius:10px;border:2px solid #5ef2ff;background:#1c1240;color:#f4f0ff;font:800 1rem ui-monospace,Menlo,monospace;cursor:pointer;padding:4px}
.tt-tok small{display:block;color:#c3b8ea;font-size:.7rem}
.tt-stack{position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column-reverse}
.tt-block{height:26px;margin:1px 4px;border-radius:6px;background:#ff6b8a44;border:1px solid #ff6b8a;font:700 .75rem ui-monospace,Menlo,monospace;color:#ffe0e7;display:flex;align-items:center;justify-content:center}
.tt-msg{min-height:1.5em;font-weight:700;margin-top:8px}
.tt-probs{font:600 .85rem ui-monospace,Menlo,monospace}
`,
  js: function (el, G) {
    var D = G.D, P = window.GAME_DATA || el.__data;
    var gen = el.__gen = (el.__gen || 0) + 1;
    function alive() { return el.__gen === gen && el.isConnected; }
    var lives = 5, score = 0, level = 1, n = 0, stack = 0, order = D.shuffle(P.map(function (_, i) { return i; }));
    el.innerHTML = '<div class="tt-prompt" aria-live="polite"></div><div class="tt-well"><div class="tt-lane" style="left:0"></div><div class="tt-lane" style="left:33.33%"></div><div class="tt-lane" style="left:66.66%"></div><div class="tt-stack"></div></div><p class="tt-msg" aria-live="polite"></p><p class="tt-probs"></p>';
    var well = D.$('.tt-well', el), lanes = D.$all('.tt-lane', el), stackEl = D.$('.tt-stack', el), prompt = D.$('.tt-prompt', el), msg = D.$('.tt-msg', el), probs = D.$('.tt-probs', el);
    function onKey(e) { if (!alive()) return document.removeEventListener('keydown', onKey); var k = +e.key; if (k >= 1 && k <= 3 && el.__toks) { var b = el.__toks[k - 1]; if (b) b.click(); } }
    document.addEventListener('keydown', onKey);
    function addBlock(txt) {
      stack++; lives = 5 - stack;
      stackEl.insertAdjacentHTML('beforeend', '<div class="tt-block">' + D.esc(txt) + '</div>');
      G.hud({ lives: lives });
    }
    function round() {
      if (!alive()) return;
      if (n >= 20) return G.end(score, true, '20 sentences predicted. You think like a language model, and you know its secret: likely isn’t always true.');
      if (stack >= 5) return G.end(score, false, 'Your stack hit the top. Tip: ignore how fun a word is. Ask “what word usually comes next?”');
      var p = P[order[n % order.length]]; n++;
      level = Math.min(5, 1 + Math.floor((n - 1) / 4));
      G.hud({ score: score, level: level, lives: lives });
      var toks = D.shuffle([[p[1], 1]].concat(p[2].map(function (t) { return [t, 0]; })));
      el.__ans = toks.map(function (t) { return t[1]; }).indexOf(1);
      prompt.innerHTML = '“' + D.esc(p[0]) + ' <i>___</i>”';
      probs.textContent = '';
      var speed = [40, 52, 64, 78, 92][level - 1]; // pixels per second
      var floor = well.clientHeight - stack * 28 - 52, y = 0, done = false, t0 = null;
      var btns = toks.map(function (t, i) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'tt-tok'; b.innerHTML = D.esc(t[0]) + '<small>key ' + (i + 1) + '</small>';
        b.setAttribute('aria-label', 'Token ' + (i + 1) + ': ' + t[0]);
        b.style.top = '0px';
        b.addEventListener('click', function () { finish(t[1] === 1, t[0]); });
        lanes[i].appendChild(b); return b;
      });
      el.__toks = btns;
      function finish(ok, word) {
        if (done) return; done = true; el.__toks = null;
        btns.forEach(function (b) { b.remove(); });
        var pct = [70 + Math.floor(Math.random() * 20)];
        pct.push(Math.floor((100 - pct[0]) * 0.6)); pct.push(100 - pct[0] - pct[1]);
        var others = p[2];
        probs.textContent = 'Model’s guess → ' + p[1] + ' ' + pct[0] + '% · ' + others[0] + ' ' + (pct[1] ? pct[1] : '<1') + '% · ' + others[1] + ' ' + (pct[2] ? pct[2] : '<1') + '%  (example numbers)';
        if (ok) { score += 10 + level * 2; D.sfx('good'); msg.textContent = '✅ “' + word + '” is the likely next token!'; prompt.innerHTML = '“' + D.esc(p[0]) + ' <i>' + D.esc(p[1]) + '</i>”'; }
        else { D.sfx('bad'); addBlock(word || p[1]); msg.textContent = word ? '❌ “' + word + '” is possible, but very unlikely here. The likely token was “' + p[1] + '”.' : '⏬ Too slow! The likely token “' + p[1] + '” landed.'; }
        G.hud({ score: score });
        setTimeout(round, ok ? 900 : 1600);
      }
      function frame(ts) {
        if (!alive() || done) return;
        if (t0 == null) t0 = ts;
        y = (ts - t0) / 1000 * speed;
        if (y >= floor) { y = floor; btns.forEach(function (b) { b.style.top = y + 'px'; }); return finish(false, null); }
        btns.forEach(function (b) { b.style.top = y + 'px'; });
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    round();
  },
};
