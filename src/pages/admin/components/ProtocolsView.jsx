import React from 'react';
import { cn } from '../../../lib/utils'; 
import mockApiData from '../../../data/mockApiData.json';

export function ProtocolsView() {
  const securityPolicies = mockApiData.engineRoom?.securityPolicies || [];

  return (
    <div className="max-w-3xl mx-auto space-y-3 px-1 sm:px-0">
      {/* Parameter Adjustment Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs">
        <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-wider mb-3">
          Institutional Parameters
        </h3>
        {/* Compact Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider ml-0.5 font-mono">
              Academic Year
            </label>
            <select className="w-full h-8 bg-gray-50/60 border border-gray-100 rounded-lg px-3 text-[11px] font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer">
              <option>2025/2026 Academic Cycle</option>
              <option>2026/2027 Academic Cycle</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider ml-0.5 font-mono">
              Current Terminal Node
            </label>
            <select className="w-full h-8 bg-gray-50/60 border border-gray-100 rounded-lg px-3 text-[11px] font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer">
              <option>First Term Protocol</option>
              <option>Second Term Protocol</option>
              <option>Third Term Protocol</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider ml-0.5 font-mono">
              Global Mark Cap (%)
            </label>
            <input 
              type="number" 
              defaultValue={100} 
              className="w-full h-8 bg-gray-50/60 border border-gray-100 rounded-lg px-3 text-[11px] font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-mono" 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider ml-0.5 font-mono">
              Revision Buffer (Days)
            </label>
            <input 
              type="number" 
              defaultValue={7} 
              className="w-full h-8 bg-gray-50/60 border border-gray-100 rounded-lg px-3 text-[11px] font-bold tracking-tight focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-mono" 
            />
          </div>
        </div>
      </div>

      {/* Feature Toggles Panel */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs">
        <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-wider mb-3">
          Security & Verification Tiering
        </h3>
        <div className="space-y-1.5">
          {securityPolicies.map((policy, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between p-2.5 bg-gray-50/60 border border-gray-100 rounded-xl group hover:border-emerald-100/80 transition-all gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-gray-900 tracking-tight leading-none mb-1 truncate">
                  {policy.label}
                </p>
                <p className="text-[9px] text-gray-400 font-medium line-clamp-1 sm:line-clamp-none">
                  {policy.desc}
                </p>
              </div>
              
              {/* Tightened Toggle Switch */}
              <button className={cn(
                "w-9 h-5 rounded-full relative transition-all duration-200 shrink-0 cursor-pointer",
                policy.active ? "bg-emerald-600 shadow-xs" : "bg-gray-200"
              )}>
                <div className={cn(
                  "w-3 h-3 bg-white rounded-full absolute top-1 transition-all duration-200",
                  policy.active ? "left-5" : "left-1"
                )} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Global Sync Action Call */}
      <div className="flex justify-end pt-1">
        <button className="w-full sm:w-auto h-8 px-6 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all shadow-sm active:scale-[0.99]">
          Sync Protocols Institution-Wide
        </button>
      </div>
    </div>
  );
}