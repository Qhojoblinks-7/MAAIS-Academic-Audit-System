import React from 'react';
import { Download, AlertTriangle } from 'lucide-react';
import { EmptyState } from "../../../components/molecules";

export function InsightsPanel({ onStructuralExport, insightsStats }) {
  return (
    <div className="xl:col-span-4 space-y-8 sticky top-8">
      <div className="bg-brand-primary rounded-[2.5rem] p-8 text-primary-foreground shadow-xl shadow-brand-primary/10">
        <h3 className="text-xs font-black uppercase tracking-[0.25em] mb-8 text-primary-foreground/60">Load Distribution Matrix</h3>
        <div className="space-y-6">
          <div className="bg-surface/5 p-6 rounded-3xl border border-surface/10">
            <p className="text-xs font-black text-primary-foreground/40 uppercase tracking-widest mb-4">Top Program Load</p>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-3xl font-black italic font-display">{insightsStats?.topProgramName || 'N/A'}</span>
              <span className="text-success text-sm font-black italic font-display">+{insightsStats?.topProgramPercent || 0}%</span>
            </div>
            <p className="text-xs text-primary-foreground/60 font-medium leading-relaxed italic uppercase tracking-wider">
              {insightsStats?.topProgramName ? `${insightsStats.totalStudents.toLocaleString()} students across ${insightsStats.totalClassUnits} classes` : <EmptyState context="results" variant="compact" />}
            </p>
            <div className="mt-6 flex gap-2">
              <div className="h-1.5 flex-1 bg-surface/10 rounded-full overflow-hidden">
                <div className="h-full bg-success transition-all duration-1000" style={{ width: `${insightsStats?.topProgramPercent || 0}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface/5 p-5 rounded-3xl border border-surface/10">
              <p className="text-[9px] font-black text-primary-foreground/40 uppercase tracking-widest mb-1">Total Class Units</p>
              <p className="text-2xl font-black italic font-display">{insightsStats?.totalClassUnits ?? 0}</p>
            </div>
            <div className="bg-surface/5 p-5 rounded-3xl border border-surface/10">
              <p className="text-[9px] font-black text-primary-foreground/40 uppercase tracking-widest mb-1">Avg Occupancy</p>
              <p className="text-2xl font-black italic font-display font-mono">{insightsStats?.avgOccupancy ?? 0}%</p>
            </div>
          </div>
        </div>

        <button onClick={onStructuralExport} className="w-full mt-8 py-5 bg-surface text-foreground rounded-[2rem] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3">
          <Download size={16} /> Structural Export
        </button>
      </div>

      <div className="bg-warning/10 rounded-[2.5rem] p-8 border border-warning/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-warning/20 text-warning rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-xs font-black text-warning uppercase tracking-[0.25em]">Capacity Anomalies</h3>
        </div>
        <div className="space-y-4">
          {insightsStats?.anomalies?.length > 0 ? insightsStats.anomalies.map((anomaly, i) => (
            <div key={i} className="p-4 bg-surface/60 rounded-2xl border border-warning/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-black text-foreground italic font-display tracking-tight leading-none">{anomaly.name}</span>
                <span className="text-xs font-black text-destructive italic font-display font-mono">Overflow</span>
              </div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{anomaly.current} / {anomaly.capacity} Standard Capacity</p>
            </div>
          )) : (
            <div className="p-4 bg-surface/60 rounded-2xl border border-warning/20">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No capacity anomalies detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
