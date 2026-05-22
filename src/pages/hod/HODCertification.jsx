import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Unlock, Download, AlertCircle, FileSpreadsheet,
  ShieldCheck, ArrowRight, ChevronRight, X, Pencil, Save,
  RotateCcw, CheckCircle2, History, Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { generateWAECCSV } from '../../services/hodService';

/* ─── small helpers ─────────────────────────────────────────────────────── */

function StatusBadge({ status }) {
  const map = {
    LOCKED:   { cls: 'bg-emerald-50 text-emerald-700', icon: <Lock size={12} /> },
    SUBMITTED:{ cls: 'bg-blue-50 text-blue-700', icon: <Unlock size={12} /> },
    DRAFT:    { cls: 'bg-amber-50 text-amber-700', icon: <Unlock size={12} /> },
  };
  const cfg = map[status] || map.DRAFT;
  return (
    <span className={cn('px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2', cfg.cls)}>
      {cfg.icon} {status}
    </span>
  );
}

function GradeBadge({ grade }) {
  const map = {
    A1:'bg-emerald-50 text-emerald-700', B2:'bg-emerald-50 text-emerald-700',
    B3:'bg-blue-50 text-blue-700',   C4:'bg-sky-50 text-sky-700',
    C5:'bg-sky-50 text-sky-700',     C6:'bg-sky-50 text-sky-700',
    D7:'bg-amber-50 text-amber-700', E8:'bg-orange-50 text-orange-700',
    F9:'bg-red-50 text-red-700',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-black', map[grade] || 'bg-gray-50 text-gray-600')}>
      {grade}
    </span>
  );
}

/* ─── row detail drawer ────────────────────────────────────────────────── */

