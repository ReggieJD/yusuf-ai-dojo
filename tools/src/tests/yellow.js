module.exports = {
  quiz: [
    { q: 'What is data?', a: ['Facts — numbers, words, pictures, sounds — collected to be studied', 'Only numbers', 'Only computer files', 'A type of robot'], c: 0, why: 'Data is any recorded information we can study.' },
    { q: 'In a data table, what is a column usually?', a: ['One feature — the same kind of fact for every example', 'One example', 'A mistake', 'The whole dataset'], c: 0, why: 'Rows are examples; columns are features.' },
    { q: 'What is a label?', a: ['The correct answer attached to a training example', 'The title of a chart', 'A type of number', 'A computer brand'], c: 0, why: 'Labeled examples are how most AI learns.' },
    { q: 'Dolphins labeled as “fish” in a dataset would…', a: ['Teach the AI a wrong pattern', 'Make the AI smarter', 'Be ignored automatically', 'Delete themselves'], c: 0, why: 'Wrong labels = wrong lessons.' },
    { q: 'A survey asks: “Don’t you agree pizza is the best food?” What’s wrong with it?', a: ['It’s a leading question that pushes one answer', 'Nothing', 'It’s too short', 'It mentions food'], c: 0, why: 'Good questions are neutral.' },
    { q: 'The average of 5, 10 and 15 is…', a: ['10', '30', '15', '5'], c: 0, keep: true, why: '(5 + 10 + 15) ÷ 3 = 10.' },
    { q: 'One extreme value in a dataset can…', a: ['Pull the average a lot', 'Never change the average', 'Make the average zero', 'Delete the median'], c: 0, why: 'Averages are sensitive to extreme values. Medians are less sensitive.' },
    { q: 'Players who practice more tend to score more. This is…', a: ['A correlation', 'A label', 'A duplicate', 'A missing value'], c: 0, why: 'Two things changing together = correlation.' },
    { q: 'Ice-cream sales and sunburns rise together. Does ice cream cause sunburn?', a: ['No — hot, sunny weather causes both', 'Yes', 'Only chocolate ice cream', 'Sunburn causes ice cream'], c: 0, why: 'Correlation doesn’t prove causation.' },
    { q: '“Garbage in, garbage out” means…', a: ['Bad data leads to bad results', 'Recycle your computer', 'AI loves garbage', 'More data is always garbage'], c: 0, why: 'AI quality depends on data quality.' },
    { q: 'A face-unlock AI trained only on adults struggles with kids. Why?', a: ['Kids were missing from the training data', 'Kids’ faces can’t be seen by cameras', 'The AI dislikes kids', 'It was trained too much'], c: 0, why: 'Missing groups in data → the AI doesn’t work well for them.' },
    { q: 'A log says someone slept 90 hours in one day. This is most likely…', a: ['A typo — it’s impossible', 'A real outlier', 'A perfect data point', 'The average'], c: 0, why: 'Check whether a value is even possible.' },
    { q: 'What should you usually do with a real (not mistaken) outlier?', a: ['Keep it and note why it’s unusual', 'Always delete it', 'Change it to the average', 'Hide it'], c: 0, why: 'Real outliers are part of the truth.' },
    { q: 'Which chart is best for showing scores in each game across a whole season?', a: ['A line chart — it shows change over time', 'A pie chart', 'No chart ever', 'A photo'], c: 0, why: 'Line charts are great for showing how something changes over time.' },
  ],
  project: {
    title: 'Mini Data Scientist',
    intro: 'The coach needs a real data report on your season. Clean the data, calculate, choose a chart, and draw a conclusion.',
    css: `
.ms-step{background:var(--bg2);border-radius:12px;padding:12px;margin-bottom:12px}
.ms-step.done{background:#e3f6ea}
.ms-games{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin:8px 0}
.ms-g{min-height:64px;border-radius:10px;border:2px solid #16181d;background:#fff;font:800 1.1rem var(--font-body);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#16181d}
.ms-g small{font:600 .65rem var(--font-body);color:#4a4f5c}
.ms-g.bad{background:#fde7e4;border-color:#b3261e}.ms-g.fixed{background:#e3f6ea;border-color:#1b7f4b}
.ms-step .row button{flex:1 1 120px}
.ms-chart{background:#fff;border-radius:10px;padding:6px;margin-top:8px}
.ms-chart svg{width:100%;height:auto}
`,
    js: function (el, api) {
      var D = api.D;
      var G = [12, 15, 14, 60, 13, 16, 12], S = api.load(), step = S.step || 0;
      function render() {
        var fixed = step >= 1, data = G.map(function (v, i) { return fixed && i === 3 ? 16 : v; });
        var h = '<div class="ms-step' + (step >= 1 ? ' done' : '') + '"><p><b>1 · Clean:</b> Points in 7 games. The scorekeeper made one typo (the video shows 16). Tap the suspicious game.</p><div class="ms-games">' +
          data.map(function (v, i) { return '<button type="button" class="ms-g' + (fixed && i === 3 ? ' fixed' : '') + '" data-i="' + i + '" ' + (step >= 1 ? 'disabled' : '') + ' aria-label="Game ' + (i + 1) + ': ' + v + ' points"><small>G' + (i + 1) + '</small>' + v + '</button>'; }).join('') + '</div><p class="feedback" id="ms-f1" aria-live="polite"></p></div>';
        if (step >= 1) h += '<div class="ms-step' + (step >= 2 ? ' done' : '') + '"><p><b>2 · Calculate:</b> What is the average points per game now? (12 + 15 + 14 + 16 + 13 + 16 + 12) ÷ 7</p><div class="row" id="ms-avg">' + [12, 14, 16, 22].map(function (v) { return '<button type="button" class="btn small" data-v="' + v + '" ' + (step >= 2 ? 'disabled' : '') + '>' + v + '</button>'; }).join('') + '</div><p class="feedback" id="ms-f2" aria-live="polite">' + (step >= 2 ? '✅ 98 ÷ 7 = 14 points per game.' : '') + '</p></div>';
        if (step >= 2) h += '<div class="ms-step' + (step >= 3 ? ' done' : '') + '"><p><b>3 · Visualize:</b> Which chart best shows how your scoring changed from game to game?</p><div class="row" id="ms-chart">' + [['line', '📈 Line chart'], ['pie', '🥧 Pie chart'], ['none', '🚫 No chart — just the average']].map(function (c) { return '<button type="button" class="btn small" data-v="' + c[0] + '" ' + (step >= 3 ? 'disabled' : '') + '>' + c[1] + '</button>'; }).join('') + '</div><p class="feedback" id="ms-f3" aria-live="polite"></p>' + (step >= 3 ? lineChart(data) : '') + '</div>';
        if (step >= 3) h += '<div class="ms-step' + (step >= 4 ? ' done' : '') + '"><p><b>4 · Conclude:</b> Which conclusion is supported by this data?</p><div class="row" id="ms-conc">' + [['a', 'You scored steadily, around 14 points a game'], ['b', 'You scored 60 points once, so you’re a superstar'], ['c', 'Your new shoes caused a good season']].map(function (c) { return '<button type="button" class="btn small" data-v="' + c[0] + '" ' + (step >= 4 ? 'disabled' : '') + '>' + c[1] + '</button>'; }).join('') + '</div><p class="feedback" id="ms-f4" aria-live="polite">' + (step >= 4 ? '✅ Supported by clean data, with no invented causes. Report complete!' : '') + '</p></div>';
        el.innerHTML = h;
        D.$all('.ms-g', el).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-i') === '3') { step = 1; api.save({ step: 1 }); D.sfx('good'); render(); } else { b.classList.add('bad'); D.$('#ms-f1', el).className = 'feedback no'; D.$('#ms-f1', el).textContent = 'That one looks normal. Which number is way off from the rest?'; D.sfx('bad'); } }); });
        D.$all('#ms-avg button', el).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-v') === '14') { step = 2; api.save({ step: 2 }); D.sfx('good'); render(); } else { b.disabled = true; D.$('#ms-f2', el).className = 'feedback no'; D.$('#ms-f2', el).textContent = 'Add all 7 numbers (98), then divide by 7.'; D.sfx('bad'); } }); });
        D.$all('#ms-chart button', el).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-v') === 'line') { step = 3; api.save({ step: 3 }); D.sfx('good'); render(); } else { b.disabled = true; D.$('#ms-f3', el).className = 'feedback no'; D.$('#ms-f3', el).textContent = b.getAttribute('data-v') === 'pie' ? 'Pie charts show parts of a whole, not change over time.' : 'The average hides the game-by-game story.'; D.sfx('bad'); } }); });
        D.$all('#ms-conc button', el).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-v') === 'a') { step = 4; api.save({ step: 4 }); D.sfx('win'); render(); } else { b.disabled = true; D.$('#ms-f4', el).className = 'feedback no'; D.$('#ms-f4', el).textContent = b.getAttribute('data-v') === 'b' ? 'That 60 was a typo we fixed!' : 'The data says nothing about shoes. That’s an invented cause.'; D.sfx('bad'); } }); });
        if (step >= 4) api.done();
      }
      function lineChart(d) {
        var W = 320, H = 150, x = function (i) { return 30 + i * (W - 50) / 6; }, y = function (v) { return H - 24 - (v - 10) / 8 * (H - 40); };
        var pts = d.map(function (v, i) { return x(i) + ',' + y(v); }).join(' ');
        return '<div class="ms-chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Line chart of points per game: ' + d.join(', ') + '"><line x1="30" y1="' + y(14) + '" x2="' + (W - 20) + '" y2="' + y(14) + '" stroke="#16181d55" stroke-dasharray="4 4"/><text x="' + (W - 20) + '" y="' + (y(14) - 4) + '" font-size="10" text-anchor="end" fill="#4a4f5c">average 14</text><polyline points="' + pts + '" fill="none" stroke="#1d4ed8" stroke-width="2.5"/>' +
          d.map(function (v, i) { return '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="4.5" fill="#1d4ed8"/><text x="' + x(i) + '" y="' + (H - 6) + '" font-size="10" text-anchor="middle" fill="#4a4f5c">G' + (i + 1) + '</text>'; }).join('') + '</svg></div>';
      }
      render();
    },
  },
};
