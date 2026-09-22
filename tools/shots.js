// Screenshot helper: node tools/shots.js <outdir> page1.html[@phone|@desk] ...
const path = require('path'); const fs = require('fs'); const http = require('http');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(__dirname, '..'); const out = process.argv[2]; const list = process.argv.slice(3);
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0, async () => {
  const b = await chromium.launch(); const base = 'http://127.0.0.1:' + srv.address().port + '/';
  for (const item of list) {
    const [pg0, mode = 'phone', setup] = item.split('@');
    const ctx = await b.newContext({ viewport: mode === 'desk' ? { width: 1280, height: 900 } : { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const pg = await ctx.newPage();
    await pg.goto(base + 'index.html');
    if (setup !== 'fresh') await pg.evaluate(() => { const s = Dojo.state(); s.profile = { nick: 'Shadow Falcon', avatar: '🐉', themes: ['chess', 'basketball', 'space'] }; s.xp = 340; Dojo.save(); });
    await pg.goto(base + pg0); await pg.waitForTimeout(1800);
    const f = path.join(out, pg0.replace(/\//g, '_') + '-' + mode + '.png');
    await pg.screenshot({ path: f, fullPage: true }); console.log(f); await ctx.close();
  }
  await b.close(); srv.close();
});
