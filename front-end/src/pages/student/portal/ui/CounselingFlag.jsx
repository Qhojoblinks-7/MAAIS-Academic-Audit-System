import React from 'react';

export function CounselingFlag({ message, type = 'warning' }) {
  const colorMap = {
    warning: 'bg-warning/10 border-warning/20 text-warning',
    error: 'bg-danger/10 border-danger/20 text-danger',
    info: 'bg-brand-secondary/10 border-brand-secondary/20 text-brand-secondary',
    success: 'bg-success/10 border-success/20 text-success',
  };

  return (
    <div className={`${colorMap[type] || colorMap.warning} rounded-lg p-4 flex items-center space-x-3`}>
      <div className="flex-shrink-0">
        {type === 'warning' && (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c.77-1.333-.262-2.854-1.732-3L13.732 4c-.77-1.333-2.262-1.333-3.064 0l-3.464 6c-.77 1.333.192 2.854 1.134 3H6.062z"/>
          </svg>
        )}
        {type === 'error' && (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        )}
        {type === 'info' && (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        )}
        {type === 'success' && (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        )}
      </div>
      <div>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}