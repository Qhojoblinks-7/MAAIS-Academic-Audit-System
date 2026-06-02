import React from 'react';

export function BroadsheetComparisonPanel({ studentData }) {
  if (!studentData || !studentData.academicHistory || studentData.academicHistory.length === 0) {
    return <p className="text-center text-text-secondary py-4">No academic history available for comparison.</p>;
  }

  const currentYearForm = studentData.yearForm || '—';
  const currentSemester = studentData.semester || '—';

  // Find current term in academicHistory
  const currentTerm = React.useMemo(() => {
    return studentData.academicHistory.find(
      term => term.year === currentYearForm && term.term === currentSemester
    );
  }, [studentData.academicHistory, currentYearForm, currentSemester]);

  // Sort academicHistory by year and term to find previous term securely
  const sortedHistory = React.useMemo(() => {
    return [...studentData.academicHistory].sort((a, b) => {
      const yearA = a.year === 'SHS 1' ? 1 : a.year === 'SHS 2' ? 2 : 3;
      const yearB = b.year === 'SHS 1' ? 1 : b.year === 'SHS 2' ? 2 : 3;
      if (yearA !== yearB) return yearA - yearB;
      
      const termA = a.term === 'Term 1' ? 1 : a.term === 'Term 2' ? 2 : 3;
      const termB = b.term === 'Term 1' ? 1 : b.term === 'Term 2' ? 2 : 3;
      return termA - termB;
    });
  }, [studentData.academicHistory]);

  const comparisonData = React.useMemo(() => {
    if (!currentTerm) return null;

    const currentIndex = sortedHistory.findIndex(
      term => term.year === currentYearForm && term.term === currentSemester
    );

    if (currentIndex <= 0) return null;

    const previousTerm = sortedHistory[currentIndex - 1];

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
    return <p className="text-center text-text-secondary py-4">Current term data not found in ledger maps.</p>;
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
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider rounded-l-xl">
                  Subject Profile
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Prev ({previousTerm.term})
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Curr ({currentSemester})
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Absolute Change
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider rounded-r-xl">
                  Trend Vectors
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border/60">
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
                  <tr key={`${subjectName}-${index}`} className="hover:bg-background/40 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap text-sm font-bold text-text-primary">
                      {formatSubjectTitle(subjectName)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-sm font-medium text-text-secondary">
                      {previousScore}%
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-sm font-bold text-text-primary">
                      {currentScore}%
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-sm">
                      <span className={`${isImprovement ? 'text-success' : 'text-error'} font-semibold`}>
                        {change >= 0 ? `+${change}` : change} ({change >= 0 ? '+' : ''}{percentChange}%)
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isImprovement ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                      }`}>
                        {isImprovement ? '▲ Improved' : '▼ Declined'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {allSubjectNames.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center text-sm text-text-secondary">
                    No matching subjects found between sequential target profiles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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