import React, { useState, useEffect, useMemo } from 'react';
import { 
   RefreshCw, Search, Filter, ShieldCheck, History, 
   Bookmark, Trash2, ChevronDown, X 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { AuditLogTimeline } from '../../components/organisms/AuditLogTimeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ENTITY_TYPES = [
   { value: 'all', label: 'All Operations' },
   { value: 'grade_revision', label: 'Grade Revisions' },
   { value: 'class_term', label: 'Term Lock/Unlock' },
   { value: 'impersonation', label: 'Impersonation' },
   { value: 'hod_action', label: 'HOD Actions' },
];

const STATUS_PRESETS = [
   { value: 'all', label: 'All States' },
   { value: 'RESOLVED', label: 'Resolved' },
   { value: 'FLAGGED', label: 'Flagged' },
   { value: 'LOCKED', label: 'Locked' },
   { value: 'PENDING', label: 'Pending Review' },
   { value: 'DRAFT', label: 'Draft Changes' },
];

const useAuditFilters = (auditLogs) => {
   const [filters, setFilters] = useState({
      search: '',
      dateRange: { start: '', end: '' },
      entity: 'all',
      teacher: 'all',
      action: 'all',
      status: 'all',
   });
   const [savedFilters, setSavedFilters] = useState([]);
   const [savedFilterName, setSavedFilterName] = useState('');

   useEffect(() => {
      const saved = localStorage.getItem('auditFilterPresets');
      if (saved) setSavedFilters(JSON.parse(saved));
   }, []);

   const teachers = useMemo(() => {
      const set = new Set(auditLogs.map(l => l.teacherName).filter(Boolean));
      return ['all', ...Array.from(set)];
   }, [auditLogs]);

   const actions = useMemo(() => {
      const set = new Set(auditLogs.map(l => l.action).filter(Boolean));
      return ['all', ...Array.from(set)];
   }, [auditLogs]);

   const filteredLogs = useMemo(() => {
      let logs = [...auditLogs];
      const q = filters.search.trim().toLowerCase();

      if (q) {
         logs = logs.filter(log =>
            String(log.teacherName || '').toLowerCase().includes(q) ||
            String(log.recordId || '').toLowerCase().includes(q) ||
            String(log.justification || '').toLowerCase().includes(q) ||
            String(log.action || '').toLowerCase().includes(q)
         );
      }
      if (filters.dateRange.start) {
         logs = logs.filter(log => (log.timestamp?.split('T')[0] || '') >= filters.dateRange.start);
      }
      if (filters.dateRange.end) {
         logs = logs.filter(log => (log.timestamp?.split('T')[0] || '') <= filters.dateRange.end);
      }
      if (filters.entity !== 'all') logs = logs.filter(log => log.entityType === filters.entity);
      if (filters.teacher !== 'all') logs = logs.filter(log => log.teacherName === filters.teacher);
      if (filters.action !== 'all') logs = logs.filter(log => log.action === filters.action);
      if (filters.status !== 'all') logs = logs.filter(log => log.status === filters.status);

      return logs;
   }, [auditLogs, filters]);

   const savePreset = () => {
      if (!savedFilterName.trim()) return;
      const preset = { id: Date.now(), name: savedFilterName.trim(), ...filters };
      const updated = [...savedFilters, preset];
      setSavedFilters(updated);
      localStorage.setItem('auditFilterPresets', JSON.stringify(updated));
      setSavedFilterName('');
   };

   const loadPreset = (preset) => setFilters(prev => ({ ...prev, ...preset }));
   const deletePreset = (id) => {
      const updated = savedFilters.filter(f => f.id !== id);
      setSavedFilters(updated);
      localStorage.setItem('auditFilterPresets', JSON.stringify(updated));
   };

   const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

   return {
      filters, updateFilter, savedFilterName, setSavedFilterName,
      savedFilters, teachers, actions, filteredLogs,
      savePreset, loadPreset, deletePreset,
   };
};

const FilterSelect = ({ label, value, onChange, options, allLabel }) => (
   <div className="hod-field">
      <label className="hod-field-label">{label}</label>
      <div className="hod-select-wrap">
         <select value={value} onChange={e => onChange(e.target.value)} className="hod-select">
            <option value="all">{allLabel}</option>
            {options.filter(o => o !== 'all').map(o => (
               <option key={o} value={o}>{o}</option>
            ))}
         </select>
         <ChevronDown size={13} className="hod-chevron" />
      </div>
   </div>
);

