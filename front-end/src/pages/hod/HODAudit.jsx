import React, { useState, useEffect, useMemo } from 'react';
import { 
  RefreshCw, Search, Filter, Calendar, BarChart3, 
  AlertCircle, CheckCircle2, XCircle, ShieldCheck, History, Bookmark, Trash2, ChevronDown 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { AuditLogTimeline } from '../../components/organisms/AuditLogTimeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

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
   const [savedFilterName, setSavedFilterName] = useState('');
   const [savedFilters, setSavedFilters] = useState([]);

   // Safely synchronize logs exactly once on component mount
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
     return logs;
  }, [auditLogs, search, dateRange, selectedEntity, selectedTeacher, selectedActionType]);

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
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/40 font-sans antialiased">
      
      {/* 1. View Control Header */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 sticky top-0 z-10 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">System Accountability Ledger</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Immutable audit pipeline monitoring across structural evaluation matrices.</p>
          </div>
          <Button
            onClick={refreshAuditLogs}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-3xs"
          >
            <RefreshCw size={12} className={cn("text-slate-500", isLoading && 'animate-spin')} />
            Synchronize Logs
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* 2. Micro Summary Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total Index', value: stats.total, icon: BarChart3, color: 'text-slate-900', badge: 'bg-slate-100 text-slate-700' },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            { label: 'Flagged', value: stats.flagged, icon: XCircle, color: 'text-rose-700', badge: 'bg-rose-50 text-rose-700 border-rose-100' },
            { label: 'Locked', value: stats.locked, icon: AlertCircle, color: 'text-amber-700', badge: 'bg-amber-50 text-amber-700 border-amber-100' },
            { label: 'Drafts', value: stats.draft, icon: Calendar, color: 'text-indigo-700', badge: 'bg-indigo-50 text-indigo-700 border-indigo-100' }
          ].map((card, idx) => (
            <Card key={idx} className="p-4 flex flex-col justify-between h-[96px] bg-white border-slate-200/80 shadow-3xs group hover:shadow-2xs transition-all duration-200">
              <div className="flex items-center justify-between gap-1.5 text-slate-500">
                <div className="flex items-center gap-1.5">
                  <card.icon size={13} className="text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{card.label}</span>
                </div>
              </div>
              <p className={cn("text-2xl font-bold tracking-tight mt-1 tabular-nums", card.color)}>{card.value}</p>
            </Card>
          ))}
        </div>

        {/* 3. Balanced Split Workspace Engine */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Left Layout Column: Navigation Filters Matrix */}
          <div className="space-y-5 md:sticky md:top-24">
            <Card className="p-5 space-y-4 bg-white border-slate-200/80 shadow-3xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-slate-800">
                <div className="p-1.5 bg-slate-50 border border-slate-100 text-slate-700 rounded-md">
                  <Filter size={13} />
                </div>
                <div>
                  <h3 className="text-xs font-bold tracking-tight text-slate-900">Parameters Filtering</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Refine ledger scope indices</p>
                </div>
              </div>

              {/* Text Query Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Search Context</label>
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search ledger marks..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-medium bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Entity Context Type Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Entity Boundary</label>
                <div className="relative">
                  <select
                    value={selectedEntity}
                    onChange={(e) => setSelectedEntity(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-semibold appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    {entityTypes.map(et => (
                      <option key={et.value} value={et.value}>{et.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Teacher Filter */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Teacher</label>
                <div className="relative">
                  <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-semibold appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <option value="all">All Teachers</option>
                    {teachers.filter(t => t !== 'all').map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Action Type Filter */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Action Type</label>
                <div className="relative">
                  <select
                    value={selectedActionType}
                    onChange={(e) => setSelectedActionType(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 text-xs bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-semibold appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <option value="all">All Actions</option>
                    {actionTypes.filter(a => a !== 'all').map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Dual Range Processing Nodes */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Date Threshold bounds</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(r => ({ ...r, start: e.target.value }))}
                    className="text-xs font-medium bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500/20"
                  />
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(r => ({ ...r, end: e.target.value }))}
                    className="text-xs font-medium bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500/20"
                  />
                </div>
              </div>
            </Card>

            {/* Presets Management Section */}
            <Card className="p-5 space-y-3 bg-white border-slate-200/80 shadow-3xs">
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5 text-slate-800">
                <Bookmark size={13} className="text-slate-400" />
                <h3 className="text-xs font-bold tracking-tight text-slate-900">Saved Filter Presets</h3>
              </div>
              
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={savedFilterName}
                  onChange={(e) => setSavedFilterName(e.target.value)}
                  placeholder="Preset label..."
                  className="flex-1 px-3 py-1.5 text-xs font-medium bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500/20"
                />
                <Button
                  onClick={saveFilterPreset}
                  disabled={!savedFilterName.trim()}
                  variant="default"
                  size="sm"
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 shadow-3xs"
                >
                  Save
                </Button>
              </div>

              {savedFilters.length > 0 && (
                <div className="pt-2 max-h-36 overflow-y-auto space-y-1.5 border-t border-slate-100">
                  {savedFilters.map((preset) => (
                    <div key={preset.id} className="flex items-center justify-between bg-slate-50 hover:bg-slate-100/60 p-2 rounded-lg border border-slate-100 transition-all group">
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
                        className="h-6 w-6 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Preset"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Informational Notice */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <History size={15} className="text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Records meet state structural tracking framework criteria. Alteration points are fully cryptographically timestamped.
              </p>
            </div>
          </div>

          {/* Right Layout Column: Interactive Feed Display Stream */}
          <div className="md:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-3xs p-6 min-h-[450px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
                  <ShieldCheck size={14} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">Ledger Timeline Outputs</h2>
                  <p className="text-xs text-slate-400 font-medium">Real-time dynamic entry audit stream</p>
                </div>
              </div>
              <span className="text-[11px] font-bold bg-slate-50 border border-slate-100 text-slate-600 px-2.5 py-1 rounded-md tabular-nums">
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