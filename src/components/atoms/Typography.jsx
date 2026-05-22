import { cn } from '../../lib/utils';

const variants = {
  h1: 'text-2xl md:text-3xl font-black',
  h2: 'text-xl md:text-2xl font-bold',
  h3: 'text-lg font-semibold',
  body: 'text-sm font-medium',
  label: 'text-[10px] font-bold uppercase tracking-wider',
  caption: 'text-[9px] text-gray-500',
  tiny: 'text-[8px] uppercase tracking-widest',
};

export function Typography({ variant = 'body', children, className, ...props }) {
  const Component = variant === 'h1' ? 'h1' : variant === 'h2' ? 'h2' : variant === 'h3' ? 'h3' : 'p';
  return (
    <Component className={cn(variants[variant], className)} {...props}>
      {children}
    </Component>
  );
}