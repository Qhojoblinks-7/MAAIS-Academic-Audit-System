import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Percent, AlertTriangle, Users, ShieldCheck, RefreshCw } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { useHOD } from '../../context/HODContext';
import { TeacherSubmissionMatrix, KpiGrid, KpiMetricCard } from '../../components/organisms/DashboardOrganisms';
import { Link } from 'react-router-dom';

export function HODDashboard() {
  const { user } = useRole();
  const {
    departmentProgress = [],
    teacherSubmissions = [],
    interventionAlerts = [],
    refreshDepartmentProgress,
    refreshTeacherSubmissions,
    refreshInterventionAlerts,
    isLoading,
  } = useHOD();

  useEffect(() => {
    refreshDepartmentProgress();
    refreshTeacherSubmissions();
    refreshInterventionAlerts();
  }, [refreshDepartmentProgress, refreshTeacherSubmissions, refreshInterventionAlerts]);

  const totalClasses = departmentProgress.length;
  const avgProgress = totalClasses > 0
    ? Math.round(departmentProgress.reduce((sum, c) => sum + (c.progress || 0), 0) / totalClasses)
    : 0;

  const unresolvedAlerts = interventionAlerts.filter(a => !a.resolved).length;
  const atRiskStudents = unresolvedAlerts;

  const teacherCompletion = teacherSubmissions.length > 0
    ? Math.round((teacherSubmissions.filter(s => (s.gradedCount || 0) >= (s.studentCount || 0)).length / teacherSubmissions.length) * 100)
    : 0;

  const handleRefreshAll = () => {
    refreshDepartmentProgress();
    refreshTeacherSubmissions();
    refreshInterventionAlerts();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#FBFBFA] p-6 md:p-8 select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header Hero Frame */}
        <header className="mb-8 border-b border-gray-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">
              Welcome back, <span className="text-emerald-800">{user?.name?.split(' ')[0] || 'HOD'}</span>!
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-1.5">
              <ShieldCheck size={10} className="text-gray-300" />
              Department Oversight & Academic Integrity Console
            </p>
          </div>
          <button
            onClick={handleRefreshAll}
            disabled={isLoading}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-2xs transition-colors self-start sm:self-center"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            Refresh Dashboard
          </button>
        </header>

        {/* Statistical Snapshot Grid */}
        <KpiGrid>
          <KpiMetricCard
            icon={BookOpen}
            label="Department Classes"
            value={totalClasses}
            subValue="active tracks"
          />
          <KpiMetricCard
            icon={Percent}
            label="Average Progress"
            value={`${avgProgress}%`}
            subValue="grading velocity"
            theme={avgProgress >= 70 ? 'dark' : 'light'}
          />
          <KpiMetricCard
            icon={AlertTriangle}
            label="At-Risk Students"
            value={atRiskStudents}
            subValue="unresolved alerts"
          />
          <KpiMetricCard
            icon={Users}
            label="Teacher Completion"
            value={`${teacherCompletion}%`}
            subValue="submission rate"
          />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-5 border relative overflow-hidden flex flex-col justify-between h-[130px] transition-all hover:shadow-sm bg-gradient-to-br from-gray-900 to-gray-800 text-white border-gray-700"
          >
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold text-gray-300">Quick Actions</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/hod/audit"
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold text-center transition-colors"
              >
                View Audit
              </Link>
              <Link
                to="/hod/interventions"
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold text-center transition-colors"
              >
                Manage Alerts
              </Link>
            </div>
          </motion.div>
        </KpiGrid>

        {/* Teacher Submission Matrix */}
        <div className="mt-8">
          <TeacherSubmissionMatrix />
        </div>

        {/* Quick Access Panel */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/hod/teachers"
            className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
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
            className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 border border-gray-100 shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Grade Review</p>
              <p className="text-[10px] text-gray-500">Verify submitted grades</p>
            </div>
          </Link>

          <Link
            to="/hod/lock-export"
            className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 border border-gray-100 shrink-0">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Lock & Export</p>
              <p className="text-[10px] text-gray-500">Finalize term data</p>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}