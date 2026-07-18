import React from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import { Download, Eye } from 'lucide-react';
import { cn } from '../ui/cn';

export function HistoryPanel({ studentData, onDownloadHistory, onViewHistory }) {
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
    
    return [];
  }, [studentData]);

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="bg-surface rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-black text-text-primary">Result History</h2>
        
        <div className="mt-4 space-y-2.5 sm:space-y-3">
          {dataList.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-sm">
              No academic history available yet.
            </div>
          ) : (
            dataList.map((h, i) => {
              const currentStatus = (h.approvalStatus || 'DRAFT').toUpperCase();
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
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryPanel;
