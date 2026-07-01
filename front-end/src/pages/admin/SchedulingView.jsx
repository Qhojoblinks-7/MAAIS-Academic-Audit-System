import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Grid3X3, ChevronRight, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { MasterTimetable } from './MasterTimetable';
import { EventCalendarView } from './EventCalendarView';

export const SchedulingView = () => {
  const [activeTab, setActiveTab] = useState('Timetable');

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-50 overflow-hidden antialiased">
      
      {/* Header Controls - Re-engineered for small laptops & tablets */}
      <header className="px-4 md:px-6 pt-4 md:pt-6 pb-3 bg-white border-b border-slate-100 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          
          {/* Typography Stack */}
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black italic font-display text-slate-900 tracking-tight leading-none">
              The Heartbeat Control
            </h1>
            
            <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-1.5 md:mt-2">
              Conflict-Free Timetables & Global Term Planning
            </p>
          </div>

          {/* Core Tab Navigation Switcher - Optimized padding limits tracking bloating */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-inner select-none w-full md:w-auto self-stretch md:self-auto justify-center">
            {[
{ id: 'Timetable', label: 'Master Timetable', icon: Clock },
{ id: 'Calendar', label: 'Event Planner', icon: CalendarIcon },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center justify-center gap-2 flex-1 md:flex-none px-4 lg:px-6 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider md:tracking-widest transition-all duration-150 whitespace-nowrap",
                    activeTab === tab.id 
                      ? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/50" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Icon size={12} className="shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Dynamic Content Pipeline Area */}
      <div className="flex-1 relative overflow-hidden bg-slate-50">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="w-full h-full flex flex-col"
          >
            {activeTab === 'Timetable' ? <MasterTimetable /> : <EventCalendarView />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Status Stream Footer Monitor */}
      <footer className="px-6 py-2.5 bg-slate-900 shrink-0 hidden xl:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
           <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                 <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Real-time Conflict Analysis Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                 <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Double Track (Gold) Context</span>
              </div>
           </div>
           <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Institutional Intelligence v2.0</p>
        </div>
      </footer>
    </div>
  );
};