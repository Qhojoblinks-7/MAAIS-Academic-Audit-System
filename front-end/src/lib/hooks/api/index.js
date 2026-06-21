export { useLogin, useCurrentUser, useAcademicYear, useDepartments, useSubjects, useClasses, useTeacherAssignments, useMyAssignments, useAllStudents, useStudentProfile, useCreateMutation, useUpdateMutation } from './api/authAcademics';
export { useStudentTermGrades, useGradeEntry, useMissingObservations, useClassPerformance, useUpsertGrade, useBulkUpsertGrades, useCorrectGrade, useLockGrade, useUnlockGrade, useApproveGrade, useBulkApproveGrades } from './api/grading';
export { useStudentNotifications, useAnalyticsPulse, useSendNotification, useMarkNotificationRead, useEmergencyBroadcast } from './api/comms';
export { useStudentReportCard, useStudentTranscript, useGenerateReport, useReleaseReportCard, useVerifyDocument } from './api/reports';
export { usePromotionHistory, useAcademicYears, useArchiveStats, usePromoteStudent } from './api/archive';
export {
  useTeacherClasses,
  useTeacherAnalytics,
  useTeacherSupportObservations,
  useTeacherGradeIssues,
  useTeacherGradeIssueStatusMeta,
  useTeacherTimetable,
  useTeacherSettingsClasses,
  useTeacherNotificationPreferences,
  useTeacherProfile,
  useTeacherGradingStudents,
  useTeacherSubjectConfig,
  useTeacherGradingStatusMeta,
  useTeacherGradingFilterOptions,
  useTeacherObservationTypes,
  useTeacherObservationColors,
  useTeacherAnalyticsObservationColors,
  useTeacherGradeConfig,
  useCreateObservation,
  useUpdateObservation,
  useDeleteObservation,
  useSubmitGradeRevision,
  useUpdateGradeRevision,
} from './api/teacher';
