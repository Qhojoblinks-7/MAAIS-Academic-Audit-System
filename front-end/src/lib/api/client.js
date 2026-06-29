import { getAuthToken } from '../../services/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
};

/**
 * @template T
 * @typedef {Object} RequestOptions
 * @property {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} [method]
 * @property {*} [body]
 * @property {Object<string, string>} [headers]
 * @property {Object<string, any>} [params]
 */

// Global state variables for handling concurrent token refreshes
let activeRefreshPromise = null;

/**
 * Centrally handles the token refresh sequence, locking out overlapping queries.
 * @returns {Promise<{accessToken: string, refreshToken: string} | null>}
 */
async function getRefreshTokenLock() {
  // If an exchange is already running, return the active instance promise
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const userId = localStorage.getItem('userId');
      
      if (!refreshToken) return null;

      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, refreshToken }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      
      const payload = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || refreshToken,
      };

      // Atomic commit to storage layers
      localStorage.setItem('auth_token', payload.accessToken);
      localStorage.setItem('accessToken', payload.accessToken);
      localStorage.setItem('refreshToken', payload.refreshToken);
      localStorage.setItem('userId', userId);
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('auth_token', payload.accessToken);
        sessionStorage.setItem('accessToken', payload.accessToken);
        sessionStorage.setItem('refreshToken', payload.refreshToken);
        sessionStorage.setItem('userId', userId);
      }

      return payload;
    } catch {
      return null;
    } finally {
      // Release lock block immediately following resolution
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
}

/**
 * Core Request Wrapper Layer
 * @template T
 * @param {string} endpoint
 * @param {RequestOptions<T>} [options]
 * @returns {Promise<T>}
 */
async function request(endpoint, options = {}) {
  let accessToken = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const queryString = options.params
    ? `?${new URLSearchParams(
        Object.entries(options.params)
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => [k, String(v)]),
      ).toString()}`
    : '';

  const url = new URL(`${API_BASE_URL}${endpoint}${queryString}`, window.location.origin).toString();
  
  let response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body != null ? JSON.stringify(options.body) : undefined,
    credentials: 'omit',
  });

  // ── Token Refresh Orchestration Barrier ──────────────────────────────────
  if (response.status === 401) {
    const refreshed = await getRefreshTokenLock();
    
    if (refreshed) {
      // Re-apply fresh signature authorization details 
      headers['Authorization'] = `Bearer ${refreshed.accessToken}`;

      response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body != null ? JSON.stringify(options.body) : undefined,
        credentials: 'omit',
      });
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('userId');
      }
      window.dispatchEvent(new Event('auth:logout'));
    }
  }

  // ── Unified Response Serialization ───────────────────────────────────────
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    if (!response.ok) {
      const text = await response.text();
      const error = new Error(text || `HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return {};
  }

  const data = await response.json();

  if (!response.ok) {
    const message = data?.message || data?.error || `HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.response = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;