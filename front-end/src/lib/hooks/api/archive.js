import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { archiveApi } from '../../../lib/api';

// ── Queries ──────────────────────────────────────────────────────────────────
export function usePromotionHistory(studentId) {
  return useQuery({
    queryKey: ['archive', 'students', studentId, 'promotions'],
    queryFn: () => archiveApi.getPromotionHistory(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 30, // 30 mins
  });
}

export function useAcademicYears() {
  return useQuery({
    queryKey: ['archive', 'academic-years'],
    queryFn: archiveApi.getAcademicYears,
    staleTime: 1000 * 60 * 30,
  });
}

export function useArchiveStats({ academicYearId, termId, level } = {}) {
  return useQuery({
    queryKey: ['archive', 'stats', academicYearId, termId, level],
    queryFn: () => archiveApi.getArchiveStats({ academicYearId, termId, level }),
    staleTime: 1000 * 60 * 10,
  });
}

export function useSearchVault(query = {}) {
  const hasQuery = Object.keys(query).length > 0;
  return useQuery({
    queryKey: ['archive', 'vault', 'search', query],
    queryFn: () => archiveApi.searchVault(query).then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 5,
    enabled: hasQuery,
  });
}

export function useClassBenchmarks(classId) {
  return useQuery({
    queryKey: ['archive', 'class-benchmarks', classId],
    queryFn: () => archiveApi.getClassBenchmarks(classId).then(r => r?.data ?? r),
    enabled: !!classId,
    staleTime: 1000 * 60 * 10,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────
export function usePromoteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto) => archiveApi.promoteStudent(dto),
    onSuccess: (_, { studentId }) => {
      queryClient.invalidateQueries({ queryKey: ['archive', 'students', studentId] });
      queryClient.invalidateQueries({ queryKey: ['archive', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['archive', 'vault'] });
    },
  });
}