import { getAuthToken } from './auth';
import { calcRoman } from '../constants/grading';
import mockHodService from './mockHodService';

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

export async function requestExport(method, path, body) {
  const token = getAuthToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: getHeaders(),
    credentials: 'include',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = new Error(`Export failed: ${res.status} ${method} ${path}`);
    err.status = res.status;
    throw err;
  }

  return res;
}

export function downloadResponse(res, filename) {
  return res.blob().then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return blob;
  });
}

export function generateWAECCSV(rows, subjectName = 'Subject', className = 'Class') {
  const headers = ['Index', 'Student Name', 'SBA', 'Exam', 'Final', 'Grade', 'Roman'];
  const dataRows = (rows || []).map((s) => [
    s.index ?? '',
    `"${(s.name ?? '').replace(/"/g, '""')}"`,
    s.sba ?? 0,
    s.exam ?? 0,
    s.final ?? 0,
    s.grade ?? '',
    calcRoman(s.grade),
  ]);
  return [headers, ...dataRows].map((r) => r.join(',')).join('\r\n');
}

export async function exportWAECCSVDownload(termId, className, subjectName, rows) {
  const filename = `WAEC_${subjectName}_${className}.csv`;
  try {
    const res = await requestExport(
      'POST',
      `/api/hod/export-waec/${encodeURIComponent(termId)}?class=${encodeURIComponent(className)}&format=csv`,
    );
    if (res.headers.get('Content-Type')?.includes('csv') || res.headers.get('Content-Type')?.includes('text/')) {
      await downloadResponse(res, filename);
      return;
    }
    const data = await res.json().catch(() => null);
    if (data?.csv) {
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
  } catch {
    /* fall through to client-side generation */
  }
  // Client-side fallback
  if (rows && rows.length > 0) {
    const csv = generateWAECCSV(rows, subjectName, className);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

function createRealService() {
  return {
    getAuditLogs: (params = {}) => request('GET', '/api/hod/audit-logs', params ? { params } : undefined).then(r => r?.data ?? r),
    getInterventionAlerts: (params = {}) => request('GET', '/api/hod/intervention-alerts', params ? { params } : undefined).then(r => r?.data ?? r),
    getDepartmentProgress: () => request('GET', '/api/hod/department-progress').then(r => r?.data ?? r),
    getTeacherSubmissionStatus: () => request('GET', '/api/hod/teachers/submissions').then(r => r?.data ?? r),
    getLockedTerms: () => request('GET', '/api/hod/locked-terms').then(r => r?.data ?? r),
    validateLock: (termId) => request('GET', `/api/hod/lock-matrix/${termId}/validate`).then(r => r?.data ?? r),
    lockDepartmentMatrix: (termId) => request('POST', `/api/hod/lock-matrix/${termId}`),
    unlockDepartmentMatrix: (termId) => request('POST', `/api/hod/unlock-matrix/${termId}`),
    exportWAECCSV: (termId, className) => exportWAECCSVDownload(termId, className, 'Subject', null),
    exportWAECPDF: (termId) => request('POST', `/api/hod/export-waec/${termId}`, { format: 'pdf' }),
    getGradeComparison: (subjectId, termA, termB) => request('GET', `/api/hod/grades/compare?subjectId=${subjectId}&termA=${termA}&termB=${termB}`).then(r => r?.data ?? r),
    updateHODComment: (recordId, comment) => request('PATCH', `/api/hod/records/${recordId}/comment`, { comment }),
rejectGradeRevision: (recordId, reason) => request('POST', `/api/hod/records/${recordId}/reject`, { reason }),
    approveGradeRevision: (recordId, comment) =>
      request('POST', `/api/hod/records/${recordId}/approve`, { comment }),
    getGradeRevisions: () => request('GET', '/api/hod/grade-revisions').then(r => r?.data ?? r),
    getArchivedDepartmentData: (params = {}) => request('GET', '/api/hod/archive', params ? { params } : undefined).then(r => r?.data ?? r),
    getPromotionRecommendations: (params = {}) => request('GET', '/api/hod/archive/promotions', params ? { params } : undefined).then(r => r?.data ?? r),

    // ── Phase 5: HOD Settings ─────────────────────────────────────────────────
    getHODSettings: () => request('GET', '/api/hod/settings').then(r => r?.data ?? r),
    updateHODSettings: (settings) => request('PUT', '/api/hod/settings', settings).then(r => r?.data ?? r),
    changePassword: (currentPassword, newPassword) =>
      request('POST', '/api/hod/settings/change-password', { currentPassword, newPassword }).then(r => r?.data ?? r),
    mfaEnroll: () => request('POST', '/api/hod/settings/mfa/enroll').then(r => r?.data ?? r),
    mfaVerify: (code) => request('POST', '/api/hod/settings/mfa/verify', { code }).then(r => r?.data ?? r),
    getActiveSessions: () => request('GET', '/api/hod/settings/sessions').then(r => r?.data ?? r),
    revokeSession: (sessionId) => request('DELETE', `/api/hod/settings/sessions/${sessionId}`).then(r => r?.data ?? r),

    // ── Phase 6: HOD Support ─────────────────────────────────────────────────────
    getSupportTickets: (params = {}) =>
      request('GET', '/api/hod/support/tickets', params ? { params } : undefined).then(r => r?.data ?? r),
    createSupportTicket: (ticket) =>
      request('POST', '/api/hod/support/tickets', ticket).then(r => r?.data ?? r),
    updateSupportTicket: (ticketId, patch) =>
      request('PATCH', `/api/hod/support/tickets/${ticketId}`, patch).then(r => r?.data ?? r),
    escalateTicket: (ticketId, body) =>
      request('POST', `/api/hod/support/tickets/${ticketId}/escalate`, body).then(r => r?.data ?? r),
    getSystemHealth: () =>
      request('GET', '/api/hod/system-health').then(r => r?.data ?? r),
    getEscalatedIssues: (params = {}) =>
      request('GET', '/api/hod/escalations', params ? { params } : undefined).then(r => r?.data ?? r),
    createEscalation: (body) =>
      request('POST', '/api/hod/escalations', body).then(r => r?.data ?? r),
    getContactChannels: () =>
      request('GET', '/api/hod/contact-channels').then(r => r?.data ?? r),
    updateContactChannels: (channels) =>
      request('PUT', '/api/hod/contact-channels', channels).then(r => r?.data ?? r),

    // ── Phase 7: Access & Security ───────────────────────────────────────────────
    resetTeacherPassword: (teacherId, newPassword) =>
      request('POST', `/api/hod/teachers/${teacherId}/reset-password`, { newPassword }).then(r => r?.data ?? r),
    getDepartmentTeachers: (params = {}) =>
      request('GET', '/api/hod/teachers', params ? { params } : undefined).then(r => r?.data ?? r),
    impersonateTeacher: (teacherId, body = {}) =>
      request('POST', `/api/hod/impersonate/${teacherId}`, body).then(r => r?.data ?? r),
stopImpersonation: () =>
       request('POST', '/api/hod/impersonate/stop').then(r => r?.data ?? r),
     getActiveImpersonations: () =>
       request('GET', '/api/hod/impersonate/active').then(r => r?.data ?? r),
     getStudentAcademicHistory: (studentId) =>
       request('GET', `/api/hod/students/${studentId}/academic-history`).then(r => r?.data ?? r),
   };
}

export const hodService = USE_MOCK ? mockHodService : createRealService();