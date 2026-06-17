const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const HttpMethod = {
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
 */

/**
 * @template T
 * @param {string} endpoint
 * @param {RequestOptions<T>} [options]
 * @returns {Promise<T>}
 */
async function request(endpoint, options = {}) {
  const accessToken = localStorage.getItem('accessToken');
  let refreshToken = localStorage.getItem('refreshToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  let response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body != null ? JSON.stringify(options.body) : undefined,
    credentials: 'omit',
  });

  if (response.status === 401 && refreshToken) {
    const refreshed = await attemptRefresh(refreshToken);
    if (refreshed) {
      headers['Authorization'] = `Bearer ${refreshed.accessToken}`;
      localStorage.setItem('accessToken', refreshed.accessToken);
      localStorage.setItem('refreshToken', refreshed.refreshToken);

      response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body != null ? JSON.stringify(options.body) : undefined,
        credentials: 'omit',
      });
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.dispatchEvent(new Event('auth:logout'));
    }
  }

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

/**
 * @param {string} refreshToken
 * @returns {Promise<{accessToken: string, refreshToken: string} | null>}
 */
async function attemptRefresh(refreshToken) {
  try {
    const userId = localStorage.getItem('userId');
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, refreshToken }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken || refreshToken,
    };
  } catch {
    return null;
  }
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