export function HODAudit() {
   const { auditLogs = [], isLoading, refreshAuditLogs, addHODComment } = useHOD();
   const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

   useEffect(() => {
      refreshAuditLogs?.();
   }, []);

   const {
      filters, updateFilter, savedFilterName, setSavedFilterName,
      savedFilters, teachers, actions, filteredLogs,
      savePreset, loadPreset, deletePreset,
   } = useAuditFilters(auditLogs);

   const handleAddComment = async (logId, comment) => {
      addHODComment?.(logId, comment);
   };

   return (
      <div className="hod-audit-page">
         <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex gap-6 relative items-start">
            <div className="flex-1 space-y-6 min-w-0">
               <div className="hod-panel">
                  <div className="hod-panel-header">
                     <div className="hod-title-group">
                        <div className="hod-icon-box--sm">
                           <ShieldCheck size={15} />
                        </div>
                        <div>
                           <h2 className="hod-title">Ledger Timeline Output</h2>
                           <p className="hod-subtitle">Dynamic system operational trail logs</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="relative w-full sm:w-64">
                           <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
                           <Input
                              type="text"
                              value={filters.search}
                              onChange={e => updateFilter('search', e.target.value)}
                              placeholder="Search parameters or users..."
                              className="w-full pl-9 h-9 text-xs font-medium bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/10 placeholder:text-slate-400"
                           />
                        </div>
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
                        <span className="text-xs font-extrabold bg-slate-100 border border-slate-200/50 text-slate-600 px-3 h-9 flex items-center rounded-xl font-mono">
                           {filteredLogs.length} Records
                        </span>
                     </div>
                  </div>

                  <div className="overflow-hidden">
                     <AuditLogTimeline
                        logs={filteredLogs}
                        onAddComment={handleAddComment}
                     />
                  </div>
               </div>
            </div>

            <div className={cn(
               "hod-panel shrink-0 lg:sticky lg:top-0 transition-all duration-300",
               isFilterPanelOpen ? "fixed inset-y-4 right-4 z-40 w-80" : "hidden lg:block lg:w-80"
            )}>
               <div className="hod-filter-drawer-header">
                  <div className="flex items-center gap-2 text-slate-800">
                     <div className="hod-icon-box">
                        <Filter size={13} />
                     </div>
                     <div>
                        <h3 className="hod-filter-drawer-title">Advanced Controls</h3>
                        <p className="hod-filter-drawer-subtitle">Refine dynamic stream ledger scopes</p>
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

               <FilterSelect
                  label="Entity Boundary"
                  value={filters.entity}
                  onChange={v => updateFilter('entity', v)}
                  options={ENTITY_TYPES.map(e => e.value)}
                  allLabel="All Operations"
               />

               <FilterSelect
                  label="Originating Teacher"
                  value={filters.teacher}
                  onChange={v => updateFilter('teacher', v)}
                  options={teachers}
                  allLabel="All Instigators"
               />

               <FilterSelect
                  label="Action Matrix Type"
                  value={filters.action}
                  onChange={v => updateFilter('action', v)}
                  options={actions}
                  allLabel="All Method Invocations"
               />

               <div className="hod-field">
                  <label className="hod-field-label">Date Threshold Blocks</label>
                  <div className="hod-grid-4">
                     <Input
                        type="date"
                        value={filters.dateRange.start}
                        onChange={e => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                        className="hod-date-input"
                     />
                     <Input
                        type="date"
                        value={filters.dateRange.end}
                        onChange={e => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                        className="hod-date-input"
                     />
                  </div>
               </div>

               <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-1.5 text-slate-700">
                     <Bookmark size={13} className="text-slate-400" />
                     <span className="text-xs font-bold uppercase tracking-wider">Save Current Matrix</span>
                  </div>
                  <div className="flex gap-2">
                     <Input
                        type="text"
                        value={savedFilterName}
                        onChange={e => setSavedFilterName(e.target.value)}
                        placeholder="Name macro filter..."
                        className="flex-1 px-3 h-9 text-xs font-medium bg-slate-50 border-slate-200 focus-visible:ring-indigo-500/10 rounded-xl placeholder:text-slate-400"
                     />
                     <Button
                        onClick={savePreset}
                        disabled={!savedFilterName.trim()}
                        variant="default"
                        size="sm"
                        className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 h-9 rounded-xl shadow-xs"
                     >
                        Save
                     </Button>
                  </div>

                  {savedFilters.length > 0 && (
                     <div className="pt-2 max-h-36 overflow-y-auto space-y-1.5 border-t border-slate-100">
                        {savedFilters.map(preset => (
                           <div key={preset.id} className="flex items-center justify-between bg-slate-50/60 hover:bg-slate-50 p-2 rounded-xl border border-slate-200/50 transition-all group">
                              <button
                                 onClick={() => loadPreset(preset)}
                                 className="text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors text-left truncate flex-1 mr-2"
                              >
                                 {preset.name}
                              </button>
                              <Button
                                 onClick={() => deletePreset(preset.id)}
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

               <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
                  <History size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 leading-normal font-medium">
                     Ledger pipelines automatically sign state mutation vectors. Alteration trails match cryptographic baseline parameters.
                  </p>
               </div>
            </div>
         </main>
      </div>
   );
}
