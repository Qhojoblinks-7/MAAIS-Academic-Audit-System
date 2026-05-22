import React, { useState, useEffect, useMemo } from 'react';
import {
  LifeBuoy, Send, AlertTriangle, CheckCircle2, Clock,
  XCircle, Search, MessageSquare, ArrowUpRight, RefreshCw,
  Cpu, HardDrive, ThermometerSun, Zap, Plus, ChevronDown,
  Users, PhoneIcon, Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import {
  EmptyState, StatusBadge, ActionButtonGroup, ConfirmationDialog,
  AlertSeverityChip, LoadingSpinner, HODCommentInput, DateRangeFilter
} from '../../components/molecules';
import { SupportTicketKanban, SystemHealthMonitor } from '../../components/organisms';
import { eventBus } from '../../services/eventBus';
import { notification } from '../../services/notificationService';

const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'];
const CATEGORY_OPTIONS = ['system', 'grades', 'reports', 'account', 'other'];

function CreateTicketDrawer({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    subject: '', category: 'system', priority: 'medium', description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.description.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm({ subject: '', category: 'system', priority: 'medium', description: '' });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl"
        >
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <LifeBuoy size={18} />
              </div>
              <h3 className="text-base font-bold text-gray-900">New Support Ticket</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-600">
              <XCircle size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Subject</p>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Brief description of the issue"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Category</p>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Priority</p>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Description</p>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Provide as much detail as possible (screenshots, steps to reproduce, error messages)…"
                rows={6}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
              />
            </div>
            <HODCommentInput
              label="Additional Notes (optional)"
              placeholder="Any extra context for the support team…"
              onSubmit={(_comment) => {}}
            />
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 shrink-0 bg-gray-50/50">
            <button onClick={onClose} className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting || !form.subject.trim() || !form.description.trim()}
              className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <LoadingSpinner size="sm" /> : <Send size={14} />}
              {submitting ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function HODSupportPage() {
  const {
    supportTickets, ticketTabs, setTicketTabs, ticketFilter, setTicketFilter,
    isLoadingSupport, refreshSupportTickets,
    createTicket, updateTicketAction, escalateTicketAction,
    refreshSystemHealth, systemHealth, refreshEscalatedIssues, escalatedIssues,
    refreshContactChannels, contactChannels,
  } = useHOD();

  const [search, setSearch] = useState('');
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showEscalateDrawer, setShowEscalateDrawer] = useState(false);
  const [escalateTicketId, setEscalateTicketId] = useState(null);
  const [escalateReason, setEscalateReason] = useState('');
  const [subTab, setSubTab] = useState('tickets');

  useEffect(() => {
    refreshSupportTickets();
    refreshSystemHealth();
    refreshEscalatedIssues();
    refreshContactChannels();
  }, []);

  const filteredTickets = useMemo(() => {
    let list = supportTickets;
    if (ticketTabs !== 'all') {
      list = list.filter(t => (t.status || '').toUpperCase() === ticketTabs.toUpperCase());
    }
    if (ticketFilter !== 'all') {
      list = list.filter(t => (t.priority || '').toUpperCase() === ticketFilter.toUpperCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        (t.subject || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.id || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [supportTickets, ticketTabs, ticketFilter, search]);

  const tabs = [
    { id: 'all',       label: 'All',       count: supportTickets.length },
    { id: 'OPEN',      label: 'Open',      count: supportTickets.filter(t => t.status === 'OPEN').length },
    { id: 'IN_PROGRESS', label: 'In Progress', count: supportTickets.filter(t => t.status === 'IN_PROGRESS').length },
    { id: 'PENDING',   label: 'Pending',   count: supportTickets.filter(t => t.status === 'PENDING').length },
    { id: 'CLOSED',    label: 'Closed',    count: supportTickets.filter(t => t.status === 'CLOSED').length },
  ];

  const handleCreateTicket = async (form) => {
    await createTicket({
      subject: form.subject,
      description: form.description,
      category: form.category,
      priority: form.priority,
    });
    eventBus.emit('support-ticket-created', { message: 'Ticket submitted', priority: form.priority });
  };

  const handleEscalate = async () => {
    if (!escalateTicketId || !escalateReason.trim()) return;
    await escalateTicketAction(escalateTicketId, { reason: escalateReason });
    setEscalateTicketId(null);
    setEscalateReason('');
    setShowEscalateDrawer(false);
  };

  const statusColor = (val) => {
    if (val === 'UP' || val === 'HEALTHY' || val === 'ok') return 'emerald';
    if (val === 'WARNING' || val === 'WARN') return 'amber';
    return 'rose';
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
              <p className="text-sm text-gray-500 mt-1">Ticket tracking · system health · escalation management</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { refreshSupportTickets(); refreshSystemHealth(); }}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                <RefreshCw size={14} /> Refresh
              </button>
              <button
                onClick={() => setShowCreateDrawer(true)}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-medium hover:bg-rose-700 flex items-center gap-2 shadow-sm"
              >
                <Plus size={14} /> New Ticket
              </button>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1 w-fit">
            {['tickets', 'escalations', 'contacts'].map((t) => (
              <button
                key={t}
                onClick={() => setSubTab(t)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                  subTab === t
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Tickets Tab */}
          {subTab === 'tickets' && (
            <div className="space-y-5">
              {/* Filter toolbar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Tab buttons */}
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setTicketTabs(tab.id === 'IN_PROGRESS' ? 'IN_PROGRESS' : tab.id)}
                      className={cn(
                        'px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider',
                        ticketTabs === (tab.id === 'IN_PROGRESS' ? 'IN_PROGRESS' : tab.id === 'all' ? 'all' : tab.id.toUpperCase())
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {tab.label}
                      <span className={cn('ml-1.5', ticketTabs === 'all' && tab.id === 'all' ? 'text-emerald-200' : 'text-gray-400')}>
                        ({tab.count})
                      </span>
                    </button>
                  ))}
                  <div className="ml-auto relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search tickets…"
                      className="w-48 pl-7 pr-7 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <XCircle size={11} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Kanban or list */}
              {filteredTickets.length > 0 ? (
                <SupportTicketKanban />
              ) : (
                <EmptyState icon={LifeBuoy} title="No tickets found" description={search ? 'No tickets match your search.' : 'No support tickets exist or all are resolved.'} />
              )}
            </div>
          )}

          {/* Escalations Tab */}
          {subTab === 'escalations' && (
            <motion.div key="esc" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <ArrowUpRight size={16} className="text-amber-600" />
                  <h2 className="text-sm font-bold text-gray-900">Escalated Issues</h2>
                  <span className="ml-auto px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">{escalatedIssues.length}</span>
                </div>
                {escalatedIssues.length === 0 ? (
                  <EmptyState icon={ArrowUpRight} title="No escalations" description="All unresolved issues have been handled." />
                ) : (
                  <div className="space-y-2">
                    {escalatedIssues.map((issue, i) => (
                      <div key={issue.id || i} className="flex items-start gap-3 p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl">
                        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-gray-900 truncate">{issue.title || issue.subject || 'Untitled'}</p>
                            <AlertSeverityChip severity={issue.severity || 'MEDIUM'} />
                          </div>
                          <p className="text-[10px] text-gray-600 mt-0.5">{(issue.description || '').slice(0, 120)}…</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Contacts Tab */}
          {subTab === 'contacts' && (
            <motion.div key="contacts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={16} className="text-emerald-600" />
                  <h2 className="text-sm font-bold text-gray-900">Contact Channels</h2>
                </div>
                <div className="space-y-2">
                  {contactChannels && (
                    <>
                      {[
                        { key: 'email',    label: 'Email',    icon: Mail,   value: contactChannels.email ?? false },
                        { key: 'sms',      label: 'SMS',      icon: PhoneIcon, value: contactChannels.sms ?? false },
                        { key: 'whatsapp', label: 'WhatsApp', icon: Globe,  value: contactChannels.whatsapp ?? false },
                      ].map(({ key, label, icon: Icon, value }) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Icon size={14} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">{label}</span>
                          </div>
                          <button
                            onClick={() => {/* TODO: toggle channel via API */}}
                            className={cn(
                              "w-9 h-5 rounded-full transition-all relative",
                              value ? "bg-emerald-600" : "bg-gray-200"
                            )}
                          >
                            <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-transform mt-0.5", value ? "ml-4" : "ml-0.5")} />
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* System health summary */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu size={16} className="text-blue-600" />
                  <h2 className="text-sm font-bold text-gray-900">System Health Snapshot</h2>
                </div>
                {systemHealth ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Uptime',      icon: Zap,          value: systemHealth.uptime ?? '—',       color: 'emerald' },
                      { label: 'CPU',         icon: Cpu,          value: systemHealth.cpu ?? '—',          color: 'blue' },
                      { label: 'Memory',      icon: HardDrive,    value: systemHealth.memory ?? '—',       color: 'amber' },
                      { label: 'Disk',        icon: ThermometerSun, value: systemHealth.disk ?? '—',       color: 'rose' },
                    ].map(({ label, icon: Icon, value, color }) => (
                      <div key={label} className="p-3 bg-gray-50 rounded-xl text-center">
                        <Icon size={16} className={cn("mx-auto mb-1",
                          color === 'emerald' ? 'text-emerald-600' :
                          color === 'blue'    ? 'text-blue-600'    :
                          color === 'amber'   ? 'text-amber-600'   : 'text-rose-600'
                        )} />
                        <p className="text-sm font-bold text-gray-900">{value}</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={Cpu} title="No health data" description="System health data not loaded." />
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Escalate Drawer */}
      <AnimatePresence>
        {showEscalateDrawer && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm flex items-center justify-end"
            onClick={() => setShowEscalateDrawer(false)}
          >
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <ArrowUpRight size={18} className="text-amber-600" />
                  <h3 className="text-base font-bold text-gray-900">Escalate Ticket</h3>
                </div>
                <button onClick={() => setShowEscalateDrawer(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-600">
                  <XCircle size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6 space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Ticket ID</p>
                  <p className="text-sm font-mono font-bold text-gray-800">{escalateTicketId || '—'}</p>
                </div>
                <HODCommentInput
                  label="Escalation Reason"
                  placeholder="Why should this ticket be escalated? Include context, urgency details…"
                  maxLength={500}
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                />
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 shrink-0 bg-gray-50/50">
                <button onClick={() => setShowEscalateDrawer(false)}
                  className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleEscalate} disabled={!escalateReason.trim()}
                  className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  <ArrowUpRight size={14} />
                  Escalate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateTicketDrawer open={showCreateDrawer} onClose={() => setShowCreateDrawer(false)} onSubmit={handleCreateTicket} />
    </div>
  );
}
