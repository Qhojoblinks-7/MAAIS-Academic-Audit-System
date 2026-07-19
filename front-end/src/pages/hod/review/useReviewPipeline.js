import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useDepartmentProgress,
  useGradeRevisions,
  useLockedTerms,
  useLockDepartmentMatrix,
  useUnlockDepartmentMatrix,
  useExportWAECCSV,
  useLockTerm,
  useUnlockTerm,
  useUpdateHODComment,
  useRejectGradeRevision,
  useApproveGradeRevision,
} from '@/lib/hooks/api/hod';
import { hodService } from '@/services/hodService';
import { auditTrail } from '@/services/auditTrailService';
import { eventBus } from '@/services/eventBus';
import { notification } from '@/services/notificationService';
import { toast } from '@/components/ui/toast';
import { isResolvedStatus } from './shared';

export function useReviewPipeline() {
  const qc = useQueryClient();

  const {
    data: departmentProgress = [],
    isLoading: progressLoading,
    error: progressError,
    refetch: refetchProgress,
  } = useDepartmentProgress();

  const {
    data: revisions = [],
    isLoading: revisionsLoading,
    refetch: refetchRevisions,
  } = useGradeRevisions();

  const {
    data: lockedTerms = [],
    refetch: refetchLockedTerms,
  } = useLockedTerms();

  const lockMutation = useLockDepartmentMatrix();
  const unlockMutation = useUnlockDepartmentMatrix();
  const exportMutation = useExportWAECCSV();
  const lockTermMutation = useLockTerm();
  const unlockTermMutation = useUnlockTerm();
  const commentMutation = useUpdateHODComment();
  const rejectMutation = useRejectGradeRevision();
  const approveMutation = useApproveGradeRevision();

  const [locking, setLocking] = useState(null);
  const [exporting, setExporting] = useState(null);
  const [revisionModal, setRevisionModal] = useState(null);
  const [revisionText, setRevisionText] = useState('');
  const [revisionSubmitting, setRevisionSubmitting] = useState(false);

  const refreshAll = useCallback(() => {
    refetchProgress();
    refetchRevisions();
    refetchLockedTerms();
  }, [refetchProgress, refetchRevisions, refetchLockedTerms]);

  const sortedClasses = useMemo(() => {
    if (!Array.isArray(departmentProgress)) return [];
    return [...departmentProgress].sort(
      (a, b) => (a?.submissionPct || 0) - (b?.submissionPct || 0),
    );
  }, [departmentProgress]);

  const activeTermId = useMemo(() => {
    const withTerm = sortedClasses.find((c) => c?.termId);
    return (withTerm || sortedClasses[0])?.termId || null;
  }, [sortedClasses]);

  const termLocked = useMemo(
    () =>
      Array.isArray(lockedTerms) &&
      lockedTerms.some((t) => t.id === activeTermId),
    [lockedTerms, activeTermId],
  );

  // ── Lock / Unlock class matrix ──────────────────────────────────────────
  const optimisticClassStatus = (clsId, status) => {
    qc.setQueryData(['hod', 'department-progress', {}], (old = []) => {
      if (!Array.isArray(old)) return old;
      return old.map((cls) =>
        cls?.id === clsId ? { ...cls, status, submissionPct: status === 'LOCKED' ? 100 : cls.submissionPct } : cls,
      );
    });
  };

  const handleLock = useCallback(
    async (clsId) => {
      if (!clsId) return;
      setLocking(clsId);
      try {
        const oldVal =
          typeof auditTrail?.captureSnapshot === 'function'
            ? auditTrail.captureSnapshot({ status: 'PENDING' })
            : {};
        await lockMutation.mutateAsync(clsId);
        const newVal =
          typeof auditTrail?.captureSnapshot === 'function'
            ? auditTrail.captureSnapshot({ status: 'LOCKED' })
            : {};
        if (auditTrail?.logChange) {
          await auditTrail.logChange('class_term', clsId, oldVal, newVal, 'Term locked by HOD');
        }
        if (eventBus?.emit) eventBus.emit('term-locked', { classId: clsId });
        optimisticClassStatus(clsId, 'LOCKED');
        toast.success('Class matrix locked successfully');
        refreshAll();
      } catch (e) {
        console.error('Lock failed:', e);
        toast.error(`Lock failed: ${e?.message || 'Please try again.'}`);
      } finally {
        setLocking(null);
      }
    },
    [lockMutation, refreshAll, qc],
  );

  const handleUnlock = useCallback(
    async (clsId) => {
      if (!clsId) return;
      setLocking(clsId);
      try {
        const oldVal =
          typeof auditTrail?.captureSnapshot === 'function'
            ? auditTrail.captureSnapshot({ status: 'LOCKED' })
            : {};
        await unlockMutation.mutateAsync(clsId);
        const newVal =
          typeof auditTrail?.captureSnapshot === 'function'
            ? auditTrail.captureSnapshot({ status: 'PENDING' })
            : {};
        if (auditTrail?.logChange) {
          await auditTrail.logChange('class_term', clsId, oldVal, newVal, 'Term unlocked by HOD');
        }
        if (eventBus?.emit) eventBus.emit('term-unlocked', { classId: clsId });
        optimisticClassStatus(clsId, 'PENDING');
        toast.success('Class matrix unlocked successfully');
        refreshAll();
      } catch (e) {
        console.error('Unlock failed:', e);
        toast.error(`Unlock failed: ${e?.message || 'Please try again.'}`);
      } finally {
        setLocking(null);
      }
    },
    [unlockMutation, refreshAll, qc],
  );

  const handleExport = useCallback(
    async (clsId) => {
      if (!clsId) return;
      const cls = sortedClasses.find((c) => c.id === clsId);
      if (!cls) return;
      const checks = Array.isArray(cls?.checks) ? cls.checks.filter(Boolean) : [];
      const failCount = checks.length - checks.filter((c) => c.pass).length;
      if (failCount > 0) {
        toast.error('Cannot export: validation checks are failing.');
        return { error: 'checks' };
      }
      setExporting(clsId);
      try {
        await exportMutation.mutateAsync({ termId: clsId, className: cls.className || 'Subject' });
        if (auditTrail?.logChange) {
          await auditTrail.logChange('class_term', clsId, {}, { exported: true }, 'WAEC CSV export');
        }
        toast.success('WAEC CSV exported successfully');
        return { ok: true };
      } catch (e) {
        toast.error(`Export failed: ${e?.message || 'Please try again.'}`);
        return { error: e?.message || 'Failed to export' };
      } finally {
        setExporting(null);
      }
    },
    [sortedClasses, exportMutation],
  );

  // ── Term seal / release ─────────────────────────────────────────────────
  const doLockTerm = useCallback(async () => {
    if (!activeTermId) return;
    const previousLockedTerms = qc.getQueryData(['hod', 'locked-terms']) || [];
    qc.setQueryData(['hod', 'locked-terms'], (old = []) => {
      if (!Array.isArray(old)) return old;
      if (old.some((t) => t.id === activeTermId)) return old;
      return [...old, { id: activeTermId }];
    });
    try {
      const oldVal =
        typeof auditTrail?.captureSnapshot === 'function'
          ? auditTrail.captureSnapshot({ termLocked: false })
          : {};
      await lockTermMutation.mutateAsync(activeTermId);
      const newVal =
        typeof auditTrail?.captureSnapshot === 'function'
          ? auditTrail.captureSnapshot({ termLocked: true })
          : {};
      if (auditTrail?.logChange) {
        await auditTrail.logChange('term', activeTermId, oldVal, newVal, 'Term locked by HOD');
      }
      if (eventBus?.emit) eventBus.emit('term-locked', { termId: activeTermId });
      toast.success('Term sealed successfully. Teachers can no longer modify grades.');
      refreshAll();
    } catch (e) {
      qc.setQueryData(['hod', 'locked-terms'], previousLockedTerms);
      console.error('Term lock failed:', e);
      toast.error(`Failed to seal term: ${e?.message || 'Please try again.'}`);
    }
  }, [activeTermId, lockTermMutation, refreshAll, qc]);

  const doUnlockTerm = useCallback(async () => {
    if (!activeTermId) return;
    const previousLockedTerms = qc.getQueryData(['hod', 'locked-terms']) || [];
    qc.setQueryData(['hod', 'locked-terms'], (old = []) => {
      if (!Array.isArray(old)) return old;
      return old.filter((t) => t.id !== activeTermId);
    });
    try {
      const oldVal =
        typeof auditTrail?.captureSnapshot === 'function'
          ? auditTrail.captureSnapshot({ termLocked: true })
          : {};
      await unlockTermMutation.mutateAsync(activeTermId);
      const newVal =
        typeof auditTrail?.captureSnapshot === 'function'
          ? auditTrail.captureSnapshot({ termLocked: false })
          : {};
      if (auditTrail?.logChange) {
        await auditTrail.logChange('term', activeTermId, oldVal, newVal, 'Term unlocked by HOD');
      }
      if (eventBus?.emit) eventBus.emit('term-unlocked', { termId: activeTermId });
      toast.success('Term released. Teachers can now modify grades.');
      refreshAll();
    } catch (e) {
      qc.setQueryData(['hod', 'locked-terms'], previousLockedTerms);
      console.error('Term unlock failed:', e);
      toast.error(`Failed to release term: ${e?.message || 'Please try again.'}`);
    }
  }, [activeTermId, unlockTermMutation, refreshAll, qc]);

  // ── HOD request revision on a class ─────────────────────────────────────
  const openRevision = useCallback((cls) => {
    if (!cls) return;
    setRevisionModal({ id: cls.id, className: cls.className || cls.name, subject: cls.subject });
    setRevisionText('');
  }, []);

  const submitRevision = useCallback(async () => {
    if (!revisionModal || !revisionText.trim()) return;
    setRevisionSubmitting(true);
    try {
      await hodService.requestHODGradeRevision({
        classSectionId: revisionModal.id,
        issue: revisionText.trim(),
        severity: 'medium',
      });
      if (auditTrail?.logChange) {
        await auditTrail.logChange?.('grade_revision', revisionModal.id, {}, { requestedByHod: true }, 'HOD requested grade revision');
      }
      if (eventBus?.emit) eventBus.emit('grade-revision-requested', { classId: revisionModal.id });
      setRevisionModal(null);
      setRevisionText('');
      refetchRevisions();
      toast.success('Revision request submitted successfully');
    } catch (e) {
      toast.error(`Failed to request revision: ${e?.message || 'Please try again.'}`);
      return { error: e?.message || 'Failed to request revision' };
    } finally {
      setRevisionSubmitting(false);
    }
  }, [revisionModal, revisionText, refetchRevisions]);

  // ── Grade approvals (per-student subject comment / reject) ──────────────
  const addRemark = useCallback(
    async ({ studentId, remark }) => {
      if (!remark || remark.trim().length < 10) {
        return { error: 'Remarks must be at least 10 characters.' };
      }
      try {
        await commentMutation.mutateAsync({ recordId: studentId, comment: remark });
        qc.invalidateQueries({ queryKey: ['hod', 'department-progress'] });
        return { ok: true };
      } catch (e) {
        return { error: e?.message || 'Failed to append comment' };
      }
    },
    [commentMutation, qc],
  );

  const approveSubject = useCallback(
    async ({ subjectId, comment }) => {
      if (!subjectId) return { error: 'No subject selected' };
      try {
        await hodService.approveGradeEntry(subjectId, comment || '');
        qc.invalidateQueries({ queryKey: ['hod', 'department-progress'] });
        return { ok: true };
      } catch (e) {
        return { error: e?.message || 'Approval failed' };
      }
    },
    [qc],
  );

  const addStudentRemark = useCallback(
    async ({ gradeEntryId, remark }) => {
      if (!gradeEntryId) return { error: 'No grade entry found for this student' };
      try {
        await hodService.requestHODGradeRevision({
          gradeEntryId,
          issue: remark,
          severity: 'medium',
        });
        qc.invalidateQueries({ queryKey: ['hod', 'department-progress'] });
        return { ok: true };
      } catch (e) {
        return { error: e?.message || 'Failed to record remark' };
      }
    },
    [qc],
  );

  const rejectSubject = useCallback(
    async ({ subjectId, reason }) => {
      if (!subjectId) return { error: 'No subject selected' };
      try {
        await hodService.requestHODGradeRevision({
          gradeEntryId: subjectId,
          issue: reason || 'No verification description supplied.',
          severity: 'high',
        });
        qc.invalidateQueries({ queryKey: ['hod', 'department-progress'] });
        return { ok: true };
      } catch (e) {
        return { error: e?.message || 'Rejection failed' };
      }
    },
    [qc],
  );

  // ── Revision approve / reject / comment ─────────────────────────────────
  const approveRevision = useCallback(
    async (selected, comment) => {
      if (!selected || !comment.trim()) return { error: 'Comment required' };
      try {
        const oldVal = auditTrail?.captureSnapshot?.({ status: selected.status }) || {};
        await approveMutation.mutateAsync({ recordId: selected.id, comment });
        if (auditTrail?.logChange) {
          await auditTrail.logChange('grade_revision', selected.id, oldVal, { status: 'RESOLVED', comment }, comment);
        }
        if (eventBus?.emit) eventBus.emit('grade-revision-approved', { recordId: selected.id, studentName: selected.student });
        if (notification?.notifyTeacherOfHODAction) {
          await notification.notifyTeacherOfHODAction(selected.teacherId || selected.teacher_id, 'GRADE_REVISION_APPROVED', selected.id, comment);
        }
        refetchRevisions();
        return { ok: true };
      } catch (e) {
        return { error: e?.message || 'Approval failed' };
      }
    },
    [approveMutation, refetchRevisions],
  );

  const rejectRevision = useCallback(
    async (selected, comment) => {
      if (!selected) return { error: 'No selection' };
      try {
        const oldVal = auditTrail?.captureSnapshot?.({ rejected: false }) || {};
        await rejectMutation.mutateAsync({ recordId: selected.id, reason: comment || 'No reason provided' });
        if (auditTrail?.logChange) {
          await auditTrail.logChange('grade_revision', selected.id, oldVal, { rejected: true }, `HOD rejected revision: ${comment}`);
        }
        if (eventBus?.emit) eventBus.emit('grade-revision-rejected', { recordId: selected.id, reason: comment });
        refetchRevisions();
        return { ok: true };
      } catch (e) {
        return { error: e?.message || 'Rejection failed' };
      }
    },
    [rejectMutation, refetchRevisions],
  );

  const sendRevisionComment = useCallback(
    async (selected, message) => {
      if (!selected || !message.trim()) return;
      try {
        await hodService.updateHODComment(selected.id, message);
        if (auditTrail?.logChange) {
          await auditTrail.logChange?.('grade_revision', selected.id, {}, { comment: message }, message);
        }
        if (eventBus?.emit) eventBus.emit('hod-comment-added', { recordId: selected.id, message });
        if (notification?.notifyTeacherOfHODAction) {
          await notification.notifyTeacherOfHODAction(
            selected.teacherId || selected.teacher_id,
            'HOD_COMMENT_ADDED',
            selected.id,
            message,
          );
        }
        refetchRevisions();
        return { ok: true };
      } catch (e) {
        return { error: e?.message || 'Failed to send message' };
      }
    },
    [refetchRevisions],
  );

  return {
    // data
    departmentProgress,
    revisions,
    lockedTerms,
    sortedClasses,
    activeTermId,
    termLocked,
    isResolved: isResolvedStatus,
    progressLoading,
    progressError,
    revisionsLoading,
    isLoading: progressLoading || revisionsLoading,
    // state
    locking,
    exporting,
    revisionModal,
    revisionText,
    revisionSubmitting,
    // setters
    setRevisionText,
    setRevisionModal,
    // actions
    refreshAll,
    handleLock,
    handleUnlock,
    handleExport,
    doLockTerm,
    doUnlockTerm,
    openRevision,
    submitRevision,
    addRemark,
    addStudentRemark,
    rejectSubject,
    approveSubject,
    approveRevision,
    rejectRevision,
    sendRevisionComment,
  };
}
