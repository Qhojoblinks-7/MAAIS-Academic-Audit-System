const API_BASE = 'http://localhost:3000/api/v1';

async function main() {
  // Login as admin first to get token
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@mandoshts.edu.gh', password: 'Admin@2024!' }),
  });

  if (!loginRes.ok) {
    console.log('Login failed:', loginRes.status, await loginRes.text());
    return;
  }

  const loginData = await loginRes.json();
  const token = loginData.accessToken;
  console.log('Login successful, token obtained');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Test the KPI endpoints
  const endpoints = [
    '/users/students/count',
    '/users/staff/count',
    '/comms/notifications/unread',
    '/comms/tickets',
    '/archive/stats',
    '/academic/departments',
    '/academic/subjects',
    '/academic/classes',
    '/academic/years/active',
    '/academic/years',
    '/approvals',
    '/comms/analytics/pulse',
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { headers });
      const text = await res.text();
      let data = text;
      try { data = JSON.parse(text); } catch {}
      console.log(`${endpoint}: ${res.status} -> ${typeof data === 'object' ? JSON.stringify(data).slice(0, 100) : data}`);
    } catch (e) {
      console.log(`${endpoint}: error - ${e.message}`);
    }
  }
}

main().catch(e => console.error(e));
