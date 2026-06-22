import { getAuthToken } from './auth';
import { adminApi } from '../lib/api/admin';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_MOCK = !BASE_URL || import.meta.env.VITE_USE_MOCK_API === 'true';

function getHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  if (USE_MOCK) {
    console.warn(`[adminService] Mock mode: ${method} ${path}`);
    return { success: true, data: [] };
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: getHeaders(),
    credentials: 'include',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = new Error(`Request failed: ${res.status} ${method} ${path}`);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return undefined;
  return res.json();
}

function createRealService() {
  return {
    // ── Users / Staff Management ─────────────────────────────────────────────
    createStaff: (dto) => request('POST', '/users/staff', dto),
    createStudent: (dto) => request('POST', '/users/students', dto),
    createParent: (dto) => request('POST', '/users/parents', dto),
    getAllStudents: () => request('GET', '/users/students'),
    getStudentProfile: (id) => request('GET', `/users/students/${id}`),
    updateStudentProfile: (id, body) => request('PATCH', `/users/students/${id}`, body),
    getAllStaff: () => request('GET', '/users/staff'),
    deactivateUser: (id) => request('PATCH', `/users/${id}/deactivate`),

    // ── Academic Structure ───────────────────────────────────────────────────
    createYear: (dto) => request('POST', '/academic/years', dto),
    activateYear: (id) => request('PATCH', `/academic/years/${id}/activate`, null),
    getActiveYear: () => request('GET', '/academic/years/active'),
    createTerm: (dto) => request('POST', '/academic/terms', dto),
    activateTerm: (id) => request('PATCH', `/academic/terms/${id}/activate`, null),
    createDepartment: (dto) => request('POST', '/academic/departments', dto),
    getAllDepartments: () => request('GET', '/academic/departments'),
    createSubject: (dto) => request('POST', '/academic/subjects', dto),
    getAllSubjects: () => request('GET', '/academic/subjects'),
    createClass: (dto) => request('POST', '/academic/classes', dto),
    getAllClasses: () => request('GET', '/academic/classes'),
    assignClassTeacher: (id, dto) => request('PATCH', `/academic/classes/${id}/teacher`, dto),
    assignTeacher: (dto) => request('POST', '/academic/assignments', dto),
    getTeacherAssignments: (teacherId) => request('GET', `/academic/assignments/teacher/${teacherId}`),
    getMyAssignments: () => request('GET', '/academic/my-assignments'),

    // ── Reports ──────────────────────────────────────────────────────────────
    generateReportCard: (studentId, termId) =>
      request('POST', '/reports/report-cards/generate', { studentId, termId }),
    batchGenerateReportCards: (classSectionId, termId) =>
      request('POST', '/reports/report-cards/batch', { classSectionId, termId }),
    buildTranscript: (studentIdOrIndex) =>
      request('POST', '/reports/transcripts/generate', { studentIdOrIndex }),
    verifyDocument: (hash) => request('GET', `/reports/verify/${hash}`),
    getStudentReportCard: (studentId, termId) =>
      request('GET', `/reports/students/${studentId}/terms/${termId}/report-card`),
    getStudentTranscript: (studentId) =>
      request('GET', `/reports/students/${studentId}/transcript`),

    // ── Archive / Vault ──────────────────────────────────────────────────────
    promoteStudent: (dto) => request('POST', '/archive/promote', dto),
    getPromotionHistory: (studentId) =>
      request('GET', `/archive/students/${studentId}/promotions`),
    searchVault: (query = {}) => request('GET', '/archive/vault/search', query),
    getAcademicYears: () => request('GET', '/archive/academic-years'),
    getArchiveStats: () => request('GET', '/archive/stats'),
    lockTerm: (id) => request('PATCH', `/archive/terms/${id}/lock`, null),
    getDatabaseHealth: () => request('GET', '/archive/health'),

    // ── Communications ───────────────────────────────────────────────────────
    sendNotification: (dto) => request('POST', '/comms/notify', dto),
    emergencyBroadcast: (dto) => request('POST', '/comms/emergency', dto),
    getStudentNotifications: (studentId, unreadOnly = false) =>
      request('GET', `/comms/notifications/${studentId}?unreadOnly=${unreadOnly}`),
    markNotificationRead: (id) => request('PATCH', `/comms/notifications/${id}/read`, null),
    getUnreadNotifications: () => request('GET', '/comms/notifications/unread'),
    sendHODAction: (dto) => request('POST', '/comms/notifications/hod-action', dto),
    sendTeacherAction: (dto) => request('POST', '/comms/notifications/teacher-action', dto),
    getAnalyticsPulse: (academicYearId) =>
      request('GET', `/comms/analytics/pulse?academicYearId=${academicYearId || ''}`),
    createTicket: (dto) => request('POST', '/comms/tickets', dto),
    getMyTickets: () => request('GET', '/comms/tickets/my'),
    listTickets: (query = {}) => request('GET', '/comms/tickets', query),
    updateTicketStatus: (id, dto) => request('PATCH', `/comms/tickets/${id}/status`, dto),
    addTicketReply: (id, dto) => request('POST', `/comms/tickets/${id}/reply`, dto),

    // ── Grading (Admin / HOD level) ──────────────────────────────────────────
    upsertGrade: (dto, submittedById) =>
      request('POST', '/grading/entries', { ...dto, submittedById }),
    bulkUpsertGrades: (entries, submittedById) =>
      request('POST', '/grading/entries/bulk', { entries, submittedById }),
    lockGrade: (gradeEntryId, lockedById) =>
      request('PATCH', `/grading/entries/${gradeEntryId}/lock`, { lockedById }),
    unlockGrade: (gradeEntryId) =>
      request('PATCH', `/grading/entries/${gradeEntryId}/unlock`, null),
    approveGrade: (gradeEntryId, approvedById) =>
      request('PATCH', `/grading/entries/${gradeEntryId}/approve`, { approvedById }),
    bulkApproveGrades: (ids, approvedById) =>
      request('POST', '/grading/entries/bulk-approve', { ids, approvedById }),
    correctGrade: (dto, changedById) =>
      request('POST', '/grading/correct', { ...dto, changedById }),
    getMissingObservations: (termId) =>
      request('GET', `/grading/missing-observations?termId=${termId}`),
    getGradeEntry: (id) => request('GET', `/grading/entries/${id}`),
    getClassPerformance: (classId, termId) =>
      request('GET', `/grading/classes/${classId}/terms/${termId}/performance`),
    getClassSummary: (classId, termId) =>
      request('GET', `/grading/class-summary/${classId}?termId=${termId}`),
    getStudentTermGrades: (studentId, termId) =>
      request('GET', `/grading/students/${studentId}/terms/${termId}`),
    getStudentsForGrading: ({ subjectId, classId, termId }) =>
      request(
        'GET',
        `/grading/students/for-grading?subjectId=${subjectId}&classId=${classId}${termId ? `&termId=${termId}` : ''}`,
      ),
    getSmartRemarks: (grade) => request('GET', `/grading/smart-remarks/${grade}`),

    // ── Teacher Operations (Admin-accessible) ─────────────────────────────────
    getTeacherClasses: (teacherId) => request('GET', `/teacher/classes/${teacherId}`),
    getTeacherAnalytics: (teacherId) =>
      request('GET', `/teacher/classes/${teacherId}/analytics`),
    getTeacherProfile: () => request('GET', '/teacher/profile'),
    updateTeacherProfile: (data) => request('PATCH', '/teacher/profile', data),
    getSupportObservations: () => request('GET', '/teacher/support/observations'),
    getGradeRevisions: () => request('GET', '/teacher/grade-revisions'),
    getGradeIssues: () => request('GET', '/teacher/grade-issues'),
    getObservationLogs: () => request('GET', '/teacher/observations'),
    createObservation: (body) => request('POST', '/teacher/observations', body),
    updateObservation: (id, patch) =>
      request('PATCH', `/teacher/observations/${id}`, patch),
    deleteObservation: (id) => request('DELETE', `/teacher/observations/${id}`),
    getMissingObservationsTray: () => request('GET', '/teacher/missing-observations'),
    getSubjectConfig: () => request('GET', '/teacher/subject-config'),
    getGradeConfig: () => request('GET', '/teacher/grade-config'),

    // ── Timetable ────────────────────────────────────────────────────────────
    createTimetableEntry: (body) => request('POST', '/timetable', body),
    getTimetableEntries: (params = {}) => request('GET', '/timetable', params),
    getMySchedule: () => request('GET', '/timetable/my-schedule'),
    getTeacherTimetable: (teacherId) =>
      request('GET', `/timetable/teacher/${teacherId}`),
    getClassTimetable: (classId) => request('GET', `/timetable/class/${classId}`),
    getWeeklySchedule: (teacherId) =>
      request('GET', `/timetable/weekly/${teacherId}`),
    getClashes: (teacherId) => request('GET', `/timetable/clashes/${teacherId}`),
    getTimetableEntry: (id) => request('GET', `/timetable/${id}`),
    updateTimetableEntry: (id, body) => request('PUT', `/timetable/${id}`, body),
    deleteTimetableEntry: (id) => request('DELETE', `/timetable/${id}`),

    // ── Students (Admin-accessible) ──────────────────────────────────────────
    getStudentBehavior: (studentId) =>
      request('GET', `/students/${studentId}/behavior`),
    createBehavior: (studentId, data) =>
      request('POST', `/students/${studentId}/behavior`, data),
    getStudentInterventions: (studentId) =>
      request('GET', `/students/${studentId}/interventions`),
    getStudentPortalData: (studentId) =>
      request('GET', `/portal/students/${studentId}/portal-data`),

    // ── Auth ─────────────────────────────────────────────────────────────────
    getCurrentUser: () => request('GET', '/auth/me'),
    login: (dto) => request('POST', '/auth/login', dto),
    refresh: (refreshToken, userId) =>
      request('POST', '/auth/refresh', { refreshToken, userId }),
    logout: (refreshToken) => request('POST', '/auth/logout', { refreshToken }),

    // ── Archive (Admin) ──────────────────────────────────────────────────────
    runPromotion: (dto) => request('POST', '/archive/promote', dto),
  };
}

export const adminService = USE_MOCK ? createRealService() : createRealService();

export default adminService;
