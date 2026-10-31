/* Headless Chromium check of the portal page behind portal-web (see tests/README in the component README).
   usage: PORTAL_URL=http://127.0.0.1:18080 [SHOTS_DIR=/tmp/shots] node browser-check.cjs
   Fails (exit 1) on any console error or warning, page error, CSP violation, failed request or failed check. */
const { chromium } = require('playwright');

const BASE = process.env.PORTAL_URL || 'http://127.0.0.1:18080';
const SHOTS = process.env.SHOTS_DIR || '';
const results = [];
let failed = 0;

function check(name, ok, detail) {
  results.push(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failed++;
}

function watch(page, problems) {
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') problems.push(`console.${m.type()}: ${m.text()}`); });
  page.on('pageerror', e => problems.push('pageerror: ' + e.message));
  page.on('requestfailed', r => { const f = r.failure(); if (!(f && /ERR_ABORTED/.test(f.errorText))) problems.push(`requestfailed: ${r.url()} ${f && f.errorText}`); });
  page.on('response', r => { if (r.status() >= 400) problems.push(`http ${r.status()}: ${r.url()}`); });
}

async function shot(page, name) { if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false }); }
const text = (page, sel) => page.locator(sel).first().innerText();

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: 'zh-TW' });
  const page = await ctx.newPage();
  const problems = [];
  watch(page, problems);
  await page.exposeBinding('reportCsp', (_src, v) => problems.push('CSP violation: ' + v));
  await page.addInitScript(() => document.addEventListener('securitypolicyviolation',
    e => window.reportCsp(`${e.violatedDirective} ${e.blockedURI} ${e.sample || ''}`)));
  // the browser's clock says Saturday 2026-10-31 (the stub view is built for that day): calendar checks do not drift
  await page.clock.setFixedTime(new Date('2026-10-31T12:00:00'));

  // ---------------------------------------------------------------- home
  const resp = await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  const headers = resp.headers();
  check('CSP header on the page', /default-src 'self'/.test(headers['content-security-policy'] || '') && /frame-ancestors 'none'/.test(headers['content-security-policy']));
  await page.waitForSelector('h1');
  check('home: title', (await text(page, 'h1')) === '雲端模型最新消息');
  const hl = await page.locator('#app .card').first().locator('.row').count();
  check('home: highlights', hl === 6, `${hl} rows`);
  check('home: three countdown columns', (await page.locator('.cd > .card').count()) === 3);
  check('home: catalog table', (await page.locator('section[aria-labelledby="h-cat"] tbody tr').count()) === 11);
  await page.locator('[data-act="hlToggle"]').first().click();
  check('home: highlight opens', await page.locator('.ndetail').first().isVisible());
  check('home: as-of date in header', /資料日期 \d{4}-\d{2}-\d{2}/.test(await text(page, '#asof')));
  check('chat button shown after load', await page.locator('#chat-fab').isVisible());
  await shot(page, '01-home-zh');

  // ---------------------------------------------------------------- news
  await page.click('#nav a[href="#news"]');
  await page.waitForSelector('[data-act="newsSec"]');
  const allNews = await page.locator('.rows .row').count();
  await page.click('[data-act="newsSec"][data-v="資安"]');
  const secNews = await page.locator('.rows .row').count();
  check('news: list and category filter', allNews > 50 && secNews > 0 && secNews < allNews, `${allNews} -> ${secNews}`);
  await page.click('[data-act="newsTab"][data-v="open"]');
  await page.waitForURL(/#news-open$/);
  await page.waitForSelector('th:has-text("熱度")');
  check('news: open-weight table', (await page.locator('table tbody tr').count()) === 15);
  await page.click('[data-act="newsTab"][data-v="todo"]');
  await page.waitForURL(/#news-todo$/);
  await page.waitForSelector('.row.rt');
  check('news: to-dos', (await page.locator('.rows .row').count()) === 33);
  await shot(page, '02-news-todo');

  // ---------------------------------------------------------------- retirements
  await page.click('#nav a[href="#retire"]');
  await page.waitForSelector('h1:has-text("退役日曆")');
  check('retirements: list rows', (await page.locator('.ret-row').count()) > 10);
  // today: the calendar opens on this month, today is a filled disc with a label, earlier days look past
  const today = page.locator('#ret-cal [aria-current="date"]');
  const tc = await today.evaluate(el => [el.className, el.querySelector('.cal-n').textContent, el.querySelector('.cal-today-l').textContent, getComputedStyle(el).backgroundColor, getComputedStyle(el).color]);
  check('calendar: opens on this month with today marked', (await text(page, '#cal-t')) === '2026 年 10 月' && /\btoday\b/.test(tc[0]) && tc[1] === '31' && tc[2] === '今天'
    && tc[3] === 'rgb(11, 60, 122)' && tc[4] === 'rgb(255, 255, 255)', tc.join(' | '));
  const tb = await today.boundingBox();
  check('calendar: today is in view on load', tb && tb.y >= 0 && tb.y + tb.height <= 900, JSON.stringify(tb));
  check('calendar: earlier days look past', (await page.locator('#ret-cal .cal-d.past').count()) === 30);
  check('calendar: Today button', (await text(page, '[data-act="calToday"]')) === '今天 10/31');
  // no retirement left this month: the line under the grid jumps to the next one (keyboard)
  const nextLine = page.locator('#ret-cal .cal-next');
  check('calendar: next-event line', (await nextLine.textContent()) === '本月已無退役事件 · 下一個：11/13（剩 13 天）→', await nextLine.textContent());
  await nextLine.focus(); await page.keyboard.press('Enter');
  await page.waitForSelector('#ret-cal [data-cal="2026-11-13"] .pen');
  check('calendar: the line jumps to 11/13 and circles it', (await text(page, '#cal-t')) === '2026 年 11 月'
    && (await page.evaluate(() => document.activeElement.dataset.cal)) === '2026-11-13' && (await page.locator('.ret-row.cal-hl').count()) === 1);
  await shot(page, '02a-retire-next');
  await page.click('[data-act="calNext"]');
  check('calendar: next month has no today', (await text(page, '#cal-t')) === '2026 年 12 月' && (await page.locator('#ret-cal [aria-current="date"]').count()) === 0);
  await page.click('[data-act="calToday"]');
  check('calendar: Today button returns to this month', (await text(page, '#cal-t')) === '2026 年 10 月' && (await today.count()) === 1);
  // with the last 14 days shown, a "today" line sits between past and coming retirements
  await page.check('input[data-act="retPast"]');
  const order = await page.locator('.ret-list tbody tr').evaluateAll(r => r.map(x => x.classList.contains('ret-today') ? 'TODAY' : x.dataset.date));
  const ti = order.indexOf('TODAY');
  check('retirements: today line between past and coming', ti > 0 && order.slice(0, ti).every(d => d < '2026-10-31') && order.slice(ti + 1).every(d => d >= '2026-10-31')
    && (await text(page, '.ret-today')) === '今天 10/31' && (await page.locator('#ret-cal button.cal-d.past').count()) > 0, `${order[ti - 1]} | ${order[ti + 1]}`);
  await page.uncheck('input[data-act="retPast"]');
  const row = page.locator('.ret-row[data-date^="2026-12"]').first();
  const rowDate = await row.getAttribute('data-date');
  await row.scrollIntoViewIfNeeded(); await row.hover();
  await page.waitForSelector(`#ret-cal [data-cal="${rowDate}"] .pen`);
  check('retirements: hovering a row circles its date in red', /12 月/.test(await page.locator('#cal-t').innerText()));
  await shot(page, '02b-retire-calendar');
  await page.mouse.move(5, 5);
  await page.waitForFunction(() => !document.querySelector('#ret-cal .pen'));
  check('retirements: leaving removes the circle', true);

  // ---------------------------------------------------------------- models
  await page.click('#nav a[href="#models"]');
  await page.waitForSelector('.chart');
  check('models: table', (await page.locator('.card').first().locator('tbody tr').count()) === 11);
  const heads = await page.locator('.card').first().locator('thead th').allInnerTexts();
  check('models: availability column instead of gate dots', heads.includes('申請狀態') && (await page.locator('.card').first().locator('.dots').count()) === 0
    && /尚未開放|暫停導入|可以申請|試用中/.test(await page.locator('.card').first().locator('tbody tr').first().innerText()), heads.slice(-2).join('|'));
  check('models: scatter chart', (await page.locator('.chart circle').count()) >= 10);
  await page.locator('input[data-act="cmp"]').nth(0).check();
  await page.locator('input[data-act="cmp"]').nth(1).check();
  check('models: compare block', (await page.locator('h2:has-text("並排比較")').count()) === 1);
  await shot(page, '03-models');
  await page.click('a[href="#m-claude-opus-5-5"] >> nth=0');
  await page.waitForSelector('h1:has-text("Claude Opus 5.5")');
  const tabs = await page.locator('.mtabs a').evaluateAll(a => a.map(x => [x.getAttribute('href'), x.getAttribute('aria-current')]));
  check('model page: three layers with deep links', JSON.stringify(tabs) === JSON.stringify([['#m-claude-opus-5-5', 'page'], ['#m-claude-opus-5-5/security', null], ['#m-claude-opus-5-5/rollout', null]]), JSON.stringify(tabs));
  check('layer 1: availability first, apply in the header', /尚未開放申請|可以申請使用|暫停導入|試用中/.test(await page.locator('#mlayer .avail').innerText())
    && (await page.locator('.mhead a[href="#apply-claude-opus-5-5"]').count()) === 1 && /發布日期/.test(await page.locator('.facts').innerText()));
  await shot(page, '04-model');
  // subscribe: request-api keeps it (PUT, then DELETE)
  const [put] = await Promise.all([page.waitForRequest(r => r.url().endsWith('/api/subscriptions/claude-opus-5-5') && r.method() === 'PUT'), page.click('#mlayer button[data-act="sub"]')]);
  await page.waitForSelector('.sub-msg');
  check('subscribe: PUT /api/subscriptions/{id} and a confirmation', !!put && (await page.getAttribute('#mlayer button[data-act="sub"]', 'aria-pressed')) === 'true' && /已訂閱/.test(await page.locator('.sub-msg').innerText()));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#mlayer button[data-act="sub"][aria-pressed="true"]');
  check('subscribe: GET /api/subscriptions restores it after a reload', true);
  const [del] = await Promise.all([page.waitForRequest(r => r.url().endsWith('/api/subscriptions/claude-opus-5-5') && r.method() === 'DELETE'), page.click('#mlayer button[data-act="sub"]')]);
  await page.waitForSelector('#mlayer button[data-act="sub"][aria-pressed="false"]');
  check('unsubscribe: DELETE', !!del && /已取消/.test(await page.locator('.sub-msg').innerText()));
  await page.click('.mtabs a[href="#m-claude-opus-5-5/security"]');
  await page.waitForSelector('.kv code');
  check('layer 2: security, data processing, gateway', (await page.locator('.kv code').first().innerText()) === 'claude-opus-5-5'
    && /資料處理與區域/.test(await page.locator('#mlayer').innerText()) && /turn_off_message_logging/.test(await page.locator('#mlayer').innerText()));
  await page.click('.mtabs a[href="#m-claude-opus-5-5/rollout"]');
  await page.waitForSelector('#mlayer .dots');
  check('layer 3: gates with owners, gate dots, cloud table', (await page.locator('#mlayer .card').first().locator('tbody tr').count()) === 11
    && (await page.locator('#mlayer .dots .dot').count()) === 11 && /三雲比較/.test(await page.locator('#mlayer').innerText()));
  await shot(page, '04b-layer3');

  // ---------------------------------------------------------------- tests + security matrix
  await page.click('#nav a[href="#tests"]');
  await page.waitForSelector('#sec-matrix');
  const core = await page.locator('#sec-matrix .sx-row:not(.sx-head)').count();
  await page.click('[data-act="secScope"][data-v="all"]');
  const all = await page.locator('#sec-matrix .sx-row:not(.sx-head)').count();
  check('matrix: 16 core / 32 all', core === 16 && all === 32, `${core} / ${all}`);
  const cols = await page.locator('#sec-matrix .sx').evaluate(el => getComputedStyle(el).getPropertyValue('--sx').trim());
  check('matrix: grid columns set through CSSOM', /minmax/.test(cols), cols);
  const headCols = await page.locator('#sec-matrix .sx-head span').allInnerTexts();
  check('matrix: result columns per tested model', headCols.includes('Sonnet 5.5') && headCols.includes('Haiku 5.5'), headCols.join('|'));
  await page.click('[data-act="secToggle"][data-id="SEC-06"]');
  check('matrix: item details', /通過標準/.test(await page.locator('#d-SEC-06').innerText()));
  await page.check('input[data-act="mock"]');
  check('tests: sample layout table', (await page.locator('.banner:has-text("範例畫面")').count()) === 1);
  await shot(page, '05-tests-matrix');
  await page.goto(BASE + '/#sec-SEC-13');
  await page.waitForSelector('#d-SEC-13:visible');
  check('matrix: deep link opens the item', await page.locator('#d-SEC-13').isVisible());

  // ---------------------------------------------------------------- cost
  await page.click('#nav a[href="#cost"]');
  await page.waitForSelector('h1:has-text("成本試算")');
  const costRows = await page.locator('.card').nth(1).locator('tbody tr').count();
  await page.click('[data-act="wl"][data-v="custom"]');
  await page.fill('#wl-rpd', '1000');
  await page.locator('#wl-rpd').dispatchEvent('change');
  check('cost: estimate table and custom workload', costRows > 10 && /1,000/.test(await page.locator('.card').first().innerText()), `${costRows} rows`);

  // ---------------------------------------------------------------- apply: validation, submit
  await page.click('#nav a[href="#apply"]');
  await page.waitForSelector('#apply-form');
  await page.click('#ap-submit');
  check('apply: missing fields are reported', /請填申請單位/.test(await page.locator('#ap-out').innerText()));
  await page.fill('#ap-team', '數位通路部 AI 小組');
  await page.fill('#ap-alias', 'jchen');
  await page.fill('#ap-use', '客服知識庫問答，內部員工使用');
  await page.selectOption('#ap-class', 'sec-b');
  await page.click('#ap-msel summary');
  await page.check('input[name="ap-model"][value="claude-sonnet-5-5"]');
  await page.click('#apply-form h2');
  await page.fill('#ap-rpd', '20000');
  await page.check('#ap-ext');
  await page.fill('#ap-date', '2026-12-15');
  const [req] = await Promise.all([page.waitForRequest(r => r.url().endsWith('/api/requests') && r.method() === 'POST'), page.click('#ap-submit')]);
  await page.waitForSelector('#ap-out .result-card h3:has-text("申請編號")');
  const body = JSON.parse(req.postData());
  check('apply: request body (request.schema.json names)', body.team === '數位通路部 AI 小組' && body.use_case && body.data_class === 'sec-b'
    && body.models.join() === 'claude-sonnet-5-5' && body.unsure === false && body.rpd === 20000 && body.external === true
    && body.target_date === '2026-12-15' && body.alias === 'jchen', JSON.stringify(body));
  const out = await page.locator('#ap-out').innerText();
  check('apply: server id, status and gates shown', /申請編號 [0-9a-f-]{36}/.test(out) && /審查中/.test(out) && /法遵審查（待審）/.test(out) && /試用（待審）/.test(out) && /下一關：法遵審查/.test(out), out.split('\n').slice(0, 8).join(' / '));
  check('apply: cost preview kept', /預估每月成本/.test(out));
  await shot(page, '06-apply-sent');

  // ---------------------------------------------------------------- chat
  await page.click('#chat-fab');
  await page.waitForSelector('#chat:visible');
  await page.click('#chat-sugg button >> nth=0');
  await page.waitForSelector('#chat-log .msg.b a[data-chatlink]');
  const answer = await page.locator('#chat-log .msg.b').last().innerHTML();
  check('chat: answer with an internal link', /href="#m-claude-sonnet-5-5"/.test(answer));
  check('chat: bad and external links removed', !/not-a-model|example\.com/.test(answer) && /不存在的模型/.test(answer));
  check('chat: list rendered', /<li>重點一<\/li>/.test(answer));
  await shot(page, '07-chat');
  await page.click('#chat-log .msg.b a[data-chatlink] >> nth=0');
  await page.waitForSelector('h1:has-text("Claude Sonnet 5.5")');
  check('chat: link navigates', true);

  // ---------------------------------------------------------------- form helper
  await page.goto(BASE + '/#apply');
  await page.waitForSelector('#apply-form');
  await page.click('[data-act="aiFill"]');
  await page.waitForSelector('#chat:visible');
  await page.fill('#chat-in', '給客戶用的客服機器人，一天約 3 萬次，只能用 AWS');
  await page.click('#chat-send');
  await page.waitForSelector('button[data-apply]');
  const box = await page.locator('.fa-box').innerText();
  check('helper: suggestion (unknown model dropped)', /Claude Haiku 5\.5/.test(box) && !/made-up/.test(box), box.replace(/\n/g, ' | '));
  await page.click('button[data-apply]');
  await page.waitForSelector('.fa-ok');
  check('helper: applied to the form', await page.locator('input[name="ap-model"][value="claude-haiku-5-5"]').isChecked()
    && (await page.inputValue('#ap-rpd')) === '30000' && (await page.inputValue('#ap-cloud')) === 'aws' && await page.isChecked('#ap-ext'));
  await shot(page, '08-helper');
  await page.click('#chat-x');

  // ---------------------------------------------------------------- English, themes
  await page.click('#lang button[data-lang="en"]');
  await page.goto(BASE + '/#home');
  await page.waitForSelector('h1:has-text("Cloud model updates")');
  check('EN: home', (await text(page, '#nav a[href="#news"]')) === 'News' && /Data as of/.test(await text(page, '#asof')));
  await page.click('#nav a[href="#tests"]');
  await page.waitForSelector('#sec-matrix');
  check('EN: matrix in English', /Direct prompt injection/.test(await page.locator('#sec-matrix').innerText()));
  await page.goto(BASE + '/#m-claude-opus-5-5/security');
  await page.waitForSelector('.mtabs a[aria-current="page"]');
  check('EN: layer names', (await page.locator('.mtabs a').allInnerTexts()).map(x => x.replace(/^\d\s*/, '')).join('|') === 'Model & strengths|Security & gateway|Rollout details');
  await page.click('#nav a[href="#models"]');
  await page.waitForSelector('h1:has-text("Model catalog")');
  check('EN: model one-liners', /Highest score today/.test(await page.locator('#app').innerText()));
  await page.click('#nav a[href="#retire"]');
  await page.waitForSelector('#ret-cal .cal-next');
  check('EN: calendar today and next event', (await text(page, '#cal-t')) === 'October 2026' && (await text(page, '[data-act="calToday"]')) === 'Today Oct 31'
    && (await text(page, '#ret-cal .cal-today-l')) === 'Today' && (await page.locator('#ret-cal .cal-next').textContent()) === 'No more retirements this month · Next: Nov 13 (13 days left)→');
  await page.click('#chat-fab');
  await page.click('button[data-mode="qa"]');  // leave the form helper (it keeps its mode, like the prototype)
  await page.fill('#chat-in', 'Which models retire in November?');
  await page.click('#chat-send');
  await page.waitForFunction(() => document.querySelectorAll('#chat-log .msg.u').length >= 1 && !document.querySelector('#chat-log .think'));
  const enLog = await page.locator('#chat-log').innerText();
  check('EN: chat in English', /Ask the portal/.test(await text(page, '#chat-h')) && /Which models retire in November\?/.test(enLog) && /data-chatlink/.test(await page.locator('#chat-log').innerHTML()), enLog.slice(-300).replace(/\n/g, ' | '));
  await page.click('#chat-x');
  await shot(page, '09-models-en');
  await page.click('#ui-sum');
  await page.click('button[data-ui="dark"]');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  check('theme: dark', (await page.getAttribute('html', 'data-ui')) === 'dark' && bg === 'rgb(17, 20, 24)', bg);
  await page.click('#ui-sum');
  await page.click('button[data-ui="beige"]');
  check('theme: beige', (await page.getAttribute('html', 'data-ui')) === 'beige');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('h1');
  check('reload keeps language and theme', (await text(page, 'h1')) !== '雲端模型最新消息' && (await page.getAttribute('html', 'data-ui')) === 'beige');
  await shot(page, '10-beige-en');

  // ---------------------------------------------------------------- phone width
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE + '/#home');
  await page.waitForSelector('h1');
  const overflow = await page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);
  check('phone: no horizontal page scroll', overflow <= 0, `${overflow}px`);
  await shot(page, '11-phone');
  await page.goto(BASE + '/#retire');
  await page.waitForSelector('#ret-cal [aria-current="date"]');
  const pt = await page.locator('#ret-cal [aria-current="date"]').boundingBox();
  const pOver = await page.evaluate(() => document.scrollingElement.scrollWidth - window.innerWidth);
  check('phone: retirement calendar shows today on load, no sideways scroll', pt && pt.y >= 0 && pt.y + pt.height <= 844 && pOver <= 0, `${JSON.stringify(pt)} ${pOver}px`);
  await page.locator('#ret-cal .cal-next').click();
  await page.waitForSelector('#ret-cal [data-cal="2026-11-13"] .pen');
  check('phone: tapping the next-event line jumps to it', /November 2026/.test(await text(page, '#cal-t')));
  await shot(page, '11b-phone-retire');

  check('no console errors, page errors, CSP violations or failed requests', problems.length === 0, problems.slice(0, 8).join(' || '));

  // ---------------------------------------------------------------- loading error and retry (expected 503s in this context)
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p2 = await ctx2.newPage();
  const expected = [];
  watch(p2, expected);
  let fail = true;
  await p2.route('**/api/content/portal.json', route => fail
    ? route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":{"code":"no_view","message":"the portal view has not been built yet"}}' })
    : route.continue());
  await p2.goto(BASE + '/');
  await p2.waitForSelector('[data-act="reload"]');
  check('error state: message and retry', /portal 資料還在準備中/.test(await p2.locator('#app').innerText()));
  await shot(p2, '12-error');
  fail = false;
  await p2.click('[data-act="reload"]');
  await p2.waitForSelector('h1:has-text("雲端模型最新消息")');
  check('error state: retry loads the page', true);
  check('error context: only the simulated 503 was reported', expected.every(x => /503/.test(x)), expected.join(' || '));

  await browser.close();
  console.log(results.join('\n'));
  console.log(failed ? `\n${failed} check(s) failed` : `\nall ${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(results.join('\n')); console.error(e); process.exit(2); });
