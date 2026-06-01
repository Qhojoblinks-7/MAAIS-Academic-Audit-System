/**
 * AuthService — HOD-layer authentication plumbing (JS variant).
 *
 * Answers three questions:
 *  1. Who is the current user?     → getCurrentUser()
 *  2. Is the session valid?         → isAuthenticated()
 *  3. Does the user hold the HOD role? → verifyHODRole()
 */

class AuthService {
  /**
   * Decodes the JWT payload of the current session
   * and checks whether the embedded role is HOD.
   * @returns {{ ok: boolean, role: string|null, user: Object|null }}
   */
  verifyHODRole() {
    try {
      const token = this.getAuthToken();
      if (!token) return { ok: false, role: null, user: null };

      const payload = JSON.parse(atob(token.split('.')[1] || '')) || {};
      // Hasura-style custom claims may use x_hasura_* snake_case
      // or x-hasura-* kebab-case depending on the emitter.
      const claims = payload['https://hasura.io/jwt/claims'] || {};
      const hasRole =
        claims['x-hasura-default-role'] ||
        claims.x_hasura_default_role ||
        payload.role;

      const isHOD = ['HOD', 'hod'].includes(String(hasRole).toUpperCase());
      return { ok: isHOD, role: hasRole || null, user: payload };
    } catch (_e) {
      return { ok: false, role: null, user: null };
    }
  }

  /**
   * Returns true when a JWT token is present in browser storage.
   */
  isAuthenticated() {
    try {
      return !!localStorage.getItem('auth_token') || !!localStorage.getItem('token');
    } catch {
      return false;
    }
  }

  /**
   * Returns the raw JWT payload of the logged-in user (no network call).
   */
  getCurrentUser() {
    try {
      const token = this.getAuthToken();
      if (!token) return null;
      return JSON.parse(atob(token.split('.')[1] || '')) || null;
    } catch {
      return null;
    }
  }

  /**
   * Requests browser notification permission for HOD alert signals.
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.requestPermission();
  }

  // ── internal ────────────────────────────────────────────────────────────────
  getAuthToken() {
    try {
      return localStorage.getItem('auth_token') || localStorage.getItem('token') || null;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
export { AuthService };
