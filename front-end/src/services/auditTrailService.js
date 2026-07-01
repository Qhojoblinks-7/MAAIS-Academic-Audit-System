import { getAuthToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

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
    const err = new Error(`AuditTrail request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? undefined : res.json();
}

class AuditTrailService {
  constructor() {
    this.useHodApi = false;
  }

  setUseHodApi(enabled) {
    this.useHodApi = enabled;
  }

  getBasePath() {
    return this.useHodApi ? '/hod' : '/admin';
  }

  async logChange(entityType, entityId, oldValue, newValue, justification, metadata = {}) {
    return request('POST', '/hod/audit-logs', {
      entity: entityType,
      entityId,
      oldValue,
      newValue,
      justification,
      metadata,
    });
  }

  async logHODAction(actionType, actorId, targetId, details = {}, severity = 'INFO') {
    return request('POST', '/hod/audit-logs', {
      entity: 'HODAction',
      entityId: targetId,
      metadata: { actionType, actorId, details, severity },
    });
  }

  async logImpersonation(teacherId, hodId, reason, sessionStart = true) {
    return request('POST', '/hod/audit-logs', {
      entity: 'Impersonation',
      entityId: teacherId,
      metadata: { hodId, reason, sessionStart },
    });
  }

  async getViewAsLogs(filters = {}) {
    const base = this.getBasePath();
    const qs = new URLSearchParams();
    if (filters.entity) qs.set('entity', filters.entity);
    if (filters.userId) qs.set('userId', filters.userId);
    const queryStr = qs.toString() ? `?${qs.toString()}` : '';
    const result = await request('GET', `${base}/audit-logs${queryStr}`);
    return result?.logs || [];
  }

  async getHistory(entityType, entityId, options = {}) {
    const base = this.getBasePath();
    const qs = new URLSearchParams();
    qs.set('entity', entityType);
    qs.set('entityId', entityId);
    const result = await request('GET', `${base}/audit-logs?${qs.toString()}`);
    return result?.logs || [];
  }

  async getEntityChanges(entityType, startDate, endDate) {
    const base = this.getBasePath();
    const qs = new URLSearchParams();
    qs.set('entity', entityType);
    if (startDate) qs.set('startDate', startDate);
    if (endDate) qs.set('endDate', endDate);
    const result = await request('GET', `${base}/audit-logs?${qs.toString()}`);
    return result?.logs || [];
  }

  getCurrentUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || null;
    } catch {
      return null;
    }
  }

  captureSnapshot(data) {
    return JSON.parse(JSON.stringify(data));
  }
}

export const auditTrail = new AuditTrailService();