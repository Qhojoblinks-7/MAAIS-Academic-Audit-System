import React from 'react';
import { CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { EmptyState } from '../../components/molecules';

export function HistoryTab({ academicHistory }) {
  if (academicHistory.length === 0) {
    return <EmptyState context="results" variant="compact" />;
  }

  return (
    <div className="divide-y divide-gray-200/40">
      {academicHistory.map((term, idx) => (
        <div key={idx} className="py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-700">{term.year} {term.term}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-gray-600">
                Avg: {term.subjects?.length ? (term.subjects.reduce((a, s) => a + (s.score || 0), 0) / term.subjects.length).toFixed(1) : 0}
              </span>
              {term.approvalStatus === 'APPROVED' ? (
                <CheckCircle size={11} className="text-emerald-500" />
              ) : (
                <XCircle size={11} className="text-amber-500" />
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
            {term.subjects?.map((sub, si) => (
              <div key={si} className="flex items-center justify-between p-1.5 bg-slate-50 rounded-md border border-slate-100">
                <span className="text-[9px] font-medium text-gray-600 truncate">{sub.name}</span>
                <span className="text-[9px] font-black text-gray-900">{sub.grade || sub.score?.toFixed(0) || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}