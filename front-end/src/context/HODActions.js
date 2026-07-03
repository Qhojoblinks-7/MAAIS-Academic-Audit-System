import { useCallback, useRef, useEffect } from 'react';
import { hodService } from '../services/hodService';

export function useHODActions({
  isHod,
  setAuditLogs,
  setInterventionAlerts,
  setDepartmentProgress,
  setRevisions,
  setArchivedClasses,
  setAlertNotes,
  setSupportTickets,
  setContactChannels,
  setViewAsTeacherId,
  setViewAsTeacherName,
  departmentProgress,
  setIsExporting,
  contactChannels
}) {

  const isHodRef = useRef(isHod);
  useEffect(() => { isHodRef.current = isHod; }, [isHod]);

  // ── Alert & Audit Actions ──────────────────────────────────────────────────
  const resolveAlert = useCallback((alertId) => {
    if (setInterventionAlerts) {
      setInterventionAlerts((prev) =>
        (prev || []).map((a) => (a.id === alertId ? { ...a, resolved: true } : a)),
      );
    }
  }, [setInterventionAlerts]);

  const addHODComment = useCallback(async (recordId, comment) => {
    if (setAuditLogs) {
      setAuditLogs((prev) =>
        (prev || []).map((log) =>
          (log.id === recordId || log.recordId === recordId) ? { ...log, hodComment: comment } : log,
        ),
      );
    }
    try {
      await hodService.updateAuditLogComment(recordId, comment);
    } catch {
      // fallback: comment remains in local state only
    }
  }, [setAuditLogs]);

  // Pure function helper: does not need encapsulation in a hook lifecycle callback
  const hasShortJustification = (text) => {
    if (!text) return false;
    return text.trim().length < 10;
  };

  const fetchGradeComparison = useCallback(async (subjectId, termA, termB) => {
    try {
      return await hodService.getGradeComparison(subjectId, termA, termB);
    } catch (e) {
      console.warn('[HODContext] grade-comparison fetch failed:', e);
      return [];
    }
  }, []);

  // ── Lock/Unlock Actions ──────────────────────────────────────────────────
  const validateLock = useCallback(async (termId) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    return await hodService.validateLock(termId);
  }, []);

  const lockTerm = useCallback(async (termId) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    const result = await hodService.lockDepartmentMatrix(termId);
    if (setDepartmentProgress) {
      setDepartmentProgress((prev) =>
        (prev || []).map((cls) =>
          cls.termId === termId ? { ...cls, status: 'LOCKED' } : cls,
        ),
      );
    }
    return result;
  }, [setDepartmentProgress]);

  const unlockTerm = useCallback(async (termId) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    const result = await hodService.unlockDepartmentMatrix(termId);
    if (setDepartmentProgress) {
      setDepartmentProgress((prev) =>
        (prev || []).map((cls) =>
          cls.termId === termId ? { ...cls, status: 'PENDING' } : cls,
        ),
      );
    }
    return result;
  }, [setDepartmentProgress]);

  const lockTermWithValidation = useCallback(async (termId) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    const validation = await validateLock(termId);
    if (!validation.canLock) {
      throw new Error(`Cannot lock: ${validation.blockingIssues?.join(', ') || '100% completion required'}`);
    }
    const result = await hodService.lockDepartmentMatrix(termId);
    if (setDepartmentProgress) {
      setDepartmentProgress((prev) =>
        (prev || []).map((cls) =>
          cls.termId === termId ? { ...cls, status: 'LOCKED' } : cls,
        ),
      );
    }
    if (validation.completionPct < 100) {
      console.warn(`Locking with ${validation.completionPct}% completion`);
    }
    return result;
  }, [setDepartmentProgress, validateLock]);

  // ── Export Actions ─────────────────────────────────────────────────────────
  const exportClassCSV = useCallback(async (classId) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    // FIX: departmentProgress safely evaluated within matching closure boundaries
    const cls = (departmentProgress || []).find((c) => c.id === classId);
    if (!cls) {
      throw new Error('Class not found');
    }
    const className = cls?.className || cls?.name || 'Unknown';
    return hodService.exportWAECCSV(classId, className);
  }, [departmentProgress]);

  const startExport = useCallback((exportFn) => async (...args) => {
    if (setIsExporting) setIsExporting(true);
    try {
      await exportFn(...args);
    } finally {
      if (setIsExporting) setIsExporting(false);
    }
  }, [setIsExporting]);

  const exportArchivedDataCtx = useCallback(async (params = {}) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    await startExport(async () => {
      const blob = await hodService.exportArchivedData(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `department-archive-${params.year || 'all'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    })();
  }, [startExport]);

  const lockClass = useCallback(async (classId) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    return await hodService.lockDepartmentMatrix(classId);
  }, []);

  // ── Revision Actions ───────────────────────────────────────────────────────
  const rejectRevision = useCallback(async (recordId, reason) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    const result = await hodService.rejectGradeRevision(recordId, reason);
    if (setAuditLogs) {
      setAuditLogs((prev) =>
        (prev || []).map((log) =>
          log.recordId === recordId ? { ...log, status: 'FLAGGED' } : log,
        ),
      );
    }
    return result;
  }, [setAuditLogs]);

  const approveRevision = useCallback(async (recordId, comment) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    const result = await hodService.approveGradeRevision(recordId, comment);
    if (setAuditLogs) {
      setAuditLogs((prev) =>
        (prev || []).map((log) =>
          log.recordId === recordId ? { ...log, status: 'RESOLVED', hodComment: comment } : log,
        ),
      );
    }
    if (setRevisions) {
      setRevisions((prev) =>
        (prev || []).map((rev) =>
          rev.id === recordId ? { ...rev, status: 'RESOLVED' } : rev,
        ),
      );
    }
    return result;
  }, [setAuditLogs, setRevisions]);

  const bulkApproveRevisions = useCallback(async (recordIds, remark = 'Bulk approved') => {
    if (!isHodRef.current) throw new Error('Not authorized');
    // FIX: Using approveGradeRevision over generic updateHODComment to avoid db data drift
    const results = await Promise.all(
      recordIds.map(id => hodService.approveGradeRevision(id, remark))
    );
    if (setAuditLogs) {
      setAuditLogs((prev) =>
        (prev || []).map((log) =>
          recordIds.includes(log.recordId || log.id)
            ? { ...log, status: 'APPROVED', hodComment: remark }
            : log,
        ),
      );
    }
    return results;
  }, [setAuditLogs]);

  const bulkRejectRevisions = useCallback(async (recordIds, reason = 'Bulk rejected') => {
    if (!isHodRef.current) throw new Error('Not authorized');
    const results = await Promise.all(
      recordIds.map(id => hodService.rejectGradeRevision(id, reason))
    );
    if (setAuditLogs) {
      setAuditLogs((prev) =>
        (prev || []).map((log) =>
          recordIds.includes(log.recordId || log.id)
            ? { ...log, status: 'FLAGGED', rejectionReason: reason }
            : log,
        ),
      );
    }
    return results;
  }, [setAuditLogs]);

  // ── Class State Actions ────────────────────────────────────────────────────
  const markClassLocked = useCallback((classId) => {
    if (setDepartmentProgress) {
      setDepartmentProgress((prev) =>
        (prev || []).map((cls) =>
          cls.id === classId ? { ...cls, status: 'LOCKED' } : cls,
        ),
      );
    }
  }, [setDepartmentProgress]);

  const markClassArchived = useCallback((classId) => {
    if (setDepartmentProgress) {
      setDepartmentProgress((prev) =>
        (prev || []).map((cls) =>
          cls.id === classId ? { ...cls, status: 'ARCHIVED' } : cls,
        ),
      );
    }
    if (setArchivedClasses) {
      setArchivedClasses((prev) => {
        // FIX: Secure fallback structure layout to protect empty cache arrays from throwing errors
        if (!prev || prev.length === 0) return [{ id: classId, status: 'ARCHIVED' }];
        return prev.map((c) => (c.id === classId ? { ...c, status: 'ARCHIVED' } : c));
      });
    }
  }, [setDepartmentProgress, setArchivedClasses]);

  const archiveClass = useCallback(async (classId) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    const result = await hodService.lockDepartmentMatrix(classId);
    markClassArchived(classId);
    return result;
  }, [markClassArchived]);

  // ── Intervention Counseling ────────────────────────────────────────────────
  const addAlertNote = useCallback((alertId, note) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    if (setAlertNotes) {
      setAlertNotes((prev) => ({
        ...(prev || {}),
        [alertId]: { ...((prev && prev[alertId]) || {}), note, updatedAt: new Date().toISOString() },
      }));
    }
    return note;
  }, [setAlertNotes]);

  // ── Support Actions ────────────────────────────────────────────────────────
  const createTicket = useCallback(async (ticketBody) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    const ticket = await hodService.createSupportTicket(ticketBody);
    if (setSupportTickets) {
      setSupportTickets((prev) => [ticket, ...(prev || [])]);
    }
    return ticket;
  }, [setSupportTickets]);

  const updateTicketAction = useCallback(async (ticketId, patch) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    const updated = await hodService.updateSupportTicket(ticketId, patch);
    if (setSupportTickets) {
      setSupportTickets((prev) =>
        (prev || []).map((t) => (t.id === ticketId ? { ...t, ...updated } : t)),
      );
    }
    return updated;
  }, [setSupportTickets]);

  const escalateTicketAction = useCallback(async (ticketId, body) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    const result = await hodService.escalateTicket(ticketId, body);
    if (setSupportTickets) {
      setSupportTickets((prev) =>
        (prev || []).map((t) => (t.id === ticketId ? { ...t, escalated: true, ...result } : t)),
      );
    }
    return result;
  }, [setSupportTickets]);

  const updateChannelPrefsAction = useCallback(async (channels) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    const updated = await hodService.updateContactChannels(channels);
    if (setContactChannels) {
      setContactChannels(updated ?? { ...contactChannels, ...channels });
    }
    return updated;
  }, [setContactChannels, contactChannels]);

  const mfaEnroll = useCallback(async () => {
    if (!isHodRef.current) throw new Error('Not authorized');
    return await hodService.mfaEnroll();
  }, []);

  const mfaVerify = useCallback(async (code) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    return await hodService.mfaVerify(code);
  }, []);

  // ── Impersonation Actions ──────────────────────────────────────────────────
  const resetTeacherPasswordAction = useCallback(async (teacherId, newPassword) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    return await hodService.resetTeacherPassword(teacherId, newPassword);
  }, []);

  const impersonateTeacherAction = useCallback(async (teacherId, reason = '') => {
    if (!isHodRef.current) throw new Error('Not authorized');
    const result = await hodService.impersonateTeacher(teacherId, { reason, timestamp: new Date().toISOString() });
    if (setViewAsTeacherId) setViewAsTeacherId(teacherId);
    return result;
  }, [setViewAsTeacherId]);

  const stopImpersonationAction = useCallback(async () => {
    if (!isHodRef.current) throw new Error('Not authorized');
    await hodService.stopImpersonation();
    if (setViewAsTeacherId) setViewAsTeacherId(null);
    if (setViewAsTeacherName) setViewAsTeacherName(null);
  }, [setViewAsTeacherId, setViewAsTeacherName]);

  return {
    resolveAlert, addHODComment, hasShortJustification, fetchGradeComparison,
    validateLock, lockTerm, unlockTerm, lockTermWithValidation, exportClassCSV,
    lockClass, rejectRevision, approveRevision, bulkApproveRevisions,
    bulkRejectRevisions, markClassLocked, markClassArchived, archiveClass,
    addAlertNote, startExport, exportArchivedDataCtx,
    createTicket, updateTicketAction, escalateTicketAction,
    updateChannelPrefsAction, mfaEnroll, mfaVerify,
    resetTeacherPasswordAction, impersonateTeacherAction, stopImpersonationAction,
  };
}