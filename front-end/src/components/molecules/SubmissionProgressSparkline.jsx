import React from 'react';
import { cn } from '../../lib/utils';

export function SubmissionProgressSparkline({ value, size = 'sm' }) {
  const getColor = () => {
    if (value >= 90) return 'emerald';
    if (value >= 70) return 'amber';
    return 'rose';
  };

  const color = getColor();
  const height = size === 'sm' ? 'h-1' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex-1 bg-gray-100 rounded-full overflow-hidden", height)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500", `bg-${color}-500`)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[10px] font-medium text-gray-600 min-w-[2.5rem]">{value}%</span>
    </div>
  );
}
