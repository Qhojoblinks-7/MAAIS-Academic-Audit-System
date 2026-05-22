import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Flag, RefreshCw, ChevronDown, AlertTriangle, Search,
  X, CheckSquare, Square, ChevronRight, MessageSquare,
  Download, Send, User, Clock, Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { DateRangeFilter, ActionButtonGroup, StatusBadge, JustificationQualityIndicator, HODCommentInput } from '../../components/molecules';
import { AuditLogTimeline } from '../../components/organisms';
import { ConfirmationDialog } from '../../components/molecules';

const ACTION_FILTERS = [
  { value: 'all',           label: 'All Actions' },
  { value: 'GRADE_CHANGE',  label: 'Grade Changes' },
  { value: 'JUSTIFICATION', label: 'Justifications' },
  { value: 'FLAG',          label: 'Flags' },
  { value: 'HOD_COMMENT',   label: 'HOD Comments' },
  { value: 'LOCK',          label: 'Locks' },
];

export function HODAudit() {
  const { auditLogs, auditFilter, setAuditFilter, addHODComment, hasShortJustification, refreshAuditLogs, isLoading } = useHOD();

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkMenu,  setShowBulkMenu]  = useState(false);
  const [showConfirm,   setShowConfirm]    = useState(null); // { label, onConfirm }

  const filteredLogs = useMemo(() => {
    let list = auditLogs;
    if (auditFilter !== 'all') {
      list = list.filter(l => l.status === auditFilter || (l.action || '').toUpperCase().includes(auditFilter));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        (l.action     || '').toLowerCase().includes(q) ||
        (l.teacherName|| '').toLowerCase().includes(q) ||
        (l.justification || '').toLowerCase().includes(q) ||
        (l.recordId   || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [auditLogs, auditFilter, search]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const toggleSelectAll = () => {
    const allIds = new Set(filteredLogs.map(l => l.id || l.recordId));
    setSelectedIds(allIds.size === selectedIds.size ? new Set() : allIds);
  };

  const flagged        = filteredLogs.filter(l => hasShortJustification(l.justification));
  const selectedCount  = selectedIds.size;

  const bulkActions = [
    { label: 'Flag All',            variant: 'danger',  icon: Flag,      onClick: () => console.log('bulk flag', selectedIds) },
    { label: 'Short Justification', variant: 'secondary',icon: AlertTriangle, onClick: () => console.log('filter short') },
    { label: 'Export CSV',          variant: 'secondary',icon: Download,   onClick: () => console.log('export csv') },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-5">

          {/* Header + stats */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Audit &amp; Oversight</h1>
              <p className="text-sm text-gray-500 mt-0.5">{filteredLogs.length} log entries · HOD-AR-2.x compliance view</p>
            </div>
            <button onClick={refreshAuditLogs} disabled={isLoading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm">
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {/* Summary chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-[10px] font-medium text-gray-600">
              <Filter size={11} /> {auditLogs.length} total
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200/60 rounded-lg text-[10px] font-bold text-amber-700">
              <AlertTriangle size={11} /> {flagged.length} short justifications
            </div>
            {selectedCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200/60 rounded-lg text-[10px] font-bold text-blue-700">
                {selectedCount} selected
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status filter */}
              <div className="relative">
                <select
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="text-xs font-medium text-gray-700 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none bg-white hover:border-gray-300 appearance-none pr-7"
                >
                  {ACTION_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search logs…"
                  className="w-full pl-8 pr-7 py-1.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={11} />
                  </button>
                )}
              </div>

              {/* Bulk toolbar */}
              {selectedCount > 0 && (
                <div className="relative">
                  <button onClick={() => setShowBulkMenu(!showBulkMenu)}
                    className="px-3 py-1.5 bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-medium rounded-xl hover:bg-blue-100 flex items-center gap-1.5">
                    <CheckSquare size={12} /> Bulk Actions ({selectedCount})
                    <ChevronDown size={12} />
                  </button>
                  {showBulkMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowBulkMenu(false)} />
                      <div className="absolute right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-lg p-1 min-w-[160px] z-50">
                        {bulkActions.map((a, i) => (
                          <button key={i} onClick={() => {
                            a.onClick();
                            setShowBulkMenu(false);
                          }} className={cn(
                            "w-full px-3 py-2 text-left text-xs rounded-lg hover:bg-gray-50",
                            a.variant === 'danger' ? 'text-rose-600 hover:bg-rose-50' : 'text-gray-700'
                          )}>
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Column check bar */}
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5"
              >
                {selectedCount === filteredLogs.length && filteredLogs.length > 0
                  ? <CheckSquare size={14} className="text-blue-600" />
                  : <Square size={14} className="text-gray-400" />
                }
                <span className="text-[10px] font-medium text-gray-600">
                  {selectedCount === filteredLogs.length ? 'Deselect All' : 'Select All'}
                </span>
              </button>
              <span className="text-[10px] text-gray-400">|</span>
              <label className="flex items-center gap-1"><input type="checkbox" defaultChecked className="rounded border-gray-300" />
                <span className="text-[10px] text-gray-600">Action</span></label>
              <label className="flex items-center gap-1"><input type="checkbox" defaultChecked className="rounded border-gray-300" />
                <span className="text-[10px] text-gray-600">Who</span></label>
              <label className="flex items-center gap-1"><input type="checkbox" defaultChecked className="rounded border-gray-300" />
                <span className="text-[10px] text-gray-600">Timestamp</span></label>
              <label className="flex items-center gap-1"><input type="checkbox" defaultChecked className="rounded border-gray-300" />
                <span className="text-[10px] text-gray-600">Status</span></label>
            </div>
          </div>

          {/* Audit timeline */}
          <AuditLogTimeline
            logs={filteredLogs}
            onAddComment={addHODComment}
          />
        </div>
      </div>

      <ConfirmationDialog
        open={showConfirm?.open}
        title={showConfirm?.title}
        message={showConfirm?.message}
        confirmLabel={showConfirm?.confirmLabel}
        onConfirm={() => { showConfirm?.onConfirm(); setShowConfirm(null); }}
        onCancel={() => setShowConfirm(null)}
      />
    </div>
  );
}
