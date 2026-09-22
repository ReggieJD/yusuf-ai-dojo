// Hub: /index.html — Dojo map, stats, continue, daily, onboarding picker.
module.exports = function (ctx) {
  const { worlds, themes, esc } = ctx;
  const body = `
<main id="main" class="hub">
  <section class="hub-hero">
    <svg class="hub-mtn" viewBox="0 0 1200 260" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 260 L0 170 L160 70 L260 140 L420 20 L560 150 L700 60 L860 170 L1000 80 L1200 190 L1200 260 Z" fill="#3b1f4a" opacity=".55"/>
      <path d="M0 260 L0 210 L200 120 L340 200 L520 110 L700 210 L880 130 L1060 220 L1200 160 L1200 260 Z" fill="#241133"/>
      <path d="M410 30 L420 20 L432 34 L424 40 Z" fill="#fff" opacity=".9"/>
    </svg>
    <div class="wrap hub-top">
      <div class="hub-sun" aria-hidden="true"></div>
      <p class="hub-kicker">Welcome to</p>
      <h1>Yusuf’s AI Dojo</h1>
      <p class="hub-greet" id="hub-greet">Learn how AI works. Use it well. Build with it.</p>
      <div class="hub-stats" id="hub-stats" aria-label="Your progress"></div>
    </div>
  </section>

  <div class="wrap">
    <section class="card hub-continue" aria-labelledby="h-cont">
      <div>
        <p class="hub-label">Your next move</p>
        <h2 id="h-cont">Continue training</h2>
        <p id="cont-sub" class="hub-sub"></p>
      </div>
      <a class="btn primary big" id="cont-btn" href="worlds/white/rules-vs-learning.html">▶ Start</a>
    </section>

    <section class="card hub-daily" aria-labelledby="h-daily">
      <div class="hub-daily-ico" aria-hidden="true">🌅</div>
      <div><h2 id="h-daily">Daily Dojo</h2><p id="daily-sub">A 5-minute challenge to keep your streak alive.</p></div>
      <a class="btn" href="daily.html" id="daily-btn">Train today</a>
    </section>

    <section aria-labelledby="h-map">
      <h2 id="h-map" class="hub-h">🗺️ The Belt Mountain</h2>
      <p class="hub-sub">Earn each belt to unlock the next world. Eight belts. One Black Belt.</p>
      <div class="map" id="map"></div>
    </section>

    <section aria-labelledby="h-more">
      <h2 id="h-more" class="hub-h">🏯 Around the Dojo</h2>
      <div class="tiles" id="tiles">
        ${ctx.arcade.some((g) => g.built) ? '<a class="tile" href="arcade/index.html" id="tile-arcade"><span aria-hidden="true">🕹️</span><b>Bonus Arcade</b><small id="arcade-sub">Games unlock with badges</small></a>' : ''}
        <a class="tile" href="scrolls.html"><span aria-hidden="true">📜</span><b>Dojo Scrolls</b><small>Every AI key term + flashcards</small></a>
        <a class="tile" href="badges.html"><span aria-hidden="true">🏅</span><b>Badge Wall</b><small id="badge-sub">Collect them all</small></a>
        <a class="tile" href="certificate.html"><span aria-hidden="true">📜</span><b>Certificate</b><small>Earned at Black Belt</small></a>
        <button type="button" class="tile" id="edit-profile"><span aria-hidden="true">🥷</span><b>My Ninja</b><small>Change name, avatar, themes</small></button>
        <a class="tile" href="parents.html"><span aria-hidden="true">👪</span><b>For Parents</b><small>What he’s learning + settings</small></a>
      </div>
    </section>
  </div>
</main>

<div class="picker-back" id="picker" hidden>
  <div class="picker" role="dialog" aria-modal="true" aria-labelledby="pk-title">
    <div class="pk-step" data-step="1">
      <p class="pk-kicker">Step 1 of 3</p>
      <h2 id="pk-title">Choose your ninja name</h2>
      <p>Every ninja needs a secret name. Roll the dice or type your own. <b>Tip:</b> don’t use your real full name online.</p>
      <div class="pk-name"><input id="pk-nick" maxlength="20" autocomplete="off" aria-label="Ninja name"><button type="button" class="btn" id="pk-roll" aria-label="Roll a random ninja name">🎲</button></div>
      <div class="pk-nav"><span></span><button type="button" class="btn primary" data-go="2">Next →</button></div>
    </div>
    <div class="pk-step" data-step="2" hidden>
      <p class="pk-kicker">Step 2 of 3</p>
      <h2>Pick your avatar</h2>
      <div class="pk-avatars" id="pk-avatars" role="radiogroup" aria-label="Avatar"></div>
      <div class="pk-nav"><button type="button" class="btn" data-go="1">← Back</button><button type="button" class="btn primary" data-go="3">Next →</button></div>
    </div>
    <div class="pk-step" data-step="3" hidden>
      <p class="pk-kicker">Step 3 of 3</p>
      <h2>What are you into?</h2>
      <p>Pick your favorites. Lessons will use them for examples and characters. (Pick at least one.)</p>
      <div class="pk-themes" id="pk-themes"></div>
      <p class="feedback no" id="pk-err" aria-live="polite"></p>
      <div class="pk-nav"><button type="button" class="btn" data-go="2">← Back</button><button type="button" class="btn primary" id="pk-done">Enter the Dojo 🥋</button></div>
    </div>
  </div>
</div>`;

  const css = `
body{--bg:#fbf6ef;--bg2:#f1e7da;--accent:#e4572e;--accent2:#5b2a86;--card:#fff;background:var(--bg)}
#dojo-bar{background:#241133;border-bottom-color:#ffffff22}
#dojo-bar .db-home,#dojo-bar .db-pill,#dojo-bar .db-sound{background:#ffffff14;color:#fff;border-color:#ffffff33}
#dojo-bar .db-me{color:#fff}
.hub-hero{position:relative;background:linear-gradient(180deg,#ffb86b 0%,#ff7e5f 38%,#b24592 72%,#241133 100%);color:#fff;padding:34px 0 120px;overflow:hidden}
.hub-mtn{position:absolute;left:0;right:0;bottom:0;width:100%;height:160px}
.hub-sun{position:absolute;right:8%;top:14px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,#fff6d5 0,#ffd27a 55%,#ffd27a00 70%);animation:sunrise 3s ease-out both}
@keyframes sunrise{from{transform:translateY(40px);opacity:0}}
.hub-top{position:relative;z-index:1}
.hub-kicker{text-transform:uppercase;letter-spacing:.25em;font-weight:800;margin:0;opacity:.9}
.hub-top h1{font-size:clamp(2.3rem,9vw,4.4rem);text-shadow:0 4px 0 #0003;margin:.1em 0 .2em}
.hub-warn{background:#fff3cd;color:#3d2c00;border-radius:12px;padding:10px 14px;font-weight:700;max-width:34em}
.hub-greet{font-size:1.15rem;font-weight:600;max-width:34em}
.hub-stats{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.hub-stat{background:#ffffff26;border:2px solid #ffffff55;border-radius:16px;padding:8px 14px;min-width:92px}
.hub-stat b{display:block;font-size:1.4rem} .hub-stat small{opacity:.9;font-weight:700}
.hub .card{margin-top:-60px;position:relative;z-index:2}
.hub .card~.card{margin-top:18px}
.hub-continue{display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap;border:3px solid #241133}
.hub-label{text-transform:uppercase;letter-spacing:.12em;font-size:.8rem;font-weight:800;color:var(--accent);margin:0}
.hub-continue h2{margin:.1em 0}
.hub-sub{color:var(--muted);margin:0}
.btn.big{min-height:60px;font-size:1.2rem;padding:12px 26px}
.hub-daily{display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.hub-daily h2{margin:0}.hub-daily p{margin:0;color:var(--muted)}
.hub-daily>div:nth-child(2){flex:1;min-width:180px}
.hub-daily-ico{font-size:2.6rem}
.hub-h{margin-top:30px}
.map{position:relative;margin:10px 0 20px}
.map svg.trail{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.map-node{position:absolute;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:4px;text-decoration:none;color:var(--ink);width:150px;text-align:center}
.map-disc{width:84px;height:84px;border-radius:50%;display:grid;place-items:center;font-size:2rem;border:4px solid #241133;box-shadow:0 6px 0 #24113355;position:relative;transition:transform .2s}
a.map-node:hover .map-disc,a.map-node:focus-visible .map-disc{transform:scale(1.08)}
.map-node b{font-size:.95rem;line-height:1.1}
.map-node small{font-size:.78rem;color:var(--muted);font-weight:700}
.map-node.locked .map-disc{filter:grayscale(.85);opacity:.55}
.map-node.earned .map-disc::after{content:"✓";position:absolute;right:-6px;top:-6px;width:30px;height:30px;border-radius:50%;background:#1b7f4b;color:#fff;display:grid;place-items:center;font-size:1rem;font-weight:900;border:3px solid #fff}
.map-node.current .map-disc{animation:bob 2.4s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(-6px)}}
.map-belt{width:52px;height:14px;border-radius:4px;border:2px solid #0006;margin-top:-6px}
.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin:10px 0 30px}
.tile{display:flex;flex-direction:column;gap:2px;padding:16px;border-radius:18px;background:var(--card);border:2px solid var(--line);box-shadow:var(--shadow);text-decoration:none;color:var(--ink);text-align:left;font:inherit;cursor:pointer;min-height:120px}
.tile span{font-size:2rem} .tile small{color:var(--muted)}
.tile:hover{transform:translateY(-2px)}
.picker-back{position:fixed;inset:0;z-index:120;background:#241133e8;display:flex;align-items:flex-start;justify-content:center;padding:24px 16px;overflow:auto}
.picker{background:#fffaf2;border-radius:24px;padding:24px 20px;width:100%;max-width:560px;min-width:0;margin:auto 0;border:4px solid #241133;box-shadow:0 20px 60px #0008}
.pk-kicker{text-transform:uppercase;letter-spacing:.15em;font-weight:800;color:var(--accent);font-size:.8rem;margin:0}
.pk-name{display:flex;gap:8px}
.pk-name input{flex:1;min-width:0;font:700 1.3rem var(--font-body);padding:10px 14px;border-radius:14px;border:3px solid #241133;min-height:52px}
.pk-avatars{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.pk-av{font-size:2.2rem;min-height:70px;border-radius:16px;border:3px solid var(--line);background:#fff;cursor:pointer}
.pk-av[aria-checked="true"]{border-color:var(--accent);background:#ffe7dc;box-shadow:0 0 0 3px #e4572e55}
.pk-themes{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}
.pk-th{display:flex;align-items:center;gap:8px;padding:10px;border-radius:14px;border:3px solid var(--line);background:#fff;cursor:pointer;font:700 .95rem var(--font-body);min-height:52px;text-align:left;color:var(--ink)}
.pk-th[aria-pressed="true"]{border-color:#5b2a86;background:#efe4fa}
.pk-th span{font-size:1.4rem}
.pk-nav{display:flex;justify-content:space-between;margin-top:18px;gap:10px}
`;
  const js = `(function(){var D=window.Dojo,st=D.state();
var ADJ=['Shadow','Thunder','Silent','Blazing','Swift','Iron','Crimson','Golden','Storm','Midnight','Jade','Cosmic','Quantum','Pixel','Turbo','Neon'];
var NOUN=['Falcon','Tiger','Dragon','Panther','Cobra','Wolf','Phoenix','Knight','Rook','Comet','Striker','Byte','Circuit','Blade','Viper','Hawk'];
var AV=['🥷','🐉','🐯','🦅','🦊','🐼','🤖','🦈','🐺','🦁','👾','🧠'];
function roll(){return ADJ[Math.floor(Math.random()*ADJ.length)]+' '+NOUN[Math.floor(Math.random()*NOUN.length)];}
// ---------- stats + greeting ----------
function render(){
 var p=D.profile();
 document.getElementById('hub-greet').innerHTML=p?('Welcome back, <b>'+D.student+'</b> — a.k.a. <b>'+D.esc(p.avatar+' '+p.nick)+'</b>. Your training continues.'):'Learn how AI works. Use it well. Build with it.';
 var belts=D.countBelts();
 document.getElementById('hub-stats').innerHTML=[['⭐',st.xp.toLocaleString(),'XP'],['🥋',belts+'/'+D.C.worlds.length,'Belts'],['🔥',D.streakNow(),'Day streak'],['🏅',D.badgeCount(),'Badges'],['📚',D.countDone()+'/'+D.allLessons().length,'Lessons']]
  .map(function(s){return '<div class="hub-stat"><b><span aria-hidden="true">'+s[0]+'</span> '+s[1]+'</b><small>'+s[2]+'</small></div>';}).join('');
 var n=D.nextStep(),cb=document.getElementById('cont-btn'),cs=document.getElementById('cont-sub'),L=st.last;
 if(L&&L.id&&!D.lessonDone(L.id)&&D.worldUnlocked(D.worldById(L.id.split('/')[0]))){n={href:L.href,label:L.title,sub:'💾 Pick up right where you left off'+(L.section&&L.section!=='story'?' (the '+L.section+')':'')};}
 if(n){cb.href=n.href;cb.textContent=(D.countDone()||L?'▶ Continue: ':'▶ Start: ')+n.label;cs.textContent=n.sub;}
 else{var all=D.C.worlds.every(function(w){return st.belts[w.id];});
  if(all){cb.href='certificate.html';cb.textContent='📜 View your certificate';cs.textContent='Black Belt master. Keep sharpening in the Arcade and Daily Dojo!';}
  else{cb.href='daily.html';cb.textContent='🌅 Daily Dojo';cs.textContent='You’ve finished every open lesson. New worlds are on the way — sharpen your skills in the Daily Dojo!';}}
 var t=D.today();document.getElementById('daily-sub').textContent=st.daily[t]?('✅ Done today! Streak: '+D.streakNow()+' day'+(D.streakNow()===1?'':'s')+'. Come back tomorrow.'):('5 minutes. 5 questions. Keep your streak alive'+(D.streakNow()?(' — you’re on '+D.streakNow()+'!'):'.'));
 document.getElementById('daily-btn').textContent=st.daily[t]?'Practice again':'Train today';
 document.getElementById('badge-sub').textContent=D.badgeCount()+' of '+D.BADGES.length+' collected';
 var ta=document.getElementById('tile-arcade');if(ta&&D.C.arcade.length){var open=D.C.arcade.filter(function(g){return st.unlockAll||D.badgeCount()>=g.need;}).length;document.getElementById('arcade-sub').textContent=open+' of '+D.C.arcade.length+' games unlocked';}
 renderMap();
}
// ---------- map ----------
function renderMap(){
 var W=D.C.worlds,map=document.getElementById('map'),step=132,top=70,n=W.length;
 map.style.height=(top*2+step*(n-1))+'px';
 var pts=W.map(function(w,i){return {x:i%2?72:28,y:top+i*step};});
 var d='M'+pts[0].x+' '+pts[0].y;for(var i=1;i<n;i++){var a=pts[i-1],b=pts[i],my=(a.y+b.y)/2;d+=' C'+a.x+' '+my+' '+b.x+' '+my+' '+b.x+' '+b.y;}
 var H=top*2+step*(n-1);
 var next=D.nextStep(),cur=next&&next.world?next.world.id:null;
 var html='<svg class="trail" viewBox="0 0 100 '+H+'" preserveAspectRatio="none" aria-hidden="true"><path d="'+d+'" fill="none" stroke="#24113333" stroke-width="10" stroke-linecap="round" vector-effect="non-scaling-stroke"/><path d="'+d+'" fill="none" stroke="#e4572e" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg><ol style="list-style:none;margin:0;padding:0">';
 W.forEach(function(w,i){var earned=!!st.belts[w.id],open=D.worldUnlocked(w),p=D.worldProgress(w);
  var cls='map-node'+(earned?' earned':'')+(open?'':' locked')+(w.id===cur?' current':'');
  var status=earned?'Belt earned':open?(p.done+'/'+p.total+' lessons'):(w.built?'🔒 Earn '+(W[i-1]?W[i-1].name:'')+' first':'🔒 Locked');
  var inner='<span class="map-disc" style="background:'+w.color+'" aria-hidden="true">'+(open||earned?w.emoji:'🔒')+'</span><span class="map-belt" style="background:'+w.color+'" aria-hidden="true"></span><b>'+D.esc(w.name)+'</b><small>'+D.esc(w.world)+'</small><small>'+status+'</small>';
  var pos='left:'+pts[i].x+'%;top:'+pts[i].y+'px';
  html+='<li>'+(open?'<a class="'+cls+'" style="'+pos+'" href="worlds/'+w.id+'/index.html" aria-label="'+D.esc(w.name+': '+w.world+'. '+status)+'">'+inner+'</a>':'<div class="'+cls+'" style="'+pos+'" aria-label="'+D.esc(w.name+': '+w.world+'. '+status)+'" role="img">'+inner+'</div>')+'</li>';});
 map.innerHTML=html+'</ol>';
}
// ---------- onboarding picker ----------
var pk=document.getElementById('picker'),draft={nick:'',avatar:AV[0],themes:['chess','martial','basketball','soccer']},lastFocus=null;
function openPicker(){var p=D.profile();if(p){draft={nick:p.nick,avatar:p.avatar,themes:p.themes.slice()};}else draft.nick=roll();
 document.getElementById('pk-nick').value=draft.nick;renderAv();renderTh();show(1);lastFocus=document.activeElement;pk.hidden=false;document.body.style.overflow='hidden';document.getElementById('pk-nick').focus();}
function closePicker(){pk.hidden=true;document.body.style.overflow='';if(lastFocus&&lastFocus.focus)lastFocus.focus();}
function show(n){D.$all('.pk-step',pk).forEach(function(s){s.hidden=s.getAttribute('data-step')!=String(n);});var h=pk.querySelector('.pk-step:not([hidden]) h2');if(h){h.setAttribute('tabindex','-1');h.focus();}}
function renderAv(){var box=document.getElementById('pk-avatars');box.innerHTML=AV.map(function(a){return '<button type="button" class="pk-av" role="radio" aria-checked="'+(a===draft.avatar)+'" aria-label="Avatar '+a+'">'+a+'</button>';}).join('');
 D.$all('.pk-av',box).forEach(function(b,i){b.addEventListener('click',function(){draft.avatar=AV[i];renderAv();box.querySelectorAll('.pk-av')[i].focus();D.sfx('click');});});}
function renderTh(){var box=document.getElementById('pk-themes');var ids=Object.keys(D.C.themes);
 box.innerHTML=ids.map(function(id){var t=D.C.themes[id];return '<button type="button" class="pk-th" data-id="'+id+'" aria-pressed="'+(draft.themes.indexOf(id)>=0)+'"><span aria-hidden="true">'+t.emoji+'</span>'+D.esc(t.name)+'</button>';}).join('');
 D.$all('.pk-th',box).forEach(function(b){b.addEventListener('click',function(){var id=b.getAttribute('data-id'),k=draft.themes.indexOf(id);if(k>=0)draft.themes.splice(k,1);else draft.themes.push(id);b.setAttribute('aria-pressed',k<0);D.sfx('click');});});}
D.$all('[data-go]',pk).forEach(function(b){b.addEventListener('click',function(){var v=document.getElementById('pk-nick').value.trim();if(!v){v=roll();document.getElementById('pk-nick').value=v;}draft.nick=v;show(+b.getAttribute('data-go'));});});
document.getElementById('pk-roll').addEventListener('click',function(){document.getElementById('pk-nick').value=roll();D.sfx('click');});
document.getElementById('pk-done').addEventListener('click',function(){if(!draft.themes.length){document.getElementById('pk-err').textContent='Pick at least one theme!';return;}
 var first=!D.profile();D.setProfile({nick:(draft.nick||roll()).slice(0,20),avatar:draft.avatar,themes:draft.themes.slice()});closePicker();render();
 D.toast(first?'🥋 Welcome to the dojo, '+D.nick()+'!':'✅ Ninja profile saved');if(first)D.confetti(50);});
pk.addEventListener('keydown',function(e){if(e.key==='Escape'&&D.profile())closePicker();
 if(e.key==='Tab'){var f=D.$all('button:not([disabled]),input',pk).filter(function(x){return x.offsetParent!==null;});if(!f.length)return;var a=f[0],z=f[f.length-1];
  if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}});
document.getElementById('edit-profile').addEventListener('click',openPicker);
render();
if(!D.storageOK)document.getElementById('hub-greet').insertAdjacentHTML('afterend','<p class="hub-warn">⚠️ This browser is blocking saving (maybe a private window), so progress will reset when you close it. Open the dojo in a normal browser window to keep your progress.</p>');
if(!D.profile())openPicker();
})();`;
  return { title: "Yusuf's AI Dojo", desc: 'An interactive, belt-by-belt adventure in how AI works, how to use it well, and how to build with it.', css, body, scripts: [js], meta: { type: 'hub', id: 'hub' }, bodyClass: 'hub-page' };
};
