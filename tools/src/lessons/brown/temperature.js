module.exports = {
  hook: 'Ask a chatbot the same thing twice and you may get different answers. Why? Meet temperature, the creativity dial.',
  story: [
    ['sensei', 'When a language model picks the next token, {{nick}}, it has a list of choices, each with a probability.'],
    ['sensei', 'It doesn’t always pick the top one. A setting called <b>temperature</b> decides how adventurous it is. <b>Low</b> temperature: almost always the most likely word, which is safe and predictable. <b>High</b> temperature: rarer words get a real chance, which is creative… or weird.'],
    ['you', 'So the same question can get different answers?'],
    ['sensei', 'Exactly, when the temperature is above zero there’s some randomness. Let’s turn the dial on a story opener.'],
  ],
  activity: {
    title: 'The Creativity Dial',
    instructions: 'Move the dial, then press “Write 5 endings.” Mission 1: set the dial to 0. Mission 2: crank it to 1.8 or higher. Mission 3: answer the question.',
    css: `
.tp-prompt{font:700 1.2rem Georgia,serif;background:#fffdf7;border:2px solid #8b5a2b44;border-radius:10px;padding:12px}
.tp-dial{margin:12px 0}
.tp-dial input{width:100%;min-height:44px;accent-color:#8b5a2b}
.tp-dial label{font-weight:800}
.tp-bars{display:grid;gap:5px}
.tp-bar{display:grid;grid-template-columns:100px 1fr 46px;gap:8px;align-items:center;font-weight:700;font-size:.92rem}
.tp-bar .meter>i{background:#8b5a2b;transition:width .3s}
.tp-out{background:#2d1f12;color:#fbe9c9;border-radius:10px;padding:10px 12px;margin-top:10px;font:600 .98rem/1.6 Georgia,serif;min-height:3em}
.tp-m{background:var(--bg2);border-radius:10px;padding:10px 12px;margin-top:10px}
.tp-m .row button{flex:1 1 150px}
`,
    js: function (el, api) {
      var D = api.D;
      var BASE = [['dojo', 0.5], ['forest', 0.2], ['kitchen', 0.14], ['volcano', 0.08], ['spaceship', 0.05], ['sock drawer', 0.03]];
      var S = api.load(), T = S.T != null ? S.T : 1, m = S.m || 0, out = S.out || '';
      function dist(t) {
        if (t <= 0.001) return BASE.map(function (b, i) { return [b[0], i === 0 ? 1 : 0]; });
        var w = BASE.map(function (b) { return Math.pow(b[1], 1 / t); }), s = w.reduce(function (a, b) { return a + b; }, 0);
        return BASE.map(function (b, i) { return [b[0], w[i] / s]; });
      }
      function sample(d) { var r = Math.random(), c = 0; for (var i = 0; i < d.length; i++) { c += d[i][1]; if (r <= c) return d[i][0]; } return d[d.length - 1][0]; }
      el.innerHTML = '<div class="tp-prompt">“The ninja took a deep breath and walked into the ___”</div><div class="tp-dial"><label for="tp-t">🌡️ Temperature: <span id="tp-tv"></span></label><input type="range" id="tp-t" min="0" max="2" step="0.1" value="' + T + '"></div><div class="tp-bars" id="tp-bars" aria-live="polite"></div><div class="row" style="margin-top:10px"><button type="button" class="btn primary" id="tp-go">✍️ Write 5 endings</button></div><div class="tp-out" id="tp-out" aria-live="polite"></div><div class="tp-m" id="tp-m" aria-live="polite"></div>';
      function draw() {
        T = +D.$('#tp-t', el).value; var d = dist(T);
        D.$('#tp-tv', el).textContent = T.toFixed(1) + (T === 0 ? ' (always the top word)' : T < 0.6 ? ' (careful)' : T <= 1.2 ? ' (balanced)' : ' (wild!)');
        D.$('#tp-bars', el).innerHTML = d.map(function (x) { return '<div class="tp-bar"><span>' + x[0] + '</span><span class="meter"><i style="width:' + Math.round(x[1] * 100) + '%"></i></span><span>' + Math.round(x[1] * 100) + '%</span></div>'; }).join('');
        D.$('#tp-out', el).innerHTML = out || 'Press the button to write 5 endings at this temperature.';
        mission();
      }
      function mission() {
        var box = D.$('#tp-m', el);
        if (m === 0) box.innerHTML = '<p><b>Mission 1:</b> Set the dial to <b>0</b> and write 5 endings.</p>';
        else if (m === 1) box.innerHTML = '<p>✅ At 0, it’s the same ending every time: predictable! <b>Mission 2:</b> Crank it to <b>1.8 or more</b> and write 5 endings.</p>';
        else if (m === 2) {
          box.innerHTML = '<p>✅ At high temperature, surprising words appear. Creative… and sometimes silly. <b>Mission 3:</b> You want a chatbot to help with math homework facts. Which temperature fits best?</p><div class="row">' + D.shuffle([[1, 'Low: you want reliable, predictable answers'], [0, 'Very high: more random is better for facts'], [0, 'It makes no difference']]).map(function (o) { return '<button type="button" class="btn small" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p>';
          D.$all('[data-ok]', box).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-ok') === '1') { m = 3; api.save({ m: 3 }); D.sfx('win'); mission(); } else { D.sfx('bad'); b.disabled = true; box.querySelector('.feedback').className = 'feedback no'; box.querySelector('.feedback').textContent = 'Would you want random surprises in a math answer?'; } }); });
        } else { box.innerHTML = '<p class="feedback ok">🏆 Dial master! Low temperature for facts and focus, higher for brainstorming and stories. Important: even at low temperature, a model can still be wrong. Temperature controls randomness, not truth.</p>'; api.done(); }
      }
      D.$('#tp-t', el).addEventListener('input', function () { api.save({ T: +this.value }); draw(); });
      D.$('#tp-go', el).addEventListener('click', function () {
        var d = dist(T), picks = []; for (var i = 0; i < 5; i++) picks.push(sample(d));
        out = picks.map(function (p, i) { return (i + 1) + '. …walked into the <b>' + p + '</b>.'; }).join('<br>');
        if (m === 0 && T === 0) m = 1; else if (m === 1 && T >= 1.8) m = 2;
        api.save({ out: out, m: m }); D.sfx('click'); draw();
      });
      draw();
    },
  },
  quiz: [
    { q: 'What does the temperature setting control?', a: ['How random or adventurous the model’s word choices are', 'How hot the computer gets', 'How fast it types', 'Whether it tells the truth'], c: 0, why: 'Low = predictable. High = surprising.' },
    { q: 'At temperature 0, the model…', a: ['Picks the most likely word every time', 'Picks totally random words', 'Stops working', 'Writes backwards'], c: 0, why: 'No randomness: the top choice wins every time.' },
    { q: 'Which task suits a HIGHER temperature?', a: ['Brainstorming wild names for your team', 'Looking up the date of an exam', 'Adding two numbers', 'Copying a phone number'], c: 0, why: 'Creativity benefits from variety. Facts don’t.' },
    { q: 'If you lower the temperature, will the model always be correct?', a: ['No — it just becomes more predictable, not more truthful', 'Yes, always', 'Only on Mondays', 'Only for short answers'], c: 0, why: 'A predictable wrong answer is still wrong. Always fact-check!' },
  ],
  challenge: {
    title: 'Set the Dial',
    intro: 'Choose the best temperature for each job. Get 4 of 5.',
    js: function (el, api) {
      api.D.sorter(el, api, {
        choices: [['l', '🧊 Low'], ['h', '🔥 High']],
        items: [
          ['Writing a silly poem about a dancing robot', 'h', 'Creative writing loves surprises.'],
          ['Turning your notes into a neat, accurate study list', 'l', 'You want it to stick closely to your notes.'],
          ['Brainstorming 20 possible names for a game', 'h', 'More variety = more ideas to choose from.'],
          ['Answering “What time does practice start?” from the team schedule', 'l', 'Facts should be steady and predictable.'],
          ['Summarizing a science article for a school report', 'l', 'Summaries should stay faithful to the source.'],
        ],
        need: 4, win: 'Right tool, right setting. That’s pro-level AI use.',
      });
    },
  },
};
