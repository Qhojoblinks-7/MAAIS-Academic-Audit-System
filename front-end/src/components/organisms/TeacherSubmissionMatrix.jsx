import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Users, AlertTriangle, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SubmissionProgressSparkline, StatusBadge, ActionButtonGroup } from '../molecules';
import { EmptyState } from '../molecules/EmptyState';
import { useHOD } from '../../context/HODContext';

function TeacherRow({ teacher }) {
  const progress = teacher.progress ?? 0;
  const status = teacher.status || 'PENDING';
  const isAtRisk = progress < 70;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'p-3 rounded-2xl border transition-all',
        isAtRisk
          ? 'border-rose-100 bg-rose-50/40'
          : 'border-gray-100/70 bg-gray-50/40 hover:bg-gray-50'
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-black',
          isAtRisk ? 'bg-rose-100 text-rose-700' : 'bg-blue-50 text-blue-700'
        )}>
          {(teacher.name || '?').charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <p className="text-[11px] font-bold text-gray-900 truncate">
              {teacher.name || 'Unknown'}
            </p>
            <span className={cn(
              'text-[11px] font-black shrink-0',
              isAtRisk ? 'text-rose-600' : 'text-gray-700'
            )}>
              {progress}%
            </span>
          </div>
          <div className="mt-1">
            <SubmissionProgressSparkline value={progress} size="xs" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function TeacherSubmissionMatrix({
  submissions: controlledSubmissions,
  onRefresh,
  actions,
  className,
}) {
  const { refreshTeacherSubmissions, teacherSubmissions: teacherSubmissionsFromContext, isLoading, refreshSubmissionTrends, submissionTrends } = useHOD();
  const submissions = controlledSubmissions ?? teacherSubmissionsFromContext;
  const [refreshing, setRefreshing] = useState(false);
  const [trendsRefreshing, setTrendsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh();
    } else {
      setRefreshing(true);
      await refreshTeacherSubmissions();
      setRefreshing(false);
    }
  };

  const handleRefreshTrends = async () => {
    setTrendsRefreshing(true);
    await refreshSubmissionTrends();
    setTrendsRefreshing(false);
  };

  useEffect(() => {
    if (submissionTrends.length === 0) {
      handleRefreshTrends();
    }
  }, []);

  const trends = submissionTrends.length > 0 ? submissionTrends : [];

  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => (b.progress || 0) - (a.progress || 0));
  }, [submissions]);

  const atRiskCount = submissions.filter((t) => (t.progress || 0) < 70).length;
  const totalCount = submissions.length;
  const avgProgress = totalCount > 0
    ? Math.round(submissions.reduce((sum, t) => sum + (t.progress || 0), 0) / totalCount)
    : 0;

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch', className)}>
      
      <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xs border border-gray-100 flex flex-col justify-between min-h-[380px]">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Submission Habits</h3>
              <p className="text-[11px] text-gray-400">Track structural completion windows</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefreshTrends}
                disabled={trendsRefreshing || isLoading}
                className="p-1.5 hover:bg-gray-50 border border-gray-100 rounded-xl text-gray-500 transition-colors"
              >
                <RefreshCw size={12} className={trendsRefreshing || isLoading ? 'animate-spin' : ''} />
              </button>
              <button className="text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
                This year <ChevronDown size={12} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 mb-6">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block" /> Assigned
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Completed
            </span>
          </div>
        </div>

        {trends.length > 0 ? (
          <div className="relative flex-1 flex items-end justify-between gap-2 px-2 pt-8 h-[180px]">
            {trends.map((month, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end relative group">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  <div
                    className="w-3 sm:w-4 bg-gray-100 rounded-t-md transition-all relative"
                    style={{ height: `${Math.max(month.expected, 1)}%` }}
                  />
                  <div
                    className="w-3 sm:w-4 bg-blue-600 rounded-t-md transition-all"
                    style={{ height: `${Math.max(month.actual, 1)}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400 mt-2">{month.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center py-12">
            <EmptyState context="grades" variant="compact" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 flex flex-col justify-between min-h-[380px]">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Live Roster</h3>
              <p className="text-[11px] text-gray-400">Avg Progress: {avgProgress}%</p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              className="p-1.5 hover:bg-gray-50 border border-gray-100 rounded-xl text-gray-500 transition-colors"
            >
              <RefreshCw size={12} className={refreshing || isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] bg-gray-50 border border-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-lg">
              {totalCount} Total staff
            </span>
            {atRiskCount > 0 && (
              <span className="text-[10px] bg-rose-50 border border-rose-100 text-rose-600 font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                <AlertTriangle size={9} /> {atRiskCount} Action Needed
              </span>
            )}
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <Users size={28} className="text-gray-200 mx-auto mb-1.5" />
              <p className="text-[11px] text-gray-400">No submission records loaded</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-200">
              {sortedSubmissions.map((teacher, i) => (
                <TeacherRow key={teacher.id || i} teacher={teacher} />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100/70 pt-3 mt-2 text-right">
          <span className="text-[10px] font-black text-gray-400 tracking-wider uppercase">
            Data Stream Active
          </span>
        </div>
      </div>

    </div>
  );
}
