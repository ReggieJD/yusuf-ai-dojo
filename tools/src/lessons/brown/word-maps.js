module.exports = {
  hook: 'AI stores the meaning of words as positions on a map. Similar words live close together, and you can even do math with meanings.',
  story: [
    ['sensei', 'How can a computer know that “puppy” is close in meaning to “dog,” {{nick}}, if it only works with numbers?'],
    ['sensei', 'It gives every word a list of numbers called an <b>embedding</b>, like coordinates on a map. Words used in similar ways get similar coordinates, so they end up <b>close together</b>.'],
    ['you', 'A map of meanings?!'],
    ['sensei', 'Exactly! Real embeddings have hundreds of dimensions, far more than a flat map. We squashed ours down to 2 so you can see it. And here’s the magic: you can do <b>math with meanings</b>.'],
  ],
  activity: {
    title: 'Explore the Meaning Map',
    instructions: 'Mission 1: tap 3 different words to see their nearest neighbors. Mission 2: place the mystery word. Mission 3: solve the word-math puzzle.',
    css: `
.wm-map{background:#fffdf7;border:2px solid #8b5a2b55;border-radius:12px;padding:4px}
.wm-map svg{width:100%;height:auto;display:block}
.wm-w{cursor:pointer}
.wm-w text{font:700 13px var(--font-body);fill:#2d1f12}
.wm-w circle{fill:#8b5a2b}
.wm-w.sel circle{fill:#d97706;r:7}
.wm-w.nb circle{fill:#2f855a}
.wm-w:focus{outline:none}.wm-w:focus text{text-decoration:underline}
.wm-m{background:var(--bg2);border-radius:10px;padding:10px 12px;margin-top:10px}
.wm-m .row button{flex:1 1 110px}
.wm-info{font-weight:800;min-height:1.5em;margin:6px 0}
`,
    js: function (el, api) {
      var D = api.D;
      var W = { soccer: [0.3, 8.2], basketball: [0.3, 9.5], tennis: [3.1, 8.7], chess: [3.1, 7.6], dog: [9.3, 2.6], cat: [10.2, 3.3], puppy: [9.3, 3.9], kitten: [10.2, 4.6], apple: [4.4, 1.1], banana: [5.6, 0.5], pizza: [4.1, 2], rice: [6, 1.8], man: [6.4, 6], woman: [8.4, 6], king: [6.4, 8], queen: [8.4, 8], boy: [6.4, 5], girl: [8.4, 5], happy: [1.9, 3.3], joyful: [2.5, 4.1], sad: [0.4, 1.4], angry: [0.4, 2.4], computer: [3, 5.6], robot: [3.8, 6.5] };
      var S = api.load(), seen = S.seen || {}, m = S.m || 0, sel = null;
      var WW = 340, HH = 300, X = function (v) { return 18 + v / 10.5 * (WW - 70); }, Y = function (v) { return HH - 16 - v / 10 * (HH - 36); };
      function near(w, k) { var p = W[w]; return Object.keys(W).filter(function (x) { return x !== w; }).map(function (x) { return [x, Math.hypot(W[x][0] - p[0], W[x][1] - p[1])]; }).sort(function (a, b) { return a[1] - b[1]; }).slice(0, k); }
      el.innerHTML = '<div class="wm-map" id="wm-map"></div><p class="wm-info" id="wm-info" aria-live="polite">Tap a word.</p><div class="wm-m" id="wm-m" aria-live="polite"></div>';
      function draw(extra) {
        var nb = sel ? near(sel, 3).map(function (x) { return x[0]; }) : [];
        var lines = sel ? nb.map(function (n) { return '<line x1="' + X(W[sel][0]) + '" y1="' + Y(W[sel][1]) + '" x2="' + X(W[n][0]) + '" y2="' + Y(W[n][1]) + '" stroke="#2f855a" stroke-width="2" stroke-dasharray="4 3"/>'; }).join('') : '';
        var g = Object.keys(W).map(function (w) { return '<g class="wm-w' + (w === sel ? ' sel' : nb.indexOf(w) >= 0 ? ' nb' : '') + '" tabindex="0" role="button" data-w="' + w + '" aria-label="' + w + '"><circle cx="' + X(W[w][0]) + '" cy="' + Y(W[w][1]) + '" r="5"/><text x="' + (X(W[w][0]) + 8) + '" y="' + (Y(W[w][1]) + 4) + '">' + w + '</text></g>'; }).join('');
        D.$('#wm-map', el).innerHTML = '<svg viewBox="0 0 ' + WW + ' ' + HH + '" role="group" aria-label="Word meaning map">' + lines + g + (extra || '') + '</svg>';
        D.$all('.wm-w', el).forEach(function (n) { function go() { tap(n.getAttribute('data-w')); } n.addEventListener('click', go); n.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); });
      }
      function tap(w) {
        sel = w; var nb = near(w, 3);
        D.$('#wm-info', el).textContent = '📍 Closest to “' + w + '”: ' + nb.map(function (x) { return x[0]; }).join(', ');
        if (m === 0) { seen[w] = 1; api.save({ seen: seen }); if (Object.keys(seen).length >= 3) { m = 1; api.save({ m: 1 }); D.sfx('good'); } }
        draw(); mission(); var again = D.$('.wm-w[data-w="' + w + '"]', el); if (again) again.focus();
      }
      function ask(q, opts, ok, why, next) {
        var box = D.$('#wm-m', el);
        box.innerHTML = '<p>' + q + '</p><div class="row">' + D.shuffle(opts.map(function (o, i) { return '<button type="button" class="btn small" data-i="' + i + '">' + o + '</button>'; })).join('') + '</div><p class="feedback" aria-live="polite"></p>';
        D.$all('[data-i]', box).forEach(function (b) { b.addEventListener('click', function () { var f = box.querySelector('.feedback'); if (+b.getAttribute('data-i') === ok) { D.sfx('win'); f.className = 'feedback ok'; f.innerHTML = '✅ ' + why; m = next; api.save({ m: m }); setTimeout(function () { draw(next === 3 ? arrows() : ''); mission(); }, 1800); } else { D.sfx('bad'); b.disabled = true; f.className = 'feedback no'; f.textContent = 'Look at the map again. Which neighborhood fits?'; } }); });
      }
      function arrows() { var a = function (p, q, c) { return '<line x1="' + X(p[0]) + '" y1="' + Y(p[1]) + '" x2="' + X(q[0]) + '" y2="' + Y(q[1]) + '" stroke="' + c + '" stroke-width="3" marker-end="url(#wmA)"/>'; }; return '<defs><marker id="wmA" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="#d97706"/></marker></defs>' + a(W.man, W.woman, '#d97706') + a(W.king, W.queen, '#d97706'); }
      function mission() {
        var box = D.$('#wm-m', el);
        if (m === 0) box.innerHTML = '<p><b>Mission 1:</b> Tap 3 different words to see their neighbors. (' + Object.keys(seen).length + '/3)</p>';
        else if (m === 1) ask('<b>Mission 2:</b> The mystery word is <b>“mango.”</b> Which neighborhood would it land in?', ['🍎 Near apple and banana', '⚽ Near soccer and tennis', '👑 Near king and queen', '😠 Near sad and angry'], 0, 'Mango is used like other fruits in text, so its embedding lands near them.', 2);
        else if (m === 2) ask('<b>Mission 3 · Word math:</b> Start at <b>king</b>. Subtract <b>man</b>, add <b>woman</b>. Where do you land?', ['queen', 'boy', 'robot', 'pizza'], 0, 'king − man + woman ≈ queen! The arrow from man → woman is the same shape as king → queen. Real embeddings show similar patterns (roughly, not perfectly).', 3);
        else { box.innerHTML = '<p class="feedback ok">🏆 Map master! Embeddings let AI measure how similar meanings are, which powers search, recommendations and chatbots.</p>'; api.done(); }
      }
      draw(m >= 3 ? arrows() : ''); mission();
    },
  },
  quiz: [
    { q: 'What is an embedding?', a: ['A list of numbers that places a word on a “meaning map”', 'A picture of a word', 'A spelling rule', 'A type of font'], c: 0, why: 'Numbers that capture how a word is used.' },
    { q: 'On the map, why were “puppy” and “dog” close together?', a: ['They are used in similar ways in text', 'They start with the same letter', 'They are both short words', 'It was random'], c: 0, why: 'Similar usage → similar coordinates.' },
    { q: 'king − man + woman ≈ ?', a: ['queen', 'kitten', 'pizza', 'robot'], c: 0, why: 'The “man → woman” direction on the map matches “king → queen.”' },
    { q: 'Real embeddings usually have…', a: ['Hundreds of dimensions, not just 2', 'Exactly 2 dimensions', 'No numbers at all', 'One number'], c: 0, why: 'We flattened ours so you could see it.' },
  ],
  challenge: {
    title: 'Odd One Out',
    intro: 'Which word lives far away from the others on the meaning map? Get 3 of 4.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'soccer · tennis · basketball · banana', a: ['banana', 'soccer', 'tennis', 'basketball'], c: 0, why: 'Banana lives in the food neighborhood.' },
        { q: 'happy · joyful · computer · sad', a: ['computer', 'happy', 'joyful', 'sad'], c: 0, why: 'Feelings cluster together; computer does not.' },
        { q: 'cat · kitten · dog · chess', a: ['chess', 'cat', 'kitten', 'dog'], c: 0, why: 'Chess is near the games, not the animals.' },
        { q: 'Why is “word similarity” useful for a search engine?', a: ['A search for “puppy pics” can also find pages that say “dog photos”', 'It makes pages load faster', 'It deletes spam', 'It isn’t useful'], c: 0, why: 'Matching meanings, not just exact letters.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
