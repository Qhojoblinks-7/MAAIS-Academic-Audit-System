import React from 'react';

export function BroadsheetComparisonPanel({ studentData }) {
  if (!studentData || !studentData.academicHistory || studentData.academicHistory.length === 0) {
    return <p className="text-center text-gray-500 py-4">No academic history available for comparison.</p>;
  }

  const currentYearForm = studentData.yearForm || '—';
  const currentSemester = studentData.semester || '—';

  // Find current term in academicHistory
  const currentTerm = studentData.academicHistory.find(
    term => term.year === currentYearForm && term.term === currentSemester
  );

  if (!currentTerm) {
    return <p className="text-center text-gray-500 py-4">Current term not found in academic history.</p>;
  }

  // Sort academicHistory by year and term to find previous term
  const sortedHistory = [...studentData.academicHistory].sort((a, b) => {
    const yearA = a.year === 'SHS 1' ? 1 : a.year === 'SHS 2' ? 2 : 3;
    const yearB = b.year === 'SHS 1' ? 1 : b.year === 'SHS 2' ? 2 : 3;
    if (yearA !== yearB) return yearA - yearB;
    const termA = a.term === 'Term 1' ? 1 : a.term === 'Term 2' ? 2 : 3;
    const termB = b.term === 'Term 1' ? 1 : b.term === 'Term 2' ? 2 : 3;
    return termA - termB;
  });

  const currentIndex = sortedHistory.findIndex(
    term => term.year === currentYearForm && term.term === currentSemester
  );

  if (currentIndex === 0) {
    return <p className="text-center text-gray-500 py-4">No previous term available for comparison.</p>;
  }

  const previousTerm = sortedHistory[currentIndex - 1];

// Get all unique subject names from both terms
   const currentSubjects = new Map();
   currentTerm.subjects.forEach(subj => {
     currentSubjects.set((subj.name || subj.subject || '').toLowerCase(), subj.score ?? 0);
   });

   const previousSubjects = new Map();
   previousTerm.subjects.forEach(subj => {
     previousSubjects.set((subj.name || subj.subject || '').toLowerCase(), subj.score ?? 0);
   });

   // Get all unique subject names from both terms
   const allSubjectNames = [...new Set([
     ...currentSubjects.keys(),
     ...previousSubjects.keys()
   ])].sort();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Broadsheet Comparison: {previousTerm.year} {previousTerm.term} vs {currentYearForm} {currentSemester}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Previous Term ({previousTerm.term})
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Term ({currentSemester})
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allSubjectNames.map((subjectName, index) => {
                const currentScore = currentSubjects.get(subjectName);
                const previousScore = previousSubjects.get(subjectName);
                
                // Skip if subject not in both terms
                if (currentScore === undefined || previousScore === undefined) {
                  return null;
                }

                const change = currentScore - previousScore;
                const percentChange = ((change / previousScore) * 100).toFixed(1);
                const isImprovement = change >= 0;

                return (
                  <tr key={`${subjectName}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subjectName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {previousScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {currentScore}
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm">
                       <span className={`${isImprovement ? 'text-green-600' : 'text-red-600'} font-medium`}>
                         {change >= 0 ? `+${change}` : change} ({percentChange}%)
                       </span>
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isImprovement ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {isImprovement ? '▲ Improved' : '▼ Declined'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {allSubjectNames.size === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No matching subjects found between terms.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary of significant changes */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Summary
        </h3>
        <div className="space-y-3">
          {/* Count improvements and declines */}
          {/* We'll calculate from the data above */}
          {Array.from(allSubjectNames).map(subjectName => {
            const currentScore = currentSubjects.get(subjectName);
            const previousScore = previousSubjects.get(subjectName);
            if (currentScore === undefined || previousScore === undefined) return null;
            
            const change = currentScore - previousScore;
            return (
              <div key={subjectName} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{subjectName}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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