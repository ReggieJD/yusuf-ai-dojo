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


// Draw a polyline on a canvas (coords in the canvas's 240-unit space) with real mouse events.
const drawPath = async (pg, sel, pts) => {
  const h = await pg.$(sel); await h.scrollIntoViewIfNeeded(); await pg.waitForTimeout(600); const b = await h.boundingBox(); const m = (p) => [b.x + p[0] / 240 * b.width, b.y + p[1] / 240 * b.height];
  await pg.mouse.move(...m(pts[0])); await pg.mouse.down();
  for (const p of pts.slice(1)) await pg.mouse.move(...m(p), { steps: 4 });
  await pg.mouse.up();
};
const SHAPE_PTS = {
  circle: Array.from({ length: 33 }, (_, i) => [120 + 90 * Math.cos(i / 32 * 2 * Math.PI), 120 + 90 * Math.sin(i / 32 * 2 * Math.PI)]),
  square: [[30, 30], [210, 30], [210, 210], [30, 210], [30, 30]],
  triangle: [[120, 25], [215, 210], [25, 210], [120, 25]],
};


// Tic-tac-toe helper: win if possible, else block, else center/corner/first free.
const tttMove = (pg) => pg.evaluate(() => {
  const cells = [...document.querySelectorAll('#tt-b button')], b = cells.map((c) => c.textContent.includes('❌') ? 'X' : c.textContent.includes('⭕') ? 'O' : '');
  const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const find = (who) => { for (const l of L) { const v = l.map((i) => b[i]); if (v.filter((x) => x === who).length === 2 && v.includes('')) return l[v.indexOf('')]; } return -1; };
  let m = find('X'); if (m < 0) m = find('O'); if (m < 0) m = [4, 0, 2, 6, 8, 1, 3, 5, 7].find((i) => !b[i]);
  if (m == null || m < 0 || cells[m].disabled) return false; cells[m].click(); return true;
});

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

  'green/meet-the-neuron': {
    activity: async (pg) => {
      await pg.click('.nr-in[data-i="2"]'); await pg.click('.nr-in[data-i="0"]');
      await pg.click('#nr-m [data-a="no"]'); await pg.waitForTimeout(2800); await pg.click('#nr-m [data-a="y"]');
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'green/weights-and-bias': {
    activity: async (pg) => {
      await setRange(pg, '#activity [data-w="w1"]', '1'); await setRange(pg, '#activity [data-w="b"]', '-1');
      await pg.click('#activity [data-next]');
      await setRange(pg, '#activity [data-w="w1"]', '1'); await setRange(pg, '#activity [data-w="w2"]', '1'); await setRange(pg, '#activity [data-w="b"]', '-2.5');
    },
    challenge: async (pg) => {
      await setRange(pg, '#challenge [data-w="w1"]', '1'); await setRange(pg, '#challenge [data-w="w2"]', '-1'); await setRange(pg, '#challenge [data-w="b"]', '-1');
      await pg.click('#challenge [data-next]'); await pg.click('#challenge [data-imp]');
    },
  },
  'green/activation-switch': {
    activity: async (pg) => {
      for (const [q, f] of [['all', 'step'], ['pass', 'relu'], ['smooth', 'sig']]) await pg.click(`.as-q[data-q="${q}"] [data-f="${f}"]`);
      await pg.click('#as-final [data-ok="1"]');
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'green/network-playground': {
    activity: async (pg) => { await pg.selectOption('[data-c="h1"]', 'or'); await pg.selectOption('[data-c="h2"]', 'nand'); await pg.selectOption('[data-c="o"]', 'and'); },
    challenge: async (pg) => {
      await setRange(pg, '#challenge [data-w="w1"]', '1'); await setRange(pg, '#challenge [data-w="w2"]', '1'); await setRange(pg, '#challenge [data-w="b"]', '-1.5');
      await pg.waitForTimeout(1100); await setRange(pg, '#challenge [data-w="b"]', '-0.5'); await pg.waitForTimeout(1100);
    },
  },
  'green/walking-downhill': {
    activity: async (pg) => {
      await pg.click('[data-lr="0.3"]'); for (let k = 0; k < 14; k++) await pg.click('#wd-step');
      await pg.click('#wd-reset'); await pg.click('[data-lr="2.2"]'); for (let k = 0; k < 2; k++) await pg.click('#wd-step');
      await pg.click('#wd-m [data-ok="1"]');
    },
    challenge: async (pg) => { await setRange(pg, '#tv-s', '-4'); await pg.click('#tv-go'); await setRange(pg, '#tv-s', '4'); await pg.click('#tv-go'); },
  },
  'green/how-networks-learn': {
    activity: async (pg) => { await pg.click('#hl-10'); await pg.waitForTimeout(900); await pg.click('#hl-10'); await pg.waitForTimeout(900); },
    challenge: async (pg) => { for (let i = 0; i < 4; i++) await pg.click(`#challenge .lo-pool [data-i="${i}"]`); },
  },
  'test:green': async (pg) => {
    await setRange(pg, '#bt-proj [data-w="a"]', '1'); await setRange(pg, '#bt-proj [data-w="b"]', '-1'); await setRange(pg, '#bt-proj [data-w="c"]', '-2');
    await pg.click('#bt-proj [data-ok="1"]');
  },

  'blue/pixels': {
    activity: async (pg) => {
      await setRange(pg, '#pz-z', '8');
      for (const x of [0, 4, 6]) await pg.click(`#pz-grid button[data-x="${x}"][data-y="5"]`);
      await pg.click('#pz-m [data-ok="1"]');
    },
    challenge: async (pg) => {
      const T = ['00000000', '01100110', '11111111', '11111111', '11111111', '01111110', '00111100', '00011000'];
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (T[y][x] === '1') await pg.click(`#pn-g button[data-x="${x}"][data-y="${y}"]`);
    },
  },
  'blue/color-numbers': {
    activity: async (pg) => {
      for (const t of [[255, 230, 0], [255, 120, 20], [90, 30, 160], [255, 255, 255]]) {
        for (let i = 0; i < 3; i++) await setRange(pg, `.rg-sl input[data-i="${i}"]`, String(t[i]));
        await pg.waitForTimeout(450);
      }
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'blue/filters-and-edges': {
    activity: async (pg) => { await pg.click('#fl-sample'); await pg.click('[data-f="edge"]'); await pg.click('[data-f="blur"]'); await pg.click('#fl-q [data-ok="1"]'); },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'blue/draw-and-guess': {
    activity: async (pg) => {
      for (const sh of ['circle', 'square', 'triangle']) {
        const ask = await pg.textContent('#dg-ask');
        if (!ask.toLowerCase().includes(sh)) throw new Error('unexpected prompt ' + ask);
        await drawPath(pg, '#dg-c', SHAPE_PTS[sh]); await pg.click('#dg-go');
        const fb = await pg.textContent('#dg-fb'); if (!/Correct/.test(fb)) throw new Error(sh + ': ' + fb);
        await pg.waitForTimeout(1600);
      }
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'blue/sound-to-numbers': {
    activity: async (pg) => { await setRange(pg, '[data-k="f"]', '3'); await setRange(pg, '[data-k="a"]', '0.8'); await setRange(pg, '[data-k="s"]', '6'); await pg.click('#sw-m [data-ok="1"]'); },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'blue/how-ai-sees': {
    activity: async (pg) => { for (let r = 0; r < 3; r++) { await pg.click('.hs-feat [data-i="0"]'); await pg.click('.hs-feat [data-i="1"]'); await pg.waitForTimeout(1900); } },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'test:blue': async (pg) => {
    await setRange(pg, '#bt-proj [data-c="0"]', '255');
    const P = ['000000', '001100', '011110', '011110', '001100', '000000'];
    for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) if (P[y][x] === '1') await pg.click(`#cl-g button[data-x="${x}"][data-y="${y}"]`);
    await pg.click('#bt-proj [data-e="1"]'); await pg.click('#bt-proj [data-s="1"]');
  },

  'purple/search-trees': {
    activity: async (pg) => {
      for (const id of ['r', 'r1', 'r2', 'r11']) await pg.click(`[data-id="${id}"]`);
      await pg.click('[data-ok="1"]');
      for (let k = 0; k < 10; k++) {
        if (await pg.$('#st-again')) break;
        const n = await pg.$eval('.st-sticks', (e) => (e.textContent.match(/🥢/g) || []).length);
        await pg.click(`[data-take="${n % 3 || 1}"]`); await pg.waitForTimeout(900);
      }
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'purple/tic-tac-toe-minimax': {
    activity: async (pg) => {
      await pg.click('[data-br="random"]');
      for (let g = 0; g < 40 && !(await pg.textContent('#tt-m')).includes('Mission 2'); g++) { while (await tttMove(pg)); await pg.click('#tt-new'); }
      await pg.click('[data-br="minimax"]');
      for (let g = 0; g < 2; g++) { while (await tttMove(pg)); await pg.click('#tt-new'); }
      await pg.click('#tt-m [data-ok="1"]');
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'purple/chess-engine-thinking': {
    activity: async (pg) => { for (let k = 0; k < 3; k++) await pg.click('#activity [data-ok="1"]'); },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'purple/maze-sensei': {
    activity: async (pg) => {
      for (let k = 0; k < 30 && !(await pg.$('#mz-q [data-ok]')); k++) await pg.click('#mz-50');
      await pg.click('#mz-q [data-ok="1"]');
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'purple/explore-vs-exploit': {
    activity: async (pg) => { for (let k = 0; k < 20; k++) await pg.click(`[data-d="${k % 3}"]`); await pg.click('#ee-run'); await pg.click('.ee-sim [data-ok="1"]'); },
    challenge: (pg) => solveSorter(pg, '#challenge'),
  },
  'purple/game-character-ai': {
    activity: async (pg) => {
      for (const [r, v] of [['see', 'chase'], ['lose', 'search'], ['timer', 'patrol'], ['spot', 'chase'], ['hurt', 'flee']]) await pg.selectOption(`select[data-r="${r}"]`, v);
      await pg.click('#sm-run'); await pg.waitForTimeout(6500);
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'test:purple': async (pg) => {
    for (let k = 0; k < 10 && (await pg.$('#bt-proj [data-t="1"]')); k++) {
      const n = await pg.$eval('.tn-sticks', (e) => (e.textContent.match(/🥢/g) || []).length);
      await pg.click(`#bt-proj [data-t="${n % 3 || 1}"]`);
    }
    await pg.click('#bt-proj [data-sq="2"]'); await pg.click('#bt-proj [data-rw="1"]');
  },

  'brown/tokens': {
    activity: async (pg) => { await pg.click('[data-a="1"][data-ok="1"]'); await pg.click('[data-a="2"][data-ok="1"]'); },
    challenge: (pg) => solveSorter(pg, '#challenge'),
  },
  'brown/next-word': {
    activity: async (pg) => {
      for (let k = 0; k < 5; k++) { await pg.click('#activity [data-g] >> nth=0'); await pg.click('#nw-next'); }
      for (const w of ['the', 'ninja', 'learned', 'from', 'the', 'sensei', '</s>']) await pg.click(`button.nw-bar[data-w="${w}"]`);
      await pg.click('.nw-q [data-ok="1"]');
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'brown/word-maps': {
    activity: async (pg) => {
      for (const w of ['dog', 'king', 'apple']) await pg.click(`.wm-w[data-w="${w}"]`);
      await pg.click('#wm-m [data-i="0"]'); await pg.waitForTimeout(1900);
      await pg.click('#wm-m [data-i="0"]'); await pg.waitForTimeout(1900);
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'brown/temperature': {
    activity: async (pg) => { await setRange(pg, '#tp-t', '0'); await pg.click('#tp-go'); await setRange(pg, '#tp-t', '1.9'); await pg.click('#tp-go'); await pg.click('#tp-m [data-ok="1"]'); },
    challenge: (pg) => solveSorter(pg, '#challenge'),
  },
  'brown/confidently-wrong': {
    activity: async (pg) => { const t = [1, 1, 0, 1, 0, 0]; for (let i = 0; i < 6; i++) await pg.click(`.fc-claim[data-i="${i}"] [data-v="${t[i]}"]`); },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'brown/prompt-puzzles': {
    activity: async (pg) => {
      for (const [i, ks] of [[0, ['aud', 'len', 'fmt']], [1, ['genre', 'hero', 'len']], [2, ['role', 'fmt', 'rule']]]) {
        for (const k of ks) await pg.click(`.pp-pieces [data-k="${k}"]`);
        if (i < 2) await pg.click('#pp-next');
      }
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'test:brown': async (pg) => {
    for (const [f, v] of [['role', 'Act as a coach'], ['task', 'Make a practice plan'], ['aud', 'For kids aged 11'], ['fmt', 'A numbered list'], ['lim', 'Thirty minutes total']]) await pg.fill(`[data-f="${f}"]`, v);
    for (const s of ['1', '2', '3']) await pg.click(`#bt-proj [data-s="${s}"][data-ok="1"]`);
  },

  'black/how-app-builders-work': {
    activity: async (pg) => { for (let i = 0; i < 6; i++) await pg.click(`[data-st="${i}"]`); await pg.click('[data-b="A"]'); await pg.click('[data-b="B"]'); await pg.click('#activity [data-ok="1"]'); },
    challenge: (pg) => solveSorter(pg, '#challenge'),
  },
  'black/idea-to-spec': {
    activity: async (pg) => {
      for (const [f, v] of [['name', 'Free Throw Tracker'], ['users', 'Kids on my basketball team'], ['problem', 'We forget how many free throws we make each practice'], ['f1', 'Tap buttons to log shots'], ['f2', 'Show the percentage in big numbers'], ['f3', 'Save each practice session'], ['not', 'No accounts or photos'], ['test', 'Seven makes out of ten shows seventy percent']]) await pg.fill(`#activity [data-f="${f}"]`, v);
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'black/spec-to-prompts': {
    activity: async (pg) => { for (let k = 0; k < 3; k++) { await pg.click('#activity [data-ok="1"]'); await pg.waitForTimeout(1600); } for (let i = 0; i < 4; i++) await pg.click(`[data-o="${i}"]`); },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'black/test-and-debug': {
    activity: async (pg) => {
      for (const [k, v] of [['pass1', 'p'], ['pass2', 'f'], ['pass3', 'p'], ['reset', 'f']]) await pg.click(`.td-test[data-t="${k}"] [data-m="${v}"]`);
      await pg.waitForTimeout(1500); await pg.click('[data-rep="1"]');
      for (const k of ['pass1', 'pass2', 'pass3', 'reset']) await pg.click(`.td-test[data-t="${k}"] [data-m="p"]`);
      await pg.waitForTimeout(1500);
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'black/code-playground': {
    activity: async (pg) => {
      await pg.click('[data-app="clock"]'); await pg.click('[data-app="cards"]');
      await pg.$eval('#cp-code', (t) => { t.value = t.value.replace('#fffdf6', '#ffe8a3'); t.dispatchEvent(new Event('input', { bubbles: true })); });
      await pg.waitForTimeout(900);
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'black/app-blueprints': {
    activity: async (pg) => {
      for (const id of ['stats', 'chess', 'belt', 'quiz', 'drill']) { const d = await pg.$(`details.bp[data-bp="${id}"]`); if (!(await d.evaluate((x) => x.open))) await pg.click(`details.bp[data-bp="${id}"] > summary`); }
      await pg.click('[data-copy="stats"]');
      for (let i = 0; i < 3; i++) await pg.check(`[data-ck="stats${i}"]`);
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'black/bias-and-fairness': {
    activity: async (pg) => { await pg.click('[data-s1="1"]'); await pg.click('[data-s2="1"]'); await pg.check('#bf-club'); await pg.click('[data-s3="1"]'); },
    challenge: (pg) => solveSorter(pg, '#challenge'),
  },
  'black/privacy-shield': { activity: (pg) => solveSorter(pg, '#activity'), challenge: (pg) => solveQuiz(pg, '#challenge') },
  'black/spotting-fakes': { activity: (pg) => solveSorter(pg, '#activity'), challenge: (pg) => solveSorter(pg, '#challenge') },
  'black/learn-dont-skip': { activity: (pg) => solveSorter(pg, '#activity'), challenge: (pg) => solveQuiz(pg, '#challenge') },
  'black/trusted-adult': {
    activity: async (pg) => { await pg.click('[data-t="0"]'); await pg.click('[data-t="2"]'); await solveSorter(pg, '#ta-sort'); },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'black/ai-careers': {
    activity: async (pg) => {
      for (let i = 0; i < 4; i++) await pg.click(`[data-q="${i}"][data-o="0"]`);
      for (const c of ['ds', 'rob', 'eth']) await pg.click(`.cm-card[data-c="${c}"] > summary`);
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'black/final-project': {
    activity: async (pg) => {
      await pg.fill('[data-f="name"]', 'Kata Coach'); await pg.selectOption('[data-f="ai"]', 'recommend'); await pg.fill('[data-f="pitch"]', 'An app that recommends which drill to practice next');
      await pg.click('#fp-next');
      for (const [f, v] of [['users', 'Kids at my dojo'], ['problem', 'We never know which drill to practice next'], ['f1', 'Log each drill I practice'], ['f2', 'Recommend the next drill'], ['f3', 'Show my weekly minutes'], ['not', 'No names or photos'], ['test', 'After logging kicks it suggests a different drill']]) await pg.fill(`[data-f="${f}"]`, v);
      await pg.click('#fp-next');
      for (const [f, v] of [['data', 'My past drill logs and minutes'], ['wrong', 'It might repeat the same drill too often so I add a shuffle'], ['fair', 'It must work for beginners too so I test with different levels']]) await pg.fill(`[data-f="${f}"]`, v);
      await pg.click('#fp-next'); await pg.click('#fp-next');
      for (const c of ['c1', 'c2', 'c3', 'c4']) await pg.check(`[data-c="${c}"]`);
      await pg.click('#fp-next');
    },
    challenge: (pg) => solveQuiz(pg, '#challenge'),
  },
  'test:black': async (pg) => { for (let k = 0; k < 4; k++) await pg.click('#bt-proj [data-ok="1"]'); },
  'test:white': async (pg) => {
    const ans = ['r', 'n', 'p', 'c', 'n', 'r'];
    for (let i = 0; i < 6; i++) await pg.click(`.gi-item[data-i="${i}"] button[data-v="${ans[i]}"]`);
    await grid(pg, '#bt-maze-game', ['3', 'F', 'L', '3', 'F', 'R', '3', 'F', 'L', '3', 'F']);
  },
};
