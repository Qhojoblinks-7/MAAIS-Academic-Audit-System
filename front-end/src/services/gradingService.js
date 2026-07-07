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

const gradingService = {
  getGradingIds: (subjectName, className) =>
    request('GET', `/teacher/grading/ids?subject=${encodeURIComponent(subjectName)}&class=${encodeURIComponent(className)}`)
      .then(r => r?.data ?? r ?? {}),
  
  getStudentsForGrading: ({ subjectId, classId, termId }) =>
    request('GET', `/grading/students/for-grading?subjectId=${encodeURIComponent(subjectId)}&classId=${encodeURIComponent(classId)}${termId ? `&termId=${encodeURIComponent(termId)}` : ''}`)
      .then(r => {
        const data = r?.data ?? r ?? [];
        console.log('[gradingService] getStudentsForGrading returned:', Array.isArray(data) ? data.length : 'non-array', 'students for', { subjectId, classId, termId });
        return Array.isArray(data) ? data : [];
      }),

  getLastSaved: () =>
    request('GET', '/grading/last-saved')
      .then(r => r?.data ?? r ?? {}),
};

export { gradingService };