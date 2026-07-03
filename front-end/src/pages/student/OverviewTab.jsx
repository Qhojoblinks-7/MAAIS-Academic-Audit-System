import React from 'react';
import { EmptyState } from '../../components/molecules';

export function OverviewTab({ terminalResults }) {
  if (terminalResults.length === 0) {
    return <EmptyState context="results" variant="compact" />;
  }

  const subjects = [...new Set(terminalResults.map(r => r.subject))];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {subjects.map((subject, idx) => {
        const grades = terminalResults.filter(r => r.subject === subject);
        const latest = grades[grades.length - 1];
        return (
          <div key={idx} className="p-4 bg-white/80 border border-slate-100 rounded-xl">
            <p className="text-xs font-bold text-gray-800 mb-2">{subject}</p>
            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
              <div>
                <p className="text-gray-400 uppercase">SBA</p>
                <p className="font-bold text-gray-900">{latest?.sbaScore ?? latest?.classScore ?? 0}</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase">Exam</p>
                <p className="font-bold text-gray-900">{latest?.examScore ?? 0}</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase">Final</p>
                <p className="font-bold text-gray-900">{latest?.finalScore ?? latest?.totalScore ?? 0}</p>
              </div>
              <div>
                <p className="text-gray-400 uppercase">Grade</p>
                <p className="font-black text-emerald-700">{latest?.grade || '—'}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}