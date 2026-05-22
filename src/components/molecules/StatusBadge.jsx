import React from 'react';
import { cn } from '../../lib/utils';

export function StatusBadge({ status, children, className }) {
  const statusConfig = {
    RESOLVED: { color: 'emerald', icon: '✓' },
    FLAGGED: { color: 'rose', icon: '⚠' },
    LOCKED: { color: 'gray', icon: '🔒' },
    DRAFT: { color: 'amber', icon: '📝' },
    ACTIVE: { color: 'blue', icon: '●' },
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
