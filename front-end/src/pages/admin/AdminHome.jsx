import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, GraduationCap, TrendingUp, AlertCircle, Clock, Plus, Radio,
  FileCheck, LifeBuoy, StickyNote, Zap, Lock, ArrowUpRight, MoreVertical,
  ThumbsUp, ThumbsDown, ExternalLink, Calendar, User, UserPlus, ChevronRight, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { useTickets, useUnreadNotifications, useAnalyticsPulse as useAdminAnalyticsPulse, useArchiveStats as useAdminArchiveStats, useAllStudents, useAllStaff } from '../../lib/hooks';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { 
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { 
  performanceDatasets, fabActions, registerNodeProtocols, broadcastChannels
} from './data/mockDashboard';

function Sparkline({ color }) {
  return (
    <svg className="w-12 h-6 overflow-visible" viewBox="0 0 100 40">
      <path
        d="M0,35 Q10,10 20,25 T40,15 T60,20 T80,10 T100,5"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AdminHome() {
  const { user } = useRole();
  const navigate = useNavigate();
  
  const ticketsQuery = useTickets();
  const notificationsQuery = useUnreadNotifications();
  const analyticsQuery = useAdminAnalyticsPulse();
  const archiveStatsQuery = useAdminArchiveStats();
  const studentsQuery = useAllStudents();
  const staffQuery = useAllStaff();

  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [fabOpen, setFabOpen] = React.useState(false);
  const [notepadContent, setNotepadContent] = React.useState('Check SHS 1 enrollment CSV by 2 PM');
  const [activeMetric, setActiveMetric] = React.useState('Avg Score');
  const [activeAction, setActiveAction] = React.useState(null);
  const [isFreezeActive, setIsFreezeActive] = React.useState(false);
  const [selectedChannel, setSelectedChannel] = React.useState('In-App Push');
  const [broadcastPayload, setBroadcastPayload] = React.useState('');

  const tickets = ticketsQuery.data || [];
  const notifications = notificationsQuery.data || [];
  const analytics = analyticsQuery.data;
  const archiveStats = archiveStatsQuery.data;
  const students = studentsQuery.data || [];
  const staff = staffQuery.data || [];

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const vitalSigns = [
    { label: 'Total Students', value: students.length || '—', trend: '#10b981', progress: students.length ? Math.min((students.length / 2000) * 100, 100) : 0, bg: 'bg-emerald-50', color: 'text-emerald-600', sub: `${students.length} linked profiles` },
    { label: 'Active Staff', value: staff.length || '—', trend: '#3b82f6', progress: staff.length ? Math.min((staff.length / 200) * 100, 100) : 0, bg: 'bg-blue-50', color: 'text-blue-600', sub: `${staff.length} registered nodes` },
    { label: 'Pending Tickets', value: tickets.length || '0', trend: '#f59e0b', progress: tickets.length ? Math.min((tickets.length / 20) * 100, 100) : 0, bg: 'bg-amber-50', color: 'text-amber-600', sub: 'Awaiting resolution' },
    { label: 'Unread Alerts', value: unreadCount || '0', trend: '#ef4444', progress: unreadCount ? Math.min((unreadCount / 10) * 100, 100) : 0, bg: 'bg-rose-50', color: 'text-rose-600', sub: 'System notifications' },
  ];

  const activities = analytics?.recentActivity || [];

  const approvals = [];
  const ticketsLoading = ticketsQuery.isLoading;

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // FAB Trigger Pipeline
  const executeAction = (action) => {
    if (action === 'Emergency Freeze') setActiveAction('freeze');
    else if (action === 'Register Node') setActiveAction('register');
    else if (action === 'Broadcast Pulse') setActiveAction('broadcast');
    setFabOpen(false);
  };

  // Approval Resolution State Updaters
  const handleResolveApproval = (id, status, teacher) => {
    setApprovals(prev => prev.filter(item => item.id !== id));
    
    // Inject resolution update directly back down into live audit log stream
    const newLog = {
      id: String(Date.now()),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      event: `Approval request by ${teacher} was ${status === 'grant' ? 'APPROVED' : 'REJECTED & ABORTED'} by Admin.`,
      type: status === 'grant' ? 'system' : 'security'
    };
    setActivities(prev => [newLog, ...prev]);
  };

  // Global Pulse Core Execution Pipeline
  const handleFireBroadcast = () => {
    if (!broadcastPayload.trim()) return;

    const pulseLog = {
      id: String(Date.now()),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      event: `Global Pulse emitted via [${selectedChannel}]: "${broadcastPayload.slice(0, 35)}..."`,
      type: 'comm'
    };
    
    setActivities(prev => [pulseLog, ...prev]);
    setBroadcastPayload('');
    setActiveAction(null);
  };

  const formatTime = (date) => date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 relative p-5">
      <div className="max-w-6xl mx-auto pb-12 space-y-5">
        
        {/* Header - Transparent Architecture */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 px-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
            <Radio size={100} />
          </div>
          
          <div className="relative">
            <h1 className="text-xl font-black text-slate-900 tracking-tight italic font-display">
              Good morning, Admin
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formatDate(currentTime)}</p>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <p className="text-[10px] font-black text-slate-700 font-mono tracking-tight tabular-nums">{formatTime(currentTime)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100/80">
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isFreezeActive ? "bg-rose-500" : "bg-emerald-500")} />
              <span className={cn("text-[9px] font-black uppercase tracking-wider", isFreezeActive ? "text-rose-700" : "text-emerald-700")}>
                {isFreezeActive ? 'Locked' : 'Live'}
              </span>
            </div>
            <div className="px-3 py-1.5 bg-slate-900 text-white rounded-xl flex items-center gap-2 shadow-md">
              <Calendar size={12} className="text-slate-400" />
              <span className="text-[9px] font-black tracking-wider uppercase">2025/26 Academic • T1</span>
              <div className="px-1.5 py-0.5 bg-slate-700 rounded text-[8px] font-black tracking-normal">SHS 3</div>
            </div>
          </div>
        </header>

         {/* Main Workspace Grid Splits */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
           
           <div className="lg:col-span-8 space-y-5">
             
         {/* Vital Signs Cards */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {vitalSigns.map((card, i) => {
                 // Map icon names to actual components
                 const iconMap = { Users, GraduationCap, TrendingUp, AlertCircle };
                 const Icon = iconMap[card.icon] || Users;
                 const displayValue = card.label === 'Flagged Activities' && isFreezeActive ? 'SYSTEM FROZEN' : card.value;
                 
                 return (
                   <motion.div 
                     key={i}
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="bg-white p-4 rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all relative group"
                   >
                     <div className="flex justify-between items-start mb-2">
                       <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105", card.bg, card.color)}>
                         <Icon size={18} />
                       </div>
                       <Sparkline color={card.trend} />
                     </div>
                     
                     <p className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">{displayValue}</p>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">{card.label}</p>
                     
                     {card.progress !== undefined ? (
                       <div className="space-y-1">
                         <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${card.progress}%` }}
                             className={cn("h-full rounded-full", card.progress < 40 ? "bg-rose-500" : card.progress < 75 ? "bg-amber-500" : "bg-emerald-500")}
                           />
                         </div>
                         <p className="text-[8px] font-bold text-slate-400 flex justify-between">
                           <span>Velocity</span>
                           <span>{card.progress}% Complete</span>
                         </p>
                       </div>
                     ) : (
                       <p className="text-[10px] font-medium text-slate-500 leading-tight">{card.subtext}</p>
                     )}
                   </motion.div>
                 );
               })}
             </div>

            {/* Performance Heatmap */}
            <section className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Departmental Performance Heatmap</h3>
                  <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Academic Health Quotient</p>
                </div>
<div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-100">
                   {Object.keys(performanceDatasets).map((t) => (
                     <button 
                       key={t} 
                       onClick={() => setActiveMetric(t)}
                       className={cn(
                         "px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-wider transition-all",
                         t === activeMetric ? "bg-white text-slate-900 shadow-xs" : "text-slate-400 hover:text-slate-600"
                       )}
                     >
                       {t}
                     </button>
                   ))}
                 </div>
              </div>

              <div className="h-[180px] w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceDatasets[activeMetric]} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} dy={5} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-lg text-[10px]">
                              <p className="font-black text-slate-400 uppercase tracking-wider mb-0.5">{payload[0].payload.name}</p>
                              <p className="font-black text-slate-900 text-sm">
                                {payload[0].value}{activeMetric === 'Avg Score' ? '%' : '% Progress'}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 2, 2]} barSize={34}>
                      {performanceDatasets[activeMetric].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-5 gap-2 mt-4 pt-3 border-t border-slate-50">
                {performanceDatasets[activeMetric].map((dept, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider truncate">{dept.name}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-slate-800 font-mono">{dept.value}%</span>
                      {dept.value > 80 && <ArrowUpRight size={10} className="text-emerald-500 shrink-0" />}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Registry Activity Feed */}
            <section className="bg-slate-900 rounded-2xl p-5 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[11px] font-black text-white uppercase tracking-wider">Registry Activity Feed</h3>
                  <p className="text-[8px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">Live Audit Trail</p>
                </div>
                <Link to="/audit/extended" className="text-[8px] font-black text-slate-400 uppercase tracking-wider hover:text-white transition-all">View Extended</Link>
              </div>

              <div className="space-y-0.5 text-xs max-h-[220px] overflow-y-auto custom-scrollbar">
                <AnimatePresence initial={false}>
                  {activities.map((log) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 py-2 px-2 hover:bg-slate-800/40 rounded-xl transition-all group"
                    >
                      <span className="text-[9px] font-bold text-slate-500 font-mono w-14 shrink-0">{log.time}</span>
                      <div className={cn(
                        "w-1 h-1 rounded-full shrink-0", 
                        log.type === 'comm' ? 'bg-blue-500' : log.type === 'security' ? 'bg-rose-500' : 'bg-slate-700 group-hover:bg-emerald-500'
                      )} />
                      <p className="text-[11px] font-medium text-slate-300 truncate group-hover:text-white">{log.event}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>

          {/* Action Hub Sidebar */}
          <aside className="lg:col-span-4 space-y-5">
            
            {/* Pending Approvals */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative group">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider mb-4">Pending Approvals</h3>
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {approvals.length === 0 ? (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[10px] py-6 font-bold text-slate-400 uppercase tracking-wider">
                      No Approvals in Queue
                    </motion.p>
                  ) : (
                    approvals.map((req) => (
                      <motion.div 
                        key={req.id} 
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        className="p-3 bg-slate-50/60 rounded-xl border border-slate-100 hover:border-blue-100 transition-all group/card"
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center border border-slate-100 shrink-0">
                              <User size={12} className="text-slate-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 truncate leading-none mb-0.5">{req.teacher}</p>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{req.time}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => navigate(`/approvals/inspect/${req.id}`)}
                            className="p-1 text-slate-400 hover:text-slate-900 shrink-0"
                          >
                            <MoreVertical size={14} />
                          </button>
                        </div>
                        <p className="text-[11px] font-bold text-slate-600 mb-2.5 truncate px-0.5">{req.detail}</p>
                        <div className="flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleResolveApproval(req.id, 'grant', req.teacher)}
                            className="flex-1 py-1.5 bg-emerald-600 text-white rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-all flex items-center justify-center gap-1"
                          >
                            <ThumbsUp size={10} /> Grant
                          </button>
                          <button 
                            onClick={() => handleResolveApproval(req.id, 'abort', req.teacher)}
                            className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-wider hover:text-rose-600 hover:border-rose-200 transition-all flex items-center justify-center gap-1"
                          >
                            <ThumbsDown size={10} /> Abort
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
              <button 
                onClick={() => navigate('/approvals/all')}
                className="w-full mt-4 py-2 border border-dashed border-slate-200 rounded-xl text-[8px] font-black text-slate-400 uppercase tracking-wider hover:bg-slate-50 transition-all"
              >
                Queue Manager ({approvals.length + 5}+)
              </button>
            </div>

            {/* Support Queue */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative group">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider mb-0">Support Queue</h3>
                <button 
                  onClick={() => navigate('/support/new')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-slate-800 transition-all"
                >
                  <Plus size={14} /> New Ticket
                </button>
              </div>
               <div className="space-y-2">
                {tickets.slice(0, 5).map((ticket) => (
                  <div 
                    key={ticket.id} 
                    onClick={() => navigate(`/support/ticket/${ticket.id}`)}
                    className="flex items-center justify-between p-2.5 bg-slate-50/60 rounded-xl border border-slate-100 hover:border-amber-100 transition-all group/ticket cursor-pointer"
                  >
                    <div className="flex gap-3 items-center min-w-0">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs",
                        ticket.status === 'RESOLVED' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      )}>
                        <Radio size={14} className={cn(ticket.status !== 'RESOLVED' && "animate-pulse")} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-slate-900 truncate tracking-tight">{ticket.subject || ticket.title || 'Support Ticket'}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate">{ticket.createdBy?.name || 'User'}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{ticket.status || 'OPEN'}</span>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <p className="text-center text-[10px] py-4 font-bold text-slate-400 uppercase tracking-wider">No tickets in queue</p>
                )}
              </div>
            </div>

            {/* Strategic Notepad Memo */}
<div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-inner relative overflow-hidden">
  <div className="flex items-center gap-2 mb-4">
    <div className="w-6 h-6 bg-amber-100 text-amber-700 rounded-md flex items-center justify-center shrink-0">
      <StickyNote size={12} />
    </div>
    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Strategic Memo</h3>
  </div>
   <Textarea
     value={notepadContent}
     onChange={(e) => setNotepadContent(e.target.value)}
     className="h-24 placeholder:text-slate-400"
     placeholder="Commit strategic reminders here..."
   />
  <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/40">
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider italic text-emerald-600">Saved</p>
     <Button variant="outline" className="p-1" title="Copy Memo"
       onClick={() => {
         // Safe check for Modern Secure Context Clipboard API
         if (navigator.clipboard && navigator.clipboard.writeText) {
           navigator.clipboard.writeText(notepadContent)
             .then(() => alert("Memo copied to workspace clipboard!"))
             .catch(() => alert("Failed to copy text."));
         } else {
           // Fallback mechanism for non-secure HTTP / network IP environments
           const textArea = document.createElement("textarea");
           textArea.value = notepadContent;
           textArea.style.position = "fixed"; // Avoid scrolling page to bottom
           document.body.appendChild(textArea);
           textArea.focus();
           textArea.select();
           try {
             document.execCommand('copy');
             alert("Memo copied to workspace clipboard! (via fallback)");
           } catch (err) {
             alert("Could not copy memo automatically.");
           }
           document.body.removeChild(textArea);
         }
       }}
     >
       <ExternalLink size={12} />
     </Button>
  </div>
</div>
            
          </aside>
        </div>
      </div>

      {/* Quick Action Floating Action System */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5">
<AnimatePresence>
           {fabOpen && (
             <div className="flex flex-col gap-2 items-end mb-1">
               {fabActions.map((action, i) => {
                 const iconMap = { UserPlus, Radio, Lock };
                 const Icon = iconMap[action.icon] || Plus;
                 return (
                   <motion.button
                     key={i}
                     initial={{ opacity: 0, scale: 0.9, x: 15 }}
                     animate={{ opacity: 1, scale: 1, x: 0 }}
                     exit={{ opacity: 0, scale: 0.9, x: 15 }}
                     className={cn("flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-lg transition-all", action.color, action.hover)}
                     onClick={() => executeAction(action.label)}
                   >
                     <span className="text-[9px] font-black uppercase tracking-wider">{action.label}</span>
                     <Icon size={14} />
                   </motion.button>
                 );
               })}
             </div>
           )}
         </AnimatePresence>

         <Button 
           onClick={() => setFabOpen(!fabOpen)}
           className={cn(
             "w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md transform active:scale-95 z-50",
             fabOpen ? "bg-slate-900 text-white rotate-45" : 
             isFreezeActive ? "bg-rose-600 text-white animate-pulse" : "bg-slate-900 text-white"
           )}
         >
           {isFreezeActive && !fabOpen ? <Lock size={20} /> : <Plus size={20} />}
         </Button>
      </div>

      {/* Quick Action Modals */}
      <AnimatePresence>
{activeAction === 'register' && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setActiveAction(null)} />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-black italic font-display text-slate-900">Register New Node</h3>
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider mb-5">Identity Provisioning Protocol</p>
                
                 <div className="grid grid-cols-1 gap-2.5">
                   {registerNodeProtocols.map((p, i) => {
                     const iconMap = { GraduationCap, UserPlus, Users };
                     const Icon = iconMap[p.icon] || UserPlus;
                     return (
                       <Button
                         key={i}
                         onClick={() => { setActiveAction(null); navigate(p.path); }}
                         variant="outline"
                         className="flex items-center justify-between p-4 text-left w-full"
                       >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-900 shadow-xs shrink-0">
                              <Icon size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black italic font-display text-slate-900 leading-tight">{p.label}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight truncate">{p.desc}</p>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-slate-300 shrink-0" />
                       </Button>
                     );
                   })}
                 </div>
              </motion.div>
           </div>
         )}

         {activeAction === 'broadcast' && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setActiveAction(null)} />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black italic font-display">Broadcast Pulse</h3>
                    <p className="text-[8px] font-black uppercase text-white/50 tracking-wider mt-0.5">Omni-Channel Channels</p>
                  </div>
                  <X size={18} className="cursor-pointer hover:text-rose-500 transition-all" onClick={() => setActiveAction(null)} />
                </div>
                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider ml-1">Channels</label>
                     <div className="flex gap-2">
                       {broadcastChannels.map(c => (
                         <Button
                           key={c}
                           onClick={() => setSelectedChannel(c)}
                           variant="outline"
                           className={cn(
                             "flex-1 py-2",
                             c === selectedChannel ? "bg-slate-900 text-white" : "text-slate-600"
                           )}
                         >
                           {c}
                         </Button>
                       ))}
                     </div>
                  </div>
                   <div className="space-y-2">
                     <label className="text-[8px] font-black uppercase text-slate-400 tracking-wider ml-1">Payload Message Core</label>
                     <Textarea 
                       value={broadcastPayload}
                       onChange={(e) => setBroadcastPayload(e.target.value)}
                       className="h-24 font-medium text-xs italic"
                       placeholder="Enter core notification copy..."
                     />
                   </div>
                   <Button 
                     onClick={handleFireBroadcast}
                     disabled={!broadcastPayload.trim()}
                     className={cn(
                       "w-full py-3.5",
                       broadcastPayload.trim() ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-400"
                     )}
                   >
                     <Radio size={14} className={cn(broadcastPayload.trim() && "animate-pulse")} /> Initiate Global Pulse
                   </Button>
                </div>
             </motion.div>
          </div>
        )}

        {activeAction === 'freeze' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setActiveAction(null)} />
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-xs bg-white rounded-2xl shadow-xl text-center p-6">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm", isFreezeActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                  <Lock size={24} />
                </div>
                <h3 className="text-lg font-black italic font-display text-slate-900 mb-2">
                  {isFreezeActive ? 'Lift Authority Freeze?' : 'Initiate Security Freeze?'}
                </h3>
                <p className="text-slate-500 text-[11px] font-medium leading-normal mb-6">
                  {isFreezeActive 
                    ? 'Restores standard entry and transactional read/write authority parameters across all department nodes.'
                    : 'Instantly locks write authority cross-institutionally to safeguard live evaluation logs.'}
                </p>
                 <div className="flex gap-2.5">
                   <Button variant="outline" className="flex-1 py-2.5" onClick={() => setActiveAction(null)}>
                     Abort
                   </Button>
                   <Button 
                     onClick={() => { 
                       setIsFreezeActive(!isFreezeActive); 
                       
                       // Push critical system action updates down into live view logger
                       const freezeLog = {
                         id: String(Date.now()),
                         time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                         event: `CRITICAL STATUS ALTERED: Global write access ${!isFreezeActive ? 'SUSPENDED/FROZEN' : 'RESTORED/UNFROZEN'}.`,
                         type: 'security'
                       };
                       setActivities(prev => [freezeLog, ...prev]);
                       setActiveAction(null); 
                     }}
                     className={cn(
                       "flex-1 py-2.5",
                       isFreezeActive ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                     )}
                   >
                     {isFreezeActive ? 'Restore Node' : 'Lock System'}
                   </Button>
                 </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}