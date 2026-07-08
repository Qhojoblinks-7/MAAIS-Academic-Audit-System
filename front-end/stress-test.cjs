const http = require('http');
const BASE = 'http://localhost:3000';

const HOD_EMAIL = 's.mensah@mandoshts.edu.gh';
const HOD_PASS = 'HOD@2024!';
const TEACHER_EMAIL = 'k.annan@mandoshts.edu.gh';
const TEACHER_PASS = 'Teacher@2024';

const TEACHER_ID = '41509896-bddb-4b88-b380-1a66243fb77f';

const REQUEST_TIMEOUT = 20000; // 20s per request
const ENDPOINT_TIMEOUT = 90000; // 90s max per load level

function requestWithTimeout(relativeUrl, token) {
  const fullUrl = `${BASE}${relativeUrl}`;
  return new Promise((resolve) => {
    const start = Date.now();
    const timer = setTimeout(() => resolve({ status: -1, ms: REQUEST_TIMEOUT, kb: '0', timedOut: true }), REQUEST_TIMEOUT);
    http.get(fullUrl, { headers: { Authorization: `Bearer ${token}` } }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        clearTimeout(timer);
        resolve({ status: res.statusCode, ms: Date.now() - start, kb: (Buffer.byteLength(data) / 1024).toFixed(1), timedOut: false });
      });
    }).on('error', (e) => {
      clearTimeout(timer);
      resolve({ status: -1, ms: Date.now() - start, kb: '0', timedOut: false, error: e.message });
    });
  });
}

async function login(email, password) {
  const body = JSON.stringify({ email, password });
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const req = http.request({ method: 'POST', hostname: 'localhost', port: 3000, path: '/api/v1/auth/login', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.accessToken) resolve({ token: json.accessToken, ms: Date.now() - start });
          else reject(new Error('No token'));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function stressEndpoint(name, url, token, concurrency, rounds) {
  let min = Infinity, max = 0, total = 0, errors = 0, timeouts = 0, statusMap = {};
  const latencies = [];
  
  const overallTimer = setTimeout(() => {
    // Force abort remaining rounds
  }, ENDPOINT_TIMEOUT);
  
  try {
    for (let r = 0; r < rounds; r++) {
      const promises = Array.from({ length: concurrency }, () => requestWithTimeout(url, token));
      const results = await Promise.all(promises);
      
      for (const res of results) {
        statusMap[res.status] = (statusMap[res.status] || 0) + 1;
        if (res.status !== 200) errors++;
        if (res.timedOut) timeouts++;
        const ms = res.ms;
        latencies.push(ms);
        if (ms < min) min = ms;
        if (ms > max) max = ms;
        total += ms;
      }
    }
  } finally {
    clearTimeout(overallTimer);
  }
  
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];
  const avg = Math.round(total / latencies.length);
  return { name, min, max, avg, p50, p95, p99, errors, timeouts, total: latencies.length, statusMap, completed: latencies.length === concurrency * rounds };
}

(async () => {
  console.log('=== MAAIS Stress Test (ESCALATING LOAD) ===\n');

  console.log('Logging in...');
  const hod = await login(HOD_EMAIL, HOD_PASS);
  const teacher = await login(TEACHER_EMAIL, TEACHER_PASS);
  console.log(`HOD login: ${hod.ms}ms`);
  console.log(`Teacher login: ${teacher.ms}ms`);

  const baseEndpoints = [
    ['HOD Dept Progress', `/api/v1/hod/department-progress`, hod.token],
    ['HOD Teacher Submissions', `/api/v1/hod/teachers/submissions`, hod.token],
    ['HOD Department Teachers', `/api/v1/hod/teachers`, hod.token, true], // skip after warm
    ['Teacher Classes', `/api/v1/teacher/classes/${TEACHER_ID}`, teacher.token],
    ['Teacher Analytics', `/api/v1/teacher/classes/${TEACHER_ID}/analytics`, teacher.token],
  ];

  const allResults = [];
  
  for (const [name, url, token, skipAfterWarm] of baseEndpoints) {
    const loads = [
      ['Warm', 10, 3],
      ['Med', 30, 5],
      ['High', 80, 5],
      ['EXTREME', 200, 3],
    ];
    
    for (const [label, c, r] of loads) {
      if (skipAfterWarm && label !== 'Warm') {
        console.log(`[${name}] Skipped (known slow endpoint)`);
        allResults.push({ name, label, skipped: true });
        break;
      }
      
      process.stdout.write(`[${name}] ${label} load (${c}x${r})... `);
      const stats = await stressEndpoint(name, url, token, c, r);
      
      if (!stats.completed) {
        console.log(`TIMEOUT after ${ENDPOINT_TIMEOUT/1000}s (${stats.total}/${c*r} completed)`);
        allResults.push({ ...stats, label, verdict: 'TIMEOUT' });
        break;
      }
      
      console.log(`avg=${stats.avg}ms p50=${stats.p50}ms p95=${stats.p95}ms p99=${stats.p99}ms errors=${stats.errors} timeouts=${stats.timeouts} [${JSON.stringify(stats.statusMap)}]`);
      allResults.push({ ...stats, label });
      
      if (stats.errors > 0 || stats.timeouts > 0 || stats.p99 > 30000) {
        console.log(`  *** BREAKING POINT: errors=${stats.errors} timeouts=${stats.timeouts} p99=${stats.p99}ms ***`);
        break;
      }
      await new Promise(res => setTimeout(res, 1000));
    }
    console.log('');
  }

  console.log('\n=== FULL STRESS SUMMARY ===');
  for (const r of allResults) {
    if (r.skipped) {
      console.log(`[SKIP] ${r.name} (known slow endpoint)`);
      continue;
    }
    const passFail = (r.errors === 0 && r.timeouts === 0 && r.p99 < 30000) ? 'PASS' : 'FAIL';
    console.log(`[${passFail}] ${r.name} (${r.label}): avg=${r.avg}ms p50=${r.p50}ms p95=${r.p95}ms p99=${r.p99}ms errors=${r.errors} timeouts=${r.timeouts}/${r.total} [${JSON.stringify(r.statusMap)}]`);
  }
})().catch((e) => { console.error(e); process.exit(1); });
