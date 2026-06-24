import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRole } from './RoleContext';
import { hodService } from '../services/hodService';
import { cacheLayer } from '../services';
import { useUI } from './UIContext';

const HODContext = createContext(undefined);

export function HODProvider({ children }) {
  const { user } = useRole();
  const isHod = user?.role === 'HOD';

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
  const { isOnline, setIsOnline, isDraftMode, setIsDraftMode } = useUI();
  const [pendingChanges, setPendingChanges] = useState([]);
  const [draftRecords, setDraftRecords] = useState({});
  const isEffectivelyOffline = !isOnline || isDraftMode;
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

  const BASELINE_KEY = 'hod_dashboard_baseline_v1';
  const [baselineLoaded, setBaselineLoaded] = useState(false);

  // Derived values used by baseline and dashboard badges
  const baseProgress = departmentProgress?.items || departmentProgress || [];
  const avgProgress = baseProgress.length > 0
    ? Math.round(baseProgress.reduce((sum, c) => sum + (c.progress || c.submissionPct || 0), 0) / baseProgress.length)
    : 0;
  const unresolvedAlerts = interventionAlerts.filter(a => !a.resolved).length;
  const teacherCompletion = teacherSubmissions.length > 0
    ? Math.round(teacherSubmissions.reduce((sum, s) => sum + (s.progress || 0), 0) / teacherSubmissions.length)
    : 0;

  function loadBaseline() {
    try {
      const raw = localStorage.getItem(BASELINE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }

  function saveBaseline(bl) {
    try {
      localStorage.setItem(BASELINE_KEY, JSON.stringify({ ...bl, savedAt: new Date().toISOString() }));
    } catch {}
  }

  const ensureBaseline = () => {
    const existing = loadBaseline();
    const hasData = baseProgress.length > 0 || avgProgress > 0 || unresolvedAlerts > 0 || teacherCompletion > 0;
    const isStale = existing && (
      existing.departmentClassCount === 0 &&
      existing.avgProgressPct === 0 &&
      existing.atRiskStudentCount === 0 &&
      existing.teacherCompletionPct === 0
    );
    if ((!existing || isStale) && hasData) {
      saveBaseline({
        departmentClassCount: baseProgress.length,
        avgProgressPct: avgProgress,
        atRiskStudentCount: unresolvedAlerts,
        teacherCompletionPct: teacherCompletion,
      });
    }
    return loadBaseline();
  };

  const baseline = useMemo(() => {
    const bl = ensureBaseline();
    setBaselineLoaded(true);
    return bl;
  }, [baseProgress.length, avgProgress, unresolvedAlerts, teacherCompletion]);

  const computeDelta = (current, base) => {
    if (base === null || base === undefined || base === 0) return null;
    const diff = current - base;
    if (Math.abs(diff) < 0.01) return 0;
    return Math.round((diff / Math.abs(base)) * 100);
  };

  const baselineDeltas = useMemo(() => ({
    departmentClassCount: computeDelta(baseProgress.length, baseline?.departmentClassCount),
    avgProgressPct: computeDelta(avgProgress, baseline?.avgProgressPct),
    atRiskStudentCount: computeDelta(unresolvedAlerts, baseline?.atRiskStudentCount),
    teacherCompletionPct: computeDelta(teacherCompletion, baseline?.teacherCompletionPct),
  }), [departmentProgress.length, avgProgress, unresolvedAlerts, teacherCompletion, baseline]);

  // ── Helpers ──────────────────────────────────────────────────────────────

  // Save a record as draft locally (for offline access)
  const saveDraftRecord = useCallback((recordId, recordData) => {
    setDraftRecords(prev => ({
      ...prev,
      [recordId]: {
        ...recordData,
        savedAt: new Date().toISOString(),
        isDraft: true
      }
    }));
    // Also persist to localStorage for page reloads
    try {
      const drafts = JSON.parse(localStorage.getItem('hodDraftRecords') || '{}');
      localStorage.setItem('hodDraftRecords', JSON.stringify({
        ...drafts,
        [recordId]: {
          ...recordData,
          savedAt: new Date().toISOString(),
          isDraft: true
        }
      }));
    } catch (e) {
      console.warn('Failed to persist draft to localStorage:', e);
    }
  }, []);

  // Load a draft record from local storage
  const loadDraftRecord = useCallback((recordId) => {
    // First check in-memory state
    if (draftRecords[recordId]) {
      return draftRecords[recordId];
    }
    // Then check localStorage
    try {
      const drafts = JSON.parse(localStorage.getItem('hodDraftRecords') || '{}');
      return drafts[recordId] || null;
    } catch (e) {
      console.warn('Failed to load draft from localStorage:', e);
      return null;
    }
  }, [draftRecords]);

  // Get all draft records
  const getAllDraftRecords = useCallback(() => {
    // Merge in-memory and localStorage drafts
    try {
      const storageDrafts = JSON.parse(localStorage.getItem('hodDraftRecords') || '{}');
      return { ...storageDrafts, ...draftRecords };
    } catch (e) {
      console.warn('Failed to load drafts from localStorage:', e);
      return { ...draftRecords };
    }
  }, [draftRecords]);

  // Queue a change for offline processing
  const queueChange = useCallback((change) => {
    setPendingChanges(prev => [...prev, change]);
  }, []);

  // Process pending changes when online and not in draft mode
  useEffect(() => {
    if (!isEffectivelyOffline && pendingChanges.length > 0) {
      // Process each change
      const process = async () => {
        try {
          for (const change of pendingChanges) {
            // Depending on the change type, call the appropriate service method
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
              // Add more cases as needed
              default:
                console.warn('Unknown change type:', change.type);
            }
          }
          // Clear pending changes after successful processing
          setPendingChanges([]);
        } catch (err) {
          console.error('Failed to process pending changes:', err);
          // Keep pending changes for retry
        }
      };
      process();
    }
  }, [isEffectivelyOffline, pendingChanges, hodService]);

  // Load persisted drafts on initialization
  useEffect(() => {
    try {
      const savedDrafts = JSON.parse(localStorage.getItem('hodDraftRecords') || '{}');
      if (Object.keys(savedDrafts).length > 0) {
        setDraftRecords(savedDrafts);
      }
    } catch (e) {
      console.warn('Failed to load drafts from localStorage on init:', e);
    }
  }, []);
   // ── Phase 6: Support data ─────────────────────────────────────────────────────
   // ── Phase 7: Impersonation ────────────────────────────────────────────────────
   // ── Phase 9: Intervention counseling notes & aggregated alerts ─────────────────

  // ── Filters ─────────────────────────────────────────────────────────────────
  const getFilteredAuditLogs = useCallback(
    (logs = auditLogs) =>
      auditFilter === 'all'
        ? logs
        : logs.filter(
            (log) =>
              log.status === auditFilter ||
              log.action?.toUpperCase().includes(auditFilter.toUpperCase()),
          ),
    [auditLogs, auditFilter],
  );

  const getFilteredAlerts = useCallback(
    (alerts = interventionAlerts) =>
      alertFilter === 'all'
        ? alerts
        : alerts.filter((a) =>
            alertFilter === 'resolved'
              ? a.resolved
              : a.severity?.toUpperCase() === alertFilter.toUpperCase(),
          ),
    [interventionAlerts, alertFilter],
  );

  const getFilteredArchive = useCallback(
    (classes = archivedClasses) => {
      let result = Array.isArray(classes) ? classes : [];
      if (archiveYearFilter !== 'all') {
        result = result.filter(
          (c) => c.year === archiveYearFilter || c.academicYear === archiveYearFilter,
        );
      }
      if (archiveFilter !== 'all') {
        result = result.filter(
          (c) =>
            c.status?.toUpperCase() === archiveFilter.toUpperCase() ||
            c.termStatus?.toUpperCase() === archiveFilter.toUpperCase(),
        );
      }
      if (archiveSearchQuery.trim()) {
        const q = archiveSearchQuery.toLowerCase();
        result = result.filter(
          (c) =>
            (c.name || '').toLowerCase().includes(q) ||
            (c.className || c.class || '').toLowerCase().includes(q) ||
            (c.studentName || '').toLowerCase().includes(q) ||
            (c.teacherName || '').toLowerCase().includes(q) ||
            (c.subject || '').toLowerCase().includes(q),
        );
      }
      return result;
    },
    [
      archivedClasses,
      archiveYearFilter,
      archiveFilter,
      archiveSearchQuery,
    ],
  );

  // ── Alert resolution ────────────────────────────────────────────────────────
  const resolveAlert = useCallback((alertId) => {
    setInterventionAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)),
    );
  }, []);

  // ── Alert aggregation (Phase 9.2) ───────────────────────────────────────────
  // Returns student-keyed clusters sorted by most severe member first.
  const getAggregatedAlerts = useCallback((alerts = interventionAlerts) => {
    const list = Array.isArray(alerts) ? alerts : [];
    if (list.length === 0) return [];

    // Priority order for sorting
    const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    const groups = {};

    list.forEach((a) => {
      const key = (a.studentId || a.studentName || a.id).toString();
      if (!groups[key]) groups[key] = { studentId: a.studentId, studentName: a.studentName, studentIndex: a.studentIndex, items: [], maxSeverity: 'LOW', allResolved: true };
      groups[key].items.push(a);
      if (severityOrder[a.severity || 'LOW'] < severityOrder[groups[key].maxSeverity]) groups[key].maxSeverity = a.severity || 'LOW';
      if (!a.resolved) groups[key].allResolved = false;
    });

    return Object.values(groups).sort((g1, g2) => {
      // Unresolved first
      if (!g1.allResolved && g2.allResolved) return -1;
      if (g1.allResolved && !g2.allResolved) return 1;
      // Then by severity
      return severityOrder[g1.maxSeverity] - severityOrder[g2.maxSeverity];
    });
  }, [interventionAlerts]);

  // Alert cluster count for KPI
  const alertClusterCount = React.useMemo(() => getAggregatedAlerts().length, [getAggregatedAlerts]);

  // ── HOD comment ────────────────────────────────────────────────────────────
  const addHODComment = useCallback((recordId, comment) => {
    setAuditLogs((prev) =>
      prev.map((log) =>
        log.recordId === recordId
          ? { ...log, hodComment: comment }
          : log,
      ),
    );
  }, []);

  // ── Short-justification flag (HOD-AR-2.2) ─────────────────────────────────
  const hasShortJustification = (text) => {
    if (!text) return false;
    return text.trim().length < 10;
  };

  // ── Complaint count helpers (KPI) ───────────────────────────────────────────
  const totalAlerts = interventionAlerts.length;
  const atRiskStudentCount = unresolvedAlerts;

  const submissionPct = (teacherSubmissions.length / Math.max(teacherSubmissions.length, 1)) * 100;

