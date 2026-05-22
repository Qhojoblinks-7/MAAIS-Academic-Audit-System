import { getAuthToken } from './auth';
import { calcRoman } from '../pages/shared/GradingSheet.constants';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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

/**
 * Returns the response directly (may be a Blob or JSON).
 * Callers decide whether to blob-download or parse JSON.
 */
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

/**
 * Download a response as a file.
 * @param {Response} res
 * @param {string}  filename
 */
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

/**
 * WAEC STP CSV columns per SAD.txt §76 and GradingSheet.constants.calcRoman.
 * Columns: Index, Student Name, SBA, Exam, Final, Grade, Roman
 *
 * @param {Array<{ index: string, name: string, sba: number, exam: number, final: number, grade: string }>} rows
 * @param {string} subjectName
 * @param {string} className
 * @returns {string}
 */
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

/**
 * Trigger a WAEC CSV download for a single class.
 * Tries server-side export first; falls back to locally generated CSV from
 * `rows` when the API is unavailable or returns non-CSV content.
 *
 * @param {string} termId
 * @param {string} className
 * @param {string} subjectName
 * @param {Array} rows  — optional student rows for client-side fallback
 */
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

export const hodService = {
  getAuditLogs: (params = {}) => request('GET', '/api/hod/audit-logs', params ? { params } : undefined).then(r => r?.data ?? r),
  getInterventionAlerts: (params = {}) => request('GET', '/api/hod/intervention-alerts', params ? { params } : undefined).then(r => r?.data ?? r),
  getDepartmentProgress: () => request('GET', '/api/hod/department-progress').then(r => r?.data ?? r),
  getTeacherSubmissionStatus: () => request('GET', '/api/hod/teachers/submissions').then(r => r?.data ?? r),
  getLockedTerms: () => request('GET', '/api/hod/locked-terms').then(r => r?.data ?? r),
  lockDepartmentMatrix: (termId) => request('POST', `/api/hod/lock-matrix/${termId}`),
  unlockDepartmentMatrix: (termId) => request('POST', `/api/hod/unlock-matrix/${termId}`),
  exportWAECCSV: (termId, className) => exportWAECCSVDownload(termId, className, 'Subject', null),
  exportWAECPDF: (termId) => request('POST', `/api/hod/export-waec/${termId}`, { format: 'pdf' }),
  getGradeComparison: (subjectId, termA, termB) => request('GET', `/api/hod/grades/compare?subjectId=${subjectId}&termA=${termA}&termB=${termB}`).then(r => r?.data ?? r),
  updateHODComment: (recordId, comment) => request('PATCH', `/api/hod/records/${recordId}/comment`, { comment }),
  rejectGradeRevision: (recordId, reason) => request('POST', `/api/hod/records/${recordId}/reject`, { reason }),
  getArchivedDepartmentData: (params = {}) => request('GET', '/api/hod/archive', params ? { params } : undefined).then(r => r?.data ?? r),
  getPromotionRecommendations: (params = {}) => request('GET', '/api/hod/archive/promotions', params ? { params } : undefined).then(r => r?.data ?? r),
  exportArchivedData: (params = {}) => request('GET', '/api/hod/archive/export', params ? { params } : undefined),

  // ── Phase 5: HOD Settings ─────────────────────────────────────────────────

  /**
   * Fetch all HOD settings in one call.
   * @returns {Promise<Object>}
   */
  getHODSettings: () => request('GET', '/api/hod/settings').then(r => r?.data ?? r),

  /**
   * Persist full HOD settings payload.
   * @param {Object} settings
   * @returns {Promise<Object>}
   */
  updateHODSettings: (settings) => request('PUT', '/api/hod/settings', settings).then(r => r?.data ?? r),

  /**
   * Change the HOD account password.
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<Object>}
   */
  changePassword: (currentPassword, newPassword) =>
    request('POST', '/api/hod/settings/change-password', { currentPassword, newPassword }).then(r => r?.data ?? r),

  /**
   * Initiate MFA enrollment — returns QR code URL / secret.
   * @returns {Promise<Object>}
   */
  mfaEnroll: () => request('POST', '/api/hod/settings/mfa/enroll').then(r => r?.data ?? r),

  /**
   * Verify a TOTP code during MFA enrollment.
   * @param {string} code
   * @returns {Promise<Object>}
   */
  mfaVerify: (code) => request('POST', '/api/hod/settings/mfa/verify', { code }).then(r => r?.data ?? r),

  /**
   * List all active HOD sessions (for session management).
   * @returns {Promise<Array>}
   */
  getActiveSessions: () => request('GET', '/api/hod/settings/sessions').then(r => r?.data ?? r),

  /**
   * Revoke a specific session by id.
   * @param {string} sessionId
   * @returns {Promise<Object>}
   */
  revokeSession: (sessionId) => request('DELETE', `/api/hod/settings/sessions/${sessionId}`).then(r => r?.data ?? r),

  // ── Phase 6: HOD Support ─────────────────────────────────────────────────────

  /**
   * Fetch the HOD's support tickets with optional filters.
   * GET /api/hod/support/tickets?status=OPEN&priority=HIGH&page=1
   * @param {Object} params  — { status, priority, page, q }
   * @returns {Promise<Object>}  — { tickets: Array, total: number, page: number }
   */
  getSupportTickets: (params = {}) =>
    request('GET', '/api/hod/support/tickets', params ? { params } : undefined).then(r => r?.data ?? r),

  /**
   * Create a new support ticket on behalf of the HOD.
   * POST /api/hod/support/tickets
   * @param {Object} ticket  — { subject, description, departmentId, priority }
   * @returns {Promise<Object>}
   */
  createSupportTicket: (ticket) =>
    request('POST', '/api/hod/support/tickets', ticket).then(r => r?.data ?? r),

  /**
   * Update a ticket status / add an internal note.
   * PATCH /api/hod/support/tickets/:id
   * @param {string} ticketId
   * @param {Object} patch  — { status, internalNote, assignedTo }
   * @returns {Promise<Object>}
   */
  updateSupportTicket: (ticketId, patch) =>
    request('PATCH', `/api/hod/support/tickets/${ticketId}`, patch).then(r => r?.data ?? r),

  /**
   * Escalate a ticket to a supervisor / director level.
   * POST /api/hod/support/tickets/:id/escalate
   * @param {string} ticketId
   * @param {Object} body  — { reason, notifyHod, notifySupervisor }
   * @returns {Promise<Object>}
   */
  escalateTicket: (ticketId, body) =>
    request('POST', `/api/hod/support/tickets/${ticketId}/escalate`, body).then(r => r?.data ?? r),

  /**
   * Get current system health metrics.
   * GET /api/hod/system-health
   * @returns {Promise<Object>}  — { status, uptime, cpu, memory, disk, services, lastUpdated }
   */
  getSystemHealth: () =>
    request('GET', '/api/hod/system-health').then(r => r?.data ?? r),

  /**
   * Get all escalated issues across the department.
   * GET /api/hod/escalations
   * @param {Object} params  — { status, priority, q }
   * @returns {Promise<Array>}
   */
  getEscalatedIssues: (params = {}) =>
    request('GET', '/api/hod/escalations', params ? { params } : undefined).then(r => r?.data ?? r),

  /**
   * Create a new department-wide escalation.
   * POST /api/hod/escalations
   * @param {Object} body  — { title, description, severity, notifyAllTeachers }
   * @returns {Promise<Object>}
   */
  createEscalation: (body) =>
    request('POST', '/api/hod/escalations', body).then(r => r?.data ?? r),

  /**
   * Get the HOD's preferred contact channels.
   * GET /api/hod/contact-channels
   * @returns {Promise<Object>}  — { email, phone, whatsapp, preferredChannel }
   */
  getContactChannels: () =>
    request('GET', '/api/hod/contact-channels').then(r => r?.data ?? r),

  /**
   * Update the HOD's contact-channel preferences.
   * PUT /api/hod/contact-channels
   * @param {Object} channels  — { email, phone, whatsapp, preferredChannel }
   * @returns {Promise<Object>}
   */
  updateContactChannels: (channels) =>
    request('PUT', '/api/hod/contact-channels', channels).then(r => r?.data ?? r),

  // ── Phase 7: Access & Security ───────────────────────────────────────────────

  /**
   * Reset a teacher's password — requires admin/HOD privilege.
   * POST /api/hod/teachers/:teacherId/reset-password
   * @param {string} teacherId
   * @param {string} newPassword  — optional; generates random if omitted
   * @returns {Promise<Object>}  — { success, message, temporaryPassword }
   */
  resetTeacherPassword: (teacherId, newPassword) =>
    request('POST', `/api/hod/teachers/${teacherId}/reset-password`, { newPassword }).then(r => r?.data ?? r),

  /**
   * List all teachers in the HOD's department.
   * GET /api/hod/teachers
   * @param {Object} params  — { search }
   * @returns {Promise<Array>}
   */
  getDepartmentTeachers: (params = {}) =>
    request('GET', '/api/hod/teachers', params ? { params } : undefined).then(r => r?.data ?? r),

  /**
   * Initiate impersonation of a teacher — returns a short-lived session token.
   * POST /api/hod/impersonate/:teacherId
   * @param {string} teacherId
   * @param {Object} body  — { reason }
   * @returns {Promise<Object>}  — { token, teacherId, reason, expiresAt }
   */
  impersonateTeacher: (teacherId, body = {}) =>
    request('POST', `/api/hod/impersonate/${teacherId}`, body).then(r => r?.data ?? r),

  /**
   * End an active impersonation session.
   * POST /api/hod/impersonate/stop
   * @returns {Promise<Object>}
   */
  stopImpersonation: () =>
    request('POST', '/api/hod/impersonate/stop').then(r => r?.data ?? r),

  /**
   * Fetch the list of currently active impersonation sessions for this HOD.
   * GET /api/hod/impersonate/active
   * @returns {Promise<Array>}
   */
  getActiveImpersonations: () =>
    request('GET', '/api/hod/impersonate/active').then(r => r?.data ?? r),
};
