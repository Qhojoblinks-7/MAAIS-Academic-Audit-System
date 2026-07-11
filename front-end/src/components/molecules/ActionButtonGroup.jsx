import React from 'react';
import { cn } from '../../lib/utils';

export function ActionButtonGroup({ actions, className }) {
  const variants = {
    primary: 'bg-success hover:bg-success/90 text-background',
    secondary: 'bg-muted hover:bg-muted text-foreground',
    danger: 'bg-destructive hover:bg-destructive/90 text-background',
    ghost: 'bg-transparent hover:bg-muted text-text-secondary',
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
