module.exports = {
  hook: 'Drag space rocks into the right baskets, and watch your classifier draw its own decision line as it learns.',
  story: [
    ['sensei', 'Mission alert, {{nick}}! A rover on Mars is collecting rocks. Some are rare <b>crystals</b> 💎. Most are <b>plain rocks</b> 🪨. The rover must sort them by itself.'],
    ['sensei', 'We’ll build a <b>classifier</b>: an AI that sorts things into groups called <b>classes</b>. The rover can measure two <b>features</b> of each rock: how <b>shiny</b> it is and how <b>big</b> it is.'],
    ['you', 'How does it learn which is which?'],
    ['sensei', 'From you! Drag each training rock into the right basket. Every rock you sort becomes a dot on the rover’s map, and the rover draws a <b>decision line</b> between the two groups. Watch it move as you teach.'],
  ],
  activity: {
    title: 'Teach the Mars Rover',
    instructions: 'Drag each rock into 💎 Crystal or 🪨 Plain (or tap a rock, then tap a basket). Crystals are the <b>shiny</b> ones. Then press Test to try 8 brand-new rocks.',
    css: `
.tc{display:grid;gap:12px}
@media(min-width:720px){.tc{grid-template-columns:1fr 1fr}}
.tc-pool{display:flex;flex-wrap:wrap;gap:8px;min-height:90px;padding:10px;border-radius:12px;background:var(--bg2);border:2px dashed #2b1a0e44}
.tc-rock{touch-action:none;user-select:none;cursor:grab;border:2px solid #2b1a0e;border-radius:12px;background:#fff;padding:4px 8px;min-width:64px;min-height:64px;display:flex;flex-direction:column;align-items:center;justify-content:center;font:700 .7rem var(--font-body);color:#2b1a0e;position:relative}
.tc-rock .e{line-height:1}
.tc-rock[aria-pressed="true"]{outline:4px solid #e8590c;outline-offset:2px}
.tc-rock.drag{position:fixed;z-index:400;pointer-events:none;box-shadow:0 10px 24px #0005;transform:scale(1.1)}
.tc-bins{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.tc-bin{min-height:120px;border-radius:14px;border:3px solid #2b1a0e;padding:8px;background:#fffaf4;display:flex;flex-wrap:wrap;gap:6px;align-content:flex-start;cursor:pointer;font:inherit;color:inherit;text-align:left}
.tc-bin h4{flex-basis:100%;margin:0 0 4px;font-size:1rem}
.tc-bin.over{background:#ffe2c4;border-style:dashed}
.tc-bin .tc-rock{min-width:48px;min-height:48px;cursor:pointer}
.tc-map{background:#fff;border-radius:12px;border:2px solid #2b1a0e22;padding:6px}
.tc-map svg{width:100%;height:auto;display:block}
.tc-res{margin-top:10px}
.tc-test{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}
.tc-test span{border-radius:10px;padding:6px 2px;text-align:center;font:700 .72rem var(--font-body)}
.tc-test .ok{background:#e3f6ea}.tc-test .no{background:#fde7e4}
`,
    js: function (el, api) {
      var D = api.D;
      // [shine 0-100, size 0-100]; crystal when shine > 50
      var TRAIN = [[85, 30], [15, 70], [72, 80], [30, 20], [92, 55], [8, 40], [65, 15], [40, 90], [78, 62], [22, 55]];
      var TEST = [[88, 45], [12, 30], [60, 70], [45, 25], [70, 20], [35, 75], [55, 50], [25, 85]];
      var S = api.load(), lab = S.lab || {}, sel = null;
      function rock(r, i, small) {
        var sz = 1.3 + r[1] / 100 * 1.2, glow = r[0] > 50 ? 'filter:drop-shadow(0 0 ' + Math.round(r[0] / 12) + 'px #7fd8ff) saturate(1.6) brightness(1.2)' : 'filter:grayscale(.6) brightness(.9)';
        return '<button type="button" class="tc-rock" data-i="' + i + '" aria-pressed="false" aria-label="Rock ' + (i + 1) + ': shine ' + r[0] + ', size ' + r[1] + '"><span class="e" style="font-size:' + (small ? 1.2 : sz) + 'rem;' + glow + '" aria-hidden="true">' + (r[0] > 50 ? '💎' : '🪨') + '</span>✨' + r[0] + ' · 📏' + r[1] + '</button>';
      }
      el.innerHTML = '<div class="tc"><div><div class="tc-pool" id="tc-pool" aria-label="Unsorted training rocks"></div><div class="tc-bins"><div class="tc-bin" data-c="1" role="button" tabindex="0" aria-label="Crystal basket"><h4>💎 Crystal</h4></div><div class="tc-bin" data-c="0" role="button" tabindex="0" aria-label="Plain rock basket"><h4>🪨 Plain</h4></div></div></div>' +
        '<div><div class="tc-map" id="tc-map"></div><p class="row" style="margin-top:8px"><button type="button" class="btn primary" id="tc-test">🚀 Test on 8 new rocks</button><button type="button" class="btn small" id="tc-reset">↺ Unsort all</button></p></div></div><div class="tc-res" id="tc-res" aria-live="polite"></div>';
      function place() {
        var pool = D.$('#tc-pool', el), bins = D.$all('.tc-bin', el);
        pool.innerHTML = ''; bins.forEach(function (b) { D.$all('.tc-rock', b).forEach(function (x) { x.remove(); }); });
        TRAIN.forEach(function (r, i) {
          var html = rock(r, i, lab[i] != null);
          if (lab[i] == null) pool.insertAdjacentHTML('beforeend', html);
          else D.$('.tc-bin[data-c="' + lab[i] + '"]', el).insertAdjacentHTML('beforeend', html);
        });
        if (!pool.children.length) pool.innerHTML = '<p style="margin:0;font-weight:700">All rocks sorted! Now test the rover →</p>';
        D.$all('.tc-rock', el).forEach(bindRock);
        map();
      }
      function model() {
        var c = { 0: [0, 0, 0], 1: [0, 0, 0] };
        Object.keys(lab).forEach(function (i) { var r = TRAIN[i], k = lab[i]; c[k][0] += r[0]; c[k][1] += r[1]; c[k][2]++; });
        if (!c[0][2] || !c[1][2]) return null;
        return { a: [c[1][0] / c[1][2], c[1][1] / c[1][2]], b: [c[0][0] / c[0][2], c[0][1] / c[0][2]] };
      }
      function predict(m, p) { var da = Math.pow(p[0] - m.a[0], 2) + Math.pow(p[1] - m.a[1], 2), db = Math.pow(p[0] - m.b[0], 2) + Math.pow(p[1] - m.b[1], 2); return da < db ? 1 : 0; }
      function map(test) {
        var W = 300, H = 230, X = function (v) { return 30 + v / 100 * (W - 40); }, Y = function (v) { return H - 30 - v / 100 * (H - 44); };
        var m = model(), line = '', shade = '';
        if (m) { // perpendicular bisector between the two class centers
          var mx = (m.a[0] + m.b[0]) / 2, my = (m.a[1] + m.b[1]) / 2, dx = m.a[0] - m.b[0], dy = m.a[1] - m.b[1];
          var p1 = [mx - dy * 3, my + dx * 3], p2 = [mx + dy * 3, my - dx * 3];
          line = '<clipPath id="tcclip"><rect x="30" y="14" width="' + (W - 40) + '" height="' + (H - 44) + '"/></clipPath><line clip-path="url(#tcclip)" x1="' + X(p1[0]) + '" y1="' + Y(p1[1]) + '" x2="' + X(p2[0]) + '" y2="' + Y(p2[1]) + '" stroke="#e8590c" stroke-width="3" stroke-dasharray="7 5"/>' +
            '<circle cx="' + X(m.a[0]) + '" cy="' + Y(m.a[1]) + '" r="5" fill="none" stroke="#1c5d99" stroke-width="2"/><circle cx="' + X(m.b[0]) + '" cy="' + Y(m.b[1]) + '" r="5" fill="none" stroke="#6b4a33" stroke-width="2"/>';
        }
        var dots = TRAIN.map(function (r, i) { if (lab[i] == null) return ''; return lab[i] === 1 ? '<rect x="' + (X(r[0]) - 6) + '" y="' + (Y(r[1]) - 6) + '" width="12" height="12" transform="rotate(45 ' + X(r[0]) + ' ' + Y(r[1]) + ')" fill="#1c5d99"/>' : '<circle cx="' + X(r[0]) + '" cy="' + Y(r[1]) + '" r="6" fill="#8d7b68"/>'; }).join('');
        var tdots = test ? TEST.map(function (r) { var p = predict(m, r); return '<circle cx="' + X(r[0]) + '" cy="' + Y(r[1]) + '" r="8" fill="none" stroke="' + (p === (r[0] > 50 ? 1 : 0) ? '#1b7f4b' : '#b3261e') + '" stroke-width="3"/>'; }).join('') : '';
        D.$('#tc-map', el).innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Map of sorted rocks: shine across, size up.' + (m ? ' The dashed decision line separates crystals from plain rocks.' : ' Sort rocks of both kinds to see the decision line.') + '"><rect x="30" y="14" width="' + (W - 40) + '" height="' + (H - 44) + '" fill="#fffaf4" stroke="#2b1a0e22"/>' + line + dots + tdots +
          '<text x="' + (W / 2 + 10) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#2b1a0e">✨ Shine →</text><text x="12" y="' + (H / 2) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#2b1a0e" transform="rotate(-90 12 ' + (H / 2) + ')">📏 Size →</text>' +
          '<text x="36" y="28" font-size="11" fill="#6b4a33">◆ crystal  ● plain  - - decision line</text></svg>';
      }
      function assign(i, c) { lab[i] = c; api.save({ lab: lab }); sel = null; D.sfx('click'); place(); }
      function bindRock(b) {
        var i = +b.getAttribute('data-i'), ghost = null, moved = false, sx = 0, sy = 0;
        b.addEventListener('click', function () { if (moved) return; sel = sel === i ? null : i; D.$all('.tc-rock', el).forEach(function (x) { x.setAttribute('aria-pressed', +x.getAttribute('data-i') === sel ? 'true' : 'false'); }); });
        b.addEventListener('pointerdown', function (e) { moved = false; sx = e.clientX; sy = e.clientY; b.setPointerCapture(e.pointerId); });
        b.addEventListener('pointermove', function (e) {
          if (!b.hasPointerCapture(e.pointerId)) return;
          if (!moved && Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) < 8) return;
          if (!ghost) { moved = true; ghost = b.cloneNode(true); ghost.classList.add('drag'); document.body.appendChild(ghost); }
          ghost.style.left = (e.clientX - 32) + 'px'; ghost.style.top = (e.clientY - 32) + 'px';
          D.$all('.tc-bin', el).forEach(function (bin) { var r = bin.getBoundingClientRect(); bin.classList.toggle('over', e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom); });
        });
        b.addEventListener('pointerup', function (e) {
          if (ghost) { ghost.remove(); ghost = null; }
          var hit = null; D.$all('.tc-bin', el).forEach(function (bin) { if (bin.classList.contains('over')) hit = bin; bin.classList.remove('over'); });
          if (moved && hit) assign(i, +hit.getAttribute('data-c'));
          setTimeout(function () { moved = false; }, 0);
        });
      }
      D.$all('.tc-bin', el).forEach(function (bin) {
        function go() { if (sel != null) assign(sel, +bin.getAttribute('data-c')); }
        bin.addEventListener('click', function (e) { if (e.target.closest('.tc-rock')) return; go(); });
        bin.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
      D.$('#tc-reset', el).addEventListener('click', function () { lab = {}; api.save({ lab: lab, tested: false }); D.$('#tc-res', el).innerHTML = ''; place(); });
      function test(quiet) {
        var m = model(), res = D.$('#tc-res', el);
        if (Object.keys(lab).length < TRAIN.length) { res.innerHTML = '<p class="feedback no">Sort all ' + TRAIN.length + ' training rocks first.</p>'; return; }
        if (!m) { res.innerHTML = '<p class="feedback no">The rover needs at least one example of EACH class!</p>'; return; }
        var right = 0, cells = TEST.map(function (r, i) { var p = predict(m, r), ok = p === (r[0] > 50 ? 1 : 0); if (ok) right++; return '<span class="' + (ok ? 'ok' : 'no') + '">Rock ' + String.fromCharCode(65 + i) + '<br>' + (p ? '💎' : '🪨') + (ok ? ' ✓' : ' ✗') + '</span>'; }).join('');
        map(true); api.save({ tested: true });
        var wrongLab = TRAIN.filter(function (r, i) { return lab[i] !== (r[0] > 50 ? 1 : 0); }).length;
        res.innerHTML = '<p><b>Rover accuracy on 8 new rocks: ' + right + '/8</b></p><div class="tc-test">' + cells + '</div>' +
          (right >= 7 ? '<p class="feedback ok">🚀 Mission success! Your classifier learned that <b>shine</b> matters and size doesn’t: look how the decision line runs up and down. You trained a real (tiny) machine-learning model.</p>'
            : '<p class="feedback no">' + (wrongLab ? wrongLab + ' training rock' + (wrongLab > 1 ? 's were' : ' was') + ' sorted into the wrong basket, so the line moved to the wrong place. Tap “Unsort all” and teach it again.' : 'Close! Try again.') + '</p>');
        if (right >= 7) { if (!quiet) D.sfx('win'); api.done(); } else if (!quiet) D.sfx('bad');
      }
      D.$('#tc-test', el).addEventListener('click', function () { test(); });
      place(); if (S.tested) test(true);
    },
  },
  quiz: [
    { q: 'What does a classifier do?', a: ['Sorts things into groups (classes)', 'Draws pictures', 'Makes sounds', 'Deletes data'], c: 0, why: 'Spam vs not spam, crystal vs plain: that’s classification.' },
    { q: 'What were the two features the rover measured?', a: ['Shine and size', 'Color and smell', 'Weight and price', 'Name and age'], c: 0, why: 'Features are the measurements a model uses to decide.' },
    { q: 'Why did the decision line run mostly up and down?', a: ['Because shine separated the classes, while size didn’t matter', 'Because it’s always vertical', 'Because size was the key feature', 'It was random'], c: 0, why: 'The line separates the classes along the feature that actually differs between them: shine.' },
    { q: 'What happens to the decision line if you sort some rocks into the wrong basket?', a: ['It moves to the wrong place, and the rover makes more mistakes', 'Nothing changes', 'It becomes perfect', 'The rover refuses to learn'], c: 0, why: 'The line is learned from your labels. Wrong labels → wrong line.' },
  ],
  challenge: {
    title: 'Feature Hunter',
    intro: 'Choosing good <b>features</b> is a superpower. For each classifier, pick the most useful feature. Get 4 of 5.',
    js: function (el, api) {
      api.D.sorter(el, api, {
        choices: [['a', 'A'], ['b', 'B']],
        items: [
          ['Classify <b>ripe vs unripe bananas</b>. A: color · B: the day of the week it was picked', 'a', 'Color changes as bananas ripen. The day of the week doesn’t.'],
          ['Classify <b>spam vs real email</b>. A: font size · B: how many times it says “FREE!!!”', 'b', 'Spammy words are a strong clue.'],
          ['Classify <b>cats vs dogs</b> in photos. A: ear shape · B: the photo’s file name', 'a', 'Ear shape is part of the animal. File names can be anything.'],
          ['Classify <b>soccer strikers vs defenders</b>. A: shots per game · B: jersey color', 'a', 'Strikers shoot more. Jersey color depends on the team, not the position.'],
          ['Classify <b>sunny vs rainy days</b> from sensor data. A: humidity · B: the sensor’s serial number', 'a', 'Humidity is related to rain. Serial numbers are just labels for machines.'],
        ],
        need: 4, win: 'Great features make easy problems. Bad features make even smart models fail.',
      });
    },
  },
};
