import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '../../../lib/api';

export function useStudentReportCard(studentId, termId) {
  return useQuery({
    queryKey: ['reports', 'students', studentId, 'terms', termId, 'report-card'],
    queryFn: () => reportsApi.getStudentReportCard(studentId, termId),
    enabled: !!studentId && !!termId,
    staleTime: 1000 * 60 * 30,
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

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, termId, documentType, purpose }) =>
      reportsApi.generateReportCard(studentId, termId, documentType, purpose),
    onSuccess: (_, { studentId, termId }) => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'students', studentId, 'terms', termId] });
    },
  });
}

export function useReleaseReportCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportCardId) => reportsApi.releaseReportCard(reportCardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'report-cards'] });
    },
  });
}

export function useVerifyDocument(hash) {
  return useQuery({
    queryKey: ['reports', 'verify', hash],
    queryFn: () => reportsApi.verifyDocument(hash),
    enabled: !!hash,
    staleTime: 1000 * 60 * 60,
    retry: false,
  });
}
