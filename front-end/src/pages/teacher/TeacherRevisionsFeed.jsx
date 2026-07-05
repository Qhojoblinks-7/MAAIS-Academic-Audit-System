import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EmptyState } from '../../components/molecules';
import {
   AlertTriangle,
   Hourglass,
   ArrowRight,
   Clock,
   User,
   BookOpen,
   X,
   MessageSquare,
   CornerDownRight,
   Inbox,
   Check,
  Search,
  ChevronDown,
  ChevronUp
 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { useUI } from '../../context/UIContext';
import { useBreadcrumb } from '../../context/BreadcrumbContext';
import { teacherService } from '../../services';
import { notification } from '../../services/notificationService';
import { statusStyles, severityStyles } from '../shared/RevisionsFeed';
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

const TeacherRevisionsFeed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useRole();
  const { setRevisionCount } = useUI();
  const { setBreadcrumb } = useBreadcrumb();
  const [revisions, setRevisions] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [discussionExpanded, setDiscussionExpanded] = useState(false);
  const [discussionInput, setDiscussionInput] = useState('');
  const [isDiscussionLoading, setIsDiscussionLoading] = useState(false);

  useEffect(() => {
    const fetchRevisions = async () => {
      if (!user?.id) return;
      try {
        const data = await teacherService.getGradeRevisions?.(user.id || user.profileId) || [];
        setRevisions(data);
        setRevisionCount(Array.isArray(data) ? data.filter(r => r.status !== 'RESOLVED' && r.status !== 'REJECTED').length : 0);
      } catch (e) {
        console.error('Failed to fetch revisions:', e);
      }
    };
    fetchRevisions();
  }, [user?.id, user?.profileId, setRevisionCount]);

  useEffect(() => {
    if (!user?.id && !user?.profileId) return;
    const interval = setInterval(async () => {
      try {
        const data = await teacherService.getGradeRevisions?.(user.id || user.profileId) || [];
        setRevisions(data);
        setRevisionCount(Array.isArray(data) ? data.filter(r => r.status !== 'RESOLVED' && r.status !== 'REJECTED').length : 0);
      } catch (e) {
        // silent refresh
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.id, user?.profileId, setRevisionCount]);

  useEffect(() => {
    const queryId = searchParams.get('revision');
    if (queryId) {
      const match = revisions.find(r => r.id === queryId);
      if (match) setSelected(match);
    } else if (revisions.length > 0 && !selected) {
      setSelected(revisions[0]);
    }
  }, [searchParams, revisions]);

  useEffect(() => {
    const tabLabel = activeTab === 'pending' ? 'Pending' : activeTab === 'resolved' ? 'Resolved' : 'All';
    const crumbs = [{ label: 'Correction Requests', path: '/revisions' }, { label: tabLabel, path: null }];
    if (selected) {
      crumbs.push({ label: selected.student || 'Revision', path: null });
    }
    setBreadcrumb(crumbs);
  }, [activeTab, selected, setBreadcrumb]);

  const filteredData = revisions.filter(item => {
    const isResolved = (r) => (r.status || '').toUpperCase() === 'RESOLVED' || (r.status || '').toUpperCase() === 'REJECTED';
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

  const appendTeacherResponse = async () => {
    if (!replyText.trim() || !selected) return;

    try {
      const updatedRevision = {
        ...selected,
        status: 'TEACHER_REPLIED',
        history: [...(selected.history || []), {
          id: Date.now(),
          role: 'TEACHER',
          user: user?.name || 'You (Teacher)',
          message: replyText,
          time: 'Just now'
        }]
      };

      await teacherService.updateGradeRevision?.(selected.id, updatedRevision);

      setRevisions(prev => prev.map(item => item.id === selected.id ? updatedRevision : item));
      setSelected(updatedRevision);
      setReplyText('');
      toast.success('Response submitted to HOD');
    } catch (e) {
      console.error('Failed to submit response:', e);
      toast.error('Failed to submit response');
    }
  };

  const sendDiscussionMessage = async () => {
    if (!discussionInput.trim() || !selected) return;

    try {
      setIsDiscussionLoading(true);

      const newMessage = {
        id: Date.now(),
        role: 'TEACHER',
        user: user?.name || 'You (Teacher)',
        message: discussionInput,
        time: 'Just now'
      };

      const updatedRevision = {
        ...selected,
        history: [...(selected.history || []), newMessage]
      };

      await teacherService.updateGradeRevision?.(selected.id, updatedRevision);

      setRevisions(prev => prev.map(item => item.id === selected.id ? updatedRevision : item));
      setSelected(updatedRevision);
      setDiscussionInput('');
      toast.success('Message sent to HOD');
    } catch (err) {
      console.error('Failed to send discussion message:', err);
      toast.error('Failed to send message');
    } finally {
      setIsDiscussionLoading(false);
    }
  };

   return (
    <div className="flex-1 flex w-full h-full min-h-0 overflow-hidden bg-slate-50/40 font-sans antialiased">
      
      <div className="flex-1 flex flex-col min-w-0 h-full border-r border-slate-200/60 bg-white">
        
        <div className="p-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm shadow-slate-900/10">
                <AlertTriangle size={18} className="text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">My Revision Requests</h1>
                <p className="text-xs text-slate-500 font-medium">View HOD feedback and respond to grade revision requests</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200/30 text-[11px] font-semibold">
              <AlertTriangle size={12} className="text-amber-600 animate-pulse" />
              <span>{revisions.filter(r => r.status !== 'RESOLVED' && r.status !== 'REJECTED').length} Active Requests</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
<div className="flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/40">
                {['pending', 'resolved', 'all'].map((tab) => {
                  const isResolved = (r) => (r.status || '').toUpperCase() === 'RESOLVED' || (r.status || '').toUpperCase() === 'REJECTED';
                  const count = tab === 'all' 
                    ? revisions.length 
                    : tab === 'pending' 
                      ? revisions.filter(r => !isResolved(r)).length 
                      : revisions.filter(r => isResolved(r)).length;
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        const nextList = revisions.filter(r => tab === 'all' ? true : tab === 'pending' ? !isResolved(r) : isResolved(r));
                        setSelected(nextList[0] || null);
                      }}
                     className={cn(
                       "px-4 py-1.5 text-xs font-semibold capitalize rounded-md transition-all duration-150 flex items-center gap-1.5 cursor-pointer",
                       activeTab === tab 
                         ? "bg-white text-slate-900 shadow-sm border border-slate-200/20 font-bold" 
                         : "text-slate-500 hover:text-slate-800"
                     )}
                   >
                     <span>{tab === 'pending' ? 'Pending Reply' : tab}</span>
                     {count > 0 && (
                       <span className={cn(
                         "inline-flex items-center justify-center min-w-[18px] h-5 px-1 rounded-full text-[10px] font-bold",
                         activeTab === tab 
                           ? "bg-slate-900 text-white" 
                           : "bg-slate-200 text-slate-600"
                       )}>
                         {count}
                       </span>
                     )}
                   </button>
                 );
               })}
             </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student, code, course..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-400 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 space-y-3 min-h-0 no-scrollbar">
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
                <EmptyState context="tickets" variant="compact" />
              </div>
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
                    "p-5 rounded-xl border transition-all duration-200 cursor-pointer relative group bg-white",
                    isSelected 
                      ? "border-slate-900 shadow-sm ring-1 ring-slate-900/5" 
                      : "border-slate-200/70 hover:border-slate-350 hover:shadow-sm"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-slate-900 rounded-l-xl" />
                  )}

                  <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-2">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border tracking-wide", statusStyles[(job.status || '').toUpperCase()] || 'bg-slate-100')}>
                        {(job.status || '').toUpperCase() === 'AWAITING_APPROVAL' ? 'Awaiting HOD' : (job.status || '').toUpperCase() === 'TEACHER_REPLIED' ? 'HOD Reviewing' : (job.status || '').toUpperCase() === 'REJECTED' ? 'Rejected' : (job.status || '').toUpperCase() === 'RESOLVED' ? 'Resolved' : 'Unknown'}
                      </span>
                       <span className={cn("text-[9px] font-extrabold px-1.5 py-0.5 rounded border tracking-wider", severityStyles[job.severity] || '')}>
                        {job.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                      <Clock size={12} />
                      <span>{typeof job.time === 'string' ? job.time : formatTime(job.time)}</span>
                    </div>
                  </div>

                  <p className="text-[13px] font-medium text-slate-700 leading-relaxed mb-4 bg-slate-50 border border-slate-100 p-3 rounded-lg font-mono tracking-tight">
                    {job.issue}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-4 text-[12px] font-medium text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-slate-400" />
                        <span className="font-semibold text-slate-800">{job.student}</span>
                      </div>
                      <div className="w-1 h-1 bg-slate-300 rounded-full" />
                      <div className="flex items-center gap-1.5">
                        <BookOpen size={13} className="text-slate-400" />
                        <span>{job.class} <span className="text-slate-300 mx-1">/</span> <span className="text-slate-400 font-normal">{job.subject}</span></span>
                      </div>
                    </div>
                    <ArrowRight size={14} className={cn(
                      "transition-all duration-200",
                      isSelected ? "text-slate-900 translate-x-0.5" : "text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5"
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
            className="w-[28rem] bg-white h-full border-l border-slate-200/70 flex flex-col shrink-0 shadow-2xl shadow-slate-900/5 hidden lg:flex min-h-0"
          >
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/40 shrink-0">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <Hourglass size={12} className="text-slate-400" /> Grade Revision
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">{selected.student}</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{selected.class} • <span className="text-slate-400">{selected.subject}</span></p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-all cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 no-scrollbar">
               
<div className="space-y-3.5">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HOD Communications</h4>
                 
                 <div className="space-y-3 relative before:absolute before:top-2 before:bottom-2 before:left-[13px] before:w-0.5 before:bg-slate-100">
                   {Array.isArray(selected.history) && selected.history.length > 0 ? selected.history.map((node) => (
                     <div key={node.id} className="flex gap-3 relative z-10">
                       <div className={cn(
                         "w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-4 ring-white shrink-0 mt-0.5",
                         node.role === 'HOD' ? 'bg-amber-600' : node.role === 'TEACHER' ? 'bg-sky-600' : 'bg-slate-800'
                       )}>
                         {node.role[0]}
                       </div>
                       
                       <div className="flex-1 bg-slate-50 border border-slate-200/60 rounded-xl p-3">
                         <div className="flex items-center justify-between mb-1">
                           <span className="text-[11px] font-bold text-slate-800">{node.user}</span>
                           <span className="text-[10px] text-slate-400">{formatTime(node.time)}</span>
                         </div>
                         <p className="text-xs text-slate-600 leading-relaxed font-mono">"{node.message}"</p>
                       </div>
                     </div>
                   )) : null}
                  </div>
               </div>
  
               {/* Grade Discussion Thread */}
               <div className="border-t border-slate-100 pt-6">
                 <div className="flex items-center justify-between mb-3">
                   <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                     Grade Discussion
                   </h4>
                   <div className="flex items-center gap-2">
<span className="text-sm text-slate-500">
                        {Array.isArray(selected.history) ? selected.history.length : 0} messages
                      </span>
                     <button
                       onClick={() => setDiscussionExpanded(!discussionExpanded)}
                       className="p-1 hover:bg-slate-100 rounded hover:text-slate-700 transition-colors cursor-pointer"
                     >
                       {discussionExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                     </button>
                   </div>
                 </div>
                 
{discussionExpanded && (
                   <div className="space-y-2">
{!Array.isArray(selected.history) || selected.history.length === 0 ? (
                         <p className="text-center py-4 text-slate-500 italic">
                           No discussion yet. Start the conversation!
                         </p>
                       ) : (
                         <div className="space-y-2">
                           {selected.history.map((msg) => (
                             <div key={msg.id} className={cn(
                               "flex gap-3",
                               msg.role === 'TEACHER' ? 'flex-row' : 'flex-row-reverse'
                             )}>
                               <div className={cn(
                                 "w-8 h-8 flex items-center justify-center rounded-full",
                                 msg.role === 'HOD' ? 'bg-amber-100 text-amber-600' : msg.role === 'TEACHER' ? 'bg-sky-100 text-sky-600' : 'bg-slate-200 text-slate-600'
                               )}>
                                 {msg.role === 'HOD' ? 'H' : msg.role === 'TEACHER' ? 'T' : '?'}
                               </div>
                               <div className="flex-1 max-w-[80%]">
                                 <div className={cn(
                                   "px-3 py-2 rounded-xl",
                                   msg.role === 'HOD' ? 'bg-amber-50 text-slate-800 rounded-tr-none' : 
                                     msg.role === 'TEACHER' ? 'bg-sky-50 text-slate-800 rounded-tl-none' :
                                     'bg-slate-100 text-slate-800 rounded-tl-none'
                                 )}>
                                   <p className="text-xs font-medium text-slate-500 mb-0.5">
                                     {msg.user}
                                   </p>
                                   <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">
                                     {msg.message}
                                   </p>
                                   <p className="text-xs text-slate-400 mt-1">
                                     {formatTime(msg.time)}
                                   </p>
                                 </div>
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                   )}
                  
                   <div className="mt-3 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <textarea
                          value={discussionInput}
                          onChange={(e) => setDiscussionInput(e.target.value)}
                          placeholder="Type your message..."
                          rows={2}
                          className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                          disabled={isDiscussionLoading}
                        />
                      </div>
                      <button
                        onClick={sendDiscussionMessage}
                        disabled={isDiscussionLoading || !discussionInput.trim()}
                        className="px-3 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isDiscussionLoading ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </div>
                </div>
                {/* End Grade Discussion Thread */}
 
                 {selected.status === 'AWAITING_APPROVAL' || selected.status === 'REJECTED' ? (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add Teacher Response</label>
                    <div className="relative">
                      <textarea
                        rows={4}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Provide additional context or evidence for HOD review..."
                        className="w-full p-3 bg-slate-50/60 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-500 placeholder-slate-400 resize-none transition-all leading-relaxed"
                      />
                      <div className="absolute bottom-3 right-3 text-slate-300 pointer-events-none">
                        <MessageSquare size={13} />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/40 space-y-2 shrink-0">
                {selected.status === 'AWAITING_APPROVAL' || selected.status === 'REJECTED' ? (
                  <>
                    <button
                      onClick={() => navigate(`/grading?revision=${selected.id}&student=${selected.index}`)}
                      className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-1.5 group"
                    >
                      Open Correction Sheet 
                      <ArrowRight size={13} className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </button>

                    <button
                      disabled={!replyText.trim()}
                      onClick={appendTeacherResponse}
                      className={cn(
                        "w-full py-2 rounded-xl text-xs font-semibold tracking-wide border transition-all flex items-center justify-center gap-1.5",
                        replyText.trim() 
                          ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm" 
                          : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                      )}
                    >
                      <CornerDownRight size={13} />
                      Submit Response to HOD
                    </button>
                  </>
                ) : selected.status === 'TEACHER_REPLIED' ? (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-sky-700 bg-sky-50 px-3 py-2 rounded-lg">
                    <Clock size={14} />
                    Waiting for HOD Final Decision
                  </div>
                ) : (
                  <div className={cn(
                    "flex items-center gap-2 text-[10px] font-bold px-3 py-2 rounded-lg",
                    selected.status === 'REJECTED' ? "text-red-700 bg-red-50" : "text-emerald-700 bg-emerald-50"
                  )}>
                    <Check size={14} />
                    {selected.status === 'REJECTED' ? 'Rejected — Awaiting Further Action' : 'Grade Revision Finalized'}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="w-[28rem] bg-slate-50/20 border-l border-slate-200/60 hidden lg:flex flex-col items-center justify-center p-8 text-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 text-slate-400">
                <Check size={16} />
              </div>
              <p className="text-xs font-semibold text-slate-700">No Request Selected</p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px]">Select a grade revision request to view HOD feedback and respond.</p>
            </div>
          )}
        </AnimatePresence>
    </div>
  );
};

export { TeacherRevisionsFeed };
export default TeacherRevisionsFeed;
