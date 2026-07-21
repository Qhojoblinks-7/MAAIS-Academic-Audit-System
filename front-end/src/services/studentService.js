import { api } from '../lib/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function request(method, path, body) {
  const endpoint = `${BASE_URL}${path}`;
  const key = { GET: 'get', POST: 'post', PUT: 'put', PATCH: 'patch', DELETE: 'delete' }[method] || 'get';
  try {
    const opts = key === 'get' ? {} : { body: JSON.stringify(body) };
    const res = await api[key](endpoint, opts);
    return res;
  } catch (err) {
    const errorBody = err.response || {};
    const freezeReason = errorBody?.freezeReason;
    const baseMessage = errorBody?.message || errorBody?.error || err.message || `Request failed: ${err.status || '?'} ${method} ${path}`;
    const wrapped = new Error(freezeReason ? `${baseMessage} — ${freezeReason}` : baseMessage);
    wrapped.status = err.status;
    wrapped.response = errorBody;
    throw wrapped;
  }
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
