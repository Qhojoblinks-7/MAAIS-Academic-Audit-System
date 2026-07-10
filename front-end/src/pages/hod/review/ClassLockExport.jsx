import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Download,
  Layers,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  MessageSquare,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge, LoadingSpinner, EmptyState, ConfirmationDialog } from '@/components/molecules';
import { WAECExportValidator } from '@/components/organisms';
import { toast } from '@/components/ui/toast';

function ClassProgressCard({ cls, isActive, onSelect, onLock, onUnlock, locking }) {
  const pct = cls?.submissionPct ?? 0;
  const status = cls?.status || 'PENDING';
  const isReady = status === 'LOCKED';
  const checks = useMemo(() => (Array.isArray(cls?.checks) ? cls.checks.filter(Boolean) : []), [cls?.checks]);
  const passCount = checks.filter((c) => c.pass).length;
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
                onClick={() => onLock(cls?.id)}
                disabled={locking === cls?.id}
                className="px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-slate-800 flex items-center gap-1.5 disabled:opacity-40 transition-colors shadow-3xs cursor-pointer"
              >
                {locking === cls?.id ? <LoadingSpinner size="sm" /> : <Lock size={11} />}
                Lock Frame
              </button>
            ) : (
              <button
                onClick={() => onUnlock(cls?.id)}
                disabled={locking === cls?.id}
                className="px-2.5 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-gray-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
              >
                {locking === cls?.id ? <LoadingSpinner size="sm" /> : <Unlock size={11} />}
                Unlock
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-medium text-gray-400">Payload Density</span>
            <span className={cn('font-bold', pct >= 95 ? 'text-emerald-600' : pct >= 70 ? 'text-amber-600' : 'text-rose-600')}>{pct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
            <div className={cn('h-full rounded-full transition-all duration-500', pct >= 95 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-rose-500')} style={{ width: `${pct}%` }} />
          </div>
        </div>

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

export function ClassLockExport({ pipeline, activeClassId, onSelect }) {
  const {
    sortedClasses,
    locking,
    exporting,
    termLocked,
    activeTermId,
    handleLock,
    handleUnlock,
    handleExport,
    doLockTerm,
    doUnlockTerm,
    openRevision,
    revisionModal,
    revisionText,
    setRevisionText,
    setRevisionModal,
    revisionSubmitting,
    submitRevision,
  } = pipeline;

  const [confirmTermLock, setConfirmTermLock] = useState(false);
  const [confirmTermUnlock, setConfirmTermUnlock] = useState(false);

  const selectedClass = useMemo(
    () => sortedClasses.find((c) => c.id === activeClassId) || sortedClasses[0] || null,
    [sortedClasses, activeClassId],
  );

  const lockedClassCount = sortedClasses.filter((c) => c.status === 'LOCKED').length;
  const pendingCount = Math.max(0, sortedClasses.length - lockedClassCount);

  const onExport = (clsId) => {
    const res = handleExport(clsId);
    if (res && res.error === 'checks') {
      toast.error('Cannot export: validation checks are failing.');
    } else if (res && res.error) {
      toast.error(res.error);
    } else if (res && res.ok) {
      toast.success('Export compiled');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-center gap-2 flex-wrap px-6 py-3 border-b border-border/60">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-3xs">
          <Layers size={11} className="text-gray-400" /> {sortedClasses.length} Tracked Units
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/50 rounded-lg text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
          <Lock size={11} className="text-emerald-500" /> {lockedClassCount} Sealed
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/50 rounded-lg text-[10px] font-bold text-amber-700 uppercase tracking-wider">
            <Clock size={11} className="text-amber-500" /> {pendingCount} Awaiting Review
          </div>
        )}
        {activeTermId &&
          (termLocked ? (
            <button onClick={() => setConfirmTermUnlock(true)} className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/50 rounded-lg text-[10px] font-bold text-amber-700 uppercase tracking-wider hover:bg-amber-100 transition-colors cursor-pointer shadow-3xs">
              <Unlock size={11} className="text-amber-500" /> Release Term
            </button>
          ) : (
            <button onClick={() => setConfirmTermLock(true)} className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200/50 rounded-lg text-[10px] font-bold text-indigo-700 uppercase tracking-wider hover:bg-indigo-100 transition-colors cursor-pointer shadow-3xs">
              <Lock size={11} className="text-indigo-500" /> Seal Term
            </button>
          ))}
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-6 items-start overflow-hidden p-6">
        <div className="md:col-span-2 flex flex-col space-y-3 h-full overflow-y-auto pr-1">
          {sortedClasses.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200/70 p-8 text-center shadow-3xs">
              <ShieldCheck size={32} className="text-gray-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">No Verification Units</h4>
              <p className="text-[11px] text-gray-400 mt-1 leading-normal">Awaiting curriculum mapping pipelines.</p>
            </div>
          ) : (
            sortedClasses.map((cls) => (
              <ClassProgressCard
                key={cls?.id}
                cls={cls}
                isActive={activeClassId === cls?.id}
                onSelect={() => onSelect(cls?.id)}
                onLock={handleLock}
                onUnlock={handleUnlock}
                locking={locking}
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
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">Target: <span className="text-gray-700 font-bold">{selectedClass.className}</span></p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedClass.status === 'LOCKED' && (
                      <button
                        onClick={() => onExport(selectedClass.id)}
                        disabled={exporting === selectedClass.id}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-indigo-700 flex items-center gap-1.5 disabled:opacity-40 shadow-3xs transition-all active:scale-95 cursor-pointer"
                      >
                        {exporting === selectedClass.id ? <LoadingSpinner size="sm" /> : <Download size={11} />}
                        Export CSV
                      </button>
                    )}
                    {(selectedClass.checks?.length ?? 0) > 0 && selectedClass.checks?.some((c) => !c.pass) && (
                      <button
                        onClick={() => openRevision(selectedClass)}
                        className="px-3 py-1.5 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-amber-700 flex items-center gap-1.5 shadow-3xs transition-all active:scale-95 cursor-pointer"
                      >
                        <MessageSquare size={11} />
                        Request Revision
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  <div className="bg-slate-50 border border-gray-200/50 rounded-xl p-4 space-y-2.5">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <FileSpreadsheet size={12} className="text-gray-400" />
                      Internal Quality Parameters Analysis
                    </h4>
                    {Array.isArray(selectedClass.checks) && selectedClass.checks.length > 0 ? (
                      selectedClass.checks.map((check, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs py-0.5">
                          {check.pass ? <CheckCircle2 size={12} className="text-emerald-500 shrink-0" /> : <XCircle size={12} className="text-rose-500 shrink-0" />}
                          <span className={cn('font-medium', check.pass ? 'text-gray-600' : 'text-rose-600 font-bold')}>{check.label}</span>
                        </div>
                      ))
                    ) : (
                      <EmptyState context="grades" variant="compact" />
                    )}
                    {(selectedClass.checks?.length ?? 0) > 0 && selectedClass.checks?.some((c) => !c.pass) && (
                      <div className="mt-3 p-3 bg-rose-50/60 border border-rose-100 rounded-lg text-[11px] text-rose-800 font-medium flex items-start gap-2 leading-relaxed">
                        <AlertTriangle size={13} className="text-rose-500 shrink-0 mt-0.5" />
                        <span>Failing structural checks will reject WAEC clearing house submission. Release seal or re-evaluate inside the pipeline dashboard.</span>
                      </div>
                    )}
                  </div>

                  {selectedClass.status === 'LOCKED' ? (
                    <div className="border border-gray-100 rounded-xl pt-1">
                      <WAECExportValidator classes={[selectedClass]} exportFn={onExport} format="csv" />
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 text-xs italic bg-slate-50/20">
                      Commit the frame seal lock to initialize WAEC formatting validations.
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="m-auto text-center py-12 max-w-xs">
                <ShieldCheck size={28} className="text-gray-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">No Selection</h4>
                <p className="text-[11px] text-gray-400 mt-1">Select an active class track to inspect compliance logs.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmTermLock}
        title="Seal Entire Term?"
        message="This freezes all grade entries across every class in this term department-wide. Individual classes will also show as sealed. Proceed?"
        confirmLabel="Confirm Seal Term"
        onConfirm={() => { setConfirmTermLock(false); doLockTerm(); }}
        onCancel={() => setConfirmTermLock(false)}
        variant="warning"
      />
      <ConfirmationDialog
        open={confirmTermUnlock}
        title="Release Term Seal?"
        message="This unlocks editing across all grade entries for this term. The system will keep capturing modification histories."
        confirmLabel="Release Term Seal"
        onConfirm={() => { setConfirmTermUnlock(false); doUnlockTerm(); }}
        onCancel={() => setConfirmTermUnlock(false)}
        variant="primary"
      />

      {revisionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm" onClick={() => setRevisionModal(null)} />
          <div className="relative w-full max-w-lg bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface shrink-0">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Request Grade Revision</h3>
              <button onClick={() => setRevisionModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-xs text-gray-500 font-medium">
                Class: <span className="text-gray-900 font-bold">{revisionModal.className}</span>
                {revisionModal.subject && <span className="text-gray-400 ml-2">— {revisionModal.subject}</span>}
              </p>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Issue / Instruction for Teacher</label>
                <textarea
                  value={revisionText}
                  onChange={(e) => setRevisionText(e.target.value)}
                  placeholder="Describe what needs to be revised..."
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs font-medium text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  rows={4}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/40">
              <button onClick={() => setRevisionModal(null)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer">
                Cancel
              </button>
              <button
                onClick={submitRevision}
                disabled={!revisionText.trim() || revisionSubmitting}
                className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                {revisionSubmitting ? <LoadingSpinner size="sm" /> : <MessageSquare size={12} />}
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
