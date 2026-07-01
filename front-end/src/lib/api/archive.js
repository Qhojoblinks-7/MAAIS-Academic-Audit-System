import { api } from './client';

export const archiveApi = {
  getPromotionHistory: async (studentId) => api.get(`/archive/students/${studentId}/promotions`),

  promoteStudent: async (dto = {}) =>
    api.post('/archive/promote', {
      academicYearId: dto.academicYearId,
      studentId: dto.studentId,
      classId: dto.classId,
      classLevel: dto.classLevel,
    }),

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

  getClassBenchmarks: async (classId) =>
    api.get(`/archive/class-benchmarks?classId=${encodeURIComponent(classId)}`),

  getUnlockedTerms: async (academicYearId) =>
    api.get(`/archive/terms/unlocked?academicYearId=${encodeURIComponent(academicYearId)}`),

  lockAllTerms: async (academicYearId) =>
    api.post('/archive/terms/lock-all', { academicYearId }),
};

export default archiveApi;
