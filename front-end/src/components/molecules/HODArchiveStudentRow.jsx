import { cn } from '../../lib/utils';
import { ChevronRight, ShieldCheck } from 'lucide-react';

export function HODArchiveStudentRow({ student, onClick }) {
  const scores = student.history ? student.history.map(h => h.finalGrade) : [];
  const avgGrade = scores.length > 0 
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) + '%' 
    : 'None';

  const getStatusColor = (status) => {
    switch (status) {
      case 'SECURE': return 'bg-rose-50 text-rose-800 border-rose-100';
      case 'Archived & Verified': return 'bg-emerald-50 text-emerald-800 border-emerald-100';
      case 'Archive Inbound': return 'bg-blue-50 text-blue-800 border-blue-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div 
      onClick={() => onClick && onClick(student)}
      className={cn(
        "grid p-4 gap-3 cursor-pointer items-center transition-all border-b border-slate-100 hover:bg-slate-50",
        // Mobile: Stack elements naturally or into small micro-grids
        "grid-cols-2 justify-between", 
        // Desktop (md): Transforms into a 5-column strict table row layout
        "md:grid-cols-[2fr_1fr_1fr_1.5fr_auto] md:gap-4 md:px-6 md:py-4"
      )}
    >
      {/* Column 1: Student Profile */}
      <div className="flex items-center gap-3 col-span-1 md:col-span-1 min-w-0">
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} 
          alt="avatar" 
          className="w-9 h-9 rounded-xl border border-slate-200 p-0.5 shrink-0"
        />
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-black text-slate-900 truncate">{student.name}</p>
          <p className="text-[10px] font-bold text-slate-400 font-mono truncate">{student.index}</p>
          {/* Mobile Only Metadata snippet */}
          <p className="text-[10px] text-slate-500 md:hidden font-medium mt-0.5">{student.currentClass}</p>
        </div>
      </div>

      {/* Column 2: Class (Hidden on Mobile) */}
      <div className="hidden md:block text-sm text-slate-600 font-semibold">
        {student.currentClass}
      </div>

      {/* Column 3: Average Grade */}
      <div className="text-right md:text-center justify-self-end md:justify-self-center">
        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] sm:text-xs font-extrabold font-mono text-slate-800 border border-slate-200">
          {avgGrade}
        </span>
      </div>

      {/* Column 4: WAEC & Verification Status Combined or side-by-side on Mobile */}
      <div className="col-span-2 md:col-span-1 flex flex-wrap gap-2 items-center justify-start md:justify-center mt-2 md:mt-0">
        {/* WAEC Badge (Desktop Only in this layout slot) */}
        <span className={cn(
          "hidden md:inline-block px-2 py-0.5 font-mono text-[10px] font-black rounded text-white",
          student.finalWassce === 'Pending' ? "bg-slate-400" : "bg-slate-900"
        )}>
          WAEC: {student.finalWassce}
        </span>

        {/* Status Badge */}
        <span className={cn(
          "px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border inline-flex items-center gap-1",
          getStatusColor(student.status)
        )}>
          <ShieldCheck size={11} />
          <span>{student.status}</span>
        </span>
      </div>

      {/* Column 5: Action Arrow */}
      <div className="hidden md:block justify-self-end">
        <button className="p-2 hover:bg-slate-900 hover:text-white rounded-xl text-slate-400 transition-all">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}