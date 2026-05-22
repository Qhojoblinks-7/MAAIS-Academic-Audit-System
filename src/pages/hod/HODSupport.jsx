import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LifeBuoy,
  Activity,
  MessageSquare,
  Send,
  CheckCircle2,
  ChevronRight,
  Shield,
  Zap,
  Terminal,
  Cpu,
  AlertTriangle,
  Timer,
  Clock,
  Wrench,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Server,
  BarChart3,
  Inbox,
  Megaphone,
  Phone,
  Mail,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';

// ── Constants ──────────────────────────────────────────────────────────────────
const SLA_MINUTES = 30;
const STATUS_ORDER = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const EVENT_COLORS = {
  USER_PROFILE_UPDATE: 'bg-blue-400',
  COMPLAINT_UPDATE: 'bg-red-400',
  SYSTEM_UPDATE: 'bg-green-400',
  SYSTEM_ACCESS: 'bg-gray-400',
};

const PRIORITY_STYLES = {
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  MEDIUM: 'bg-amber-100 text-amber-800 border-amber-200',
  LOW: 'bg-gray-100 text-gray-600 border-gray-200',
};

function statusBadge(s) {
  if (s === 'OPEN') return 'bg-red-100 text-red-800';
  if (s === 'IN_PROGRESS') return 'bg-amber-100 text-amber-800';
  if (s === 'RESOLVED') return 'bg-emerald-100 text-emerald-800';
  if (s === 'CLOSED') return 'bg-gray-100 text-gray-600';
  return 'bg-gray-50 text-gray-500';
}

function statusLabel(s) {
  if (s === 'OPEN') return 'Open';
  if (s === 'IN_PROGRESS') return 'In Progress';
  if (s === 'RESOLVED') return 'Resolved';
  if (s === 'CLOSED') return 'Closed';
  return s || 'Unknown';
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function useToast(timeout = 3500) {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), timeout);
  }, [timeout]);
  return { toast, showToast: show };
}

// ── Helper quarries ────────────────────────────────────────────────────────────
function minAgo(ms) { return Math.max(0, Math.floor((Date.now() - ms) / 60000)); }
function timeAgo(str) { if (!str) return '—'; return `${minAgo(new Date(str).getTime())} min ago`; }

