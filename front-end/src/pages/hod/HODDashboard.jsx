import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Percent, AlertTriangle, Users, ShieldCheck, RefreshCw, TrendingUp } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { useHOD } from '../../context/HODContext';
import { TeacherSubmissionMatrix } from '../../components/organisms/DashboardOrganisms';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function HODDashboard() {
  const { user } = useRole();
  const {
    departmentProgress = [],
    teacherSubmissions = [],
    interventionAlerts = [],
    refreshDepartmentProgress,
    refreshTeacherSubmissions,
    refreshSubmissionTrends,
    refreshInterventionAlerts,
    isLoading,
  } = useHOD();

  const [refreshDisabled, setRefreshDisabled] = useState(false);

  useEffect(() => {
    refreshDepartmentProgress();
    refreshTeacherSubmissions();
    refreshSubmissionTrends();
    refreshInterventionAlerts();
  }, []);

  const handleRefreshAll = async () => {
    setRefreshDisabled(true);
    await Promise.all([
      refreshDepartmentProgress(),
      refreshTeacherSubmissions(),
      refreshInterventionAlerts()
    ]);
    setTimeout(() => setRefreshDisabled(false), 1000);
  };

  const baseProgress = departmentProgress;
  const totalClasses = baseProgress.length;
  const avgProgress = baseProgress.length > 0
    ? Math.round(baseProgress.reduce((sum, c) => sum + (c.progress || c.submissionPct || 0), 0) / totalClasses)
    : 0;

  const unresolvedAlerts = interventionAlerts.filter(a => !a.resolved).length;
  const atRiskStudents = unresolvedAlerts;

  // ── Academic trend from intervention alerts ──────────────────────────────
  const scores = interventionAlerts
    .filter(a => a.currentScore != null && a.previousAverageScore != null)
    .map(a => ({ current: a.currentScore, previous: a.previousAverageScore }));

  const deptAvgScore = scores.length > 0
    ? Math.round(scores.reduce((s, r) => s + r.current, 0) / scores.length)
    : 0;
  const deptPrevAvg = scores.length > 0
    ? Math.round(scores.reduce((s, r) => s + r.previous, 0) / scores.length)
    : 0;
  const academicTrend = deptPrevAvg > 0 ? Math.round(((deptAvgScore - deptPrevAvg) / deptPrevAvg) * 100) : 0;

  const resolvedCount = interventionAlerts.filter(a => a.resolved).length;
  const resolutionRate = interventionAlerts.length > 0
    ? Math.round((resolvedCount / interventionAlerts.length) * 100)
    : 100;

  // Outer ring = dept average score (0-100 scale), Middle = resolution rate, Inner = academic trend (centered at 50)
  const analyticsMainPct = Math.min(100, Math.max(0, deptAvgScore));
  const analyticsMidPct = resolutionRate;
  const analyticsInnerPct = Math.min(100, Math.max(0, 50 + academicTrend));

  const teacherCompletion = teacherSubmissions.length > 0
    ? Math.round(teacherSubmissions.reduce((sum, s) => sum + (s.progress || 0), 0) / teacherSubmissions.length)
    : 0;

  return (
    <div className="hod-page no-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8"
      >
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight leading-none">
              Welcome back, <span className="text-brand-primary">{user?.name?.split(' ')[0] || 'HOD'}</span>!
            </h1>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-2 flex items-center gap-1.5">
              <ShieldCheck size={10} className="text-muted-foreground" />
              Department Oversight & Academic Integrity Console
            </p>
          </div>
          <Button
            onClick={handleRefreshAll}
            disabled={isLoading || refreshDisabled}
            variant="outline"
            size="sm"
            className="self-start sm:self-center"
          >
            <RefreshCw size={13} className={isLoading || refreshDisabled ? 'animate-spin' : ''} />
            Refresh Dashboard
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          <div className="lg:col-span-2 flex flex-col gap-8">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface p-4 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all relative flex items-center justify-between h-full">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform hover:scale-105 shrink-0 bg-primary/10 text-primary">
                    <BookOpen size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Department Classes</p>
                    <p className="text-xs font-medium text-text-secondary leading-tight">active tracks</p>
                  </div>
                </div>
                <div className="text-right pl-4 shrink-0">
                  <p className="text-5xl font-bold tracking-tighter leading-none">{totalClasses}</p>
                </div>
              </div>

              <div className="bg-surface p-4 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all relative flex items-center justify-between h-full">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform hover:scale-105 shrink-0 bg-success/10 text-success">
                    <Percent size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Average Progress</p>
                    <p className="text-xs font-medium text-text-secondary leading-tight">grading velocity</p>
                  </div>
                </div>
                <div className="text-right pl-4 shrink-0">
                  <p className="text-5xl font-bold tracking-tighter leading-none">{avgProgress}<span className="text-2xl">%</span></p>
                </div>
              </div>

              <div className="bg-surface p-4 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all relative flex items-center justify-between h-full">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform hover:scale-105 shrink-0 bg-danger/10 text-danger">
                    <AlertTriangle size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">At-Risk Students</p>
                    <p className="text-xs font-medium text-text-secondary leading-tight">unresolved alerts</p>
                  </div>
                </div>
                <div className="text-right pl-4 shrink-0">
                  <p className="text-5xl font-bold tracking-tighter leading-none">{atRiskStudents}</p>
                </div>
              </div>

              <div className="bg-surface p-4 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all relative flex items-center justify-between h-full">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform hover:scale-105 shrink-0 bg-brand-primary/10 text-brand-primary">
                    <Users size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Teacher Completion</p>
                    <p className="text-xs font-medium text-text-secondary leading-tight">submission rate</p>
                  </div>
                </div>
                <div className="text-right pl-4 shrink-0">
                  <p className="text-5xl font-bold tracking-tighter leading-none">{teacherCompletion}<span className="text-2xl">%</span></p>
                </div>
              </div>
            </div>

            <div>
              <TeacherSubmissionMatrix />
            </div>

          </div>

          <div className="hod-side-col">

            <div className="hod-panel min-h-96 justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="hod-title">Academic Analytics</h3>
                    <p className="hod-subtitle">Track department diagnostics</p>
                  </div>
                </div>

                <div className="relative w-60 h-60 mx-auto my-5 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="var(--color-border)" strokeWidth="6" fill="transparent" />
                    <g>
                      <title>Dept average score: {analyticsMainPct}% across {scores.length} alerts</title>
                      <circle cx="50" cy="50" r="40" stroke="var(--color-brand-primary)" strokeWidth="6" fill="transparent"
                        strokeDasharray="251"
                        strokeDashoffset={251 - (251 * analyticsMainPct) / 100}
                        strokeLinecap="round" />
                    </g>

                    <circle cx="50" cy="50" r="30" stroke="var(--color-border)" strokeWidth="6" fill="transparent" />
                    <g>
                      <title>{analyticsMidPct}% of intervention alerts resolved</title>
                      <circle cx="50" cy="50" r="30" stroke="var(--color-brand-secondary)" strokeWidth="6" fill="transparent"
                        strokeDasharray="188"
                        strokeDashoffset={188 - (188 * analyticsMidPct) / 100}
                        strokeLinecap="round" />
                    </g>

                    <circle cx="50" cy="50" r="20" stroke="var(--color-border)" strokeWidth="6" fill="transparent" />
                    <g>
                      <title>Academic trend: {academicTrend >= 0 ? '+' : ''}{academicTrend}% — {analyticsInnerPct >= 60 ? ' improving' : analyticsInnerPct >= 40 ? ' stable' : ' declining'}</title>
                      <circle cx="50" cy="50" r="20" stroke={analyticsInnerPct >= 60 ? 'var(--color-success)' : analyticsInnerPct >= 40 ? 'var(--color-warning)' : 'var(--color-danger)'} strokeWidth="6" fill="transparent"
                        strokeDasharray="125"
                        strokeDashoffset={125 - (125 * analyticsInnerPct) / 100}
                        strokeLinecap="round" />
                    </g>
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-xl font-black text-foreground tracking-tight">{analyticsMainPct}%</p>
                    <p className="text-xs font-bold text-success flex items-center justify-center gap-0.5 mt-0.5">
                      <TrendingUp size={11} /> {academicTrend >= 0 ? '+' : ''}{academicTrend}% trend
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 mt-2 text-[10px] font-bold text-muted-foreground uppercase">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-primary" /> Avg Score</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-secondary" /> Resolution</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: analyticsInnerPct >= 60 ? 'var(--color-success)' : analyticsInnerPct >= 40 ? 'var(--color-warning)' : 'var(--color-danger)' }} /> Trend</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Quick Commands</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/hod/audit"
                    className="px-3 py-2 bg-primary hover:bg-brand-dark rounded-xl text-xs font-bold text-center text-primary-foreground transition-colors"
                  >
                    View Audit
                  </Link>
                  <Link
                    to="/hod/interventions"
                    className="px-3 py-2 bg-muted hover:bg-border rounded-xl text-xs font-bold text-center text-foreground transition-colors"
                  >
                    Manage Alerts
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                to="/hod/teachers"
                className="bg-surface p-4 rounded-xl border border-border/60 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-foreground border border-border shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Manage Teachers</p>
                  <p className="text-xs text-muted-foreground">View department staff</p>
                </div>
              </Link>

              <Link
                to="/hod/review"
                className="bg-surface p-4 rounded-xl border border-border/60 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-foreground border border-border shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Grade Review</p>
                  <p className="text-xs text-muted-foreground">Verify submitted grades</p>
                </div>
              </Link>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}