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

  getDepartmentProgress: async (params = {}) => {
    await simulateDelay();
    const { page = 1, limit = 50 } = params;
    const items = mockData.departmentProgress.items;
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);
    
    return {
      items: paginatedItems,
      total: items.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(items.length / limit)
    };
  },

  getTeacherSubmissionStatus: async () => {
    await simulateDelay();
    return mockData.teacherSubmissions.items;
  },

getLockedTerms: async () => {
     await simulateDelay();
     return mockData.lockedTerms.items;
   },

  validateLock: async (termId) => {
    await simulateDelay();
    const pendingSubmissions = mockData.teacherSubmissions.items.filter(
      (s) => s.status === 'DRAFT',
    ).length;
    const term = mockData.lockedTerms.items.find((t) => t.id === termId);
    return {
      canLock: pendingSubmissions === 0,
      isLocked: term?.status === 'LOCKED',
      blockingIssues:
        pendingSubmissions > 0
          ? [`${pendingSubmissions} classes have pending submissions (100% completion required)`]
          : [],
      warnings: term?.status === 'LOCKED' ? ['Term is already locked'] : [],
      pendingSubmissions,
      completionPct: mockData.teacherSubmissions.items.length > 0
        ? Math.round((mockData.teacherSubmissions.items.filter(s => s.status === 'SUBMITTED').length / mockData.teacherSubmissions.items.length) * 100)
        : 0,
    };
  },

lockDepartmentMatrix: async (classId) => {
      await simulateDelay();
      const cls = mockData.departmentProgress.items.find((c) => c.id === classId);
      if (cls) {
        cls.status = "LOCKED";
        cls.lockedAt = new Date().toISOString();
        cls.lockedBy = "hod001";
        const term = mockData.lockedTerms.items.find((t) => t.id === cls.termId);
        if (term) {
          term.status = "LOCKED";
          term.lockedAt = new Date().toISOString();
          term.lockedBy = "hod001";
        }
      }
      return { success: true, message: "Department matrix locked successfully" };
    },

    unlockDepartmentMatrix: async (classId) => {
      await simulateDelay();
      const cls = mockData.departmentProgress.items.find((c) => c.id === classId);
      if (cls) {
        cls.status = "PENDING";
        cls.lockedAt = null;
        cls.lockedBy = null;
        if (cls.termId) {
          const termClasses = mockData.departmentProgress.items.filter((c) => c.termId === cls.termId);
          const allUnlocked = termClasses.every((c) => c.status !== "LOCKED");
          const term = mockData.lockedTerms.items.find((t) => t.id === cls.termId);
          if (allUnlocked && term) {
            term.status = "UNLOCKED";
            term.lockedAt = null;
            term.lockedBy = null;
          }
        }
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
    const log = mockData.auditLogs.items.find((l) => l.recordId === recordId);
    if (log) {
      log.status = 'REJECTED';
      log.rejectionReason = reason;
    }
    return { success: true, message: "Grade revision rejected", reason };
  },

  approveGradeRevision: async (recordId, comment) => {
    await simulateDelay();
    const log = mockData.auditLogs.items.find((l) => l.recordId === recordId);
    if (log) {
      log.status = 'RESOLVED';
      log.hodComment = comment;
    }
    return { success: true, message: "Grade revision approved" };
  },

  getGradeRevisions: async () => {
    await simulateDelay();
    return mockData.auditLogs.items
      .filter((l) => l.action === "UPDATE" && !!l.justification)
      .map((l) => ({
        id: l.recordId,
        student: l.target?.split(' - ')[1]?.split(' (')[0] || 'Unknown Student',
        index: l.target?.match(/\(([^)]+)\)/)?.[1] || '000',
        class: l.className,
        subject: l.subject,
        issue: l.justification || 'Grade revision requested',
        status: l.status === 'RESOLVED' ? 'RESOLVED' : 'AWAITING_APPROVAL',
        severity: l.severity || 'MEDIUM',
        time: new Date(l.time).toLocaleDateString(),
        history: [{
          id: `h-${l.id}`,
          role: l.role,
          user: l.user,
          message: l.justification || l.oldValue,
          time: new Date(l.time).toLocaleDateString()
        }]
      }));
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

  getStudentAcademicHistory: async (studentId) => {
    await simulateDelay();
    return mockData.studentAcademicHistory?.items?.find(h => h.studentId === studentId) || null;
  },

  getAllAcademicYears: async () => {
    await simulateDelay();
    return mockData.academicYears?.items || [];
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
    const totalSubmissions = mockData.teacherSubmissions.items.length || 1;
    const submittedCount = mockData.teacherSubmissions.items.filter(s => s.status === "SUBMITTED").length;
    const completionPct = Math.round((submittedCount / totalSubmissions) * 100);
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
      completionPct,
    };
  },

  exportWAECCSV: async (termId, className) => {
    await simulateDelay();
    const rows = mockData.waecExport.studentRows;
    const headers = ['Index', 'Student Name', 'SBA', 'Exam', 'Final', 'Grade', 'Roman'];
    const dataRows = rows.map(
      (r) =>
        `${r.index},"${(r.name ?? '').replace(/"/g, '""')}",${r.sba ?? 0},${r.exam ?? 0},${r.final ?? 0},${r.grade ?? ''},${r.roman || ''}`,
    );
    const csv = [headers, ...dataRows].join('\r\n');
    const filename = `WAEC_${className || 'Subject'}_${termId || 'export'}.csv`;
    
    // Trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    return { success: true, message: "WAEC CSV exported", csv };
  },

  exportWAECPDF: async (termId) => {
    await simulateDelay();
    return {
      success: true,
      message: "PDF exported",
      downloadUrl: `/exports/waec-${termId}.pdf`,
    };
  },

  resolveAlert: async (alertId) => {
    await simulateDelay();
    const alert = mockData.interventionAlerts.items.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
    return { success: true, message: "Alert resolved" };
  },

  addCounselingNote: async ({ alertId, text }) => {
    await simulateDelay();
    const alert = mockData.interventionAlerts.items.find((a) => a.id === alertId);
    const note = {
      id: `note_${Date.now()}`,
      text,
      author: "HOD",
      date: new Date().toLocaleDateString(),
    };
    if (alert) {
      alert.notes = alert.notes || [];
      alert.notes.push(note);
    }
    return { success: true, note };
  },
});

export const mockHodService = createMockService();

export default mockHodService;
