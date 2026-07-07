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
    ...(body !== undefined && method !== 'GET' && method !== 'HEAD' ? { body: JSON.stringify(body) } : {}),
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

const waeExportService = {
  previewCSV: (termId, className) =>
    request('GET', `/wae/preview/${termId}${className ? `?className=${encodeURIComponent(className)}` : ''}`)
      .then(r => r?.data ?? r ?? {}),

  prepareForWAEP: (termId) =>
    request('POST', `/wae/prepare/${termId}`)
      .then(r => r?.data ?? r ?? {}),
};

export { waeExportService };