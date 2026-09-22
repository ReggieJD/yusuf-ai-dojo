// Dojo Scrolls: glossary of every AI key term + flashcard mode.
module.exports = function (ctx) {
  const body = `
<main id="main" class="wrap scrolls">
  <section class="hero">
    <div class="hero-art" aria-hidden="true">📜</div>
    <span class="kicker">Dojo Scrolls</span>
    <h1>Every AI Key Term</h1>
    <p class="hook">Each lesson unlocks one key term. Read the scrolls, then test yourself in Flashcard mode.</p>
    <div class="row" role="tablist" aria-label="View">
      <button type="button" class="btn primary" role="tab" id="tab-list" aria-selected="true" aria-controls="view-list">📜 All scrolls</button>
      <button type="button" class="btn" role="tab" id="tab-cards" aria-selected="false" aria-controls="view-cards">🃏 Flashcards</button>
    </div>
  </section>
  <section id="view-list" role="tabpanel" aria-labelledby="tab-list"></section>
  <section id="view-cards" role="tabpanel" aria-labelledby="tab-cards" hidden>
    <div class="card">
      <label class="sc-only"><input type="checkbox" id="fc-mine"> Only terms from lessons I’ve finished</label>
      <p class="fc-count" id="fc-count" aria-live="polite"></p>
      <button type="button" class="fc-card" id="fc-card" aria-live="polite"><span class="fc-side" id="fc-side">TERM</span><span class="fc-text" id="fc-text"></span><span class="fc-hint">Tap to flip</span></button>
      <div class="row fc-nav"><button type="button" class="btn" id="fc-again">🔁 Again</button><button type="button" class="btn primary" id="fc-got">✅ Got it</button><button type="button" class="btn" id="fc-shuffle">🔀 Shuffle</button></div>
    </div>
  </section>
</main>`;
  const css = `
body{--bg:#f3efe4;--bg2:#e6dcc4;--accent:#7a4e1d;--accent2:#7a4e1d}
.sc-world h2{display:flex;align-items:center;gap:10px;margin-top:26px}
.sc-belt{display:inline-block;width:34px;height:12px;border-radius:3px;border:2px solid #0004}
.sc-grid{display:grid;gap:12px}
@media(min-width:640px){.sc-grid{grid-template-columns:1fr 1fr}}
.sc-term{background:linear-gradient(#fffdf6,#f7eed8);border:2px solid #7a4e1d44;border-radius:6px 18px 6px 18px;padding:14px 16px;position:relative}
.sc-term dt{font:800 1.12rem/1.2 Georgia,serif}
.sc-term dd{margin:6px 0 0}
.sc-term small{display:block;margin-top:8px;color:var(--muted);font-weight:700}
.sc-term.learned::after{content:"✓ learned";position:absolute;top:10px;right:12px;font-size:.75rem;font-weight:800;color:#1b7f4b}
.sc-only{display:flex;gap:8px;align-items:center;font-weight:700;min-height:44px}
.sc-only input{width:22px;height:22px}
.fc-card{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px;width:100%;min-height:240px;border-radius:22px;border:4px solid #7a4e1d;background:repeating-linear-gradient(0deg,#fffdf6 0 30px,#f4ead3 30px 31px);padding:20px;cursor:pointer;font:inherit;color:var(--ink);text-align:center;transition:transform .35s}
.fc-card.flip{background:#7a4e1d;color:#fff8e7;transform:rotateX(360deg)}
.fc-side{font-size:.8rem;letter-spacing:.2em;font-weight:800;opacity:.7}
.fc-text{font:800 1.5rem/1.35 Georgia,serif}
.fc-card.flip .fc-text{font:600 1.15rem/1.5 var(--font-body)}
.fc-hint{font-size:.8rem;opacity:.7}
.fc-nav{justify-content:center;margin-top:14px}
.fc-count{font-weight:700;text-align:center}
`;
  const js = `(function(){var D=window.Dojo;
var list=document.getElementById('view-list');
list.innerHTML=D.C.worlds.map(function(w){return '<div class="sc-world"><h2><span class="sc-belt" style="background:'+w.color+'" aria-hidden="true"></span>'+D.esc(w.name)+': '+D.esc(w.world)+'</h2><dl class="sc-grid">'+
 w.lessons.map(function(l){var done=D.lessonDone(w.id+'/'+l.id);return '<div class="sc-term'+(done?' learned':'')+'"><dt>'+D.esc(l.term)+'</dt><dd>'+D.esc(l.def)+'</dd><small>From: '+(w.built?'<a href="worlds/'+w.id+'/'+l.id+'.html">'+D.esc(l.title)+'</a>':D.esc(l.title))+(done?'':'')+'</small></div>';}).join('')+'</dl></div>';}).join('');
var tl=document.getElementById('tab-list'),tc=document.getElementById('tab-cards');
function tab(cards){tl.setAttribute('aria-selected',!cards);tc.setAttribute('aria-selected',cards);tl.classList.toggle('primary',!cards);tc.classList.toggle('primary',cards);
 document.getElementById('view-list').hidden=cards;document.getElementById('view-cards').hidden=!cards;if(cards)deal();}
tl.addEventListener('click',function(){tab(false);});tc.addEventListener('click',function(){tab(true);});
var deck=[],pos=0,flipped=false,got=0;
function pool(){var mine=document.getElementById('fc-mine').checked;var out=[];D.allLessons().forEach(function(x){if(!mine||D.lessonDone(x.id))out.push(x.lesson);});return out;}
function deal(){deck=D.shuffle(pool());pos=0;got=0;show();}
function show(){var card=document.getElementById('fc-card');flipped=false;card.classList.remove('flip');
 if(!deck.length){document.getElementById('fc-side').textContent='';document.getElementById('fc-text').textContent='Finish a lesson to add its term to your deck!';document.getElementById('fc-count').textContent='';return;}
 if(pos>=deck.length){document.getElementById('fc-side').textContent='DECK COMPLETE';document.getElementById('fc-text').textContent='🎉 You got '+got+' cards! Tap Shuffle to go again.';document.getElementById('fc-count').textContent='';D.confetti(30);return;}
 var c=deck[pos];document.getElementById('fc-side').textContent='TERM';document.getElementById('fc-text').textContent=c.term;
 document.getElementById('fc-count').textContent='Card '+(pos+1)+' of '+deck.length+' · Got it: '+got;}
document.getElementById('fc-card').addEventListener('click',function(){if(!deck.length||pos>=deck.length)return;flipped=!flipped;var c=deck[pos];
 this.classList.toggle('flip',flipped);document.getElementById('fc-side').textContent=flipped?'MEANING':'TERM';document.getElementById('fc-text').textContent=flipped?c.def:c.term;D.sfx('click');});
document.getElementById('fc-got').addEventListener('click',function(){if(pos<deck.length){got++;pos++;D.sfx('good');show();}});
document.getElementById('fc-again').addEventListener('click',function(){if(pos<deck.length){deck.push(deck[pos]);pos++;show();}});
document.getElementById('fc-shuffle').addEventListener('click',deal);
document.getElementById('fc-mine').addEventListener('change',deal);
})();`;
  return { title: "Dojo Scrolls · Yusuf's AI Dojo", desc: 'Every AI key term in the dojo, with flashcards.', css, body, scripts: [js], meta: { type: 'scrolls', id: 'scrolls' } };
};
