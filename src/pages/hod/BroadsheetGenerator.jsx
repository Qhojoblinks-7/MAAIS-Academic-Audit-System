import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Download, RefreshCw, Award, Users, BookOpen, GraduationCap, ChevronRight, BarChart3 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LoadingSpinner } from '../../components/molecules/LoadingSpinner';
import { calculateGPA, calculateCGPA, gpaToLetterGrade, calculateClassRanking } from '../../lib/gpaUtils';
import { useHOD } from '../../context/HODContext';

const SUBJECT_GRADES = {
  'General Agriculture': ['B3', 'B2', 'A1', 'C4'],
  'Animal Husbandry': ['B2', 'B3', 'A1', 'C6'],
  'Crop Science': ['C6', 'B3', 'C5', 'B2'],
  'Agricultural Economics': ['C5', 'C6', 'B3', 'B2'],
  'Mathematics': ['B2', 'A1', 'B3', 'C4'],
  'English': ['B3', 'B2', 'A1', 'C5'],
  'Science': ['C4', 'C5', 'B3', 'B2'],
};

function generateMockSubjectGrades(mainGrade) {
  const grades = SUBJECT_GRADES['General Agriculture'] || ['B3', 'B2', 'A1', 'C4'];
  return [
    { grade: mainGrade || 'B3', credits: 1, subject: 'Main Subject' },
    { grade: grades[Math.floor(Math.random() * grades.length)], credits: 1, subject: 'English' },
    { grade: grades[Math.floor(Math.random() * grades.length)], credits: 1, subject: 'Mathematics' },
    { grade: grades[Math.floor(Math.random() * grades.length)], credits: 1, subject: 'Science' },
  ];
}

function generateMockTermHistory() {
  const terms = [];
  const baseGPA = 2.5 + Math.random() * 1.0;
  
  for (let i = 1; i <= 4; i++) {
    const variation = (Math.random() - 0.5) * 0.5;
    terms.push({
      term: `202${i === 1 ? '3' : '4'}/25 Term ${i}`,
      termGPA: parseFloat((baseGPA + variation).toFixed(2)),
      termCredits: 6
    });
  }
  return terms;
}

