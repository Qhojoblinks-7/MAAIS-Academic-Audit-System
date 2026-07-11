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
          <div className="shrink-0 px-2.5 py-1 bg-warning text-background text-xs font-bold uppercase tracking-wider rounded animate-pulse">
            Compliance Mode
          </div>
        )}
        
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {DISPLAY_CLASS_INFO?.subject} - {DISPLAY_CLASS_INFO?.className}
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5 font-medium">
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
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 cursor-pointer"
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
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-success/10 text-success hover:bg-success/20 cursor-pointer"
          )}
        >
          <Download size={15} /> Export for WAEC
        </button>

        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="px-4 py-2.5 bg-success text-background rounded-xl hover:bg-success/90 transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <ChevronLeft size={15} /> 
            {isCorrectionMode ? 'Show Feedback' : isMissingObsMode ? 'Show Rubric' : 'Show Observation'}
          </button>
        )}
      </div>
    </header>
  );
}