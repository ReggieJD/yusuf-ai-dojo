// Parents page: curriculum overview, privacy, discussion questions, settings (reset, backup, unlock).
module.exports = function (ctx) {
  const { worlds, esc } = ctx;
  const talk = {
    white: ['What’s one thing at home that uses AI, and one that just follows simple rules?', 'If a chatbot seems human in a conversation, does that mean it thinks like a person? Why or why not?'],
    yellow: ['Where do apps you use collect data about you? Is that okay?', 'Can you think of a time when two things happened together but one didn’t cause the other?'],
    orange: ['What’s the difference between memorizing answers for a test and really understanding a subject?', 'If an AI is right 90% of the time, when would that be good enough — and when would it not be?'],
    green: ['How is an artificial neuron like — and unlike — a real brain cell?', 'What’s something you got better at by making small corrections over and over?'],
    blue: ['If a computer sees a photo only as numbers, how can it still recognize a cat?', 'What could go wrong if a camera-based AI was mostly trained on photos taken in daylight?'],
    purple: ['Is a chess engine “smart” the same way a chess grandmaster is?', 'When should you try something new instead of sticking with what already works?'],
    brown: ['Why might a chatbot say something false in a confident voice?', 'How can you check whether something an AI told you is true?'],
    black: ['What personal details should never be shared with an AI tool or a website?', 'If you built an AI app, how would you make sure it’s fair to everyone who uses it?'],
  };
  const rows = worlds.map((w) => {
    const mins = w.lessons.reduce((a, l) => a + l.min, 0) + 20;
    return `<tr><th scope="row"><span class="pp-belt" style="background:${w.color}"></span>${esc(w.name)}<br><small>${esc(w.world)}</small></th><td>${esc(w.parents)}</td><td>${w.lessons.length} + test</td><td>~${Math.round(mins / 5) * 5} min</td></tr>`;
  }).join('');
  const total = worlds.reduce((a, w) => a + w.lessons.reduce((b, l) => b + l.min, 0) + 20, 0);
  const body = `
<main id="main" class="wrap parents">
  <section class="hero">
    <span class="kicker">For parents &amp; guardians</span>
    <h1>About Yusuf’s AI Dojo</h1>
    <p class="hook">A free, self-paced course that teaches kids ages 9–13 how AI actually works, how to use it well, how to build with it, and how to stay smart and safe around it. It simplifies, but it doesn’t say anything false. No hype, and no fear-mongering.</p>
  </section>

  <section class="card">
    <h2>🔒 Privacy: how progress is stored</h2>
    <ul>
      <li><b>Everything stays on this device.</b> Progress, XP, the ninja nickname and project work are saved in this browser’s <i>localStorage</i>. Nothing is sent anywhere.</li>
      <li><b>No accounts, no servers, no analytics, no trackers, no ads, no cookies.</b> The site is a set of static pages.</li>
      <li><b>First name only.</b> The site uses only the name “Yusuf” and a made-up ninja nickname. It never asks for a last name, school, location or photo.</li>
      <li><b>Different devices don’t sync.</b> Clearing browser data, or using a private window, erases progress. Use <b>Back up progress</b> below to save a copy.</li>
    </ul>
  </section>

  <section class="card">
    <h2>🥋 What each belt teaches</h2>
    <p>Each belt is a “world” of lessons. Every lesson has a short story, a hands-on activity, a 3–5 question quiz with explanations, an optional Challenge Mode for older or faster learners, and one AI key term. A Belt Test (a mixed quiz plus a mini project) awards the belt. Total: about <b>${Math.round(total / 60)} hours</b>. Suggested pace: 15–20 minutes a day.</p>
    <div class="pp-scroll"><table class="pp-table">
      <thead><tr><th scope="col">Belt</th><th scope="col">What he learns</th><th scope="col">Lessons</th><th scope="col">Time</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <p><b>Also included:</b> a Daily Dojo (a 5-minute review that builds a streak), badges, a Bonus Arcade of concept games that unlock with badges, a glossary with flashcards (“Dojo Scrolls”), and a printable certificate at Black Belt.</p>
  </section>

  <section class="card">
    <h2>💬 Family discussion questions</h2>
    <p>Great for the car ride or dinner. There are no wrong answers, only good thinking.</p>
    ${worlds.map((w) => `<h3>${esc(w.name)}: ${esc(w.world)}</h3><ul>${talk[w.id].map((q) => `<li>${esc(q)}</li>`).join('')}</ul>`).join('')}
  </section>

  <section class="card">
    <h2>🛠️ About real AI app builders</h2>
    <p>The Black Belt “Builder Lab” teaches how AI app builders (such as Replit and Base44) work, and it gives him App Blueprints to try. Please keep in mind:</p>
    <ul>
      <li><b>Real AI tools have their own age rules.</b> Many AI services require users to be at least 13, some require 18, and some allow younger users only with parental consent. Check each tool’s terms before he signs up.</li>
      <li><b>Use them with adult supervision.</b> Sit with him, especially at first. Set up any account yourself.</li>
      <li><b>Never share personal information</b> (full name, address, school, photos, passwords) with AI tools. The dojo teaches this too.</li>
      <li>Everything inside this dojo, including the code playground, runs entirely in the browser. It needs no accounts, and it doesn’t connect to any AI service.</li>
    </ul>
    <p class="pp-links"><b>External links</b> (these leave the dojo, so open them together):</p>
    <ul class="pp-links">
      <li><a href="https://replit.com" rel="noopener noreferrer" target="_blank">Replit (external site) ↗</a></li>
      <li><a href="https://base44.com" rel="noopener noreferrer" target="_blank">Base44 (external site) ↗</a></li>
      <li><a href="https://teachablemachine.withgoogle.com" rel="noopener noreferrer" target="_blank">Teachable Machine by Google, for training a simple model in the browser (external site) ↗</a></li>
      <li><a href="https://code.org/ai" rel="noopener noreferrer" target="_blank">Code.org AI resources (external site) ↗</a></li>
    </ul>
  </section>

  <section class="card" id="settings">
    <h2>⚙️ Settings</h2>
    <div class="pp-set">
      <div><h3>Back up progress</h3><p>Download a small file with his progress, and restore it later or on another device.</p>
        <div class="row"><button type="button" class="btn" id="pp-export">⬇️ Download backup</button>
        <label class="btn" for="pp-import">⬆️ Restore backup</label><input type="file" id="pp-import" accept="application/json,.json" class="sr-only"></div></div>
      <div><h3>Parent preview: unlock all worlds</h3><p>Opens every built world, belt test, and Arcade game without the usual order. Handy for previewing. It doesn’t mark anything complete.</p>
        <button type="button" class="btn" id="pp-unlock" aria-pressed="false"></button></div>
      <div><h3>Reset progress</h3><p>Erases all progress on this device: XP, belts, badges, streak, nickname and projects. This can’t be undone.</p>
        <button type="button" class="btn pp-danger" id="pp-reset">🗑️ Reset progress</button></div>
    </div>
    <p class="feedback" id="pp-msg" aria-live="polite"></p>
    <p id="pp-storage"></p>
  </section>
</main>`;
  const css = `
.pp-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.pp-table{border-collapse:collapse;width:100%;min-width:560px;font-size:.95rem}
.pp-table th,.pp-table td{border-bottom:1px solid var(--line);padding:10px 8px;text-align:left;vertical-align:top}
.pp-table thead th{background:var(--bg2)}
.pp-belt{display:inline-block;width:14px;height:14px;border-radius:3px;border:1px solid #0005;margin-right:6px;vertical-align:-2px}
.pp-set{display:grid;gap:18px}
.pp-set>div{padding:14px;border-radius:14px;background:var(--bg2)}
.pp-danger{border-color:#b3261e;color:#b3261e;box-shadow:0 4px 0 #b3261e}
.parents h3{margin-top:14px}
`;
  const js = `(function(){var D=window.Dojo,st=D.state(),msg=document.getElementById('pp-msg');
function say(t,ok){msg.textContent=t;msg.className='feedback '+(ok?'ok':'no');}
var un=document.getElementById('pp-unlock');
function ru(){un.setAttribute('aria-pressed',st.unlockAll?'true':'false');un.textContent=st.unlockAll?'🔓 Preview mode ON (tap to turn off)':'🔒 Preview mode OFF (tap to turn on)';}
un.addEventListener('click',function(){st.unlockAll=!st.unlockAll;D.save();ru();say(st.unlockAll?'Preview mode on: all built worlds are open.':'Preview mode off.',true);});ru();
document.getElementById('pp-reset').addEventListener('click',function(){
 if(!window.confirm('Erase ALL progress on this device? This cannot be undone.'))return;
 if(!window.confirm('Are you really sure? XP, belts, badges and projects will be gone.'))return;
 D.reset();st=D.state();ru();D.refreshBar();say('Progress reset. The dojo is fresh and new.',true);});
document.getElementById('pp-export').addEventListener('click',function(){try{
 var blob=new Blob([JSON.stringify(D.state(),null,2)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ai-dojo-backup-'+D.today()+'.json';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);say('Backup downloaded.',true);}catch(e){say('Sorry, this browser could not create the download.',false);}});
document.getElementById('pp-import').addEventListener('change',function(e){var f=e.target.files&&e.target.files[0];if(!f)return;var r=new FileReader();
 r.onload=function(){try{var o=JSON.parse(r.result);if(!o||typeof o!=='object'||!('lessons' in o)||!('xp' in o))throw 0;
  if(!window.confirm('Replace the progress on this device with the backup?'))return;
  var s=D.state();Object.keys(s).forEach(function(k){delete s[k];});Object.keys(o).forEach(function(k){s[k]=o[k];});D.save();window.location.reload();}
  catch(err){say('That file doesn’t look like a dojo backup.',false);}};r.readAsText(f);});
document.getElementById('pp-storage').innerHTML=D.storageOK?'✅ This browser can save progress.':'⚠️ This browser is blocking storage (maybe a private window). Lessons still work, but progress won’t be saved after closing the page.';
})();`;
  return { title: "For Parents · Yusuf's AI Dojo", css, body, scripts: [js], meta: { type: 'parents', id: 'parents' } };
};
