import { create } from 'zustand';

export const useHODStore = create((set, get) => ({
  profile: null,
  profileLoading: false,
  profileError: null,

  setProfile: (profile) => set({ profile, profileError: null }),
  setProfileLoading: (loading) => set({ profileLoading: loading }),
  setProfileError: (error) => set({ profileError: error }),

  auditLogs: [],
  auditLogsLoading: false,
  auditLogsError: null,

  setAuditLogs: (auditLogs) => set({ auditLogs, auditLogsError: null }),
  setAuditLogsLoading: (loading) => set({ auditLogsLoading: loading }),
  setAuditLogsError: (error) => set({ auditLogsError: error }),

  interventionAlerts: [],
  interventionAlertsLoading: false,
  interventionAlertsError: null,

  setInterventionAlerts: (interventionAlerts) => set({ interventionAlerts, interventionAlertsError: null }),
  setInterventionAlertsLoading: (loading) => set({ interventionAlertsLoading: loading }),
  setInterventionAlertsError: (error) => set({ interventionAlertsError: error }),

  departmentProgress: [],
  departmentProgressLoading: false,
  departmentProgressError: null,
  departmentProgressPage: 1,
  departmentProgressLimit: 50,

  setDepartmentProgress: (departmentProgress) => set({ departmentProgress, departmentProgressError: null }),
  setDepartmentProgressLoading: (loading) => set({ departmentProgressLoading: loading }),
  setDepartmentProgressError: (error) => set({ departmentProgressError: error }),
  setDepartmentProgressPage: (page) => set({ departmentProgressPage: page }),
  setDepartmentProgressLimit: (limit) => set({ departmentProgressLimit: limit }),

  teacherSubmissions: [],
  teacherSubmissionsLoading: false,
  teacherSubmissionsError: null,

  setTeacherSubmissions: (teacherSubmissions) => set({ teacherSubmissions, teacherSubmissionsError: null }),
  setTeacherSubmissionsLoading: (loading) => set({ teacherSubmissionsLoading: loading }),
  setTeacherSubmissionsError: (error) => set({ teacherSubmissionsError: error }),

  lockedTerms: [],
  lockedTermsLoading: false,
  lockedTermsError: null,

  setLockedTerms: (lockedTerms) => set({ lockedTerms, lockedTermsError: null }),
  setLockedTermsLoading: (loading) => set({ lockedTermsLoading: loading }),
  setLockedTermsError: (error) => set({ lockedTermsError: error }),

  gradeRevisions: [],
  gradeRevisionsLoading: false,
  gradeRevisionsError: null,

  setGradeRevisions: (gradeRevisions) => set({ gradeRevisions, gradeRevisionsError: null }),
  setGradeRevisionsLoading: (loading) => set({ gradeRevisionsLoading: loading }),
  setGradeRevisionsError: (error) => set({ gradeRevisionsError: error }),

  gradeComparison: null,
  gradeComparisonLoading: false,
  gradeComparisonError: null,

  setGradeComparison: (gradeComparison) => set({ gradeComparison, gradeComparisonError: null }),
  setGradeComparisonLoading: (loading) => set({ gradeComparisonLoading: loading }),
  setGradeComparisonError: (error) => set({ gradeComparisonError: error }),

  archivedClasses: [],
  archivedClassesLoading: false,
  archivedClassesError: null,

  setArchivedClasses: (archivedClasses) => set({ archivedClasses, archivedClassesError: null }),
  setArchivedClassesLoading: (loading) => set({ archivedClassesLoading: loading }),
  setArchivedClassesError: (error) => set({ archivedClassesError: error }),

  promotionRecommendations: [],
  promotionRecommendationsLoading: false,
  promotionRecommendationsError: null,

  setPromotionRecommendations: (promotionRecommendations) => set({ promotionRecommendations, promotionRecommendationsError: null }),
  setPromotionRecommendationsLoading: (loading) => set({ promotionRecommendationsLoading: loading }),
  setPromotionRecommendationsError: (error) => set({ promotionRecommendationsError: error }),

  hodSettings: {
    profile: { name: '', email: '', phone: '', department: '' },
    notifications: {
      grading: true,
      certification: true,
      security: true,
      gradeSubmissionReminders: true,
      interventionAlerts: true,
      systemAnnouncements: true,
      weeklyDigest: false,
    },
    security: { mfaEnabled: false, mfaEnforced: false, sessionTimeout: 30, passwordLastChanged: '' },
    uiPreferences: { theme: 'light', density: 'comfortable', defaultView: 'dashboard' },
    departmentConfig: { autoAlertThreshold: 15, autoResolveDays: 7 },
    auditFrequency: 'daily',
  },
  hodSettingsLoading: false,
  hodSettingsError: null,

  setHodSettings: (hodSettings) => set({ hodSettings, hodSettingsError: null }),
  setHodSettingsLoading: (loading) => set({ hodSettingsLoading: loading }),
  setHodSettingsError: (error) => set({ hodSettingsError: error }),

  supportTickets: [],
  supportTicketsLoading: false,
  supportTicketsError: null,

  setSupportTickets: (supportTickets) => set({ supportTickets, supportTicketsError: null }),
  setSupportTicketsLoading: (loading) => set({ supportTicketsLoading: loading }),
  setSupportTicketsError: (error) => set({ supportTicketsError: error }),

  systemHealth: null,
  systemHealthLoading: false,
  systemHealthError: null,

  setSystemHealth: (systemHealth) => set({ systemHealth, systemHealthError: null }),
  setSystemHealthLoading: (loading) => set({ systemHealthLoading: loading }),
  setSystemHealthError: (error) => set({ systemHealthError: error }),

  escalatedIssues: [],
  escalatedIssuesLoading: false,
  escalatedIssuesError: null,

  setEscalatedIssues: (escalatedIssues) => set({ escalatedIssues, escalatedIssuesError: null }),
  setEscalatedIssuesLoading: (loading) => set({ escalatedIssuesLoading: loading }),
  setEscalatedIssuesError: (error) => set({ escalatedIssuesError: error }),

  contactChannels: null,
  contactChannelsLoading: false,
  contactChannelsError: null,

  setContactChannels: (contactChannels) => set({ contactChannels, contactChannelsError: null }),
  setContactChannelsLoading: (loading) => set({ contactChannelsLoading: loading }),
  setContactChannelsError: (error) => set({ contactChannelsError: error }),

  departmentTeachers: [],
  departmentTeachersLoading: false,
  departmentTeachersError: null,

  setDepartmentTeachers: (departmentTeachers) => set({ departmentTeachers, departmentTeachersError: null }),
  setDepartmentTeachersLoading: (loading) => set({ departmentTeachersLoading: loading }),
  setDepartmentTeachersError: (error) => set({ departmentTeachersError: error }),

  viewAsTeacherId: null,
  viewAsTeacherName: null,

  setViewAsTeacherId: (viewAsTeacherId) => set({ viewAsTeacherId }),
  setViewAsTeacherName: (viewAsTeacherName) => set({ viewAsTeacherName }),

  isLoading: false,
  isExporting: false,
  error: null,

  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsExporting: (exporting) => set({ isExporting: exporting }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  activeActionMenu: null,
  setActiveActionMenu: (activeActionMenu) => set({ activeActionMenu }),

  archiveFilter: 'all',
  archiveYearFilter: 'all',
  archiveSearchQuery: '',
  archivePage: 1,

  setArchiveFilter: (archiveFilter) => set({ archiveFilter }),
  setArchiveYearFilter: (archiveYearFilter) => set({ archiveYearFilter }),
  setArchiveSearchQuery: (archiveSearchQuery) => set({ archiveSearchQuery }),
  setArchivePage: (archivePage) => set({ archivePage }),

  alertNotes: {},
  setAlertNotes: (alertNotes) => set({ alertNotes }),

  getFilteredAlerts: (alerts, filter) => {
    if (!Array.isArray(alerts)) return [];
    if (filter === 'all') return alerts;
    if (filter === 'resolved') return alerts.filter(a => a.resolved);
    return alerts.filter(a => a.severity?.toUpperCase() === filter.toUpperCase());
  },

  resolveAlert: (alertId) => {
    const { interventionAlerts } = get();
    set({
      interventionAlerts: interventionAlerts.map(a =>
        a.id === alertId ? { ...a, resolved: true } : a,
      ),
    });
  },
}));