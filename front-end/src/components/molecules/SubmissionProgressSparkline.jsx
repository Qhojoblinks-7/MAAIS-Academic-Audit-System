import React from 'react';
import { cn } from '../../lib/utils';

export function SubmissionProgressSparkline({ value, size = 'sm' }) {
  const getColor = () => {
    if (value >= 90) return 'success';
    if (value >= 70) return 'warning';
    return 'destructive';
  };

  const color = getColor();
  const height = size === 'sm' ? 'h-1' : size === 'lg' ? 'h-3' : 'h-2';

  const colorMap = {
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex-1 bg-muted rounded-full overflow-hidden", height)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorMap[color])}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-medium text-text-secondary min-w-[2.5rem]">{value}%</span>
    </div>
  );
}
