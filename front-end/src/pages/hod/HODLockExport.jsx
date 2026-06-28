import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Unlock,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  Download,
  Layers,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { StatusBadge, LoadingSpinner } from '@/components/molecules';
import { WAECExportValidator } from '@/components/organisms';
import { ConfirmationDialog } from '@/components/molecules';
import { auditTrail } from '@/services/auditTrailService';
import { eventBus } from '@/services/eventBus';
import {
  useDepartmentProgress,
  useLockDepartmentMatrix,
  useUnlockDepartmentMatrix,
  useExportWAECCSV,
  useLockedTerms,
} from '@/lib/hooks/api/hod';

function ClassProgressCard({ cls, onLock, onUnlock, onExport, locking, exporting, isActive, onSelect }) {
  const pct = cls?.submissionPct ?? 0;
  const status = cls?.status || 'PENDING';
  const isReady = status === 'LOCKED';
  const checks = useMemo(() => (Array.isArray(cls?.checks) ? cls.checks.filter(Boolean) : []), [cls?.checks]);
  const passCount = useMemo(() => checks.filter((c) => c.pass).length, [checks]);
  const failCount = checks.length - passCount;

  return (
    <div
      onClick={onSelect}
      className={cn(
        'bg-white rounded-xl border transition-all p-4 cursor-pointer text-left focus-within:ring-2 focus-within:ring-indigo-500/10',
        isActive
          ? 'border-indigo-600 ring-2 ring-indigo-500/5 shadow-xs'
          : isReady
            ? 'border-emerald-200/80 hover:border-emerald-300 bg-white/70'
            : 'border-gray-200/70 hover:border-gray-300',
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-bold text-gray-900 truncate">{cls?.className || cls?.name || 'Unassigned Matrix'}</p>
              <StatusBadge status={status} />
              {isReady && <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />}
            </div>
            {cls?.subject && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{cls.subject}</p>}
          </div>

          <div className="flex gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            {!isReady ? (
              <button
                onClick={() => typeof onLock === 'function' && onLock(cls?.id)}
                disabled={locking === cls?.id}
                className="px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-slate-800 flex items-center gap-1.5 disabled:opacity-40 transition-colors shadow-3xs cursor-pointer"
              >
                {locking === cls?.id ? <LoadingSpinner size="sm" /> : <Lock size={11} />}
                Lock Frame
              </button>
            ) : (
              <button
                onClick={() => typeof onUnlock === 'function' && onUnlock(cls?.id)}
                className="px-2.5 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-gray-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Unlock size={11} />
                Unlock
              </button>
            )}
          </div>
        </div>

        {/* Progress Gauge Indicators */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-medium text-gray-400">Payload Density</span>
            <span
              className={cn(
                'font-bold',
                pct >= 95 ? 'text-emerald-600' : pct >= 70 ? 'text-amber-600' : 'text-rose-600',
              )}
            >
              {pct}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                pct >= 95 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-rose-500',
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Bottom Rule Engine Flags Count */}
        <div className="flex items-center justify-between border-t border-gray-100/70 pt-2 text-[10px] font-medium text-gray-400">
          <span>Validation Rules Matrix</span>
          {checks.length > 0 ? (
            <span className={cn('font-bold px-1.5 py-0.5 rounded', failCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700')}>
              {passCount}/{checks.length} Passed
            </span>
          ) : (
            <span className="text-gray-400">No checks</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function HODLockExport() {
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
  const unlockMutation = useUnlockDepartmentMatrix();
  const exportMutation = useExportWAECCSV();

  useEffect(() => {
    auditTrail.setUseHodApi(true);
  }, []);

  const [locking, setLocking] = useState(null);
  const [exporting, setExporting] = useState(null);
  const [confirmLock, setConfirmLock] = useState(null);
  const [confirmUnlock, setConfirmUnlock] = useState(null);
  const [activeClassId, setActiveClassId] = useState(null);

  // Clean pure computation for sorted list
  const sortedClasses = useMemo(() => {
    if (!Array.isArray(departmentProgress)) return [];
    return [...departmentProgress].sort((a, b) => (a?.submissionPct || 0) - (b?.submissionPct || 0));
  }, [departmentProgress]);

  // Safely auto-select the first items downstream once data lands
  useEffect(() => {
    if (sortedClasses.length > 0 && !activeClassId) {
      setActiveClassId(sortedClasses[0].id);
    }
  }, [sortedClasses, activeClassId]);

  const selectedClass = useMemo(() => {
    return sortedClasses.find((c) => c.id === activeClassId) || sortedClasses[0] || null;
  }, [sortedClasses, activeClassId]);

  const handleLock = async (clsId) => {
    if (!clsId) return;
    setConfirmLock({
      id: clsId,
      title: 'Seal Evaluation Payload?',
      message: 'All associated marks will freeze instantly. Proceed?',
    });
  };

  const doLock = async (clsId) => {
    if (!clsId) return;

    const cls = departmentProgress.find((c) => c.id === clsId);

    setLocking(clsId);
    try {
      const oldVal = typeof auditTrail?.captureSnapshot === 'function' ? auditTrail.captureSnapshot({ status: 'PENDING' }) : {};
      await lockMutation.mutateAsync(clsId);
      const newVal = typeof auditTrail?.captureSnapshot === 'function' ? auditTrail.captureSnapshot({ status: 'LOCKED' }) : {};

      if (auditTrail?.logChange) {
        await auditTrail.logChange('class_term', clsId, oldVal, newVal, 'Term locked by HOD');
      }
      if (eventBus?.emit) {
        eventBus.emit('term-locked', { classId: clsId });
      }

      await refetchProgress();
      await refetchLockedTerms();
    } catch (e) {
      console.error('Lock configuration stream error:', e);
      alert(e.message || 'Failed to lock term');
    } finally {
      setLocking(null);
      setConfirmLock(null);
    }
  };

  const handleUnlock = (clsId) => {
    setConfirmUnlock({
      id: clsId,
      title: 'Release Locked Ledger Constraints?',
      message: 'This unlocks editing layers across structural logs. System will keep capturing modification histories.',
    });
  };

  const doUnlock = async (clsId) => {
    if (!clsId) return;

    const cls = departmentProgress.find((c) => c.id === clsId);

    try {
      const oldVal = typeof auditTrail?.captureSnapshot === 'function' ? auditTrail.captureSnapshot({ status: 'LOCKED' }) : {};
      await unlockMutation.mutateAsync(clsId);
      const newVal = typeof auditTrail?.captureSnapshot === 'function' ? auditTrail.captureSnapshot({ status: 'PENDING' }) : {};

      if (auditTrail?.logChange) {
        await auditTrail.logChange('class_term', clsId, oldVal, newVal, 'Term unlocked by HOD');
      }
      if (eventBus?.emit) {
        eventBus.emit('term-unlocked', { classId: clsId });
      }

      await refetchProgress();
      await refetchLockedTerms();
    } catch (e) {
      console.error('Unlock process matrix verification exception:', e);
    } finally {
      setConfirmUnlock(null);
    }
  };

  const handleExport = async (clsId) => {
    if (!clsId) return;

    const cls = departmentProgress.find((c) => c.id === clsId);
    if (!cls) {
      alert('Class not found in department progress.');
      return;
    }

    const checks = Array.isArray(cls?.checks) ? cls.checks.filter(Boolean) : [];
    const failCount = checks.length - checks.filter((c) => c.pass).length;

    if (failCount > 0) {
      alert('Cannot export: Validation checks are failing. Please resolve issues before export.');
      return;
    }

    setExporting(clsId);
    try {
      await exportMutation.mutateAsync({ termId: clsId, className: cls.className || 'Subject' });

      if (auditTrail?.logChange) {
        await auditTrail.logChange('class_term', clsId, {}, { exported: true }, 'WAEC CSV dataset export compiled');
      }
    } catch (e) {
      console.error('Data download compilation failure:', e);
    } finally {
      setExporting(null);
    }
  };

  const lockedClassCount = useMemo(() => {
    return sortedClasses.filter((c) => c.status === 'LOCKED').length;
  }, [sortedClasses]);

  const pendingCount = useMemo(() => {
    return Math.max(0, sortedClasses.length - lockedClassCount);
  }, [sortedClasses.length, lockedClassCount]);

  if (progressLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 font-sans antialiased">
        <header className="bg-white border-b border-gray-200/80 px-6 py-4 sticky top-0 z-10 backdrop-blur-md bg-white/95">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-base font-bold text-gray-900 tracking-tight">Lock &amp; Export Core</h1>
              <p className="text-xs text-gray-400 mt-0.5">Freeze ongoing evaluations and format verified records into WAEC compliance matrices.</p>
            </div>
            <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 flex items-center gap-2 shadow-3xs">
              <RefreshCw size={12} className="animate-spin" />
              Syncing...
            </button>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw size={24} className="animate-spin text-gray-400" />
            <p className="text-xs text-gray-500 font-medium">Loading lock configuration...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 font-sans antialiased">
      <header className="bg-white border-b border-gray-200/80 px-6 py-4 sticky top-0 z-10 backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight">Lock &amp; Export Core</h1>
            <p className="text-xs text-gray-400 mt-0.5">Freeze ongoing evaluations and format verified records into WAEC compliance matrices.</p>
          </div>
          <button
            onClick={() => { refetchProgress(); refetchLockedTerms(); }}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2 shadow-3xs transition-all active:scale-95 shrink-0 self-start sm:self-center"
          >
            <RefreshCw size={12} />
            Sync Operational States
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6 max-w-6xl w-full mx-auto flex flex-col space-y-5">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-3xs">
            <Layers size={11} className="text-gray-400" /> {departmentProgress.length} Tracked Units
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/50 rounded-lg text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
            <Lock size={11} className="text-emerald-500" /> {lockedClassCount} Sealed
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/50 rounded-lg text-[10px] font-bold text-amber-700 uppercase tracking-wider">
              <Clock size={11} className="text-amber-500" /> {pendingCount} Awaiting Review
            </div>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-6 items-start overflow-hidden">
          <div className="md:col-span-2 flex flex-col space-y-3 h-full overflow-y-auto pr-1">
            {sortedClasses.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200/70 p-8 text-center shadow-3xs">
                <ShieldCheck size={32} className="text-gray-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">No Verification Units Available</h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-normal">Awaiting curriculum mapping pipelines configuration matrices.</p>
              </div>
            ) : (
              sortedClasses.map((cls) => (
                <ClassProgressCard
                  key={cls?.id}
                  cls={cls}
                  isActive={activeClassId === cls?.id}
                  onSelect={() => setActiveClassId(cls?.id)}
                  onLock={handleLock}
                  onUnlock={handleUnlock}
                  onExport={handleExport}
                  locking={locking}
                  exporting={exporting}
                />
              ))
            )}
          </div>

          <div className="md:col-span-3 bg-white rounded-xl border border-gray-200/70 shadow-3xs h-full flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              {selectedClass ? (
                <motion.div
                  key={selectedClass.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col h-full overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-gray-200/60 bg-gray-50/40 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wider">Export Node Configuration</h3>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">Target Workspace: <span className="text-gray-700 font-bold">{selectedClass.className}</span></p>
                    </div>
                    {selectedClass.status === 'LOCKED' && (
                      <button
                        onClick={() => handleExport(selectedClass.id)}
                        disabled={exporting === selectedClass.id}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-700 flex items-center gap-1.5 disabled:opacity-40 shadow-3xs transition-all active:scale-95 cursor-pointer"
                      >
                        {exporting === selectedClass.id ? <LoadingSpinner size="sm" /> : <Download size={11} />}
                        Export CSV
                      </button>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <div className="bg-slate-50 border border-gray-200/50 rounded-xl p-4 space-y-2.5">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 tracking-wide mb-1 flex items-center gap-1.5">
                        <FileSpreadsheet size={12} className="text-gray-400" />
                        Internal Quality Parameters Analysis
                      </h4>
                      {Array.isArray(selectedClass.checks) && selectedClass.checks.length > 0 ? (
                        selectedClass.checks.map((check, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 text-xs py-0.5">
                            {check.pass
                              ? <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                              : <XCircle size={12} className="text-rose-500 shrink-0" />
                            }
                            <span className={cn('font-medium', check.pass ? 'text-gray-600' : 'text-rose-600 font-bold')}>
                              {check.label}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-gray-400 italic py-1">No validation checks configured for this class.</p>
                      )}

                      {(selectedClass.checks?.length ?? 0) > 0 && selectedClass.checks?.some((c) => !c.pass) && (
                        <div className="mt-3 p-3 bg-rose-50/60 border border-rose-100 rounded-lg text-[11px] text-rose-800 font-medium flex items-start gap-2 leading-relaxed">
                          <AlertTriangle size={13} className="text-rose-500 shrink-0 mt-0.5" />
                          <span>Failing structural checks will reject external WAEC clearing house submission pipelines. Release seal parameters or re-evaluate core matrices inside the pipeline dashboard.</span>
                        </div>
                      )}
                    </div>

                    {selectedClass.status === 'LOCKED' ? (
                      <div className="border border-gray-100 rounded-xl pt-1">
                        <WAECExportValidator
                          classes={[selectedClass]}
                          exportFn={handleExport}
                          format="csv"
                        />
                      </div>
                    ) : (
                      <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 text-xs italic bg-slate-50/20">
                        Commit the frame seal lock to initialize external institutional WAEC formatting engine validations.
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="m-auto text-center py-12 max-w-xs">
                  <ShieldCheck size={28} className="text-gray-300 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">No Selection</h4>
                  <p className="text-[11px] text-gray-400 mt-1">Select an active class track on the left dashboard pane to inspect compliance logs.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <ConfirmationDialog
        open={!!confirmLock}
        title={confirmLock?.title}
        message={confirmLock?.message}
        confirmLabel="Confirm Seal Matrix"
        onConfirm={() => confirmLock && doLock(confirmLock.id)}
        onCancel={() => setConfirmLock(null)}
        variant="warning"
      />
      <ConfirmationDialog
        open={!!confirmUnlock}
        title={confirmUnlock?.title}
        message={confirmUnlock?.message}
        confirmLabel="Release Seal Constraints"
        onConfirm={() => confirmUnlock && doUnlock(confirmUnlock.id)}
        onCancel={() => setConfirmUnlock(null)}
        variant="primary"
      />
    </div>
  );
}