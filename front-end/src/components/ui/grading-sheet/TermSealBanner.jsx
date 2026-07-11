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
      <div className="bg-foreground text-background p-5 rounded-xl flex items-center justify-between shadow-lg border-2 border-border">
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-muted-foreground/20 rounded-lg flex items-center justify-center shrink-0">
             <Lock size={18} className="text-muted-foreground" />
           </div>
           <div>
             <h4 className="text-sm font-bold uppercase tracking-wider">Term Locked — Grading Sheet Read-Only</h4>
             <p className="text-xs text-muted-foreground font-medium mt-0.5">
               All grade entries are frozen. No edits, saves, or submissions are allowed until the HOD unlocks this term.
             </p>
           </div>
         </div>
         <div className="px-4 py-2 bg-foreground/80 rounded-lg text-xs font-bold uppercase tracking-wider border border-border shrink-0">
          Locked
        </div>
      </div>
    </motion.div>
  );
}