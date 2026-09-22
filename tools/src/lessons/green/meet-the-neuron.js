module.exports = {
  hook: 'Every giant AI is built from tiny pieces called artificial neurons. Flip the inputs, watch the weights, and make one fire.',
  story: [
    ['sensei', 'Deep inside every big AI are millions, sometimes billions, of tiny math machines called <b>artificial neurons</b>, {{nick}}.'],
    ['sensei', 'They were loosely inspired by brain cells, but they’re much simpler: just a little bit of math.'],
    ['you', 'What does one neuron do?'],
    ['sensei', 'Three steps. <b>1)</b> It takes in some inputs. <b>2)</b> It multiplies each input by a <b>weight</b> (how much that input matters) and adds everything up. <b>3)</b> If the total is big enough, it <b>fires</b>!'],
    ['sensei', 'Here’s a neuron that decides: “Should {{nick}} go to the park?” Let’s play with it.'],
  ],
  activity: {
    title: 'The Park Neuron',
    instructions: 'Tap the inputs to switch them on (1) or off (0). The neuron fires if the weighted total is 4 or more. Complete the 3 missions.',
    css: `
.nr{background:#fff;border-radius:20px;padding:8px;border:2px solid #0d2b1d18}
.nr svg{width:100%;height:auto;display:block}
.nr-in{cursor:pointer}
.nr-in:focus{outline:none}.nr-in:focus rect{stroke:#0b6e8a;stroke-width:4}
.nr-mission{background:var(--bg2);border-radius:18px;padding:12px;margin-top:10px}
.nr-mission .row button{flex:1 1 120px}
.nr-sum{font:800 1.05rem var(--font-head);margin:8px 0 0;text-align:center}
`,
    js: function (el, api) {
      var D = api.D;
      var IN = [['🧑‍🤝‍🧑 Friend is going', 2], ['☀️ It’s sunny', 1], ['📚 Homework done', 3]];
      var S = api.load(), on = S.on || [0, 0, 0], m = S.m || 0, TH = 4;
      el.innerHTML = '<div class="nr" id="nr"></div><p class="nr-sum" id="nr-sum" aria-live="polite"></p><div class="nr-mission" id="nr-m" aria-live="polite"></div>';
      function total() { return on.reduce(function (s, v, i) { return s + v * IN[i][1]; }, 0); }
      function draw() {
        var t = total(), fire = t >= TH, W = 340, H = 250;
        var g = IN.map(function (inp, i) {
          var y = 40 + i * 80, w = inp[1];
          return '<line x1="120" y1="' + y + '" x2="236" y2="125" stroke="' + (on[i] ? '#16a36b' : '#0d2b1d33') + '" stroke-width="' + (2 + w * 3) + '" stroke-linecap="round"/>' +
            '<text x="' + 178 + '" y="' + (y + (125 - y) / 2 - 8) + '" font-size="13" font-weight="800" fill="#0b6e8a" text-anchor="middle">×' + w + '</text>' +
            '<g class="nr-in" tabindex="0" role="switch" aria-checked="' + !!on[i] + '" data-i="' + i + '" aria-label="' + inp[0].replace(/^\S+ /, '') + ', weight ' + w + '"><rect x="6" y="' + (y - 26) + '" width="114" height="52" rx="14" fill="' + (on[i] ? '#dff7ec' : '#fff') + '" stroke="' + (on[i] ? '#16a36b' : '#0d2b1d44') + '" stroke-width="2.5"/>' +
            '<text x="63" y="' + (y - 4) + '" font-size="11" text-anchor="middle" fill="#0d2b1d" font-weight="700">' + inp[0] + '</text><text x="63" y="' + (y + 16) + '" font-size="15" text-anchor="middle" font-weight="900" fill="' + (on[i] ? '#16a36b' : '#9aa') + '">' + (on[i] ? '1 · ON' : '0 · off') + '</text></g>';
        }).join('');
        D.$('#nr', el).innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="A neuron with three inputs">' + g +
          '<circle cx="270" cy="125" r="38" fill="' + (fire ? '#16a36b' : '#e8f3ee') + '" stroke="#0d2b1d" stroke-width="3"' + (fire ? ' style="filter:drop-shadow(0 0 12px #2ec27e)"' : '') + '/>' +
          '<text x="270" y="121" font-size="20" font-weight="900" text-anchor="middle" fill="' + (fire ? '#fff' : '#0d2b1d') + '">' + t + '</text><text x="270" y="140" font-size="10" text-anchor="middle" fill="' + (fire ? '#fff' : '#3d5c4f') + '">need ' + TH + '</text>' +
          '<text x="270" y="190" font-size="16" font-weight="900" text-anchor="middle" fill="' + (fire ? '#16a36b' : '#3d5c4f') + '">' + (fire ? '⚡ FIRE: Go to the park!' : '💤 Stay home') + '</text></svg>';
        D.$('#nr-sum', el).textContent = 'Total = ' + IN.map(function (inp, i) { return on[i] + '×' + inp[1]; }).join(' + ') + ' = ' + t + (fire ? '  ≥ 4 → fires!' : '  < 4 → no fire');
        D.$all('.nr-in', el).forEach(function (g) {
          function tog() { var i = +g.getAttribute('data-i'); on[i] = on[i] ? 0 : 1; api.save({ on: on }); D.sfx('click'); draw(); check(); var again = D.$('.nr-in[data-i="' + i + '"]', el); if (again) again.focus(); }
          g.addEventListener('click', tog); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } });
        });
      }
      function mission() {
        var box = D.$('#nr-m', el);
        if (m === 0) box.innerHTML = '<p><b>Mission 1:</b> Make the neuron fire!</p>';
        else if (m === 1) {
          box.innerHTML = '<p><b>Mission 2:</b> Can you make it fire WITHOUT homework done? Try it, then decide:</p><div class="row">' + D.shuffle(['<button type="button" class="btn small" data-a="no">🚫 Impossible!</button>', '<button type="button" class="btn small" data-a="yes">✅ Yes, it can</button>']).join('') + '</div><p class="feedback" aria-live="polite"></p>';
          D.$all('[data-a]', box).forEach(function (b) { b.addEventListener('click', function () { var f = box.querySelector('.feedback'); if (b.getAttribute('data-a') === 'no') { D.sfx('good'); f.className = 'feedback ok'; f.innerHTML = '✅ Right! Friend (2) + sunny (1) = 3, still less than 4. Homework has the <b>biggest weight</b>, so this neuron basically requires it. Weights decide what matters most!'; m = 2; api.save({ m: 2 }); setTimeout(mission, 2600); } else { D.sfx('bad'); b.disabled = true; f.className = 'feedback no'; f.textContent = 'Turn homework OFF and switch everything else ON. What’s the biggest total you can get?'; } }); });
        } else if (m === 2) {
          box.innerHTML = '<p><b>Mission 3 · Predict first!</b> Sunny ON, homework ON, friend OFF. Will it fire?</p><div class="row">' + D.shuffle(['<button type="button" class="btn small" data-a="y">⚡ Fires</button>', '<button type="button" class="btn small" data-a="n">💤 No fire</button>']).join('') + '</div><p class="feedback" aria-live="polite"></p>';
          D.$all('[data-a]', box).forEach(function (b) { b.addEventListener('click', function () { var f = box.querySelector('.feedback'); if (b.getAttribute('data-a') === 'y') { D.sfx('win'); on = [0, 1, 1]; api.save({ on: on, m: 3 }); m = 3; draw(); mission(); } else { D.sfx('bad'); b.disabled = true; f.className = 'feedback no'; f.textContent = 'Add it up: 1×1 + 1×3 = ?'; } }); });
        } else { box.innerHTML = '<p class="feedback ok">🏆 1×1 + 1×3 = 4 → it fires! You just did exactly what a neuron does: <b>multiply, add, decide</b>. Giant AIs repeat this billions of times.</p>'; api.done(); }
      }
      function check() { if (m === 0 && total() >= TH) { m = 1; api.save({ m: 1 }); D.sfx('good'); mission(); } }
      draw(); mission();
    },
  },
  quiz: [
    { q: 'What are the three steps an artificial neuron follows?', a: ['Take inputs → multiply by weights and add → fire if the total is big enough', 'See → hear → smell', 'Guess → give up → restart', 'Store → delete → print'], c: 0, why: 'Multiply, add, decide. That’s the whole neuron!' },
    { q: 'What does a weight tell you?', a: ['How much an input matters', 'How heavy the computer is', 'The color of the input', 'The final answer'], c: 0, why: 'Bigger weight = bigger influence on the total.' },
    { q: 'Friend (weight 2) + sunny (weight 1) are ON; homework (weight 3) is OFF. The total is…', a: ['3', '6', '4', '0'], c: 0, why: '1×2 + 1×1 + 0×3 = 3.' },
    { q: 'How are artificial neurons related to brain neurons?', a: ['Loosely inspired by them, but much simpler math', 'They are exactly the same', 'They are made of real brain cells', 'No connection at all'], c: 0, why: 'The idea came from biology, but an artificial neuron is just arithmetic.' },
  ],
  challenge: {
    title: 'Neuron Math Blitz',
    intro: 'Be the neuron! Calculate each total and decide whether it fires (threshold 5). Get 3 of 4.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'Inputs 1, 1, 0 with weights 3, 2, 4. Total and result?', a: ['5 → fires', '9 → fires', '3 → no fire', '2 → no fire'], c: 0, why: '1×3 + 1×2 + 0×4 = 5, which reaches the threshold of 5.' },
        { q: 'Inputs 0, 1, 1 with weights 3, 2, 4. Total and result?', a: ['6 → fires', '9 → fires', '4 → no fire', '2 → no fire'], c: 0, why: '0 + 2 + 4 = 6.' },
        { q: 'Inputs 1, 0, 0 with weights 3, 2, 4. Total and result?', a: ['3 → no fire', '9 → fires', '5 → fires', '0 → no fire'], c: 0, why: 'Only the first input: 1×3 = 3.' },
        { q: 'A weight is NEGATIVE (−2). If that input is on, what happens to the total?', a: ['It goes DOWN by 2 — negative weights push against firing', 'It goes up by 2', 'Nothing changes', 'The neuron breaks'], c: 0, why: 'Negative weights let a neuron learn “this makes it LESS likely.”' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
