// Scripted play-throughs used by qa.js. Each activity/challenge function drives the page until done() fires.
const clickAll = async (pg, sel) => { for (const h of await pg.$$(sel)) { if (await h.isEnabled()) await h.click(); } };
const grid = async (pg, root, prog) => {
  for (const b of prog) await pg.click(`${root} .gg-pal [data-b="${b}"]`);
  await pg.click(`${root} [data-g="run"]`);
  await pg.waitForFunction((r) => /Goal reached|Crash|didn’t reach/.test(document.querySelector(r + ' [data-g="fb"]').textContent), root, { timeout: 20000 });
  const t = await pg.textContent(`${root} [data-g="fb"]`);
  if (!/Goal reached/.test(t)) throw new Error('grid level failed: ' + t);
};
const gridNext = async (pg, root) => { const n = await pg.$(`${root} [data-g="next"]`); if (n) await n.click(); };


// Sorter solver: answer once (first choice), learn the right answers from the outlines, retry if needed.
const solveSorter = async (pg, root) => {
  await pg.waitForSelector(root + ' .so-item');
  const n = await pg.$$eval(root + ' .so-item', (x) => x.length);
  for (let i = 0; i < n; i++) { const b = await pg.$(`${root} .so-item[data-i="${i}"] button:not([disabled])`); if (b) await b.click(); }
  if (await pg.$(root + ' .so-again')) {
    const ans = await pg.$$eval(root + ' .so-item', (xs) => xs.map((x) => x.querySelector('.so-right').getAttribute('data-v')));
    await pg.click(root + ' .so-again');
    for (let i = 0; i < n; i++) await pg.click(`${root} .so-item[data-i="${i}"] button[data-v="${ans[i]}"]`);
  }
};
// Quiz solver for challenge quizzes (every authored answer is choice 0; the engine shuffles the display order).
const solveQuiz = async (pg, root) => {
  await pg.waitForSelector(root + ' .qz-choice');
  while (await pg.$(root + ' .qz-choice')) {
    await pg.click(`${root} .qz-choice[data-k="0"]`);
    await pg.click(root + ' .qz-next');
  }
};
const setRange = (pg, sel, v) => pg.$eval(sel, (r, val) => { r.value = val; r.dispatchEvent(new Event('input', { bubbles: true })); }, v);

