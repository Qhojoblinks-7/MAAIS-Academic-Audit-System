import React from 'react';
import { cn } from '../../lib/utils';

export function SkeletonLoader({ 
  type = 'rect', 
  width = '100%', 
  height = '1rem', 
  className = '',
  count = 1
}) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  if (type === 'circle') {
    return (
      <div className={cn(baseClasses, className)} 
          style={{ width, height, borderRadius: '50%' }} 
          aria-hidden="true">
      </div>
    );
  }
  
  if (type === 'text') {
    const lines = Array.from({ length: count }, (_, i) => (
      <div key={i} className={cn(baseClasses, className)} 
           style={{ 
             width: i === count - 1 ? '60%' : '100%', 
             height: '0.75rem', 
             marginBottom: '0.5rem' 
           }} 
           aria-hidden="true">
      </div>
    ));
    return <>{lines}</>;
  }
  
  // Default to rect
  return (
    <div className={cn(baseClasses, className)} 
        style={{ width, height }} 
        aria-hidden="true">
    </div>
  );
}

// Export a preset for common skeleton types
export const SkeletonText = ({ count = 3, className = '' }) => (
  <SkeletonLoader type="text" count={count} className={className} />
);

export const SkeletonAvatar = ({ className = '' }) => (
  <SkeletonLoader type="circle" width="2.5rem" height="2.5rem" className={className} />
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={className}>
    <SkeletonLoader type="rect" width="100%" height="0.5rem" className="mb-2" />
    <SkeletonText count={3} className="mb-2" />
    <SkeletonLoader type="rect" width="60%" height="0.375rem" className="mb-2" />
  </div>
);

export const SkeletonTableRow = ({ columns = 4, className = '' }) => (
  <div className={cn("flex items-start gap-4 py-3", className)} aria-hidden="true">
    {[...Array(columns)].map((_, index) => (
      <SkeletonLoader 
        key={index} 
        type="rect" 
        width={index === 0 ? '20%' : '80%'} 
        height="0.75rem" 
        className="flex-1"
      />
    ))}
  </div>
);