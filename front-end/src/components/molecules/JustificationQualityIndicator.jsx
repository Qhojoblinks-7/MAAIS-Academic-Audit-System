import React from 'react';
import { cn } from '../../lib/utils';

export function JustificationQualityIndicator({ text, className }) {
  const isShort = text && text.trim().length < 10;

  if (!text) return null;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded",
      isShort
        ? "bg-destructive/10 text-destructive border border-destructive/20"
        : "bg-success/10 text-success border border-success/20",
      className
    )}>
      {isShort ? 'HOD-AR-2.2 Short' : 'Sufficient'}
    </span>
  );
}
