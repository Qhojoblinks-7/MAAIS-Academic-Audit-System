import { api } from './client';

export const reportsApi = {
  generateReportCard: async (studentId, termId) =>
    api.post('/reports/report-cards/generate', { studentId, termId }),

  getStudentReportCard: async (studentId, termId) =>
    api.get(`/reports/students/${studentId}/terms/${termId}/report-card`),

  getStudentTranscript: async (studentId) => api.get(`/reports/students/${studentId}/transcript`),

  verifyDocument: async (hash) => api.get(`/reports/verify/${hash}`),
};

export default reportsApi;
