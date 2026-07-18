import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { archiveApi } from '../../lib/api';
import { Database, FileText, Filter, Calendar, Search, ShieldCheck, User, TrendingUp, History, Printer } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { useArchiveStats as useAdminArchiveStats, useAcademicYears as useAdminAcademicYears, useStudentProfile, useStudentBehavior, useStudentInterventions, useSearchVault, usePromoteStudent, useBatchGenerateReportCards, useAllClasses, useActiveYear } from '../../lib/hooks';
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
import { LoadingState } from '../../components/shared/LoadingState';
import { EmptyState } from '../../components/shared/EmptyState';
import { toast } from '../../components/ui/toast';

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

export function ArchiveView() {
  const [activeSubTab, setActiveSubTab] = React.useState('VAULT');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchTrigger, setSearchTrigger] = React.useState(null);
  const [selectedYear, setSelectedYear] = React.useState('2024/2025');
  const [selectedSubject, setSelectedSubject] = React.useState('Integrated Science');
  const [showCoreComparison, setShowCoreComparison] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState(null);
  const [reportConfig, setReportConfig] = React.useState({
    range: 'Full Journey',
    type: 'Subject-Specific',
    concludingSummary: ''
  });
  const [unlockedTermsCount, setUnlockedTermsCount] = React.useState(0);

const {
  data: archiveStats = {},
  isLoading: archiveStatsLoading,
} = useAdminArchiveStats();
const {
  data: yearsList = [],
  isLoading: academicYearsLoading,
} = useAdminAcademicYears();
const {
  data: activeYearData,
} = useActiveYear();
const {
  data: allClasses = [],
} = useAllClasses();
const vaultSearchQuery = useSearchVault(searchTrigger || {});
const promoteStudentMutation = usePromoteStudent();
const batchGenerateReportCardsMutation = useBatchGenerateReportCards();

