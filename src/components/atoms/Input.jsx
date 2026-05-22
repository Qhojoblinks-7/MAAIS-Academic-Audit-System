import { cn } from '../../lib/utils';
import React from 'react';

export const Input = React.forwardRef(({ className, type = 'text', error, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex w-full rounded-xl border bg-white px-3 py-2 text-sm font-medium',
        'border-gray-200 placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',
        error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex w-full rounded-xl border bg-white px-3 py-2 text-sm font-medium',
        'border-gray-200 placeholder:text-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',
        'resize-none',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      className={cn(
        'flex w-full rounded-xl border bg-white px-3 py-2 text-sm font-medium',
        'border-gray-200',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = 'Select';