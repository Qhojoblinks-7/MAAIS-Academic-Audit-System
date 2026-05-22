import { getAuthToken } from './auth';

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
    const err = new Error(`AuditTrail request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? undefined : res.json();
}

class AuditTrailService {
  async logChange(entityType, entityId, oldValue, newValue, justification, metadata = {}) {
    const payload = {
      entityType,
      entityId,
      oldValue,
      newValue,
      justification,
      metadata,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
    };
    return request('POST', '/api/audit-trail', payload);
  }

  async getHistory(entityType, entityId, options = {}) {
    const params = new URLSearchParams(options).toString();
    return request('GET', `/api/audit-trail/${entityType}/${entityId}?${params}`);
  }

  async getEntityChanges(entityType, startDate, endDate) {
    return request('GET', `/api/audit-trail/${entityType}/changes?start=${startDate}&end=${endDate}`);
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