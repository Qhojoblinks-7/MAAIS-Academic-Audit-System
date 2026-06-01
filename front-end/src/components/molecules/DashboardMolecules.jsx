import React from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ShortJustifBadge({ justification }) {
  if (!justification) return null;
  const isShort = justification.trim().length < 10;
  if (!isShort) return null;
  
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-wider border border-rose-200 shrink-0">
      <AlertOctagon size={10} />
      HOD-AR-2.2 Short
    </span>
  );
}

export function StatusBadge({ status }) {
  const colors = {
    RESOLVED: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    LOCKED: 'bg-blue-50 text-blue-700 border border-blue-100',
    DRAFT: 'bg-slate-100 text-slate-600 border border-slate-200/40',
    FLAGGED: 'bg-amber-50 text-amber-700 border border-amber-100',
  };

  return (
    <span
      className={cn(
        'text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 tracking-wide uppercase',
        colors[status] || 'bg-slate-100 text-slate-600 border border-slate-200/40'
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
    RESOLVED: 'text-emerald-600',
    FLAGGED: 'text-amber-600',
    LOCKED: 'text-blue-600',
    DRAFT: 'text-slate-500',
  }[log?.status] || 'text-slate-500';

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
        "p-4 hover:bg-slate-50/40 border-b border-gray-100 transition-all flex gap-4 items-start justify-between bg-white",
        shortJ && "bg-rose-50/20 border-l-2 border-l-rose-400"
      )}
    >
      <div className="flex gap-3 items-start min-w-0">
        {/* Status Profile Block Badge */}
        <div className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border", 
          log?.status === 'RESOLVED' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
          log?.status === 'FLAGGED' ? "bg-amber-50 border-amber-100 text-amber-600" : 
          log?.status === 'LOCKED' ? "bg-blue-50 border-blue-100 text-blue-600" : 
          "bg-slate-50 border-slate-100 text-slate-500"
        )}>
          <span className={cn("text-xs font-black", statusIconColor)}>{iconMap}</span>
        </div>

        {/* Audit Payload Metadata Context */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {log?.action || 'System Mutation Action'} —{' '}
              <span className="text-slate-500 font-medium">{log?.target || 'Global Ledger Frame'}</span>
            </p>
            <ShortJustifBadge justification={log?.justification} />
          </div>
          
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {log?.user || 'System Process Daemon'} • {log?.time || 'Realtime Static Epoch'}
          </p>

          {log?.oldValue !== undefined && log?.newValue !== undefined && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 rounded text-[10px] font-mono text-slate-600 border border-slate-200/60 mt-0.5">
              <span>{String(log.oldValue)}</span>
              <span className="text-slate-400 font-sans">→</span>
              <span className="font-bold text-slate-800">{String(log.newValue)}</span>
            </div>
          )}

          {log?.justification && (
            <p className={cn(
              "text-xs italic mt-1 pl-2 border-l-2 max-w-xl break-words", 
              shortJ ? "text-rose-600 border-rose-300 font-semibold" : "text-slate-500 border-slate-200"
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