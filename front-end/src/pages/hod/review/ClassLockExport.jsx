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
        'bg-surface rounded-xl border transition-all p-4 cursor-pointer text-left focus-within:ring-2 focus-within:ring-brand-primary/10',
        isActive
          ? 'border-brand-primary ring-2 ring-brand-primary/10 shadow-xs'
          : isReady
            ? 'border-success/80 hover:border-success bg-surface/70'
            : 'border-border hover:border-border',
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-bold text-text-primary truncate">{cls?.className || cls?.name || 'Unassigned Matrix'}</p>
              <StatusBadge status={status} />
              {isReady && <CheckCircle2 size={12} className="text-success shrink-0" />}
            </div>
            {cls?.subject && <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wide">{cls.subject}</p>}
          </div>
          <div className="flex gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            {!isReady ? (
              <button
                onClick={() => onLock(cls?.id)}
                disabled={locking === cls?.id}
                className="px-2.5 py-1.5 bg-brand-dark text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-brand-dark/90 flex items-center gap-1.5 disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
              >
                {locking === cls?.id ? <LoadingSpinner size="sm" /> : <Lock size={11} />}
                Lock Frame
              </button>
            ) : (
              <button
                onClick={() => onUnlock(cls?.id)}
                disabled={locking === cls?.id}
                className="px-2.5 py-1.5 bg-muted text-text-secondary text-[10px] font-bold uppercase tracking-wider rounded-lg hover:text-text-primary flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
              >
                {locking === cls?.id ? <LoadingSpinner size="sm" /> : <Unlock size={11} />}
                Unlock
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-medium text-text-secondary">Payload Density</span>
            <span className={cn('font-bold', pct >= 95 ? 'text-success' : pct >= 70 ? 'text-warning' : 'text-destructive')}>{pct}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
            <div className={cn('h-full rounded-full transition-all duration-500', pct >= 95 ? 'bg-success' : pct >= 70 ? 'bg-warning' : 'bg-destructive')} style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2 text-[10px] font-medium text-text-secondary">
          <span>Validation Rules Matrix</span>
          {checks.length > 0 ? (
            <span className={cn('font-bold px-1.5 py-0.5 rounded', failCount > 0 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success')}>
              {passCount}/{checks.length} Passed
            </span>
          ) : (
            <span className="text-text-secondary">No checks</span>
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
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-border text-text-secondary rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-xs">
          <Layers size={11} className="text-text-secondary" /> {sortedClasses.length} Tracked Units
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success/10 border border-success/20 rounded-lg text-[10px] font-bold text-success uppercase tracking-wider">
          <Lock size={11} className="text-success" /> {lockedClassCount} Sealed
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-warning/10 border border-warning/20 rounded-lg text-[10px] font-bold text-warning uppercase tracking-wider">
            <Clock size={11} className="text-warning" /> {pendingCount} Awaiting Review
          </div>
        )}
        {activeTermId &&
          (termLocked ? (
            <button onClick={() => setConfirmTermUnlock(true)} className="flex items-center gap-1.5 px-2.5 py-1 bg-warning/10 border border-warning/20 rounded-lg text-[10px] font-bold text-warning uppercase tracking-wider hover:bg-warning/20 transition-colors cursor-pointer shadow-xs">
              <Unlock size={11} className="text-warning" /> Release Term
            </button>
          ) : (
            <button onClick={() => setConfirmTermLock(true)} className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-primary/10 border border-brand-primary/20 rounded-lg text-[10px] font-bold text-brand-primary uppercase tracking-wider hover:bg-brand-primary/20 transition-colors cursor-pointer shadow-xs">
              <Lock size={11} className="text-brand-primary" /> Seal Term
            </button>
          ))}
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-6 items-start overflow-hidden p-6">
        <div className="md:col-span-2 flex flex-col space-y-3 h-full overflow-y-auto pr-1">
          {sortedClasses.length === 0 ? (
            <div className="bg-surface rounded-xl border border-border p-8 text-center shadow-xs">
              <ShieldCheck size={32} className="text-text-secondary mx-auto mb-2" />
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wide">No Verification Units</h4>
              <p className="text-[11px] text-text-secondary mt-1 leading-normal">Awaiting curriculum mapping pipelines.</p>
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

        <div className="md:col-span-3 bg-surface rounded-xl border border-border shadow-xs h-full flex flex-col overflow-hidden">
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
                <div className="px-5 py-4 border-b border-border bg-muted flex items-center justify-between gap-4">
                  <div>
                     <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Export Settings</h3>
                    <p className="text-[11px] text-text-secondary font-medium mt-0.5">Target: <span className="text-text-primary font-bold">{selectedClass.className}</span></p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {selectedClass.status === 'LOCKED' && (
                      <button
                        onClick={() => onExport(selectedClass.id)}
                        disabled={exporting === selectedClass.id}
                        className="px-3 py-1.5 bg-brand-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-brand-primary/90 flex items-center gap-1.5 disabled:opacity-40 shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        {exporting === selectedClass.id ? <LoadingSpinner size="sm" /> : <Download size={11} />}
                        Export CSV
                      </button>
                    )}
                    {(selectedClass.checks?.length ?? 0) > 0 && selectedClass.checks?.some((c) => !c.pass) && (
                      <button
                        onClick={() => openRevision(selectedClass)}
                        className="px-3 py-1.5 bg-warning text-text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-warning/90 flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <MessageSquare size={11} />
                        Request Revision
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  <div className="bg-muted border border-border rounded-xl p-4 space-y-2.5">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                      <FileSpreadsheet size={12} className="text-text-secondary" />
                      Internal Quality Parameters Analysis
                    </h4>
                    {Array.isArray(selectedClass.checks) && selectedClass.checks.length > 0 ? (
                      selectedClass.checks.map((check, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs py-0.5">
                          {check.pass ? <CheckCircle2 size={12} className="text-success shrink-0" /> : <XCircle size={12} className="text-destructive shrink-0" />}
                          <span className={cn('font-medium', check.pass ? 'text-text-secondary' : 'text-destructive font-bold')}>{check.label}</span>
                        </div>
                      ))
                    ) : (
                      <EmptyState context="grades" variant="compact" />
                    )}
                    {(selectedClass.checks?.length ?? 0) > 0 && selectedClass.checks?.some((c) => !c.pass) && (
                      <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-[11px] text-destructive font-medium flex items-start gap-2 leading-relaxed">
                        <AlertTriangle size={13} className="text-destructive shrink-0 mt-0.5" />
                        <span>Failing structural checks will reject WAEC clearing house submission. Release seal or re-evaluate inside the pipeline dashboard.</span>
                      </div>
                    )}
                  </div>

                  {selectedClass.status === 'LOCKED' ? (
                    <div className="border border-border rounded-xl pt-1">
                      <WAECExportValidator classes={[selectedClass]} exportFn={onExport} format="csv" />
                    </div>
                  ) : (
                    <div className="border border-dashed border-border rounded-xl p-6 text-center text-text-secondary text-xs italic bg-muted/30">
                      Commit the frame seal lock to initialize WAEC formatting validations.
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="m-auto text-center py-12 max-w-xs">
                <ShieldCheck size={28} className="text-text-secondary mx-auto mb-2" />
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">No Selection</h4>
                <p className="text-[11px] text-text-secondary mt-1">Select an active class track to inspect compliance logs.</p>
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
              <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">Request Grade Revision</h3>
              <button onClick={() => setRevisionModal(null)} className="p-1.5 hover:bg-muted rounded-lg transition-all text-text-secondary hover:text-text-primary">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-xs text-text-secondary font-medium">
                Class: <span className="text-text-primary font-bold">{revisionModal.className}</span>
                {revisionModal.subject && <span className="text-text-secondary ml-2">— {revisionModal.subject}</span>}
              </p>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1.5">Issue / Instruction for Teacher</label>
                <textarea
                  value={revisionText}
                  onChange={(e) => setRevisionText(e.target.value)}
                  placeholder="Describe what needs to be revised..."
                  className="w-full rounded-xl border border-border bg-surface p-3 text-xs font-medium text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none"
                  rows={4}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2 bg-muted">
              <button onClick={() => setRevisionModal(null)} className="px-4 py-2 bg-surface border border-border rounded-lg text-xs font-bold text-text-secondary hover:bg-muted cursor-pointer">
                Cancel
              </button>
              <button
                onClick={submitRevision}
                disabled={!revisionText.trim() || revisionSubmitting}
                className="px-4 py-2 bg-warning text-text-primary text-xs font-bold rounded-lg hover:bg-warning/90 flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
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
