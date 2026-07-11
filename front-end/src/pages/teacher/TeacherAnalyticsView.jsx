import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell,
  Legend
} from 'recharts';
import {
  Star, GraduationCap, Users, BarChart3, AlertTriangle, TrendingUp,
  Search, X, Plus, FileText, Activity, Eye, ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { teacherService } from '../../services';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../components/ui/tooltip';

const OBS_TYPES_MODULE = ['Behavioral', 'Academic', 'Lab Safety', 'Collaboration', 'Punctuality'];
const OBS_COLORS_MODULE = ['#1D4D4F', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7'];
const FALLBACK_STUDENT_SCORES = [
  { student: "Ama Serwaa", score: 78, trend: "+3", trendUp: true },
  { student: "Kwame Mensah", score: 65, trend: "-2", trendUp: false },
  { student: "Angela Owusu", score: 82, trend: "+5", trendUp: true },
  { student: "Yaw Boateng", score: 55, trend: "–", trendUp: false },
  { student: "Kofi Mensah", score: 70, trend: "+1", trendUp: true },
  { student: "Abena Owusu", score: 48, trend: "-4", trendUp: false },
  { student: "Esi Asare", score: 90, trend: "+7", trendUp: true },
  { student: "Kojo Annan", score: 61, trend: "+2", trendUp: true },
  { student: "Akua Mensah", score: 53, trend: "–", trendUp: false },
  { student: "Kweku Nkrumah", score: 74, trend: "+4", trendUp: true },
];
const FALLBACK_CLASS_PROGRESS = [
  { subject: "General Agriculture", completions: 38, students: 38, avgScore: 82 },
  { subject: "Core Mathematics", completions: 17, students: 38, avgScore: 65 },
  { subject: "English Language", completions: 0, students: 38, avgScore: 0 },
];
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
        setClassProgress(obsData?.classProgress || FALLBACK_CLASS_PROGRESS);
        setStudentScores(obsData?.studentScores || FALLBACK_STUDENT_SCORES);
        setTermTrends(obsData?.termTrends || []);
        setGradeConfig(GRADE_BANDS);
      } catch (err) {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user?.staffId, user?.profileId, user?.id]);

  function getGradeBand(pct) {
    if (pct >= 75) return 'A1';
    if (pct >= 70) return 'B2';
    if (pct >= 65) return 'B3';
    if (pct >= 60) return 'C4';
    if (pct >= 55) return 'C5';
    if (pct >= 50) return 'C6';
    if (pct >= 45) return 'D7';
    if (pct >= 40) return 'E8';
    return 'F9';
  }

  const gradeDist = useMemo(() =>
    (gradeConfig || GRADE_BANDS).map((g) => ({
      label: g.label,
      count: studentScores.filter(s => getGradeBand(s.score) === g.label).length,
      fill: g.fill,
    })),
    [studentScores, gradeConfig]
  );

  const obsTypePieData = useMemo(() => {
    return OBS_TYPES_MODULE.map((t, i) => ({
      name: t,
      value: observations.filter(o => o.type === t).length,
      fill: OBS_COLORS_MODULE[i],
    }));
  }, [observations]);

  const statCards = useMemo(() => {
    const safeScores = studentScores || [];
    const totalScore = safeScores.reduce((a, b) => a + (b.score || 0), 0);
    const meanScore = safeScores.length > 0 ? Math.round(totalScore / safeScores.length) : 0;
    const submissionRate = classProgress.length > 0
      ? Math.round((classProgress.reduce((s, c) => s + (c.completions || 0), 0) /
        classProgress.reduce((s, c) => s + (c.students || 1), 0)) * 100)
      : 0;

    return [
      { label: 'Class Avg Score', value: `${meanScore}%`, icon: GraduationCap, color: 'bg-success/10 text-success border-success/20', delta: '+2% vs last term' },
      { label: 'Submission Rate', value: `${classProgress.reduce((s, c) => s + (c.completions || 0), 0)}/${classProgress.reduce((s, c) => s + (c.students || 0), 0)}`, icon: FileText, color: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20', delta: `${submissionRate}% complete` },
      { label: 'At-Risk Students', value: safeScores.filter(s => (s.score || 0) < 60).length, icon: AlertTriangle, color: 'bg-danger/10 text-danger border-danger/20', delta: 'Score below 60' },
      { label: 'Total Observations', value: observations.length, icon: Activity, color: 'bg-warning/10 text-warning border-warning/20', delta: `${observations.filter(o => o.status === 'active').length} active` },
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

  const filteredObs = observations.filter(o => {
    const matchesSearch = o.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.comment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = obsFilter === 'All' || o.type === obsFilter;
    return matchesSearch && matchesType;
  });

  const filteredStudents = studentScores
    .filter(s => s.student.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b.score - a.score);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 lg:p-10 select-none">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">

          <header className="mb-8 border-b border-border pb-6">
            <h1 className="text-2xl font-black text-primary tracking-tight leading-none">
              Performance Analytics
            </h1>
            <p className="text-xs font-black text-secondary uppercase tracking-widest mt-2 flex items-center gap-1.5">
              <Eye size={10} className="text-secondary" />
              Grade Insights · Observation Trends · At-Risk Flags
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((s, i) => (
              <div
                key={s.label}
                style={{ animationDelay: `${i * 50}ms` }}
                className="bg-surface p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border", s.color)}>
                  <s.icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-secondary uppercase tracking-widest leading-none mb-1">{s.label}</p>
                  <p className="text-2xl font-black text-primary leading-none">{s.value}</p>
                  <p className="text-xs font-bold text-secondary mt-1">{s.delta}</p>
                </div>
              </div>
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
                      "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                      activeTab === t.id
                        ? 'bg-brand-primary text-surface shadow-md shadow-brand-dark/10'
                        : 'text-secondary hover:text-primary hover:bg-muted'
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

            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-surface rounded-[2rem] border border-border shadow-sm p-6 lg:p-8">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-5 flex items-center gap-2">
                    <TrendingUp size={14} className="text-secondary" />
                    Term Score Trend · Class Average
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <LineChart data={termTrends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="term" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} tickLine={false} axisLine={false} />
                        <YAxis domain={[60, 90]} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} tickLine={false} axisLine={false} />
                        <Tooltip
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
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                      <GraduationCap size={14} className="text-secondary" />
                      Grade Distribution
                    </h3>
                     <div className="h-64 w-full">
                       <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                         <BarChart data={gradeDist} margin={{ top: 10, right: 20, left: -10, bottom: 0 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} tickLine={false} axisLine={false} width={36} />
                          <Tooltip
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
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Star size={14} className="text-secondary" />
                      Observation Breakdown
                    </h3>
                     <div className="h-64 w-full">
                       <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                          <Tooltip
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
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-5 flex items-center gap-2">
                    <BarChart3 size={14} className="text-secondary" />
                    Class Completion Rate
                  </h3>
                   <div className="h-64 w-full">
                     <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                       <BarChart data={classProgress} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }} tickLine={false} axisLine={false} />
                        <Tooltip
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
              </div>
            )}

            {activeTab === 'observations' && (
              <div
                className="space-y-4 animate-in fade-in"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={15} />
                    <input
                      type="text"
                      placeholder="Search observations…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/10 shadow-sm"
                    />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {['All', ...OBS_TYPES_MODULE].map((f) => (
                      <button
                        key={f}
                        onClick={() => setObsFilter(f)}
                        className={cn(
                          "px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all border",
                          obsFilter === f ? 'bg-brand-primary text-surface border-brand-primary shadow-sm' : 'bg-surface text-secondary border-border hover:border-text-secondary'
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-surface rounded-[2rem] border border-border shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
                    <Activity size={14} className="text-secondary" />
                    <span className="text-xs font-black text-secondary uppercase tracking-widest">
                      Observations · {filteredObs.length} record{filteredObs.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="divide-y divide-border">
                      {filteredObs.map((o, i) => {
                        const typeIdx = OBS_TYPES_MODULE.indexOf(o.type);
                        const typeColor = OBS_COLORS_MODULE[typeIdx] || '#1D4D4F';
                        return (
                          <div
                            key={o.id}
                            style={{ animationDelay: `${i * 30}ms` }}
                            className="px-6 py-4 grid grid-cols-12 gap-3 items-center hover:bg-muted/40 transition-all animate-in fade-in slide-in-from-bottom-2"
                          >
                            <div className="col-span-2 font-black text-sm text-primary truncate">{o.student}</div>

                            <div className="col-span-2">
                              <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-widest text-surface" style={{ backgroundColor: typeColor }}>{o.type}</span>
                            </div>

                            <div className="col-span-2">
                              <p className="text-xs font-bold text-primary truncate">{o.class}</p>
                              <p className="text-xs font-black text-secondary">Idx. {o.index}</p>
                            </div>

                            <div className="col-span-3 text-xs font-medium text-secondary italic truncate">"{o.comment}"</div>

                            <div className="col-span-1 text-right text-xs font-bold text-secondary whitespace-nowrap">{o.date}</div>

                            <div className="col-span-1 text-center">
                              {o.status === 'Active'
                                ? <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-xl bg-success/10 text-success border border-success/20 uppercase tracking-widest">
                                    <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" /> Active
                                  </span>
                                : <span className="inline-flex text-xs font-black px-2.5 py-1 rounded-xl bg-muted text-secondary border border-border uppercase tracking-widest">Resolved</span>}
                            </div>

                            <div className="col-span-1 flex items-center justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button onClick={() => navigate(`/grading?subject=${o.type}&class=${encodeURIComponent(o.class)}`)} className="p-1.5 hover:bg-brand-primary/10 rounded-lg transition-all text-secondary hover:text-brand-primary">
                                    <Eye size={14} />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={8}>View class grading sheet</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        );
                      })}

                    {filteredObs.length === 0 && (
                      <div className="py-16 text-center text-muted-foreground text-sm font-medium uppercase tracking-tight">
                        No observations match your filters.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div
                className="space-y-4 animate-in fade-in"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm">
                    <p className="text-xs font-black text-secondary uppercase tracking-widest leading-none mb-1">Total Students</p>
                    <p className="text-xl font-black text-primary">{studentScores.length}</p>
                  </div>
                  <div className="bg-success/10 p-4 rounded-2xl border border-success/20 shadow-sm">
                    <p className="text-xs font-black text-success uppercase tracking-widest leading-none mb-1">Mean Score</p>
                    <p className="text-xl font-black text-success">{meanScore}</p>
                  </div>
                  <div className="bg-warning/10 p-4 rounded-2xl border border-warning/20 shadow-sm">
                    <p className="text-xs font-black text-warning uppercase tracking-widest leading-none mb-1">At Risk (&lt;60)</p>
                    <p className="text-xl font-black text-warning">{atRiskCount}</p>
                  </div>
                  <div className="bg-success/10 p-4 rounded-2xl border border-success/20 shadow-sm">
                    <p className="text-xs font-black text-success uppercase tracking-widest leading-none mb-1">Top Performers (≥80)</p>
                    <p className="text-xl font-black text-success">{topPerformerCount}</p>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={15} />
                  <input
                    type="text"
                    placeholder="Search by student name…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-sm font-medium text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/10 shadow-sm"
                  />
                </div>

                <div className="bg-surface rounded-[2rem] border border-border shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
                    <Users size={14} className="text-secondary" />
                    <span className="text-xs font-black text-secondary uppercase tracking-widest">
                      Student Performance · {filteredStudents.length} entries
                    </span>
                  </div>

                  <div className="px-6 py-2.5 border-b border-border bg-muted grid grid-cols-5 gap-3 text-xs font-black text-secondary uppercase tracking-widest">
                    <span className="col-span-2">Student</span>
                    <span className="text-center">Score</span>
                    <span className="text-center">Grade</span>
                    <span className="text-right">Δ Trend</span>
                  </div>

                  <div className="divide-y divide-border">
                    {filteredStudents.map((s, i) => {
                      const grade = getGradeBand(s.score);
                      const gradeDef = gradeConfig.find(g => g.label === grade);
                      const isAtRisk = s.score < 60;
                      const isTop = s.score >= 80;
                      const scoreColor = isAtRisk ? 'text-danger' : isTop ? 'text-success' : 'text-primary';
                      const trendColor = s.trendUp ? 'text-success' : s.trend === '–' ? 'text-secondary' : 'text-danger';

                      return (
                        <div
                          key={s.student}
                          style={{ animationDelay: `${i * 20}ms` }}
                          className="px-6 py-3.5 grid grid-cols-5 gap-3 items-center hover:bg-muted/40 transition-all animate-in fade-in slide-in-from-bottom-2"
                        >
                          <div className="col-span-2 flex items-center gap-3 min-w-0">
                            <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border",
                              isAtRisk ? 'bg-danger/10 text-danger border-danger/20' : isTop ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-primary border-border'
                            )}>
                              {isAtRisk ? '!' : isTop ? '★' : s.student.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-primary truncate">{s.student}</p>
                              <p className="text-xs font-bold text-secondary">{isAtRisk ? '⚠ Needs intervention' : 'On track'}</p>
                            </div>
                          </div>

                          <div className="text-center">
                            <p className={cn("text-base font-black", scoreColor)}>{s.score}</p>
                          </div>

                          <div className="text-center">
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-widest text-surface"
                              style={{ backgroundColor: gradeDef?.color || '#64748b' }}
                            >
                              {grade}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className={cn("text-xs font-black", trendColor)}>{s.trendUp ? '↑' : s.trend === '–' ? '–' : '↓'} {s.trend}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

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
            )}
        </div>
      </div>
    </TooltipProvider>
  );
}
