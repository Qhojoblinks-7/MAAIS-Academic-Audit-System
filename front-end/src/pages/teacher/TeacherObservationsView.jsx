import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Star, Search, X, Plus, PenLine, Trash2, Calendar, Users, AlertCircle,
  ChevronRight, GraduationCap, ClipboardCheck, Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import MOCK from '../../data/teacherMockData.json';

const { observationTypes, observations } = MOCK;
// Source of truth: student records table (see requirement and specs.txt)
// OBS_TYPES / OBS_COLORS sourced from centralized mock data
const OBS_TYPES = observationTypes.types;
const OBS_COLORS = Object.values(observationTypes.colors);
// initialObservations sourced from centralized mock data — replace with live API
const INITIAL_OBSERVATIONS = observations.items.map(o => ({ ...o }));

function ConfirmModal({ isOpen, onConfirm, onCancel, title, message }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-destructive/60 backdrop-blur-sm" onClick={onCancel} />
      <Card className="relative w-full max-w-sm p-8 shadow-2xl">
        <div className="w-12 h-12 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-5">
          <Trash2 size={22} />
        </div>
        <h3 className="text-lg font-black text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button onClick={onConfirm} className="flex-1 bg-destructive hover:bg-destructive/90">Delete</Button>
        </div>
      </Card>
    </div>
  );
}

function CreateObsModal({ isOpen, onClose, onSave }) {
  const [type, setType] = React.useState('Behavioral');
  const [student, setStudent] = React.useState('');
  const [className, setClassName] = React.useState('');
  const [index, setIndex] = React.useState('');
  const [comment, setComment] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setType('Behavioral');
      setStudent('');
      setClassName('');
      setIndex('');
      setComment('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canSave = student.trim() && comment.trim();

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.97, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}
        className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl overflow-hidden"
      >
      <div className="px-8 py-6 border-b border-border flex justify-between items-center">
        <h3 className="text-lg font-black text-foreground">New Observation</h3>
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
          onClick={() => canSave && onSave({ id: `o${Date.now()}`, type, student, index, class: className, comment, date: new Date().toISOString().slice(0, 10), status: 'Active' })}
          className={cn("font-black uppercase tracking-widest shadow-lg gap-2",
            canSave ? 'bg-brand-primary hover:bg-brand-primary/90' : 'bg-muted cursor-not-allowed')}
          disabled={!canSave}
        >
          <PenLine size={14} /> Save Observation
        </Button>
      </div>
    </motion.div>
    </div>
  );
}

export function TeacherObservationsView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [obs, setObs] = React.useState(INITIAL_OBSERVATIONS);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('All');
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [showCreate, setShowCreate] = React.useState(false);
  const [editingObs, setEditingObs] = React.useState(null);
  const [deleteTarget, setDeleteTarget] = React.useState(null);
  const [showConfirm, setShowConfirm] = React.useState(false);

// Deep-link via URL params: ?student=X or ?index=X
   React.useEffect(() => {
     const urlStudent = searchParams.get('student');
     const urlIndex = searchParams.get('index');
    
     if (urlStudent || urlIndex) {
       // Find matching observation
       const match = INITIAL_OBSERVATIONS.find(o => 
         (urlStudent && o.student.toLowerCase().includes(urlStudent.toLowerCase())) ||
         (urlIndex && o.index === urlIndex)
       );
       if (match) {
         setSearchQuery(urlStudent || urlIndex);
         setStatusFilter('Active'); // Auto-filter to Active status per WAEC STP requirements
         // Trigger edit mode for the matched record
         setEditingObs({ ...match });
       }
     }
   }, [searchParams]);

  const filtered = obs.filter(o => {
    const mqs = o.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.class.toLowerCase().includes(searchQuery.toLowerCase());
    const mType = typeFilter === 'All' || o.type === typeFilter;
    const mStatus = statusFilter === 'All' || o.status === statusFilter;
    return mqs && mType && mStatus;
  });

const activeCount = obs.filter(o => o.status === 'Active').length;
   const resolvedCount = obs.filter(o => o.status === 'Resolved').length;

