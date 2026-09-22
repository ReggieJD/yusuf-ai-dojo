module.exports = {
  hook: 'The average is the balance point of your data. Slide the balance point, watch one wild number shift it, and spot a pattern.',
  story: [
    ['sensei', '{{nick}}, you practiced free throws for five days. You made 6, 9, 7, 10 and 8 shots.'],
    ['you', 'So how good am I, in one number?'],
    ['sensei', 'That’s what the <b>average</b> (also called the <b>mean</b>) tells you. Add everything up, then divide by how many numbers there are.'],
    ['sensei', 'Here’s a secret most people don’t know: the average is the <b>balance point</b>. Put your numbers on a seesaw, and the average is exactly where it balances. Let’s prove it.'],
  ],
  activity: {
    title: 'The Balance Beam',
    instructions: 'Slide the triangle until the beam balances. That spot is the average! Then see what one extreme day does, and finish the pattern.',
    css: `
.bb{background:#fff;border-radius:12px;border:2px solid #16181d22;padding:10px}
.bb svg{width:100%;height:auto;display:block}
.bb-beam{transition:transform .35s ease-out}
.bb input[type=range]{width:100%;min-height:44px;accent-color:#1d4ed8}
.bb-read{display:flex;justify-content:space-between;font-weight:800;flex-wrap:wrap;gap:6px}
.bb-step{background:#fff1c1;border-radius:10px;padding:12px;margin-top:12px}
.bb-step .row button{flex:1;min-width:70px}
`,
    js: function (el, api) {
      var D = api.D;
      var base = [6, 9, 7, 10, 8], S = api.load(), step = S.step || 0, data = step >= 1 ? base.concat([30]) : base.slice();
      el.innerHTML = '<div class="bb"><div id="bb-svg"></div><label class="sr-only" for="bb-r">Balance point</label><input type="range" id="bb-r" min="0" max="32" step="0.5" value="' + (S.g || 3) + '"><div class="bb-read"><span id="bb-g"></span><span id="bb-t" aria-live="polite"></span></div></div><div class="bb-step" id="bb-step" aria-live="polite"></div>';
      var r = D.$('#bb-r', el);
      function mean() { return data.reduce(function (a, b) { return a + b; }, 0) / data.length; }
      function draw() {
        var g = +r.value, m = mean(), W = 360, x = function (v) { return 20 + v / 32 * (W - 40); };
        var torque = data.reduce(function (a, v) { return a + (v - g); }, 0);
        var ang = Math.max(-7, Math.min(7, torque * 0.5));
        var balanced = Math.abs(g - m) < 0.26;
        var stacks = {}; var dots = data.map(function (v) { stacks[v] = (stacks[v] || 0) + 1; return '<circle cx="' + x(v) + '" cy="' + (88 - stacks[v] * 16) + '" r="7" fill="' + (v === 30 ? '#b3261e' : '#1d4ed8') + '" stroke="#fff" stroke-width="2"/>'; }).join('');
        var ticks = [0, 5, 10, 15, 20, 25, 30].map(function (v) { return '<text x="' + x(v) + '" y="128" text-anchor="middle" font-size="11" fill="#4a4f5c">' + v + '</text>'; }).join('');
        D.$('#bb-svg', el).innerHTML = '<svg viewBox="0 0 ' + W + ' 140" role="img" aria-label="Seesaw with data points ' + data.join(', ') + '. Balance point at ' + g + '. ' + (balanced ? 'Balanced.' : 'Tilting.') + '">' +
          '<g class="bb-beam" style="transform-origin:' + x(g) + 'px 92px;transform:rotate(' + (balanced ? 0 : ang) + 'deg)"><rect x="14" y="88" width="' + (W - 28) + '" height="8" rx="4" fill="' + (balanced ? '#1b7f4b' : '#16181d') + '"/>' + dots + '</g>' +
          '<path d="M' + x(g) + ' 97 l-12 20 h24 z" fill="#ffb000" stroke="#16181d" stroke-width="2"/>' + ticks + '</svg>';
        D.$('#bb-g', el).textContent = 'Balance point: ' + g;
        D.$('#bb-t', el).textContent = balanced ? '⚖️ Balanced!' : (torque > 0 ? '↘ Tipping right' : '↙ Tipping left');
        return balanced;
      }
      function stepUI() {
        var box = D.$('#bb-step', el);
        if (step === 0) box.innerHTML = '<p><b>Step 1:</b> Slide until the beam balances for 6, 9, 7, 10, 8.</p>';
        if (step === 1) box.innerHTML = '<p><b>Step 2:</b> Whoa! One day you made <b>30</b> shots (a lucky streak in an empty gym). The red dot is an <b>extreme value</b>. Re-balance the beam!</p>';
        if (step === 2) box.innerHTML = '<p>✅ The average jumped from 8 to ' + (Math.round(mean() * 10) / 10) + ' because of ONE extreme day. Averages can be pulled by extreme values, so data scientists always check for them.</p><p><b>Step 3 · Pattern:</b> Your practice minutes went 4, 6, 8, 10… What comes next?</p><div class="row">' + [11, 12, 14, 20].map(function (v) { return '<button type="button" class="btn small" data-v="' + v + '">' + v + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p>';
        if (step >= 3) { box.innerHTML = '<p class="feedback ok">🏆 12! The pattern is “+2 each time.” Finding patterns in data and using them to predict what comes next is the heart of machine learning.</p>'; api.done(); }
        D.$all('[data-v]', box).forEach(function (b) {
          b.addEventListener('click', function () {
            if (b.getAttribute('data-v') === '12') { D.sfx('win'); step = 3; api.save({ step: 3 }); stepUI(); }
            else { D.sfx('bad'); b.disabled = true; var f = box.querySelector('.feedback'); f.className = 'feedback no'; f.textContent = 'Look at how much it grows each time.'; }
          });
        });
      }
      var hold = null;
      r.addEventListener('input', function () {
        api.save({ g: +r.value });
        var ok = draw();
        clearTimeout(hold);
        if (ok && step < 2) hold = setTimeout(function () {
          D.sfx('good');
          if (step === 0) { step = 1; data = base.concat([30]); api.save({ step: 1 }); D.toast('⚖️ Balanced at 8! (6+9+7+10+8) ÷ 5 = 8'); }
          else { step = 2; api.save({ step: 2 }); }
          draw(); stepUI();
        }, 500);
      });
      draw(); stepUI();
    },
  },
  quiz: [
    { q: 'What is the average (mean) of 4, 6 and 8?', a: ['6', '18', '8', '4'], c: 0, why: '4 + 6 + 8 = 18, and 18 ÷ 3 = 6.' },
    { q: 'You made 8, 8, 8, 8 and then 48 shots. What happens to the average?', a: ['One extreme value pulls it up a lot', 'It stays 8', 'It goes down', 'Averages ignore big numbers'], c: 0, why: '(8+8+8+8+48) ÷ 5 = 16, double the “usual” day. Extreme values tug the average.' },
    { q: 'Where is the average on a “seesaw” of data points?', a: ['Exactly at the balance point', 'Always at the far left', 'At the biggest number', 'Nowhere'], c: 0, why: 'The mean is the point where values on each side balance out.' },
    { q: 'Why do AI systems care about patterns?', a: ['Patterns let them make predictions about new situations', 'Patterns make data prettier', 'They don’t care about patterns', 'Patterns delete bad data'], c: 0, why: 'Learning = finding patterns in examples, then using them to predict.' },
  ],
  challenge: {
    title: 'Mean vs Median',
    intro: 'The <b>median</b> is the middle value when you line numbers up in order. It isn’t bothered by extreme values. Answer 2 of 3.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'Points in 5 games: 2, 3, 3, 4, 28. What is the MEDIAN?', a: ['3', '8', '28', '4'], c: 0, why: 'In order: 2, 3, <b>3</b>, 4, 28. The middle one is 3.' },
        { q: 'For the same games, the MEAN is 8. Which number better describes a “typical” game?', a: ['The median (3) — one huge game pulled the mean up', 'The mean (8) — it’s always better', 'Neither', '28'], c: 0, why: 'When there’s an extreme value, the median often describes the typical case better.' },
        { q: 'A news story says “the average person in this room is a billionaire” after one billionaire walks in. What’s going on?', a: ['One extreme value pulled the mean way up — the median would tell a truer story', 'Everyone got rich', 'Averages can’t be calculated for people', 'The room is magic'], c: 0, why: 'This classic example shows why smart analysts check the median too.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 2) api.done(); } });
    },
  },
};
