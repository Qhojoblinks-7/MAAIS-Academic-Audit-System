import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AcademicJourneyPanel({ studentData }) {
  if (!studentData || !studentData.academicHistory) {
    return <p className="text-center text-gray-500 py-4">No academic history available.</p>;
  }

  const [selectedSubject, setSelectedSubject] = React.useState('');

  // Extract all unique subjects from academic history
  const allSubjects = Array.from(
    new Set(
      studentData.academicHistory.flatMap((term) =>
        (term.subjects || []).map((subj) => subj.name || subj.subject || subj.subj)
      )
    )
  ).filter(Boolean).sort();

  // Set default subject to first available or Core Mathematics if exists
  React.useEffect(() => {
    if (allSubjects.length > 0 && !selectedSubject) {
      const defaultSubject = allSubjects.includes('Core Mathematics')
        ? 'Core Mathematics'
        : allSubjects[0];
      setSelectedSubject(defaultSubject);
    }
  }, [allSubjects, selectedSubject]);

  // Prepare data for the selected subject
  const chartData = React.useMemo(() => {
    if (!selectedSubject) return [];
    return studentData.academicHistory.map((term) => {
      const subject = (term.subjects || []).find((subj) => 
        (subj.name || subj.subject || subj.subj) === selectedSubject
      );
      return {
        term: `${term.year || term.yearLabel} ${term.term || ''}`,
        score: subject ? (subject.totalScore ?? subject.score ?? 0) : 0,
      };
    });
  }, [studentData.academicHistory, selectedSubject]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Academic Journey Tracker
        </h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Subject:
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm"
          >
            {allSubjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>
        {selectedSubject && chartData.length > 0 && (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="term" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#8884d8" name={selectedSubject} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Summary of progress */}
      {selectedSubject && chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Progress Summary for {selectedSubject}
          </h3>
          <div className="space-y-3">
            {chartData.map((point, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{point.term}</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium">
                  {point.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}