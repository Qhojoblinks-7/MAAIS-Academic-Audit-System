import React from 'react';
import { BarChart3 } from 'lucide-react';
import { cn } from '../../../lib/utils';

const colorStyles = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100/60',
  rose: 'bg-rose-50 text-rose-700 border-rose-100/60',
  amber: 'bg-amber-50 text-amber-700 border-amber-100/60',
  blue: 'bg-blue-50 text-blue-700 border-blue-100/60',
  gray: 'bg-gray-50 text-gray-700 border-gray-100'
};

export function StatCard({ label, value, icon: Icon, color = 'gray', trend }) {
  return (
    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs w-full flex flex-col justify-between min-w-0">
      <div className="flex items-center gap-2.5 mb-2 min-w-0">
        {/* Compressed Icon Frame */}
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border", colorStyles[color])}>
          <Icon size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-black text-gray-900 tracking-tighter leading-none truncate">
            {value}
          </p>
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider mt-0.5 font-mono leading-none truncate">
            {label}
          </p>
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-1 text-[8.5px] font-bold text-emerald-600 truncate bg-emerald-50/40 border border-emerald-100/30 w-fit px-1.5 py-0.5 rounded-md font-mono mt-0.5">
          <BarChart3 size={10} className="shrink-0" /> 
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status, label }) {
  const styles = {
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-100/80',
    PARTIAL: 'bg-amber-50 text-amber-700 border-amber-100/80',
    PENDING: 'bg-gray-50 text-gray-500 border-gray-100',
    OVERDUE: 'bg-rose-50 text-rose-700 border-rose-100/80',
    ACTIVE: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    INACTIVE: 'bg-slate-50 border-slate-200 text-slate-400',
    READY: 'bg-emerald-50 text-emerald-700 border-emerald-100/80',
    MISSING_MARKS: 'bg-rose-50 text-rose-700 border-rose-100/80',
    PENDING_APPROVAL: 'bg-amber-50 text-amber-700 border-amber-100/80'
  };

  return (
    <span className={cn(
      "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border inline-block whitespace-nowrap font-mono leading-none",
      styles[status] || 'bg-gray-50 text-gray-700 border-gray-100'
    )}>
      {label || status.replace('_', ' ')}
    </span>
  );
}