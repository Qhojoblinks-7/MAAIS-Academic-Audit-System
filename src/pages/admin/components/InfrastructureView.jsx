import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { computeNodes, backupSnapshots, serviceHealth } from '../data';

export function InfrastructureView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 px-1 sm:px-0">
      <div className="lg:col-span-2 space-y-3">
        {/* Compute Cores Monitor */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-wider">Compute Core Status</h3>
            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded-md font-mono">
              Sync: OK
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {computeNodes.map((node, i) => (
              <div key={i} className="p-2.5 bg-gray-50/60 border border-gray-100/70 rounded-xl flex items-center gap-3 min-w-0">
                <div className={cn("w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0", node.color)}>
                  <node.icon size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] font-black text-gray-900 tracking-tight leading-none mb-0.5">{node.value}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider truncate font-mono">{node.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database Snapshots */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-wider">Database Backup Registry</h3>
            <button className="h-7 px-3 bg-gray-900 text-white rounded-lg text-[8px] font-bold uppercase tracking-wider hover:bg-black transition-all">
              Initialize Snapshot
            </button>
          </div>
          <div className="space-y-1.5">
            {backupSnapshots.map((snap, i) => (
              <div key={i} className="flex items-center justify-between p-2 border border-gray-50 rounded-xl hover:bg-gray-50/50 transition-all group gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-gray-900 tracking-tight leading-none mb-0.5 truncate">{snap.id}</p>
                    <p className="text-[8px] font-medium text-gray-400 font-mono">TS: {snap.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[9px] font-bold text-gray-400 font-mono uppercase">{snap.size}</span>
                  <button className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-emerald-600 transition-all rounded-md hover:bg-slate-50">
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
        <div className="bg-gray-900 rounded-xl p-4 text-white shadow-md relative overflow-hidden">
          <ShieldAlert className="text-amber-500 mb-3" size={24} />
          <h3 className="text-[13px] font-black tracking-tight mb-1 italic">Infrastructure Lock</h3>
          <p className="text-[10px] text-gray-400 leading-normal font-medium mb-4">
            Global updates are restricted to Maintenance Windows. Emergency patches require biometric verification.
          </p>
          <div className="space-y-2">
             <div className="flex justify-between text-[8px] font-black uppercase tracking-wider font-mono">
               <span className="text-gray-400">Firewall Node</span>
               <span className="text-emerald-400">Shielded</span>
             </div>
             <div className="h-1 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 w-[94%]" />
             </div>
          </div>
        </div>

        {/* Microservices Health Checklist */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs">
          <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-wider mb-2.5">Service Health</h3>
          <div className="divide-y divide-gray-50">
            {serviceHealth.map((svc, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 first:pt-0 last:pb-0 gap-2">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider truncate font-mono">{svc.label}</span>
                <span className={cn(
                    "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md font-mono shrink-0",
                    svc.status === 'Optimal' ? "text-emerald-600 bg-emerald-50" : 
                    svc.status === 'Stable' ? "text-blue-600 bg-blue-50" : "text-rose-600 bg-rose-50"
                )}>{svc.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}