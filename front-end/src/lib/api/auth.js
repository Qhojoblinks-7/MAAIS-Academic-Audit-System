import { api } from './client';

export const authApi = {
  login: async (dto) => api.post('/auth/login', dto),

  refresh: async (refreshToken, userId) => api.post('/auth/refresh', { refreshToken, userId }),

  logout: async (refreshToken) => api.post('/auth/logout', { refreshToken }),

  changePassword: async (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),

  getCurrentUser: async () => api.get('/auth/me'),
};

export default authApi;
