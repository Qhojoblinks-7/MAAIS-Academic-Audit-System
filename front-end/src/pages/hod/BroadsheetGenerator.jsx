import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  RefreshCw,
  Award,
  Users,
  ChevronRight,
  BarChart3,
  Loader2,
  LayoutGrid,
  Layers,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/molecules';
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
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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
  } = useArchivedDepartmentData({ mode: 'current' });

  const [isGenerating, setIsGenerating] = useState(false);
  const [compileError, setCompileError] = useState(null);
  const [broadsheetData, setBroadsheetData] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAtRiskOnly, setShowAtRiskOnly] = useState(false);

  const isAtRiskStudent = useCallback((student) => {
    if (!student) return false;
    const gpa = student.gpa;
    const letterGrade = student.letterGrade;
    return (typeof gpa === 'number' && gpa < 2.0) || ['D7', 'E8', 'F9'].includes(letterGrade);
  }, []);

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

  const handleExportPDF = async () => {
    if (!broadsheetData.length) return;
    const stamp = new Date().toISOString().slice(0, 10);
    let iframe;
    try {
      iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '210mm';
      iframe.style.height = 'auto';
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 40px; font-family: Arial, Helvetica, sans-serif; color: #0f172a; background: #ffffff; }
            .doc-header { border-bottom: 2px solid #0f172a; padding-bottom: 18px; margin-bottom: 26px; }
            .doc-header h1 { margin: 0; font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
            .doc-header p { margin: 4px 0 0; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #475569; }
            .meta { font-size: 10px; color: #64748b; margin-top: 6px; }
            .class-block { margin-bottom: 28px; page-break-inside: avoid; }
            .class-title { font-size: 14px; font-weight: 800; text-transform: uppercase; margin: 0 0 4px; }
            .summary { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; }
            thead th { background: #0f172a; color: #ffffff; font-size: 9px; font-weight: bold; text-transform: uppercase; padding: 7px 8px; text-align: left; }
            thead th.num { text-align: center; }
            tbody td { padding: 6px 8px; font-size: 10px; border-bottom: 1px solid #e2e8f0; }
            tbody td.num { text-align: center; font-family: monospace; }
            tbody td.grade { font-weight: bold; text-align: center; }
            .rank-1 { color: #b45309; font-weight: bold; }
            .rank-2 { color: #475569; font-weight: bold; }
            .rank-3 { color: #c2410c; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="doc-header">
            <h1>Departmental Broadsheet</h1>
            <p>Mando Senior High Technical School &mdash; Operational Performance Record</p>
            <p class="meta">Generated: ${stamp} &bull; ${broadsheetData.length} cohort(s) &bull; ${broadsheetData.reduce((n, c) => n + (c.students?.length || 0), 0)} students</p>
          </div>
          ${broadsheetData
            .map((c) => {
              const rows = c.students
                .map(
                  (s) => `
                <tr>
                  <td class="num ${s.rank === 1 ? 'rank-1' : s.rank === 2 ? 'rank-2' : s.rank === 3 ? 'rank-3' : ''}">#${s.rank ?? '—'}</td>
                  <td class="num">${s.index || 'N/A'}</td>
                  <td>${String(s.name || 'Anonymous').replace(/</g, '&lt;')}</td>
                  <td class="grade">${s.grade || 'N/A'}</td>
                  <td class="num">${s.gpa != null ? s.gpa.toFixed(2) : '0.00'} (${s.letterGrade || 'F9'})</td>
                  <td class="num">${s.cgpa != null ? s.cgpa.toFixed(2) : '0.00'}</td>
                  <td class="num">${s.percentile != null ? s.percentile.toFixed(0) : '0'}%</td>
                </tr>`,
                )
                .join('');
              return `
            <div class="class-block">
              <h2 class="class-title">${String(c.className || 'Unassigned Cohort').replace(/</g, '&lt;')}</h2>
              <p class="summary">${(c.subject || 'General Discipline').toUpperCase()} &bull; Cycle: ${c.academicYear || 'N/A'} &bull; Term: ${c.term || 'N/A'} &bull; Class GPA: ${c.classAverageGPA?.toFixed(2)} (${c.classLetterGrade}) &bull; Class CGPA: ${c.classAverageCGPA?.toFixed(2)}</p>
              <table>
                <thead>
                  <tr>
                    <th class="num">Rank</th>
                    <th class="num">Index</th>
                    <th>Full Name</th>
                    <th class="num">Grade</th>
                    <th class="num">Term GPA (Grade)</th>
                    <th class="num">Cum. CGPA</th>
                    <th class="num">Percentile</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>`;
            })
            .join('')}
        </body>
        </html>
      `);
      doc.close();

      await new Promise((resolve) => setTimeout(resolve, 300));
      const canvas = await html2canvas(doc.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      document.body.removeChild(iframe);
      iframe = null;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -heightLeft, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`academic_broadsheet_${stamp}.pdf`);
    } catch (err) {
      console.error('Broadsheet PDF export error:', err);
      if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }
  };

  const getRankBadgeStyles = (rank) => {
    if (rank === 1) return 'bg-amber-500/15 text-amber-700 border border-amber-500/25';
    if (rank === 2) return 'bg-slate-400/15 text-slate-600 border border-slate-400/25';
    if (rank === 3) return 'bg-orange-400/15 text-orange-700 border border-orange-400/25';
    return 'bg-muted text-muted-foreground border border-border/60';
  };

  const getGradePillStyles = (grade) => {
    if (grade === 'A1') return 'bg-success/15 text-success border-success/25';
    if (['B2', 'B3'].includes(grade)) return 'bg-brand-primary/10 text-brand-dark border-brand-primary/20';
    if (['C4', 'C5', 'C6'].includes(grade)) return 'bg-warning/15 text-amber-700 border-warning/20';
    if (grade === 'D7') return 'bg-destructive/10 text-destructive border-destructive/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 select-none scrollbar-hide no-scrollbar">
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-border border-t-brand-primary animate-spin" />
            <Loader2 className="animate-pulse text-brand-primary/70 absolute" size={18} />
          </div>
          <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Synchronizing Ledgers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 select-none scrollbar-hide no-scrollbar">
        <div className="bg-destructive/5 border border-destructive/20 p-6 rounded-2xl flex items-start gap-4 max-w-2xl mx-auto shadow-sm">
          <div className="p-3 bg-destructive text-primary-foreground rounded-xl shadow-inner shrink-0">{"\u26A0\uFE0F"}</div>
          <div>
            <h4 className="font-black tracking-tight text-text-primary">Data Pipeline Error</h4>
            <p className="text-[11px] text-destructive font-semibold mt-1 leading-relaxed">{error?.message || 'Failed to capture institutional streams.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 select-none scrollbar-hide no-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <header className="mb-8 border-b border-border/60 pb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">
              <span className="text-brand-primary">Academic Workspace</span>
              <ChevronRight size={10} className="text-border" />
              <span>Broadsheet Compiler</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-text-primary">Departmental Broadsheet</h1>
            <p className="text-[11px] text-text-secondary font-medium mt-1.5 max-w-xl">
              Operational view of student performance across cohorts. Compile, review, and export institutional grade records.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={generateBroadSheet}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              <RefreshCw size={14} className={cn(isGenerating && 'animate-spin')} />
              <span>Re-compile</span>
            </Button>
            <Button
              onClick={downloadCSV}
              disabled={!broadsheetData.length || isGenerating}
              size="sm"
              className="shrink-0"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={!broadsheetData.length || isGenerating}
              variant="outline"
              size="sm"
              className="shrink-0"
            >
              <Download size={14} />
              <span>Export PDF</span>
            </Button>
          </div>
        </header>

        {compileError && (
          <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-2xl flex items-start gap-3 mb-6">
            <div className="text-destructive shrink-0 mt-0.5">{"\u26A0\uFE0F"}</div>
            <p className="text-[11px] text-destructive font-bold">{compileError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Cohorts Evaluated',
              value: `${broadsheetData.length} Classes`,
              icon: Layers,
              style: 'bg-muted text-text-primary border-border/50',
            },
            {
              label: 'Audited Headcount',
              value: `${systemMetrics.totalStudents} Active`,
              icon: Users,
              style: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
            },
            {
              label: 'Global Average GPA',
              value: `${systemMetrics.globalAvgGpa} / 4.0`,
              icon: BarChart3,
              style: 'bg-success/10 text-success border-success/20',
            },
            {
              label: 'Top Performing',
              value: systemMetrics.topClass,
              icon: Award,
              style: 'bg-warning/10 text-warning border-warning/20',
            },
          ].map((metric, i) => (
            <div key={i} className="bg-surface p-4 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105', metric.style)}>
                  <metric.icon size={18} />
                </div>
                <div className="text-right min-w-0">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider leading-tight">{metric.label}</p>
                  <p className="text-sm font-black text-text-primary mt-0.5 truncate">{metric.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {broadsheetData.length > 1 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-6 scrollbar-none border-b border-border/60">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                'px-4 py-2.5 rounded-xl text-[11px] font-black transition-all whitespace-nowrap flex items-center gap-2 border',
                activeTab === 'all'
                  ? 'bg-foreground text-background border-foreground shadow-md'
                  : 'bg-surface text-muted-foreground hover:text-text-primary border-transparent'
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
                  'px-4 py-2.5 rounded-xl text-[11px] font-black transition-all whitespace-nowrap border',
                  activeTab === c.className
                    ? 'bg-surface text-brand-primary border-border shadow-sm'
                    : 'bg-transparent text-muted-foreground hover:text-text-primary border-transparent'
                )}
              >
                {c.className}
              </button>
            ))}
          </div>
        )}

        <div className="mb-6">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 text-muted-foreground" size={14} />
            <input
              type="text"
              placeholder="Search index or student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-[11px] font-bold placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all"
            />
          </div>
        </div>

        {filteredBroadsheetData.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-2xl max-w-md mx-auto p-6 shadow-sm">
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
                  className="border border-border/80 rounded-[1.25rem] overflow-hidden shadow-sm bg-surface"
                >
                  <div className="border-b border-border/80 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-[13px] font-black tracking-tight text-text-primary">
                          {classItem.className || 'Unassigned Cohort'}
                        </h2>
                        <span className="text-[9px] font-black bg-background text-muted-foreground border border-border px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {classItem.subject || 'General Discipline'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1 font-semibold">
                        <span>
                          Cycle: <strong className="text-text-primary font-black">{classItem.academicYear || 'N/A'}</strong>
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>
                          Term: <strong className="text-text-primary font-black">{classItem.term || 'N/A'}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-background p-1.5 rounded-xl border border-border/60 shadow-xs self-start md:self-auto divide-x divide-border/80">
                      <div className="px-4 py-2 text-center">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none">Class GPA</p>
                        <p className="text-sm font-black text-text-primary mt-1 flex items-center gap-1.5 justify-center">
                          {classItem.classAverageGPA.toFixed(2)}
                          <span className="text-[8px] font-black text-brand-primary bg-brand-primary/10 border border-brand-primary/20 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                            {classItem.classLetterGrade}
                          </span>
                        </p>
                      </div>
                      <div className="px-4 py-2 text-center">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none">Class CGPA</p>
                        <p className="text-sm font-black text-text-primary mt-1">{classItem.classAverageCGPA.toFixed(2)}</p>
                      </div>
                      <div className="px-4 py-2 text-center">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none">Count</p>
                        <p className="text-sm font-black text-text-primary mt-1">{classItem.students?.length || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x md:divide-y divide-border/60">
                    {classItem.students.map((student, studentIdx) => (
                      <div
                        key={student.id || student.index || studentIdx}
                        className="p-4 md:p-5 hover:bg-background/40 transition-colors border-b border-border/60 last:border-b-0 md:last:border-r-0"
                      >
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={cn('inline-flex items-center justify-center w-9 h-9 rounded-lg text-[10px] font-black shrink-0 border', getRankBadgeStyles(student.rank))}>
                              #{student.rank}
                            </span>
                            <div className="min-w-0">
                              <p className="text-[11px] font-black text-text-primary truncate tracking-tight">{student.name || 'Anonymous'}</p>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase font-mono tracking-wider">{student.index || 'N/A'}</p>
                            </div>
                            {student.percentile >= 90 && (
                              <span className="hidden sm:inline text-[8px] font-black bg-warning/15 text-warning border border-warning/25 px-2 py-0.5 rounded-md uppercase tracking-widest shrink-0">
                                Top 10%
                              </span>
                            )}
                          </div>
                          <span className="bg-background text-text-primary font-mono text-[11px] font-black px-2.5 py-1 rounded-lg border border-border/60">
                            {student.grade || 'N/A'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-background/60 rounded-xl p-2.5 border border-border/50">
                            <span className="block text-[8px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-1">GPA</span>
                            <span className="text-sm font-black text-text-primary tracking-tight">
                              {student.gpa?.toFixed(2)}
                            </span>
                            <span className={cn('ml-1 text-[8px] font-black border px-1 rounded-sm', getGradePillStyles(student.letterGrade))}>
                              {student.letterGrade}
                            </span>
                          </div>
                          <div className="bg-background/60 rounded-xl p-2.5 border border-border/50">
                            <span className="block text-[8px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-1">CGPA</span>
                            <span className="text-sm font-black text-brand-primary tracking-tight">
                              {student.cgpa?.toFixed(2)}
                            </span>
                            <span className={cn('ml-1 text-[8px] font-black border px-1 rounded-sm', getGradePillStyles(student.cgpaLetterGrade))}>
                              {student.cgpaLetterGrade}
                            </span>
                          </div>
                          <div className="bg-background/60 rounded-xl p-2.5 border border-border/50">
                            <span className="block text-[8px] font-black text-muted-foreground uppercase tracking-[0.15em] mb-1">Percentile</span>
                            <span className="text-sm font-black text-text-primary tracking-tight">
                              {student.percentile?.toFixed(0) || 0}<span className="text-[10px] font-bold text-muted-foreground">%</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function BroadsheetGeneratorPage() {
  return (
    <div
      className="w-full bg-background"
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
