import { api } from './client';

export const authApi = {
  login: async (dto) => api.post('/auth/login', dto),

  refresh: async (refreshToken, userId) => api.post('/auth/refresh', { refreshToken, userId }),

  logout: async (refreshToken) => api.post('/auth/logout', { refreshToken }),

  getCurrentUser: async () => api.get('/auth/me'),
};

export default authApi;
