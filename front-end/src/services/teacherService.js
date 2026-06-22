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

function normalizeStatus(status) {
  const normalized = String(status || '').toLowerCase();

  if (['active', 'logged'].includes(normalized)) return 'Active';
  if (['pending', 'missing'].includes(normalized)) return 'Pending';
  if (['resolved', 'inactive'].includes(normalized)) return 'Resolved';

  return status || 'Active';
}

function normalizeAnalyticsObservation(observation) {
  const className = firstDefined(observation?.className, observation?.class, observation?.classSection?.name);
  const index = firstDefined(observation?.index, observation?.indexNumber, observation?.studentIndex);
  const type = firstDefined(observation?.type, observation?.subject, observation?.subjectName);
  const comment = firstDefined(observation?.comment, observation?.observationText, observation?.remark);

  return {
    ...observation,
    student: firstDefined(observation?.student, observation?.studentName, observation?.name) || 'Unknown Student',
    className,
    class: className,
    index,
    indexNumber: index,
    studentIndex: index,
    type,
    subject: type,
    subjectName: type,
    comment,
    observationText: comment,
    status: normalizeStatus(observation?.status),
  };
}

function normalizeAnalyticsClassProgress(progress) {
  const subject = firstDefined(progress?.subject, progress?.subjectName, progress?.name);
  const className = firstDefined(progress?.className, progress?.class, progress?.classSection?.name);

  return {
    ...progress,
    subject,
    subjectName: subject,
    className,
    class: className,
    students: Number(progress?.students ?? progress?.studentCount ?? 0),
    completions: Number(progress?.completions ?? progress?.completed ?? 0),
    avgScore: Number(progress?.avgScore ?? progress?.averageScore ?? 0),
  };
}

function normalizeAnalyticsStudentScore(score) {
  const className = firstDefined(score?.className, score?.class, score?.classSection?.name);
  const index = firstDefined(score?.index, score?.indexNumber, score?.studentIndex);
  const type = firstDefined(score?.type, score?.subject, score?.subjectName);
  const trend = firstDefined(score?.trend, score?.trendValue, score?.delta, '0');
  const trendUp = typeof score?.trendUp === 'boolean'
    ? score.trendUp
    : Number(String(trend).replace(/[+%]/g, '')) >= 0;

  return {
    ...score,
    student: firstDefined(score?.student, score?.studentName, score?.name) || 'Unknown Student',
    className,
    class: className,
    index,
    indexNumber: index,
    studentIndex: index,
    type,
    subject: type,
    subjectName: type,
    score: Number(score?.score ?? score?.totalScore ?? 0),
    trend,
    trendUp,
    status: normalizeStatus(score?.status),
  };
}

function normalizeAnalyticsTermTrend(trend) {
  return {
    ...trend,
    term: firstDefined(trend?.term, trend?.name, trend?.label) || 'Unknown Term',
    avg: Number(trend?.avg ?? trend?.average ?? trend?.averageScore ?? 0),
  };
}

function normalizeAnalyticsGradeConfig(config) {
  return {
    ...config,
    label: firstDefined(config?.label, config?.grade),
    min: Number(config?.min ?? config?.minScore ?? 0),
    max: Number(config?.max ?? config?.maxScore ?? 100),
    fill: firstDefined(config?.fill, config?.color),
  };
}

