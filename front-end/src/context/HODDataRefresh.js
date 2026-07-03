import { useCallback, useRef, useEffect } from 'react';
import { hodService } from '../services/hodService';
import { cacheLayer } from '../services';

export function useHODDataRefresh({
  isHod, setIsLoading, setError,
  setAuditLogs, setInterventionAlerts, setDepartmentProgress,
  setDepartmentProgressTotal, setDepartmentProgressPage,
  setTeacherSubmissions, setSubmissionTrends, setLockedTerms, setArchivedClasses,
  setPromotionRecommendations, setRevisions, setHodSettings,
  setActiveSessions, setSupportTickets, setSystemHealth,
  setEscalatedIssues, setContactChannels, setAcademicYears,
  setDepartmentTeachers, departmentProgressPage
}) {

  const isHodRef = useRef(isHod);
  useEffect(() => { isHodRef.current = isHod; }, [isHod]);

  const refreshAuditLogs = useCallback(async () => {
    if (!isHodRef.current) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await hodService.getAuditLogs();
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Failed to refresh logs');
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError, setAuditLogs]);

  const refreshInterventionAlerts = useCallback(async (filters = {}) => {
    if (!isHodRef.current) return;
    try {
      const data = await hodService.getInterventionAlerts(filters);
      setInterventionAlerts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('[HODContext] intervention-alerts fetch failed:', e);
    }
  }, [setInterventionAlerts]);

  const refreshDepartmentProgress = useCallback(async (page = 1, limit = 50, academicYearId, termNumber) => {
    if (!isHodRef.current) return;

    const cacheKey = `departmentProgress_page-${page}_limit-${limit}_year-${academicYearId || 'active'}_term-${termNumber || 'active'}`;
    const cachedData = cacheLayer.get(cacheKey);
    
    if (cachedData) {
      const items = Array.isArray(cachedData.items) ? cachedData.items : [];
      setDepartmentProgress(items);
      setDepartmentProgressTotal(cachedData.total || 0);
      setDepartmentProgressPage(page);
      return;
    }

    try {
      const data = await hodService.getDepartmentProgress({ page, limit, academicYearId, termNumber });
      if (data) {
        cacheLayer.set(cacheKey, data, 300000);
        const items = Array.isArray(data.items) ? data.items : [];
        setDepartmentProgress(items);
        setDepartmentProgressTotal(data.total || 0);
        setDepartmentProgressPage(page);
      }
    } catch (e) {
      console.warn('[HODContext] department-progress fetch failed:', e);
    }
  }, [setDepartmentProgress, setDepartmentProgressTotal, setDepartmentProgressPage]);

  const refreshTeacherSubmissions = useCallback(async (academicYearId, termNumber) => {
    if (!isHodRef.current) return;
    try {
      const data = await hodService.getTeacherSubmissionStatus(academicYearId, termNumber);
      setTeacherSubmissions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('[HODContext] teacher-submissions fetch failed:', e);
    }
  }, [setTeacherSubmissions]);

  const refreshSubmissionTrends = useCallback(async () => {
    if (!isHodRef.current) return;
    try {
      const data = await hodService.getTeacherSubmissionTrends();
      setSubmissionTrends(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('[HODContext] submission-trends fetch failed:', e);
    }
  }, [setSubmissionTrends]);

  const refreshLockedTerms = useCallback(async () => {
    if (!isHodRef.current) return;
    try {
      const data = await hodService.getLockedTerms();
      setLockedTerms(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('[HODContext] locked-terms fetch failed:', e);
    }
  }, [setLockedTerms]);

  const refreshArchivedClasses = useCallback(async () => {
    if (!isHodRef.current) return [];
    try {
      const data = await hodService.getArchivedDepartmentData({
        year: undefined,
        search: undefined,
        status: undefined,
      });
      setArchivedClasses(Array.isArray(data) ? data : []);
      return data;
    } catch (e) {
      console.warn('[HODContext] archived-classes fetch failed:', e);
      return [];
    }
  }, [setArchivedClasses]);

  const refreshPromotionRecommendations = useCallback(async () => {
    if (!isHodRef.current) return;
    try {
      const data = await hodService.getPromotionRecommendations();
      setPromotionRecommendations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('[HODContext] promotion-recommendations fetch failed:', e);
    }
  }, [setPromotionRecommendations]);

  const refreshRevisions = useCallback(async () => {
    if (!isHodRef.current) return;
    try {
      const data = await hodService.getGradeRevisions?.() || [];
      setRevisions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('[HODContext] revisions fetch failed:', e);
    }
  }, [setRevisions]);

  const refreshSettings = useCallback(async () => {
    if (!isHodRef.current) return;
    const fallbackSettings = {
      profile: { name: '', email: '', phone: '', department: '' },
      notifications: { grading: true, certification: true, security: true, gradeSubmissionReminders: true, interventionAlerts: true, systemAnnouncements: true, weeklyDigest: false },
      security: { mfaEnabled: false, mfaEnforced: false, sessionTimeout: 30, passwordLastChanged: '', mfaEnrolledUsers: [] },
      uiPreferences: { theme: 'light', density: 'comfortable', defaultView: 'dashboard' },
      departmentConfig: { autoAlertThreshold: 15, autoResolveDays: 7 },
      auditFrequency: 'daily'
    };
    try {
      const data = await hodService.getHODSettings();
      setHodSettings(data ?? fallbackSettings);
    } catch (e) {
      console.warn('[HODContext] settings fetch failed:', e);
      setHodSettings(fallbackSettings);
    }
  }, [setHodSettings]);

  const saveSettings = useCallback(async (settingsPatch) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    const updated = await hodService.updateHODSettings(settingsPatch);
    setHodSettings((prev) => updated ?? { ...(prev || {}), ...settingsPatch });
    return updated;
  }, [setHodSettings]);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    return await hodService.changePassword(currentPassword, newPassword);
  }, []);

  const refreshActiveSessions = useCallback(async () => {
    if (!isHodRef.current) return;
    try {
      const data = await hodService.getActiveSessions();
      setActiveSessions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('[HODContext] active-sessions fetch failed:', e);
    }
  }, [setActiveSessions]);

  const revokeSession = useCallback(async (sessionId) => {
    if (!isHodRef.current) throw new Error('Not authorized');
    const result = await hodService.revokeSession(sessionId);
    setActiveSessions((prev) => (prev || []).filter((s) => s.id !== sessionId));
    return result;
  }, [setActiveSessions]);

  const refreshSupportTickets = useCallback(async () => {
    if (!isHodRef.current) return;
    try {
      const data = await hodService.getSupportTickets();
      setSupportTickets(Array.isArray(data?.tickets ?? data) ? (data?.tickets ?? data) : []);
    } catch (e) {
      console.warn('[HODContext] support tickets fetch failed:', e);
    }
  }, [setSupportTickets]);

  const refreshSystemHealth = useCallback(async () => {
    if (!isHodRef.current) return;
    try {
      const data = await hodService.getSystemHealth();
      setSystemHealth(data ?? null);
    } catch (e) {
      console.warn('[HODContext] system-health fetch failed:', e);
      setSystemHealth(null);
    }
  }, [setSystemHealth]);

  const refreshEscalatedIssues = useCallback(async () => {
    if (!isHodRef.current) return;
    try {
      const data = await hodService.getEscalatedIssues();
      setEscalatedIssues(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('[HODContext] escalated-issues fetch failed:', e);
    }
  }, [setEscalatedIssues]);

  const refreshContactChannels = useCallback(async () => {
    if (!isHodRef.current) return;
    try {
      const data = await hodService.getContactChannels();
      setContactChannels(data ?? null);
    } catch (e) {
      console.warn('[HODContext] contact-channels fetch failed:', e);
      setContactChannels(null);
    }
  }, [setContactChannels]);

  const refreshDepartmentTeachers = useCallback(async () => {
    if (!isHodRef.current) return;
    try {
      const data = await hodService.getDepartmentTeachers();
      setDepartmentTeachers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('[HODContext] department-teachers fetch failed:', e);
    }
  }, [setDepartmentTeachers]);

  const refreshAcademicYears = useCallback(async () => {
    if (!isHodRef.current) return;
    try {
      const data = await hodService.getAllAcademicYears();
      setAcademicYears(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('[HODContext] academic-years fetch failed:', e);
    }
  }, [setAcademicYears]);

  const refreshAll = useCallback(() => {
    refreshAuditLogs();
    refreshInterventionAlerts();
    refreshDepartmentProgress(departmentProgressPage || 1);
    refreshTeacherSubmissions();
    refreshSubmissionTrends();
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
    departmentProgressPage,
    refreshAuditLogs, refreshInterventionAlerts, refreshDepartmentProgress,
    refreshTeacherSubmissions, refreshSubmissionTrends, refreshLockedTerms, refreshArchivedClasses,
    refreshPromotionRecommendations, refreshSettings, refreshActiveSessions,
    refreshSupportTickets, refreshSystemHealth, refreshEscalatedIssues,
    refreshContactChannels, refreshDepartmentTeachers, refreshAcademicYears,
  ]);

  return {
    refreshAuditLogs, refreshInterventionAlerts, refreshDepartmentProgress,
    refreshTeacherSubmissions, refreshSubmissionTrends, refreshLockedTerms, refreshArchivedClasses,
    refreshPromotionRecommendations, refreshRevisions, refreshSettings,
    saveSettings, changePassword, refreshActiveSessions, revokeSession,
    refreshSupportTickets, refreshSystemHealth, refreshEscalatedIssues,
    refreshContactChannels, refreshDepartmentTeachers, refreshAcademicYears,
    refreshAll,
  };
}