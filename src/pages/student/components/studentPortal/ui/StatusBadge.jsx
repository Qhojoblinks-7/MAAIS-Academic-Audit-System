import React from 'react';
import { cn } from './cn';

const DEFAULT_APPROVAL = 'DRAFT';

const SCHEMES = {
  LOCKED: 'bg-gray-100 text-gray-800 border-gray-200 print:bg-gray-100 print:text-gray-900',
  VERIFIED: 'bg-blue-50 text-blue-700 border-blue-100 print:bg-blue-50 print:text-blue-900',
  SUBMITTED: 'bg-amber-50 text-amber-700 border-amber-100 print:bg-amber-50 print:text-amber-900',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-100 print:bg-emerald-50 print:text-emerald-900',
  DRAFT: 'bg-gray-50 text-gray-500 border-gray-200 print:bg-transparent print:text-gray-600',
};

export function StatusBadge({ status }) {
  const normalized = String(status || '').toUpperCase() || DEFAULT_APPROVAL;
  const activeClass = SCHEMES[normalized] || SCHEMES.DRAFT;

  return (
    <span
      className={cn(
        // Mobile-first sizing: text-xs (12px) scales nicely down to text-[11px] via sm: breakpoint modifiers if needed
        'inline-flex items-center justify-center px-2 py-0.5 sm:px-2.5 sm:py-1',
        'text-[11px] sm:text-xs font-black tracking-widest uppercase rounded-md border',
        'select-none shrink-0 transition-colors duration-150',
        // Forces explicit visibility even when background styling gets wiped out by a PDF printer
        'print:print-color-adjust-exact print:border-gray-400',
        activeClass
      )}
    >
      {normalized}
    </span>
  );
}