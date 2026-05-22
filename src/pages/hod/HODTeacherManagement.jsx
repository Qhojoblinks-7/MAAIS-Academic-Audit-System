import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';

// ── Toast helper ──────────────────────────────────────────────────────────────
function useToast(timeout = 4000) {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), timeout);
  }, [timeout]);
  return { toast, showToast: show };
}

// ── Confirm modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', danger ? 'bg-red-50' : 'bg-amber-50')}>
            <AlertTriangle size={20} className={cn(danger ? 'text-red-600' : 'text-amber-600')} />
          </div>
          <h3 className="text-base font-black text-gray-900 italic font-display">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border border-gray-100 text-gray-500 hover:bg-gray-50 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={cn('flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all font-display',
              danger ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-emerald-900 text-white hover:bg-black',
            )}>
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── View-As active banner ──────────────────────────────────────────────────────
function ImpersonationBanner({ teacherName, onStop }) {
  return (
    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="bg-purple-950 text-white py-3 px-6 flex items-center justify-between shadow-xl">
      <div className="flex items-center gap-3">
        <ShieldCheck size={18} className="text-purple-300" />
        <p className="text-[11px] font-black uppercase tracking-widest">
          VIEWING AS: <span className="italic font-display ml-1">{teacherName || 'Teacher'}</span>
          {' '}· All actions are logged in the audit trail.
        </p>
      </div>
      <button onClick={onStop} className="flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
        <LogOut size={13} />
        <span className="text-[10px] font-black uppercase tracking-widest">Stop Impersonating</span>
      </button>
    </motion.div>
  );
}

// ── Random password generator ──────────────────────────────────────────────────
function randomPassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#%&*';
  return Array.from(crypto.getRandomValues(new Uint32Array(length)))
    .map(n => chars[n % chars.length]).join('');
}

