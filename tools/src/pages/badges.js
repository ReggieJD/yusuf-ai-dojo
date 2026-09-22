// Badge wall.
module.exports = function () {
  const body = `
<main id="main" class="wrap badges">
  <section class="hero">
    <div class="hero-art" aria-hidden="true">🏅</div>
    <span class="kicker">Badge Wall</span>
    <h1>Your Badges</h1>
    <p class="hook" id="bw-sub"></p>
  </section>
  <ul class="bw-grid" id="bw-grid"></ul>
</main>`;
  const css = `
body{--bg:#101828;--bg2:#1d2939;--ink:#f2f4f7;--muted:#c0c7d4;--card:#1d2939;--line:#ffffff22;--accent:#fdb022;--accent-ink:#101828;--accent2:#84caff;
 background:radial-gradient(circle at 50% 0,#344054,#101828 60%)}
.bw-grid{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;margin:10px 0 40px}
.bw{background:var(--card);border:2px solid var(--line);border-radius:20px;padding:16px 12px;text-align:center;min-height:170px}
.bw .ic{width:74px;height:74px;margin:0 auto 8px;border-radius:50%;display:grid;place-items:center;font-size:2.2rem;background:radial-gradient(circle at 35% 30%,#fff6,#0000 60%),#475467;border:4px solid #667085}
.bw.got .ic{background:radial-gradient(circle at 35% 30%,#fff9,#0000 60%),linear-gradient(135deg,#fdb022,#f79009);border-color:#fec84b;box-shadow:0 0 0 4px #fdb02233}
.bw:not(.got) .ic{filter:grayscale(1);opacity:.5}
.bw b{display:block} .bw small{color:var(--muted)}
.bw .when{display:block;color:#fec84b;font-weight:700;margin-top:4px;font-size:.78rem}
`;
  const js = `(function(){var D=window.Dojo,st=D.state();D.checkBadges(true);
document.getElementById('bw-sub').textContent='You have collected '+D.badgeCount()+' of '+D.BADGES.length+' badges. Badges also unlock Bonus Arcade games!';
document.getElementById('bw-grid').innerHTML=D.BADGES.map(function(b){var got=st.badges[b.id];
 var ic=b.color?'<span style="display:block;width:44px;height:14px;border-radius:3px;background:'+b.color+';border:2px solid #0006"></span>':b.icon;
 return '<li class="bw'+(got?' got':'')+'"><div class="ic" aria-hidden="true">'+ic+'</div><b>'+D.esc(b.name)+'</b><small>'+D.esc(b.how)+'</small>'+(got?'<span class="when">Earned '+got+'</span>':'<span class="sr-only">Not yet earned</span>')+'</li>';}).join('');
})();`;
  return { title: "Badge Wall · Yusuf's AI Dojo", css, body, scripts: [js], meta: { type: 'badges', id: 'badges' } };
};
