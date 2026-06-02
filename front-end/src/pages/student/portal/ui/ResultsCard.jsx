import React from 'react';
import { StatusBadge } from './StatusBadge';

const DEFAULT_APPROVAL = 'DRAFT';

export function ResultsCard({ coreResults = [], technicalResults = [], approvalStatus }) {
  const status = (approvalStatus || DEFAULT_APPROVAL).toUpperCase();

// Reusable sub-row rendering logic optimized heavily for micro viewports
   const renderSubjectRow = (g, i) => (
     <div 
       key={i} 
       className="flex flex-col xs:flex-row xs:items-center justify-between p-3.5 bg-background rounded-xl gap-3 transition-colors hover:bg-surface"
     >
       {/* Subject Title Field */}
       <div className="min-w-0">
         <span className="text-sm font-black text-text-primary block xs:inline truncate">
           {g.subject || g.subj || '—'}
         </span>
       </div>

       {/* Scores & Grade Stack Wrapper */}
       <div className="flex items-center justify-between xs:justify-end gap-4 border-t border-border/40 pt-2.5 xs:pt-0 xs:border-0">
<div className="flex items-center gap-3.5">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">SBA</span>
              <span className="text-xs sm:text-sm font-black text-success mt-0.5">
                {g.sbaScore ?? g.caScore ?? 0}/30
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Exam</span>
              <span className="text-xs sm:text-sm font-black text-success mt-0.5">
                {g.examScore ?? 0}/70
              </span>
            </div>
          </div>
        
         {/* Isolated Grade Badge block */}
         <span className="w-9 h-8 rounded-lg bg-success/10 text-success text-xs font-black flex items-center justify-center shrink-0 shadow-sm border border-success/20">
           {g.grade || '—'}
         </span>
       </div>
     </div>
   );

   return (
     <div className="bg-surface rounded-2xl border border-border p-4 sm:p-6 shadow-sm w-full">
      
       {/* Header Container - Column stacking on mobile, Row alignment on tablets/desktop */}
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6 pb-4 sm:pb-0 border-b border-border sm:border-transparent">
         <div>
           <h2 className="text-lg sm:text-xl font-black text-text-primary">Report Card</h2>
           <p className="text-[9px] sm:text-[10px] font-black text-text-secondary uppercase tracking-widest mt-0.5">
             Core + Technical Results (SBA + Exam)
           </p>
         </div>
         <div className="self-start sm:self-center">
           <StatusBadge status={status} />
         </div>
       </div>

       {/* Main Structural Subject Content Layout Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        
         {/* Core Subjects Section column */}
         <div className="space-y-2.5">
           <h3 className="text-[10px] sm:text-[11px] font-black text-text-secondary uppercase tracking-widest mb-2 sm:mb-3 block">
             Core Subjects
           </h3>
           <div className="space-y-2">
             {coreResults.length ? (
               coreResults.map((g, i) => renderSubjectRow(g, i))
             ) : (
               <div className="text-center py-6 bg-background/40 rounded-xl border border-dashed border-border">
                 <p className="text-text-secondary font-bold text-xs">No core results available.</p>
               </div>
             )}
           </div>
         </div>

         {/* Technical Subjects Section column */}
         <div className="space-y-2.5">
           <h3 className="text-[10px] sm:text-[11px] font-black text-text-secondary uppercase tracking-widest mb-2 sm:mb-3 block">
             Technical Subjects
           </h3>
           <div className="space-y-2">
             {technicalResults.length ? (
               technicalResults.map((g, i) => renderSubjectRow(g, i))
             ) : (
               <div className="text-center py-6 bg-background/40 rounded-xl border border-dashed border-border">
                 <p className="text-text-secondary font-bold text-xs">No technical results available.</p>
               </div>
             )}
           </div>
         </div>

       </div>
     </div>
   );
}