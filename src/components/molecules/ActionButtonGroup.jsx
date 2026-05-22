import React from 'react';
import { cn } from '../../lib/utils';

export function ActionButtonGroup({ actions, className }) {
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600',
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {actions.map((action, i) => (
        <button
          key={i}
          onClick={action.onClick}
          disabled={action.disabled}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-lg transition-all disabled:opacity-50",
            variants[action.variant] || variants.secondary
          )}
          title={action.label}
        >
          {action.icon && <action.icon size={12} className="inline-block mr-1 -mb-0.5" />}
          {action.label}
        </button>
      ))}
    </div>
  );
}
