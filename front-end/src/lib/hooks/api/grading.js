import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gradingApi } from '../../../lib/api';

// ── Queries ──────────────────────────────────────────────────────────────────
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

// ── Mutations ────────────────────────────────────────────────────────────────
export function useUpsertGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto) => gradingApi.upsertGrade(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading', 'entries'] });
      queryClient.invalidateQueries({ queryKey: ['grading', 'missing-observations'] });
    },
  });
}

export function useBulkUpsertGrades() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entries) => gradingApi.bulkUpsertGrades(entries),
    onSuccess: () => {
      // Bulk modifications update everything under the grading tree
      queryClient.invalidateQueries({ queryKey: ['grading'] });
    },
  });
}

export function useCorrectGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto) => gradingApi.correctGrade(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading', 'entries'] });
      queryClient.invalidateQueries({ queryKey: ['grading', 'missing-observations'] });
    },
  });
}

export function useLockGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gradeEntryId) => gradingApi.lockGrade(gradeEntryId),
    onSuccess: () => {
      // Locking grade state blocks editing; components tracking eligibility must update
      queryClient.invalidateQueries({ queryKey: ['grading', 'entries'] });
      queryClient.invalidateQueries({ queryKey: ['grading', 'missing-observations'] });
    },
  });
}

export function useUnlockGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gradeEntryId) => gradingApi.unlockGrade(gradeEntryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading', 'entries'] });
      queryClient.invalidateQueries({ queryKey: ['grading', 'missing-observations'] });
    },
  });
}

export function useApproveGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gradeEntryId) => gradingApi.approveGrade(gradeEntryId),
    onSuccess: () => {
      // FIX: Invalidate entries, student summaries, and performance trends globally since status shifted to locked/finalized
      queryClient.invalidateQueries({ queryKey: ['grading', 'entries'] });
      queryClient.invalidateQueries({ queryKey: ['grading', 'classes'] });
      queryClient.invalidateQueries({ queryKey: ['grading', 'students'] });
    },
  });
}

export function useBulkApproveGrades() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => gradingApi.bulkApproveGrades(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading'] });
    },
  });
}