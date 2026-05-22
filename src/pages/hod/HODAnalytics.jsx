import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, BarChart3,
  BookOpen, Users, Award, AlertCircle, Clock, RefreshCw,
  Calendar, ArrowUpRight, ArrowDownLeft, Target, Percent,
  GraduationCap, PieChart, Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { DateRangeFilter, EmptyState, StatusBadge } from '../../components/molecules';
import { GradeComparisonView } from '../../components/organisms';
import { ConfirmationDialog } from '../../components/molecules';

function MiniChartBar({ value, max = 100, color = 'emerald' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", `bg-${color}-500`)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-bold text-gray-600 w-7 text-right">{value ?? '—'}</span>
    </div>
  );
}

function StatBar({ label, value, total, color = 'emerald' }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[10px] font-medium text-gray-600">{label}</span>
        <span className="text-[10px] font-bold text-gray-800">{value} / {total}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", `bg-${color}-500`)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SubjectCard({ subject, expanded, onToggle }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={onToggle} className="w-full p-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600">
          <BookOpen size={16} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-semibold text-gray-900">{subject.name || subject.subjectId}</p>
          <p className="text-[10px] text-gray-500">{subject.teacherCount || 0} teachers · {subject.studentCount || 0} students</p>
        </div>
        {expanded ? <TrendingUp size={14} className="text-indigo-500" /> : <Minus size={14} className="text-gray-400" />}
      </button>
      {expanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
          <div className="px-3 pb-3 pl-[3.75rem] space-y-2 border-t border-gray-50">
            {subject.gradeDistribution ? (
              <div className="grid grid-cols-3 gap-2 py-2">
                {Object.entries(subject.gradeDistribution).map(([grade, count]) => (
                  <div key={grade} className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{grade}</p>
                    <p className="text-sm font-bold text-gray-800">{count}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-gray-400 text-center py-3">No grade distribution data</p>
            )}
            {subject.avgScore != null && (
              <div className="flex items-center gap-2 py-1 px-2 bg-gray-50 rounded-lg text-[10px] text-gray-700">
                <Target size={10} /> Class avg: <span className="font-bold">{subject.avgScore}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function HODAnalytics() {
  const {
    departmentProgress, promotionRecommendations, gradeComparison,
    fetchGradeComparison, refreshPromotionRecommendations,
    teacherSubmissions, isLoading,
  } = useHOD();

  const [dateRange, setDateRange] = useState('term');
  const [expandedSubject, setExpandedSubject] = useState(null);

  const subjects = useMemo(() => {
    const map = {};
    departmentProgress.forEach(cls => {
      const subject = cls.subject || 'General';
      if (!map[subject]) map[subject] = { name: subject, teacherCount: 0, studentCount: 0 };
      map[subject].teacherCount++;
      map[subject].studentCount += cls.studentCount || 0;
    });
    return Object.values(map);
  }, [departmentProgress]);

  const overallAvg = useMemo(() => {
    const scores = departmentProgress.map(c => c.submissionPct).filter(Boolean);
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }, [departmentProgress]);

  const above85  = departmentProgress.filter(c => (c.submissionPct || 0) >= 85).length;
  const between70And85 = departmentProgress.filter(c => {
    const p = c.submissionPct || 0; return p >= 70 && p < 85;
  }).length;
  const below70  = departmentProgress.filter(c => (c.submissionPct || 0) <  70).length;

  const recs = promotionRecommendations || [];
  const highRecs = recs.filter(r => r.recommendation === 'PROMOTE').length;
  const lowRecs  = recs.filter(r => r.recommendation === 'RETAIN').length;

  const STATS = [
    { label: 'Department Average',  value: `${overallAvg}%`,   icon: Percent,       color: 'emerald' },
    { label: 'Exceeding Target',    value: above85,             icon: TrendingUp,    color: 'emerald' },
    { label: 'On Track',            value: between70And85,      icon: Activity,      color: 'amber'   },
    { label: 'Below Target',        value: below70,             icon: TrendingDown,  color: 'rose'    },
    { label: 'Promotion Ready',     value: highRecs,            icon: Award,         color: 'blue'   },
    { label: 'At Risk / Retain',    value: lowRecs,             icon: AlertCircle,   color: 'rose'   },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics &amp; Reporting</h1>
              <p className="text-sm text-gray-500 mt-0.5">Grade trends · subject correlations · promotion recommendations</p>
            </div>
            <div className="flex items-center gap-2">
              <DateRangeFilter value={{ preset: dateRange }} onChange={({ preset }) => setDateRange(preset || dateRange)} />
              <button onClick={() => { refreshPromotionRecommendations(); }}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          {/* KPI stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {STATS.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2",
                  s.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                  s.color === 'rose'    ? 'bg-rose-50    text-rose-600'    :
                  s.color === 'amber'   ? 'bg-amber-50   text-amber-600'   :
                  s.color === 'blue'    ? 'bg-blue-50    text-blue-600'    :
                                                 'bg-gray-50    text-gray-600'
                )}>
                  <s.icon size={16} />
                </div>
                <p className="text-lg font-black text-gray-900">{s.value}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Submission distribution bars */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Submission Distribution</h2>
            <div className="space-y-3">
              <StatBar label="≥ 85% — Exceeding Target"   value={above85}          total={departmentProgress.length} color="emerald" />
              <StatBar label="70–84% — On Track"           value={between70And85}   total={departmentProgress.length} color="amber"   />
              <StatBar label="&lt; 70% — Below Target"     value={below70}          total={departmentProgress.length} color="rose"   />
            </div>
          </div>

          {/* Term comparison section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <Calendar size={16} className="text-emerald-600" />
              <h2 className="text-sm font-bold text-gray-900">Term Comparison</h2>
            </div>
            <div className="p-4">
              <GradeComparisonView
                subjects={subjects.slice(0, 4)}
                className=""
              />
            </div>
          </div>

          {/* Subject deep dive */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Subject Distribution</h2>
            <div className="space-y-2">
              {subjects.length === 0 ? (
                <EmptyState icon={BookOpen} title="No subject data" description="Department progress not loaded." />
              ) : subjects.map((s, i) => (
                <SubjectCard
                  key={s.name || i}
                  subject={s}
                  expanded={expandedSubject === (s.name || i)}
                  onToggle={() => setExpandedSubject(expandedSubject === (s.name || i) ? null : (s.name || i))}
                />
              ))}
            </div>
          </div>

          {/* Promotion recommendations */}
          {recs.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <Award size={16} className="text-indigo-600" />
                <h2 className="text-sm font-bold text-gray-900">Promotion Recommendations</h2>
                <span className="ml-auto px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">
                  {recs.length}
                </span>
              </div>
              <div className="p-3 space-y-1">
                {recs.map((rec, i) => {
                  const recColor = rec.recommendation === 'PROMOTE' ? 'emerald' : rec.recommendation === 'RETAIN' ? 'rose' : 'amber';
                  return (
                    <motion.div key={rec.studentId || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                        rec.recommendation === 'PROMOTE' ? 'bg-emerald-50 text-emerald-700' :
                        rec.recommendation === 'RETAIN'  ? 'bg-rose-50   text-rose-600'  : 'bg-amber-50 text-amber-700'
                      )}>
                        {(rec.studentName || '?').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{rec.studentName || 'Unknown'}</p>
                        <p className="text-[10px] text-gray-500">{rec.reason || '—'}</p>
                      </div>
                      <StatusBadge status={rec.recommendation || 'CONDITIONAL'} />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
