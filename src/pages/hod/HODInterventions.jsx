import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, CheckCircle2, ChevronRight, X,
  RefreshCw, Layers, ShieldCheck, MessageSquare, Flame
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { notification } from '../../services/notificationService';
import { eventBus } from '../../services/eventBus';
import { auditTrail } from '../../services/auditTrailService';
import { AlertSeverityChip, EmptyState } from '../../components/molecules';
import { InterventionAlertCluster } from '../../components/organisms';

export function HODInterventions() {
  const {
    interventionAlerts = [],
    alertFilter = 'all',
    setAlertFilter,
    resolveAlert,
    addAlertNote,
    getAggregatedAlerts,
    refreshInterventionAlerts,
  } = useHOD();

  const [search, setSearch] = useState('');
  const [activeClusterId, setActiveClusterId] = useState(null);

  useEffect(() => {
    if (typeof refreshInterventionAlerts === 'function') {
      refreshInterventionAlerts();
    }
  }, [refreshInterventionAlerts]);

  const handleResolveAlert = async (alertId, studentId, studentName) => {
    if (typeof resolveAlert !== 'function') return;
    resolveAlert(alertId);
    
    const oldVal = typeof auditTrail?.captureSnapshot === 'function' ? auditTrail.captureSnapshot({ resolved: false }) : { resolved: false };
    const newVal = typeof auditTrail?.captureSnapshot === 'function' ? auditTrail.captureSnapshot({ resolved: true }) : { resolved: true };
    
    if (auditTrail?.logChange) {
      await auditTrail.logChange('intervention_alert', alertId, oldVal, newVal, 'Alert resolved by HOD');
    }
    if (notification?.notifyTeacherOfHODAction) {
      await notification.notifyTeacherOfHODAction(studentId, 'ALERT_RESOLVED', alertId, `${studentName}'s alert resolved`);
    }
  };

  const handleAddCounselingNote = async (alertId, note) => {
    if (typeof addAlertNote !== 'function') return;
    addAlertNote(alertId, note);
    
    if (auditTrail?.logChange) {
      await auditTrail.logChange('intervention_alert', alertId, {}, { counselingNote: note }, note);
    }
    if (eventBus?.emit) {
      eventBus.emit('counseling-note-added', { alertId, note });
    }
  };

  // 1. Filter metrics directly derived into tabs
  const tabs = [
    { id: 'all',       label: 'All Active',  count: interventionAlerts.filter(a => !a?.resolved).length },
    { id: 'HIGH',      label: 'Critical',    count: interventionAlerts.filter(a => a?.severity === 'HIGH' && !a?.resolved).length },
    { id: 'MEDIUM',    label: 'Medium',      count: interventionAlerts.filter(a => a?.severity === 'MEDIUM' && !a?.resolved).length },
    { id: 'resolved',  label: 'Resolved',    count: interventionAlerts.filter(a => a?.resolved).length },
  ];

  // 2. Computed Search & Cluster Filters
  const filteredClusters = useMemo(() => {
    const searchTarget = search.trim().toLowerCase();
    const baseRecords = interventionAlerts.filter(a => {
      // Internal system filtering map logic based on tab states
      if (alertFilter === 'resolved') return a?.resolved;
      if (alertFilter !== 'all') return a?.severity === alertFilter && !a?.resolved;
      return !a?.resolved; // default 'all' view shows all unresolved incidents
    });

    const records = baseRecords.filter(a => {
      if (!searchTarget) return true;
      return (
        String(a?.studentName || '').toLowerCase().includes(searchTarget) ||
        String(a?.subject || '').toLowerCase().includes(searchTarget) ||
        String(a?.description || '').toLowerCase().includes(searchTarget)
      );
    });

    const aggregated = typeof getAggregatedAlerts === 'function' ? getAggregatedAlerts(records) : records;
    
    if (aggregated.length > 0 && !activeClusterId) {
      setActiveClusterId(aggregated[0].id || aggregated[0].studentId || 0);
    }
    return aggregated;
  }, [interventionAlerts, search, alertFilter, getAggregatedAlerts]);

  const selectedCluster = filteredClusters.find(c => (c.id || c.studentId) === activeClusterId) || filteredClusters[0] || null;

  const resolutionProgress = useMemo(() => {
    if (!interventionAlerts.length) return 0;
    return Math.round((interventionAlerts.filter(a => a?.resolved).length / interventionAlerts.length) * 100);
  }, [interventionAlerts]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 font-sans antialiased">
      
      {/* Action Strip Header */}
      <header className="bg-white border-b border-gray-200/80 px-6 py-4 sticky top-0 z-10 backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight">Intervention Management</h1>
            <p className="text-xs text-gray-400 mt-0.5">Track, review, and authorize student safety nets and subject risk adjustments.</p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="hidden md:flex flex-col items-end gap-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Department Clearance Rate</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden border border-gray-200/30">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${resolutionProgress}%` }} />
                </div>
                <span className="text-xs font-bold text-gray-700">{resolutionProgress}%</span>
              </div>
            </div>
            <button 
              onClick={refreshInterventionAlerts}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 shadow-3xs transition-all active:scale-95"
              title="Sync Alerts Engine"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 overflow-hidden max-w-6xl w-full mx-auto p-6 flex gap-6 items-start">
        
        {/* Left Control Sidebar Panel (Spans 1 Column Area) */}
        <div className="w-full md:w-80 shrink-0 flex flex-col space-y-4 h-full overflow-y-auto pb-4">
          
          {/* Unified Query/Filter Panel Box */}
          <div className="bg-white rounded-xl border border-gray-200/70 shadow-3xs p-3 space-y-3">
            <div className="relative">
              <AlertTriangle size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search case files..."
                className="w-full pl-8.5 pr-8 py-1.5 text-xs bg-gray-50 border border-gray-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder-gray-400 font-medium"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={11} />
                </button>
              )}
            </div>

            {/* Severity Fast-Tabs Stack */}
            <div className="flex flex-col gap-0.5">
              {tabs.map((tab) => {
                const active = alertFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => typeof setAlertFilter === 'function' && setAlertFilter(tab.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg transition-all',
                      active 
                        ? 'bg-indigo-50/80 text-indigo-950 font-bold border border-indigo-100/50 shadow-3xs' 
                        : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900'
                    )}
                  >
                    <span>{tab.label}</span>
                    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-bold', active ? 'bg-indigo-200/60 text-indigo-900' : 'bg-gray-100 text-gray-400')}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aggregated Cluster Directory Navigation */}
          <div className="bg-white rounded-xl border border-gray-200/70 shadow-3xs p-2 space-y-0.5 flex-1 overflow-y-auto">
            <div className="flex items-center gap-1.5 px-2 py-1.5 text-gray-400 border-b border-gray-100 mb-1">
              <Layers size={11} />
              <p className="text-[10px] font-bold uppercase tracking-wider">Active Incident Groups</p>
            </div>
            {filteredClusters.length === 0 ? (
              <p className="text-xs text-gray-400 p-3 italic text-center">No anomalies flagged.</p>
            ) : (
              filteredClusters.map((cluster) => {
                const id = cluster.id || cluster.studentId;
                const active = activeClusterId === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveClusterId(id)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-lg text-xs transition-all border group",
                      active
                        ? "bg-slate-900 text-white border-slate-900 shadow-3xs font-medium"
                        : "bg-white border-transparent text-gray-700 hover:bg-slate-50/80 hover:text-gray-900"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold truncate">{cluster.studentName || 'System Case File'}</span>
                      <ChevronRight size={12} className={cn("shrink-0 transition-transform", active ? "text-indigo-400 translate-x-0.5" : "text-gray-300 group-hover:text-gray-400")} />
                    </div>
                    <p className={cn("text-[10px] truncate mt-0.5", active ? "text-slate-400" : "text-gray-400")}>
                      {cluster.subject || 'Cross-Curricular Metrics'} · {cluster.alerts?.length || 1} alert marks
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Dynamic Resolution Frame Display Area */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200/70 shadow-3xs h-full flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedCluster ? (
              <motion.div
                key={selectedCluster.id || selectedCluster.studentId}
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.12 }}
                className="flex flex-col h-full overflow-hidden"
              >
                {/* Panel Sub Header View */}
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/40 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-950 tracking-tight">{selectedCluster.studentName}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Primary Subject Anchor Tracking: <span className="text-gray-700 font-semibold">{selectedCluster.subject || 'General Overview'}</span></p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 shadow-3xs">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    Secure Audit Mode
                  </div>
                </div>

                {/* Submodule Presentation Layer Frame Container */}
                <div className="flex-1 overflow-y-auto p-5">
                  <InterventionAlertCluster 
                    clusters={[selectedCluster]}
                    onResolve={handleResolveAlert}
                    onAddNote={handleAddCounselingNote}
                    activeFilter={alertFilter}
                  />
                </div>
              </motion.div>
            ) : (
              <div className="m-auto text-center py-12 max-w-xs">
                <CheckCircle2 size={32} className="text-gray-200 mx-auto mb-3" />
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">All Clear Bounds</h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                  No tracking flags found matching your selected query filters. All department nodes are currently running normally.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}