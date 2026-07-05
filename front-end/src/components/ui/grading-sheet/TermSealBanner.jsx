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
      className="sticky top-0 left-0 right-0 z-50 mb-6"
    >
      <div className="bg-gray-900 text-white p-5 rounded-xl flex items-center justify-between shadow-lg border-2 border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
            <Lock size={18} className="text-gray-300" />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider">Term Locked — Grading Sheet Read-Only</h4>
            <p className="text-xs text-gray-300 font-medium mt-0.5">
              All grade entries are frozen. No edits, saves, or submissions are allowed until the HOD unlocks this term.
            </p>
          </div>
        </div>
        <div className="px-4 py-2 bg-gray-800 rounded-lg text-xs font-bold uppercase tracking-wider border border-gray-600 shrink-0">
          Locked
        </div>
      </div>
    </motion.div>
  );
}