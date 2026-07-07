import { useState, useCallback, useEffect, useRef } from 'react';
import { hodService } from '../services/hodService';
import { get, set } from 'idb-keyval';

const PENDING_CHANGES_KEY = 'maais-pending-changes';

export default function useHODState() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilter, setAuditFilter] = useState('all');
  const [interventionAlerts, setInterventionAlerts] = useState([]);
  const [alertFilter, setAlertFilter] = useState('all');
  const [archiveFilter, setArchiveFilter] = useState('all');
  const [archiveYearFilter, setArchiveYearFilter] = useState('all');
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
  const [archivePage, setArchivePage] = useState(1);
  const [departmentProgress, setDepartmentProgress] = useState([]);
  const [teacherSubmissions, setTeacherSubmissions] = useState([]);
  const [submissionTrends, setSubmissionTrends] = useState([]);
  const [gradeComparison, setGradeComparison] = useState(null);
  const [lockedTerms, setLockedTerms] = useState([]);
  const [archivedClasses, setArchivedClasses] = useState([]);
  const [promotionRecommendations, setPromotionRecommendations] = useState([]);
  const [revisions, setRevisions] = useState([]);
  
  const [hodSettings, setHodSettings] = useState({
    profile: { name: '', email: '', phone: '', department: '' },
    notifications: { grading: true, certification: true, security: true, gradeSubmissionReminders: true, interventionAlerts: true, systemAnnouncements: true, weeklyDigest: false },
    security: { mfaEnabled: false, mfaEnforced: false, sessionTimeout: 30, passwordLastChanged: '', mfaEnrolledUsers: [] },
    uiPreferences: { theme: 'light', density: 'comfortable', defaultView: 'dashboard' },
    departmentConfig: { autoAlertThreshold: 15, autoResolveDays: 7 },
    auditFrequency: 'daily'
  });
  
  const [activeSessions, setActiveSessions] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [draftRecords, setDraftRecords] = useState({});
  const [supportTickets, setSupportTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [ticketTabs, setTicketTabs] = useState('all');
  const [systemHealth, setSystemHealth] = useState(null);
  const [escalatedIssues, setEscalatedIssues] = useState([]);
  const [contactChannels, setContactChannels] = useState(null);
  const [viewAsTeacherId, setViewAsTeacherId] = useState(null);
  const [viewAsTeacherName, setViewAsTeacherName] = useState(null);
  const [departmentTeachers, setDepartmentTeachers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [alertNotes, setAlertNotes] = useState({});
  const [alertAggregationMode, setAlertAggregationMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [departmentProgressPage, setDepartmentProgressPage] = useState(1);
  const [departmentProgressLimit, setDepartmentProgressLimit] = useState(50);
  const [departmentProgressTotal, setDepartmentProgressTotal] = useState(0);

  // ── Offline queue hydration (IndexedDB persistence) ─────────────────────────
  const hydratedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await get(PENDING_CHANGES_KEY);
        if (!cancelled && Array.isArray(stored) && stored.length > 0) {
          setPendingChanges(stored);
        }
      } catch {
        // IndexedDB unavailable — keep in-memory queue
      } finally {
        hydratedRef.current = true;
      }
    })();
    return () => { cancelled = true; };
  }, [setPendingChanges]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    set(PENDING_CHANGES_KEY, pendingChanges).catch(() => {});
  }, [pendingChanges]);

  // ── Offline/Draft State Handlers ─────────────────────────────────────────────
  const isEffectivelyOffline = (isOnline, isDraftMode) => !isOnline || isDraftMode;

  const saveDraftRecord = useCallback((recordId, recordData) => {
    const updatedDraft = {
      ...recordData,
      savedAt: new Date().toISOString(),
      isDraft: true
    };

    setDraftRecords(prev => ({
      ...(prev || {}),
      [recordId]: updatedDraft
    }));

    try {
      const drafts = JSON.parse(localStorage.getItem('hodDraftRecords') || '{}');
      localStorage.setItem('hodDraftRecords', JSON.stringify({
        ...drafts,
        [recordId]: updatedDraft
      }));
    } catch (e) {
      console.warn('Failed to persist draft to localStorage:', e);
    }
  }, []);

  const loadDraftRecord = useCallback((recordId) => {
    if (draftRecords && draftRecords[recordId]) {
      return draftRecords[recordId];
    }
    try {
      const drafts = JSON.parse(localStorage.getItem('hodDraftRecords') || '{}');
      return drafts[recordId] || null;
    } catch (e) {
      console.warn('Failed to load draft from localStorage:', e);
      return null;
    }
  }, [draftRecords]);

  const getAllDraftRecords = useCallback(() => {
    try {
      const storageDrafts = JSON.parse(localStorage.getItem('hodDraftRecords') || '{}');
      return { ...storageDrafts, ...draftRecords };
    } catch (e) {
      console.warn('Failed to load drafts from localStorage:', e);
      return { ...draftRecords };
    }
  }, [draftRecords]);

  const queueChange = useCallback((change) => {
    setPendingChanges(prev => [...(prev || []), change]);
  }, []);

  // FIX: Isolated transaction execution loops protect state items from clashing
  const processPendingChanges = useCallback(async () => {
    let currentBatch = [];
    
    // Atomically capture snapshot and clear out those exact entries safely
    setPendingChanges((prev) => {
      currentBatch = [...(prev || [])];
      return [];
    });

    if (currentBatch.length === 0) return;

    try {
      for (const change of currentBatch) {
        switch (change.type) {
          case 'ADD_HOD_COMMENT':
            await hodService.updateHODComment(change.payload.recordId, change.payload.comment);
            break;
          case 'REJECT_REVISION':
            await hodService.rejectGradeRevision(change.payload.recordId, change.payload.reason);
            break;
          case 'BULK_APPROVE_REVISIONS':
            await hodService.bulkApproveRevisions(change.payload.recordIds, change.payload.remark);
            break;
          case 'BULK_REJECT_REVISIONS':
            await hodService.bulkRejectRevisions(change.payload.recordIds, change.payload.reason);
            break;
          default:
            console.warn('Unknown change type:', change.type);
        }
      }
    } catch (err) {
      console.error('Failed to process pending changes batch, rolling back unexecuted items:', err);
      // Re-queue the remaining elements if processing failed mid-flight
      setPendingChanges((prev) => [...currentBatch, ...prev]);
    }
  }, []);

  return {
    auditLogs, setAuditLogs, auditFilter, setAuditFilter,
    interventionAlerts, setInterventionAlerts, alertFilter, setAlertFilter,
    archiveFilter, setArchiveFilter, archiveYearFilter, setArchiveYearFilter,
    archiveSearchQuery, setArchiveSearchQuery, archivePage, setArchivePage,
    departmentProgress, setDepartmentProgress, teacherSubmissions,
    setTeacherSubmissions, submissionTrends, setSubmissionTrends,
    gradeComparison, setGradeComparison,
    lockedTerms, setLockedTerms, archivedClasses, setArchivedClasses,
    promotionRecommendations, setPromotionRecommendations, revisions, setRevisions,
    hodSettings, setHodSettings, activeSessions, setActiveSessions,
    pendingChanges, setPendingChanges, draftRecords, setDraftRecords,
    supportTickets, setSupportTickets, ticketFilter, setTicketFilter,
    ticketTabs, setTicketTabs, systemHealth, setSystemHealth,
    escalatedIssues, setEscalatedIssues, contactChannels, setContactChannels,
    viewAsTeacherId, setViewAsTeacherId, viewAsTeacherName, setViewAsTeacherName,
    departmentTeachers, setDepartmentTeachers, academicYears, setAcademicYears,
    alertNotes, setAlertNotes, alertAggregationMode, setAlertAggregationMode,
    isLoading, setIsLoading, isExporting, setIsExporting, error, setError,
    activeActionMenu, setActiveActionMenu, departmentProgressPage, setDepartmentProgressPage,
    departmentProgressLimit, setDepartmentProgressLimit, departmentProgressTotal, setDepartmentProgressTotal,
    isEffectivelyOffline, saveDraftRecord, loadDraftRecord,
    getAllDraftRecords, queueChange, processPendingChanges,
  };
}