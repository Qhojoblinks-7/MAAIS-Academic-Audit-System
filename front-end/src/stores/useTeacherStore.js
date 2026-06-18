import { create } from 'zustand';

export const useTeacherStore = create((set, get) => ({
  profile: null,
  profileLoading: false,
  profileError: null,

  setProfile: (profile) => set({ profile, profileError: null }),
  setProfileLoading: (loading) => set({ profileLoading: loading }),
  setProfileError: (error) => set({ profileError: error }),

  classes: [],
  classesLoading: false,
  classesError: null,

  setClasses: (classes) => set({ classes, classesError: null }),
  setClassesLoading: (loading) => set({ classesLoading: loading }),
  setClassesError: (error) => set({ classesError: error }),

  analytics: null,
  analyticsLoading: false,
  analyticsError: null,

  setAnalytics: (analytics) => set({ analytics, analyticsError: null }),
  setAnalyticsLoading: (loading) => set({ analyticsLoading: loading }),
  setAnalyticsError: (error) => set({ analyticsError: error }),

  observations: [],
  observationsLoading: false,
  observationsError: null,

  setObservations: (observations) => set({ observations, observationsError: null }),
  setObservationsLoading: (loading) => set({ observationsLoading: loading }),
  setObservationsError: (error) => set({ observationsError: error }),

  supportObservations: [],
  supportObservationsLoading: false,
  supportObservationsError: null,

  setSupportObservations: (data) => set({ supportObservations: data, supportObservationsError: null }),
  setSupportObservationsLoading: (loading) => set({ supportObservationsLoading: loading }),
  setSupportObservationsError: (error) => set({ supportObservationsError: error }),

  gradeIssues: [],
  gradeIssuesLoading: false,
  gradeIssuesError: null,

  setGradeIssues: (gradeIssues) => set({ gradeIssues, gradeIssuesError: null }),
  setGradeIssuesLoading: (loading) => set({ gradeIssuesLoading: loading }),
  setGradeIssuesError: (error) => set({ gradeIssuesError: error }),

  gradeIssueMeta: null,
  gradeIssueMetaLoading: false,
  gradeIssueMetaError: null,

  setGradeIssueMeta: (meta) => set({ gradeIssueMeta: meta, gradeIssueMetaError: null }),
  setGradeIssueMetaLoading: (loading) => set({ gradeIssueMetaLoading: loading }),
  setGradeIssueMetaError: (error) => set({ gradeIssueMetaError: error }),

  timetable: [],
  timetableLoading: false,
  timetableError: null,

  setTimetable: (timetable) => set({ timetable, timetableError: null }),
  setTimetableLoading: (loading) => set({ timetableLoading: loading }),
  setTimetableError: (error) => set({ timetableError: error }),

  settingsClasses: [],
  settingsClassesLoading: false,
  settingsClassesError: null,

  setSettingsClasses: (settingsClasses) => set({ settingsClasses, settingsClassesError: null }),
  setSettingsClassesLoading: (loading) => set({ settingsClassesLoading: loading }),
  setSettingsClassesError: (error) => set({ settingsClassesError: error }),

  notificationPreferences: null,
  notificationPreferencesLoading: false,
  notificationPreferencesError: null,

  setNotificationPreferences: (prefs) => set({ notificationPreferences: prefs, notificationPreferencesError: null }),
  setNotificationPreferencesLoading: (loading) => set({ notificationPreferencesLoading: loading }),
  setNotificationPreferencesError: (error) => set({ notificationPreferencesError: error }),

  gradingStudents: [],
  gradingStudentsLoading: false,
  gradingStudentsError: null,

  setGradingStudents: (gradingStudents) => set({ gradingStudents, gradingStudentsError: null }),
  setGradingStudentsLoading: (loading) => set({ gradingStudentsLoading: loading }),
  setGradingStudentsError: (error) => set({ gradingStudentsError: error }),

  subjectConfig: null,
  subjectConfigLoading: false,
  subjectConfigError: null,

  setSubjectConfig: (subjectConfig) => set({ subjectConfig, subjectConfigError: null }),
  setSubjectConfigLoading: (loading) => set({ subjectConfigLoading: loading }),
  setSubjectConfigError: (error) => set({ subjectConfigError: error }),

  gradingStatusMeta: null,
  gradingStatusMetaLoading: false,
  gradingStatusMetaError: null,

  setGradingStatusMeta: (gradingStatusMeta) => set({ gradingStatusMeta, gradingStatusMetaError: null }),
  setGradingStatusMetaLoading: (loading) => set({ gradingStatusMetaLoading: loading }),
  setGradingStatusMetaError: (error) => set({ gradingStatusMetaError: error }),

  gradingFilterOptions: null,
  gradingFilterOptionsLoading: false,
  gradingFilterOptionsError: null,

  setGradingFilterOptions: (gradingFilterOptions) => set({ gradingFilterOptions, gradingFilterOptionsError: null }),
  setGradingFilterOptionsLoading: (loading) => set({ gradingFilterOptionsLoading: loading }),
  setGradingFilterOptionsError: (error) => set({ gradingFilterOptionsError: error }),

  observationTypes: [],
  observationTypesLoading: false,
  observationTypesError: null,

  setObservationTypes: (observationTypes) => set({ observationTypes, observationTypesError: null }),
  setObservationTypesLoading: (loading) => set({ observationTypesLoading: loading }),
  setObservationTypesError: (error) => set({ observationTypesError: error }),

  observationColors: [],
  observationColorsLoading: false,
  observationColorsError: null,

  setObservationColors: (observationColors) => set({ observationColors, observationColorsError: null }),
  setObservationColorsLoading: (loading) => set({ observationColorsLoading: loading }),
  setObservationColorsError: (error) => set({ observationColorsError: error }),

  analyticsObservationColors: [],
  analyticsObservationColorsLoading: false,
  analyticsObservationColorsError: null,

  setAnalyticsObservationColors: (colors) => set({ analyticsObservationColors: colors, analyticsObservationColorsError: null }),
  setAnalyticsObservationColorsLoading: (loading) => set({ analyticsObservationColorsLoading: loading }),
  setAnalyticsObservationColorsError: (error) => set({ analyticsObservationColorsError: error }),

  gradeConfig: null,
  gradeConfigLoading: false,
  gradeConfigError: null,

  setGradeConfig: (gradeConfig) => set({ gradeConfig, gradeConfigError: null }),
  setGradeConfigLoading: (loading) => set({ gradeConfigLoading: loading }),
  setGradeConfigError: (error) => set({ gradeConfigError: error }),

  gradeRevisions: [],
  gradeRevisionsLoading: false,
  gradeRevisionsError: null,

  setGradeRevisions: (gradeRevisions) => set({ gradeRevisions, gradeRevisionsError: null }),
  setGradeRevisionsLoading: (loading) => set({ gradeRevisionsLoading: loading }),
  setGradeRevisionsError: (error) => set({ gradeRevisionsError: error }),
}));
