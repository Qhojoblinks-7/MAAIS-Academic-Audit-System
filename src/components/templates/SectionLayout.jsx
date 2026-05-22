import { cn } from '../../lib/utils';

export function SectionLayout({ children, title, icon, className, ...props }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 p-4', className)} {...props}>
      {title && (
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}