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

export function useArchiveStats() {
  return useQuery({
    queryKey: ['archive', 'stats'],
    queryFn: archiveApi.getArchiveStats,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSearchVault(query = {}) {
  const hasQuery = Object.keys(query).length > 0;
  return useQuery({
    queryKey: ['archive', 'vault', 'search', query],
    queryFn: () => hasQuery ? archiveApi.searchVault(query).then(r => r?.data ?? r) : Promise.resolve([]),
    staleTime: 1000 * 60 * 5,
    enabled: hasQuery,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────
export function usePromoteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto) => archiveApi.promoteStudent(
      dto.studentId,
      dto.academicYearId,
      dto.fromClass,
      dto.toClass,
      dto.status,
      dto.notes,
    ),
    onSuccess: (_, { studentId }) => {
      // 1. Refresh the explicit student history timeline
      queryClient.invalidateQueries({ queryKey: ['archive', 'students', studentId] });
      
      // 2. Refresh aggregate historical numbers
      queryClient.invalidateQueries({ queryKey: ['archive', 'stats'] });
      
      // FIX: Invalidate global vault search results so lists updating 
      // class cohorts or history display the brand-new states immediately.
      queryClient.invalidateQueries({ queryKey: ['archive', 'vault'] });
    },
  });
}