import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronRight, ChevronDown, Send, Flag, AlertTriangle, User, Clock, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { StatusBadge, JustificationQualityIndicator, ActionButtonGroup, HODCommentInput } from '../molecules';
import { EmptyState } from '../molecules/EmptyState';
import { useHOD } from '../../context/HODContext';

function TimelineEntry({ log, onComment, isExpanded, onToggle }) {
  const [comment, setComment] = useState(log.hodComment || '');
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
                  <span className="font-medium uppercase tracking-wider">Record</span>
                  <span className="text-gray-300">|</span>
                  <span className="font-mono">{log.recordId || '—'}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-400">{log.entityType || log.recordType || '—'}</span>
                </div>

                {(log.oldValue || log.newValue) && (
                  <div className="flex items-center gap-3 py-1 bg-gray-50 rounded-lg px-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Delta</span>
                    <span className="text-xs font-bold text-rose-600">
                      {(() => {
                        const o = log.oldValue;
                        const n = log.newValue;
                        if (o != null && n != null) return `${JSON.stringify(o)} → ${JSON.stringify(n)}`;
                        if (o != null) return `${JSON.stringify(o)} → (removed)`;
                        if (n != null) return `(none) → ${JSON.stringify(n)}`;
                        return '—';
                      })()}
                    </span>
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
  filterPresets,
  className,
}) {
  const { getFilteredAuditLogs, auditFilter, setAuditFilter } = useHOD();
  const logs = controlledLogs ?? getFilteredAuditLogs();
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const handleComment = (logId, comment) => {
    onAddComment?.(logId, comment);
  };

  const filters = filterPresets || [
    { value: 'all', label: 'All' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'FLAGGED', label: 'Flagged' },
    { value: 'LOCKED', label: 'Locked' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'DRAFT', label: 'Draft' },
  ];

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setAuditFilter(f.value)}
            className={cn(
              'px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider',
              auditFilter === f.value
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

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
