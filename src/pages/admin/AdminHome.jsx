import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Search,
  Plus,
  Radio,
  FileCheck,
  LifeBuoy,
  StickyNote,
  Zap,
  Lock,
  ArrowUpRight,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Calendar,
  User,
  Activity,
  UserPlus,
  ChevronRight,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';

const performanceData = [
  { name: 'Science', score: 78, color: '#059669' },
  { name: 'Business', score: 82, color: '#0284c7' },
  { name: 'General Arts', score: 74, color: '#7c3aed' },
  { name: 'Home Econ', score: 88, color: '#db2777' },
  { name: 'Visual Arts', score: 68, color: '#ea580c' },
];

const activityLog = [
  { id: '1', time: '10:15 AM', event: 'SHS 3 Science 2 marks finalized by HOD.', type: 'academic' },
  { id: '2', time: '10:02 AM', event: 'Bulk SMS sent to SHS 1 Parents regarding PTA meeting.', type: 'comm' },
  { id: '3', time: '09:45 AM', event: 'New Student (Index #4492) added to House: Guggisberg.', type: 'system' },
  { id: '4', time: '09:12 AM', event: 'Server Sync: Database integrity check successful.', type: 'security' },
  { id: '5', time: '08:30 AM', event: 'Madam Gladys requested Password Reset.', type: 'support' },
];

const pendingApprovals = [
  { id: '1', teacher: 'Mr. Owusu', detail: 'Index #001 Grade Change (C6 -> B3)', time: '2h ago' },
  { id: '2', teacher: 'Mrs. Appiah', detail: 'Bulk Delete: SHS 2 Test Drafts', time: '4h ago' },
];

const supportTickets = [
  { id: '1', user: 'Madam Gladys', issue: 'Password reset encryption loop', status: 'priority' },
  { id: '2', user: 'Chemistry Lab', issue: 'Tablet Node #14 sync error', status: 'active' },
];

