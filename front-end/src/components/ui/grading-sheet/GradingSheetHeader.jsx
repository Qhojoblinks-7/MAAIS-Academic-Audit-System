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
   stpValidating = false,
   selectedSubject,
   selectedClass,
   availableClasses,
   uniqueSubjects,
   onSubjectChange,
   onClassChange,
   uniqueLevels,
   selectedLevel,
   onLevelChange
   }) {
   const handleExportWAEC = () => {
     if (missingCount > 0 || isTermFinalized) return;
     onExportWAEC?.();
   };

  return (
    <header className="mb-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {isCorrectionMode && (
          <div className="shrink-0">
            <CorrectionModeBanner />
          </div>
        )}
        
        {isMissingObsMode && (
          <div className="shrink-0 px-2 py-0.5 bg-warning text-background text-[10px] font-bold uppercase tracking-wider rounded">
            Compliance Mode
          </div>
        )}
        
        <div className="min-w-0 hidden sm:block">
          <h1 className="text-base lg:text-lg font-bold text-foreground tracking-tight truncate">
            {DISPLAY_CLASS_INFO?.subject} - {DISPLAY_CLASS_INFO?.className}
          </h1>
          <p className="text-muted-foreground text-[10px] lg:text-xs font-medium truncate">
            Form {DISPLAY_CLASS_INFO?.form} • {DISPLAY_CLASS_INFO?.programme} Programme • {DISPLAY_CLASS_INFO?.studentCount} Students
          </p>
        </div>
        
        <div className="sm:hidden font-bold text-xs text-foreground truncate">
          {DISPLAY_CLASS_INFO?.subject} - {DISPLAY_CLASS_INFO?.className}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-nowrap">
        {uniqueLevels?.length > 0 && (
          <select
            value={selectedLevel || ''}
            onChange={onLevelChange || (() => {})}
            className="min-w-[80px] lg:min-w-[100px] px-2 lg:px-3 py-1.5 lg:py-2 bg-white border-2 border-border rounded-lg text-[10px] lg:text-xs font-bold text-text-primary uppercase tracking-wider shadow-sm"
          >
            <option value="">All Levels</option>
            {uniqueLevels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        )}

        <select
          value={selectedSubject || ''}
          onChange={onSubjectChange || (() => {})}
          className="min-w-[100px] lg:min-w-[120px] px-2 lg:px-3 py-1.5 lg:py-2 bg-white border-2 border-border rounded-lg text-[10px] lg:text-xs font-bold text-text-primary uppercase tracking-wider shadow-sm"
        >
          {(uniqueSubjects || []).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={selectedClass?.id || ''}
          onChange={onClassChange || (() => {})}
          className="min-w-[100px] lg:min-w-[120px] px-2 lg:px-3 py-1.5 lg:py-2 bg-white border-2 border-border rounded-lg text-[10px] lg:text-xs font-bold text-text-primary uppercase tracking-wider shadow-sm"
        >
          {(availableClasses || []).map((c) => (
            <option key={c.id} value={c.id}>{c.className}</option>
          ))}
        </select>

        <button 
          onClick={runSTPValidation} 
          disabled={stpValidating || isTermFinalized}
          className={cn(
            "px-3 lg:px-4 py-2 rounded-xl text-[10px] lg:text-xs font-semibold flex items-center gap-2 transition-colors",
            stpValidating || isTermFinalized
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 cursor-pointer"
          )}
        >
          {stpValidating ? <Loader2 size={13} className="animate-spin" /> : null}
          {stpValidating ? 'Validating...' : 'STP'}
        </button>

        <button 
          onClick={handleExportWAEC}
          disabled={missingCount > 0 || isTermFinalized}
          className={cn(
            "px-3 lg:px-4 py-2 rounded-xl text-[10px] lg:text-xs font-semibold flex items-center gap-2 transition-colors",
            missingCount > 0 || isTermFinalized
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-success/10 text-success hover:bg-success/20 cursor-pointer"
          )}
        >
          <Download size={13} /> WAEC
        </button>

        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="px-3 lg:px-4 py-2 bg-success text-background rounded-xl hover:bg-success/90 transition-colors flex items-center gap-2 text-[10px] lg:text-xs font-semibold cursor-pointer"
          >
            <ChevronLeft size={13} /> 
            <span className="hidden sm:inline">{isCorrectionMode ? 'Feedback' : isMissingObsMode ? 'Rubric' : 'Observation'}</span>
            <span className="sm:hidden">Obs</span>
          </button>
        )}
      </div>
    </header>
  );
}