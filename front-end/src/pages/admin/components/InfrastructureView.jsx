import React from 'react';
import { ShieldAlert, RefreshCw, Cpu, Activity, HardDrive } from 'lucide-react';
import { cn } from '../../../lib/utils';

const iconMap = { Cpu, Activity, HardDrive, RefreshCw };

export function InfrastructureView() {
  const computeNodes = [];
  const backupSnapshots = [];
  const serviceHealth = [];
  
  const computeNodesWithIcons = (computeNodes || []).map(node => ({
    ...node,
    icon: iconMap[node.icon] || Cpu
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 px-1 sm:px-0">
      <div className="lg:col-span-2 space-y-3">
        {/* Compute Cores Monitor */}
        <div className="bg-surface rounded-xl border border-border p-4 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Compute Core Status</h3>
            <span className="text-[8px] font-black text-success uppercase tracking-wider bg-success/10 px-1.5 py-0.5 rounded-md font-mono">
              Sync: OK
            </span>
          </div>
<div className="grid grid-cols-2 gap-2">
             {computeNodesWithIcons.map((node, i) => (
              <div key={i} className="p-2.5 bg-muted/30 border border-border/70 rounded-xl flex items-center gap-3 min-w-0">
                <div className={cn("w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0", node.color)}>
                  <node.icon size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-foreground tracking-tight leading-none mb-0.5">{node.value}</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider truncate font-mono">{node.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database Snapshots */}
        <div className="bg-surface rounded-xl border border-border p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Database Backup Registry</h3>
            <button className="h-7 px-3 bg-brand-primary text-primary-foreground rounded-lg text-[8px] font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-all">
              Initialize Snapshot
            </button>
          </div>
          <div className="space-y-1.5">
            {backupSnapshots.map((snap, i) => (
              <div key={i} className="flex items-center justify-between p-2 border border-border rounded-xl hover:bg-muted/20 transition-all group gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-success/100 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground tracking-tight leading-none mb-0.5 truncate">{snap.id}</p>
                    <p className="text-[8px] font-medium text-muted-foreground font-mono">TS: {snap.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[9px] font-bold text-muted-foreground font-mono uppercase">{snap.size}</span>
                  <button className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-success transition-all rounded-md hover:bg-muted/20">
                    <RefreshCw size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Sidebar Indicators */}
      <div className="space-y-3">
        <div className="bg-brand-primary rounded-xl p-4 text-primary-foreground shadow-md relative overflow-hidden">
          <ShieldAlert className="text-warning mb-3" size={24} />
          <h3 className="text-xs font-black tracking-tight mb-1 italic">Infrastructure Lock</h3>
          <p className="text-xs text-muted-foreground leading-normal font-medium mb-4">
            Global updates are restricted to Maintenance Windows. Emergency patches require biometric verification.
          </p>
          <div className="space-y-2">
             <div className="flex justify-between text-[8px] font-black uppercase tracking-wider font-mono">
               <span className="text-muted-foreground">Firewall Node</span>
               <span className="text-success">Shielded</span>
             </div>
             <div className="h-1 bg-surface/10 rounded-full overflow-hidden">
               <div className="h-full bg-success/100 w-[94%]" />
             </div>
          </div>
        </div>

        {/* Microservices Health Checklist */}
        <div className="bg-surface rounded-xl border border-border p-4 shadow-xs">
          <h3 className="text-xs font-black text-foreground uppercase tracking-wider mb-2.5">Service Health</h3>
          <div className="divide-y divide-border">
            {serviceHealth.map((svc, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 first:pt-0 last:pb-0 gap-2">
                <span className="text-[9px] font-bold text-foreground/50 uppercase tracking-wider truncate font-mono">{svc.label}</span>
                <span className={cn(
                    "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md font-mono shrink-0",
                    svc.status === 'Optimal' ? "text-success bg-success/10" : 
                    svc.status === 'Stable' ? "text-brand-primary bg-brand-primary/10" : "text-destructive bg-destructive/5"
                )}>{svc.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}