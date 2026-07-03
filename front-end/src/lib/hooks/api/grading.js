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
    mutationFn: ({ dto, submittedById }) => gradingApi.upsertGrade(dto, submittedById),
    // FIX: Expect studentId/termId context variables to target-invalidate active views
    onSuccess: (_, { dto }) => {
      queryClient.invalidateQueries({ queryKey: ['grading', 'entries'] });
      queryClient.invalidateQueries({ queryKey: ['grading', 'missing-observations'] });
      
      if (dto.studentId) {
        queryClient.invalidateQueries({ queryKey: ['grading', 'students', dto.studentId] });
      }
      if (dto.classId) {
        queryClient.invalidateQueries({ queryKey: ['grading', 'classes', dto.classId] });
      }
    },
  });
}

export function useBulkUpsertGrades() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entries, submittedById }) => gradingApi.bulkUpsertGrades(entries, submittedById),
    onSuccess: () => {
      // Bulk modifications update everything under the grading tree
      queryClient.invalidateQueries({ queryKey: ['grading'] });
    },
  });
}

export function useCorrectGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dto, changedById }) => gradingApi.correctGrade(dto, changedById),
    onSuccess: (_, { dto }) => {
      queryClient.invalidateQueries({ queryKey: ['grading', 'entries'] });
      // FIX: Ensure corrections cascade down to individual sheets and class statistics
      if (dto.studentId) queryClient.invalidateQueries({ queryKey: ['grading', 'students', dto.studentId] });
      if (dto.classId) queryClient.invalidateQueries({ queryKey: ['grading', 'classes', dto.classId] });
    },
  });
}

export function useLockGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ gradeEntryId, lockedById }) => gradingApi.lockGrade(gradeEntryId, lockedById),
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
    mutationFn: ({ gradeEntryId, approvedById }) => gradingApi.approveGrade(gradeEntryId, approvedById),
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
    mutationFn: ({ ids, approvedById }) => gradingApi.bulkApproveGrades(ids, approvedById),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading'] });
    },
  });
}