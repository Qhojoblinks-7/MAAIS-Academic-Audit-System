import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Hourglass,
  Clock,
  User,
  BookOpen,
  X,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Search,
  Inbox,
  Check,
  ArrowRight,
  Send,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { statusStyles, severityStyles, statusLabel, isResolvedStatus, formatTime } from './shared';
import { toast } from '@/components/ui/toast';

function ChatBubble({ msg }) {
  const role = (msg.role || '').toUpperCase();
  return (
    <div className={cn('flex gap-3', role === 'HOD' ? 'flex-row' : 'flex-row-reverse')}>
      <div className={cn('w-8 h-8 flex items-center justify-center rounded-full shrink-0', role === 'HOD' ? 'bg-amber-100 text-amber-600' : role === 'TEACHER' ? 'bg-sky-100 text-sky-600' : 'bg-slate-200 text-slate-600')}>
        {role === 'HOD' ? 'H' : role === 'TEACHER' ? 'T' : '?'}
      </div>
      <div className="flex-1 max-w-[80%]">
        <div className={cn('px-3 py-2 rounded-xl', role === 'HOD' ? 'bg-amber-50 text-slate-800 rounded-tl-none' : role === 'TEACHER' ? 'bg-sky-50 text-slate-800 rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none')}>
          <p className="text-xs font-medium text-slate-500 mb-0.5">{msg.user}</p>
          <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">{msg.message}</p>
          <p className="text-xs text-slate-400 mt-1">{formatTime(msg.time)}</p>
        </div>
      </div>
    </div>
  );
}

