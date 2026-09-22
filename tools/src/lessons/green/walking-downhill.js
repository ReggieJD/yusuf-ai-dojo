// Shared hill renderer + walker for activity and challenge.
function hillGame(el, api, cfg) {
  var D = api.D;
  var W = 340, H = 220, X = function (x) { return 16 + (x - cfg.lo) / (cfg.hi - cfg.lo) * (W - 32); }, Y = function (y) { return H - 18 - (y - cfg.ymin) / (cfg.ymax - cfg.ymin) * (H - 40); };
  function grad(x) { var e = 1e-4; return (cfg.f(x + e) - cfg.f(x - e)) / (2 * e); }
  function draw(x, trail, note) {
    var d = ''; for (var i = 0; i <= 160; i++) { var v = cfg.lo + (cfg.hi - cfg.lo) * i / 160; d += (i ? 'L' : 'M') + X(v).toFixed(1) + ' ' + Y(Math.min(cfg.ymax, cfg.f(v))).toFixed(1); }
    var g = grad(x), dir = g > 0 ? -1 : 1, cx = X(Math.max(cfg.lo, Math.min(cfg.hi, x))), cy = Y(Math.min(cfg.ymax, cfg.f(x)));
    var tr = (trail || []).map(function (t) { return '<circle cx="' + X(Math.max(cfg.lo, Math.min(cfg.hi, t))) + '" cy="' + Y(Math.min(cfg.ymax, cfg.f(t))) + '" r="3.5" fill="#0b6e8a" opacity=".55"/>'; }).join('');
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Error landscape. The walker is at position ' + x.toFixed(2) + ' with error ' + cfg.f(x).toFixed(2) + '."><defs><linearGradient id="hg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#b8f0d2"/><stop offset="1" stop-color="#0d6b48"/></linearGradient></defs>' +
      '<path d="' + d + ' L' + X(cfg.hi) + ' ' + H + ' L' + X(cfg.lo) + ' ' + H + ' Z" fill="url(#hg)" stroke="#0d2b1d" stroke-width="2.5"/>' + tr +
      (Math.abs(g) > 0.02 ? '<line x1="' + cx + '" y1="' + (cy - 26) + '" x2="' + (cx + dir * 30) + '" y2="' + (cy - 26) + '" stroke="#ffd23f" stroke-width="4" marker-end="url(#ar)"/><marker id="ar" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#ffd23f"/></marker>' : '') +
      '<text x="' + cx + '" y="' + (cy - 4) + '" font-size="24" text-anchor="middle">' + (cfg.avatar || '🥷') + '</text>' +
      '<text x="' + (W - 12) + '" y="16" font-size="11" text-anchor="end" fill="#0d2b1d">error (loss) ↑ · position →</text>' + (note || '') + '</svg>';
  }
  return { draw: draw, grad: grad };
}

