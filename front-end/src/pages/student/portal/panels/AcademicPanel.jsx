import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '@/index.css';

export function AcademicPanel({ studentData }) {
  const historyData = React.useMemo(() => {
    return studentData?.history || studentData?.academicHistory || [];
  }, [studentData]);

  // Extract unique formatted subjects cleanly outside the render tree
  const uniqueSubjectKeys = React.useMemo(() => {
    if (!historyData.length) return [];
    return Array.from(
      new Set(
        historyData.flatMap((h) =>
          (h.subjects || []).map((s) =>
            (s.name || s.subject || s.subj || '').toLowerCase().trim().replace(/\s+/g, '')
          )
        )
      )
    );
  }, [historyData]);

  // Pre-format line chart coordinates to prevent micro-stuttering on viewport scale shifts
  const processedChartData = React.useMemo(() => {
    return historyData.map((h) => ({
      term: `${h.yearLabel || h.year || ''} ${h.term || ''}`.trim(),
      ...(h.subjects || []).reduce((acc, subject) => {
        const subjectName = (subject.name || subject.subject || subject.subj || '')
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '');
        return {
          ...acc,
          [subjectName]: subject.totalScore || subject.score || 0,
        };
      }, {}),
    }));
  }, [historyData]);

  // Extract baseline raw display names for the vertical subject progress grid elements
  const uniqueDisplaySubjects = React.useMemo(() => {
    return Array.from(
      new Set(
        historyData.flatMap((h) => (h.subjects || []).map((s) => (s.name || s.subject || s.subj || '').trim()))
      )
    ).filter(Boolean);
  }, [historyData]);

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header Panel */}
      <div className="bg-surface rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-black text-text-primary">Academic Journey</h2>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Track your performance trends across all terms and subjects
        </p>
      </div>

      {historyData.length > 0 ? (
        <>
          {/* Performance Trends Chart Panel */}
          <div className="bg-surface rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-black text-text-primary">Performance Trends</h3>
              <p className="text-[10px] text-text-secondary block md:hidden mt-0.5">
                Rotate your device or swipe horizontally to view full trendlines
              </p>
            </div>
            
            {/* Responsive chart container wrapper */}
            <div className="w-full overflow-x-auto overflow-y-hidden -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="h-64 sm:h-80 md:h-96 min-w-[320px] w-full pr-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={processedChartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis 
                      dataKey="term" 
                      tick={{ fontSize: 10, fontWeight: 600, fill: 'var(--text-secondary)' }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10, fontWeight: 600, fill: 'var(--text-secondary)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--surface)',
                        fontSize: '12px',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                      }} 
                      itemStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                      labelStyle={{ color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '4px' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '15px', color: 'var(--text-primary)' }}
                      iconType="circle"
                    />
                    {uniqueSubjectKeys.map((subject, index) => (
                      <Line
                        key={subject}
                        type="monotone"
                        dataKey={subject}
stroke={[
                           'var(--brand-primary)', 
                           'var(--success)', 
                           'var(--warning)', 
                           'var(--danger)', 
                           'var(--brand-secondary)'
                         ][index % 5]}
                        strokeWidth={2.5}
                        dot={{ r: 3, strokeWidth: 2, stroke: 'var(--surface)' }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Subject-wise Progress Panel */}
          <div className="bg-surface rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-black text-text-primary mb-4">Subject-wise Progress</h3>
            <div className="space-y-6">
              {uniqueDisplaySubjects.map((subject) => {
                const subjectScores = historyData
                  .map((h) => {
                    const foundSubj = (h.subjects || []).find(
                      (s) => (s.name || s.subject || s.subj || '').toLowerCase().trim() === subject.toLowerCase().trim()
                    );

                    return foundSubj
                      ? {
                          term: `${h.yearLabel || h.year || ''} ${h.term || ''}`.trim(),
                          score: foundSubj.totalScore || foundSubj.score || 0,
                          grade: foundSubj.grade || '-',
                        }
                      : null;
                  })
                  .filter(Boolean);

                return (
                  <div key={subject} className="border-l-4 border-brand-primary pl-3 sm:pl-4 pb-2 last:pb-0">
                    <h4 className="font-black text-sm sm:text-base text-text-primary mb-2">{subject}</h4>
                    <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                      {subjectScores.map((score, idx) => (
                        <div key={idx} className="flex items-center justify-between px-3 py-2 bg-background rounded-xl border border-border/30 transition-colors hover:bg-surface">
                          <span className="text-xs sm:text-sm font-medium text-text-primary">{score.term}</span>
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-7 rounded-lg bg-brand-primary/10 text-brand-primary text-[11px] font-black flex items-center justify-center">
                              {score.score}%
                            </span>
                            <span className="text-xs font-black text-text-secondary min-w-[24px] text-right">
                              {score.grade}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm text-center">
          {/* Empty State Panel */}
          <h3 className="text-base sm:text-lg font-black text-text-primary">Academic Journey</h3>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-sm mx-auto">
            Bayesian direction signal & longitudinal trends will be wired to API historical series (pending).
          </p>
        </div>
      )}
    </div>
  );
}

export default AcademicPanel;