function normalizeAnalyticsPayload(data) {
  const observations = Array.isArray(data?.observations)
    ? data.observations.map(normalizeAnalyticsObservation)
    : [];
  const classProgress = Array.isArray(data?.classProgress)
    ? data.classProgress.map(normalizeAnalyticsClassProgress)
    : [];
  const studentScores = Array.isArray(data?.studentScores)
    ? data.studentScores.map(normalizeAnalyticsStudentScore)
    : [];
  const termTrends = Array.isArray(data?.termTrends)
    ? data.termTrends.map(normalizeAnalyticsTermTrend)
    : [];
  const gradeConfig = Array.isArray(data?.gradeConfig)
    ? data.gradeConfig.map(normalizeAnalyticsGradeConfig)
    : Array.isArray(data?.gradeConfig?.bands)
      ? data.gradeConfig.bands.map(normalizeAnalyticsGradeConfig)
      : undefined;

  return {
    ...(data || {}),
    observations,
    classProgress,
    studentScores,
    termTrends,
    ...(gradeConfig ? { gradeConfig } : {}),
  };
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function normalizeObservationPayload(observation) {
  const className = firstDefined(observation?.className, observation?.class);
  const index = firstDefined(observation?.index, observation?.indexNumber, observation?.studentIndex);
  const subject = firstDefined(observation?.type, observation?.subject, observation?.subjectName);
  const comment = firstDefined(observation?.comment, observation?.observationText, observation?.remark);

  return {
    ...observation,
    className,
    class: className,
    index,
    indexNumber: index,
    studentIndex: index,
    type: subject,
    subject,
    subjectName: subject,
    comment,
    observationText: comment,
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: getHeaders(),
    credentials: 'include',
    ...(body !== undefined && method !== 'GET' && method !== 'HEAD' ? { body: JSON.stringify(body) } : {}),
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
    getProfile: () =>
      request('GET', '/teacher/profile').then(r => r?.data ?? r),
    getAnalytics: (teacherId) =>
      request('GET', `/teacher/classes/${teacherId}/analytics`).then(r => normalizeAnalyticsPayload(r?.data ?? r)),
    getObservations: (teacherId, params = {}) =>
      request('GET', `/teacher/classes/${teacherId}/observations`, params ? { params } : undefined)
        .then(r => r?.data ?? r),
    getGradeRevisions: (teacherId) =>
      request('GET', `/teacher/grade-revisions`).then(r => r?.data ?? r),
    getMissingObservations: () =>
      request('GET', '/grading/audit-tray').then((r) => {
        const data = r?.data ?? r ?? [];
        return Array.isArray(data) ? data : [];
      }),
    getObservationLogs: () =>
      request('GET', '/teacher/observations').then((r) => {
        const data = r?.data ?? r ?? [];
        return Array.isArray(data) ? data : [];
      }),
    getSupportObservations: () =>
      request('GET', '/teacher/support/observations').then(r => r?.data ?? r).catch(() => []),
    getGradeIssues: () =>
      request('GET', '/teacher/grade-issues').catch(() => []),

    getGradeIssueStatusMeta: () =>
      request('GET', '/teacher/grade-issues/meta').catch(() => ({})),
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

    updateProfile: (profile) =>
      request('PATCH', '/teacher/profile', profile).then(r => r?.data ?? r),

    submitSupportTicket: (ticketData) =>
      request('POST', '/comms/tickets', ticketData).then(r => r?.data ?? r),
    getGradingStudents: (subject, className) =>
      request('GET', `/teacher/grading/students?subject=${encodeURIComponent(subject)}&class=${encodeURIComponent(className)}`)
        .then(r => r?.data ?? r),
    getSubjectConfig: () =>
      request('GET', '/teacher/subject-config').then(r => r?.data ?? r),
    getGradingStatusMeta: () =>
      request('GET', '/teacher/grading/status-meta').then(r => r?.data ?? r),
    getGradingFilterOptions: () =>
      request('GET', '/teacher/grading/filters').then(r => r?.data ?? r),
    getGradingIds: (subjectName, className) =>
      request('GET', `/teacher/grading/ids?subject=${encodeURIComponent(subjectName)}&class=${encodeURIComponent(className)}`)
        .then(r => r?.data ?? r ?? {}),
    bulkUpsertGradeEntries: (entries) =>
      request('POST', '/grading/entries/bulk', { entries }).then(r => r?.data ?? r),
    createObservation: (observation) =>
      request('POST', '/teacher/observations', normalizeObservationPayload(observation)).then(r => r?.data ?? r),
    updateObservation: (observationId, patch) =>
      request('PATCH', `/teacher/observations/${observationId}`, normalizeObservationPayload(patch)).then(r => r?.data ?? r),
    deleteObservation: (observationId) =>
      request('DELETE', `/teacher/observations/${observationId}`).then(r => r?.data ?? r),

    getTeacherArchive: () =>
      request('GET', '/archive/vault/search').then(r => r?.data ?? r),

    getStudentPortalData: (studentId) =>
      request('GET', `/portal/students/${studentId}/portal-data`).then(r => r?.data ?? r),

    getObservationLogs: () =>
      request('GET', '/teacher/observations').then((r) => {
        const data = r?.data ?? r ?? [];
        return Array.isArray(data) ? data : [];
      }),

    getStudentBehavior: (studentId) =>
      request('GET', `/students/${studentId}/behavior`).then(r => r?.data ?? r),

    createBehavior: (studentId, data) =>
      request('POST', `/students/${studentId}/behavior`, data).then(r => r?.data ?? r),
  };
}

export const teacherService = createRealService();