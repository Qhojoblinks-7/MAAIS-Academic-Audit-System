import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

/**
 * TermSealBanner — shown when the term is finalised (database locked).
 * Displays a sticky rose-coloured alert with a lock icon.
 */
export function TermSealBanner() {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 left-0 right-0 z-40 mb-6"
    >
      <div className="bg-rose-600 text-white p-4 rounded-xl flex items-center justify-between shadow-md border border-rose-500/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
            <Lock size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">Final WAEC Seal Active</h4>
            <p className="text-[11px] text-rose-100 font-medium mt-0.5">
              Database records are read-only. Contact portal support for emergency ledger updates.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/15 shrink-0">
          Locked State
        </div>
      </div>
    </motion.div>
  );
}