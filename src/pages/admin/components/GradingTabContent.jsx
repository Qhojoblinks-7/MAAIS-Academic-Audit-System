import React from 'react';
import { TrendingUp, FileText } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function GradingTabContent({ dept, handleNodeOperation }) {
  if (!dept) return null;

  const handleAuthorizeClick = (e) => {
    e.stopPropagation();
    if (handleNodeOperation) {
      handleNodeOperation('Authorize Template Update', dept.id, dept.name);
    }
  };

  return (
    <div className="space-y-4 px-1 sm:px-0">
      {/* Institutional Grading Template Banner */}
      <div className="bg-slate-900 p-4 rounded-xl text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <TrendingUp size={48} />
        </div>
        <h5 className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40 mb-2.5">
          Institutional Grading Template
        </h5>
        <div className="grid grid-cols-2 gap-4 relative">
          <div>
            <p className="text-[8px] font-black uppercase tracking-wider text-emerald-400 mb-0.5">
              Assessment Weight
            </p>
            <p className="text-lg font-black italic font-display">70%</p>
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-wider text-blue-400 mb-0.5">
              SBA / Classwork
            </p>
            <p className="text-lg font-black italic font-display">30%</p>
          </div>
        </div>
      </div>

      {/* Departmental Specialization Rules Section */}
      <div className="space-y-2">
        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider pl-1">
          Departmental Specialization
        </h4>
        
        <div className="space-y-1.5">
          {[
            { label: 'Lab Practical Component', value: '30%', active: dept.name === 'Science' },
            { label: 'Oral Assessment Component', value: '30%', active: dept.name === 'Languages' },
            { label: 'Project Portfolio', value: '20%', active: dept.name === 'Business' },
          ].map((rule, i) => (
            <div 
              key={i} 
              className={cn(
                "p-2.5 rounded-xl border transition-all flex items-center justify-between gap-4",
                rule.active 
                  ? "bg-white border-emerald-100 shadow-xs" 
                  : "bg-slate-50/60 border-slate-100/70 opacity-40"
              )}
            >
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-slate-900 tracking-tight truncate">
                  {rule.label}
                </p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider font-mono mt-0.5">
                  SBA Sub-Weighting Protocol
                </p>
              </div>
              <div className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 font-mono",
                rule.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
              )}>
                {rule.value}
              </div>
            </div>
          ))}
        </div>

        {/* Global Action Button */}
        <button 
          onClick={handleAuthorizeClick}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-bold uppercase tracking-wider shadow-sm active:scale-[0.99] transition-all mt-3 flex items-center justify-center gap-1.5"
        >
          <FileText size={14} />
          Authorize Template Update
        </button>
      </div>
    </div>
  );
}