// ── View-As modal ──────────────────────────────────────────────────────────────
function ViewAsModal({ teacher, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  return (
    teacher ? (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={onClose}>
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Eye size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 italic font-display">View As Teacher</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{teacher?.name || teacher?.fullName || 'Selected teacher'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Reason for impersonation (required)</p>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g., Debug grading workflow"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-50 rounded-xl text-[12px] text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-purple-500/10"/>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-[10px] text-amber-800 leading-relaxed">
            <p className="font-black mb-1 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert size={11} /> Audit Warning
            </p>
            This session will be logged. All actions taken while impersonating are recorded and may be reviewed by the director.
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border border-gray-100 text-gray-500 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={() => onConfirm(reason)}
              disabled={!reason.trim()}
              className="flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest bg-purple-600 text-white hover:bg-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <Eye size={13} /> Enter View-As
            </button>
          </div>
        </motion.div>
      </motion.div>
    ) : null
  );
}

// ── Show password with copy ────────────────────────────────────────────────────
function PasswordDisplay({ label, password, onCopy, isVisible, onToggleVisible }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-50">
      <div className="flex-1 font-mono text-[12px] font-black text-gray-800 tracking-wider break-all">
        {isVisible ? password : '•'.repeat(password.length)}
      </div>
      <button onClick={onToggleVisible} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400">
        {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
      <button onClick={() => onCopy(password)}
        className="px-3 py-1.5 bg-gray-200 rounded-lg text-[9px] font-black uppercase tracking-wider text-gray-700 hover:bg-gray-300 transition-all">
        Copy
      </button>
    </div>
  );
}

// ── Reset password success ─────────────────────────────────────────────────────
function ResetSuccessCard({ teacherName, password }) {
  const [show, setShow] = useState(true);
  const [visible, setVisible] = useState(false);

  const copy = (txt) => {
    navigator.clipboard.writeText(txt);
    // minimal inline feedback
    setShow(false);
    setTimeout(() => setShow(true), 2000);
  };

  if (!show) return (
    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-[12px] font-black text-emerald-700">
      Copied to clipboard ✓
    </div>
  );

  return (
    <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="p-5 bg-emerald-950 text-white rounded-2xl border border-emerald-800 shadow-xl space-y-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={16} className="text-emerald-400" />
        <p className="text-[12px] font-black uppercase tracking-widest">Password Reset</p>
      </div>
      <p className="text-[10px] text-emerald-300/80">Share this temporary password with <span className="font-black italic font-display text-white">{teacherName}</span>:</p>
      <PasswordDisplay label="Temporary Password" password={password}
          isVisible={visible} onToggleVisible={() => setVisible(v => !v)}
        onCopy={copy} />
      <p className="text-[8px] text-emerald-400/60 uppercase tracking-wider">Password must be changed on first login</p>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════════
export function HODTeacherManagement() {
  const {
    departmentTeachers, setDepartmentTeachers,
    refreshDepartmentTeachers,
    resetTeacherPasswordAction,
    impersonateTeacherAction,
    stopImpersonationAction,
    viewAsTeacherId,
    viewAsTeacherName,
    setViewAsTeacherName,
  } = useHOD();

  const { toast, showToast } = useToast();

  // local UI
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTeacher, setActiveTeacher] = useState(null);   // teacher currently being reset
  const [newPass, setNewPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetResults, setResetResults] = useState({});       // { teacherId: password }
  const [expandedId, setExpandedId] = useState(null);
  const [selectedForViewAs, setSelectedForViewAs] = useState(null);

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    refreshDepartmentTeachers().then(() => setLoading(false));
  }, []);

  // ── Derive filtered teachers ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (departmentTeachers || []).filter(t =>
      !q ||
      (t.name || t.fullName || '').toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q) ||
      (t.subjects || []).some(s => s.toLowerCase().includes(q)),
    );
  }, [departmentTeachers, search]);

  // ── Reset password ──────────────────────────────────────────────────────────
  const handleReset = useCallback(async (teacher) => {
    // If user typed a custom password use it; otherwise generate random
    const pass = newPass.trim() || randomPassword(10);

    if (pass.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    setResetting(true);
    try {
      const result = await resetTeacherPasswordAction(teacher.id, pass);
      const temp = result?.temporaryPassword || result?.password || pass;
      setResetResults(prev => ({ ...prev, [teacher.id]: temp }));
      showToast(`Password reset for ${teacher.name || teacher.id}`);
      setNewPass('');
      setActiveTeacher(null);
    } catch (e) {
      showToast(e.message || 'Failed to reset password', 'error');
    } finally {
      setResetting(false);
    }
  }, [newPass]);

  // ── View-As start ──────────────────────────────────────────────────────────
  const handleStartViewAs = useCallback(async (teacher, reason) => {
    try {
      await impersonateTeacherAction(teacher.id, reason);
      setViewAsTeacherName(teacher.name || teacher.fullName || teacher.id);
      setSelectedForViewAs(null);
      showToast(`Now viewing as ${teacher.name || teacher.id}`);
    } catch (e) {
      showToast(e.message || 'Failed to enter view-as mode', 'error');
    }
  }, []);

  // ── Stop view-as ───────────────────────────────────────────────────────────
  const handleStopViewAs = useCallback(async () => {
    try {
      await stopImpersonationAction();
      setViewAsTeacherName(null);
      showToast('View-as mode ended');
    } catch (e) {
      showToast(e.message || 'Failed to exit view-as mode', 'error');
    }
  }, []);

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 lg:p-12 pb-32">
      <ViewAsModal
        teacher={selectedForViewAs}
        onClose={() => { setViewAsOpen(false); setSelectedForViewAs(null); }}
        onConfirm={(reason) => handleStartViewAs(selectedForViewAs, reason)}
      />
      {viewAsTeacherId && viewAsTeacherName && (
        <ImpersonationBanner teacherName={viewAsTeacherName} onStop={handleStopViewAs} />
      )}

      <div className={cn('max-w-6xl mx-auto', viewAsTeacherId ? 'pt-12' : '')}>
        {toast && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-6 right-6 z-[200]">
            <div className={cn('px-5 py-4 rounded-2xl shadow-2xl text-[11px] font-black border flex items-center gap-2',
              toast.type === 'error' ? 'bg-red-950 text-red-100 border-red-800' : 'bg-emerald-950 text-white border-emerald-800')}>
              {toast.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
              {toast.msg}
            </div>
          </motion.div>
        )}

        {/* ── Header ── */}
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/10">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display">Teacher Management</h1>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1">Password reset · View-As impersonation · Audit-logged</p>
            </div>
          </div>
        </header>

        {/* ── Search bar ── */}
        <div className="max-w-2xl mb-8">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or subject…"
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-[13px] font-black placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all italic font-display"/>
          </div>
        </div>

        {/* ── Teacher table ── */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Department Staff</p>
              <p className="text-sm font-black font-display italic text-gray-900 mt-0.5">
                {filtered.length} teacher{filtered.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <button onClick={() => { refreshDepartmentTeachers(); showToast('Teacher list refreshed'); }}
              className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-all">
              <RefreshCw size={15} />
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <RefreshCw size={28} className="mx-auto mb-3 text-gray-200 animate-spin" />
              <p className="text-xs font-black uppercase tracking-wider text-gray-400">Loading teachers…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={36} className="mx-auto mb-3 text-gray-200" />
              <p className="text-xs font-black uppercase tracking-wider text-gray-400">No teachers found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map(teacher => {
                const isOpen = expandedId === teacher.id;
                const resetPass   = resetResults[teacher.id];
                const activeReset = activeTeacher === teacher.id;

                return (
                  <div key={teacher.id} className="hover:bg-gray-50/80 transition-all">
                    {/* Row header */}
                    <div onClick={() => setExpandedId(isOpen ? null : teacher.id)}
                      className="p-5 flex items-center gap-4 cursor-pointer">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-900 shrink-0">
                        {teacher.avatar ? <img src={teacher.avatar} className="w-full h-full rounded-2xl object-cover" alt="" /> : (
                          <span className="text-base font-black italic font-display">{(teacher.name || '?').charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-black text-gray-900 italic font-display">{teacher.name || teacher.fullName || 'Unknown'}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{teacher.email} · {teacher.subjects?.join(', ') || 'General'}</p>
                      </div>

                      {/* Status badges */}
                      <div className="flex items-center gap-2 shrink-0">
                        {teacher.status !== 'ACTIVE' && teacher.status !== 'Active' && (
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-gray-100 text-gray-600 border border-gray-200">
                            {teacher.status}
                          </span>
                        )}
                        {resetPass && (
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-emerald-50 text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={9} /> Reset
                          </span>
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); setActiveTeacher(activeTeacher === teacher.id ? null : teacher.id); }}
                          className="p-2 rounded-xl border border-gray-100 hover:bg-emerald-50 text-gray-400 hover:text-emerald-700 transition-all">
                          <KeyRound size={14} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedForViewAs(teacher); setViewAsOpen(true); }}
                          className="p-2 rounded-xl border border-gray-100 hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-all">
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>

                    {/* ── Expanded: password reset ─────────────────── */}
                    <AnimatePresence>
                      {activeReset && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden">
                          <div className="px-5 pb-5 pt-0 space-y-3">
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                              {!resetPass ? (
                                <>
                                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                    Generate a temporary password for {teacher.name || teacher.id}:
                                  </p>

                                  <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Custom Password (optional)</label>
                                    <div className="flex gap-2">
                                      <input type={showNewPass ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)}
                                        placeholder="Leave blank to generate random"
                                        className="flex-1 px-4 py-2.5 bg-white border border-gray-50 rounded-xl text-[12px] text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"/>
                                      <button onClick={() => setShowNewPass(!showNewPass)}
                                        className="p-2.5 bg-white border border-gray-50 rounded-xl text-gray-400 hover:text-gray-600">
                                        {showNewPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                      </button>
                                    </div>
                                    {newPass && (
                                      <PasswordDisplay label="Preview" password={newPass} isVisible={showNewPass}
                                        onCopy={() => navigator.clipboard.writeText(newPass)}
                                        onToggleVisible={() => setShowNewPass(prev => !prev)} />
                                    )}
                                  </div>

                                  <button onClick={() => handleReset(teacher)} disabled={resetting}
                                    className="px-5 py-2.5 bg-emerald-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {resetting ? <><RefreshCw size={12} className="animate-spin" /> Resetting…</> : <><KeyRound size={12} /> Reset Password</>}
                                  </button>

                                  <div className="flex gap-2 pt-1">
                                    <button onClick={() => {
                                      setNewPass(randomPassword(10));
                                      showToast('Random password generated — click Reset to apply');
                                    }}
                                      className="px-3 py-1.5 bg-white border border-gray-100 rounded-lg text-[10px] font-black text-gray-600 hover:border-emerald-200 hover:text-emerald-700 transition-all flex items-center gap-1">
                                      <RefreshCw size={10} /> Generate Random
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <ResetSuccessCard teacherName={teacher.name || teacher.id} password={resetPass} />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ── Expanded: teacher details ────────────────── */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden">
                          <div className="px-5 pb-5 pt-0">
                            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-50 grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px]">
                              <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Status</p>
                                <span className={cn('inline-block px-2 py-0.5 text-[9px] font-black rounded-lg', (teacher.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'))}>
                                  {teacher.status || 'ACTIVE'}
                                </span>
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Role</p>
                                <p className="font-black text-gray-900 italic font-display uppercase">{teacher.role || 'TEACHER'}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">ID</p>
                                <p className="font-black text-gray-900">{teacher.id}</p>
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Subject(s)</p>
                                <p className="text-gray-700">{teacher.subjects?.join(', ') || '—'}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
