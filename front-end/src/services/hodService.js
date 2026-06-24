import { getAuthToken } from './auth';
import { calcRoman } from '../constants/grading';
import mockHodService from './mockHodService';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const USE_MOCK = !BASE_URL || import.meta.env.VITE_USE_MOCK_API === 'true';

function getHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body, queryParams) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  if ((method === 'GET' || method === 'HEAD') && queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value != null && value !== '') url.searchParams.set(key, value);
    });
  }
  const res = await fetch(url.toString(), {
    method,
    headers: getHeaders(),
    credentials: 'include',
    ...(method !== 'GET' && method !== 'HEAD' && body !== undefined ? { body: JSON.stringify(body) } : {}),
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
      `/hod/export-waec/${encodeURIComponent(termId)}?class=${encodeURIComponent(className)}&format=csv`,
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
    getAuditLogs: (params = {}) => request('GET', '/hod/audit-logs', undefined, params).then(r => r?.data ?? r),
    getInterventionAlerts: (params = {}) => request('GET', '/hod/intervention-alerts', undefined, params).then(r => r?.data ?? r),
    getDepartmentProgress: (params = {}) => request('GET', '/hod/department-progress', undefined, params).then(r => r?.data ?? r),
    getTeacherSubmissionStatus: () => request('GET', '/hod/teachers/submissions').then(r => r?.data ?? r),
    getLockedTerms: () => request('GET', '/hod/locked-terms').then(r => r?.data ?? r),
    validateLock: (termId) => request('GET', `/hod/lock-matrix/${termId}/validate`).then(r => r?.data ?? r),
    lockDepartmentMatrix: (termId) => request('POST', `/hod/lock-matrix/${termId}`),
    unlockDepartmentMatrix: (termId) => request('POST', `/hod/unlock-matrix/${termId}`),
    exportWAECCSV: (termId, className) => exportWAECCSVDownload(termId, className, 'Subject', null),
    exportWAECPDF: (termId) => request('POST', `/hod/export-waec/${termId}`, { format: 'pdf' }),
    getGradeComparison: (subjectId, termA, termB) =>
      request('GET', `/hod/grades/compare`, undefined, { subjectId, termA, termB }).then(r => r?.data ?? r),
    updateHODComment: (recordId, comment) => request('PATCH', `/hod/records/${recordId}/comment`, { comment }),
    rejectGradeRevision: (recordId, reason) => request('POST', `/hod/records/${recordId}/reject`, { reason }),
    approveGradeRevision: (recordId, comment) =>
      request('POST', `/hod/records/${recordId}/approve`, { comment }),
    getGradeRevisions: () => request('GET', '/hod/grade-revisions').then(r => r?.data ?? r),
    getArchivedDepartmentData: (params = {}) => request('GET', '/hod/archive', undefined, params).then(r => r?.data ?? r),
    getPromotionRecommendations: (params = {}) => request('GET', '/hod/archive/promotions', undefined, params).then(r => r?.data ?? r),

    // ── Phase 5: HOD Settings ─────────────────────────────────────────────────
    getHODSettings: () => request('GET', '/hod/settings').then(r => r?.data ?? r),
    updateHODSettings: (settings) => request('PUT', '/hod/settings', settings).then(r => r?.data ?? r),
    changePassword: (currentPassword, newPassword) =>
      request('POST', '/hod/settings/change-password', { currentPassword, newPassword }).then(r => r?.data ?? r),
    mfaEnroll: () => request('POST', '/hod/settings/mfa/enroll').then(r => r?.data ?? r),
    mfaVerify: (code) => request('POST', '/hod/settings/mfa/verify', { code }).then(r => r?.data ?? r),
    getActiveSessions: () => request('GET', '/hod/settings/sessions').then(r => r?.data ?? r),
    revokeSession: (sessionId) => request('DELETE', `/hod/settings/sessions/${sessionId}`),

    // ── Phase 6: HOD Support ─────────────────────────────────────────────────────
    getSupportTickets: (params = {}) => request('GET', '/hod/support/tickets', undefined, params).then(r => r?.data ?? r),
    createSupportTicket: (ticket) =>
      request('POST', '/hod/support/tickets', ticket).then(r => r?.data ?? r),
    updateSupportTicket: (ticketId, patch) =>
      request('PATCH', `/hod/support/tickets/${ticketId}`, patch).then(r => r?.data ?? r),
    escalateTicket: (ticketId, body) =>
      request('POST', `/hod/support/tickets/${ticketId}/escalate`, body).then(r => r?.data ?? r),
    getSystemHealth: () => request('GET', '/hod/system-health').then(r => r?.data ?? r),
    getEscalatedIssues: (params = {}) => request('GET', '/hod/escalations', undefined, params).then(r => r?.data ?? r),
    createEscalation: (body) => request('POST', '/hod/escalations', body).then(r => r?.data ?? r),
    getContactChannels: () => request('GET', '/hod/contact-channels').then(r => r?.data ?? r),
    updateContactChannels: (channels) => request('PUT', '/hod/contact-channels', channels).then(r => r?.data ?? r),

    // ── Phase 7: Access & Security ───────────────────────────────────────────────
    resetTeacherPassword: (teacherId, newPassword) =>
      request('POST', `/hod/teachers/${teacherId}/reset-password`, { newPassword }).then(r => r?.data ?? r),
    getDepartmentTeachers: (params = {}) => request('GET', '/hod/teachers', undefined, params).then(r => r?.data ?? r),
    impersonateTeacher: (teacherId, body = {}) =>
      request('POST', `/hod/impersonate/${teacherId}`, body).then(r => r?.data ?? r),
    stopImpersonation: () => request('POST', '/hod/impersonate/stop').then(r => r?.data ?? r),
    getActiveImpersonations: () => request('GET', '/hod/impersonate/active').then(r => r?.data ?? r),
    getStudentAcademicHistory: (studentId) =>
       request('GET', `/hod/students/${studentId}/academic-history`).then(r => r?.data ?? r),
    getAllAcademicYears: () => request('GET', '/academic/years').then(r => r?.data ?? r),
   };
 }

export const hodService = USE_MOCK ? mockHodService : createRealService();