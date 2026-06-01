import React from 'react';
import { cn } from '../../lib/utils';

export function StatusBadge({ status, children, className }) {
  const statusConfig = {
    DRAFT: { color: 'gray', icon: '📝' },
    SUBMITTED: { color: 'blue', icon: '📤' },
    VERIFIED: { color: 'emerald', icon: '✓' },
    LOCKED: { color: 'emerald', icon: '🔒' },
  };

  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider",
      `bg-${config.color}-50 text-${config.color}-700 border border-${config.color}-200/60`,
      className
    )}>
      <span>{config.icon}</span>
      {children || status}
    </span>
  );
}
