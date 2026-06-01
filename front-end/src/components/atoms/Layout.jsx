import { cn } from '../../lib/utils';
import React from 'react';

export function Container({ children, className, maxWidth = '7xl', ...props }) {
  const maxWidthClasses = {
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    '5xl': 'max-w-5xl',
    '4xl': 'max-w-4xl',
    'full': 'max-w-full',
  };
  return (
    <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', maxWidthClasses[maxWidth], className)} {...props}>
      {children}
    </div>
  );
}

export function Grid({ children, cols = 1, gap = 4, className, ...props }) {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-6',
    12: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-12',
  };
  return (
    <div className={cn('grid', colsClasses[cols], `gap-${gap}`, className)} {...props}>
      {children}
    </div>
  );
}

export function Flex({ children, gap = 4, align = 'center', justify = 'start', className, ...props }) {
  return (
    <div className={cn('flex items-center', `gap-${gap}`, `justify-${justify}`, className)} {...props}>
      {children}
    </div>
  );
}

export function Stack({ children, gap = 4, className, ...props }) {
  return (
    <div className={cn('flex flex-col', `gap-${gap}`, className)} {...props}>
      {children}
    </div>
  );
}

export function Layout({ children, className, ...props }) {
  return <div className={cn('flex flex-col', className)} {...props}>{children}</div>;
}