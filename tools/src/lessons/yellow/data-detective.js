module.exports = {
  hook: 'Missing values, impossible typos, sneaky duplicates, and one outlier that’s actually real. Can you crack the case?',
  story: [
    ['narr', '🔍 CASE FILE: The Suspicious Fitness Log'],
    ['sensei', '{{nick}}, a fitness app tracked a week of steps and sleep for an athlete. Something is off. Several things, actually.'],
    ['sensei', 'An <b>outlier</b> is a value very different from the rest. Sometimes it’s a <b>mistake</b>, like a typo. Sometimes it’s <b>real and important</b>. A great detective finds out which one it is instead of guessing.'],
    ['you', 'So I shouldn’t just delete every weird number?'],
    ['sensei', 'Exactly. Deleting real data is as bad as keeping fake data. Read the clues carefully.'],
  ],
  activity: {
    title: 'Crack the Data Case',
    instructions: 'Tap each row, then say what’s going on. Find all 4 problems, and don’t accuse innocent rows!',
    css: `
.dd-wrap{overflow-x:auto}
.dd{width:100%;border-collapse:collapse;min-width:340px;background:#fff}
.dd th,.dd td{border:1px solid #16181d33;padding:8px;text-align:left}
.dd thead th{background:#16181d;color:#ffd23f;font-family:var(--font-head);font-weight:400;letter-spacing:.04em}
.dd tbody tr{cursor:pointer}
.dd tbody tr:hover,.dd tbody tr:focus{background:#fff1c1;outline:none}
.dd tr.solved{background:#e3f6ea}.dd tr.cleared{background:#f2f4f7;color:#4a4f5c}
.dd td.miss{color:#b3261e;font-style:italic}
.dd-ask{margin-top:12px;background:#fff1c1;border-radius:10px;padding:12px}
.dd-ask .row button{flex:1 1 140px}
.dd-score{font-weight:800}
`,
    js: function (el, api) {
      var D = api.D;
      var R = [
        ['Mon', '8,200', '9', '', 'ok'], ['Tue', '7,900', '8.5', '', 'ok'], ['Wed', '', '9', '', 'miss'], ['Thu', '8,100', '90', '', 'typo'],
        ['Fri', '21,500', '9', 'Tournament day 🏆', 'real'], ['Sat', '7,600', '10', '', 'ok'], ['Sat', '7,600', '10', '', 'dup'], ['Sun', '8,300', '9', '', 'ok'],
      ];
      var C = [['miss', '🕳️ Missing value'], ['typo', '🤪 Impossible value (typo)'], ['dup', '👯 Duplicate row'], ['real', '🌟 Real but unusual'], ['ok', '✅ Looks fine']];
      var WHY = { miss: 'Wednesday’s steps are blank. The tracker may have been off, so the value is missing.', typo: '90 hours of sleep in one day is impossible (a day has 24 hours!). Probably a typo for 9.', dup: 'Saturday appears twice with identical values: a duplicate that would count that day double.', real: 'A huge number, but the note explains it: tournament day. It’s a real outlier, so keep it!', ok: 'Nothing suspicious here.' };
      var S = api.load(), solved = S.solved || {}, cur = null;
      el.innerHTML = '<div class="dd-wrap"><table class="dd"><caption class="sr-only">Fitness log for one week</caption><thead><tr><th scope="col">Day</th><th scope="col">Steps</th><th scope="col">Sleep (h)</th><th scope="col">Note</th></tr></thead><tbody>' +
        R.map(function (r, i) { return '<tr tabindex="0" data-i="' + i + '"><td>' + r[0] + '</td><td class="' + (r[1] ? '' : 'miss') + '">' + (r[1] || '(blank)') + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td></tr>'; }).join('') +
        '</tbody></table></div><p class="dd-score" id="dd-score" aria-live="polite"></p><div id="dd-ask" aria-live="polite"></div>';
      function score() {
        var n = Object.keys(solved).filter(function (k) { return R[k][4] !== 'ok'; }).length;
        D.$('#dd-score', el).textContent = '🔍 Problems found: ' + n + ' / 4';
        D.$all('tbody tr', el).forEach(function (tr) { var i = tr.getAttribute('data-i'); tr.classList.toggle('solved', !!solved[i] && R[i][4] !== 'ok'); tr.classList.toggle('cleared', !!solved[i] && R[i][4] === 'ok'); });
        if (n === 4) { D.$('#dd-ask', el).innerHTML = '<p class="feedback ok">🏆 Case closed! You found the missing value, the typo and the duplicate — and you protected the real outlier instead of deleting it. That’s how data detectives work.</p>'; api.done(); }
      }
      function ask(i) {
        cur = i; var r = R[i];
        var box = D.$('#dd-ask', el);
        box.innerHTML = '<div class="dd-ask"><p><b>' + r[0] + ':</b> ' + (r[1] || '(blank)') + ' steps, ' + r[2] + ' h sleep' + (r[3] ? ' · “' + r[3] + '”' : '') + '. What’s going on?</p><div class="row">' + C.map(function (c) { return '<button type="button" class="btn small" data-v="' + c[0] + '">' + c[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p></div>';
        D.$all('button', box).forEach(function (b) {
          b.addEventListener('click', function () {
            var v = b.getAttribute('data-v'), f = box.querySelector('.feedback');
            if (v === r[4]) { D.sfx('good'); solved[i] = true; api.save({ solved: solved }); f.className = 'feedback ok'; f.textContent = '✅ ' + WHY[v]; score(); }
            else { D.sfx('bad'); b.disabled = true; f.className = 'feedback no'; f.textContent = 'Not quite. Look at every column in this row, including the note.'; }
          });
        });
      }
      D.$all('tbody tr', el).forEach(function (tr) {
        tr.addEventListener('click', function () { ask(+tr.getAttribute('data-i')); });
        tr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ask(+tr.getAttribute('data-i')); } });
      });
      score();
    },
  },
  quiz: [
    { q: 'What is an outlier?', a: ['A data point very different from the rest', 'Any number bigger than 10', 'A missing value', 'The average'], c: 0, why: 'Outliers stand out. They might be mistakes, or real and important.' },
    { q: 'Friday had 21,500 steps — tournament day. What should you do with it?', a: ['Keep it — it’s real, and note why it’s unusual', 'Delete it because it’s big', 'Change it to 8,000', 'Delete the whole week'], c: 0, why: 'Deleting real data hides the truth. Investigate before removing anything.' },
    { q: 'Why is a duplicate row a problem?', a: ['It counts the same thing twice, skewing totals and averages', 'Duplicates make data prettier', 'It isn’t a problem', 'It deletes other rows'], c: 0, why: 'Double-counting makes that day look twice as important as it was.' },
    { q: 'Sleep = 90 hours in one day. How do you know it’s a mistake?', a: ['It’s impossible — a day only has 24 hours', 'It’s too small', 'Sleep can’t be measured', 'It’s on a Thursday'], c: 0, why: 'Checking whether a value is even possible is a data detective’s first move.' },
  ],
  challenge: {
    title: 'The Fix-It Plan',
    intro: 'Finding problems is half the job. Choose the best fix for each. Get 3 of 4.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'Wednesday’s steps are missing. Best fix?', a: ['Find the real value if possible — otherwise leave it out and say so', 'Make up a number that looks nice', 'Copy Thursday’s number without telling anyone', 'Delete the whole dataset'], c: 0, why: 'Inventing data is worse than admitting a gap.' },
        { q: 'Sleep says 90 hours. Best fix?', a: ['Check the original source; it was probably 9 — fix it and note the change', 'Keep it', 'Change it to 24', 'Ignore sleep forever'], c: 0, why: 'Verify, fix, and keep a record of what you changed.' },
        { q: 'Saturday appears twice. Best fix?', a: ['Remove the extra copy', 'Keep both', 'Delete both', 'Add a third copy'], c: 0, why: 'One real day = one row.' },
        { q: 'Tournament day: 21,500 steps. Best fix?', a: ['Keep it, and note that it was a special day', 'Delete it', 'Divide it by 2', 'Replace it with the average'], c: 0, why: 'Real outliers are part of the true story.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
