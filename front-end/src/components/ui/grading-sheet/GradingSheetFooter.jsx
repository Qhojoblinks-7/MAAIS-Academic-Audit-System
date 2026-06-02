import React from 'react';
import { cn } from "@/lib/utils";
import { Lock, ShieldCheck, Save, Send } from 'lucide-react';

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
  hasDraftChanges = false
}) {
  return (
    <footer className="mt-8 flex flex-wrap justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isSubmissionLocked ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
          {isSubmissionLocked ? <Lock size={20} /> : <ShieldCheck size={20} />}
        </div>
        <div>
          <p className="text-sm font-black text-gray-900">{isSubmissionLocked ? "Submission Locked" : "Audit Ready"}</p>
          <p className="text-xs font-bold text-gray-500">{isSubmissionLocked ? `${missingCount} observations missing.` : "All observations logged."}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-lg leading-relaxed">
          <span className="font-bold">WAEC STP:</span> 30% SBA + 70% Exam = 100%
          &nbsp;|&nbsp;
          <span className="font-bold">Grades (A1–F9):</span>
          A1(≥75) B2(70) B3(65) C4(60) C5(55) C6(50) D7(45) E8(40) F9(&lt;40)
        </div>
        
        <button
          onClick={onSaveDraft}
          disabled={isSubmissionLocked}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
            isSubmissionLocked 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
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
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
              : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
          )}
        >
          <Send size={14} /> Submit to HOD
        </button>
      </div>
    </footer>
  );
}