/**
 * PermissionMiddleware — route / action authorisation guard (JS variant).
 *
 * Enforces role-based access control for every HOD API surface.
 * Called once per route entry and again before any mutation action.
 *
 * Used by:
 *  - React Router route wrappers (RequireRole component)
 *  - Context action callback guards
 *  - Any mutation in the service layer
 */

import { authService } from './AuthService';

class PermissionMiddlewareImpl {
  /**
   * true when the current session holds at least one role in `allowedRoles`.
   */
  hasRole(allowedRoles) {
    const { role } = authService.verifyHODRole();
    if (!role) return false;
    return allowedRoles.some(
      (r) => r.toUpperCase() === String(role).toUpperCase(),
    );
  }

  /**
   * Pre-authorisation hook.
   * Returns true when the session is permitted; writes a dev warning if not.
   */
  authorize(allowedRoles) {
    const { ok, role } = authService.verifyHODRole();
    if (!ok) {
      console.warn(
        '[PermissionMiddleware] Access denied — resolved role:',
        role,
      );
      return false;
    }
    return true;
  }

  /**
   * Short-circuit: true when the current browser tab carries a session token.
   */
  isAuthenticated() {
    return authService.isAuthenticated();
  }
}

export const PermissionMiddleware = new PermissionMiddlewareImpl();
