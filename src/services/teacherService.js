import { getAuthToken } from './auth';
import mockTeacherService from './mockTeacherService';

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

function createRealService() {
  return {
    getClasses: (teacherId, params = {}) =>
      request('GET', `/api/teacher/classes/${teacherId}`, params ? { params } : undefined)
        .then(r => r?.data ?? r),
    getAnalytics: (teacherId) =>
      request('GET', `/api/teacher/classes/${teacherId}/analytics`).then(r => r?.data ?? r),
    getObservations: (teacherId, params = {}) =>
      request('GET', `/api/teacher/classes/${teacherId}/observations`, params ? { params } : undefined)
        .then(r => r?.data ?? r),
    getSupportObservations: () =>
      request('GET', '/api/teacher/support/observations').then(r => r?.data ?? r),
    getGradeIssues: () =>
      request('GET', '/api/teacher/grade-issues').then(r => r?.data ?? r),
    getGradeIssueStatusMeta: () =>
      request('GET', '/api/teacher/grade-issues/meta').then(r => r?.data ?? r),
    getTimetable: (teacherId) =>
      request('GET', `/api/timetable?teacher_id=${teacherId}`).then(r => r?.data ?? r),
    getSettingsClasses: () =>
      request('GET', '/api/teacher/settings/classes').then(r => r?.data ?? r),
    getNotificationPreferences: () =>
      request('GET', '/api/teacher/settings/preferences').then(r => r?.data ?? r),
    getProfile: () =>
      request('GET', '/api/teacher/profile').then(r => r?.data ?? r),
    getGradingStudents: (subject, className) =>
      request('GET', `/api/teacher/grading/students?subject=${encodeURIComponent(subject)}&class=${encodeURIComponent(className)}`)
        .then(r => r?.data ?? r),
    getSubjectConfig: () =>
      request('GET', '/api/teacher/subject-config').then(r => r?.data ?? r),
    getGradingStatusMeta: () =>
      request('GET', '/api/teacher/grading/status-meta').then(r => r?.data ?? r),
    getGradingFilterOptions: () =>
      request('GET', '/api/teacher/grading/filters').then(r => r?.data ?? r),
    getObservationTypes: () =>
      request('GET', '/api/teacher/observation-types').then(r => r?.data ?? r),
    getObservationColors: () =>
      request('GET', '/api/teacher/observation-colors').then(r => r?.data ?? r),
    getAnalyticsObservationColors: () =>
      request('GET', '/api/teacher/analytics-observation-colors').then(r => r?.data ?? r),
    getGradeConfig: () =>
      request('GET', '/api/teacher/grade-config').then(r => r?.data ?? r),
    createObservation: (observation) =>
      request('POST', '/api/teacher/observations', observation).then(r => r?.data ?? r),
    updateObservation: (observationId, patch) =>
      request('PATCH', `/api/teacher/observations/${observationId}`, patch).then(r => r?.data ?? r),
deleteObservation: (observationId) =>
       request('DELETE', `/api/teacher/observations/${observationId}`).then(r => r?.data ?? r),
    submitGradeRevision: (revisionData) =>
       request('POST', '/api/teacher/grade-revisions', revisionData).then(r => r?.data ?? r),
    updateGradeRevision: (revisionId, updatedData) =>
       request('PATCH', `/api/teacher/grade-revisions/${revisionId}`, updatedData).then(r => r?.data ?? r),
 };
}

export const teacherService = USE_MOCK ? mockTeacherService : createRealService();