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
  return BACKEND_TO_FRONTEND_ROLE[role] || null;
}

const useAuthStore = create((set, get) => ({
  user: (() => {
    const stored = localStorage.getItem('user');
    try {
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed?.role) {
        const normalized = { ...parsed, role: normalizeRole(parsed.role) || parsed.role };
        localStorage.setItem('user', JSON.stringify(normalized));
        return normalized;
      }
      return parsed;
    } catch {
      return null;
    }
  })(),
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoading: false,

  setUser: (user) => {
    if (user?.role) {
      const normalized = { ...user, role: normalizeRole(user.role) || user.role };
      localStorage.setItem('user', JSON.stringify(normalized));
      set({ user: normalized });
    } else {
      localStorage.removeItem('user');
      set({ user: null });
    }
  },

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));

const selectIsAuthenticated = (state) => !!state.accessToken && !!state.user;
const selectUserRole = (state) => state.user?.role;
const selectHasRole = (state, role) => state.user?.role === role;
const selectHasAnyRole = (state, roles) => roles.includes(state.user?.role);

export {
  useAuthStore,
  selectIsAuthenticated,
  selectUserRole,
  selectHasRole,
  selectHasAnyRole,
};
