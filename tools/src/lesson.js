/* Lesson page controller: story → activity → quiz → challenge. */
(function () {
  'use strict';
  var D = window.Dojo, Lz = window.LESSON;
  if (!D || !Lz) return;
  var T = D.theme('lesson');
  var id = Lz.id;

  function senseiSVG(size) {
    return '<svg class="sensei-svg" width="' + size + '" height="' + size + '" viewBox="0 0 64 64" aria-hidden="true">' +
      '<rect x="8" y="12" width="48" height="44" rx="14" fill="var(--sensei, #e9eef5)" stroke="#1d1d1f" stroke-width="3"/>' +
      '<rect x="6" y="20" width="52" height="9" rx="3" fill="var(--band, #d62828)" stroke="#1d1d1f" stroke-width="2"/>' +
      '<path d="M56 24 l7 -5 l-1 9 z" fill="var(--band, #d62828)" stroke="#1d1d1f" stroke-width="2"/>' +
      '<circle cx="24" cy="38" r="5" fill="#1d1d1f"/><circle cx="40" cy="38" r="5" fill="#1d1d1f"/>' +
      '<circle cx="26" cy="36" r="1.6" fill="#fff"/><circle cx="42" cy="36" r="1.6" fill="#fff"/>' +
      '<path d="M26 48 q6 5 12 0" fill="none" stroke="#1d1d1f" stroke-width="3" stroke-linecap="round"/>' +
      '<line x1="32" y1="12" x2="32" y2="4" stroke="#1d1d1f" stroke-width="3"/><circle cx="32" cy="4" r="3" fill="var(--band, #d62828)"/></svg>';
  }
  D.senseiSVG = senseiSVG;

  // ---- story ----
  var storyEl = document.getElementById('story');
  if (storyEl) {
    storyEl.innerHTML = Lz.story.map(function (line) {
      var who = line[0], text = D.fill(line[1], T);
      if (who === 'narr') return '<p class="st-narr">' + text + '</p>';
      var isYou = who === 'you';
      var face = isYou ? '<span class="st-face you" aria-hidden="true">' + D.esc(D.avatar()) + '</span>' : '<span class="st-face">' + senseiSVG(46) + '</span>';
      var name = isYou ? D.esc(D.nick()) : 'Sensei Byte';
      return '<div class="st-line ' + (isYou ? 'st-you' : 'st-sensei') + '">' + face + '<div class="st-bubble"><span class="st-name">' + name + '</span>' + text + '</div></div>';
    }).join('');
  }

  // ---- checklist ----
  function refreshChecklist() {
    var s = D.state().lessons[id] || {};
    var map = { act: !!s.act, quiz: !!(s.quiz && s.quiz.best / s.quiz.total >= 0.6), ch: !!s.ch };
    D.$all('[data-step]').forEach(function (li) {
      var k = li.getAttribute('data-step'); var on = map[k];
      li.classList.toggle('on', on); var m = li.querySelector('.ck'); if (m) m.textContent = on ? '✓' : '';
    });
    var banner = document.getElementById('complete');
    if (banner) banner.hidden = !s.done;
  }

  function api(kind) {
    var fired = false;
    return {
      T: T, D: D, nick: D.nick(), fill: function (s) { return D.fill(s, T); },
      done: function (msg) {
        if (fired) return; fired = true;
        var first = kind === 'act' ? D.markActivity(id) : D.markChallenge(id);
        if (msg !== false) D.toast(kind === 'act' ? '🥋 Activity complete!' : '🔥 Challenge conquered!');
        if (first) D.confetti(kind === 'act' ? 30 : 50);
        refreshChecklist();
        if (kind === 'act') { var q = document.getElementById('quiz-sec'); if (q) q.classList.add('ready'); }
      },
      isDone: function () { var s = D.state().lessons[id] || {}; return kind === 'act' ? !!s.act : !!s.ch; },
    };
  }

  // ---- activity ----
  var actEl = document.getElementById('activity');
  if (actEl && window.ACTIVITY) {
    try { window.ACTIVITY(actEl, api('act')); }
    catch (e) { actEl.innerHTML = '<p class="err">This activity hit a snag. Try reloading the page.</p>'; if (window.console) console.error(e); }
  }

  // ---- quiz ----
  var qEl = document.getElementById('quiz');
  if (qEl) D.quiz(qEl, Lz.quiz, { T: T, onDone: function (sc, tot) { D.markQuiz(id, sc, tot); refreshChecklist(); } });

  // ---- challenge (built on first open) ----
  var chBox = document.getElementById('challenge-box');
  var chEl = document.getElementById('challenge');
  var chBuilt = false;
  function buildChallenge() {
    if (chBuilt || !chEl || !window.CHALLENGE) return; chBuilt = true;
    try { window.CHALLENGE(chEl, api('ch')); }
    catch (e) { chEl.innerHTML = '<p class="err">This challenge hit a snag. Try reloading the page.</p>'; if (window.console) console.error(e); }
  }
  if (chBox) chBox.addEventListener('toggle', function () { if (chBox.open) buildChallenge(); });
  if (chBox && chBox.open) buildChallenge();

  // ---- profile nudge ----
  if (!D.profile()) {
    var n = document.getElementById('nudge');
    if (n) { n.hidden = false; }
  }
  refreshChecklist();
})();
