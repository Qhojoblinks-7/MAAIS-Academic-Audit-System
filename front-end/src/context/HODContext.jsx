import React, { createContext, useContext, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRole } from './RoleContext';
import { useUI } from './UIContext';
import useHODState from './HODState';
import { useBaseline, saveBaseline } from './HODBaseline';
import { useHODFilters } from './HODFilters';
import { useHODDataRefresh } from './HODDataRefresh';
import { useHODActions } from './HODActions';

const HODContext = createContext(undefined);

export function HODProvider({ children }) {
  const { user } = useRole();
  const isHod = user?.role === 'HOD';
  const { isOnline, setIsOnline, isDraftMode, setIsDraftMode } = useUI();

  const state = useHODState();
  const offline = {
    isEffectivelyOffline: state.isEffectivelyOffline(isOnline, isDraftMode),
    saveDraftRecord: state.saveDraftRecord,
    loadDraftRecord: state.loadDraftRecord,
    getAllDraftRecords: state.getAllDraftRecords,
    queueChange: state.queueChange,
    processPendingChanges: state.processPendingChanges,
  };

  const baseProgress = state.departmentProgress?.items || state.departmentProgress || [];
  const avgProgress = baseProgress.length > 0
    ? Math.round(baseProgress.reduce((sum, c) => sum + (c.progress || c.submissionPct || 0), 0) / baseProgress.length)
    : 0;
  const unresolvedAlerts = state.interventionAlerts.filter(a => !a.resolved).length;
  const teacherCompletion = state.teacherSubmissions.length > 0
    ? Math.round(state.teacherSubmissions.reduce((sum, s) => sum + (s.progress || 0), 0) / state.teacherSubmissions.length)
    : 0;

  const { baseline, baselineDeltas } = useBaseline({
    baseProgress, avgProgress, unresolvedAlerts, teacherCompletion
  });

  const filters = useHODFilters({
    auditLogs: state.auditLogs,
    auditFilter: state.auditFilter,
    interventionAlerts: state.interventionAlerts,
    alertFilter: state.alertFilter,
    archivedClasses: state.archivedClasses,
    archiveYearFilter: state.archiveYearFilter,
    archiveFilter: state.archiveFilter,
    archiveSearchQuery: state.archiveSearchQuery,
    supportTickets: state.supportTickets,
    ticketTabs: state.ticketTabs,
    ticketFilter: state.ticketFilter
  });

  const dataRefresh = useHODDataRefresh({
    isHod,
    setIsLoading: state.setIsLoading,
    setError: state.setError,
    setAuditLogs: state.setAuditLogs,
    setInterventionAlerts: state.setInterventionAlerts,
    setDepartmentProgress: state.setDepartmentProgress,
    setDepartmentProgressTotal: state.setDepartmentProgressTotal,
    setDepartmentProgressPage: state.setDepartmentProgressPage,
    setTeacherSubmissions: state.setTeacherSubmissions,
    setSubmissionTrends: state.setSubmissionTrends,
    setLockedTerms: state.setLockedTerms,
    setArchivedClasses: state.setArchivedClasses,
    setPromotionRecommendations: state.setPromotionRecommendations,
    setRevisions: state.setRevisions,
    setHodSettings: state.setHodSettings,
    hodSettings: state.hodSettings,
    setActiveSessions: state.setActiveSessions,
    setSupportTickets: state.setSupportTickets,
    setSystemHealth: state.setSystemHealth,
    setEscalatedIssues: state.setEscalatedIssues,
    setContactChannels: state.setContactChannels,
    setAcademicYears: state.setAcademicYears,
    setDepartmentTeachers: state.setDepartmentTeachers
  });

  const actions = useHODActions({
    isHod,
    setAuditLogs: state.setAuditLogs,
    setInterventionAlerts: state.setInterventionAlerts,
    setDepartmentProgress: state.setDepartmentProgress,
    setRevisions: state.setRevisions,
    setArchivedClasses: state.setArchivedClasses,
    setAlertNotes: state.setAlertNotes,
    setSupportTickets: state.setSupportTickets,
    setEscalatedIssues: state.setEscalatedIssues,
    setContactChannels: state.setContactChannels,
    setViewAsTeacherId: state.setViewAsTeacherId,
    setViewAsTeacherName: state.setViewAsTeacherName,
    departmentProgress: state.departmentProgress,
    setIsExporting: state.setIsExporting,
    contactChannels: state.contactChannels
  });

  const calcTicketAge = (createdAt) => {
    if (!createdAt) return null;
    return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
  };

  const isTicketSLABreach = (createdAt, slaMinutes = 30) => {
    if (!createdAt) return false;
    return calcTicketAge(createdAt) > slaMinutes;
  };

  useEffect(() => {
    if (!isHod) return;
    const handler = () => {};
    window.addEventListener('mousemove', handler);
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('mousemove', handler);
      window.removeEventListener('keydown', handler);
    };
  }, [isHod]);

  useEffect(() => {
    if (!isHod) return;
    dataRefresh.refreshDepartmentTeachers();
  }, [isHod]);

  useEffect(() => {
    if (!isHod) return;
    dataRefresh.refreshAcademicYears();
  }, [isHod]);

  useEffect(() => {
    if (!isHod) return;
    const interval = setInterval(() => {
      dataRefresh.refreshSystemHealth();
    }, 30000);
    return () => clearInterval(interval);
  }, [isHod]);

  useEffect(() => {
    if (!offline.isEffectivelyOffline && state.pendingChanges.length > 0) {
      state.processPendingChanges();
    }
  }, [offline.isEffectivelyOffline, state.pendingChanges]);

  useEffect(() => {
    try {
      const savedDrafts = JSON.parse(localStorage.getItem('hodDraftRecords') || '{}');
      if (Object.keys(savedDrafts).length > 0) {
        state.setDraftRecords(savedDrafts);
      }
    } catch (e) {
      console.warn('Failed to load drafts from localStorage on init:', e);
    }
  }, []);

  const value = useMemo(() => ({
    ...state,
    ...offline,
    ...filters,
    ...dataRefresh,
    ...actions,
    totalAlerts: state.interventionAlerts.length,
    atRiskStudentCount: unresolvedAlerts,
    submissionTrends: state.submissionTrends,
    calcTicketAge,
    isTicketSLABreach,
    baselineDeltas,
    resetBaseline: () => saveBaseline({}),
  }), [state, offline, filters, dataRefresh, actions, unresolvedAlerts, baselineDeltas]);

  return <HODContext.Provider value={value}>{children}</HODContext.Provider>;
}

export function useHOD() {
  const context = useContext(HODContext);
  if (context === undefined) {
    throw new Error('useHOD must be used within a HODProvider');
  }
  return context;
}