function RowDetailDrawer({ row, onClose, onComment, onReject, onExport }) {
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState(row?.hodComment || '');
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSaveComment = useCallback(async () => {
    if (!row?.recordId) return;
    await onComment?.(row.recordId, comment);
    setEditing(false);
  }, [row?.recordId, comment, onComment]);

  const handleReject = useCallback(async () => {
    if (!row?.recordId || !rejectReason.trim()) return;
    setLoading(true);
    try {
      await onReject?.(row.recordId, rejectReason);
      setShowReject(false);
      setRejectReason('');
    } finally {
      setLoading(false);
    }
  }, [row?.recordId, rejectReason, onReject]);

  const handleExportRow = useCallback(() => {
    const exportable = (row?.progress || 0) === 100 &&
      (row?.status === 'LOCKED' || row?.status === 'SUBMITTED');
    if (exportable && onExport) {
      onExport(row);
    }
  }, [row, onExport]);

  if (!row) return null;

  /* Sample student rows drawn from the class row */
  const students = (row.students || []).slice(0, 10);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl border-l border-gray-100 z-50 overflow-y-auto"
      >
        {/* header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black italic text-gray-900">{row.name}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{row.class}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 hover:bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* ── grade comparison toggle ── */}
          <button
            onClick={() => {
              setComparison(c => !c);
              if (!comparison) {
                /* show skeleton-ready state — real call happens when both term IDs exist */
              }
            }}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
              <History size={14} />
              Term-Over-Term Comparison
            </span>
            <span className="text-[10px] font-black text-emerald-600">{comparison ? 'Hide' : 'Show'}</span>
          </button>
          <AnimatePresence>
            {comparison && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-slate-50 rounded-2xl border border-slate-100 p-5 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Prev Term Scores</span>
                  <CheckCircle2 size={14} className="text-emerald-500" />
                </div>
                <div className="space-y-2">
                  {students.slice(0, 4).map((s, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <span className="w-24 truncate text-gray-600 font-medium">{s.name}</span>
                      <span className="text-gray-400 text-xs">{s.prevRaw ?? '—'}</span>
                      <ArrowRight size={12} className="text-gray-300" />
                      <span className="text-gray-900 font-bold">{s.raw}</span>
                      <span className={cn(
                        'text-[10px] font-black',
                        (s.raw || 0) >= (s.prevRaw || 0) ? 'text-emerald-600' : 'text-rose-600'
                      )}>
                        {(s.raw || 0) - (s.prevRaw || 0) > 0 ? '+' : ''}
                        {(s.raw || 0) - (s.prevRaw || 0)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[9px] text-gray-400 uppercase tracking-widest">
                  Source: term-over-term audit log
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── HOD comment ── */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Pencil size={14} />
                HOD Remark
              </span>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
            <AnimatePresence mode="wait">
              {!editing ? (
                <motion.p
                  key="view"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-xs text-gray-600 leading-relaxed min-h-[48px] break-words"
                >
                  {comment || <span className="text-gray-300 italic">No remark added yet.</span>}
                </motion.p>
              ) : (
                <motion.div key="edit" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="w-full text-xs p-3 bg-white rounded-xl border border-gray-200 text-gray-900 resize-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                    placeholder="Add a remark for this class result..."
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className={cn(
                      'text-[9px]',
                      comment.trim().length < 10 ? 'text-rose-500 font-black' : 'text-gray-400'
                    )}>
                      {comment.trim().length < 10
                        ? `⚠ Short — ${comment.trim().length}/10 chars — see HOD-AR-2.2`
                        : `${comment.trim().length} chars`}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditing(false); setComment(comment); }}
                        className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveComment}
                        disabled={!comment.trim()}
                        className={cn(
                          'text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all flex items-center gap-2',
                          comment.trim()
                            ? 'bg-emerald-900 text-white hover:bg-black'
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        )}
                      >
                        <Save size={12} /> Save
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {row.recordId && (
              <button
                onClick={() => { setRejectReason(''); setShowReject(true); }}
                className="mt-3 w-full py-2 text-[10px] font-black text-rose-600 uppercase tracking-widest border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={12} />
                Reject Revision
              </button>
            )}
          </div>

          {/* ── WAEC Export ── */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-3">
              <Download size={14} />
              WAEC Export
            </span>
            <button
              onClick={handleExportRow}
              disabled={(row.progress || 0) < 100 || row.status !== 'LOCKED'}
              className={cn(
                'w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2',
                (row.progress || 0) === 100 && row.status === 'LOCKED'
                  ? 'bg-emerald-900 text-white hover:bg-black shadow-lg shadow-emerald-900/10'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-200'
              )}
            >
              <Download size={14} />
              Download WAEC CSV
            </button>
            <p className="mt-2 text-[9px] text-gray-400">
              Requires 100% completion + LOCKED status (HOD-AR-4.3).
            </p>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── main component ───────────────────────────────────────────────────── */

export function HODCertification() {
  const {
    departmentProgress,
    auditLogs,
    lockedTerms,
    lockTerm,
    startExport,
    resolveAlert,
    addHODComment,
    rejectRevision,
    refreshDepartmentProgress,
    refreshLockedTerms,
    isExporting,
  } = useHOD();

  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [lockLoading, setLockLoading] = useState(false);
  const [exportClasses, setExportClasses] = useState(new Set());
  const [confirmMode, setConfirmMode] = useState(false); // phase-2 alert in confirmation modal

  /* Load data on mount */
  React.useEffect(() => {
    refreshDepartmentProgress();
    refreshLockedTerms();
  }, [refreshDepartmentProgress, refreshLockedTerms]);

  /* A term is "locked at HOD level" when at least one class of the term is server-locked. */
  const lockedTermIds = React.useMemo(
    () => new Set((lockedTerms || []).map(t => t.termId)),
    [lockedTerms],
  );

  /* ─── Lock validation ────────────────────────────────────────────────────
   * HOD-AR-4.1: prevent lock if any class is not at 100 %.
   * HOD-AR-4.2: teacher update routes must see is_locked and refuse writes.
   * We surface a confirmation-phase "phase-2" warning when an alert is
   * unresolved to surface the WAEC STP risk banner. */
  const canLockDeptMatrix = useCallback(() => {
    const classes = departmentProgress || [];
    return classes.length > 0 && classes.every((c) => c.progress === 100);
  }, [departmentProgress]);

  const isAllClassesLocked = useCallback(() => {
    const classes = departmentProgress || [];
    return classes.length > 0 && classes.every((c) => c.status === 'LOCKED');
  }, [departmentProgress]);

  const hasUnresolvedAlerts = (auditLogs || []).some(
    (l) => ['PENDING', 'FLAGGED'].includes(l.status) || l.action === 'INTERVENTION_ALERT',
  );

  /* ─── Lock handler ─────────────────────────────────────────────────────── */
  const handleLockDeptMatrix = useCallback(async () => {
    if (!canLockDeptMatrix()) return;
    if (hasUnresolvedAlerts) {
      setConfirmMode(true);
      setShowLockConfirm(true);
      return;
    }
    setShowLockConfirm(true);
  }, [canLockDeptMatrix, hasUnresolvedAlerts]);

  const confirmLockDeptMatrix = useCallback(async () => {
    setLockLoading(true);
    try {
      const classes = departmentProgress || [];
      const termId = classes[0]?.termId || 'current';
      await lockTerm(termId);
      /* optimistic UI update */
      setShowLockConfirm(false);
      setConfirmMode(false);
      refreshDepartmentProgress();
      refreshLockedTerms();
    } catch (e) {
      console.error('[HODCertification] lock failed:', e);
    } finally {
      setLockLoading(false);
    }
  }, [departmentProgress, lockTerm, refreshDepartmentProgress, refreshLockedTerms]);

  /* ─── Export handler ───────────────────────────────────────────────────── */
  const handleExportWAEC = useCallback(
    async (cls) => {
      const termId = (departmentProgress?.[0]?.termId) || 'current';
      const students = cls.students || [];
      const filename = `WAEC_${cls.subjectName || 'Subject'}_${cls.class}`;

      setExportClasses(prev => new Set([...prev, cls.id]));
      try {
        await startExport(async () => {
          if (students.length > 0) {
            /* client-side WAEC CSV generation — matches teacher sheet format */
            const csv = generateWAECCSV(students, cls.subjectName, cls.class);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            return blob;
          }
          /* server-side API call when no local student data */
          await (await import('../../services/hodService')).exportWAECCSVDownload(
            termId, cls.class, cls.subjectName, students,
          );
        })();
      } catch (e) {
        console.error('[HODCertification] export failed:', e);
      } finally {
        setExportClasses(prev => { const s = new Set(prev); s.delete(cls.id); return s; });
      }
    },
    [departmentProgress, startExport],
  );

  /* ─── derived state ────────────────────────────────────────────────────── */
  const classes = departmentProgress || [];
  const exportableCount = classes.filter(c => (c.progress || 0) === 100 && c.status === 'LOCKED').length;
  const allLockingAllowed = canLockDeptMatrix();

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 lg:p-12 pb-32 lg:pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* ── Page header ─────────────────────────────────────────────── */}
        <header className="mb-10 flex flex-wrap justify-between items-end gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/10">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none font-display italic">
                Certification Command
              </h1>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1">
                Surgical verification &amp; departmental batch export
              </p>
            </div>
          </div>

          <button
            onClick={handleLockDeptMatrix}
            disabled={!allLockingAllowed || lockLoading}
            className={cn(
              'px-6 py-3 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-3',
              allLockingAllowed && !lockLoading
                ? 'bg-gray-900 hover:bg-black shadow-gray-900/10'
                : 'bg-gray-300 text-gray-400 cursor-not-allowed shadow-none'
            )}
            title={
              !allLockingAllowed
                ? 'Lock unavailable: one or more classes are below 100 %'
                : 'Seal all class results — irreversible'
            }
          >
            {lockLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            Lock Dept Matrix
          </button>
        </header>

        {/* ── Export readiness banner ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl flex items-center justify-between"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            <p className="text-xs font-medium text-emerald-800">
              {exportableCount}/{classes.length} classes export-ready
              &nbsp;<span className="text-emerald-500 font-black">(LOCKED + 100 %)</span>
            </p>
          </div>
          {!allLockingAllowed && (
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-lg">
              HOD-AR-4.1 — Complete all classes before locking
            </span>
          )}
        </motion.div>

        {/* ── Class rows ───────────────────────────────────────────────── */}
        {classes.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
            <FileSpreadsheet size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-sm text-gray-400 font-medium">No department data loaded.</p>
            <p className="text-xs text-gray-300 mt-1">Data will appear here once the backend is live.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {classes.map((cls, idx) => {
            const exportable = (cls.progress || 0) === 100 && cls.status === 'LOCKED';
            const exporting = exportClasses.has(cls.id);

            return (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all"
              >
                {/* icon */}
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                  cls.status === 'LOCKED'   ? 'bg-emerald-50 text-emerald-600' :
                  cls.status === 'SUBMITTED'? 'bg-blue-50 text-blue-600'     :
                                            'bg-amber-50 text-amber-600',
                )}>
                  {cls.status === 'LOCKED'
                    ? <ShieldCheck size={24} />
                    : <FileSpreadsheet size={24} />}
                </div>

                {/* identity */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[15px] font-black text-gray-900 tracking-tight">{cls.name}</h3>
                    <span className="text-gray-300">•</span>
                    <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{cls.class}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Teacher: {cls.teacherName || cls.teacher || '—'}
                  </p>
                </div>

                {/* progress */}
                <div className="flex flex-col items-end gap-1.5 px-6 border-x border-gray-50 h-10 justify-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sync</span>
                    <span className="text-[11px] font-black text-gray-900">{cls.progress ?? 0}%</span>
                  </div>
                  <div className="w-24 h-1 bg-gray-50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-1000"
                      style={{ width: `${cls.progress ?? 0}%` }}
                    />
                  </div>
                </div>

                {/* actions */}
                <div className="flex items-center gap-3 pl-2">
                  <StatusBadge status={cls.status} />

                  <button
                    onClick={() => handleExportWAEC(cls)}
                    disabled={!exportable || exporting}
                    className={cn(
                      'h-10 px-4 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest',
                      exportable && !exporting
                        ? 'bg-emerald-900 text-white hover:bg-black shadow-lg shadow-emerald-900/10'
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
                    )}
                    title={
                      !allLockingAllowed
                        ? 'Cannot export — not all classes are LOCKED'
                        : !exportable
                          ? 'Lock this class first'
                          : 'Export WAEC CSV'
                    }
                  >
                    {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    WAEC
                  </button>

                  <button
                    onClick={() => setSelectedRow(cls)}
                    className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                    title="View details"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Integrity Lock Protocol banner ─────────────────────────────── */}
        <div
          className="mt-10 p-6 rounded-3xl flex gap-5 items-center"
          style={{
            backgroundColor: isAllClassesLocked() ? 'rgba(220, 38, 38, 0.05)' : 'rgba(251, 191, 36, 0.05)',
            border: '1px solid',
            borderColor: isAllClassesLocked() ? 'rgba(220, 38, 38, 0.2)' : 'rgba(251, 191, 36, 0.2)',
          }}
        >
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            isAllClassesLocked() ? 'bg-rose-50' : 'bg-amber-50',
          )}>
            <AlertCircle size={20} style={{ color: isAllClassesLocked() ? '#dc2626' : '#d97706' }} />
          </div>
          <div>
            <h4 className={cn(
              'text-[11px] font-black uppercase tracking-[0.2em] mb-1',
              isAllClassesLocked() ? 'text-rose-700' : 'text-amber-700',
            )}>
              {isAllClassesLocked()
                ? 'Terminal Seal Active — All Records Frozen'
                : 'Integrity Lock Protocol'}
            </h4>
            <p
              className="text-[10px] font-medium leading-relaxed max-w-2xl"
              style={{ color: isAllClassesLocked() ? 'rgba(153,27,27,0.7)' : 'rgba(146,64,14,0.7)' }}
            >
              Locking result sets is a terminal operation. Once sealed, all teacher edit
              rights are suspended. Verify 30/70 weighting and audit modification logs
              before execution.
              {isAllClassesLocked() && ' Emergency unlock requires administrator override.'}
            </p>
          </div>
        </div>

        {/* ── Lock confirmation modal ────────────────────────────────────── */}
        {showLockConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowLockConfirm(false); setConfirmMode(false); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-3xl overflow-hidden border border-slate-100"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-600" />

              {/* HOD-AR-2.2 — short justification warning */}
              {confirmMode && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3"
                >
                  <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">
                      HOD-AR-2.2 ⚠ Unsolved Alerts
                    </p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      One or more audit log items or intervention alerts remain unresolved.
                      Exporting in this state may waive WAEC compliance. Review all alerts
                      before finalizing.
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-8 mx-auto">
                <AlertCircle size={40} className="text-rose-600" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 text-center italic mb-4">
                Execute Final Seal?
              </h3>
              <p className="text-gray-500 text-center text-sm font-medium leading-relaxed mb-8">
                This action will
                <span className="font-black text-rose-600"> permanently freeze </span>
                all marks in this department. Teacher edit rights will be suspended.
              </p>

              <div className="space-y-3 mb-10">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact Scope</p>
                  <p className="text-sm font-black text-slate-900">
                    {classes.length} Class Batches
                    {' · '}
                    {(classes.reduce((s, c) => s + (c.students?.length || 0), 0))
                      || (classes.reduce((s, c) => s + (c.studentCount || 0), 0))} Students
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">WAEC Compliance</p>
                  <p className="text-sm font-black text-emerald-800">
                    {(classes.filter(c => c.status === 'LOCKED' && (c.progress || 0) === 100)).length}
                    /{classes.length} classes export-ready
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => { setShowLockConfirm(false); setConfirmMode(false); }}
                  className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                >
                  Abort
                </button>
                <button
                  onClick={confirmLockDeptMatrix}
                  disabled={lockLoading}
                  className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-rose-900/20 hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                >
                  {lockLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  {lockLoading ? 'Sealing…' : 'Finalize Department'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* ── Row detail drawer ──────────────────────────────────────────── */}
      <RowDetailDrawer
        row={selectedRow}
        onClose={() => setSelectedRow(null)}
        onComment={addHODComment}
        onReject={rejectRevision}
        onExport={handleExportWAEC}
      />
    </div>
  );
}
