import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, CheckCircle2, MessageSquare, Flag, ChevronRight,
  ChevronDown, User as UserIcon, Clock, ShieldCheck, Plus, X,
  Send, Archive
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { notification } from '../../services/notificationService';
import { eventBus } from '../../services/eventBus';
import { auditTrail } from '../../services/auditTrailService';
import { AlertSeverityChip, EmptyState, HODCommentInput } from '../../components/molecules';
import { InterventionAlertCluster } from '../../components/organisms';

export function HODInterventions() {
  const {
    interventionAlerts,
    alertFilter,
    setAlertFilter,
    resolveAlert,
    addAlertNote,
    getAggregatedAlerts,
    refreshInterventionAlerts,
  } = useHOD();

  const [search, setSearch] = useState('');

  const handleResolveAlert = async (alertId, studentId, studentName) => {
    resolveAlert(alertId);
    const oldVal = auditTrail.captureSnapshot({ resolved: false });
    const newVal = auditTrail.captureSnapshot({ resolved: true });
    await auditTrail.logChange('intervention_alert', alertId, oldVal, newVal, 'Alert resolved by HOD');
    await notification.notifyTeacherOfHODAction(studentId, 'ALERT_RESOLVED', alertId, `${studentName}'s alert resolved`);
  };

  const handleAddCounselingNote = async (alertId, note) => {
    addAlertNote(alertId, note);
    await auditTrail.logChange('intervention_alert', alertId, {}, { counselingNote: note }, note);
    eventBus.emit('counseling-note-added', { alertId, note });
  };

  const tabs = [
    { id: 'all',       label: 'All Alerts',   count: interventionAlerts.length },
    { id: 'HIGH',      label: 'High',         count: interventionAlerts.filter(a => a.severity === 'HIGH' && !a.resolved).length },
    { id: 'MEDIUM',    label: 'Medium',       count: interventionAlerts.filter(a => a.severity === 'MEDIUM' && !a.resolved).length },
    { id: 'LOW',       label: 'Low',          count: interventionAlerts.filter(a => a.severity === 'LOW'   && !a.resolved).length },
    { id: 'resolved',  label: 'Resolved',     count: interventionAlerts.filter(a => a.resolved).length },
  ];

  const clusters = useMemo(
    () => getAggregatedAlerts(
      interventionAlerts.filter(a =>
        !search.trim() ||
        (a.studentName || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.subject || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.description || '').toLowerCase().includes(search.toLowerCase())
      )
    ),
    [interventionAlerts, search, getAggregatedAlerts]
  );

  const unresolved = useMemo(() => clusters.filter(c => !c.allResolved), [clusters]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Intervention Management</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {unresolved.length} unresolved cluster{unresolved.length !== 1 ? 's' : ''} · {interventionAlerts.length} total alerts
              </p>
            </div>
            <button onClick={refreshInterventionAlerts}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm">
              <Send size={14} /> Refresh
            </button>
          </div>

          {/* Progress bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Resolution Progress</span>
              <span className="text-[10px] font-bold text-gray-600">
                {interventionAlerts.filter(a => a.resolved).length} / {interventionAlerts.length} resolved
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{
                  width: `${interventionAlerts.length > 0
                    ? Math.round(interventionAlerts.filter(a => a.resolved).length / interventionAlerts.length * 100)
                    : 0}%`
                }}
              />
            </div>
          </div>

          {/* Tabs + search */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-1 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAlertFilter(tab.id)}
                  className={cn(
                    'px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider',
                    alertFilter === tab.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {tab.label}
                  <span className={cn('ml-1.5', alertFilter === tab.id ? 'text-emerald-200' : 'text-gray-400')}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative">
              <AlertTriangle size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student name, subject, or description…"
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Cluster list */}
          <InterventionAlertCluster />

          {clusters.length === 0 && (
            <EmptyState
              icon={CheckCircle2}
              title="No alerts found"
              description={search ? 'No alerts match your search.' : 'All alerts are resolved or none exist.'}
            />
          )}

        </div>
      </div>
    </div>
  );
}
