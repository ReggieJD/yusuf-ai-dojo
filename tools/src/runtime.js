/* Yusuf's AI Dojo — shared runtime. Inlined into every page so each file works on its own. */
(function () {
  'use strict';
  var KEY = 'yusufDojo.v1';
  var C = window.CURRIC || { worlds: [], themes: {}, arcade: [] };
  var P = window.PAGE || {};
  var ROOT = P.root || './';
  var STUDENT = 'Yusuf';

  // ---------- storage (always wrapped: private windows and file:// can block it) ----------
  function blank() {
    return { v: 1, profile: null, xp: 0, lessons: {}, tests: {}, belts: {}, badges: {},
      streak: { count: 0, best: 0, last: null }, sound: false, daily: {}, arcade: {},
      unlockAll: false, project: null, saves: {}, last: null };
  }
  var storageOK = (function () {
    try { var t = '__dojo_test'; window.localStorage.setItem(t, '1'); window.localStorage.removeItem(t); return true; }
    catch (e) { return false; }
  })();
  function load() {
    var s = blank(), raw = null;
    if (storageOK) { try { raw = window.localStorage.getItem(KEY); } catch (e) { raw = null; } }
    if (raw) {
      try {
        var o = JSON.parse(raw);
        if (o && typeof o === 'object') for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k) && o[k] !== undefined) s[k] = o[k];
      } catch (e) { /* corrupted data: start fresh */ }
    }
    if (!s.streak || typeof s.streak !== 'object') s.streak = { count: 0, best: 0, last: null };
    ['lessons', 'tests', 'belts', 'badges', 'daily', 'arcade', 'saves'].forEach(function (k) { if (!s[k] || typeof s[k] !== 'object') s[k] = {}; });
    if (typeof s.xp !== 'number' || !isFinite(s.xp)) s.xp = 0;
    return s;
  }
  var st = load();
  function save() {
    if (!storageOK) return false;
    try { window.localStorage.setItem(KEY, JSON.stringify(st)); return true; } catch (e) { return false; }
  }
  function reset() { st = blank(); save(); }
  // ---------- autosave: in-progress work for each page, keyed by page id ----------
  function pageKey() { return P.id || P.type || 'page'; }
  function saveGet(key, page) { var b = st.saves[page || pageKey()]; return b && b[key] != null ? JSON.parse(JSON.stringify(b[key])) : null; }
  function saveSet(key, val, page) { page = page || pageKey(); (st.saves[page] || (st.saves[page] = {}))[key] = val; save(); }
  function saveClear(key, page) { var b = st.saves[page || pageKey()]; if (b && key in b) { delete b[key]; save(); } }
  function setLast(info) { st.last = info; save(); }

  // ---------- small helpers ----------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(sel, el) { return (el || document).querySelector(sel); }
  function $all(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }
  function today(d) { d = d || new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function dayDiff(a, b) { // whole days from date string a to b
    var pa = a.split('-'), pb = b.split('-');
    var da = Date.UTC(+pa[0], +pa[1] - 1, +pa[2]), db = Date.UTC(+pb[0], +pb[1] - 1, +pb[2]);
    return Math.round((db - da) / 86400000);
  }
  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function shuffle(a, rnd) { a = a.slice(); rnd = rnd || Math.random; for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function reducedMotion() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }

  // ---------- profile & themes ----------
  var DEFAULT_THEMES = ['chess', 'martial', 'basketball', 'soccer'];
  function profile() { return st.profile; }
  function nick() { return (st.profile && st.profile.nick) || 'Ninja'; }
  function avatar() { return (st.profile && st.profile.avatar) || '🥷'; }
  function favs() {
    var f = (st.profile && st.profile.themes && st.profile.themes.length) ? st.profile.themes : DEFAULT_THEMES;
    f = f.filter(function (id) { return C.themes[id]; });
    return f.length ? f : DEFAULT_THEMES;
  }
  function theme(salt) {
    var f = favs();
    var id = f[hash((P.id || P.type || '') + '|' + (salt || '')) % f.length];
    var t = {}; var src = C.themes[id]; for (var k in src) t[k] = src[k]; t.id = id; return t;
  }
  function cap(s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); }
  // Fill {{nick}}, {{name}}, {{avatar}}, {{T.hero}}, {{T.Hero}} (capitalized) tokens.
  function fill(str, T) {
    T = T || theme();
    return String(str).replace(/\{\{(\w+)(?:\.(\w+))?\}\}/g, function (m, a, b) {
      if (a === 'nick') return esc(nick());
      if (a === 'name') return STUDENT;
      if (a === 'avatar') return avatar();
      if (a === 'T' && b) {
        var key = b.charAt(0).toLowerCase() + b.slice(1);
        var v = T[key]; if (v == null) return m;
        return b.charAt(0) === b.charAt(0).toUpperCase() ? cap(v) : v;
      }
      return m;
    });
  }

  // ---------- curriculum helpers ----------
  function allLessons() {
    var out = [];
    C.worlds.forEach(function (w, wi) { w.lessons.forEach(function (l, li) { out.push({ world: w, wi: wi, li: li, lesson: l, id: w.id + '/' + l.id }); }); });
    return out;
  }
  function worldById(id) { for (var i = 0; i < C.worlds.length; i++) if (C.worlds[i].id === id) return C.worlds[i]; return null; }
  function worldUnlocked(w) {
    if (!w || !w.built) return false;
    var i = C.worlds.indexOf(w);
    if (i <= 0 || st.unlockAll) return true;
    return !!st.belts[C.worlds[i - 1].id];
  }
  function lessonDone(id) { var l = st.lessons[id]; return !!(l && l.done); }
  function worldProgress(w) { var d = 0; w.lessons.forEach(function (l) { if (lessonDone(w.id + '/' + l.id)) d++; }); return { done: d, total: w.lessons.length }; }
  function testReady(w) { var p = worldProgress(w); return st.unlockAll || p.done === p.total; }
  function lessonHref(wid, lid) { return ROOT + 'worlds/' + wid + '/' + lid + '.html'; }
  function nextStep() {
    for (var i = 0; i < C.worlds.length; i++) {
      var w = C.worlds[i];
      if (!worldUnlocked(w)) break;
      for (var j = 0; j < w.lessons.length; j++) {
        var l = w.lessons[j];
        if (!lessonDone(w.id + '/' + l.id)) return { href: lessonHref(w.id, l.id), label: l.title, sub: w.name + ' · Lesson ' + (j + 1), world: w };
      }
      if (!st.belts[w.id]) return { href: ROOT + 'worlds/' + w.id + '/belt-test.html', label: w.name + ' Test', sub: 'Earn your ' + w.name, world: w };
    }
    return null;
  }
  function countDone() { var n = 0; for (var k in st.lessons) if (st.lessons[k] && st.lessons[k].done) n++; return n; }
  function countBelts() { var n = 0; for (var k in st.belts) if (st.belts[k]) n++; return n; }

  // ---------- badges ----------
  var BADGES = [
    { id: 'first-step', icon: '👣', name: 'First Step', how: 'Finish your first lesson.', test: function () { return countDone() >= 1; } },
    { id: 'five-lessons', icon: '🖐️', name: 'High Five', how: 'Finish 5 lessons.', test: function () { return countDone() >= 5; } },
    { id: 'ten-lessons', icon: '🔟', name: 'Perfect Ten', how: 'Finish 10 lessons.', test: function () { return countDone() >= 10; } },
    { id: 'twenty-five', icon: '🌟', name: 'Quarter Century', how: 'Finish 25 lessons.', test: function () { return countDone() >= 25; } },
    { id: 'all-lessons', icon: '🐉', name: 'Dragon Scholar', how: 'Finish every lesson in the Dojo.', test: function () { return countDone() >= allLessons().length && allLessons().length > 0; } },
    { id: 'perfect-quiz', icon: '💯', name: 'Flawless', how: 'Get every question right on a lesson quiz.', test: function () { for (var k in st.lessons) { var q = st.lessons[k].quiz; if (q && q.best === q.total) return true; } return false; } },
    { id: 'five-perfect', icon: '🎯', name: 'Sharpshooter', how: 'Get 5 perfect lesson quizzes.', test: function () { var n = 0; for (var k in st.lessons) { var q = st.lessons[k].quiz; if (q && q.best === q.total) n++; } return n >= 5; } },
    { id: 'challenger', icon: '🔥', name: 'Challenger', how: 'Beat your first Challenge Mode.', test: function () { for (var k in st.lessons) if (st.lessons[k].ch) return true; return false; } },
    { id: 'challenge-master', icon: '🌋', name: 'Challenge Master', how: 'Beat 10 Challenge Modes.', test: function () { var n = 0; for (var k in st.lessons) if (st.lessons[k].ch) n++; return n >= 10; } },
    { id: 'daily-first', icon: '🌅', name: 'Early Riser', how: 'Finish your first Daily Dojo.', test: function () { return Object.keys(st.daily).length >= 1; } },
    { id: 'streak-3', icon: '🔥', name: 'On Fire', how: 'Keep a 3-day Daily Dojo streak.', test: function () { return (st.streak.best || 0) >= 3; } },
    { id: 'streak-7', icon: '☄️', name: 'Unstoppable', how: 'Keep a 7-day Daily Dojo streak.', test: function () { return (st.streak.best || 0) >= 7; } },
    { id: 'streak-30', icon: '🌞', name: 'Iron Will', how: 'Keep a 30-day Daily Dojo streak.', test: function () { return (st.streak.best || 0) >= 30; } },
    { id: 'xp-500', icon: '⭐', name: 'Rising Star', how: 'Earn 500 XP.', test: function () { return st.xp >= 500; } },
    { id: 'xp-2000', icon: '🌠', name: 'Shooting Star', how: 'Earn 2,000 XP.', test: function () { return st.xp >= 2000; } },
    { id: 'xp-5000', icon: '🌌', name: 'Galaxy Brain', how: 'Earn 5,000 XP.', test: function () { return st.xp >= 5000; } },
    { id: 'arcade-player', icon: '🕹️', name: 'Arcade Rookie', how: 'Play any Arcade game.', test: function () { return Object.keys(st.arcade).length >= 1; } },
    { id: 'arcade-champ', icon: '👑', name: 'Arcade Champ', how: 'Win 5 Arcade games.', test: function () { var n = 0; for (var k in st.arcade) n += (st.arcade[k].wins || 0); return n >= 5; } },
    { id: 'builder', icon: '🛠️', name: 'Master Builder', how: 'Save your Black Belt project.', test: function () { return !!(st.project && st.project.saved); } },
  ];
  C.worlds.forEach(function (w) {
    BADGES.push({ id: 'belt-' + w.id, icon: '🥋', color: w.color, name: w.name, how: 'Pass the ' + w.name + ' Test.', test: function () { return !!st.belts[w.id]; } });
  });
  function badgeCount() { var n = 0; for (var k in st.badges) if (st.badges[k]) n++; return n; }
  function checkBadges(quiet) {
    var got = [];
    BADGES.forEach(function (b) {
      if (!st.badges[b.id] && b.test()) { st.badges[b.id] = today(); got.push(b); }
    });
    if (got.length) { save(); if (!quiet) got.forEach(function (b, i) { setTimeout(function () { toast(b.icon + ' Badge unlocked: ' + b.name, 'badge'); sfx('win'); }, 700 * (i + 1)); }); }
    return got;
  }

  // ---------- XP, lessons, streak ----------
  function addXP(n, why) {
    if (!n) return;
    st.xp += n; save(); refreshBar();
    toast('+' + n + ' XP' + (why ? ' · ' + why : ''), 'xp'); sfx('xp');
    checkBadges();
  }
  function L(id) { if (!st.lessons[id]) st.lessons[id] = {}; return st.lessons[id]; }
  function finishCheck(id) {
    var l = L(id);
    if (!l.done && l.act && l.quiz && l.quiz.best / l.quiz.total >= 0.6) {
      l.done = today(); save(); addXP(25, 'Lesson complete'); return true;
    }
    return false;
  }
  function markActivity(id) { var l = L(id); if (l.act) return false; l.act = true; save(); addXP(20, 'Activity done'); finishCheck(id); return true; }
  function markQuiz(id, score, total) {
    var l = L(id); var prev = l.quiz ? l.quiz.best : 0;
    if (!l.quiz || score > l.quiz.best) { l.quiz = { best: score, total: total }; save(); }
    if (score > prev) addXP(10 * (score - prev), 'Quiz');
    finishCheck(id); checkBadges();
  }
  function markChallenge(id) { var l = L(id); if (l.ch) return false; l.ch = true; save(); addXP(30, 'Challenge Mode'); return true; }
  function markDaily() {
    var t = today();
    if (st.daily[t]) return false;
    st.daily[t] = true;
    var s = st.streak;
    if (s.last && dayDiff(s.last, t) === 1) s.count += 1; else if (s.last !== t) s.count = 1;
    s.last = t; s.best = Math.max(s.best || 0, s.count);
    save(); addXP(25, 'Daily Dojo'); return true;
  }
  function streakNow() { // a streak only counts if you trained today or yesterday
    var s = st.streak; if (!s.last) return 0;
    var d = dayDiff(s.last, today()); return d <= 1 ? s.count : 0;
  }
  function earnBelt(wid, score, total) {
    st.tests[wid] = { passed: true, score: score, total: total, at: today() };
    var first = !st.belts[wid];
    st.belts[wid] = today(); save();
    if (first) addXP(200, 'Belt earned');
    checkBadges(); return first;
  }
  function recordArcade(game, score, won) {
    var a = st.arcade[game] || (st.arcade[game] = { plays: 0, wins: 0, best: 0 });
    a.plays++; if (won) a.wins++; var best = score > a.best; if (best) a.best = score; save(); checkBadges(); return best;
  }

  // ---------- sound (off by default; WebAudio beeps, no files) ----------
  var actx = null;
  function sfx(kind) {
    if (!st.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var notes = { click: [660], good: [660, 880], bad: [300, 220], xp: [880, 1175], win: [523, 659, 784, 1047], step: [440] }[kind] || [600];
      notes.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain(), t0 = actx.currentTime + i * 0.09;
        o.type = kind === 'bad' ? 'sawtooth' : 'triangle'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
        o.connect(g); g.connect(actx.destination); o.start(t0); o.stop(t0 + 0.18);
      });
    } catch (e) { /* audio unavailable */ }
  }
  function setSound(on) { st.sound = !!on; save(); refreshBar(); if (on) sfx('good'); }

  // ---------- UI: top bar, toasts ----------
  function refreshBar() {
    var bar = document.getElementById('dojo-bar'); if (!bar) return;
    var xp = $('.db-xp b', bar), sk = $('.db-streak b', bar), me = $('.db-me', bar), snd = $('.db-sound', bar);
    if (xp) xp.textContent = st.xp.toLocaleString();
    if (sk) sk.textContent = streakNow();
    if (me) me.innerHTML = '<span class="db-av" aria-hidden="true">' + esc(avatar()) + '</span><span class="db-nick">' + esc(nick()) + '</span>';
    if (snd) { snd.setAttribute('aria-pressed', st.sound ? 'true' : 'false'); snd.textContent = st.sound ? '🔊' : '🔇'; snd.setAttribute('aria-label', st.sound ? 'Sound on. Tap to mute.' : 'Sound off. Tap to turn on.'); }
  }
  function buildBar() {
    var bar = document.getElementById('dojo-bar'); if (!bar) return;
    bar.innerHTML =
      '<a class="db-home" href="' + ROOT + 'index.html" aria-label="Back to the Dojo map"><span aria-hidden="true">🏯</span> <span>Dojo</span></a>' +
      '<span class="db-me"></span>' +
      '<span class="db-pill db-xp" title="Experience points"><span aria-hidden="true">⭐</span> <b>0</b><span class="sr-only"> XP</span><span aria-hidden="true"> XP</span></span>' +
      '<a class="db-pill db-streak" href="' + ROOT + 'daily.html" title="Daily Dojo streak"><span aria-hidden="true">🔥</span> <b>0</b><span class="sr-only"> day streak</span></a>' +
      '<button type="button" class="db-sound" aria-pressed="false">🔇</button>';
    $('.db-sound', bar).addEventListener('click', function () { setSound(!st.sound); });
    refreshBar();
  }
  var toastBox;
  function toast(msg, kind) {
    if (!toastBox) {
      toastBox = document.createElement('div'); toastBox.className = 'toasts'; toastBox.setAttribute('role', 'status'); toastBox.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastBox);
    }
    var t = document.createElement('div'); t.className = 'toast ' + (kind || ''); t.textContent = msg;
    toastBox.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 400); }, 2600);
  }

  // Gentle falling confetti (no flashing). Skipped for reduced motion.
  function confetti(n) {
    if (reducedMotion()) return;
    var box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
    var colors = ['#ff5d5d', '#ffd23f', '#3a86ff', '#2ec27e', '#8e44ec', '#ff8c42'];
    for (var i = 0; i < (n || 60); i++) {
      var p = document.createElement('i');
      p.style.left = (Math.random() * 100) + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.8) + 's';
      p.style.animationDuration = (2.4 + Math.random() * 1.6) + 's';
      p.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 4800);
  }

  // ---------- Quiz engine ----------
  // q = { q: 'question', a: ['choice', ...], c: correctIndex, why: 'explanation', wrong: {index: 'specific hint'} }
  function quiz(el, qs, opts) {
    opts = opts || {};
    var T = opts.T || theme('quiz');
    var i = 0, score = 0;
    function sample() { return opts.count ? shuffle(qs).slice(0, opts.count) : qs; }
    var order = sample(), K = opts.saveKey;
    function persist() { if (K) saveSet(K, { i: i, score: score, order: order.map(function (q) { return qs.indexOf(q); }) }); }
    if (K) {
      var sv = saveGet(K);
      if (sv && sv.order && sv.order.every(function (k) { return qs[k]; }) && sv.i > 0 && sv.i < sv.order.length) {
        order = sv.order.map(function (k) { return qs[k]; }); i = sv.i; score = sv.score || 0; opts.resumed = true;
      }
    }
    function render() {
      if (i >= order.length) return finish();
      var q = order[i];
      var idx = q.a.map(function (_, k) { return k; });
      if (opts.shuffle !== false && !q.keep) idx = shuffle(idx);
      var dots = order.map(function (_, k) { return '<span class="qz-dot' + (k < i ? ' done' : k === i ? ' now' : '') + '"></span>'; }).join('');
      el.innerHTML =
        '<div class="qz-top"><span class="qz-count">Question ' + (i + 1) + ' of ' + order.length + '</span><span class="qz-dots" aria-hidden="true">' + dots + '</span></div>' +
        '<p class="qz-q" id="qz-q-' + i + '">' + fill(q.q, T) + '</p>' +
        '<div class="qz-choices" role="group" aria-labelledby="qz-q-' + i + '">' +
        idx.map(function (k) { return '<button type="button" class="qz-choice" data-k="' + k + '">' + fill(q.a[k], T) + '</button>'; }).join('') +
        '</div><div class="qz-feedback" aria-live="polite"></div>';
      $all('.qz-choice', el).forEach(function (b) { b.addEventListener('click', function () { pick(+b.getAttribute('data-k'), b); }); });
    }
    function pick(k, btn) {
      var q = order[i];
      $all('.qz-choice', el).forEach(function (b) { b.disabled = true; if (+b.getAttribute('data-k') === q.c) b.classList.add('right'); });
      var fb = $('.qz-feedback', el), ok = k === q.c;
      if (ok) { score++; sfx('good'); } else { btn.classList.add('wrong'); sfx('bad'); }
      i++; persist(); i--;
      var msg = ok ? ('<b>✅ Correct!</b> ' + fill(q.yes || q.why || '', T))
        : ('<b>❌ Not quite.</b> ' + fill((q.wrong && q.wrong[k]) || q.why || '', T));
      fb.className = 'qz-feedback ' + (ok ? 'ok' : 'no');
      fb.innerHTML = '<p>' + msg + '</p><button type="button" class="btn primary qz-next">' + (i + 1 < order.length ? 'Next question →' : 'See my score') + '</button>';
      var nx = $('.qz-next', el); nx.addEventListener('click', function () { i++; render(); var h = el.querySelector('.qz-q'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } });
      nx.focus({ preventScroll: true });
    }
    function finish() {
      if (K) saveClear(K);
      var pass = score / order.length >= (opts.pass || 0.6);
      var stars = score === order.length ? '🌟🌟🌟' : pass ? '🌟🌟' : '🌟';
      el.innerHTML = '<div class="qz-end ' + (pass ? 'pass' : 'fail') + '"><div class="qz-stars" aria-hidden="true">' + stars + '</div>' +
        '<p class="qz-score">You got <b>' + score + ' / ' + order.length + '</b></p>' +
        '<p>' + (score === order.length ? 'Flawless! Your sensei is impressed.' : pass ? 'Nice work — you passed! Want to go for a perfect score?' : 'Every black belt was once a white belt who kept going. Try again — you’ve got this.') + '</p>' +
        '<button type="button" class="btn qz-retry">↻ ' + (score === order.length ? 'Play again' : 'Try again') + '</button></div>';
      $('.qz-retry', el).addEventListener('click', function () { i = 0; score = 0; if (opts.reshuffle) order = sample(); if (K) saveClear(K); render(); });
      if (score === order.length) confetti(40);
      if (opts.onDone) opts.onDone(score, order.length, pass);
    }
    render();
    if (opts.resumed) { var tp = el.querySelector('.qz-top'); if (tp) tp.insertAdjacentHTML('afterend', '<p class="qz-resume">💾 Welcome back! You were on question ' + (i + 1) + '.</p>'); }
    return { restart: function () { i = 0; score = 0; render(); } };
  }


  // ---------- Sorter: each item gets one choice; explanations; pass mark; autosave via api.save/load ----------
  // o = { items: [[html, answer, why?]], choices: [[value, label]], need: n, win: 'message', key: 'ans' }
  function sorter(el, api, o) {
    var key = o.key || 'ans', need = o.need || o.items.length;
    el.innerHTML = '<div class="so">' + o.items.map(function (it, i) {
      return '<div class="so-item" data-i="' + i + '"><p>' + it[0] + '</p><div class="row">' + o.choices.map(function (c) { return '<button type="button" class="btn small" data-v="' + c[0] + '">' + c[1] + '</button>'; }).join('') + '</div><div class="so-why" aria-live="polite"></div></div>';
    }).join('') + '</div><p class="feedback so-sum" aria-live="polite"></p>';
    var A = {}, n = 0, right = 0;
    function label(v) { for (var k = 0; k < o.choices.length; k++) if (String(o.choices[k][0]) === String(v)) return o.choices[k][1]; return v; }
    function pick(box, v, quiet) {
      var i = +box.getAttribute('data-i'), it = o.items[i];
      if (box.classList.contains('ok') || box.classList.contains('no')) return;
      var ok = String(v) === String(it[1]); n++; if (ok) right++;
      A[i] = v; if (api.save) { var sv = {}; sv[key] = A; api.save(sv); }
      box.classList.add(ok ? 'ok' : 'no');
      $all('button', box).forEach(function (b) { b.disabled = true; if (b.getAttribute('data-v') === String(it[1])) b.classList.add('so-right'); });
      $('.so-why', box).innerHTML = (ok ? '✅ ' : '❌ Best answer: <b>' + label(it[1]) + '</b>. ') + (it[2] || '');
      if (!quiet) sfx(ok ? 'good' : 'bad');
      if (n === o.items.length) {
        var sum = $('.so-sum', el);
        if (right >= need) { sum.className = 'feedback ok so-sum'; sum.innerHTML = right + '/' + o.items.length + ' — ' + (o.win || 'Nice work!'); if (api.done) api.done(); }
        else {
          sum.className = 'feedback no so-sum'; sum.innerHTML = right + '/' + o.items.length + '. You need ' + need + '. Read the explanations, then <button type="button" class="btn small so-again">try again</button>';
          $('.so-again', el).addEventListener('click', function () { if (api.save) { var z = {}; z[key] = {}; api.save(z); } sorter(el, api, o); });
        }
      }
    }
    $all('.so-item button', el).forEach(function (b) { b.addEventListener('click', function () { pick(b.closest('.so-item'), b.getAttribute('data-v')); }); });
    var saved = api.load ? (api.load()[key] || {}) : {};
    Object.keys(saved).forEach(function (i) { var box = $('.so-item[data-i="' + i + '"]', el); if (box) pick(box, saved[i], true); });
  }

  // ---------- Belt ceremony ----------
  function ceremony(w, onClose) {
    var ov = document.createElement('div'); ov.className = 'ceremony'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'cer-title');
    ov.innerHTML = '<div class="cer-card">' +
      '<svg class="cer-belt" viewBox="0 0 240 120" aria-hidden="true"><defs><linearGradient id="cerg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="' + w.color + '"/><stop offset="1" stop-color="' + w.color + '" stop-opacity=".78"/></linearGradient></defs>' +
      '<path class="cer-l" d="M10 48 H110 V68 H10 Z" fill="url(#cerg)" stroke="#0003" stroke-width="2"/>' +
      '<path class="cer-r" d="M130 48 H230 V68 H130 Z" fill="url(#cerg)" stroke="#0003" stroke-width="2"/>' +
      '<rect class="cer-knot" x="104" y="42" width="32" height="32" rx="6" fill="url(#cerg)" stroke="#0004" stroke-width="2"/>' +
      '<path class="cer-tail1" d="M110 72 L92 112 L106 114 L120 76 Z" fill="url(#cerg)" stroke="#0003" stroke-width="2"/>' +
      '<path class="cer-tail2" d="M130 72 L148 112 L134 114 L120 76 Z" fill="url(#cerg)" stroke="#0003" stroke-width="2"/></svg>' +
      '<p class="cer-kicker">Belt Ceremony</p><h2 id="cer-title">' + STUDENT + ', you earned the ' + esc(w.name) + '!</h2>' +
      '<p class="cer-sub">' + esc(avatar() + ' ' + nick()) + ' bows to the sensei. The dojo cheers. <b>+200 XP</b></p>' +
      '<button type="button" class="btn primary cer-ok">Bow and continue 🙇</button></div>';
    document.body.appendChild(ov);
    sfx('win'); confetti(90);
    var ok = $('.cer-ok', ov); ok.focus();
    function close() { if (ov.parentNode) ov.parentNode.removeChild(ov); document.removeEventListener('keydown', key); if (onClose) onClose(); }
    function key(e) { if (e.key === 'Escape') close(); }
    ok.addEventListener('click', close); document.addEventListener('keydown', key);
  }

  window.Dojo = {
    state: function () { return st; }, save: save, reset: reset, storageOK: storageOK,
    saveGet: saveGet, saveSet: saveSet, saveClear: saveClear, setLast: setLast,
    esc: esc, $: $, $all: $all, today: today, hash: hash, shuffle: shuffle, reducedMotion: reducedMotion,
    profile: profile, nick: nick, avatar: avatar, student: STUDENT, favs: favs, theme: theme, fill: fill,
    setProfile: function (p) { st.profile = p; save(); refreshBar(); },
    allLessons: allLessons, worldById: worldById, worldUnlocked: worldUnlocked, worldProgress: worldProgress,
    lessonDone: lessonDone, testReady: testReady, lessonHref: lessonHref, nextStep: nextStep, countDone: countDone, countBelts: countBelts,
    BADGES: BADGES, badgeCount: badgeCount, checkBadges: checkBadges,
    addXP: addXP, markActivity: markActivity, markQuiz: markQuiz, markChallenge: markChallenge, markDaily: markDaily,
    streakNow: streakNow, earnBelt: earnBelt, recordArcade: recordArcade,
    sfx: sfx, setSound: setSound, toast: toast, confetti: confetti, quiz: quiz, sorter: sorter, ceremony: ceremony, refreshBar: refreshBar,
    root: ROOT, C: C, page: P,
  };

  function boot() { buildBar(); checkBadges(true); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
