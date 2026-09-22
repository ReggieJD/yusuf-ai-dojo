module.exports = {
  hook: 'AI can now make fake photos, videos and voices that look and sound real. Train your detective skills. The strongest ones aren’t about pixels at all.',
  story: [
    ['sensei', '{{nick}}, remember generative AI that creates images? The same power can make <b>deepfakes</b>: fake images, videos or voices of real people.'],
    ['sensei', 'Some fakes have clues, like weird hands, melted text or odd shadows. But AI keeps improving, so those clues don’t always work anymore.'],
    ['you', 'Then how do I catch a fake?'],
    ['sensei', 'Think like a detective, not just an eye doctor. <b>Who</b> posted it? Is it on <b>trusted news</b>? Is it trying to make me <b>angry or scared</b> fast? Can I <b>check another way</b>? Let’s crack some cases.'],
  ],
  activity: {
    title: 'Deepfake Detective',
    instructions: 'Five cases. For each one, choose the smartest move. Get at least 4 right.',
    js: function (el, api) {
      api.D.sorter(el, api, {
        choices: [['a', '🅰️'], ['b', '🅱️'], ['c', '🅲']],
        items: [
          ['<b>Case 1:</b> A video shows a famous athlete saying they quit forever. It’s only on one random account, and the lips look slightly off.<br>🅰️ Share it right away · 🅱️ Check trusted news sites and the athlete’s official accounts first · 🅲 Believe it because it’s a video', 'b', 'Real big news shows up in many trusted places. Odd lip-sync is a clue, but checking sources is the strongest move.'],
          ['<b>Case 2:</b> You get a voice message that sounds exactly like a family member: “Quick, send me your password, it’s an emergency!”<br>🅰️ Send it · 🅱️ Reply asking for more details · 🅲 Don’t send anything, and check with them in person or on a known number', 'c', 'AI can clone voices from short clips. Urgency + a request for secrets = big red flag. Verify another way.'],
          ['<b>Case 3:</b> An amazing photo shows a shark swimming down a flooded highway. People are sharing it everywhere.<br>🅰️ Search whether trusted news or fact-checkers have covered it · 🅱️ Share it — so many people can’t be wrong · 🅲 Add your own caption and repost', 'a', 'Popular doesn’t mean true. Fact-checkers often debunk viral images like this.'],
          ['<b>Case 4:</b> A picture of a “real” event has people with six fingers and signs with scrambled letters.<br>🅰️ It’s definitely real · 🅱️ These are common AI clues, so be suspicious and check the source · 🅲 Fingers don’t matter', 'b', 'Weird hands and garbled text are classic signs of AI images, though newer tools make fewer of these mistakes.'],
          ['<b>Case 5:</b> Someone makes a fake funny image of your classmate and asks you to share it.<br>🅰️ Share it, it’s just a joke · 🅱️ Don’t share it, and tell a trusted adult if it could hurt someone · 🅲 Make a funnier one', 'b', 'Fake images of real people can really hurt them. Being kind and responsible matters.'],
        ],
        need: 4, win: 'Detective badge earned! Check the source, look for other trusted coverage, slow down when you feel rushed, and never share fakes that could hurt someone.',
      });
    },
  },
  quiz: [
    { q: 'What is a deepfake?', a: ['Fake images, video or audio made with AI to look or sound real', 'A deep swimming pool', 'A type of camera', 'A very old photo'], c: 0, why: 'Generative AI can imitate real people.' },
    { q: 'What’s the STRONGEST way to check if something is real?', a: ['Check the source and whether trusted outlets report the same thing', 'Count the pixels', 'See how many likes it has', 'Trust videos over photos'], c: 0, why: 'Visual clues help, but source-checking works even on very good fakes.' },
    { q: 'A message tries to make you panic and act fast. Why is that a red flag?', a: ['Scammers and fakes often rush you so you don’t stop to check', 'Urgent messages are always true', 'Panic helps you think', 'It isn’t a red flag'], c: 0, why: 'Slow down. Verify.' },
    { q: 'Why shouldn’t you share a fake image of a real person as a joke?', a: ['It can embarrass or hurt them, and it spreads fast', 'Jokes are illegal', 'Images can’t be shared', 'It’s totally fine'], c: 0, why: 'Being an AI citizen means thinking about people, too.' },
  ],
  challenge: {
    title: 'Red Flag Radar',
    intro: 'Which details are red flags? Get 4 of 5.',
    js: function (el, api) {
      api.D.sorter(el, api, {
        choices: [['r', '🚩 Red flag'], ['g', '🟢 Good sign']],
        items: [
          ['The story appears on several well-known news sites', 'g', 'Multiple trusted sources are a good sign.'],
          ['The account was created yesterday and only posts shocking videos', 'r', 'New, sensational accounts deserve suspicion.'],
          ['The post says “SHARE BEFORE THEY DELETE THIS!!!”', 'r', 'Pressure to share fast is a classic trick.'],
          ['An official account of the person confirms it', 'g', 'Checking the original source is smart.'],
          ['Letters on signs in the image look melted or scrambled', 'r', 'A common sign of AI-generated images.'],
        ],
        need: 4, win: 'Your red-flag radar is tuned!',
      });
    },
  },
};
