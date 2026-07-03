import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '../../../lib/api';

// ── Queries ──────────────────────────────────────────────────────────────────
export function useStudentReportCard(studentId, termId) {
  return useQuery({
    queryKey: ['reports', 'students', studentId, 'terms', termId, 'report-card'],
    queryFn: () => reportsApi.getStudentReportCard(studentId, termId),
    enabled: !!studentId && !!termId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useStudentTranscript(studentId) {
  return useQuery({
    queryKey: ['reports', 'students', studentId, 'transcript'],
    queryFn: () => reportsApi.getStudentTranscript(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 30,
  });
}

export function useVerifyDocument(hash) {
  return useQuery({
    queryKey: ['reports', 'verify', hash],
    queryFn: () => reportsApi.verifyDocument(hash),
    enabled: !!hash,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: false,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────
export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, termId, documentType, purpose }) =>
      reportsApi.generateReportCard(studentId, termId, documentType, purpose),
    onSuccess: (_, { studentId, termId }) => {
      // 1. Invalidate term-specific card data
      queryClient.invalidateQueries({ queryKey: ['reports', 'students', studentId, 'terms', termId] });
      
      // FIX: Invalidate cumulative historical transcripts since performance metrics changed
      queryClient.invalidateQueries({ queryKey: ['reports', 'students', studentId, 'transcript'] });
    },
  });
}

export function useReleaseReportCard() {
  const queryClient = useQueryClient();
  return useMutation({
    // FIX: Pass context variables through to hook callers so the mutation has insight on what it's changing
    mutationFn: ({ reportCardId }) => reportsApi.releaseReportCard(reportCardId),
    onSuccess: (_, { studentId, termId }) => {
      // 1. Clear general administrative listing roots
      queryClient.invalidateQueries({ queryKey: ['reports', 'report-cards'] });
      
      // FIX: Ensure that the student or parent tracking UI drops the old "unreleased/draft" cache lines immediately
      if (studentId) {
        queryClient.invalidateQueries({ queryKey: ['reports', 'students', studentId] });
      }
    },
  });
}