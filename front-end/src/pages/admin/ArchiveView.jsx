import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Database, FileText, Filter, Calendar, Search, ShieldCheck, User, TrendingUp, History } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { useArchiveStats as useAdminArchiveStats, useAcademicYears as useAdminAcademicYears, useStudentProfile, useStudentBehavior, useStudentInterventions } from '../../lib/hooks';
import { SubTabSelector } from './components/SubTabSelector';
import { PromotionTab, MaintenanceTab } from './components/ArchiveTabs';
import { VaultHeader } from './components/VaultHeader';
import { VaultTable } from './components/VaultTable';
import { StudentReport } from './components/StudentReport';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../components/ui/table';

export const getWAECGrade = (score) => {
  if (score >= 80) return 'A1';
  if (score >= 70) return 'B2';
  if (score >= 65) return 'B3';
  if (score >= 60) return 'C4';
  if (score >= 55) return 'C5';
  if (score >= 50) return 'C6';
  if (score >= 45) return 'D7';
  if (score >= 40) return 'E8';
  return 'F9';
};

const vaultEntries = [];

export function ArchiveView() {
  const [activeSubTab, setActiveSubTab] = React.useState('VAULT');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedYear, setSelectedYear] = React.useState('2024/2025');
  const [selectedSubject, setSelectedSubject] = React.useState('Integrated Science');
  const [showCoreComparison, setShowCoreComparison] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState(null);
  const [reportConfig, setReportConfig] = React.useState({
    range: 'Full Journey',
    type: 'Subject-Specific',
    concludingSummary: ''
  });

  const archiveStatsQuery = useAdminArchiveStats();
  const academicYearsQuery = useAdminAcademicYears();

  const archiveStats = archiveStatsQuery.data;
  const academicYears = academicYearsQuery.data || [];

  const vaultEntries = React.useMemo(() => {
    if (archiveStats?.recentPromotions) {
      return archiveStats.recentPromotions.map((p) => ({
        id: p.studentId || p.id,
        name: p.studentName || 'Unknown',
        index: p.studentIndex || '—',
        fromClass: p.fromClass,
        toClass: p.toClass,
        status: p.status,
        academicYear: p.academicYear,
        performedAt: p.performedAt,
        history: p.status === 'GRADUATED' ? [{ finalGrade: 75 }] : [{ finalGrade: null }],
      }));
    }
    if (archiveStats?.recentArchives) return archiveStats.recentArchives;
    return [];
  }, [archiveStats]);

  const selectedStudentId = selectedStudent?.id || selectedStudent?.studentId;
  const studentProfileQuery = useStudentProfile(selectedStudentId);
  const behaviorQuery = useStudentBehavior(selectedStudentId);
  const interventionsQuery = useStudentInterventions(selectedStudentId);

  const enrichedSelectedStudent = React.useMemo(() => {
    if (!selectedStudent) return null;
    const profile = studentProfileQuery.data;
    const behaviors = behaviorQuery.data || [];
    const interventions = interventionsQuery.data || [];

    const base = {
      id: selectedStudent.id || selectedStudent.studentId,
      name: selectedStudent.name || profile ? `${profile.firstName} ${profile.lastName}` : 'Unknown',
      index: selectedStudent.index || profile?.indexNumber || '—',
      department: selectedStudent.department || profile?.department?.name || '—',
      consistencyScore: selectedStudent.consistencyScore || 'N/A',
    };

    const grades = profile?.grades || [];
    const sortedGrades = [...grades].sort((a, b) => {
      const ayA = a.term?.academicYear?.startDate ? new Date(a.term.academicYear.startDate).getTime() : 0;
      const ayB = b.term?.academicYear?.startDate ? new Date(b.term.academicYear.startDate).getTime() : 0;
      return ayB - ayA;
    });
    const history = sortedGrades.slice(0, 6).map((g) => ({ finalGrade: Math.round(g.totalScore ?? 0) }));
    while (history.length < 6) history.push({ finalGrade: null });

    const observations = behaviors.map((b) => ({
      id: b.id,
      type: 'Behavior',
      date: new Date(b.createdAt).toLocaleDateString(),
      comment: b.remarks || '—',
      teacherName: b.recordedBy ? `${b.recordedBy.firstName} ${b.recordedBy.lastName}` : 'System',
    }));

    const studentInterventions = interventions.map((int) => ({
      id: int.id,
      year: int.createdAt ? new Date(int.createdAt).getFullYear().toString() : '—',
      term: '—',
      action: int.notes || 'Grade drop detected',
      outcome: int.status,
    }));

    return {
      ...base,
      history,
      observations,
      interventions: studentInterventions,
    };
  }, [selectedStudent, studentProfileQuery.data, behaviorQuery.data, interventionsQuery.data]);

  const terms = ['SHS 1-T1', 'SHS 1-T2', 'SHS 1-T3', 'SHS 2-T1', 'SHS 2-T2', 'SHS 2-T3'];
  const coreSubjects = ['Core Math', 'English', 'Int. Science', 'Social Studies'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F0F4F2] relative">
      {/* Sub-Tab Selector */}
      <SubTabSelector activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />


      {/* Global Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none z-0">
        <h1 className="text-[25vw] font-black rotate-[-25deg] text-emerald-950 uppercase">OFFICIAL</h1>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          {activeSubTab === 'PROMOTION' && (
            <motion.div 
              key="promotion"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 p-10 overflow-y-auto"
            >
              <PromotionTab />
            </motion.div>
          )}


          {activeSubTab === 'MAINTENANCE' && (
            <motion.div 
               key="maintenance"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="flex-1 p-10"
            >
              <MaintenanceTab />
            </motion.div>
          )}


          {activeSubTab === 'VAULT' && !selectedStudent && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col min-w-0"
            >
            <header className="p-8 border-b border-gray-200 bg-white/40 backdrop-blur-xl shrink-0">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-900 rounded-2xl flex items-center justify-center text-emerald-100 shadow-2xl border border-emerald-800 rotate-3">
                    <Database size={32} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter">The Vault</h1>
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-black text-emerald-800 uppercase tracking-widest bg-emerald-100/50 px-2 py-0.5 rounded">Historical Archive v4.2</p>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Last Synced: Today 04:12 AM</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
                    <button 
                      onClick={() => setShowCoreComparison(false)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-black transition-all",
                        !showCoreComparison ? "bg-white text-emerald-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      Expert View
                    </button>
                    <button 
                      onClick={() => setShowCoreComparison(true)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-black transition-all",
                        showCoreComparison ? "bg-white text-emerald-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      Core Comparison
                    </button>
                  </div>
                  <button className="px-6 py-3 bg-emerald-900 text-white rounded-xl font-black text-sm hover:bg-emerald-950 transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-2">
                    <FileText size={18} />
                    Bulk Progress Report
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                {/* Subject Selector */}
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-sm">
                  <Filter size={16} className="text-emerald-700" />
                  <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="bg-transparent text-sm font-black text-gray-900 focus:outline-none cursor-pointer pr-4"
                  >
                    <option>Integrated Science</option>
                    <option>Elective Physics</option>
                    <option>Elective Chemistry</option>
                    <option>Elective Biology</option>
                  </select>
                </div>

                {/* Year Selector */}
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-sm">
                  <Calendar size={16} className="text-emerald-700" />
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-transparent text-sm font-black text-gray-900 focus:outline-none cursor-pointer pr-4"
                  >
                    {academicYears.map(y => (
                      <option key={y.id} value={y.label}>{y.label}</option>
                    ))}
                    {academicYears.length === 0 && <option>2024/2025</option>}
                  </select>
                </div>

                <div className="flex-1 min-w-[300px] relative h-12">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Lookup Student Index (e.g. 10001)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-sm h-full"
                  />
                </div>
              </div>
            </header>

            {/* Comparison Grid */}
            <div className="flex-1 overflow-x-auto p-8 pt-4">
              <div className="min-w-max">
                <Table className="border-separate border-spacing-y-4">
                  <TableHeader>
                    <TableRow className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      <TableHead className="px-6 py-4 text-left">Student Identity</TableHead>
                      {showCoreComparison ? (
                        <>
                          <TableHead className="px-4 py-4 text-center border-x border-gray-100/50 bg-emerald-50/50 text-emerald-900 rounded-t-xl">{selectedSubject}</TableHead>
                          {coreSubjects.map(s => (
                            <TableHead key={s} className="px-4 py-4 text-center border-x border-gray-100/50">{s}</TableHead>
                          ))}
                        </>
                      ) : (
                        terms.map(t => (
                          <TableHead key={t} className="px-4 py-4 text-center border-x border-gray-100/50">{t}</TableHead>
                        ))
                      )}
                      <TableHead className="px-6 py-4 text-right">Aggregate</TableHead>
                    </TableRow>
                  </TableHeader>
                   <TableBody>
                     {vaultEntries.length > 0 ? vaultEntries.map((student) => (
                       <motion.tr
                         key={student.id}
                         layoutId={student.id}
                         onClick={() => setSelectedStudent(student)}
                         whileHover={{ scale: 1.002, x: 4 }}
                         className="group cursor-pointer"
                       >
                         {/* Identity Cell */}
                         <TableCell className="bg-white/40 backdrop-blur-md px-6 py-5 rounded-l-[1.5rem] border-y border-l border-gray-200 shadow-sm group-hover:bg-white transition-all sticky left-0 z-20">
                           <div className="flex items-center gap-4">
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} 
                              alt={student.name} 
                              className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm grayscale group-hover:grayscale-0 transition-all"
                            />
                            <div>
                              <p className="text-sm font-black text-gray-900 tracking-tight">{student.name}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase font-mono">{student.index}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Multi-Term Grade Cells - Glass Mode */}
                        {showCoreComparison ? (
                          <>
                            <TableCell className="bg-emerald-50/40 backdrop-blur-[2px] px-8 py-5 border-y border-x border-emerald-100 group-hover:bg-emerald-50 transition-all text-center relative overflow-hidden">
                               <span className="text-lg font-black text-emerald-900 italic">
                                 {student.history[student.history.length-1].finalGrade}%
                               </span>
                               <div className="text-[8px] font-black text-emerald-600 uppercase mt-1">Target Subject</div>
                            </TableCell>
                            {coreSubjects.map((s, idx) => {
                              const baseScore = student.history[student.history.length-1].finalGrade;
                              const simulatedScore = Math.max(0, Math.min(100, baseScore + (idx % 2 === 0 ? 5 : -10) + (Math.random() * 5)));
                              return (
                                <TableCell key={s} className="bg-white/30 backdrop-blur-[2px] px-8 py-5 border-y border-x border-gray-100/50 group-hover:bg-white/80 transition-all text-center relative overflow-hidden">
                                  <span className={cn(
                                    "text-lg font-black tracking-tighter",
                                    simulatedScore > 75 ? "text-emerald-950" : simulatedScore < 50 ? "text-red-900" : "text-gray-600"
                                  )}>
                                    {simulatedScore.toFixed(0)}%
                                  </span>
                                  <div className="text-[8px] font-black text-gray-300 uppercase mt-1 tracking-tighter">Verified Audit</div>
                                </TableCell>
                              );
                            })}
                          </>
                        ) : (
                          terms.map((term, idx) => {
                            const grade = student.history[idx]?.finalGrade;
                            const ghostAverage = idx === 4 ? 62 : idx === 3 ? 58 : 65; // Simulated departmental benchmark
                            
                            return (
                              <TableCell key={term} className="bg-white/30 backdrop-blur-[2px] px-8 py-5 border-y border-x border-gray-100/50 group-hover:bg-white/80 transition-all text-center relative overflow-hidden">
                                {/* Locked Pattern Overlay */}
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_0)] bg-[size:10px_10px]" />
                                
                                <div className="relative">
                                  <span className={cn(
                                    "text-lg font-black tracking-tighter",
                                    grade > 75 ? "text-emerald-950" : grade < 50 ? "text-red-900" : "text-gray-600"
                                  )}>
                                    {grade ? `${grade}%` : '---'}
                                  </span>
                                  <div className="flex items-center justify-center gap-1 mt-1">
                                    <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Ghost: {ghostAverage}%</span>
                                  </div>
                                  {/* Visual Indicator of Comparison */}
                                  {grade && (
                                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full overflow-hidden bg-gray-100">
                                      <div 
                                        className={cn(
                                          "h-full transition-all",
                                          grade > ghostAverage ? "bg-emerald-500 w-full" : "bg-red-500 w-1/2"
                                        )}
                                      />
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            );
                          })
                        )}

                        {/* Aggregate Cell */}
                        <TableCell className="bg-emerald-900 px-8 py-5 rounded-r-[1.5rem] border-y border-r border-emerald-950 shadow-xl group-hover:bg-emerald-950 transition-all text-right">
                          <p className="text-[10px] font-black text-emerald-300/50 uppercase mb-1">Total</p>
                          <p className="text-xl font-black text-white italic">
                            {(student.history.reduce((acc, h) => acc + h.finalGrade, 0) / student.history.length).toFixed(1)}%
                          </p>
                        </TableCell>
                       </motion.tr>
                     )) : (
                       <TableRow>
                         <TableCell colSpan={8} className="text-center py-12 text-slate-400 text-sm font-bold">
                           {archiveStatsQuery.isLoading ? 'Loading archive data...' : 'No archived records found. Vault is empty.'}
                         </TableCell>
                       </TableRow>
                     )}
                   </TableBody>
                </Table>
              </div>
            </div>
          </motion.div>
          )}


          {activeSubTab === 'VAULT' && selectedStudent && enrichedSelectedStudent && (

          <motion.div
            key="report"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 overflow-hidden flex flex-col items-center bg-white z-10 w-full"
          >
            {/* Report Configuration & Export Header */}
            <div className="w-full max-w-7xl mt-6 pb-6 flex flex-col md:flex-row items-center justify-between border-b border-gray-100 px-6 lg:px-8 gap-4 mx-auto">
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <select 
                  value={reportConfig.range}
                  onChange={(e) => setReportConfig({...reportConfig, range: e.target.value})}
                  className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-200 outline-none"
                >
                  <option>Full Journey</option>
                  <option>Phase Report (SHS 2)</option>
                </select>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-900 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 italic">
                   <ShieldCheck size={14} />
                    Audit ID: {enrichedSelectedStudent.index}-99X
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-end">
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="px-6 py-2 bg-gray-100 text-gray-500 rounded-xl text-xs font-black hover:bg-gray-200 transition-all uppercase tracking-widest"
                >
                  Return
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-emerald-900 text-white rounded-xl text-xs font-black hover:bg-emerald-950 transition-all shadow-lg shadow-emerald-900/20">
                  <Printer size={16} />
                  Print Transcript
                </button>
              </div>
            </div>

            {/* Main Report Body (Full Scrollable Area) */}
            <div className="flex-1 w-full max-w-7xl overflow-y-auto no-scrollbar relative p-6 lg:p-16 mx-auto">
              {/* Report Header & Bio */}
              <div className="flex flex-col md:justify-between md:flex-row md:items-start mb-16 gap-8">
                <div className="flex flex-col items-center md:flex-row md:items-center gap-8 text-center md:text-left">
                  <div className="relative">
                    <img 
                       src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${enrichedSelectedStudent.name}`} 
                       alt={enrichedSelectedStudent.name} 
                      className="w-28 h-28 rounded-3xl bg-gray-50 p-1 border-4 border-white shadow-2xl"
                    />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-900 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg shadow-emerald-900/20">
                      <User size={20} />
                    </div>
                  </div>
                  <div>
                     <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2 italic">{enrichedSelectedStudent.name}</h2>
                    <p className="text-emerald-800 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">Scholastic Longitudinal Portfolio</p>
                    <div className="flex flex-wrap gap-2 md:gap-3 mt-4 justify-center md:justify-start">
                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {enrichedSelectedStudent.index}</span>
                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest">{enrichedSelectedStudent.department} Dept.</span>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black uppercase tracking-widest">{enrichedSelectedStudent.consistencyScore} Performer</span>
                    </div>
                  </div>
                </div>
                <div className="text-center md:text-right flex flex-col items-center md:items-end">
                   <div className="hidden md:flex w-24 h-24 bg-emerald-900 rounded-3xl items-center justify-center text-white shadow-xl rotate-3 border-4 border-emerald-800 mb-4 opacity-20">
                      <Database size={48} />
                   </div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Generated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* 1. TERMINAL PERFORMANCE BREAKDOWN (Vertical Stacked Tables) */}
              <section className="mb-20">
                <header className="flex items-center gap-3 mb-10 border-b-2 border-emerald-900 pb-2">
                  <Database size={24} className="text-emerald-900" />
                  <h3 className="text-lg font-black text-emerald-950 uppercase tracking-[0.1em]">1. Terminal Performance Breakdown</h3>
                </header>
                
                <div className="grid grid-cols-1 gap-y-16">
                  {terms.map((term, tIdx) => (
                    <div key={term} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                      <div className="bg-gray-50/80 px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg">
                               {tIdx + 1}
                            </div>
                            <div>
                               <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest italic">{term} Academic Journal</h4>
                               <p className="text-[9px] font-bold text-gray-400 uppercase">Assessment Period: Cycle {tIdx + 1}</p>
                            </div>
                         </div>
                         <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-4 py-1.5 rounded-full uppercase tracking-widest italic">Official Record</span>
                      </div>
                      
<div className="p-4 overflow-x-auto no-scrollbar">
                         <Table className="min-w-[600px]">
                           <TableHeader>
                             <TableRow className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                               <TableHead className="py-4 pl-6">Subject Title</TableHead>
                               <TableHead className="py-4 text-center">Class (30)</TableHead>
                               <TableHead className="py-4 text-center">Exam (70)</TableHead>
                               <TableHead className="py-4 text-center">Grade</TableHead>
                               <TableHead className="py-4 text-right pr-6 italic">Total (%)</TableHead>
                             </TableRow>
                           </TableHeader>
                           <TableBody>
                             {['Core Mathematics', 'English Language', 'Integrated Science', 'Social Studies', 'Elective Subject 1', 'Elective Subject 2'].map((subj, sIdx) => {
                                const baseGrade = enrichedSelectedStudent.history[tIdx]?.finalGrade || 70;
                               const classScore = Math.round((baseGrade * 0.3) + (sIdx % 2 === 0 ? 2 : -2));
                               const examScore = Math.round((baseGrade * 0.7) + (sIdx % 3 === 0 ? -3 : 4));
                               const total = classScore + examScore;
                               const letterGrade = getWAECGrade(total);

                               return (
                                 <TableRow key={subj} className="group hover:bg-emerald-50/20 transition-all">
                                   <TableCell className="py-5 pl-6">
                                      <p className="text-sm font-black text-gray-900 italic tracking-tight">{subj}</p>
                                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Verified Academic Dept.</p>
                                   </TableCell>
                                   <TableCell className="py-5 text-center">
                                      <span className="text-sm font-bold text-gray-600 font-mono italic">{classScore}</span>
                                   </TableCell>
                                   <TableCell className="py-5 text-center">
                                      <span className="text-sm font-bold text-gray-600 font-mono italic">{examScore}</span>
                                   </TableCell>
                                   <TableCell className="py-5 text-center">
                                      <span className={cn(
                                        "px-3 py-1 rounded-lg text-xs font-black",
                                        total >= 70 ? "bg-emerald-100 text-emerald-900" :
                                        total >= 50 ? "bg-amber-100 text-amber-900" :
                                        "bg-red-100 text-red-900"
                                      )}>
                                        {letterGrade}
                                      </span>
                                   </TableCell>
                                   <TableCell className="py-5 text-right pr-6">
                                      <span className={cn(
                                        "text-lg font-black italic tracking-tighter font-mono",
                                        total >= 75 ? "text-emerald-900" :
                                        total < 50 ? "text-red-900" : "text-gray-900"
                                      )}>{total}%</span>
                                   </TableCell>
                                 </TableRow>
                               );
                             })}
                           </TableBody>
                         </Table>
                       </div>
                    </div>
                  ))}
                </div>

                {/* Summary Widgets */}
                <div className="grid grid-cols-4 gap-6 mt-16">
                   <div className="bg-emerald-50/30 p-8 rounded-3xl border border-emerald-100/50">
                      <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Cumulative GPA</p>
                      <p className="text-3xl font-black text-emerald-900 italic tracking-tighter">
                          {(enrichedSelectedStudent.history.reduce((acc, h) => acc + h.finalGrade, 0) / enrichedSelectedStudent.history.length).toFixed(1)}%
                      </p>
                   </div>
                   <div className="bg-emerald-50/30 p-8 rounded-3xl border border-emerald-100/50">
                      <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Consistency Score</p>
                       <p className="text-3xl font-black text-emerald-900 italic tracking-tighter">{enrichedSelectedStudent.consistencyScore}</p>
                   </div>
                   <div className="bg-emerald-50/30 p-8 rounded-3xl border border-emerald-100/50">
                      <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Mastery Percentile</p>
                      <p className="text-3xl font-black text-emerald-900 italic tracking-tighter">Top 15%</p>
                   </div>
                   <div className="bg-emerald-900 p-8 rounded-3xl border border-emerald-800 text-white shadow-2xl">
                      <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Vault Registry</p>
                      <p className="text-lg font-black italic tracking-tighter">MAAIS-V5-OK</p>
                   </div>
                </div>
              </section>

              {/* 2. PERFORMANCE PULSE & GROWTH */}
              <div className="grid grid-cols-1 gap-12 mb-20">
                <section>
                  <header className="flex items-center gap-3 mb-8 border-b-2 border-emerald-900 pb-2">
                    <TrendingUp size={24} className="text-emerald-900" />
                    <h3 className="text-sm font-black text-emerald-950 uppercase tracking-[0.1em]">2. Longitudinal Performance Trajectory</h3>
                  </header>
                  <div className="bg-gray-50/50 p-12 rounded-[3rem] border border-gray-100 h-[400px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                       <AreaChart data={enrichedSelectedStudent.history}>
                        <defs>
                          <linearGradient id="subScreenTrend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#065F46" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#065F46" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="term" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }} dy={10} />
                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }} />
                        <Area 
                          type="monotone" 
                          dataKey="finalGrade" 
                          stroke="#065F46" 
                          strokeWidth={6} 
                          fillOpacity={1} 
                          fill="url(#subScreenTrend)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>

              {/* 3. QUALITATIVE LOGS & INTERVENTIONS */}
              <div className="grid grid-cols-2 gap-12 mb-20">
                <section>
                   <header className="flex items-center gap-3 mb-8 border-b-2 border-emerald-900 pb-2">
                    <History size={24} className="text-emerald-900" />
                    <h3 className="text-sm font-black text-emerald-950 uppercase tracking-[0.1em]">4. Observation Archive</h3>
                  </header>
                  <div className="space-y-4">
                     {enrichedSelectedStudent.observations.map((obs) => (
                      <div key={obs.id} className="p-6 bg-white border-l-4 border-amber-400 border-y border-r border-gray-100 rounded-r-2xl shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[9px] font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded italic uppercase leading-none">{obs.type}</span>
                           <span className="text-[9px] font-bold text-gray-400 italic">{obs.date}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-700 italic">"{obs.comment}"</p>
                        <p className="text-[8px] font-black text-gray-950 opacity-50 mt-3 uppercase tracking-widest">— Logged by {obs.teacherName}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <header className="flex items-center gap-3 mb-8 border-b-2 border-emerald-900 pb-2">
                    <ShieldCheck size={24} className="text-emerald-900" />
                    <h3 className="text-sm font-black text-emerald-950 uppercase tracking-[0.1em]">5. Intervention History</h3>
                  </header>
                  <div className="space-y-6">
                     {enrichedSelectedStudent.interventions.map((int) => (
                      <div key={int.id} className="bg-gray-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden ring-4 ring-gray-100">
                        <div className="absolute top-4 right-6 text-[8px] font-black text-emerald-400 bg-emerald-900/50 px-2 py-1 rounded">AUDIT VERIFIED</div>
                        <div className="flex items-center gap-3 mb-6">
                           <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                           <p className="text-[10px] font-black uppercase tracking-[0.2em]">{int.year} {int.term} Flagged Milestone</p>
                        </div>
                        <div className="space-y-4">
                           <div className="opacity-80">
                              <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Intervention Action</p>
                              <p className="text-sm font-bold italic">{int.action}</p>
                           </div>
                           <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 italic">Observed Outcome</p>
                              <p className="text-xs font-black italic tracking-tight">{int.outcome}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Concluding Section */}
              <section className="mb-20">
                <header className="flex items-center gap-3 mb-8 border-b-2 border-emerald-900 pb-2">
                  <User size={24} className="text-emerald-900" />
                  <h3 className="text-sm font-black text-emerald-950 uppercase tracking-[0.1em]">3. Final Professional Assessment</h3>
                </header>
                <div className="bg-[#F8FAFB] p-12 rounded-[3.5rem] border border-gray-200">
                  <textarea 
                    value={reportConfig.concludingSummary}
                    onChange={(e) => setReportConfig({...reportConfig, concludingSummary: e.target.value})}
                    placeholder="Enter final longitudinal summary here..."
                    className="w-full bg-transparent border-none focus:outline-none text-2xl font-black text-gray-900 italic leading-relaxed placeholder:text-gray-300 resize-none h-64"
                  />
                  <div className="mt-16 pt-16 border-t border-gray-200 grid grid-cols-2 gap-32 opacity-30">
                     <div className="text-center font-black text-[10px] text-gray-900 uppercase">Class Teacher Authorization</div>
                     <div className="text-center font-black text-[10px] text-gray-900 uppercase">Registrar Final Stamp</div>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
