import { api } from './client';

export const reportsApi = {
  generateReportCard: async (studentId, termId, documentType, purpose) =>
    api.post('/reports/generate', { studentId, termId, documentType, purpose }),

  getStudentReportCard: async (studentId, termId) =>
    api.get(`/reports/students/${studentId}/terms/${termId}/report-card`),

  getStudentTranscript: async (studentId) => api.get(`/reports/students/${studentId}/transcript`),

  verifyDocument: async (hash) => api.get(`/reports/verify/${hash}`),

  releaseReportCard: async (reportCardId) => api.patch(`/reports/report-cards/${reportCardId}/release`),
};

export default reportsApi;
