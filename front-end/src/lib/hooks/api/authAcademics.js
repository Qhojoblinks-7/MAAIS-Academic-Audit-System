import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, academicApi, usersApi } from '../../../lib/api';

// ── Authentication ───────────────────────────────────────────────────────────
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      // Clear all cached data on fresh login to prevent memory/state bleed
      queryClient.clear();
    },
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

// ── Academic Year & Structure ────────────────────────────────────────────────
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

// ── Assignments ──────────────────────────────────────────────────────────────
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

// ── Users / Students ─────────────────────────────────────────────────────────
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

// ── Generic Mutation Factories ────────────────────────────────────────────────
export function useCreateMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_data, _variables, _context, queryClient) => {
      queryClient.invalidateQueries(options.invalidate || []);
    },
    ...options,
  });
}

export function useUpdateMutation(mutationFn, options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_data, _variables, _context, queryClient) => {
      qc.invalidateQueries(options.invalidate || []);
    },
    ...options,
  });
}

// ── Explicit Mutations (Replacing the generic wrappers) ──────────────────────
export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.createStudent, // Assuming endpoint exists in your contract
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'students'] });
    },
  });
}

export function useUpdateStudentProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => usersApi.updateStudentProfile(id, data), 
    onSuccess: (_, { id }) => {
      // Targets both the primary listing array and the specific individual view
      queryClient.invalidateQueries({ queryKey: ['users', 'students', id] });
      queryClient.invalidateQueries({ queryKey: ['users', 'students'] });
    },
  });
}