import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell,
  Legend
} from 'recharts';
import {
  Star, GraduationCap, Users, BarChart3, AlertTriangle, TrendingUp,
  Search, FileText, Activity, Eye
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { teacherService } from '../../services';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../components/ui/tooltip';

const OBS_TYPES_MODULE = ['Behavioral', 'Academic', 'Lab Safety', 'Collaboration', 'Punctuality'];
const OBS_COLORS_MODULE = ['#1D4D4F', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7'];
const GRADE_BANDS = [
  { label: 'A1', min: 75, max: 100, fill: '#166534' },
  { label: 'B2', min: 70, max: 74, fill: '#1d4d4f' },
  { label: 'B3', min: 65, max: 69, fill: '#0369a1' },
  { label: 'C4', min: 60, max: 64, fill: '#6d28d9' },
  { label: 'C5', min: 55, max: 59, fill: '#b45309' },
  { label: 'C6', min: 50, max: 54, fill: '#92400e' },
  { label: 'D7', min: 45, max: 49, fill: '#9f1239' },
  { label: 'E8', min: 40, max: 44, fill: '#7f1d1d' },
  { label: 'F9', min: 0, max: 39, fill: '#4b5563' },
];

function getNumericTrend(trend) {
  const value = Number(String(trend ?? '').replace(/[+%]/g, ''));
  return Number.isFinite(value) ? value : 0;
}

function getGradeBand(pct, gradeConfig = GRADE_BANDS) {
  const score = Number(pct) || 0;
  const bands = gradeConfig || GRADE_BANDS;
  const band = bands.find((g) => score >= Number(g.min ?? g.minScore) && score <= Number(g.max ?? g.maxScore));

  if (band) return band.label;
  if (score >= 75) return 'A1';
  if (score >= 70) return 'B2';
  if (score >= 65) return 'B3';
  if (score >= 60) return 'C4';
  if (score >= 55) return 'C5';
  if (score >= 50) return 'C6';
  if (score >= 45) return 'D7';
  if (score >= 40) return 'E8';
  return 'F9';
}

function getGradeColor(grade, gradeConfig = GRADE_BANDS) {
  const band = (gradeConfig || GRADE_BANDS).find((g) => g.label === grade);
  return band?.fill || band?.color || '#64748b';
}

function getObservationType(observation) {
  return observation?.type || observation?.subject || observation?.subjectName || '';
}

function getObservationTypes(observations) {
  const types = Array.from(new Set(observations.map(getObservationType).filter(Boolean)));
  return types.length > 0 ? types : OBS_TYPES_MODULE;
}

function getObservationColor(type, index) {
  const fallbackIndex = OBS_TYPES_MODULE.indexOf(type);
  return OBS_COLORS_MODULE[fallbackIndex] || OBS_COLORS_MODULE[index % OBS_COLORS_MODULE.length] || '#1D4D4F';
}

function getTrendSymbol(trend) {
  if (trend === '–') return '';
  const value = getNumericTrend(trend);
  if (value > 0) return '↑';
  if (value < 0) return '↓';
  return '→';
}

export function TeacherAnalyticsView() {
  const { user } = useRole();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [obsFilter, setObsFilter] = useState('All');
  const navigate = useNavigate();

  const [observations, setObservations] = useState([]);
  const [classProgress, setClassProgress] = useState([]);
  const [studentScores, setStudentScores] = useState([]);
  const [termTrends, setTermTrends] = useState([]);
  const [gradeConfig, setGradeConfig] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        setGradeConfig(obsData?.gradeConfig || GRADE_BANDS);
      } catch (err) {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user?.staffId, user?.profileId, user?.id]);

  const gradeDist = useMemo(() =>
    (gradeConfig || GRADE_BANDS).map((g) => ({
      label: g.label,
      count: studentScores.filter(s => getGradeBand(s.score, gradeConfig) === g.label).length,
      fill: g.fill || g.color,
    })),
    [studentScores, gradeConfig]
  );

  const observationTypes = useMemo(() => getObservationTypes(observations), [observations]);

  const obsTypePieData = useMemo(() => {
    return observationTypes.map((t, i) => ({
      name: t,
      value: observations.filter((o) => getObservationType(o) === t).length,
      fill: getObservationColor(t, i),
    }));
  }, [observations, observationTypes]);

  const statCards = useMemo(() => {
    const safeScores = studentScores || [];
    const totalScore = safeScores.reduce((a, b) => a + (b.score || 0), 0);
    const meanScore = safeScores.length > 0 ? Math.round(totalScore / safeScores.length) : 0;
    const totalCompletions = classProgress.reduce((s, c) => s + (c.completions || 0), 0);
    const totalStudents = classProgress.reduce((s, c) => s + (c.students || 0), 0);
    const submissionRate = totalStudents > 0 ? Math.round((totalCompletions / totalStudents) * 100) : 0;
    const trendedStudents = safeScores.filter((s) => getNumericTrend(s.trend) !== 0).length;

    return [
      { label: 'Class Avg Score', value: safeScores.length > 0 ? `${meanScore}%` : 'No data', icon: GraduationCap, color: 'bg-success/10 text-success border-success/20', delta: trendedStudents > 0 ? `${trendedStudents} with term movement` : 'Awaiting previous term data' },
      { label: 'Submission Rate', value: classProgress.length > 0 ? `${totalCompletions}/${totalStudents}` : 'No data', icon: FileText, color: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20', delta: classProgress.length > 0 ? `${submissionRate}% complete` : 'No class data' },
      { label: 'At-Risk Students', value: safeScores.filter(s => (s.score || 0) < 60).length, icon: AlertTriangle, color: 'bg-danger/10 text-danger border-danger/20', delta: 'Score below 60' },
      { label: 'Total Observations', value: observations.length, icon: Activity, color: 'bg-warning/10 text-warning border-warning/20', delta: `${observations.filter(o => o.status === 'Active').length} active` },
    ];
  }, [studentScores, classProgress, observations]);

  const atRiskCount = useMemo(() => studentScores.filter(s => (s.score || 0) < 60).length, [studentScores]);
  const topPerformerCount = useMemo(() => studentScores.filter(s => (s.score || 0) >= 80).length, [studentScores]);
  const meanScore = useMemo(() => {
    if (studentScores.length === 0) return 0;
    return Math.round(studentScores.reduce((sum, s) => sum + (s.score || 0), 0) / studentScores.length);
  }, [studentScores]);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24">
          <p className="text-sm font-medium text-muted-foreground">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'observations', label: 'Observations', icon: Activity },
    { id: 'students', label: 'Student Trends', icon: TrendingUp },
  ];

  const filteredObs = observations.filter((o) => {
    const student = o.student || o.studentName || o.name || '';
    const type = getObservationType(o);
    const comment = o.comment || o.observationText || o.remark || '';
    const matchesSearch = student.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = obsFilter === 'All' || type === obsFilter;
    return matchesSearch && matchesType;
  });

  const filteredStudents = studentScores
    .filter(s => s.student.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.score - a.score);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 lg:p-10 select-none">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">

          <header className="mb-8 border-b border-border pb-6">
            <h1 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight leading-none">
              Performance Analytics
            </h1>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-2 flex items-center gap-1.5">
              <Eye size={10} className="text-text-secondary" />
              Grade Insights · Observation Trends · At-Risk Flags
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border", s.color)}>
                  <s.icon size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest leading-none mb-1">{s.label}</p>
                  <p className="text-2xl font-black text-text-primary leading-none">{s.value}</p>
                  <p className="text-[9px] font-bold text-text-secondary mt-1">{s.delta}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex bg-surface rounded-2xl border border-border shadow-sm p-1 mb-6 w-fit">
            {tabs.map((t) => (
              <Tooltip key={t.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      setActiveTab(t.id);
                      setSearchQuery('');
                      setObsFilter('All');
                    }}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      activeTab === t.id
                        ? 'bg-brand-primary text-surface shadow-md shadow-brand-dark/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-muted'
                    )}
                  >
                    <t.icon size={13} />
                    {t.label}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8}>{t.label} analytics</TooltipContent>
              </Tooltip>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="bg-surface rounded-[2rem] border border-border shadow-sm p-6 lg:p-8">
                  <h3 className="text-[11px] font-black text-text-primary uppercase tracking-widest mb-5 flex items-center gap-2">
                    <TrendingUp size={14} className="text-text-secondary" />
                    Term Score Trend · Class Average
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={termTrends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="term" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} tickLine={false} axisLine={false} />
                        <YAxis domain={[60, 90]} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} tickLine={false} axisLine={false} />
                        <RechartsTooltip
                          contentStyle={{ fontSize: 11, fontWeight: 700, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                          formatter={(val, label) => [val, label]}
                        />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                        <Line type="monotone" dataKey="avg" name="Class Avg" stroke="#1D4D4F" strokeWidth={2.5} dot={{ r: 4, fill: '#1D4D4F' }} activeDot={{ r: 7 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-surface rounded-[2rem] border border-border shadow-sm p-6 lg:p-8">
                    <h3 className="text-[11px] font-black text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                      <GraduationCap size={14} className="text-text-secondary" />
                      Grade Distribution
                    </h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gradeDist} margin={{ top: 10, right: 20, left: -10, bottom: 0 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} tickLine={false} axisLine={false} width={36} />
                          <RechartsTooltip
                            contentStyle={{ fontSize: 11, fontWeight: 700, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                            formatter={(val) => [val, 'Students']}
                          />
                          <Bar dataKey="count" name="Students" radius={[0, 6, 6, 0]}>
                            {gradeDist.map((d) => (
                              <Cell key={d.label} fill={d.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-surface rounded-[2rem] border border-border shadow-sm p-6 lg:p-8">
                    <h3 className="text-[11px] font-black text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Star size={14} className="text-text-secondary" />
                      Observation Breakdown
                    </h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={obsTypePieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={46}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                          >
                            {obsTypePieData.map((d, i) => (
                              <Cell key={d.name} fill={d.fill} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{ fontSize: 11, fontWeight: 700, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                            formatter={(val) => [val, 'Records']}
                          />
                          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="bg-surface rounded-[2rem] border border-border shadow-sm p-6 lg:p-8">
                  <h3 className="text-[11px] font-black text-text-primary uppercase tracking-widest mb-5 flex items-center gap-2">
                    <BarChart3 size={14} className="text-text-secondary" />
                    Class Completion Rate
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={classProgress} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} tickLine={false} axisLine={false} />
                        <RechartsTooltip
                          contentStyle={{ fontSize: 11, fontWeight: 700, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                          formatter={(val, name) => [`${val}`, name === 'meanAvg' ? 'Avg Score' : 'Completion']}
                        />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                        <Bar dataKey="avgScore" name="Avg Score (%)" fill="#1D4D4F" radius={[5, 5, 0, 0]} />
                        <Bar dataKey="completions" name="Graded Count" fill="#10b981" radius={[5, 5, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'observations' && (
              <motion.div
                key="observations"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={15} />
                    <input
                      type="text"
                      placeholder="Search observations…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-[12px] font-medium text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/10 shadow-sm"
                    />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {['All', ...observationTypes].map((f) => (
                      <button
                        key={f}
                        onClick={() => setObsFilter(f)}
                        className={cn(
                          "px-3.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border",
                          obsFilter === f ? 'bg-brand-primary text-surface border-brand-primary shadow-sm' : 'bg-surface text-text-secondary border-border hover:border-text-secondary'
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-surface rounded-[2rem] border border-border shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
                    <Activity size={14} className="text-text-secondary" />
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                      Observations · {filteredObs.length} record{filteredObs.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="divide-y divide-border">
                    <AnimatePresence>
                      {filteredObs.map((o, i) => {
                        const type = getObservationType(o);
                        const typeIdx = observationTypes.indexOf(type);
                        const typeColor = getObservationColor(type, typeIdx);
                        const normalizedStatus = o.status === 'Pending' ? 'Pending' : o.status === 'Resolved' ? 'Resolved' : 'Active';
                        return (
                          <motion.div
                            key={o.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: i * 0.03 }}
                            className="px-6 py-4 grid grid-cols-12 gap-3 items-center hover:bg-muted/40 transition-all"
                          >
                            <div className="col-span-2 font-black text-sm text-text-primary truncate">{o.student}</div>

                            <div className="col-span-2">
                              <span className="inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-surface" style={{ backgroundColor: typeColor }}>{type}</span>
                            </div>

                            <div className="col-span-2">
                              <p className="text-xs font-bold text-text-primary truncate">{o.class}</p>
                              <p className="text-[9px] font-black text-text-secondary">Idx. {o.index}</p>
                            </div>

                            <div className="col-span-3 text-[11px] font-medium text-text-secondary italic truncate">"{o.comment}"</div>

                            <div className="col-span-1 text-right text-[10px] font-bold text-text-secondary whitespace-nowrap">{o.date}</div>

                            <div className="col-span-1 text-center">
                              {normalizedStatus === 'Active'
                                ? <span className="inline-flex items-center gap-1 text-[8px] font-black px-2.5 py-1 rounded-xl bg-success/10 text-success border border-success/20 uppercase tracking-widest">
                                    <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" /> Active
                                  </span>
                                : normalizedStatus === 'Pending'
                                  ? <span className="inline-flex items-center gap-1 text-[8px] font-black px-2.5 py-1 rounded-xl bg-warning/10 text-warning border border-warning/20 uppercase tracking-widest">
                                      <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" /> Pending
                                    </span>
                                  : <span className="inline-flex text-[8px] font-black px-2.5 py-1 rounded-xl bg-muted text-text-secondary border border-border uppercase tracking-widest">Resolved</span>}
                            </div>

                            <div className="col-span-1 flex items-center justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button onClick={() => navigate(`/grading?subject=${encodeURIComponent(type)}&class=${encodeURIComponent(o.class)}`)} className="p-1.5 hover:bg-brand-primary/10 rounded-lg transition-all text-text-secondary hover:text-brand-primary">
                                    <Eye size={14} />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={8}>View class grading sheet</TooltipContent>
                              </Tooltip>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {filteredObs.length === 0 && (
                      <div className="py-16 text-center text-muted-foreground text-sm font-medium uppercase tracking-tight">
                        No observations match your filters.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'students' && (
              <motion.div
                key="students"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm">
                    <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest leading-none mb-1">Total Students</p>
                    <p className="text-xl font-black text-text-primary">{studentScores.length}</p>
                  </div>
                  <div className="bg-success/10 p-4 rounded-2xl border border-success/20 shadow-sm">
                    <p className="text-[9px] font-black text-success uppercase tracking-widest leading-none mb-1">Mean Score</p>
                    <p className="text-xl font-black text-success">{meanScore}</p>
                  </div>
                  <div className="bg-warning/10 p-4 rounded-2xl border border-warning/20 shadow-sm">
                    <p className="text-[9px] font-black text-warning uppercase tracking-widest leading-none mb-1">At Risk (&lt;60)</p>
                    <p className="text-xl font-black text-warning">{atRiskCount}</p>
                  </div>
                  <div className="bg-success/10 p-4 rounded-2xl border border-success/20 shadow-sm">
                    <p className="text-[9px] font-black text-success uppercase tracking-widest leading-none mb-1">Top Performers (≥80)</p>
                    <p className="text-xl font-black text-success">{topPerformerCount}</p>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={15} />
                  <input
                    type="text"
                    placeholder="Search by student name…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-[12px] font-medium text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/10 shadow-sm"
                  />
                </div>

                <div className="bg-surface rounded-[2rem] border border-border shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
                    <Users size={14} className="text-text-secondary" />
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                      Student Performance · {filteredStudents.length} entries
                    </span>
                  </div>

                  {studentScores.length === 0 && (
                    <div className="py-16 text-center text-muted-foreground text-sm font-medium">
                      No student trend data available yet.
                    </div>
                  )}

                  {studentScores.length > 0 && (
                    <>
                  <div className="px-6 py-2.5 border-b border-border bg-muted grid grid-cols-5 gap-3 text-[9px] font-black text-text-secondary uppercase tracking-widest">
                    <span className="col-span-2">Student</span>
                    <span className="text-center">Score</span>
                    <span className="text-center">Grade</span>
                    <span className="text-right">Δ Trend</span>
                  </div>

                  <div className="divide-y divide-border">
                    {filteredStudents.map((s, i) => {
                      const grade = getGradeBand(s.score, gradeConfig);
                      const trendValue = getNumericTrend(s.trend);
                      const isAtRisk = s.score < 60;
                      const isTop = s.score >= 80;
                      const scoreColor = isAtRisk ? 'text-danger' : isTop ? 'text-success' : 'text-text-primary';
                      const trendColor = s.trend === '–' || trendValue === 0 ? 'text-text-secondary' : trendValue > 0 ? 'text-success' : 'text-danger';

                      return (
                        <motion.div
                          key={s.student}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="px-6 py-3.5 grid grid-cols-5 gap-3 items-center hover:bg-muted/40 transition-all"
                        >
                          <div className="col-span-2 flex items-center gap-3 min-w-0">
                            <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 border",
                              isAtRisk ? 'bg-danger/10 text-danger border-danger/20' : isTop ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-text-primary border-border'
                            )}>
                              {isAtRisk ? '!' : isTop ? '★' : s.student.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-text-primary truncate">{s.student}</p>
                              <p className="text-[9px] font-bold text-text-secondary">{isAtRisk ? '⚠ Needs intervention' : 'On track'}</p>
                            </div>
                          </div>

                          <div className="text-center">
                            <p className={cn("text-base font-black", scoreColor)}>{s.score}</p>
                          </div>

                          <div className="text-center">
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-surface"
                              style={{ backgroundColor: getGradeColor(grade, gradeConfig) }}
                            >
                              {grade}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className={cn("text-[10px] font-black", trendColor)}>{getTrendSymbol(s.trend)} {s.trend}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                    </>
                  )}

                <div className="bg-danger/10 border border-danger/20 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-danger rounded-xl flex items-center justify-center text-surface shrink-0 mt-0.5">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-danger uppercase tracking-widest mb-1">At-Risk Alert</p>
                    <p className="text-xs font-medium text-danger leading-relaxed">
                      {studentScores.filter(s => (s.score || 0) < 60).map(s => s.student).join(', ') || 'None'} — Score below 60 threshold.
                      <span className="font-black"> Schedule intervention.</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