module.exports = {
  hook: 'You’re on a foggy mountain and can only feel the slope under your feet. How do you reach the bottom? That’s exactly how AI learns.',
  story: [
    ['sensei', 'Picture this, {{nick}}: you’re on a mountain in thick fog. You want to reach the lowest valley, but you can only feel the ground right under your feet.'],
    ['you', 'I’d step in whichever direction goes down.'],
    ['sensei', 'That’s the whole idea! In AI, the mountain is the <b>error</b>: how wrong the model is. Your position is the model’s <b>weights</b>. Each step downhill tweaks the weights so the model gets a little less wrong.'],
    ['sensei', 'This is called <b>gradient descent</b>. “Gradient” means slope, and “descent” means going down. The big question is how big your steps should be.'],
  ],
  activity: {
    title: 'Foggy Mountain',
    instructions: 'Pick a step size and press Step. Reach the bottom of the valley, then try a HUGE step size to see what happens.',
    css: `
.wd{background:#fff;border-radius:20px;border:2px solid #0d2b1d18;padding:8px}
.wd svg{width:100%;height:auto;display:block}
.wd-lr{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}
.wd-lr button{min-height:44px;min-width:58px;border-radius:12px;border:2px solid #0d2b1d;background:#fff;font:800 .95rem var(--font-body);cursor:pointer;color:#0d2b1d}
.wd-lr button[aria-pressed="true"]{background:#16a36b;color:#fff}
.wd-stats{display:flex;gap:10px;flex-wrap:wrap;font-weight:800}
.wd-m{background:var(--bg2);border-radius:16px;padding:10px 12px;margin-top:10px}
.wd-m .row button{flex:1 1 150px}
`,
    js: new Function('el', 'api', hillGame.toString() + `
      var D = api.D, S = api.load();
      var f = function (x) { return 0.5 * Math.pow(x - 3, 2) + 1; };
      var H = hillGame(el, api, { f: f, lo: -5, hi: 9, ymin: 0, ymax: 34, avatar: D.avatar() });
      var x = S.x != null ? S.x : -4, lr = S.lr || 0.3, trail = S.trail || [], steps = S.steps || 0, m = S.m || 0;
      el.innerHTML = '<div class="wd" id="wd"></div><div class="wd-lr" role="group" aria-label="Step size (learning rate)">Step size: ' + [0.05, 0.3, 1, 1.9, 2.2].map(function (v) { return '<button type="button" data-lr="' + v + '">' + v + '</button>'; }).join('') + '</div>' +
        '<div class="row"><button type="button" class="btn primary" id="wd-step">👣 Step</button><button type="button" class="btn" id="wd-reset">↺ Back to the top</button></div><div class="wd-stats" id="wd-stats" aria-live="polite"></div><div class="wd-m" id="wd-m" aria-live="polite"></div>';
      function draw() {
        D.$('#wd', el).innerHTML = H.draw(x, trail);
        D.$all('[data-lr]', el).forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-lr') === lr ? 'true' : 'false'); });
        D.$('#wd-stats', el).innerHTML = '<span>👣 Steps: ' + steps + '</span><span>📉 Error: ' + f(x).toFixed(2) + '</span><span>📐 Slope: ' + H.grad(x).toFixed(2) + '</span>';
      }
      function save() { api.save({ x: x, lr: lr, trail: trail.slice(-40), steps: steps, m: m }); }
      function mission() {
        var box = D.$('#wd-m', el);
        if (m === 0) box.innerHTML = '<p><b>Mission 1:</b> Reach the bottom (error under 1.01). Try step size 0.05 first… then 0.3. Which is faster?</p>';
        else if (m === 1) box.innerHTML = '<p><b>Mission 2:</b> Now go back to the top and choose a HUGE step size (2.2). Take a few steps. What happens?</p>';
        else if (m === 2) {
          box.innerHTML = '<p><b>Mission 3:</b> What’s the lesson about step size (called the <b>learning rate</b>)?</p><div class="row">' + D.shuffle([[1, 'Too small is slow, too big overshoots. Pick something in between'], [0, 'Bigger is always better'], [0, 'Step size doesn’t matter']]).map(function (o) { return '<button type="button" class="btn small" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p>';
          D.$all('[data-ok]', box).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-ok') === '1') { D.sfx('win'); m = 3; save(); mission(); } else { D.sfx('bad'); b.disabled = true; box.querySelector('.feedback').className = 'feedback no'; box.querySelector('.feedback').textContent = 'Remember what happened with 0.05 and with 2.2.'; } }); });
        } else { box.innerHTML = '<p class="feedback ok">🏆 You understand the learning rate, one of the most important settings in all of AI. Real engineers tune it carefully, exactly like you just did.</p>'; api.done(); }
      }
      D.$all('[data-lr]', el).forEach(function (b) { b.addEventListener('click', function () { lr = +b.getAttribute('data-lr'); save(); draw(); }); });
      D.$('#wd-reset', el).addEventListener('click', function () { x = -4; trail = []; steps = 0; save(); draw(); });
      D.$('#wd-step', el).addEventListener('click', function () {
        var before = f(x); trail.push(x); x = x - lr * H.grad(x); steps++; D.sfx('step');
        if (Math.abs(x) > 60) x = x > 0 ? 60 : -60;
        if (m === 0 && f(x) < 1.01) { m = 1; D.toast('🏁 Bottom reached in ' + steps + ' steps!'); D.sfx('good'); mission(); }
        else if (m === 1 && lr >= 2 && f(x) > before) { m = 2; D.toast('💥 Overshoot! The error went UP.'); mission(); }
        save(); draw();
      });
      draw(); mission();`),
  },
  quiz: [
    { q: 'In gradient descent, what is the “mountain”?', a: ['The model’s error (how wrong it is)', 'A real mountain', 'The computer screen', 'The dataset size'], c: 0, why: 'Going downhill = making the error smaller.' },
    { q: 'What does each step downhill do to the model?', a: ['Tweaks its weights so it’s a little less wrong', 'Deletes data', 'Makes it bigger', 'Adds new labels'], c: 0, why: 'Each step adjusts the weights in the direction that lowers the error.' },
    { q: 'What happened with a HUGE step size?', a: ['It overshot the valley and the error got worse', 'It reached the bottom instantly every time', 'Nothing moved', 'The mountain disappeared'], c: 0, why: 'Too big a learning rate jumps right over the bottom.' },
    { q: 'What happened with a TINY step size?', a: ['It moved in the right direction, but very slowly', 'It overshot', 'It went uphill', 'It stopped immediately'], c: 0, why: 'Tiny steps are safe but slow.' },
  ],
  challenge: {
    title: 'The Two Valleys',
    intro: 'Real error landscapes can have a small dip AND a deep valley. Gradient descent only feels the slope under its feet, so it can get stuck. Pick starting points to (1) get stuck in the small dip, then (2) reach the deep valley.',
    css: `.tv{background:#fff;border-radius:20px;border:2px solid #0d2b1d18;padding:8px}.tv svg{width:100%;height:auto;display:block}.tv-sl input{width:100%;min-height:44px;accent-color:#16a36b}`,
    js: new Function('el', 'api', hillGame.toString() + `
      var D = api.D, S = api.load();
      var f = function (x) { return 0.12 * Math.pow(x - 3, 2) - 2.2 * Math.exp(-Math.pow(x - 3, 2) / 1.2) - 1.1 * Math.exp(-Math.pow(x + 2.5, 2) / 0.6) + 3; };
      var H = hillGame(el, api, { f: f, lo: -5, hi: 8, ymin: 0, ymax: 11, avatar: D.avatar() });
      var start = S.start != null ? S.start : -4, got = S.got || {};
      el.innerHTML = '<div class="tv" id="tv"></div><div class="tv-sl"><label for="tv-s"><b>Starting point: <span id="tv-v"></span></b></label><input type="range" id="tv-s" min="-5" max="8" step="0.25" value="' + start + '"></div><div class="row"><button type="button" class="btn primary" id="tv-go">⛷️ Roll downhill</button></div><p class="feedback" id="tv-fb" aria-live="polite"></p>';
      function show(x, trail, msg) { D.$('#tv', el).innerHTML = H.draw(x, trail); D.$('#tv-v', el).textContent = (+D.$('#tv-s', el).value).toFixed(2); if (msg != null) D.$('#tv-fb', el).innerHTML = msg; }
      function status() { return 'Goals: ' + (got.local ? '✅' : '⬜') + ' stuck in the small dip · ' + (got.global ? '✅' : '⬜') + ' reached the deep valley'; }
      D.$('#tv-s', el).addEventListener('input', function () { start = +this.value; api.save({ start: start }); show(start, [], status()); });
      D.$('#tv-go', el).addEventListener('click', function () {
        var x = start, trail = [];
        for (var i = 0; i < 80; i++) { trail.push(x); x = x - 0.25 * H.grad(x); }
        var where = Math.abs(x + 2) < 0.8 ? 'local' : Math.abs(x - 3) < 0.8 ? 'global' : 'none';
        if (where !== 'none') got[where] = 1; api.save({ got: got });
        var fb = where === 'local' ? '🪤 Stuck in the small dip! The slope there is flat, so the walker thinks it’s done, even though a deeper valley exists. ' : where === 'global' ? '🏔️ Reached the deep valley! ' : '';
        D.sfx(where === 'none' ? 'click' : 'good');
        show(x, trail, fb + status());
        if (got.local && got.global) { D.$('#tv-fb', el).className = 'feedback ok'; D.$('#tv-fb', el).innerHTML += '<br>🏆 Where you START can change where you END. Engineers use tricks like trying several starting points.'; api.done(); }
      });
      show(start, [], status());`),
  },
};
