import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle, Users, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SubmissionProgressSparkline, StatusBadge, ActionButtonGroup, LoadingSpinner } from '../molecules';
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
        'p-3.5 rounded-xl border transition-all',
        isAtRisk
          ? 'border-rose-200 bg-rose-50/60'
          : 'border-gray-100 bg-gray-50/30 hover:bg-gray-50'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold',
          isAtRisk ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700'
        )}>
          {(teacher.name || '?').charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {teacher.name || 'Unknown'}
            </p>
            <StatusBadge status={status} />
            {isAtRisk && (
              <span className="text-[10px] font-medium text-rose-600 flex items-center gap-0.5">
                <AlertTriangle size={10} /> At-risk
              </span>
            )}
          </div>

          {teacher.subject && (
            <p className="text-[10px] text-gray-500 mt-0.5">
              {teacher.subject}
            </p>
          )}

          <div className="mt-2">
            <SubmissionProgressSparkline value={progress} size="sm" />
          </div>
        </div>

        <span className={cn(
          'text-[11px] font-bold shrink-0',
          isAtRisk ? 'text-rose-600' : 'text-gray-600'
        )}>
          {progress}%
        </span>
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
  const { teacherSubmissions, refreshTeacherSubmissions, teacherSubmissions: teacherSubmissionsFromContext, isLoading } = useHOD();
  const submissions = controlledSubmissions ?? teacherSubmissionsFromContext;
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh();
    } else {
      setRefreshing(true);
      await refreshTeacherSubmissions();
      setRefreshing(false);
    }
  };

  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => (a.progress || 0) - (b.progress || 0));
  }, [submissions]);

  const atRiskCount = submissions.filter((t) => (t.progress || 0) < 70).length;
  const totalCount = submissions.length;
  const avgProgress = totalCount > 0
    ? Math.round(submissions.reduce((sum, t) => sum + (t.progress || 0), 0) / totalCount)
    : 0;

  const defaultActions = [
    {
      label: 'Refresh',
      variant: 'secondary',
      icon: RefreshCw,
      onClick: handleRefresh,
      disabled: refreshing || isLoading,
    },
  ];

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Teacher Submissions</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-gray-500">
              {totalCount} teacher{totalCount !== 1 ? 's' : ''}
            </span>
            {atRiskCount > 0 && (
              <span className="text-[10px] font-medium text-rose-600 flex items-center gap-0.5">
                <AlertTriangle size={10} /> {atRiskCount} at-risk
              </span>
            )}
            <span className="text-[10px] text-gray-400">
              avg {avgProgress}%
            </span>
          </div>
        </div>
        <ActionButtonGroup actions={actions || defaultActions} />
      </div>

      {/* List */}
      {submissions.length === 0 ? (
        <div className="text-center py-8">
          <Users size={32} className="text-gray-200 mx-auto mb-2" />
          <p className="text-xs text-gray-400">No submission data available</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedSubmissions.map((teacher, i) => (
            <TeacherRow key={teacher.id || i} teacher={teacher} />
          ))}
        </div>
      )}
    </div>
  );
}
