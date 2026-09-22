# Yusuf's AI Dojo 🥋

A free, interactive, belt-by-belt course that teaches kids (ages 9–13) how AI works, how to use it well, how to build with it, and how to be smart and safe with it.

**Live site:** https://reggiejd.github.io/yusuf-ai-dojo/

- 8 belt worlds (White → Black), each with story-driven lessons, hands-on activities, quizzes, Challenge Mode, and a Belt Test.
- Everything runs in the browser. Progress is stored only in the browser's localStorage. No accounts, servers, analytics, or trackers.
- Every page is a single self-contained HTML file.

## For maintainers
Pages are generated from `tools/src` by a dependency-free Node script:

```
node tools/build.js   # rebuild every page
node tools/qa.js      # open every page in Chromium, check errors/links/layout, play through lessons
```

Lessons live in `tools/src/lessons/<belt>/<lesson>.js`, world list and key terms in `tools/src/curriculum.js`, and world art styles in `tools/src/themes.js`.
