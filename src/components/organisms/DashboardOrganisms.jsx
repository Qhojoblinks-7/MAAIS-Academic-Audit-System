import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RefreshCw, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';

// Animation variants for staggered children
const STAGGER = {
  container: { initial: "hidden", animate: "show", variants: { hidden: {}, show: { transition: { staggerChildren: 0.05 } } } },
  item: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, ease: 'easeOut' } },
};

export function TeacherSubmissionMatrix({ onRefresh }) {
  const { teacherSubmissions, refreshTeacherSubmissions } = useHOD();
  
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

  const handleRefresh = useCallback(() => {
    if (refreshTeacherSubmissions) refreshTeacherSubmissions();
    if (onRefresh) onRefresh();
  }, [refreshTeacherSubmissions, onRefresh]);

  if (teacherSubmissions.length === 0) return null;

  return (
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
          onClick={handleRefresh}
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
                  <span className={cn("text-[10px] font-black", low ? 'text-red-600' : 'text-emerald-700')}>
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
  );
}

export function KpiGrid({ children }) {
  return (
    <motion.div variants={STAGGER.container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 shrink-0">
      {children}
    </motion.div>
  );
}

export function KpiMetricCard({ icon: Icon, label, value, subValue, theme = 'light' }) {
  const isDark = theme === 'dark';
  return (
    <motion.div 
      variants={STAGGER.item}
      className={cn(
        "rounded-2xl p-5 border relative overflow-hidden flex flex-col justify-between h-[130px] transition-all hover:shadow-sm",
        isDark 
          ? "bg-gradient-to-br from-emerald-950 to-emerald-900 text-white border-emerald-800" 
          : "bg-white text-gray-900 border-gray-100"
      )}
    >
<div className="flex items-start justify-between">
          <span className={cn("text-[11px] font-bold tracking-wide", isDark ? "text-emerald-300" : "text-gray-500")}>
            {label}
          </span>
          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center border", 
            isDark ? "border-emerald-700 bg-emerald-800/50 text-white" : "border-gray-200 text-gray-400"
          )}>
            <Icon size={18} />
          </div>
        </div>
      <div>
        <h3 className="text-3xl font-bold tracking-tight mb-0.5">{value}</h3>
        <p className={cn("text-[11px] flex items-center gap-1 font-medium", isDark ? "text-emerald-400" : "text-gray-400")}>
          {isDark && <span className="inline-block w-3 h-2.5 bg-emerald-500/30 text-emerald-400 text-[8px] rounded px-0.5 text-center leading-none">↗</span>}
          {subValue}
        </p>
      </div>
    </motion.div>
  );
}
