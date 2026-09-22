module.exports = {
  hook: 'Your screen makes millions of colors from just three lights: red, green and blue. Mix them with numbers and match the targets.',
  story: [
    ['sensei', 'Look very closely at a screen, {{nick}}, with a magnifying glass. Each pixel is made of three tiny lights: <b>red</b>, <b>green</b> and <b>blue</b>.'],
    ['sensei', 'Each light gets a number from <b>0</b> (off) to <b>255</b> (full brightness). Mix the three and you get about <b>16.7 million</b> colors. That’s 256 × 256 × 256!'],
    ['you', 'So yellow is… a number?'],
    ['sensei', 'Three numbers! Mixing light works differently from mixing paint. Red light plus green light makes yellow. Try it!'],
  ],
  activity: {
    title: 'The RGB Mixer',
    instructions: 'Slide red, green and blue to match each target color. You’re close enough when the match meter is 90% or more.',
    css: `
.rg{display:grid;gap:12px}
@media(min-width:640px){.rg{grid-template-columns:1fr 1fr}}
.rg-sw{display:grid;grid-template-columns:1fr 1fr;border:3px solid #0a1a33;min-height:150px}
.rg-sw div{display:grid;place-items:end center;padding:6px;font:800 .8rem var(--font-head)}
.rg-sw span{background:#fffd;padding:2px 6px;color:#0a1a33}
.rg-sl label{display:grid;grid-template-columns:70px 1fr 44px;gap:8px;align-items:center;font-weight:800;margin-bottom:6px}
.rg-sl input{width:100%;min-height:44px}
.rg-sl .r input{accent-color:#e63946}.rg-sl .g input{accent-color:#2a9d8f}.rg-sl .b input{accent-color:#1f6feb}
.rg-code{font:800 1rem ui-monospace,Menlo,monospace;background:#0a1a33;color:#7fb2ff;padding:8px 10px}
.rg-t{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rg-t span{padding:4px 10px;border:2px solid #0a1a33;font-weight:800;font-size:.85rem}
.rg-t span.ok{background:#e3f6ea}
`,
    js: function (el, api) {
      var D = api.D;
      var TG = [['Banana yellow', [255, 230, 0]], ['Basketball orange', [255, 120, 20]], ['Midnight purple', [90, 30, 160]], ['Pure white', [255, 255, 255]]];
      var S = api.load(), c = S.c || [0, 0, 0], t = S.t || 0;
      el.innerHTML = '<div class="rg"><div><div class="rg-sw"><div id="rg-you"><span>YOU</span></div><div id="rg-tgt"><span id="rg-tn"></span></div></div><div class="meter" style="margin-top:8px" aria-hidden="true"><i id="rg-m"></i></div><p id="rg-mt" style="font-weight:800;margin:4px 0" aria-live="polite"></p></div>' +
        '<div class="rg-sl">' + [['r', 'Red'], ['g', 'Green'], ['b', 'Blue']].map(function (k, i) { return '<label class="' + k[0] + '"><span>' + k[1] + '</span><input type="range" min="0" max="255" step="5" data-i="' + i + '" value="' + c[i] + '"><b data-v="' + i + '"></b></label>'; }).join('') + '<p class="rg-code" id="rg-code"></p></div></div><div class="rg-t" id="rg-t"></div><p class="feedback" id="rg-fb" aria-live="polite"></p>';
      function match() { var T = TG[Math.min(t, TG.length - 1)][1], d = Math.sqrt(Math.pow(c[0] - T[0], 2) + Math.pow(c[1] - T[1], 2) + Math.pow(c[2] - T[2], 2)); return Math.max(0, Math.round(100 - d / 4.41)); }
      function draw() {
        D.$('#rg-you', el).style.background = 'rgb(' + c.join(',') + ')';
        [0, 1, 2].forEach(function (i) { D.$('[data-v="' + i + '"]', el).textContent = c[i]; });
        D.$('#rg-code', el).textContent = 'rgb(' + c.join(', ') + ')';
        D.$('#rg-t', el).innerHTML = TG.map(function (x, i) { return '<span class="' + (i < t ? 'ok' : '') + '">' + (i < t ? '✅ ' : '') + x[0] + '</span>'; }).join('');
        var fb = D.$('#rg-fb', el);
        if (t >= TG.length) { D.$('#rg-tgt', el).style.background = '#eef5ff'; D.$('#rg-tn', el).textContent = 'ALL DONE'; D.$('#rg-m', el).style.width = '100%'; D.$('#rg-mt', el).textContent = ''; fb.className = 'feedback ok'; fb.innerHTML = '🏆 Color master! You noticed that red + green light = yellow, and all three at 255 = white. Every color on your screen is just three numbers.'; api.done(); return; }
        var T = TG[t]; D.$('#rg-tgt', el).style.background = 'rgb(' + T[1].join(',') + ')'; D.$('#rg-tn', el).textContent = 'TARGET: ' + T[0];
        var m = match(); D.$('#rg-m', el).style.width = m + '%'; D.$('#rg-mt', el).textContent = 'Match: ' + m + '%';
        if (m >= 90) { t++; api.save({ t: t }); D.sfx('good'); D.toast('🎯 ' + T[0] + ' matched!'); setTimeout(draw, 300); }
      }
      D.$all('.rg-sl input', el).forEach(function (r) { r.addEventListener('input', function () { c[+r.getAttribute('data-i')] = +r.value; api.save({ c: c }); draw(); }); });
      draw();
    },
  },
  quiz: [
    { q: 'What do the letters RGB stand for?', a: ['Red, Green, Blue', 'Really Good Brightness', 'Rainbow, Gold, Black', 'Robot, Game, Bot'], c: 0, why: 'Screens mix red, green and blue light.' },
    { q: 'What color is rgb(0, 0, 0)?', a: ['Black — all lights off', 'White', 'Red', 'Gray'], c: 0, why: 'No light = black.' },
    { q: 'What color is rgb(255, 255, 255)?', a: ['White — all lights at full', 'Black', 'Yellow', 'Blue'], c: 0, why: 'All three lights at full brightness make white.' },
    { q: 'Red light + green light makes…', a: ['Yellow', 'Brown', 'Purple', 'Black'], c: 0, why: 'Light mixes differently from paint. Red + green light = yellow!' },
  ],
  challenge: {
    title: 'Name That Color',
    intro: 'Read the numbers, picture the color. No mixer allowed! Get 4 of 5.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'rgb(255, 0, 0)', a: ['Bright red', 'Bright green', 'Black', 'White'], c: 0, why: 'Only the red light is on.' },
        { q: 'rgb(0, 0, 255)', a: ['Bright blue', 'Red', 'Yellow', 'White'], c: 0, why: 'Only the blue light is on.' },
        { q: 'rgb(128, 128, 128)', a: ['Gray', 'Pink', 'Black', 'Orange'], c: 0, why: 'Equal medium amounts of all three = gray.' },
        { q: 'rgb(255, 0, 255)', a: ['Magenta (pink-purple)', 'Green', 'Yellow', 'Cyan'], c: 0, why: 'Red + blue light = magenta.' },
        { q: 'rgb(0, 255, 255)', a: ['Cyan (bright aqua)', 'Red', 'Magenta', 'Black'], c: 0, why: 'Green + blue light = cyan.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 4) api.done(); } });
    },
  },
};
