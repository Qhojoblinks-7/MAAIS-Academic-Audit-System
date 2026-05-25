import React from 'react';
import { motion } from 'framer-motion';
import { Scale, QrCode, CheckCircle2, Clock, ArrowRight, X, Star, Send } from 'lucide-react';
import { cn } from '../../lib/utils';

const MY_OBSERVATIONS = [
  { id: 'o1', type: 'Lab Safety', teacher: 'Mr. Mensah', comment: 'Exhibited high safety protocol compliance.', date: 'Nov 14, 2025' },
  { id: 'o2', type: 'Collaboration', teacher: 'Dr. Boateng', comment: 'Led the workshop group effectively.', date: 'Jan 22, 2026' },
  { id: 'o3', type: 'Behavioral', teacher: 'Mrs. Owusu', comment: 'Consistent punctuality this term.', date: 'Mar 05, 2026' },
];

const TICKETS = [
  { id: 't1', subject: 'Missing Section B entry for General Agric', status: 'IN_PROGRESS', priority: 'HIGH', date: '2026-05-12' },
  { id: 't2', subject: 'Request transcript for WASSCE application', status: 'OPEN', priority: 'MEDIUM', date: '2026-05-15' },
  { id: 't3', subject: 'Query biology lab score discrepancy', status: 'RESOLVED', priority: 'LOW', date: '2026-04-28' },
];

const STATUS_STYLES = {
  OPEN: 'bg-gray-50 text-gray-600 border-gray-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-100',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

export function StudentSupport() {
  const [activeCategory, setActiveCategory] = React.useState('Academic');
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-4 sm:p-6 md:p-8 lg:p-12 pb-24">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Module Header Area */}
        <header className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase italic">
            ICT Support Centre
          </h1>
          <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 block leading-normal whitespace-normal">
            Raise tickets • track requests • view resolution history
          </p>
        </header>

        {/* Observation Archive Feed */}
        <section className="bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2.5">
            <Star className="text-gray-900 shrink-0" size={18} />
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest">
              Observation Feed
            </h2>
          </div>
          
          <div className="p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
            {MY_OBSERVATIONS.map((obs, i) => (
              <motion.div
                key={obs.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 sm:p-5 bg-gray-50 rounded-xl sm:rounded-2xl border-l-4 border-emerald-500 border-t border-r border-b border-gray-100"
              >
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="text-[9px] sm:text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded uppercase tracking-wider">
                    {obs.type}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 italic">
                    {obs.date}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-700 italic leading-relaxed">
                  "{obs.comment}"
                </p>
                <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wider mt-2.5 block">
                  Observed by {obs.teacher}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* New Ticket Form Generation Module */}
        <section className="bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2.5">
            <QrCode className="text-gray-900 shrink-0" size={18} />
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest">
              Raise New Ticket
            </h2>
          </div>
          
          <div className="p-4 sm:p-6 md:p-8 space-y-4">
            <input 
              type="text" 
              placeholder="Ticket title..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full px-4 sm:px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black text-gray-900 placeholder-gray-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all" 
            />
            
            <textarea 
              placeholder="Describe your issue in detail..." 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              rows={4} 
              className="w-full px-4 sm:px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/10 resize-none transition-all" 
            />
            
            {/* Action and Filter Control Docking Zone */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-gray-50">
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">
                  Category Classification
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {['Academic', 'Technical', 'Finance', 'General'].map(t => {
                    const isSelected = activeCategory === t;
                    return (
                      <button 
                        key={t} 
                        type="button"
                        onClick={() => setActiveCategory(t)}
                        className={cn(
                          "px-3 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all cursor-pointer select-none border",
                          isSelected 
                            ? "bg-gray-900 text-white border-gray-900 shadow-sm" 
                            : "bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200"
                        )}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <button className="w-full sm:w-auto px-5 py-3 bg-emerald-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-950 transition-all active:scale-[0.98] select-none cursor-pointer flex items-center justify-center gap-2 shadow-md shrink-0">
                <Send size={13} /> Submit Ticket
              </button>
            </div>
          </div>
        </section>

        {/* Existing Logged Tickets Archive */}
        <section className="bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2.5">
            <Clock className="text-gray-900 shrink-0" size={18} />
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest">
              My Tickets
            </h2>
          </div>
          
          <div className="p-2 sm:p-4 divide-y divide-gray-100">
            {TICKETS.map((t) => (
              <div 
                key={t.id} 
                className="flex flex-col xs:flex-row xs:items-center justify-between p-3.5 gap-3 rounded-xl hover:bg-gray-50/80 transition-all min-w-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate leading-snug">
                    {t.subject}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                    {t.date}
                  </p>
                </div>
                
                <div className="self-start xs:self-center shrink-0">
                  <span className={cn(
                    "text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-widest border block text-center min-w-[90px]", 
                    STATUS_STYLES[t.status]
                  )}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}