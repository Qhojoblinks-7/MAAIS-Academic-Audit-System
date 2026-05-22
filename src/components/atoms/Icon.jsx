import { cn } from '../../lib/utils';

const colors = {
  primary: 'text-emerald-600',
  secondary: 'text-gray-500',
  success: 'text-emerald-500',
  warning: 'text-amber-500',
  error: 'text-rose-500',
  info: 'text-blue-500',
};

export function Icon({ icon: IconComponent, size = 16, color = 'secondary', className, ...props }) {
  return (
    <IconComponent
      size={size}
      className={cn(colors[color] || colors.secondary, className)}
      {...props}
    />
  );
}