import React from 'react';
import { cn } from '../../lib/utils';

export function JustificationQualityIndicator({ text, className }) {
  const isShort = text && text.trim().length < 10;

  if (!text) return null;

  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded",
      isShort
        ? "bg-rose-50 text-rose-700 border border-rose-200/60"
        : "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
      className
    )}>
      {isShort ? 'HOD-AR-2.2 Short' : 'Sufficient'}
    </span>
  );
}