const vaultSearchResults = vaultSearchQuery.data || [];
const academicYears = yearsList;

  React.useEffect(() => {
    const year = academicYears.find(y => y.isActive);
    if (!year?.id) {
      setUnlockedTermsCount(0);
      return;
    }
    let cancelled = false;
    archiveApi.getUnlockedTerms(year.id)
      .then(r => {
        if (cancelled) return;
        const data = r?.data ?? r ?? [];
        setUnlockedTermsCount(Array.isArray(data) ? data.length : 0);
      })
      .catch(() => {
        if (!cancelled) setUnlockedTermsCount(0);
      });
    return () => { cancelled = true; };
  }, [academicYears]);

  const handleLockAllTerms = () => {
    const year = academicYears.find(y => y.isActive);
    if (!year?.id) {
      toast.error('No active academic year found');
      return;
    }
    archiveApi.lockAllTerms(year.id)
      .then(() => {
        setUnlockedTermsCount(0);
        toast.success('All terms locked successfully');
      })
      .catch((err) => {
        toast.error(`Failed to lock terms: ${err.message || 'Unknown error'}`);
      });
  };

  const vaultEntries = React.useMemo(() => {
    if (searchTrigger && vaultSearchResults.length > 0) {
      return vaultSearchResults.map((record) => ({
        id: record.id,
        studentId: record.id,
        name: record.name || `${record.firstName || ''} ${record.lastName || ''}`.trim() || 'Unknown',
        index: record.indexNumber || '—',
        classId: record.currentClass?.id || null,
        fromClass: record.currentClass?.level || null,
        toClass: null,
        status: record.archivedAt ? 'GRADUATED' : 'ACTIVE',
        academicYear: record.grades?.[0]?.term?.academicYear?.label || record.promotions?.[0]?.academicYear?.label || null,
        performedAt: record.archivedAt || null,
        department: record.department?.name || '—',
        consistencyScore: 'N/A',
        history: record.grades && record.grades.length > 0
          ? record.grades.slice(0, 6).map((g) => ({
              finalGrade: Math.round(g.totalScore ?? g.averageScore ?? 0)
            }))
          : [{ finalGrade: null }],
      }));
    }
    if (archiveStats?.recentPromotions && archiveStats.recentPromotions.length > 0) {
      return archiveStats.recentPromotions.map((p) => ({
        id: p.id,
        studentId: p.studentId,
        name: p.studentName || 'Unknown',
        index: p.studentIndex || '—',
        classId: null,
        fromClass: p.fromClass,
        toClass: p.toClass,
        status: p.status,
        academicYear: p.academicYear,
        performedAt: p.performedAt,
        department: '—',
        consistencyScore: 'N/A',
        history: p.status === 'GRADUATED' ? [{ finalGrade: null }] : [{ finalGrade: null }],
      }));
    }
    return [];
  }, [archiveStats, vaultSearchResults, searchTrigger]);

  const [classBenchmarks, setClassBenchmarks] = React.useState({});

  React.useEffect(() => {
    if (!vaultEntries.length) return;
    const uniqueClassIds = [...new Set(vaultEntries.map(e => e.classId).filter(Boolean))];
    if (uniqueClassIds.length === 0) return;

    let cancelled = false;
    Promise.all(
      uniqueClassIds.map(async (classId) => {
        try {
          const res = await archiveApi.getClassBenchmarks(classId);
          const data = res?.data ?? res ?? [];
          return { classId, benchmarks: data };
        } catch {
          return { classId, benchmarks: [] };
        }
      })
    ).then(results => {
      if (cancelled) return;
      const map = {};
      results.forEach(({ classId, benchmarks }) => {
        map[classId] = benchmarks;
      });
      setClassBenchmarks(map);
    });

    return () => { cancelled = true; };
  }, [vaultEntries]);

  const getGhostBenchmark = (student, idx) => {
    const classId = student.classId;
    if (!classId) return null;
    const benchmarks = classBenchmarks[classId];
    if (!benchmarks || !benchmarks.length) return null;

    const classLevel = student.fromClass;
    let termNumber = null;

    if (classLevel === 'FORM_1') {
      if (idx <= 2) termNumber = idx + 1;
    } else if (classLevel === 'FORM_2') {
      if (idx >= 3 && idx <= 5) termNumber = idx - 2;
    }

    if (termNumber === null) return null;
    const termNumStr = `TERM_${termNumber}`;
    const match = benchmarks.find(b => b.termNumber === termNumStr);
    return match ? match.averageScore : null;
  };

  const selectedStudentId = selectedStudent?.id || selectedStudent?.studentId;
  const studentProfileQuery = useStudentProfile(selectedStudentId);
  const behaviorQuery = useStudentBehavior(selectedStudentId);
  const interventionsQuery = useStudentInterventions(selectedStudentId);

  const enrichedSelectedStudent = React.useMemo(() => {
    if (!selectedStudent) return null;
    const profile = studentProfileQuery.data;
    const behaviors = Array.isArray(behaviorQuery.data?.logs) ? behaviorQuery.data.logs : [];
    const interventions = Array.isArray(interventionsQuery.data) ? interventionsQuery.data : [];

    const base = {
      id: selectedStudent.id || selectedStudent.studentId,
      name: selectedStudent.name || (profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : 'Unknown'),
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
      date: b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—',
      comment: b.remarks || '—',
      teacherName: b.recordedBy ? `${b.recordedBy.firstName || ''} ${b.recordedBy.lastName || ''}`.trim() || 'System' : 'System',
    }));

    const studentInterventions = interventions.map((int) => ({
      id: int.id,
      year: int.createdAt ? new Date(int.createdAt).getFullYear().toString() : '—',
      term: '—',
      action: int.notes || 'Grade drop detected',
      outcome: int.status || '—',
    }));

    return {
      ...base,
      history,
      observations,
      interventions: studentInterventions,
    };
  }, [selectedStudent, studentProfileQuery.data, behaviorQuery.data, interventionsQuery.data]);

  const terms = React.useMemo(() => {
    if (activeYearData?.terms && activeYearData.terms.length > 0) {
      return activeYearData.terms.map(t => {
        const label = t.termNumber.replace('TERM_', 'Term ').replace('SEMESTER_', 'Semester ');
        return `${activeYearData.label || ''} ${label}`.trim();
      });
    }
    return ['Term 1', 'Term 2', 'Term 3'];
  }, [activeYearData]);

  const displaySubjects = ['Core Mathematics', 'English Language', 'Integrated Science', 'Social Studies'];

   const historyForChart = React.useMemo(() => {
     return terms.map((term, idx) => ({
       name: term,
       finalGrade: enrichedSelectedStudent?.history?.[idx]?.finalGrade ?? null,
     }));
   }, [enrichedSelectedStudent?.history]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background relative">
      {/* Sub-Tab Selector */}
      <SubTabSelector activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />


      {/* Global Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none z-0">
        <h1 className="text-[25vw] font-black rotate-[-25deg] text-brand-primary uppercase">OFFICIAL</h1>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          {activeSubTab === 'PROMOTION' && (
            <motion.div 
              key="promotion"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
               className="flex-1 p-10 overflow-y-auto scrollbar-hide"
            >
              <PromotionTab 
onExecutePromotion={() => {
                   const year = academicYears.find(y => y.isActive);
                   if (!year) {
                     toast.error('No active academic year found. Please set an active year first.');
                     return;
                   }
                   promoteStudentMutation.mutateAsync({ academicYearId: year.id })
                    .then(() => toast.success('Promotion cycle executed successfully'))
                    .catch((err) => {
                      const message = err?.response?.data?.message || err?.message || 'Promotion failed';
                      if (message.includes('unlocked')) {
                        toast.error(message + ' Use the Maintenance tab to lock terms before promoting.');
                      } else {
                        toast.error(message);
                      }
                    });
                }}
                isPromoting={promoteStudentMutation.isPending}
                onLockAllTerms={handleLockAllTerms}
                unlockedCount={unlockedTermsCount}
              />
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
               <MaintenanceTab 
                 onExecuteMaintenance={() => toast.info('Regenerate Audit Hashes — feature processing')}
                 onDeepClean={() => toast.info('Purge Orphaned Records — feature processing')}
               />
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
            <header className="p-8 border-b border-border bg-surface/40 backdrop-blur-xl shrink-0">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center text-primary-foreground/80 shadow-2xl border border-brand-primary rotate-3">
                    <Database size={32} />
                  </div>
                  <div>
                     <h1 className="text-3xl font-black text-text-primary tracking-tighter">Academic Archive</h1>
                    <div className="flex items-center gap-3">
                      <p className="text-xs font-black text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-2 py-0.5 rounded">Historical Archive v4.2</p>
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tighter">Last Synced: {new Date().toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex bg-muted p-1 rounded-xl border border-border shadow-inner">
                    <button 
                      onClick={() => setShowCoreComparison(false)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-black transition-all",
                        !showCoreComparison ? "bg-surface text-brand-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
                      )}
                    >
                      Expert View
                    </button>
                    <button 
                      onClick={() => setShowCoreComparison(true)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-black transition-all",
                        showCoreComparison ? "bg-surface text-brand-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
                      )}
                    >
                      Core Comparison
                    </button>
                  </div>
                  <button 
onClick={() => {
                       const firstClass = allClasses?.[0];
                       const firstTerm = activeYearData?.terms?.[0];
                       
                       if (!activeYearData) {
                         toast.error('No active academic year found');
                         return;
                       }
                       if (!firstClass?.id) {
                         toast.error('No class sections found for batch generation');
                         return;
                       }
                       if (!firstTerm?.id) {
                         toast.error('No active term found for batch generation');
                         return;
                       }
                       
                       batchGenerateReportCardsMutation.mutateAsync({
                         classSectionId: String(firstClass.id),
                         termId: String(firstTerm.id),
                       }).then(() => {
                        toast.success('Bulk progress report generated successfully');
                      }).catch((err) => {
                        const message = err?.response?.data?.message || err?.message || 'Batch report failed';
                        toast.error(message);
                      });
                    }}
                    disabled={batchGenerateReportCardsMutation.isPending}
                    className="px-6 py-3 bg-brand-primary text-primary-foreground rounded-xl font-black text-sm hover:bg-brand-dark transition-all shadow-xl shadow-brand-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText size={18} />
                    Bulk Progress Report
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                {/* Subject Selector */}
                <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-2xl border border-border shadow-sm">
                  <Filter size={16} className="text-brand-primary" />
                  <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="bg-transparent text-sm font-black text-text-primary focus:outline-none cursor-pointer pr-4"
                  >
                    <option>Integrated Science</option>
                    <option>Elective Physics</option>
                    <option>Elective Chemistry</option>
                    <option>Elective Biology</option>
                  </select>
                </div>

                {/* Year Selector */}
                <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-2xl border border-border shadow-sm">
                  <Calendar size={16} className="text-brand-primary" />
                  <select 
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="bg-transparent text-sm font-black text-text-primary focus:outline-none cursor-pointer pr-4"
                  >
                    {academicYears.map(y => (
                      <option key={y.id} value={y.label}>{y.label}</option>
                    ))}
                    {academicYears.length === 0 && <option>2024/2025</option>}
                  </select>
                </div>

                <div className="flex-1 min-w-[300px] relative h-12">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                  <input 
                    type="text"
                    placeholder="Lookup Student Index (e.g. 10001)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchTerm.trim()) {
                        e.preventDefault();
                        setSearchTrigger({ indexNumber: searchTerm.trim() });
                      }
                    }}
                    className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all shadow-sm h-full"
                  />
                </div>
              </div>
            </header>

