import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teacherApi } from '../../../lib/api';

export function useTeacherClasses(teacherId) {
  return useQuery({
    queryKey: ['teacher', 'classes', teacherId],
    queryFn: () => teacherApi.getClasses(teacherId),
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeacherAnalytics(teacherId) {
  return useQuery({
    queryKey: ['teacher', 'analytics', teacherId],
    queryFn: () => teacherApi.getAnalytics(teacherId),
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeacherSupportObservations() {
  return useQuery({
    queryKey: ['teacher', 'support', 'observations'],
    queryFn: teacherApi.getSupportObservations,
    staleTime: 1000 * 60 * 2,
  });
}

export function useTeacherGradeIssues() {
  return useQuery({
    queryKey: ['teacher', 'grade', 'issues'],
    queryFn: teacherApi.getGradeIssues,
    staleTime: 1000 * 60 * 2,
  });
}

export function useTeacherGradeIssueStatusMeta() {
  return useQuery({
    queryKey: ['teacher', 'grade', 'issues', 'meta'],
    queryFn: teacherApi.getGradeIssueStatusMeta,
    staleTime: 1000 * 60 * 10,
  });
}

export function useTeacherTimetable(teacherId) {
  return useQuery({
    queryKey: ['teacher', 'timetable', teacherId],
    queryFn: () => teacherApi.getTimetable(teacherId),
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeacherSettingsClasses() {
  return useQuery({
    queryKey: ['teacher', 'settings', 'classes'],
    queryFn: teacherApi.getSettingsClasses,
    staleTime: 1000 * 60 * 10,
  });
}

export function useTeacherNotificationPreferences() {
  return useQuery({
    queryKey: ['teacher', 'settings', 'preferences'],
    queryFn: teacherApi.getNotificationPreferences,
    staleTime: 1000 * 60 * 10,
  });
}

export function useTeacherProfile() {
  return useQuery({
    queryKey: ['teacher', 'profile'],
    queryFn: teacherApi.getProfile,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeacherGradingStudents(subject, className) {
  return useQuery({
    queryKey: ['teacher', 'grading', 'students', subject, className],
    queryFn: () => teacherApi.getGradingStudents(subject, className),
    enabled: !!(subject && className),
    staleTime: 1000 * 60 * 2,
  });
}

export function useTeacherSubjectConfig() {
  return useQuery({
    queryKey: ['teacher', 'subject-config'],
    queryFn: teacherApi.getSubjectConfig,
    staleTime: 1000 * 60 * 10,
  });
}

export function useTeacherGradingStatusMeta() {
  return useQuery({
    queryKey: ['teacher', 'grading', 'status-meta'],
    queryFn: teacherApi.getGradingStatusMeta,
    staleTime: 1000 * 60 * 10,
  });
}

export function useTeacherGradingFilterOptions() {
  return useQuery({
    queryKey: ['teacher', 'grading', 'filters'],
    queryFn: teacherApi.getGradingFilterOptions,
    staleTime: 1000 * 60 * 10,
  });
}

export function useTeacherGradeConfig() {
  return useQuery({
    queryKey: ['teacher', 'grade-config'],
    queryFn: teacherApi.getGradeConfig,
    staleTime: 1000 * 60 * 10,
  });
}

export function useTeacherObservationTypes() {
  return useQuery({
    queryKey: ['teacher', 'observation-types'],
    queryFn: teacherApi.getObservationTypes,
    staleTime: 1000 * 60 * 10,
  });
}

export function useTeacherObservationColors() {
  return useQuery({
    queryKey: ['teacher', 'observation-colors'],
    queryFn: teacherApi.getObservationColors,
    staleTime: 1000 * 60 * 10,
  });
}

export function useTeacherAnalyticsObservationColors() {
  return useQuery({
    queryKey: ['teacher', 'analytics-observation-colors'],
    queryFn: teacherApi.getAnalyticsObservationColors,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSubmitGradeRevision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (revisionData) => teacherApi.submitGradeRevision(revisionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'grade', 'issues'] });
    },
  });
}

export function useUpdateGradeRevision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ revisionId, updatedData }) => teacherApi.updateGradeRevision(revisionId, updatedData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'grade', 'issues'] });
    },
  });
}

export function useCreateObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (observation) => teacherApi.createObservation(observation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'observations'] });
    },
  });
}

export function useUpdateObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ observationId, patch }) => teacherApi.updateObservation(observationId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'observations'] });
    },
  });
}

export function useDeleteObservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (observationId) => teacherApi.deleteObservation(observationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'observations'] });
    },
  });
}
