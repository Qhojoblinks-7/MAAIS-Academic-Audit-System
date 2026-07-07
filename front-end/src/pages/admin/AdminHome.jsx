import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '../../components/molecules';
import { 
  Users, GraduationCap, TrendingUp, AlertCircle, Clock, Plus, Radio,
  FileCheck, LifeBuoy, StickyNote, Zap, Lock, ArrowUpRight, MoreVertical,
  ThumbsUp, ThumbsDown, ExternalLink, Calendar, User, UserPlus, ChevronRight, X,
  Gauge, Settings2, Flag, Shield, Copy, Send, Loader2, Wifi, WifiOff, RefreshCw,
  KeyRound, Archive, CircleCheck, ChevronDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { useTickets, useUnreadNotifications, useAnalyticsPulse as useAdminAnalyticsPulse, useArchiveStats as useAdminArchiveStats, useAllStudents, useStudentCount, useStudentBoarderStats, useStaffCount, useAllStaff, useApprovals, useResolveApproval, useSystemFreeze, useToggleSystemFreeze, useAllDepartments, useAllSubjects, useAcademicYear, useAcademicYears } from '../../lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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

const fabActions = [
  { label: 'Register Node', icon: 'UserPlus', color: 'bg-white text-slate-900', hover: 'hover:bg-slate-100' },
  { label: 'Broadcast Pulse', icon: 'Radio', color: 'bg-white text-slate-900', hover: 'hover:bg-slate-100' },
  { label: 'Emergency Freeze', icon: 'Lock', color: 'bg-rose-600 text-white', hover: 'hover:bg-rose-700' },
];

const registerNodeProtocols = [
  { label: 'Student Protocol', desc: 'Initialize profile data', icon: 'GraduationCap', path: '/identity/students' },
  { label: 'Faculty Protocol', desc: 'Provision access rights', icon: 'UserPlus', path: '/identity/staff' },
  { label: 'Guardian Protocol', desc: 'Link household nodes', icon: 'Users', path: '/identity/parents' }
];

const broadcastChannels = ['In-App Push', 'Bulk SMS', 'Email'];

const CHART_COLORS = ['#059669', '#0284c7', '#7c3aed', '#db2777', '#ea580c', '#0891b2', '#c026d3', '#eab308', '#16a34a', '#dc2626'];

function getColorForDept(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CHART_COLORS[Math.abs(hash) % CHART_COLORS.length];
}

export function AdminHome() {
  const { user } = useRole();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const ticketsQuery = useTickets();
  const notificationsQuery = useUnreadNotifications();
  const studentsQuery = useAllStudents();
  const studentCountQuery = useStudentCount();
  const staffQuery = useAllStaff();
  const staffCountQuery = useStaffCount();
  const systemFreezeQuery = useSystemFreeze();
  const toggleSystemFreezeMutation = useToggleSystemFreeze();

  const departmentsQuery = useAllDepartments();
  const subjectsQuery = useAllSubjects();
  const activeYearQuery = useAcademicYear();
  const academicYearsQuery = useAcademicYears();

  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [fabOpen, setFabOpen] = React.useState(false);
  const [memoContents, setMemoContents] = React.useState(() => {
    try {
      const saved = localStorage.getItem('admin-strategic-memo');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { operational: '', academics: '', security: '' };
  });
  const [activeMemoTab, setActiveMemoTab] = React.useState('operational');
  const [notepadSaved, setNotepadSaved] = React.useState(true);
  const [activeMetric, setActiveMetric] = React.useState('Avg Score');
  const [activeAction, setActiveAction] = React.useState(null);
  const [freezeReason, setFreezeReason] = React.useState('');
  const [selectedChannel, setSelectedChannel] = React.useState('In-App Push');
  const [broadcastPayload, setBroadcastPayload] = React.useState('');
  const [freezeError, setFreezeError] = React.useState(null);
  const [showConfigModal, setShowConfigModal] = React.useState(false);
  const [configForm, setConfigForm] = React.useState({
    level: 'SHS 3',
    academicYear: '',
    term: ''
  });
  const [selectedTicket, setSelectedTicket] = React.useState(null);
  const [showQueueManager, setShowQueueManager] = React.useState(false);
  const [approvalMeta, setApprovalMeta] = React.useState({});
  const [rebootingNodeId, setRebootingNodeId] = React.useState(null);
  const [resolvingTicketId, setResolvingTicketId] = React.useState(null);
  const [issuingTokenId, setIssuingTokenId] = React.useState(null);
  const [openKebabId, setOpenKebabId] = React.useState(null);
  const [removedTicketIds, setRemovedTicketIds] = React.useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = React.useState(false);

  const activeYear = activeYearQuery.data;
  const academicYears = academicYearsQuery.data || [];
  const fallbackYear = academicYears[0];
  const resolvedYear = activeYear || fallbackYear;
  const activeTerm = resolvedYear?.terms?.find(t => t.isActive) || resolvedYear?.terms?.[0];

  React.useEffect(() => {
    if (!configForm.academicYear && resolvedYear?.label) {
      setConfigForm(prev => ({ ...prev, academicYear: resolvedYear.label }));
    }
    if (!configForm.term && activeTerm?.termNumber) {
      setConfigForm(prev => ({ ...prev, term: formatTermLabel(activeTerm.termNumber) }));
    }
  }, [resolvedYear?.label, activeTerm?.termNumber, configForm.academicYear, configForm.term]);

  const selectedAcademicYearId = React.useMemo(() => {
    if (!configForm.academicYear || !academicYears.length) return resolvedYear?.id || null;
    const match = academicYears.find(y => y.label === configForm.academicYear);
    return match?.id || resolvedYear?.id || null;
  }, [configForm.academicYear, academicYears, resolvedYear]);

  const selectedTermId = React.useMemo(() => {
    if (!configForm.term || !resolvedYear?.terms?.length) return activeTerm?.id || null;
    const formatted = configForm.term.replace('T', 'TERM_');
    const match = resolvedYear.terms.find(t => `T${t.termNumber.replace('TERM_', '')}` === configForm.term);
    return match?.id || activeTerm?.id || null;
  }, [configForm.term, resolvedYear, activeTerm]);

  const selectedLevel = configForm.level;

  const analyticsQuery = useAdminAnalyticsPulse({
    academicYearId: selectedAcademicYearId,
    termId: selectedTermId,
    level: selectedLevel,
  });
  const archiveStatsQuery = useAdminArchiveStats({
    academicYearId: selectedAcademicYearId,
    termId: selectedTermId,
    level: selectedLevel,
  });

  const isFreezeActive = systemFreezeQuery.data?.systemFrozen ?? false;

  const formatYearLabel = (label) => {
    if (!label) return '';
    const parts = label.split('/');
    if (parts.length === 2) {
      return `${parts[0]}/${parts[1].slice(-2)}`;
    }
    return label;
  };

  const formatTermLabel = (termNumber) => {
    if (!termNumber) return '';
    return termNumber.replace('TERM_', 'T');
  };

  const activeYearLabel = formatYearLabel(resolvedYear?.label);
  const activeTermLabel = formatTermLabel(activeTerm?.termNumber);

  const departments = departmentsQuery.data || [];
  const subjects = subjectsQuery.data || [];

  const tickets = ticketsQuery.data || [];
  const notifications = notificationsQuery.data || [];
  const analytics = analyticsQuery.data;
  const students = studentsQuery.data || [];
  const staff = staffQuery.data || [];
  const ticketsLoading = ticketsQuery.isLoading;
  const approvalsQuery = useApprovals({ status: 'pending' });
  const resolveApprovalMutation = useResolveApproval();
  const approvals = (approvalsQuery.data || []).map(approval => ({
    ...approval,
    teacher: approval.teacherName || 'Unknown Teacher',
    time: approval.createdAt ? new Date(approval.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '—',
    detail: approval.detail || 'No details provided'
  }));

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const [activities, setActivities] = React.useState([]);
  const [liveStudentCount, setLiveStudentCount] = React.useState(0);
  const [liveStaffCount, setLiveStaffCount] = React.useState(0);

  const totalStudents = liveStudentCount;
  const staffCount = liveStaffCount;

  const boarderStatsQuery = useStudentBoarderStats();
  const boarderCount = typeof boarderStatsQuery.data?.boarders === 'number' ? boarderStatsQuery.data.boarders : 0;
  const dayCount = typeof boarderStatsQuery.data?.dayStudents === 'number' ? boarderStatsQuery.data.dayStudents : 0;

  const avgScore = analytics?.subjectPerformance?.length
    ? analytics.subjectPerformance.reduce((sum, s) => sum + parseFloat(s.averageScore), 0) / analytics.subjectPerformance.length
    : null;
  const gradingProgress = avgScore ? `${Math.round(avgScore)}%` : '—';
  const gradingProgressBar = avgScore ? Math.round(avgScore) : 0;

  React.useEffect(() => {
    console.log('[AdminHome KPI Values]', {
      totalStudents,
      staffCount,
      boarderCount,
      dayCount,
      unreadCount,
      avgScore,
      gradingProgress,
    });
  }, [totalStudents, staffCount, boarderCount, dayCount, unreadCount, avgScore, gradingProgress]);

  React.useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const base = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    let cancelled = false;
    (async () => {
      try {
        const [studentsRes, staffRes, boardersRes] = await Promise.all([
          fetch(`${base}/users/students/count`, { headers }),
          fetch(`${base}/users/staff/count`, { headers }),
          fetch(`${base}/users/students/boarder-stats`, { headers }),
        ]);

        const studentsText = await studentsRes.text();
        const staffText = await staffRes.text();
        const boardersText = await boardersRes.text();

        if (!cancelled) {
          if (studentsRes.ok) {
            const parsed = parseInt(studentsText, 10);
            if (!isNaN(parsed)) setLiveStudentCount(parsed);
          }
          if (staffRes.ok) {
            const parsed = parseInt(staffText, 10);
            if (!isNaN(parsed)) setLiveStaffCount(parsed);
          }
        }
      } catch (e) {
        console.error('[AdminHome KPI fetch error]', e);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedAcademicYearId, selectedTermId, selectedLevel]);

  React.useEffect(() => {
    console.log('[AdminHome] config changed ->', {
      selectedAcademicYearId,
      selectedTermId,
      selectedLevel,
      analyticsQuery: analyticsQuery.data,
      archiveStatsQuery: archiveStatsQuery.data,
    });
  }, [selectedAcademicYearId, selectedTermId, selectedLevel]);

  React.useEffect(() => {
    if (analytics?.recentActivity) {
      setActivities(analytics.recentActivity);
    }
  }, [analytics?.recentActivity]);

  const vitalSigns = [
    { label: 'Student Census', value: totalStudents, trend: '#10b981', bg: 'bg-success/10', color: 'text-success', subtext: `${boarderCount.toLocaleString()} Boarders / ${dayCount.toLocaleString()} Day Students` },
    { label: 'Faculty Engagement', value: staffCount, trend: '#3b82f6', bg: 'bg-brand-primary/5', color: 'text-brand-primary', subtext: '8 Teachers currently offline' },
    { label: 'Grading Progress', value: gradingProgress, trend: '#f59e0b', progress: gradingProgressBar, bg: 'bg-warning/10', color: 'text-warning', subtext: avgScore ? 'Institutional grade average' : 'Awaiting data...' },
    { label: 'Flagged Activities', value: unreadCount || '0', trend: '#ef4444', progress: unreadCount ? Math.min((unreadCount / 10) * 100, 100) : 0, bg: 'bg-destructive/10', color: 'text-destructivent', subtext: 'Integrity issues detected' },
  ];

  const chartDatasets = React.useMemo(() => {
    if (!analytics?.subjectPerformance?.length || !subjects?.length) {
      return {};
    }

    const subjectsMap = new Map(subjects.map(s => [s.id, s]));
    const departmentsMap = new Map(departments.map(d => [d.id, d]));

    const deptData = {};
    analytics.subjectPerformance.forEach(sp => {
      const score = parseFloat(sp.averageScore);
      if (isNaN(score)) return;

      const subject = subjectsMap.get(sp.subjectId);
      if (!subject?.departmentId) return;

      const deptId = subject.departmentId;
      if (!deptData[deptId]) {
        deptData[deptId] = { sum: 0, count: 0, studentCountSum: 0, name: null };
      }
      deptData[deptId].sum += score;
      deptData[deptId].count += 1;
      deptData[deptId].studentCountSum += sp.studentCount;
      const dept = subject.department || departmentsMap.get(deptId);
      if (!deptData[deptId].name && dept) {
        deptData[deptId].name = dept.name || dept.code || deptId;
      }
    });

    const avgScoreTab = [];
    const completionTab = [];

    Object.entries(deptData).forEach(([deptId, data]) => {
      const dept = departmentsMap.get(deptId);
      const name = dept?.name || data.name || deptId;

      const avgScore = data.count > 0 ? Math.round(data.sum / data.count) : 0;
      avgScoreTab.push({
        name,
        value: avgScore,
        color: getColorForDept(name),
      });

      const completion = totalStudents > 0
        ? Math.min(100, Math.round((data.studentCountSum / (totalStudents * data.count)) * 100))
        : 0;
      completionTab.push({
        name,
        value: completion,
        color: getColorForDept(name),
      });
    });

    return {
      'Avg Score': avgScoreTab,
      'Completion': completionTab,
    };
  }, [analytics, subjects, departments, totalStudents]);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem('admin-strategic-memo', JSON.stringify(memoContents));
      setNotepadSaved(true);
    } catch {
      setNotepadSaved(false);
    }
  }, [memoContents]);

  // FAB Trigger Pipeline
  const executeAction = (action) => {
    if (action === 'Emergency Freeze') setActiveAction('freeze');
    else if (action === 'Register Node') setActiveAction('register');
    else if (action === 'Broadcast Pulse') setActiveAction('broadcast');
    setFabOpen(false);
  };

  const pushLog = (event, type = 'system') => {
    const newLog = {
      id: String(Date.now()),
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      event,
      type,
    };
    setActivities(prev => [newLog, ...prev]);
  };

  const handleResolveApproval = (id, status, teacher) => {
    const apiStatus = status === 'grant' ? 'approved' : 'rejected';
    resolveApprovalMutation.mutate({ id, dto: { status: apiStatus } });
    const label = status === 'grant' ? 'APPROVED' : 'REJECTED & ABORTED';
    pushLog(`Approval request by ${teacher} was ${label} by Admin.`, status === 'grant' ? 'system' : 'security');
    toast.success(`Approval ${label.toLowerCase()} successfully`);
  };

  const handleKebabAction = (id, action, teacher) => {
    setOpenKebabId(null);
    const meta = approvalMeta[id] || {};
    switch (action) {
      case 'escalate':
        setApprovalMeta(prev => ({ ...prev, [id]: { ...prev[id], escalated: true } }));
        pushLog(`ESCALATE OVERRIDE: Approval request by ${teacher} elevated to top-tier authorization.`, 'security');
        toast.success('Authorization tier escalated');
        break;
      case 'priority':
        setApprovalMeta(prev => ({ ...prev, [id]: { ...prev[id], highPriority: !(prev[id]?.highPriority) } }));
        pushLog(`Priority flag ${!(meta.highPriority) ? 'PINNED' : 'CLEARED'} for ${teacher}'s approval request.`, 'system');
        toast.info(!(meta.highPriority) ? 'High priority pinned' : 'Priority flag cleared');
        break;
      case 'defer':
        setApprovalMeta(prev => ({ ...prev, [id]: { ...prev[id], deferred: !(prev[id]?.deferred) } }));
        pushLog(`DEFER: Approval request by ${teacher} postponed.`, 'system');
        toast.info('Request deferred');
        break;
      case 'reject':
        resolveApprovalMutation.mutate({ id, dto: { status: 'rejected' } });
        pushLog(`TERMINAL REJECT: Approval entry by ${teacher} rejected and logged to registry.`, 'security');
        toast.success('Entry rejected and logged');
        break;
      default:
        break;
    }
  };

  const handleBulkAction = async (action) => {
    setBulkActionLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (action === 'grant') {
      toast.success('All pending approvals granted');
      pushLog('BULK ACTION: All pending approvals granted by Admin.', 'system');
    } else if (action === 'clear') {
      toast.success('Approval queue cleared');
      pushLog('BULK ACTION: Approval queue cleared by Admin.', 'security');
    }
    setBulkActionLoading(false);
    setShowQueueManager(false);
  };

  const openNodeDiagnosis = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleRebootNode = async (ticketId) => {
    setRebootingNodeId(ticketId);
    await new Promise(r => setTimeout(r, 2000));
    pushLog(`Node Reboot: Ticket #${ticketId} node reboot sequence completed successfully.`, 'system');
    toast.success('Node reboot complete');
    setRebootingNodeId(null);
    setSelectedTicket(null);
  };

  const handleIssueToken = async (ticketId) => {
    setIssuingTokenId(ticketId);
    await new Promise(r => setTimeout(r, 800));
    const token = `MAAIS-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    navigator.clipboard.writeText(token).then(() => {
      toast.success(`Temp token copied: ${token}`);
    }).catch(() => {
      toast.success(`Temp token generated: ${token}`);
    });
    pushLog(`Temp Token Issued: Ticket #${ticketId} received category-specific passcode.`, 'security');
    setIssuingTokenId(null);
  };

  const handleMarkResolved = async (ticketId) => {
    setResolvingTicketId(ticketId);
    await new Promise(r => setTimeout(r, 600));
    pushLog(`Ticket #${ticketId} marked RESOLVED. Synchronization event appended to audit feed.`, 'system');
    toast.success('Ticket marked resolved');
    setRemovedTicketIds(prev => new Set(prev).add(ticketId));
    setResolvingTicketId(null);
    setSelectedTicket(null);
    qc.invalidateQueries({ queryKey: ['admin', 'comms', 'tickets'] });
  };

  const handleDispatchMemo = () => {
    const content = memoContents[activeMemoTab] || '';
    if (!content.trim()) {
      toast.error('Memo is empty');
      return;
    }
    const tabLabel = activeMemoTab.charAt(0).toUpperCase() + activeMemoTab.slice(1);
    pushLog(`Memo Dispatched: ${tabLabel} memo broadcast to faculty endpoints.`, 'comm');
    toast.success(`${tabLabel} memo dispatched`);
  };

  const handleCopyMemo = () => {
    const content = memoContents[activeMemoTab] || '';
    navigator.clipboard.writeText(content).then(() => {
      toast.success('Memo copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy memo');
    });
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
    qc.invalidateQueries({ queryKey: ['admin', 'comms', 'tickets'] });
  };

  const formatTime = (date) => date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  const handleConfigSave = () => {
    setShowConfigModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background relative p-5 scrollbar-hide">
      <div className="max-w-6xl mx-auto pb-12 space-y-5">
        
        {/* Header - Transparent Architecture */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 px-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
            <Radio size={100} />
          </div>
          
            <div className="relative">
              <h1 className="text-xl font-black text-text-primary tracking-tight italic font-display">
                Good morning, {user?.name || 'Admin'}
              </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{formatDate(currentTime)}</p>
              <div className="w-1 h-1 rounded-full bg-border" />
              <p className="text-[10px] font-black text-text-primary font-mono tracking-tight tabular-nums">{formatTime(currentTime)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-success/10 text-success rounded-full border border-success/20">
              <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isFreezeActive ? "bg-destructive" : "bg-success")} />
              <span className={cn("text-[9px] font-black uppercase tracking-wider", isFreezeActive ? "text-destructive" : "text-success")}>
                {isFreezeActive ? 'Locked' : 'Live'}
              </span>
            </div>
            <button 
              onClick={() => {
                if (activeYear?.label) {
                  setConfigForm(prev => ({ ...prev, academicYear: activeYear.label }));
                }
                if (activeTerm?.termNumber) {
                  setConfigForm(prev => ({ ...prev, term: formatTermLabel(activeTerm.termNumber) }));
                }
                setShowConfigModal(true);
              }}
              className="px-3 py-1.5 bg-brand-dark text-white rounded-xl flex items-center gap-2 shadow-md hover:bg-brand-dark transition-all cursor-pointer"
            >
              <Calendar size={12} className="text-text-secondary" />
              <span className="text-[9px] font-black tracking-wider uppercase">{activeYearLabel || 'No Year'} Academic • {activeTermLabel || '—'}</span>
              <div className="px-1.5 py-0.5 bg-brand-dark rounded text-[8px] font-black tracking-normal">{configForm.level}</div>
              <Settings2 size={10} className="text-text-secondary ml-1" />
            </button>
          </div>
        </header>

         {/* Main Workspace Grid Splits */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
           <div className="lg:col-span-8 flex flex-col gap-5">
              
              {/* Vital Signs Cards */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {vitalSigns.map((card, i) => {
                  const iconMap = { Users, GraduationCap, TrendingUp, AlertCircle };
                  const displayValue = card.label === 'Flagged Activities' && isFreezeActive ? 'SYSTEM FROZEN' : card.value;
                  const CardIcon = isFreezeActive ? Lock : (iconMap[card.icon] || Users);
                  
                   return (
                     <motion.div 
                       key={i}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: i * 0.05 }}
                       className="bg-surface p-4 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all relative group"
                     >
                       <div className="flex items-center gap-4">
                         <div className="flex items-center gap-3">
                           <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105", isFreezeActive ? "bg-destructive/10 text-destructive" : card.bg, isFreezeActive ? "text-destructive" : card.color)}>
                             <CardIcon size={22} />
                           </div>
                           <div>
                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">{card.label}</p>
                            {card.progress !== undefined ? (
                              <div className="space-y-1">
                                <div className="h-1.5 w-32 bg-border rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${card.progress}%` }}
                                    className={cn("h-full rounded-full", card.progress < 40 ? "bg-destructive" : card.progress < 75 ? "bg-warning" : "bg-success")}
                                  />
                                </div>
                                <p className="text-[9px] font-semibold text-text-secondary">
                                  <span>{card.progress.toFixed(1)}% Complete</span>
                                </p>
                              </div>
                            ) : (
                              <p className="text-[11px] font-medium text-text-secondary leading-tight">{card.subtext}</p>
                            )}
                           </div>
                         </div>
                          <p className={cn("tracking-tighter leading-none ml-auto", card.label === 'Flagged Activities' && isFreezeActive ? "text-xl font-black uppercase" : "text-5xl font-bold")}>{displayValue}</p>
                       </div>
                    </motion.div>
                  );
               })}
             </div>

             {/* Performance Heatmap */}
             <section className="bg-surface p-5 rounded-2xl border border-border shadow-sm relative overflow-hidden shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[11px] font-black text-text-primary uppercase tracking-wider">Departmental Performance Heatmap</h3>
                  <p className="text-[9px] font-semibold text-text-secondary uppercase tracking-widest mt-0.5">Academic Health Quotient</p>
                </div>
<div className="flex bg-background p-0.5 rounded-lg border border-border">
                   {Object.keys(chartDatasets).map((t) => (
                     <button 
                       key={t} 
                       onClick={() => setActiveMetric(t)}
                       className={cn(
                         "px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-wider transition-all",
                         t === activeMetric ? "bg-surface text-text-primary shadow-xs" : "text-text-secondary hover:text-text-secondary"
                       )}
                     >
                       {t}
                     </button>
                   ))}
                 </div>
              </div>

              <div className="h-[180px] w-full text-xs">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={chartDatasets[activeMetric] || []} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} dy={5} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-surface p-2 rounded-lg border border-border shadow-lg text-[10px]">
                              <p className="font-black text-text-secondary uppercase tracking-wider mb-0.5">{payload[0].payload.name}</p>
                              <p className="font-black text-text-primary text-sm">
                                {payload[0].value}{activeMetric === 'Avg Score' ? '%' : '% Progress'}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 2, 2]} barSize={34}>
                      {(chartDatasets[activeMetric] || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-5 gap-2 mt-4 pt-3 border-t border-border">
                {(chartDatasets[activeMetric] || []).map((dept, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-[8px] font-black text-text-secondary uppercase tracking-wider truncate">{dept.name}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-text-primary font-mono">{dept.value}%</span>
                      {dept.value > 80 && <ArrowUpRight size={10} className="text-success shrink-0" />}
                    </div>
                  </div>
                ))}
              </div>
            </section>

             {/* Registry Activity Feed */}
             <section className="bg-brand-dark rounded-2xl p-5 shadow-md relative overflow-hidden flex flex-col">
               <div className="flex items-center justify-between mb-4">
                 <div>
                   <h3 className="text-[11px] font-black text-white uppercase tracking-wider">Registry Activity Feed</h3>
                   <p className="text-[9px] font-semibold text-text-secondary uppercase tracking-widest mt-0.5">Live Audit Trail</p>
                 </div>
                 <Link to="/audit/extended" className="text-[8px] font-black text-text-secondary uppercase tracking-wider hover:text-white transition-all">View Extended</Link>
               </div>

                <div className="overflow-y-auto scrollbar-hide custom-scrollbar space-y-0.5 text-xs max-h-64">
                <AnimatePresence initial={false}>
                  {activities.map((log) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 py-2 px-2 hover:bg-brand-dark/40 rounded-xl transition-all group"
                    >
                      <span className="text-[9px] font-bold text-text-secondary font-mono w-14 shrink-0">{log.time}</span>
                      <div className={cn(
                        "w-1 h-1 rounded-full shrink-0", 
                        log.type === 'comm' ? 'bg-brand-secondary' : log.type === 'security' ? 'bg-destructive' : 'bg-brand-dark group-hover:bg-success'
                      )} />
                      <p className="text-xs font-medium text-text-secondary truncate group-hover:text-white">{log.event}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>

           {/* Action Hub Sidebar */}
           <aside className="lg:col-span-4 flex flex-col gap-5">
             
             {/* Pending Approvals */}
             <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm relative group flex flex-col">
               <h3 className="text-[11px] font-black text-text-primary uppercase tracking-wider mb-4 shrink-0">Pending Approvals</h3>
               <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide custom-scrollbar">
                <AnimatePresence initial={false}>
                  {approvals.length === 0 ? (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[10px] py-6 font-bold text-text-secondary uppercase tracking-wider">
                      No Approvals in Queue
                    </motion.p>
                  ) : (
                    approvals.map((req) => {
                      const meta = approvalMeta[req.id] || {};
                      return (
                      <motion.div 
                        key={req.id} 
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        className="p-3 bg-background/60 rounded-xl border border-border hover:border-brand-primary/20 transition-all group/card"
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 bg-surface rounded-lg flex items-center justify-center border border-border shrink-0">
                              <User size={12} className="text-text-secondary" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-black text-text-primary truncate leading-none mb-0.5">{req.teacher}</p>
                                {meta.highPriority && <span className="px-1 py-0.5 bg-destructive text-white text-[8px] font-black uppercase rounded">High Priority</span>}
                                {meta.escalated && <Flag size={10} className="text-destructive" />}
                                {meta.deferred && <span className="px-1 py-0.5 bg-warning/10 text-warning text-[8px] font-black uppercase rounded">Deferred</span>}
                              </div>
                              <p className="text-[8px] font-black text-text-secondary uppercase tracking-wider">{req.time}</p>
                            </div>
                          </div>
                          <div className="relative">
                            <button 
                              onClick={() => setOpenKebabId(openKebabId === req.id ? null : req.id)}
                              className="p-1 text-text-secondary hover:text-text-primary shrink-0"
                            >
                              <MoreVertical size={14} />
                            </button>
                            {openKebabId === req.id && (
                              <div className="absolute right-0 top-6 w-48 bg-surface border border-border rounded-xl shadow-xl z-50 py-1">
                                <button onClick={() => handleKebabAction(req.id, 'escalate', req.teacher)} className="w-full text-left px-3 py-2 text-[10px] font-bold text-text-primary hover:bg-background flex items-center gap-2"><Shield size={12} className="text-destructive" /> Escalate Override</button>
                                <button onClick={() => handleKebabAction(req.id, 'priority', req.teacher)} className="w-full text-left px-3 py-2 text-[10px] font-bold text-text-primary hover:bg-background flex items-center gap-2"><Flag size={12} className={cn("text-destructive", meta.highPriority && "fill-destructive")} /> {meta.highPriority ? 'Clear Priority' : 'Toggle High Priority'}</button>
                                <button onClick={() => handleKebabAction(req.id, 'defer', req.teacher)} className="w-full text-left px-3 py-2 text-[10px] font-bold text-text-primary hover:bg-background flex items-center gap-2"><Clock size={12} className="text-warning" /> Defer Request</button>
                                <button onClick={() => handleKebabAction(req.id, 'reject', req.teacher)} className="w-full text-left px-3 py-2 text-[10px] font-bold text-destructive hover:bg-destructive/10 flex items-center gap-2"><X size={12} /> Reject & Log</button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] font-bold text-text-secondary mb-2.5 truncate px-0.5">{req.detail}</p>
                        <div className="flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleResolveApproval(req.id, 'grant', req.teacher)}
                            className="flex-1 py-1.5 bg-success text-white rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-success/90 transition-all flex items-center justify-center gap-1"
                          >
                            <ThumbsUp size={10} /> Grant
                          </button>
                          <button 
                            onClick={() => handleResolveApproval(req.id, 'abort', req.teacher)}
                            className="flex-1 py-1.5 bg-surface border border-border text-text-secondary rounded-lg text-[8px] font-black uppercase tracking-wider hover:text-destructive hover:border-destructive/30 transition-all flex items-center justify-center gap-1"
                          >
                            <ThumbsDown size={10} /> Abort
                          </button>
                        </div>
                      </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
              <button 
                onClick={() => setShowQueueManager(true)}
                className="w-full mt-4 py-2 border border-dashed border-border rounded-xl text-[8px] font-black text-text-secondary uppercase tracking-wider hover:bg-background transition-all"
              >
                Queue Manager (8+)
              </button>
            </div>

             {/* Network Support Queue */}
             <div className="bg-surface rounded-2xl p-5 border border-border shadow-sm relative group shrink-0">
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-[11px] font-black text-text-primary uppercase tracking-wider mb-0">Network Support Queue</h3>
                <button 
                  onClick={() => navigate('/support/new')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-dark text-white rounded-lg text-[8px] font-black uppercase tracking-wider hover:bg-brand-dark transition-all"
                >
                  <Plus size={14} /> New Ticket
                </button>
              </div>
               <div className="space-y-2">
                {tickets.filter(t => !removedTicketIds.has(t.id)).slice(0, 5).map((ticket) => {
                  const isPriority = ticket.status === 'priority';
                  const isActive = ticket.status === 'active';
                  const statusLabel = isPriority ? 'Priority' : isActive ? 'Active' : (ticket.status || 'Open');
                  const statusStyles = isPriority
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : isActive
                    ? "bg-brand-primary/5 text-brand-primary border-brand-primary/20"
                    : "bg-warning/10 text-warning border-warning/20";
                  const iconBg = isPriority ? "bg-destructive/10 text-destructive" : isActive ? "bg-brand-primary/10 text-brand-primary" : "bg-warning/10 text-warning";
                  const iconClass = isPriority || isActive ? cn("animate-pulse") : "";
                  const ticketTitle = ticket.subject || ticket.title || ticket.issue || 'Support Ticket';
                  const ticketUser = ticket.createdBy?.name || ticket.user || 'User';
                  const isRebooting = rebootingNodeId === ticket.id;
                  const isResolving = resolvingTicketId === ticket.id;
                  const isIssuing = issuingTokenId === ticket.id;
                  return (
                    <div 
                      key={ticket.id} 
                      onClick={() => openNodeDiagnosis(ticket)}
                      className="flex items-center justify-between p-2.5 bg-background/60 rounded-xl border border-border hover:border-warning/20 transition-all group/ticket cursor-pointer"
                    >
                      <div className="flex gap-3 items-center min-w-0">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs", iconBg)}>
                          <AlertCircle size={14} className={iconClass} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-text-primary truncate tracking-tight">{ticketTitle}</p>
                          <p className="text-[9px] font-semibold text-text-secondary uppercase tracking-wider truncate">{ticketUser}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(isRebooting || isResolving || isIssuing) && <Loader2 size={12} className="animate-spin text-text-secondary" />}
                        <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border", statusStyles)}>{statusLabel}</span>
                      </div>
                    </div>
                  );
                })}
                {tickets.filter(t => !removedTicketIds.has(t.id)).length === 0 && (
                  <EmptyState context="tickets" variant="compact" />
                )}
              </div>
            </div>

             {/* Strategic Notepad Memo */}
 <div className="bg-background p-5 rounded-2xl border border-border shadow-inner relative overflow-hidden flex flex-col">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 bg-warning/10 text-warning rounded-md flex items-center justify-center shrink-0">
        <StickyNote size={12} />
      </div>
      <h3 className="text-[10px] font-black text-text-primary uppercase tracking-wider">Strategic Memo</h3>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline" className="p-1 h-7 w-7" title="Copy Memo" onClick={handleCopyMemo}>
        <Copy size={12} />
      </Button>
      <Button className="h-7 px-2 text-[8px] font-black uppercase tracking-wider bg-brand-dark text-white hover:bg-brand-dark" onClick={handleDispatchMemo}>
        <Send size={10} className="mr-1" /> Dispatch
      </Button>
    </div>
  </div>
  <div className="flex gap-1 mb-2">
    {['operational', 'academics', 'security'].map(tab => (
      <button
        key={tab}
        onClick={() => setActiveMemoTab(tab)}
        className={cn(
          "flex-1 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all",
          activeMemoTab === tab ? "bg-surface text-text-primary shadow-xs border border-border" : "text-text-secondary hover:text-text-secondary"
        )}
      >
        {tab === 'operational' ? 'Operational' : tab === 'academics' ? 'Academics' : 'Security'}
      </button>
    ))}
  </div>
    <Textarea
      value={memoContents[activeMemoTab] || ''}
      onChange={(e) => setMemoContents(prev => ({ ...prev, [activeMemoTab]: e.target.value }))}
      className="h-24 resize-none placeholder:text-text-secondary"
      placeholder={`Commit ${activeMemoTab} reminders here...`}
    />
  <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/40">
    <p className={cn("text-[8px] font-black uppercase tracking-wider italic", notepadSaved ? "text-success" : "text-text-secondary")}>{notepadSaved ? 'Saved' : 'Saving...'}</p>
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
             fabOpen ? "bg-brand-dark text-white rotate-45" : 
             isFreezeActive ? "bg-destructive text-white animate-pulse" : "bg-brand-dark text-white"
           )}
         >
           {isFreezeActive && !fabOpen ? <Lock size={20} /> : <Plus size={20} />}
         </Button>
      </div>

      {/* Quick Action Modals */}
      <AnimatePresence>
{activeAction === 'register' && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-xs" onClick={() => setActiveAction(null)} />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-surface rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-black italic font-display text-text-primary">Register New Node</h3>
                <p className="text-[8px] font-black uppercase text-text-secondary tracking-wider mb-5">Identity Provisioning Protocol</p>
                
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
                            <div className="w-8 h-8 bg-surface rounded-lg flex items-center justify-center text-text-primary shadow-xs shrink-0">
                              <Icon size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black italic font-display text-text-primary leading-tight">{p.label}</p>
                              <p className="text-[9px] font-semibold text-text-secondary uppercase tracking-tight truncate">{p.desc}</p>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-text-secondary shrink-0" />
                       </Button>
                     );
                   })}
                 </div>
              </motion.div>
           </div>
         )}

         {activeAction === 'broadcast' && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-xs" onClick={() => setActiveAction(null)} />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-surface rounded-2xl shadow-xl overflow-hidden">
                <div className="p-5 bg-brand-dark text-white flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black italic font-display">Broadcast Pulse</h3>
                    <p className="text-[8px] font-black uppercase text-white/50 tracking-wider mt-0.5">Omni-Channel Channels</p>
                  </div>
                  <X size={18} className="cursor-pointer hover:text-destructive transition-all" onClick={() => setActiveAction(null)} />
                </div>
                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase text-text-secondary tracking-wider ml-1">Channels</label>
                     <div className="flex gap-2">
                       {broadcastChannels.map(c => (
                         <Button
                           key={c}
                           onClick={() => setSelectedChannel(c)}
                           variant="outline"
                           className={cn(
                             "flex-1 py-2",
                             c === selectedChannel ? "bg-brand-dark text-white" : "text-text-secondary"
                           )}
                         >
                           {c}
                         </Button>
                       ))}
                     </div>
                  </div>
                   <div className="space-y-2">
                     <label className="text-[8px] font-black uppercase text-text-secondary tracking-wider ml-1">Payload Message Core</label>
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
                       broadcastPayload.trim() ? "bg-brand-dark text-white" : "bg-border text-text-secondary"
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
             <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm" onClick={() => setActiveAction(null)} />
             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-surface rounded-2xl shadow-2xl text-center p-6 border-2 border-destructive/20">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm bg-destructive/10 text-destructive">
                  <Lock size={28} />
                </div>
                <h3 className="text-xl font-black italic font-display text-text-primary mb-2">
                  {isFreezeActive ? 'System Emergency Freeze Active' : 'Initiate Emergency Freeze?'}
                </h3>
                <p className="text-text-secondary text-[11px] font-medium leading-normal mb-2">
                  {isFreezeActive 
                    ? 'Immediate administrative intervention activated. All write operations are suspended.'
                    : 'Instantly locks write authority cross-institutionally to safeguard live evaluation logs.'}
                </p>
                {systemFreezeQuery.data?.systemFreezeReason && (
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-wider mb-4 bg-destructive/10 px-3 py-2 rounded-lg">
                    Reason: {systemFreezeQuery.data.systemFreezeReason}
                  </p>
                )}
                {!isFreezeActive && (
                  <div className="mb-4">
                    <input
                      type="text"
                      value={freezeReason}
                      onChange={(e) => setFreezeReason(e.target.value)}
                      placeholder="Reason for emergency freeze..."
                      className="w-full px-3 py-2.5 border border-border rounded-xl text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-destructive/50"
                    />
                  </div>
                 )}
                 {freezeError && (
                   <p className="text-[10px] font-bold text-destructive bg-destructive/10 border border-destructive/30 px-3 py-2 rounded-lg mb-3">
                     {freezeError}
                   </p>
                 )}
                  <div className="flex gap-2.5">
                   <Button variant="outline" className="flex-1 py-2.5" onClick={() => { setActiveAction(null); setFreezeReason(''); }}>
                     {isFreezeActive ? 'Dismiss' : 'Abort'}
                   </Button>
                     <Button 
                       disabled={toggleSystemFreezeMutation.isPending}
                        onClick={() => { 
                          setFreezeError(null);
                          toggleSystemFreezeMutation.mutate(
                          { enabled: !isFreezeActive, reason: freezeReason },
                          {
                            onSuccess: () => {
                              const freezeLog = {
                                id: String(Date.now()),
                                time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                                event: `CRITICAL STATUS ALTERED: Grade entry ${!isFreezeActive ? 'SUSPENDED/FROZEN' : 'RESTORED/UNFROZEN'}.`,
                                type: 'security'
                              };
                              setActivities(prev => [freezeLog, ...prev]);
                              setActiveAction(null);
                              setFreezeReason('');
                            },
                            onError: (err) => {
                              setFreezeError(err?.message || 'Failed to toggle system freeze');
                            }
                          }
                        );
                      }}
                     className={cn(
                       "flex-1 py-2.5",
                       isFreezeActive ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"
                     )}
                   >
                      {toggleSystemFreezeMutation.isPending ? 'Processing...' : (isFreezeActive ? 'Lift Institutional Freeze' : 'Lock System')}
                   </Button>
                 </div>
             </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Configure Academic Node Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-xs" onClick={() => setShowConfigModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-surface rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-black italic font-display text-text-primary">Configure Academic Node</h3>
                  <p className="text-[8px] font-black uppercase text-text-secondary tracking-wider mt-0.5">System-Wide Contextual Tracking</p>
                </div>
                <button onClick={() => setShowConfigModal(false)} className="p-1.5 text-text-secondary hover:text-text-primary transition-colors">
                  <X size={16} />
                </button>
              </div>

               <div className="space-y-4">
                 <div>
                   <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Student Level</label>
                   <select
                     value={configForm.level}
                     onChange={(e) => setConfigForm({ ...configForm, level: e.target.value })}
                     className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-brand-primary/10"
                   >
                      <option>SHS 1</option>
                      <option>SHS 2</option>
                      <option>SHS 3</option>
                    </select>
                 </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Academic Year</label>
                    <select
                      value={configForm.academicYear}
                      onChange={(e) => setConfigForm({ ...configForm, academicYear: e.target.value })}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-brand-primary/10"
                    >
                      {(academicYears.length > 0)
                        ? academicYears.map(y => (
                            <option key={y.id} value={y.label}>{formatYearLabel(y.label)}</option>
                          ))
                        : (
                          <>
                            <option>2024/2025</option>
                            <option>2025/2026</option>
                            <option>2026/2027</option>
                          </>
                        )
                      }
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Academic Term</label>
                    <select
                      value={configForm.term}
                      onChange={(e) => setConfigForm({ ...configForm, term: e.target.value })}
                      className="w-full px-3 py-2.5 bg-surface border border-border rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-brand-primary/10"
                    >
                      {(activeYear?.terms && activeYear.terms.length > 0)
                        ? activeYear.terms.map(t => (
                            <option key={t.id} value={formatTermLabel(t.termNumber)}>{formatTermLabel(t.termNumber)}</option>
                          ))
                        : (
                          <>
                            <option value="T1">T1</option>
                            <option value="T2">T2</option>
                            <option value="T3">T3</option>
                          </>
                        )
                      }
                    </select>
                  </div>

                <div className="pt-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <span className="text-[9px] font-black text-success uppercase tracking-wider">System Live</span>
                </div>

                <button
                  onClick={handleConfigSave}
                  className="w-full py-3 bg-brand-dark text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-black transition-all shadow-lg"
                >
                  Save Configuration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Queue Manager Modal */}
      <AnimatePresence>
        {showQueueManager && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md" onClick={() => setShowQueueManager(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-border flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black italic font-display text-text-primary">Queue Manager</h3>
                  <p className="text-[8px] font-black uppercase text-text-secondary tracking-wider mt-0.5">Bulk Authorization Protocol</p>
                </div>
                <button onClick={() => setShowQueueManager(false)} className="p-1.5 text-text-secondary hover:text-text-primary transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="p-3 bg-background/60 rounded-xl border border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-text-primary">Seed Approval #{i + 1}</p>
                      <p className="text-[10px] font-bold text-text-secondary">Index #{1000 + i} • Grade Change Request</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { toast.success(`Approval #${i + 1} granted`); pushLog(`Approval #${i + 1} granted by Admin.`, 'system'); }} className="px-3 py-1.5 bg-success text-white rounded-lg text-[9px] font-black uppercase">Grant</button>
                      <button onClick={() => { toast.success(`Approval #${i + 1} aborted`); pushLog(`Approval #${i + 1} aborted by Admin.`, 'security'); }} className="px-3 py-1.5 bg-surface border border-border text-text-secondary rounded-lg text-[9px] font-black uppercase hover:text-destructive hover:border-destructive/30">Abort</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-border flex gap-3">
                <button onClick={() => handleBulkAction('grant')} disabled={bulkActionLoading} className="flex-1 py-3 bg-success text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-success/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {bulkActionLoading && <Loader2 size={14} className="animate-spin" />}
                  Grant All
                </button>
                <button onClick={() => handleBulkAction('clear')} disabled={bulkActionLoading} className="flex-1 py-3 bg-destructive text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-destructive/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {bulkActionLoading && <Loader2 size={14} className="animate-spin" />}
                  Clear Queue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Node Diagnosis Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md" onClick={() => setSelectedTicket(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-surface rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-border flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black italic font-display text-text-primary">Node Diagnosis</h3>
                  <p className="text-[8px] font-black uppercase text-text-secondary tracking-wider mt-0.5">Handshake Diagnostics • Ticket #{selectedTicket.id}</p>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-1.5 text-text-secondary hover:text-text-primary transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="p-3 bg-background rounded-xl border border-border space-y-2">
                  <div className="flex items-center gap-2">
                    <Wifi size={14} className="text-brand-primary" />
                    <p className="text-[10px] font-black uppercase text-text-secondary">System Handshake</p>
                  </div>
                  <p className="text-[11px] font-medium text-text-primary">Expired TLS client certificate detected on Node #{selectedTicket.id}. Clock drift sequence mismatch: +340ms.</p>
                </div>
                <div className="p-3 bg-background rounded-xl border border-border space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-warning" />
                    <p className="text-[10px] font-black uppercase text-text-secondary">Diagnostic Log</p>
                  </div>
                  <p className="text-[11px] font-medium text-text-primary">Subject: {selectedTicket.subject || selectedTicket.title || selectedTicket.issue || 'Support Ticket'}</p>
                  <p className="text-[11px] font-medium text-text-primary">Reported by: {selectedTicket.createdBy?.name || selectedTicket.user || 'User'}</p>
                  <p className="text-[11px] font-medium text-text-primary">Status: {selectedTicket.status?.toUpperCase() || 'OPEN'}</p>
                </div>
              </div>
              <div className="p-5 border-t border-border flex gap-3">
                <button onClick={() => handleRebootNode(selectedTicket.id)} disabled={rebootingNodeId === selectedTicket.id} className="flex-1 py-3 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-brand-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {rebootingNodeId === selectedTicket.id && <Loader2 size={14} className="animate-spin" />}
                  <RefreshCw size={14} /> Reboot Node
                </button>
                <button onClick={() => handleIssueToken(selectedTicket.id)} disabled={issuingTokenId === selectedTicket.id} className="flex-1 py-3 bg-warning text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-warning/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {issuingTokenId === selectedTicket.id && <Loader2 size={14} className="animate-spin" />}
                  <KeyRound size={14} /> Issue Temp Token
                </button>
                <button onClick={() => handleMarkResolved(selectedTicket.id)} disabled={resolvingTicketId === selectedTicket.id} className="flex-1 py-3 bg-success text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-success/90 disabled:opacity-50 flex items-center justify-center gap-2">
                  {resolvingTicketId === selectedTicket.id && <Loader2 size={14} className="animate-spin" />}
                  <CircleCheck size={14} /> Mark Resolved
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}


