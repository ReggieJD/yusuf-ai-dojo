// Shared arcade page builder: lock screen, HUD, start/win/lose screens, best score.
const ARCADE_CSS = `
:root{--bg:#0b0620;--bg2:#1c1240;--ink:#f4f0ff;--muted:#c3b8ea;--card:#150d33;--line:#ff5edb44;--accent:#ff5edb;--accent-ink:#12061f;--accent2:#5ef2ff;--radius:14px;--good:#3ee08f;--good-bg:#0f3b27;--bad:#ff6b8a;--bad-bg:#3d0f1c;
--font-head:"Courier New",ui-monospace,Menlo,monospace;--head-weight:900;--head-track:.02em;--shadow:0 0 0 2px #ff5edb66,0 0 30px #ff5edb22}
body{background-color:#0b0620;background-image:linear-gradient(180deg,transparent 0 55%,#ff5edb14 100%),linear-gradient(#5ef2ff12 1px,transparent 1px),linear-gradient(90deg,#5ef2ff12 1px,transparent 1px);background-size:100% 100%,32px 32px,32px 32px}
a{color:#5ef2ff}
.btn{border-color:#5ef2ff;box-shadow:0 4px 0 #5ef2ff;background:#150d33;color:#f4f0ff}
.btn.primary{background:#ff5edb;color:#12061f;border-color:#ff5edb;box-shadow:0 4px 0 #b3208f}
.qz-feedback.ok p,.qz-choice.right{color:#dfffea}.qz-feedback.no p,.qz-choice.wrong{color:#ffe0e7}
.ar-hero{padding:20px 0 6px}
.ar-hero h1{color:#ff5edb;text-shadow:0 0 16px #ff5edb88;font-size:clamp(1.8rem,7vw,2.8rem)}
.ar-hero .con{display:inline-block;font:700 .8rem var(--font-body);padding:3px 10px;border:1px solid #5ef2ff;border-radius:999px;color:#5ef2ff;margin-bottom:8px}
.ar-hud{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
.ar-hud span{background:#150d33;border:2px solid #5ef2ff66;border-radius:10px;padding:6px 12px;font:800 1rem var(--font-head);color:#5ef2ff}
.ar-stage{background:#150d33;border:2px solid #ff5edb66;border-radius:16px;padding:14px;min-height:260px;box-shadow:0 0 30px #ff5edb1a;position:relative}
.ar-screen{text-align:center;padding:20px 10px}
.ar-screen .big{font-size:3rem}
.ar-screen h2{color:#ff5edb}
.ar-how{background:#1c1240;border-radius:12px;padding:10px 14px;margin-top:12px;font-size:.95rem}
.ar-lock{text-align:center;padding:26px 12px}
.ar-lock .big{font-size:3rem}
.ar-stage{scroll-margin-top:70px}.ar-stage button{touch-action:manipulation}
`;

module.exports = function arcadePage(g, game, esc, fnSrc) {
  const body = `
<main id="main" class="wrap arcade-game">
  <section class="ar-hero">
    <a href="index.html">← Arcade</a>
    <h1>${g.emoji} ${esc(g.title)}</h1>
    <span class="con">🧠 Trains: ${esc(g.concept)}</span>
    <p>${game.how}</p>
  </section>
  <div class="ar-hud" aria-live="polite"><span id="hud-score">Score 0</span><span id="hud-level">Level 1</span><span id="hud-lives"></span><span id="hud-best"></span></div>
  <section class="ar-stage" id="stage" aria-label="Game area"></section>
  <div class="ar-how"><b>How it connects to AI:</b> ${game.connect}</div>
</main>`;
  const js = `window.GAME_DATA=${JSON.stringify(game.data || null).replace(/</g, '\\u003c')};
window.GAME=${fnSrc(game.js)};
(function(){var D=window.Dojo,st=D.state(),id=${JSON.stringify(g.id)},need=${g.need},stage=document.getElementById('stage');
function best(){var a=st.arcade[id];return a?a.best:0;}
function hud(o){if(o.score!=null)document.getElementById('hud-score').textContent='Score '+o.score;if(o.level!=null)document.getElementById('hud-level').textContent='Level '+o.level;
 var lv=document.getElementById('hud-lives');if(o.lives!=null){lv.textContent=o.lives>0?new Array(o.lives+1).join('❤️'):'💔';lv.hidden=false;}document.getElementById('hud-best').textContent='🏆 Best '+best();}
hud({});document.getElementById('hud-lives').hidden=true;
if(D.badgeCount()<need&&!st.unlockAll){stage.innerHTML='<div class="ar-lock"><div class="big">🔒</div><h2>Locked</h2><p>You need <b>'+need+'</b> badge'+(need>1?'s':'')+' to play. You have <b>'+D.badgeCount()+'</b>.</p><p>Earn badges by finishing lessons, acing quizzes, beating Challenge Modes and training in the Daily Dojo.</p><a class="btn primary" href="../badges.html">See how to earn badges</a></div>';return;}
function start(){stage.innerHTML='';try{stage.scrollIntoView({block:'start',behavior:D.reducedMotion()?'auto':'smooth'});}catch(e){}window.GAME(stage,{D:D,T:D.theme('arcade'),hud:hud,
 end:function(score,won,msg){var isBest=D.recordArcade(id,score,won);hud({score:score});D.sfx(won?'win':'bad');if(won)D.confetti(50);
  stage.innerHTML='<div class="ar-screen"><div class="big">'+(won?'🏆':'💥')+'</div><h2>'+(won?'You win!':'Game over')+'</h2><p>'+(msg||'')+'</p><p>Score: <b>'+score+'</b>'+(isBest?' · 🌟 New best!':'')+'</p><button type="button" class="btn primary" id="ar-again">↻ Play again</button> <a class="btn" href="index.html">Arcade</a></div>';
  document.getElementById('ar-again').addEventListener('click',start);document.getElementById('ar-again').focus();}});}
stage.innerHTML='<div class="ar-screen"><div class="big">${g.emoji}</div><h2>Ready?</h2><button type="button" class="btn primary" id="ar-start">▶ Start</button></div>';
document.getElementById('ar-start').addEventListener('click',start);
})();`;
  return { title: `${g.title} · Arcade · Yusuf's AI Dojo`, desc: g.blurb, worldCss: ARCADE_CSS, css: game.css || '', body, scripts: [js], meta: { type: 'arcade', id: 'arcade/' + g.id } };
};
module.exports.ARCADE_CSS = ARCADE_CSS;
