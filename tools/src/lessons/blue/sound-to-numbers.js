module.exports = {
  hook: 'Every sound is a wave, and computers store waves as long lists of numbers. Shape a sound, then sample it like a microphone does.',
  story: [
    ['sensei', 'When you clap, {{nick}}, the air wiggles back and forth super fast. That wiggle is a <b>sound wave</b>.'],
    ['sensei', 'A microphone measures the wave thousands of times every second and writes down a number each time. This is called <b>sampling</b>. Music on a CD uses <b>44,100</b> samples every second for each speaker!'],
    ['you', 'So a song is a giant list of numbers too?'],
    ['sensei', 'Yes! And voice assistants turn your speech into those numbers before their AI tries to understand the words. Let’s shape some waves.'],
  ],
  activity: {
    title: 'Wave Workshop',
    instructions: 'Change the pitch and volume, and (if you like) press Play. Then turn the sample rate down and watch what happens. Complete the 4 missions.',
    css: `
.sw-plot{background:#0a1a33;padding:6px;border:3px solid #0a1a33}
.sw-plot svg{width:100%;height:auto;display:block}
.sw-sl{display:grid;gap:6px;margin-top:10px}
.sw-sl label{display:grid;grid-template-columns:150px 1fr 60px;gap:8px;align-items:center;font-weight:800;font-size:.9rem}
@media(max-width:480px){.sw-sl label{grid-template-columns:1fr 60px}.sw-sl label input{grid-column:1/-1;grid-row:2}}
.sw-sl input{width:100%;min-height:40px;accent-color:#1f6feb}
.sw-nums{font:700 .8rem ui-monospace,Menlo,monospace;background:var(--bg2);padding:8px;margin-top:8px;overflow-x:auto;white-space:nowrap}
.sw-m{background:var(--bg2);padding:10px 12px;margin-top:10px}
.sw-m .row button{flex:1 1 90px}
`,
    js: function (el, api) {
      var D = api.D, S = api.load(), P = S.p || { f: 2, a: 0.5, s: 40 }, m = S.m || 0, base = { f: P.f, a: P.a };
      el.innerHTML = '<div class="sw-plot" id="sw-plot"></div><div class="sw-sl">' + [['f', '🎵 Pitch (waves)', 1, 6, 1], ['a', '🔊 Volume (height)', 0.1, 1, 0.1], ['s', '🎙️ Samples in the window', 4, 60, 1]].map(function (s) { return '<label><span>' + s[1] + '</span><input type="range" data-k="' + s[0] + '" min="' + s[2] + '" max="' + s[3] + '" step="' + s[4] + '" value="' + P[s[0]] + '"><b data-v="' + s[0] + '"></b></label>'; }).join('') +
        '</div><div class="row" style="margin-top:8px"><button type="button" class="btn small" id="sw-play">▶ Play this tone</button></div><div class="sw-nums" id="sw-nums" aria-label="Sample numbers"></div><div class="sw-m" id="sw-m" aria-live="polite"></div>';
      function draw() {
        var W = 340, H = 170, mid = H / 2, X = function (t) { return 10 + t * (W - 20); }, Y = function (v) { return mid - v * (H / 2 - 12); };
        var wave = ''; for (var i = 0; i <= 300; i++) { var t = i / 300; wave += (i ? 'L' : 'M') + X(t).toFixed(1) + ' ' + Y(P.a * Math.sin(2 * Math.PI * P.f * t)).toFixed(1); }
        var dots = '', conn = '', nums = [];
        for (var k = 0; k < P.s; k++) { var tt = k / (P.s - 1), v = P.a * Math.sin(2 * Math.PI * P.f * tt); nums.push(Math.round(v * 100)); dots += '<line x1="' + X(tt) + '" y1="' + mid + '" x2="' + X(tt) + '" y2="' + Y(v) + '" stroke="#ffd23f55"/><circle cx="' + X(tt) + '" cy="' + Y(v) + '" r="3.5" fill="#ffd23f"/>'; conn += (k ? 'L' : 'M') + X(tt).toFixed(1) + ' ' + Y(v).toFixed(1); }
        D.$('#sw-plot', el).innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Sound wave with ' + P.f + ' waves, volume ' + P.a + ', sampled ' + P.s + ' times."><line x1="10" y1="' + mid + '" x2="' + (W - 10) + '" y2="' + mid + '" stroke="#7fb2ff44"/><path d="' + wave + '" fill="none" stroke="#7fb2ff" stroke-width="2.5" opacity=".7"/><path d="' + conn + '" fill="none" stroke="#ffd23f" stroke-width="1.5" stroke-dasharray="4 3"/>' + dots + '<text x="12" y="16" font-size="11" fill="#7fb2ff">— real wave   ● samples (what the computer keeps)</text></svg>';
        D.$('#sw-nums', el).textContent = 'Stored numbers: ' + nums.join(', ');
        ['f', 'a', 's'].forEach(function (k) { D.$('[data-v="' + k + '"]', el).textContent = P[k]; });
      }
      function mission() {
        var box = D.$('#sw-m', el);
        var M = ['<b>Mission 1:</b> Make the pitch HIGHER. More waves squeeze into the same time.', '<b>Mission 2:</b> Make it LOUDER. The waves get taller.', '<b>Mission 3:</b> Slide the samples down to 8 or fewer. Does the yellow dotted shape still look like the real wave?'];
        if (m < 3) { box.innerHTML = '<p>' + M[m] + '</p>'; return; }
        if (m === 3) {
          box.innerHTML = '<p><b>Mission 4:</b> With too few samples, what happened?</p><div class="row">' + D.shuffle([[1, 'The stored shape lost the real wave, so the sound can’t be rebuilt correctly'], [0, 'Nothing changed'], [0, 'The sound got louder']]).map(function (o) { return '<button type="button" class="btn small" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p>';
          D.$all('[data-ok]', box).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-ok') === '1') { m = 4; api.save({ m: 4 }); D.sfx('win'); mission(); } else { D.sfx('bad'); b.disabled = true; box.querySelector('.feedback').className = 'feedback no'; box.querySelector('.feedback').textContent = 'Compare the yellow dots to the blue wave.'; } }); });
          return;
        }
        box.innerHTML = '<p class="feedback ok">🏆 Sound engineer! Enough samples capture the wave. Too few, and details get lost. That’s why CDs use 44,100 samples per second: enough to capture sounds up to about 22,000 waves per second, around the top of human hearing.</p>'; api.done();
      }
      D.$all('[data-k]', el).forEach(function (r) {
        r.addEventListener('input', function () {
          P[r.getAttribute('data-k')] = +r.value; api.save({ p: P }); draw();
          if (m === 0 && P.f > base.f) { m = 1; api.save({ m: 1 }); D.sfx('good'); mission(); }
          else if (m === 1 && P.a > base.a) { m = 2; api.save({ m: 2 }); D.sfx('good'); mission(); }
          else if (m === 2 && P.s <= 8) { m = 3; api.save({ m: 3 }); D.sfx('good'); mission(); }
          if (m === 0) base.f = Math.min(base.f, P.f); if (m <= 1) base.a = Math.min(base.a, P.a);
        });
      });
      D.$('#sw-play', el).addEventListener('click', function () {
        try { var ac = new (window.AudioContext || window.webkitAudioContext)(), o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 180 + P.f * 90; g.gain.value = 0.05 + P.a * 0.15; o.connect(g); g.connect(ac.destination); o.start(); g.gain.setValueAtTime(g.gain.value, ac.currentTime + 0.5); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.8); o.stop(ac.currentTime + 0.85); } catch (e) { /* no audio */ }
      });
      draw(); mission();
    },
  },
  quiz: [
    { q: 'What is sampling?', a: ['Measuring a sound wave many times per second and storing each measurement as a number', 'Tasting food', 'Deleting sounds', 'Recording video'], c: 0, why: 'Each sample is one number.' },
    { q: 'A higher-pitched sound has…', a: ['More waves squeezed into the same time', 'Taller waves', 'No waves', 'Fewer samples'], c: 0, why: 'Pitch = how fast the wave wiggles (frequency).' },
    { q: 'A louder sound has…', a: ['Taller waves', 'More waves per second', 'Fewer numbers', 'A different color'], c: 0, why: 'Loudness = wave height (amplitude).' },
    { q: 'How many samples per second does CD audio use for each speaker?', a: ['44,100', '10', '1 million', '12'], c: 0, why: '44,100 samples per second, which captures sounds up to about 22,000 waves per second.' },
  ],
  challenge: {
    title: 'Hearing Machines',
    intro: 'How do voice assistants understand you? Get 3 of 4.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'What is the FIRST thing a voice assistant does with your voice?', a: ['Turns the sound into numbers by sampling it', 'Understands the meaning', 'Replies', 'Translates it'], c: 0, why: 'Sound → numbers first. Everything else is math on those numbers.' },
        { q: 'Speech-recognition AI learns to turn sound numbers into words by…', a: ['Training on huge amounts of recorded speech paired with the correct text', 'Guessing', 'Reading dictionaries only', 'Listening to one person once'], c: 0, why: 'Recordings + correct transcripts = labeled training data.' },
        { q: 'Why might a voice assistant struggle in a noisy stadium?', a: ['The noise mixes into the numbers, making the speech pattern harder to find', 'It gets scared', 'Stadiums block electricity', 'It never struggles'], c: 0, why: 'Noise = messy input numbers.' },
        { q: 'Why might a voice assistant understand some accents better than others?', a: ['Its training data had more examples of some accents than others', 'Some accents are wrong', 'Microphones prefer some voices', 'Accents aren’t sounds'], c: 0, why: 'This is a real fairness issue: unbalanced training data. More in the Black Belt!' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
