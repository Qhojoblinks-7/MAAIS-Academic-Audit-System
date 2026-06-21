import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, AlertTriangle, CheckCircle2, Search,
  Clock, Calendar, Sparkles, SlidersHorizontal, Inbox,
  Plus, PenLine, Trash2, X, Filter
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { teacherService } from '../../services';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';

const OBS_TYPES = ['Behavioral', 'Academic', 'Lab Safety', 'Collaboration', 'Punctuality'];
const OBS_COLORS = ['#1D4D4F', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7'];

function ConfirmModal({ isOpen, onConfirm, onCancel, title, message }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-destructive/60 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-sm z-10"
          >
            <Card className="relative p-8 shadow-2xl">
              <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-5">
                <Trash2 size={22} />
              </div>
              <h3 className="text-lg font-black text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{message}</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
                <Button onClick={onConfirm} className="flex-1 bg-destructive hover:bg-destructive/90 text-white">Delete</Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function CreateObsModal({ isOpen, onClose, onSave, editingObs, disabled = false }) {
  const [type, setType] = useState('Behavioral');
  const [student, setStudent] = useState('');
  const [className, setClassName] = useState('');
  const [index, setIndex] = useState('');
  const [comment, setComment] = useState('');

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-muted/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.97, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 15 }}
            className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            <div className="px-8 py-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-black text-foreground">{editingObs ? 'Edit Observation' : 'New Observation'}</h3>
              <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
            </div>
            <div className="p-8 space-y-5">
              {[
                { label: 'Observation Type', type: 'select', options: OBS_TYPES, value: type, onChange: setType },
                { label: 'Student Name', type: 'text', placeholder: 'e.g. Angela Owusu', value: student, onChange: setStudent },
                { label: 'Class', type: 'text', placeholder: 'e.g. SHS 1 Agric B', value: className, onChange: setClassName },
                { label: 'Student Index No.', type: 'text', placeholder: 'e.g. 001', value: index, onChange: setIndex },
              ].map(field => (
                <div key={field.label}>
                  <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">{field.label}</label>
                  {field.type === 'select' ? (
                    <select value={field.value} onChange={(e) => field.onChange(e.target.value)}
                      className="w-full px-5 py-3.5 bg-muted border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/10">
                      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <Input type="text" placeholder={field.placeholder} value={field.value} onChange={(e) => field.onChange(e.target.value)}
                      className="w-full px-5 py-3.5 font-medium focus:ring-2 focus:ring-brand-primary/10" />
                  )}
                </div>
              ))}
              <div>
                <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">Comment</label>
                <Textarea
                  placeholder="Describe the observation in detail…"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-5 py-3.5 font-medium resize-none focus:ring-2 focus:ring-brand-primary/10"
                />
              </div>
            </div>
            <div className="px-8 py-5 border-t border-border flex justify-end gap-3 bg-muted/50">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                onClick={() => canSave && onSave({ ...editingObs, type, student, index, class: className, comment, date: editingObs?.date || new Date().toISOString().slice(0, 10), status: editingObs?.status || 'Active' })}
                className={cn("font-black uppercase tracking-widest shadow-lg gap-2",
                  canSave ? 'bg-brand-primary hover:bg-brand-primary/90 text-white' : 'bg-muted text-muted-foreground cursor-not-allowed')}
                disabled={disabled || !canSave}
              >
                <PenLine size={14} /> {editingObs ? 'Save Changes' : 'Save Observation'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function TeacherMissingObservations() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('missing');
  const [searchQuery, setSearchQuery] = useState('');
  const [obsTypeFilter, setObsTypeFilter] = useState('All');
  const [observations, setObservations] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingObs, setEditingObs] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const urlStudent = searchParams.get('student');
    const urlIndex = searchParams.get('index');
    const urlTab = searchParams.get('tab');

    if (urlTab) setActiveTab(urlTab);
    else if (urlStudent || urlIndex) setActiveTab('missing');

    if (urlStudent) setSearchQuery(urlStudent);
    else if (urlIndex) setSearchQuery(urlIndex);
  }, [searchParams]);

  const normalizeObservation = (obs) => {
    const rawDate = obs.updatedAt || obs.createdAt || obs.submittedAt || obs.date;
    const parsedDate = rawDate ? new Date(rawDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

    return {
      id: obs.id || obs.gradeEntryId || `${obs.student || ''}-${obs.index || ''}-${obs.class || ''}-${obs.type || ''}`,
      student: obs.student || obs.studentName || 'Unknown',
      index: obs.index || obs.indexNumber || obs.studentIndex || '',
      class: obs.class || obs.className || 'Unknown Class',
      teacher: obs.teacher || obs.teacherName || 'Unknown',
      type: obs.type || obs.subject || obs.subjectName || 'Unknown Subject',
      status: obs.status || (obs.hasObservation ? 'Logged' : 'Missing'),
      comment: obs.comment || obs.observationText || obs.remark || '',
      date: Number.isNaN(new Date(parsedDate).getTime()) ? new Date().toISOString().slice(0, 10) : parsedDate,
    };
  };

  const toObservationArray = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.observations)) return response.observations;
    return [];
  };

  const buildObservationPayload = (obs) => ({
    ...obs,
    className: obs.class,
    studentIndex: obs.index,
    subjectName: obs.type,
    observationText: obs.comment,
  });

  const fetchObservations = async () => {
    setError('');
    setIsLoading(true);

    try {
      const fetchEndpoint = async (label, getter) => {
        try {
          return getter ? toObservationArray(await getter()) : [];
        } catch (err) {
          return { error: `${label}: ${err?.message || 'Request failed'}` };
        }
      };

      const [missingResult, logsResult] = await Promise.all([
        fetchEndpoint('Missing observations', teacherService.getMissingObservations),
        fetchEndpoint('Observation logs', teacherService.getObservationLogs),
      ]);

      const partialErrors = [missingResult, logsResult].filter((result) => result?.error);
      if (partialErrors.length > 0) {
        setError(partialErrors.map((result) => result.error).join('; '));
      }

      const missing = Array.isArray(missingResult) ? missingResult : [];
      const logs = Array.isArray(logsResult) ? logsResult : [];
      const merged = new Map();

      [...missing, ...logs]
        .map(normalizeObservation)
        .filter((obs) => obs.id)
        .forEach((obs) => merged.set(obs.id, obs));

      setObservations([...merged.values()].sort((a, b) => {
        if (a.status !== b.status) return a.status === 'Missing' ? -1 : 1;
        return new Date(b.date) - new Date(a.date);
      }));
    } catch (err) {
      setObservations([]);
      setError(err?.message || 'Failed to sync observations from MAAIS backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchObservations();
  }, []);

  const filteredObservations = useMemo(() => {
    return observations.filter((obs) => {
      const matchesTab =
        activeTab === 'all' ? true :
        activeTab === 'missing' ? obs.status === 'Missing' :
        obs.status === 'Logged';

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || [
        obs.student,
        obs.class,
        obs.index,
        obs.teacher,
        obs.type,
      ].some((value) => String(value || '').toLowerCase().includes(query));

      const matchesType = obsTypeFilter === 'All' || obs.type === obsTypeFilter;

      return matchesTab && matchesSearch && matchesType;
    });
  }, [activeTab, searchQuery, obsTypeFilter, observations]);

  const missingCount = useMemo(() =>
    observations.filter((o) => o.status === 'Missing').length,
    [observations]
  );

  const handleSave = async (newObs) => {
    if (isSaving) return;
    setIsSaving(true);
    setError('');
    try {
      if (editingObs) {
        await teacherService.updateObservation(editingObs.id, buildObservationPayload(newObs));
      } else {
        await teacherService.createObservation(buildObservationPayload(newObs));
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
    return OBS_COLORS[i] || 'hsl(222 47% 11%)';
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full h-full bg-background font-sans antialiased overflow-hidden">
      <header className="p-6 lg:p-8 bg-surface border-b border-border shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-warning rounded-xl flex items-center justify-center shadow-md shadow-brand-dark/10 shrink-0">
              <AlertTriangle size={20} className="text-surface" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary tracking-tight">Teacher Observation Hub</h1>
              <p className="text-xs font-medium text-text-secondary mt-0.5">Audit data sheets and enforce term entry verification guidelines</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start md:self-center">
            <div className="flex items-center gap-1.5 bg-warning/10 text-warning border border-warning/20 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <Sparkles size={13} className="text-warning animate-pulse" />
              <span>{missingCount} Entries Outstanding</span>
            </div>
            <Button
              onClick={() => setShowCreate(true)}
              disabled={isSaving}
              className="rounded-xl bg-brand-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-brand-primary/20 transition hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={15} /> New Observation
            </Button>
          </div>
        </div>
      </header>

      <section className="px-6 lg:px-8 py-4 bg-surface border-b border-border shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex p-0.5 bg-muted rounded-xl border border-border self-start">
              {[
                { id: 'missing', label: 'Outstanding' },
                { id: 'logged', label: 'Logged Records' },
                { id: 'all', label: 'All Audits' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200",
                    activeTab === tab.id ? "bg-surface text-warning shadow-sm font-bold" : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[180px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
              <select
                value={obsTypeFilter}
                onChange={(e) => setObsTypeFilter(e.target.value)}
                className="w-full appearance-none pl-9 pr-5 py-2 bg-surface border border-border rounded-xl text-xs font-semibold tracking-widest text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
              >
                {['All', ...OBS_TYPES].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-72 sm:ml-auto">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, class..."
              className="w-full pl-9 pr-4 py-1.5 bg-surface border border-border rounded-xl text-xs font-medium focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all placeholder:text-text-secondary"
            />
          </div>
        </div>
      </section>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8 min-h-0">
        <div className="max-w-6xl mx-auto">
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center py-16 px-4 text-center bg-surface rounded-2xl border border-border">
              <p className="text-xs font-medium text-text-secondary">Syncing observation records from MAAIS backend…</p>
            </motion.div>
          )}

          {error && !isLoading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive">
              {error}
            </motion.div>
          )}

          {!isLoading && (
            <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-text-secondary uppercase tracking-wider font-mono">
                  <SlidersHorizontal size={13} /> Observation Logs
                </div>
                <span className="text-[11px] font-medium text-text-secondary">
                  Showing {filteredObservations.length} of {observations.length} logs
                </span>
              </div>

              <div className="divide-y divide-border min-h-0">
                <AnimatePresence mode="wait">
                  {filteredObservations.length === 0 ? (
                    <motion.div
                      key="empty-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface"
                    >
                      <div className="w-11 h-11 rounded-xl bg-muted border border-border flex items-center justify-center mb-3 text-text-secondary">
                        <Inbox size={18} />
                      </div>
                      <h3 className="text-xs font-bold text-text-primary">No logs found</h3>
                      <p className="text-[11px] text-text-secondary mt-0.5 max-w-[260px]">Modify filter variables or check index archives.</p>
                    </motion.div>
                  ) : (
                    filteredObservations.map((obs, idx) => {
                      const isMissing = obs.status === 'Missing';
                      const tc = obsTypeColor(obs.type);
                      return (
                        <motion.div
                          key={obs.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15, delay: idx * 0.02 }}
                          className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/40 transition-colors group"
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 shadow-sm",
                              isMissing ? "bg-warning/10 border-warning/20 text-warning" : "bg-success/10 border-success/20 text-success"
                            )}>
                              {isMissing ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-text-primary truncate tracking-tight">{obs.student}</p>
                                <span className="text-[10px] font-medium font-mono text-text-secondary bg-muted px-1.5 py-0.5 rounded border border-border shrink-0">
                                  {obs.index}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-text-secondary mt-1">
                                <span className="font-semibold text-text-primary">{obs.class}</span>
                                <span className="text-border">•</span>
                                <span>Instructed by {obs.teacher}</span>
                                <span className="text-border hidden md:inline">•</span>
                                <span className="inline-flex px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest text-text-primary" style={{color: tc }}>{obs.type}</span>
                              </div>
                              {obs.comment && (
                                <p className="text-[11px] font-medium text-muted-foreground italic mt-1.5 truncate max-w-md">
                                  "{obs.comment}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border shrink-0">
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded border tracking-wide",
                                isMissing ? "bg-warning/10 text-warning border-warning/20" : "bg-success/10 text-success border-success/20"
                              )}>
                                {obs.status}
                              </span>
                              <div className="flex items-center gap-1.5 text-text-secondary text-xs font-mono">
                                <Calendar size={12} />
                                <span>{obs.date}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {isMissing ? (
                                <button
                                  onClick={() => {
                                    window.location.href = `/grading?missing=${encodeURIComponent(obs.id)}&student=${encodeURIComponent(obs.index)}&subject=${encodeURIComponent(obs.type)}&class=${encodeURIComponent(obs.class)}`;
                                  }}
                                  className="p-1.5 bg-success/10 hover:bg-brand-dark border border-success/20 rounded-lg text-success hover:text-surface transition-all shadow-sm flex items-center justify-center group-hover:translate-x-0.5"
                                  title="Resolve observation entry"
                                >
                                  <ArrowRight size={13} />
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setEditingObs({ ...obs })}
                                    disabled={isSaving}
                                    className="p-1.5 hover:bg-brand-primary/10 disabled:opacity-50 rounded-lg transition-all text-text-secondary hover:text-brand-primary"
                                    title="Edit observation"
                                  >
                                    <PenLine size={14} />
                                  </button>
                                  <button
                                    onClick={() => { setDeleteTarget(obs); setShowConfirm(true); }}
                                    disabled={isSaving}
                                    className="p-1.5 hover:bg-destructive/10 disabled:opacity-50 rounded-lg transition-all text-text-secondary hover:text-destructive"
                                    title="Delete observation"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </main>

      <CreateObsModal
        isOpen={showCreate || !!editingObs}
        onClose={() => { setShowCreate(false); setEditingObs(null); }}
        onSave={handleSave}
        editingObs={editingObs}
        disabled={isSaving}
      />

      <ConfirmModal
        isOpen={showConfirm}
        onConfirm={handleDelete}
        onCancel={() => { setShowConfirm(false); setDeleteTarget(null); }}
        title="Delete Observation?"
        message={`This will permanently remove the record for "${deleteTarget?.student}" — "${deleteTarget?.type}". This action cannot be undone.`}
      />
    </div>
  );
}
