import { getAuthToken } from './auth';
import mockStudentService from './mockStudentService';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_MOCK = !BASE_URL || import.meta.env.VITE_USE_MOCK_API === 'true';

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
    getPortalData: (studentId, params = {}) =>
      request('GET', `/api/student/portal/${studentId}`, params ? { params } : undefined)
        .then(r => r?.data ?? r),
    getStudentByIndex: (indexNumber) =>
      request('GET', `/api/student/index/${indexNumber}`).then(r => r?.data ?? r),
    getStudentByIndexOrId: (identifier) =>
      request('GET', `/api/student/lookup/${identifier}`).then(r => r?.data ?? r),
    getStudentAcademicHistory: (studentId) =>
      request('GET', `/api/student/${studentId}/academic-history`).then(r => r?.data ?? r),
    getNotifications: (studentId) =>
      request('GET', `/api/student/${studentId}/notifications`).then(r => r?.data ?? r),
    getTerminalResults: (studentId) =>
      request('GET', `/api/student/${studentId}/terminal-results`).then(r => r?.data ?? r),
    getAcademicHistory: (studentId) =>
      request('GET', `/api/student/${studentId}/history`).then(r => r?.data ?? r),
    getAllPortalStudents: () =>
      request('GET', '/api/student/portal').then(r => r?.data ?? r),
  };
}

export const studentService = USE_MOCK ? mockStudentService : createRealService();