import { cn } from '../../lib/utils';
import { Database, RefreshCw, ShieldCheck } from 'lucide-react';

export function HODArchiveHeader({ activeSubTab, onTabChange, onStudentSelect, studentCount, verifiedCount }) {
  const tabs = [
    { id: 'VAULT', fullLabel: 'The Vault (Alumni)', shortLabel: 'Vault', icon: Database },
    { id: 'PROMOTION', fullLabel: 'Promotion Terminal', shortLabel: 'Promote', icon: RefreshCw },
    { id: 'COMPLIANCE', fullLabel: 'Compliance Audits', shortLabel: 'Audits', icon: ShieldCheck },
  ];

  return (
    <div className="bg-white border-b border-slate-200 px-3 sm:px-6 md:px-8 py-2.5 sm:py-4 flex flex-col md:flex-row justify-between items-center z-20 gap-3">
      {/* Title block: Left-aligned on web, centered and tight on mobile */}
      <div className="flex items-center gap-2.5 sm:gap-4 w-full md:w-auto justify-start">
        <div className="w-7 h-7 sm:w-9 sm:h-9 bg-slate-900 text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm shrink-0">
          <Database size={14} className="sm:w-5 sm:h-5" />
        </div>
        <div>
          <h1 className="text-[10px] sm:text-xs md:text-sm font-black text-slate-900 uppercase tracking-widest font-sans leading-none">
            Departmental Archives
          </h1>
          <p className="text-[7px] sm:text-[9px] md:text-[10px] font-bold text-slate-400 uppercase leading-none mt-1 hidden xs:block">
            Applied Sciences Historical Repository &amp; Administration
          </p>
        </div>
      </div>

      {/* Tabs list: Full width fluid container on mobile */}
      <div className="flex bg-slate-100 p-0.5 rounded-lg sm:rounded-xl border border-slate-200/50 w-full md:w-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              onTabChange(tab.id);
              if (onStudentSelect) onStudentSelect(null);
            }}
            className={cn(
              "flex-1 md:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-5 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-wider sm:tracking-widest transition-all outline-none",
              activeSubTab === tab.id 
                ? "bg-white text-slate-900 shadow-sm font-bold" 
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <tab.icon size={10} className="sm:w-3.5 sm:h-3.5 shrink-0" />
            {/* Context-aware labels that drop fluff on small resolutions */}
            <span className="hidden sm:inline">{tab.fullLabel}</span>
            <span className="inline sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}