// ── Session timeout ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isHod) return;
    const handler = () => {/* handled at App level */};
    window.addEventListener('mousemove', handler);
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('mousemove', handler);
      window.removeEventListener('keydown', handler);
    };
  });

  // ── Filtered support tickets (tabs + status) ─────────────────────────────────
  const getFilteredTickets = useCallback(
    (tickets = supportTickets) => {
      let result = Array.isArray(tickets) ? tickets : [];
      if (ticketTabs !== 'all') {
        result = result.filter((t) => (t.status || '').toUpperCase() === ticketTabs.toUpperCase());
      }
      if (ticketFilter !== 'all') {
        result = result.filter(
          (t) =>
            (t.priority || '').toUpperCase() === ticketFilter.toUpperCase() ||
            t.severity?.toUpperCase() === ticketFilter.toUpperCase(),
        );
      }
      return result;
    },
    [supportTickets, ticketTabs, ticketFilter],
  );

  // ── SLA helper ───────────────────────────────────────────────────────────────
  const calcTicketAge = (createdAt) => {
    if (!createdAt) return null;
    return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)); // minutes
  };

  const isTicketSLABreach = (createdAt, slaMinutes = 30) => {
    if (!createdAt) return false;
    return calcTicketAge(createdAt) > slaMinutes;
  };

  // ── Refresh data ────────────────────────────────────────────────────────────
   const refreshAuditLogs = useCallback(async () => {
     if (!isHod) return;
     setIsLoading(true);
     setError(null);
     try {
       const data = await hodService.getAuditLogs();
       setAuditLogs(Array.isArray(data) ? data : []);
     } catch (e) {
       setError(e.message);
     } finally {
       setIsLoading(false);
     }
   }, [isHod]);

    const refreshInterventionAlerts = useCallback(async (filters = {}) => {
      if (!isHod) return;
      try {
        const data = await hodService.getInterventionAlerts(filters);
        setInterventionAlerts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn('[HODContext] intervention-alerts fetch failed:', e);
      }
    }, [isHod]);

     const refreshDepartmentProgress = useCallback(async (page = departmentProgressPage, limit = departmentProgressLimit, academicYearId, termNumber) => {
       if (!isHod) return;
       
       // Create cache key based on pagination parameters
       const cacheKey = `departmentProgress_page-${page}_limit-${limit}_year-${academicYearId || 'active'}_term-${termNumber || 'active'}`;
       
       // Try to get from cache first
       const cachedData = cacheLayer.get(cacheKey);
       if (cachedData) {
         // We need to recalculate submissionPct for cached data too?
         // For simplicity, we'll recalculate here as well.
         const items = Array.isArray(cachedData.items) ? cachedData.items : [];
         const updatedItems = items.map(item => ({
           ...item,
           submissionPct: calculateSubmissionPct(item)
         }));
         setDepartmentProgress(updatedItems);
         setDepartmentProgressTotal(cachedData.total || 0);
         setDepartmentProgressPage(page);
         return;
       }
       
       try {
         const data = await hodService.getDepartmentProgress({ page, limit, academicYearId, termNumber });
         if (data) {
           // Cache the response for 5 minutes (300000 ms)
           cacheLayer.set(cacheKey, data, 300000);
           
           const items = Array.isArray(data.items) ? data.items : [];
            const updatedItems = items.map(item => ({
              ...item,
              submissionPct: calculateSubmissionPct(item)
            }));
            
            setDepartmentProgress(updatedItems);
            setDepartmentProgressTotal(data.total || 0);
            setDepartmentProgressPage(page);
          }
        } catch (e) {
          console.warn('[HODContext] department-progress fetch failed:', e);
        }
      }, [isHod, departmentProgressPage, departmentProgressLimit]);

      // Helper function to calculate submission percentage for a class
      const calculateSubmissionPct = (classItem) => {
        const students = classItem.students || [];
        if (students.length === 0) return 0;
        const submitted = students.filter(s => 
          s.grade !== null && s.grade !== undefined && s.grade !== ''
        ).length;
        return Math.round((submitted / students.length) * 100);
      };

    const refreshTeacherSubmissions = useCallback(async (academicYearId, termNumber) => {
      if (!isHod) return;
      try {
        const data = await hodService.getTeacherSubmissionStatus(academicYearId, termNumber);
        setTeacherSubmissions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn('[HODContext] teacher-submissions fetch failed:', e);
      }
    }, [isHod]);

    const refreshLockedTerms = useCallback(async () => {
      if (!isHod) return;
      try {
        const data = await hodService.getLockedTerms();
        setLockedTerms(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn('[HODContext] locked-terms fetch failed:', e);
      }
    }, [isHod]);

const refreshArchivedClasses = useCallback(async () => {
      if (!isHod) return [];
      try {
        const data = await hodService.getArchivedDepartmentData({
          year: archiveYearFilter !== 'all' ? archiveYearFilter : undefined,
          search: archiveSearchQuery.trim() || undefined,
          status: archiveFilter !== 'all' ? archiveFilter : undefined,
        });
        setArchivedClasses(Array.isArray(data) ? data : []);
        return data;
      } catch (e) {
        console.warn('[HODContext] archived-classes fetch failed:', e);
      }
     }, [isHod, archiveYearFilter, archiveFilter, archiveSearchQuery]);

const refreshPromotionRecommendations = useCallback(async () => {
      if (!isHod) return;
      try {
        const data = await hodService.getPromotionRecommendations();
        setPromotionRecommendations(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn('[HODContext] promotion-recommendations fetch failed:', e);
      }
    }, [isHod]);

    const refreshRevisions = useCallback(async () => {
      if (!isHod) return;
      try {
        const data = await hodService.getGradeRevisions?.() || [];
        setRevisions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn('[HODContext] revisions fetch failed:', e);
      }
    }, [isHod]);

    const refreshSettings = useCallback(async () => {
      if (!isHod) return;
      try {
        const data = await hodService.getHODSettings();
        setHodSettings(data ?? {
          profile: {
            name: '',
            email: '',
            phone: '',
            department: ''
          },
          notifications: {
            grading: true,
            certification: true,
            security: true,
            gradeSubmissionReminders: true,
            interventionAlerts: true,
            systemAnnouncements: true,
            weeklyDigest: false
          },
          security: {
            mfaEnabled: false,
            mfaEnforced: false,
            sessionTimeout: 30,
            passwordLastChanged: '',
            mfaEnrolledUsers: []
          },
          uiPreferences: {
            theme: 'light',
            density: 'comfortable',
            defaultView: 'dashboard'
          },
          departmentConfig: {
            autoAlertThreshold: 15,
            autoResolveDays: 7
          },
          auditFrequency: 'daily'
        });
      } catch (e) {
        console.warn('[HODContext] settings fetch failed:', e);
        setHodSettings({
          profile: {
            name: '',
            email: '',
            phone: '',
            department: ''
          },
          notifications: {
            grading: true,
            certification: true,
            security: true,
            gradeSubmissionReminders: true,
            interventionAlerts: true,
            systemAnnouncements: true,
            weeklyDigest: false
          },
          security: {
            mfaEnabled: false,
            mfaEnforced: false,
            sessionTimeout: 30,
            passwordLastChanged: '',
            mfaEnrolledUsers: []
          },
          uiPreferences: {
            theme: 'light',
            density: 'comfortable',
            defaultView: 'dashboard'
          },
          departmentConfig: {
            autoAlertThreshold: 15,
            autoResolveDays: 7
          },
          auditFrequency: 'daily'
        });
      }
    }, [isHod]);

    const saveSettings = useCallback(async (settingsPatch) => {
      if (!isHod) throw new Error('Not authorized');
      const updated = await hodService.updateHODSettings(settingsPatch);
      setHodSettings(updated ?? { ...hodSettings, ...settingsPatch });
      return updated;
    }, [isHod, hodSettings]);

    const changePassword = useCallback(async (currentPassword, newPassword) => {
      if (!isHod) throw new Error('Not authorized');
      return hodService.changePassword(currentPassword, newPassword);
    }, [isHod]);

    const refreshActiveSessions = useCallback(async () => {
      if (!isHod) return;
      try {
        const data = await hodService.getActiveSessions();
        setActiveSessions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn('[HODContext] active-sessions fetch failed:', e);
      }
    }, [isHod]);

     const revokeSession = useCallback(async (sessionId) => {
       if (!isHod) throw new Error('Not authorized');
       const result = await hodService.revokeSession(sessionId);
       setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
       return result;
     }, [isHod]);

     // ── Phase 6: Support data refreshers ───────────────────────────────────────
     const refreshSupportTickets = useCallback(async () => {
       if (!isHod) return;
       try {
         const data = await hodService.getSupportTickets();
         setSupportTickets(Array.isArray(data?.tickets ?? data) ? (data?.tickets ?? data) : []);
       } catch (e) {
         console.warn('[HODContext] support tickets fetch failed:', e);
       }
     }, [isHod]);

     const refreshSystemHealth = useCallback(async () => {
       if (!isHod) return;
       try {
         const data = await hodService.getSystemHealth();
         setSystemHealth(data ?? null);
       } catch (e) {
         console.warn('[HODContext] system-health fetch failed:', e);
         setSystemHealth(null);
       }
     }, [isHod]);

     const refreshEscalatedIssues = useCallback(async () => {
       if (!isHod) return;
       try {
         const data = await hodService.getEscalatedIssues();
         setEscalatedIssues(Array.isArray(data) ? data : []);
       } catch (e) {
         console.warn('[HODContext] escalated-issues fetch failed:', e);
       }
     }, [isHod]);

     const refreshContactChannels = useCallback(async () => {
       if (!isHod) return;
       try {
         const data = await hodService.getContactChannels();
         setContactChannels(data ?? null);
       } catch (e) {
         console.warn('[HODContext] contact-channels fetch failed:', e);
         setContactChannels(null);
       }
     }, [isHod]);

     // ── Phase 7: Support actions ────────────────────────────────────────────────
     const createTicket = useCallback(async (ticketBody) => {
       if (!isHod) throw new Error('Not authorized');
       const ticket = await hodService.createSupportTicket(ticketBody);
       setSupportTickets((prev) => [ticket, ...prev]);
       return ticket;
     }, [isHod]);

     const updateTicketAction = useCallback(async (ticketId, patch) => {
       if (!isHod) throw new Error('Not authorized');
       const updated = await hodService.updateSupportTicket(ticketId, patch);
       setSupportTickets((prev) =>
         prev.map((t) => (t.id === ticketId ? { ...t, ...updated } : t)),
       );
       return updated;
     }, [isHod]);

     const escalateTicketAction = useCallback(async (ticketId, body) => {
       if (!isHod) throw new Error('Not authorized');
       const result = await hodService.escalateTicket(ticketId, body);
       setSupportTickets((prev) =>
         prev.map((t) => (t.id === ticketId ? { ...t, escalated: true, ...result } : t)),
       );
       return result;
     }, [isHod]);

     const updateChannelPrefsAction = useCallback(async (channels) => {
       if (!isHod) throw new Error('Not authorized');
       const updated = await hodService.updateContactChannels(channels);
       setContactChannels(updated ?? { ...contactChannels, ...channels });
       return updated;
     }, [isHod, contactChannels]);

     // ── Phase 7: Impersonation ──────────────────────────────────────────────────
     const refreshDepartmentTeachers = useCallback(async () => {
       if (!isHod) return;
       try {
         const data = await hodService.getDepartmentTeachers();
         setDepartmentTeachers(Array.isArray(data) ? data : []);
       } catch (e) {
         console.warn('[HODContext] department-teachers fetch failed:', e);
       }
      }, [isHod]);

      const refreshAcademicYears = useCallback(async () => {
        if (!isHod) return;
        try {
          const data = await hodService.getAllAcademicYears();
          setAcademicYears(Array.isArray(data) ? data : []);
        } catch (e) {
          console.warn('[HODContext] academic-years fetch failed:', e);
        }
      }, [isHod]);

      const impersonateTeacherAction = useCallback(async (teacherId, reason = '') => {
       if (!isHod) throw new Error('Not authorized');
       const result = await hodService.impersonateTeacher(teacherId, { reason, timestamp: new Date().toISOString() });
       setViewAsTeacherId(teacherId);
       return result;
     }, [isHod]);

     const stopImpersonationAction = useCallback(async () => {
       if (!isHod) throw new Error('Not authorized');
       await hodService.stopImpersonation();
       setViewAsTeacherId(null);
       setViewAsTeacherName(null);
     }, [isHod]);

      const resetTeacherPasswordAction = useCallback(async (teacherId, newPassword) => {
        if (!isHod) throw new Error('Not authorized');
        return hodService.resetTeacherPassword(teacherId, newPassword);
      }, [isHod]);

      const addAlertNote = useCallback((alertId, note) => {
        if (!isHod) throw new Error('Not authorized');
        setAlertNotes((prev) => ({
          ...prev,
          [alertId]: { ...(prev[alertId] || {}), note, updatedAt: new Date().toISOString() },
        }));
        return note;
      }, [isHod]);

     const mfaEnroll = useCallback(async () => {
      if (!isHod) throw new Error('Not authorized');
      return hodService.mfaEnroll();
    }, [isHod]);

    const mfaVerify = useCallback(async (code) => {
      if (!isHod) throw new Error('Not authorized');
      return hodService.mfaVerify(code);
    }, [isHod]);


       const refreshAll = useCallback(() => {
        refreshAuditLogs();
        refreshInterventionAlerts();
        refreshDepartmentProgress();
        refreshTeacherSubmissions();
        refreshLockedTerms();
        refreshArchivedClasses();
        refreshPromotionRecommendations();
        refreshSettings();
        refreshActiveSessions();
        refreshSupportTickets();
        refreshSystemHealth();
        refreshEscalatedIssues();
        refreshContactChannels();
        refreshDepartmentTeachers();
        refreshAcademicYears();
      }, [
        refreshAuditLogs,
        refreshInterventionAlerts,
        refreshDepartmentProgress,
        refreshTeacherSubmissions,
        refreshLockedTerms,
        refreshArchivedClasses,
        refreshPromotionRecommendations,
        refreshSettings,
        refreshActiveSessions,
        refreshSupportTickets,
        refreshSystemHealth,
        refreshEscalatedIssues,
        refreshContactChannels,
        refreshDepartmentTeachers,
        refreshAcademicYears,
      ]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const fetchGradeComparison = useCallback(async (subjectId, termA, termB) => {
    try {
      const data = await hodService.getGradeComparison(subjectId, termA, termB);
      setGradeComparison(Array.isArray(data) ? data : []);
      return data;
    } catch (e) {
      console.warn('[HODContext] grade-comparison fetch failed:', e);
      return [];
    }
  }, []);

  const startExport = (exportFn) => async (...args) => {
    setIsExporting(true);
    try {
      await exportFn(...args);
    } finally {
      setIsExporting(false);
    }
  };

  const lockTerm = useCallback(async (termId) => {
    if (!isHod) throw new Error('Not authorized');
    const result = await hodService.lockDepartmentMatrix(termId);
    // Update local state - lock all classes belonging to this term
    setDepartmentProgress((prev) =>
      prev.map((cls) =>
        cls.termId === termId ? { ...cls, status: 'LOCKED' } : cls,
      ),
    );
    return result;
  }, [isHod, setDepartmentProgress]);

const unlockTerm = useCallback(async (termId) => {
    if (!isHod) throw new Error('Not authorized');
    const result = await hodService.unlockDepartmentMatrix(termId);
    // Update local state - unlock all classes belonging to this term
    setDepartmentProgress((prev) =>
      prev.map((cls) =>
        cls.termId === termId ? { ...cls, status: 'PENDING' } : cls,
      ),
    );
    return result;
  }, [isHod, setDepartmentProgress]);

  const validateLock = useCallback(async (termId) => {
    if (!isHod) throw new Error('Not authorized');
    const validation = await hodService.validateLock(termId);
    return validation;
  }, [isHod]);

    const lockTermWithValidation = useCallback(async (termId) => {
     if (!isHod) throw new Error('Not authorized');
     const validation = await validateLock(termId);
     if (!validation.canLock) {
       throw new Error(`Cannot lock: ${validation.blockingIssues?.join(', ') || '100% completion required'}`);
     }
     const result = await hodService.lockDepartmentMatrix(termId);
     // Update local state - lock all classes belonging to this term
     setDepartmentProgress((prev) =>
       prev.map((cls) =>
         cls.termId === termId ? { ...cls, status: 'LOCKED' } : cls,
       ),
     );
     if (validation.completionPct < 100) {
       console.warn(`Locking with ${validation.completionPct}% completion`);
     }
     return result;
   }, [isHod, setDepartmentProgress, validateLock]);

  const exportClassCSV = useCallback(async (classId) => {
    if (!isHod) throw new Error('Not authorized');
    const cls = departmentProgress.find((c) => c.id === classId);
    if (!cls) {
      throw new Error('Class not found');
    }
    const termId = cls.termId || classId;
    const className = cls?.className || cls?.name || 'Unknown';
    return hodService.exportWAECCSV(termId, className);
  }, [isHod, departmentProgress]);

const rejectRevision = useCallback(async (recordId, reason) => {
    if (!isHod) throw new Error('Not authorized');
    const result = await hodService.rejectGradeRevision(recordId, reason);
    setAuditLogs((prev) =>
      prev.map((log) =>
        log.recordId === recordId ? { ...log, status: 'FLAGGED' } : log,
      ),
    );
    return result;
  }, [isHod]);

  const approveRevision = useCallback(async (recordId, comment) => {
    if (!isHod) throw new Error('Not authorized');
    const result = await hodService.approveGradeRevision(recordId, comment);
    setAuditLogs((prev) =>
      prev.map((log) =>
        log.recordId === recordId ? { ...log, status: 'RESOLVED', hodComment: comment } : log,
      ),
    );
    setRevisions((prev) =>
      prev.map((rev) =>
        rev.id === recordId ? { ...rev, status: 'RESOLVED' } : rev,
      ),
    );
    return result;
  }, [isHod]);

  const lockClass = useCallback(async (classId) => {
     if (!isHod) throw new Error('Not authorized');
     const result = await hodService.lockDepartmentMatrix(classId);
     return result;
   }, [isHod]);

   const bulkApproveRevisions = useCallback(async (recordIds, remark = 'Bulk approved') => {
     if (!isHod) throw new Error('Not authorized');
     const results = await Promise.all(
       recordIds.map(id => hodService.updateHODComment(id, remark))
     );
     setAuditLogs((prev) =>
       prev.map((log) =>
         recordIds.includes(log.recordId || log.id)
           ? { ...log, status: 'APPROVED', hodComment: remark }
           : log,
       ),
     );
     return results;
   }, [isHod]);

   const bulkRejectRevisions = useCallback(async (recordIds, reason = 'Bulk rejected') => {
     if (!isHod) throw new Error('Not authorized');
     const results = await Promise.all(
       recordIds.map(id => hodService.rejectGradeRevision(id, reason))
     );
     setAuditLogs((prev) =>
       prev.map((log) =>
         recordIds.includes(log.recordId || log.id)
           ? { ...log, status: 'FLAGGED', rejectionReason: reason }
           : log,
       ),
     );
     return results;
   }, [isHod]);

   // Triggered from context to sync local state after a server lock
   const markClassLocked = useCallback((classId) => {
     setDepartmentProgress((prev) =>
       prev.map((cls) =>
         cls.id === classId ? { ...cls, status: 'LOCKED' } : cls,
       ),
     );
   }, []);

  const markClassArchived = useCallback((classId) => {
    setDepartmentProgress((prev) =>
      prev.map((cls) =>
        cls.id === classId ? { ...cls, status: 'ARCHIVED' } : cls,
      ),
    );
    setArchivedClasses((prev) =>
      prev.map((c) => (c.id === classId ? { ...c, status: 'ARCHIVED' } : c)),
    );
  }, []);

  const archiveClass = useCallback(async (classId) => {
    if (!isHod) throw new Error('Not authorized');
    const result = await hodService.lockDepartmentMatrix(classId); // API routes: POST /api/hod/archive/:id
    markClassArchived(classId);
    return result;
  }, [isHod, markClassArchived]);

  const exportArchivedDataCtx = useCallback(async (params = {}) => {
    if (!isHod) throw new Error('Not authorized');
    startExport(async () => {
      const blob = await hodService.exportArchivedData(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `department-archive-${params.year || 'all'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    })();
  }, [isHod, startExport]);

  // ── Load teachers on mount for HOD ───────────────────────────────────────────
  useEffect(() => {
    if (!isHod) return;
    refreshDepartmentTeachers();
  }, [isHod, refreshDepartmentTeachers]);

  // ── Load academic years on mount for HOD ─────────────────────────────────────
  useEffect(() => {
    if (!isHod) return;
    refreshAcademicYears();
  }, [isHod, refreshAcademicYears]);

  // ── Periodic system health refresh (every 30 seconds) ────────────────────────
  useEffect(() => {
    if (!isHod) return;
    const interval = setInterval(() => {
      refreshSystemHealth();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [isHod, refreshSystemHealth]);

const value = {
      // state
      auditLogs,
      setAuditLogs,
      auditFilter,
      setAuditFilter,
      interventionAlerts,
      setInterventionAlerts,
      alertFilter,
      setAlertFilter,
      departmentProgress,
      teacherSubmissions,
      gradeComparison,
      lockedTerms,
      archivedClasses,
      promotionRecommendations,
      revisions,
      // ── Phase 5: Settings ────────────────────────────────────────────────────
      hodSettings,
     setHodSettings,
     activeSessions,
     // ── Phase 6: Support ─────────────────────────────────────────────────────
     supportTickets,
     setSupportTickets,
     ticketFilter,
     setTicketFilter,
     ticketTabs,
     setTicketTabs,
     systemHealth,
     setSystemHealth,
     escalatedIssues,
     setEscalatedIssues,
     contactChannels,
     setContactChannels,
      // ── Phase 7: Impersonation ─────────────────────────────────────────────────
      viewAsTeacherId,
      setViewAsTeacherId,
      viewAsTeacherName,
      setViewAsTeacherName,
      departmentTeachers,
      setDepartmentTeachers,
      academicYears,
      refreshAcademicYears,
      // ── Phase 9: Intervention counseling ────────────────────────────────────────
      alertNotes,
      setAlertNotes,
      alertAggregationMode,
      setAlertAggregationMode,
      isLoading,
     isExporting,
     error,
     activeActionMenu,
     setActiveActionMenu,

     // archive filters
     archiveFilter,
setArchiveFilter,
      archiveYearFilter,
      setArchiveYearFilter,
      archiveSearchQuery,
      setArchiveSearchQuery,
      archivePage,
      setArchivePage,
      getFilteredArchive,
      departmentProgressPage,
      departmentProgressLimit,

     // filtered + helpers
     getFilteredAuditLogs,
     getFilteredAlerts,
     getFilteredTickets,
     totalAlerts,
     unresolvedAlerts,
     atRiskStudentCount,
     submissionPct,
     hasShortJustification,
     calcTicketAge,
     isTicketSLABreach,

     // interactions (Phase 1–5)
     resolveAlert,
     addHODComment,
     fetchGradeComparison,

     // support actions (Phase 6)
     createTicket,
     updateTicketAction,
     escalateTicketAction,
     updateChannelPrefsAction,

      // impersonation actions (Phase 7)
      impersonateTeacherAction,
      stopImpersonationAction,
      resetTeacherPasswordAction,

      // counseling actions (Phase 9)
      addAlertNote,
      getAggregatedAlerts,
      alertClusterCount,

// data fetching
      validateLock,
      refreshAuditLogs,
      refreshInterventionAlerts,
      refreshDepartmentProgress,
      refreshTeacherSubmissions,
      refreshLockedTerms,
      refreshArchivedClasses,
      refreshPromotionRecommendations,
      refreshRevisions,
      refreshSettings,
     refreshActiveSessions,
     refreshSupportTickets,
     refreshSystemHealth,
     refreshEscalatedIssues,
    refreshContactChannels,
    refreshDepartmentTeachers,
    refreshAll,
     saveSettings,
     changePassword,
     revokeSession,
     mfaEnroll,
     mfaVerify,

// export helpers
        startExport,
        lockTerm,
        lockTermWithValidation,
        unlockTerm,
        exportClassCSV,
        rejectRevision,
        approveRevision,
        lockClass,
       bulkApproveRevisions,
       bulkRejectRevisions,
       markClassLocked,
       markClassArchived,
       archiveClass,
       exportArchivedDataCtx,

    // offline/draft mode
      isOnline,
      setIsOnline,
      isDraftMode,
      setIsDraftMode,
      isEffectivelyOffline,
      pendingChanges,
      draftRecords,
      queueChange,
      saveDraftRecord,
      loadDraftRecord,
      getAllDraftRecords,

        baselineDeltas,
        resetBaseline: () => saveBaseline({}),
      };

  return <HODContext.Provider value={value}>{children}</HODContext.Provider>;
}

export function useHOD() {
  const context = useContext(HODContext);
  if (context === undefined) {
    throw new Error('useHOD must be used within a HODProvider');
  }
  return context;
}
