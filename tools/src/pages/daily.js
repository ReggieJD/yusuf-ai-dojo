// Daily Dojo: a 5-minute review challenge that builds the streak.
module.exports = function (ctx) {
  const { worlds, json } = ctx;
  const bank = [];
  worlds.filter((w) => w.built).forEach((w) => w.lessons.forEach((l) => {
    const mod = require(`../lessons/${w.id}/${l.id}.js`);
    mod.quiz.forEach((q) => bank.push(Object.assign({ from: `${w.id}/${l.id}` }, q)));
  }));
  const wisdom = [
    'The words “artificial intelligence” were first used in a 1955 proposal for a summer workshop at Dartmouth College in 1956.',
    'In 1997, IBM’s chess computer Deep Blue beat world champion Garry Kasparov in a six-game match.',
    'In 2016, DeepMind’s AlphaGo beat Lee Sedol, one of the world’s best Go players, 4 games to 1.',
    'ELIZA, one of the first chatbots, was made in the 1960s by Joseph Weizenbaum. It mostly turned your words back into questions — and some people still felt it understood them.',
    'Alan Turing described his “imitation game,” now called the Turing Test, in a 1950 paper.',
    'The perceptron, an early artificial neuron you could train, was built by Frank Rosenblatt in 1958.',
    'A 12-megapixel photo is a grid of about 12 million pixels, and each pixel is stored as numbers.',
    'Music on a CD is stored as 44,100 sound measurements (samples) every second, for each speaker.',
    'The word “robot” comes from a 1920 Czech play called R.U.R. by Karel Čapek.',
    'Chatbots read and write text in chunks called tokens. A token is often a whole word or just part of one.',
    'The 2024 Nobel Prize in Chemistry was shared by scientists behind AlphaFold, an AI that predicts the 3D shapes of proteins, and a scientist who designs new proteins.',
    'The 2024 Nobel Prize in Physics went to John Hopfield and Geoffrey Hinton for early discoveries that made neural networks possible.',
    'The word “algorithm” comes from al-Khwarizmi, a scholar who worked in Baghdad about 1,200 years ago.',
    'Self-checkout cameras, phone face unlock and photo search all use computer vision — AI that works with images.',
  ];
  const body = `
<main id="main" class="wrap daily">
  <section class="hero">
    <div class="dl-sun" aria-hidden="true">🌅</div>
    <span class="kicker">Daily Dojo</span>
    <h1>Your 5-Minute Training</h1>
    <p class="hook">Five review questions from lessons you’ve trained on. Finish once a day to grow your streak 🔥.</p>
    <div class="dl-stats"><span class="pill" id="dl-streak"></span><span class="pill" id="dl-best"></span><span class="pill" id="dl-timer" aria-live="off">⏱️ 5:00</span></div>
  </section>
  <section class="card" aria-labelledby="h-dq"><div class="sec-title"><span class="ico" aria-hidden="true">🥋</span><h2 id="h-dq">Today’s Kata</h2></div><div id="dl-quiz"></div></section>
  <section class="card dl-wisdom" aria-labelledby="h-dw"><div class="sec-title"><span class="ico" aria-hidden="true">💡</span><h2 id="h-dw">Dojo Wisdom</h2></div><p id="dl-wis"></p></section>
  <section class="card" aria-labelledby="h-dc"><h2 id="h-dc">📅 Your last 14 days</h2><div class="dl-cal" id="dl-cal"></div></section>
</main>`;
  const css = `
body{--bg:#fff4e6;--bg2:#ffe3c2;--accent:#f76707;--accent2:#c2410c;background:linear-gradient(180deg,#ffd8a8,#fff4e6 320px)}
.dl-sun{font-size:3.6rem;animation:rise 2s ease-out both}@keyframes rise{from{transform:translateY(30px);opacity:0}}
.dl-stats{display:flex;gap:8px;flex-wrap:wrap}
.dl-stats .pill{font-size:1rem;padding:6px 14px;background:#fff;border:2px solid var(--line)}
.dl-wisdom p{font-size:1.1rem}
.dl-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.dl-day{aspect-ratio:1;border-radius:10px;display:grid;place-items:center;font-size:.8rem;font-weight:800;background:var(--bg2);color:#7c2d12}
.dl-day.on{background:#f76707;color:#fff}
.dl-day.today{outline:3px solid #7c2d12}
`;
  const js = `window.DAILY_BANK=${json(bank)};window.WISDOM=${json(wisdom)};
(function(){var D=window.Dojo,st=D.state(),t=D.today();
function stats(){document.getElementById('dl-streak').textContent='🔥 Streak: '+D.streakNow();document.getElementById('dl-best').textContent='🏆 Best: '+(st.streak.best||0);
 var cal='',d=new Date();for(var i=13;i>=0;i--){var x=new Date(d.getFullYear(),d.getMonth(),d.getDate()-i),k=D.today(x);cal+='<div class="dl-day'+(st.daily[k]?' on':'')+(i===0?' today':'')+'" title="'+k+'" aria-label="'+k+(st.daily[k]?' trained':' not trained')+'">'+x.getDate()+'</div>';}
 document.getElementById('dl-cal').innerHTML=cal;}
var dayN=Math.floor(Date.now()/86400000);document.getElementById('dl-wis').textContent=window.WISDOM[dayN%window.WISDOM.length];
var mine=window.DAILY_BANK.filter(function(q){return D.lessonDone(q.from);});var bank=mine.length>=5?mine:window.DAILY_BANK;
var left=300,timer=null,tEl=document.getElementById('dl-timer');
function tick(){left=Math.max(0,left-1);tEl.textContent='⏱️ '+Math.floor(left/60)+':'+('0'+left%60).slice(-2);if(!left){clearInterval(timer);tEl.textContent='⏱️ Time! Finish up — no rush.';}}
timer=setInterval(tick,1000);
D.quiz(document.getElementById('dl-quiz'),bank,{count:5,reshuffle:true,onDone:function(sc,tot){clearInterval(timer);
 var first=D.markDaily();stats();
 if(first){D.confetti(50);D.toast('🔥 Streak: '+D.streakNow()+' day'+(D.streakNow()===1?'':'s')+'!');}
 else D.toast('Extra practice complete. Your streak is already safe today!');}});
stats();
})();`;
  return { title: "Daily Dojo · Yusuf's AI Dojo", css, body, scripts: [js], meta: { type: 'daily', id: 'daily' } };
};
