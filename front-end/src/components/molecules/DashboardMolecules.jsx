import React from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ShortJustifBadge({ justification }) {
  if (!justification) return null;
  const isShort = justification.trim().length < 10;
  if (!isShort) return null;
  
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-destructive/10 text-destructive text-xs font-black uppercase tracking-wider border border-destructive/20 shrink-0">
      <AlertOctagon size={10} />
      HOD-AR-2.2 Short
    </span>
  );
}

export function StatusBadge({ status }) {
  const colors = {
    RESOLVED: 'bg-success/10 text-success border border-success/20',
    LOCKED: 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20',
    DRAFT: 'bg-muted text-text-secondary border border-border/40',
    FLAGGED: 'bg-warning/10 text-warning border border-warning/20',
  };

  return (
    <span
      className={cn(
        'text-xs font-bold px-2 py-0.5 rounded-md shrink-0 tracking-wide uppercase',
        colors[status] || 'bg-muted text-text-secondary border border-border/40'
      )}
    >
      {status || 'UNKNOWN'}
    </span>
  );
}

export function AuditLogEntry({ log, hasShortJustification }) {
  // Safe validation check fallbacks if parent evaluation logic hook is absent
  const shortJ = typeof hasShortJustification === 'function' 
    ? hasShortJustification(log?.justification) 
    : (log?.justification?.trim()?.length ?? 0) < 10 && (log?.justification?.trim()?.length ?? 0) > 0;
  
  const statusIconColor = {
    RESOLVED: 'text-success',
    FLAGGED: 'text-warning',
    LOCKED: 'text-brand-primary',
    DRAFT: 'text-muted-foreground',
  }[log?.status] || 'text-muted-foreground';

  const iconMap = {
    RESOLVED: '✓',
    FLAGGED: '!',
    LOCKED: '🔒',
    DRAFT: '○',
  }[log?.status] || '○';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.15 }}
      className={cn(
        "p-4 hover:bg-muted/40 border-b border-border transition-all flex gap-4 items-start justify-between bg-surface",
        shortJ && "bg-destructive/10 border-l-2 border-l-destructive"
      )}
    >
      <div className="flex gap-3 items-start min-w-0">
        {/* Status Profile Block Badge */}
        <div className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border", 
          log?.status === 'RESOLVED' ? "bg-success/10 border-success/20 text-success" : 
          log?.status === 'FLAGGED' ? "bg-warning/10 border-warning/20 text-warning" : 
          log?.status === 'LOCKED' ? "bg-brand-primary/10 border-brand-primary/20 text-brand-primary" : 
          "bg-muted border-border text-muted-foreground"
        )}>
          <span className={cn("text-xs font-black", statusIconColor)}>{iconMap}</span>
        </div>

        {/* Audit Payload Metadata Context */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-bold text-foreground leading-tight">
              {log?.action || 'System Mutation Action'} —{' '}
              <span className="text-text-secondary font-medium">{log?.target || 'Global Ledger Frame'}</span>
            </p>
            <ShortJustifBadge justification={log?.justification} />
          </div>
          
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {log?.user || 'System Process Daemon'} • {log?.time || 'Realtime Static Epoch'}
          </p>

          {log?.oldValue !== undefined && log?.newValue !== undefined && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-muted rounded text-xs font-mono text-text-secondary border border-border/60 mt-0.5">
              <span>{String(log.oldValue)}</span>
              <span className="text-muted-foreground font-sans">→</span>
              <span className="font-bold text-foreground">{String(log.newValue)}</span>
            </div>
          )}

          {log?.justification && (
            <p className={cn(
              "text-xs mt-1 pl-2 border-l-2 max-w-xl break-words", 
              shortJ ? "text-destructive border-destructive font-semibold" : "text-text-secondary border-border"
            )}>
              &ldquo;{log.justification}&rdquo;
            </p>
          )}
        </div>
      </div>

      <StatusBadge status={log?.status} />
    </motion.div>
  );
}
