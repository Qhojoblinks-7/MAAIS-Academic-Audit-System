import { cn } from '../../lib/utils';

const colorStyles = {
  emerald: 'bg-success/10 text-success border-success/20',
  blue: 'bg-brand-primary/5 text-brand-primary border-brand-primary/20',
  amber: 'bg-warning/10 text-warning border-warning/20',
  slate: 'bg-background text-text-primary border-border'
};

export function HODArchiveKPICard({ title, val, note, icon: Icon, color = 'slate' }) {
  return (
    <div className={cn(
      "bg-surface p-3 rounded-xl border border-border shadow-xs w-full flex flex-col justify-between min-w-0",
      colorStyles[color]
    )}>
      <div className="flex items-center gap-2.5 mb-2 min-w-0">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border", colorStyles[color])}>
          <Icon size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-black text-text-primary tracking-tighter leading-none truncate">
            {val}
          </p>
          <p className="text-[8px] font-black text-text-secondary uppercase tracking-wider mt-0.5 font-mono leading-none truncate">
            {title}
          </p>
        </div>
      </div>

      {note && (
        <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wide truncate mt-0.5">
          {note}
        </p>
      )}
    </div>
  );
}
