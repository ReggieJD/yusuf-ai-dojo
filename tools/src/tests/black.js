module.exports = {
  quiz: [
    { q: 'An AI app builder turns…', a: ['Your plain-language description into code you test and improve', 'Money into apps', 'Photos into music', 'Nothing'], c: 0, why: 'You describe; it builds; you test.' },
    { q: 'A great spec includes…', a: ['Who it’s for, the problem, features, what it won’t do, and how you’ll know it works', 'Only the app’s name', 'The word “awesome”', 'Your address'], c: 0, why: 'Clear plans make clear apps.' },
    { q: 'The best first prompt to an app builder…', a: ['Gives context and asks for one core feature', 'Asks for every feature at once', 'Is one word', 'Includes your password'], c: 0, why: 'Start small and clear.' },
    { q: 'A good bug report says…', a: ['What you did, what happened, and what should have happened', '“It’s broken”', 'Nothing', '“Fix everything”'], c: 0, why: 'Precise reports get precise fixes.' },
    { q: 'After the AI says “fixed,” you should…', a: ['Re-test', 'Trust it', 'Delete your tests', 'Publish immediately'], c: 0, why: 'Verify every fix.' },
    { q: 'CSS controls…', a: ['How a page looks', 'What data AI learns', 'Your password', 'The internet speed'], c: 0, why: 'HTML = structure, CSS = style, JavaScript = behavior.' },
    { q: 'An AI treats two equally skilled players differently. The most likely cause is…', a: ['Unbalanced or unfair training data', 'The AI’s mood', 'The screen size', 'Magic'], c: 0, why: 'Bias usually comes from data.' },
    { q: 'Which is personal information you should protect?', a: ['Your full name and school', 'Your favorite sport', 'A math question', 'Your favorite color'], c: 0, why: 'Protect anything that identifies or locates you.' },
    { q: 'A deepfake is…', a: ['AI-made fake media that looks or sounds real', 'A deep lake', 'A camera filter for fun', 'A type of password'], c: 0, why: 'Generative AI can imitate real people.' },
    { q: 'The strongest way to check a viral video is…', a: ['Check the source and trusted news coverage', 'Count the likes', 'Trust it if it looks real', 'Share it and ask later'], c: 0, why: 'Source-checking beats eyeballing.' },
    { q: 'Using AI to learn means…', a: ['AI explains, quizzes and gives feedback while you do the thinking', 'AI does your homework', 'Never using AI', 'Copying answers'], c: 0, why: 'Sparring partner, not stunt double.' },
    { q: 'When should you get a trusted adult?', a: ['When something online is scary, involves money, health, photos, or feels off', 'Never', 'Only for games', 'Only after it’s too late'], c: 0, why: 'Backup is a strength.' },
    { q: 'Who decides whether an AI is fair and safe to use?', a: ['People who build, test and use it', 'Nobody', 'The AI alone', 'The computer case'], c: 0, why: 'Responsibility stays human.' },
    { q: 'Iteration means…', a: ['Build, test, fix, repeat', 'Doing it once', 'Giving up', 'Skipping tests'], c: 0, why: 'Great work is iterated.' },
  ],
  project: {
    title: 'The Final Kata',
    intro: 'Four real-world challenges. Each one tests a different Black Belt skill. Choose wisely, {{nick}}.',
    css: `.fk{background:var(--bg2);border-radius:12px;padding:12px;margin-bottom:12px;border:2px solid transparent}.fk.done{border-color:#3ccf7a}.fk .row button{flex:1 1 200px;text-align:left}`,
    js: function (el, api) {
      var D = api.D, S = api.load(), step = S.step || 0;
      var K = [
        ['🛠️ Builder', 'Your AI-built quiz app shows the wrong score after the last question. What’s your next prompt?', [[1, '“After the 10th question, the score shows 9/10 even when all 10 are right. It should show 10/10. Please fix only the final score.”'], [0, '“Your app is bad. Start over.”'], [0, '“Make it more fun.”']], 'Precise bug reports win.'],
        ['🛡️ Privacy', 'A homework chatbot says: “To help you better, what’s your full name and school?”', [[1, 'Skip the personal info and ask the question without it'], [0, 'Give your name and school'], [0, 'Give your address instead']], 'You never need personal info to get help with homework.'],
        ['⚖️ Fairness', 'Your team’s AI “MVP picker” keeps choosing players from one grade. What do you do?', [[1, 'Check the training data for imbalance, test results for each grade, and fix it'], [0, 'Trust it, since computers are fair'], [0, 'Hide the results']], 'Test for fairness across groups.'],
        ['🕵️ Truth', 'A shocking video of a famous coach is everywhere, but only on brand-new accounts.', [[1, 'Don’t share it. Check trusted news and the coach’s official accounts'], [0, 'Share it fast before it’s deleted'], [0, 'Believe it because it’s a video']], 'Source first. Always.'],
      ];
      function render() {
        el.innerHTML = K.map(function (k, i) {
          if (i > step) return '';
          var done = i < step;
          return '<div class="fk' + (done ? ' done' : '') + '"><p><b>' + k[0] + ':</b> ' + k[1] + '</p>' + (done ? '<p>✅ ' + k[3] + '</p>' : '<div class="row">' + D.shuffle(k[2].map(function (o) { return '<button type="button" class="btn small" data-ok="' + o[0] + '">' + o[1] + '</button>'; })).join('') + '</div><p class="feedback" aria-live="polite"></p>') + '</div>';
        }).join('') + (step >= K.length ? '<p class="feedback ok">🏆 The Final Kata is complete. You build with skill and act with wisdom. That is the Black Belt way.</p>' : '');
        D.$all('[data-ok]', el).forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-ok') === '1') { step++; api.save({ step: step }); D.sfx(step >= K.length ? 'win' : 'good'); render(); } else { D.sfx('bad'); b.disabled = true; var f = b.closest('.fk').querySelector('.feedback'); f.className = 'feedback no'; f.textContent = 'Think like a Black Belt: careful, fair, safe and precise.'; } }); });
        if (step >= K.length) api.done();
      }
      render();
    },
  },
};
