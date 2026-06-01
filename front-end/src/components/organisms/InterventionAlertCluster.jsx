import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, MessageSquare, Save, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';

export function InterventionAlertCluster({ onAddNote, onResolve }) {
  const { interventionAlerts, alertFilter, setAlertFilter, getAggregatedAlerts, addAlertNote, resolveAlert } = useHOD();
  const [expandedNote, setExpandedNote] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');

  const filteredAlertsRaw = alertFilter === 'all'
    ? interventionAlerts
    : interventionAlerts.filter((a) =>
        alertFilter === 'resolved' ? a.resolved : a.severity?.toUpperCase() === alertFilter.toUpperCase(),
      );
  
  const filteredAlerts = [...filteredAlertsRaw].sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return (order[a.severity || 'LOW'] ?? 9) - (order[b.severity || 'LOW'] ?? 9);
  });

  const aggregatedAlerts = getAggregatedAlerts(interventionAlerts);
  const unresolvedClusters = aggregatedAlerts.filter((g) => !g.allResolved).length;

  const severityColors = {
    HIGH: 'bg-red-50 text-red-700 border border-red-100',
    MEDIUM: 'bg-amber-50 text-amber-700 border border-amber-100',
    LOW: 'bg-blue-50 text-blue-700 border border-blue-100',
  };

  const handleToggleNote = useCallback((alertId) => {
    setExpandedNote((prev) => (prev === alertId ? null : alertId));
    setNoteDraft('');
  }, []);

  const handleSaveNote = useCallback((alertId) => {
    if (!noteDraft.trim()) return;
    if (addAlertNote) addAlertNote(alertId, noteDraft.trim());
    setExpandedNote(null);
    setNoteDraft('');
  }, [noteDraft, addAlertNote]);

  const handleResolve = useCallback((alertId) => {
    if (resolveAlert) resolveAlert(alertId);
    if (onResolve) onResolve(alertId);
  }, [resolveAlert, onResolve]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm lg:col-span-5 flex flex-col overflow-hidden h-[450px] lg:h-[calc(100vh-400px)] min-h-[400px]">
      <div className="p-5 border-b border-slate-100 space-y-4 shrink-0 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Intervention Alerts</h2>
            <p className="text-xs text-slate-500">System generated academic risk markers</p>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
            {unresolvedClusters} unresolved cluster{unresolvedClusters !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['all', 'HIGH', 'MEDIUM', 'resolved'].map((filter) => (
            <button key={filter} onClick={() => setAlertFilter(filter)} className={cn("px-2.5 py-1 rounded-md text-xs font-medium border transition-all capitalize", alertFilter === filter ? "bg-slate-900 border-slate-900 text-white shadow-xs" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50")}>{filter}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-0 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredAlerts.map((alert, i) => {
            const isExpanded = expandedNote === alert.id;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                className={cn("p-5 space-y-3 transition-colors", alert.resolved ? "bg-slate-50/40" : "bg-white", isExpanded && "bg-slate-50")}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900">{alert.studentName}</h3>
                    <p className="text-xs text-slate-400 font-medium">ID: {alert.studentIndex} • <span className="text-slate-600 font-semibold">{alert.subject}</span></p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide", severityColors[alert.severity] || "bg-slate-100 text-slate-600")}>{alert.severity}</span>
                    <button
                      onClick={() => handleToggleNote(alert.id)}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        isExpanded ? "bg-emerald-50 text-emerald-700" : "hover:bg-slate-100 text-slate-400"
                      )}
                      title="Add counseling note"
                    >
                      <Stethoscope size={14} />
                    </button>
                  </div>
                </div>

                <p className="p-3 bg-slate-50 rounded-lg border border-slate-200/40 text-xs font-medium text-slate-600">{alert.reason}</p>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2">
                        <label className="block text-[9px] font-black text-emerald-700 uppercase tracking-widest">
                          <MessageSquare size={10} className="inline mr-1" />
                          Counseling Action Note
                        </label>
                        <textarea
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          rows={2}
                          placeholder="Record counseling action taken, student response, next steps…"
                          className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs text-slate-900 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setExpandedNote(null); setNoteDraft(''); }}
                            className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600 px-3 py-1"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNote(alert.id)}
                            disabled={!noteDraft.trim()}
                            className={cn(
                              "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5",
                              noteDraft.trim()
                                ? 'bg-emerald-900 text-white hover:bg-black'
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            )}
                          >
                            <Save size={11} />
                            Save Note
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <span className="text-xs text-slate-400 font-medium">{alert.timestamp}</span>
                  <div className="flex items-center gap-2">
                    {alert.resolved ? (
                      <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold"><CheckCircle2 size={14} /> Resolved</div>
                    ) : (
                      <button onClick={() => handleResolve(alert.id)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md shadow-xs transition-all">Mark Resolved</button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {interventionAlerts.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-400">No active alerts.
            <button onClick={() => refreshInterventionAlerts?.()} className="ml-2 underline text-slate-600">Retry</button>
          </div>
        )}
      </div>
    </div>
  );
}
