import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AcademicJourneyPanel({ studentData }) {
  if (!studentData || !studentData.academicHistory) {
    return <p className="text-center text-text-secondary py-4">No academic history available.</p>;
  }

  const [selectedSubject, setSelectedSubject] = React.useState('');

  // Extract all unique subjects from academic history
  const allSubjects = React.useMemo(() => {
    return Array.from(
      new Set(
        studentData.academicHistory.flatMap((term) =>
          (term.subjects || []).map((subj) => subj.name || subj.subject || subj.subj)
        )
      )
    ).filter(Boolean).sort();
  }, [studentData.academicHistory]);

  // Set default subject to first available or Core Mathematics if it exists
  React.useEffect(() => {
    if (allSubjects.length > 0 && !selectedSubject) {
      const defaultSubject = allSubjects.includes('Core Mathematics')
        ? 'Core Mathematics'
        : allSubjects[0];
      setSelectedSubject(defaultSubject);
    }
  }, [selectedSubject, allSubjects]);

  // Prepare data for the selected subject
  const chartData = React.useMemo(() => {
    if (!selectedSubject) return [];
    return studentData.academicHistory.map((term) => {
      const subject = (term.subjects || []).find((subj) => 
        (subj.name || subj.subject || subj.subj) === selectedSubject
      );
      return {
        term: `${term.year || term.yearLabel || ''} ${term.term || ''}`.trim(),
        score: subject ? (subject.totalScore ?? subject.score ?? 0) : 0,
      };
    });
  }, [studentData.academicHistory, selectedSubject]);

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-xl border border-border p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Academic Journey Tracker
        </h3>
        
        <div className="mb-6">
          <label htmlFor="subject-select" className="block text-xs font-black uppercase tracking-wider text-text-secondary mb-2">
            Select Subject Profile:
          </label>
          <select
            id="subject-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full max-w-xs px-3 py-2 bg-surface border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all cursor-pointer"
          >
            {allSubjects.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>

        {selectedSubject && chartData.length > 0 && (
          <div className="h-96 w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis 
                  dataKey="term" 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 500 }} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--surface)', 
                    borderColor: 'var(--border)',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 600 }}
                  labelStyle={{ color: 'var(--text-secondary)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '16px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="var(--brand-primary)" 
                  strokeWidth={3}
                  activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--brand-primary)' }}
                  dot={{ r: 4, strokeWidth: 2, stroke: 'var(--surface)', fill: 'var(--brand-primary)' }}
                  name={selectedSubject} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Summary of progress */}
      {selectedSubject && chartData.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-4">
          <h3 className="text-base font-semibold text-text-primary mb-4">
            Progress Summary for {selectedSubject}
          </h3>
          <div className="space-y-2">
            {chartData.map((point, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-background rounded-xl border border-border/40 transition-all hover:border-border">
                <span className="text-xs font-semibold text-text-primary">{point.term}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold text-brand-primary bg-[var(--brand-primary)]/10">
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

export default AcademicJourneyPanel;