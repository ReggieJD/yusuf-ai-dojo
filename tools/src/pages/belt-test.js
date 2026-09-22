// Belt Test page: /worlds/<belt>/belt-test.html — mixed quiz + mini project → ceremony.
module.exports = function (ctx) {
  const { w, wi, worlds, art, esc, json, fnSrc, test } = ctx;
  const A = art[w.id];
  const next = worlds[wi + 1];
  if (!test.quiz || test.quiz.length < 10) throw new Error(`${w.id} belt test needs 10+ questions`);
  const body = `
<main id="main" class="wrap belt-test">
  <section class="hero">
    <div class="hanko" aria-hidden="true">${A.stamp}</div>
    ${A.hero({ emoji: '🏆' }, 2)}
    <span class="kicker">${esc(w.name)} Test</span>
    <h1>The ${esc(w.name)} Test</h1>
    <p class="hook">Two trials stand between you and your ${esc(w.name)}: a <b>mixed challenge quiz</b> (score 7 of 10 or more) and a <b>mini project</b>. Breathe. Focus. Begin.</p>
    <ul class="steps" aria-label="Test checklist">
      <li data-t="quiz"><span class="ck" aria-hidden="true"></span>Trial 1: Quiz</li>
      <li data-t="proj"><span class="ck" aria-hidden="true"></span>Trial 2: ${esc(test.project.title)}</li>
      <li data-t="belt"><span class="ck" aria-hidden="true"></span>${esc(w.name)}</li>
    </ul>
  </section>

  <section class="card" id="bt-locked" hidden>
    <h2>🔒 Not yet, young ninja</h2>
    <p id="bt-locked-msg"></p>
    <a class="btn primary" href="index.html">Back to ${esc(w.world)}</a>
  </section>

  <div id="bt-main">
    <section class="card" aria-labelledby="h-t1">
      <div class="sec-title"><span class="ico" aria-hidden="true">⚔️</span><h2 id="h-t1">Trial 1 · Mixed Challenge Quiz</h2></div>
      <div id="bt-quiz"></div>
    </section>
    <section class="card" id="bt-proj-sec" aria-labelledby="h-t2">
      <div class="sec-title"><span class="ico" aria-hidden="true">🛠️</span><h2 id="h-t2">Trial 2 · ${esc(test.project.title)}</h2></div>
      <p id="bt-proj-lock" class="instructions">🔒 Pass Trial 1 to unlock the mini project.</p>
      <div id="bt-proj-wrap" hidden><p class="instructions fill">${test.project.intro}</p><div id="bt-proj"></div></div>
    </section>
    <section class="card complete" id="bt-done" hidden>
      <h2>🥋 ${esc(w.name)} earned!</h2>
      <p>Wear it with pride, ${'{{name}}'}. ${next ? `A new world awaits: <b>${esc(next.world)}</b>.` : 'You have reached the top of the mountain.'}</p>
      <div class="row" style="justify-content:center">
        ${next ? (next.built ? `<a class="btn primary" href="../${next.id}/index.html">Enter ${esc(next.world)} →</a>` : `<a class="btn primary" href="../../daily.html">Sharpen up in the Daily Dojo →</a>`) : `<a class="btn primary" href="../../certificate.html">View your certificate 📜</a>`}
        <a class="btn" href="../../index.html">Dojo map</a>
      </div>
    </section>
  </div>
</main>`;
  const js = `
window.TEST_QUIZ=${json(test.quiz)};
window.TEST_PROJECT=${fnSrc(test.project.js)};
(function(){var D=window.Dojo,w=D.worldById(${JSON.stringify(w.id)}),T=D.theme('test');
D.$all('.fill').forEach(function(e){e.innerHTML=D.fill(e.innerHTML,T);});
var done=document.getElementById('bt-done');done.innerHTML=D.fill(done.innerHTML,T);
var st=D.state(); var rec=st.tests[w.id]||(st.tests[w.id]={});
function ck(k,on){var li=document.querySelector('[data-t="'+k+'"]');li.classList.toggle('on',!!on);li.querySelector('.ck').textContent=on?'✓':'';}
function refresh(){ck('quiz',rec.quiz);ck('proj',rec.proj);ck('belt',st.belts[w.id]);done.hidden=!st.belts[w.id];}
if(!D.testReady(w)&&!st.belts[w.id]){var p=D.worldProgress(w);document.getElementById('bt-locked').hidden=false;document.getElementById('bt-main').hidden=true;
 document.getElementById('bt-locked-msg').innerHTML='Finish every lesson in <b>'+D.esc(w.world)+'</b> first. You have completed <b>'+p.done+' of '+p.total+'</b>. (A lesson counts as done when you finish its activity and pass its quiz.)';refresh();return;}
var projBuilt=false;
function openProject(){document.getElementById('bt-proj-lock').hidden=true;document.getElementById('bt-proj-wrap').hidden=false;
 if(projBuilt)return;projBuilt=true;
 window.TEST_PROJECT(document.getElementById('bt-proj'),{T:T,D:D,nick:D.nick(),fill:function(s){return D.fill(s,T);},
 save:function(o){var c=D.saveGet('proj')||{};for(var k in o)c[k]=o[k];D.saveSet('proj',c);},load:function(){return D.saveGet('proj')||{};},done:function(){
   if(rec.proj&&st.belts[w.id])return; rec.proj=true;D.save();tryBelt();}});}
function tryBelt(){refresh();if(rec.quiz&&rec.proj&&!st.belts[w.id]){var q=rec.score||0;D.earnBelt(w.id,q,10);rec=st.tests[w.id];rec.quiz=true;rec.proj=true;D.save();
 D.ceremony(w,function(){refresh();done.scrollIntoView({behavior:D.reducedMotion()?'auto':'smooth'});});refresh();}}
D.quiz(document.getElementById('bt-quiz'),window.TEST_QUIZ,{T:T,pass:0.7,count:10,reshuffle:true,saveKey:'quiz',onDone:function(sc,tot,pass){
  if(pass){if(!rec.quiz||sc>(rec.score||0)){rec.score=sc;}rec.quiz=true;D.save();D.toast('⚔️ Trial 1 passed!');openProject();tryBelt();
   setTimeout(function(){document.getElementById('bt-proj-sec').scrollIntoView({behavior:D.reducedMotion()?'auto':'smooth'});},600);}
  else D.toast('You need 7 of 10. Review and try again!');}});
if(rec.quiz)openProject();
refresh();
})();`;
  return { title: `${w.name} Test · Yusuf's AI Dojo`, desc: `Earn your ${w.name}.`, worldCss: A.css, css: test.project.css || '', body, scripts: [js], meta: { type: 'test', id: w.id + '/belt-test', world: w.id }, bodyClass: `world-${w.id}` };
};
