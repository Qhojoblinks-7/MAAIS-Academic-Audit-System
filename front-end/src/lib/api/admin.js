import { api } from './client';

export const adminApi = {
  // ── Users / Staff Management ───────────────────────────────────────────────
  createStaff: (dto) => api.post('/users/staff', dto),
  createStudent: (dto) => api.post('/users/students', dto),
  batchImportStudents: (students) => api.post('/users/students/batch', { students }),
  createParent: (dto) => api.post('/users/parents', dto),
  getAllParents: () => api.get('/users/parents'),
  getAllStudents: () => api.get('/users/students'),
  getStudentProfile: (id) => api.get(`/users/students/${id}`),
  updateStudentProfile: (id, body) => api.patch(`/users/students/${id}`, body),
  getAllStaff: () => api.get('/users/staff'),
  deactivateUser: (id) => api.patch(`/users/${id}/deactivate`),

  // ── Academic Structure ─────────────────────────────────────────────────────
  createYear: (dto) => api.post('/academic/years', dto),
  activateYear: (id) => api.patch(`/academic/years/${id}/activate`),
  getActiveYear: () => api.get('/academic/years/active'),
  createTerm: (dto) => api.post('/academic/terms', dto),
  activateTerm: (id) => api.patch(`/academic/terms/${id}/activate`),
  createDepartment: (dto) => api.post('/academic/departments', dto),
  getAllDepartments: () => api.get('/academic/departments'),
  createSubject: (dto) => api.post('/academic/subjects', dto),
  getAllSubjects: () => api.get('/academic/subjects'),
  createClass: (dto) => api.post('/academic/classes', dto),
  updateClass: (id, dto) => api.patch(`/academic/classes/${id}`, dto),
  deleteClass: (id) => api.delete(`/academic/classes/${id}`),
  getAllClasses: () => api.get('/academic/classes'),
  assignHOD: (deptId, staffId) => api.patch(`/admin/departments/${deptId}/hod`, { staffId }),
  freezeDepartment: (deptId) => api.post(`/admin/departments/${deptId}/freeze`),
  transferTeacher: (toDeptId, teacherId, fromDeptId) =>
    api.post(`/admin/departments/${toDeptId}/transfer-teacher`, {
      teacherId,
      fromDepartmentId: fromDeptId,
    }),
  deleteDepartment: (deptId) => api.delete(`/admin/departments/${deptId}`),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  authorizeTemplate: (deptId, template) => api.post(`/admin/departments/${deptId}/template`, { template }),
  assignClassTeacher: (id, dto) => api.patch(`/academic/classes/${id}/teacher`, dto),
  assignTeacher: (dto) => api.post('/academic/assignments', dto),
  getTeacherAssignments: (teacherId) => api.get(`/academic/assignments/teacher/${teacherId}`),
  getClassAssignments: (classId) => api.get(`/academic/assignments/class/${classId}`),
  getMyAssignments: () => api.get('/academic/my-assignments'),

  // ── Reports ────────────────────────────────────────────────────────────────
  generateReportCard: (dto) => api.post('/reports/report-cards/generate', dto),
  batchGenerateReportCards: (dto) => api.post('/reports/report-cards/batch', dto),
  buildTranscript: (dto) => api.post('/reports/transcripts/generate', dto),
  verifyDocument: (hash) => api.get(`/reports/verify/${hash}`),
  getStudentReportCard: (studentId, termId) =>
    api.get(`/reports/students/${studentId}/terms/${termId}/report-card`),
  getStudentTranscript: (studentId) =>
    api.get(`/reports/students/${studentId}/transcript`),

  // ── Archive / Vault ────────────────────────────────────────────────────────
   promoteStudent: (dto) => api.post('/archive/promote', dto),
   promoteLevel: (dto) => api.post('/archive/promote', dto),
   searchVault: (query) => api.get('/archive/vault/search', { params: query }),
   getAcademicYears: () => api.get('/academic/years'),
   getArchiveStats: () => api.get('/archive/stats'),
   lockTerm: (id) => api.patch(`/archive/terms/${id}/lock`),
   getDatabaseHealth: () => api.get('/archive/health'),

   archiveYear: (yearId) => api.post(`/archive/years/${yearId}/archive`),
   transferStudents: ({ sourceClassId, targetClassId, studentIds }) =>
     api.post('/archive/classes/transfer', { sourceClassId, targetClassId, studentIds }),
   updateClassCapacity: (classId, capacity) =>
     api.patch(`/archive/classes/${classId}/capacity`, { capacity }),
   rebalanceHouses: (classId) => api.post(`/archive/classes/${classId}/rebalance`),
   dissolveClass: (classId) => api.delete(`/academic/classes/${classId}`),

  // ── Communications ─────────────────────────────────────────────────────────
  sendNotification: (dto) => api.post('/comms/notify', dto),
  emergencyBroadcast: (dto) => api.post('/comms/emergency', dto),
  getStudentNotifications: (studentId, unreadOnly = false) =>
    api.get(`/comms/notifications/${studentId}?unreadOnly=${unreadOnly}`),
  markNotificationRead: (id) => api.patch(`/comms/notifications/${id}/read`),
  getUnreadNotifications: () => api.get('/comms/notifications/unread'),
  sendHODAction: (dto) => api.post('/comms/notifications/hod-action', dto),
  sendTeacherAction: (dto) => api.post('/comms/notifications/teacher-action', dto),
  getAnalyticsPulse: (academicYearId) =>
    api.get(`/comms/analytics/pulse?academicYearId=${academicYearId || ''}`),
  createTicket: (dto) => api.post('/comms/tickets', dto),
  getMyTickets: () => api.get('/comms/tickets/my'),
  listTickets: (query) => api.get('/comms/tickets', { params: query }),
  updateTicketStatus: (id, dto) => api.patch(`/comms/tickets/${id}/status`, dto),
  addTicketReply: (id, dto) => api.post(`/comms/tickets/${id}/reply`, dto),

  // ── Grading (Admin / HOD level) ────────────────────────────────────────────
  upsertGrade: (dto, submittedById) => api.post('/grading/entries', { ...dto, submittedById }),
  bulkUpsertGrades: (entries, submittedById) =>
    api.post('/grading/entries/bulk', { entries, submittedById }),
  lockGrade: (gradeEntryId, lockedById) =>
    api.patch(`/grading/entries/${gradeEntryId}/lock`, { lockedById }),
  unlockGrade: (gradeEntryId) => api.patch(`/grading/entries/${gradeEntryId}/unlock`),
  approveGrade: (gradeEntryId, approvedById) =>
    api.patch(`/grading/entries/${gradeEntryId}/approve`, { approvedById }),
  bulkApproveGrades: (ids, approvedById) =>
    api.post('/grading/entries/bulk-approve', { ids, approvedById }),
  correctGrade: (dto, changedById) => api.post('/grading/corrections', { ...dto, changedById }),
  getMissingObservations: (termId) =>
    api.get(`/grading/missing-observations?termId=${termId}`),
  getGradeEntry: (id) => api.get(`/grading/entries/${id}`),
  getClassPerformance: (classId, termId) =>
    api.get(`/grading/classes/${classId}/terms/${termId}/performance`),
  getClassSummary: (classId, termId) =>
    api.get(`/grading/class-summary/${classId}?termId=${termId}`),
  getStudentTermGrades: (studentId, termId) =>
    api.get(`/grading/students/${studentId}/terms/${termId}`),
  getStudentsForGrading: ({ subjectId, classId, termId }) =>
    api.get(
      `/grading/students/for-grading?subjectId=${subjectId}&classId=${classId}${termId ? `&termId=${termId}` : ''}`,
    ),
  getSmartRemarks: (grade) => api.get(`/grading/smart-remarks/${grade}`),

  // ── Teacher Operations (Admin-accessible) ──────────────────────────────────
  getTeacherClasses: (teacherId) => api.get(`/teacher/classes/${teacherId}`),
  getTeacherAnalytics: (teacherId) => api.get(`/teacher/classes/${teacherId}/analytics`),
  getTeacherProfile: () => api.get('/teacher/profile'),
  updateTeacherProfile: (data) => api.patch('/teacher/profile', data),
  getSupportObservations: () => api.get('/teacher/support/observations'),
  getGradeRevisions: () => api.get('/teacher/grade-revisions'),
  getGradeIssues: () => api.get('/teacher/grade-issues'),
  getObservationLogs: () => api.get('/teacher/observations'),
  createObservation: (body) => api.post('/teacher/observations', body),
  updateObservation: (id, patch) => api.patch(`/teacher/observations/${id}`, patch),
  deleteObservation: (id) => api.delete(`/teacher/observations/${id}`),
  getMissingObservationsTray: () => api.get('/teacher/missing-observations'),
  getSubjectConfig: () => api.get('/teacher/subject-config'),
  getGradeConfig: () => api.get('/teacher/grade-config'),

  // ── Timetable ──────────────────────────────────────────────────────────────
  createTimetableEntry: (body) => api.post('/timetable', body),
  getTimetableEntries: (params = {}) => api.get('/timetable', { params }),
  getMySchedule: () => api.get('/timetable/my-schedule'),
  getTeacherTimetable: (teacherId) => api.get(`/timetable/teacher/${teacherId}`),
  getClassTimetable: (classId) => api.get(`/timetable/class/${classId}`),
  getWeeklySchedule: (teacherId) => api.get(`/timetable/weekly/${teacherId}`),
  getClashes: (teacherId) => api.get(`/timetable/clashes/${teacherId}`),
  getTimetableEntry: (id) => api.get(`/timetable/${id}`),
  updateTimetableEntry: (id, body) => api.put(`/timetable/${id}`, body),
  deleteTimetableEntry: (id) => api.delete(`/timetable/${id}`),

  // ── Students (Admin-accessible) ────────────────────────────────────────────
  getStudentBehavior: (studentId) => api.get(`/students/${studentId}/behavior`),
  createBehavior: (studentId, data) => api.post(`/students/${studentId}/behavior`, data),
  getStudentInterventions: (studentId) =>
    api.get(`/students/${studentId}/interventions`),
  getStudentPortalData: (studentId) =>
    api.get(`/portal/students/${studentId}/portal-data`),

  // ── Auth ───────────────────────────────────────────────────────────────────
  getCurrentUser: () => api.get('/auth/me'),
  login: (dto) => api.post('/auth/login', dto),
  refresh: (refreshToken, userId) => api.post('/auth/refresh', { refreshToken, userId }),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),

  // ── Approvals ──────────────────────────────────────────────────────────────
  getApprovals: (query = {}) => api.get('/approvals', { params: query }),
  getApprovalStats: () => api.get('/approvals/stats'),
  createApproval: (dto) => api.post('/approvals', dto),
  getApproval: (id) => api.get(`/approvals/${id}`),
  resolveApproval: (id, dto) => api.patch(`/approvals/${id}/resolve`, dto),
  deleteApproval: (id) => api.delete(`/approvals/${id}`),

   // ── Grading Rules ──────────────────────────────────────────────────────────
    getGradingRules: (termId) => api.get('/grading/rules', { params: { termId } }),
    updateGradingRules: (body) => api.put('/grading/rules', body),
    getComplianceWarnings: () => api.get('/grading/compliance/warnings'),
    getTermSummary: (termId) => api.get(`/grading/term-summary/${termId}`),

  // ── Reports (Admin Generation) ─────────────────────────────────────────────
  getStudentsForReportGeneration: (query) => api.get('/reports/generation/students', { params: query }),
  compileBatchReports: (dto) => api.post('/reports/generation/compile', dto),
  getReportBlockingIssues: (classSectionId) => api.get('/reports/generation/blocking-issues', { params: { classSectionId } }),
  sendReportNudge: (dto) => api.post('/reports/generation/send-nudge', dto),

