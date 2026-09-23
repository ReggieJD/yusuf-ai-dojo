# Yusuf's AI Dojo 🥋

A free, interactive, belt-by-belt course that teaches kids (ages 9–13) how AI works, how to use it well, how to build with it, and how to be smart and safe with it.

**Live site:** https://reggiejd.github.io/yusuf-ai-dojo/

- 8 belt worlds (White → Black), 55 lessons, each with a story, hands-on activity, quiz, Challenge Mode, and key term, plus a Belt Test per world.
- Bonus Arcade: 8 replayable concept games that unlock with badges.
- Daily Dojo streaks, badges, Dojo Scrolls glossary, a Parents page, and a printable Black Belt certificate.
- Everything runs in the browser. Progress is stored only in the browser's localStorage. No accounts, servers, analytics, or trackers.
- Every page is a single self-contained HTML file.

## For maintainers
Pages are generated from `tools/src` by a dependency-free Node script:

```
node tools/build.js   # rebuild every page
node tools/qa.js      # open every page in Chromium, check errors/links/layout, play through lessons
```

Lessons live in `tools/src/lessons/<belt>/<lesson>.js`, belt tests in `tools/src/tests/<belt>.js`, arcade games in `tools/src/arcade/<game>.js`, the world list, key terms and arcade list in `tools/src/curriculum.js`, and world art styles in `tools/src/themes.js`.

### Adding a lesson
1. Copy any lesson file in `tools/src/lessons/<belt>/` to a new name and edit its story, activity, quiz (3–5 questions) and challenge.
2. Add a matching entry (id, title, emoji, minutes, key term and definition) to that belt's `lessons` list in `tools/src/curriculum.js`.
3. Run `node tools/build.js` and `node tools/qa.js`, then commit and push. GitHub Pages redeploys automatically.
