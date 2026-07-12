import React from 'react';
import { TrendingUp, FileText } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function GradingTabContent({ dept, handleNodeOperation }) {
  if (!dept) return null;
   
  const defaultGradingRules = [
    { label: 'Core Assessment Weighting', value: '70%', activeDepts: ['Science', 'Mathematics', 'Languages', 'Business', 'Agriculture'] },
    { label: 'SBA / Classwork Weighting', value: '30%', activeDepts: ['Science', 'Mathematics', 'Languages', 'Business', 'Agriculture'] },
  ];

  const gradingRules = defaultGradingRules;

  const handleAuthorizeClick = (e) => {
    e.stopPropagation();
    if (handleNodeOperation) {
      handleNodeOperation('Authorize Template Update', dept.id, dept.name);
    }
  };

  return (
    <div className="space-y-4 px-1 sm:px-0">
      {/* Institutional Grading Template Banner */}
      <div className="bg-brand-primary p-4 rounded-xl text-primary-foreground relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <TrendingUp size={48} />
        </div>
        <h5 className="text-[9px] font-black uppercase tracking-[0.15em] text-primary-foreground/40 mb-2.5">
          Institutional Grading Template
        </h5>
        <div className="grid grid-cols-2 gap-4 relative">
          <div>
            <p className="text-[8px] font-black uppercase tracking-wider text-success mb-0.5">
              Assessment Weight
            </p>
            <p className="text-lg font-black italic font-display">70%</p>
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-wider text-brand-primary mb-0.5">
              SBA / Classwork
            </p>
            <p className="text-lg font-black italic font-display">30%</p>
          </div>
        </div>
      </div>

      {/* Departmental Specialization Rules Section */}
      <div className="space-y-2">
        <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-wider pl-1">
          Departmental Specialization
        </h4>
        
        <div className="space-y-1.5">
{gradingRules.map((rule, i) => (
            <div 
              key={i} 
              className={cn(
                "p-2.5 rounded-xl border transition-all flex items-center justify-between gap-4",
                rule.activeDepts?.includes(dept.name)
                  ? "bg-surface border-success/20 shadow-xs" 
                  : "bg-muted/30 border-border opacity-40"
              )}
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground tracking-tight truncate">
                  {rule.label}
                </p>
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider font-mono mt-0.5">
                  SBA Sub-Weighting Protocol
                </p>
              </div>
              <div className={cn(
                "px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 font-mono",
                rule.activeDepts?.includes(dept.name) ? "bg-success/10 text-success" : "bg-muted/20 text-foreground/60"
              )}>
                {rule.value}
              </div>
            </div>
          ))}
        </div>

        {/* Global Action Button */}
        <button 
          onClick={handleAuthorizeClick}
          className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-primary-foreground rounded-xl text-[9px] font-bold uppercase tracking-wider shadow-sm active:scale-[0.99] transition-all mt-3 flex items-center justify-center gap-1.5"
        >
          <FileText size={14} />
          Authorize Template Update
        </button>
      </div>
    </div>
  );
}