const handleSave = (newObs) => {
     if (editingObs) {
       const normalizedStatus = newObs.status?.toLowerCase() === 'active' ? 'Active' : 
                                  newObs.status?.toLowerCase() === 'resolved' ? 'Resolved' : newObs.status;
       setObs(prev => prev.map(o => o.id === editingObs.id ? { ...o, ...newObs, status: normalizedStatus } : o));
       setEditingObs(null);
     } else {
       const normalizedStatus = newObs.status?.toLowerCase() === 'active' ? 'Active' : 
                                  newObs.status?.toLowerCase() === 'resolved' ? 'Resolved' : newObs.status;
       setObs(prev => [{ ...newObs, status: normalizedStatus }, ...prev]);
     }
     setShowCreate(false);
   };

  const handleDelete = () => {
    if (deleteTarget) {
      setObs(prev => prev.filter(o => o.id !== deleteTarget.id));
      setDeleteTarget(null);
      setShowConfirm(false);
    }
  };

  const startEdit = (o) => {
    setEditingObs({ ...o });
  };

  const confirmEdit = () => {
    if (editingObs) {
      setObs(prev => prev.map(o => o.id === editingObs.id ? editingObs : o));
      setEditingObs(null);
    }
  };

  const obsTypeColor = (type) => {
    const i = OBS_TYPES.indexOf(type);
    return OBS_COLORS[i] || 'hsl(222 47% 11%)';
  };