// ── Confirm modal ──────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
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
            className={cn(
              'flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all',
              danger
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-emerald-900 text-white hover:bg-black',
            )}>
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// ── Ticket row ─────────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════════
function TicketRow({ ticket, onUpdate, onEscalate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);
  const age = useMemo(() => minAgo(new Date(ticket.createdAt || Date.now()).getTime()), [ticket.createdAt]);
  const slaBreach = age > SLA_MINUTES && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED';
  const canEscalate = ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED';

  const comments = ticket.comments || [];
  const newCommentRef = React.useRef(null);

  const resolveComment = () => {
    const input = newCommentRef.current;
    if (!input) return;
    const txt = input.value.trim();
    if (!txt) return;
    onUpdate(ticket.id, { comments: [...comments, { author: 'HOD', body: txt, createdAt: new Date().toISOString() }] });
    input.value = '';
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all">
        {/* ── Row header ── */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Left: title + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={cn('px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border', statusBadge(ticket.status))}>
                {statusLabel(ticket.status)}
              </span>
              {ticket.priority && (
                <span className={cn('px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border', PRIORITY_STYLES[ticket.priority])}>
                  {ticket.priority}
                </span>
              )}
              {slaBreach && (
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                  <Timer size={9} /> SLA Breach
                </span>
              )}
              {ticket.escalated && (
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                  Escalated
                </span>
              )}
            </div>
            <p className="text-[13px] font-black text-gray-900 italic font-display truncate">{ticket.subject || ticket.title || 'Untitled'}</p>
            <p className="text-[10px] text-gray-400 mt-1">
              #{ticket.id?.slice(0, 8) || '—'} · {timeAgo(ticket.createdAt)} · {ticket.departmentName || ticket.department || 'All Departments'}
            </p>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setExpanded(!expanded)}
              className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-all">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <div className="relative">
              <button onClick={() => setActionMenu(actionMenu === ticket.id ? null : ticket.id)}
                className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-all">
                <AlertCircle size={16} />
              </button>
              {actionMenu === ticket.id && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-10 overflow-hidden">
                  {STATUS_ORDER.filter(s => s !== ticket.status).map(s => (
                    <button key={s} onClick={() => { onUpdate(ticket.id, { status: s }); setActionMenu(null); }}
                      className="w-full px-4 py-2.5 text-[11px] font-black text-gray-700 hover:bg-gray-50 uppercase tracking-wider">
                      Mark {statusLabel(s)}
                    </button>
                  ))}
                  {canEscalate && (
                    <button onClick={() => { onEscalate(ticket.id); setActionMenu(null); }}
                      className="w-full px-4 py-2.5 text-[11px] font-black text-purple-700 hover:bg-purple-50 uppercase tracking-wider flex items-center gap-2">
                      <Megaphone size={12} /> Escalate
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Expanded panel ── */}
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-gray-50">
              <div className="p-5 space-y-4">
                {/* Description */}
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</p>
                  <p className="text-[13px] text-gray-700 leading-relaxed">{ticket.description || 'No description provided.'}</p>
                </div>

                {/* Timestamps */}
                <div className="flex gap-6 text-[10px] text-gray-400">
                  <span className="flex items-center gap-1.5"><Clock size={10} /> Created: {new Date(ticket.createdAt || Date.now()).toLocaleString()}</span>
                  {ticket.updatedAt && <span>Updated: {new Date(ticket.updatedAt).toLocaleString()}</span>}
                </div>

                {/* Comments thread */}
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <MessageSquare size={10} /> Thread ({comments.length})
                  </p>
                  <div className="space-y-3">
                    {comments.map((c, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">
                          {c.author} · {timeAgo(c.createdAt)}
                        </p>
                        <p className="text-[12px] text-gray-700 leading-relaxed">{c.body}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add comment */}
                  <div className="flex gap-2 mt-3">
                    <input ref={newCommentRef} onKeyDown={e => e.key === 'Enter' && resolveComment()}
                      placeholder="Add a note…" className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-50 rounded-xl text-[12px] text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"/>
                    <button onClick={resolveComment}
                      className="px-4 py-2.5 bg-emerald-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-1.5">
                      <Send size={11} /> Reply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// ── System Health Card ─────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════════
function HealthCard({ label, value, sub, status, Icon }) {
  const isOk = status !== 'ERROR';
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2 rounded-xl', isOk ? 'bg-emerald-50' : 'bg-red-50')}>
          <Icon size={16} className={isOk ? 'text-emerald-700' : 'text-red-600'} />
        </div>
        <div className={cn('w-2 h-2 rounded-full', isOk ? 'bg-emerald-400 animate-pulse' : 'bg-red-500 animate-pulse')} />
      </div>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-gray-900 italic font-display mt-0.5">{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// ── Support Toast ──────────────────────────────────────────────────────────────
function SupportToast({ toast }) {
  if (!toast) return null;
  return (
    <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
      className="fixed bottom-24 right-6 z-[200]">
      <div className={cn(
        'px-5 py-4 rounded-2xl shadow-2xl text-[12px] font-black border flex items-center gap-3',
        toast.type === 'error' ? 'bg-red-950 text-red-100 border-red-800' : 'bg-emerald-950 text-white border-emerald-800',
      )}>
        {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
        {toast.msg}
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════════
export function HODSupport() {
  const {
    supportTickets, ticketFilter, setTicketFilter, ticketTabs, setTicketTabs,
    getFilteredTickets, isTicketSLABreach, calcTicketAge,
    createTicket, updateTicketAction, escalateTicketAction, updateChannelPrefsAction,
    refreshSupportTickets, refreshSystemHealth, refreshEscalatedIssues, refreshContactChannels,
    systemHealth, escalatedIssues, contactChannels, isExporting,
  } = useHOD();

  const { toast, showToast } = useToast();

  // local UI state
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tickets');      // tickets | health
  const [formOpen, setFormOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');
  const [submitting, setSubmitting] = useState(false);

  // ── Mount: fetch all support data ──────────────────────────────────────────
  useEffect(() => {
    Promise.all([refreshSupportTickets(), refreshSystemHealth(), refreshEscalatedIssues(), refreshContactChannels()])
      .then(() => setLoading(false));
  }, []);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => getFilteredTickets(), [supportTickets, ticketTabs, ticketFilter]);
  const tabCounts = useMemo(() => {
    const counts = { all: supportTickets.length };
    STATUS_ORDER.forEach(s => { counts[s] = supportTickets.filter(t => (t.status || '').toUpperCase() === s).length; });
    return counts;
  }, [supportTickets]);

  const slaCount = useMemo(() =>
    supportTickets.filter(t => isTicketSLABreach(t.createdAt)).length,
    [supportTickets]);

  // ── Submit ticket ───────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) { showToast('Subject is required', 'error'); return; }
    setSubmitting(true);
    try {
      await createTicket({ subject: newSubject, description: newDesc, priority: newPriority });
      showToast('Support ticket created');
      setNewSubject('');
      setNewDesc('');
      setNewPriority('MEDIUM');
      setFormOpen(false);
    } catch { showToast('Failed to create ticket', 'error'); }
    finally { setSubmitting(false); }
  }, [newSubject, newDesc, newPriority]);

  // ════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 lg:p-12 pb-32 lg:pb-24">
      <div className="max-w-6xl mx-auto">
        {toast && <SupportToast toast={toast} />}

        {/* ── Header ── */}
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/10">
              <LifeBuoy size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display italic">Executive Support</h1>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1">Priority technical assistance · SLA &lt; 30 min</p>
            </div>
          </div>
        </header>

        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Open Tickets', value: tabCounts.OPEN ?? 0, icon: Inbox, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'In Progress', value: tabCounts.IN_PROGRESS ?? 0, icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'SLA Breached', value: slaCount, icon: Timer, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Escalated', value: escalatedIssues.length, icon: Megaphone, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('p-1.5 rounded-lg', kpi.bg)}>
                  <kpi.icon size={14} className={kpi.color} />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900 italic font-display">{kpi.value}</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mt-0.5">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left: Ticket Tracker */}
          <div className="xl:col-span-2 space-y-6">
            {/* Tabs + filter bar */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-gray-50 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex gap-1 bg-gray-50 rounded-xl p-1">
                  {['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((t) => (
                    <button key={t} onClick={() => setTicketTabs(t)}
                      className={cn(
                        'px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all',
                        ticketTabs === t
                          ? 'bg-emerald-900 text-white shadow-sm'
                          : 'text-gray-500 hover:bg-white',
                      )}>
                      {t === 'all' ? 'All' : statusLabel(t)} <span className="ml-1 opacity-60">({tabCounts[t] || 0})</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => setFormOpen(!formOpen)}
                  className="px-4 py-2 bg-emerald-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-1.5">
                  {formOpen ? 'Cancel' : <>+ New Ticket</>}
                </button>
              </div>

              {/* New ticket form */}
              <AnimatePresence>
                {formOpen && (
                  <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="overflow-hidden border-b border-gray-50">
                    <div className="p-6 space-y-4 bg-gray-50/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Department Issue Subject *</label>
                          <input type="text" required value={newSubject} onChange={e => setNewSubject(e.target.value)}
                            placeholder="e.g., Bulk certification override needed"
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-[12px] font-black placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all italic font-display"/>
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Priority</label>
                          <div className="flex gap-2 flex-wrap">
                            {PRIORITY_ORDER.map(p => (
                              <button key={p} type="button" onClick={() => setNewPriority(p)}
                                className={cn('px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all',
                                  newPriority === p ? 'bg-emerald-900 text-white border-emerald-900' : 'bg-white border-gray-100 text-gray-600 hover:border-emerald-200',
                                )}>
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Oversight Details</label>
                        <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)}
                          placeholder="Describe the department-wide issue or staff assistance needed..."
                          rows={3}
                          className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-[12px] text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all resize-none italic"/>
                      </div>
                      <button type="submit" disabled={submitting}
                        className="px-6 py-2.5 bg-emerald-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed">
                        {submitting ? 'Creating…' : <><Send size={12} /> Sync to Support</>}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* ── Ticket list ── */}
              <div className="p-5 space-y-4">
                {loading ? (
                  <div className="py-12 text-center text-gray-400 text-sm">Loading tickets…</div>
                ) : filtered.length === 0 ? (
                  <div className="py-12 text-center">
                    <Ticket size={32} className="mx-auto mb-3 text-gray-200" />
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider">No tickets match this filter</p>
                  </div>
                ) : (
                  filtered.map(t => (
                    <TicketRow key={t.id} ticket={t} onUpdate={updateTicketAction} onEscalate={escalateTicketAction} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right: Health + Contact + Escalated */}
          <div className="space-y-8">
            {/* ── System Health ── */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Activity size={14} className="text-emerald-800" /> System Health
                </h2>
                <button onClick={refreshSystemHealth}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all">
                  <RefreshCw size={12} />
                </button>
              </div>

              {systemHealth ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <HealthCard label="Upload Speed"
                      value={systemHealth.uploadSpeed || systemHealth.cpu || systemHealth.uploadSpeedMbps || '—'}
                      sub={systemHealth.uploadStatus || ''} Icon={BarChart3} />
                    <HealthCard label="Server Status"
                      value={systemHealth.status || systemHealth.serverStatus || 'Online'}
                      sub="Last checked: just now" Icon={Server} />
                    <HealthCard label="CPU"
                      value={systemHealth.cpu != null ? `${systemHealth.cpu}%` : '—'}
                      sub={systemHealth.cpuStatus || 'Server Load'} Icon={Cpu} />
                    <HealthCard label="Memory"
                      value={systemHealth.memory != null ? `${systemHealth.memory}%` : '—'}
                      sub={systemHealth.memoryStatus || 'RAM Usage'} Icon={Activity} />
                    <HealthCard label="Disk"
                      value={systemHealth.disk != null ? `${systemHealth.disk}%` : '—'}
                      sub={systemHealth.diskStatus || 'Storage'} Icon={Terminal} />
                    <HealthCard label="Services"
                      value={systemHealth.services?.online || systemHealth.servicesOnline || '—'}
                      sub={`of ${systemHealth.services?.total || 6} running`} Icon={Shield} />
                  </div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider text-center">
                    Last Updated: {new Date(systemHealth.lastUpdated || Date.now()).toLocaleString()}
                  </p>
                </>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400">
                  <Activity size={28} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-[11px] font-black uppercase tracking-wider">No health data yet</p>
                </div>
              )}
            </section>

            {/* ── Escalated Issues ── */}
            <section className="space-y-4">
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                <Megaphone size={14} className="text-purple-600" /> Escalated Issues
              </h2>
              {escalatedIssues.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center text-gray-400">
                  <Shield size={24} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-[10px] font-black uppercase tracking-wider">No active escalations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {escalatedIssues.map(issue => (
                    <div key={issue.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={cn('px-1.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg border', PRIORITY_STYLES[issue.severity])}>
                          {issue.severity}
                        </span>
                        <span className={cn('px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg', issue.resolved ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700')}>
                          {issue.resolved ? 'Resolved' : 'Active'}
                        </span>
                      </div>
                      <p className="text-[12px] font-black text-gray-900 italic font-display leading-snug">{issue.title || issue.subject || 'Untitled'}</p>
                      <p className="text-[9px] text-gray-400 mt-1">{timeAgo(issue.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Contact Channels ── */}
            <section className="space-y-4">
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                <MessageSquare size={14} className="text-blue-600" /> Contact Channels
              </h2>
              {contactChannels ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
                  {[
                    { key: 'email',    Icon: Mail },
                    { key: 'phone',    Icon: Phone },
                    { key: 'whatsapp', Icon: MessageSquare },
                  ].map(({ key, Icon }) => {
                    const v = contactChannels[key];
                    if (!v) return null;
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-50 rounded-lg">
                          <Icon size={12} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider capitalize">{key}</p>
                          <p className="text-[12px] font-black text-gray-900 truncate">{v}</p>
                        </div>
                        {contactChannels.preferredChannel === key && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[8px] font-black uppercase tracking-wider rounded-lg">Preferred</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center text-gray-400">
                  <Phone size={24} className="mx-auto mb-2 text-gray-200" />
                  <p className="text-[10px] font-black uppercase tracking-wider">No contact data</p>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* ── Managerial Support Channels ── */}
        <div className="mt-16 flex flex-wrap justify-center gap-4 pb-20 lg:pb-0">
          {[
            { label: 'HOD Handbook', icon: Terminal, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Oversight Training', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Managerial WhatsApp', icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Director Support', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((link, idx) => (
            <button key={idx} className="flex-1 min-w-[180px] p-5 bg-white border border-gray-50 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-all group">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-105', link.bg, link.color)}>
                <link.icon size={18} />
              </div>
              <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">{link.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
