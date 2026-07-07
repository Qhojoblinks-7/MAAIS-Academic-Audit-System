import { getAuthToken } from '../../services/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// ── Resilience configuration (offline-first) ──────────────────────────────────
const DEFAULT_TIMEOUT = 30000; // 30s hard timeout per request
const MAX_RETRIES = 3; // Retry failed requests on transient/network errors
const RETRY_BASE_DELAY = 1000; // Exponential backoff base (1s)
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

/**
 * Tracks in-flight GET requests so simultaneous duplicate calls share one promise.
 * @type {Map<string, Promise<unknown>>}
 */
const pendingRequests = new Map();

function dedupeKey(endpoint, options) {
  return `${options.method || 'GET'}:${endpoint}:${JSON.stringify(options.body ?? null)}:${JSON.stringify(options.params ?? null)}`;
}

function retryDelay(attempt) {
  return Math.min(RETRY_BASE_DELAY * 2 ** (attempt - 1), 30000);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function enhanceNetworkError(error, url) {
  if (error?.name === 'AbortError') {
    const err = new Error('Request timeout — network may be unavailable');
    err.status = 0;
    err.isTimeout = true;
    return err;
  }
  const err = new Error(error?.message || `Network error reaching ${url}`);
  err.status = 0;
  err.isNetworkError = true;
  return err;
}

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

async function fetchWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Unified response serialization for a completed fetch Response.
 * @param {Response} response
 * @returns {Promise<any>}
 */
async function finalize(response) {
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

function handleSessionExpired() {
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
  if (window.location.pathname !== '/401' && window.location.pathname !== '/login') {
    window.location.href = '/401';
  }
}

/**
 * Core Request Wrapper Layer with timeout + exponential retry + 401 refresh.
 * @template T
 * @param {string} endpoint
 * @param {RequestOptions<T>} [options]
 * @returns {Promise<T>}
 */
async function executeRequest(endpoint, options = {}) {
  const method = options.method || 'GET';

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const accessToken = getAuthToken();
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
  const timeoutMs = options.timeout ?? DEFAULT_TIMEOUT;
  const maxRetries = options.retries ?? MAX_RETRIES;

  let attempt = 0;
  let didRefresh = false;

  while (true) {
    let response;
    try {
      response = await fetchWithTimeout(url, {
        method,
        headers,
        body: options.body != null ? JSON.stringify(options.body) : undefined,
        credentials: 'omit',
      }, timeoutMs);
    } catch (error) {
      // Network failure or timeout — retry with backoff
      attempt += 1;
      if (attempt > maxRetries) {
        throw enhanceNetworkError(error, url);
      }
      await delay(retryDelay(attempt));
      continue;
    }

    if (response.status === 401 && !didRefresh) {
      const refreshed = await getRefreshTokenLock();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${refreshed.accessToken}`;
        didRefresh = true;
        continue;
      }
      handleSessionExpired();
      return finalize(response);
    }

    if (response.status === 401 && didRefresh) {
      handleSessionExpired();
      return finalize(response);
    }

    // Retry on transient server/rate-limit errors
    if (RETRYABLE_STATUS.has(response.status) && attempt < maxRetries) {
      attempt += 1;
      await delay(retryDelay(attempt));
      continue;
    }

    return finalize(response);
  }
}

/**
 * Public request entry point. Deduplicates concurrent GET requests.
 * @template T
 * @param {string} endpoint
 * @param {RequestOptions<T>} [options]
 * @returns {Promise<T>}
 */
async function request(endpoint, options = {}) {
  const method = options.method || 'GET';

  if (method === 'GET') {
    const key = dedupeKey(endpoint, options);
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key);
    }
    const promise = executeRequest(endpoint, options).finally(() => {
      pendingRequests.delete(key);
    });
    pendingRequests.set(key, promise);
    return promise;
  }

  return executeRequest(endpoint, options);
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;