import React from 'react';
import { cn } from './cn';

const DEFAULT_APPROVAL = 'DRAFT';

const SCHEMES = {
  LOCKED: 'bg-background text-text-secondary border-border print:bg-background print:text-text-primary',
  VERIFIED: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20 print:bg-brand-primary/10 print:text-brand-primary',
  SUBMITTED: 'bg-warning/10 text-warning border-warning/20 print:bg-warning/10 print:text-warning',
  APPROVED: 'bg-success/10 text-success border-success/20 print:bg-success/10 print:text-success',
  DRAFT: 'bg-surface text-text-secondary border-border print:bg-surface print:text-text-primary',
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