// ── Admin Settings ─────────────────────────────────────────────────────────
   getAdminSettings: () => api.get('/admin/settings'),
   updateAdminMfa: (enabled) => api.patch('/admin/settings/mfa', { enabled }),
   toggleMaintenanceMode: (enabled) => api.patch('/admin/settings/maintenance', { enabled }),
   getSystemFreeze: () => api.get('/admin/settings/freeze'),
   toggleSystemFreeze: (enabled, reason) => api.post('/admin/settings/freeze', { enabled, reason }),
   updateAdminCredentials: (body) => api.post('/admin/settings/credentials', body),

resetStaffCredentials: (staffId) => api.post(`/admin/staff/${staffId}/reset-credentials`, {}),

   // ── Curriculum Mapping ───────────────────────────────────────────────────────
    getCurriculumMatrix: (academicYearId) => api.get(`/academic/curriculum/matrix`, { params: { academicYearId } }),
    upsertCurriculumMapping: (body) => api.post(`/academic/curriculum/matrix`, body),
    removeCurriculumMapping: (academicYearId, subjectId, classSectionId) =>
      api.delete(`/academic/curriculum/matrix/${subjectId}/${classSectionId}?academicYearId=${academicYearId}`),
    bulkUpsertCurriculum: (body) => api.post(`/academic/curriculum/matrix/bulk`, body),
    deployCurriculum: (academicYearId) => api.post(`/academic/curriculum/deploy`, { academicYearId }),
    getDeploymentStatus: (academicYearId) => api.get(`/academic/curriculum/deployment/status?academicYearId=${academicYearId}`),

  // ── Strategy Pulse ───────────────────────────────────────────────────────────
  uploadStrategyPulse: (deptId) => api.post('/admin/strategy-pulse', { departmentId: deptId }),

  // ── Archive (Admin) ─────────────────────────────────────────────────────────
  runPromotion: (dto) => api.post('/archive/promote', dto),
  unlockTerm: (id) => api.post(`/hod/unlock-matrix/${id}`),
};

export default adminApi;
