module.exports = {
  hook: 'AI can make you smarter, or do your thinking for you so you learn nothing. Learn the difference, and use AI like a sparring partner, not a stunt double.',
  story: [
    ['sensei', 'Imagine hiring someone to do your push-ups for you, {{nick}}. Would you get stronger?'],
    ['you', 'No way. I have to do the push-ups myself.'],
    ['sensei', 'Your brain works the same way. If AI does all your thinking, your brain doesn’t get stronger. But used well, AI is an amazing <b>sparring partner</b>: it can explain, quiz you, give feedback and push you further.'],
    ['sensei', 'Also, schools have rules about AI. Always follow your teacher’s rules, and be honest about when you used it. Let’s sort the <b>brain boosts</b> from the <b>brain skips</b>.'],
  ],
  activity: {
    title: 'Brain Boost or Brain Skip?',
    instructions: 'For each way of using AI, decide whether it grows your brain (boost) or skips the learning (skip). Get at least 7 of 8.',
    js: function (el, api) {
      api.D.sorter(el, api, {
        choices: [['b', '🧠 Brain boost'], ['s', '🛋️ Brain skip']],
        items: [
          ['Ask AI to explain fractions using a pizza example', 'b', 'Getting a clearer explanation helps you understand.'],
          ['Paste your homework in and copy the answers', 's', 'You learn nothing, and it’s probably against the rules.'],
          ['Ask AI to quiz you on your science vocabulary', 'b', 'Practice and recall make memories stronger.'],
          ['Ask AI to write your essay and hand it in as your own', 's', 'That skips the learning, and it’s dishonest.'],
          ['Write your own draft, then ask AI what could be clearer', 'b', 'Your thinking first, then feedback. That’s how writers improve.'],
          ['Solve the math problem yourself, then use AI to check your answer', 'b', 'Checking after you try is great practice.'],
          ['Ask AI for the answer to every question in a practice test', 's', 'The practice was the point!'],
          ['Ask AI for three hints, one at a time, when you’re stuck', 'b', 'Hints keep YOU doing the thinking.'],
        ],
        need: 7, win: 'Sparring-partner mindset unlocked! Use AI to explain, quiz and give feedback, while you do the thinking. And always follow your school’s AI rules.',
      });
    },
  },
  quiz: [
    { q: 'What does “use AI to learn, not to skip thinking” mean?', a: ['Use AI to explain, quiz and give feedback, while you do the thinking', 'Never use AI', 'Let AI do all your homework', 'Only use AI for games'], c: 0, why: 'AI as a sparring partner.' },
    { q: 'Why is copying AI answers bad for YOU?', a: ['Your brain doesn’t get the practice it needs to grow', 'It makes the AI sad', 'It’s faster', 'It isn’t bad'], c: 0, why: 'Learning is like training: you have to do the reps.' },
    { q: 'Your teacher says “No AI on this assignment.” What do you do?', a: ['Follow the rule — do it yourself', 'Use AI secretly', 'Ask AI how to hide it', 'Skip the assignment'], c: 0, why: 'Honesty and following rules come first.' },
    { q: 'What is critical thinking?', a: ['Checking ideas carefully and asking “How do I know?”', 'Criticizing people', 'Thinking very fast', 'Trusting everything'], c: 0, why: 'The #1 skill for using AI well.' },
  ],
  challenge: {
    title: 'Sparring Prompts',
    intro: 'Pick the prompt that makes AI a better learning partner. Get 3 of 4.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'You’re studying for a history test.', a: ['“Quiz me with 5 questions on the Roman Empire, one at a time, and wait for my answer.”', '“Write my study notes so I don’t have to read.”'], c: 0, why: 'Active recall beats passive copying.' },
        { q: 'You’re stuck on a math problem.', a: ['“Give me a hint for the first step only. Don’t solve it.”', '“Solve it and show only the final answer.”'], c: 0, why: 'Hints keep you in control of the thinking.' },
        { q: 'You wrote a story.', a: ['“What are two things I could make more exciting? Don’t rewrite it for me.”', '“Rewrite my whole story so it’s better.”'], c: 0, why: 'Feedback grows your skills. A rewrite replaces them.' },
        { q: 'You want to understand how neural networks learn.', a: ['“Explain it with a sports example, then ask me a question to check I understood.”', '“Give me a long paragraph to copy into my notes.”'], c: 0, why: 'Explanation + a check = real learning.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
