import { cn } from '../../lib/utils';

export function DashboardLayout({ children, className, ...props }) {
  return (
    <div className={cn('flex-1 flex flex-col min-h-0 bg-gray-50/30', className)} {...props}>
      {children}
    </div>
  );
}