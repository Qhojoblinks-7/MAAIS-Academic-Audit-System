import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Percent, AlertTriangle, Users, ShieldCheck, RefreshCw, TrendingUp } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { useHOD } from '../../context/HODContext';
import { TeacherSubmissionMatrix } from '../../components/organisms/DashboardOrganisms';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

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
    <div className="flex-1 overflow-y-auto bg-[#F4F4F9] p-6 md:p-8 select-none scrollbar-hide no-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <header className="mb-8 border-b border-border/60 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-none">
              Welcome back, <span className="text-brand-primary">{user?.name?.split(' ')[0] || 'HOD'}</span>!
            </h1>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2 flex items-center gap-1.5">
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
         
          <div className="lg:col-span-2 space-y-8">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface p-4 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all relative group">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 bg-blue-600/10 text-blue-600">
                      <BookOpen size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Department Classes</p>
                      <p className="text-[11px] font-medium text-text-secondary leading-tight">active tracks</p>
                    </div>
                  </div>
                  <div className="text-right pl-4 shrink-0">
                    <p className="text-5xl font-bold tracking-tighter leading-none">{totalClasses}</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface p-4 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all relative group">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 bg-emerald-500/10 text-emerald-600">
                      <Percent size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Average Progress</p>
                      <p className="text-[11px] font-medium text-text-secondary leading-tight">grading velocity</p>
                    </div>
                  </div>
                  <div className="text-right pl-4 shrink-0">
                    <p className="text-5xl font-bold tracking-tighter leading-none">{avgProgress}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface p-4 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all relative group">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 bg-red-500/10 text-red-600">
                      <AlertTriangle size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">At-Risk Students</p>
                      <p className="text-[11px] font-medium text-text-secondary leading-tight">unresolved alerts</p>
                    </div>
                  </div>
                  <div className="text-right pl-4 shrink-0">
                    <p className="text-5xl font-bold tracking-tighter leading-none">{atRiskStudents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface p-4 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all relative group">
                <div className="flex items-center justify-between h-full">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 bg-blue-500/10 text-blue-600">
                      <Users size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Teacher Completion</p>
                      <p className="text-[11px] font-medium text-text-secondary leading-tight">submission rate</p>
                    </div>
                  </div>
                  <div className="text-right pl-4 shrink-0">
                    <p className="text-5xl font-bold tracking-tighter leading-none">{teacherCompletion}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <TeacherSubmissionMatrix />
            </div>

          </div>

          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 flex flex-col justify-between min-h-[380px]">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Academic Analytics</h3>
                    <p className="text-[11px] text-gray-400">Track department diagnostics</p>
                  </div>
                </div>

                <div className="relative w-60 h-60 mx-auto my-5 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
                    <g>
                      <title>Dept average score: {analyticsMainPct}% across {scores.length} alerts</title>
                      <circle cx="50" cy="50" r="40" stroke="#2563EB" strokeWidth="6" fill="transparent"
                        strokeDasharray="251"
                        strokeDashoffset={251 - (251 * analyticsMainPct) / 100}
                        strokeLinecap="round" />
                    </g>

                    <circle cx="50" cy="50" r="30" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
                    <g>
                      <title>{analyticsMidPct}% of intervention alerts resolved</title>
                      <circle cx="50" cy="50" r="30" stroke="#6366F1" strokeWidth="6" fill="transparent"
                        strokeDasharray="188"
                        strokeDashoffset={188 - (188 * analyticsMidPct) / 100}
                        strokeLinecap="round" />
                    </g>

                    <circle cx="50" cy="50" r="20" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
                    <g>
                      <title>Academic trend: {academicTrend >= 0 ? '+' : ''}{academicTrend}% — {analyticsInnerPct >= 60 ? ' improving' : analyticsInnerPct >= 40 ? ' stable' : ' declining'}</title>
                      <circle cx="50" cy="50" r="20" stroke={analyticsInnerPct >= 60 ? '#10B981' : analyticsInnerPct >= 40 ? '#F59E0B' : '#EF4444'} strokeWidth="6" fill="transparent"
                        strokeDasharray="125"
                        strokeDashoffset={125 - (125 * analyticsInnerPct) / 100}
                        strokeLinecap="round" />
                    </g>
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-xl font-black text-gray-900 tracking-tight">{analyticsMainPct}%</p>
                    <p className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-0.5 mt-0.5">
                      <TrendingUp size={11} /> {academicTrend >= 0 ? '+' : ''}{academicTrend}% trend
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2 text-[9px] font-bold text-gray-400 uppercase">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600"/> Avg Score</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"/> Resolution</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{background: analyticsInnerPct >= 60 ? '#10B981' : analyticsInnerPct >= 40 ? '#F59E0B' : '#EF4444'}}/> Trend</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Commands</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/hod/audit"
                    className="px-3 py-2 bg-gray-900 hover:bg-gray-800 rounded-xl text-[11px] font-bold text-center text-white transition-colors"
                  >
                    View Audit
                  </Link>
                  <Link
                    to="/hod/interventions"
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-[11px] font-bold text-center text-gray-700 transition-colors"
                  >
                    Manage Alerts
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                to="/hod/teachers"
                className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-xs hover:shadow-md transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 border border-gray-100 shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Manage Teachers</p>
                  <p className="text-[10px] text-gray-500">View department staff</p>
                </div>
              </Link>

              <Link
                to="/hod/review"
                className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-xs hover:shadow-md transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 border border-gray-100 shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Grade Review</p>
                  <p className="text-[10px] text-gray-500">Verify submitted grades</p>
                </div>
              </Link>
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
}