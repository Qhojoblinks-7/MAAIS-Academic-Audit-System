import { getAuthToken } from './auth';
import { calcRoman } from '../constants/grading';
import Papa from 'papaparse';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const DEFAULT_TIMEOUT = 15000;
const MAX_RETRIES = 2;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

function getHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const pendingRequests = new Map();

function dedupeKey(method, path, body, queryParams) {
  return `${method}:${path}:${JSON.stringify(body ?? null)}:${JSON.stringify(queryParams ?? null)}`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(method, path, body, queryParams, timeout = DEFAULT_TIMEOUT) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  if ((method === 'GET' || method === 'HEAD') && queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value != null && value !== '') url.searchParams.set(key, value);
    });
  }

  const key = dedupeKey(method, path, body, queryParams);
  if (method === 'GET' && pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  const promise = (async () => {
    let attempt = 0;
    while (true) {
      attempt += 1;
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        const res = await fetch(url.toString(), {
          method,
          headers: getHeaders(),
          credentials: 'include',
          signal: controller.signal,
          ...(method !== 'GET' && method !== 'HEAD' && body !== undefined ? { body: JSON.stringify(body) } : {}),
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
  const dataRows = (rows || []).map((s) => ({
    'Index': s.index ?? '',
    'Student Name': s.name ?? '',
    'SBA': s.sba ?? 0,
    'Exam': s.exam ?? 0,
    'Final': s.final ?? 0,
    'Grade': s.grade ?? '',
    'Roman': calcRoman(s.grade),
  }));
  const csv = Papa.unparse(dataRows, { columns: headers });
  return csv;
}

export async function exportWAECCSVDownload(termId, className, subjectName, rows) {
  const filename = `WAEC_${subjectName}_${className}.csv`;
  try {
    const res = await requestExport(
      'GET',
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
    lockDepartmentMatrix: (classId) => request('POST', `/hod/lock-class/${classId}`),
    unlockDepartmentMatrix: (classId) => request('POST', `/hod/unlock-class/${classId}`),
    lockTerm: (termId) => request('POST', `/hod/lock-matrix/${termId}`),
    unlockTerm: (termId) => request('POST', `/hod/unlock-matrix/${termId}`),
    exportWAECCSV: (termId, className) => exportWAECCSVDownload(termId, className, 'Subject', null),
    exportDepartmentWAECCSV: (termId) => requestExport('GET', `/hod/export-waec/${encodeURIComponent(termId)}/department`).then(res => downloadResponse(res, `WAEC_Department_${termId}.csv`)),
    exportWAECPDF: (termId, className) => requestExport('GET', `/hod/export-waec/${encodeURIComponent(termId)}/pdf?class=${encodeURIComponent(className)}`).then(res => downloadResponse(res, `WAEC_${className}_${termId}.pdf`)),
    exportDepartmentWAECPDF: (termId) => requestExport('GET', `/hod/export-waec/${encodeURIComponent(termId)}/pdf/department`).then(res => downloadResponse(res, `WAEC_Department_${termId}.pdf`)),
    getGradeComparison: (subjectId, termA, termB) =>
      request('GET', `/hod/grades/compare`, undefined, { subjectId, termA, termB }).then(r => r?.data ?? r),
    updateHODComment: (recordId, comment) => request('PATCH', `/hod/records/${recordId}/comment`, { comment }),
    updateAuditLogComment: (logId, comment) => request('PATCH', `/hod/audit-logs/${logId}/comment`, { comment }),
    rejectGradeRevision: (recordId, reason) => request('POST', `/hod/records/${recordId}/reject`, { reason }),
    approveGradeRevision: (recordId, comment) =>
      request('POST', `/hod/records/${recordId}/approve`, { comment }),
    getGradeRevisions: () => request('GET', '/hod/grade-revisions').then(r => r?.data ?? r),
    getArchivedDepartmentData: (params = {}) => request('GET', '/hod/archive', undefined, params).then(r => r?.data ?? r),
    getPromotionRecommendations: (params = {}) => request('GET', '/hod/archive/promotions', undefined, params).then(r => r?.data ?? r),
    bulkApproveRevisions: (recordIds, remark = 'Bulk approved') =>
      request('POST', '/hod/records/bulk-approve', { recordIds, remark }).then(r => r?.data ?? r),
    bulkRejectRevisions: (recordIds, reason = 'Bulk rejected') =>
      request('POST', '/hod/records/bulk-reject', { recordIds, reason }).then(r => r?.data ?? r),
    exportArchivedData: (params = {}) => {
      const url = new URL(`${BASE_URL}/hod/archive/export`, window.location.origin);
      Object.entries(params).forEach(([key, value]) => {
        if (value != null && value !== '') url.searchParams.set(key, value);
      });
      const token = getAuthToken();
      return fetch(url.toString(), {
        method: 'GET',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: 'include',
      }).then(res => {
        if (!res.ok) throw new Error(`Archive export failed: ${res.status}`);
        return res.blob();
      });
    },

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
    getTeacherSubmissionTrends: () =>
       request('GET', '/hod/teachers/submissions/trends').then(r => r?.data ?? r),
    impersonateTeacher: (teacherId, body = {}) =>
      request('POST', `/hod/impersonate/${teacherId}`, body).then(r => r?.data ?? r),
    stopImpersonation: () => request('POST', '/hod/impersonate/stop').then(r => r?.data ?? r),
    getActiveImpersonations: () => request('GET', '/hod/impersonate/active').then(r => r?.data ?? r),
    getStudentAcademicHistory: (studentId) =>
       request('GET', `/hod/students/${studentId}/academic-history`).then(r => r?.data ?? r),
    getComplianceCohortPerformance: () =>
       request('GET', '/hod/compliance/cohort-performance').then(r => r?.data ?? r),
    getComplianceTimeline: () =>
       request('GET', '/hod/compliance/timeline').then(r => r?.data ?? r),
    getAllAcademicYears: () =>
       request('GET', '/hod/academic-years').then(r => r?.data ?? r),
    resolveAlert: (alertId) =>
       request('POST', `/hod/intervention-alerts/${alertId}/resolve`).then(r => r?.data ?? r),
    addCounselingNote: ({ alertId, text }) =>
       request('POST', `/hod/intervention-alerts/${alertId}/notes`, { text }).then(r => r?.data ?? r),

    requestGradeRevision: (revisionData) =>
       request('POST', '/teacher/grade-revisions', revisionData).then(r => r?.data ?? r),
    requestHODGradeRevision: (revisionData) =>
       request('POST', '/hod/grade-revisions', revisionData).then(r => r?.data ?? r),
    approveGradeEntry: (gradeEntryId, comment) =>
       request('POST', `/hod/grades/${gradeEntryId}/approve`, { comment }),
  };
}

export const hodService = createRealService();