import { getAuthToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

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
  console.log(`[TeacherService] ${method} ${path}`, body ? { body } : '');
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: getHeaders(),
    credentials: 'include',
    ...(body != null && method !== 'GET' && method !== 'HEAD' ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    let errorBody;
    try {
      errorBody = await res.clone().json();
    } catch {
      errorBody = await res.text();
    }
    const err = new Error(`Request failed: ${res.status} ${method} ${path}`);
    err.status = res.status;
    err.response = errorBody;
    console.error(`[TeacherService] ${method} ${path} failed:`, JSON.stringify(errorBody, null, 2));
    throw err;
  }

  if (res.status === 204) return undefined;
  const data = await res.json();
  console.log(`[TeacherService] ${method} ${path} succeeded`, data ? JSON.stringify(data, null, 2) : '');
  return data;
}

function createRealService() {
  return {
    getClasses: (teacherId, params = undefined) => {
      console.log(`[TeacherService] getClasses called with teacherId: ${teacherId}`);
      return request('GET', `/teacher/classes/${teacherId}`, params ? { params } : undefined)
        .then(r => r?.data ?? r);
    },
    getProfile: () => {
      console.log('[TeacherService] getProfile called');
      return request('GET', '/teacher/profile').then(r => r?.data ?? r);
    },
    getAnalytics: (teacherId) => {
      console.log(`[TeacherService] getAnalytics called with teacherId: ${teacherId}`);
      return request('GET', `/teacher/classes/${teacherId}/analytics`)
        .then(r => normalizeAnalyticsPayload(r?.data ?? r));
    },
    getObservations: (teacherId, params = {}) => {
      console.log(`[TeacherService] getObservations called with teacherId: ${teacherId}`);
      return request('GET', `/teacher/classes/${teacherId}/observations`, params ? { params } : undefined)
        .then(r => r?.data ?? r);
    },
    getGradeRevisions: (teacherId) => {
      console.log(`[TeacherService] getGradeRevisions called`);
      return request('GET', `/teacher/grade-revisions`).then(r => r?.data ?? r);
    },
    getMissingObservations: () => {
      console.log('[TeacherService] getMissingObservations called');
      return request('GET', '/teacher/missing-observations').then((r) => {
        const data = r?.data ?? r ?? [];
        return Array.isArray(data) ? data : [];
      });
    },
    getObservationLogs: () => {
      console.log('[TeacherService] getObservationLogs called');
      return request('GET', '/teacher/observations').then((r) => {
        const data = r?.data ?? r ?? [];
        return Array.isArray(data) ? data : [];
      });
    },
    getSupportObservations: () => {
      console.log('[TeacherService] getSupportObservations called');
      return request('GET', '/teacher/support/observations').then(r => r?.data ?? r).catch(() => []);
    },
    getGradeIssues: () => {
      console.log('[TeacherService] getGradeIssues called');
      return request('GET', '/teacher/grade-issues').catch(() => []);
    },
    getGradeIssueStatusMeta: () => {
      console.log('[TeacherService] getGradeIssueStatusMeta called');
      return request('GET', '/teacher/grade-issues/meta').catch(() => ({}));
    },
    getTimetable: (teacherId) => {
      console.log(`[TeacherService] getTimetable called with teacherId: ${teacherId}`);
      return request('GET', `/timetable?teacherId=${encodeURIComponent(teacherId)}`)
        .then(r => normalizeTimetableEntries(r?.data ?? r));
    },
    submitGradeRevision: (revisionData) => {
      console.log('[TeacherService] submitGradeRevision called');
      return request('POST', '/teacher/grade-revisions', revisionData).then(r => r?.data ?? r);
    },
    updateGradeRevision: (revisionId, updatedData) => {
      console.log(`[TeacherService] updateGradeRevision called with revisionId: ${revisionId}`);
      return request('PATCH', `/teacher/grade-revisions/${revisionId}`, updatedData).then(r => r?.data ?? r);
    },
    getSettingsClasses: () => {
      console.log('[TeacherService] getSettingsClasses called');
      return request('GET', '/teacher/settings/classes').then(r => r?.data ?? r);
    },
    getNotificationPreferences: () => {
      console.log('[TeacherService] getNotificationPreferences called');
      return request('GET', '/teacher/settings/preferences').then(r => r?.data ?? r);
    },
    updateProfile: (profile) => {
      console.log('[TeacherService] updateProfile called');
      return request('PATCH', '/teacher/profile', profile).then(r => r?.data ?? r);
    },
    submitSupportTicket: (ticketData) => {
      console.log('[TeacherService] submitSupportTicket called');
      return request('POST', '/comms/tickets', ticketData).then(r => r?.data ?? r);
    },
    getGradingStudents: (subject, className) => {
      console.log(`[TeacherService] getGradingStudents called with subject: ${subject}, class: ${className}`);
      return request('GET', `/teacher/grading/students?subject=${encodeURIComponent(subject)}&class=${encodeURIComponent(className)}`)
        .then(r => r?.data ?? r);
    },
    getSubjectConfig: () => {
      console.log('[TeacherService] getSubjectConfig called');
      return request('GET', '/teacher/subject-config').then(r => r?.data ?? r);
    },
    getGradingStatusMeta: () => {
      console.log('[TeacherService] getGradingStatusMeta called');
      return request('GET', '/teacher/grading/status-meta').then(r => r?.data ?? r);
    },
    getGradingFilterOptions: () => {
      console.log('[TeacherService] getGradingFilterOptions called');
      return request('GET', '/teacher/grading/filters').then(r => r?.data ?? r);
    },
    getGradingIds: (subjectName, className) => {
      console.log(`[TeacherService] getGradingIds called with subject: ${subjectName}, class: ${className}`);
      return request('GET', `/teacher/grading/ids?subject=${encodeURIComponent(subjectName)}&class=${encodeURIComponent(className)}`)
        .then(r => r?.data ?? r ?? {});
    },
    bulkUpsertGradeEntries: (entries) => {
      console.log(`[TeacherService] bulkUpsertGradeEntries called with ${entries?.length || 0} entries`);
      const validatedEntries = entries?.map((e, i) => {
        const entry = {
          studentId: e.studentId,
          subjectId: e.subjectId,
          termId: e.termId,
          classScore: e.classScore,
          examScore: e.examScore,
          remark: e.remark,
          hasObservation: e.hasObservation,
          observationText: e.observationText
        };
        console.log(`[TeacherService] Entry ${i}: studentId=${e.studentId}, subjectId=${e.subjectId}, termId=${e.termId}, classScore=${e.classScore}, examScore=${e.examScore}`);
        return entry;
      });
      console.log('[TeacherService] bulkUpsertGradeEntries payload:', JSON.stringify(validatedEntries, null, 2));
      return request('POST', '/grading/entries/bulk', { entries: validatedEntries }).then(r => r?.data ?? r);
    },
    createObservation: (observation) => {
      console.log('[TeacherService] createObservation called');
      return request('POST', '/teacher/observations', normalizeObservationPayload(observation))
        .then(r => r?.data ?? r);
    },
    updateObservation: (observationId, patch) => {
      console.log(`[TeacherService] updateObservation called with observationId: ${observationId}`);
      return request('PATCH', `/teacher/observations/${observationId}`, normalizeObservationPayload(patch))
        .then(r => r?.data ?? r);
    },
    deleteObservation: (observationId) => {
      console.log(`[TeacherService] deleteObservation called with observationId: ${observationId}`);
      return request('DELETE', `/teacher/observations/${observationId}`).then(r => r?.data ?? r);
    },
    getTeacherArchive: () => {
      console.log('[TeacherService] getTeacherArchive called');
      return request('GET', '/archive/vault/search').then(r => r?.data ?? r);
    },
    getStudentPortalData: (studentId) => {
      console.log(`[TeacherService] getStudentPortalData called with studentId: ${studentId}`);
      return request('GET', `/portal/students/${studentId}/portal-data`).then(r => r?.data ?? r);
    },
    getStudentBehavior: (studentId) => {
      console.log(`[TeacherService] getStudentBehavior called with studentId: ${studentId}`);
      return request('GET', `/students/${studentId}/behavior`).then(r => r?.data ?? r);
    },
    createBehavior: (studentId, data) => {
      console.log(`[TeacherService] createBehavior called for studentId: ${studentId}`);
      return request('POST', `/students/${studentId}/behavior`, data).then(r => r?.data ?? r);
    },
    searchTeachers: (query) => {
      console.log(`[TeacherService] searchTeachers called with query: ${query || ''}`);
      return request('GET', `/users/teachers${query ? `?search=${encodeURIComponent(query)}` : ''}`)
        .then((res) => {
          const data = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          return data.map((t) => ({
            id: t.id,
            name: `${t.firstName || ''} ${t.lastName || ''}`.trim() || t.staffId || t.id,
            classForm: t.department?.name || 'Staff',
            indexNumber: t.staffId || '—',
            type: 'teacher',
          }));
        });
    },
  };
}

export const teacherService = createRealService();