// World map page: /worlds/<belt>/index.html
module.exports = function (ctx) {
  const { w, wi, worlds, art, esc } = ctx;
  const A = art[w.id];
  const prev = wi > 0 ? worlds[wi - 1] : null;
  const body = `
<main id="main" class="wrap world-map">
  <section class="hero">
    <div class="hanko" aria-hidden="true">${A.stamp}</div>
    ${A.hero({ emoji: w.emoji }, 0)}
    <span class="kicker">World ${wi + 1} of ${worlds.length} · ${esc(w.name)}</span>
    <h1>${esc(w.world)}</h1>
    <p class="hook">${esc(w.blurb)}</p>
    <div class="wm-progress"><div class="meter" aria-hidden="true"><i id="wm-meter"></i></div><p id="wm-count" aria-live="polite"></p></div>
  </section>
  <div id="wm-locked" class="card" hidden>
    <h2>🔒 This world is still locked</h2>
    <p>Earn your <b>${prev ? esc(prev.name) : ''}</b> to unlock <b>${esc(w.world)}</b>. You can still peek at the lessons below — but your sensei recommends finishing in order.</p>
    ${prev ? `<a class="btn primary" href="../${prev.id}/index.html">Go to ${esc(prev.world)} →</a>` : ''}
  </div>
  <ol class="wm-path" id="wm-path">
    ${w.lessons.map((l, i) => `
    <li class="wm-stop" data-id="${w.id}/${l.id}">
      <a href="${l.id}.html" class="wm-link">
        <span class="wm-num" aria-hidden="true">${i + 1}</span>
        <span class="wm-em" aria-hidden="true">${l.emoji}</span>
        <span class="wm-txt"><b>${esc(l.title)}</b><small>~${l.min} min · Key term: ${esc(l.term)}</small></span>
        <span class="wm-state" aria-hidden="true"></span><span class="sr-only wm-sr"></span>
      </a>
    </li>`).join('')}
    <li class="wm-stop wm-test" data-test="${w.id}">
      <a href="belt-test.html" class="wm-link">
        <span class="wm-num" aria-hidden="true">🥋</span>
        <span class="wm-em" aria-hidden="true">🏆</span>
        <span class="wm-txt"><b>${esc(w.name)} Test</b><small>Mixed challenge + mini project. Unlocks when all lessons are done.</small></span>
        <span class="wm-state" aria-hidden="true"></span><span class="sr-only wm-sr"></span>
      </a>
    </li>
  </ol>
</main>`;
  const css = `
.wm-progress{max-width:420px;margin-top:10px}
.wm-progress p{margin-top:6px;font-weight:700}
.wm-path{list-style:none;padding:0;margin:10px 0 30px;position:relative}
.wm-path::before{content:"";position:absolute;left:31px;top:20px;bottom:20px;border-left:4px dotted var(--line)}
.wm-stop{position:relative;margin:0 0 14px}
.wm-link{display:flex;align-items:center;gap:12px;padding:12px 14px 12px 8px;border-radius:var(--radius);background:var(--card);border:2px solid var(--line);box-shadow:var(--shadow);text-decoration:none;color:var(--ink);min-height:76px;transition:transform .15s}
.wm-link:hover{transform:translateX(4px)}
.wm-num{flex:none;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;font-weight:900;background:var(--bg2);border:3px solid var(--ink);position:relative;z-index:1}
.wm-stop.done .wm-num{background:var(--good);color:#fff;border-color:var(--good)}
.wm-em{font-size:1.8rem;flex:none}
.wm-txt{display:flex;flex-direction:column;min-width:0} .wm-txt small{color:var(--muted)}
.wm-state{margin-left:auto;font-size:1.3rem;flex:none}
.wm-test .wm-link{border:3px solid var(--accent);background:linear-gradient(135deg,var(--card),var(--bg2))}
.wm-test.locked .wm-link{opacity:.6}
`;
  const js = `(function(){var D=window.Dojo,w=D.worldById(${JSON.stringify(w.id)});
var p=D.worldProgress(w);document.getElementById('wm-meter').style.width=(100*p.done/p.total)+'%';
var belt=D.state().belts[w.id];
document.getElementById('wm-count').textContent=belt?('🥋 '+w.name+' earned! All '+p.total+' lessons complete.'):(p.done+' of '+p.total+' lessons complete');
document.getElementById('wm-locked').hidden=D.worldUnlocked(w);
var next=null;
D.$all('.wm-stop[data-id]').forEach(function(li){var id=li.getAttribute('data-id'),s=D.state().lessons[id]||{};
 var st=li.querySelector('.wm-state'),sr=li.querySelector('.wm-sr');
 if(s.done){li.classList.add('done');st.textContent=s.ch?'✅🔥':'✅';sr.textContent=' — complete'+(s.ch?', challenge beaten':'');}
 else if(!next){next=li;st.textContent='▶';sr.textContent=' — up next';}
 else{st.textContent='';sr.textContent=' — not started';}});
var t=document.querySelector('.wm-test'),ts=t.querySelector('.wm-state'),tsr=t.querySelector('.wm-sr');
if(belt){ts.textContent='🥋';tsr.textContent=' — passed';}
else if(D.testReady(w)){ts.textContent='▶';tsr.textContent=' — ready!';}
else{t.classList.add('locked');ts.textContent='🔒';tsr.textContent=' — finish all lessons first';}
})();`;
  return { title: `${w.name}: ${w.world} · Yusuf's AI Dojo`, desc: w.blurb, worldCss: A.css, css, body, scripts: [js], meta: { type: 'world', id: w.id }, bodyClass: `world-${w.id}` };
};
