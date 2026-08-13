import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, CheckCircle2, Search, Plus, PenLine, Trash2, X,
  Filter, ChevronLeft, ArrowRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { teacherService } from '../../services';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';

const OBS_TYPES = ['Behavioral', 'Academic', 'Lab Safety', 'Collaboration', 'Punctuality'];
const OBS_COLORS = ['#1D4D4F', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7'];

function normalizeObservation(obs) {
  const rawDate = obs.updatedAt || obs.createdAt || obs.date;
  const parsedDate = rawDate ? new Date(rawDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

  return {
    id: obs.id,
    studentId: obs.studentId,
    student: obs.student || 'Unknown',
    index: obs.index || '',
    class: obs.class || 'Unknown Class',
    teacher: obs.teacher || 'Unknown',
    hod: obs.hod || 'Unknown',
    type: obs.type || 'Unknown Subject',
    status: obs.status || 'Missing',
    comment: obs.comment || '',
    date: Number.isNaN(new Date(parsedDate).getTime()) ? new Date().toISOString().slice(0, 10) : parsedDate,
  };
}

function ConfirmModal({ isOpen, onConfirm, onCancel, title, message }) {
  return (
    <React.Fragment>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={onCancel} />
          <div className="relative w-full max-w-sm z-10 animate-in fade-in zoom-in-95">
            <div className="bg-surface rounded-3xl shadow-2xl overflow-hidden border border-border">
              <div className="p-6 space-y-4">
                <div className="w-12 h-12 bg-danger/10 rounded-2xl flex items-center justify-center text-danger">
                  <Trash2 size={22} />
                </div>
                <h3 className="text-base font-black text-primary">{title}</h3>
                <p className="text-xs font-medium text-secondary leading-relaxed">{message}</p>
              </div>
              <div className="px-6 py-4 border-t border-border flex gap-3 bg-muted/50">
                <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
                <Button onClick={onConfirm} className="flex-1 bg-danger hover:bg-danger/90 text-white">Delete</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

function CreateObsModal({ isOpen, onClose, onSave, editingObs, disabled = false }) {
  const [type, setType] = useState('Behavioral');
  const [student, setStudent] = useState('');
  const [className, setClassName] = useState('');
  const [index, setIndex] = useState('');
  const [comment, setComment] = useState('');

  const formFields = [
    { label: 'Subject Name', placeholder: 'e.g. Agricultural Science', value: type, onChange: setType },
    { label: 'Student Name', placeholder: 'e.g. Angela Owusu', value: student, onChange: setStudent },
    { label: 'Class', placeholder: 'e.g. SHS 1 Agric B', value: className, onChange: setClassName },
    { label: 'Student Index No.', placeholder: 'e.g. 001', value: index, onChange: setIndex },
  ];

  useEffect(() => {
    if (isOpen) {
      setType(editingObs?.type || 'Behavioral');
      setStudent(editingObs?.student || '');
      setClassName(editingObs?.class || '');
      setIndex(editingObs?.index || '');
      setComment(editingObs?.comment || '');
    }
  }, [isOpen, editingObs]);

  const canSave = student.trim() && comment.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 border border-border">
        <div className="px-4 py-3 border-b border-border flex justify-between items-center">
          <h3 className="text-sm font-black text-primary">{editingObs ? 'Edit Observation' : 'New Observation'}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X size={16} /></Button>
        </div>
        <div className="p-4 space-y-3">
          {formFields.map((field) => (
            <div key={field.label}>
              <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5">{field.label}</label>
              <Input
                type="text"
                placeholder={field.placeholder}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-medium focus:ring-1 focus:ring-brand-primary/10"
              />
            </div>
          ))}
          <div>
            <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-1.5">Comment</label>
            <Textarea
              placeholder="Describe the observation in detail…"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-medium resize-none focus:ring-1 focus:ring-brand-primary/10"
            />
          </div>
        </div>
        <div className="px-4 py-3 border-t border-border flex justify-end gap-2 bg-muted/50">
          <Button variant="outline" onClick={onClose} className="text-xs">Cancel</Button>
          <Button
            onClick={() => canSave && onSave({ ...editingObs, type, student, index, class: className, comment, date: editingObs?.date || new Date().toISOString().slice(0, 10), status: editingObs?.status || 'Active' })}
            className={cn("text-xs font-black uppercase tracking-widest gap-1.5", canSave ? 'bg-brand-primary hover:bg-brand-primary/90 text-white' : 'bg-muted text-muted-foreground cursor-not-allowed')}
            disabled={disabled || !canSave}
          >
            <PenLine size={12} /> {editingObs ? 'Save' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MobileMissingObservations() {
  const { user } = useRole();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('missing');
  const [searchQuery, setSearchQuery] = useState('');
  const [obsTypeFilter, setObsTypeFilter] = useState('All');
  const [missingObservations, setMissingObservations] = useState([]);
  const [loggedObservations, setLoggedObservations] = useState([]);
  const [missingTotal, setMissingTotal] = useState(0);
  const [logsTotal, setLogsTotal] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [editingObs, setEditingObs] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchObservations = useCallback(async () => {
    setError('');
    setIsLoading(true);

    try {
      const fetchEndpoint = async (label, getter) => {
        try {
          const result = await getter ? getter() : [];
          if (result && typeof result === 'object' && !Array.isArray(result) && 'data' in result) {
            return result;
          }
          return Array.isArray(result) ? { data: result, total: result.length, page: 1, limit: 50, pages: 1 } : { data: [], total: 0, page: 1, limit: 50, pages: 0 };
        } catch (err) {
          return { error: `${label}: ${err?.message || 'Request failed'}` };
        }
      };

      const [missingResult, logsResult] = await Promise.all([
        fetchEndpoint('Missing observations', () => teacherService.getMissingObservations(1, 50)),
        fetchEndpoint('Observation logs', () => teacherService.getObservationLogs(1, 50)),
      ]);

      const partialErrors = [missingResult, logsResult].filter((result) => result?.error);
      if (partialErrors.length > 0) {
        setError(partialErrors.map((result) => result.error).join('; '));
      }

      const missing = Array.isArray(missingResult?.data) ? missingResult.data.map(normalizeObservation).filter((obs) => obs.id) : [];
      const logs = Array.isArray(logsResult?.data) ? logsResult.data.map(normalizeObservation).filter((obs) => obs.id) : [];

      setMissingObservations(missing);
      setLoggedObservations(logs);
      setMissingTotal(missingResult?.total || missing.length);
      setLogsTotal(logsResult?.total || 0);
    } catch (err) {
      setMissingObservations([]);
      setLoggedObservations([]);
      setError(err?.message || 'Failed to sync observations from MAAIS backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchObservations();
  }, [fetchObservations]);

  const sourceObservations = activeTab === 'missing'
    ? missingObservations
    : activeTab === 'logged'
      ? loggedObservations
      : [...missingObservations, ...loggedObservations];

  const filteredObservations = useMemo(() => {
    return sourceObservations.filter((obs) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || [
        obs.student,
        obs.class,
        obs.index,
        obs.teacher,
        obs.type,
      ].some((value) => String(value || '').toLowerCase().includes(query));

      const matchesType = obsTypeFilter === 'All' || obs.type === obsTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [sourceObservations, searchQuery, obsTypeFilter]);

  const missingCount = missingObservations.length;
  const loggedCount = loggedObservations.length;
  const totalCount = missingCount + loggedCount;

  const handleSave = async (newObs) => {
    if (isSaving) return;
    setIsSaving(true);
    setError('');
    try {
      const payload = {
        student: newObs.student,
        class: newObs.class,
        index: newObs.index,
        type: newObs.type,
        comment: newObs.comment,
        date: newObs.date,
        status: newObs.status,
      };
      if (editingObs) {
        await teacherService.updateObservation(editingObs.id, payload);
      } else {
        await teacherService.createObservation(payload);
      }
      setEditingObs(null);
      setShowCreate(false);
      await fetchObservations();
    } catch (err) {
      setError(err?.message || 'Failed to save observation to MAAIS backend');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || isSaving) return;
    setIsSaving(true);
    setError('');
    try {
      await teacherService.deleteObservation(deleteTarget.id);
      setDeleteTarget(null);
      setShowConfirm(false);
      await fetchObservations();
    } catch (err) {
      setError(err?.message || 'Failed to delete observation from MAAIS backend');
    } finally {
      setIsSaving(false);
    }
  };

  const obsTypeColor = (type) => {
    const i = OBS_TYPES.indexOf(type);
    return OBS_COLORS[i] || '#1D4D4F';
  };

  const tabs = [
    { id: 'missing', label: 'Outstanding' },
    { id: 'logged', label: 'Logged' },
    { id: 'all', label: 'All Audits' },
  ];

  if (error && !isLoading && missingObservations.length === 0 && loggedObservations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-6 text-center">
        <div>
          <p className="text-sm font-bold text-primary">{error}</p>
          <button onClick={fetchObservations} className="mt-4 px-4 py-2 bg-brand-primary text-surface rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-transform">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0 overflow-x-hidden no-scrollbar">
      {/* Header */}
      <header className="bg-surface border-b border-border px-3 py-2.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button onClick={() => navigate(-1)} className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0 active:scale-95 transition-transform">
              <ChevronLeft size={16} className="text-primary" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-black text-primary truncate leading-tight">Observation Hub</h1>
              <p className="text-[9px] font-bold text-secondary uppercase tracking-widest truncate">Compliance & Audit</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            disabled={isSaving}
            className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shrink-0 active:scale-95 transition-transform disabled:opacity-50"
          >
            <Plus size={16} className="text-surface" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide min-w-0 pb-24">
        {/* Tab Dropdown */}
        <div className="px-3 py-3">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="appearance-none w-full bg-surface border border-border rounded-xl px-3 py-2.5 pr-8 text-xs font-black uppercase tracking-wider text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-sm"
          >
            {tabs.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* KPI Cards */}
        <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory px-3 scrollbar-hide">
          <div className="snap-start shrink-0 w-36 bg-surface p-3 rounded-2xl border border-border/60 shadow-sm">
            <p className="text-[9px] font-bold text-danger uppercase tracking-wider mb-1">Missing</p>
            <p className="text-xl font-black text-primary">{missingCount}</p>
          </div>
          <div className="snap-start shrink-0 w-36 bg-surface p-3 rounded-2xl border border-border/60 shadow-sm">
            <p className="text-[9px] font-bold text-success uppercase tracking-wider mb-1">Logged</p>
            <p className="text-xl font-black text-primary">{loggedCount}</p>
          </div>
          <div className="snap-start shrink-0 w-36 bg-surface p-3 rounded-2xl border border-border/60 shadow-sm">
            <p className="text-[9px] font-bold text-secondary uppercase tracking-wider mb-1">Total</p>
            <p className="text-xl font-black text-primary">{totalCount}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative px-3 mt-3">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary" size={14} />
          <input
            type="text"
            placeholder="Search student, class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 bg-surface border border-border rounded-xl text-xs font-medium text-primary placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-secondary">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter */}
        <div className="px-3 mt-3">
          <select
            value={obsTypeFilter}
            onChange={(e) => setObsTypeFilter(e.target.value)}
            className="appearance-none w-full bg-surface border border-border rounded-xl px-3 py-2.5 pr-8 text-xs font-bold text-primary focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-sm"
          >
            {['All', ...OBS_TYPES].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="px-3 mt-3">
            <div className="bg-danger/10 border border-danger/20 rounded-xl p-3 text-xs font-medium text-danger">
              {error}
            </div>
          </div>
        )}

        {/* Observations List */}
        <div className="px-3 mt-3 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs font-bold text-secondary">Syncing observations…</p>
              </div>
            </div>
          ) : filteredObservations.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-2xl border border-border border-dashed">
              <p className="text-xs font-bold text-secondary">No observations match your query.</p>
            </div>
          ) : (
            filteredObservations.map((obs, i) => {
              const isMissing = obs.status === 'Missing';
              const tc = obsTypeColor(obs.type);
              return (
                <motion.div
                  key={obs.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-surface rounded-2xl border border-border shadow-sm p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        isMissing ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                      )}>
                        {isMissing ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-primary truncate">{obs.student}</p>
                        <p className="text-[10px] font-bold text-secondary truncate">{obs.class} • {obs.index}</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0",
                      isMissing ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                    )}>
                      {obs.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-white" style={{ backgroundColor: tc }}>
                      {obs.type}
                    </span>
                    <span className="text-[10px] font-bold text-secondary">{obs.date}</span>
                  </div>
                  {obs.comment && (
                    <p className="text-[11px] font-medium text-secondary leading-relaxed italic line-clamp-2">"{obs.comment}"</p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-[10px] font-bold text-secondary">{obs.teacher}</span>
                    <div className="flex items-center gap-1.5">
                      {isMissing ? (
                        <button
                          onClick={() => navigate(`/grading?missing=${encodeURIComponent(obs.id)}&studentId=${encodeURIComponent(obs.studentId)}&studentName=${encodeURIComponent(obs.student)}&index=${encodeURIComponent(obs.index)}&subject=${encodeURIComponent(obs.type)}&class=${encodeURIComponent(obs.class)}`)}
                          className="p-1.5 bg-success/10 rounded-lg text-success active:scale-95 transition-transform"
                        >
                          <ArrowRight size={14} />
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingObs({ ...obs })}
                            disabled={isSaving}
                            className="p-1.5 bg-muted rounded-lg text-secondary active:scale-95 transition-transform disabled:opacity-50"
                          >
                            <PenLine size={12} />
                          </button>
                          <button
                            onClick={() => { setDeleteTarget(obs); setShowConfirm(true); }}
                            disabled={isSaving}
                            className="p-1.5 bg-muted rounded-lg text-danger active:scale-95 transition-transform disabled:opacity-50"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <CreateObsModal
        isOpen={showCreate || !!editingObs}
        onClose={() => { setShowCreate(false); setEditingObs(null); }}
        onSave={handleSave}
        editingObs={editingObs}
        disabled={isSaving}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteTarget(null); setShowConfirm(false); }}
        title="Delete Observation?"
        message={`This will permanently remove the record for "${deleteTarget?.student}" — "${deleteTarget?.type}". This action cannot be undone.`}
      />
    </div>
  );
}
