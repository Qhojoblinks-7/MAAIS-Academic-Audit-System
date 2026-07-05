import React from 'react';
import { ChevronLeft, Download, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { CorrectionModeBanner } from '../../shared/CorrectionMode';

export function GradingSheetHeader({ 
   DISPLAY_CLASS_INFO, 
   isCorrectionMode, 
   isMissingObsMode, 
   isSidebarOpen, 
   setIsSidebarOpen,
   runSTPValidation,
   missingCount,
   isTermFinalized,
   onExportWAEC,
   stpValidating = false
  }) {
   const handleExportWAEC = () => {
     if (missingCount > 0 || isTermFinalized) return;
     onExportWAEC?.();
   };

  return (
    <header className="mb-6 flex flex-wrap justify-between items-center gap-4">
      <div className="flex items-center gap-4">
        {isCorrectionMode && (
          <div className="shrink-0">
            <CorrectionModeBanner />
          </div>
        )}
        
        {isMissingObsMode && (
          <div className="shrink-0 px-2.5 py-1 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider rounded animate-pulse">
            Compliance Mode
          </div>
        )}
        
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {DISPLAY_CLASS_INFO?.subject} - {DISPLAY_CLASS_INFO?.className}
          </h1>
          <p className="text-slate-500 text-xs mt-0.5 font-medium">
            Form {DISPLAY_CLASS_INFO?.form} • {DISPLAY_CLASS_INFO?.programme} Programme • {DISPLAY_CLASS_INFO?.studentCount} Students
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={runSTPValidation} 
          disabled={stpValidating || isTermFinalized}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors",
            stpValidating || isTermFinalized
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
          )}
        >
          {stpValidating ? <Loader2 size={15} className="animate-spin" /> : null}
          {stpValidating ? 'Validating...' : 'STP Validation'}
        </button>

        <button 
          onClick={handleExportWAEC}
          disabled={missingCount > 0 || isTermFinalized}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors",
            missingCount > 0 || isTermFinalized
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
          )}
        >
          <Download size={15} /> Export for WAEC
        </button>

        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <ChevronLeft size={15} /> 
            {isCorrectionMode ? 'Show Feedback' : isMissingObsMode ? 'Show Rubric' : 'Show Observation'}
          </button>
        )}
      </div>
    </header>
  );
}