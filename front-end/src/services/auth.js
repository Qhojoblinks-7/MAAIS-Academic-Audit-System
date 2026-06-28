const TOKEN_KEY = 'auth_token';

export function getAuthToken() {
  // Check both keys for backward compatibility
  return (
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem('accessToken') ||
    (typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem(TOKEN_KEY) || sessionStorage.getItem('accessToken')
      : null)
  );
}

export function setAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem('accessToken', token);
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem('accessToken', token);
  }
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}
