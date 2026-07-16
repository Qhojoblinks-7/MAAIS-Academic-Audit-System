const http = require('http');

const HOD_EMAIL = 's.mensah@mandoshts.edu.gh';
const HOD_PASS = 'HOD@2024!';
const TEACHER_EMAIL = 'k.annan@mandoshts.edu.gh';
const TEACHER_PASS = 'Teacher@2024';
const TEACHER_ID = '41509896-bddb-4b88-b380-1a66243fb77f';

function request(relativeUrl, token) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: relativeUrl,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, ms: Date.now() - start, size: Buffer.byteLength(data) });
      });
    });
    req.on('error', (e) => {
      resolve({ status: -1, ms: Date.now() - start, error: e.message });
    });
    req.end();
  });
}

function login(email, password) {
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

(async () => {
  console.log('Logging in...');
  const hod = await login(HOD_EMAIL, HOD_PASS);
  const teacher = await login(TEACHER_EMAIL, TEACHER_PASS);
  console.log(`HOD login: ${hod.ms}ms`);
  console.log(`Teacher login: ${teacher.ms}ms`);

  const endpoints = [
    ['HOD Dept Progress', `/api/v1/hod/department-progress`, hod.token],
    ['HOD Teacher Submissions', `/api/v1/hod/teachers/submissions`, hod.token],
    ['HOD Department Teachers', `/api/v1/hod/teachers`, hod.token],
    ['Teacher Classes', `/api/v1/teacher/classes/${TEACHER_ID}`, teacher.token],
    ['Teacher Analytics', `/api/v1/teacher/classes/${TEACHER_ID}/analytics`, teacher.token],
  ];

  for (const [name, url, token] of endpoints) {
    const results = [];
    for (let i = 0; i < 5; i++) {
      results.push(await request(url, token));
    }
    const ok = results.filter(r => r.status === 200).length;
    const fail = results.filter(r => r.status !== 200).length;
    const avg = Math.round(results.reduce((s, r) => s + r.ms, 0) / results.length);
    console.log(`[${name}] 5 requests: ${ok} OK, ${fail} FAIL, avg=${avg}ms`);
    for (const r of results) {
      if (r.status === 200) {
        console.log(`  -> 200 ${r.ms}ms (${r.size} bytes)`);
      } else {
        console.log(`  -> ${r.status} ${r.ms}ms ${r.error || ''}`);
      }
    }
  }
})().catch(e => { console.error(e); process.exit(1); });
