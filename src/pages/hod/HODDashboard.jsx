import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, AlertTriangle, Users, ClipboardList,
  Lock, Download, Zap, Award, CheckCircle2, Clock, AlertCircle,
  AlertOctagon, Stethoscope, MessageSquare, Save, BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHOD } from '../../context/HODContext';
import { cn } from '../../lib/utils';

/* ─── Phase 8.1 — Short Justification Badge ──────────────────────────── */
function ShortJustifBadge({ justification }) {
  if (!justification) return null;
  const isShort = justification.trim().length < 10;
  if (!isShort) return null;
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-wider border border-rose-200">
      <AlertOctagon size={10} />
      HOD-AR-2.2 Short
    </span>
  );
}

/* ─── Phase 9.2 — Severity sort + cluster summary helpers ─────────────── */
function sortBySeverity(alerts) {
  const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return [...alerts].sort((a, b) => (order[a.severity || 'LOW'] ?? 9) - (order[b.severity || 'LOW'] ?? 9));
}

export function HODDashboard() {
  const navigate = useNavigate();
  const {
    auditLogs,
    setAuditLogs,
    auditFilter,
    setAuditFilter,
    interventionAlerts,
    alertFilter,
    setAlertFilter,
    isLoading,
    isExporting,
    resolveAlert,
    hasShortJustification,
    addAlertNote,
    teacherSubmissions,
    submissionPct,
    refreshTeacherSubmissions,
    refreshAuditLogs,
    refreshInterventionAlerts,
    refreshDepartmentProgress,
    refreshAll,
    lockedTerms,
    refreshLockedTerms,
    // Phase 9
    getAggregatedAlerts,
    alertClusterCount,
  } = useHOD();

  /* Phase 9.1 — counseling note entry per alert */
  const [expandedNote, setExpandedNote] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const filteredAuditLogs = auditFilter === 'all'
    ? auditLogs
    : auditLogs.filter(
        (log) =>
          log.status === auditFilter ||
          log.action?.toUpperCase().includes(auditFilter.toUpperCase()),
      );

  // Phase 9.2: sort alerts by severity within the current filter
  const filteredAlertsRaw = alertFilter === 'all'
    ? interventionAlerts
    : interventionAlerts.filter((a) =>
        alertFilter === 'resolved' ? a.resolved : a.severity?.toUpperCase() === alertFilter.toUpperCase(),
      );
  const filteredAlerts = useMemo(() => sortBySeverity(filteredAlertsRaw), [filteredAlertsRaw]);

  // Phase 9.2: aggregated (student-keyed) alert clusters
  const aggregatedAlerts = getAggregatedAlerts(interventionAlerts);
  const unresolvedClusters = aggregatedAlerts.filter((g) => !g.allResolved).length;

  const severityColors = {
    HIGH: 'bg-red-50 text-red-700 border border-red-100',
    MEDIUM: 'bg-amber-50 text-amber-700 border border-amber-100',
    LOW: 'bg-blue-50 text-blue-700 border border-blue-100',
  };

  const statusColors = {
    RESOLVED: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    LOCKED: 'bg-blue-50 text-blue-700 border border-blue-100',
    DRAFT: 'bg-slate-100 text-slate-600',
    FLAGGED: 'bg-amber-50 text-amber-700 border border-amber-100',
  };

  /* ─── Phase 9.1 handlers ─────────────────────────────────────────── */
  const handleToggleNote = useCallback((alertId, existingNote) => {
    setExpandedNote((prev) => (prev === alertId ? null : alertId));
    setNoteDraft(existingNote || '');
  }, []);

  const handleSaveNote = useCallback((alertId) => {
    if (!noteDraft.trim()) return;
    addAlertNote(alertId, noteDraft.trim());
    setExpandedNote(null);
    setNoteDraft('');
  }, [noteDraft, addAlertNote]);

  /* ─── Phase 8.2 — submission progress per teacher ─────────────────── */
  const teacherProgress = useMemo(() => {
    const map = new Map();
    teacherSubmissions.forEach((s) => {
      const t = s.teacherName || s.teacherId || '—';
      if (!map.has(t)) map.set(t, { teacherName: t, total: 0, graded: 0, classes: 0, pctSum: 0, subjects: new Set() });
      const entry = map.get(t);
      entry.total += s.studentCount || 0;
      entry.graded += s.gradedCount || 0;
      entry.subjects.add(s.subjectName || s.subject || '—');
      entry.classes = entry.subjects.size;
    });
    const list = Array.from(map.values()).map((e) => ({
      ...e,
      pct: e.total > 0 ? Math.round((e.graded / e.total) * 100) : 0,
    }));
    list.sort((a, b) => a.pct - b.pct);
    return list;
  }, [teacherSubmissions]);

  const atRiskTeachers = teacherProgress.filter((t) => t.pct < 80 && t.total > 0);

  return (
    <div className="w-full min-h-screen bg-slate-50/50 p-6 lg:p-10 text-slate-900 font-sans overflow-y-auto">
      <div className="max-w-7xl w-full mx-auto flex flex-col space-y-8">

        {/* ── Top Header Section ───────────────────────────────────── */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-200/60 pb-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">HOD Dashboard</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide mt-0.5">Audit oversight &amp; intervention management</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:flex items-center gap-3">
            <button onClick={() => navigate('/grading')} className="px-4 py-2.5 bg-white text-slate-700 border border-slate-200 font-semibold rounded-lg hover:bg-slate-50 text-sm flex items-center justify-center gap-2"><ClipboardList size={16} /> Grade Submission</button>
            <button onClick={() => navigate('/certification')} className="px-4 py-2.5 bg-white text-slate-700 border border-slate-200 font-semibold rounded-lg hover:bg-slate-50 text-sm flex items-center justify-center gap-2"><Award size={16} /> Certification</button>
            <button onClick={() => navigate('/identity/students')} className="px-4 py-2.5 bg-white text-slate-700 border border-slate-200 font-semibold rounded-lg hover:bg-slate-50 text-sm flex items-center justify-center gap-2"><Users size={16} /> Registry</button>
            <button disabled={isExporting} className="col-span-2 sm:col-span-1 px-4 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 text-sm flex items-center justify-center gap-2 shadow-sm">{isExporting ? <Zap size={16} className="animate-spin" /> : <Download size={16} />} Export</button>
          </div>
        </header>

        {/* ── Stats Grid (Phase 9.2: alertClusterCount instead of total) ─ */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Audit Log Items</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{filteredAuditLogs.length}</p>
            </div>
            <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100"><ClipboardList size={18} className="text-slate-600" /></div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Alert Clusters</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{alertClusterCount}</p>
            </div>
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100"><AlertTriangle size={18} className="text-amber-600" /></div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unresolved Clusters</p>
              <p className="text-2xl font-bold text-red-600 tracking-tight">{unresolvedClusters}</p>
            </div>
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center border border-red-100"><AlertOctagon size={18} className="text-red-600" /></div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Locked Terms</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{lockedTerms.length}</p>
            </div>
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100"><Lock size={18} className="text-blue-600" /></div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">At-Risk Students</p>
              <p className="text-2xl font-bold text-red-600 tracking-tight">{interventionAlerts.filter((a) => !a.resolved).length}</p>
            </div>
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center border border-red-100"><Users size={18} className="text-red-600" /></div>
          </div>
        </section>

        {/* ── Phase 8.2: Teacher Submission Progress ─────────────────── */}
        {teacherSubmissions.length > 0 && (
          <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 shrink-0 bg-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-600" />
                  Submission Progress by Teacher
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Real submission counts from API — sort will sort ascending (lowest first)</p>
              </div>
              <button
                onClick={refreshTeacherSubmissions}
                className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {teacherProgress.map((t, i) => {
                const low = t.pct < 80;
                const fillColor = low ? 'bg-red-500' : t.pct < 95 ? 'bg-amber-400' : 'bg-emerald-500';
                return (
                  <motion.div
                    key={`${t.teacherName || t.teacherId}-${i}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-4 flex items-center gap-5 hover:bg-slate-50/50 transition-all"
                  >
                    <div className="w-36 min-w-[144px] shrink-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{t.teacherName}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{t.subjects} subject{t.subjects > 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-slate-500">
                          {t.graded}/{t.total} graded
                        </span>
                        <span className={cn(
                          "text-[10px] font-black",
                          low ? 'text-red-600' : 'text-emerald-700',
                        )}>
                          {t.pct}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", fillColor)}
                          style={{ width: `${Math.min(100, Math.max(0, t.pct))}%` }}
                        />
                      </div>
                    </div>
                    {low && <span className="text-[9px] font-black text-red-500 uppercase tracking-wider shrink-0">⚠ At-Risk</span>}
                  </motion.div>
                );
              })}
            </div>
            {atRiskTeachers.length > 0 && (
              <div className="px-5 py-3 bg-red-50/50 border-t border-red-100 flex items-center gap-2">
                <AlertOctagon size={14} className="text-red-500 shrink-0" />
                <span className="text-[10px] font-bold text-red-700">
                  {atRiskTeachers.length} teacher{atRiskTeachers.length > 1 ? 's have' : ' has'} below 80% completion
                </span>
              </div>
            )}
          </section>
        )}

        {/* ── Main Panels ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-10">

          {/* ── Left: Audit Trail (Phase 8.1 highlighted short-justif) ── */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm lg:col-span-7 flex flex-col overflow-hidden h-[450px] lg:h-[calc(100vh-400px)] min-h-[400px]">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-white">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Audit Trail</h2>
                <p className="text-xs text-slate-500">Historical trace of system adjustments</p>
              </div>
              <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200/60 self-start sm:self-center">
                {['all', 'RESOLVED', 'FLAGGED'].map((tab) => (
                  <button key={tab} onClick={() => setAuditFilter(tab)} className={cn("px-2.5 py-1 rounded-md text-xs font-semibold capitalize transition-all", auditFilter === tab ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800")}>{tab.toLowerCase()}</button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-0 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {filteredAuditLogs.map((log, i) => {
                  const shortJ = hasShortJustification(log.justification);
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className={cn(
                        "p-5 hover:bg-slate-50/50 transition-all flex gap-4 items-start justify-between",
                        shortJ && "bg-rose-50/30 border-l-2 border-l-rose-300"
                      )}
                    >
                      <div className="flex gap-3.5 items-start">
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5", log.status === 'RESOLVED' ? "bg-emerald-50 text-emerald-600" : log.status === 'FLAGGED' ? "bg-amber-50 text-amber-600" : log.status === 'LOCKED' ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500")}>
                          {log.status === 'RESOLVED' && <CheckCircle2 size={16} />}
                          {log.status === 'FLAGGED' && <AlertCircle size={16} />}
                          {log.status === 'LOCKED' && <Lock size={16} />}
                          {log.status === 'DRAFT' && <Clock size={16} />}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-slate-900 leading-tight">{log.action} — <span className="text-slate-600 font-normal">{log.target}</span></p>
                            <ShortJustifBadge justification={log.justification} />
                          </div>
                          <p className="text-xs font-medium text-slate-400">{log.user} • {log.time}</p>
                          {log.oldValue && log.newValue && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded text-[11px] font-mono text-slate-600 border border-slate-200/50 mt-1">
                              <span>{log.oldValue}</span><span className="text-slate-400">→</span><span className="font-bold text-slate-800">{log.newValue}</span>
                            </div>
                          )}
                          {log.justification && (
                            <p className={cn("text-xs italic mt-1.5 pl-2 border-l-2", shortJ ? "text-rose-500 border-rose-300 font-bold" : "text-slate-500 border-slate-200")}>
                              {log.justification}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 tracking-wide", statusColors[log.status] || "bg-slate-100 text-slate-600")}>{log.status}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {isLoading && (
                <div className="p-8 text-center text-sm text-slate-400">Loading audit logs…</div>
              )}
              {!isLoading && filteredAuditLogs.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">No audit logs found.
                  <button onClick={refreshAuditLogs} className="ml-2 underline text-slate-600">Retry</button>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Intervention Alerts (Phase 9.1 counseling notes, 9.2 cluster count) ── */}
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
                  const existingNote = null; // persisted via addAlertNote context action
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
                            onClick={() => handleToggleNote(alert.id, null)}
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

                      {/* Phase 9.1 — Counseling note composer */}
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
                                Counseling Action Note (Phase 9.1)
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
                            <button onClick={() => resolveAlert(alert.id)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md shadow-xs transition-all">Mark Resolved</button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {interventionAlerts.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">No active alerts.
                  <button onClick={refreshInterventionAlerts} className="ml-2 underline text-slate-600">Retry</button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
