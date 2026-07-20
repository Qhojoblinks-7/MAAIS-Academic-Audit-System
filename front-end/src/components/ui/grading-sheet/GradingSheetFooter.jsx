import React from 'react';
import { cn } from "@/lib/utils";
import { Lock, ShieldCheck, Save, Send, MessageSquare } from 'lucide-react';

/* O(1) - WAEC STP grade mapping: A1→I, B2→II, B3→III, C4→IV, C5→V, C6→VI, D7→VII, E8→VIII, F9→IX
 * WAEC Grading Scale (WASSCE) - each band maps to Roman numeral I-X
 * A1 (75-100) = I, B2 (70-74) = II, B3 (65-69) = III, C4 (60-64) = IV
 * C5 (55-59) = V, C6 (50-54) = VI, D7 (45-49) = VII, E8 (40-44) = VIII, F9 (0-39) = IX
 */
const calcRoman = (grade) => {
  const romanMap = { A1: 'I', B2: 'II', B3: 'III', C4: 'IV', C5: 'V', C6: 'VI', D7: 'VII', E8: 'VIII', F9: 'IX' };
  return romanMap[grade] || 'IX';
};

export function GradingSheetFooter({ 
  isSubmissionLocked, 
  missingCount,
  onSaveDraft,
  onSubmitToHOD,
  hasDraftChanges = false,
  onRequestRevision,
}) {
  return (
    <footer className="mt-8 flex flex-wrap justify-between items-center gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm">
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isSubmissionLocked ? "bg-warning/10 text-warning" : "bg-success/10 text-success")}>
          {isSubmissionLocked ? <Lock size={20} /> : <ShieldCheck size={20} />}
        </div>
        <div>
          <p className="text-sm font-black text-foreground">{isSubmissionLocked ? "Submission Locked" : "Audit Ready"}</p>
          <p className="text-xs font-bold text-muted-foreground">{isSubmissionLocked ? `${missingCount} observations missing.` : "All observations logged."}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        
         <button
           onClick={onSaveDraft}
           disabled={isSubmissionLocked}
           className={cn(
             "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
              isSubmissionLocked 
                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                : "bg-muted text-foreground hover:bg-muted border border-border cursor-pointer"
           )}
         >
           <Save size={14} /> Save Draft
         </button>
         
         <button
           onClick={onSubmitToHOD}
           disabled={isSubmissionLocked || missingCount > 0}
           className={cn(
             "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
              isSubmissionLocked || missingCount > 0
                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                : "bg-success text-background hover:bg-success/90 shadow-md cursor-pointer"
           )}
         >
           <Send size={14} /> Submit to HOD
         </button>

         {onRequestRevision && (
           <button
             onClick={onRequestRevision}
             disabled={isSubmissionLocked}
             className={cn(
               "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                isSubmissionLocked
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-warning/10 text-warning hover:bg-warning/20 border border-warning/20 cursor-pointer"
             )}
           >
             <MessageSquare size={14} /> Request Revision
           </button>
         )}
      </div>
    </footer>
  );
}