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
    let errorBody;
    try {
      errorBody = await res.clone().json();
    } catch {
      errorBody = await res.text();
    }
    const freezeReason = errorBody?.freezeReason;
    const baseMessage = errorBody?.message || errorBody?.error || `Request failed: ${res.status} ${method} ${path}`;
    const err = new Error(freezeReason ? `${baseMessage} — ${freezeReason}` : baseMessage);
    err.status = res.status;
    err.response = errorBody;
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
            type: 'student',
          }));
        }),
    createMedicalRecord: (studentId, data) =>
      request('POST', `/students/${studentId}/medical-records`, data).then(r => r?.data ?? r),
    updateMedicalRecord: (studentId, recordId, data) =>
      request('PATCH', `/students/${studentId}/medical-records/${recordId}`, data).then(r => r?.data ?? r),
    deleteMedicalRecord: (studentId, recordId) =>
      request('DELETE', `/students/${studentId}/medical-records/${recordId}`).then(r => r?.data ?? r),
  };
}

export const studentService = createRealService();