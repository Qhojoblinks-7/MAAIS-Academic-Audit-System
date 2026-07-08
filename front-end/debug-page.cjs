const { chromium } = require('playwright');
const CHROME = 'C:\\Users\\imman\\AppData\\Local\\ms-playwright\\chromium-1194\\chrome-win\\chrome.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', (m) => console.log('CONSOLE', m.type(), m.text()));
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const has = await page.evaluate(() => ({
    title: document.title,
    hasEmail: !!document.querySelector('input[type=email]'),
    bodyLen: document.body ? document.body.innerText.length : 0,
    snippet: document.body ? document.body.innerText.slice(0, 200) : '',
  }));
  console.log('STATE', JSON.stringify(has, null, 2));
  await browser.close();
})().catch((e) => { console.log('ERR', e.message); });
