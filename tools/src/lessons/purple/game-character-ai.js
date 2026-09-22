module.exports = {
  hook: 'Video-game enemies seem smart, but most run on a simple “state machine.” Design the brain of a dojo guard, then run the scenario.',
  story: [
    ['sensei', 'In a video game, when a guard spots you, it chases. Lose it, and it searches. Hurt it, and it runs. It feels smart, {{nick}}. But what’s inside?'],
    ['sensei', 'Usually a <b>state machine</b>: a set of <b>states</b> (modes) like Patrol, Chase, Search and Flee, plus <b>rules</b> for switching between them when something happens.'],
    ['you', 'So it’s rules, not machine learning?'],
    ['sensei', 'In most games, yes! Game designers call it “AI,” but it’s usually clever hand-written rules. Your job as {{T.hero}}-turned-game-designer: wire up the guard’s brain.'],
  ],
  activity: {
    title: 'Design the Guard’s Brain',
    instructions: 'For each event, choose which state the guard should switch to. Then press Run to watch the guard play out a scenario. Make every reaction sensible!',
    css: `
.sm-states{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
.sm-state{flex:1 1 110px;min-height:64px;border-radius:14px;border:3px solid #1d0f33;background:#fbf7ff;display:flex;flex-direction:column;align-items:center;justify-content:center;font:800 .9rem var(--font-body);color:#1d0f33;transition:transform .2s}
.sm-state .e{font-size:1.6rem}
.sm-state.on{background:#7b2ff7;color:#fff;transform:scale(1.06);box-shadow:0 0 18px #b983ff}
.sm-rules{display:grid;gap:8px}
.sm-rule{display:grid;gap:4px;background:var(--bg2);border-radius:12px;padding:10px}
@media(min-width:620px){.sm-rule{grid-template-columns:1fr 200px;align-items:center}}
.sm-rule select{min-height:44px;border-radius:10px;border:2px solid #1d0f3355;font:700 .95rem var(--font-body);color:#1d0f33;background:#fff}
.sm-rule.ok{box-shadow:inset 0 0 0 3px #16a36b}.sm-rule.no{box-shadow:inset 0 0 0 3px #d64545}
.sm-log{background:#1d0f33;color:#e0c3ff;border-radius:14px;padding:10px 12px;margin-top:10px;font:600 .92rem/1.5 var(--font-body);min-height:5em}
.sm-log p{margin:0 0 4px}
`,
    js: function (el, api) {
      var D = api.D;
      var ST = { patrol: ['🚶', 'Patrol'], chase: ['🏃', 'Chase'], search: ['🔍', 'Search'], flee: ['🏳️', 'Flee'] };
      var RULES = [
        ['see', 'While patrolling, the guard SEES you', 'chase', { flee: 'The guard runs away from a harmless player. Players will think it’s broken!', search: 'It sees you but starts “searching”? Silly!', patrol: 'It sees you and just… keeps walking. Way too easy!' }],
        ['lose', 'While chasing, the guard LOSES sight of you', 'search', { patrol: 'It gives up instantly. No challenge!', chase: 'It keeps chasing an invisible target forever, like it has x-ray vision. Unfair!', flee: 'It panics for no reason!' }],
        ['timer', 'While searching, the search timer runs out', 'patrol', { search: 'It searches forever and never goes back to its route.', chase: 'It chases… nothing?', flee: 'It flees from nothing!' }],
        ['spot', 'While searching, the guard SPOTS you again', 'chase', { patrol: 'It sees you and goes back to patrolling?!', search: 'It keeps searching while you stand right there!', flee: 'Why run now?' }],
        ['hurt', 'Anytime: the guard’s health gets LOW', 'flee', { chase: 'A nearly defeated guard charging at you. Brave, but not smart!', patrol: 'It ignores its injuries completely.', search: 'It wanders around hurt.' }],
      ];
      var S = api.load(), pick = S.pick || {}, ran = !!S.ran;
      var SCRIPT = [['patrol', null, 'The guard patrols the dojo hallway…'], [null, 'see', 'You step into its view!'], [null, 'lose', 'You duck behind a pillar.'], [null, 'spot', 'It peeks around… and spots you!'], [null, 'lose', 'You vanish into the shadows.'], [null, 'timer', 'Its search timer runs out.'], [null, 'see', 'It sees you again!'], [null, 'hurt', 'You land three perfect strikes. Its health is low!']];
      el.innerHTML = '<div class="sm-states" id="sm-st">' + Object.keys(ST).map(function (k) { return '<div class="sm-state" data-s="' + k + '"><span class="e" aria-hidden="true">' + ST[k][0] + '</span>' + ST[k][1] + '</div>'; }).join('') + '</div><div class="sm-rules">' +
        RULES.map(function (r) { return '<label class="sm-rule" data-r="' + r[0] + '"><span><b>When:</b> ' + r[1] + '</span><select data-r="' + r[0] + '"><option value="">Switch to…</option>' + Object.keys(ST).map(function (k) { return '<option value="' + k + '"' + (pick[r[0]] === k ? ' selected' : '') + '>' + ST[k][0] + ' ' + ST[k][1] + '</option>'; }).join('') + '</select></label>'; }).join('') +
        '</div><div class="row" style="margin-top:10px"><button type="button" class="btn primary" id="sm-run">▶ Run the scenario</button></div><div class="sm-log" id="sm-log" aria-live="polite"><p>Choose all 5 rules, then run!</p></div>';
      function light(s) { D.$all('.sm-state', el).forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-s') === s); }); }
      D.$all('select[data-r]', el).forEach(function (s) { s.addEventListener('change', function () { pick[s.getAttribute('data-r')] = s.value; api.save({ pick: pick }); s.closest('.sm-rule').classList.remove('ok', 'no'); }); });
      var busy = false;
      function run(instant) {
        if (busy) return;
        var log = D.$('#sm-log', el);
        if (RULES.some(function (r) { return !pick[r[0]]; })) { log.innerHTML = '<p>⚠️ Choose a state for all 5 rules first.</p>'; return; }
        busy = true; log.innerHTML = ''; var state = 'patrol', i = 0, bad = 0;
        (function tick() {
          var ev = SCRIPT[i];
          if (ev[1]) { var r = RULES.filter(function (x) { return x[0] === ev[1]; })[0], to = pick[ev[1]]; var ok = to === r[2]; if (!ok) bad++; state = to; log.insertAdjacentHTML('beforeend', '<p>' + ev[2] + ' → ' + ST[to][0] + ' <b>' + ST[to][1] + '</b>' + (ok ? '' : ' 😬 ' + r[3][to]) + '</p>'); }
          else log.insertAdjacentHTML('beforeend', '<p>' + ev[2] + ' ' + ST[state][0] + '</p>');
          light(state); i++;
          if (i < SCRIPT.length) setTimeout(tick, instant || D.reducedMotion() ? 0 : 700);
          else {
            busy = false;
            RULES.forEach(function (r) { D.$('.sm-rule[data-r="' + r[0] + '"]', el).classList.add(pick[r[0]] === r[2] ? 'ok' : 'no'); });
            var allOk = RULES.every(function (r) { return pick[r[0]] === r[2]; });
            log.insertAdjacentHTML('beforeend', allOk ? '<p><b>🏆 A believable guard! It reacts sensibly, and players will have a fair, fun challenge. That’s game AI: states + rules.</b></p>' : '<p><b>Fix the red rules and run it again.</b></p>');
            if (allOk) { api.save({ ran: true }); D.sfx('win'); api.done(); } else D.sfx('bad');
          }
        })();
      }
      D.$('#sm-run', el).addEventListener('click', function () { run(false); });
      light('patrol'); if (ran) run(true);
    },
  },
  quiz: [
    { q: 'What is a state machine?', a: ['A set of modes (states) plus rules for switching between them', 'A machine owned by the government', 'A neural network', 'A type of controller'], c: 0, why: 'Patrol, Chase, Search, Flee + switching rules.' },
    { q: 'Most video-game enemy “AI” is built with…', a: ['Hand-written rules like state machines', 'Giant trained neural networks', 'Real brains', 'Random numbers only'], c: 0, why: 'Designers want enemies that are fun and predictable enough to learn, so rules work great.' },
    { q: 'Why is “keep chasing even after losing sight” a bad rule?', a: ['It feels unfair, like the guard has x-ray vision', 'It’s too easy', 'It breaks the computer', 'It’s a great rule'], c: 0, why: 'Good game AI is about fun and fairness, not just winning.' },
    { q: 'How is a state machine different from machine learning?', a: ['A person writes its rules, instead of the computer learning them from data', 'There is no difference', 'State machines learn from millions of examples', 'Machine learning has no rules'], c: 0, why: 'Remember White Belt: rules vs learning!' },
  ],
  challenge: {
    title: 'Arcade Legends',
    intro: 'The classic arcade game Pac-Man (1980) has some of the most famous game AI ever made. Get 2 of 3.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'Pac-Man’s four ghosts behave differently from each other. How?', a: ['Each ghost uses a different simple rule for choosing where to go', 'Each one is a separate neural network', 'They move completely randomly', 'A human controls them'], c: 0, why: 'For example, one ghost aims straight at Pac-Man, while another aims at a spot ahead of him. Simple rules, big personalities!' },
        { q: 'When Pac-Man eats a power pellet, the ghosts turn blue and run away. In state-machine terms, what happened?', a: ['An event switched the ghosts into a “frightened” state', 'The ghosts learned to be scared', 'The game crashed', 'Pac-Man changed color'], c: 0, why: 'Event → state change. Exactly like your guard!' },
        { q: 'Why might a game designer AVOID making enemies that play perfectly?', a: ['Unbeatable enemies aren’t fun — games need a fair challenge', 'Perfect AI is impossible to build', 'It uses too much color', 'Players prefer losing'], c: 0, why: 'Game AI is designed for fun, not just for winning.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 2) api.done(); } });
    },
  },
};
