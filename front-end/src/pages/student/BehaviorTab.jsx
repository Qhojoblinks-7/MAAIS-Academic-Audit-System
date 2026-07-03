import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function BehaviorTab({ behavioralLogs, formatDate }) {
  return (
    <div className="space-y-3">
      {behavioralLogs.length > 0 ? (
        behavioralLogs.map((log, idx) => (
          <div key={idx} className="p-3 bg-white/60 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase text-gray-500">Rating: {log.attitude ?? log.rating ?? '—'}</span>
              <span className="text-[9px] font-mono text-gray-400">{formatDate(log.createdAt)}</span>
            </div>
            <p className="text-[11px] text-gray-700">{log.remarks || log.comments || 'No comments recorded.'}</p>
          </div>
        ))
      ) : (
        <p className="text-xs text-gray-400 py-6 text-center">No behavioral logs recorded</p>
      )}
    </div>
  );
}