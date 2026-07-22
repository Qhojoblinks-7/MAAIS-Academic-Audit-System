import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, TrendingUp, Users, BookOpen, Award, Loader2, Inbox } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useDepartment } from '../../../lib/hooks';
import { useActiveYear } from '../../../lib/hooks';
import { useAnalyticsPulse } from '../../../lib/hooks';
import { commsApi } from '../../../lib/api/comms';

const FORM_LEVELS = [
  { value: 'FORM_1', label: 'Form 1', shortLabel: 'F1' },
  { value: 'FORM_2', label: 'Form 2', shortLabel: 'F2' },
  { value: 'FORM_3', label: 'Form 3', shortLabel: 'F3' },
];

export function DepartmentGradingSheet({ dept }) {
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = React.useState('FORM_1');

  const deptQuery = useDepartment(dept?.id);
  const { data: activeYearData } = useActiveYear();
  const activeTerm = activeYearData?.terms?.find((t) => t.isActive);

  const { data: pulseData, isLoading: pulseLoading } = useAnalyticsPulse({
    academicYearId: activeYearData?.id,
    termId: activeTerm?.id,
    level: activeForm,
  });

  if (!dept) return null;

  const deptSubjects = deptQuery.data?.subjects || [];
  const subjectPerformanceMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(pulseData?.subjectPerformance)) {
      pulseData.subjectPerformance.forEach((sp) => {
        map.set(sp.subjectId, sp);
      });
    }
    return map;
  }, [pulseData]);

  const rows = useMemo(() => {
    if (!deptSubjects.length) return [];
    return deptSubjects
      .map((subject) => {
        const perf = subjectPerformanceMap.get(subject.id);
        const avgScore = perf?.averageScore ? parseFloat(perf.averageScore) : null;
        const studentCount = perf?.studentCount || 0;

        let passRate = null;
        if (avgScore !== null && avgScore > 0) {
          const passThreshold = 45;
          const passCount = Math.round(studentCount * Math.min(1, avgScore / 100));
          passRate = studentCount > 0 ? Math.round((passCount / studentCount) * 100) : 0;
        }

        return {
          id: subject.id,
          subject: subject.name,
          code: subject.code,
          studentCount,
          classAverage: avgScore,
          passRate,
          hasData: perf != null,
        };
      })
      .sort((a, b) => b.hasData - a.hasData || a.subject.localeCompare(b.subject));
  }, [deptSubjects, subjectPerformanceMap]);

  const deptAvg = useMemo(() => {
    const valid = rows.filter((r) => r.classAverage !== null);
    if (!valid.length) return null;
    const sum = valid.reduce((acc, r) => acc + r.classAverage, 0);
    return (sum / valid.length).toFixed(1);
  }, [rows]);

  const deptPassRate = useMemo(() => {
    const valid = rows.filter((r) => r.passRate !== null);
    if (!valid.length) return null;
    const sum = valid.reduce((acc, r) => acc + r.passRate, 0);
    return Math.round(sum / valid.length);
  }, [rows]);

  function getAvgColor(avg) {
    if (avg === null) return 'text-muted-foreground';
    if (avg >= 70) return 'text-success';
    if (avg >= 50) return 'text-warning';
    return 'text-destructive';
  }

  function getPassColor(passRate) {
    if (passRate === null) return 'text-muted-foreground';
    if (passRate >= 70) return 'text-success';
    if (passRate >= 50) return 'text-warning';
    return 'text-destructive';
  }

  return (
    <div className="space-y-4 w-full">
      {/* Form Level Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 p-1 bg-muted/40 rounded-xl w-fit">
          {FORM_LEVELS.map((form) => (
            <button
              key={form.value}
              onClick={() => { setActiveForm(form.value); setExpandedSubject(null); }}
              className={cn(
                'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer',
                activeForm === form.value
                  ? 'bg-brand-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              {form.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {deptAvg !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg">
              <TrendingUp size={12} className="text-brand-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Dept Avg</span>
              <span className="text-xs font-black font-mono text-foreground">{deptAvg}%</span>
            </div>
          )}
          {deptPassRate !== null && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg">
              <Award size={12} className="text-success" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Pass</span>
              <span className="text-xs font-black font-mono text-foreground">{deptPassRate}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Grading Table */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        {deptQuery.isLoading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest">Loading department data...</span>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox size={28} className="text-muted-foreground/50 mb-3" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No subjects registered</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">This department has no subjects assigned yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Subject</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center">Form</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center">Students</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center">Average</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center">Pass Rate</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => navigate(`/grading?subject=${encodeURIComponent(row.subject)}`)}
                    className="group hover:bg-muted/20 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-brand-primary/10 rounded-lg flex items-center justify-center text-brand-primary shrink-0">
                          <BookOpen size={13} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{row.subject}</p>
                          {row.code && (
                            <p className="text-[9px] font-mono text-muted-foreground">{row.code}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                        {FORM_LEVELS.find((f) => f.value === activeForm)?.shortLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.hasData ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground">
                          <Users size={10} className="text-muted-foreground" />
                          {row.studentCount}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.hasData && row.classAverage !== null ? (
                        <span className={cn('text-xs font-black font-mono', getAvgColor(row.classAverage))}>
                          {row.classAverage.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.hasData && row.passRate !== null ? (
                        <span className={cn('text-xs font-black font-mono', getPassColor(row.passRate))}>
                          {row.passRate}%
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.hasData ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-success bg-success/10 px-2 py-0.5 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-success" />
                          Recorded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-muted-foreground/60 bg-muted/40 px-2 py-0.5 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                          No Data
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DepartmentGradingSheet;
