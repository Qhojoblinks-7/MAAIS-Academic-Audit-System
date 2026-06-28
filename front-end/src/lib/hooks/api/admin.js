import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, api } from '../../../lib/api';

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

export function useBatchImportStudents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (students) => adminApi.batchImportStudents(students),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'students'] }),
  });
}

export function useCreateParent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto) => adminApi.createParent(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'parents'] }),
  });
}

export function useAllParents() {
  return useQuery({
    queryKey: ['admin', 'parents'],
    queryFn: adminApi.getAllParents,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateStudentProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => adminApi.updateStudentProfile(id, body),
    onSuccess: (_, { id }) => {
      // FIX: Invalidate both the specific profile AND the main user lists
      qc.invalidateQueries({ queryKey: ['admin', 'students', id] });
      qc.invalidateQueries({ queryKey: ['admin', 'students'] });
    },
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

export function useResetStaffCredentials() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (staffId) => adminApi.resetStaffCredentials(staffId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'staff'] }),
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

export function useAdminAuditLogs(params = {}) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => adminApi.getAuditLogs(params).then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 5,
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

export function useAssignHOD() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deptId, staffId }) => adminApi.assignHOD(deptId, staffId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'academic'] }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deptId) => adminApi.deleteDepartment(deptId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'academic'] }),
  });
}

export function useTransferTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ toDeptId, teacherId, fromDeptId }) =>
      adminApi.transferTeacher(toDeptId, teacherId, fromDeptId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'academic'] }),
  });
}

export function useFreezeDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (deptId) => adminApi.freezeDepartment(deptId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'academic'] }),
  });
}

export function useAuthorizeTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deptId, template }) =>
      adminApi.authorizeTemplate?.(deptId, template) ||
      api.patch(`/admin/departments/${deptId}/template`, { template }),
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
    mutationFn: ({ studentId, termId }) => adminApi.generateReportCard(studentId, termId),
    // FIX: Clear report dependencies on update
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reports'] }), 
  });
}

export function useBatchGenerateReportCards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classSectionId, termId }) => adminApi.batchGenerateReportCards(classSectionId, termId),
    // FIX: Clear report dependencies on update
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  });
}

export function useBuildTranscript() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentIdOrIndex) => adminApi.buildTranscript(studentIdOrIndex),
    // FIX: Force report layout data evaluation to drop old cache lines
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reports'] }),
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'archive'] });
      qc.invalidateQueries({ queryKey: ['admin', 'students'] });
    },
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
    mutationFn: ({ dto, submittedById }) => adminApi.upsertGrade(dto, submittedById),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grading'] }),
  });
}

export function useBulkUpsertGrades() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entries, submittedById }) => adminApi.bulkUpsertGrades(entries, submittedById),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grading'] }),
  });
}

export function useLockGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ gradeEntryId, lockedById }) => adminApi.lockGrade(gradeEntryId, lockedById),
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
    mutationFn: ({ gradeEntryId, approvedById }) => adminApi.approveGrade(gradeEntryId, approvedById),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grading'] }),
  });
}

export function useBulkApproveGrades() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, approvedById }) => adminApi.bulkApproveGrades(ids, approvedById),
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
    mutationFn: ({ studentId, data }) => adminApi.createBehavior(studentId, data),
    onSuccess: (_, { studentId }) => qc.invalidateQueries({ queryKey: ['admin', 'behavior', studentId] }),
  });
}

// ── Approvals ─────────────────────────────────────────────────────────────────
export function useApprovals(query = {}) {
  return useQuery({
    queryKey: ['admin', 'approvals', query],
    queryFn: () => adminApi.getApprovals(query),
    staleTime: 1000 * 30,
  });
}

export function useApprovalStats() {
  return useQuery({
    queryKey: ['admin', 'approvals', 'stats'],
    queryFn: adminApi.getApprovalStats,
    staleTime: 1000 * 30,
  });
}

export function useCreateApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto) => adminApi.createApproval(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'approvals'] }),
  });
}

export function useResolveApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }) => adminApi.resolveApproval(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'approvals'] }),
  });
}

export function useDeleteApproval() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.deleteApproval(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'approvals'] }),
  });
}

// ── Grading Rules ─────────────────────────────────────────────────────────────
export function useGradingRules(termId) {
  return useQuery({
    queryKey: ['admin', 'grading', 'rules', termId],
    queryFn: () => adminApi.getGradingRules(termId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateGradingRules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => adminApi.updateGradingRules(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'grading'] }),
  });
}

// ── Report Generation (Admin) ─────────────────────────────────────────────────
export function useStudentsForReportGeneration(query) {
  return useQuery({
    queryKey: ['admin', 'reports', 'generation', 'students', query],
    queryFn: () => adminApi.getStudentsForReportGeneration(query),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCompileBatchReports() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto) => adminApi.compileBatchReports(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  });
}

export function useReportBlockingIssues(classSectionId) {
  return useQuery({
    queryKey: ['admin', 'reports', 'blocking-issues', classSectionId],
    queryFn: () => adminApi.getReportBlockingIssues(classSectionId),
    enabled: !!classSectionId,
    staleTime: 1000 * 30,
  });
}

export function useSendReportNudge() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto) => adminApi.sendReportNudge(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reports', 'nudge'] }),
  });
}

// ── Admin Settings ────────────────────────────────────────────────────────────
export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: adminApi.getAdminSettings,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSystemFreeze() {
  return useQuery({
    queryKey: ['admin', 'system', 'freeze'],
    queryFn: () => adminApi.getSystemFreeze(),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });
}

export function useToggleSystemFreeze() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ enabled, reason }) => adminApi.toggleSystemFreeze(enabled, reason),
    retry: false,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'system'] });
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });
}

export function useUpdateAdminSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, data }) => {
      if (type === 'mfa') return adminApi.updateAdminMfa(data.enabled);
      if (type === 'maintenance') return adminApi.toggleMaintenanceMode(data.enabled);
      if (type === 'credentials') return adminApi.updateAdminCredentials(data);
      return Promise.resolve({});
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'settings'] }),
  });
}

export function useLockTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.lockTerm(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'academic'] });
      qc.invalidateQueries({ queryKey: ['admin', 'archive'] });
    },
  });
}

export function useUnlockTerm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.unlockTerm(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'academic'] });
      qc.invalidateQueries({ queryKey: ['admin', 'archive'] });
    },
  });
}