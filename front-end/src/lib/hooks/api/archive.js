import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { archiveApi } from '../../../lib/api';

export function usePromotionHistory(studentId) {
  return useQuery({
    queryKey: ['archive', 'students', studentId, 'promotions'],
    queryFn: () => archiveApi.getPromotionHistory(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 30,
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
      queryClient.invalidateQueries({ queryKey: ['archive', 'students', studentId] });
      queryClient.invalidateQueries({ queryKey: ['archive', 'stats'] });
    },
  });
}
