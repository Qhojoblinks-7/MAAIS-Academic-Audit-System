import React from 'react';
import { cn } from '../../lib/utils';

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4 border border-gray-100">
          <Icon size={32} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-gray-500 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-xl hover:bg-emerald-700 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
