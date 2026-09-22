module.exports = {
  hook: 'Two players with the SAME skill. The AI picks one and rejects the other. Investigate the Tryout Bot, find the bias, and fix it.',
  story: [
    ['sensei', 'A league built a <b>Tryout Bot</b> to help pick players, {{nick}}. It learned from years of past tryout results.'],
    ['sensei', 'But something’s wrong. Kids from <b>Club B</b> keep getting rejected, even great players. The bot isn’t “mean.” It learned a pattern from its <b>data</b>.'],
    ['you', 'So the data was unfair?'],
    ['sensei', 'Unbalanced data can make an AI treat groups unfairly. That’s called <b>bias</b>. (It’s a different meaning from the “bias” number inside a neuron!) Let’s investigate like a fairness engineer.'],
  ],
  activity: {
    title: 'Investigate the Tryout Bot',
    instructions: 'Step 1: test two equally skilled players. Step 2: inspect the training data and find the cause. Step 3: apply a fix, then re-test.',
    css: `
.bf-ap{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}
.bf-card{border-radius:14px;padding:10px;background:var(--bg2);border:2px solid #f5c54244;text-align:center}
.bf-card b{display:block;font-size:1.6rem;color:#f5c542}
.bf-card.yes{box-shadow:inset 0 0 0 3px #3ccf7a}.bf-card.no{box-shadow:inset 0 0 0 3px #ff6b6b}
.bf-data{width:100%;border-collapse:collapse;font-size:.9rem;margin-top:6px}
.bf-data th,.bf-data td{border:1px solid #f5c54233;padding:6px;text-align:center}
.bf-data thead th{background:#2a2a2a;color:#f5c542}
.bf-step{background:var(--bg2);border-radius:12px;padding:10px 12px;margin-top:10px}
.bf-step .row button{flex:1 1 170px}
.bf-fix label{display:flex;gap:8px;align-items:center;min-height:44px;font-weight:700}
.bf-fix input{width:22px;height:22px;accent-color:#f5c542}
`,
    js: function (el, api) {
      var D = api.D;
      var S = api.load(), step = S.step || 0, useClub = S.useClub !== false, addB = !!S.addB, asked = !!S.asked;
      function data() { return { A: { tried: 20, picked: 10 }, B: addB ? { tried: 22, picked: 11 } : { tried: 2, picked: 0 } }; }
      function score(skill, club) { var d = data()[club], rate = d.picked / d.tried; return Math.round(skill * 6 + (useClub ? rate * 40 : 20)); }
      function render() {
        var d = data(), sA = score(8, 'A'), sB = score(8, 'B');
        var h = '<div class="bf-ap"><div class="bf-card ' + (sA >= 60 ? 'yes' : 'no') + '">🧑 Player from Club A<br>Skill 8/10<b>' + sA + '</b>' + (sA >= 60 ? '✅ Picked' : '❌ Rejected') + '</div><div class="bf-card ' + (sB >= 60 ? 'yes' : 'no') + '">🧑 Player from Club B<br>Skill 8/10<b>' + sB + '</b>' + (sB >= 60 ? '✅ Picked' : '❌ Rejected') + '</div></div><p style="font-size:.88rem">Bot rule: 60 or more = picked.</p>';
        if (step === 0) h += '<div class="bf-step"><p><b>Step 1:</b> Both players have the same skill. Is the bot being fair?</p><div class="row">' + D.shuffle([[1, 'No — equal skill, different result'], [0, 'Yes, it’s fair']]).map(function (o) { return '<button type="button" class="btn small" data-s1="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p></div>';
        if (step >= 1) {
          h += '<div class="bf-step"><p><b>Step 2 · Inspect the training data:</b></p><table class="bf-data"><caption class="sr-only">Past tryouts by club</caption><thead><tr><th scope="col">Club</th><th scope="col">Players who tried out</th><th scope="col">Players picked</th></tr></thead><tbody><tr><td>A</td><td>' + d.A.tried + '</td><td>' + d.A.picked + '</td></tr><tr><td>B</td><td>' + d.B.tried + '</td><td>' + d.B.picked + '</td></tr></tbody></table>';
          if (step === 1) h += '<p>What’s the real cause?</p><div class="row">' + D.shuffle([[1, 'Club B barely appears in the data (only 2 tryouts), so the bot learned “Club B = rejected”'], [0, 'Club B players are worse'], [0, 'The bot dislikes Club B on purpose']]).map(function (o) { return '<button type="button" class="btn small" data-s2="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p>';
          h += '</div>';
        }
        if (step >= 2) {
          h += '<div class="bf-step bf-fix"><p><b>Step 3 · Fix it</b> (try one or both):</p><label><input type="checkbox" id="bf-club"' + (useClub ? '' : ' checked') + '> Stop using “which club” as a clue: judge skill only</label><label><input type="checkbox" id="bf-add"' + (addB ? ' checked' : '') + '> Add 20 more real tryout results from Club B players (balanced data)</label>';
          if (sA === sB) {
            h += '<p class="feedback ok">✅ Equal skill → equal score. Fairer! Note: in real life, removing one clue isn’t always enough, because other data can secretly stand in for it. So teams test results for each group, again and again.</p>';
            if (!asked) h += '<p><b>Final question:</b> Who is responsible for checking an AI for fairness?</p><div class="row">' + D.shuffle([[1, 'The people who build and use it, by testing it on different groups'], [0, 'Nobody — computers are always fair'], [0, 'The AI checks itself']]).map(function (o) { return '<button type="button" class="btn small" data-s3="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p>';
            else h += '<p class="feedback ok">🏆 Fairness engineer! AI learns from data made by people, so people have to check it for unfairness.</p>';
          }
          h += '</div>';
        }
        el.innerHTML = h;
        function wire(attr, next, hint) { D.$all('[' + attr + ']', el).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute(attr) === '1') { D.sfx('good'); next(); render(); } else { D.sfx('bad'); b.disabled = true; var f = b.closest('.bf-step').querySelector('.feedback'); f.className = 'feedback no'; f.textContent = hint; } }); }); }
        wire('data-s1', function () { step = 1; api.save({ step: 1 }); }, 'Look again: same skill, but different scores.');
        wire('data-s2', function () { step = 2; api.save({ step: 2 }); }, 'Look at how many Club B examples the bot had to learn from.');
        wire('data-s3', function () { asked = true; api.save({ asked: true }); D.sfx('win'); }, 'Computers learn from people’s data. Someone has to check.');
        var c = D.$('#bf-club', el); if (c) c.addEventListener('change', function () { useClub = !c.checked; api.save({ useClub: useClub }); render(); });
        var a = D.$('#bf-add', el); if (a) a.addEventListener('change', function () { addB = a.checked; api.save({ addB: addB }); render(); });
        if (asked) api.done();
      }
      render();
    },
  },
  quiz: [
    { q: 'What does bias mean when we talk about AI fairness?', a: ['When a system treats some people or groups unfairly', 'The number added inside a neuron', 'A type of chart', 'A fast computer'], c: 0, why: 'Same word, different meaning from the neuron’s bias number!' },
    { q: 'Where did the Tryout Bot’s bias come from?', a: ['Unbalanced training data with very few Club B examples', 'The bot’s feelings', 'A broken screen', 'Club B players being worse'], c: 0, why: 'The data, not the players, was the problem.' },
    { q: 'How can engineers catch bias?', a: ['Test the AI’s results for different groups and compare', 'Trust that computers are fair', 'Only test it once', 'Never release it'], c: 0, why: 'Measure fairness, don’t assume it.' },
    { q: 'A face-unlock AI works worse for some skin tones. What’s a likely cause?', a: ['Its training photos didn’t include enough variety of people', 'Some faces are harder on purpose', 'Cameras dislike people', 'It can’t happen'], c: 0, why: 'Real studies have found problems like this, and diverse data helps fix them.' },
  ],
  challenge: {
    title: 'Fairness Check',
    intro: 'Which situations could lead to unfair AI? Get 4 of 5.',
    js: function (el, api) {
      api.D.sorter(el, api, {
        choices: [['r', '⚠️ Risk of unfairness'], ['o', '✅ Looks fair']],
        items: [
          ['A voice assistant trained mostly on adults’ voices', 'r', 'It may understand kids’ voices worse.'],
          ['A homework helper tested with students from many schools and backgrounds', 'o', 'Varied testing helps catch problems.'],
          ['A hiring AI trained on old decisions made by a biased company', 'r', 'It can copy the old unfairness.'],
          ['A game AI that plays equally well against every player', 'o', 'Same treatment for everyone.'],
          ['A photo app trained only on photos from one country', 'r', 'It may work poorly for everyone else.'],
        ],
        need: 4, win: 'You can spot fairness risks before they hurt anyone. That’s a real AI-ethics skill.',
      });
    },
  },
};
