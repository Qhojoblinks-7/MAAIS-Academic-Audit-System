import { api } from './client';

export const gradingApi = {
  upsertGrade: async (dto, submittedById) => api.post('/grading/entries', { ...dto, submittedById }),

  bulkUpsertGrades: async (entries, submittedById) => api.post('/grading/entries/bulk', { entries, submittedById }),

  correctGrade: async (dto, changedById) => api.post('/grading/corrections', { ...dto, changedById }),

  lockGrade: async (gradeEntryId, lockedById) => api.patch(`/grading/entries/${gradeEntryId}/lock`, { lockedById }),

  unlockGrade: async (gradeEntryId) => api.patch(`/grading/entries/${gradeEntryId}/unlock`),

  approveGrade: async (gradeEntryId, approvedById) => api.patch(`/grading/entries/${gradeEntryId}/approve`, { approvedById }),

  bulkApproveGrades: async (ids, approvedById) => api.patch('/grading/entries/bulk-approve', { ids, approvedById }),

  getStudentTermGrades: async (studentId, termId) =>
    api.get(`/grading/students/${studentId}/terms/${termId}/grades`),

  getGradeEntry: async (id) => api.get(`/grading/entries/${id}`),

  getMissingObservations: async (termId) => api.get(`/grading/missing-observations?termId=${termId}`),

  getClassPerformanceSummary: async (classId, termId) =>
    api.get(`/grading/classes/${classId}/terms/${termId}/performance`),
};

export default gradingApi;
