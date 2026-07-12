import React from 'react';
import { BarChart3 } from 'lucide-react';
import { cn } from '../../../lib/utils';

const colorStyles = {
  emerald: 'bg-success/10 text-success border-success/20',
  rose: 'bg-destructive/10 text-destructive border-destructive/20',
  amber: 'bg-warning/10 text-warning border-warning/20',
  blue: 'bg-brand-primary/5 text-brand-primary border-brand-primary/20',
  gray: 'bg-background text-text-primary border-border'
};

export function StatCard({ label, value, icon: Icon, color = 'gray', trend }) {
  return (
    <div className="bg-surface p-3 rounded-xl border border-border shadow-xs w-full flex flex-col justify-between min-w-0">
      <div className="flex items-center gap-2.5 mb-2 min-w-0">
        {/* Compressed Icon Frame */}
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border", colorStyles[color])}>
          <Icon size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-black text-text-primary tracking-tighter leading-none truncate">
            {value}
          </p>
          <p className="text-[8px] font-black text-text-secondary uppercase tracking-wider mt-0.5 font-mono leading-none truncate">
            {label}
          </p>
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-1 text-[8.5px] font-bold text-success truncate bg-success/10 border border-success/20 w-fit px-1.5 py-0.5 rounded-md font-mono mt-0.5">
          <BarChart3 size={10} className="shrink-0" /> 
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status, label }) {
  const styles = {
    PAID: 'bg-success/10 text-success border-success/20',
    PARTIAL: 'bg-warning/10 text-warning border-warning/20',
    PENDING: 'bg-background text-text-secondary border-border',
    OVERDUE: 'bg-destructive/10 text-destructive border-destructive/20',
    ACTIVE: 'bg-success/10 border-success/20 text-success',
    INACTIVE: 'bg-background border-border text-text-secondary',
    READY: 'bg-success/10 text-success border-success/20',
    MISSING_MARKS: 'bg-destructive/10 text-destructive border-destructive/20',
    PENDING_APPROVAL: 'bg-warning/10 text-warning border-warning/20'
  };

  return (
    <span className={cn(
      "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border inline-block whitespace-nowrap font-mono leading-none",
      styles[status] || 'bg-background text-text-primary border-border'
    )}>
      {label || status.replace('_', ' ')}
    </span>
  );
}
