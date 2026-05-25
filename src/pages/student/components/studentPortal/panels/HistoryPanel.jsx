import React from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import { Download, Eye } from 'lucide-react';
import { cn } from '../ui/cn';

const mockHistory = [
  { yearLabel: 'SHS 1', approved: false, approvalStatus: 'SUBMITTED', summary: 'Term cumulative available' },
  { yearLabel: 'SHS 2', approved: true, approvalStatus: 'VERIFIED', summary: 'Verified & locked transcript' },
  { yearLabel: 'SHS 3', approved: true, approvalStatus: 'LOCKED', summary: 'Final locked report' },
];

export function HistoryPanel({ studentData, onDownloadHistory }) {
  const historyFromData = studentData?.academicHistory || [];
  const dataList = historyFromData.length > 0 
    ? historyFromData.map(h => ({
        yearLabel: h.year,
        term: h.term,
        subjects: h.subjects || [],
        approvalStatus: h.approvalStatus || studentData?.approvalStatus || 'SUBMITTED',
        summary: `${h.subjects?.length || 0} subjects recorded`
      }))
    : mockHistory.map(h => ({ ...h, subjects: [] }));

  const handleDownload = (item) => {
    if (onDownloadHistory) {
      onDownloadHistory(item);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-black text-gray-900">Result History</h2>
        
        <div className="mt-4 space-y-2.5 sm:space-y-3">
          {dataList.map((h, i) => {
            const s = (h.approvalStatus || h.status || 'DRAFT').toUpperCase();

            return (
              <div 
                key={h.year || `history-item-${i}`} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl transition-colors hover:bg-gray-100/60"
              >
                {/* Content Area */}
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-black text-gray-900 truncate">
                    {h.yearLabel || h.year || `Year ${i + 1}`} {h.term ? `- ${h.term}` : ''}
                  </p>
                  <p className="text-xs font-bold text-gray-400 leading-relaxed sm:leading-normal">
                    {h.summary || '—'}
                  </p>
                </div>

                {/* Status and Download Button Area */}
                <div className="flex items-center justify-start sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t border-gray-200/50 sm:border-transparent">
                  <StatusBadge status={s} />
                  <button
                    onClick={() => handleDownload(h)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg transition-colors text-[10px] font-black tracking-widest uppercase",
                      "flex items-center justify-center cursor-pointer select-none active:scale-[0.98] shrink-0",
                      "bg-gray-900 text-white hover:bg-gray-800"
                    )}
                    title="Download PDF"
                  >
                    <Download size={12} className="shrink-0" />
                    <span className="ml-1.5 hidden sm:inline">PDF</span>
                  </button>
                  <button
                    onClick={() => handleDownload(h)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg transition-colors text-[10px] font-black tracking-widest uppercase",
                      "flex items-center justify-center cursor-pointer select-none active:scale-[0.98] shrink-0 sm:hidden",
                      "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                    title="View"
                  >
                    <Eye size={12} className="shrink-0" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}