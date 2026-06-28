import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  RefreshCw, Search, Filter, Calendar, BarChart3, 
  AlertCircle, CheckCircle2, XCircle, ShieldCheck, History, 
  Bookmark, Trash2, ChevronDown, SlidersHorizontal, X 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { AuditLogTimeline } from '../../components/organisms/AuditLogTimeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export function HODAudit() {
   const {
      auditLogs = [],
      isLoading,
      refreshAuditLogs,
      addHODComment,
   } = useHOD();

   const [search, setSearch] = useState('');
   const [dateRange, setDateRange] = useState({ start: '', end: '' });
   const [selectedEntity, setSelectedEntity] = useState('all');
   const [selectedTeacher, setSelectedTeacher] = useState('all');
   const [selectedActionType, setSelectedActionType] = useState('all');
   const [selectedStatus, setSelectedStatus] = useState('all');
   const [savedFilterName, setSavedFilterName] = useState('');
   const [savedFilters, setSavedFilters] = useState([]);
   const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

   useEffect(() => {
      if (typeof refreshAuditLogs === 'function') {
         refreshAuditLogs();
      }
      const saved = localStorage.getItem('auditFilterPresets');
      if (saved) {
         try { setSavedFilters(JSON.parse(saved)); } catch { /* no-op */ }
      }
   }, []);

   const teachers = useMemo(() => {
      const set = new Set(auditLogs.map(l => l.teacherName).filter(Boolean));
      return ['all', ...Array.from(set)];
   }, [auditLogs]);

   const actionTypes = useMemo(() => {
      const set = new Set(auditLogs.map(l => l.action).filter(Boolean));
      return ['all', ...Array.from(set)];
   }, [auditLogs]);

   const saveFilterPreset = () => {
      if (!savedFilterName.trim()) return;
      const preset = {
         id: Date.now(),
         name: savedFilterName.trim(),
         search,
         dateRange,
         selectedEntity,
         selectedTeacher,
         selectedActionType,
         selectedStatus,
      };
      const updated = [...savedFilters, preset];
      setSavedFilters(updated);
      localStorage.setItem('auditFilterPresets', JSON.stringify(updated));
      setSavedFilterName('');
   };

   const loadFilterPreset = (preset) => {
      setSearch(preset.search || '');
      setDateRange(preset.dateRange || { start: '', end: '' });
      setSelectedEntity(preset.selectedEntity || 'all');
      setSelectedTeacher(preset.selectedTeacher || 'all');
      setSelectedActionType(preset.selectedActionType || 'all');
      setSelectedStatus(preset.selectedStatus || 'all');
   };

   const deleteFilterPreset = (id) => {
      const updated = savedFilters.filter(f => f.id !== id);
      setSavedFilters(updated);
      localStorage.setItem('auditFilterPresets', JSON.stringify(updated));
   };

   const filteredLogs = useMemo(() => {
      let logs = [...auditLogs];
      const query = search.trim().toLowerCase();
      
      if (query) {
         logs = logs.filter(log =>
            String(log.teacherName || '').toLowerCase().includes(query) ||
            String(log.recordId || '').toLowerCase().includes(query) ||
            String(log.justification || '').toLowerCase().includes(query) ||
            String(log.action || '').toLowerCase().includes(query)
         );
      }
      if (dateRange.start) {
         logs = logs.filter(log => (log.timestamp?.split('T')[0] || '') >= dateRange.start);
      }
      if (dateRange.end) {
         logs = logs.filter(log => (log.timestamp?.split('T')[0] || '') <= dateRange.end);
      }
      if (selectedEntity !== 'all') {
         logs = logs.filter(log => log.entityType === selectedEntity);
      }
      if (selectedTeacher !== 'all') {
         logs = logs.filter(log => log.teacherName === selectedTeacher);
      }
      if (selectedActionType !== 'all') {
         logs = logs.filter(log => log.action === selectedActionType);
      }
      if (selectedStatus !== 'all') {
         logs = logs.filter(log => log.status === selectedStatus);
      }
      return logs;
   }, [auditLogs, search, dateRange, selectedEntity, selectedTeacher, selectedActionType, selectedStatus]);

    const stats = useMemo(() => {
      const total = auditLogs.length;
      const resolved = auditLogs.filter(l => l.status === 'RESOLVED').length;
      const flagged = auditLogs.filter(l => l.status === 'FLAGGED').length;
      const locked = auditLogs.filter(l => l.status === 'LOCKED').length;
      const pending = auditLogs.filter(l => l.status === 'PENDING').length;
      const draft = auditLogs.filter(l => l.status === 'DRAFT').length;
      return { total, resolved, flagged, locked, pending, draft };
    }, [auditLogs]);

   const handleAddComment = async (logId, comment) => {
      if (typeof addHODComment === 'function') {
         await addHODComment(logId, comment);
      }
   };

    const entityTypes = [
       { value: 'all', label: 'All Operations' },
       { value: 'grade_revision', label: 'Grade Revisions' },
       { value: 'class_term', label: 'Term Lock/Unlock' },
       { value: 'impersonation', label: 'Impersonation' },
       { value: 'hod_action', label: 'HOD Actions' },
    ];

    const filterPresets = [
       { value: 'all', label: 'All States', count: stats.total, color: 'text-slate-700 bg-slate-100' },
       { value: 'RESOLVED', label: 'Resolved', count: stats.resolved, color: 'text-emerald-700 bg-emerald-50 border-emerald-200/50' },
       { value: 'FLAGGED', label: 'Flagged', count: stats.flagged, color: 'text-rose-700 bg-rose-50 border-rose-200/50' },
       { value: 'LOCKED', label: 'Locked', count: stats.locked, color: 'text-amber-700 bg-amber-50 border-amber-200/50' },
       { value: 'PENDING', label: 'Pending Review', count: stats.pending, color: 'text-indigo-700 bg-indigo-50 border-indigo-100/50' },
       { value: 'DRAFT', label: 'Draft Changes', count: stats.draft, color: 'text-slate-700 bg-slate-50 border-slate-200/50' },
    ];

   return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50/50 font-sans antialiased">
      
      {/* View Control Header */}
      <header className="bg-white border-b border-slate-200/70 px-6 py-4 sticky top-0 z-30 backdrop-blur-md bg-white/95">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5">Security Workspace</div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Accountability Ledger</h1>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              variant="outline"
              size="sm"
              className={cn(
                "text-xs font-bold border-slate-200 gap-2 px-3.5 h-9 rounded-xl transition-all",
                isFilterPanelOpen && "bg-slate-900 text-white border-slate-900 hover:bg-slate-800 hover:text-white"
              )}
            >
              <SlidersHorizontal size={13} />
              <span>{isFilterPanelOpen ? "Close Controls" : "Filter Drawer"}</span>
            </Button>
            <Button
              onClick={refreshAuditLogs}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="text-xs font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 h-9 rounded-xl shadow-xs gap-2 px-3.5"
            >
              <RefreshCw size={13} className={cn("text-slate-500", isLoading && 'animate-spin')} />
              <span>Sync Log Stream</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex gap-6 relative items-start">
        
        {/* Main Workspace Column */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* Micro Summary Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Index', value: stats.total, icon: BarChart3, style: 'border-slate-200 text-slate-900' },
              { label: 'Resolved Ledger', value: stats.resolved, icon: CheckCircle2, style: 'border-slate-200 text-slate-900 indicators-emerald' },
              { label: 'Flagged Exceptions', value: stats.flagged, icon: XCircle, style: 'border-slate-200 text-slate-900 indicators-rose' },
              { label: 'System Locked', value: stats.locked, icon: AlertCircle, style: 'border-slate-200 text-slate-900 indicators-amber' },
              { label: 'Draft Changes', value: stats.draft, icon: Calendar, style: 'border-slate-200 text-slate-900 indicators-indigo' }
            ].map((card, idx) => (
              <Card key={idx} className={cn("p-4 bg-white border shadow-xs flex flex-col justify-between h-24 rounded-2xl relative overflow-hidden group hover:border-slate-300 transition-all duration-200", card.style)}>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <card.icon size={14} className="shrink-0" />
                  <span className="text-[9px] font-bold uppercase tracking-wider truncate">{card.label}</span>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-black tracking-tight tabular-nums">{card.value}</span>
                </div>
                {idx > 0 && (
                  <div className={cn(
                    "absolute bottom-0 left-0 right-0 h-[3px]",
                    idx === 1 && "bg-emerald-500",
                    idx === 2 && "bg-rose-500",
                    idx === 3 && "bg-amber-500",
                    idx === 4 && "bg-indigo-500"
                  )} />
                )}
              </Card>
            ))}
          </div>

          {/* Interactive Ledger Terminal */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 min-h-[550px]">
            
            {/* Header with Search and Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100/40">
                    <ShieldCheck size={15} />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Ledger Timeline Output</h2>
                    <p className="text-xs text-slate-400 font-medium">Dynamic system operational trail logs</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search parameters or users..."
                    className="w-full pl-9 h-8.5 rounded-xl text-xs font-medium bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/10 placeholder:text-slate-400"
                  />
                </div>
                <span className="text-[10px] font-extrabold bg-slate-100 border border-slate-200/50 text-slate-600 px-2.5 h-8.5 flex items-center rounded-xl font-mono shrink-0">
                  {filteredLogs.length} Records
                </span>
              </div>
            </div>

            {/* Segmented Fast Filter Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-4 border-b border-slate-100 scrollbar-none">
              {filterPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setSelectedStatus(preset.value)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-2",
                    selectedStatus === preset.value
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm font-extrabold"
                      : "bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-slate-200/60"
                  )}
                >
                  <span>{preset.label}</span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold border",
                    selectedStatus === preset.value 
                      ? "bg-white/10 border-white/20 text-white" 
                      : preset.color
                  )}>
                    {preset.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Timeline Stream */}
            <div className="overflow-hidden">
              <AuditLogTimeline
                logs={filteredLogs}
                onAddComment={handleAddComment}
                filterPresets={filterPresets}
              />
            </div>
          </div>
        </div>

        {/* Slidable Right Filters Matrix Drawer */}
        <div className={cn(
          "w-80 bg-white border border-slate-200/80 rounded-2xl p-5 space-y-5 shadow-md shrink-0 lg:sticky lg:top-24 transition-all duration-300",
          isFilterPanelOpen ? "block fixed inset-y-4 right-4 z-40 lg:relative lg:inset-auto" : "hidden"
        )}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-800">
              <div className="p-1.5 bg-slate-50 border border-slate-100 text-slate-700 rounded-lg">
                <Filter size={13} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold tracking-tight text-slate-900">Advanced Controls</h3>
                <p className="text-[10px] text-slate-400 font-medium">Refine dynamic stream ledger scopes</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden"
              onClick={() => setIsFilterPanelOpen(false)}
            >
              <X size={14} />
            </Button>
          </div>

          {/* Boundaries Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Entity Boundary</label>
            <div className="relative">
              <select
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="w-full pl-3 pr-8 h-9 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-slate-700 font-semibold appearance-none cursor-pointer hover:bg-slate-100/50 transition-colors"
              >
                {entityTypes.map(et => (
                  <option key={et.value} value={et.value}>{et.label}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Teachers Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Originating Teacher</label>
            <div className="relative">
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full pl-3 pr-8 h-9 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-slate-700 font-semibold appearance-none cursor-pointer hover:bg-slate-100/50 transition-colors"
              >
                <option value="all">All Instigators</option>
                {teachers.filter(t => t !== 'all').map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Action Types Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Action Matrix Type</label>
            <div className="relative">
              <select
                value={selectedActionType}
                onChange={(e) => setSelectedActionType(e.target.value)}
                className="w-full pl-3 pr-8 h-9 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-slate-700 font-semibold appearance-none cursor-pointer hover:bg-slate-100/50 transition-colors"
              >
                <option value="all">All Method Invocations</option>
                {actionTypes.filter(a => a !== 'all').map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Date Bounds Inputs */}
          <div className="space-y-1.5">
            <label className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Date Threshold Blocks</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(r => ({ ...r, start: e.target.value }))}
                className="text-xs h-9 font-medium bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/10 rounded-xl"
              />
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(r => ({ ...r, end: e.target.value }))}
                className="text-xs h-9 font-medium bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/10 rounded-xl"
              />
            </div>
          </div>

          {/* Save Filter Group */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Bookmark size={13} className="text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Save Current Matrix</span>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="text"
                value={savedFilterName}
                onChange={(e) => setSavedFilterName(e.target.value)}
                placeholder="Name macro filter..."
                className="flex-1 px-3 h-8 text-xs font-medium bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/10 rounded-xl placeholder:text-slate-400"
              />
              <Button
                onClick={saveFilterPreset}
                disabled={!savedFilterName.trim()}
                variant="default"
                size="sm"
                className="text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 h-8 rounded-xl shadow-xs shrink-0"
              >
                Save
              </Button>
            </div>

            {savedFilters.length > 0 && (
              <div className="pt-2 max-h-36 overflow-y-auto space-y-1.5 border-t border-slate-100">
                {savedFilters.map((preset) => (
                  <div key={preset.id} className="flex items-center justify-between bg-slate-50/60 hover:bg-slate-50 p-2 rounded-xl border border-slate-200/50 transition-all group">
                    <button
                      onClick={() => loadFilterPreset(preset)}
                      className="text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors text-left truncate flex-1 mr-2"
                    >
                      {preset.name}
                    </button>
                    <Button
                      onClick={() => deleteFilterPreset(preset.id)}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete Preset"
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informational Verification Footer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
            <History size={14} className="text-indigo-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-normal font-medium">
              Ledger pipelines automatically sign state mutation vectors. Alteration trails match cryptographic baseline parameters.
            </p>
          </div>
        </div>
      </main>
    </div>
   );
}