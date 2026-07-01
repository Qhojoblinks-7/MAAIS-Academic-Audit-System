import React from 'react';
import { Download, AlertTriangle } from 'lucide-react';
import { EmptyState } from "../../../components/molecules";

export function InsightsPanel({ onStructuralExport, insightsStats }) {
  return (
    <div className="xl:col-span-4 space-y-8 sticky top-8">
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/10">
        <h3 className="text-[12px] font-black uppercase tracking-[0.25em] mb-8 text-white/60">Load Distribution Matrix</h3>
        <div className="space-y-6">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Top Program Load</p>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-3xl font-black italic font-display">{insightsStats?.topProgramName || 'N/A'}</span>
              <span className="text-emerald-400 text-sm font-black italic font-display">+{insightsStats?.topProgramPercent || 0}%</span>
            </div>
            <p className="text-[10px] text-white/60 font-medium leading-relaxed italic uppercase tracking-wider">
              {insightsStats?.topProgramName ? `${insightsStats.totalStudents.toLocaleString()} students across ${insightsStats.totalClassUnits} classes` : <EmptyState context="results" variant="compact" />}
            </p>
            <div className="mt-6 flex gap-2">
              <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${insightsStats?.topProgramPercent || 0}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Total Class Units</p>
              <p className="text-2xl font-black italic font-display">{insightsStats?.totalClassUnits ?? 0}</p>
            </div>
            <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Avg Occupancy</p>
              <p className="text-2xl font-black italic font-display font-mono">{insightsStats?.avgOccupancy ?? 0}%</p>
            </div>
          </div>
        </div>

        <button onClick={onStructuralExport} className="w-full mt-8 py-5 bg-white text-slate-900 rounded-[2rem] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3">
          <Download size={16} /> Structural Export
        </button>
      </div>

      <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-amber-200 text-amber-700 rounded-xl flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-[11px] font-black text-amber-900 uppercase tracking-[0.25em]">Capacity Anomalies</h3>
        </div>
        <div className="space-y-4">
          {insightsStats?.anomalies?.length > 0 ? insightsStats.anomalies.map((anomaly, i) => (
            <div key={i} className="p-4 bg-white/60 rounded-2xl border border-amber-200/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[12px] font-black text-slate-900 italic font-display tracking-tight leading-none">{anomaly.name}</span>
                <span className="text-[10px] font-black text-rose-600 italic font-display font-mono">Overflow</span>
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{anomaly.current} / {anomaly.capacity} Standard Capacity</p>
            </div>
          )) : (
            <div className="p-4 bg-white/60 rounded-2xl border border-amber-200/50">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No capacity anomalies detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
