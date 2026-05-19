import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, QrCode, CheckCircle2, Clock, ArrowRight, X, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';

const myObservations = [
  { id: 'o1', type: 'Lab Safety', student: 'Angela Owusu', teacher: 'Mr. Mensah', comment: 'Demonstrated clear understanding of electrical safety protocols.', date: 'Nov 14, 2025' },
  { id: 'o2', type: 'Collaboration', student: 'Kwame Mensah', teacher: 'Dr. Boateng', comment: 'Consistent peer-leader in group activities this term.', date: 'Jan 22, 2026' },
  { id: 'o3', type: 'Behavioral', student: 'Yaw Boateng', teacher: 'Mrs. Owusu', comment: 'Improvement in task submission timeliness observed.', date: 'Mar 05, 2026' },
];

export function HODSupport() {
  const navigate = useNavigate();
  const { user } = useRole();
  const [activeTab, setActiveTab] = React.useState('academics');
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');

  const tickets = [
    { id: 't1', subject: 'Out-of-range score alert flagged 3 students', status: 'IN_PROGRESS', priority: 'HIGH', date: '2026-05-12' },
    { id: 't2', subject: 'Admin privilege escalation detection', status: 'OPEN', priority: 'CRITICAL', date: '2026-05-14' },
    { id: 't3', subject: 'Request: Reset teacher grade lock', status: 'RESOLVED', priority: 'MEDIUM', date: '2026-04-28' },
    { id: 't4', subject: 'Incident: SHA-265 hash mismatch notification', status: 'RESOLVED', priority: 'HIGH', date: '2026-03-15' },
  ];

  const statusStyles = {
    OPEN: 'bg-gray-50 text-gray-600 border-gray-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-100',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    CRITICAL: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-2">Head of Department — ICT Support</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Triage by Origin · review id/tool · escalate to Platform</p>
        </header>

        {/* Observation Archive */}
        <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm mb-8">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3 mb-6">
            <Star className="text-gray-900" size={20} />
            <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">HOD Observation Feed</h2>
          </div>
          <div className="space-y-4">
            {myObservations.map((obs, i) => (
              <motion.div
                key={obs.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 bg-gray-50 rounded-2xl border-l-4 border-emerald-500 border-t border-r border-b border-gray-100"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded uppercase tracking-widest">{obs.type}</span>
                  <span className="text-[9px] font-black text-gray-300 italic">{obs.date}</span>
                </div>
                <p className="text-sm font-medium text-gray-700 italic leading-relaxed">"{obs.comment}"</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Re: {obs.student} · Obs. by {obs.teacher}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* New Ticket */}
        <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm mb-8">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3 mb-6">
            <QrCode className="text-gray-900" size={20} />
            <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Raise New HOD-Specific Ticket</h2>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="Short description of the issue..." className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] font-black text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10" />
            <textarea placeholder="Include context—grade matrix, class, student index..." rows={4} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 resize-none" />
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {['Dept. Composite', 'Lock/Override', 'Certification', 'Anomaly Flag'].map(t => (
                  <button key={t} className="px-3 py-1.5 bg-gray-100 text-gray-500 text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-gray-200 transition-all">{t}</button>
                ))}
              </div>
              <button className="px-6 py-3 bg-emerald-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-lg">
                Append to Vault
              </button>
            </div>
          </div>
        </section>

        {/* Ticket List */}
        <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3 mb-6">
            <Clock className="text-gray-900" size={20} />
            <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Open / In-Progress</h2>
          </div>
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all">
                <div>
                  <p className="text-sm font-black text-gray-900 mb-0.5">{t.subject}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest", statusStyles[t.status])}>{t.status}</span>
                  <ArrowRight size={18} className="text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
