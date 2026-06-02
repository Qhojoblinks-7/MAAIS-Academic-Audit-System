import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, academicApi, usersApi } from '../../../lib/api';

export function useLogin() {
  return useMutation({
    mutationFn: authApi.login,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAcademicYear() {
  return useQuery({
    queryKey: ['academic', 'years', 'active'],
    queryFn: academicApi.getActiveYear,
    staleTime: 1000 * 60 * 10,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ['academic', 'departments'],
    queryFn: academicApi.getAllDepartments,
    staleTime: 1000 * 60 * 30,
  });
}

export function useSubjects() {
  return useQuery({
    queryKey: ['academic', 'subjects'],
    queryFn: academicApi.getAllSubjects,
    staleTime: 1000 * 60 * 30,
  });
}

export function useClasses() {
  return useQuery({
    queryKey: ['academic', 'classes'],
    queryFn: academicApi.getAllClasses,
    staleTime: 1000 * 60 * 30,
  });
}

export function useTeacherAssignments(teacherId) {
  return useQuery({
    queryKey: ['academic', 'assignments', teacherId],
    queryFn: () => academicApi.getTeacherAssignments(teacherId),
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useMyAssignments() {
  return useQuery({
    queryKey: ['academic', 'my-assignments'],
    queryFn: academicApi.getMyAssignments,
    staleTime: 1000 * 60 * 10,
  });
}

export function useAllStudents() {
  return useQuery({
    queryKey: ['users', 'students'],
    queryFn: usersApi.getAllStudents,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudentProfile(id) {
  return useQuery({
    queryKey: ['users', 'students', id],
    queryFn: () => usersApi.getStudentProfile(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateMutation(mutationFn, queryKey) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      if (queryKey) queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useUpdateMutation(mutationFn, queryKey) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      if (queryKey) queryClient.invalidateQueries({ queryKey });
    },
  });
}