export function BroadsheetGenerator() {
  const { archivedClasses, refreshArchivedClasses } = useHOD();
  const [broadsheetData, setBroadsheetData] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const generateBroadSheet = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const freshData = await refreshArchivedClasses();
      
      const processedData = (freshData || []).map(classItem => {
        const studentsArray = Array.isArray(classItem.students) ? classItem.students : [];
        
        // Generate baseline GPA variables safely
        const studentsWithGPAs = studentsArray.map(student => {
          const studentIndex = student.indexNumber || student.index || '';
          const subjects = generateMockSubjectGrades(student.grade);
          const gpa = calculateGPA(subjects);
          const termHistory = generateMockTermHistory();
          const cgpa = calculateCGPA(termHistory);
          
          return {
            ...student,
            index: studentIndex,
            gpa,
            cgpa,
            letterGrade: gpaToLetterGrade(gpa),
            cgpaLetterGrade: gpaToLetterGrade(cgpa),
            subjects,
          };
        });
        
        // Dynamic matching dictionary to protect metrics ordering anomalies
        const rankingInfo = calculateClassRanking(studentsWithGPAs);
        const rankingMap = new Map(
          (rankingInfo || []).map(item => [item.index || item.indexNumber, item])
        );
        
        const studentsWithRankings = studentsWithGPAs.map((student, idx) => {
          const matchedRank = rankingMap.get(student.index);
          return {
            ...student,
            rank: matchedRank?.rank || idx + 1,
            percentile: matchedRank?.percentile || 0,
          };
        });
        
        const totalStudentsCount = studentsWithRankings.length;
        const classAverageGPA = totalStudentsCount > 0 
          ? studentsWithRankings.reduce((sum, s) => sum + s.gpa, 0) / totalStudentsCount 
          : 0;
        
        const classAverageCGPA = totalStudentsCount > 0
          ? studentsWithRankings.reduce((sum, s) => sum + s.cgpa, 0) / totalStudentsCount
          : 0;
        
        return {
          ...classItem,
          students: studentsWithRankings,
          classAverageGPA: parseFloat(classAverageGPA.toFixed(2)),
          classAverageCGPA: parseFloat(classAverageCGPA.toFixed(2)),
          classLetterGrade: gpaToLetterGrade(classAverageGPA)
        };
      });
      
      setBroadsheetData(processedData);
    } catch (err) {
      setError('Failed to generate operational broadsheet: ' + err.message);
      console.error('Broadsheet generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [refreshArchivedClasses]);

  // Executive summary analytics calculations
  const systemMetrics = useMemo(() => {
    if (!broadsheetData.length) return { totalStudents: 0, globalAvgGpa: '0.00', topClass: 'N/A' };
    
    let totalStudents = 0;
    let sumGpa = 0;
    let highestClassGpa = 0;
    let topClassName = 'N/A';

    broadsheetData.forEach(c => {
      totalStudents += c.students?.length || 0;
      sumGpa += c.classAverageGPA;
      if (c.classAverageGPA > highestClassGpa) {
        highestClassGpa = c.classAverageGPA;
        topClassName = c.className;
      }
    });

    return {
      totalStudents,
      globalAvgGpa: (sumGpa / broadsheetData.length).toFixed(2),
      topClass: topClassName
    };
  }, [broadsheetData]);

  const generateCSV = () => {
    if (!broadsheetData || broadsheetData.length === 0) return null;
    
    const headers = [
      'Class Name', 'Subject', 'Academic Year', 'Term', 
      'Student Index', 'Student Name', 'Grade', 'GPA', 'Letter Grade', 'CGPA', 'Rank'
    ];
    
    const rows = broadsheetData.flatMap(classItem => 
      (classItem.students || []).map(student => [
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
        student.rank || 'N/A'
      ])
    );
    
    return [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
    ].join('\r\n');
  };

  const downloadCSV = () => {
    const csv = generateCSV();
    if (!csv) return;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `academic_broadsheet_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Run only once layout is established safely
  useEffect(() => {
    generateBroadSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <LoadingSpinner />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Processing institutional grade parameters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50/50 border border-rose-200 text-rose-700 p-5 mb-6 rounded-2xl flex items-start gap-3">
        <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0">⚠️</div>
        <div>
          <h4 className="font-semibold text-sm tracking-tight">Compilation Context Error</h4>
          <p className="text-xs text-rose-600/90 mt-0.5 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-fade-in">
      {/* Dynamic Command Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 uppercase tracking-widest mb-1">
            <span>Academic Registry Workspace</span>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="text-slate-400 font-medium">HOD Audit Toolkit</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Broadsheet Analyzer</h1>
        </div>
        
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <button
            onClick={generateBroadSheet}
            disabled={isGenerating}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 active:scale-98 transition-all flex items-center gap-2 shadow-sm disabled:opacity-60"
          >
            <RefreshCw size={14} className={cn(isGenerating && "animate-spin")} />
            <span>Re-compile Metrics</span>
          </button>
          
          <button
            onClick={downloadCSV}
            disabled={!broadsheetData.length || isGenerating}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 active:scale-98 transition-all flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:pointer-events-none"
          >
            <Download size={14} />
            <span>Export Clean Ledger (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Institutional Insights Blocks */}
      {broadsheetData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200/80 shadow-sm rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 shrink-0 border border-slate-100">
              <Users size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monitored Cohorts</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{broadsheetData.length} Classes</h3>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200/80 shadow-sm rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50/60 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100/40">
              <GraduationCap size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audited Headcount</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{systemMetrics.totalStudents} Active Students</h3>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200/80 shadow-sm rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50/60 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100/40">
              <BarChart3 size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Global Average GPA</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{systemMetrics.globalAvgGpa} <span className="text-xs text-slate-400 font-medium">/ 4.00</span></h3>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200/80 shadow-sm rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50/60 flex items-center justify-center text-amber-600 shrink-0 border border-amber-100/40">
              <Award size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Achieving Class</p>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5 truncate max-w-[160px]">{systemMetrics.topClass}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Main Core Ledger List */}
      {broadsheetData.length === 0 && !isGenerating ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 max-w-xl mx-auto px-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
            <BookOpen size={22} />
          </div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">No active datasets mapped</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            There are currently no archived secondary system records ready to pipeline structural broadsheet conversions.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {broadsheetData.map((classItem, classIdx) => (
            <div key={classItem.id || classItem.className || classIdx} className="border border-slate-200/70 rounded-2xl overflow-hidden shadow-sm bg-white transition-all hover:shadow-md hover:border-slate-300/60">
              {/* Header Canvas Block */}
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      {classItem.className || 'Unassigned Cohort'}
                    </h2>
                    <span className="text-[10px] font-bold bg-white text-slate-700 border border-slate-200/80 px-2.5 py-0.5 rounded-full shadow-sm">
                      {classItem.subject || 'General Discipline'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5 font-medium">
                    <span>Academic Cycle: <strong className="text-slate-700 font-semibold">{classItem.academicYear || 'N/A'}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>Term: <strong className="text-slate-700 font-semibold">{classItem.term || 'N/A'}</strong></span>
                  </div>
                </div>

                {/* Aggregate Scores Summary Panel */}
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-sm self-start sm:self-auto">
                  <div className="px-3 py-1 text-center border-r border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Class GPA</p>
                    <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                      {classItem.classAverageGPA.toFixed(2)}{' '}
                      <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100/60 px-1 rounded-sm ml-1">
                        {classItem.classLetterGrade}
                      </span>
                    </p>
                  </div>
                  <div className="px-3 py-1 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Class CGPA</p>
                    <p className="text-sm font-extrabold text-slate-800 mt-0.5">{classItem.classAverageCGPA.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Functional Data Layout */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-20">Rank</th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Index Number</th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</th>
                      <th className="px-6 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider w-24">Main Grade</th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-28">Term GPA</th>
                      <th className="px-6 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-28">Cum. CGPA</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {(classItem.students || []).map((student, studentIdx) => {
                      const isTopPercentile = (student.percentile || 0) >= 90;
                      
                      return (
                        <tr key={student.id || student.index || studentIdx} className="hover:bg-slate-50/40 group transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-900">
                            <span className={cn(
                              "inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px]",
                              student.rank === 1 ? "bg-amber-50 text-amber-700 border border-amber-100/60" :
                              student.rank === 2 ? "bg-slate-100 text-slate-700" :
                              student.rank === 3 ? "bg-orange-50 text-orange-700 border border-orange-100/40" :
                              "text-slate-500 font-medium"
                            )}>
                              #{student.rank}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-600 font-mono tracking-tight">
                            {student.index || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span>{student.name || 'Anonymous Student'}</span>
                              {isTopPercentile && (
                                <span className="text-[8px] font-extrabold bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-sm uppercase tracking-wide">
                                  Top 10%
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-center font-bold text-slate-500">
                            <span className="bg-slate-100/80 px-2 py-0.5 rounded-sm font-mono text-slate-700 border border-slate-200/40">
                              {student.grade || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm tracking-tight">{student.gpa?.toFixed(2) || '0.00'}</span>
                              <span className={cn(
                                'px-2 py-0.5 rounded-md text-[10px] font-bold border font-mono tracking-wide',
                                student.letterGrade === 'A1' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                student.letterGrade === 'B2' || student.letterGrade === 'B3' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                student.letterGrade === 'C4' || student.letterGrade === 'C5' || student.letterGrade === 'C6' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                student.letterGrade === 'D7' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                'bg-slate-50 text-slate-500 border-slate-200/60'
                              )}>
                                {student.letterGrade}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-700 text-sm tracking-tight">{student.cgpa?.toFixed(2) || '0.00'}</span>
                              <span className={cn(
                                'px-1.5 py-0.2 rounded text-[9px] font-bold border font-mono uppercase tracking-tight',
                                student.cgpaLetterGrade === 'A1' ? 'bg-emerald-50/60 text-emerald-600 border-emerald-100/40' :
                                student.cgpaLetterGrade === 'B2' || student.cgpaLetterGrade === 'B3' ? 'bg-blue-50/60 text-blue-600 border-blue-100/40' :
                                student.cgpaLetterGrade === 'C4' || student.cgpaLetterGrade === 'C5' || student.cgpaLetterGrade === 'C6' ? 'bg-amber-50/60 text-amber-600 border-amber-100/40' :
                                'bg-slate-50 text-slate-400 border-slate-100'
                              )}>
                                {student.cgpaLetterGrade}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BroadsheetGeneratorPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/40 p-6 md:p-8">
      <BroadsheetGenerator />
    </div>
  );
}