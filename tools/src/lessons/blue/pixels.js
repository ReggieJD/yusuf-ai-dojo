module.exports = {
  hook: 'Zoom into any photo far enough and it turns into tiny colored squares. And every square is secretly just numbers.',
  story: [
    ['sensei', '{{nick}}, how does a computer “see” a photo? It has no eyes. It only understands numbers.'],
    ['sensei', 'A digital image is a grid of tiny squares called <b>pixels</b>. Each pixel stores its color as numbers. A phone photo can have <b>12 million</b> pixels or more!'],
    ['you', 'So a photo is really a giant spreadsheet?'],
    ['sensei', 'That’s exactly right. When AI “looks” at an image, it’s really reading a huge grid of numbers. Zoom in and see for yourself.'],
  ],
  activity: {
    title: 'Pixel Zoom Explorer',
    instructions: 'Choose a picture, zoom all the way in, then tap 3 different pixels to reveal their secret numbers.',
    css: `
.pz-pick{display:flex;gap:8px;margin-bottom:10px}
.pz-pick button{min-height:48px;padding:6px 14px;border:3px solid #0a1a33;background:#fff;font:800 .95rem var(--font-head);cursor:pointer;color:#0a1a33}
.pz-pick button[aria-pressed="true"]{background:#0a1a33;color:#7fb2ff}
.pz-stage{display:flex;min-height:300px;background:repeating-conic-gradient(#eef5ff 0 25%,#fff 0 50%) 0 0/16px 16px;border:3px solid #0a1a33;overflow:auto;padding:8px}
.pz-grid{display:grid;gap:var(--g,0px);background:#0a1a33;margin:auto;flex:none}
.pz-grid button{border:0;padding:0;margin:0;cursor:pointer;width:var(--c);height:var(--c);display:grid;place-items:center;font:700 7px/1 ui-monospace,monospace;overflow:hidden}
.pz-grid button:focus{outline:3px solid #ffd23f;outline-offset:-3px;z-index:2}
.pz-zoom{display:grid;gap:4px;margin:10px 0;font-weight:800}
.pz-zoom input{width:100%;min-height:44px;accent-color:#1f6feb}
.pz-read{font:800 1rem ui-monospace,Menlo,monospace;background:#0a1a33;color:#7fb2ff;padding:10px 12px;min-height:3em}
.pz-read .sw{display:inline-block;width:20px;height:20px;border:2px solid #fff;vertical-align:middle;margin-right:8px}
.pz-m{background:var(--bg2);padding:10px 12px;margin-top:10px}
.pz-m .row button{flex:1 1 90px}
`,
    js: function (el, api) {
      var D = api.D;
      var PAL = { '.': [236, 243, 255], k: [26, 26, 46], y: [255, 210, 63], r: [230, 57, 70], w: [255, 255, 255], o: [255, 140, 66] };
      var ART = {
        smile: ['....kkkk....', '..kkyyyykk..', '.kyyyyyyyyk.', '.kyykyykyyk.', 'kyyykyykyyyk', 'kyyyyyyyyyyk', 'kyykyyyykyyk', 'kyyykkkkyyyk', '.kyyyyyyyyk.', '.kyyyyyyyyk.', '..kkyyyykk..', '....kkkk....'],
        heart: ['............', '..rr....rr..', '.rwrr..rrrr.', 'rwrrrrrrrrrr', 'rrrrrrrrrrrr', 'rrrrrrrrrrrr', '.rrrrrrrrrr.', '..rrrrrrrr..', '...rrrrrr...', '....rrrr....', '.....rr.....', '............'],
        ball: ['....kkkk....', '..kkookokk..', '.kooookooook', '.koooookoook', 'kooooookookk', 'kkkkkkkkkkkk', 'kkookooooook', 'koookoooooko', 'koooko ooook'.replace(' ', 'o'), '.kooookooook', '..kkookookk.', '....kkkk....'],
      };
      var S = api.load(), pic = S.pic || 'smile', zoom = S.zoom || 1, tapped = S.tapped || {}, m = S.m || 0;
      el.innerHTML = '<div class="pz-pick" role="group" aria-label="Choose a picture">' + [['smile', '🙂 Smile'], ['heart', '❤️ Heart'], ['ball', '🏀 Ball']].map(function (p) { return '<button type="button" data-p="' + p[0] + '">' + p[1] + '</button>'; }).join('') +
        '</div><div class="pz-stage"><div class="pz-grid" id="pz-grid"></div></div><div class="pz-zoom"><label for="pz-z">🔍 Zoom: <span id="pz-zv"></span></label><input id="pz-z" type="range" min="1" max="8" step="1" value="' + zoom + '"></div><div class="pz-read" id="pz-read" aria-live="polite">Zoom in and tap a pixel…</div><div class="pz-m" id="pz-m" aria-live="polite"></div>';
      function draw() {
        var rows = ART[pic], c = [3, 6, 10, 14, 18, 22, 26, 30][zoom - 1], g = D.$('#pz-grid', el);
        g.style.setProperty('--c', c + 'px'); g.style.setProperty('--g', zoom >= 4 ? '1px' : '0px'); g.style.gridTemplateColumns = 'repeat(12,' + c + 'px)';
        var h = ''; rows.forEach(function (r, y) { for (var x = 0; x < 12; x++) { var col = PAL[r[x]] || PAL['.']; var lum = (col[0] * 299 + col[1] * 587 + col[2] * 114) / 1000; h += '<button type="button" data-x="' + x + '" data-y="' + y + '" aria-label="Pixel column ' + (x + 1) + ', row ' + (y + 1) + '" style="background:rgb(' + col.join(',') + ');color:' + (lum > 140 ? '#0a1a33' : '#fff') + '">' + (zoom >= 8 ? col[0] : '') + '</button>'; } });
        g.innerHTML = h;
        D.$('#pz-zv', el).textContent = zoom + '× ' + (zoom === 1 ? '(a tiny picture)' : zoom >= 8 ? '(every pixel visible!)' : '');
        D.$all('[data-p]', el).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-p') === pic ? 'true' : 'false'); });
        D.$all('.pz-grid button', g).forEach(function (b) {
          b.addEventListener('click', function () {
            var x = +b.getAttribute('data-x'), y = +b.getAttribute('data-y'), col = PAL[ART[pic][y][x]] || PAL['.'];
            D.$('#pz-read', el).innerHTML = '<span class="sw" style="background:rgb(' + col.join(',') + ')"></span>Pixel (' + (x + 1) + ', ' + (y + 1) + ') = R ' + col[0] + ' · G ' + col[1] + ' · B ' + col[2];
            if (zoom >= 6) { tapped[pic + x + ',' + y] = 1; api.save({ tapped: tapped }); }
            D.sfx('click'); mission();
          });
        });
        mission();
      }
      function mission() {
        var box = D.$('#pz-m', el), n = Object.keys(tapped).length;
        if (m === 0) { box.innerHTML = '<p><b>Mission 1:</b> Zoom all the way to 8×.</p>'; if (zoom === 8) { m = 1; api.save({ m: 1 }); D.sfx('good'); } else return; }
        if (m === 1) { box.innerHTML = '<p><b>Mission 2:</b> Tap 3 different pixels to read their numbers. (' + Math.min(n, 3) + '/3)</p>'; if (n >= 3) { m = 2; api.save({ m: 2 }); } else return; }
        if (m === 2) {
          box.innerHTML = '<p><b>Mission 3:</b> Each pixel needs 3 numbers (red, green, blue). This picture is 12 × 12 pixels. How many numbers does the computer store?</p><div class="row">' + D.shuffle([[1, '432'], [0, '144'], [0, '36'], [0, '12']]).map(function (o) { return '<button type="button" class="btn small" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p>';
          D.$all('[data-ok]', box).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-ok') === '1') { m = 3; api.save({ m: 3 }); D.sfx('win'); mission(); } else { D.sfx('bad'); b.disabled = true; box.querySelector('.feedback').className = 'feedback no'; box.querySelector('.feedback').textContent = '12 × 12 = 144 pixels… and each pixel has 3 numbers.'; } }); });
          return;
        }
        box.innerHTML = '<p class="feedback ok">🏆 12 × 12 × 3 = 432 numbers for one tiny picture! A 12-megapixel photo needs about 36 million. That’s what AI vision chews through.</p>'; api.done();
      }
      D.$all('[data-p]', el).forEach(function (b) { b.addEventListener('click', function () { pic = b.getAttribute('data-p'); api.save({ pic: pic }); draw(); }); });
      D.$('#pz-z', el).addEventListener('input', function () { zoom = +this.value; api.save({ zoom: zoom }); draw(); });
      draw();
    },
  },
  quiz: [
    { q: 'What is a pixel?', a: ['One tiny square of color in a digital image', 'A type of camera', 'A small robot', 'A computer virus'], c: 0, why: 'Images are grids of pixels.' },
    { q: 'How does a computer store a pixel’s color?', a: ['As numbers', 'As paint', 'As a sound', 'It can’t store color'], c: 0, why: 'Usually three numbers: red, green and blue.' },
    { q: 'When AI “looks” at a photo, what is it really working with?', a: ['A big grid of numbers', 'The real object', 'Feelings', 'Words only'], c: 0, why: 'Computer vision is math on pixel numbers.' },
    { q: 'An image is 10 × 10 pixels with 3 color numbers each. How many numbers in total?', a: ['300', '100', '30', '13'], c: 0, why: '10 × 10 = 100 pixels × 3 = 300.' },
  ],
  challenge: {
    title: 'Paint by Numbers',
    intro: 'Here’s an image stored as numbers: <b>1 = black pixel</b>, <b>0 = white pixel</b>. Paint the grid to match, and see what it reveals!',
    css: `.pn{display:grid;gap:10px}@media(min-width:600px){.pn{grid-template-columns:1fr 1fr}}.pn-nums{font:700 .95rem/1.4 ui-monospace,Menlo,monospace;background:#0a1a33;color:#7fb2ff;padding:10px;white-space:pre;overflow:auto}.pn-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:2px;background:#0a1a33;padding:2px;max-width:280px}.pn-grid button{aspect-ratio:1;border:0;background:#fff;cursor:pointer;min-width:0}.pn-grid button[aria-pressed="true"]{background:#0a1a33;box-shadow:inset 0 0 0 1px #1f6feb}`,
    js: function (el, api) {
      var D = api.D;
      var T = ['00000000', '01100110', '11111111', '11111111', '11111111', '01111110', '00111100', '00011000'];
      var S = api.load(), G = S.g || T.map(function () { return '00000000'; });
      el.innerHTML = '<div class="pn"><div class="pn-nums" aria-label="Number grid">' + T.join('\n').replace(/(\d)/g, '$1 ') + '</div><div><div class="pn-grid" id="pn-g"></div><p class="feedback" id="pn-fb" aria-live="polite"></p></div></div>';
      function draw() {
        D.$('#pn-g', el).innerHTML = G.map(function (r, y) { return r.split('').map(function (v, x) { return '<button type="button" data-x="' + x + '" data-y="' + y + '" aria-pressed="' + (v === '1') + '" aria-label="Row ' + (y + 1) + ' column ' + (x + 1) + '"></button>'; }).join(''); }).join('');
        D.$all('#pn-g button', el).forEach(function (b) { b.addEventListener('click', function () { var x = +b.getAttribute('data-x'), y = +b.getAttribute('data-y'), r = G[y].split(''); r[x] = r[x] === '1' ? '0' : '1'; G[y] = r.join(''); api.save({ g: G }); draw(); D.$('#pn-g button[data-x="' + x + '"][data-y="' + y + '"]', el).focus(); }); });
        var wrong = 0; G.forEach(function (r, y) { for (var x = 0; x < 8; x++) if (r[x] !== T[y][x]) wrong++; });
        var fb = D.$('#pn-fb', el);
        if (!wrong) { fb.className = 'feedback ok'; fb.textContent = '❤️ A heart! You just “decoded” an image from numbers, exactly how a computer draws one.'; api.done(); }
        else { fb.className = 'feedback'; fb.textContent = wrong + ' pixel' + (wrong > 1 ? 's' : '') + ' still different.'; }
      }
      draw();
    },
  },
};
