import { cn } from '../../lib/utils';

export function PageLayout({ children, title, subtitle, action, className, ...props }) {
  return (
    <div className={cn('flex-1 flex flex-col min-h-0 bg-gray-50/30', className)} {...props}>
      <div className="px-6 lg:px-8 pt-6 pb-2">
        <div className="max-w-7xl mx-auto flex items-start justify-between">
          <div>
            {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      </div>
      <div className="flex-1 overflow-auto px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto space-y-5">
          {children}
        </div>
      </div>
    </div>
  );
}