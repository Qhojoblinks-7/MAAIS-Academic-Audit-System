import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gradingApi } from '../../../lib/api';

export function useStudentTermGrades(studentId, termId) {
  return useQuery({
    queryKey: ['grading', 'students', studentId, 'terms', termId, 'grades'],
    queryFn: () => gradingApi.getStudentTermGrades(studentId, termId),
    enabled: !!studentId && !!termId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useGradeEntry(id) {
  return useQuery({
    queryKey: ['grading', 'entries', id],
    queryFn: () => gradingApi.getGradeEntry(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useMissingObservations(termId) {
  return useQuery({
    queryKey: ['grading', 'missing-observations', termId],
    queryFn: () => gradingApi.getMissingObservations(termId),
    enabled: !!termId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useClassPerformance(classId, termId) {
  return useQuery({
    queryKey: ['grading', 'classes', classId, 'terms', termId, 'performance'],
    queryFn: () => gradingApi.getClassPerformanceSummary(classId, termId),
    enabled: !!classId && !!termId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpsertGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dto, submittedById }) => gradingApi.upsertGrade(dto, submittedById),
    onSuccess: (_, { dto }) => {
      queryClient.invalidateQueries({ queryKey: ['grading', 'entries'] });
      queryClient.invalidateQueries({ queryKey: ['grading', 'missing-observations'] });
    },
  });
}

export function useBulkUpsertGrades() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entries, submittedById }) => gradingApi.bulkUpsertGrades(entries, submittedById),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading'] });
    },
  });
}

export function useCorrectGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dto, changedById }) => gradingApi.correctGrade(dto, changedById),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading', 'entries'] });
    },
  });
}

export function useLockGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gradeEntryId, lockedById }) => gradingApi.lockGrade(gradeEntryId, lockedById),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading', 'entries'] });
    },
  });
}

export function useUnlockGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gradeEntryId) => gradingApi.unlockGrade(gradeEntryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading', 'entries'] });
    },
  });
}

export function useApproveGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gradeEntryId, approvedById }) => gradingApi.approveGrade(gradeEntryId, approvedById),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading', 'entries'] });
      queryClient.invalidateQueries({ queryKey: ['grading', 'classes'] });
    },
  });
}

export function useBulkApproveGrades() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, approvedById }) => gradingApi.bulkApproveGrades(ids, approvedById),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading'] });
    },
  });
}
