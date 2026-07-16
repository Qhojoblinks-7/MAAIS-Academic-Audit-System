import { getAuthToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const DEFAULT_TIMEOUT = 15000;
const MAX_RETRIES = 2;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const pendingRequests = new Map();

function dedupeKey(method, path, body) {
  return `${method}:${path}:${JSON.stringify(body ?? null)}`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(method, path, body) {
  const url = `${BASE_URL}${path}`;
  const key = dedupeKey(method, path, body);
  if (method === 'GET' && pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = (async () => {
    let attempt = 0;
    while (true) {
      attempt += 1;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
          },
          credentials: 'include',
          signal: controller.signal,
          ...(body != null && method !== 'GET' && method !== 'HEAD' ? { body: JSON.stringify(body) } : {}),
        });
        clearTimeout(timer);

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
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout: ${method} ${path}`);
        }
        if (attempt >= MAX_RETRIES || !RETRYABLE_STATUS.has(error.status)) {
          throw error;
        }
        await delay(1000 * attempt);
      }
    }
  })().finally(() => {
    if (method === 'GET') pendingRequests.delete(key);
  });

  if (method === 'GET') {
    pendingRequests.set(key, promise);
  }

  return promise;
}

const gradingService = {
  getGradingIds: (subjectName, className) =>
    request('GET', `/teacher/grading/ids?subject=${encodeURIComponent(subjectName)}&class=${encodeURIComponent(className)}`)
      .then(r => r?.data ?? r ?? {}),
  
  getStudentsForGrading: ({ subjectId, classId, termId }) =>
    request('GET', `/grading/students/for-grading?subjectId=${encodeURIComponent(subjectId)}&classId=${encodeURIComponent(classId)}${termId ? `&termId=${encodeURIComponent(termId)}` : ''}`)
      .then(r => {
        const data = r?.data ?? r ?? [];
        return Array.isArray(data) ? data : [];
      }),

  getLastSaved: () =>
    request('GET', '/grading/last-saved')
      .then(r => r?.data ?? r ?? {}),
};

export { gradingService };