const { chromium } = require('playwright') /* npm i playwright */;
const S = process.argv[2], OUT = process.argv[3];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, acceptDownloads: true });
  const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
  await pg.goto('http://localhost:8765/'); await pg.waitForSelector('#newJob');
  await pg.screenshot({ path: OUT + '/01_home.png' });
  // new job
  await pg.click('#newJob'); await pg.fill('#n-job', 'sp26-7001'); await pg.fill('#n-tech', 'Test Tech'); await pg.fill('#n-site', 'Example Data Center'); await pg.fill('#n-assets', 'trl052 bc471');
  await pg.click('#n-go'); await pg.waitForSelector('#tiles .tile');
  ok((await pg.textContent('#jinfo')).includes('SP26-7001'), 'job created, uppercased job #');
  // work order
  await pg.click('[data-go=wo]'); await pg.fill('#wo-address', '1 Test Rd, Charleston, SC'); await pg.fill('#wo-contact', 'Jane Doe'); await pg.click('#wo-now-start');
  await pg.fill('[data-row="0"][data-k="qty"]', '1'); await pg.fill('[data-row="0"][data-k="type"]', '1MW UPS System (trailer)'); await pg.fill('[data-row="0"][data-k="desc"]', 'Start-Up');
  await pg.fill('#wo-comments', 'Start-up completed — UPS on line. Customer’s load at 50% “nominal”. Ø check OK, 72°F.');
  for (const k of ['sigTech', 'sigCust']) { const c = await pg.$('#' + k + '-pad'); await c.scrollIntoViewIfNeeded(); const bb = await c.boundingBox();
    await pg.mouse.move(bb.x + 20, bb.y + 100); await pg.mouse.down(); for (let i = 0; i < 30; i++) await pg.mouse.move(bb.x + 20 + i * 10, bb.y + 100 + 40 * Math.sin(i / 3)); await pg.mouse.up(); }
  await pg.waitForTimeout(500);
  ok((await pg.textContent('#sigCust-date')).startsWith('Signed'), 'both signatures captured');
  await pg.screenshot({ path: OUT + '/02_wo.png', fullPage: true });
  await pg.click('#back'); await pg.waitForSelector('#tiles');
  // add checklist
  await pg.click('[data-go=addcl]'); ok(await pg.inputValue('#a-asset') === 'TRL052', 'asset prefilled from WO'); await pg.click('#a-go'); await pg.waitForSelector('details.sec');
  ok((await pg.$$('details.sec')).length === 9, '9 sections rendered');
  ok((await pg.$$('[data-pass]')).length === 98, '98 lines rendered');
  // section 1: shoot big photo -> crop
  const fi = await pg.$('[data-shoot="1"]'); await fi.setInputFiles(S + '/fbtest/big.jpg'); await pg.waitForSelector('#cbox');
  await pg.waitForTimeout(300); await pg.screenshot({ path: OUT + '/03_crop.png' });
  const h = await pg.$('#cbox .h[data-h="tl"]'); const hb = await h.boundingBox(); await pg.mouse.move(hb.x + 17, hb.y + 17); await pg.mouse.down(); await pg.mouse.move(hb.x + 60, hb.y + 50, { steps: 5 }); await pg.mouse.up();
  await pg.click('#c-crop'); await pg.waitForSelector('[data-ph]', { timeout: 20000 });
  let st = await pg.evaluate(() => FieldBook.current().photos.map(p => ({ kb: p.kb, w: p.w, h: p.h })));
  ok(st.length === 1 && st[0].kb <= 80, 'cropped big photo compressed to ' + JSON.stringify(st));
  // upload 2 for section 2 and one each for 3..9
  await (await pg.$('[data-upload="2"]')).setInputFiles([S + '/photos/p02_80k.jpg', S + '/photos/p03_80k.jpg']); await pg.waitForFunction(() => FieldBook.current().photos.length === 3, null, { timeout: 20000 });
  for (let s = 3; s <= 9; s++) { await pg.evaluate(s => document.querySelector(`details[data-sec="${s}"]`).open = true, s);
    await (await pg.$(`[data-shoot="${s}"]`)).setInputFiles(S + `/photos/p${String(s).padStart(2, '0')}_80k.jpg`); await pg.waitForSelector('#c-full'); await pg.click('#c-full');
    await pg.waitForFunction(n => FieldBook.current().photos.length === n, s + 1, { timeout: 20000 }); }
  // check all lines via mark-all, except line 50; certs except 4; readings
  for (let s = 1; s <= 9; s++) { await pg.evaluate(s => document.querySelector(`details[data-sec="${s}"]`).open = true, s); const a = await pg.$(`[data-all="${s}"]`); if (a) { await a.click(); await pg.waitForTimeout(150); } }
  ok((await pg.evaluate(() => Object.values(FieldBook.current().checklists[0].cert).filter(Boolean).length)) === 0, 'mark-all never sets CERT');
  await pg.evaluate(() => document.querySelectorAll('details.sec').forEach(d => d.open = true));
  await pg.click('[data-pass="50"]'); await pg.fill('[data-note="22"]', 'Set to 480 V — per site');
  for (const c of await pg.$$('[data-cert]')) { const n = await c.getAttribute('data-cert'); if (n !== '4') await c.click(); }
  const rds = await pg.$$('[data-rd]'); for (let i = 0; i < rds.length; i++) await rds[i].fill(String(470 + i));
  await pg.fill('#cl-comments', 'Line 50 open: waiting on customer. Section 4 not certified.');
  await pg.waitForTimeout(600);
  const prog = await pg.textContent('#v-cl .progress'); ok(prog.includes('97') && prog.includes('CERT 7/8') && prog.includes('17/17'), 'progress: ' + prog.replace(/\s+/g, ' '));
  await pg.screenshot({ path: OUT + '/04_checklist.png' });
  // job photo
  await pg.click('#back'); await pg.click('[data-go=ph]'); await (await pg.$('#ph-shoot')).setInputFiles(S + '/photos/p10_80k.jpg'); await pg.click('#c-full');
  await pg.waitForSelector('#v-ph [data-ph]'); await pg.click('#v-ph [data-ph]'); await pg.fill('#p-cap', 'Nameplate — trailer TRL052'); await pg.click('#sclose'); await pg.waitForTimeout(300);
  ok((await pg.textContent('#v-ph')).includes('Nameplate'), 'caption saved');
  // reload persistence
  await pg.reload(); await pg.waitForSelector('[data-open]');
  ok((await pg.$$('[data-open]')).length === 1, 'job persists after reload');
  await pg.click('[data-open]'); await pg.waitForSelector('#tiles');
  // second job isolation
  await pg.click('#back'); await pg.click('#newJob'); await pg.fill('#n-job', 'SP26-7002'); await pg.click('#n-go'); await pg.waitForSelector('#tiles');
  ok(await pg.evaluate(() => FieldBook.current().photos.length === 0 && FieldBook.current().checklists.length === 0), 'second job starts empty');
  await pg.click('#back'); await pg.waitForSelector('[data-open]'); ok((await pg.$$('[data-open]')).length === 2, 'two jobs listed');
  // open first job & send (save pdf, csv)
  const first = await pg.$$('[data-open]'); for (const j of first) if ((await j.textContent()).includes('7001')) { await j.click(); break; }
  await pg.waitForSelector('#tiles'); await pg.screenshot({ path: OUT + '/05_job.png' });
  await pg.click('#send'); await pg.waitForSelector('#doPdf'); await pg.screenshot({ path: OUT + '/06_send.png' });
  let [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('#doPdf')]); const pn = dl.suggestedFilename(); await dl.saveAs(OUT + '/out.pdf');
  [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('#doCsv')]); await dl.saveAs(OUT + '/out.csv');
  console.log('pdf name', pn);
  await pg.click('#sclose'); await pg.waitForTimeout(300);
  ok((await pg.textContent('#jinfo')).includes('Sent 1'), 'marked sent');
  // finish
  await pg.click('#finish'); ok(await pg.$('#fin-yes:not([disabled])') !== null, 'clear enabled after send'); await pg.click('#fin-yes'); await pg.waitForSelector('#cleared:not([hidden])');
  ok((await pg.$$('[data-open]')).length === 1, 'cleared job left list'); await pg.click('[data-restore]'); await pg.waitForTimeout(300); ok((await pg.$$('[data-open]')).length === 2, 'restore works');
  // demo
  await pg.click('#newJob'); await pg.fill('#n-job', 'ltcolumbo'); await pg.click('#n-go'); await pg.waitForSelector('#tiles', { timeout: 20000 });
  ok((await pg.textContent('#jinfo')).includes('SYN-DEMO-01'), 'LTCOLUMBO demo job');
  // desktop screenshot
  await pg.setViewportSize({ width: 1280, height: 900 }); await pg.click('[data-go=cl]'); await pg.waitForSelector('details.sec'); await pg.screenshot({ path: OUT + '/07_desktop.png' });
  console.log('ERRORS', JSON.stringify(errs));
  await b.close();
})();
