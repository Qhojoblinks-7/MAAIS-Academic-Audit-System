import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { GRADE_SCALE } from '../GradingSheet.constants';

/**
 * GradingMainContent — the left+centre scrollable pane.
 * Contains: TermSealBanner (conditional), header, STP banner,
 *           the HTML table, and footer controls.
 *
 * All interactive pieces are wired through callbacks passed as props —
 * this component carries zero business logic of its own.
 */
export function GradingMainContent({
  isTermFinalized,
  children,
  // Header slot
  headerSlot,
  // STP banner
  showSTPOverlay,
  stpErrors,
  onCloseSTP,
  // Table area (passed as children — simplest way to avoid prop-drilling table internals)
  tableSlot,
  // Footer controls
  footerSlot,
}) {
  return (
    <div className="flex-1 overflow-y-auto p-6 relative">
      {/* Term-locked seal banner */}
      {isTermFinalized && (
        <div className="mb-6">
          {children ? null : /* TermSealBanner injected via slot or kept here */ null}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'max-w-full mx-auto transition-all duration-300',
          isTermFinalized && 'opacity-75 pointer-events-none select-none'
        )}
      >
        {/* Slot: injected Header + CorrectionMode / Compliance banners */}
        {headerSlot}

        {/* Slot: injected STP error overlay */}
        {showSTPOverlay && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <div className="text-xs font-bold text-red-700 uppercase tracking-widest w-full">
              {stpErrors.map((err, i) => (
                <p key={i} className="mb-1 last:mb-0">• {err}</p>
              ))}
            </div>
            <button
              onClick={onCloseSTP}
              className="text-red-500 hover:bg-red-100 rounded p-1 shrink-0 text-xs font-black"
            >
              ✕
            </button>
          </div>
        )}

        {/* Slot: the actual HTML <table> — GradingSheetTableHeader + GradingSheetTableBody */}
        {tableSlot}

        {/* Slot: footer controls (save draft / submit to HOD) */}
        {footerSlot}
      </motion.div>
    </div>
  );
}

/* ── Convenience re-export so callers can import getSmartRemark ─────��─────── */
/**
 * Maps a grade letter to its human-readable remark per WAEC WASSCE scale.
 * Wrapped here so table-body callers avoid importing from constants directly.
 */
export const getSmartRemark = (grade) => GRADE_SCALE[grade]?.label || '';