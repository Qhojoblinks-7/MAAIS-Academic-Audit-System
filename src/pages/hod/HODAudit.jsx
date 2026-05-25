import React, { useState, useEffect, useMemo } from 'react';
import { 
  RefreshCw, Search, Filter, Calendar, BarChart3, 
  AlertCircle, CheckCircle2, XCircle, ShieldCheck, History 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { AuditLogTimeline } from '../../components/organisms/AuditLogTimeline';

export function HODAudit() {
  const {
    auditLogs = [],
    auditFilter,
    setAuditFilter,
    getFilteredAuditLogs,
    isLoading,
    refreshAuditLogs,
    addHODComment,
  } = useHOD();

  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedEntity, setSelectedEntity] = useState('all');

  useEffect(() => {
    if (typeof refreshAuditLogs === 'function') {
      refreshAuditLogs();
    }
  }, [refreshAuditLogs]);

  const filteredLogs = useMemo(() => {
    let logs = typeof getFilteredAuditLogs === 'function' ? getFilteredAuditLogs() : auditLogs;
    const query = search.trim().toLowerCase();
    
    if (query) {
      logs = logs.filter(log =>
        String(log.teacherName || '').toLowerCase().includes(query) ||
        String(log.recordId || '').toLowerCase().includes(query) ||
        String(log.justification || '').toLowerCase().includes(query) ||
        String(log.action || '').toLowerCase().includes(query),
      );
    }
    if (dateRange.start && dateRange.end) {
      logs = logs.filter(log => {
        const logDate = log.timestamp?.split('T')[0];
        return logDate >= dateRange.start && logDate <= dateRange.end;
      });
    }
    if (selectedEntity !== 'all') {
      logs = logs.filter(log => log.entityType === selectedEntity);
    }
    return logs;
  }, [getFilteredAuditLogs, auditLogs, search, dateRange, selectedEntity]);

  const stats = useMemo(() => {
    const total = auditLogs.length;
    const resolved = auditLogs.filter(l => l.status === 'RESOLVED').length;
    const flagged = auditLogs.filter(l => l.status === 'FLAGGED').length;
    const locked = auditLogs.filter(l => l.status === 'LOCKED').length;
    const draft = auditLogs.filter(l => l.status === 'DRAFT').length;
    return { total, resolved, flagged, locked, draft };
  }, [auditLogs]);

  const handleAddComment = async (logId, comment) => {
    if (typeof addHODComment === 'function') {
      await addHODComment(logId, comment);
    }
  };

  const entityTypes = [
    { value: 'all', label: 'All Operations' },
    { value: 'student_result', label: 'Student Results' },
    { value: 'grade_revision', label: 'Grade Revisions' },
    { value: 'teacher_submission', label: 'Submissions' },
  ];

  const filterPresets = [
    { value: 'all', label: 'All States' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'FLAGGED', label: 'Flagged' },
    { value: 'LOCKED', label: 'Locked' },
    { value: 'DRAFT', label: 'Draft' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 font-sans antialiased">
      
      {/* 1. View Control Header */}
      <header className="bg-white border-b border-gray-200/80 px-6 py-4 sticky top-0 z-10 backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight">System Accountability Ledger</h1>
            <p className="text-xs text-gray-400 mt-0.5">Immutable audit pipeline monitoring across structural evaluation matrices.</p>
          </div>
          <button
            onClick={refreshAuditLogs}
            disabled={isLoading}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2 shadow-3xs transition-all active:scale-95 disabled:opacity-40 shrink-0 self-start sm:self-center"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            Synchronize Logs
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 space-y-6 max-w-6xl w-full mx-auto">
        
        {/* 2. Micro Summary Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total Index', value: stats.total, icon: BarChart3, color: 'text-gray-950' },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-600' },
            { label: 'Flagged', value: stats.flagged, icon: XCircle, color: 'text-rose-600' },
            { label: 'Locked', value: stats.locked, icon: AlertCircle, color: 'text-amber-600' },
            { label: 'Drafts', value: stats.draft, icon: Calendar, color: 'text-sky-600' }
          ].map((card, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200/70 p-3.5 shadow-3xs flex flex-col justify-between h-[85px]">
              <div className="flex items-center gap-1.5 text-gray-400">
                <card.icon size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{card.label}</span>
              </div>
              <p className={cn("text-xl font-black tracking-tight", card.color)}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* 3. Balanced Split Workspace Engine */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Left Layout Column: Navigation Filters Matrix */}
          <div className="space-y-4 md:sticky md:top-24">
            <div className="bg-white rounded-xl border border-gray-200/70 shadow-3xs p-4 space-y-4">
              <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2.5 text-gray-400">
                <Filter size={12} />
                <h3 className="text-[10px] font-bold uppercase tracking-wider">Parameters Filtering</h3>
              </div>

              {/* Text Query Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Search Context</label>
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search ledger marks..."
                    className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder-gray-400 font-medium text-gray-700"
                  />
                </div>
              </div>

              {/* Entity Context Type Dropdown */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Entity Boundary</label>
                <select
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-gray-700 font-medium"
                >
                  {entityTypes.map(et => (
                    <option key={et.value} value={et.value}>{et.label}</option>
                  ))}
                </select>
              </div>

              {/* Dual Range Processing Nodes */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Date Threshold bounds</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(r => ({ ...r, start: e.target.value }))}
                    className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200/80 rounded-lg text-gray-600 font-medium focus:outline-none"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(r => ({ ...r, end: e.target.value }))}
                    className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200/80 rounded-lg text-gray-600 font-medium focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Quick Informational Notice */}
            <div className="bg-indigo-50/40 border border-indigo-100/50 rounded-xl p-3 flex items-start gap-2.5">
              <History size={13} className="text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-indigo-950/80 leading-normal font-medium">
                Records meet state structural tracking framework criteria. Alteration points are fully cryptographically timestamped.
              </p>
            </div>
          </div>

          {/* Right Layout Column: Interactive Feed Display Stream */}
          <div className="md:col-span-2 bg-white rounded-xl border border-gray-200/70 shadow-3xs p-5 min-h-[400px]">
            <div className="flex items-center gap-1.5 border-b border-gray-100 pb-3 mb-4">
              <ShieldCheck size={13} className="text-indigo-500" />
              <h2 className="text-xs font-bold text-gray-950 tracking-tight">Ledger Timeline Node Output</h2>
              <span className="ml-auto text-[10px] font-bold bg-slate-100 text-gray-500 px-2 py-0.5 rounded-md">
                {filteredLogs.length} Records Passed
              </span>
            </div>

            <AuditLogTimeline
              logs={filteredLogs}
              onAddComment={handleAddComment}
              filterPresets={filterPresets}
            />
          </div>

        </div>

      </main>
    </div>
  );
}