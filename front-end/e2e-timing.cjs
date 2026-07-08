const { chromium } = require('playwright');

const CHROME =
  'C:\\Users\\imman\\AppData\\Local\\ms-playwright\\chromium-1194\\chrome-win\\chrome.exe';
const BASE = 'http://127.0.0.1:4173';
const API = 'http://localhost:3000/api/v1';

const HOD = { email: 's.mensah@mandoshts.edu.gh', password: 'HOD@2024!' };
const TEACHER = { email: 'k.annan@mandoshts.edu.gh', password: 'Teacher@2024' };
const TEACHER_STAFF_ID = '41509896-bddb-4b88-b380-1a66243fb77f';

const ENDPOINTS = {
  HOD: [
    ['Dept Progress', '/hod/department-progress'],
    ['Teacher Submissions', '/hod/teachers/submissions'],
    ['Department Teachers', '/hod/teachers'],
  ],
  TEACHER: [
    ['Teacher Classes', `/teacher/classes/${TEACHER_STAFF_ID}`],
    ['Teacher Analytics', `/teacher/analytics/${TEACHER_STAFF_ID}`],
  ],
};

async function login(page, creds) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.click('body', { timeout: 10000 }).catch(() => {});
  await page.waitForSelector('input[type=email]', { timeout: 15000 });
  await page.fill('input[type=email]', creds.email);
  await page.fill('input[type=password]', creds.password);
  const t0 = Date.now();
  await page.click('button[type=submit]');
  await page.waitForLoadState('networkidle', { timeout: 30000 });
  await page.waitForSelector('text=Dashboard', { timeout: 30000 }).catch(() => {});
  return Date.now() - t0;
}

async function fetchEndpoint(page, ep) {
  return page.evaluate(async (apiEp) => {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('auth_token');
    const t0 = performance.now();
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 15000);
    let status = 0;
    let kb = '0';
    try {
      const r = await fetch(apiEp, {
        headers: { Authorization: `Bearer ${token}` },
        signal: ctrl.signal,
      });
      status = r.status;
      const txt = await r.text();
      kb = (txt.length / 1024).toFixed(1);
    } catch (e) {
      status = -1;
    } finally {
      clearTimeout(to);
    }
    const ms = Math.round(performance.now() - t0);
    return { ms, status, kb };
  }, `${API}${ep}`);
}

async function runRole(name, creds, endpoints) {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const loginMs = await login(await context.newPage(), creds);
  // eslint-disable-next-line no-console
  console.log(`\n[${name}] LOGIN\u2192DASHBOARD: ${loginMs}ms`);

  for (const [label, ep] of endpoints) {
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    const r = await fetchEndpoint(page, ep);
    await page.close();
    const flag = r.ms <= 5000 ? (r.ms >= 2000 ? 'WARN' : 'OK  ') : 'SLOW';
    // eslint-disable-next-line no-console
    console.log(
      `${flag} | ${name} ${label.padEnd(20)} ${String(r.ms).padStart(5)}ms | HTTP ${r.status} | ${r.kb}kb`,
    );
  }
  await browser.close();
}

(async () => {
  // eslint-disable-next-line no-console
  console.log('=== MAAIS Frontend \u2192 Backend Response Test (browser fetch, target 2\u20135s) ===');
  await runRole('HOD', HOD, ENDPOINTS.HOD);
  await runRole('TEACHER', TEACHER, ENDPOINTS.TEACHER);
  // eslint-disable-next-line no-console
  console.log('\nDone.');
})().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
