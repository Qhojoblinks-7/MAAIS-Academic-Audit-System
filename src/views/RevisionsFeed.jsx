import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Hourglass, ShieldCheck, RotateCcw, CheckCircle2,
  ArrowRight, Database, Eye, User, Clock, Lock, FileText,
} from 'lucide-react';
import { cn } from '../lib/utils';

const pendingRevisions = [
  { id: 'r1', student: 'Angela Owusu', class: 'SHS 1 Agric B', subject: 'General Agric', issue: 'Section B mismatch — script total is 48', teacher: 'Marcus Eshun', time: '2h ago', status: 'AWAITING_APPROVAL' },
  { id: 'r2', student: 'Kwame Boateng', class: 'SHS 2 Science A', subject: 'General Science', issue: 'Practical score variance (+4 points)', teacher: 'Rita Owusu', time: '5h ago', status: 'TEACHER_REPLIED' },
  { id: 'r3', student: 'Ama Dankwa', class: 'SHS 3 Home Econ', subject: 'Home Econ', issue: 'Section A boundary discrepancy', teacher: 'Esi Aidoo', time: '1d ago', status: 'AWAITING_APPROVAL' },
];

const statusStyles = {
  AWAITING_APPROVAL: 'bg-amber-50 text-amber-700 border-amber-100',
  TEACHER_REPLIED: 'bg-blue-50 text-blue-700 border-blue-100',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

const statusLabel = {
  AWAITING_APPROVAL: 'Pending Review',
  TEACHER_REPLIED: 'Reply Received',
  RESOLVED: 'Resolved',
};

export function RevisionsFeed() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('pending');
  const [selected, setSelected] = React.useState(null);

  const jobs = pendingRevisions;
  const displayed = activeTab === 'all' ? jobs : jobs.filter(j => j.status === (activeTab === 'pending' ? 'AWAITING_APPROVAL' : 'RESOLVED'));

  return (
    <div className="flex-1 flex overflow-hidden bg-[#F9F9F7]">
      <div className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <header className="mb-10">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-1">Correction Request Hub</h1>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{jobs.length} items require your attention</p>
              </div>
            </div>
          </header>

          <div className="flex gap-3 mb-8">
            {['pending', 'resolved', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn("px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === tab ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200")}
              >
                {tab === 'pending' ? 'Pending' : tab === 'resolved' ? 'Resolved' : 'All Items'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {displayed.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelected(job)}
                className={cn("p-6 rounded-[1.5rem] border transition-all cursor-pointer", selected?.id === job.id ? "bg-white border-emerald-200 shadow-xl" : "bg-white border-gray-100 hover:shadow-md")}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={cn("text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest border", statusStyles[job.status])}>{statusLabel[job.status]}</span>
                    <Clock size={14} className="text-gray-300" /> <span className="text-[9px] font-black text-gray-300 italic">{job.time}</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-500">#{job.id.slice(1)}</div>
                </div>
                <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-rose-500" />
                    <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Issue Flagged</span>
                  </div>
                  <p className="text-xs font-bold text-gray-700 leading-relaxed italic">"{job.issue}"</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-600">{job.student} • {job.class}</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{job.teacher} · {job.subject}</p>
                  </div>
                  <ArrowRight size={18} className="text-gray-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <div className="w-96 bg-white border-l border-gray-100 p-8 lg:overflow-y-auto hidden lg:block">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-[9px] font-black text-amber-600 uppercase tracking-widest mb-4">
              <Hourglass size={12} /> Revision Bridge
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">{selected.student}</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selected.class} · {selected.subject}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-6">
            <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest mb-2">Original HOD Note</p>
            <p className="text-xs font-medium text-gray-700 italic">"{selected.issue}"</p>
            <p className="text-[9px] font-bold text-amber-500 mt-2 uppercase tracking-widest">— {selected.teacher} · {selected.time}</p>
          </div>
          <button
            onClick={() => navigate(`/grading?revision=${selected.id}`)}
            className="w-full py-3.5 bg-emerald-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2"
          >
            Open Correction Sheet <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
