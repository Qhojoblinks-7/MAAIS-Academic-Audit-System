import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Hourglass,
  CheckCircle2,
  ArrowRight,
  Clock,
  User,
  BookOpen,
  X,
  Sparkles,
  Inbox,
  Check,
  Search,
  CornerDownRight,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { GradeDiscussionThread } from '../../components/organisms';

export const statusStyles = {
  AWAITING_APPROVAL: 'bg-warning/10 text-warning border-warning/20 ring-2 ring-warning/20',
  TEACHER_REPLIED: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20 ring-2 ring-brand-secondary/20',
  RESOLVED: 'bg-success/10 text-success border-success/20 ring-2 ring-success/20',
};

export const severityStyles = {
  HIGH: 'text-destructive bg-destructive/10 border-destructive/20',
  MEDIUM: 'text-warning bg-warning/10 border-warning/20',
  LOW: 'text-muted-foreground bg-muted border-border',
};

export function RevisionsFeed({ revisions: propRevisions, onApprove, onReject, onSubmitResponse, role = 'shared' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [revisions, setRevisions] = useState(propRevisions || []);
  const [activeTab, setActiveTab] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [discussionExpanded, setDiscussionExpanded] = useState(false);
  const [discussionInput, setDiscussionInput] = useState('');
  const [isDiscussionLoading, setIsDiscussionLoading] = useState(false);

  useEffect(() => {
    if (propRevisions) setRevisions(propRevisions);
  }, [propRevisions]);

  useEffect(() => {
    const queryId = searchParams.get('revision');
    if (queryId) {
      const match = revisions.find(r => r.id === queryId);
      if (match) setSelected(match);
    } else if (revisions.length > 0 && !selected) {
      setSelected(revisions[0]);
    }
  }, [searchParams, revisions]);

  const filteredData = revisions.filter(item => {
    const matchesTab = activeTab === 'all' 
      ? true 
      : activeTab === 'pending' 
        ? item.status !== 'RESOLVED' 
        : item.status === 'RESOLVED';
        
    const matchesSearch = 
      item.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

   const handleAction = () => {
     if (!replyText.trim() || !selected) return;
     if (onSubmitResponse) {
       onSubmitResponse(selected.id, replyText);
     }
     setReplyText('');
   };

   const sendDiscussionMessage = async () => {
     if (!discussionInput.trim() || !selected) return;

     try {
       setIsDiscussionLoading(true);
       
       // In a real implementation, this would send to backend and notify via notification service
       // For now, we'll just show a toast/alert
       alert('Discussion message sent: ' + discussionInput);
       
       // Clear input
       setDiscussionInput('');
       
       // In a real app, you would:
       // 1. Send message to backend API to persist it
       // 2. Use notificationService to alert the other party (HOD/Teacher)
       // 3. Update the discussion thread with the new message
     } catch (err) {
       console.error('Failed to send discussion message:', err);
       alert('Failed to send message');
     } finally {
       setIsDiscussionLoading(false);
     }
   };

return (
    <div className="flex-1 flex w-full h-full min-h-0 overflow-hidden bg-muted font-sans antialiased">
      
      <div className="flex-1 flex flex-col min-w-0 h-full border-r border-border">
        
        <div className="p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center shadow-sm">
                <AlertTriangle size={18} className="text-warning" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">Correction Request Hub</h1>
                <p className="text-xs text-muted-foreground font-medium">Verify structural score and grade variances</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-warning/10 text-warning px-2.5 py-1 rounded-lg border border-warning/20 text-[11px] font-semibold">
              <Sparkles size={12} className="animate-pulse" />
              <span>{revisions.filter(r => r.status !== 'RESOLVED').length} Actions Required</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex p-0.5 bg-muted rounded-lg border border-border">
              {['pending', 'resolved', 'all'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    const nextList = revisions.filter(r => tab === 'all' ? true : tab === 'pending' ? r.status !== 'RESOLVED' : r.status === 'RESOLVED');
                    setSelected(nextList[0] || null);
                  }}
                  className={cn(
                    "px-4 py-1.5 text-xs font-semibold capitalize rounded-md transition-all duration-150",
                    activeTab === tab 
                      ? "bg-card text-foreground shadow-sm border border-border/20 font-bold" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === 'pending' ? 'Needs Attention' : tab}
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
                className="w-full pl-9 pr-4 py-1.5 bg-muted border border-border rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/5 focus:border-brand-primary transition-all placeholder:text-muted-foreground"
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
              <p className="text-[11px] text-muted-foreground max-w-[220px] mt-0.5">Modify parameters or check the resolution log directories.</p>
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
                  onClick={() => {
                    setSelected(job);
                    setReplyText('');
                  }}
                  className={cn(
                    "p-5 rounded-xl border transition-all duration-200 cursor-pointer relative group bg-card",
                    isSelected 
                      ? "border-foreground shadow-sm ring-1 ring-foreground/5" 
                      : "border-border hover:border-border/50 hover:shadow-sm"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-foreground rounded-l-xl" />
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border tracking-wide", statusStyles[job.status])}>
                        {job.status === 'AWAITING_APPROVAL' ? 'Pending Review' : job.status === 'TEACHER_REPLIED' ? 'Reply Received' : 'Resolved'}
                      </span>
                      <span className={cn("text-[9px] font-extrabold px-1.5 py-0.5 rounded border tracking-wider", severityStyles[job.severity])}>
                        {job.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-medium">
                      <Clock size={12} />
                      <span>{job.time}</span>
                    </div>
                  </div>

                  <p className="text-[13px] font-medium text-muted-foreground leading-relaxed mb-4 bg-muted border border-border p-3 rounded-lg font-mono tracking-tight">
                    {job.issue}
                  </p>

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
                    <ArrowRight size={14} className={cn(
                      "transition-all duration-200",
                      isSelected ? "text-foreground translate-x-0.5" : "text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5"
                    )} />
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
                  <Hourglass size={12} className="text-muted-foreground" /> Discrepancy Context File
                </div>
                <h3 className="text-base font-bold text-foreground tracking-tight">{selected.student}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{selected.class} • <span className="text-muted-foreground">{selected.subject}</span></p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-all"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 no-scrollbar">
              
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Communication Logs</h4>
                
                <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-[13px] before:w-0.5 before:bg-border">
                  {selected.history?.map((node) => (
                    <div key={node.id} className="flex gap-3 relative z-10">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-background shadow-sm ring-4 ring-background shrink-0 mt-0.5",
                        node.role === 'HOD' ? 'bg-warning' : node.role === 'TEACHER' ? 'bg-brand-secondary' : 'bg-foreground'
                      )}>
                        {node.role[0]}
                      </div>
                      
                      <div className="flex-1 bg-muted border border-border/60 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-foreground">{node.user}</span>
                          <span className="text-[10px] text-muted-foreground">{node.time}</span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed font-mono">"{node.message}"</p>
                      </div>
                    </div>
                  ))}
                 </div>
               </div>

              {/* Grade Discussion Thread */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Grade Discussion
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selected.history?.length || 0} messages
                    </span>
                    <button
                      onClick={() => setDiscussionExpanded(!discussionExpanded)}
                      className="p-1 hover:bg-muted rounded hover:text-foreground transition-colors"
                    >
                      {discussionExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>
                
                {discussionExpanded && (
                  <div className="space-y-2">
                    {selected.history?.length === 0 ? (
                      <p className="text-center py-4 text-muted-foreground italic">
                        No discussion yet. Start the conversation!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selected.history.map((msg) => (
                          <div key={msg.id} className={cn(
                            "flex gap-3",
                            msg.role === 'TEACHER' ? 'flex-row' : 'flex-row-reverse'
                          )}>
                            <div className="w-8 h-8 flex items-center justify-center rounded-full 
                              {msg.role === 'HOD' ? 'bg-warning/20 text-warning' : 'bg-brand-secondary/20 text-brand-secondary'}">
                              {msg.role === 'HOD' ? 'H' : 'T'}
                            </div>
                            <div className="flex-1 max-w-[80%]">
                              <div className={cn(
                                "px-3 py-2 rounded-xl",
                                msg.role === 'HOD' ? 'bg-warning/10 text-foreground rounded-tr-none' : 
                                  'bg-brand-secondary/10 text-foreground rounded-tl-none'
                              )}>
                                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                                  {msg.user}
                                </p>
                                <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                                  {msg.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {msg.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-3 pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <textarea
                        value={discussionInput}
                        onChange={(e) => setDiscussionInput(e.target.value)}
                        placeholder="Type your message..."
                        rows={2}
                        className="w-full p-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary/10 bg-card"
                        disabled={isDiscussionLoading}
                      />
                    </div>
                    <button
                      onClick={sendDiscussionMessage}
                      disabled={isDiscussionLoading || !discussionInput.trim()}
                      className="px-3 py-2 bg-foreground text-background rounded-md hover:bg-foreground/80 transition-colors disabled:opacity-50"
                    >
                      {isDiscussionLoading ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
              {/* End Grade Discussion Thread */}

              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Append System Annotation</label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Enter explicit counter-validation findings..."
                    className="w-full p-3 bg-muted border border-border rounded-xl text-xs font-medium focus:bg-card focus:outline-none focus:ring-2 focus:ring-foreground/5 focus:border-brand-primary placeholder:text-muted-foreground resize-none transition-all leading-relaxed"
                  />
                  <div className="absolute bottom-3 right-3 text-muted-foreground pointer-events-none">
                    <MessageSquare size={13} />
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-border bg-muted/40 space-y-2 shrink-0">
              <button
                onClick={() => navigate(`/grading?revision=${selected.id}&student=${selected.index}`)}
                className="w-full py-2.5 bg-foreground text-background rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-foreground/80 transition-all shadow-sm flex items-center justify-center gap-1.5 group"
              >
                Open Correction Sheet 
                <ArrowRight size={13} className="text-muted-foreground group-hover:text-background group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                disabled={!replyText.trim()}
                onClick={handleAction}
                className={cn(
                  "w-full py-2 rounded-xl text-xs font-semibold tracking-wide border transition-all flex items-center justify-center gap-1.5",
                  replyText.trim() 
                    ? "bg-card border-border text-foreground hover:bg-muted cursor-pointer shadow-sm" 
                    : "bg-muted border-border text-muted-foreground cursor-not-allowed opacity-60"
                )}
              >
                <CornerDownRight size={13} />
                Save Internal Annotation
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="w-[28rem] bg-muted/20 border-l border-border hidden lg:flex flex-col items-center justify-center p-8 text-center shrink-0">
            <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center mb-3 text-muted-foreground">
              <Check size={16} />
            </div>
            <p className="text-xs font-semibold text-foreground">No Request Selected</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[200px]">Choose an active sheet revision node from the feed flow stream to view history.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
   );
}