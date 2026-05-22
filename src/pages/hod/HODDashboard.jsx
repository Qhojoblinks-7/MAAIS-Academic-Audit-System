import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertCircle, Users, ShieldCheck, TrendingUp,
  BarChart3, CheckCircle2, Clock, RefreshCw,
  ChevronRight, FileText, AlertTriangle, GraduationCap,
  MessageSquare, ArrowUpRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { SubmissionProgressSparkline, StatusBadge, JustificationQualityIndicator } from '../../components/molecules';
import { AuditLogTimeline, TeacherSubmissionMatrix, InterventionAlertCluster } from '../../components/organisms';
import { SkeletonLoader, SkeletonText, SkeletonCard, SkeletonTableRow } from '../../components/molecules/SkeletonLoader';

const STAGGER = {
  container: { initial: "hidden", animate: "show", variants: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } } },
  item:    { initial: { opacity: 0, y: 14 },       animate: { opacity: 1, y: 0 }, transition: { duration: 0.28, ease: 'easeOut' } },
};

function KpiCard({ icon: Icon, label, value, subValue, color = 'emerald', trend }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    rose:    'bg-rose-50    text-rose-600',
    blue:    'bg-blue-50    text-blue-600',
    amber:   'bg-amber-50   text-amber-600',
    gray:    'bg-gray-50    text-gray-600',
    purple:  'bg-purple-50  text-purple-600',
  };
  return (
    <motion.div variants={STAGGER.item}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors[color])}>
          <Icon size={20} />
        </div>
        {trend && (
          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full",
            trend.positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">{label}</p>
      {subValue && <p className="text-[11px] text-gray-400 mt-1">{subValue}</p>}
    </motion.div>
  );
}

function QuickAction({ to, icon: Icon, label, color = 'emerald' }) {
  const colors = {
    emerald: 'bg-emerald-50  text-emerald-600  hover:bg-emerald-100',
    blue:    'bg-blue-50     text-blue-600     hover:bg-blue-100',
    purple:  'bg-purple-50   text-purple-600   hover:bg-purple-100',
    amber:   'bg-amber-50    text-amber-600    hover:bg-amber-100',
    rose:    'bg-rose-50     text-rose-600     hover:bg-rose-100',
    gray:    'bg-gray-50     text-gray-600     hover:bg-gray-100',
  };
  return (
    <Link to={to}
      className={cn("p-3 rounded-2xl transition-all flex items-center gap-2.5", colors[color])}>
      <Icon size={18} />
      <span className="text-xs font-semibold text-gray-800">{label}</span>
      <ChevronRight size={13} className="ml-auto text-gray-400" />
    </Link>
  );
}

