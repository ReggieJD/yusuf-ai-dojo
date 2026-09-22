module.exports = {
  hook: 'AI chatbots, apps and games can ask lots of questions. Learn exactly what to share, what to shield, and what to do when something feels off.',
  story: [
    ['sensei', 'A ninja protects their secrets, {{nick}}. Online, your secrets are your <b>personal information</b>: anything that can identify you or be used to find you.'],
    ['sensei', 'When you type into an AI tool, your words may be stored, reviewed or used to improve the service. So the rule is simple: <b>never type something you wouldn’t want a stranger to see.</b>'],
    ['you', 'What about my favorite sport? Is that okay?'],
    ['sensei', 'General stuff like your favorite sport is usually fine. Your full name, school, address, photos and passwords are NOT. Let’s build your privacy shield.'],
  ],
  activity: {
    title: 'Share or Shield?',
    instructions: 'For each piece of information, decide: is it usually OK to share with an AI tool or online game, or should you shield it? Get at least 10 of 12.',
    js: function (el, api) {
      api.D.sorter(el, api, {
        choices: [['s', '✅ Usually OK'], ['p', '🛡️ Shield it']],
        items: [
          ['Your favorite sport', 's', 'General interests don’t identify you.'],
          ['Your full name + your school', 'p', 'Together they can be used to find you.'],
          ['Your home address', 'p', 'Never share where you live.'],
          ['A question about fractions for your homework', 's', 'Learning questions are great, as long as they don’t include personal details.'],
          ['A selfie or photo of your face', 'p', 'Photos can identify you, and they can be copied or changed.'],
          ['Any password', 'p', 'Never, ever. Not even to an AI or “support” message.'],
          ['Your birthday (day, month and year)', 'p', 'It’s used to identify people and to reset accounts.'],
          ['“I like chess and I’m learning the Sicilian Defense”', 's', 'A general interest. Totally fine.'],
          ['Your phone number', 'p', 'It lets strangers contact you directly.'],
          ['Your live location', 'p', 'Keep location sharing off unless a trusted adult set it up for a good reason.'],
          ['A secret a friend told you', 'p', 'It’s not yours to share, and AI tools may store what you type.'],
          ['An idea for a video game you want to build', 's', 'Creative ideas are great to brainstorm with AI, but skip personal details.'],
        ],
        need: 10, win: 'Your privacy shield is strong! When in doubt, leave it out, and ask a trusted adult.',
      });
    },
  },
  quiz: [
    { q: 'What is personal information?', a: ['Details that can identify or locate you, like your full name, address or school', 'Your favorite color', 'The weather', 'Math facts'], c: 0, why: 'If it points to YOU, protect it.' },
    { q: 'Why be careful about what you type into AI chatbots?', a: ['What you type may be stored or reviewed, so treat it like it could be seen by others', 'Chatbots forget everything instantly, always', 'Typing is bad for AI', 'There’s no reason'], c: 0, why: 'Assume it could be saved.' },
    { q: 'An app asks for your password to “verify” you inside a chat. What do you do?', a: ['Don’t share it — tell a trusted adult', 'Share it quickly', 'Share half of it', 'Post it publicly'], c: 0, why: 'Real services don’t ask for your password in a chat.' },
    { q: 'Which is safe to ask an AI homework helper?', a: ['“Can you explain how volcanoes work?”', '“Here’s my full name and school, can you…”', '“My address is…”', '“My password is…”'], c: 0, why: 'Learning questions without personal details are great.' },
  ],
  challenge: {
    title: 'Shield Scenarios',
    intro: 'Choose the smartest move. Get 3 of 4.',
    js: function (el, api) {
      api.D.quiz(el, [
        { q: 'A chatbot says: “Tell me your school’s name so I can help you better!”', a: ['Don’t share it. Ask your question without personal details', 'Tell it your school', 'Tell it your school and address', 'Tell it your teacher’s name'], c: 0, why: 'You can get help without giving personal info.' },
        { q: 'A game offers free coins if you enter your parent’s credit card number.', a: ['Stop and ask your parent — never enter payment info yourself', 'Enter it quickly', 'Guess a number', 'Share it with friends'], c: 0, why: 'Payments are always a grown-up decision.' },
        { q: 'You want an AI to make a birthday card for your friend.', a: ['Use just a first name or a nickname — no last names or addresses', 'Include their full name and home address', 'Upload their photo without asking', 'Share their phone number'], c: 0, why: 'Protect other people’s privacy too.' },
        { q: 'You accidentally typed your address into a chatbot.', a: ['Tell a trusted adult. They can help check settings and delete the chat', 'Keep it secret forever', 'Type more personal info', 'Panic and ignore it'], c: 0, why: 'Mistakes happen. Telling an adult is the brave, smart move.' },
      ], { saveKey: 'chquiz', onDone: function (s) { if (s >= 3) api.done(); } });
    },
  },
};
