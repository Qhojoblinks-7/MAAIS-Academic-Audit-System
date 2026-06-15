import React, { useState, useEffect, useMemo } from 'react';
import { 
  RefreshCw, Search, Filter, Calendar, BarChart3, 
  AlertCircle, CheckCircle2, XCircle, ShieldCheck, History, Bookmark, Trash2 
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
   }, []); // Removed refreshAuditLogs to prevent cascading infinite re-render loops

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
    <div className="flex-1 flex flex-col min-h-0 bg-background/50 font-sans antialiased">
      
      {/* 1. View Control Header */}
      <header className="bg-card border-b border-border/80 px-6 py-4 sticky top-0 z-10 backdrop-blur-md bg-card/95">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-foreground tracking-tight">System Accountability Ledger</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Immutable audit pipeline monitoring across structural evaluation matrices.</p>
          </div>
          <Button
            onClick={refreshAuditLogs}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            Synchronize Logs
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6 space-y-6 max-w-6xl w-full mx-auto">
        
        {/* 2. Micro Summary Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total Index', value: stats.total, icon: BarChart3, color: 'text-foreground' },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-success' },
            { label: 'Flagged', value: stats.flagged, icon: XCircle, color: 'text-danger' },
            { label: 'Locked', value: stats.locked, icon: AlertCircle, color: 'text-warning' },
            { label: 'Drafts', value: stats.draft, icon: Calendar, color: 'text-brand-primary' }
          ].map((card, idx) => (
            <Card key={idx} className="p-3.5 flex flex-col justify-between h-[85px]">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <card.icon size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{card.label}</span>
              </div>
              <p className={cn("text-xl font-black tracking-tight", card.color)}>{card.value}</p>
            </Card>
          ))}
        </div>

        {/* 3. Balanced Split Workspace Engine */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Left Layout Column: Navigation Filters Matrix */}
          <div className="space-y-4 md:sticky md:top-24">
            <Card className="p-4 space-y-4">
              <div className="flex items-center gap-1.5 border-b border-border pb-2.5 text-muted-foreground">
                <Filter size={12} />
                <h3 className="text-[10px] font-bold uppercase tracking-wider">Parameters Filtering</h3>
              </div>

              {/* Text Query Input */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Search Context</label>
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search ledger marks..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Entity Context Type Dropdown */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Entity Boundary</label>
                <select
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary text-foreground font-medium"
                >
                  {entityTypes.map(et => (
                    <option key={et.value} value={et.value}>{et.label}</option>
                  ))}
                </select>
              </div>

              {/* Teacher Filter */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Teacher</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary text-foreground font-medium"
                >
                  <option value="all">All Teachers</option>
                  {teachers.filter(t => t !== 'all').map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Action Type Filter */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Action Type</label>
                <select
                  value={selectedActionType}
                  onChange={(e) => setSelectedActionType(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary text-foreground font-medium"
                >
                  <option value="all">All Actions</option>
                  {actionTypes.filter(a => a !== 'all').map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              {/* Dual Range Processing Nodes */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date Threshold bounds</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(r => ({ ...r, start: e.target.value }))}
                    className="text-xs font-medium"
                  />
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(r => ({ ...r, end: e.target.value }))}
                    className="text-xs font-medium"
                  />
                </div>
              </div>
            </Card>

            {/* Presets Management Section */}
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-1.5 border-b border-border pb-2 text-muted-foreground">
                <Bookmark size={12} />
                <h3 className="text-[10px] font-bold uppercase tracking-wider">Saved Filter Presets</h3>
              </div>
              
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={savedFilterName}
                  onChange={(e) => setSavedFilterName(e.target.value)}
                  placeholder="Preset label..."
                  className="flex-1 px-2.5 py-1 text-xs font-medium"
                />
                <Button
                  onClick={saveFilterPreset}
                  disabled={!savedFilterName.trim()}
                  variant="default"
                  size="sm"
                >
                  Save
                </Button>
              </div>

              {savedFilters.length > 0 && (
                <div className="pt-2 max-h-32 overflow-y-auto space-y-1.5 border-t border-muted/50">
                  {savedFilters.map((preset) => (
                    <div key={preset.id} className="flex items-center justify-between bg-muted p-1.5 rounded-lg group">
                      <button
                        onClick={() => loadFilterPreset(preset)}
                        className="text-[11px] font-medium text-foreground hover:text-brand-primary transition-colors text-left truncate flex-1 mr-2"
                      >
                        {preset.name}
                      </button>
                      <Button
                        onClick={() => deleteFilterPreset(preset.id)}
                        variant="ghost"
                        size="icon-xs"
                        title="Delete Preset"
                      >
                        <Trash2 size={11} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Quick Informational Notice */}
            <div className="bg-brand-primary/10 border border-brand-primary/30 rounded-xl p-3 flex items-start gap-2.5">
              <History size={13} className="text-brand-primary shrink-0 mt-0.5" />
              <p className="text-[11px] text-foreground/80 leading-normal font-medium">
                Records meet state structural tracking framework criteria. Alteration points are fully cryptographically timestamped.
              </p>
            </div>
          </div>

          {/* Right Layout Column: Interactive Feed Display Stream */}
          <div className="md:col-span-2 bg-card rounded-xl border border-border shadow-sm p-5 min-h-[400px]">
            <div className="flex items-center gap-1.5 border-b border-border pb-3 mb-4">
              <ShieldCheck size={13} className="text-brand-primary" />
              <h2 className="text-xs font-bold text-foreground tracking-tight">Ledger Timeline Node Output</h2>
              <span className="ml-auto text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
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