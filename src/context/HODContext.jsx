import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRole } from './RoleContext';
import { hodService } from '../services/hodService';

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
  // ── Phase 5: HOD Settings state ──────────────────────────────────────────────
  const [hodSettings, setHodSettings] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  // ── Phase 6: Support data ─────────────────────────────────────────────────────
  const [supportTickets, setSupportTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [ticketTabs, setTicketTabs] = useState('all');
  const [systemHealth, setSystemHealth] = useState(null);
  const [escalatedIssues, setEscalatedIssues] = useState([]);
  const [contactChannels, setContactChannels] = useState(null);
  // ── Phase 7: Impersonation ────────────────────────────────────────────────────
  const [viewAsTeacherId, setViewAsTeacherId] = useState(null);
  const [viewAsTeacherName, setViewAsTeacherName] = useState(null);
  const [departmentTeachers, setDepartmentTeachers] = useState([]);
  // ── Phase 9: Intervention counseling notes & aggregated alerts ─────────────────
  const [alertNotes, setAlertNotes] = useState({});
  const [alertAggregationMode, setAlertAggregationMode] = useState(true);

  // ── Shared UI state ─────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [activeActionMenu, setActiveActionMenu] = useState(null);

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
  const unresolvedAlerts = interventionAlerts.filter((a) => !a.resolved).length;
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

   const refreshInterventionAlerts = useCallback(async () => {
     if (!isHod) return;
     try {
       const data = await hodService.getInterventionAlerts();
       setInterventionAlerts(Array.isArray(data) ? data : []);
     } catch (e) {
       console.warn('[HODContext] intervention-alerts fetch failed:', e);
     }
   }, [isHod]);

   const refreshDepartmentProgress = useCallback(async () => {
     if (!isHod) return;
     try {
       const data = await hodService.getDepartmentProgress();
       setDepartmentProgress(Array.isArray(data) ? data : []);
     } catch (e) {
       console.warn('[HODContext] department-progress fetch failed:', e);
     }
   }, [isHod]);

   const refreshTeacherSubmissions = useCallback(async () => {
     if (!isHod) return;
     try {
       const data = await hodService.getTeacherSubmissionStatus();
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
      if (!isHod) return;
      try {
        const data = await hodService.getArchivedDepartmentData({
          year: archiveYearFilter !== 'all' ? archiveYearFilter : undefined,
          search: archiveSearchQuery.trim() || undefined,
          status: archiveFilter !== 'all' ? archiveFilter : undefined,
        });
        setArchivedClasses(Array.isArray(data) ? data : []);
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

    const refreshSettings = useCallback(async () => {
      if (!isHod) return;
      try {
        const data = await hodService.getHODSettings();
        setHodSettings(data ?? null);
      } catch (e) {
        console.warn('[HODContext] settings fetch failed:', e);
        setHodSettings(null);
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
    return hodService.lockDepartmentMatrix(termId);
  }, [isHod]);

  const unlockTerm = useCallback(async (termId) => {
    if (!isHod) throw new Error('Not authorized');
    return hodService.unlockDepartmentMatrix(termId);
  }, [isHod]);

  const exportClassCSV = useCallback(async (termId, classId) => {
    if (!isHod) throw new Error('Not authorized');
    return hodService.exportWAECCSV(termId, classId);
  }, [isHod]);

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

  const lockClass = useCallback(async (classId) => {
    if (!isHod) throw new Error('Not authorized');
    const result = await hodService.lockDepartmentMatrix(classId);
    return result;
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
     refreshAll,
     saveSettings,
     changePassword,
     revokeSession,
     mfaEnroll,
     mfaVerify,

     // export helpers
     startExport,
     lockTerm,
     unlockTerm,
     exportClassCSV,
     rejectRevision,
     lockClass,
     markClassLocked,
     markClassArchived,
     archiveClass,
     exportArchivedDataCtx,
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
