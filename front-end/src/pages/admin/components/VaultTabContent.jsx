import React from 'react';
import { cn } from '../../../lib/utils';
import { FileUp, FileText, Download } from 'lucide-react';
import mockApiData from '../../../data/mockApiData.json';

export function VaultTabContent({ files }) {
  const vaultFiles = files || mockApiData.engineRoom?.vaultFiles || [];
  
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Upload Drag & Drop Area */}
      <div className="border border-dashed border-slate-300 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-10 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-100/50 transition-all group cursor-pointer w-full">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center text-slate-400 mb-4 sm:mb-6 shadow-sm group-hover:scale-110 transition-transform flex-shrink-0">
          <FileUp size={22} className="sm:hidden" />
          <FileUp size={28} className="hidden sm:block" />
        </div>
        <p className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest mb-1 sm:mb-2">
          Upload Strategy Pulse
        </p>
        <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[180px] sm:max-w-[200px]">
          PDF format strictly required for departmental meeting minutes.
        </p>
      </div>

      {/* File Registry List */}
      <div className="space-y-2.5 sm:space-y-3 w-full">
        {files.map((file, i) => (
          <div 
            key={i} 
            className="p-3 sm:p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between gap-4 group hover:border-slate-300 transition-all w-full"
          >
            {/* File Info Block */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="sm:hidden" />
                <FileText size={18} className="hidden sm:block" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-[12px] font-black text-slate-900 truncate tracking-tight max-w-[160px] xs:max-w-[240px] sm:max-w-md md:max-w-xl">
                  {file.name}
                </p>
                <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-0">
                  {file.date} • {file.size}
                </p>
              </div>
            </div>

            {/* Action Item */}
            <button 
              className="p-2 text-slate-300 hover:text-slate-900 transition-colors flex-shrink-0 rounded-lg hover:bg-slate-50"
              aria-label={`Download ${file.name}`}
            >
              <Download size={16} className="sm:hidden" />
              <Download size={18} className="hidden sm:block" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}