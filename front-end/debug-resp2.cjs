const { chromium } = require('playwright');
const CHROME =
  'C:\\Users\\imman\\AppData\\Local\\ms-playwright\\chromium-1194\\chrome-win\\chrome.exe';

const COLD_INIT = () => {
  try {
    indexedDB
      .databases()
      .then((dbs) =>
        Promise.all(
          dbs.map(
            (d) =>
              new Promise((res) => {
                const req = indexedDB.deleteDatabase(d.name);
                req.onsuccess = req.onerror = () => res();
              }),
          ),
        ),
      )
      .catch(() => {});
  } catch (e) {}
};

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  context.addInitScript(COLD_INIT);
  const page = await context.newPage();
  const all = [];
  page.on('response', (r) => {
    all.push(r.url());
  });
  await page.goto('http://127.0.0.1:4173/login', { waitUntil: 'domcontentloaded' });
  await page.click('body', { timeout: 10000 }).catch(() => {});
  await page.waitForSelector('input[type=email]', { timeout: 15000 });
  await page.fill('input[type=email]', 's.mensah@mandoshts.edu.gh');
  await page.fill('input[type=password]', 'HOD@2024!');
  await page.click('button[type=submit]');
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  // now go to dept progress cold
  await page.goto('http://127.0.0.1:4173/hod', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  await page.waitForTimeout(500);
  console.log('TOTAL RESPONSES:', all.length);
  const api = all.filter((u) => u.includes('/api/v1'));
  console.log('API/v1 COUNT:', api.length);
  console.log(api.join('\n'));
  await browser.close();
})().catch((e) => console.log('ERR', e.message));
