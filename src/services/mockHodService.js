import mockApiData from "../data/mockApiData.json";

let mockData = JSON.parse(JSON.stringify(mockApiData));

const simulateDelay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const createMockService = () => ({
  getAuditLogs: async (params = {}) => {
    await simulateDelay();
    let items = [...mockData.auditLogs.items];
    if (params.studentId)
      items = items.filter((i) => i.studentId === params.studentId);
    if (params.teacherId)
      items = items.filter((i) => i.userId === params.teacherId);
    if (params.subject)
      items = items.filter((i) => i.subject === params.subject);
    if (params.startDate)
      items = items.filter(
        (i) => new Date(i.time) >= new Date(params.startDate),
      );
    if (params.endDate)
      items = items.filter((i) => new Date(i.time) <= new Date(params.endDate));
    return items;
  },

  getInterventionAlerts: async (params = {}) => {
    await simulateDelay();
    let items = [...mockData.interventionAlerts.items];
    if (params.severity)
      items = items.filter((i) => i.severity === params.severity);
    if (params.resolved !== undefined)
      items = items.filter((i) => i.resolved === params.resolved);
    if (params.studentId)
      items = items.filter((i) => i.studentId === params.studentId);
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.studentName.toLowerCase().includes(q) ||
          i.reason.toLowerCase().includes(q),
      );
    }
    return items;
  },

  getDepartmentProgress: async () => {
    await simulateDelay();
    return mockData.departmentProgress.items;
  },

  getTeacherSubmissionStatus: async () => {
    await simulateDelay();
    return mockData.teacherSubmissions.items;
  },

  getLockedTerms: async () => {
    await simulateDelay();
    return mockData.lockedTerms.items;
  },

  lockDepartmentMatrix: async (termId) => {
    await simulateDelay();
    const term = mockData.lockedTerms.items.find((t) => t.id === termId);
    if (term) {
      term.status = "LOCKED";
      term.lockedAt = new Date().toISOString();
      term.lockedBy = "hod001";
    }
    return { success: true, message: "Department matrix locked successfully" };
  },

  unlockDepartmentMatrix: async (termId) => {
    await simulateDelay();
    const term = mockData.lockedTerms.items.find((t) => t.id === termId);
    if (term) {
      term.status = "UNLOCKED";
      term.lockedAt = null;
      term.lockedBy = null;
    }
    return {
      success: true,
      message: "Department matrix unlocked successfully",
    };
  },

  getGradeComparison: async (subjectId, termA, termB) => {
    await simulateDelay();
    return mockData.gradeComparison?.subjectPerformance || [];
  },

  updateHODComment: async (recordId, comment) => {
    await simulateDelay();
    const log = mockData.auditLogs.items.find((l) => l.recordId === recordId);
    if (log) {
      log.hodComment = comment;
    }
    return { success: true, message: "HOD comment updated" };
  },

  rejectGradeRevision: async (recordId, reason) => {
    await simulateDelay();
    return { success: true, message: "Grade revision rejected", reason };
  },

  getArchivedDepartmentData: async (params = {}) => {
    await simulateDelay();
    let items = [...mockData.archive.items];
    if (params.year) items = items.filter((i) => i.year === params.year);
    if (params.promoted !== undefined) {
      items = items.filter((i) => {
        const promo = mockData.promotions.items.find(
          (p) => p.studentId === i.id,
        );
        return params.promoted ? promo : !promo;
      });
    }
    return items;
  },

  getPromotionRecommendations: async (params = {}) => {
    await simulateDelay();
    return mockData.promotions.items;
  },

  getHODSettings: async () => {
    await simulateDelay();
    return mockData.settings;
  },

  updateHODSettings: async (settings) => {
    await simulateDelay();
    mockData.settings = { ...mockData.settings, ...settings };
    return { success: true, message: "Settings updated" };
  },

  changePassword: async (currentPassword, newPassword) => {
    await simulateDelay();
    return { success: true, message: "Password changed successfully" };
  },

  mfaEnroll: async () => {
    await simulateDelay();
    return {
      qrCode:
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PGNpcmNsZSBjeD0iMTAwIiByPSI4MCIgc3Ryb2tlPSIjMDBhIiBzdHJva2Utd2lkdGg9IjUiIGZpbGw9Im5vbmUiLz48L3N2Zz4=",
      secret: "JBSWY3DPEHPK3PXP",
      message: "Scan QR code with your authenticator app",
    };
  },

  mfaVerify: async (code) => {
    await simulateDelay();
    return { success: true, message: "MFA enabled successfully" };
  },

  getActiveSessions: async () => {
    await simulateDelay();
    return [
      {
        id: "sess001",
        ip: "192.168.1.100",
        userAgent: "Chrome on Windows",
        createdAt: "2026-05-22T08:00:00Z",
        current: true,
      },
      {
        id: "sess002",
        ip: "192.168.1.101",
        userAgent: "Firefox on macOS",
        createdAt: "2026-05-21T14:00:00Z",
        current: false,
      },
    ];
  },

  revokeSession: async (sessionId) => {
    await simulateDelay();
    return { success: true, message: "Session revoked" };
  },

  getSupportTickets: async (params = {}) => {
    await simulateDelay();
    let tickets = [...mockData.supportTickets.items];
    if (params.status)
      tickets = tickets.filter((t) => t.status === params.status);
    if (params.priority)
      tickets = tickets.filter((t) => t.priority === params.priority);
    if (params.q) {
      const q = params.q.toLowerCase();
      tickets = tickets.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }
    return { tickets, total: tickets.length, page: params.page || 1 };
  },

  createSupportTicket: async (ticket) => {
    await simulateDelay();
    const newTicket = {
      id: `ticket_${Date.now()}`,
      ...ticket,
      status: "OPEN",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockData.supportTickets.items.push(newTicket);
    return newTicket;
  },

  updateSupportTicket: async (ticketId, patch) => {
    await simulateDelay();
    const ticket = mockData.supportTickets.items.find((t) => t.id === ticketId);
    if (ticket) {
      Object.assign(ticket, patch, { updatedAt: new Date().toISOString() });
    }
    return ticket;
  },

  escalateTicket: async (ticketId, body) => {
    await simulateDelay();
    return { success: true, message: "Ticket escalated", ticketId };
  },

  getSystemHealth: async () => {
    await simulateDelay();
    return mockData.systemHealth;
  },

  getEscalatedIssues: async (params = {}) => {
    await simulateDelay();
    let items = [...mockData.escalations.items];
    if (params.status) items = items.filter((i) => i.status === params.status);
    if (params.severity)
      items = items.filter((i) => i.severity === params.severity);
    return items;
  },

  createEscalation: async (body) => {
    await simulateDelay();
    const newEscalation = {
      id: `esc_${Date.now()}`,
      ...body,
      status: "OPEN",
      createdAt: new Date().toISOString(),
    };
    mockData.escalations.items.push(newEscalation);
    return newEscalation;
  },

  getContactChannels: async () => {
    await simulateDelay();
    return mockData.contactChannels;
  },

  updateContactChannels: async (channels) => {
    await simulateDelay();
    mockData.contactChannels = { ...mockData.contactChannels, ...channels };
    return mockData.contactChannels;
  },

  resetTeacherPassword: async (teacherId, newPassword) => {
    await simulateDelay();
    return {
      success: true,
      message: "Password reset successful",
      temporaryPassword: newPassword || Math.random().toString(36).slice(-10),
    };
  },

  getDepartmentTeachers: async (params = {}) => {
    await simulateDelay();
    let items = [...mockData.teachers.items].map((t) => ({
      ...t,
      active: t.status === "ACTIVE",
      subject: t.subjects?.[0] || null,
      classes: [],
    }));
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (t) =>
          t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q),
      );
    }
    return items;
  },

  impersonateTeacher: async (teacherId, body = {}) => {
    await simulateDelay();
    const teacher = mockData.teachers.items.find((t) => t.id === teacherId);
    if (!teacher) throw new Error("Teacher not found");
    const impersonation = {
      id: `imp_${Date.now()}`,
      teacherId,
      teacherName: teacher.name,
      reason: body.reason || "Administrative oversight",
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      hodId: "hod001",
    };
    mockData.impersonations.items.push(impersonation);
    return { ...impersonation, token: `token_${Date.now()}` };
  },

  stopImpersonation: async () => {
    await simulateDelay();
    mockData.impersonations.items = [];
    return { success: true, message: "Impersonation stopped" };
  },

  getActiveImpersonations: async () => {
    await simulateDelay();
    return mockData.impersonations.items;
  },

  getStudentAcademicProfile: async (studentId) => {
    await simulateDelay();
    return mockData.students.items.find((s) => s.id === studentId);
  },

  getAllStudentProfiles: async () => {
    await simulateDelay();
    return { items: mockData.students.items };
  },

  getInterventionAlertAggregation: async () => {
    await simulateDelay();
    const alerts = mockData.interventionAlerts.items;
    const aggregation = {
      totalAlerts: alerts.length,
      highSeverity: alerts.filter((a) => a.severity === "HIGH").length,
      mediumSeverity: alerts.filter((a) => a.severity === "MEDIUM").length,
      lowSeverity: alerts.filter((a) => a.severity === "LOW").length,
      unresolved: alerts.filter((a) => !a.resolved).length,
      bySubject: {},
      byReason: {},
    };
    alerts.forEach((a) => {
      aggregation.bySubject[a.subject] =
        (aggregation.bySubject[a.subject] || 0) + 1;
      aggregation.byReason[a.reason] =
        (aggregation.byReason[a.reason] || 0) + 1;
    });
    return aggregation;
  },

  getJournalEditCaptures: async (params = {}) => {
    await simulateDelay();
    let items = mockData.auditLogs.items.filter(
      (l) => l.action === "UPDATE" || l.action === "AUTO_SAVE",
    );
    if (params.studentId)
      items = items.filter((i) => i.studentId === params.studentId);
    return { items };
  },

  validateLock: async (termId) => {
    await simulateDelay();
    const pendingSubmissions = mockData.teacherSubmissions.items.filter(
      (s) => s.status === "DRAFT",
    ).length;
    return {
      canLock: pendingSubmissions === 0,
      isLocked:
        mockData.lockedTerms.items.find((t) => t.id === termId)?.status ===
        "LOCKED",
      blockingIssues:
        pendingSubmissions > 0
          ? [`${pendingSubmissions} pending submissions`]
          : [],
      warnings: [],
      pendingSubmissions,
    };
  },

  exportWAECCSV: async (termId, className) => {
    await simulateDelay();
    const rows = mockData.waecExport.studentRows;
    const csv = ["Index,Student Name,SBA,Exam,Final,Grade,Roman"]
      .concat(
        rows.map(
          (r) =>
            `${r.index},${r.name},${r.sba},${r.exam},${r.final},${r.grade},`,
        ),
      )
      .join("\r\n");
    return csv;
  },

  exportWAECPDF: async (termId) => {
    await simulateDelay();
    return {
      success: true,
      message: "PDF exported",
      downloadUrl: `/exports/waec-${termId}.pdf`,
    };
  },
});

export const mockHodService = createMockService();

export default mockHodService;
