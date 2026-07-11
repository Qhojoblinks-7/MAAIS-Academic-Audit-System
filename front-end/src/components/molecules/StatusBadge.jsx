import React from 'react';
import { cn } from '../../lib/utils';

export function StatusBadge({ status, children, className }) {
  const statusConfig = {
    DRAFT: 'muted',
    SUBMITTED: 'brand',
    VERIFIED: 'success',
    LOCKED: 'success',
    COMPLETE: 'success',
    RESOLVED: 'success',
    FLAGGED: 'destructive',
    PENDING: 'brand',
    UNLOCKED: 'warning',
  };

  const colorMap = {
    muted: 'bg-muted text-text-secondary border border-border',
    brand: 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20',
    success: 'bg-success/10 text-success border border-success/20',
    destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
  };

  const config = statusConfig[status] || 'muted';

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider",
      colorMap[config],
      className
    )}>
      <span>{children || status}</span>
    </span>
  );
}
