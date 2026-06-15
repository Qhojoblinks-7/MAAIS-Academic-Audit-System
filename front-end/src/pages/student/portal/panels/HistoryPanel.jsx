import React from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import { Download, Eye } from 'lucide-react';
import { cn } from '../ui/cn';

const mockHistory = [
  { yearLabel: 'SHS 1', approved: false, approvalStatus: 'SUBMITTED', summary: 'Term cumulative available' },
  { yearLabel: 'SHS 2', approved: true, approvalStatus: 'VERIFIED', summary: 'Verified & locked transcript' },
  { yearLabel: 'SHS 3', approved: true, approvalStatus: 'LOCKED', summary: 'Final locked report' },
];

export function HistoryPanel({ studentData, onDownloadHistory, onViewHistory }) {
  // Memoize mapped array to secure memory address stability across root shifts
  const dataList = React.useMemo(() => {
    const historyFromData = studentData?.academicHistory || [];
    
    if (historyFromData.length > 0) {
      return historyFromData.map((h) => ({
        yearLabel: h.year || h.yearLabel,
        term: h.term,
        subjects: h.subjects || [],
        approvalStatus: h.approvalStatus || studentData?.approvalStatus || 'SUBMITTED',
        summary: `${h.subjects?.length || 0} subjects recorded`
      }));
    }
    
    return mockHistory.map((h) => ({ ...h, subjects: [] }));
  }, [studentData]);

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="bg-surface rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-black text-text-primary">Result History</h2>
        
        <div className="mt-4 space-y-2.5 sm:space-y-3">
          {dataList.map((h, i) => {
            const currentStatus = (h.approvalStatus || 'DRAFT').toUpperCase();
            // Secure reconciliation key safely by computing present variables
            const rowKey = h.yearLabel && h.term ? `${h.yearLabel}-${h.term}` : h.yearLabel || `history-idx-${i}`;

            return (
              <div 
                key={rowKey} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-background rounded-xl transition-all border border-border/10 hover:border-border/60"
              >
                {/* Content Area */}
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-black text-text-primary truncate">
                    {h.yearLabel} {h.term ? `— ${h.term}` : ''}
                  </p>
                  <p className="text-xs font-semibold text-text-secondary leading-relaxed sm:leading-normal">
                    {h.summary || '—'}
                  </p>
                </div>

                {/* Status and Action Buttons Wrapper */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t border-border/40 sm:border-transparent">
                  <div className="sm:mr-2">
                    <StatusBadge status={currentStatus} />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDownloadHistory?.(h)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg transition-all text-[10px] font-black tracking-wider uppercase",
                        "flex items-center justify-center cursor-pointer select-none active:scale-[0.97] shrink-0",
                        "bg-brand-primary text-white hover:bg-brand-primary/90 shadow-sm"
                      )}
                      title="Download PDF Ledger"
                    >
                      <Download size={12} className="shrink-0" />
                      <span className="ml-1.5 hidden sm:inline">PDF</span>
                    </button>

                    <button
                      onClick={() => onViewHistory?.(h) || onDownloadHistory?.(h)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg transition-all text-[10px] font-black tracking-wider uppercase",
                        "flex items-center justify-center cursor-pointer select-none active:scale-[0.97] shrink-0 sm:hidden",
                        "bg-surface border border-border text-text-primary hover:bg-background"
                      )}
                      title="View Details"
                    >
                      <Eye size={12} className="shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default HistoryPanel;