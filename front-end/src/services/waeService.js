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
    const err = new Error(`Request failed: ${res.status} ${method} ${path}`);
    err.status = res.status;
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