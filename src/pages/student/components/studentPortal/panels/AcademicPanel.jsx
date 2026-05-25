import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AcademicPanel({ studentData }) {
  const historyData = studentData?.history || studentData?.academicHistory || [];

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header Panel */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-black text-gray-900">Academic Journey</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Track your performance trends across all terms and subjects
        </p>
      </div>

      {historyData.length > 0 ? (
        <>
          {/* Performance Trends Chart Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-black text-gray-900">Performance Trends</h3>
              <p className="text-[10px] text-gray-400 block md:hidden mt-0.5">
                Rotate your device or swipe horizontally to view full trendlines
              </p>
            </div>
            
            {/* Responsive chart container wrapper */}
            <div className="w-full overflow-x-auto overflow-y-hidden -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="h-64 sm:h-80 md:h-96 min-w-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={historyData.map((h) => ({
                      term: `${h.yearLabel || h.year} ${h.term || ''}`,
                      ...(h.subjects || []).reduce((acc, subject) => {
                        const subjectName = (subject.name || subject.subject || subject.subj || '')
                          .toLowerCase()
                          .replace(/\s+/g, '');
                        return {
                          ...acc,
                          [subjectName]: subject.totalScore || subject.score || 0,
                        };
                      }, {}),
                    }))}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis 
                      dataKey="term" 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                      dy={10}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        borderColor: '#F3F4F6',
                        fontSize: '12px',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                      }} 
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '11px', fontWeight: 900, paddingTop: '15px' }}
                      iconType="circle"
                    />
                    {[
                      ...new Set(
                        historyData.flatMap((h) =>
                          (h.subjects || []).map((s) =>
                            (s.name || s.subject || s.subj || '').toLowerCase().replace(/\s+/g, '')
                          )
                        )
                      ),
                    ].map((subject, index) => (
                      <Line
                        key={subject}
                        type="monotone"
                        dataKey={subject}
                        stroke={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]}
                        strokeWidth={2.5}
                        dot={{ r: 3, strokeWidth: 2 }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Subject-wise Progress Panel */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-black text-gray-900 mb-4">Subject-wise Progress</h3>
            <div className="space-y-4 sm:space-y-5">
              {[
                ...new Set(
                  historyData.flatMap((h) => (h.subjects || []).map((s) => s.name || s.subject || s.subj))
                ),
              ].map((subject) => {
                const subjectScores = historyData
                  .map((h) => {
                    const subjectData = (h.subjects || []).find(
                      (s) => (s.name || s.subject || s.subj) === subject
                    );

                    return subjectData
                      ? {
                          term: `${h.yearLabel || h.year} ${h.term || ''}`,
                          score: subjectData.totalScore || subjectData.score || 0,
                          grade: subjectData.grade || '-',
                        }
                      : null;
                  })
                  .filter(Boolean);

                return (
                  <div key={subject} className="border-l-4 border-blue-500 pl-3 sm:pl-4 pb-2 last:pb-0">
                    <h4 className="font-black text-sm sm:text-base text-gray-900 mb-2">{subject}</h4>
                    <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                      {subjectScores.map((score, idx) => (
                        <div key={idx} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl transition-colors hover:bg-gray-100/70">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">{score.term}</span>
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-7 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-black flex items-center justify-center">
                              {score.score}%
                            </span>
                            <span className="text-xs font-black text-gray-500 min-w-[20px] text-right">
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
        /* Empty State Panel */
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center">
          <h3 className="text-base sm:text-lg font-black text-gray-900">Academic Journey</h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            Bayesian direction signal & longitudinal trends will be wired to API historical series (pending).
          </p>
        </div>
      )}
    </div>
  );
}