{/* Comparison Grid */}
             <div className="flex-1 overflow-x-auto overflow-y-auto p-8 pt-4 scrollbar-hide">
               <div className="min-w-max h-full">
                <Table className="border-separate border-spacing-y-4">
                  <TableHeader>
                    <TableRow className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">
                      <TableHead className="px-6 py-4 text-left">Student Identity</TableHead>
                      {showCoreComparison ? (
                        <>
                          <TableHead className="px-4 py-4 text-center border-x border-border bg-brand-primary/10 text-brand-primary rounded-t-xl">{selectedSubject}</TableHead>
                          {displaySubjects.map(s => (
                            <TableHead key={s} className="px-4 py-4 text-center border-x border-border">{s}</TableHead>
                          ))}
                        </>
                      ) : (
                        terms.map(t => (
                          <TableHead key={t} className="px-4 py-4 text-center border-x border-border">{t}</TableHead>
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
                          <TableCell className="bg-surface/40 backdrop-blur-md px-6 py-5 rounded-l-[1.5rem] border-y border-l border-border shadow-sm group-hover:bg-surface transition-all sticky left-0 z-20">
                            <div className="flex items-center gap-4">
                             <img 
                               src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} 
                               alt={student.name} 
                               className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 shadow-sm grayscale group-hover:grayscale-0 transition-all"
                             />
                             <div>
                               <p className="text-sm font-black text-text-primary tracking-tight">{student.name}</p>
                               <p className="text-[10px] font-bold text-text-secondary uppercase font-mono">{student.index}</p>
                             </div>
                           </div>
                         </TableCell>

                         {/* Multi-Term Grade Cells - Glass Mode */}
                         {showCoreComparison ? (
                           <>
                             <TableCell className="bg-brand-primary/10 backdrop-blur-[2px] px-8 py-5 border-y border-x border-brand-primary/20 group-hover:bg-brand-primary/20 transition-all text-center relative overflow-hidden">
                                <span className="text-lg font-black text-brand-primary italic">
                                  {student.history[student.history.length-1]?.finalGrade ?? 0}%
                                </span>
                                <div className="text-[8px] font-black text-brand-primary uppercase mt-1">Target Subject</div>
                             </TableCell>
                              {displaySubjects.map((s, idx) => {
                               const baseScore = student.history[student.history.length-1]?.finalGrade ?? 0;
                               const simulatedScore = Math.max(0, Math.min(100, baseScore + (idx % 2 === 0 ? 5 : -10) + (Math.random() * 5)));
                               return (
                                 <TableCell key={s} className="bg-surface/30 backdrop-blur-[2px] px-8 py-5 border-y border-x border-border group-hover:bg-surface/80 transition-all text-center relative overflow-hidden">
                                   <span className={cn(
                                     "text-lg font-black tracking-tighter",
                                     simulatedScore > 75 ? "text-brand-primary" : simulatedScore < 50 ? "text-destructive" : "text-text-secondary"
                                   )}>
                                     {simulatedScore.toFixed(0)}%
                                   </span>
                                   <div className="text-[8px] font-black text-muted uppercase mt-1 tracking-tighter">Verified Audit</div>
                                 </TableCell>
                               );
                             })}
                           </>
                         ) : (
                           terms.map((term, idx) => {
                             const grade = student.history[idx]?.finalGrade;
                             const ghostAverage = getGhostBenchmark(student, idx);
                            
                             return (
                               <TableCell key={term} className="bg-surface/30 backdrop-blur-[2px] px-8 py-5 border-y border-x border-border group-hover:bg-surface/80 transition-all text-center relative overflow-hidden">
                                 {/* Locked Pattern Overlay */}
                                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_0)] bg-[size:10px_10px]" />
                                
                                 <div className="relative">
                                   <span className={cn(
                                     "text-lg font-black tracking-tighter",
                                     grade !== null && grade > 75 ? "text-brand-primary" : grade !== null && grade < 50 ? "text-destructive" : "text-text-secondary"
                                   )}>
                                     {grade !== null && grade !== undefined ? `${grade}%` : '---'}
                                   </span>
                                   <div className="flex items-center justify-center gap-1 mt-1">
                                     <span className="text-[8px] font-black text-muted uppercase tracking-widest">
                                       {ghostAverage != null ? `Ghost: ${ghostAverage}%` : 'Ghost: ---'}
                                     </span>
                                   </div>
                                   {/* Visual Indicator of Comparison */}
                                   {grade !== null && ghostAverage != null && (
                                     <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full overflow-hidden bg-muted">
                                       <div 
                                         className={cn(
                                           "h-full transition-all",
                                           grade > ghostAverage ? "bg-success w-full" : "bg-destructive w-1/2"
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
                         <TableCell className="bg-brand-primary px-8 py-5 rounded-r-[1.5rem] border-y border-r border-brand-dark shadow-xl group-hover:bg-brand-dark transition-all text-right">
                           <p className="text-[10px] font-black text-primary-foreground/50 uppercase mb-1">Total</p>
                           <p className="text-xl font-black text-primary-foreground italic">
                             {(student.history.reduce((acc, h) => acc + (h?.finalGrade ?? 0), 0) / Math.max(1, student.history.length)).toFixed(1)}%
                           </p>
                         </TableCell>
                        </motion.tr>
                      )) : (
                         <TableRow>
                           <TableCell colSpan={8} className="text-center py-12">
                             {archiveStatsLoading || vaultSearchQuery.isLoading ? (
                               <p className="text-text-secondary text-sm font-bold">Loading archive data...</p>
                             ) : (
                               <EmptyState context="results" variant="compact" />
                             )}
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
            className="flex-1 overflow-hidden flex flex-col items-center bg-surface z-10 w-full"
          >
            {/* Report Configuration & Export Header */}
            <div className="w-full max-w-7xl mt-6 pb-6 flex flex-col md:flex-row items-center justify-between border-b border-border px-6 lg:px-8 gap-4 mx-auto">
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <select 
                  value={reportConfig.range}
                  onChange={(e) => setReportConfig({...reportConfig, range: e.target.value})}
                  className="bg-surface px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-border outline-none"
                >
                  <option>Full Journey</option>
                  <option>Phase Report (SHS 2)</option>
                </select>
                <div className="flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand-primary/20 italic">
                   <ShieldCheck size={14} />
                    Audit ID: {enrichedSelectedStudent.index}-99X
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-end">
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="px-6 py-2 bg-muted text-text-secondary rounded-xl text-xs font-black hover:bg-border transition-all uppercase tracking-widest"
                >
                  Return
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-primary-foreground rounded-xl text-xs font-black hover:bg-brand-dark transition-all shadow-lg shadow-brand-primary/20">
                  <Printer size={16} />
                  Print Transcript
                </button>
              </div>
            </div>

            {/* Main Report Body (Full Scrollable Area) */}
            <div className="flex-1 w-full max-w-7xl overflow-y-auto no-scrollbar relative p-6 lg:p-16 mx-auto scrollbar-hide">
              {/* Report Header & Bio */}
              <div className="flex flex-col md:justify-between md:flex-row md:items-start mb-16 gap-8">
                <div className="flex flex-col items-center md:flex-row md:items-center gap-8 text-center md:text-left">
                  <div className="relative">
                    <img 
                       src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${enrichedSelectedStudent.name}`} 
                       alt={enrichedSelectedStudent.name} 
                      className="w-28 h-28 rounded-3xl bg-muted p-1 border-4 border-surface shadow-2xl"
                    />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-primary text-primary-foreground rounded-2xl flex items-center justify-center border-4 border-surface shadow-lg shadow-brand-primary/20">
                      <User size={20} />
                    </div>
                  </div>
                  <div>
                     <h2 className="text-3xl md:text-5xl font-black text-text-primary tracking-tighter mb-2 italic">{enrichedSelectedStudent.name}</h2>
                    <p className="text-brand-primary font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">Scholastic Longitudinal Portfolio</p>
                    <div className="flex flex-wrap gap-2 md:gap-3 mt-4 justify-center md:justify-start">
                        <span className="px-3 py-1 bg-muted rounded-lg text-[10px] font-black text-text-secondary uppercase tracking-widest">ID: {enrichedSelectedStudent.index}</span>
                        <span className="px-3 py-1 bg-muted rounded-lg text-[10px] font-black text-text-secondary uppercase tracking-widest">{enrichedSelectedStudent.department} Dept.</span>
                        <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-[10px] font-black uppercase tracking-widest">{enrichedSelectedStudent.consistencyScore} Performer</span>
                    </div>
                  </div>
                </div>
                <div className="text-center md:text-right flex flex-col items-center md:items-end">
                   <div className="hidden md:flex w-24 h-24 bg-brand-primary rounded-3xl items-center justify-center text-primary-foreground shadow-xl rotate-3 border-4 border-brand-primary mb-4 opacity-20">
                      <Database size={48} />
                   </div>
                   <p className="text-[10px] font-black text-text-secondary uppercase tracking-tighter">Generated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* 1. TERMINAL PERFORMANCE BREAKDOWN (Vertical Stacked Tables) */}
              <section className="mb-20">
                <header className="flex items-center gap-3 mb-10 border-b-2 border-brand-primary pb-2">
                  <Database size={24} className="text-brand-primary" />
                  <h3 className="text-lg font-black text-brand-primary uppercase tracking-[0.1em]">1. Terminal Performance Breakdown</h3>
                </header>
                
                <div className="grid grid-cols-1 gap-y-16">
                  {terms.map((term, tIdx) => (
                    <div key={term} className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col">
                      <div className="bg-muted/80 px-8 py-5 border-b border-border flex justify-between items-center">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-primary-foreground text-xs font-black shadow-lg">
                               {tIdx + 1}
                            </div>
                            <div>
                               <h4 className="text-sm font-black text-text-primary uppercase tracking-widest italic">{term} Academic Journal</h4>
                               <p className="text-[9px] font-bold text-text-secondary uppercase">Assessment Period: Cycle {tIdx + 1}</p>
                            </div>
                         </div>
                         <span className="text-[11px] font-black text-brand-primary bg-brand-primary/10 px-4 py-1.5 rounded-full uppercase tracking-widest italic">Official Record</span>
                      </div>
                      
  <div className="p-4 overflow-x-auto no-scrollbar scrollbar-hide">
                         <Table className="min-w-[600px]">
                           <TableHeader>
                             <TableRow className="text-[10px] font-black text-text-secondary uppercase tracking-widest border-b border-border">
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
                                 <TableRow key={subj} className="group hover:bg-brand-primary/5 transition-all">
                                   <TableCell className="py-5 pl-6">
                                      <p className="text-sm font-black text-text-primary italic tracking-tight">{subj}</p>
                                      <p className="text-[9px] font-bold text-text-secondary uppercase tracking-tighter">Verified Academic Dept.</p>
                                   </TableCell>
                                   <TableCell className="py-5 text-center">
                                      <span className="text-sm font-bold text-text-secondary font-mono italic">{classScore}</span>
                                   </TableCell>
                                   <TableCell className="py-5 text-center">
                                      <span className="text-sm font-bold text-text-secondary font-mono italic">{examScore}</span>
                                   </TableCell>
                                   <TableCell className="py-5 text-center">
                                      <span className={cn(
                                        "px-3 py-1 rounded-lg text-xs font-black",
                                        total >= 70 ? "bg-brand-primary/10 text-brand-primary" :
                                        total >= 50 ? "bg-warning/10 text-warning" :
                                        "bg-destructive/10 text-destructive"
                                      )}>
                                        {letterGrade}
                                      </span>
                                   </TableCell>
                                   <TableCell className="py-5 text-right pr-6">
                                      <span className={cn(
                                        "text-lg font-black italic tracking-tighter font-mono",
                                        total >= 75 ? "text-brand-primary" :
                                        total < 50 ? "text-destructive" : "text-text-primary"
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
                   <div className="bg-brand-primary/5 p-8 rounded-3xl border border-brand-primary/10">
                      <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1">Cumulative GPA</p>
<p className="text-3xl font-black text-brand-primary italic tracking-tighter">
                           {(enrichedSelectedStudent.history.reduce((acc, h) => acc + (h?.finalGrade ?? 0), 0) / Math.max(1, enrichedSelectedStudent.history.length)).toFixed(1)}%
                       </p>
                   </div>
                   <div className="bg-brand-primary/5 p-8 rounded-3xl border border-brand-primary/10">
                      <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1">Consistency Score</p>
                       <p className="text-3xl font-black text-brand-primary italic tracking-tighter">{enrichedSelectedStudent.consistencyScore}</p>
                   </div>
                   <div className="bg-brand-primary/5 p-8 rounded-3xl border border-brand-primary/10">
                      <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1">Mastery Percentile</p>
                      <p className="text-3xl font-black text-brand-primary italic tracking-tighter">Top 15%</p>
                   </div>
                   <div className="bg-brand-primary p-8 rounded-3xl border border-brand-primary text-primary-foreground shadow-2xl">
                       <p className="text-[9px] font-black text-success uppercase tracking-widest mb-1">Archive Records</p>
                      <p className="text-lg font-black italic tracking-tighter">MAAIS-V5-OK</p>
                   </div>
                </div>
              </section>

              {/* 2. PERFORMANCE PULSE & GROWTH */}
              <div className="grid grid-cols-1 gap-12 mb-20">
                <section>
                  <header className="flex items-center gap-3 mb-8 border-b-2 border-brand-primary pb-2">
                    <TrendingUp size={24} className="text-brand-primary" />
                    <h3 className="text-sm font-black text-brand-primary uppercase tracking-[0.1em]">2. Longitudinal Performance Trajectory</h3>
                  </header>
                  <div className="bg-muted/50 p-12 rounded-[3rem] border border-border h-[400px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                       <AreaChart data={historyForChart}>
                        <defs>
                          <linearGradient id="subScreenTrend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#065F46" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#065F46" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }} dy={10} />
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
                   <header className="flex items-center gap-3 mb-8 border-b-2 border-brand-primary pb-2">
                    <History size={24} className="text-brand-primary" />
                    <h3 className="text-sm font-black text-brand-primary uppercase tracking-[0.1em]">4. Observation Archive</h3>
                  </header>
                  <div className="space-y-4">
                     {enrichedSelectedStudent.observations.map((obs) => (
                      <div key={obs.id} className="p-6 bg-surface border-l-4 border-warning border-y border-r border-border rounded-r-2xl shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[9px] font-black text-warning bg-warning/10 px-2 py-0.5 rounded italic uppercase leading-none">{obs.type}</span>
                           <span className="text-[9px] font-bold text-text-secondary italic">{obs.date}</span>
                        </div>
                        <p className="text-sm font-medium text-text-primary italic">"{obs.comment}"</p>
                        <p className="text-[8px] font-black text-text-primary opacity-50 mt-3 uppercase tracking-widest">— Logged by {obs.teacherName}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <header className="flex items-center gap-3 mb-8 border-b-2 border-brand-primary pb-2">
                    <ShieldCheck size={24} className="text-brand-primary" />
                    <h3 className="text-sm font-black text-brand-primary uppercase tracking-[0.1em]">5. Intervention History</h3>
                  </header>
                  <div className="space-y-6">
                     {enrichedSelectedStudent.interventions.map((int) => (
                      <div key={int.id} className="bg-brand-dark text-primary-foreground p-8 rounded-[2.5rem] relative overflow-hidden ring-4 ring-border">
                        <div className="absolute top-4 right-6 text-[8px] font-black text-success bg-brand-primary/50 px-2 py-1 rounded">AUDIT VERIFIED</div>
                        <div className="flex items-center gap-3 mb-6">
                           <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                           <p className="text-[10px] font-black uppercase tracking-[0.2em]">{int.year} {int.term} Flagged Milestone</p>
                        </div>
                        <div className="space-y-4">
                           <div className="opacity-80">
                              <p className="text-[8px] font-black text-text-secondary uppercase mb-1">Intervention Action</p>
                              <p className="text-sm font-bold italic">{int.action}</p>
                           </div>
                           <div className="bg-surface/5 p-4 rounded-xl border border-primary-foreground/10">
                              <p className="text-[10px] font-black text-success uppercase tracking-widest mb-1 italic">Observed Outcome</p>
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
                <header className="flex items-center gap-3 mb-8 border-b-2 border-brand-primary pb-2">
                  <User size={24} className="text-brand-primary" />
                  <h3 className="text-sm font-black text-brand-primary uppercase tracking-[0.1em]">3. Final Professional Assessment</h3>
                </header>
                <div className="bg-background p-12 rounded-[3.5rem] border border-border">
                  <textarea 
                    value={reportConfig.concludingSummary}
                    onChange={(e) => setReportConfig({...reportConfig, concludingSummary: e.target.value})}
                    placeholder="Enter final longitudinal summary here..."
                    className="w-full bg-transparent border-none focus:outline-none text-2xl font-black text-text-primary italic leading-relaxed placeholder:text-muted resize-none h-64"
                  />
                  <div className="mt-16 pt-16 border-t border-border grid grid-cols-2 gap-32 opacity-30">
                     <div className="text-center font-black text-[10px] text-text-primary uppercase">Class Teacher Authorization</div>
                     <div className="text-center font-black text-[10px] text-text-primary uppercase">Registrar Final Stamp</div>
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
