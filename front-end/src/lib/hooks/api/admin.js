import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../lib/api';

// ── Users / Staff ────────────────────────────────────────────────────────────
export function useAllStudents() {
  return useQuery({
    queryKey: ['admin', 'students'],
    queryFn: adminApi.getAllStudents,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudentProfile(id) {
  return useQuery({
    queryKey: ['admin', 'students', id],
    queryFn: () => adminApi.getStudentProfile(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAllStaff() {
  return useQuery({
    queryKey: ['admin', 'staff'],
    queryFn: adminApi.getAllStaff,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto) => adminApi.createStaff(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'staff'] }),
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto) => adminApi.createStudent(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'students'] }),
  });
}

export function useCreateParent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto) => adminApi.createParent(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'students'] }),
  });
}

export function useUpdateStudentProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => adminApi.updateStudentProfile(id, body),
    onSuccess: (_, { id }) =>
      qc.invalidateQueries({ queryKey: ['admin', 'students', id] }),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.deactivateUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'students'] });
      qc.invalidateQueries({ queryKey: ['admin', 'staff'] });
    },
  });
}

// ── Academic Structure ───────────────────────────────────────────────────────
export function useActiveYear() {
  return useQuery({
    queryKey: ['admin', 'academic', 'activeYear'],
    queryFn: adminApi.getActiveYear,
    staleTime: 1000 * 60 * 10,
  });
}

export function useAcademicYears() {
  return useQuery({
    queryKey: ['admin', 'academic', 'years'],
    queryFn: adminApi.getAcademicYears,
    staleTime: 1000 * 60 * 10,
  });
}

export function useAllDepartments() {
  return useQuery({
    queryKey: ['admin', 'academic', 'departments'],
    queryFn: adminApi.getAllDepartments,
    staleTime: 1000 * 60 * 10,
  });
}

export function useAllSubjects() {
  return useQuery({
    queryKey: ['admin', 'academic', 'subjects'],
    queryFn: adminApi.getAllSubjects,
    staleTime: 1000 * 60 * 10,
  });
}

export function useAllClasses() {
  return useQuery({
    queryKey: ['admin', 'academic', 'classes'],
    queryFn: adminApi.getAllClasses,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto) => adminApi.createYear(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'academic'] }),
  });
}

export function useActivateYear() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.activateYear(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'academic'] }),
  });
}

export function useCreateTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto) => adminApi.createTerm(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'academic'] }),
  });
}

export function useActivateTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.activateTerm(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'academic'] }),
  });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto) => adminApi.createDepartment(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'academic'] }),
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto) => adminApi.createSubject(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'academic'] }),
  });
}

export function useCreateClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto) => adminApi.createClass(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'academic'] }),
  });
}

export function useAssignClassTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }) => adminApi.assignClassTeacher(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'academic'] }),
  });
}

export function useAssignTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto) => adminApi.assignTeacher(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'academic'] }),
  });
}

// ── Reports ──────────────────────────────────────────────────────────────────
export function useGenerateReportCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, termId }) =>
      adminApi.generateReportCard(studentId, termId),
  });
}

export function useBatchGenerateReportCards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classSectionId, termId }) =>
      adminApi.batchGenerateReportCards(classSectionId, termId),
  });
}

export function useBuildTranscript() {
  return useMutation({
    mutationFn: (studentIdOrIndex) =>
      adminApi.buildTranscript(studentIdOrIndex),
  });
}

export function useVerifyDocument() {
  return useQuery({
    queryKey: ['admin', 'reports', 'verify'],
    queryFn: () => adminApi.verifyDocument(''),
    staleTime: 1000 * 60 * 5,
  });
}

// ── Archive / Vault ──────────────────────────────────────────────────────────
export function useArchiveStats() {
  return useQuery({
    queryKey: ['admin', 'archive', 'stats'],
    queryFn: adminApi.getArchiveStats,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePromoteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto) => adminApi.promoteStudent(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'archive'] }),
  });
}

export function useDatabaseHealth() {
  return useQuery({
    queryKey: ['admin', 'archive', 'health'],
    queryFn: adminApi.getDatabaseHealth,
    staleTime: 1000 * 30,
  });
}

// ── Communications ───────────────────────────────────────────────────────────
export function useUnreadNotifications() {
  return useQuery({
    queryKey: ['admin', 'comms', 'unread'],
    queryFn: adminApi.getUnreadNotifications,
    staleTime: 1000 * 30,
  });
}

