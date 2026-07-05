import { api } from './client';

export const gradingApi = {
  upsertGrade: async (dto) => api.post('/grading/entries', dto),

  bulkUpsertGrades: async (entries) => api.post('/grading/entries/bulk', { entries }),

  correctGrade: async (dto) => api.post('/grading/corrections', dto),

  lockGrade: async (gradeEntryId) => api.patch(`/grading/entries/${gradeEntryId}/lock`),

  unlockGrade: async (gradeEntryId) => api.patch(`/grading/entries/${gradeEntryId}/unlock`),

  approveGrade: async (gradeEntryId) => api.patch(`/grading/entries/${gradeEntryId}/approve`),

  bulkApproveGrades: async (ids) =>
    api.post('/grading/entries/bulk-approve', { ids }),

  getStudentTermGrades: async (studentId, termId) =>
    api.get(`/grading/students/${studentId}/terms/${termId}`),

  getGradeEntry: async (id) => api.get(`/grading/entries/${id}`),

  getMissingObservations: async (termId) => api.get(`/grading/missing-observations?termId=${termId}`),

  getClassPerformanceSummary: async (classId, termId) =>
    api.get(`/grading/classes/${classId}/terms/${termId}/performance`),
};

export default gradingApi;
