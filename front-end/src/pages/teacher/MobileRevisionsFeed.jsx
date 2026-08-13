import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Clock, User, BookOpen, Search,
  ChevronLeft, Send, ArrowRight, Hourglass, Check
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useRole } from '../../context/RoleContext';
import { teacherService } from '../../services';
import { toast } from '../../components/ui/toast';

function formatTime(isoString) {
  if (!isoString) return 'Unknown';
  const date = new Date(isoString);
  const now = new Date();
  const diffMinutes = Math.floor((now - date) / (1000 * 60));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

const STATUS_STYLES = {
  'PENDING': 'bg-amber-100 text-amber-800 border-amber-200',
  'AWAITING_APPROVAL': 'bg-amber-100 text-amber-800 border-amber-200',
  'TEACHER_REPLIED': 'bg-sky-100 text-sky-800 border-sky-200',
  'IN_REVIEW': 'bg-purple-100 text-purple-800 border-purple-200',
  'RESOLVED': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'REJECTED': 'bg-red-100 text-red-800 border-red-200',
};

export function MobileRevisionsFeed() {
  const { user } = useRole();
  const { setIsRevisionDetailOpen } = useUI();
  const navigate = useNavigate();
  const [revisions, setRevisions] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('list');

  const prevStatusesRef = useRef(null);

  const applyRevisions = useCallback((data) => {
    const list = Array.isArray(data) ? data : [];
    if (prevStatusesRef.current) {
      list.forEach((r) => {
        const prev = prevStatusesRef.current[r.id];
        const cur = (r.status || '').toUpperCase();
        if (prev && prev !== cur && (cur === 'RESOLVED' || cur === 'REJECTED')) {
          if (cur === 'RESOLVED') {
            toast.success(`Grade Revision Approved — ${r.student || 'a student'}`);
          } else {
            toast.error(`Grade Revision Rejected — ${r.student || 'a student'}`);
          }
        }
      });
    }
    const map = {};
    list.forEach((r) => { map[r.id] = (r.status || '').toUpperCase(); });
    prevStatusesRef.current = map;
    setRevisions(list);
  }, []);

  const loadRevisions = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const data = await teacherService.getGradeRevisions(user?.profileId || user.id) || [];
      applyRevisions(data);
    } catch (e) {
      console.error('Failed to fetch revisions:', e);
      toast.error('Failed to load revisions');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, user?.profileId, applyRevisions]);

  useEffect(() => {
    loadRevisions();
  }, [loadRevisions]);

  useEffect(() => {
    const interval = setInterval(loadRevisions, 30000);
    return () => clearInterval(interval);
  }, [loadRevisions]);

  const isResolved = (r) => {
    const status = (r.status || '').toUpperCase();
    return status === 'RESOLVED' || status === 'REJECTED';
  };

  const filteredData = useMemo(() => {
    return revisions.filter(item => {
      const matchesTab = activeTab === 'all'
        ? true
        : activeTab === 'pending'
          ? !isResolved(item)
          : isResolved(item);

      const matchesSearch =
        (item.student || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subject || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [revisions, activeTab, searchQuery]);

  const pendingCount = revisions.filter(r => !isResolved(r)).length;
  const resolvedCount = revisions.filter(r => isResolved(r)).length;

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !selected) return;

    try {
      setIsChatLoading(true);

      const shouldTransitionToReplied = ['in_review', 'AWAITING_APPROVAL', 'REJECTED'].includes(selected.status);

      const newMessage = {
        id: Date.now(),
        role: 'TEACHER',
        user: user?.name || 'You (Teacher)',
        message: chatInput,
        time: new Date().toISOString(),
      };

      const updatedRevision = {
        ...selected,
        status: shouldTransitionToReplied ? 'TEACHER_REPLIED' : selected.status,
        history: [...(Array.isArray(selected.history) ? selected.history : []), newMessage],
      };

      setRevisions(prev => prev.map(item => item.id === selected.id ? updatedRevision : item));
      setSelected(updatedRevision);
      setChatInput('');

      await teacherService.updateGradeRevision(selected.id, {
        history: updatedRevision.history,
        status: updatedRevision.status,
      });

      toast.success(shouldTransitionToReplied ? 'Response submitted to HOD' : 'Message sent to HOD');
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message');
    } finally {
      setIsChatLoading(false);
    }
  };

  const tabs = [
    { id: 'pending', label: 'Pending', count: pendingCount },
    { id: 'resolved', label: 'Resolved', count: resolvedCount },
    { id: 'all', label: 'All', count: revisions.length },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-[300px]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-primary">Loading revisions…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0 overflow-x-hidden no-scrollbar">
      {/* Header */}
      <header className="bg-surface border-b border-border px-3 py-2.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button onClick={() => navigate(-1)} className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0 active:scale-95 transition-transform">
              <ChevronLeft size={16} className="text-primary" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-black text-primary truncate leading-tight">Revisions</h1>
              <p className="text-[9px] font-bold text-secondary uppercase tracking-widest truncate">Correction Requests</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-warning/10 text-warning border border-warning/20 px-2 py-1 rounded-lg text-[10px] font-bold">
            <AlertTriangle size={12} className="text-warning animate-pulse" />
            <span>{pendingCount}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide min-w-0 pb-24">
        {/* Tab Dropdown */}
        <div className="px-3 py-3">
          <select
            value={activeTab}
            onChange={(e) => {
              setActiveTab(e.target.value);
              const nextList = filteredData.filter(item => {
                if (e.target.value === 'all') return true;
                if (e.target.value === 'pending') return !isResolved(item);
                return isResolved(item);
              });
              setSelected(nextList[0] || null);
            }}
            className="appearance-none w-full bg-surface border border-border rounded-xl px-3 py-2.5 pr-8 text-xs font-black uppercase tracking-wider text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-sm"
          >
            {tabs.map((t) => (
              <option key={t.id} value={t.id}>{t.label} ({t.count})</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative px-3">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary" size={14} />
          <input
            type="text"
            placeholder="Search student, code, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 bg-surface border border-border rounded-xl text-xs font-medium text-primary placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-secondary">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Revisions List */}
        <div className="px-3 mt-3 space-y-2">
          {filteredData.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-2xl border border-border border-dashed">
              <p className="text-xs font-bold text-secondary">No revision requests found.</p>
            </div>
          ) : (
            filteredData.map((revision, i) => {
              const isSelected = selected?.id === revision.id;
              const status = (revision.status || '').toUpperCase();
              const statusStyle = STATUS_STYLES[status] || 'bg-slate-100 text-slate-800 border-slate-200';
              const severity = (revision.severity || '').toUpperCase();

              return (
                <motion.div
                  key={revision.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => {
                    setSelected(revision);
                    setChatInput('');
                    setView('detail');
                    setIsRevisionDetailOpen(true);
                  }}
                  className={cn(
                    "bg-surface rounded-2xl border shadow-sm p-3.5 cursor-pointer transition-all active:scale-[0.98]",
                    isSelected ? "border-brand-primary/50 ring-1 ring-brand-primary/20" : "border-border"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border", statusStyle)}>
                        {status === 'AWAITING_APPROVAL' ? 'Awaiting HOD' : status === 'TEACHER_REPLIED' ? 'HOD Reviewing' : status === 'REJECTED' ? 'Rejected' : status === 'RESOLVED' ? 'Resolved' : status === 'IN_REVIEW' ? 'In Review' : status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-secondary text-[10px] font-medium">
                      <Clock size={10} />
                      <span>{formatTime(revision.time)}</span>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-primary leading-relaxed mb-2 line-clamp-2">
                    {revision.issue}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 bg-muted rounded-md flex items-center justify-center shrink-0">
                        <User size={12} className="text-secondary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-primary truncate">{revision.student}</p>
                        <p className="text-[9px] font-bold text-secondary truncate">{revision.class} • {revision.subject}</p>
                      </div>
                    </div>
                    <ArrowRight size={12} className={cn("text-secondary shrink-0", isSelected && "text-brand-primary")} />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail View */}
      {view === 'detail' && selected && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-50 bg-background flex flex-col"
        >
          {/* Detail Header */}
          <div className="px-4 py-3 border-b border-border flex items-start justify-between shrink-0 bg-surface">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button onClick={() => { setView('list'); setIsRevisionDetailOpen(false); }} className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0 active:scale-95 transition-transform">
                <ChevronLeft size={16} className="text-primary" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-secondary uppercase tracking-wider mb-0.5">
                  <Hourglass size={12} className="text-secondary" />
                  Grade Revision
                </div>
                <h3 className="text-sm font-black text-primary truncate">{selected.student}</h3>
                <p className="text-[10px] font-medium text-secondary truncate">{selected.class} • <span className="text-secondary/70">{selected.subject}</span></p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {selected.issue && (
              <div className="flex gap-2.5">
                <div className="w-7 h-7 bg-warning/10 rounded-lg flex items-center justify-center shrink-0 text-warning text-[10px] font-black">
                  H
                </div>
                <div className="flex-1">
                  <div className="bg-warning/10 rounded-xl rounded-tl-none p-3">
                    <p className="text-[10px] font-bold text-warning uppercase tracking-wider mb-1">HOD</p>
                    <p className="text-xs text-primary whitespace-pre-wrap break-words leading-relaxed">{selected.issue}</p>
                    <p className="text-[10px] text-secondary mt-1">{formatTime(selected.time)}</p>
                  </div>
                </div>
              </div>
            )}
            {Array.isArray(selected.history) && selected.history.map((msg) => (
              <div key={msg.id} className={cn(
                "flex gap-2.5",
                msg.role === 'TEACHER' ? 'flex-row-reverse' : 'flex-row'
              )}>
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black",
                  msg.role === 'HOD' ? 'bg-warning/10 text-warning' : msg.role === 'TEACHER' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-muted text-secondary'
                )}>
                  {msg.role === 'HOD' ? 'H' : msg.role === 'TEACHER' ? 'T' : '?'}
                </div>
                <div className="flex-1">
                  <div className={cn(
                    "p-3 rounded-xl",
                    msg.role === 'HOD' ? 'bg-warning/10 rounded-tl-none' :
                      msg.role === 'TEACHER' ? 'bg-brand-primary/10 rounded-tr-none' :
                      'bg-muted rounded-tl-none'
                  )}>
                    <p className="text-[10px] font-bold text-secondary mb-0.5">{msg.user}</p>
                    <p className="text-xs text-primary whitespace-pre-wrap break-words leading-relaxed">{msg.message}</p>
                    <p className="text-[10px] text-secondary mt-1">{formatTime(msg.time)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-border bg-surface shrink-0">
            <div className="flex items-center gap-2">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 p-2.5 bg-muted border border-border rounded-xl text-xs font-medium resize-none focus:outline-none focus:ring-1 focus:ring-brand-primary"
                disabled={isChatLoading || selected.status === 'RESOLVED' || selected.status === 'REJECTED'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
              />
              <button
                onClick={sendChatMessage}
                disabled={isChatLoading || !chatInput.trim() || selected.status === 'RESOLVED' || selected.status === 'REJECTED'}
                className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-transform disabled:opacity-50"
              >
                <Send size={14} className="text-surface" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
