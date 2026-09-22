module.exports = {
  hook: 'Coaches and scouts use data to find patterns in games. Explore real-looking basketball stats, read the charts, and discover a pattern.',
  story: [
    ['sensei', 'Welcome to Stats Court, {{nick}}. Pro teams hire <b>data analysts</b> to study every shot, pass and minute.'],
    ['sensei', 'A big table of numbers is hard to read. A <b>chart</b> turns numbers into shapes, so your eyes can spot the pattern in a second.'],
    ['you', 'So charts are like a cheat code for data?'],
    ['sensei', 'Ha! More like night-vision goggles. Here are stats for eight made-up players in the Dojo League. Answer the scout’s questions by reading the charts.'],
  ],
  activity: {
    title: 'The Scout’s Report',
    instructions: 'Switch the stat, tap the bars to read exact values, and answer the 4 scouting questions.',
    css: `
.sc-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.sc-tabs button{min-height:44px;padding:6px 14px;border-radius:999px;border:2px solid #16181d;background:#fff;font:700 .95rem var(--font-body);cursor:pointer;color:#16181d}
.sc-tabs button[aria-pressed="true"]{background:#16181d;color:#ffd23f}
.sc-chart{background:#fff;border-radius:10px;border:2px solid #16181d22;padding:8px}
.sc-chart svg{width:100%;height:auto;display:block}
.sc-bar{cursor:pointer}
.sc-bar rect.b{fill:#1d4ed8;transition:fill .15s}
.sc-bar:hover rect.b,.sc-bar:focus rect.b{fill:#0f2f8f}
.sc-bar.sel rect.b{fill:#ffb000}
.sc-bar:focus{outline:none}.sc-bar:focus rect.hit{stroke:#16181d;stroke-width:2}
.sc-read{min-height:1.6em;font-weight:800;margin:8px 0}
.sc-task{background:#fff1c1;border-radius:10px;padding:12px;margin-top:10px}
.sc-task .row button{flex:1;min-width:110px}
.sc-legend{font-size:.85rem;color:#4a4f5c;margin:4px 0 0}
`,
    js: function (el, api) {
      var D = api.D;
      var P = [
        { n: 'Ace', pts: 22, ast: 4, min: 32 }, { n: 'Blaze', pts: 15, ast: 9, min: 28 }, { n: 'Comet', pts: 9, ast: 3, min: 18 }, { n: 'Dash', pts: 18, ast: 5, min: 30 },
        { n: 'Echo', pts: 6, ast: 2, min: 12 }, { n: 'Flash', pts: 12, ast: 7, min: 24 }, { n: 'Ghost', pts: 25, ast: 6, min: 34 }, { n: 'Hawk', pts: 11, ast: 10, min: 22 },
      ];
      var STATS = { pts: 'Points per game', ast: 'Assists per game', min: 'Minutes per game' };
      var TASKS = [
        { q: 'Who scores the MOST points per game? Tap their bar in the Points chart.', stat: 'pts', ans: 'Ghost', why: 'Ghost’s bar is the longest in the Points chart: 25 per game.' },
        { q: 'Who is the best passer (most ASSISTS)? Tap their bar in the Assists chart.', stat: 'ast', ans: 'Hawk', why: 'Hawk has 10 assists per game, even though Hawk isn’t a top scorer. Different stats tell different stories!' },
        { q: 'Who plays the FEWEST minutes? Tap their bar in the Minutes chart.', stat: 'min', ans: 'Echo', why: 'Echo plays just 12 minutes a game, the shortest bar.' },
        { q: 'Look at the scatter plot below. Do players who play MORE minutes tend to score MORE points?', scatter: true, choices: ['Yes — the dots go up and to the right', 'No — they go down', 'There’s no pattern at all'], ans: 0, why: 'The dots rise from left to right. When two things tend to rise together, that’s called a <b>positive correlation</b>.' },
      ];
      var stat = 'pts', sel = null, S = api.load(), t = S.t || 0;
      el.innerHTML = '<div class="sc-tabs" role="group" aria-label="Choose a stat">' + Object.keys(STATS).map(function (k) { return '<button type="button" data-s="' + k + '" aria-pressed="' + (k === stat) + '">' + STATS[k].split(' per')[0] + '</button>'; }).join('') +
        '</div><div class="sc-chart" id="sc-chart"></div><p class="sc-read" id="sc-read" aria-live="polite">Tap a bar to read its value.</p><div id="sc-scatter"></div><div class="sc-task" id="sc-task" aria-live="polite"></div>';
      function bars() {
        var rows = P.slice().sort(function (a, b) { return b[stat] - a[stat]; });
        var max = Math.max.apply(null, P.map(function (p) { return p[stat]; }));
        var W = 340, rowH = 34, left = 64, H = rows.length * rowH + 24, scale = (W - left - 40) / max;
        var g = rows.map(function (p, i) {
          var y = 8 + i * rowH, w = Math.max(4, p[stat] * scale);
          return '<g class="sc-bar' + (sel === p.n ? ' sel' : '') + '" tabindex="0" role="button" data-n="' + p.n + '" aria-label="' + p.n + ': ' + p[stat] + ' ' + STATS[stat].toLowerCase() + '">' +
            '<rect class="hit" x="0" y="' + (y - 3) + '" width="' + W + '" height="' + (rowH - 2) + '" fill="transparent"/>' +
            '<text x="' + (left - 8) + '" y="' + (y + 17) + '" text-anchor="end" font-size="13" font-weight="700" fill="#16181d">' + p.n + '</text>' +
            '<rect class="b" x="' + left + '" y="' + (y + 3) + '" width="' + w + '" height="' + (rowH - 12) + '" rx="4"/>' +
            (i < 3 || sel === p.n ? '<text x="' + (left + w + 6) + '" y="' + (y + 18) + '" font-size="12" fill="#4a4f5c">' + p[stat] + '</text>' : '') + '</g>';
        }).join('');
        D.$('#sc-chart', el).innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="Bar chart of ' + STATS[stat] + ', sorted highest first"><line x1="' + left + '" y1="4" x2="' + left + '" y2="' + (H - 16) + '" stroke="#16181d33"/>' + g +
          '<text x="' + left + '" y="' + (H - 2) + '" font-size="11" fill="#4a4f5c">' + STATS[stat] + ' →</text></svg><p class="sc-legend">Made-up players · sorted from highest to lowest</p>';
        D.$all('.sc-bar', el).forEach(function (b) {
          function go() { tap(b.getAttribute('data-n')); }
          b.addEventListener('click', go); b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        });
      }
      function scatter() {
        var W = 340, H = 230, l = 40, b = 36, xs = function (v) { return l + (v - 10) / 26 * (W - l - 12); }, ys = function (v) { return H - b - (v - 4) / 23 * (H - b - 12); };
        var grid = [10, 20, 30].map(function (v) { return '<line x1="' + xs(v) + '" x2="' + xs(v) + '" y1="10" y2="' + (H - b) + '" stroke="#16181d14"/><text x="' + xs(v) + '" y="' + (H - b + 16) + '" font-size="11" text-anchor="middle" fill="#4a4f5c">' + v + '</text>'; }).join('') +
          [5, 15, 25].map(function (v) { return '<line x1="' + l + '" x2="' + (W - 8) + '" y1="' + ys(v) + '" y2="' + ys(v) + '" stroke="#16181d14"/><text x="' + (l - 6) + '" y="' + (ys(v) + 4) + '" font-size="11" text-anchor="end" fill="#4a4f5c">' + v + '</text>'; }).join('');
        var dots = P.map(function (p) { return '<circle cx="' + xs(p.min) + '" cy="' + ys(p.pts) + '" r="7" fill="#1d4ed8" stroke="#fff" stroke-width="2"><title>' + p.n + ': ' + p.min + ' min, ' + p.pts + ' pts</title></circle>'; }).join('');
        D.$('#sc-scatter', el).innerHTML = '<div class="sc-chart" style="margin-top:10px"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Scatter plot: minutes played across, points scored up. The dots rise from left to right.">' + grid + dots +
          '<text x="' + (W / 2) + '" y="' + (H - 4) + '" font-size="12" text-anchor="middle" fill="#16181d" font-weight="700">Minutes per game →</text><text x="12" y="' + (H / 2) + '" font-size="12" text-anchor="middle" fill="#16181d" font-weight="700" transform="rotate(-90 12 ' + (H / 2) + ')">Points per game →</text></svg><p class="sc-legend">Each dot is one player.</p></div>';
      }
      function tap(n) {
        sel = n; bars(); var p = P.filter(function (x) { return x.n === n; })[0];
        D.$('#sc-read', el).textContent = '🏀 ' + p.n + ': ' + p[stat] + ' ' + STATS[stat].toLowerCase();
        var T = TASKS[t]; if (!T || T.scatter) return;
        if (stat !== T.stat) return;
        var box = D.$('#sc-task', el);
        if (n === T.ans) { D.sfx('good'); t++; api.save({ t: t }); box.innerHTML = '<p class="feedback ok">✅ ' + T.why + '</p>'; setTimeout(task, 1200); }
        else { D.sfx('bad'); box.querySelector('.feedback').className = 'feedback no'; box.querySelector('.feedback').textContent = 'Not ' + n + ' — compare the bar lengths again.'; }
      }
      function task() {
        var box = D.$('#sc-task', el), T = TASKS[t];
        if (!T) { box.innerHTML = '<p class="feedback ok">🏆 Scouting report complete! You read three bar charts and spotted a correlation. That’s exactly what sports analysts do.</p>'; api.done(); return; }
        if (T.scatter) {
          scatter();
          box.innerHTML = '<p><b>Question ' + (t + 1) + '/4:</b> ' + T.q + '</p><div class="row">' + D.shuffle(T.choices.map(function (c, i) { return '<button type="button" class="btn small" data-i="' + i + '">' + c + '</button>'; })).join('') + '</div><p class="feedback" aria-live="polite"></p>';
          D.$all('button', box).forEach(function (b) {
            b.addEventListener('click', function () {
              var f = box.querySelector('.feedback');
              if (+b.getAttribute('data-i') === T.ans) { D.sfx('good'); f.className = 'feedback ok'; f.innerHTML = '✅ ' + T.why; t++; api.save({ t: t }); setTimeout(task, 1400); }
              else { D.sfx('bad'); b.disabled = true; f.className = 'feedback no'; f.textContent = 'Look again: as you move right (more minutes), what happens to the height of the dots?'; }
            });
          });
          return;
        }
        box.innerHTML = '<p><b>Question ' + (t + 1) + '/4:</b> ' + T.q + '</p><p class="feedback" aria-live="polite"></p>';
      }
      D.$all('.sc-tabs button', el).forEach(function (b) {
        b.addEventListener('click', function () { stat = b.getAttribute('data-s'); sel = null; D.$all('.sc-tabs button', el).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); bars(); D.$('#sc-read', el).textContent = 'Tap a bar to read its value.'; });
      });
      bars(); task();
    },
  },
  quiz: [
    { q: 'Why do analysts turn tables of numbers into charts?', a: ['Charts turn numbers into shapes, so patterns are easier to see quickly', 'Charts change the data', 'Tables are always wrong', 'Charts are only for decoration'], c: 0, why: 'A chart shows the same data, just in a form your eyes can compare fast.' },
    { q: 'In the Points chart, how could you tell who scored the most?', a: ['Their bar was the longest', 'Their name was first alphabetically', 'Their bar was the shortest', 'You couldn’t tell'], c: 0, why: 'In a bar chart, bar length shows the size of the value.' },
    { q: 'Players who play more minutes tend to score more points. This is called…', a: ['A positive correlation', 'An algorithm', 'A label', 'A random guess'], c: 0, why: 'When two things tend to rise together, they are positively correlated.' },
    { q: 'Hawk has the most assists but isn’t a top scorer. What does this show?', a: ['Different stats measure different skills — one number doesn’t tell the whole story', 'Hawk is a bad player', 'Assists don’t matter', 'The chart is broken'], c: 0, why: 'Good analysts look at many features, not just one.' },
  ],
  challenge: {
    title: 'Correlation vs Causation',
    intro: 'Two things moving together doesn’t prove one <b>causes</b> the other. Sometimes a hidden third thing causes both! Answer 3 of 4 correctly.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'In the Dojo League, players with bigger shoe sizes score more points. Do big shoes CAUSE scoring?', a: ['No — taller players tend to have bigger feet AND score more; height is a hidden cause', 'Yes — buy bigger shoes to score more', 'Yes — shoes are magic', 'No — shoe size and points can’t be measured'], c: 0, why: 'A hidden “third factor” (height) can make two things look connected.' },
        { q: 'On hot days, ice-cream sales AND sunburns both go up. What’s the best explanation?', a: ['Sunny, hot weather causes both', 'Ice cream causes sunburn', 'Sunburn makes people buy ice cream', 'It’s a coincidence every time'], c: 0, why: 'Both are caused by the same thing: sunshine.' },
        { q: 'In soccer, players who take more shots usually score more goals. Is that correlation believable?', a: ['Yes — more shots give more chances to score, and it makes sense', 'No — shots and goals are unrelated', 'Only on Tuesdays', 'Only for goalkeepers'], c: 0, why: 'Sometimes correlation DOES have a sensible cause. The point is to check, not to assume.' },
        { q: 'Why does this matter for AI?', a: ['AI finds correlations in data, but it can’t always tell which ones are real causes', 'AI always knows the true cause', 'AI can’t find patterns', 'It doesn’t matter at all'], c: 0, why: 'AI can learn misleading shortcuts from correlations. Humans need to check its reasoning.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
