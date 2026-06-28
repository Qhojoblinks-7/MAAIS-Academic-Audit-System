import { getAuthToken } from '../../services/auth';
import { api } from './client';

const BASE = '';

export const hodApi = {
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== '') query.set(key, value);
    });
    const qs = query.toString();
    return api.get(qs ? `${BASE}/hod/audit-logs?${qs}` : `${BASE}/hod/audit-logs`);
  },

  getInterventionAlerts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== '') query.set(key, value);
    });
    const qs = query.toString();
    return api.get(qs ? `${BASE}/hod/intervention-alerts?${qs}` : `${BASE}/hod/intervention-alerts`);
  },

  getDepartmentProgress: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== '') query.set(key, value);
    });
    const qs = query.toString();
    return api.get(qs ? `${BASE}/hod/department-progress?${qs}` : `${BASE}/hod/department-progress`);
  },

  getAllAcademicYears: () =>
    api.get(`${BASE}/hod/academic-years`),

  getTeacherSubmissions: () =>
    api.get(`${BASE}/hod/teachers/submissions`),

  getLockedTerms: () =>
    api.get(`${BASE}/hod/locked-terms`),

  getGradeRevisions: () =>
    api.get(`${BASE}/hod/grade-revisions`),

validateLock: (termId) =>
     api.get(`${BASE}/hod/lock-matrix/${termId}/validate`),

   lockDepartmentMatrix: (classId) =>
     api.post(`${BASE}/hod/lock-class/${classId}`),

   unlockDepartmentMatrix: (classId) =>
     api.post(`${BASE}/hod/unlock-class/${classId}`),

  exportWAECCSV: (termId, className) => {
    const token = getAuthToken();
    return fetch(`${BASE}/hod/export-waec/${termId}?class=${encodeURIComponent(className)}&format=csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text();
        const err = new Error(text || `HTTP ${res.status}`);
        err.status = res.status;
        throw err;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WAEC_${className}_${termId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return { success: true };
    });
  },

  getGradeComparison: (subjectId, termA, termB) =>
    api.get(`${BASE}/hod/grades/compare?subjectId=${subjectId}&termA=${termA}&termB=${termB}`),

  updateHODComment: (recordId, comment) =>
    api.patch(`${BASE}/hod/records/${recordId}/comment`, { comment }),

  rejectGradeRevision: (recordId, reason) =>
    api.post(`${BASE}/hod/records/${recordId}/reject`, { reason }),

  approveGradeRevision: (recordId, comment) =>
    api.post(`${BASE}/hod/records/${recordId}/approve`, { comment }),

  getArchivedDepartmentData: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== '') query.set(key, value);
    });
    const qs = query.toString();
    return api.get(qs ? `${BASE}/hod/archive?${qs}` : `${BASE}/hod/archive`);
  },

  getPromotionRecommendations: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== '') query.set(key, value);
    });
    const qs = query.toString();
    return api.get(qs ? `${BASE}/hod/archive/promotions?${qs}` : `${BASE}/hod/archive/promotions`);
  },

  getHODSettings: () =>
    api.get(`${BASE}/hod/settings`),

  updateHODSettings: (settings) =>
    api.put(`${BASE}/hod/settings`, settings),

  changePassword: (currentPassword, newPassword) =>
    api.post(`${BASE}/hod/settings/change-password`, { currentPassword, newPassword }),

  mfaEnroll: () =>
    api.post(`${BASE}/hod/settings/mfa/enroll`),

  mfaVerify: (code) =>
    api.post(`${BASE}/hod/settings/mfa/verify`, { code }),

  getActiveSessions: () =>
    api.get(`${BASE}/hod/settings/sessions`),

  revokeSession: (sessionId) =>
    api.delete(`${BASE}/hod/settings/sessions/${sessionId}`),

  getSupportTickets: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== '') query.set(key, value);
    });
    const qs = query.toString();
    return api.get(qs ? `${BASE}/hod/support/tickets?${qs}` : `${BASE}/hod/support/tickets`);
  },

  createSupportTicket: (ticket) =>
    api.post(`${BASE}/hod/support/tickets`, ticket),

  updateSupportTicket: (ticketId, patch) =>
    api.patch(`${BASE}/hod/support/tickets/${ticketId}`, patch),

  escalateTicket: (ticketId, body) =>
    api.post(`${BASE}/hod/support/tickets/${ticketId}/escalate`, body),

  getSystemHealth: () =>
    api.get(`${BASE}/hod/system-health`),

  getEscalatedIssues: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== '') query.set(key, value);
    });
    const qs = query.toString();
    return api.get(qs ? `${BASE}/hod/escalations?${qs}` : `${BASE}/hod/escalations`);
  },

  createEscalation: (body) =>
    api.post(`${BASE}/hod/escalations`, body),

  getContactChannels: () =>
    api.get(`${BASE}/hod/contact-channels`),

updateContactChannels: (channels) =>
     api.patch(`${BASE}/hod/contact-channels`, channels),

  resetTeacherPassword: (teacherId, newPassword) =>
    api.post(`${BASE}/hod/teachers/${teacherId}/reset-password`, { newPassword }),

  getDepartmentTeachers: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== '') query.set(key, value);
    });
    const qs = query.toString();
    return api.get(qs ? `${BASE}/hod/teachers?${qs}` : `${BASE}/hod/teachers`);
  },

  impersonateTeacher: (teacherId, body = {}) =>
    api.post(`${BASE}/hod/impersonate/${teacherId}`, body),

  stopImpersonation: () =>
    api.post(`${BASE}/hod/impersonate/stop`),

  getActiveImpersonations: () =>
    api.get(`${BASE}/hod/impersonate/active`),

  getStudentAcademicHistory: (studentId) =>
    api.get(`${BASE}/hod/students/${studentId}/academic-history`),

  getComplianceCohortPerformance: () =>
    api.get(`${BASE}/hod/compliance/cohort-performance`),

  getComplianceTimeline: () =>
    api.get(`${BASE}/hod/compliance/timeline`),

  getPromotionMetrics: () =>
    api.get(`${BASE}/hod/promotion-metrics`),

triggerPromotion: (academicYearId) =>
      api.post(`${BASE}/archive/promote`, { academicYearId }),

  resolveAlert: (alertId) =>
    api.post(`${BASE}/hod/intervention-alerts/${alertId}/resolve`),

  addCounselingNote: ({ alertId, text }) =>
    api.post(`${BASE}/hod/intervention-alerts/${alertId}/notes`, { text }),
};

export default hodApi;