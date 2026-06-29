import { create } from 'zustand';
import { ROLES } from '../types';

const BACKEND_TO_FRONTEND_ROLE = {
  SUPER_ADMIN: ROLES.ADMIN,
  HEADMASTER: ROLES.ADMIN,
  HOD: ROLES.HOD,
  TEACHER: ROLES.TEACHER,
  STUDENT: ROLES.STUDENT,
  PARENT: null,
};

function normalizeRole(role) {
  return BACKEND_TO_FRONTEND_ROLE[role] || role || null;
}

// Helper to safely parse initial data without triggering structural localstorage side effects
const getInitialUser = () => {
  if (typeof window === 'undefined') return null; // Safe guard for SSR environments
  const stored = localStorage.getItem('user');
  try {
    const parsed = stored ? JSON.parse(stored) : null;
    if (parsed?.role) {
      return { ...parsed, role: normalizeRole(parsed.role) };
    }
    return parsed;
  } catch {
    return null;
  }
};

const useAuthStore = create((set) => ({
  user: getInitialUser(),
  accessToken: typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  isLoading: false,

  setUser: (user) => {
    if (user?.role) {
      const normalized = { ...user, role: normalizeRole(user.role) };
      localStorage.setItem('user', JSON.stringify(normalized));
      set({ user: normalized });
    } else {
      localStorage.removeItem('user');
      set({ user: null });
    }
  },

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('user');
    }
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));

// ── Curried & Flat Selectors ─────────────────────────────────────────────────
const selectIsAuthenticated = (state) => !!state.accessToken && !!state.user;
const selectUserRole = (state) => state.user?.role;

// FIX: Dynamic parameters must return an inner selector callback function 
const selectHasRole = (role) => (state) => state.user?.role === role;
const selectHasAnyRole = (roles) => (state) => roles.includes(state.user?.role);

export {
  useAuthStore,
  selectIsAuthenticated,
  selectUserRole,
  selectHasRole,
  selectHasAnyRole,
};