export function RevisionRequests({ pipeline }) {
  const { revisions, approveRevision, rejectRevision, sendRevisionComment } = pipeline;
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [hodComment, setHodComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [discussionInput, setDiscussionInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [discussionOpen, setDiscussionOpen] = useState(true);

  useEffect(() => {
    const queryId = searchParams.get('revision');
    if (queryId) {
      const match = revisions.find((r) => r.id === queryId);
      if (match) setSelected(match);
    } else if (revisions.length > 0 && !selected) {
      setSelected(revisions[0]);
    }
  }, [searchParams, revisions]);

  const filteredData = useMemo(
    () =>
      revisions.filter((item) => {
        const matchesTab = activeTab === 'all' ? true : activeTab === 'pending' ? !isResolvedStatus(item.status) : isResolvedStatus(item.status);
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          (item.student || '').toLowerCase().includes(q) ||
          (item.id || '').toLowerCase().includes(q) ||
          (item.subject || '').toLowerCase().includes(q);
        return matchesTab && matchesSearch;
      }),
    [revisions, activeTab, searchQuery],
  );

  const handleApprove = async () => {
    if (!selected || !hodComment.trim() || isApproving) return;
    setIsApproving(true);
    const res = await approveRevision(selected, hodComment);
    if (res?.error) toast.error(res.error);
    else {
      toast.success('Grade revision approved');
      setHodComment('');
    }
    setIsApproving(false);
  };

  const handleReject = async () => {
    if (!selected || isRejecting) return;
    setIsRejecting(true);
    const res = await rejectRevision(selected, hodComment);
    if (res?.error) toast.error(res.error);
    else toast.info('Grade correction sent');
    setIsRejecting(false);
  };

  const sendDiscussionMessage = async () => {
    if (!discussionInput.trim() || !selected) return;
    setIsSending(true);
    const res = await sendRevisionComment(selected, discussionInput.trim());
    if (res?.error) toast.error(res.error);
    else {
      toast.success('Message sent to teacher');
      setDiscussionInput('');
    }
    setIsSending(false);
  };

  const pendingCount = revisions.filter((r) => !isResolvedStatus(r.status)).length;

  return (
    <div className="flex-1 flex w-full h-full min-h-0 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 h-full border-r border-border">
        <div className="p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center shadow-sm">
                <AlertTriangle size={18} className="text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">HOD Revision Review</h1>
                <p className="text-xs text-muted-foreground font-medium">Approve or reject grade revision requests from teachers</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200/30 text-[11px] font-semibold">
              <AlertTriangle size={12} className="text-amber-600 animate-pulse" />
              <span>{pendingCount} Pending Approvals</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex p-0.5 bg-muted rounded-lg border border-border">
              {['pending', 'resolved', 'all'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    const nextList = revisions.filter((r) => (tab === 'all' ? true : tab === 'pending' ? !isResolvedStatus(r.status) : isResolvedStatus(r.status)));
                    setSelected(nextList[0] || null);
                  }}
                  className={cn('px-4 py-1.5 text-xs font-semibold capitalize rounded-md transition-all duration-150 cursor-pointer', activeTab === tab ? 'bg-card text-foreground shadow-sm border border-border/20 font-bold' : 'text-muted-foreground hover:text-foreground')}
                >
                  {tab === 'pending' ? 'Needs Approval' : tab}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, code, course..."
                className="w-full pl-9 pr-4 py-1.5 bg-muted border border-border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-400 transition-all placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-muted/30 space-y-3 min-h-0 no-scrollbar">
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-2xl border border-dashed border-border p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                <Inbox size={20} className="text-muted-foreground" />
              </div>
              <p className="text-xs font-semibold text-foreground">No revisions matched filter</p>
            </div>
          ) : (
            filteredData.map((job, idx) => {
              const isSelected = selected?.id === job.id;
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: idx * 0.02 }}
                  onClick={() => setSelected(job)}
                  className={cn('p-5 rounded-xl border transition-all duration-200 cursor-pointer relative group bg-card', isSelected ? 'border-foreground shadow-sm ring-1 ring-foreground/5' : 'border-border hover:border-border/50 hover:shadow-sm')}
                >
                  {isSelected && <div className="absolute top-0 bottom-0 left-0 w-1 bg-foreground rounded-l-xl" />}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border tracking-wide', statusStyles[(job.status || '').toUpperCase()] || 'bg-slate-100')}>{statusLabel(job.status)}</span>
                      <span className={cn('text-[9px] font-extrabold px-1.5 py-0.5 rounded border tracking-wider', severityStyles[job.severity] || '')}>{job.severity}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
                      <Clock size={12} />
                      <span>{typeof job.time === 'string' ? job.time : formatTime(job.time)}</span>
                    </div>
                  </div>
                  <p className="text-[13px] font-medium text-muted-foreground leading-relaxed mb-4 bg-muted border border-border p-3 rounded-lg font-mono tracking-tight">{job.issue}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-4 text-[12px] font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-muted-foreground" />
                        <span className="font-semibold text-foreground">{job.student}</span>
                      </div>
                      <div className="w-1 h-1 bg-border rounded-full" />
                      <div className="flex items-center gap-1.5">
                        <BookOpen size={13} className="text-muted-foreground" />
                        <span>{job.class} <span className="text-border mx-1">/</span> <span className="text-muted-foreground font-normal">{job.subject}</span></span>
                      </div>
                    </div>
                    <ArrowRight size={14} className={cn('transition-all duration-200', isSelected ? 'text-foreground translate-x-0.5' : 'text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5')} />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selected ? (
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.15 }}
            className="w-[28rem] bg-card h-full border-l border-border flex flex-col shrink-0 shadow-2xl hidden lg:flex min-h-0"
          >
            <div className="p-6 border-b border-border flex items-start justify-between bg-muted/40 shrink-0">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  <Hourglass size={12} className="text-muted-foreground" /> Grade Revision Request
                </div>
                <h3 className="text-base font-bold text-foreground tracking-tight">{selected.student}</h3>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">{selected.class} • <span className="text-muted-foreground">{selected.subject}</span></p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-all cursor-pointer">
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 min-h-0 no-scrollbar space-y-4">
              <button
                onClick={() => setDiscussionOpen((o) => !o)}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <Hourglass size={12} className="text-muted-foreground" /> Grade Discussion
                  {Array.isArray(selected.history) && selected.history.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-muted text-[9px] font-extrabold text-foreground">{selected.history.length}</span>
                  )}
                </div>
                <ChevronRight size={14} className={cn('text-muted-foreground transition-transform', discussionOpen ? 'rotate-90' : '')} />
              </button>

              <AnimatePresence initial={false}>
                {discussionOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden space-y-3"
                  >
                    {selected.issue && (
                      <div className="flex gap-3 flex-row">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 shrink-0">H</div>
                        <div className="flex-1 max-w-[80%]">
                          <div className="px-3 py-2 rounded-xl bg-amber-50 text-slate-800 rounded-tl-none">
                            <p className="text-xs font-medium text-slate-500 mb-0.5">HOD</p>
                            <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">{selected.issue}</p>
                            <p className="text-xs text-slate-400 mt-1">{formatTime(selected.time)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {Array.isArray(selected.history) && selected.history.map((msg) => <ChatBubble key={msg.id} msg={msg} />)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-4 border-t border-border bg-muted/40 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <textarea
                    value={discussionInput}
                    onChange={(e) => setDiscussionInput(e.target.value)}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full p-2.5 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/20 resize-none"
                    disabled={isSending}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendDiscussionMessage(); } }}
                  />
                </div>
                <button onClick={sendDiscussionMessage} disabled={isSending || !discussionInput.trim()} className="px-4 py-2.5 bg-foreground text-background rounded-xl hover:bg-foreground/80 transition-colors disabled:opacity-50 cursor-pointer shrink-0">
                  {isSending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/40 shrink-0 space-y-2">
              {!isResolvedStatus(selected.status) ? (
                <>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">HOD Review Comment</label>
                  <textarea
                    rows={3}
                    value={hodComment}
                    onChange={(e) => setHodComment(e.target.value)}
                    placeholder="Add your approval or rejection reason..."
                    className="w-full p-3 bg-muted/60 border border-border rounded-xl text-xs font-medium focus:bg-card focus:outline-none focus:ring-2 focus:ring-foreground/5 focus:border-slate-500 placeholder:text-muted-foreground resize-none transition-all leading-relaxed"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleApprove}
                      disabled={!hodComment.trim() || isApproving}
                      className={cn('flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wide border transition-all flex items-center justify-center gap-1.5', hodComment.trim() && !isApproving ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60')}
                    >
                      {isApproving ? 'Approving...' : <>Approve <ThumbsUp size={13} /></>}
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={isRejecting}
                      className="flex-1 py-2.5 bg-white text-slate-700 rounded-xl text-xs font-bold tracking-wide border border-slate-200 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                    >
                      {isRejecting ? 'Rejecting...' : <>Reject <ThumbsDown size={13} /></>}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
                  <ShieldCheck size={14} />
                  Revision Approved & Resolved
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="w-[28rem] bg-muted/20 border-l border-border hidden lg:flex flex-col items-center justify-center p-8 text-center shrink-0">
            <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center mb-3 text-muted-foreground">
              <Check size={16} />
            </div>
            <p className="text-xs font-semibold text-foreground">No Request Selected</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">Choose a grade revision request to review and approve.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