return (
    <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 lg:p-10 select-none">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="mb-8 border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight leading-none">
              Observations
            </h1>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2 flex items-center gap-1.5">
              <ClipboardCheck size={10} className="text-muted-foreground" />
              Behavioral · Academic · Lab Safety · Create · Manage
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="self-start gap-2 font-black uppercase tracking-widest shadow-lg">
            <Plus size={15} /> New Observation
          </Button>
        </header>

        {/* Summary pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Records', value: obs.length, icon: Star, color: 'bg-muted text-foreground border-border' },
            { label: 'Active', value: activeCount, icon: AlertCircle, color: 'bg-success/10 text-success border-success/20' },
            { label: 'Resolved', value: resolvedCount, icon: GraduationCap, color: 'bg-muted text-muted-foreground border-border' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card p-5 rounded-2xl border border-border/60 shadow-sm flex items-center gap-4"
            >
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border", s.color)}>
                <s.icon size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{s.label}</p>
                <p className="text-2xl font-black text-foreground">{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
            <Input
              type="text"
              placeholder="Search by student, class, or comment…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 font-medium"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <div className="flex items-center gap-1 px-3 py-2 bg-card border border-border rounded-xl text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              <Filter size={10} />
              Type
            </div>
            {['All', ...OBS_TYPES].map(f => (
              <Button key={f} variant={typeFilter === f ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter(f)} className="text-[9px] font-black uppercase tracking-widest">
                {f}
              </Button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <div className="flex items-center gap-1 px-3 py-2 bg-card border border-border rounded-xl text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              <Calendar size={10} />
              Status
            </div>
            {['All', 'Active', 'Resolved'].map(f => (
              <Button key={f} variant={statusFilter === f ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(f)} className="text-[9px] font-black uppercase tracking-widest">
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card className="rounded-[2rem] border border-border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
            <Users size={14} className="text-muted-foreground" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Observation Records · {filtered.length} of {obs.length}
            </span>
          </div>

          {/* Column header row */}
          <div className="px-6 py-2.5 border-b border-border bg-muted grid grid-cols-12 gap-3 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
            <span className="col-span-2">Student</span>
            <span className="col-span-2">Observation Type</span>
            <span className="col-span-2">Class / Index</span>
            <span className="col-span-3">Note</span>
            <span className="col-span-1 text-right">Date</span>
            <span className="col-span-1 text-center">Status</span>
            <span className="col-span-1 text-right">Actions</span>
          </div>

          <div className="divide-y divide-border">
            <AnimatePresence>
              {filtered.map((o, i) => {
                const tc = obsTypeColor(o.type);
                return (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.03 }}
                    className="px-6 py-4 grid grid-cols-12 gap-3 items-center hover:bg-muted/40 transition-all"
                  >
                    {/* Name */}
                    <div className="col-span-2 font-black text-sm text-foreground truncate">{o.student}</div>

                    {/* Type */}
                    <div className="col-span-2">
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary-foreground" style={{ backgroundColor: tc }}>{o.type}</span>
                    </div>

                    {/* Class / index */}
                    <div className="col-span-2">
                      <p className="text-xs font-bold text-foreground truncate">{o.class}</p>
                      <p className="text-[9px] font-black text-muted-foreground">Idx. {o.index}</p>
                    </div>

                    {/* Comment */}
                    <div className="col-span-3 text-[11px] font-medium text-muted-foreground italic truncate">"{o.comment}"</div>

                    {/* Date */}
                    <div className="col-span-1 text-right text-[10px] font-bold text-muted-foreground whitespace-nowrap">{o.date}</div>

                    {/* Status */}
                    <div className="col-span-1 text-center">
                      {o.status === 'Active'
                        ? <span className="inline-flex items-center gap-1 text-[8px] font-black px-2.5 py-1 rounded-xl bg-success/10 text-success border border-success/20 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" /> Active
                          </span>
                        : <span className="inline-flex text-[8px] font-black px-2.5 py-1 rounded-xl bg-muted text-muted-foreground border border-border uppercase tracking-widest">Resolved</span>}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(o)} className="hover:text-brand-primary" title="Edit">
                        <PenLine size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setDeleteTarget(o); setShowConfirm(true); }} className="hover:text-destructive" title="Delete">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-muted-foreground text-sm font-medium uppercase tracking-tight">
                No observations match your filters.
              </div>
            )}
          </div>
        </Card>

        {/* ── EDIT MODAL ── */}
        <AnimatePresence>
          {editingObs && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={() => setEditingObs(null)} />
              <motion.div initial={{ scale: 0.97, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}
                className="relative w-full max-w-lg bg-card rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-border flex justify-between items-center">
                  <h3 className="text-lg font-black text-foreground">Edit Observation</h3>
                  <Button variant="ghost" size="icon" onClick={() => setEditingObs(null)}><X size={20} /></Button>
                </div>
                <div className="p-8 space-y-5">
                  {[
                    { label: 'Observation Type', type: 'type', options: OBS_TYPES },
                    { label: 'Student Name', type: 'student' },
                    { label: 'Class', type: 'className' },
                    { label: 'Index No.', type: 'index' },
                  ].map(field => (
                    <div key={field.label}>
                      <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">{field.label}</label>
                      {field.options ? (
                        <select value={editingObs[field.type]} onChange={(e) => setEditingObs(prev => ({ ...prev, [field.type]: e.target.value }))}
                          className="w-full px-5 py-3.5 bg-muted border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/10">
                          {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <Input type="text" value={editingObs[field.type]} onChange={(e) => setEditingObs(prev => ({ ...prev, [field.type]: e.target.value }))}
                          className="w-full px-5 py-3.5 font-medium focus:ring-2 focus:ring-brand-primary/10" />
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="block text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2">Comment</label>
                    <Textarea
                      rows={4}
                      value={editingObs.comment}
                      onChange={(e) => setEditingObs(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full px-5 py-3.5 font-medium resize-none focus:ring-2 focus:ring-brand-primary/10"
                    />
                  </div>
                </div>
                <div className="px-8 py-5 border-t border-border flex justify-end gap-3 bg-muted/50">
                  <Button variant="outline" onClick={() => setEditingObs(null)}>Cancel</Button>
                  <Button onClick={confirmEdit} className="font-black uppercase tracking-widest shadow-md gap-2"><PenLine size={14} /> Save Changes</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── DELETE CONFIRM MODAL ── */}
        <AnimatePresence>
          {showConfirm && (
            <ConfirmModal
              isOpen={showConfirm}
              onConfirm={handleDelete}
              onCancel={() => { setShowConfirm(false); setDeleteTarget(null); }}
              title="Delete Observation?"
              message={`This will permanently remove the record for "${deleteTarget?.student}" — "${deleteTarget?.type}". This action cannot be undone.`}
            />
          )}
        </AnimatePresence>

        {/* ── CREATE MODAL ── */}
        <AnimatePresence>
          <CreateObsModal isOpen={showCreate} onClose={() => setShowCreate(false)} onSave={handleSave} />
        </AnimatePresence>

      </motion.div>
    </div>
  );
}