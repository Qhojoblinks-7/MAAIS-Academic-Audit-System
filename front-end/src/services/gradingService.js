import { getAuthToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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

const gradingService = {
  getGradingIds: (subjectName, className) =>
    request('GET', `/teacher/grading/ids?subject=${encodeURIComponent(subjectName)}&class=${encodeURIComponent(className)}`)
      .then(r => r?.data ?? r ?? {}),
  
  getStudentsForGrading: ({ subjectId, classId, termId }) =>
    request('GET', `/grading/students/for-grading?subjectId=${encodeURIComponent(subjectId)}&classId=${encodeURIComponent(classId)}${termId ? `&termId=${encodeURIComponent(termId)}` : ''}`)
      .then(r => r?.data ?? r ?? []),
};

export { gradingService };