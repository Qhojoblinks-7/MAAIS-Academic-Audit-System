import { api } from './client';

function normalizeTimetableEntries(entries) {
  if (!Array.isArray(entries)) return [];

  return entries.map((entry) => ({
    ...entry,
    day: entry.day || entry.dayOfWeek,
    subject: entry.subject?.name || entry.subjectName || 'Unknown Subject',
    subjectName: entry.subjectName || entry.subject?.name || 'Unknown Subject',
    className: entry.className || entry.classSection?.name || 'Unknown Class',
    venue: entry.venue || entry.room || '-',
    type: entry.type || 'CLASS',
  }));
}

export const teacherApi = {
  getClasses: (teacherId, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== '') query.set(key, value);
    });
    const qs = query.toString();
    return api.get(qs ? `/teacher/classes/${teacherId}?${qs}` : `/teacher/classes/${teacherId}`);
  },

  getAnalytics: (teacherId) =>
    api.get(`/teacher/classes/${teacherId}/analytics`),

  getObservations: (teacherId, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== '') query.set(key, value);
    });
    const qs = query.toString();
    return api.get(qs ? `/teacher/classes/${teacherId}/observations?${qs}` : `/teacher/classes/${teacherId}/observations`);
  },

  getSupportObservations: () =>
    api.get('/teacher/support/observations'),

  getGradeIssues: () =>
    api.get('/teacher/grade-issues'),

  getGradeIssueStatusMeta: () =>
    api.get('/teacher/grade-issues/meta'),

  getTimetable: (teacherId) =>
    api.get(`/timetable?teacherId=${encodeURIComponent(teacherId)}`).then(normalizeTimetableEntries),

  getSettingsClasses: () =>
    api.get('/teacher/settings/classes'),

  getNotificationPreferences: () =>
    api.get('/teacher/settings/preferences'),

  getProfile: () =>
    api.get('/teacher/profile'),

  getGradingStudents: (subject, className) =>
    api.get(`/teacher/grading/students?subject=${encodeURIComponent(subject)}&class=${encodeURIComponent(className)}`),

  getSubjectConfig: () =>
    api.get('/teacher/subject-config'),

  getGradingStatusMeta: () =>
    api.get('/teacher/grading/status-meta'),

  getGradingFilterOptions: () =>
    api.get('/teacher/grading/filters'),

  getObservationTypes: () =>
    api.get('/teacher/observation-types'),

  getObservationColors: () =>
    api.get('/teacher/observation-colors'),

  getAnalyticsObservationColors: () =>
    api.get('/teacher/analytics-observation-colors'),

  getGradeConfig: () =>
    api.get('/teacher/grade-config'),

  createObservation: (observation) =>
    api.post('/teacher/observations', observation),

  updateObservation: (observationId, patch) =>
    api.patch(`/teacher/observations/${observationId}`, patch),

  deleteObservation: (observationId) =>
    api.delete(`/teacher/observations/${observationId}`),

  submitGradeRevision: (revisionData) =>
    api.post('/teacher/grade-revisions', revisionData),

  updateGradeRevision: (revisionId, updatedData) =>
    api.patch(`/teacher/grade-revisions/${revisionId}`, updatedData),
};

export default teacherApi;
