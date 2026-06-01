import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, FileSpreadsheet, FileText, BookOpen, RefreshCw, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { StatusBadge, ActionButtonGroup, ExportFormatSelector, LoadingSpinner, EmptyState } from '../molecules';
import { useHOD } from '../../context/HODContext';

function ProgressBar({ value, size = 'md', showLabel = true }) {
  const color = value >= 95 ? 'emerald' : value >= 70 ? 'amber' : 'rose';
  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';
  return (
    <div className="flex items-center gap-2">
      <div className={cn('flex-1 bg-gray-100 rounded-full overflow-hidden', height)}>
        <div
          className={cn('h-full rounded-full transition-all', `bg-${color}-500`)}
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn('text-[10px] font-medium min-w-[2.25rem]',
          value >= 95 ? 'text-emerald-600' : value >= 70 ? 'text-amber-600' : 'text-rose-600'
        )}>
          {value}%
        </span>
      )}
    </div>
  );
}

function ClassValidationCard({ cls }) {
  const [expanded, setExpanded] = useState(false);

  const checks = (cls.checks || []);
  const passCount = checks.filter((c) => c.pass).length;
  const totalCount = checks.length;
  const isReady = passCount === totalCount && totalCount > 0;
  const progress = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white rounded-2xl border transition-all overflow-hidden',
        isReady ? 'border-emerald-200 shadow-sm' : 'border-gray-100 shadow-sm'
      )}
    >
      <button onClick={() => setExpanded(!expanded)} className="w-full p-3.5 flex items-start gap-3 hover:bg-gray-50 transition-colors">
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
          isReady ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
        )}>
          {isReady ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {cls.className || cls.name || 'Unknown class'}
            </p>
            <StatusBadge status={cls.status || 'PENDING'} />
          </div>
          {cls.subject && (
            <p className="text-[10px] text-gray-500 mt-0.5">{cls.subject}</p>
          )}
          <div className="mt-2">
            <ProgressBar value={progress} size="sm" />
          </div>
        </div>

        <ChevronRight
          size={14}
          className={cn('text-gray-400 shrink-0 transition-transform', expanded && 'rotate-90')}
        />
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden border-t border-gray-50"
        >
          <div className="px-3 pb-3 pl-[3.75rem] space-y-1.5">
            {checks.map((check, i) => (
              <div key={i} className="flex items-center gap-2 py-1 px-2 rounded-lg bg-gray-50">
                {check.pass
                  ? <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                  : <XCircle size={12} className="text-rose-500 shrink-0" />
                }
                <span className={cn('text-[10px] font-medium', check.pass ? 'text-gray-700' : 'text-rose-600')}>
                  {check.label}
                </span>
              </div>
            ))}
            {!isReady && (
              <div className="flex items-center gap-2 py-1.5 px-2 bg-rose-50 rounded-lg text-[10px] text-rose-700">
                <AlertTriangle size={12} />
                {totalCount - passCount} check{totalCount - passCount !== 1 ? 's' : ''} failing — fix issues before export.
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export function WAECExportValidator({
  classes: controlledClasses,
  exportFn,
  format,
  className,
}) {
  const { departmentProgress } = useHOD();
  const classes = useMemo(() => {
    const source = controlledClasses ?? departmentProgress;
    // De-duplicate by id
    const seen = new Set();
    return source.filter(cls => {
      const key = cls.id || cls.className || JSON.stringify(cls);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [controlledClasses, departmentProgress]);

  const allReady = useMemo(() => classes.length > 0 && classes.every((c) => c.ready ?? (c.checks?.every?.((ch) => ch.pass) ?? false)), [classes]);
  const passCount = classes.filter((c) => (c.ready ?? c.checks?.every?.((ch) => ch.pass) ?? false)).length;
  const failCount = classes.length - passCount;

  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [exporting, setExporting] = useState(null);

  const handleExport = async (clsId) => {
    if (!exportFn || failCount > 0) return;
    setExporting(clsId);
    try {
      await exportFn(clsId, selectedFormat);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Summary badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-lg text-[10px] font-medium text-gray-600">
          <ShieldCheck size={11} className="text-gray-500" />
            {classes.length} class{classes.length !== 1 ? 'es' : ''}
        </div>
        {failCount > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-200/60 rounded-lg text-[10px] font-bold text-rose-700">
            <XCircle size={11} />
            {failCount} failing
          </div>
        )}
        {allReady && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200/60 rounded-lg text-[10px] font-bold text-emerald-700">
            <CheckCircle2 size={11} />
            All ready
          </div>
        )}
      </div>

      {/* Class cards */}
      {classes.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No classes to validate"
          description="Add classes to see WAEC export compliance checks."
        />
      ) : (
        <div className="space-y-2">
          {classes.map((cls, i) => (
            <div key={cls.id || i} className="space-y-2">
              <ClassValidationCard cls={cls} />
              {(cls.ready ?? cls.checks?.every?.((ch) => ch.pass)) && (
                <div className="flex items-center justify-end gap-2">
                  <ExportFormatSelector
                    value={selectedFormat}
                    onChange={setSelectedFormat}
                    className="w-auto"
                  />
                  <button
                    onClick={() => handleExport(cls.id)}
                    disabled={exporting === cls.id}
                    className="px-3 py-1.5 bg-emerald-600 text-white text-[10px] font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {exporting === cls.id ? (
                      <><LoadingSpinner size="sm" /> Exporting…</>
                    ) : (
                      <>
                        {selectedFormat === 'csv' && <FileSpreadsheet size={12} />}
                        {selectedFormat === 'pdf' && <FileText size={12} />}
                        {selectedFormat === 'broadsheet' && <BookOpen size={12} />}
                        Export {selectedFormat?.toUpperCase() || 'WAEC'}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Global actions */}
      {classes.length > 0 && !allReady && (
        <div className="pt-2">
          <ActionButtonGroup
            actions={[{
              label: 'Refresh checks',
              variant: 'secondary',
              icon: RefreshCw,
              onClick: () => window.location.reload(),
            }]}
            className="justify-end"
          />
        </div>
      )}
    </div>
  );
}
