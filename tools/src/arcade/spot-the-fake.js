// r = Real (a well-known, checkable fact), f = Fake (impossible, or a clear scam/trick), c = Check first (could be true or false: verify with a trusted source).
const CARDS = [
  ['In 1997, IBM’s chess computer Deep Blue beat world champion Garry Kasparov in a match.', 'r', 'True. It’s one of the most famous moments in AI history.'],
  ['In 2016, the AI AlphaGo beat top Go player Lee Sedol, winning 4 games to 1.', 'r', 'True. It learned partly by playing millions of games against itself.'],
  ['AI image tools can create realistic photos of people who don’t exist.', 'r', 'True. That’s why a realistic photo alone doesn’t prove something happened.'],
  ['Chatbots sometimes make up facts that sound true. This is called “hallucination.”', 'r', 'True. Always double-check important facts from a chatbot.'],
  ['A basketball hoop’s rim is 10 feet (about 3 meters) high in the NBA.', 'r', 'True. Same height for pros and most school games.'],
  ['A chessboard has 64 squares.', 'r', 'True: 8 rows × 8 columns.'],
  ['A soccer team has 11 players on the field, including the goalkeeper.', 'r', 'True for regular 11-a-side soccer.'],
  ['Some AI tools can copy a person’s voice from short recordings.', 'r', 'True. It’s why scammers can fake voices, so have a family “code word.”'],
  ['Judo is a martial art that started in Japan.', 'r', 'True. Jigoro Kano founded it in 1882.'],
  ['AI can learn to recognize handwritten numbers from thousands of examples.', 'r', 'True. It’s one of the classic first projects in machine learning.'],
  ['“Your game account will be deleted in 10 minutes unless you send us your password!”', 'f', 'Scam. Real companies never ask for your password, and fake deadlines are a trick to rush you.'],
  ['“This AI detector catches AI-written text 100% of the time.”', 'f', 'False. No AI detector is perfect. They make mistakes both ways.'],
  ['“Chatbots can never make mistakes because they read the whole internet.”', 'f', 'False. Chatbots predict likely words. They can be confidently wrong.'],
  ['“Type your parent’s credit card number here to unlock free coins!”', 'f', 'Scam. Never enter payment or personal info for “free” rewards.'],
  ['A video shows a player juggling a soccer ball 1,000,000 times in one minute.', 'f', 'Impossible: that’s over 16,000 touches per second. Edited or AI-made.'],
  ['“AI can read your thoughts through your phone screen.”', 'f', 'False. Screens show light. They can’t read minds.'],
  ['A famous athlete’s video says: “DM me your password and I’ll send you free shoes.”', 'f', 'Scam, likely a deepfake or hacked account. Nobody legit asks for passwords.'],
  ['“Scientists confirm the Moon is made of cheese.”', 'f', 'False. Moon rocks brought back by astronauts are rock, not cheese!'],
  ['A post from an account you don’t know says your favorite player just got traded.', 'c', 'Could be true or false. Check an official team account or trusted news first.'],
  ['A friend forwards a screenshot saying school is canceled tomorrow.', 'c', 'Screenshots are easy to fake. Check the school’s official message.'],
  ['A chatbot tells you the date of the next chess tournament in your area.', 'c', 'Chatbots can be out of date or make things up. Check the organizer’s site.'],
  ['A voice message that sounds like a relative asks you to send a gift-card code right away.', 'c', 'Voices can be cloned. Stop and check with that person another way (call them) or tell a parent.'],
  ['An article says a new AI beat humans at a popular video game.', 'c', 'This has really happened with some games, but check that this story is from a trusted source.'],
  ['A dramatic photo shows a shark swimming down a flooded city street.', 'c', 'Photos like this have been faked before. Look for trusted news sources before sharing.'],
  ['An app store page says “This AI homework app has 5 million happy users.”', 'c', 'Could be marketing. Check real reviews and ask a parent before downloading.'],
  ['A clip shows a politician saying something shocking, but no news site is reporting it.', 'c', 'Could be a deepfake or edited clip. Wait for trusted sources before believing or sharing.'],
];
module.exports = {
  data: CARDS,
  how: 'Cards fly in fast. Choose <b>✅ Real</b> for well-known facts, <b>🎭 Fake</b> for impossible claims and obvious scams, or <b>🔍 Check first</b> when it could go either way and you need a trusted source. Streaks multiply your points. 20 cards, 3 lives.',
  connect: 'AI can now make realistic fake photos, voices and videos, and chatbots can sound sure while being wrong. The most important skill isn’t spotting every fake by eye. It’s knowing <b>when to stop and check</b> with trusted sources and trusted adults.',
  css: `
.sf-card{background:#0b0620;border:2px solid #5ef2ff66;border-radius:14px;padding:16px;min-height:120px;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:700;font-size:1.05rem}
.sf-clock{height:8px;border-radius:4px;background:#1c1240;overflow:hidden;margin:10px 0}
.sf-clock i{display:block;height:100%;background:#ff5edb;width:100%}
.sf-opts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.sf-opts button{min-height:56px;padding:6px}
.sf-msg{min-height:3em;font-weight:600;margin-top:8px}
.sf-streak{font:800 .95rem ui-monospace,Menlo,monospace;color:#ffd23f}
`,
  js: function (el, G) {
    var D = G.D, CARDS = window.GAME_DATA || el.__data;
    var gen = el.__gen = (el.__gen || 0) + 1;
    function alive() { return el.__gen === gen && el.isConnected; }
    var lives = 3, score = 0, streak = 0, n = 0, timer = null;
    var deck = D.shuffle(CARDS.slice()).slice(0, 20);
    var LABEL = { r: '✅ Real', f: '🎭 Fake', c: '🔍 Check first' };
    function next() {
      if (!alive()) return;
      if (n >= 20) return G.end(score, true, 'Twenty cards, sharp judgment. You know when to trust, when to reject, and when to check.');
      var card = deck[n++], level = Math.min(5, 1 + Math.floor((n - 1) / 4)), secs = [14, 12, 11, 10, 9][level - 1], t0 = Date.now(), done = false;
      el.__ans = card[1];
      G.hud({ score: score, level: level, lives: lives });
      el.innerHTML = '<p class="sf-streak" aria-live="polite">Card ' + n + '/20 · Streak ' + streak + (streak >= 3 ? ' 🔥 ×2' : '') + '</p><div class="sf-card">' + card[0] + '</div><div class="sf-clock" aria-hidden="true"><i></i></div><div class="sf-opts">' +
        ['r', 'f', 'c'].map(function (k) { return '<button type="button" class="btn" data-k="' + k + '">' + LABEL[k] + '</button>'; }).join('') + '</div><p class="sf-msg" aria-live="polite"></p>';
      var bar = D.$('.sf-clock i', el), msg = D.$('.sf-msg', el);
      function finish(k) {
        if (done) return; done = true; clearInterval(timer);
        D.$all('.sf-opts button', el).forEach(function (b) { b.disabled = true; if (b.getAttribute('data-k') === card[1]) b.classList.add('primary'); });
        if (k === card[1]) { streak++; var pts = 10 * (streak >= 3 ? 2 : 1); score += pts; D.sfx('good'); msg.textContent = '✔ ' + LABEL[card[1]] + ' (+' + pts + '). ' + card[2]; }
        else { streak = 0; lives--; D.sfx('bad'); msg.textContent = (k ? '✘ ' : '⏱️ Time! ') + 'It’s ' + LABEL[card[1]] + '. ' + card[2]; }
        G.hud({ score: score, lives: lives });
        if (lives <= 0) return setTimeout(function () { G.end(score, false, 'When you’re not sure, “Check first” is never a bad instinct. Try again!'); }, 2600);
        setTimeout(next, k === card[1] ? 2000 : 3200);
      }
      timer = setInterval(function () {
        if (!alive()) return clearInterval(timer);
        var left = secs - (Date.now() - t0) / 1000;
        bar.style.width = Math.max(0, left / secs * 100) + '%';
        if (left <= 0) finish(null);
      }, 100);
      D.$all('.sf-opts button', el).forEach(function (b) { b.addEventListener('click', function () { finish(b.getAttribute('data-k')); }); });
    }
    next();
  },
};
