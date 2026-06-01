import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Percent, AlertTriangle, Users, ShieldCheck, RefreshCw, ChevronDown, TrendingUp } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { useHOD } from '../../context/HODContext';
import { TeacherSubmissionMatrix } from '../../components/organisms/DashboardOrganisms';
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

  const [timeFilter, setTimeFilter] = React.useState('Today');
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [refreshDisabled, setRefreshDisabled] = useState(false);

  useEffect(() => {
     refreshDepartmentProgress();
     refreshTeacherSubmissions();
     refreshInterventionAlerts();
   }, [refreshDepartmentProgress, refreshTeacherSubmissions, refreshInterventionAlerts]);

  const handleRefreshAll = async () => {
    setRefreshDisabled(true);
    await Promise.all([
      refreshDepartmentProgress(),
      refreshTeacherSubmissions(),
      refreshInterventionAlerts()
    ]);
    setTimeout(() => setRefreshDisabled(false), 1000);
  };

  const handleTimeFilterChange = async (option) => {
    setTimeFilter(option);
    setShowDropdown(false);
    setRefreshDisabled(true);
    await Promise.all([
      refreshDepartmentProgress(),
      refreshTeacherSubmissions(),
      refreshInterventionAlerts()
    ]);
    setTimeout(() => setRefreshDisabled(false), 1000);
  };

  const baseProgress = departmentProgress?.items || departmentProgress || [];
  const filteredProgress = timeFilter === 'Today' 
    ? baseProgress.slice(0, 2) 
    : timeFilter === 'Week' 
      ? baseProgress.slice(0, 4) 
      : baseProgress;
  
  const totalClasses = filteredProgress.length;
  const avgProgress = filteredProgress.length > 0
    ? Math.round(filteredProgress.reduce((sum, c) => sum + (c.progress || c.submissionPct || 0), 0) / totalClasses)
    : 0;

  const unresolvedAlerts = interventionAlerts.filter(a => !a.resolved).length;
  const atRiskStudents = unresolvedAlerts;

  const analyticsMainPct = avgProgress;
  const analyticsMidPct = Math.min(100, avgProgress + 12);
  const analyticsInnerPct = Math.max(0, 100 - atRiskStudents * 8);

  const teacherCompletion = teacherSubmissions.length > 0
    ? Math.round(teacherSubmissions.reduce((sum, s) => sum + (s.progress || 0), 0) / teacherSubmissions.length)
    : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-[#F4F4F9] p-6 md:p-8 select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <header className="mb-8 border-b border-gray-200/60 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">
              Welcome back, <span className="text-blue-600">{user?.name?.split(' ')[0] || 'HOD'}</span>!
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-1.5">
              <ShieldCheck size={10} className="text-gray-400" />
              Department Oversight & Academic Integrity Console
            </p>
          </div>
          <button
            onClick={handleRefreshAll}
            disabled={isLoading || refreshDisabled}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-xs transition-colors self-start sm:self-center disabled:opacity-50"
          >
            <RefreshCw size={13} className={isLoading || refreshDisabled ? 'animate-spin' : ''} />
            Refresh Dashboard
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
         
          <div className="lg:col-span-2 space-y-8">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div className="bg-blue-600 text-white rounded-3xl p-5 shadow-xs flex flex-col justify-between h-[130px]">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <BookOpen size={18} className="text-white" />
                  </div>
                  <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                    +2.0%
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-blue-100 uppercase tracking-wider">Department Classes</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-black tracking-tight">{totalClasses}</span>
                    <span className="text-[10px] text-blue-200 font-medium">active tracks</span>
                  </div>
                </div>
              </div>

              <div className="bg-white text-gray-900 rounded-3xl p-5 shadow-xs border border-gray-100 flex flex-col justify-between h-[130px]">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <Percent size={18} className="text-gray-600" />
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    +12.4%
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Average Progress</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-black tracking-tight">{avgProgress}%</span>
                    <span className="text-[10px] text-gray-500 font-medium">grading velocity</span>
                  </div>
                </div>
              </div>

              <div className="bg-white text-gray-900 rounded-3xl p-5 shadow-xs border border-gray-100 flex flex-col justify-between h-[130px]">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <AlertTriangle size={18} className="text-red-500" />
                  </div>
                  <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    -2.08%
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">At-Risk Students</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-black tracking-tight">{atRiskStudents}</span>
                    <span className="text-[10px] text-gray-500 font-medium">unresolved alerts</span>
                  </div>
                </div>
              </div>

              <div className="bg-white text-gray-900 rounded-3xl p-5 shadow-xs border border-gray-100 flex flex-col justify-between h-[130px]">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                    <Users size={18} className="text-gray-600" />
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    +{teacherCompletion - 70}%
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Teacher Completion</p>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-black tracking-tight">{teacherCompletion}%</span>
                    <span className="text-[10px] text-gray-500 font-medium">submission rate</span>
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
                  <div className="relative">
                    <button 
                      onClick={() => setShowDropdown(!showDropdown)}
                      disabled={refreshDisabled}
                      className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-xl flex items-center gap-1 hover:bg-gray-100 disabled:opacity-50"
                    >
                      {timeFilter} <ChevronDown size={12} className={showDropdown ? 'rotate-180 transition-transform' : 'transition-transform'} />
                    </button>
                    {showDropdown && (
                      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[100px]">
                        {['Today', 'Week', 'Month'].map(option => (
                          <button
                            key={option}
                            onClick={() => handleTimeFilterChange(option)}
                            className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative w-60 h-60 mx-auto my-5 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
                    <circle cx="50" cy="50" r="40" stroke="#2563EB" strokeWidth="6" fill="transparent"
                      strokeDasharray="251"
                      strokeDashoffset={251 - (251 * analyticsMainPct) / 100}
                      strokeLinecap="round" />

                    <circle cx="50" cy="50" r="30" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
                    <circle cx="50" cy="50" r="30" stroke="#38BDF8" strokeWidth="6" fill="transparent"
                      strokeDasharray="188"
                      strokeDashoffset={188 - (188 * analyticsMidPct) / 100}
                      strokeLinecap="round" />

                    <circle cx="50" cy="50" r="20" stroke="#E2E8F0" strokeWidth="6" fill="transparent" />
                    <circle cx="50" cy="50" r="20" stroke="#EF4444" strokeWidth="6" fill="transparent"
                      strokeDasharray="125"
                      strokeDashoffset={125 - (125 * analyticsInnerPct) / 100}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-xl font-black text-gray-900 tracking-tight">{analyticsMainPct}%</p>
                    <p className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-0.5 mt-0.5">
                      <TrendingUp size={11} /> +{avgProgress > 0 ? avgProgress - 65 : 0}% from baseline
                    </p>
                  </div>
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
                className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-xs hover:shadow-md transition-all flex items-center gap-4"
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
                className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-xs hover:shadow-md transition-all flex items-center gap-4"
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
                className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-xs hover:shadow-md transition-all flex items-center gap-4"
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

          </div>

        </div>
      </motion.div>
    </div>
  );
}