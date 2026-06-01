import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, CheckCircle2, Clock, ArrowRight, X, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';

const myObservations = [
  { id: 'o1', type: 'Lab Safety', student: 'Angela Owusu', teacher: 'Mr. Mensah', comment: 'Exhibited high safety protocol compliance.', date: 'Nov 14, 2025' },
  { id: 'o2', type: 'Collaboration', student: 'Kwame Mensah', teacher: 'Dr. Boateng', comment: 'Led the workshop group effectively.', date: 'Jan 22, 2026' },
  { id: 'o3', type: 'Behavioral', student: 'Yaw Boateng', teacher: 'Mrs. Owusu', comment: 'Improvement in task submission timeliness.', date: 'Mar 05, 2026' },
];

export function SupportView() {
  const navigate = useNavigate();
  const { user } = useRole();
  const [activeTab, setActiveTab] = React.useState('academics');
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');

  const tickets = [
    { id: 't1', subject: 'Grading discrepancy in Algebra topic', status: 'IN_PROGRESS', priority: 'HIGH', date: '2026-05-12' },
    { id: 't2', subject: 'Report card PDF not downloading', status: 'OPEN', priority: 'MEDIUM', date: '2026-05-15' },
    { id: 't3', subject: 'Subject not appearing on my dashboard', status: 'RESOLVED', priority: 'LOW', date: '2026-04-28' },
  ];

  const statusStyles = {
    OPEN: 'bg-gray-50 text-gray-600 border-gray-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-100',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-2">ICT Support Centre</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Raise tickets · track requests · view resolution history</p>
        </header>

        {/* Observation Feed */}
        <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm mb-8">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3 mb-6">
            <Star className="text-gray-900" size={20} />
            <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Behaviour Observations</h2>
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
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Observed by {obs.teacher} · Re: {obs.student}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* New Ticket */}
        <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm mb-8">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3 mb-6">
            <QrCode className="text-gray-900" size={20} />
            <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Raise New Ticket</h2>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="Ticket title..." value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] font-black text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10" />
            <textarea placeholder="Describe your issue in detail..." value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 resize-none" />
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {['Academic', 'Technical', 'Finance', 'General'].map(t => (
                  <button key={t} className="px-3 py-1.5 bg-gray-100 text-gray-500 text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-gray-200 transition-all">{t}</button>
                ))}
              </div>
              <button className="px-6 py-3 bg-emerald-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-lg">Submit Ticket</button>
            </div>
          </div>
        </section>

        {/* Ticket List */}
        <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3 mb-6">
            <Clock className="text-gray-900" size={20} />
            <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">My Tickets</h2>
          </div>
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all">
                <div>
                  <p className="text-sm font-black text-gray-900 mb-0.5">{t.subject}</p>
                  <p className="text-[10px] font-bold text-gray-400">{t.date}</p>
                </div>
                <span className={cn("text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest border", statusStyles[t.status] || 'bg-gray-50 text-gray-500')}>{t.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
