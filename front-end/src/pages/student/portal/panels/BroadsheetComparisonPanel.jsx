import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { EmptyState } from '../../../../components/molecules';

export function BroadsheetComparisonPanel({ studentData }) {
  if (!studentData || !studentData.academicHistory || studentData.academicHistory.length === 0) {
    return <EmptyState context="results" />;
  }

  const currentYearForm = studentData.yearForm || '—';
  const currentSemester = studentData.semester || '—';

  // Sort academicHistory by year and term to find previous term securely
  const sortedHistory = React.useMemo(() => {
    return [...studentData.academicHistory].sort((a, b) => {
      if (a.year !== b.year) return a.year.localeCompare(b.year);

      const termA = (a.term || '').match(/\d+/);
      const termB = (b.term || '').match(/\d+/);
      const numA = termA ? parseInt(termA[0], 10) : 999;
      const numB = termB ? parseInt(termB[0], 10) : 999;
      return numA - numB;
    });
  }, [studentData.academicHistory]);

  // Find current term in academicHistory (fallback to latest available term)
  const currentTerm = React.useMemo(() => {
    const currentTermNum = (currentSemester || '').match(/\d+/);
    let term = studentData.academicHistory.find(t => {
      if (t.year !== currentYearForm) return false;
      const termNum = (t.term || '').match(/\d+/);
      return currentTermNum && termNum && currentTermNum[0] === termNum[0];
    });
    if (!term && sortedHistory.length > 0) {
      term = sortedHistory[sortedHistory.length - 1];
    }
    return term;
  }, [studentData.academicHistory, sortedHistory, currentYearForm, currentSemester]);

  const comparisonData = React.useMemo(() => {
    if (!currentTerm) return null;

    if (sortedHistory.length < 2) {
      return null;
    }

    const currentIndex = sortedHistory.findIndex(
      term => term.year === currentTerm.year && term.term === currentTerm.term
    );
    if (currentIndex <= 0) {
      return null;
    }

    const previousTerm = sortedHistory[currentIndex - 1];

    if (!previousTerm) return null;

    const currentSubjects = new Map();
    (currentTerm.subjects || []).forEach(subj => {
      const key = (subj.name || subj.subject || '').toLowerCase().trim();
      if (key) currentSubjects.set(key, subj.score ?? subj.totalScore ?? 0);
    });

    const previousSubjects = new Map();
    (previousTerm.subjects || []).forEach(subj => {
      const key = (subj.name || subj.subject || '').toLowerCase().trim();
      if (key) previousSubjects.set(key, subj.score ?? subj.totalScore ?? 0);
    });

    // Get all unique subject names from both terms
    const allSubjectNames = [...new Set([
      ...currentSubjects.keys(),
      ...previousSubjects.keys()
    ])].sort();

    return {
      previousTerm,
      currentSubjects,
      previousSubjects,
      allSubjectNames
    };
  }, [currentTerm, sortedHistory, currentYearForm, currentSemester]);

  if (!currentTerm) {
    return <EmptyState context="results" variant="compact" />;
  }

  if (!comparisonData) {
    return <p className="text-center text-text-secondary py-4">No previous evaluation terms available for tracking comparisons.</p>;
  }

  const { previousTerm, currentSubjects, previousSubjects, allSubjectNames } = comparisonData;

  // Helper routine to convert raw lookup keys to readable textbook names
  const formatSubjectTitle = (str) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg font-black text-text-primary mb-4">
          Broadsheet Comparison: {previousTerm.year} {previousTerm.term} vs {currentYearForm} {currentSemester}
        </h3>
<div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
           <Table className="min-w-full divide-y divide-border">
             <TableHeader className="bg-background">
               <TableRow>
                 <TableHead className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider rounded-l-xl">
                   Subject Profile
                 </TableHead>
                 <TableHead className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                   Prev ({previousTerm.term})
                 </TableHead>
                 <TableHead className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                   Curr ({currentSemester})
                 </TableHead>
                 <TableHead className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                   Absolute Change
                 </TableHead>
                 <TableHead className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider rounded-r-xl">
                   Trend Vectors
                 </TableHead>
               </TableRow>
             </TableHeader>
             <TableBody className="bg-surface divide-y divide-border/60">
               {allSubjectNames.map((subjectName, index) => {
                 const currentScore = currentSubjects.get(subjectName);
                 const previousScore = previousSubjects.get(subjectName);
                 
                 // Skip row extraction if data segment is missing in either term
                 if (currentScore === undefined || previousScore === undefined) {
                   return null;
                 }

                 const change = currentScore - previousScore;
                 const percentChange = previousScore !== 0 
                   ? ((change / previousScore) * 100).toFixed(1) 
                   : change > 0 ? '100.0' : '0.0';
                 const isImprovement = change >= 0;

                 return (
                   <TableRow key={`${subjectName}-${index}`} className="hover:bg-background/40 transition-colors">
                     <TableCell className="px-4 py-3.5 whitespace-nowrap text-sm font-bold text-text-primary">
                       {formatSubjectTitle(subjectName)}
                     </TableCell>
                     <TableCell className="px-4 py-3.5 whitespace-nowrap text-sm font-medium text-text-secondary">
                       {previousScore}%
                     </TableCell>
                     <TableCell className="px-4 py-3.5 whitespace-nowrap text-sm font-bold text-text-primary">
                       {currentScore}%
                     </TableCell>
                     <TableCell className="px-4 py-3.5 whitespace-nowrap text-sm">
                       <span className={`${isImprovement ? 'text-success' : 'text-error'} font-semibold`}>
                         {change >= 0 ? `+${change}` : change} ({change >= 0 ? '+' : ''}{percentChange}%)
                       </span>
                     </TableCell>
                     <TableCell className="px-4 py-3.5 whitespace-nowrap text-sm">
                       <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                         isImprovement ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                       }`}>
                         {isImprovement ? '▲ Improved' : '▼ Declined'}
                       </span>
                     </TableCell>
                   </TableRow>
                 );
               })}
               {allSubjectNames.length === 0 && (
                  <TableRow>
                    <TableCell colSpan="5" className="px-4 py-6 text-center text-sm text-text-secondary">
                      <EmptyState context="results" variant="compact" />
                    </TableCell>
                  </TableRow>
               )}
             </TableBody>
           </Table>
         </div>
      </div>

      {/* Summary of significant progress shifts */}
      <div className="bg-surface rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg font-black text-text-primary mb-4">
          Performance Delta Vectors
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allSubjectNames.map(subjectName => {
            const currentScore = currentSubjects.get(subjectName);
            const previousScore = previousSubjects.get(subjectName);
            if (currentScore === undefined || previousScore === undefined) return null;
            
            const change = currentScore - previousScore;
            return (
              <div key={subjectName} className="flex justify-between items-center p-3 bg-background rounded-xl border border-border/40 transition-all hover:border-border">
                <span className="text-xs font-bold text-text-primary">{formatSubjectTitle(subjectName)}</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                  change >= 0 ? 'text-success bg-success/10' : 'text-error bg-error/10'
                }`}>
                  {change >= 0 ? `+${change}` : change}
                </span>
              </div>
            );
          }).filter(Boolean)}
        </div>
      </div>
    </div>
  );
}

export default BroadsheetComparisonPanel;