module.exports = {
  'white/rules-vs-learning': {
    activity: async (pg) => {
      await pg.click('.rv-rule[data-r="mouth"]');
      await pg.click('#rv-next');
      // label faces correctly: happy only if smiling AND relaxed brows (read from aria-label)
      const faces = await pg.$$('#rv-train .rv-face');
      for (const f of faces) {
        const lab = await f.$eval('svg', (s) => s.getAttribute('aria-label'));
        const happy = lab.startsWith('smiling') && lab.includes('relaxed');
        await (await f.$(`button[data-v="${happy ? 1 : 0}"]`)).click();
      }
      await pg.click('#rv-go');
    },
    challenge: async (pg) => {
      const ans = ['r', 'l', 'r', 'l', 'l', 'r', 'l', 'r'];
      const items = await pg.$$('.rl-item');
      for (let i = 0; i < items.length; i++) await (await items[i].$(`button[data-v="${ans[i]}"]`)).click();
    },
  },
  'white/ai-all-around': {
    activity: async (pg) => {
      const n = await pg.$$eval('.day-item', (x) => x.length);
      for (let i = 0; i < n; i++) {
        await pg.click(`.day-item >> nth=${i}`);
        await pg.click('.day-pop button >> nth=0');
      }
    },
    challenge: async (pg) => {
      for (let i = 0; i < 5; i++) { await pg.click(`[data-a="${i}"]`); await pg.click(`[data-d="${i}"]`); }
      await pg.click('#mt-riddle .qz-choice[data-v="1"]');
    },
  },
  'white/is-it-ai': {
    activity: async (pg) => {
      for (let i = 0; i < 12; i++) { await pg.click('#sm-yes'); await pg.waitForTimeout(450); }
    },
    challenge: async (pg) => {
      const ans = ['d', 'n', 'd', 'n', 'a'];
      for (let i = 0; i < 5; i++) await pg.click(`.gz-item[data-i="${i}"] button[data-v="${ans[i]}"]`);
    },
  },
  'white/al-khwarizmi': {
    activity: async (pg) => {
      const r = '#activity';
      await grid(pg, r, ['F', 'F', 'F']); await gridNext(pg, r);
      await grid(pg, r, ['F', 'F', 'F', 'R', 'F', 'F', 'F']); await gridNext(pg, r);
      await grid(pg, r, ['5', 'F', 'R', '3', 'F']);
    },
    challenge: async (pg) => {
      const r = '#challenge';
      await grid(pg, r, ['5', 'F', 'R', '4', 'F', 'R', '5', 'F']); await gridNext(pg, r);
      await grid(pg, r, ['5', 'F', 'L', '5', 'F', 'L', '5', 'F']);
    },
  },
  'white/turing-test': {
    activity: async (pg) => {
      const bots = ['B', 'A', 'A', 'both', 'A'];
      for (const b of bots) { await pg.click(`.tt-pick [data-v="${b}"]`); await pg.click('#tt-next'); }
    },
    challenge: async (pg) => {
      for (let k = 0; k < 4; k++) {
        await pg.evaluate(() => { const bs = [...document.querySelectorAll('#challenge .qz-choice')]; bs.find((b) => b.getAttribute('data-k') === '0').click(); });
        await pg.click('#challenge .qz-next');
      }
    },
  },
  'white/ai-myths': {
    activity: async (pg) => {
      for (let i = 0; i < 10; i++) { await pg.click('.mb-btns [data-v="1"]'); await pg.click('#mb-next'); }
    },
    challenge: async (pg) => {
      const ans = ['h', 'a', 'h', 'a', 'h', 'a'];
      for (let i = 0; i < 6; i++) await pg.click(`.hd-item[data-i="${i}"] button[data-v="${ans[i]}"]`);
    },
  },

  'yellow/what-is-data': {
    activity: async (pg) => {
      const rows = [['11', 'Green', '32'], ['10', 'Yellow', '25'], ['12', 'Blue', '40'], ['9', 'White', '18']];
      for (let r = 0; r < 4; r++) for (let c = 1; c <= 3; c++) await pg.selectOption(`select[data-k="${r}-${c}"]`, rows[r][c - 1]);
      await pg.click('#dt-check');
      await pg.click('#dt-q button[data-i="0"]'); await pg.waitForTimeout(1000);
      await pg.click('#dt-q button[data-i="0"]'); await pg.waitForTimeout(1000);
    },
    challenge: (pg) => solveSorter(pg, '#challenge'),
  },
  'yellow/collect-and-label': {
    activity: async (pg) => {
      const a = ['m', 'b', 'f', 'm', 'b', 'm', 'r', 'f', 'r', 'm', 'b', 'r'];
      for (let i = 0; i < a.length; i++) await pg.selectOption(`.lb-card[data-i="${i}"] select`, a[i]);
      await pg.click('#lb-go');
    },
    challenge: (pg) => solveSorter(pg, '#challenge'),
  },
  'yellow/stats-court': {
    activity: async (pg) => {
      for (const [s, n] of [['pts', 'Ghost'], ['ast', 'Hawk'], ['min', 'Echo']]) {
        await pg.click(`.sc-tabs [data-s="${s}"]`); await pg.click(`.sc-bar[data-n="${n}"]`); await pg.waitForTimeout(1300);
      }
      await pg.click('#sc-task button[data-i="0"]'); await pg.waitForTimeout(1500);
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'yellow/averages-and-patterns': {
    activity: async (pg) => {
      await setRange(pg, '#bb-r', '8'); await pg.waitForTimeout(700);
      await setRange(pg, '#bb-r', '11.5'); await pg.waitForTimeout(700);
      await pg.click('#bb-step [data-v="12"]');
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'yellow/garbage-in-garbage-out': {
    activity: async (pg) => { for (const i of [2, 5, 8, 11]) await pg.click(`.gi-ex[data-i="${i}"]`); await pg.click('#gi-train'); },
    challenge: (pg) => solveSorter(pg, '#challenge'),
  },
  'yellow/data-detective': {
    activity: async (pg) => {
      for (const [i, v] of [[2, 'miss'], [3, 'typo'], [4, 'real'], [6, 'dup']]) { await pg.click(`.dd tbody tr[data-i="${i}"]`); await pg.click(`#dd-ask button[data-v="${v}"]`); }
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'test:yellow': async (pg) => {
    await pg.click('.ms-g[data-i="3"]'); await pg.click('#ms-avg [data-v="14"]'); await pg.click('#ms-chart [data-v="line"]'); await pg.click('#ms-conc [data-v="a"]');
  },

  'orange/train-a-classifier': {
    activity: async (pg) => {
      const shine = [85, 15, 72, 30, 92, 8, 65, 40, 78, 22];
      for (let i = 0; i < shine.length; i++) { await pg.click(`#tc-pool .tc-rock[data-i="${i}"]`); await pg.click(`.tc-bin[data-c="${shine[i] > 50 ? 1 : 0}"] h4`); }
      await pg.click('#tc-test');
    },
    challenge: (pg) => solveSorter(pg, '#challenge'),
  },
  'orange/train-vs-test': {
    activity: async (pg) => { for (const i of [0, 1, 6, 7]) await pg.click(`.tt-mail[data-i="${i}"]`); await pg.click('#tt-cheat'); await pg.click('#tt-fair'); },
    challenge: (pg) => solveSorter(pg, '#challenge'),
  },
  'orange/accuracy-score': {
    activity: async (pg) => { for (let k = 0; k < 3; k++) { await pg.click('#activity [data-q] button[data-i="0"]'); await pg.waitForTimeout(1800); } },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'orange/overfitting': {
    activity: async (pg) => { await setRange(pg, '#of-d', '7'); await pg.click('#of-rev'); await setRange(pg, '#of-d', '2'); await pg.click('#of-lock'); },
    challenge: (pg) => solveSorter(pg, '#challenge'),
  },
  'orange/decision-trees': {
    activity: async (pg) => { await pg.selectOption('select[data-n="root"]', 'rain'); await pg.selectOption('select[data-n="no"]', 'wind'); },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'orange/nearest-neighbor': {
    activity: async (pg) => {
      await pg.click('#nn-task [data-c="S"]'); await pg.waitForTimeout(1700);
      await pg.$eval('#nn-svg', (svg) => { const r = svg.getBoundingClientRect(), W = 320, H = 270; const sx = 34 + 2.15 / 6 * (W - 48), sy = H - 32 - 3.5 / 6 * (H - 48);
        svg.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: r.left + sx / W * r.width, clientY: r.top + sy / H * r.height })); });
      await pg.waitForTimeout(2000);
      await pg.click('#nn-task [data-ok="1"]');
    },
    challenge: (pg) => solveSorter(pg, '#challenge'),
  },
  'test:orange': async (pg) => { for (let k = 0; k < 4; k++) await pg.click('#bt-proj [data-ok="1"]'); },
  'test:white': async (pg) => {
    const ans = ['r', 'n', 'p', 'c', 'n', 'r'];
    for (let i = 0; i < 6; i++) await pg.click(`.gi-item[data-i="${i}"] button[data-v="${ans[i]}"]`);
    await grid(pg, '#bt-maze-game', ['3', 'F', 'L', '3', 'F', 'R', '3', 'F', 'L', '3', 'F']);
  },
};