function Sparkline({ color }) {
  return (
    <svg className="w-16 h-8 overflow-visible" viewBox="0 0 100 40">
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
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [fabOpen, setFabOpen] = React.useState(false);
  const [notepadContent, setNotepadContent] = React.useState('Check SHS 1 enrollment CSV by 2 PM');
  
  // Quick Action States
  const [activeAction, setActiveAction] = React.useState(null);
  const [isFreezeActive, setIsFreezeActive] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const executeAction = (action) => {
    if (action === 'Emergency Freeze') {
      setActiveAction('freeze');
    } else if (action === 'Register Node') {
      setActiveAction('register');
    } else if (action === 'Broadcast Pulse') {
      setActiveAction('broadcast');
    }
    setFabOpen(false);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 relative p-8">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">
        
        {/* 1. Current State Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <Radio size={160} />
          </div>
          
          <div className="relative">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic font-display">
              Good morning, Admin
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{formatDate(currentTime)}</p>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <p className="text-sm font-black text-slate-900 font-mono tracking-tighter tabular-nums">{formatTime(currentTime)}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">System Live</span>
            </div>
            <div className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-slate-900/10">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-[11px] font-black tracking-widest uppercase">2025/2026 Academic Year | Term 1</span>
              <div className="px-2 py-0.5 bg-slate-700 rounded-lg text-[9px] font-black tracking-widest">SHS 3</div>
            </div>
          </div>
        </header>

        {/* 2. Vital Signs (Quick Metric Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: 'Student Census', 
              value: '2,450', 
              subtext: '1,800 Boarders / 650 Day', 
              icon: Users, 
              color: 'text-blue-600', 
              bg: 'bg-blue-50',
              trend: '#2563eb'
            },
            { 
              label: 'Faculty Engagement', 
              value: '112', 
              subtext: '8 Teachers currently offline', 
              icon: GraduationCap, 
              color: 'text-indigo-600', 
              bg: 'bg-indigo-50',
              trend: '#4f46e5'
            },
            { 
              label: 'Grading Progress', 
              value: '65%', 
              subtext: 'Next Deadline: Oct 24th', 
              icon: TrendingUp, 
              color: 'text-emerald-600', 
              bg: 'bg-emerald-50',
              trend: '#059669',
              progress: 65
            },
            { 
              label: 'Flagged Activities', 
              value: '14 Alerts', 
              subtext: 'Integrity concerns detected', 
              icon: AlertCircle, 
              color: 'text-rose-600', 
              bg: 'bg-rose-50',
              trend: '#e11d48'
            },
          ].map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-200/50 shadow-sm hover:shadow-md transition-all relative group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn("w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-transform group-hover:scale-110", card.bg, card.color)}>
                  <card.icon size={22} />
                </div>
                <Sparkline color={card.trend} />
              </div>
              
              <p className="text-[28px] font-black text-slate-900 tracking-tighter leading-none mb-2">{card.value}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{card.label}</p>
              
              {card.progress !== undefined ? (
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${card.progress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full transition-colors",
                        card.progress < 40 ? "bg-rose-500" : card.progress < 75 ? "bg-amber-500" : "bg-emerald-500"
                      )}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 flex justify-between">
                    <span>Performance Velocity</span>
                    <span>{card.progress}% Complete</span>
                  </p>
                </div>
              ) : (
                <p className="text-[11px] font-bold text-slate-500/80 leading-snug">{card.subtext}</p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Grid: Left 8 Columns */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 3. Performance Heatmap (Central Visual) */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <Radio className="text-slate-100" size={100} />
              </div>
              <div className="flex items-center justify-between mb-10 relative">
                <div>
                  <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-[0.25em]">Departmental Performance Heatmap</h3>
                  <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">Cross-Institutional Academic Health Summary</p>
                </div>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 shadow-inner">
                  {['Avg Score', 'Completion', 'Velocity'].map((t) => (
                    <button key={t} className={cn(
                      "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      t === 'Avg Score' ? "bg-white text-slate-900 shadow-sm shadow-slate-200" : "text-slate-400 hover:text-slate-600"
                    )}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[400px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xl">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{payload[0].payload.name}</p>
                              <p className="text-xl font-black text-slate-900">{payload[0].value}%</p>
                              <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">Academic Health Quotient</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="score" radius={[12, 12, 4, 4]} barSize={50}>
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-10 pt-10 border-t border-slate-50">
                {performanceData.map((dept, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{dept.name}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-900 tabular-nums">{dept.score}%</span>
                      {dept.score > 80 && <ArrowUpRight size={12} className="text-emerald-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. Recent Activity Log (Bottom Section) */}
            <section className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-slate-900/10 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 p-10 opacity-[0.03]">
                <Clock size={160} className="text-white" />
              </div>
              <div className="flex items-center justify-between mb-8 relative">
                <div>
                  <h3 className="text-[14px] font-black text-white uppercase tracking-[0.25em]">Registry Activity Feed</h3>
                  <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-widest">Live Audit Trail — Surgical Transperency Layer</p>
                </div>
                <Link to="/audit/extended" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all">View Extended Logs</Link>
              </div>

              <div className="space-y-1 relative">
                {activityLog.map((log, i) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-6 py-4 px-4 hover:bg-slate-800/50 rounded-2xl transition-all group"
                  >
                    <span className="text-[11px] font-black text-slate-600 font-mono w-16 group-hover:text-amber-500 transition-colors">{log.time}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-emerald-500 transition-colors" />
                    <p className="text-sm font-medium text-slate-300 leading-none group-hover:text-white transition-colors">{log.event}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Action Center: Right 4 Columns */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* 4. Action Center (Right Side Sidebar) */}
            
            {/* Pending Approvals */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 p-20 opacity-[0.02] group-hover:rotate-12 transition-all">
                <FileCheck size={160} />
              </div>
              <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em] mb-8 relative">Pending Approvals</h3>
              <div className="space-y-4 relative">
                {pendingApprovals.map((req) => (
                  <div key={req.id} className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group/card">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                          <User size={14} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-slate-900 leading-none mb-1">{req.teacher}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{req.time}</p>
                        </div>
                      </div>
                      <button className="p-1.5 text-slate-400 hover:text-slate-900">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-slate-600 mb-4 px-1">{req.detail}</p>
                    <div className="flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <button className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                        <ThumbsUp size={12} />
                        Grant
                      </button>
                      <button className="flex-1 py-2 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-rose-200 hover:text-rose-600 transition-all flex items-center justify-center gap-2">
                        <ThumbsDown size={12} />
                        Abort
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 border border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] hover:bg-slate-50 transition-all">Queue Manager (8+)</button>
            </div>

            {/* Support Queue */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm relative group overflow-hidden">
              <div className="absolute -top-10 -right-10 p-20 opacity-[0.02] group-hover:-rotate-6 transition-all">
                <LifeBuoy size={160} />
              </div>
              <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em] mb-8 relative">Network Support Queue</h3>
              <div className="space-y-3 relative">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-amber-100 transition-all group/ticket">
                    <div className="flex gap-4 items-center min-w-0">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                        ticket.status === 'priority' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                      )}>
                        <Radio size={18} className={cn(ticket.status === 'priority' && "animate-pulse")} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-black text-slate-900 truncate tracking-tight">{ticket.issue}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{ticket.user}</p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-300 group-hover/ticket:text-slate-900">
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Notepad */}
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 shadow-inner relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                <Zap size={60} />
              </div>
              <div className="flex items-center gap-3 mb-6 relative">
                <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
                  <StickyNote size={16} />
                </div>
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">Strategic Memo</h3>
              </div>
              <textarea 
                value={notepadContent}
                onChange={(e) => setNotepadContent(e.target.value)}
                className="w-full h-40 bg-transparent text-[13px] font-bold text-slate-600 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed border-none focus:ring-0 p-0"
                placeholder="Commit strategic reminders here..."
              />
              <div className="flex justify-between items-center mt-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Local Storage Persisted</p>
                <button className="p-2 text-slate-400 hover:text-slate-900">
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
            
          </aside>
        </div>
      </div>

      {/* 6. Quick Action Floating Button */}
      <div className="fixed bottom-10 right-10 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {fabOpen && (
            <div className="flex flex-col gap-3 items-end mb-3">
              {[
                { label: 'Register Node', icon: UserPlus, color: 'bg-white text-slate-900', hover: 'hover:bg-slate-100' },
                { label: 'Broadcast Pulse', icon: Radio, color: 'bg-white text-slate-900', hover: 'hover:bg-slate-100' },
                { label: 'Emergency Freeze', icon: Lock, color: 'bg-rose-600 text-white', hover: 'hover:bg-rose-700' },
              ].map((action, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all",
                    action.color,
                    action.hover
                  )}
                  onClick={() => executeAction(action.label)}
                >
                  <span className="text-[11px] font-black uppercase tracking-[0.25em]">{action.label}</span>
                  <action.icon size={18} />
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setFabOpen(!fabOpen)}
          className={cn(
            "w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all shadow-[0_20px_60px_rgba(0,0,0,0.2)] transform active:scale-90",
            fabOpen ? "bg-slate-900 text-white rotate-45" : 
            isFreezeActive ? "bg-rose-600 text-white animate-pulse" : "bg-slate-900 text-white hover:bg-black"
          )}
        >
          {isFreezeActive && !fabOpen ? <Lock size={32} /> : <Plus size={32} />}
        </button>
      </div>

      {/* Quick Action Modals */}
      <AnimatePresence>
        {activeAction === 'register' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveAction(null)} />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10">
                <h3 className="text-2xl font-black italic font-display text-slate-900 mb-2">Register New Node</h3>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-8">Institutional Identity Provisioning</p>
                
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: 'Student Protocol', desc: 'Initialize academic and residential profile', icon: GraduationCap, path: '/identity/students' },
                    { label: 'Faculty Protocol', desc: 'Provision instructional and access rights', icon: UserPlus, path: '/identity/staff' },
                    { label: 'Guardian Protocol', desc: 'Link household and digital delivery', icon: Users, path: '/identity/parents' }
                  ].map((p, i) => (
                    <button 
                      key={i} 
                      onClick={() => {
                        setActiveAction(null);
                        navigate(p.path);
                      }}
                      className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-slate-100 transition-all text-left"
                    >
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm">
                           <p.icon size={24} />
                         </div>
                         <div>
                           <p className="text-sm font-black italic font-display text-slate-900">{p.label}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{p.desc}</p>
                         </div>
                       </div>
                       <ChevronRight className="text-slate-300" />
                    </button>
                  ))}
                </div>
             </motion.div>
          </div>
        )}

        {activeAction === 'broadcast' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveAction(null)} />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden">
                <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-3xl font-black italic font-display">Broadcast Pulse</h3>
                    <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mt-2">Omni-Channel Institutional Message Delivery</p>
                  </div>
                  <X className="cursor-pointer hover:text-rose-500 transition-all" onClick={() => setActiveAction(null)} />
                </div>
                <div className="p-10 space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Broadcast Channels</label>
                    <div className="flex gap-3">
                      {['In-App Push', 'Bulk SMS', 'Academic Email'].map(c => (
                        <button key={c} className="flex-1 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">{c}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Message Payload</label>
                    <textarea 
                      className="w-full h-32 p-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-medium italic resize-none"
                      placeholder="Enter the official communication core..."
                    />
                  </div>
                  <button onClick={() => setActiveAction(null)} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                    <Radio size={18} className="animate-pulse" />
                    Initiate Global Pulse
                  </button>
                </div>
             </motion.div>
          </div>
        )}

        {activeAction === 'freeze' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveAction(null)} />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden text-center p-12">
                <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-rose-200">
                  <Lock size={40} />
                </div>
                <h3 className="text-2xl font-black italic font-display text-slate-900 mb-4">
                  {isFreezeActive ? 'Lift Institutional Freeze?' : 'Initiate Emergency Freeze?'}
                </h3>
                <p className="text-slate-500 text-[13px] font-medium leading-relaxed mb-10">
                  {isFreezeActive 
                    ? 'This will restore write-authority across all faculty nodes and resume normal academic data operations.'
                    : 'This protocol instantly suspends grade entry and data modifications across all departments to preserve integrity during audit.'}
                </p>
                <div className="flex gap-4">
                  <button onClick={() => setActiveAction(null)} className="flex-1 py-4.5 bg-slate-50 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest">Abort</button>
                  <button 
                    onClick={() => {
                      setIsFreezeActive(!isFreezeActive);
                      setActiveAction(null);
                    }}
                    className={cn(
                      "flex-1 py-4.5 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl",
                      isFreezeActive ? "bg-emerald-600 shadow-emerald-200" : "bg-rose-600 shadow-rose-200"
                    )}
                  >
                    {isFreezeActive ? 'Restore System' : 'Execute Freeze'}
                  </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
