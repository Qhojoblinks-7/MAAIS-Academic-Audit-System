import React from 'react';

export function WASSCETab({ wassceResults }) {
  if (wassceResults.length === 0) {
    return <p className="text-xs text-gray-400 py-6 text-center">No WASSCE results on file</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="text-left text-[9px] font-black uppercase text-gray-400 border-b border-gray-200/60">
            <th className="pb-2 pr-4">Subject</th>
            <th className="pb-2 pr-4">Grade</th>
            <th className="pb-2 pr-4">Raw Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200/40">
          {wassceResults.map((r, i) => (
            <tr key={i}>
              <td className="py-2 pr-4 font-medium text-gray-800">{r.subject || r.subjectName || '—'}</td>
              <td className="py-2 pr-4 font-black text-emerald-700">{r.grade || '—'}</td>
              <td className="py-2 pr-4 font-mono">{r.score ?? r.rawScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}