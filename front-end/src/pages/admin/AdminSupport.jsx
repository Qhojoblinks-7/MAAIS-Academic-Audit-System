import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LifeBuoy, 
  Zap,
  Plus,
  RefreshCw,
  Search,
  XCircle,
  AlertTriangle,
  Cpu,
  HardDrive,
  ThermometerSun,
  Mail,
  Globe,
  Users,
  ShieldCheck,
  Phone
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '../../lib/utils';
import { api } from '../../lib/api';
import { useTickets, useUpdateTicketStatus, useCreateTicket } from '../../lib/hooks/api/admin';
import { EmptyState, AlertSeverityChip, LoadingSpinner, HODCommentInput } from '../../components/molecules';
import { SupportTicketKanban } from '../../components/organisms';

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const CATEGORY_OPTIONS = ['SYSTEM', 'GRADES', 'REPORTS', 'ACCOUNT', 'OTHER'];

export function AdminSupport() {
  const qc = useQueryClient();
  const ticketsQuery = useTickets();
  const updateTicketStatus = useUpdateTicketStatus();
  const createTicketMutation = useCreateTicket();

  const [search, setSearch] = useState('');
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const [showEscalateDrawer, setShowEscalateDrawer] = useState(false);
  const [escalateTicketId, setEscalateTicketId] = useState(null);
  const [escalateReason, setEscalateReason] = useState('');
  const [subTab, setSubTab] = useState('tickets');
  const [ticketTabs, setTicketTabs] = useState('all');
  const [ticketFilter, setTicketFilter] = useState('all');
  const [form, setForm] = useState({
    subject: '', category: 'SYSTEM', priority: 'MEDIUM', description: '', notes: ''
  });
  const [supportTickets, setSupportTickets] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [escalatedIssues, setEscalatedIssues] = useState([]);
  const [contactChannels, setContactChannels] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const tickets = ticketsQuery.data?.data ?? ticketsQuery.data ?? [];

  const fetchAll = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [ticketsRes, healthRes, escalationsRes, channelsRes] = await Promise.all([
        api.get('/hod/support/tickets'),
        api.get('/hod/system-health'),
        api.get('/hod/escalations'),
        api.get('/hod/contact-channels'),
      ]);
      setSupportTickets(Array.isArray(ticketsRes?.data ?? ticketsRes) ? (ticketsRes.data || ticketsRes) : []);
      setSystemHealth(healthRes?.data ?? healthRes ?? null);
      setEscalatedIssues(Array.isArray(escalationsRes?.data ?? escalationsRes) ? (escalationsRes.data || escalationsRes) : []);
      setContactChannels(channelsRes?.data ?? channelsRes ?? null);
    } catch {
      setSupportTickets([]);
      setSystemHealth(null);
      setEscalatedIssues([]);
      setContactChannels(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

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
    { id: 'all', label: 'All', count: supportTickets.length },
    { id: 'OPEN', label: 'Open', count: supportTickets.filter(t => t.status === 'OPEN').length },
    { id: 'IN_PROGRESS', label: 'In Progress', count: supportTickets.filter(t => t.status === 'IN_PROGRESS').length },
    { id: 'PENDING', label: 'Pending', count: supportTickets.filter(t => t.status === 'PENDING').length },
    { id: 'CLOSED', label: 'Closed', count: supportTickets.filter(t => t.status === 'CLOSED').length },
  ];

  const handleCreateTicketSubmit = async (formData) => {
    await createTicketMutation.mutateAsync({
      title: formData.subject,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
    });
    setForm({ subject: '', category: 'SYSTEM', priority: 'MEDIUM', description: '', notes: '' });
    setShowCreateDrawer(false);
    fetchAll();
  };

  const handleEscalateSubmit = async () => {
    if (!escalateTicketId || !escalateReason.trim()) return;
    try {
      await api.post(`/hod/support/tickets/${escalateTicketId}/escalate`, {
        reason: escalateReason,
      });
      setEscalateTicketId(null);
      setEscalateReason('');
      setShowEscalateDrawer(false);
      fetchAll();
    } catch {
      // eslint-disable-next-line no-alert
      alert('Escalation failed. Please try again.');
    }
  };

  const handleUpdateStatus = async (ticketId, patch) => {
    await updateTicketStatus.mutateAsync({ id: ticketId, dto: patch });
    fetchAll();
  };

  const handleEscalate = (ticket) => {
    setEscalateTicketId(ticket.id);
    setShowEscalateDrawer(true);
  };

  const evaluateHealthStatus = (val) => {
    if (!val) return 'text-text-secondary';
    const normalized = String(val).toUpperCase();
    if (normalized.includes('UP') || normalized.includes('HEALTHY') || normalized.includes('OK') || parseInt(val) < 75) {
      return 'text-brand-primary bg-brand-primary/10 border-brand-primary/20';
    }
    if (normalized.includes('WARN') || normalized.includes('WARNING') || (parseInt(val) >= 75 && parseInt(val) < 90)) {
      return 'text-warning bg-warning/10 border-warning/20';
    }
    return 'text-destructive bg-destructive/10 border-destructive/20';
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <div className="flex-1 overflow-auto p-8 lg:p-12 pb-32 lg:pb-24 scrollbar-hide">
        <div className="max-w-5xl mx-auto space-y-6">
          <header className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-brand-dark rounded-2xl flex items-center justify-center text-primary-foreground shadow-xl shadow-brand-dark/20">
                <LifeBuoy size={28} />
              </div>
              <div>
                <h1 className="text-[28px] md:text-[34px] font-black text-text-primary tracking-tighter leading-none italic font-display italic uppercase">Executive Engineering Desk</h1>
                <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mt-1">Direct priority engineering & protocol documentation hub</p>
              </div>
            </div>
          </header>

          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Support Center</h2>
              <p className="text-sm text-text-secondary mt-1">Ticket tracking · system health · escalation management</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={fetchAll}
                className="px-4 py-2 bg-surface border border-border rounded-xl text-xs font-medium text-text-primary hover:bg-muted flex items-center gap-2 shadow-xs transition-colors"
              >
                <RefreshCw size={14} /> Refresh Stream
              </button>
              <button
                onClick={() => setShowCreateDrawer(true)}
                className="px-4 py-2 bg-brand-primary text-primary-foreground rounded-xl text-xs font-medium hover:bg-brand-primary/90 flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus size={14} /> New Ticket
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-surface rounded-2xl border border-border shadow-sm p-1 w-fit">
            {['tickets', 'escalations', 'contacts'].map((t) => (
              <button
                key={t}
                onClick={() => setSubTab(t)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                  subTab === t
                    ? "bg-brand-dark text-primary-foreground shadow-xs"
                    : "text-text-secondary hover:bg-muted"
                )}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {subTab === 'tickets' && (
            <div className="space-y-5">
              <div className="bg-surface rounded-2xl border border-border shadow-sm p-4">
                <div className="flex items-center gap-1.5 flex-wrap justify-between">
                  <div className="flex items-center gap-1 flex-wrap">
                    {tabsConfig.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setTicketTabs(tab.id)}
                        className={cn(
                          'px-3 py-1.5 type-base text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider border',
                          ticketTabs === tab.id
                            ? 'bg-brand-primary text-primary-foreground border-brand-primary'
                            : 'bg-muted text-text-secondary border-border hover:bg-border'
                        )}
                      >
                        {tab.label}
                        <span className={cn('ml-1.5 font-mono', ticketTabs === tab.id ? 'text-primary-foreground/80' : 'text-text-secondary')}>
                          ({tab.count})
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="relative min-w-[200px]">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search unique ticket tags..."
                      className="w-full pl-8 pr-8 py-1.5 text-xs bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:bg-surface"
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary">
                        <XCircle size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {filteredTickets.length > 0 ? (
                <SupportTicketKanban 
                  tickets={filteredTickets} 
                  onUpdateStatus={handleUpdateStatus}
                  onEscalate={handleEscalate}
                />
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
              <div className="bg-surface rounded-2xl border border-border shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-warning" />
                  <h2 className="text-sm font-bold text-text-primary">Escalated Engineering Failures</h2>
                  <span className="ml-auto px-2 py-0.5 bg-muted text-text-secondary text-[10px] font-mono font-bold rounded-full">{escalatedIssues.length}</span>
                </div>
                {escalatedIssues.length === 0 ? (
                  <EmptyState icon={ShieldCheck} title="All environments clear" description="No operational tasks are escalated at this block interval." />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {escalatedIssues.map((issue, i) => (
                      <div key={issue.id || i} className="flex flex-col p-4 bg-muted border border-border rounded-xl shadow-xs">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-xs font-bold text-text-primary truncate">{issue.title || issue.subject || 'System Incident'}</p>
                          <AlertSeverityChip severity={issue.severity || 'MEDIUM'} />
                        </div>
                        <p className="text-xs text-text-secondary mt-2 line-clamp-2">{issue.description || 'No analytical trace attached.'}</p>
                        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[10px] font-mono text-text-secondary">
                          <span>ID: {issue.id?.slice(-8) || 'GEN-ERR'}</span>
                          <span className="text-warning font-semibold bg-warning/10 px-1.5 py-0.5 rounded">Awaiting Ops Action</span>
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
                <div className="lg:col-span-2 bg-surface rounded-2xl border border-border shadow-sm p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-brand-primary" />
                    <h2 className="text-sm font-bold text-text-primary">Active Alert Routing Channels</h2>
                  </div>
                  <div className="space-y-2">
                    {contactChannels ? (
                      [
                        { key: 'email', label: 'SMTP Email Portal', icon: Mail, value: contactChannels.email ?? false },
                        { key: 'sms', label: 'SMS Gateway Broadcast', icon: Phone, value: contactChannels.sms ?? false },
                        { key: 'whatsapp', label: 'WhatsApp Secure Stream', icon: Globe, value: contactChannels.whatsapp ?? false },
                      ].map(({ key, label, icon: Icon, value }) => (
                        <div key={key} className="flex items-center justify-between p-3.5 bg-muted rounded-xl border border-border">
                          <div className="flex items-center gap-3">
                            <Icon size={15} className="text-text-secondary" />
                            <span className="text-xs font-medium text-text-primary">{label}</span>
                          </div>
                          <button
                            onClick={() => {}}
                            className={cn(
                              "w-9 h-5 rounded-full transition-all relative outline-none",
                              value ? "bg-brand-primary" : "bg-muted"
                            )}
                          >
                            <div className={cn("w-4 h-4 bg-surface rounded-full shadow-xs transition-transform absolute top-0.5", value ? "right-0.5" : "left-0.5")} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-text-secondary">Loading channel states...</p>
                    )}
                  </div>
                </div>

                <div className="bg-surface rounded-2xl border border-border shadow-sm p-5 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-4">
                    <Cpu size={16} className="text-brand-primary" />
                    <h2 className="text-sm font-bold text-text-primary">Infrastructure Snapshots</h2>
                  </div>
                  {systemHealth ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { label: 'Uptime', icon: Zap, value: systemHealth.uptime ?? '—' },
                        { label: 'CPU Usage', icon: Cpu, value: `${systemHealth.cpu || 0}%` },
                        { label: 'Memory Allocation', icon: HardDrive, value: `${systemHealth.memory || 0}%` },
                        { label: 'Disk IOPS', icon: ThermometerSun, value: systemHealth.disk ?? '—' },
                      ].map(({ label, icon: Icon, value }) => {
                        const styleClass = evaluateHealthStatus(value);
                        return (
                          <div key={label} className="p-3 bg-muted rounded-xl border border-border flex flex-col items-center text-center justify-center">
                            <Icon size={15} className={cn("mb-1", styleClass.split(' ')[0])} />
                            <p className="text-xs font-mono font-bold text-text-primary mt-1">{value}</p>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-text-secondary mt-0.5">{label}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <LoadingSpinner size="sm" className="mx-auto text-brand-primary" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreateDrawer && (
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-dark/40 backdrop:blur-xs flex items-center justify-end"
            onClick={() => setShowCreateDrawer(false)}
          >
            <motion.div
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-surface h-full flex flex-col shadow-2xl border-l border-border"
            >
              <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/20">
                    <LifeBuoy size={18} />
                  </div>
                  <h3 className="text-base font-bold text-text-primary">New Support Ticket</h3>
                </div>
                <button onClick={() => setShowCreateDrawer(false)} className="p-2 hover:bg-muted rounded-xl transition-all text-text-secondary hover:text-text-primary">
                  <XCircle size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">Subject</p>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Brief description of the issue"
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-surface"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">Category</p>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-surface appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    >
                      {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">Priority</p>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-xl bg-surface appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                    >
                      {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">Description Context</p>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Provide explicit logs details, reproduction steps, or unexpected system outputs..."
                    rows={5}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary resize-none bg-surface"
                  />
                </div>

                <HODCommentInput
                  label="Additional Internal Notes (optional)"
                  placeholder="Attach alternative tracking indexes or runtime context notes..."
                  value={form.notes}
                  onChange={(val) => setForm({ ...form, notes: val })}
                />
              </div>

              <div className="px-6 py-4 border-t border-border flex items-center gap-3 shrink-0 bg-muted/50">
                <button onClick={() => setShowCreateDrawer(false)} className="flex-1 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-text-primary hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={() => handleCreateTicketSubmit(form)} 
                  disabled={!form.subject.trim() || !form.description.trim()}
                  className="flex-1 py-2.5 bg-brand-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-brand-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Plus size={14} /> Submit Ticket
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEscalateDrawer && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-dark/40 backdrop:blur-xs flex items-center justify-end"
            onClick={() => setShowEscalateDrawer(false)}
          >
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-surface h-full flex flex-col shadow-2xl border-l border-border"
            >
              <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-warning" />
                  <h3 className="text-base font-bold text-text-primary">Escalate System Incident</h3>
                </div>
                <button onClick={() => setShowEscalateDrawer(false)} className="p-2 hover:bg-muted rounded-xl text-text-secondary hover:text-text-primary">
                  <XCircle size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6 space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">Target Ticket Index</p>
                  <p className="text-xs font-mono font-bold text-text-primary bg-muted px-2.5 py-1.5 rounded-lg border border-border">{escalateTicketId || '—'}</p>
                </div>
                <HODCommentInput
                  label="Escalation Statement Context"
                  placeholder="Explain why this issue requires senior oversight or direct structural infrastructure modification alerts..."
                  maxLength={500}
                  value={escalateReason}
                  onChange={(val) => setEscalateReason(val)}
                />
              </div>
              <div className="px-6 py-4 border-t border-border flex items-center gap-3 shrink-0 bg-muted/50">
                <button onClick={() => setShowEscalateDrawer(false)} className="flex-1 py-2.5 bg-surface border border-border rounded-xl text-sm font-medium text-text-primary hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleEscalateSubmit} 
                  disabled={!escalateReason.trim()}
                  className="flex-1 py-2.5 bg-warning text-primary-foreground rounded-xl text-sm font-medium hover:bg-warning/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <AlertTriangle size={12} /> Confirm Escalation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
