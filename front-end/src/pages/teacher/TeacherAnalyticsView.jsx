import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell,
  Legend
} from 'recharts';
import {
  Star, GraduationCap, Users, BarChart3, AlertTriangle, TrendingUp,
  Search, X, Plus, FileText, Activity, Eye
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import mockTeacherService from '../../services/mockTeacherService';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';

const OBS_TYPES = ['Behavioral', 'Academic', 'Lab Safety', 'Collaboration', 'Punctuality'];
const OBS_COLORS = ['hsl(222 47% 11%)', 'hsl(38 92% 50%)', 'hsl(0 84% 60%)', 'hsl(243 70% 59%)', 'hsl(162 78% 41%)'];
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
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const obsData = await mockTeacherService.getAnalytics(user.id);
        const gradeCfg = await mockTeacherService.getGradeConfig();
        
        setObservations(obsData.observations || []);
        setClassProgress(obsData.classProgress || FALLBACK_CLASS_PROGRESS);
        setStudentScores(obsData.studentScores || FALLBACK_STUDENT_SCORES);
        setTermTrends(obsData.termTrends || []);
        setGradeConfig(gradeCfg || []);
      } catch (err) {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user?.id]);

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
    gradeConfig.map((g) => ({
      label: g.label,
      count: studentScores.filter(s => getGradeBand(s.score) === g.label).length,
      fill: g.color,
    })),
    [studentScores, gradeConfig]
  );

  const obsTypePieData = useMemo(() => {
    return OBS_TYPES.map((t, i) => ({
      name: t,
      value: observations.filter(o => o.type === t).length,
      fill: OBS_COLORS[i],
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
      { label: 'At-Risk Students', value: safeScores.filter(s => (s.score || 0) < 60).length, icon: AlertTriangle, color: 'bg-destructive/10 text-destructive border-destructive/20', delta: 'Score below 60' },
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
    <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 lg:p-10 select-none">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">

        {/* ====== HEADER ====== */}
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-none">
            Performance Analytics
          </h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2 flex items-center gap-1.5">
            <Eye size={10} className="text-muted-foreground" />
            Grade Insights · Observation Trends · At-Risk Flags
          </p>
        </header>

        {/* ====== STAT SNAPSHOT ====== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card p-5 rounded-2xl border border-border/60 shadow-sm flex items-center gap-4"
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border", s.color)}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{s.label}</p>
                <p className="text-2xl font-black text-foreground leading-none">{s.value}</p>
                <p className="text-[9px] font-bold text-muted-foreground mt-1">{s.delta}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ====== TABS ====== */}
        <div className="flex bg-card rounded-2xl border border-border/60 shadow-sm p-1 mb-6 w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id);
                setSearchQuery('');
                setObsFilter('All');
              }}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === t.id
                  ? 'bg-brand-primary text-primary-foreground shadow-md shadow-brand-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ====== TAB CONTENT ====== */}
        <AnimatePresence mode="wait">

          {/* ── TAB: OVERVIEW ── */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Term Trend Line Chart */}
              <Card className="p-6 lg:p-8">
                <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest mb-5 flex items-center gap-2">
                  <TrendingUp size={14} className="text-muted-foreground" />
                  Term Score Trend · Class Average
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={termTrends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 16% 95%)" />
                      <XAxis dataKey="term" tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)', fontWeight: 700 }} tickLine={false} axisLine={false} />
                      <YAxis domain={[60, 90]} tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)', fontWeight: 700 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ fontSize: 11, fontWeight: 700, borderRadius: 12, border: '1px solid hsl(214 32% 91%)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                        formatter={(val, label) => [val, label]}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                      <Line type="monotone" dataKey="avg" name="Class Avg" stroke="hsl(222 47% 11%)" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(222 47% 11%)' }} activeDot={{ r: 7 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Grade Distribution + Observations Pie */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grade distribution */}
                <Card className="p-6 lg:p-8">
                  <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <GraduationCap size={14} className="text-muted-foreground" />
                    Grade Distribution
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={gradeDist} margin={{ top: 10, right: 20, left: -10, bottom: 0 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 16% 95%)" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)', fontWeight: 700 }} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)', fontWeight: 700 }} tickLine={false} axisLine={false} width={36} />
                        <Tooltip
                          contentStyle={{ fontSize: 11, fontWeight: 700, borderRadius: 12, border: '1px solid hsl(214 32% 91%)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
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
                </Card>

                {/* Observation type breakdown */}
                <Card className="p-6 lg:p-8">
                  <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Star size={14} className="text-muted-foreground" />
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
                        <Tooltip
                          contentStyle={{ fontSize: 11, fontWeight: 700, borderRadius: 12, border: '1px solid hsl(214 32% 91%)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                          formatter={(val) => [val, 'Records']}
                        />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Class performance bar chart */}
              <Card className="p-6 lg:p-8">
                <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest mb-5 flex items-center gap-2">
                  <BarChart3 size={14} className="text-muted-foreground" />
                  Class Completion Rate
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classProgress} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 16% 95%)" vertical={false} />
                      <XAxis dataKey="subject" tick={{ fontSize: 10, fill: 'hsl(215 16% 47%)', fontWeight: 700 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)', fontWeight: 700 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ fontSize: 11, fontWeight: 700, borderRadius: 12, border: '1px solid hsl(214 32% 91%)', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                        formatter={(val, name) => [`${val}`, name === 'meanAvg' ? 'Avg Score' : 'Completion']}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                      <Bar dataKey="avgScore" name="Avg Score (%)" fill="hsl(222 47% 11%)" radius={[5, 5, 0, 0]} />
                      <Bar dataKey="completions" name="Graded Count" fill="hsl(162 78% 41%)" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── TAB: OBSERVATIONS ── */}
          {activeTab === 'observations' && (
            <motion.div
              key="observations"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Search + filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                  <input
                    type="text"
                    placeholder="Search observations…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[12px] font-medium text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-900/10 shadow-sm"
                  />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {['All', ...OBS_TYPES].map((f) => (
                    <button
                      key={f}
                      onClick={() => setObsFilter(f)}
                      className={cn(
                        "px-3.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border",
                        obsFilter === f ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center gap-3">
                  <Activity size={14} className="text-gray-400" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Observations · {filteredObs.length} record{filteredObs.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {filteredObs.map((o, i) => {
                    const typeIdx = OBS_TYPES.indexOf(o.type);
                    const typeColor = OBS_COLORS[typeIdx] || '#1D4D4F';
                    return (
                      <motion.div
                        key={o.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 hover:bg-gray-50/40 transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest text-white" style={{ backgroundColor: typeColor }}>
                              {o.type}
                            </span>
                            <span className="text-[9px] font-black text-gray-400 uppercase">{o.date}</span>
                            {o.status === 'resolved' && (
                              <span className="text-[8px] font-black px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 uppercase tracking-widest">Resolved</span>
                            )}
                          </div>
                          <p className="text-sm font-black text-gray-900">{o.student}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-0.5">{o.index} · {o.class}</p>
                          <p className="text-[11px] font-medium text-gray-600 mt-2 italic leading-relaxed">"{o.comment}"</p>
                        </div>
                        <button
                          className="px-4 py-2 bg-emerald-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-sm shrink-0 flex items-center gap-2"
                          onClick={() => navigate(`/grading?subject=${o.type}&class=${encodeURIComponent(o.class)}`)}
                        >
                          <Eye size={12} /> View Class
                        </button>
                      </motion.div>
                    );
                  })}

                  {filteredObs.length === 0 && (
                    <div className="py-16 text-center text-gray-400 text-sm font-medium uppercase tracking-tight">
                      No matching observations found.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TAB: STUDENT TRENDS ── */}
          {activeTab === 'students' && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Summary pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Total Students</p>
                  <p className="text-xl font-black text-gray-900">{studentScores.length}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Mean Score</p>
                  <p className="text-xl font-black text-emerald-800">{meanScore}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm">
                  <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">At Risk (&lt;60)</p>
                  <p className="text-xl font-black text-amber-700">{atRiskCount}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                  <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest leading-none mb-1">Top Performers (≥80)</p>
                  <p className="text-xl font-black text-emerald-800">{topPerformerCount}</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                <input
                  type="text"
                  placeholder="Search by student name…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[12px] font-medium text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-900/10 shadow-sm"
                />
              </div>

              {/* Student table */}
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center gap-3">
                  <Users size={14} className="text-gray-400" />
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Student Performance · {filteredStudents.length} entries
                  </span>
                </div>

                {/* Column header */}
                <div className="px-6 py-2.5 border-b border-gray-50 grid grid-cols-5 gap-3 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                  <span className="col-span-2">Student</span>
                  <span className="text-center">Score</span>
                  <span className="text-center">Grade</span>
                  <span className="text-right">Δ Trend</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {filteredStudents.map((s, i) => {
                    const grade = getGradeBand(s.score);
                    const gradeDef = gradeConfig.find(g => g.label === grade);
                    const isAtRisk = s.score < 60;
                    const isTop = s.score >= 80;
                    const scoreColor = isAtRisk ? 'text-rose-600' : isTop ? 'text-emerald-600' : 'text-gray-900';
                    const trendColor = s.trendUp ? 'text-emerald-600' : s.trend === '–' ? 'text-gray-300' : 'text-rose-500';

                    return (
                      <motion.div
                        key={s.student}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="px-6 py-3.5 grid grid-cols-5 gap-3 items-center hover:bg-gray-50/30 transition-all"
                      >
                        <div className="col-span-2 flex items-center gap-3 min-w-0">
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0",
                            isAtRisk ? 'bg-rose-50 text-rose-600 border border-rose-100' : isTop ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-50 text-gray-700 border border-gray-100'
                          )}>
                            {isAtRisk ? '!' : isTop ? '★' : s.student.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-gray-900 truncate">{s.student}</p>
                            <p className="text-[9px] font-bold text-gray-400">{isAtRisk ? '⚠ Needs intervention' : 'On track'}</p>
                          </div>
                        </div>

                        <div className="text-center">
                          <p className={cn("text-base font-black", scoreColor)}>{s.score}</p>
                        </div>

                        <div className="text-center">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white"
                            style={{ backgroundColor: gradeDef?.color || '#64748b' }}
                          >
                            {grade}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className={cn("text-[10px] font-black", trendColor)}>{s.trendUp ? '↑' : s.trend === '–' ? '–' : '↓'} {s.trend}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* At-risk highlight */}
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-rose-800 uppercase tracking-widest mb-1">At-Risk Alert</p>
                  <p className="text-xs font-medium text-rose-700 leading-relaxed">
                    {studentScores.filter(s => (s.score || 0) < 60).map(s => s.student).join(', ') || 'None'} — Score below 60 threshold.
                    <span className="font-black"> Schedule intervention.</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}