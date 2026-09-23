// Arcade lobby.
const { ARCADE_CSS } = require('../arcade-shell');
module.exports = function (ctx) {
  const games = ctx.arcade.filter((g) => g.built);
  const body = `
<main id="main" class="wrap">
  <section class="ar-hero"><h1>🕹️ Bonus Arcade</h1><p>Eight games that sharpen your AI skills. Each one unlocks when you’ve collected enough badges. You have <b id="ar-n">0</b> badges.</p></section>
  <ul class="ar-grid" id="ar-grid">
    ${games.map((g) => `<li><a class="ar-card" href="${g.id}.html" data-need="${g.need}" data-id="${g.id}"><span class="e" aria-hidden="true">${g.emoji}</span><b>${ctx.esc(g.title)}</b><small>${ctx.esc(g.blurb)}</small><span class="st"></span></a></li>`).join('')}
  </ul>
</main>`;
  const css = `.ar-grid{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin:10px 0 40px}
.ar-card{display:flex;flex-direction:column;gap:4px;padding:14px;border-radius:16px;background:#150d33;border:2px solid #5ef2ff55;color:#f4f0ff;text-decoration:none;min-height:190px;box-shadow:0 0 18px #5ef2ff1a}
.ar-card:hover{border-color:#ff5edb}
.ar-card .e{font-size:2.4rem}.ar-card small{color:#c3b8ea}
.ar-card .st{margin-top:auto;font:800 .85rem var(--font-head);color:#5ef2ff}
.ar-card.locked{opacity:.6;border-style:dashed}`;
  const js = `(function(){var D=window.Dojo,st=D.state(),n=D.badgeCount();document.getElementById('ar-n').textContent=n;
D.$all('.ar-card').forEach(function(a){var need=+a.getAttribute('data-need'),rec=st.arcade[a.getAttribute('data-id')],open=st.unlockAll||n>=need;
 a.classList.toggle('locked',!open);a.querySelector('.st').textContent=open?(rec?'🏆 Best '+rec.best+' · '+rec.wins+' win'+(rec.wins===1?'':'s'):'▶ Play'):'🔒 Needs '+need+' badges';
 a.setAttribute('aria-label',a.querySelector('b').textContent+(open?'':' (locked: needs '+need+' badges)'));});})();`;
  return { title: "Bonus Arcade · Yusuf's AI Dojo", worldCss: ARCADE_CSS, css, body, scripts: [js], meta: { type: 'arcade', id: 'arcade' } };
};
