import mockApiData from "../data/mockApiData.json";

let mockData = JSON.parse(JSON.stringify(mockApiData));

const simulateDelay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const createMockService = () => ({
  getClasses: async (teacherId, params = {}) => {
    await simulateDelay();
    const classes = mockData.teacher.classes?.items || [];
    let items = [...classes];
    if (params.programme)
      items = items.filter((c) => c.programme === params.programme);
    return items;
  },

  getAnalytics: async (teacherId) => {
    await simulateDelay();
    const analytics = mockData.teacher.analyticsObservations?.items || [];
    const trends = mockData.teacher.termTrends?.items || [];
    const gradeConfig = mockData.teacher.gradeConfig?.bands || [];

    const studentScores = [
      { student: "Ama Serwaa", score: 78, trend: "+3", trendUp: true },
      { student: "Kwame Mensah", score: 65, trend: "-2", trendUp: false },
      { student: "Angela Owusu", score: 82, trend: "+5", trendUp: true }
    ];

    const classProgress = mockData.teacher.classes?.items.map((c) => ({
      subject: c.subject,
      completions: c.progress === 100 ? c.studentCount : Math.round(c.studentCount * c.progress / 100),
      students: c.studentCount,
      avgScore: 78
    })) || [];

    return {
      observations: analytics,
      termTrends: trends,
      studentScores,
      classProgress
    };
  },

  getObservations: async (teacherId, params = {}) => {
    await simulateDelay();
    let items = [...(mockData.teacher.observations?.items || [])];
    if (params.type)
      items = items.filter((i) => i.type === params.type);
    if (params.status)
      items = items.filter((i) => i.status === params.status);
    return { observations: items };
  },

  getSupportObservations: async () => {
    await simulateDelay();
    return mockData.teacher.supportObservations?.items || [];
  },

  getGradeIssues: async () => {
    await simulateDelay();
    return mockData.teacher.gradeIssues?.items || [];
  },

  getGradeIssueStatusMeta: async () => {
    await simulateDelay();
    return mockData.teacher.gradeIssues?.statusMeta || {};
  },

  getTimetable: async (teacherId) => {
    await simulateDelay();
    return mockData.teacher.timetableFallback?.items || [];
  },

  getSettingsClasses: async () => {
    await simulateDelay();
    return mockData.teacher.settingsClasses?.items || [];
  },

  getNotificationPreferences: async () => {
    await simulateDelay();
    return mockData.teacher.notificationPreferences?.items || [];
  },

  getProfile: async () => {
    await simulateDelay();
    const teacher = mockData.users?.teacherUsers?.[0];
    return {
      name: teacher?.name || "Mr. Kwame Mensah",
      department: "Agriculture",
      email: teacher?.email || "kwame.mensah@atu.edu.gh",
      phone: teacher?.phone || "+233244111111",
      staffId: teacher?.id || "teacher001",
      role: "TEACHER"
    };
  },

  getGradingStudents: async (subject, className) => {
    await simulateDelay();
    const key = `${subject}|${className}`;
    return mockData.teacher.gradingStudents?.[key] || [];
  },

  getSubjectConfig: async () => {
    await simulateDelay();
    return {
      "General Agriculture": {
        sections: ["Paper 1 (50)", "Paper 2-Agri (90)", "Paper 3-Pract (60)"],
        maxRaw: 200,
        sectionCount: 3,
        hasPractical: true,
        practicalMarks: 60,
        sbaLabel: "SBA (30%)",
        examLabel: "Exam (70%)"
      },
      "Core Mathematics": {
        sections: ["Sec A (40)", "Sec B (60)"],
        maxRaw: 100,
        sectionCount: 2,
        hasPractical: false,
        practicalMarks: 0,
        sbaLabel: "SBA (30%)",
        examLabel: "Exam (70%)"
      }
    };
  },

  getGradingStatusMeta: async () => {
    await simulateDelay();
    return mockData.teacher.gradingStatusMeta?.mapping || {};
  },

  getGradingFilterOptions: async () => {
    await simulateDelay();
    return mockData.teacher.gradingFilterOptions?.options || [];
  },

  getObservationTypes: async () => {
    await simulateDelay();
    return mockData.teacher.observationTypes?.types || [];
  },

  getObservationColors: async () => {
    await simulateDelay();
    return mockData.teacher.observationTypes?.colors || {};
  },

  getAnalyticsObservationColors: async () => {
    await simulateDelay();
    return mockData.teacher.observationTypes?.analyticsColors || {};
  },

  getGradeConfig: async () => {
    await simulateDelay();
    return mockData.teacher.gradeConfig?.bands || [];
  },

  createObservation: async (observation) => {
    await simulateDelay();
    const newObs = {
      id: `o${Date.now()}`,
      ...observation,
      date: new Date().toISOString().slice(0, 10)
    };
    if (!mockData.teacher.observations.items) {
      mockData.teacher.observations.items = [];
    }
    mockData.teacher.observations.items.unshift(newObs);
    return newObs;
  },

  updateObservation: async (observationId, patch) => {
    await simulateDelay();
    const obs = mockData.teacher.observations?.items?.find((o) => o.id === observationId);
    if (obs) {
      Object.assign(obs, patch);
    }
    return obs;
  },

  deleteObservation: async (observationId) => {
    await simulateDelay();
    mockData.teacher.observations.items = mockData.teacher.observations.items.filter(
      (o) => o.id !== observationId
    );
    return { success: true };
  },

  getGradeRevisions: async (teacherId) => {
    await simulateDelay();
    return mockData.teacher.gradeRevisions?.items || [];
  },

  updateGradeRevision: async (revisionId, updatedData) => {
    await simulateDelay();
    const revision = mockData.teacher.gradeRevisions?.items?.find((r) => r.id === revisionId);
    if (revision) {
      Object.assign(revision, updatedData);
    }
    return revision;
  },

  submitGradeRevision: async (revisionData) => {
    await simulateDelay();
    const newRevision = {
      id: `rev${Date.now()}`,
      status: 'AWAITING_APPROVAL',
      time: 'Just now',
      severity: revisionData.severity || 'MEDIUM',
      issue: revisionData.justification || 'Grade revision requested',
      history: [{
        id: `h${Date.now()}`,
        role: 'TEACHER',
        user: mockData.users?.teacherUsers?.[0]?.name || 'Teacher',
        message: revisionData.justification || 'Grade revision submitted',
        time: 'Just now'
      }],
      ...revisionData
    };
    if (!mockData.teacher.gradeRevisions) {
      mockData.teacher.gradeRevisions = { items: [] };
    }
    if (!mockData.teacher.gradeRevisions.items) {
      mockData.teacher.gradeRevisions.items = [];
    }
    mockData.teacher.gradeRevisions.items.unshift(newRevision);

    // Also create audit log entry for HOD visibility
    const auditEntry = {
      id: `log${Date.now()}`,
      recordId: revisionData.recordId || newRevision.id,
      userId: mockData.users?.teacherUsers?.[0]?.id || 'teacher001',
      user: mockData.users?.teacherUsers?.[0]?.name || 'Teacher',
      role: 'TEACHER',
      action: 'UPDATE',
      target: `Student Grade - ${revisionData.student || 'Unknown'} (Index ${revisionData.index || '000'})`,
      oldValue: revisionData.oldValue || '',
      newValue: revisionData.newValue || '',
      justification: revisionData.justification || 'Grade revision requested',
      status: 'AWAITING_APPROVAL',
      time: new Date().toISOString(),
      subject: revisionData.subject || mockData.teacher.classes?.items?.[0]?.subject || 'General Agriculture',
      className: revisionData.class || mockData.teacher.classes?.items?.[0]?.className || 'SHS 1 Agric B',
      studentId: revisionData.studentId || '',
      hodComment: null,
      severity: revisionData.severity || 'MEDIUM'
    };
    mockData.auditLogs.items.unshift(auditEntry);

    return newRevision;
  }
});

export const mockTeacherService = createMockService();

export default mockTeacherService;