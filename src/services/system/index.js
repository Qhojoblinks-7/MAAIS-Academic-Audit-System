/**
 * System layer barrel export — src/services/system (JS variant)
 *
 * Import all plumbing services from a single stable entry point:
 *
 *   import { authService, PermissionMiddleware, apiClient, errorHandler } from '#services/system';
 */

export { AuthService, authService } from './AuthService';
export { PermissionMiddleware } from './PermissionMiddleware';
export { APIClient, apiClient } from './APIClient';
export { ErrorHandler, errorHandler } from './ErrorHandler';
