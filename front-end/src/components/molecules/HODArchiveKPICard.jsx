import { Database, TrendingUp, Users, ShieldCheck, Award } from 'lucide-react';
import { cn } from '../../lib/utils';

export function HODArchiveKPICard({ title, val, note, icon: Icon, color = 'slate' }) {
  const getColorClasses = () => {
    switch (color) {
      case 'emerald': return 'bg-emerald-50/60 border-emerald-100';
      case 'blue': return 'bg-blue-50/60 border-blue-100';
      case 'amber': return 'bg-amber-50/60 border-amber-100';
      default: return 'bg-white border-slate-200/60';
    }
  };

  const getIconColor = () => {
    switch (color) {
      case 'emerald': return 'bg-emerald-600 text-white';
      case 'blue': return 'bg-blue-600 text-white';
      case 'amber': return 'bg-amber-600 text-white';
      default: return 'bg-slate-900 text-white';
    }
  };

  return (
    <div className={cn(
      // Scaled down roundness and padding for mobile viewports
      "rounded-xl sm:rounded-[1.75rem] p-3 sm:p-5 flex items-center justify-between shadow-sm border transition-all",
      getColorClasses()
    )}>
      <div className="min-w-0 flex-1 pr-2">
        <p className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">
          {title}
        </p>
        {/* Adjusted mobile typography size from text-lg to text-base */}
        <p className="text-base sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate leading-none my-1">
          {val}
        </p>
        {/* Re-enabled for mobile with an ultra-fine, readable layout */}
        {note && (
          <p className="text-[7px] sm:text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-wide truncate mt-0.5">
            {note}
          </p>
        )}
      </div>
      
      {/* Scaled down icon housing frame */}
      <div className={cn(
        "w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-[1rem] flex items-center justify-center shrink-0 shadow-sm",
        getIconColor()
      )}>
        <Icon size={14} className="sm:w-5 sm:h-5" />
      </div>
    </div>
  );
}