import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Lock, Unlock, ShieldCheck, XCircle, CheckCircle2,
  RefreshCw, ChevronRight, FileSpreadsheet, FileText,
  BookOpen, AlertTriangle, Clock, Download, ArrowUpRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { DateRangeFilter, ActionButtonGroup, StatusBadge, LoadingSpinner, EmptyState } from '../../components/molecules';
import { WAECExportValidator } from '../../components/organisms';
import { ConfirmationDialog } from '../../components/molecules';
import { auditTrail } from '../../services/auditTrailService';
import { notification } from '../../services/notificationService';
import { reportEngine } from '../../services/reportEngine';
import { eventBus } from '../../services/eventBus';

function ClassProgressCard({ cls, onLock, onUnlock, onExport, locking, exporting }) {
  const pct = cls.submissionPct ?? 0;
  const status = cls.status || 'PENDING';
  const isReady = status === 'LOCKED';
  const checks = (cls.checks || []).filter(Boolean);
  const passCount = checks.filter(c => c.pass).length;
  const failCount = checks.length - passCount;

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={cn("bg-white rounded-2xl border transition-all overflow-hidden",
        isReady ? 'border-emerald-200 shadow-sm' : 'border-gray-100 shadow-sm')}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-gray-900 truncate">{cls.className || cls.name || 'Unknown'}</p>
              <StatusBadge status={status} />
              {isReady && <CheckCircle2 size={14} className="text-emerald-600" />}
            </div>
            {cls.subject && <p className="text-[10px] text-gray-500 mt-0.5">{cls.subject}</p>}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Submission</span>
                  <span className={cn("text-[10px] font-bold", pct >= 95 ? 'text-emerald-600' : pct >= 70 ? 'text-amber-600' : 'text-rose-600')}>
                    {pct}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className={cn("h-full rounded-full", pct >= 95 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-rose-500')}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="text-[10px] text-gray-400 flex items-center gap-0.5">
                {passCount}/{checks.length} checks
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            {!isReady && (
              <button
                onClick={() => onLock?.(cls.id)}
                disabled={locking === cls.id}
                className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-medium rounded-lg hover:bg-emerald-700 flex items-center gap-1 disabled:opacity-50"
              >
                {locking === cls.id ? <LoadingSpinner size="sm" /> : <Lock size={11} />} {locking === cls.id ? 'Locking…' : 'Lock Term'}
              </button>
            )}
            {isReady && (
              <button
                onClick={() => onUnlock?.(cls.id)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-[10px] font-medium rounded-lg hover:bg-gray-200 flex items-center gap-1"
              >
                <Unlock size={11} /> Unlock
              </button>
            )}
            {isReady && (
              <button
                onClick={() => onExport?.(cls.id)}
                disabled={exporting === cls.id}
                className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-medium rounded-lg hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
              >
                {exporting === cls.id ? <LoadingSpinner size="sm" /> : <Download size={11} />} Export
              </button>
            )}
          </div>
        </div>

        {/* Checks */}
        {checks.length > 0 && (
          <div className="mt-3 space-y-1">
            {checks.map((check, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                {check.pass
                  ? <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                  : <XCircle size={11} className="text-rose-500 shrink-0" />
                }
                <span className={cn("text-[10px]", check.pass ? 'text-gray-600' : 'text-rose-600')}>
                  {check.label}
                </span>
              </div>
            ))}
            {failCount > 0 && (
              <div className="flex items-center gap-2 py-1.5 px-2 bg-rose-50 border border-rose-200/60 rounded-lg text-[10px] text-rose-700 mt-1">
                <AlertTriangle size={11} />
                {failCount} check{failCount !== 1 ? 's' : ''} failing — fix before export.
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function HODLockExport() {
  const {
    departmentProgress, lockTerm, unlockTerm, exportClassCSV,
    isExporting, refreshDepartmentProgress, lockedTerms,
    refreshLockedTerms,
  } = useHOD();

  const [locking,   setLocking]   = useState(null);
  const [exporting, setExporting] = useState(null);
  const [confirmLock, setConfirmLock] = useState(null);
  const [confirmUnlock, setConfirmUnlock] = useState(null);

  const handleLock = async (clsId) => {
    setConfirmLock({ id: clsId, title: 'Lock Term?', message: 'All marks will be sealed and no further edits allowed. Proceed?', type: 'lock' });
  };

  const doLock = async (clsId) => {
    setLocking(clsId);
    try {
      const oldVal = auditTrail.captureSnapshot({ status: 'PENDING' });
      await lockTerm(clsId);
      const newVal = auditTrail.captureSnapshot({ status: 'LOCKED' });
      await auditTrail.logChange('class_term', clsId, oldVal, newVal, 'Term locked by HOD');
      eventBus.emit('term-locked', { classId: clsId });
      await refreshDepartmentProgress();
      await refreshLockedTerms();
    } catch (e) {
      console.error('Lock failed:', e);
    } finally {
      setLocking(null);
      setConfirmLock(null);
    }
  };

  const handleUnlock = async (clsId) => {
    setConfirmUnlock({ id: clsId, title: 'Unlock Term?', message: 'This will allow teachers to edit marks again. Proceed?', type: 'unlock' });
  };

  const doUnlock = async (clsId) => {
    try {
      const oldVal = auditTrail.captureSnapshot({ status: 'LOCKED' });
      await unlockTerm(clsId);
      const newVal = auditTrail.captureSnapshot({ status: 'PENDING' });
      await auditTrail.logChange('class_term', clsId, oldVal, newVal, 'Term unlocked by HOD');
      eventBus.emit('term-unlocked', { classId: clsId });
      await refreshDepartmentProgress();
      await refreshLockedTerms();
    } catch (e) {
      console.error('Unlock failed:', e);
    } finally {
      setConfirmUnlock(null);
    }
  };

  const handleExport = async (clsId) => {
    setExporting(clsId);
    try {
      const blob = await exportClassCSV(clsId);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `WAEC_export_${clsId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      await auditTrail.logChange('class_term', clsId, {}, { exported: true }, 'WAEC CSV exported');
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setExporting(null);
    }
  };

  const sortedClasses = useMemo(() =>
    [...departmentProgress].sort((a, b) => (a.submissionPct || 0) - (b.submissionPct || 0)),
    [departmentProgress]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lock &amp; Export</h1>
              <p className="text-sm text-gray-500 mt-0.5">Finalize grades and generate WAEC exports — HOD-AR-4.x</p>
            </div>
            <button onClick={() => { refreshDepartmentProgress(); refreshLockedTerms(); }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Locked classes summary */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-[10px] font-medium text-gray-600">
              <ShieldCheck size={11} /> {departmentProgress.length} classes
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/60 rounded-lg text-[10px] font-bold text-emerald-700">
              <Lock size={11} /> {lockedTerms.length} locked
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/60 rounded-lg text-[10px] font-bold text-amber-700">
              <Clock size={11} /> {sortedClasses.length - lockedTerms.length} pending
            </div>
          </div>

          {sortedClasses.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No classes to review"
              description="Department progress data not yet loaded."
            />
          ) : (
            sortedClasses.map((cls, i) => (
              <div key={cls.id || i} className="space-y-2">
                <ClassProgressCard
                  cls={cls}
                  onLock={handleLock}
                  onUnlock={handleUnlock}
                  onExport={handleExport}
                  locking={locking}
                  exporting={exporting}
                />
                {(cls.status === 'LOCKED') && (
                  <div className="px-4">
                    <WAECExportValidator
                      classes={[cls]}
                      exportFn={handleExport}
                      format="csv"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmationDialog
        open={!!confirmLock}
        title={confirmLock?.title}
        message={confirmLock?.message}
        confirmLabel="Lock"
        onConfirm={() => confirmLock && doLock(confirmLock.id)}
        onCancel={() => setConfirmLock(null)}
        variant="warning"
      />
      <ConfirmationDialog
        open={!!confirmUnlock}
        title={confirmUnlock?.title}
        message={confirmUnlock?.message}
        confirmLabel="Unlock"
        onConfirm={() => confirmUnlock && doUnlock(confirmUnlock.id)}
        onCancel={() => setConfirmUnlock(null)}
        variant="primary"
      />
    </div>
  );
}
