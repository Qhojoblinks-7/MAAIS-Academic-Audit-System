import React from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap, BookOpen, Users, Calendar, Save, RotateCcw, ArrowRight,
  AlertTriangle, CheckCircle2, Database, X, Eye, Settings, Trash2,
  Shield, Clock, Archive,
} from 'lucide-react';
import { cn } from '../lib/utils';

const mockObservations = [
  { id: 'o1', student: 'Kofi Mensah', class: 'SHS 2 Science A', type: 'Lab Safety', teacher: 'R. Owusu', status: 'Missing', date: '2026-01-15' },
  { id: 'o2', student: 'Ama Darko', class: 'SHS 3 Agric B', type: 'Behavioral', teacher: 'M. Baah', status: 'Logged', date: '2026-01-14' },
  { id: 'o3', student: 'Yaw Boateng', class: 'SHS 1 Gen Arts', type: 'Resource Economy', teacher: 'A. Boateng', status: 'Missing', date: '2026-01-12' },
  { id: 'o4', student: 'Efua Owusu', class: 'SHS 2 Home Econ', type: 'Hygienic Practices', teacher: 'E. Aidoo', status: 'Logged', date: '2026-01-10' },
  { id: 'o5', student: 'Kojo Antwi', class: 'SHS 3 Science', type: 'Lab Safety', teacher: 'S. K. Mensah', status: 'Missing', date: '2026-01-08' },
];

export function MissingObservations() {
  const [activeTab, setActiveTab] = React.useState('missing');

  const displayed = activeTab === 'missing' ? mockObservations.filter(o => o.status === 'Missing') : mockObservations;

  const statusColors = {
    Missing: 'bg-amber-50 text-amber-700 border-amber-100',
    Logged: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-1">Missing Observations</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Audit compliance tray · grading lock guardian</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-[10px] font-black uppercase tracking-widest">
            {mockObservations.filter(o => o.status === 'Missing').length} Unresolved
          </span>
        </header>

        <div className="flex gap-3 mb-8">
          {['missing', 'logged', 'all'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === tab ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50")}>
              {tab === 'missing' ? 'Outstanding' : tab === 'logged' ? 'Logged' : 'All'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-gray-900" size={18} />
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Compliance Tray</span>
            </div>
            <button className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Queue All</button>
          </div>
          <div className="divide-y divide-gray-50">
            {displayed.map((obs, i) => (
              <motion.div
                key={obs.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", obs.status === 'Missing' ? "bg-amber-50" : "bg-emerald-50")}>
                    {obs.status === 'Missing' ? <AlertTriangle size={18} className="text-amber-600" /> : <CheckCircle2 size={18} className="text-emerald-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 mb-0.5">{obs.student}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{obs.class} · {obs.teacher}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn("text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest", statusColors[obs.status])}>{obs.status}</span>
                  <span className="text-[9px] font-black text-gray-300 italic uppercase">{obs.date}</span>
                  {obs.status === 'Missing' && (
                    <button
                      onClick={() => window.location.href = '/grading?missing=' + obs.id}
                      className="p-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all"
                    >
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
