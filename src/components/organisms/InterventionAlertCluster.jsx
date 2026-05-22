import React, { useState, useMemo } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Flag, CheckCircle2, ChevronDown, AlertTriangle, MessageSquare, Save, User, BookOpen, Trash2, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AlertSeverityChip, ActionButtonGroup, LoadingSpinner } from '../molecules';
import { useHOD } from '../../context/HODContext';

const SEVERITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function EmptyStateView({ message = 'No alerts to display' }) {
  return (
    <div className="text-center py-10">
      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-gray-100">
        <CheckCircle2 size={28} className="text-gray-300" />
      </div>
      <p className="text-xs text-gray-400">{message}</p>
    </div>
  );
}

function CounselingNoteComposer({ alertId, onSubmit, existingNote }) {
  const [text, setText] = useState(existingNote || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await onSubmit?.(alertId, text.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-start gap-2">
        <MessageSquare size={12} className="mt-1 text-gray-400 shrink-0" />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a counseling note..."
          rows={2}
          className="w-full text-[10px] border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500"
        />
      </div>
      <div className="flex items-center justify-end gap-1.5">
        <button
          onClick={handleSave}
          disabled={!text.trim() || saving}
          className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-40 flex items-center gap-1"
        >
          {saving ? <LoadingSpinner size="sm" /> : <Save size={10} />}
          Save note
        </button>
      </div>
    </div>
  );
}

function StudentClusterCard({ cluster, onResolve, onAddNote }) {
  const [expanded, setExpanded] = useState(false);
  const [resolvedCount, setResolvedCount] = useState(0);

  const items = cluster.items || [];
  const isResolved = cluster.allResolved;
  const itemCount = items.length;

  const handleResolve = (alertId) => {
    onResolve?.(alertId);
    setResolvedCount((c) => c + 1);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Cluster Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors"
      >
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
          isResolved ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        )}>
          {isResolved
            ? <CheckCircle2 size={16} />
            : <AlertTriangle size={16} />
          }
        </div>

        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-semibold text-gray-900 truncate">
            {cluster.studentName || 'Unknown student'}
          </p>
          <p className="text-[10px] text-gray-500 flex items-center gap-1">
            <span className="font-mono">{cluster.studentIndex || '—'}</span>
            <span className="text-gray-300">·</span>
            {itemCount} alert{itemCount !== 1 ? 's' : ''}
            {resolvedCount > 0 && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-emerald-600">{resolvedCount} resolved</span>
              </>
            )}
          </p>
        </div>

        {items.length > 0 && (
          <AlertSeverityChip
            severity={
              SEVERITY_ORDER[items[0].severity] <= SEVERITY_ORDER.MEDIUM
                ? items[0].severity
                : 'LOW'
            }
          />
        )}

        <ChevronDown
          size={14}
          className={cn('text-gray-400 transition-transform shrink-0', expanded && 'rotate-180')}
        />
      </button>

      {/* Expanded items */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-50"
          >
            <div className="px-3 pb-3 space-y-2">
              {items.map((item, i) => (
                <div
                  key={item.id || i}
                  className={cn(
                    'p-3 rounded-xl border transition-colors',
                    item.resolved ? 'border-emerald-100 bg-emerald-50/50' : 'border-gray-100 bg-gray-50/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-gray-800">
                          {item.subject || 'General'}
                        </span>
                        <AlertSeverityChip severity={item.severity || 'LOW'} />
                        {item.resolved && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Resolved</span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[10px] text-gray-500 mt-1">{item.description}</p>
                      )}
                    </div>

                    {!item.resolved && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleResolve(item.id); }}
                        title="Resolve alert"
                        className="px-2.5 py-1 bg-rose-600 text-white text-[10px] font-medium rounded-lg hover:bg-rose-700 shrink-0 flex items-center gap-1"
                      >
                        <Flag size={10} /> Resolve
                      </button>
                    )}
                  </div>

                  {item.resolved !== true && (
                    <div className="mt-2">
                      <CounselingNoteComposer
                        alertId={item.id}
                        onSubmit={onAddNote}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function InterventionAlertCluster({
  alerts: controlledAlerts,
  onResolve,
  onAddNote,
  filterTabs,
  className,
}) {
  const { getAggregatedAlerts, alertFilter, setAlertFilter, getFilteredAlerts, interventionAlerts } = useHOD();
  const alerts = controlledAlerts ?? interventionAlerts;
  const filtered = getFilteredAlerts(alerts);
  const clusters = useMemo(() => {
    // If alerts are already aggregated by parent, render flat list; otherwise group
    if (alerts.length === 0) return [];
    const first = alerts[0];
    // Consider it pre-grouped if items array present:
    if ('items' in first) return alerts;
    // Otherwise re-group
    return getAggregatedAlerts(filtered);
  }, [alerts, filtered, getAggregatedAlerts]);

  const tabs = filterTabs || [
    { id: 'all', label: 'All' },
    { id: 'HIGH', label: 'High' },
    { id: 'MEDIUM', label: 'Medium' },
    { id: 'LOW', label: 'Low' },
    { id: 'resolved', label: 'Resolved' },
  ];

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-1.5 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setAlertFilter(t.id)}
            className={cn(
              'px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider',
              alertFilter === t.id
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {clusters.length === 0 ? (
        <EmptyStateView message="No alerts match the selected filter." />
      ) : (
        <div className="space-y-2">
          {clusters.map((cluster, i) => (
            <StudentClusterCard
              key={cluster.studentId || i}
              cluster={cluster}
              onResolve={onResolve}
              onAddNote={onAddNote}
            />
          ))}
        </div>
      )}
    </div>
  );
}
