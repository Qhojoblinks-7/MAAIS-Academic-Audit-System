import { getAuthToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const DEFAULT_TIMEOUT = 15000;
const MAX_RETRIES = 2;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const pendingRequests = new Map();

function dedupeKey(method, path, body) {
  return `${method}:${path}:${JSON.stringify(body ?? null)}`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(method, path, body) {
  const url = `${BASE_URL}${path}`;
  const key = dedupeKey(method, path, body);
  if (method === 'GET' && pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = (async () => {
    let attempt = 0;
    while (true) {
      attempt += 1;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
          },
          credentials: 'include',
          signal: controller.signal,
          ...(body != null && method !== 'GET' && method !== 'HEAD' ? { body: JSON.stringify(body) } : {}),
        });
        clearTimeout(timer);

        if (!res.ok) {
          let errorBody;
          try {
            errorBody = await res.clone().json();
          } catch {
            errorBody = await res.text();
          }
          const freezeReason = errorBody?.freezeReason;
          const baseMessage = errorBody?.message || errorBody?.error || `Request failed: ${res.status} ${method} ${path}`;
          const err = new Error(freezeReason ? `${baseMessage} — ${freezeReason}` : baseMessage);
          err.status = res.status;
          err.response = errorBody;
          throw err;
        }

        if (res.status === 204) return undefined;
        return res.json();
      } catch (error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout: ${method} ${path}`);
        }
        if (attempt >= MAX_RETRIES || !RETRYABLE_STATUS.has(error.status)) {
          throw error;
        }
        await delay(1000 * attempt);
      }
    }
  })().finally(() => {
    if (method === 'GET') pendingRequests.delete(key);
  });

  if (method === 'GET') {
    pendingRequests.set(key, promise);
  }

  return promise;
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
    searchStudents: (query) =>
      request('GET', `/users/students${query ? `?search=${encodeURIComponent(query)}` : ''}`)
        .then((res) => {
          const data = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          return data.map((s) => ({
            id: s.id,
            name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.indexNumber || s.id,
            classForm: s.currentClass?.name || '—',
            indexNumber: s.indexNumber || '—',
            type: 'student',
          }));
        }),
    getAllStaff: () => request('GET', '/users/staff'),
    getStaffProfile: (id) =>
      request('GET', `/users/staff/${id}`).then(r => r?.data ?? r),
    searchTeachers: (query) =>
      request('GET', `/users/teachers${query ? `?search=${encodeURIComponent(query)}` : ''}`)
        .then((res) => {
          const data = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          return data.map((t) => ({
            id: t.id,
            name: `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.staffId || t.id,
            classForm: t.department?.name || 'Staff',
            indexNumber: t.staffId || '—',
            type: 'teacher',
          }));
        }),
    searchParents: (query) =>
      request('GET', `/users/parents/search${query ? `?search=${encodeURIComponent(query)}` : ''}`)
        .then((res) => {
          const data = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          return data.map((p) => ({
            id: p.id,
            name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email || p.id,
            classForm: 'Parent',
            indexNumber: p.phone || '—',
            type: 'parent',
          }));
        }),
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
    getAcademicYears: () => request('GET', '/academic/years'),
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
    upsertGrade: (dto) =>
      request('POST', '/grading/entries', dto),
    bulkUpsertGrades: (entries) =>
      request('POST', '/grading/entries/bulk', { entries }),
    lockGrade: (gradeEntryId) =>
      request('PATCH', `/grading/entries/${gradeEntryId}/lock`),
    unlockGrade: (gradeEntryId) =>
      request('PATCH', `/grading/entries/${gradeEntryId}/unlock`),
    approveGrade: (gradeEntryId) =>
      request('PATCH', `/grading/entries/${gradeEntryId}/approve`),
    bulkApproveGrades: (ids) =>
      request('POST', '/grading/entries/bulk-approve', { ids }),
    correctGrade: (dto) =>
      request('POST', '/grading/corrections', dto),
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
    unlockTerm: (id) => request('POST', `/hod/unlock-matrix/${id}`),

    // ── Approvals ──────────────────────────────────────────────────────────────
    getApprovals: (query = {}) => request('GET', '/approvals', query),
    getApprovalStats: () => request('GET', '/approvals/stats'),
    createApproval: (dto) => request('POST', '/approvals', dto),
    getApproval: (id) => request('GET', `/approvals/${id}`),
    resolveApproval: (id, dto) => request('PATCH', `/approvals/${id}/resolve`, dto),
    deleteApproval: (id) => request('DELETE', `/approvals/${id}`),

    // ── Grading Rules ──────────────────────────────────────────────────────────
    getGradingRules: (termId) => request('GET', '/grading/rules', { termId }),
    updateGradingRules: (body) => request('PUT', '/grading/rules', body),

    // ── Report Generation (Admin) ──────────────────────────────────────────────
    getStudentsForReportGeneration: (query) => request('GET', '/reports/generation/students', query),
    compileBatchReports: (dto) => request('POST', '/reports/generation/compile', dto),
    getReportBlockingIssues: (classSectionId) => request('GET', '/reports/generation/blocking-issues', { classSectionId }),
    sendReportNudge: (dto) => request('POST', '/reports/generation/send-nudge', dto),

    // ── Admin Settings ─────────────────────────────────────────────────────────
    getAdminSettings: () => request('GET', '/admin/settings'),
    updateAdminMfa: (enabled) => request('PATCH', '/admin/settings/mfa', { enabled }),
    toggleMaintenanceMode: (enabled) => request('PATCH', '/admin/settings/maintenance', { enabled }),
    updateAdminCredentials: (body) => request('POST', '/admin/settings/credentials', body),
  };
}

export const adminService = createRealService();

export default adminService;
