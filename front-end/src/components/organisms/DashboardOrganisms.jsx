import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RefreshCw } from 'lucide-react';
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
    const list = teacherSubmissions.map((s) => ({
      teacherName: s.name || s.teacherId || '—',
      teacherId: s.teacherId,
      progress: s.progress ?? 0,
      status: s.status || 'PENDING',
      email: s.email || '',
    }));
    list.sort((a, b) => a.progress - b.progress);
    return list;
  }, [teacherSubmissions]);

  const atRiskTeachers = teacherProgress.filter((t) => t.progress < 80 && t.progress > 0);

  const handleRefresh = useCallback(() => {
    if (refreshTeacherSubmissions) refreshTeacherSubmissions();
    if (onRefresh) onRefresh();
  }, [refreshTeacherSubmissions, onRefresh]);

  if (teacherSubmissions.length === 0) return null;

  return (
    <section className="hod-table-card">
      <div className="hod-card-header">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BookOpen size={18} className="text-brand-primary" />
            Submission Progress by Teacher
          </h2>
        </div>
        <button
          onClick={handleRefresh}
          className="hod-btn-reset uppercase tracking-widest"
        >
          Refresh
        </button>
      </div>
      <div className="divide-y divide-border">
        {teacherProgress.map((t, i) => {
          const barColor = t.progress >= 80
            ? 'var(--color-success)'
            : t.progress >= 40
              ? 'var(--color-warning)'
              : 'var(--color-danger)';
          return (
            <motion.div
              key={`${t.teacherId}-${i}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-4 flex items-center gap-5 hover:bg-muted/50 transition-all"
            >
              <div className="w-36 min-w-[144px] shrink-0">
                <p className="text-sm font-bold text-foreground truncate">{t.teacherName}</p>
                <p className="text-xs text-muted-foreground font-bold uppercase">{t.status.replace('_', ' ')}</p>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-muted-foreground">
                    {t.progress}% complete
                  </span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.max(0, t.progress))}%`, background: barColor }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
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
