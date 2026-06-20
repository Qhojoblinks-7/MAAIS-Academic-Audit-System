import { getAuthToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function getHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function normalizeTimetableEntries(entries) {
  if (!Array.isArray(entries)) return [];

  return entries.map((entry) => ({
    ...entry,
    day: entry.day || capitalize(entry.dayOfWeek || ''),
    subject: entry.subject?.name || entry.subjectName || 'Unknown Subject',
    subjectName: entry.subjectName || entry.subject?.name || 'Unknown Subject',
    className: entry.className || entry.classSection?.name || 'Unknown Class',
    venue: entry.venue || entry.room || '-',
    type: entry.type || 'CLASS',
  }));
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
    getClasses: (teacherId, params = undefined) =>
      request('GET', `/teacher/classes/${teacherId}`, params ? { params } : undefined)
        .then(r => r?.data ?? r),
    getAnalytics: (teacherId) =>
      request('GET', `/teacher/classes/${teacherId}/analytics`).then(r => r?.data ?? r),
    getObservations: (teacherId, params = {}) =>
      request('GET', `/teacher/classes/${teacherId}/observations`, params ? { params } : undefined)
        .then(r => r?.data ?? r),
    getGradeRevisions: (teacherId) =>
      request('GET', `/teacher/grade-revisions`).then(r => r?.data ?? r),
getMissingObservations: () =>
      request('GET', '/grading/audit-tray').then(r => {
        const data = r?.data ?? r ?? [];
        if (!Array.isArray(data)) return [];
        return data.map(o => ({
          id: o.id,
          student: o.student ? `${o.student.firstName || ''} ${o.student.lastName || ''}`.trim() : 'Unknown',
          index: o.student?.indexNumber || '',
          class: 'Unknown Class',
          teacher: 'Unknown',
          type: o.subject?.name || 'Unknown Subject',
          status: 'Missing',
          date: o.createdAt ? new Date(o.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        }));
      }),
    getSupportObservations: () =>
      request('GET', '/teacher/support/observations').then(r => r?.data ?? r),
    getGradeIssues: () =>
      request('GET', '/teacher/grade-issues').then(r => r?.data ?? r),
    getGradeIssueStatusMeta: () =>
      request('GET', '/teacher/grade-issues/meta').then(r => r?.data ?? r),
    getTimetable: (teacherId) =>
      request('GET', `/timetable?teacherId=${encodeURIComponent(teacherId)}`).then(r => normalizeTimetableEntries(r?.data ?? r)),
    submitGradeRevision: (revisionData) =>
      request('POST', '/teacher/grade-revisions', revisionData).then(r => r?.data ?? r),
    updateGradeRevision: (revisionId, updatedData) =>
      request('PATCH', `/teacher/grade-revisions/${revisionId}`, updatedData).then(r => r?.data ?? r),
    getSettingsClasses: () =>
      request('GET', '/teacher/settings/classes').then(r => r?.data ?? r),
    getNotificationPreferences: () =>
      request('GET', '/teacher/settings/preferences').then(r => r?.data ?? r),
    getProfile: () =>
      request('GET', '/teacher/profile').then(r => r?.data ?? r),
    getGradingStudents: (subject, className) =>
      request('GET', `/teacher/grading/students?subject=${encodeURIComponent(subject)}&class=${encodeURIComponent(className)}`)
        .then(r => r?.data ?? r),
    getSubjectConfig: () =>
      request('GET', '/teacher/subject-config').then(r => r?.data ?? r),
    getGradingStatusMeta: () =>
      request('GET', '/teacher/grading/status-meta').then(r => r?.data ?? r),
    getGradingFilterOptions: () =>
      request('GET', '/teacher/grading/filters').then(r => r?.data ?? r),
    getObservationTypes: () =>
      request('GET', '/teacher/observation-types').then(r => r?.data ?? r),
    getObservationColors: () =>
      request('GET', '/teacher/observation-colors').then(r => r?.data ?? r),
    getAnalyticsObservationColors: () =>
      request('GET', '/teacher/analytics-observation-colors').then(r => r?.data ?? r),
    getGradeConfig: () =>
      request('GET', '/teacher/grade-config').then(r => r?.data ?? r),
    createObservation: (observation) =>
      request('POST', '/teacher/observations', observation).then(r => r?.data ?? r),
    updateObservation: (observationId, patch) =>
      request('PATCH', `/teacher/observations/${observationId}`, patch).then(r => r?.data ?? r),
    deleteObservation: (observationId) =>
       request('DELETE', `/teacher/observations/${observationId}`).then(r => r?.data ?? r),
    submitGradeRevision: (revisionData) =>
       request('POST', '/teacher/grade-revisions', revisionData).then(r => r?.data ?? r),
    updateGradeRevision: (revisionId, updatedData) =>
       request('PATCH', `/teacher/grade-revisions/${revisionId}`, updatedData).then(r => r?.data ?? r),
  };
}

export const teacherService = createRealService();