export function HODDashboard() {
  const {
    auditLogs, interventionAlerts, teacherSubmissions,
    unresolvedAlerts, atRiskStudentCount, submissionPct,
    totalAlerts, isLoading, error,
    refreshAll, departmentProgress,
  } = useHOD();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { refreshAll(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const lockedClasses  = useMemo(() => departmentProgress.filter(c => c.status === 'LOCKED').length, [departmentProgress]);
  const totalClasses   = useMemo(() => departmentProgress.length,                                 [departmentProgress]);
  const shortJusts     = useMemo(() => auditLogs.filter(l => (l.justification || '').trim().length < 10).length, [auditLogs]);
  const recentLogs     = useMemo(() => auditLogs.slice(0, 4), [auditLogs]);

  const topTeachers    = useMemo(() => [...teacherSubmissions].sort((a,b) => (b.progress||0)-(a.progress||0)).slice(0, 4), [teacherSubmissions]);
  const atRiskTeachers = useMemo(() => teacherSubmissions.filter(t => (t.progress||0) < 70),                    [teacherSubmissions]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      {/* Page header */}
      <div className="px-6 lg:px-8 pt-6 pb-2">
        <div className="max-w-7xl mx-auto flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Department Overview</h1>
            <p className="text-sm text-gray-500 mt-0.5">Academic Audit &amp; Oversight — live snapshot</p>
          </div>
          <button onClick={handleRefresh} disabled={refreshing || isLoading}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ── KPI Grid ── */}
          <motion.div variants={STAGGER.container} initial="hidden" animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={AlertCircle}     label="Intervention Alerts"   value={unresolvedAlerts}  color="rose"
              trend={{ positive: unresolvedAlerts < 5, value: `${unresolvedAlerts < 5 ? 'Low' : 'Elevated'}` }}
              subValue={`${totalAlerts} total • at-risk students`} />
            <KpiCard
              icon={Users}           label="At-Risk Students"      value={atRiskStudentCount} color="purple"
              subValue="Need HOD review" />
            <KpiCard
              icon={ShieldCheck}     label="Classes Locked"        value={`${lockedClasses}/${totalClasses}`} color="emerald"
              subValue={`${Math.round(100 * lockedClasses / Math.max(totalClasses, 1))}% locked`} />
            <KpiCard
              icon={TrendingUp}      label="Teacher Submission %"  value={`${Math.round(submissionPct)}%`}  color="amber"
              trend={{ positive: submissionPct > 80, value: `${teacherSubmissions.length} teachers` }}
              subValue={`${atRiskTeachers.length} at-risk`} />
          </motion.div>

          {/* ── KPI row 2: short justifications and total logs ── */}
          <motion.div variants={STAGGER.container} initial="hidden" animate="show"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              icon={AlertTriangle}   label="Short Justifications"            value={shortJusts}          color="amber"
              subValue="HOD-AR-2.2: below 10-character minimum" />
            <KpiCard
              icon={FileText}       label="Total Audit Logs"                 value={auditLogs.length}     color="blue"
              subValue="Recent edits captured" />
            <KpiCard
              icon={GraduationCap}  label="Dept. Teachers"                  value={teacherSubmissions.length} color="purple"
              subValue="In submission feed" />
          </motion.div>

          {/* ── Quick Actions ── */}
          <motion.div variants={STAGGER.container} initial="hidden" animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <QuickAction to="/hod/audit"         icon={FileText}     label="Audit Logs"     color="blue"    />
            <QuickAction to="/hod/interventions" icon={AlertCircle}  label="Interventions"  color="rose"    />
            <QuickAction to="/hod/review"        icon={CheckCircle2} label="Grade Review"   color="emerald" />
            <QuickAction to="/hod/lock-export"   icon={ShieldCheck}  label="Lock &amp; Export" color="purple" />
            <QuickAction to="/hod/teachers"      icon={Users}        label="Teacher Mgmt"  color="amber"  />
            <QuickAction to="/hod/analytics"     icon={BarChart3}    label="Analytics"     color="gray"   />
          </motion.div>

          {/* ── Intervention Alerts + Audit Feed ── */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Intervention Alerts */}
            <motion.div variants={STAGGER.item} initial="hidden" animate="show"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
                    <AlertCircle size={16} className="text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Interventions</h2>
                    <p className="text-[10px] text-gray-500">{unresolvedAlerts} active</p>
                  </div>
                </div>
                <Link to="/hod/interventions" className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5">
                  View all <ChevronRight size={12} />
                </Link>
              </div>
              <div className="p-2 max-h-[22rem] overflow-y-auto">
                {interventionAlerts.length === 0 ? (
                  <div className="p-6 text-center">
                    <CheckCircle2 size={36} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No active alerts</p>
                  </div>
                ) : (
                  <InterventionAlertCluster
                    alerts={interventionAlerts.slice(0, 6)}
                    className="!space-y-2"
                  />
                )}
              </div>
            </motion.div>

            {/* Recent Audit Activity */}
            <motion.div variants={STAGGER.item} initial="hidden" animate="show"
              className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Clock size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Recent Audit Activity</h2>
                    <p className="text-[10px] text-gray-500">{auditLogs.length} entries captured</p>
                  </div>
                </div>
                <Link to="/hod/audit" className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5">
                  Full audit <ChevronRight size={12} />
                </Link>
              </div>

              <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                {error && (
                  <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl text-xs text-amber-800">{error}</div>
                )}

                {auditLogs.length === 0 ? (
                  <div className="p-6 text-center">
                    <BarChart3 size={36} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No audit logs yet</p>
                  </div>
                ) : (
                  recentLogs.map((log, i) => (
                    <motion.div key={log.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        log.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' :
                        log.status === 'FLAGGED'  ? 'bg-rose-50   text-rose-600'  :
                        log.status === 'LOCKED'   ? 'bg-gray-50   text-gray-600'   :
                                                        'bg-amber-50  text-amber-600'
                      )}>
                        {log.status === 'RESOLVED' ? <CheckCircle2 size={14} /> :
                         log.status === 'FLAGGED'  ? <AlertTriangle  size={14} /> :
                         log.status === 'LOCKED'   ? <ShieldCheck size={14} />     : <Clock size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-gray-900 truncate">{log.action || 'Unknown action'}</span>
                          <StatusBadge status={log.status || 'UNKNOWN'} />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {log.teacherName || 'Unknown teacher'} · {(log.timestamp || '').split('T')[0] || '—'}
                        </p>
                        {log.justification && log.justification.length < 10 && (
                          <div className="mt-1">
                            <JustificationQualityIndicator text={log.justification} />
                          </div>
                        )}
                        {log.hodComment && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-lg px-2 py-1">
                            <MessageSquare size={10} /> HOD comment added
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* ── Teacher Submissions ── */}
          <motion.div variants={STAGGER.item} initial="hidden" animate="show"
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Users size={16} className="text-amber-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Teacher Submissions</h2>
                  <p className="text-[10px] text-gray-500">{teacherSubmissions.length} teachers · {Math.round(submissionPct)}% avg</p>
                </div>
              </div>
              <Link to="/hod/teachers" className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5">
                All teachers <ChevronRight size={12} />
              </Link>
            </div>
            <div className="p-3 divide-y divide-gray-50 max-h-72 overflow-y-auto">
              {topTeachers.length === 0 ? (
                <div className="p-6 text-center">
                  <GraduationCap size={32} className="text-gray-200 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No submission data</p>
                </div>
              ) : (
                topTeachers.map((teacher, i) => {
                  const pct = teacher.progress || 0;
                  const atRisk = pct < 70;
                  return (
                    <div key={teacher.id || i} className="flex items-center gap-3 py-2.5 px-1">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold",
                        atRisk ? "bg-rose-100 text-rose-700" : "bg-emerald-50 text-emerald-700"
                      )}>
                        {(teacher.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-gray-900 truncate">{teacher.name || '—'}</p>
                          {atRisk && <span className="text-[9px] font-bold uppercase tracking-widest text-rose-700">At risk</span>}
                        </div>
                        <SubmissionProgressSparkline value={pct} size="sm" />
                      </div>
                      <Link to="/hod/teachers"
                        className={cn(
                          "text-[10px] font-medium px-2 py-0.5 rounded-lg",
                          atRisk ? "text-rose-600 hover:bg-rose-50" : "text-gray-500 hover:bg-gray-50"
                        )}>
                        {pct}%
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
