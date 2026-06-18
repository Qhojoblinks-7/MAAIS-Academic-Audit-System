import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, QrCode, CheckCircle2, Clock, ArrowRight, X, Star, Send } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { studentApi } from '../../services/api/studentApi';
import { useStudentStore } from '../../stores/useStudentStore';
import { useStudentBehavior, useStudentTickets } from '../../hooks/api/useStudentApi';

const STATUS_STYLES = {
  OPEN: 'bg-background text-text-secondary border-border',
  IN_PROGRESS: 'bg-warning/10 text-warning border-warning/20',
  RESOLVED: 'bg-success/10 text-success border-success/20',
};

export function StudentSupport() {
   const { user } = useRole();
   const store = useStudentStore();
   const { behavior, loading: behaviorLoading } = useStudentBehavior(user?.profileId || user?.id || null);
   const { tickets, loading: ticketsLoading, refetch } = useStudentTickets();

  const observations = behavior?.logs || [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(store.supportTitle || '');
  const [message, setMessage] = useState(store.supportMessage || '');
  const [activeCategory, setActiveCategory] = useState(store.supportCategory || 'General');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim() || !user?.id) return;
    setIsSubmitting(true);
    try {
      await studentApi.createTicket({
        title: title.trim(),
        description: message.trim(),
        category: activeCategory,
        priority: store.supportPriority,
      });
      store.resetSupportForm();
      setTitle('');
      setMessage('');
      setActiveCategory('General');
      await refetch();
    } catch (error) {
      console.error('Failed to submit ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

   return (
     <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 md:p-8 lg:p-12 pb-24 no-scrollbar">
       <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 no-scrollbar">
          
          {/* Module Header Area */}
          <header className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight uppercase italic">
              ICT Support Centre
            </h1>
            <p className="text-[9px] sm:text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1 block leading-normal whitespace-normal">
              Raise tickets • track requests • view resolution history
            </p>
          </header>

          {/* Observation Archive Feed */}
          <section className="bg-surface rounded-2xl sm:rounded-[2rem] border border-border shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-border bg-background/50 flex items-center gap-2.5">
              <Star className="text-text-primary shrink-0" size={18} />
              <h2 className="text-xs font-black text-text-primary uppercase tracking-widest">
                Observation Feed
              </h2>
            </div>
            
<div className="p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
              {observations.length > 0 ? (
                observations.map((obs, i) => (
                  <motion.div
                    key={obs.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 sm:p-5 bg-background rounded-xl sm:rounded-2xl border-l-4 border-success border-t border-r border-b border-border"
                  >
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-[9px] sm:text-[10px] font-black text-success bg-success/10 px-2.5 py-0.5 rounded uppercase tracking-wider">
                        {obs.trait || 'Observation'}
                      </span>
                      <span className="text-[9px] font-bold text-text-secondary italic">
                        {obs.createdAt ? new Date(obs.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-text-primary italic leading-relaxed">
                      "{obs.remarks || obs.comment || ''}"
                    </p>
                    <p className="text-[9px] sm:text-[10px] font-black text-text-secondary uppercase tracking-wider mt-2.5 block">
                      Observed by {obs.recordedBy?.firstName ? `${obs.recordedBy.firstName} ${obs.recordedBy.lastName}` : 'Teacher'}
                    </p>
                  </motion.div>
                ))
              ) : (
                <p className="text-text-secondary text-xs">No observations recorded yet.</p>
              )}
            </div>
          </section>

          {/* New Ticket Form Generation Module */}
          <section className="bg-surface rounded-2xl sm:rounded-[2rem] border border-border shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-border bg-background/50 flex items-center gap-2.5">
              <QrCode className="text-text-primary shrink-0" size={18} />
              <h2 className="text-xs font-black text-text-primary uppercase tracking-widest">
                Raise New Ticket
              </h2>
            </div>
            
            <div className="p-4 sm:p-6 md:p-8 space-y-4">
              <input 
                type="text" 
                placeholder="Ticket title..." 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full px-4 sm:px-5 py-3 bg-background border border-border rounded-xl text-sm font-black text-text-primary placeholder-text-secondary focus:outline-none focus:bg-surface focus:ring-2 focus:ring-success/10 transition-all" 
              />
              
              <textarea 
                placeholder="Describe your issue in detail..." 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                rows={4} 
                className="w-full px-4 sm:px-5 py-3 bg-background border border-border rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:bg-surface focus:ring-2 focus:ring-success/10 resize-none transition-all" 
              />
              
              {/* Action and Filter Control Docking Zone */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-text-secondary uppercase tracking-wider block">
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
                              ? "bg-brand-dark text-surface border-brand-dark shadow-sm" 
                              : "bg-background text-text-secondary border-transparent hover:bg-border"
                          )}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <button className="w-full sm:w-auto px-5 py-3 bg-brand-primary text-surface rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-secondary transition-all active:scale-[0.98] select-none cursor-pointer flex items-center justify-center gap-2 shadow-md shrink-0">
                  <Send size={13} /> Submit Ticket
                </button>
              </div>
            </div>
          </section>

          {/* Existing Logged Tickets Archive */}
          <section className="bg-surface rounded-2xl sm:rounded-[2rem] border border-border shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-border bg-background/50 flex items-center gap-2.5">
              <Clock className="text-text-primary shrink-0" size={18} />
              <h2 className="text-xs font-black text-text-primary uppercase tracking-widest">
                My Tickets
              </h2>
            </div>
            
<div className="p-2 sm:p-4 divide-y divide-border">
              {tickets.length > 0 ? (
                tickets.map((t) => (
                  <div 
                    key={t.id} 
                    className="flex flex-col xs:flex-row xs:items-center justify-between p-3.5 gap-3 rounded-xl hover:bg-background/80 transition-all min-w-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-black text-text-primary truncate leading-snug">
                        {t.title || t.subject}
                      </p>
                      <p className="text-[10px] font-bold text-text-secondary mt-0.5">
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : t.date}
                      </p>
                    </div>
                    
                    <div className="self-start xs:self-center shrink-0">
                      <span className={cn(
                        "text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-widest border block text-center min-w-[90px]", 
                        STATUS_STYLES[t.status] || STATUS_STYLES.OPEN
                      )}>
                        {t.status?.replace('_', ' ') || 'OPEN'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-text-secondary text-xs p-4">No tickets found.</p>
              )}
            </div>
          </section>

        </div>
</div>
    );
  }

export default StudentSupport;