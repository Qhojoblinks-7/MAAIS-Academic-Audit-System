import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Star, Search, X, Plus, PenLine, Trash2, Calendar, Users, AlertCircle,
  ChevronRight, GraduationCap, ClipboardCheck, Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onCancel} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-5">
            <Trash2 size={22} />
          </div>
          <h3 className="text-lg font-black text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">{message}</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-3 bg-slate-50 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-100 transition-all border border-slate-200">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-3 bg-rose-600 text-white font-medium rounded-xl text-sm hover:bg-rose-700 transition-all shadow-md">Delete</button>
          </div>
        </div>
      </motion.div>
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.97, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-black text-gray-900">New Observation</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-gray-400 hover:text-gray-600"><X size={20} /></button>
      </div>
      <div className="p-8 space-y-5">
        {[
          { label: 'Observation Type', type: 'select', options: OBS_TYPES, value: type, onChange: setType },
          { label: 'Student Name', type: 'text', placeholder: 'e.g. Angela Owusu', value: student, onChange: setStudent },
          { label: 'Class', type: 'text', placeholder: 'e.g. SHS 1 Agric B', value: className, onChange: setClassName },
          { label: 'Student Index No.', type: 'text', placeholder: 'e.g. 001', value: index, onChange: setIndex },
        ].map(field => (
          <div key={field.label}>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{field.label}</label>
            {field.type === 'select' ? (
              <select value={field.value} onChange={(e) => field.onChange(e.target.value)}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-900/10">
                {field.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input type="text" placeholder={field.placeholder} value={field.value} onChange={(e) => field.onChange(e.target.value)}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-900/10" />
            )}
          </div>
        ))}
        <div>
          <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Comment</label>
          <textarea
            placeholder="Describe the observation in detail…"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-900/10 resize-none"
          />
        </div>
      </div>
      <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
        <button onClick={onClose} className="px-5 py-2.5 bg-white text-slate-700 font-medium rounded-xl text-sm hover:bg-gray-100 transition-all border border-gray-200">Cancel</button>
        <button
          onClick={() => canSave && onSave({ id: `o${Date.now()}`, type, student, index, class: className, comment, date: new Date().toISOString().slice(0, 10), status: 'Active' })}
          className={cn("px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2",
            canSave ? 'bg-emerald-900 text-white hover:bg-emerald-950' : 'bg-gray-200 text-gray-400 cursor-not-allowed')}
        >
          <PenLine size={14} /> Save Observation
        </button>
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
    return OBS_COLORS[i] || '#1D4D4F';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#FBFBFA] p-6 md:p-8 lg:p-10 select-none">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="mb-8 border-b border-gray-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">
              Observations
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-1.5">
              <ClipboardCheck size={10} className="text-gray-300" />
              Behavioral · Academic · Lab Safety · Create · Manage
            </p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-emerald-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-lg flex items-center gap-2 self-start">
            <Plus size={15} /> New Observation
          </button>
        </header>

        {/* Summary pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Records', value: obs.length, icon: Star, color: 'bg-blue-50 text-blue-700 border-blue-100' },
            { label: 'Active', value: activeCount, icon: AlertCircle, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            { label: 'Resolved', value: resolvedCount, icon: GraduationCap, color: 'bg-gray-50 text-gray-700 border-gray-100' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-4">
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border", s.color)}>
                <s.icon size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
            <input
              type="text"
              placeholder="Search by student, class, or comment…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[12px] font-medium text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-900/10 shadow-sm"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <div className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <Filter size={10} />
              Type
            </div>
            {['All', ...OBS_TYPES].map(f => (
              <button key={f} onClick={() => setTypeFilter(f)}
                className={cn("px-3.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border",
                  typeFilter === f ? 'bg-brand-teal text-white border-brand-teal shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300')}>{f}</button>
            ))}
          </div>
<div className="flex gap-1.5 flex-wrap">
             <div className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-widest">
               <Calendar size={10} />
               Status
             </div>
             {['All', 'Active', 'Resolved'].map(f => (
               <button key={f} onClick={() => setStatusFilter(f)}
                 className={cn("px-3.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border",
                   statusFilter === f ? 'bg-brand-teal text-white border-brand-teal shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300')}>{f}</button>
             ))}
           </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center gap-3">
            <Users size={14} className="text-gray-400" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Observation Records · {filtered.length} of {obs.length}
            </span>
          </div>

          {/* Column header row */}
          <div className="px-6 py-2.5 border-b border-gray-50 bg-gray-50 grid grid-cols-12 gap-3 text-[9px] font-black text-gray-300 uppercase tracking-widest">
            <span className="col-span-2">Student</span>
            <span className="col-span-2">Observation Type</span>
            <span className="col-span-2">Class / Index</span>
            <span className="col-span-3">Note</span>
            <span className="col-span-1 text-right">Date</span>
            <span className="col-span-1 text-center">Status</span>
            <span className="col-span-1 text-right">Actions</span>
          </div>

          <div className="divide-y divide-gray-100">
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
                    className="px-6 py-4 grid grid-cols-12 gap-3 items-center hover:bg-gray-50/40 transition-all"
                  >
                    {/* Name */}
                    <div className="col-span-2 font-black text-sm text-gray-900 truncate">{o.student}</div>

                    {/* Type */}
                    <div className="col-span-2">
                      <span className="inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white" style={{ backgroundColor: tc }}>{o.type}</span>
                    </div>

                    {/* Class / index */}
                    <div className="col-span-2">
                      <p className="text-xs font-bold text-gray-700 truncate">{o.class}</p>
                      <p className="text-[9px] font-black text-gray-400">Idx. {o.index}</p>
                    </div>

                    {/* Comment */}
                    <div className="col-span-3 text-[11px] font-medium text-gray-600 italic truncate">"{o.comment}"</div>

                    {/* Date */}
                    <div className="col-span-1 text-right text-[10px] font-bold text-gray-400 whitespace-nowrap">{o.date}</div>

                    {/* Status */}
                    <div className="col-span-1 text-center">
                      {o.status === 'Active'
                        ? <span className="inline-flex items-center gap-1 text-[8px] font-black px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" /> Active
                          </span>
                        : <span className="inline-flex text-[8px] font-black px-2.5 py-1 rounded-xl bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-widest">Resolved</span>}
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(o)} className="p-2 hover:bg-blue-50 rounded-lg transition-all text-gray-400 hover:text-blue-700" title="Edit">
                        <PenLine size={14} />
                      </button>
                      <button onClick={() => { setDeleteTarget(o); setShowConfirm(true); }} className="p-2 hover:bg-rose-50 rounded-lg transition-all text-gray-400 hover:text-rose-600" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-gray-400 text-sm font-medium uppercase tracking-tight">
                No observations match your filters.
              </div>
            )}
          </div>
        </div>

        {/* ── EDIT MODAL ── */}
        <AnimatePresence>
          {editingObs && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setEditingObs(null)} />
              <motion.div initial={{ scale: 0.97, opacity: 0, y: 15 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-black text-gray-900">Edit Observation</h3>
                  <button onClick={() => setEditingObs(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <div className="p-8 space-y-5">
                  {[
                    { label: 'Observation Type', type: 'type', options: OBS_TYPES },
                    { label: 'Student Name', type: 'student' },
                    { label: 'Class', type: 'className' },
                    { label: 'Index No.', type: 'index' },
                  ].map(field => (
                    <div key={field.label}>
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{field.label}</label>
                      {field.options ? (
                        <select value={editingObs[field.type]} onChange={(e) => setEditingObs(prev => ({ ...prev, [field.type]: e.target.value }))}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-900/10">
                          {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input type="text" value={editingObs[field.type]} onChange={(e) => setEditingObs(prev => ({ ...prev, [field.type]: e.target.value }))}
                          className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-900/10" />
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Comment</label>
                    <textarea
                      rows={4}
                      value={editingObs.comment}
                      onChange={(e) => setEditingObs(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-900/10"
                    />
                  </div>
                </div>
                <div className="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                  <button onClick={() => setEditingObs(null)} className="px-5 py-2.5 bg-white text-slate-700 font-medium rounded-xl text-sm hover:bg-gray-100 transition-all border border-gray-200">Cancel</button>
                  <button onClick={confirmEdit} className="px-6 py-2.5 bg-emerald-900 text-white font-black text-sm rounded-xl hover:bg-emerald-950 transition-all shadow-md flex items-center gap-2"><PenLine size={14} /> Save Changes</button>
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
