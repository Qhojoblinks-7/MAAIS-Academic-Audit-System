import { api } from './client';

export const archiveApi = {
  getPromotionHistory: async (studentId) => api.get(`/archive/students/${studentId}/promotions`),

  promoteStudent: async (studentId, academicYearId, fromClass, toClass, status, notes) =>
    api.post('/archive/promote', { studentId, academicYearId, fromClass, toClass, status, notes }),

  getAcademicYears: async () => api.get('/academic/years'),

  getArchiveStats: async () => api.get('/archive/stats'),

  searchVault: async (query = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value != null && value !== '') params.set(key, value);
    });
    const qs = params.toString();
    return api.get(`/archive/vault/search${qs ? `?${qs}` : ''}`);
  },
};

export default archiveApi;
