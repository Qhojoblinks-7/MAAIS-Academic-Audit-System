import React from 'react';

export function SimpleBar({ value, max = 100, color = 'bg-brand-secondary' }) {
  const pct = Math.min(100, Math.max(0, (Number(value) || 0) / max * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono font-bold text-gray-600 w-8 text-right">{value ?? 0}</span>
    </div>
  );
}