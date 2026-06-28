import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Download, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useDepartmentProgress, useLockDepartmentMatrix, useExportWAECCSV, useLockedTerms } from '@/lib/hooks/api/hod';

export function HODCertification() {
  const {
    data: departmentProgress = [],
    isLoading: progressLoading,
    error: progressError,
    refetch: refetchProgress,
  } = useDepartmentProgress();

  const {
    data: lockedTerms = [],
    refetch: refetchLockedTerms,
  } = useLockedTerms();

  const lockMutation = useLockDepartmentMatrix();
  const exportCSVMutation = useExportWAECCSV();

  const [lockingId, setLockingId] = useState(null);
  const [exportingId, setExportingId] = useState(null);
  const [confirmingClass, setConfirmingClass] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProgress(), refetchLockedTerms()]);
    setRefreshing(false);
  };

  const handleLock = async () => {
    if (!confirmingClass) return;
    const targetId = confirmingClass.id;
    setLockingId(confirmingClass.id);
    try {
      await lockMutation.mutateAsync(targetId);
    } finally {
      setLockingId(null);
      setConfirmingClass(null);
    }
  };

  const handleExport = async (classId) => {
    setExportingId(classId);
    try {
      await exportCSVMutation.mutateAsync({ termId: classId, className: 'Subject' });
    } finally {
      setExportingId(null);
    }
  };

  const canLock = (cls) => (cls.submissionPct || 0) === 100 && cls.status !== 'LOCKED';

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Top Panel Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">HOD Certification</h1>
              <p className="text-xs text-gray-500 mt-0.5">Commit department matrix values and generate verified WAEC compliance datasets</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || progressLoading}
              className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-2xs transition-colors self-start sm:self-center"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              Synchronize Matrices
            </button>
          </div>

          {progressError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              <AlertTriangle size={14} />
              Failed to load department progress. Please try again.
            </div>
          )}

          {/* Progress Ledger Array List */}
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {!progressLoading && departmentProgress.length > 0 ? (
                departmentProgress.map((cls) => (
                  <motion.div
                    key={cls.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    className="bg-white rounded-2xl border border-gray-100 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-xs font-bold text-gray-800 truncate">{cls.className || cls.name}</h3>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded",
                          cls.status === 'LOCKED'
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        )}>
                          {cls.status || 'PENDING'}
                        </span>
                      </div>

                      {/* Metric Progress Strip */}
                      <div className="max-w-sm space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                          <span>Submission Matrix State</span>
                          <span className="text-gray-700">{cls.submissionPct || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-100/80 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              (cls.submissionPct || 0) === 100 ? "bg-emerald-500" : "bg-amber-500"
                            )}
                            style={{ width: `${cls.submissionPct || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Operational Trigger Actions */}
                    <div className="flex items-center gap-2 sm:pl-4 shrink-0 self-end sm:self-center">
                      {cls.status !== 'LOCKED' ? (
                        <button
                          onClick={() => setConfirmingClass(cls)}
                          disabled={!canLock(cls) || lockingId === cls.id}
                          className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all",
                            canLock(cls)
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200/20"
                          )}
                        >
                          <Lock size={12} />
                          {lockingId === cls.id ? 'Securing...' : 'Commit Vault State'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleExport(cls.id)}
                          disabled={exportingId === cls.id}
                          className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-40"
                        >
                          <Download size={12} />
                          {exportingId === cls.id ? 'Exporting...' : 'Export WAEC Dataset'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : !progressLoading ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-2xs">
                  <ShieldCheck size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">No Verification Profiles Initialized</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Active department data parameters appear synchronized.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl" />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Confirmation Backdrop Modal */}
      <AnimatePresence>
        {confirmingClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-950/40 backdrop-blur-xs"
              onClick={() => setConfirmingClass(null)}
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 4 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 4 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-10 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 border border-rose-100 shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Execute Immutable Security Lock?</h3>
                  <p className="text-xs font-medium text-gray-500 mt-1 leading-relaxed">
                    You are certifying <span className="font-bold text-gray-700">"{confirmingClass.className || confirmingClass.name}"</span>. This action cannot be revoked from the terminal interface. Sub-user edits will lock instantly.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={() => setConfirmingClass(null)}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLock}
                  disabled={lockMutation.isPending}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors disabled:opacity-50"
                >
                  {lockMutation.isPending ? 'Securing...' : 'Confirm Certification Lock'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
