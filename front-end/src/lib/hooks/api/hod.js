import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hodApi } from '../../../lib/api';

export function useAuditLogs(params = {}) {
  return useQuery({
    queryKey: ['hod', 'audit-logs', params],
    queryFn: () => hodApi.getAuditLogs(params).then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 2,
  });
}

export function useInterventionAlerts(params = {}) {
  return useQuery({
    queryKey: ['hod', 'intervention-alerts', params],
    queryFn: () => hodApi.getInterventionAlerts(params).then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 2,
  });
}

export function useDepartmentProgress(params = {}) {
  return useQuery({
    queryKey: ['hod', 'department-progress', params],
    queryFn: () => hodApi.getDepartmentProgress(params).then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTeacherSubmissions() {
  return useQuery({
    queryKey: ['hod', 'teacher-submissions'],
    queryFn: () => hodApi.getTeacherSubmissions().then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 5,
  });
}

export function useLockedTerms() {
  return useQuery({
    queryKey: ['hod', 'locked-terms'],
    queryFn: () => hodApi.getLockedTerms().then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 10,
  });
}

export function useGradeRevisions() {
  return useQuery({
    queryKey: ['hod', 'grade-revisions'],
    queryFn: () => hodApi.getGradeRevisions().then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 2,
  });
}

export function useValidateLock(termId) {
  return useQuery({
    queryKey: ['hod', 'lock-validation', termId],
    queryFn: () => hodApi.validateLock(termId),
    enabled: !!termId,
    staleTime: 1000 * 60 * 1,
  });
}

export function useLockDepartmentMatrix() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (termId) => hodApi.lockDepartmentMatrix(termId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'department-progress'] });
      qc.invalidateQueries({ queryKey: ['hod', 'locked-terms'] });
    },
  });
}

export function useUnlockDepartmentMatrix() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (termId) => hodApi.unlockDepartmentMatrix(termId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'department-progress'] });
      qc.invalidateQueries({ queryKey: ['hod', 'locked-terms'] });
    },
  });
}

export function useExportWAECCSV() {
  return useMutation({
    mutationFn: ({ termId, className }) => hodApi.exportWAECCSV(termId, className),
  });
}

export function useGradeComparison(subjectId, termA, termB) {
  return useQuery({
    queryKey: ['hod', 'grades', 'compare', subjectId, termA, termB],
    queryFn: () => hodApi.getGradeComparison(subjectId, termA, termB).then(r => r?.data ?? r),
    enabled: !!subjectId && !!termA && !!termB,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateHODComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, comment }) => hodApi.updateHODComment(recordId, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'audit-logs'] });
    },
  });
}

export function useRejectGradeRevision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, reason }) => hodApi.rejectGradeRevision(recordId, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'grade-revisions'] });
      qc.invalidateQueries({ queryKey: ['hod', 'audit-logs'] });
    },
  });
}

export function useApproveGradeRevision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, comment }) => hodApi.approveGradeRevision(recordId, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'grade-revisions'] });
      qc.invalidateQueries({ queryKey: ['hod', 'audit-logs'] });
    },
  });
}

export function useArchivedDepartmentData(params = {}) {
  return useQuery({
    queryKey: ['hod', 'archived-data', params],
    queryFn: () => hodApi.getArchivedDepartmentData(params).then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePromotionRecommendations(params = {}) {
  return useQuery({
    queryKey: ['hod', 'promotion-recommendations', params],
    queryFn: () => hodApi.getPromotionRecommendations(params).then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 5,
  });
}

export function useHODSettings() {
  return useQuery({
    queryKey: ['hod', 'settings'],
    queryFn: () => hodApi.getHODSettings().then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpdateHODSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings) => hodApi.updateHODSettings(settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'settings'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      hodApi.changePassword(currentPassword, newPassword),
  });
}

export function useMFAEnroll() {
  return useMutation({
    mutationFn: hodApi.mfaEnroll,
  });
}

export function useMFAVerify() {
  return useMutation({
    mutationFn: (code) => hodApi.mfaVerify(code),
  });
}

export function useActiveSessions() {
  return useQuery({
    queryKey: ['hod', 'active-sessions'],
    queryFn: () => hodApi.getActiveSessions().then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) => hodApi.revokeSession(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'active-sessions'] });
    },
  });
}

export function useSupportTickets(params = {}) {
  return useQuery({
    queryKey: ['hod', 'support-tickets', params],
    queryFn: () => hodApi.getSupportTickets(params).then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateSupportTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ticket) => hodApi.createSupportTicket(ticket),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'support-tickets'] });
    },
  });
}

export function useUpdateSupportTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, patch }) => hodApi.updateSupportTicket(ticketId, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'support-tickets'] });
    },
  });
}

export function useEscalateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, body }) => hodApi.escalateTicket(ticketId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'support-tickets'] });
    },
  });
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ['hod', 'system-health'],
    queryFn: hodApi.getSystemHealth,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });
}

export function useEscalatedIssues(params = {}) {
  return useQuery({
    queryKey: ['hod', 'escalated-issues', params],
    queryFn: () => hodApi.getEscalatedIssues(params).then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 5,
  });
}

export function useContactChannels() {
  return useQuery({
    queryKey: ['hod', 'contact-channels'],
    queryFn: () => hodApi.getContactChannels(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpdateContactChannels() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (channels) => hodApi.updateContactChannels(channels),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'contact-channels'] });
    },
  });
}

export function useCreateEscalation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => hodApi.createEscalation(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'escalated-issues'] });
    },
  });
}

export function useResetTeacherPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teacherId, newPassword }) =>
      hodApi.resetTeacherPassword(teacherId, newPassword),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'department-teachers'] });
    },
  });
}

export function useDepartmentTeachers(params = {}) {
  return useQuery({
    queryKey: ['hod', 'department-teachers', params],
    queryFn: () => hodApi.getDepartmentTeachers(params).then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 10,
  });
}

export function useImpersonateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teacherId, body }) => hodApi.impersonateTeacher(teacherId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'active-impersonations'] });
    },
  });
}

export function useStopImpersonation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hodApi.stopImpersonation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'active-impersonations'] });
    },
  });
}

export function useActiveImpersonations() {
  return useQuery({
    queryKey: ['hod', 'active-impersonations'],
    queryFn: () => hodApi.getActiveImpersonations().then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 5,
  });
}

export function useStudentAcademicHistory(studentId) {