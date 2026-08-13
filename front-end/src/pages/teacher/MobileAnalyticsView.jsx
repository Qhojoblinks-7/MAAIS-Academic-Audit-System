import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Activity, TrendingUp, Search, X,
  GraduationCap, AlertTriangle, FileText, Eye,
  ChevronDown, ChevronUp, ChevronLeft
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { teacherService } from '../../services';
import { TooltipProvider } from '../../components/ui/tooltip';

const OBS_TYPES_MODULE = ['Behavioral', 'Academic', 'Lab Safety', 'Collaboration', 'Punctuality'];
const OBS_COLORS_MODULE = ['#1D4D4F', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7'];

const GRADE_BANDS = [
  { label: 'A1', min: 80, max: 100, fill: '#16a34a' },
  { label: 'B2', min: 70, max: 79, fill: '#15803d' },
  { label: 'B3', min: 65, max: 69, fill: '#65a30d' },
  { label: 'C4', min: 60, max: 64, fill: '#eab308' },
  { label: 'C5', min: 55, max: 59, fill: '#f59e0b' },
  { label: 'C6', min: 50, max: 54, fill: '#f97316' },
  { label: 'D7', min: 45, max: 49, fill: '#ef4444' },
  { label: 'E8', min: 40, max: 44, fill: '#dc2626' },
  { label: 'F9', min: 0, max: 39, fill: '#991b1b' },
];

function getGradeBand(pct) {
  if (pct >= 80) return 'A1';
  if (pct >= 70) return 'B2';
  if (pct >= 65) return 'B3';
  if (pct >= 60) return 'C4';
  if (pct >= 55) return 'C5';
  if (pct >= 50) return 'C6';
  if (pct >= 45) return 'D7';
  if (pct >= 40) return 'E8';
  return 'F9';
}

export function MobileAnalyticsView() {
  const { user } = useRole();
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [obsFilter, setObsFilter] = useState('All');
  const [observations, setObservations] = useState([]);
  const [classProgress, setClassProgress] = useState([]);
  const [studentScores, setStudentScores] = useState([]);
  const [termTrends, setTermTrends] = useState([]);
  const [gradeConfig, setGradeConfig] = useState(GRADE_BANDS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [expandedObs, setExpandedObs] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const teacherId = user?.staffId || user?.profileId || user?.id;
      if (!teacherId) {
        setLoading(false);
        return;
      }
      try {
        const obsData = await teacherService.getAnalytics(teacherId);
        setObservations(obsData?.observations || []);
        setClassProgress(obsData?.classProgress || []);
        setStudentScores(obsData?.studentScores || []);
        setTermTrends(obsData?.termTrends || []);
        setGradeConfig(GRADE_BANDS);
      } catch (err) {
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user?.staffId, user?.profileId, user?.id]);

  const gradeDist = useMemo(() =>
    (gradeConfig || GRADE_BANDS).map((g) => ({
      label: g.label,
      count: studentScores.filter(s => getGradeBand(s.score) === g.label).length,
      fill: g.fill,
    })),
    [studentScores, gradeConfig]
  );

  const statCards = useMemo(() => {
    const safeScores = studentScores || [];
    const totalScore = safeScores.reduce((a, b) => a + (b.score || 0), 0);
    const meanScore = safeScores.length > 0 ? Math.round(totalScore / safeScores.length) : 0;
    
    const totalCompletions = classProgress.reduce((s, c) => s + (c.completions || 0), 0);
    const totalStudents = classProgress.reduce((s, c) => s + (c.students || 0), 0);
    const submissionRate = totalStudents > 0 ? Math.round((totalCompletions / totalStudents) * 100) : 0;

    return [
      { label: 'Class Avg', value: `${meanScore}%`, icon: 'GraduationCap', bg: 'bg-success/10', color: 'text-success', subtext: 'Score performance' },
      { label: 'Submitted', value: `${totalCompletions}/${totalStudents}`, icon: 'FileText', bg: 'bg-brand-secondary/10', color: 'text-brand-secondary', subtext: `${submissionRate}% complete` },
      { label: 'At Risk', value: safeScores.filter(s => (s.score || 0) < 60).length, icon: 'AlertTriangle', bg: 'bg-danger/10', color: 'text-danger', subtext: 'Score below 60' },
      { label: 'Observations', value: observations.length, icon: 'Activity', bg: 'bg-warning/10', color: 'text-warning', subtext: `${observations.filter(o => o.status === 'Active' || o.status === 'active').length} active` },
    ];
  }, [studentScores, classProgress, observations]);

  const atRiskCount = useMemo(() => studentScores.filter(s => (s.score || 0) < 60).length, [studentScores]);
  const topPerformerCount = useMemo(() => studentScores.filter(s => (s.score || 0) >= 80).length, [studentScores]);
  const meanScore = useMemo(() => {
    if (studentScores.length === 0) return 0;
    return Math.round(studentScores.reduce((sum, s) => sum + (s.score || 0), 0) / studentScores.length);
  }, [studentScores]);

  const filteredObs = useMemo(() => {
    const seen = new Set();
    return observations.filter(o => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        (o.student || '').toLowerCase().includes(q) ||
        (o.type || '').toLowerCase().includes(q) ||
        (o.comment || '').toLowerCase().includes(q);
      const matchesType = obsFilter === 'All' || o.type === obsFilter;
      if (!matchesSearch || !matchesType) return false;
      const key = o.id || `${o.student}-${o.type}-${o.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [observations, searchQuery, obsFilter]);

  const filteredStudents = useMemo(() => {
    const seen = new Set();
    return studentScores
      .filter(s => {
        if (!(s.student || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
        const key = s.id || s.student;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.score - a.score);
  }, [studentScores, searchQuery]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-[300px]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-primary">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-6 text-center">
        <div>
          <p className="text-sm font-bold text-primary">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 px-4 py-2 bg-brand-primary text-surface rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-transform"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'observations', label: 'Observations', icon: Activity },
    { id: 'students', label: 'Students', icon: TrendingUp },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex-1 flex flex-col bg-background min-w-0 overflow-x-hidden no-scrollbar">
        {/* Header */}
        <header className="bg-surface border-b border-border px-3 py-2 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0 active:scale-95 transition-transform"
              >
                <ChevronLeft size={16} className="text-primary" />
              </button>
              <div className="min-w-0">
                <h1 className="text-sm font-black text-primary truncate leading-tight">Analytics</h1>
              </div>
            </div>
            <select
              value={selectedView}
              onChange={(e) => { setSelectedView(e.target.value); setSearchQuery(''); setObsFilter('All'); }}
              className="appearance-none bg-surface border border-border rounded-lg px-2 py-1.5 pr-6 text-[9px] font-black uppercase tracking-wider text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-sm"
            >
              {tabs.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide min-w-0 pb-24">
          {/* Stat Cards - Horizontal Carousel */}
          <div 
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 py-4 scrollbar-hide scroll-smooth" 
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {statCards.map((s, i) => {
            const iconMap = { GraduationCap, FileText, AlertTriangle, Activity };
            const CardIcon = iconMap[s.icon] || GraduationCap;
            return (
              <div key={s.label} className="snap-start shrink-0 w-64 bg-surface p-4 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all relative group">
                <div className="flex items-center justify-between h-full gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0", s.bg, s.color)}>
                      <CardIcon size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1 whitespace-nowrap">{s.label}</p>
                      <p className="text-[11px] font-medium text-text-secondary leading-tight whitespace-nowrap">{s.subtext}</p>
                    </div>
                  </div>
                  <div className="text-right pl-4 shrink-0">
                    {String(s.value).endsWith('%') ? (
                      <p className="text-2xl font-bold tracking-tighter leading-none whitespace-nowrap">
                        {String(s.value).slice(0, -1)}<span className="text-sm font-bold align-baseline">{String(s.value).slice(-1)}</span>
                      </p>
                    ) : (
                      <p className="text-2xl font-bold tracking-tighter leading-none whitespace-nowrap">{s.value}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          <div className="px-4 space-y-4">

            {/* TAB 1: OVERVIEW */}
            {selectedView === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Term Trends */}
                <div className="bg-surface rounded-2xl border border-border shadow-sm p-4">
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <TrendingUp size={13} className="text-brand-primary" />
                    Term Score Trend
                  </h3>
                  <div className="h-28 w-full overflow-x-auto scrollbar-hide">
                    <div className="flex items-end gap-0.5 h-full pb-2 min-w-max">
                      {termTrends.length > 0 ? termTrends.map((t, i) => {
                        const heightPct = Math.max(10, Math.min(100, t.avg));
                        return (
                          <div key={i} className="flex flex-col items-center gap-0.5 w-6 shrink-0 h-full">
                            <span className="text-[5px] font-black text-primary">{t.avg}%</span>
                            <div className="flex-1 w-full relative">
                              <div className="absolute inset-0 bg-brand-primary/15 rounded-t-lg" />
                              <div
                                className="absolute bottom-0 left-0 right-0 bg-brand-primary rounded-t-lg transition-all duration-500"
                                style={{ height: `${heightPct}%` }}
                              />
                            </div>
                            <span className="text-[5px] font-bold text-secondary truncate w-full text-center">{t.term}</span>
                          </div>
                        );
                      }) : (
                        <div className="w-full flex items-center justify-center h-full text-xs font-medium text-secondary">
                          No trend data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subject Completion Progress */}
                <div className="bg-surface rounded-2xl border border-border shadow-sm p-4">
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                    <GraduationCap size={13} className="text-brand-primary" />
                    Class Completion
                  </h3>
                  <div className="space-y-3">
                    {classProgress.map((c, i) => {
                      const pct = c.students > 0 ? Math.round((c.completions / c.students) * 100) : 0;
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-primary truncate flex-1 mr-2">{c.subject}</span>
                            <span className="font-black text-secondary text-[10px] whitespace-nowrap">
                              {c.completions}/{c.students} ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-primary rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Grade Distribution */}
                <div className="bg-surface rounded-2xl border border-border shadow-sm p-4">
                  <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                    <BarChart3 size={13} className="text-brand-primary" />
                    Grade Distribution
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {gradeDist.map((g) => (
                      <div key={g.label} className="flex items-center justify-between bg-muted/40 rounded-xl px-2.5 py-2 border border-border/40">
                        <span className="text-xs font-black text-primary" style={{ color: g.count > 0 ? g.fill : undefined }}>
                          {g.label}
                        </span>
                        <span className="text-xs font-bold text-secondary">{g.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: OBSERVATIONS */}
            {selectedView === 'observations' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={14} />
                  <input
                    type="text"
                    placeholder="Search observations…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 bg-surface border border-border rounded-xl text-xs font-medium text-primary placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-sm"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Observation Filters */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {['All', ...OBS_TYPES_MODULE].map((f) => (
                    <button
                      key={f}
                      onClick={() => setObsFilter(f)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border whitespace-nowrap",
                        obsFilter === f 
                          ? 'bg-brand-primary text-surface border-brand-primary shadow-sm' 
                          : 'bg-surface text-secondary border-border hover:border-secondary'
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Observation Items */}
                <div className="space-y-2">
                  {filteredObs.map((o, i) => {
                    const typeIdx = OBS_TYPES_MODULE.indexOf(o.type);
                    const typeColor = OBS_COLORS_MODULE[typeIdx] || '#1D4D4F';
                    const isExpanded = expandedObs === o.id;

                    return (
                       <motion.div
                         key={o.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
                      >
                        <div
                          onClick={() => setExpandedObs(isExpanded ? null : o.id)}
                          className="p-3.5 flex items-start gap-3 cursor-pointer active:bg-muted/40 transition-colors"
                        >
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black text-white shadow-sm" 
                            style={{ backgroundColor: typeColor }}
                          >
                            {o.type ? o.type.charAt(0) : 'O'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-black text-primary truncate">{o.student}</p>
                              <span className={cn(
                                "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0", 
                                (o.status === 'Active' || o.status === 'active') ? 'bg-success/10 text-success' : 'bg-muted text-secondary'
                              )}>
                                {o.status || 'Logged'}
                              </span>
                            </div>
                            <p className="text-[10px] font-bold text-secondary mt-0.5 truncate">{o.type} • {o.class || 'Class'}</p>
                            
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-2.5 pt-2.5 border-t border-border/50">
                                    <p className="text-xs font-medium text-primary leading-relaxed italic">"{o.comment}"</p>
                                    <div className="flex items-center justify-between mt-2.5">
                                      <span className="text-[10px] font-bold text-secondary">{o.date}</span>
                                      <button
                                        onClick={(e) => { 
                                          e.stopPropagation(); 
                                          navigate(`/grading?subject=${encodeURIComponent(o.type)}&class=${encodeURIComponent(o.class || '')}`); 
                                        }}
                                        className="p-1.5 bg-brand-primary/10 rounded-lg text-brand-primary active:scale-95 transition-transform"
                                      >
                                        <Eye size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <div className="shrink-0 text-secondary mt-1">
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {filteredObs.length === 0 && (
                    <div className="text-center py-8 bg-surface rounded-2xl border border-border border-dashed p-4">
                      <p className="text-xs font-bold text-secondary">No observations match your query.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 3: STUDENTS */}
            {selectedView === 'students' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {/* Summary Metrics */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-surface p-3 rounded-2xl border border-border shadow-sm">
                    <p className="text-[9px] font-black text-secondary uppercase tracking-widest mb-0.5">Total Enrolled</p>
                    <p className="text-lg font-black text-primary">{studentScores.length}</p>
                  </div>
                  <div className="bg-success/10 p-3 rounded-2xl border border-success/20 shadow-sm">
                    <p className="text-[9px] font-black text-success uppercase tracking-widest mb-0.5">Mean Score</p>
                    <p className="text-lg font-black text-success">{meanScore}%</p>
                  </div>
                  <div className="bg-danger/10 p-3 rounded-2xl border border-danger/20 shadow-sm">
                    <p className="text-[9px] font-black text-danger uppercase tracking-widest mb-0.5">At Risk (&lt;60)</p>
                    <p className="text-lg font-black text-danger">{atRiskCount}</p>
                  </div>
                  <div className="bg-brand-primary/10 p-3 rounded-2xl border border-brand-primary/20 shadow-sm">
                    <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-0.5">Top Performers</p>
                    <p className="text-lg font-black text-brand-primary">{topPerformerCount}</p>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={14} />
                  <input
                    type="text"
                    placeholder="Search by student name…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 bg-surface border border-border rounded-xl text-xs font-medium text-primary placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-sm"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Student Score Accordion List */}
                <div className="space-y-2">
                  {filteredStudents.map((s, i) => {
                    const grade = getGradeBand(s.score);
                    const gradeDef = gradeConfig.find(g => g.label === grade);
                    const isAtRisk = s.score < 60;
                    const isTop = s.score >= 80;
                    const scoreColor = isAtRisk ? 'text-danger' : isTop ? 'text-success' : 'text-primary';
                    const trendColor = s.trendUp ? 'text-success' : s.trend === '–' ? 'text-secondary' : 'text-danger';
                    const isExpanded = expandedStudent === s.student;

                    return (
                       <motion.div
                         key={s.id || s.student}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
                      >
                        <div
                          onClick={() => setExpandedStudent(isExpanded ? null : s.student)}
                          className="p-3.5 flex items-center gap-3 cursor-pointer active:bg-muted/40 transition-colors"
                        >
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-black shadow-sm",
                            isAtRisk ? 'bg-danger/10 text-danger border border-danger/20' : 
                            isTop ? 'bg-success/10 text-success border border-success/20' : 
                            'bg-muted text-primary border border-border'
                          )}>
                            {isAtRisk ? '!' : isTop ? '★' : s.student.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-primary truncate">{s.student}</p>
                            <p className="text-[10px] font-bold text-secondary">{isAtRisk ? 'Needs intervention' : 'On track'}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={cn("text-sm font-black", scoreColor)}>{s.score}%</span>
                            {isExpanded ? <ChevronUp size={14} className="text-secondary" /> : <ChevronDown size={14} className="text-secondary" />}
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-3.5 pt-2 border-t border-border/50 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black text-secondary uppercase tracking-widest">WASSCE Grade</span>
                                  <span 
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-black text-white shadow-sm" 
                                    style={{ backgroundColor: gradeDef?.fill || '#64748b' }}
                                  >
                                    {grade}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Recent Trend</span>
                                  <span className={cn("text-xs font-black", trendColor)}>
                                    {s.trendUp ? '↑' : s.trend === '–' ? '–' : '↓'} {s.trend}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}

                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8 bg-surface rounded-2xl border border-border border-dashed p-4">
                      <p className="text-xs font-bold text-secondary">No students found.</p>
                    </div>
                  )}
                </div>

                {/* At-Risk Warning Callout */}
                {atRiskCount > 0 && (
                  <div className="bg-danger/10 border border-danger/20 rounded-2xl p-4 flex items-start gap-3">
                    <div className="w-8 h-8 bg-danger rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                      <AlertTriangle size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-danger uppercase tracking-widest mb-0.5">Academic Intervention Required</p>
                      <p className="text-[10px] font-medium text-danger leading-relaxed">
                        {studentScores.filter(s => (s.score || 0) < 60).map(s => s.student).join(', ')} — Score below 60%.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}