export function useAnalyticsPulse() {
  return useQuery({
    queryKey: ['admin', 'comms', 'pulse'],
    queryFn: () => adminApi.getAnalyticsPulse(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTickets() {
  return useQuery({
    queryKey: ['admin', 'comms', 'tickets'],
    queryFn: () => adminApi.listTickets(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }) => adminApi.updateTicketStatus(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'comms', 'tickets'] }),
  });
}

// ── Grading (Admin / HOD) ────────────────────────────────────────────────────
export function useUpsertGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dto, submittedById }) =>
      adminApi.upsertGrade(dto, submittedById),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grading'] }),
  });
}

export function useBulkUpsertGrades() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entries, submittedById }) =>
      adminApi.bulkUpsertGrades(entries, submittedById),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grading'] }),
  });
}

export function useLockGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ gradeEntryId, lockedById }) =>
      adminApi.lockGrade(gradeEntryId, lockedById),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grading'] }),
  });
}

export function useUnlockGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (gradeEntryId) => adminApi.unlockGrade(gradeEntryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grading'] }),
  });
}

export function useApproveGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ gradeEntryId, approvedById }) =>
      adminApi.approveGrade(gradeEntryId, approvedById),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grading'] }),
  });
}

export function useBulkApproveGrades() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, approvedById }) =>
      adminApi.bulkApproveGrades(ids, approvedById),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grading'] }),
  });
}

export function useCorrectGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dto, changedById }) => adminApi.correctGrade(dto, changedById),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grading'] }),
  });
}

export function useGradeEntry(id) {
  return useQuery({
    queryKey: ['grading', 'entries', id],
    queryFn: () => adminApi.getGradeEntry(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useMissingObservations(termId) {
  return useQuery({
    queryKey: ['grading', 'missing-observations', termId],
    queryFn: () => adminApi.getMissingObservations(termId),
    enabled: !!termId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useClassPerformance(classId, termId) {
  return useQuery({
    queryKey: ['grading', 'classes', classId, 'terms', termId, 'performance'],
    queryFn: () => adminApi.getClassPerformance(classId, termId),
    enabled: !!classId && !!termId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudentTermGrades(studentId, termId) {
  return useQuery({
    queryKey: ['grading', 'students', studentId, 'terms', termId],
    queryFn: () => adminApi.getStudentTermGrades(studentId, termId),
    enabled: !!studentId && !!termId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminProfile() {
  return useQuery({
    queryKey: ['admin', 'profile'],
    queryFn: adminApi.getTeacherProfile,
    staleTime: 1000 * 60 * 5,
  });
}

// ── Timetable ────────────────────────────────────────────────────────────────
export function useTimetableEntries(params = {}) {
  return useQuery({
    queryKey: ['admin', 'timetable', params],
    queryFn: () => adminApi.getTimetableEntries(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useMySchedule() {
  return useQuery({
    queryKey: ['admin', 'timetable', 'my-schedule'],
    queryFn: adminApi.getMySchedule,
    staleTime: 1000 * 60 * 5,
  });
}

export function useClashes(teacherId) {
  return useQuery({
    queryKey: ['admin', 'timetable', 'clashes', teacherId],
    queryFn: () => adminApi.getClashes(teacherId),
    enabled: !!teacherId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTimetableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => adminApi.createTimetableEntry(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'timetable'] }),
  });
}

export function useUpdateTimetableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => adminApi.updateTimetableEntry(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'timetable'] }),
  });
}

export function useDeleteTimetableEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.deleteTimetableEntry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'timetable'] }),
  });
}

// ── Interventions & Behavior ─────────────────────────────────────────────────
export function useStudentInterventions(studentId) {
  return useQuery({
    queryKey: ['admin', 'interventions', studentId],
    queryFn: () => adminApi.getStudentInterventions(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudentBehavior(studentId) {
  return useQuery({
    queryKey: ['admin', 'behavior', studentId],
    queryFn: () => adminApi.getStudentBehavior(studentId),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateBehavior() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, data }) =>
      adminApi.createBehavior(studentId, data),
    onSuccess: (_, { studentId }) =>
      qc.invalidateQueries({ queryKey: ['admin', 'behavior', studentId] }),
  });
}
