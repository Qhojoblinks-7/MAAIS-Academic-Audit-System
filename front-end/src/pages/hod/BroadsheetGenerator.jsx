import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, RefreshCw, Award, Users, BookOpen, 
  GraduationCap, ChevronRight, BarChart3, Loader2, 
  LayoutGrid, Layers, Search, SlidersHorizontal 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArchivedDepartmentData } from '@/lib/hooks/api/hod';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { calculateGPA, calculateCGPA, calculateClassRanking, gpaToLetterGrade } from '@/lib/gpaUtils';

function groupStudentsByClass(students) {
  const map = new Map();
  (students || []).forEach((s) => {
    const key = s.className || 'Unassigned';
    if (!map.has(key)) {
      map.set(key, { className: key, students: [], year: s.year || '', subject: 'General Discipline', academicYear: s.year || '', term: 'Term' });
    }
    map.get(key).students.push(s);
  });
  return Array.from(map.values());
}

export function BroadsheetGenerator() {
  const {
    data: archivedStudents = [],
    isLoading,
    error,
    refetch,
  } = useArchivedDepartmentData();

  const [isGenerating, setIsGenerating] = useState(false);
  const [compileError, setCompileError] = useState(null);
  const [broadsheetData, setBroadsheetData] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const generateBroadSheet = useCallback(async () => {
    setIsGenerating(true);
    setCompileError(null);
    try {
      const fresh = await refetch();
      const raw = fresh?.data || archivedStudents || [];
      const classes = groupStudentsByClass(raw);
      const processed = classes.map((classItem) => {
        const studentsWithGPAs = classItem.students.map((student) => {
          const subjects = student.subjects || [];
          const subjectGrades = subjects.map((subj) => ({
            grade: subj.grade || '',
            credits: subj.credits || 1,
          }));
          const gpa = calculateGPA(subjectGrades);
          const termHistory = (student.termHistory || []).map((th) => ({
            termGPA: th.termGPA || 0,
            termCredits: th.termCredits || 1,
          }));
          const cgpa = calculateCGPA(termHistory);
          const mainGrade = subjects[0]?.grade || '';
          return {
            ...student,
            index: student.indexNumber || student.index || '',
            grade: mainGrade,
            gpa,
            cgpa,
            letterGrade: gpaToLetterGrade(gpa),
            cgpaLetterGrade: gpaToLetterGrade(cgpa),
            subjects,
            termHistory,
          };
        });
        const rankingInfo = calculateClassRanking(studentsWithGPAs) || [];
        const rankingMap = new Map(rankingInfo.map((item) => [item.index || item.id, item]));
        const studentsWithRankings = studentsWithGPAs.map((student) => {
          const matched = rankingMap.get(student.index || student.id);
          return {
            ...student,
            rank: matched?.rank || 0,
            percentile: matched?.percentile || 0,
          };
        });
        const sumGpa = studentsWithRankings.reduce((acc, s) => acc + s.gpa, 0);
        const sumCgpa = studentsWithRankings.reduce((acc, s) => acc + s.cgpa, 0);
        const count = studentsWithRankings.length || 1;
        const classAverageGPA = parseFloat((sumGpa / count).toFixed(2));
        const classAverageCGPA = parseFloat((sumCgpa / count).toFixed(2));
        return {
          ...classItem,
          students: studentsWithRankings,
          classAverageGPA,
          classAverageCGPA,
          classLetterGrade: gpaToLetterGrade(classAverageGPA),
        };
      });
      setBroadsheetData(processed);
      if (processed.length > 0 && activeTab === 'all') {
        setActiveTab('all');
      }
    } catch (err) {
      setCompileError('Failed to generate operational broadsheet: ' + err.message);
      console.error('Broadsheet generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [refetch, archivedStudents, activeTab]);

  useEffect(() => {
    if (!isLoading && archivedStudents.length > 0) {
      generateBroadSheet();
    }
  }, [isLoading, archivedStudents.length > 0, generateBroadSheet]);

  const systemMetrics = useMemo(() => {
    if (!broadsheetData.length) return { totalStudents: 0, globalAvgGpa: '0.00', topClass: 'N/A' };
    let totalStudents = 0;
    let sumGpa = 0;
    let highestClassGpa = 0;
    let topClassName = 'N/A';
    for (const c of broadsheetData) {
      totalStudents += c.students?.length || 0;
      sumGpa += c.classAverageGPA;
      if (c.classAverageGPA > highestClassGpa) {
        highestClassGpa = c.classAverageGPA;
        topClassName = c.className;
      }
    }
    return {
      totalStudents,
      globalAvgGpa: (sumGpa / broadsheetData.length).toFixed(2),
      topClass: topClassName,
    };
  }, [broadsheetData]);

  // Filters cohorts based on view layout and search queries
  const filteredBroadsheetData = useMemo(() => {
    let baseData = broadsheetData;
    if (activeTab !== 'all') {
      baseData = broadsheetData.filter(c => c.className === activeTab);
    }
    if (!searchQuery.trim()) return baseData;

    return baseData.map(classItem => {
      const filteredStudents = classItem.students.filter(student => 
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.index?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...classItem, students: filteredStudents };
    }).filter(classItem => classItem.students.length > 0);
  }, [broadsheetData, activeTab, searchQuery]);

  const generateCSV = () => {
    if (!broadsheetData || broadsheetData.length === 0) return null;
    const headers = [
      'Class Name', 'Subject', 'Academic Year', 'Term',
      'Student Index', 'Student Name', 'Grade', 'GPA', 'Letter Grade', 'CGPA', 'Rank',
    ];
    const rows = broadsheetData.flatMap((classItem) =>
      (classItem.students || []).map((student) => [
        classItem.className || 'N/A',
        classItem.subject || 'N/A',
        classItem.academicYear || 'N/A',
        classItem.term || 'N/A',
        student.index || 'N/A',
        student.name || 'N/A',
        student.grade || 'N/A',
        student.gpa?.toFixed(2) || '0.00',
        student.letterGrade || 'F9',
        student.cgpa?.toFixed(2) || '0.00',
        student.rank || 'N/A',
      ]),
    );
    return [headers.join(','), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\r\n');
  };

  const downloadCSV = () => {
    const csv = generateCSV();
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic_broadsheet_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getRankBadgeStyles = (rank) => {
    if (rank === 1) return 'bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm font-bold';
    if (rank === 2) return 'bg-slate-400/10 text-slate-600 border border-slate-400/20 font-bold';
    if (rank === 3) return 'bg-orange-400/10 text-orange-600 border border-orange-400/20 font-bold';
    return 'bg-slate-50 text-slate-500 border border-slate-200/60 font-medium';
  };

  const getGradePillStyles = (grade) => {
    if (grade === 'A1') return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    if (['B2', 'B3'].includes(grade)) return 'bg-blue-50 text-blue-700 border-blue-200/80';
    if (['C4', 'C5', 'C6'].includes(grade)) return 'bg-amber-50 text-amber-700 border-amber-200/80';
    if (grade === 'D7') return 'bg-rose-50 text-rose-700 border-rose-200/80';
    return 'bg-slate-50 text-slate-500 border-slate-200';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-100 border-t-indigo-600 animate-spin" />
          <Loader2 className="animate-pulse text-indigo-400 absolute" size={18} />
        </div>
        <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Synchronizing Ledgers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-100 p-6 rounded-2xl flex items-start gap-4 max-w-2xl mx-auto shadow-sm">
        <div className="p-3 bg-rose-500 text-white rounded-xl shadow-inner shrink-0">⚠️</div>
        <div>
          <h4 className="font-bold text-slate-900 tracking-tight">Data Pipeline Error</h4>
          <p className="text-xs text-rose-600 font-medium mt-1 leading-relaxed">{error?.message || 'Failed to capture institutional streams.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Dynamic Master Control Hub */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1.5">
            <span>Academic Workspace</span>
            <ChevronRight size={10} className="text-slate-300" />
            <span className="text-slate-400">Auditor Toolkit</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Departmental Broadsheet</h1>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder="Search index or student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>

          <button
            onClick={generateBroadSheet}
            disabled={isGenerating}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 shadow-sm disabled:opacity-60 shrink-0"
          >
            <RefreshCw size={13} className={cn(isGenerating && 'animate-spin')} />
            <span>Re-compile</span>
          </button>

          <button
            onClick={downloadCSV}
            disabled={!broadsheetData.length || isGenerating}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 shadow-sm shadow-indigo-500/10 disabled:opacity-40 disabled:pointer-events-none shrink-0"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Institutional Insights Grid */}
      {broadsheetData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Cohorts Evaluated', value: `${broadsheetData.length} Classes`, icon: Layers, style: 'bg-slate-50 text-slate-600 border-slate-100' },
            { label: 'Audited Headcount', value: `${systemMetrics.totalStudents} Active`, icon: Users, style: 'bg-indigo-50/50 text-indigo-600 border-indigo-100/50' },
            { label: 'Global Average GPA', value: `${systemMetrics.globalAvgGpa} / 4.0`, icon: BarChart3, style: 'bg-emerald-50/50 text-emerald-600 border-emerald-100/50' },
            { label: 'Top Performing', value: systemMetrics.topClass, icon: Award, style: 'bg-amber-50/50 text-amber-600 border-amber-100/50' }
          ].map((metric, i) => (
            <div key={i} className="p-4 bg-white border border-slate-200/60 shadow-sm rounded-2xl flex items-center gap-4 hover:border-slate-300 transition-all">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border shrink-0", metric.style)}>
                <metric.icon size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{metric.label}</p>
                <h3 className="text-base font-bold text-slate-900 mt-0.5 truncate">{metric.value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cohort Navigational Strip */}
      {broadsheetData.length > 1 && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/60">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border",
              activeTab === 'all' 
                ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                : "bg-white text-slate-500 hover:text-slate-900 border-transparent"
            )}
          >
            <LayoutGrid size={13} />
            <span>All Units</span>
          </button>
          {broadsheetData.map((c) => (
            <button
              key={c.className}
              onClick={() => setActiveTab(c.className)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
                activeTab === c.className 
                  ? "bg-white text-indigo-600 border-slate-200 shadow-sm font-extrabold" 
                  : "bg-transparent text-slate-500 hover:text-slate-900 border-transparent"
              )}
            >
              {c.className}
            </button>
          ))}
        </div>
      )}

      {compileError && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3">
          <div className="text-rose-500 shrink-0">⚠️</div>
          <p className="text-xs text-rose-600 font-semibold">{compileError}</p>
        </div>
      )}

      {/* Main Core Ledger List */}
      {filteredBroadsheetData.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl max-w-md mx-auto p-6 shadow-sm">
          <EmptyState context="results" />
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredBroadsheetData.map((classItem, classIdx) => (
              <motion.div
                key={classItem.className || classIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm bg-white"
              >
                {/* Cohort Canvas Block Header */}
                <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                        {classItem.className || 'Unassigned Cohort'}
                      </h2>
                      <span className="text-[9px] font-bold bg-white text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md shadow-xs">
                        {classItem.subject || 'General Discipline'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-medium">
                      <span>Cycle: <strong className="text-slate-600 font-semibold">{classItem.academicYear || 'N/A'}</strong></span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>Term: <strong className="text-slate-600 font-semibold">{classItem.term || 'N/A'}</strong></span>
                    </div>
                  </div>

                  {/* Aggregate Summary Panel */}
                  <div className="flex items-center bg-white p-1.5 rounded-xl border border-slate-200/60 shadow-xs self-start sm:self-auto divide-x divide-slate-100">
                    <div className="px-3 py-0.5 text-center">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Class GPA</p>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5 flex items-center gap-1 justify-center">
                        {classItem.classAverageGPA.toFixed(2)}
                        <span className="text-[8px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1 rounded-sm">
                          {classItem.classLetterGrade}
                        </span>
                      </p>
                    </div>
                    <div className="px-3 py-0.5 text-center">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Class CGPA</p>
                      <p className="text-xs font-extrabold text-slate-800 mt-0.5">{classItem.classAverageCGPA.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Grid Layout */}
                <div className="block md:hidden divide-y divide-slate-100">
                  {classItem.students.map((student, studentIdx) => (
                    <div key={student.id || student.index || studentIdx} className="p-4 space-y-2.5 bg-white">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={cn('inline-flex items-center justify-center w-8 h-5 rounded-md text-[10px] font-bold shrink-0', getRankBadgeStyles(student.rank))}>
                            #{student.rank}
                          </span>
                          <span className="text-xs font-bold text-slate-900 truncate">{student.name || 'Anonymous'}</span>
                          {student.percentile >= 90 && (
                            <span className="text-[8px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-sm uppercase tracking-wider shrink-0">Top 10%</span>
                          )}
                        </div>
                        <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                          {student.grade || 'N/A'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-50 pt-2 text-slate-500">
                        <div>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase">Index</span>
                          <span className="font-mono font-medium text-slate-700 truncate block">{student.index || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase">GPA</span>
                          <span className="font-bold text-slate-900">{student.gpa?.toFixed(2)} ({student.letterGrade})</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-bold text-slate-400 uppercase">CGPA</span>
                          <span className="font-semibold text-slate-700">{student.cgpa?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop High-Fidelity Data Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/40 border-b border-slate-100">
                      <TableRow>
                        <TableHead className="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider w-20">Rank</TableHead>
                        <TableHead className="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider w-36">Index Number</TableHead>
                        <TableHead className="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Full Name</TableHead>
                        <TableHead className="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center w-28">Main Grade</TableHead>
                        <TableHead className="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider w-32">Term GPA</TableHead>
                        <TableHead className="px-6 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider w-32">Cum. CGPA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100">
                      {classItem.students.map((student, studentIdx) => (
                        <TableRow key={student.id || student.index || studentIdx} className="hover:bg-slate-50/30 group transition-colors">
                          <TableCell className="px-6 py-3.5 whitespace-nowrap">
                            <span className={cn('inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] tracking-wide', getRankBadgeStyles(student.rank))}>
                              #{student.rank}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-3.5 whitespace-nowrap text-xs font-semibold text-slate-500 font-mono tracking-tight">
                            {student.index || 'N/A'}
                          </TableCell>
                          <TableCell className="px-6 py-3.5 whitespace-nowrap text-xs font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span>{student.name || 'Anonymous Student'}</span>
                              {student.percentile >= 90 && (
                                <span className="text-[7px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-xs">
                                  Top 10%
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-3.5 whitespace-nowrap text-xs text-center">
                            <span className="bg-slate-50 px-2 py-0.5 rounded font-mono font-bold text-slate-600 border border-slate-200/50">
                              {student.grade || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell className="px-6 py-3.5 whitespace-nowrap text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 tracking-tight">{student.gpa?.toFixed(2)}</span>
                              <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-bold border font-mono tracking-wide', getGradePillStyles(student.letterGrade))}>
                                {student.letterGrade}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-3.5 whitespace-nowrap text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-700 tracking-tight">{student.cgpa?.toFixed(2)}</span>
                              <span className={cn('px-1.5 py-0.5 rounded text-[8px] font-bold border font-mono tracking-tight uppercase', getGradePillStyles(student.cgpaLetterGrade))}>
                                {student.cgpaLetterGrade}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default function BroadsheetGeneratorPage() {
  return (
    <div
      className="w-full bg-slate-50/60 p-4 sm:p-6 lg:p-8"
      style={{
        minHeight: '100vh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <BroadsheetGenerator />
    </div>
  );
}