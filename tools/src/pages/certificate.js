// Printable Black Belt certificate (first name only).
module.exports = function () {
  const body = `
<main id="main" class="wrap cert-page">
  <section id="cert-locked" class="card no-print" hidden>
    <h1>📜 The Black Belt Certificate</h1>
    <p>This certificate appears when you earn your <b>Black Belt</b>. Here’s your journey so far:</p>
    <ol class="cert-belts" id="cert-progress"></ol>
    <a class="btn primary" href="index.html">Back to training</a>
  </section>
  <section id="cert" hidden>
    <div class="no-print row cert-tools"><button type="button" class="btn primary" id="cert-print">🖨️ Print certificate</button><a class="btn" href="index.html">Dojo map</a></div>
    <article class="certificate" aria-label="Black Belt certificate">
      <div class="c-border">
        <p class="c-kicker">Yusuf’s AI Dojo</p>
        <h1 class="c-title">Certificate of Black Belt Mastery</h1>
        <p class="c-pre">This certifies that</p>
        <p class="c-name">Yusuf</p>
        <p class="c-body">has completed all eight belts of the AI Dojo — from <i>What Is AI?</i> to the <i>Builder Lab</i> — and has shown that he understands how artificial intelligence works, how to use it wisely, how to build with it, and how to be a fair and safe AI citizen.</p>
        <div class="c-belts" id="c-belts" aria-hidden="true"></div>
        <div class="c-foot">
          <div><span class="c-line" id="c-date"></span><small>Date</small></div>
          <div class="c-seal" aria-hidden="true">🥋</div>
          <div><span class="c-line c-sig">Sensei Byte</span><small>Head Sensei</small></div>
        </div>
      </div>
    </article>
  </section>
</main>`;
  const css = `
body{--bg:#1b1b1b;--card:#262626;--ink:#f5f5f5;--muted:#cfcfcf;--line:#ffffff26;--accent:#f5c542;--accent-ink:#1b1b1b;--bg2:#333}
.cert-belts{display:grid;gap:8px;padding-left:1.4em}
.cert-tools{margin:20px 0}
.certificate{background:#fffdf5;color:#1b1b1b;padding:16px;border-radius:6px;box-shadow:0 20px 60px #0008;margin-bottom:40px}
.c-border{border:6px double #9a7b1a;padding:28px 18px;text-align:center;background:radial-gradient(circle at 50% 40%,#fff 0,#fbf3dc 80%)}
.c-kicker{letter-spacing:.3em;text-transform:uppercase;font-weight:800;color:#9a7b1a;margin:0}
.c-title{font:700 clamp(1.6rem,5vw,2.6rem)/1.15 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;margin:.3em 0}
.c-pre{font-style:italic;margin:.5em 0 0}
.c-name{font:italic 700 clamp(2.6rem,10vw,4.4rem)/1.1 "Snell Roundhand","Brush Script MT","Segoe Script",cursive;color:#1b1b1b;margin:.1em 0;border-bottom:2px solid #9a7b1a;display:inline-block;padding:0 .4em}
.c-body{max-width:34em;margin:1em auto}
.c-belts{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin:14px 0}
.c-belts span{width:44px;height:12px;border-radius:3px;border:1.5px solid #0006}
.c-foot{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:end;margin-top:26px}
.c-foot small{display:block;color:#555}
.c-line{display:block;border-bottom:1.5px solid #1b1b1b;padding-bottom:4px;min-height:1.6em;font-weight:700}
.c-sig{font:italic 700 1.4rem "Snell Roundhand","Brush Script MT","Segoe Script",cursive}
.c-seal{width:76px;height:76px;border-radius:50%;background:radial-gradient(#f5c542,#9a7b1a);display:grid;place-items:center;font-size:2.2rem;border:4px solid #7a5f10}
@media print{@page{size:landscape;margin:12mm} .certificate{box-shadow:none;margin:0;padding:0} main.wrap{max-width:none;padding:0} footer.site{display:none} .c-border{min-height:170mm;display:flex;flex-direction:column;justify-content:center}}
`;
  const js = `(function(){var D=window.Dojo,st=D.state(),W=D.C.worlds,last=W[W.length-1];
if(st.belts[last.id]){document.getElementById('cert').hidden=false;
 var d=new Date(st.belts[last.id]+'T12:00:00');document.getElementById('c-date').textContent=isNaN(d)?st.belts[last.id]:d.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'});
 document.getElementById('c-belts').innerHTML=W.map(function(w){return '<span style="background:'+w.color+'"></span>';}).join('');
 document.getElementById('cert-print').addEventListener('click',function(){window.print();});}
else{document.getElementById('cert-locked').hidden=false;
 document.getElementById('cert-progress').innerHTML=W.map(function(w){return '<li>'+(st.belts[w.id]?'✅ ':'⬜ ')+D.esc(w.name)+' — '+D.esc(w.world)+'</li>';}).join('');}
})();`;
  return { title: "Black Belt Certificate · Yusuf's AI Dojo", css, body, scripts: [js], meta: { type: 'certificate', id: 'certificate' } };
};
