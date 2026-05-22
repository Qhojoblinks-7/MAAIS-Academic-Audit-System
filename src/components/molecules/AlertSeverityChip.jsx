import React from 'react';
import { cn } from '../../lib/utils';

export function AlertSeverityChip({ severity, className }) {
  const severityConfig = {
    HIGH: { color: 'rose', label: 'Critical' },
    MEDIUM: { color: 'amber', label: 'Warning' },
    LOW: { color: 'blue', label: 'Info' },
  };

  const config = severityConfig[severity] || severityConfig.LOW;

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider",
      `bg-${config.color}-50 text-${config.color}-700`,
      className
    )}>
      {config.label}
    </span>
  );
}
