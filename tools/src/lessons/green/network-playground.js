module.exports = {
  hook: 'One neuron can’t solve the XOR puzzle. But connect three, and suddenly it can. Build your first neural network.',
  story: [
    ['sensei', 'Remember the impossible corners puzzle? One neuron draws one straight line, and that wasn’t enough.'],
    ['sensei', 'Here’s the trick: <b>connect neurons into layers</b>. The first layer (the <b>hidden layer</b>) finds simple patterns. The next layer combines them into smarter decisions. That’s a <b>neural network</b>.'],
    ['you', 'So more neurons = smarter?'],
    ['sensei', 'More neurons, connected well. Your mission, {{nick}}: build a “pass alarm” for {{T.group}}. It beeps when <b>exactly one</b> of two players has the ball, not zero and not both. That’s the XOR puzzle again!'],
  ],
  activity: {
    title: 'Build the Pass Alarm',
    instructions: 'Choose a job for each hidden neuron and for the output neuron. Your goal: the alarm (output) is ON only when exactly one input is ON. Check all 4 rows of the table.',
    css: `
.np{background:#fff;border-radius:20px;border:2px solid #0d2b1d18;padding:8px}
.np svg{width:100%;height:auto;display:block}
.np-ctl{display:grid;gap:8px;margin-top:10px}
@media(min-width:640px){.np-ctl{grid-template-columns:1fr 1fr 1fr}}
.np-ctl label{display:grid;gap:4px;font-weight:800;font-size:.9rem}
.np-ctl select{min-height:44px;border-radius:12px;border:2px solid #0d2b1d44;font:700 .95rem var(--font-body);background:#f4fff9;color:#0d2b1d}
.np-ins{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.np-ins button{flex:1;min-height:48px;border-radius:14px;border:2px solid #0d2b1d;background:#fff;font:800 .95rem var(--font-body);cursor:pointer;color:#0d2b1d}
.np-ins button[aria-pressed="true"]{background:#16a36b;color:#fff}
.np-tt{width:100%;border-collapse:collapse;margin-top:10px;text-align:center;background:#fff}
.np-tt th,.np-tt td{border:1px solid #0d2b1d22;padding:6px}
.np-tt thead th{background:#0d2b1d;color:#dff7ec}
.np-tt .ok{background:#e3f6ea}.np-tt .no{background:#fde7e4}
.np-w{font-size:.78rem;color:var(--muted);font-weight:600}
`,
    js: function (el, api) {
      var D = api.D;
      var HID = { or: ['OR: fires if A or B (or both)', 1, 1, -0.5], and: ['AND: fires only if both', 1, 1, -1.5], nand: ['NAND: fires unless both', -1, -1, 1.5], onlyA: ['Copy A: fires if A', 1, 0, -0.5] };
      var OUT = { and: ['H1 AND H2', 1, 1, -1.5], or: ['H1 OR H2', 1, 1, -0.5], andnot: ['H1 AND NOT H2', 1, -1, -0.5] };
      var S = api.load(), cfg = S.cfg || { h1: '', h2: '', o: '' }, inp = S.inp || [0, 0];
      function fire(w1, w2, b, a, c) { return w1 * a + w2 * c + b > 0 ? 1 : 0; }
      function run(a, b) {
        if (!cfg.h1 || !cfg.h2 || !cfg.o) return null;
        var h1 = fire(HID[cfg.h1][1], HID[cfg.h1][2], HID[cfg.h1][3], a, b), h2 = fire(HID[cfg.h2][1], HID[cfg.h2][2], HID[cfg.h2][3], a, b);
        return { h1: h1, h2: h2, o: fire(OUT[cfg.o][1], OUT[cfg.o][2], OUT[cfg.o][3], h1, h2) };
      }
      function opts(set, val, ph) { return '<option value="">' + ph + '</option>' + Object.keys(set).map(function (k) { return '<option value="' + k + '"' + (k === val ? ' selected' : '') + '>' + set[k][0] + '</option>'; }).join(''); }
      el.innerHTML = '<div class="np" id="np-svg"></div><div class="np-ins"><button type="button" data-in="0">🏃 Player A has the ball</button><button type="button" data-in="1">🏃 Player B has the ball</button></div>' +
        '<div class="np-ctl"><label>Hidden neuron H1<select data-c="h1">' + opts(HID, cfg.h1, 'Choose a job…') + '</select><span class="np-w" data-w="h1"></span></label><label>Hidden neuron H2<select data-c="h2">' + opts(HID, cfg.h2, 'Choose a job…') + '</select><span class="np-w" data-w="h2"></span></label><label>Output neuron<select data-c="o">' + opts(OUT, cfg.o, 'Choose a job…') + '</select><span class="np-w" data-w="o"></span></label></div>' +
        '<table class="np-tt"><caption class="sr-only">Truth table</caption><thead><tr><th scope="col">A</th><th scope="col">B</th><th scope="col">H1</th><th scope="col">H2</th><th scope="col">Alarm</th><th scope="col">Goal</th></tr></thead><tbody id="np-tt"></tbody></table><p class="feedback" id="np-fb" aria-live="polite"></p>';
      function draw() {
        var r = run(inp[0], inp[1]) || { h1: 0, h2: 0, o: 0 }, W = 340, H = 220;
        var n = function (x, y, on, lbl) { return '<circle cx="' + x + '" cy="' + y + '" r="24" fill="' + (on ? '#16a36b' : '#e8f3ee') + '" stroke="#0d2b1d" stroke-width="3"' + (on ? ' style="filter:drop-shadow(0 0 8px #2ec27e)"' : '') + '/><text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-weight="900" font-size="14" fill="' + (on ? '#fff' : '#0d2b1d') + '">' + lbl + '</text>'; };
        var L = function (x1, y1, x2, y2, on) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (on ? '#16a36b' : '#0d2b1d33') + '" stroke-width="' + (on ? 5 : 3) + '"/>'; };
        D.$('#np-svg', el).innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Network: inputs A=' + inp[0] + ', B=' + inp[1] + '. Hidden H1=' + r.h1 + ', H2=' + r.h2 + '. Alarm=' + r.o + '.">' +
          L(50, 60, 170, 60, inp[0]) + L(50, 60, 170, 160, inp[0]) + L(50, 160, 170, 60, inp[1]) + L(50, 160, 170, 160, inp[1]) + L(170, 60, 290, 110, r.h1) + L(170, 160, 290, 110, r.h2) +
          n(50, 60, inp[0], 'A') + n(50, 160, inp[1], 'B') + n(170, 60, r.h1, 'H1') + n(170, 160, r.h2, 'H2') + n(290, 110, r.o, r.o ? '🔔' : 'OUT') +
          '<text x="50" y="205" text-anchor="middle" font-size="11" fill="#3d5c4f">inputs</text><text x="170" y="205" text-anchor="middle" font-size="11" fill="#3d5c4f">hidden layer</text><text x="290" y="205" text-anchor="middle" font-size="11" fill="#3d5c4f">output</text></svg>';
        D.$all('[data-in]', el).forEach(function (b) { b.setAttribute('aria-pressed', inp[+b.getAttribute('data-in')] ? 'true' : 'false'); });
        ['h1', 'h2'].forEach(function (k) { D.$('[data-w="' + k + '"]', el).textContent = cfg[k] ? 'weights ' + HID[cfg[k]][1] + ', ' + HID[cfg[k]][2] + ' · bias ' + HID[cfg[k]][3] : ''; });
        D.$('[data-w="o"]', el).textContent = cfg.o ? 'weights ' + OUT[cfg.o][1] + ', ' + OUT[cfg.o][2] + ' · bias ' + OUT[cfg.o][3] : '';
        var right = 0, rows = [[0, 0], [0, 1], [1, 0], [1, 1]].map(function (ab) {
          var q = run(ab[0], ab[1]), goal = ab[0] !== ab[1] ? 1 : 0, ok = q && q.o === goal; if (ok) right++;
          return '<tr class="' + (q ? (ok ? 'ok' : 'no') : '') + '"><td>' + ab[0] + '</td><td>' + ab[1] + '</td><td>' + (q ? q.h1 : '–') + '</td><td>' + (q ? q.h2 : '–') + '</td><td>' + (q ? (q.o ? '🔔 1' : '0') : '–') + '</td><td>' + (goal ? '🔔 1' : '0') + '</td></tr>';
        }).join('');
        D.$('#np-tt', el).innerHTML = rows;
        var fb = D.$('#np-fb', el);
        if (right === 4) { fb.className = 'feedback ok'; fb.innerHTML = '🏆 All 4 rows correct! Your hidden neurons each drew a simple line, and the output neuron <b>combined</b> them to solve what one neuron never could. That’s the secret power of neural networks: layers build complex ideas out of simple ones.'; api.done(); }
        else { fb.className = 'feedback'; fb.textContent = cfg.h1 && cfg.h2 && cfg.o ? right + '/4 rows correct. Tip: one hidden neuron could catch “at least one,” the other “not both.”' : 'Pick a job for all three neurons.'; }
      }
      D.$all('[data-c]', el).forEach(function (s) { s.addEventListener('change', function () { cfg[s.getAttribute('data-c')] = s.value; api.save({ cfg: cfg }); D.sfx('click'); draw(); }); });
      D.$all('[data-in]', el).forEach(function (b) { b.addEventListener('click', function () { var i = +b.getAttribute('data-in'); inp[i] = inp[i] ? 0 : 1; api.save({ inp: inp }); D.sfx('click'); draw(); }); });
      draw();
    },
  },
  quiz: [
    { q: 'What is a neural network?', a: ['Many artificial neurons connected in layers', 'A computer network for games', 'A single neuron', 'A type of spreadsheet'], c: 0, why: 'Neurons in layers pass numbers forward, each layer building on the last.' },
    { q: 'Why couldn’t ONE neuron solve the pass alarm (XOR)?', a: ['One neuron can only draw one straight line, and XOR needs more than that', 'It was too slow', 'It had no bias', 'XOR is unsolvable by any computer'], c: 0, why: 'Combining several neurons can carve out shapes one line can’t.' },
    { q: 'What does the hidden layer do?', a: ['Finds simpler patterns that later layers combine', 'Hides the answer from you', 'Stores passwords', 'Nothing'], c: 0, why: 'Hidden neurons are the network’s middle steps.' },
    { q: 'In a big image AI, early layers often detect edges. What might later layers detect?', a: ['Bigger shapes and whole objects, like eyes or wheels', 'Nothing new', 'Only colors', 'Sounds'], c: 0, why: 'Layer by layer: edges → shapes → objects. You’ll see this in the Blue Belt!' },
  ],
  challenge: {
    title: 'Single-Neuron Logic',
    intro: 'Use one neuron’s sliders to build an <b>AND</b> gate (fires only when both inputs are 1), then an <b>OR</b> gate (fires when at least one is 1).',
    css: `.sn-sl{display:grid;gap:6px}.sn-sl label{display:grid;font-weight:700;font-size:.9rem}.sn-sl input{width:100%;min-height:40px;accent-color:#16a36b}.sn-tt{width:100%;border-collapse:collapse;margin-top:8px;text-align:center;background:#fff}.sn-tt td,.sn-tt th{border:1px solid #0d2b1d22;padding:5px}.sn-tt .ok{background:#e3f6ea}.sn-tt .no{background:#fde7e4}`,
    js: function (el, api) {
      var D = api.D, S = api.load(), stage = S.stage || 0, W = S.w || { w1: 0, w2: 0, b: 0 };
      var GOALS = [['AND', function (a, b) { return a && b ? 1 : 0; }], ['OR', function (a, b) { return a || b ? 1 : 0; }]];
      el.innerHTML = '<p id="sn-goal" style="font-weight:800"></p><div class="sn-sl">' + [['w1', 'Weight 1', -2, 2], ['w2', 'Weight 2', -2, 2], ['b', 'Bias', -3, 3]].map(function (s) { return '<label>' + s[1] + ': <b data-v="' + s[0] + '"></b><input type="range" data-w="' + s[0] + '" min="' + s[2] + '" max="' + s[3] + '" step="0.5" value="' + W[s[0]] + '"></label>'; }).join('') + '</div><table class="sn-tt"><caption class="sr-only">Gate truth table</caption><thead><tr><th scope="col">In 1</th><th scope="col">In 2</th><th scope="col">Total</th><th scope="col">Fires?</th><th scope="col">Goal</th></tr></thead><tbody id="sn-tt"></tbody></table><p class="feedback" id="sn-fb" aria-live="polite"></p>';
      function draw() {
        if (stage >= 2) { D.$('#sn-goal', el).textContent = '🏆 Both gates built!'; D.$('#sn-fb', el).className = 'feedback ok'; D.$('#sn-fb', el).textContent = 'Every computer chip is built from logic gates like these, and a single neuron can act as one.'; api.done(); return; }
        var g = GOALS[stage]; D.$('#sn-goal', el).textContent = 'Goal: build an ' + g[0] + ' gate';
        var right = 0;
        D.$('#sn-tt', el).innerHTML = [[0, 0], [0, 1], [1, 0], [1, 1]].map(function (ab) { var t = W.w1 * ab[0] + W.w2 * ab[1] + W.b, f = t > 0 ? 1 : 0, ok = f === g[1](ab[0], ab[1]); if (ok) right++; return '<tr class="' + (ok ? 'ok' : 'no') + '"><td>' + ab[0] + '</td><td>' + ab[1] + '</td><td>' + t + '</td><td>' + (f ? '⚡ 1' : '0') + '</td><td>' + g[1](ab[0], ab[1]) + '</td></tr>'; }).join('');
        ['w1', 'w2', 'b'].forEach(function (k) { D.$('[data-v="' + k + '"]', el).textContent = W[k]; });
        if (right === 4) { D.sfx('win'); stage++; api.save({ stage: stage }); var fb = D.$('#sn-fb', el); fb.className = 'feedback ok'; fb.textContent = '✅ ' + g[0] + ' gate works!' + (stage < 2 ? ' Now build OR…' : ''); setTimeout(draw, 900); }
      }
      D.$all('[data-w]', el).forEach(function (r) { r.addEventListener('input', function () { W[r.getAttribute('data-w')] = +r.value; api.save({ w: W }); draw(); }); });
      draw();
    },
  },
};
