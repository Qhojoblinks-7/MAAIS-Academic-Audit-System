import { useMemo } from 'react';

export function useHODFilters({
  auditLogs, auditFilter, interventionAlerts, alertFilter,
  archivedClasses, archiveYearFilter, archiveFilter, archiveSearchQuery,
  supportTickets, ticketTabs, ticketFilter
}) {

  // ── Memoized Audit Logs ───────────────────────────────────────────────────
  const filteredAuditLogs = useMemo(() => {
    const logs = Array.isArray(auditLogs) ? auditLogs : [];
    if (auditFilter === 'all') return logs;
    
    const normalizedFilter = auditFilter.toUpperCase();
    return logs.filter((log) =>
      log.status === auditFilter ||
      log.action?.toUpperCase().includes(normalizedFilter)
    );
  }, [auditLogs, auditFilter]);

  // ── Memoized Intervention Alerts ──────────────────────────────────────────
  const filteredAlerts = useMemo(() => {
    const alerts = Array.isArray(interventionAlerts) ? interventionAlerts : [];
    if (alertFilter === 'all') return alerts;
    
    const isResolvedQuery = alertFilter === 'resolved';
    const normalizedFilter = alertFilter.toUpperCase();
    
    return alerts.filter((a) =>
      isResolvedQuery ? a.resolved : a.severity?.toUpperCase() === normalizedFilter
    );
  }, [interventionAlerts, alertFilter]);

  // ── Memoized Archived Classes ─────────────────────────────────────────────
  const filteredArchive = useMemo(() => {
    let result = Array.isArray(archivedClasses) ? archivedClasses : [];
    
    if (archiveYearFilter !== 'all') {
      result = result.filter((c) => c.year === archiveYearFilter || c.academicYear === archiveYearFilter);
    }
    
    if (archiveFilter !== 'all') {
      const targetFilter = archiveFilter.toUpperCase();
      result = result.filter((c) =>
        c.status?.toUpperCase() === targetFilter ||
        c.termStatus?.toUpperCase() === targetFilter
      );
    }
    
    const query = (archiveSearchQuery || '').trim().toLowerCase();
    if (query) {
      result = result.filter((c) =>
        (c.name || '').toLowerCase().includes(query) ||
        (c.className || c.class || '').toLowerCase().includes(query) ||
        (c.studentName || '').toLowerCase().includes(query) ||
        (c.teacherName || '').toLowerCase().includes(query) ||
        (c.subject || '').toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [archivedClasses, archiveYearFilter, archiveFilter, archiveSearchQuery]);

  // ── Memoized Support Tickets ──────────────────────────────────────────────
  const filteredTickets = useMemo(() => {
    let result = Array.isArray(supportTickets) ? supportTickets : [];
    
    if (ticketTabs !== 'all') {
      const targetTab = ticketTabs.toUpperCase();
      result = result.filter((t) => (t.status || '').toUpperCase() === targetTab);
    }
    
    if (ticketFilter !== 'all') {
      const targetFilter = ticketFilter.toUpperCase();
      result = result.filter((t) =>
        (t.priority || '').toUpperCase() === targetFilter ||
        t.severity?.toUpperCase() === targetFilter
      );
    }
    
    return result;
  }, [supportTickets, ticketTabs, ticketFilter]);

  // ── Memoized Aggregated Clusters ──────────────────────────────────────────
  const aggregatedAlerts = useMemo(() => {
    const list = Array.isArray(interventionAlerts) ? interventionAlerts : [];
    if (list.length === 0) return [];

    const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    const groups = {};

    list.forEach((a) => {
      const key = (a.studentId || a.studentName || a.id).toString();
      if (!groups[key]) {
        groups[key] = { 
          studentId: a.studentId, 
          studentName: a.studentName, 
          studentIndex: a.studentIndex, 
          items: [], 
          maxSeverity: 'LOW', 
          allResolved: true 
        };
      }
      groups[key].items.push(a);
      if (severityOrder[a.severity || 'LOW'] < severityOrder[groups[key].maxSeverity]) {
        groups[key].maxSeverity = a.severity || 'LOW';
      }
      if (!a.resolved) groups[key].allResolved = false;
    });

    return Object.values(groups).sort((g1, g2) => {
      if (!g1.allResolved && g2.allResolved) return -1;
      if (g1.allResolved && !g2.allResolved) return 1;
      return severityOrder[g1.maxSeverity] - severityOrder[g2.maxSeverity];
    });
  }, [interventionAlerts]);

  // Derived calculations consume structural values instantly without function calls
  const alertClusterCount = useMemo(() => aggregatedAlerts.length, [aggregatedAlerts]);

  return {
    filteredAuditLogs,
    filteredAlerts,
    filteredArchive,
    filteredTickets,
    aggregatedAlerts,
    alertClusterCount,
  };
}