import React from 'react';
import { cn } from '../../../lib/utils';
import { Database, GraduationCap, RefreshCw } from 'lucide-react';

export function SubTabSelector({ activeSubTab, setActiveSubTab }) {
  const tabs = [
    { id: 'VAULT', label: 'The Vault', icon: Database },
    { id: 'PROMOTION', label: 'Promotion Cycle', icon: GraduationCap },
    { id: 'MAINTENANCE', label: 'Maintenance', icon: RefreshCw },
  ];

  return (
    <div className="bg-surface border-b border-border px-3 h-11 flex items-center justify-between gap-4 z-20 w-full select-none shrink-0">
      {/* Brand & Subsystem Context Flag */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 bg-success text-primary-foreground rounded-md flex items-center justify-center shadow-xs shrink-0">
          <Database size={12} />
        </div>
        <span className="text-[9px] font-black text-foreground uppercase tracking-wider font-mono truncate">
          System Archives & Promotion
        </span>
      </div>

      {/* Ultra-Dense Navigation Segment */}
      <div className="overflow-x-auto no-scrollbar max-w-full">
        <div className="flex bg-muted/20 p-0.5 rounded-lg">
          {tabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 h-7 px-3 rounded-md text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer font-mono whitespace-nowrap",
                  isActive 
                    ? "bg-surface text-success border-border" 
                    : "text-muted-foreground hover:text-foreground/80 hover:bg-muted/20"
                )}
              >
                <tab.icon 
                  size={10.5} 
                  className={cn("shrink-0", isActive ? "text-success" : "text-muted-foreground")} 
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}