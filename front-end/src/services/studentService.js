import { getAuthToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

function getHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: getHeaders(),
    credentials: 'include',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = new Error(`Request failed: ${res.status} ${method} ${path}`);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return undefined;
  return res.json();
}

function createRealService() {
  return {
    getPortalData: (studentId) =>
      request('GET', `/portal/students/${studentId}/portal-data`)
        .then(r => r?.data ?? r),
    searchStudents: (query) =>
      request('GET', `/users/students${query ? `?search=${encodeURIComponent(query)}` : ''}`)
        .then((res) => {
          const data = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          return data.map((s) => ({
            id: s.id,
            name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.indexNumber || s.id,
            classForm: s.currentClass?.name || '—',
            indexNumber: s.indexNumber || '—',
          }));
        }),
  };
}

export const studentService = createRealService();