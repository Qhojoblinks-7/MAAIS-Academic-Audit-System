const TOKEN_KEY = 'auth_token';
const TOKEN_HEADER_KEYS = ['Authorization', 'authorization'];

export function getAuthToken() {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    // support "Authorization: Bearer …" slipped into sessionStorage
    (typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem(TOKEN_KEY)
      : null)
  );
}

export function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}
