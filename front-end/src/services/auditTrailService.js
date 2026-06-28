import { getAuthToken } from './auth';

const USE_MOCK = false;

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

function getHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  if (USE_MOCK) {
    if (method === 'GET') return [];
    return { success: true };
  }
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
    const base = this.getBasePath();
    return request('POST', `${base}/audit-logs`, {
      entity: entityType,
      entityId,
      oldValue,
      newValue,
      justification,
      metadata,
    });
  }

  async logHODAction(actionType, actorId, targetId, details = {}, severity = 'INFO') {
    const base = this.getBasePath();
    return request('POST', `${base}/audit-logs`, {
      entity: 'HODAction',
      entityId: targetId,
      metadata: { actionType, actorId, details, severity },
    });
  }

  async logImpersonation(teacherId, hodId, reason, sessionStart = true) {
    const base = this.getBasePath();
    return request('POST', `${base}/audit-logs`, {
      entity: 'Impersonation',
      entityId: teacherId,
      metadata: { hodId, reason, sessionStart },
    });
  }

  async getViewAsLogs(filters = {}) {
    if (USE_MOCK) return [];
    const base = this.getBasePath();
    const qs = new URLSearchParams();
    if (filters.entity) qs.set('entity', filters.entity);
    if (filters.userId) qs.set('userId', filters.userId);
    const queryStr = qs.toString() ? `?${qs.toString()}` : '';
    const result = await request('GET', `${base}/audit-logs${queryStr}`);
    return result?.logs || [];
  }

  async getHistory(entityType, entityId, options = {}) {
    if (USE_MOCK) return [];
    const base = this.getBasePath();
    const qs = new URLSearchParams();
    qs.set('entity', entityType);
    qs.set('entityId', entityId);
    const result = await request('GET', `${base}/audit-logs?${qs.toString()}`);
    return result?.logs || [];
  }

  async getEntityChanges(entityType, startDate, endDate) {
    if (USE_MOCK) return [];
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