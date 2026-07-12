import { cn } from '../../lib/utils';

const colorStyles = {
  emerald: 'bg-success/10 text-success',
  blue: 'bg-brand-primary/5 text-brand-primary',
  amber: 'bg-warning/10 text-warning',
  slate: 'bg-background text-text-primary',
};

export function HODArchiveKPICard({ title, val, note, icon: Icon, color = 'slate', progress }) {
  return (
    <div className={cn(
      "bg-surface p-4 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all relative group"
    )}>
      <div className="flex items-center justify-between h-full gap-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0", colorStyles[color])}>
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1 truncate whitespace-nowrap">{title}</p>
            {progress !== undefined ? (
              <div className="space-y-1">
                <div className="h-1.5 w-24 bg-border rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", progress < 40 ? "bg-destructive" : progress < 75 ? "bg-warning" : "bg-success")}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[9px] font-semibold text-text-secondary whitespace-nowrap">
                  <span>{progress.toFixed(1)}% Complete</span>
                </p>
              </div>
            ) : (
              <p className="text-[11px] font-medium text-text-secondary leading-tight truncate whitespace-nowrap">{note}</p>
            )}
          </div>
        </div>
        <div className="text-right pl-2 shrink-0">
          <p className="text-3xl font-bold tracking-tighter leading-none tabular-nums whitespace-nowrap">{val}</p>
        </div>
      </div>
    </div>
  );
}
