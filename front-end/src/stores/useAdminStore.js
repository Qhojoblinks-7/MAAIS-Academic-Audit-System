import { create } from 'zustand';

export const useAdminStore = create((set, get) => ({
  // ── Identity / Users ─────────────────────────────────────────────────────
  students: [],
  studentsLoading: false,
  studentsError: null,

  setStudents: (students) => set({ students, studentsError: null }),
  setStudentsLoading: (loading) => set({ studentsLoading: loading }),
  setStudentsError: (error) => set({ studentsError: error }),

  staff: [],
  staffLoading: false,
  staffError: null,

  setStaff: (staff) => set({ staff, staffError: null }),
  setStaffLoading: (loading) => set({ staffLoading: loading }),
  setStaffError: (error) => set({ staffError: error }),

  // ── Academic Structure ───────────────────────────────────────────────────
  departments: [],
  departmentsLoading: false,
  departmentsError: null,

  setDepartments: (departments) => set({ departments, departmentsError: null }),
  setDepartmentsLoading: (loading) => set({ departmentsLoading: loading }),
  setDepartmentsError: (error) => set({ departmentsError: error }),

  subjects: [],
  subjectsLoading: false,
  subjectsError: null,

  setSubjects: (subjects) => set({ subjects, subjectsError: null }),
  setSubjectsLoading: (loading) => set({ subjectsLoading: loading }),
  setSubjectsError: (error) => set({ subjectsError: error }),

  classes: [],
  classesLoading: false,
  classesError: null,

  setClasses: (classes) => set({ classes, classesError: null }),
  setClassesLoading: (loading) => set({ classesLoading: loading }),
  setClassesError: (error) => set({ classesError: error }),

  academicYear: null,
  academicYearLoading: false,
  academicYearError: null,

  setAcademicYear: (academicYear) => set({ academicYear, academicYearError: null }),
  setAcademicYearLoading: (loading) => set({ academicYearLoading: loading }),
  setAcademicYearError: (error) => set({ academicYearError: error }),

  // ── Archive / Vault ──────────────────────────────────────────────────────
  archiveStats: null,
  archiveStatsLoading: false,
  archiveStatsError: null,

  setArchiveStats: (archiveStats) => set({ archiveStats, archiveStatsError: null }),
  setArchiveStatsLoading: (loading) => set({ archiveStatsLoading: loading }),
  setArchiveStatsError: (error) => set({ archiveStatsError: error }),

  databaseHealth: null,
  databaseHealthLoading: false,
  databaseHealthError: null,

  setDatabaseHealth: (databaseHealth) => set({ databaseHealth, databaseHealthError: null }),
  setDatabaseHealthLoading: (loading) => set({ databaseHealthLoading: loading }),
  setDatabaseHealthError: (error) => set({ databaseHealthError: error }),

  // ── Communications ───────────────────────────────────────────────────────
  tickets: [],
  ticketsLoading: false,
  ticketsError: null,
  ticketFilter: 'all',

  setTickets: (tickets) => set({ tickets, ticketsError: null }),
  setTicketsLoading: (loading) => set({ ticketsLoading: loading }),
  setTicketsError: (error) => set({ ticketsError: error }),
  setTicketFilter: (ticketFilter) => set({ ticketFilter }),

  unreadNotifications: [],
  unreadNotificationsLoading: false,
  unreadNotificationsError: null,

  setUnreadNotifications: (unreadNotifications) => set({ unreadNotifications, unreadNotificationsError: null }),
  setUnreadNotificationsLoading: (loading) => set({ unreadNotificationsLoading: loading }),
  setUnreadNotificationsError: (error) => set({ unreadNotificationsError: error }),

  analyticsPulse: null,
  analyticsPulseLoading: false,
  analyticsPulseError: null,

  setAnalyticsPulse: (analyticsPulse) => set({ analyticsPulse, analyticsPulseError: null }),
  setAnalyticsPulseLoading: (loading) => set({ analyticsPulseLoading: loading }),
  setAnalyticsPulseError: (error) => set({ analyticsPulseError: error }),

  // ── Grading ──────────────────────────────────────────────────────────────
  bulkApproveLoading: false,
  setBulkApproveLoading: (loading) => set({ bulkApproveLoading: loading }),

  // ── Filters & UI State ───────────────────────────────────────────────────
  filters: {
    academicYear: 'all',
    department: 'all',
    classLevel: 'all',
    term: 'all',
    status: 'all',
    searchQuery: '',
  },

  setFilters: (filters) => set({ filters }),
  updateFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value },
  })),
  resetFilters: () => set({
    filters: {
      academicYear: 'all',
      department: 'all',
      classLevel: 'all',
      term: 'all',
      status: 'all',
      searchQuery: '',
    },
  }),

  selectedStudents: [],
  setSelectedStudents: (selectedStudents) => set({ selectedStudents }),
  toggleStudentSelection: (studentId) => set((state) => ({
    selectedStudents: state.selectedStudents.includes(studentId)
      ? state.selectedStudents.filter((id) => id !== studentId)
      : [...state.selectedStudents, studentId],
  })),
  clearSelection: () => set({ selectedStudents: [] }),

  // ── Admin Settings ───────────────────────────────────────────────────────
  adminSettings: {
    profile: { name: '', email: '', phone: '', department: '' },
    notifications: { grading: true, certification: true, security: true },
    security: { mfaEnabled: false, sessionTimeout: 30 },
  },

  updateAdminSettings: (patch) => set((state) => ({
    adminSettings: { ...state.adminSettings, ...patch },
  })),

  // ── Global Loading / Error ───────────────────────────────────────────────
  globalLoading: false,
  globalError: null,

  setGlobalLoading: (loading) => set({ globalLoading: loading }),
  setGlobalError: (error) => set({ globalError: error }),
  clearError: () => set({ globalError: null }),
}));
