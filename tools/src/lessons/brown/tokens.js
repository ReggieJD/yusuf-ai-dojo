module.exports = {
  hook: 'Chatbots don’t read letters or even whole words. They read tokens. Type anything and watch it get chopped up and turned into numbers.',
  story: [
    ['sensei', 'Welcome to the Library of Talking Machines, {{nick}}. You’ve chatted with a chatbot before. But what does it actually “read”?'],
    ['sensei', 'Before a language model sees your message, a <b>tokenizer</b> chops it into pieces called <b>tokens</b>. A token is often a whole word, sometimes part of a word, and sometimes a symbol.'],
    ['you', 'Then what?'],
    ['sensei', 'Each token becomes a <b>number</b>, because as you know by now, computers only do math on numbers. The model reads token numbers and writes token numbers, one at a time. Try it!'],
  ],
  activity: {
    title: 'The Token Chopper',
    instructions: 'Type a sentence (at least 6 words). Watch how it splits into tokens and numbers. Try long words, numbers, emoji and punctuation! Then answer the 2 questions.',
    css: `
.tk-in{width:100%;min-height:90px;border-radius:10px;border:2px solid #2d1f1244;padding:10px;font:600 1.05rem var(--font-body);background:#fffdf7;color:#2d1f12;resize:vertical}
.tk-out{display:flex;flex-wrap:wrap;gap:4px;margin:10px 0;min-height:48px;padding:8px;background:#fff;border-radius:10px;border:1px dashed #8b5a2b66}
.tk{display:inline-flex;flex-direction:column;align-items:center;border-radius:6px;padding:3px 6px;font:700 .95rem ui-monospace,Menlo,monospace;white-space:pre;color:#2d1f12}
.tk small{font-size:.62rem;opacity:.7}
.tk-stats{display:flex;gap:10px;flex-wrap:wrap;font-weight:800}
.tk-note{font-size:.85rem;color:var(--muted)}
.tk-q{background:var(--bg2);border-radius:10px;padding:10px 12px;margin-top:10px}
.tk-q .row button{flex:1 1 150px}
`,
    js: function (el, api) {
      var D = api.D;
      var COMMON = ' the a an and or but is are was were be to of in on at for with my your i you he she it we they this that what how why who can do did not no yes so if then just like very ninja dojo ai robot game play ball goal team win love cool fun big small good great new old one two three day night';
      var PRE = ['under', 'super', 'inter', 'over', 'dis', 'pre', 'un', 're'], SUF = ['ation', 'tion', 'ness', 'ment', 'able', 'ing', 'ful', 'less', 'est', 'ly', 'er', 'ed', 's'];
      var COLORS = ['#f6d7a7', '#c7e9c0', '#cfe0f5', '#f5c6d6', '#e3d5f5', '#fde68a'];
      function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 50000; return h; }
      function splitWord(w) {
        var lw = w.toLowerCase();
        if (w.length <= 6 || COMMON.indexOf(' ' + lw + ' ') >= 0 || COMMON.slice(-4) === lw) return [w];
        var parts = [], pre = '', suf = '';
        for (var i = 0; i < PRE.length; i++) if (lw.indexOf(PRE[i]) === 0 && lw.length - PRE[i].length >= 3) { pre = w.slice(0, PRE[i].length); break; }
        var rest = w.slice(pre.length), lr = rest.toLowerCase();
        for (var j = 0; j < SUF.length; j++) if (lr.length - SUF[j].length >= 3 && lr.slice(-SUF[j].length) === SUF[j]) { suf = rest.slice(rest.length - SUF[j].length); rest = rest.slice(0, rest.length - SUF[j].length); break; }
        if (pre) parts.push(pre);
        while (rest.length > 6) { parts.push(rest.slice(0, 4)); rest = rest.slice(4); }
        if (rest) parts.push(rest);
        if (suf) parts.push(suf);
        return parts;
      }
      function tokenize(text) {
        var out = [], re = /(\s*)([A-Za-z]+|\d{1,3}|[^\sA-Za-z\d])/gu, m;
        while ((m = re.exec(text))) {
          var sp = m[1] ? ' ' : '', piece = m[2];
          if (/^[A-Za-z]+$/.test(piece)) splitWord(piece).forEach(function (p, k) { out.push((k === 0 ? sp : '') + p); });
          else if (/[^\x00-\x7F]/.test(piece)) { out.push(sp + piece); if (piece.length > 1 || /\p{Extended_Pictographic}/u.test(piece)) out.push('·'); }
          else out.push(sp + piece);
        }
        return out;
      }
      var S = api.load(), text = S.text || 'The unstoppable ninja practiced basketball 25 times today! 🏀', a1 = !!S.a1, a2 = !!S.a2;
      el.innerHTML = '<label for="tk-in" class="sr-only">Type a sentence</label><textarea id="tk-in" class="tk-in" maxlength="240">' + D.esc(text) + '</textarea><div class="tk-out" id="tk-out" aria-live="polite"></div><div class="tk-stats" id="tk-stats"></div><p class="tk-note">⚠️ This is a simplified teaching tokenizer. Real tokenizers learn their pieces from huge amounts of text, so the exact splits differ. But the idea is the same!</p><div id="tk-q"></div>';
      function render() {
        text = D.$('#tk-in', el).value; api.save({ text: text });
        var toks = tokenize(text), words = (text.match(/[A-Za-z]+/g) || []).length;
        D.$('#tk-out', el).innerHTML = toks.map(function (t, i) { return '<span class="tk" style="background:' + COLORS[i % COLORS.length] + '">' + D.esc(t === '·' ? '(emoji part)' : t.replace(/ /g, '␣')) + '<small>#' + hash(t) + '</small></span>'; }).join('');
        D.$('#tk-stats', el).innerHTML = '<span>📝 Words: ' + words + '</span><span>🧩 Tokens: ' + toks.length + '</span><span>🔢 Characters: ' + text.length + '</span>';
        questions(words);
      }
      function questions(words) {
        var box = D.$('#tk-q', el);
        if (words < 6) { box.innerHTML = '<p class="tk-q">✍️ Type a sentence with at least 6 words to unlock the questions.</p>'; return; }
        if (!a1) {
          box.innerHTML = '<div class="tk-q"><p><b>Q1:</b> Look at the long words and the emoji. What do you notice?</p><div class="row">' + D.shuffle([[1, 'Long or unusual words and emoji can become SEVERAL tokens'], [0, 'Every word is always exactly one token'], [0, 'Tokens are always single letters']]).map(function (o) { return '<button type="button" class="btn small" data-a="1" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p></div>';
        } else if (!a2) {
          box.innerHTML = '<div class="tk-q"><p><b>Q2:</b> Chatbots have sometimes miscounted the letters in a word like “strawberry.” Why might that be?</p><div class="row">' + D.shuffle([[1, 'They see tokens (chunks), not individual letters'], [0, 'They can’t read English'], [0, 'Strawberry is a secret word']]).map(function (o) { return '<button type="button" class="btn small" data-a="2" data-ok="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div><p class="feedback" aria-live="polite"></p></div>';
        } else { box.innerHTML = '<p class="feedback ok">🏆 Token master! Everything a chatbot reads and writes is a list of token numbers. Next lesson: how it decides which token comes next.</p>'; api.done(); return; }
        D.$all('[data-ok]', box).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-ok') === '1') { if (b.getAttribute('data-a') === '1') a1 = true; else a2 = true; api.save({ a1: a1, a2: a2 }); D.sfx('good'); questions(99); } else { D.sfx('bad'); b.disabled = true; var f = box.querySelector('.feedback'); f.className = 'feedback no'; f.textContent = 'Look closely at the colored chunks above.'; } }); });
      }
      D.$('#tk-in', el).addEventListener('input', render);
      render();
    },
  },
  quiz: [
    { q: 'What is a token?', a: ['A chunk of text — a word, part of a word, or a symbol — that a language model reads', 'A coin for arcade games', 'A password', 'A whole paragraph'], c: 0, why: 'Language models read and write tokens, one at a time.' },
    { q: 'What happens to each token before the model uses it?', a: ['It is turned into a number', 'It is printed', 'It is translated to French', 'It is deleted'], c: 0, why: 'Numbers in, numbers out. Always!' },
    { q: 'A common rule of thumb for English is that 100 words is roughly…', a: ['About 130 tokens', 'Exactly 100 tokens', '10 tokens', '1,000 tokens'], c: 0, why: 'On average a token is about ¾ of a word, though it varies by tokenizer and language.' },
    { q: 'Why might a chatbot struggle to count letters in a word?', a: ['It sees tokens, not individual letters', 'It has no memory', 'Letters are too small', 'It always counts perfectly'], c: 0, why: 'Tokens hide the letter-by-letter details.' },
  ],
  challenge: {
    title: 'Token Detective',
    intro: 'Which will likely use MORE tokens? Think like a tokenizer! Get 3 of 4.',
    js: function (el, api) {
      api.D.sorter(el, api, {
        choices: [['a', 'A uses more'], ['b', 'B uses more']],
        items: [
          ['A: “cat” · B: “supercalifragilistic”', 'b', 'Long, rare words get chopped into several pieces.'],
          ['A: “Hello!!!!!!!!” · B: “Hello”', 'a', 'All those exclamation marks add tokens.'],
          ['A: “I like dogs.” · B: “I like dogs and cats and birds and fish.”', 'b', 'More words = more tokens.'],
          ['A: “ok” · B: “🏀🏀🏀”', 'b', 'Emoji are often split into multiple tokens each.'],
        ],
        need: 3, win: 'Token detective certified! Tokens are why chatbots have limits on how much text they can read at once.',
      });
    },
  },
};
