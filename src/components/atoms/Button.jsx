import { cn } from '../../lib/utils';

const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

const variants = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  link: 'bg-transparent text-emerald-600 hover:text-emerald-700 underline-offset-4 hover:underline p-0',
};

const sizes = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({ variant = 'primary', size = 'md', className, children, leftIcon, rightIcon, ...props }) {
  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {leftIcon && <span className="mr-2 -ml-1">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2 -mr-1">{rightIcon}</span>}
    </button>
  );
}