module.exports = {
  hook: 'Every AI is built on data. But what IS data? Turn a messy scouting report into a clean table, the way real data scientists do.',
  story: [
    ['sensei', 'Welcome to the Yellow Belt arena, {{nick}}. Before any AI can learn, it needs one thing: <b>data</b>.'],
    ['you', 'Data… like numbers?'],
    ['sensei', 'Numbers, yes. But also words, photos, sounds, clicks, scores: any facts we <b>collect</b> so we can study them. Even {{T.hero}} is full of data: every move, every score, every practice.'],
    ['sensei', 'Messy facts are hard for a computer to use. So data scientists organize them into <b>tables</b>. Each <b>row</b> is one example. Each <b>column</b> is one kind of fact, called a <b>feature</b>.'],
    ['sensei', 'Our dojo scout wrote notes about four students. Turn them into a table!'],
  ],
  activity: {
    title: 'Build the Data Table',
    instructions: 'Read the scout’s notes. Fill in every cell using the drop-down menus, then press Check.',
    css: `
.dt-notes{background:#fff;border:2px dashed #16181d55;border-radius:10px;padding:12px 14px;font-family:"Bradley Hand","Segoe Print","Comic Sans MS",cursive;font-size:1.02rem;line-height:1.5;margin-bottom:12px;transform:rotate(-.4deg)}
.dt-wrap{overflow-x:auto}
.dt{border-collapse:collapse;width:100%;min-width:320px}
.dt th,.dt td{border:2px solid #16181d;padding:6px;text-align:center}
.dt thead th{background:#16181d;color:#ffd23f;font-family:var(--font-head);letter-spacing:.04em;font-weight:400}
.dt tbody th{background:#fff1c1}
.dt select{width:100%;min-height:44px;font:700 1rem var(--font-body);border-radius:8px;border:2px solid #16181d55;background:#fff;color:#16181d}
.dt td.ok select{border-color:#1b7f4b;background:#e3f6ea}.dt td.no select{border-color:#b3261e;background:#fde7e4}
.dt-q{margin-top:14px;padding:12px;border-radius:10px;background:#fff1c1}
.dt-q .row button{flex:1;min-width:140px}
`,
    js: function (el, api) {
      var D = api.D;
      var rows = [['Zara', '11', 'Green', '32'], ['Omar', '10', 'Yellow', '25'], ['Lina', '12', 'Blue', '40'], ['Sam', '9', 'White', '18']];
      var cols = ['Name', 'Age', 'Belt', 'Push-ups'];
      var notes = 'Zara is 11 and wears a green belt. She did 32 push-ups in one minute. Omar is 10, has a yellow belt, and did 25 push-ups. Lina, age 12, crushed 40 push-ups — her belt is blue. Sam is 9 and just started (white belt): 18 push-ups.';
      var S = api.load(), picks = S.picks || {};
      function opts(c) { var v = rows.map(function (r) { return r[c]; }).slice().sort(); return '<option value="">—</option>' + v.map(function (x) { return '<option>' + x + '</option>'; }).join(''); }
      el.innerHTML = '<div class="dt-notes"><b>📝 Scout’s notes:</b> ' + notes + '</div><div class="dt-wrap"><table class="dt"><caption class="sr-only">Dojo students data table</caption><thead><tr>' + cols.map(function (c) { return '<th scope="col">' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
        rows.map(function (r, ri) { return '<tr><th scope="row">' + r[0] + '</th>' + [1, 2, 3].map(function (c) { return '<td><select aria-label="' + r[0] + ' ' + cols[c] + '" data-k="' + ri + '-' + c + '">' + opts(c) + '</select></td>'; }).join('') + '</tr>'; }).join('') +
        '</tbody></table></div><p class="row" style="margin-top:12px"><button type="button" class="btn primary" id="dt-check">✔ Check table</button></p><p class="feedback" id="dt-fb" aria-live="polite"></p><div id="dt-q"></div>';
      D.$all('select', el).forEach(function (s) {
        var k = s.getAttribute('data-k'); if (picks[k]) s.value = picks[k];
        s.addEventListener('change', function () { picks[k] = s.value; api.save({ picks: picks }); s.parentNode.className = ''; });
      });
      var qStep = S.q || 0;
      function questions() {
        var Q = [
          ['In your table, what is ONE ROW?', ['One example — everything about one student', 'One kind of fact about every student', 'The whole dataset'], 0, 'Each row is one example. AI learns from many examples.'],
          ['What is ONE COLUMN?', ['One feature — the same kind of fact for every student', 'One student', 'A mistake in the table'], 0, 'Each column is a feature, like “Age” or “Push-ups.” AI looks for patterns across features.'],
        ];
        var box = D.$('#dt-q', el);
        if (qStep >= Q.length) { box.innerHTML = '<p class="feedback ok">🏆 Table complete and understood! You just turned messy notes into <b>structured data</b> — the fuel for machine learning.</p>'; api.done(); return; }
        var q = Q[qStep];
        box.innerHTML = '<div class="dt-q"><p><b>' + q[0] + '</b></p><div class="row">' + q[1].map(function (a, i) { return '<button type="button" class="btn small" data-i="' + i + '">' + a + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p></div>';
        D.$all('button', box).forEach(function (b) {
          b.addEventListener('click', function () {
            var f = box.querySelector('.feedback');
            if (+b.getAttribute('data-i') === q[2]) { D.sfx('good'); qStep++; api.save({ q: qStep }); f.className = 'feedback ok'; f.textContent = '✅ ' + q[3]; setTimeout(questions, 900); }
            else { D.sfx('bad'); b.disabled = true; f.className = 'feedback no'; f.textContent = 'Not quite — look at how the table is laid out.'; }
          });
        });
      }
      function check() {
        var wrong = 0, blank = 0;
        D.$all('select', el).forEach(function (s) {
          var k = s.getAttribute('data-k').split('-'), want = rows[+k[0]][+k[1]];
          if (!s.value) { blank++; s.parentNode.className = ''; } else { var ok = s.value === want; if (!ok) wrong++; s.parentNode.className = ok ? 'ok' : 'no'; }
        });
        var fb = D.$('#dt-fb', el);
        if (blank) { fb.className = 'feedback no'; fb.textContent = blank + ' empty cell' + (blank > 1 ? 's' : '') + ' left. Fill them all!'; return false; }
        if (wrong) { fb.className = 'feedback no'; fb.textContent = wrong + ' cell' + (wrong > 1 ? 's don’t' : ' doesn’t') + ' match the notes. Re-read carefully — data must be accurate!'; D.sfx('bad'); return false; }
        fb.className = 'feedback ok'; fb.textContent = '✅ Perfect table! 4 rows × 4 columns = 16 pieces of data.'; D.sfx('good'); api.save({ ok: true }); questions(); return true;
      }
      D.$('#dt-check', el).addEventListener('click', check);
      if (S.ok) check();
    },
  },
  quiz: [
    { q: 'What is data?', a: ['Facts — numbers, words, pictures, sounds — collected so they can be studied', 'Only numbers', 'Only things stored on a computer', 'Secret information'], c: 0, why: 'Data can be almost any recorded fact: scores, photos, voice clips, words and more.' },
    { q: 'In a data table, each ROW is usually…', a: ['One example (like one student)', 'One kind of fact', 'The title of the table', 'A mistake'], c: 0, why: 'Rows are examples; columns are features.' },
    { q: 'Which of these could be data for an AI?', a: ['All of these: photos, voice recordings, game scores and text messages', 'Only numbers', 'Only photos', 'Nothing from real life'], c: 0, why: 'AI can learn from many kinds of data — that’s why face unlock, voice assistants and chatbots all exist.' },
    { q: '“Belt color” is what kind of data?', a: ['A category — one of a set of groups', 'A number you can average', 'A sound', 'An image'], c: 0, why: 'Categories are labels like colors or team names. You can count them, but you can’t average “Green” and “Blue.”' },
  ],
  challenge: {
    title: 'Data Type Sorter',
    intro: 'Data comes in different <b>types</b>. Sort each piece of data into its type. Get 6 of 8.',
    js: function (el, api) {
      api.D.sorter(el, api, {
        choices: [['n', '🔢 Number'], ['c', '🏷️ Category'], ['t', '📝 Text'], ['i', '🖼️ Image'], ['s', '🔊 Sound']],
        items: [['Height: 152 cm', 'n', 'A measurement you can compare and average.'], ['Favorite team: Hawks', 'c', 'One choice from a set of groups.'], ['A photo of a cat', 'i', 'Images are grids of pixels (Blue Belt!).'], ['A voice memo', 's', 'Sound can be stored as numbers too (Blue Belt!).'], ['A review: “Best game ever!”', 't', 'Free-form words are text data.'], ['Temperature: 22 °C', 'n', 'A number with a unit.'], ['T-shirt size: M', 'c', 'S, M, L are categories — even though they have an order.'], ['A recording of a dog barking', 's', 'Audio data.']],
        need: 6, win: 'AI builders use different tools for different data types, and you can now tell them apart.',
      });
    },
  },
};
