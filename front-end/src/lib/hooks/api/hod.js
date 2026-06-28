import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hodApi } from '../../../lib/api';

// ── Queries ──────────────────────────────────────────────────────────────────
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
    queryFn: () => hodApi.getDepartmentProgress(params).then(r => {
      const payload = r?.data ?? r;
      return payload?.items ?? payload ?? [];
    }),
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

export function useGradeComparison(subjectId, termA, termB) {
  return useQuery({
    queryKey: ['hod', 'grades', 'compare', subjectId, termA, termB],
    queryFn: () => hodApi.getGradeComparison(subjectId, termA, termB).then(r => r?.data ?? r),
    enabled: !!subjectId && !!termA && !!termB,
    staleTime: 1000 * 60 * 5,
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

export function useActiveSessions() {
  return useQuery({
    queryKey: ['hod', 'active-sessions'],
    queryFn: () => hodApi.getActiveSessions().then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSupportTickets(params = {}) {
   return useQuery({
     queryKey: ['hod', 'support-tickets', params],
     queryFn: () => hodApi.getSupportTickets(params).then(r => r?.data ?? r),
     staleTime: 1000 * 60 * 2,
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

export function useDepartmentTeachers(params = {}) {
  return useQuery({
    queryKey: ['hod', 'department-teachers', params],
    queryFn: () => hodApi.getDepartmentTeachers(params).then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 10,
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
  return useQuery({
    queryKey: ['hod', 'student-academic-history', studentId],
    queryFn: () => hodApi.getStudentAcademicHistory(studentId).then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 5,
    enabled: !!studentId,
  });
}

export function useComplianceCohortPerformance() {
  return useQuery({
    queryKey: ['hod', 'compliance', 'cohort-performance'],
    queryFn: () => hodApi.getComplianceCohortPerformance().then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 10,
  });
}

export function useComplianceTimeline() {
  return useQuery({
    queryKey: ['hod', 'compliance', 'timeline'],
    queryFn: () => hodApi.getComplianceTimeline().then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 10,
  });
}

export function usePromotionMetrics() {
  return useQuery({
    queryKey: ['hod', 'promotion-metrics'],
    queryFn: () => hodApi.getPromotionMetrics().then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAllAcademicYears() {
  return useQuery({
    queryKey: ['hod', 'academic-years'],
    queryFn: () => hodApi.getAllAcademicYears().then(r => r?.data ?? r),
    staleTime: 1000 * 60 * 30,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────
export function useLockDepartmentMatrix() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (classId) => hodApi.lockDepartmentMatrix(classId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'department-progress'] });
      qc.invalidateQueries({ queryKey: ['hod', 'locked-terms'] });
      // FIX: Invalidate active validations checking whether matrices are fully locked
      qc.invalidateQueries({ queryKey: ['hod', 'lock-validation'] });
    },
  });
}

export function useUnlockDepartmentMatrix() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (classId) => hodApi.unlockDepartmentMatrix(classId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'department-progress'] });
      qc.invalidateQueries({ queryKey: ['hod', 'locked-terms'] });
      qc.invalidateQueries({ queryKey: ['hod', 'lock-validation'] });
    },
  });
}

export function useExportWAECCSV() {
  return useMutation({
    mutationFn: ({ termId, className }) => hodApi.exportWAECCSV(termId, className),
  });
}

export const useExportWAEC = useExportWAECCSV;

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
      // FIX: Approved grade changes impact structural progress indicators and statistics
      qc.invalidateQueries({ queryKey: ['hod', 'department-progress'] });
      qc.invalidateQueries({ queryKey: ['hod', 'teacher-submissions'] });
      qc.invalidateQueries({ queryKey: ['hod', 'grades', 'compare'] });
    },
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

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) => hodApi.revokeSession(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'active-sessions'] });
    },
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

export function useImpersonateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ teacherId, body }) => hodApi.impersonateTeacher(teacherId, body),
    onSuccess: () => {
      // FIX: Full cache reset avoids viewing prior credentials' structural data lines
      qc.clear();
    },
  });
}

export function useStopImpersonation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: hodApi.stopImpersonation,
    onSuccess: () => {
      qc.clear();
    },
  });
}

export function useTriggerPromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (academicYearId) => hodApi.triggerPromotion(academicYearId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'promotion-metrics'] });
      qc.invalidateQueries({ queryKey: ['hod', 'promotion-recommendations'] });
    },
  });
}

export function useResolveAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (alertId) => hodApi.resolveAlert(alertId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'intervention-alerts'] });
    },
  });
}

export function useAddCounselingNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId, text }) => hodApi.addCounselingNote({ alertId, text }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hod', 'intervention-alerts'] });
    },
  });
}