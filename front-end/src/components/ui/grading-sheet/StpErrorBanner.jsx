import React from 'react';
import { AlertOctagon, X, HelpCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

export function StpErrorBanner({ 
  showSTPOverlay, 
  stpErrors = [], 
  onClose 
}) {
  if (!showSTPOverlay || stpErrors.length === 0) return null;

  return (
    <div 
      role="alert"
      className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl transition-all duration-300 shadow-xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* High Visibility Warning Icon */}
          <div className="p-1.5 bg-destructive/10 text-destructive rounded-lg shrink-0 mt-0.5">
            <AlertOctagon size={16} className="animate-pulse" />
          </div>
          
          <div>
            <h2 className="text-sm font-bold text-destructive tracking-wide uppercase">
              WAEC STP Compliance Blockers ({stpErrors.length})
            </h2>
            <p className="text-xs text-destructive mt-0.5 font-medium">
              The issues listed below will cause a structural rejection when uploading data sheets to the West African Examinations Council portal. Fix these cells to finalize the term.
            </p>
          </div>
        </div>

        {/* Optional dismiss hook if parent handles state reset */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-destructive hover:text-destructive p-1 rounded-lg transition-colors outline-none focus:ring-1 focus:ring-destructive/20 cursor-pointer"
            title="Dismiss Alert"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <hr className="my-3 border-destructive/20" />

      {/* Exception Logs list */}
      <ul className="space-y-2 pl-1.5">
        {stpErrors.map((error, index) => (
          <li 
            key={index} 
            className="flex items-start gap-2 text-xs text-destructive font-medium leading-relaxed group/item"
          >
            <span className="text-destructive select-none font-bold mt-0.5 shrink-0">•</span>
            <span className="flex-1 select-all">{error}</span>
          </li>
        ))}
      </ul>
      
      {/* Informative Help Ribbon */}
      <div className="mt-4 flex items-center gap-1.5 px-3 py-2 bg-surface/60 rounded-lg border border-destructive/20 text-xs text-text-secondary font-medium">
        <HelpCircle size={13} className="text-muted-foreground shrink-0" />
        <span>Need assistance? Cross-check with the official WAEC STP operating manual guidelines.</span>
      </div>
    </div>
  );
}
