import React from 'react';

export function RecentResultsTab({ recentResults }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="text-left text-[9px] font-black uppercase text-gray-400 border-b border-gray-200/60">
            <th className="pb-2 pr-4">Subject</th>
            <th className="pb-2 pr-4">Term</th>
            <th className="pb-2 pr-4">SBA</th>
            <th className="pb-2 pr-4">Exam</th>
            <th className="pb-2 pr-4">Total</th>
            <th className="pb-2 pr-4">Grade</th>
            <th className="pb-2">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200/40">
          {recentResults.map((r, i) => (
            <tr key={i}>
              <td className="py-2 pr-4 font-medium text-gray-800">{r.subject?.name || '—'}</td>
              <td className="py-2 pr-4 font-mono text-gray-600">{r.term?.termNumber || '—'}</td>
              <td className="py-2 pr-4 font-mono">{r.classScore ?? 0}</td>
              <td className="py-2 pr-4 font-mono">{r.examScore ?? 0}</td>
              <td className="py-2 pr-4 font-mono font-bold">{r.totalScore ?? 0}</td>
              <td className="py-2 pr-4 font-black text-emerald-700">{r.grade || '—'}</td>
              <td className="py-2">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                  r.auditStatus === 'LOCKED' ? 'bg-slate-100 text-slate-600' :
                  r.auditStatus === 'AUDITED' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>{r.auditStatus || '—'}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}