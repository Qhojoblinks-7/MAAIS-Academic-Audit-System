/**
 * APIClient — thin fetch wrapper used by every service in the system layer (JS variant).
 *
 * Handles:
 *  - request headers (JWT token)
 *  - environment-driven base URL
 *  - structured error objects with .status
 *  - JSON responses
 *  - Blob responses for file downloads
 */

import { getAuthToken } from '../auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

function getHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parse(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : undefined;
  } catch {
    return text;
  }
}

export class APIClient {
  constructor(baseURL) {
    this.base = baseURL || BASE_URL;
  }

  async request(method, path, body, init) {
    const res = await fetch(`${this.base}${path}`, {
      method,
      headers: { ...getHeaders(), ...(init?.headers || {}) },
      credentials: 'include',
      ...(body ? { body: JSON.stringify(body) } : {}),
      ...init,
    });

    if (!res.ok) {
      const err = new Error(`Request failed: ${res.status} ${method} ${path}`);
      err.status = res.status;
      throw err;
    }

    if (res.status === 204) return undefined;
    return res.json();
  }

  get(path, params) {
    const qs = params
      ? `?${new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))}`
      : '';
    return this.request('GET', `${path}${qs}`);
  }

  post(path, body) {
    return this.request('POST', path, body);
  }

  patch(path, body) {
    return this.request('PATCH', path, body);
  }

  put(path, body) {
    return this.request('PUT', path, body);
  }

  delete(path) {
    return this.request('DELETE', path);
  }

  /**
   * Download a binary response (CSV, PDF, etc.). Returns the Blob.
   */
  async download(path, filename) {
    const token = getAuthToken();
    const res = await fetch(`${this.base}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    });
    if (!res.ok) {
      const err = new Error(`Download failed: ${res.status} ${path}`);
      err.status = res.status;
      throw err;
    }
    const blob = await res.blob();

    // Auto-trigger a browser download
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);

    return blob;
  }
}

/** Shared singleton instance used throughout the app. */
export const apiClient = new APIClient();
