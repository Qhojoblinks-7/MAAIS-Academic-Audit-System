import React from 'react';
import { cn } from '../../../lib/utils'; 

export function ProtocolsView() {
  const securityPolicies = [];

  return (
    <div className="max-w-3xl mx-auto space-y-3 px-1 sm:px-0">
      {/* Parameter Adjustment Card */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-xs">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-wider mb-3">
          Institutional Parameters
        </h3>
        {/* Compact Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-muted-foreground uppercase tracking-wider ml-0.5 font-mono">
              Academic Year
            </label>
            <select className="w-full h-8 bg-muted/30 border border-border rounded-lg px-3 text-[11px] font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-success/10 transition-all cursor-pointer">
              <option>2025/2026 Academic Cycle</option>
              <option>2026/2027 Academic Cycle</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-[8px] font-black text-muted-foreground uppercase tracking-wider ml-0.5 font-mono">
              Current Terminal Node
            </label>
            <select className="w-full h-8 bg-muted/30 border border-border rounded-lg px-3 text-[11px] font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-success/10 transition-all cursor-pointer">
              <option>First Term Protocol</option>
              <option>Second Term Protocol</option>
              <option>Third Term Protocol</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-[8px] font-black text-muted-foreground uppercase tracking-wider ml-0.5 font-mono">
              Global Mark Cap (%)
            </label>
            <input 
              type="number" 
              defaultValue={100} 
              className="w-full h-8 bg-muted/30 border border-border rounded-lg px-3 text-[11px] font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-success/10 transition-all font-mono" 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[8px] font-black text-muted-foreground uppercase tracking-wider ml-0.5 font-mono">
              Revision Buffer (Days)
            </label>
            <input 
              type="number" 
              defaultValue={7} 
              className="w-full h-8 bg-muted/30 border border-border rounded-lg px-3 text-[11px] font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-success/10 transition-all font-mono" 
            />
          </div>
        </div>
      </div>

      {/* Feature Toggles Panel */}
      <div className="bg-surface rounded-xl border border-border p-4 shadow-xs">
        <h3 className="text-[10px] font-black text-foreground uppercase tracking-wider mb-3">
          Security & Verification Tiering
        </h3>
        <div className="space-y-1.5">
          {securityPolicies.map((policy, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-2.5 bg-muted/30 border border-border rounded-xl group hover:border-success/20 transition-all gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-foreground tracking-tight leading-none mb-1 truncate">
                  {policy.label}
                </p>
                <p className="text-[9px] text-muted-foreground font-medium line-clamp-1 sm:line-clamp-none">
                  {policy.desc}
                </p>
              </div>
              
              {/* Tightened Toggle Switch */}
              <button className={cn(
                "w-9 h-5 rounded-full relative transition-all duration-200 shrink-0 cursor-pointer",
                policy.active ? "bg-success shadow-xs" : "bg-muted/40"
              )}>
                <div className={cn(
                  "w-3 h-3 bg-surface rounded-full absolute top-1 transition-all duration-200",
                  policy.active ? "left-5" : "left-1"
                )} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Global Sync Action Call */}
      <div className="flex justify-end pt-1">
        <button className="w-full sm:w-auto h-8 px-6 bg-success text-primary-foreground rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all shadow-sm active:scale-[0.99]">
          Sync Protocols Institution-Wide
        </button>
      </div>
    </div>
  );
}