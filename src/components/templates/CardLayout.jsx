import { cn } from '../../lib/utils';

export function CardLayout({ children, className, ...props }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 shadow-sm p-4', className)} {...props}>
      {children}
    </div>
  );
}