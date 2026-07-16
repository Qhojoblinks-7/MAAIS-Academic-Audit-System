import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  ArrowRight, AlertTriangle, CheckCircle2, Search,
  Clock, Calendar, Sparkles, SlidersHorizontal, Inbox,
  Plus, PenLine, Trash2, X, Filter
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { teacherService } from '../../services';
import { useBreadcrumb } from '../../context/BreadcrumbContext';
import { useUI } from '../../context/UIContext';
import { EmptyState } from '../../components/molecules';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
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
          <div
            className="absolute inset-0 bg-destructive/60 backdrop-blur-sm animate-in fade-in"
          onClick={onCancel}
        />
        <div
          className="w-full max-w-sm z-10 animate-in fade-in zoom-in-95"
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
    { label: 'Subject Name', type: 'text', placeholder: 'e.g. Agricultural Science', value: type, onChange: setType },
    { label: 'Student Name', type: 'text', placeholder: 'e.g. Angela Owusu', value: student, onChange: setStudent },
    { label: 'Class', type: 'text', placeholder: 'e.g. SHS 1 Agric B', value: className, onChange: setClassName },
    { label: 'Student Index No.', type: 'text', placeholder: 'e.g. 001', value: index, onChange: setIndex },
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
      <div className="absolute inset-0 bg-muted/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-97 slide-in-from-bottom-4">
        <div className="px-8 py-6 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-black text-foreground">{editingObs ? 'Edit Observation' : 'New Observation'}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
        </div>
        <div className="p-8 space-y-5">
          {formFields.map((field) => (
            <div key={field.label}>
              <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">{field.label}</label>
              {field.type === 'select' ? (
                <select value={field.value} onChange={(e) => field.onChange(e.target.value)} className="w-full px-5 py-3.5 bg-muted border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/10">
                  {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <Input type="text" placeholder={field.placeholder} value={field.value} onChange={(e) => field.onChange(e.target.value)} className="w-full px-5 py-3.5 font-medium focus:ring-2 focus:ring-brand-primary/10" />
              )}
            </div>
          ))}
          <div>
            <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Comment</label>
            <Textarea placeholder="Describe the observation in detail…" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} className="w-full px-5 py-3.5 font-medium resize-none focus:ring-2 focus:ring-brand-primary/10" />
          </div>
        </div>
        <div className="px-8 py-5 border-t border-border flex justify-end gap-3 bg-muted/50">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => canSave && onSave({ ...editingObs, type, student, index, class: className, comment, date: editingObs?.date || new Date().toISOString().slice(0, 10), status: editingObs?.status || 'Active' })} className={cn("font-black uppercase tracking-widest shadow-lg gap-2", canSave ? 'bg-brand-primary hover:bg-brand-primary/90 text-white' : 'bg-muted text-muted-foreground cursor-not-allowed')} disabled={disabled || !canSave}>
            <PenLine size={14} /> {editingObs ? 'Save Changes' : 'Save Observation'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TeacherMissingObservations() {
  const { setBreadcrumb } = useBreadcrumb();
  const { setMissingObservationCount } = useUI();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('missing');
  const [searchQuery, setSearchQuery] = useState('');
  const [obsTypeFilter, setObsTypeFilter] = useState('All');
  const [missingObservations, setMissingObservations] = useState([]);
  const [loggedObservations, setLoggedObservations] = useState([]);
  const [missingPage, setMissingPage] = useState(1);
  const [missingLimit] = useState(20);
  const [missingTotal, setMissingTotal] = useState(0);
  const [missingPages, setMissingPages] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsLimit] = useState(20);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPages, setLogsPages] = useState(0);
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

  useEffect(() => {
    const tabLabel = activeTab === 'missing' ? 'Missing' : activeTab === 'logged' ? 'Logged' : 'All';
    setBreadcrumb([{ label: 'Compliance Observations', path: '/missing-observations' }, { label: tabLabel, path: null }]);
  }, [activeTab, setBreadcrumb]);

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
        fetchEndpoint('Missing observations', () => teacherService.getMissingObservations(missingPage, missingLimit)),
        fetchEndpoint('Observation logs', () => teacherService.getObservationLogs(logsPage, logsLimit)),
      ]);

      const partialErrors = [missingResult, logsResult].filter((result) => result?.error);
      if (partialErrors.length > 0) {
        setError(partialErrors.map((result) => result.error).join('; '));
      }

      const missing = Array.isArray(missingResult?.data) ? missingResult.data.map(normalizeObservation).filter((obs) => obs.id) : [];
      const logs = Array.isArray(logsResult?.data) ? logsResult.data.map(normalizeObservation).filter((obs) => obs.id) : [];

      setMissingObservations(missing);
      setLoggedObservations(logs);
      setMissingObservationCount(missingResult?.total || missing.length);
      setMissingTotal(missingResult?.total || 0);
      setMissingPages(missingResult?.pages || 1);
      setLogsTotal(logsResult?.total || 0);
      setLogsPages(logsResult?.pages || 1);
    } catch (err) {
      setMissingObservations([]);
      setLoggedObservations([]);
      setMissingObservationCount(0);
      setError(err?.message || 'Failed to sync observations from MAAIS backend');
    } finally {
      setIsLoading(false);
    }
  }, [missingPage, missingLimit, logsPage, logsLimit, normalizeObservation]);

  useEffect(() => {
    fetchObservations();
  }, [fetchObservations]);

  useEffect(() => {
    setMissingPage(1);
    setLogsPage(1);
  }, [activeTab]);

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

  const handleSave = async (newObs) => {
    if (isSaving) return;
    setIsSaving(true);
    setError('');
    try {
      const payload = buildObservationPayload(newObs);
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
              <h1 className="text-xl font-bold text-primary tracking-tight">Teacher Observation Hub</h1>
              <p className="text-xs font-medium text-secondary mt-0.5">Audit data sheets and enforce term entry verification guidelines</p>
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
                    "px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer",
                    activeTab === tab.id ? "bg-surface text-warning shadow-sm font-bold" : "text-secondary hover:text-primary"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[180px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary pointer-events-none" />
              <select
                value={obsTypeFilter}
                onChange={(e) => setObsTypeFilter(e.target.value)}
                className="w-full appearance-none pl-9 pr-5 py-2 bg-surface border border-border rounded-xl text-xs font-semibold tracking-widest text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
              >
                {['All', ...OBS_TYPES].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-72 sm:ml-auto">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, class..."
              className="w-full pl-9 pr-4 py-1.5 bg-surface border border-border rounded-xl text-xs font-medium focus:bg-card focus:outline-none focus:ring-2 focus:ring-brand-primary/10 transition-all placeholder:text-secondary"
            />
          </div>
        </div>
      </section>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8 min-h-0">
        <div className="max-w-6xl mx-auto">
          {isLoading && (
             <div className="flex items-center justify-center py-16 px-4 text-center bg-surface rounded-2xl border border-border animate-in fade-in">
              <p className="text-xs font-medium text-secondary">Syncing observation records from MAAIS backend…</p>
            </div>
          )}

          {error && !isLoading && (
             <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive animate-in fade-in slide-in-from-bottom-2">
              {error}
            </div>
          )}

          {!isLoading && (
            <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-wider font-mono">
                  <SlidersHorizontal size={13} /> Observation Logs
                </div>
                <span className="text-xs font-medium text-secondary">
                  Showing {filteredObservations.length} of {sourceObservations.length} {activeTab === 'missing' ? 'missing' : activeTab === 'logged' ? 'logged' : 'total'} observations
                </span>
              </div>

               <div className="divide-y divide-border min-h-0">
                   {filteredObservations.length === 0 ? (
                     <div
                       key="empty-state"
                       className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface animate-in fade-in"
                     >
                      <EmptyState context="comments" variant="compact" />
                    </div>
                  ) : (
                    filteredObservations.map((obs, idx) => {
                      const isMissing = obs.status === 'Missing';
                      const tc = obsTypeColor(obs.type);
                      return (
                         <div
                           key={obs.id}
                           style={{ animationDelay: `${idx * 20}ms` }}
                           className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/40 transition-colors group animate-in fade-in slide-in-from-bottom-2"
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
                                <p className="text-sm font-bold text-primary truncate tracking-tight">{obs.student}</p>
                                <span className="text-xs font-medium font-mono text-secondary bg-muted px-1.5 py-0.5 rounded border border-border shrink-0">
                                  {obs.index}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-secondary mt-1">
                                <span className="font-semibold text-primary">{obs.class}</span>
                                <span className="text-border">•</span>
                                <span>Instructed by {obs.teacher}</span>
                                <span className="text-border">•</span>
                                <span className="text-primary font-semibold">HOD: {obs.hod}</span>
                                <span className="text-border hidden md:inline">•</span>
                                <span className="inline-flex px-2 py-0.5 rounded border text-xs font-black uppercase tracking-widest text-primary" style={{color: tc }}>{obs.type}</span>
                              </div>
                              {obs.comment && (
                                <p className="text-xs font-medium text-muted-foreground italic mt-1.5 truncate max-w-md">
                                  "{obs.comment}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border shrink-0">
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "text-xs font-bold px-2 py-0.5 rounded border tracking-wide",
                                isMissing ? "bg-warning/10 text-warning border-warning/20" : "bg-success/10 text-success border-success/20"
                              )}>
                                {obs.status}
                              </span>
                              <div className="flex items-center gap-1.5 text-secondary text-xs font-mono">
                                <Calendar size={12} />
                                <span>{obs.date}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                               {isMissing ? (
                                <button
                                  onClick={() => {
                                    console.log('[TeacherMissingObservations] navigating to grading for obs:', {
                                      id: obs.id,
                                      studentId: obs.studentId,
                                      subject: obs.type,
                                      class: obs.class,
                                      student: obs.student,
                                      index: obs.index,
                                    });
                                    navigate(`/grading?missing=${encodeURIComponent(obs.id)}&studentId=${encodeURIComponent(obs.studentId)}&studentName=${encodeURIComponent(obs.student)}&index=${encodeURIComponent(obs.index)}&subject=${encodeURIComponent(obs.type)}&class=${encodeURIComponent(obs.class)}`);
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
                                    className="p-1.5 hover:bg-brand-primary/10 disabled:opacity-50 rounded-lg transition-all text-secondary hover:text-brand-primary"
                                    title="Edit observation"
                                  >
                                    <PenLine size={14} />
                                  </button>
                                  <button
                                    onClick={() => { setDeleteTarget(obs); setShowConfirm(true); }}
                                    disabled={isSaving}
                                    className="p-1.5 hover:bg-destructive/10 disabled:opacity-50 rounded-lg transition-all text-secondary hover:text-destructive"
                                    title="Delete observation"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                   )}
                </div>

                {!isLoading && (activeTab === 'missing' ? missingTotal > missingLimit : logsTotal > logsLimit) && (
                  <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between shrink-0">
                    <div className="text-xs font-medium text-secondary">
                      {activeTab === 'missing' ? (
                        <>Showing {(missingPage - 1) * missingLimit + 1}–{Math.min(missingPage * missingLimit, missingTotal)} of {missingTotal}</>
                      ) : (
                        <>Showing {(logsPage - 1) * logsLimit + 1}–{Math.min(logsPage * logsLimit, logsTotal)} of {logsTotal}</>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => activeTab === 'missing' ? setMissingPage(p => Math.max(1, p - 1)) : setLogsPage(p => Math.max(1, p - 1))}
                        disabled={(activeTab === 'missing' ? missingPage : logsPage) <= 1}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-surface hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        Previous
                      </button>
                      <span className="text-xs font-bold text-primary">
                        {activeTab === 'missing' ? missingPage : logsPage} / {activeTab === 'missing' ? missingPages : logsPages}
                      </span>
                      <button
                        onClick={() => activeTab === 'missing' ? setMissingPage(p => Math.min(missingPages, p + 1)) : setLogsPage(p => Math.min(logsPages, p + 1))}
                        disabled={(activeTab === 'missing' ? missingPage : logsPage) >= (activeTab === 'missing' ? missingPages : logsPages)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-surface hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
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
