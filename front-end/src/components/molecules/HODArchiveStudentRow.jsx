import { cn } from '../../lib/utils';
import { ChevronRight, ShieldCheck } from 'lucide-react';

export function HODArchiveStudentRow({ student, onClick }) {
  const scores = student.history ? student.history.map(h => h.finalGrade) : [];
  const avgGrade = scores.length > 0 
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) + '%' 
    : 'None';

  const getStatusColor = (status) => {
    switch (status) {
      case 'SECURE': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'Archived & Verified': return 'bg-success/10 text-success border-success/20';
      case 'Archive Inbound': return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
      default: return 'bg-muted text-text-secondary border-border';
    }
  };

  return (
    <div 
      onClick={() => onClick && onClick(student)}
      className={cn(
         "grid p-4 gap-3 cursor-pointer items-center transition-all border-b border-border hover:bg-muted",
        // Mobile: Stack elements naturally or into small micro-grids
        "grid-cols-2 justify-between", 
        "md:grid-cols-[2fr_1fr_1fr_1.5fr_auto] md:gap-4 md:px-6 md:py-4"
      )}
    >
      {/* Column 1: Student Profile */}
      <div className="flex items-center gap-3 col-span-1 md:col-span-1 min-w-0">
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} 
          alt="avatar" 
          className="w-9 h-9 rounded-xl border border-border p-0.5 shrink-0"
        />
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-black text-foreground truncate">{student.name}</p>
          <p className="text-xs font-bold text-muted-foreground font-mono truncate">{student.index}</p>
          {/* Mobile Only Metadata snippet */}
          <p className="text-xs text-text-secondary md:hidden font-medium mt-0.5">{student.currentClass}</p>
        </div>
      </div>

      {/* Column 2: Class (Hidden on Mobile) */}
      <div className="hidden md:block text-sm text-foreground font-semibold">
        {student.currentClass}
      </div>

      {/* Column 3: Average Grade */}
      <div className="text-right md:text-center justify-self-end md:justify-self-center">
        <span className="px-2 py-0.5 rounded bg-muted text-xs font-extrabold font-mono text-foreground border border-border">
          {avgGrade}
        </span>
      </div>

      {/* Column 4: WAEC & Verification Status Combined or side-by-side on Mobile */}
      <div className="col-span-2 md:col-span-1 flex flex-wrap gap-2 items-center justify-start md:justify-center mt-2 md:mt-0">
        {/* WAEC Badge (Desktop Only in this layout slot) */}
        <span className={cn(
          "hidden md:inline-block px-2 py-0.5 font-mono text-xs font-black rounded text-background",
          student.finalWassce === 'Pending' ? "bg-muted-foreground" : "bg-foreground"
        )}>
          WAEC: {student.finalWassce}
        </span>

        {/* Status Badge */}
        <span className={cn(
          "px-2 py-0.5 text-xs font-black uppercase tracking-wider rounded-full border inline-flex items-center gap-1",
          getStatusColor(student.status)
        )}>
          <ShieldCheck size={11} />
          <span>{student.status}</span>
        </span>
      </div>

      {/* Column 5: Action Arrow */}
      <div className="hidden md:block justify-self-end">
        <button className="p-2 hover:bg-foreground hover:text-background rounded-xl text-muted-foreground transition-all">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}