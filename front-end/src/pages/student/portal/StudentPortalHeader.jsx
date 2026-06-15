import React from 'react';
import { BookOpen, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from './ui/cn';

export function StudentPortalHeader({ onPrint, selectedReportType, onReportTypeChange }) {
  const navigate = useNavigate();

  return (
    <header className="mb-6 sm:mb-8 w-full">
      {/* Top Banner Row: Stacks vertically on mobile, aligns horizontally on tablet/desktop */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5 sm:mb-6">
        
        {/* Brand & Portal Identifiers */}
<div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-brand-dark rounded-2xl flex items-center justify-center text-surface shrink-0 shadow-sm">
             <BookOpen size={18} />
           </div>
           <div className="min-w-0">
             <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
               My Student Portal
             </h1>
             <p className="text-[9px] sm:text-[10px] font-black text-text-secondary uppercase tracking-wider mt-0.5 leading-normal">
               Academic, Behavioral, Interventions & Transcript
             </p>
           </div>
         </div>

         {/* FIXED: Elements are strictly locked to the same horizontal line regardless of screen size */}
         <div className="flex items-end gap-3 w-full sm:w-auto">
           {/* Form Filter Element Container */}
           <div className="flex-1 sm:w-48">
             <label className="block text-[9px] sm:text-[10px] font-black text-text-secondary uppercase tracking-wider mb-1 whitespace-nowrap">
               Report Type
             </label>
             <select
               value={selectedReportType}
               onChange={onReportTypeChange}
               className="w-full px-2 sm:px-3 py-2 bg-surface border border-border rounded-xl text-[10px] sm:text-[11px] font-black focus:outline-none focus:ring-2 focus:ring-brand-primary h-9"
             >
               <option value="transcript">Academic Transcript</option>
               <option value="terminal">Terminal Report</option>
             </select>
           </div>

           {/* Action Trigger Button */}
           <button
             onClick={onPrint}
             className="px-3 sm:px-4 h-9 bg-background text-text-primary rounded-xl hover:bg-border transition-colors text-[10px] sm:text-[11px] font-black tracking-widest uppercase flex items-center justify-center cursor-pointer select-none active:scale-[0.98] shrink-0"
           >
             <span className="truncate">Print</span>
             <Download size={13} className="ml-1.5 sm:ml-2 shrink-0" />
           </button>
         </div>
      </div>
    </header>
  );
}