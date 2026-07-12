import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, ChevronDown, User, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { StatusBadge, JustificationQualityIndicator, HODCommentInput } from '../molecules';
import { EmptyState } from '../molecules/EmptyState';

const GRADE_SCALE = {
  'A1': 'Excellent', 'B2': 'Very Good', 'B3': 'Good',
  'C4': 'Credit',   'C5': 'Credit',   'C6': 'Credit',
  'D7': 'Pass',     'E8': 'Pass',     'F9': 'Fail',
};

const toTitle = (str) => str.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();

const formatValue = (val) => {
  if (val == null) return '—';
  if (typeof val === 'object') {
    if (Array.isArray(val)) return val.map(formatValue).join(', ');
    return Object.entries(val).map(([k, v]) => `${toTitle(k)}: ${formatValue(v)}`).join('\n');
  }
  const str = String(val);
  const gradeLabel = GRADE_SCALE[str];
  return gradeLabel ? `${str} (${gradeLabel})` : str;
};

const DeltaBlock = ({ value, color }) => (
  <span className={`font-mono text-[10px] ${color} px-2 py-1.5 rounded border whitespace-pre-wrap leading-relaxed`}>
    {formatValue(value)}
  </span>
);

function TimelineEntry({ log, onComment, isExpanded, onToggle }) {
  const isShort = (log.justification || '').trim().length < 10;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="border border-gray-100 rounded-xl overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
          {isExpanded
            ? <ChevronDown size={14} className="text-gray-500" />
            : <ChevronRight size={14} className="text-gray-500" />
          }
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-900 truncate">{log.action || 'Unknown action'}</span>
            <StatusBadge status={log.status} />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <User size={10} className="text-gray-400" />
            <span className="text-[10px] text-gray-500">{log.teacherName || 'Unknown'}</span>
            <span className="text-[10px] text-gray-300">|</span>
            <Clock size={10} className="text-gray-400" />
            <span className="text-[10px] text-gray-500">{log.timestamp?.split('T')[0] || '—'}</span>
          </div>
          {isShort && log.justification && (
            <div className="mt-1">
              <JustificationQualityIndicator text={log.justification} />
            </div>
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pl-[3.75rem] border-t border-gray-50">
              <div className="py-2 space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <span className="font-medium uppercase tracking-wider">Entry</span>
                  <span className="text-gray-300">|</span>
                  <span className="font-mono text-[10px]">{log.recordId ? `#${log.recordId.slice(0, 8)}…` : '—'}</span>
                  <span className="text-gray-300">|</span>
                   <span className="text-gray-400">{toTitle(log.entityType || log.recordType || '—')}</span>
                </div>

                  {(log.oldValue || log.newValue) && (
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 py-2 bg-gray-50 rounded-lg px-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-0.5 shrink-0">Delta</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <DeltaBlock value={log.oldValue} color="text-rose-700 bg-rose-50 border-rose-100" />
                        <span className="text-gray-400 text-xs">→</span>
                        <DeltaBlock value={log.newValue} color="text-emerald-700 bg-emerald-50 border-emerald-100" />
                      </div>
                    </div>
                  )}

                {log.justification && (
                  <div className="py-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Justification</span>
                    <p className="text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                      {log.justification}
                    </p>
                    <div className="mt-1">
                      <JustificationQualityIndicator text={log.justification} />
                    </div>
                  </div>
                )}

                <HODCommentInput
                  onSubmit={(val) => onComment?.(log.id || log.recordId, val)}
                  initialValue={log.hodComment || ''}
                  placeholder="Add HOD feedback..."
                  maxLength={500}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function AuditLogTimeline({
  logs: controlledLogs,
  onAddComment,
  className,
}) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const handleComment = (logId, comment) => {
    onAddComment?.(logId, comment);
  };

  const logs = controlledLogs ?? [];

  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-2">
        {logs.length === 0 ? (
          <EmptyState context="tickets" variant="compact" />
        ) : (
          logs.map((log, i) => (
            <TimelineEntry
              key={log.id || i}
              log={log}
              isExpanded={expandedId === (log.id || i)}
              onToggle={() => toggleExpand(log.id || i)}
              onComment={handleComment}
            />
          ))
        )}
      </div>
    </div>
  );
}
