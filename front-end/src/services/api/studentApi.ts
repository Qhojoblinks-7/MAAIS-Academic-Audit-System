import { getAuthToken } from '../auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const DEFAULT_TIMEOUT = 15000;
const MAX_RETRIES = 2;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const pendingRequests = new Map();

function getHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

interface RequestError extends Error {
  status?: number;
}

function dedupeKey(method: string, path: string, body: unknown) {
  return `${method}:${path}:${JSON.stringify(body ?? null)}`;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(method: string, path: string, body?: unknown) {
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
          headers: getHeaders(),
          credentials: 'include',
          signal: controller.signal,
          ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        });
        clearTimeout(timer);

        if (!res.ok) {
          let errorMessage = `Request failed: ${res.status} ${method} ${path}`;
          try {
            const errorBody = await res.clone().json();
            const freezeReason = (errorBody as any)?.freezeReason;
            const baseMessage = (errorBody as any)?.message || (errorBody as any)?.error || errorMessage;
            errorMessage = freezeReason ? `${baseMessage} — ${freezeReason}` : baseMessage;
          } catch {
            const errorText = await res.text();
            if (errorText.includes('<!doctype') || errorText.includes('<html')) {
              errorMessage = `API endpoint not found (${res.status})`;
            }
          }
          const err: RequestError = new Error(errorMessage);
          err.status = res.status;
          throw err;
        }

        const contentType = res.headers.get('content-type') || '';
        if (res.status === 204) return undefined;
        if (!contentType.includes('application/json')) {
          throw new Error('Invalid response: expected JSON');
        }
        return res.json();
      } catch (error) {
        if ((error as any)?.name === 'AbortError') {
          throw new Error(`Request timeout: ${method} ${path}`);
        }
        if (attempt >= MAX_RETRIES || !RETRYABLE_STATUS.has((error as RequestError).status as number)) {
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

export const studentApi = {
  getPortalData: (studentId: string) =>
    request('GET', `/portal/students/${studentId}/portal-data`),

  getStudentGrades: (studentId: string, termId: string) =>
    request('GET', `/grading/students/${studentId}/terms/${termId}`),

  createTicket: (data: unknown) =>
    request('POST', `/comms/tickets`, data),

  getMyTickets: () =>
    request('GET', `/comms/tickets/my`),

  getNotifications: (studentId: string) =>
    request('GET', `/comms/notifications/${studentId}`),

  markNotificationRead: (notificationId: string) =>
    request('PATCH', `/comms/notifications/${notificationId}/read`),

  getBehavior: (studentId: string) =>
    request('GET', `/students/${studentId}/behavior`),

  getInterventions: (studentId: string) =>
    request('GET', `/students/${studentId}/interventions`),

  getClassTimetable: (classId: string) =>
    request('GET', `/timetable/class/${classId}`),
};

export default studentApi;