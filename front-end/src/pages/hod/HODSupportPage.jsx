import React, { useState, useEffect, useMemo } from 'react';
import {
  LifeBuoy, Send, AlertTriangle, Search, RefreshCw,
  Cpu, HardDrive, ThermometerSun, Zap, Plus, XCircle,
  Users, PhoneIcon, Globe, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import {
  EmptyState, AlertSeverityChip, LoadingSpinner, HODCommentInput
} from '../../components/molecules';
import { SupportTicketKanban } from '../../components/organisms';
import { eventBus } from '../../services/eventBus';

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const CATEGORY_OPTIONS = ['SYSTEM', 'GRADES', 'REPORTS', 'ACCOUNT', 'OTHER'];

// ==========================================
// TICKET CREATION DRAWERS (SIDE SHEET)
// ==========================================
function CreateTicketDrawer({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    subject: '', category: 'SYSTEM', priority: 'MEDIUM', description: '', notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.description.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm({ subject: '', category: 'SYSTEM', priority: 'MEDIUM', description: '', notes: '' });
      onClose();
    } catch (err) {
      console.error("Failed compiling submission line", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-gray-100"
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
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
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Subject</p>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Brief description of the issue"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Category</p>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Priority</p>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Description Context</p>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Provide explicit logs details, reproduction steps, or unexpected system outputs..."
                  rows={5}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none bg-white"
                />
              </div>

              <HODCommentInput
                label="Additional Internal Notes (optional)"
                placeholder="Attach alternative tracking indexes or runtime context notes..."
                value={form.notes}
                onChange={(val) => setForm({ ...form, notes: val })}
              />
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 shrink-0 bg-gray-50/50">
              <button onClick={onClose} className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={submitting || !form.subject.trim() || !form.description.trim()}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                {submitting ? <LoadingSpinner size="sm" /> : <Send size={14} />}
                {submitting ? 'Submitting…' : 'Submit Ticket'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// CENTRALIZED COMPONENT PAGE WORKSPACE
// ==========================================
export function HODSupportPage() {
  const {
    supportTickets = [], 
    ticketTabs, 
    setTicketTabs, 
    ticketFilter, 
    setTicketFilter,
    createTicket, 
    escalateTicketAction,
    refreshSupportTickets, 
    refreshSystemHealth, 
    systemHealth, 
    refreshEscalatedIssues, 
    escalatedIssues = [],
    refreshContactChannels, 
    contactChannels,
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

  const tabsConfig = [
    { id: 'all',         label: 'All',         count: supportTickets.length },
    { id: 'OPEN',        label: 'Open',        count: supportTickets.filter(t => t.status === 'OPEN').length },
    { id: 'IN_PROGRESS', label: 'In Progress', count: supportTickets.filter(t => t.status === 'IN_PROGRESS').length },
    { id: 'PENDING',     label: 'Pending',     count: supportTickets.filter(t => t.status === 'PENDING').length },
    { id: 'CLOSED',      label: 'Closed',      count: supportTickets.filter(t => t.status === 'CLOSED').length },
  ];

  const handleCreateTicketSubmit = async (form) => {
    await createTicket({
      subject: form.subject,
      description: form.description,
      category: form.category,
      priority: form.priority,
      notes: form.notes
    });
    eventBus.emit('support-ticket-created', { message: 'Ticket submitted', priority: form.priority });
  };

  const handleEscalateSubmit = async () => {
    if (!escalateTicketId || !escalateReason.trim()) return;
    await escalateTicketAction(escalateTicketId, { reason: escalateReason });
    setEscalateTicketId(null);
    setEscalateReason('');
    setShowEscalateDrawer(false);
  };

  // Maps metric properties into dynamic visual state tracking colors
  const evaluateHealthStatus = (val) => {
    if (!val) return 'text-gray-400';
    const normalized = String(val).toUpperCase();
    if (normalized.includes('UP') || normalized.includes('HEALTHY') || normalized.includes('OK') || parseInt(val) < 75) {
      return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    }
    if (normalized.includes('WARN') || normalized.includes('WARNING') || (parseInt(val) >= 75 && parseInt(val) < 90)) {
      return 'text-amber-600 bg-amber-50 border-amber-100';
    }
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-5">

          {/* Core App View Bar */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
              <p className="text-sm text-gray-500 mt-1">Ticket tracking · system health · escalation management</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { refreshSupportTickets(); refreshSystemHealth(); refreshEscalatedIssues(); }}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-xs transition-colors"
              >
                <RefreshCw size={14} /> Refresh Stream
              </button>
              <button
                onClick={() => setShowCreateDrawer(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700 flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus size={14} /> New Ticket
              </button>
            </div>
          </div>

          {/* Context Segment Switch Links */}
          <div className="flex items-center gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1 w-fit">
            {['tickets', 'escalations', 'contacts'].map((t) => (
              <button
                key={t}
                onClick={() => setSubTab(t)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                  subTab === t
                    ? "bg-gray-900 text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Render Workspace Sections conditional toggling */}
          {subTab === 'tickets' && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-center gap-2 flex-wrap justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tabsConfig.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setTicketTabs(tab.id)}
                        className={cn(
                          'px-3 py-1.5 type-base text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider border',
                          ticketTabs === tab.id
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'
                        )}
                      >
                        {tab.label}
                        <span className={cn('ml-1.5 font-mono', ticketTabs === tab.id ? 'text-emerald-100' : 'text-gray-400')}>
                          ({tab.count})
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative min-w-[200px]">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search unique ticket tags..."
                      className="w-full pl-8 pr-8 py-1.5 text-xs bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white"
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <XCircle size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {filteredTickets.length > 0 ? (
                <SupportTicketKanban tickets={filteredTickets} />
              ) : (
                <EmptyState 
                  icon={LifeBuoy} 
                  title="No matching indices found" 
                  description={search ? 'No structural ticket matches the search syntax criteria.' : 'Your workspace tracking lanes are completely empty.'} 
                />
              )}
            </div>
          )}

          {subTab === 'escalations' && (
            <motion.div key="esc" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <h2 className="text-sm font-bold text-gray-900">Escalated Engineering Failures</h2>
                  <span className="ml-auto px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-mono font-bold rounded-full">{escalatedIssues.length}</span>
                </div>
                {escalatedIssues.length === 0 ? (
                  <EmptyState icon={CheckCircle2} title="All environments clear" description="No operational tasks are escalated at this block interval." />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {escalatedIssues.map((issue, i) => (
                      <div key={issue.id || i} className="flex flex-col p-4 bg-gray-50 border border-gray-200/60 rounded-xl shadow-xs">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-xs font-bold text-gray-900 truncate">{issue.title || issue.subject || 'System Incident'}</p>
                          <AlertSeverityChip severity={issue.severity || 'MEDIUM'} />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{issue.description || 'No analytical trace attached.'}</p>
                        <div className="mt-4 pt-3 border-t border-gray-200/50 flex items-center justify-between text-[10px] font-mono text-gray-400">
                          <span>ID: {issue.id?.slice(-8) || 'GEN-ERR'}</span>
                          <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">Awaiting Ops Action</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {subTab === 'contacts' && (
            <motion.div key="contacts" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Communication channels section */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-emerald-600" />
                    <h2 className="text-sm font-bold text-gray-900">Active Alert Routing Channels</h2>
                  </div>
                  <div className="space-y-2">
                    {contactChannels ? (
                      [
                        { key: 'email',    label: 'SMTP Email Portal',      icon: Mail,      value: contactChannels.email ?? false },
                        { key: 'sms',      label: 'SMS Gateway Broadcast',   icon: PhoneIcon, value: contactChannels.sms ?? false },
                        { key: 'whatsapp', label: 'WhatsApp Secure Stream', icon: Globe,     value: contactChannels.whatsapp ?? false },
                      ].map(({ key, label, icon: Icon, value }) => (
                        <div key={key} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3">
                            <Icon size={15} className="text-gray-500" />
                            <span className="text-xs font-medium text-gray-900">{label}</span>
                          </div>
                          <button
                            onClick={() => {/* Trigger endpoint modification */}}
                            className={cn(
                              "w-9 h-5 rounded-full transition-all relative outline-none",
                              value ? "bg-emerald-600" : "bg-gray-200"
                            )}
                          >
                            <div className={cn("w-4 h-4 bg-white rounded-full shadow-xs transition-transform absolute top-0.5", value ? "right-0.5" : "left-0.5")} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">Loading channel states...</p>
                    )}
                  </div>
                </div>

                {/* System Diagnostics Health Module */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-4">
                    <Cpu size={16} className="text-blue-600" />
                    <h2 className="text-sm font-bold text-gray-900">Infrastructure Snapshots</h2>
                  </div>
                  {systemHealth ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { label: 'Uptime',      icon: Zap,            value: systemHealth.uptime ?? '—' },
                        { label: 'CPU Usage',   icon: Cpu,            value: `${systemHealth.cpu || 0}%` },
                        { label: 'Memory Allocation', icon: HardDrive,  value: `${systemHealth.memory || 0}%` },
                        { label: 'Disk IOPS',   icon: ThermometerSun, value: systemHealth.disk ?? '—' },
                      ].map(({ label, icon: Icon, value }) => {
                        const styleClass = evaluateHealthStatus(value);
                        return (
                          <div key={label} className="p-3 bg-gray-50 rounded-xl border border-gray-100/70 flex flex-col items-center text-center justify-center">
                            <Icon size={15} className={cn("mb-1", styleClass.split(' ')[0])} />
                            <p className="text-xs font-mono font-bold text-gray-900 mt-1">{value}</p>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">{label}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <LoadingSpinner size="sm" className="mx-auto text-blue-600" />
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* Escalate Drawer Modal Sheets rendering */}
      <AnimatePresence>
        {showEscalateDrawer && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-end"
            onClick={() => setShowEscalateDrawer(false)}
          >
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-gray-100"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-500" />
                  <h3 className="text-base font-bold text-gray-900">Escalate System Incident</h3>
                </div>
                <button onClick={() => setShowEscalateDrawer(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600">
                  <XCircle size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6 space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Target Ticket Index</p>
                  <p className="text-xs font-mono font-bold text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">{escalateTicketId || '—'}</p>
                </div>
                <HODCommentInput
                  label="Escalation Statement Context"
                  placeholder="Explain why this issue requires senior oversight or direct structural infrastructure modification alerts..."
                  maxLength={500}
                  value={escalateReason}
                  onChange={(val) => setEscalateReason(val)}
                />
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 shrink-0 bg-gray-50/50">
                <button onClick={() => setShowEscalateDrawer(false)} className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleEscalateSubmit} 
                  disabled={!escalateReason.trim()}
                  className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Send size={12} /> Confirm Escalation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreateTicketDrawer 
        open={showCreateDrawer} 
        onClose={() => setShowCreateDrawer(false)} 
        onSubmit={handleCreateTicketSubmit} 
      />
    </div>
  );
}