import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  ChevronRight as ArrowRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const EVENTS = [
  { id: '1', title: 'Term 2 Resumption', date: '2026-05-10', type: 'ACADEMIC', allDay: true },
  { id: '2', title: 'Mid-Term Exams', date: '2026-06-15', type: 'EXAM', allDay: true, end: '2026-06-20' },
  { id: '3', title: 'Sports Gala', date: '2026-06-28', type: 'EVENT', startTime: '08:00', endTime: '16:00', venue: 'Sports Field' },
  { id: '4', title: 'Parent-Teacher Conference', date: '2026-07-03', type: 'MEETING', startTime: '09:00', endTime: '15:00', venue: 'Hall A' },
  { id: '5', title: 'End of Term 2', date: '2026-07-24', type: 'ACADEMIC', allDay: true },
  { id: '6', title: 'Industrial Attachment', date: '2026-08-10', type: 'CAREER', allDay: true, end: '2026-08-21' },
];

const typeColors = {
  ACADEMIC: 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary',
  EXAM: 'bg-destructive/10 border-destructive/20 text-destructive',
  EVENT: 'bg-success/10 border-success/20 text-success',
  MEETING: 'bg-brand-secondary/10 border-brand-secondary/20 text-brand-secondary',
  CAREER: 'bg-warning/10 border-warning/20 text-warning',
};

export function EventCalendarView() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const targetYear = currentMonth.getFullYear();
  const targetMonth = currentMonth.getMonth();

  // Calendar Grid Calculation Calculations
  const firstDayOfWeek = new Date(targetYear, targetMonth, 1).getDay();
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(targetYear, targetMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(targetYear, targetMonth + 1, 1));
  };

  const upcoming = EVENTS.slice(0, 4);

  return (
    <div className="flex-1 overflow-y-auto bg-background p-8 lg:p-12 scrollbar-hide">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-black text-text-primary tracking-tighter font-display italic mb-2">
            Academic Calendar
          </h1>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
            Term structure • event deadline • schedule overview
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Interactive Grid Card */}
          <div className="lg:col-span-2 bg-surface rounded-[2.5rem] border border-border p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-text-primary italic font-display">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrevMonth} 
                  className="p-2 hover:bg-muted rounded-xl transition-all text-text-secondary"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={handleNextMonth} 
                  className="p-2 hover:bg-muted rounded-xl transition-all text-text-secondary"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Rendered Grid */}
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-center text-[9px] font-black text-text-secondary uppercase tracking-widest py-2">
                  {d}
                </div>
              ))}
              
              {/* Padding Blocks */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}

              {/* Day Cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = 
                  day === today.getDate() && 
                  targetMonth === today.getMonth() && 
                  targetYear === today.getFullYear();
                
                const hasEvent = EVENTS.some((event) => {
                  const eventDate = new Date(event.date);
                  return (
                    eventDate.getDate() === day &&
                    eventDate.getMonth() === targetMonth &&
                    eventDate.getFullYear() === targetYear
                  );
                });

                return (
                  <div
                    key={day}
                    className={cn(
                      "aspect-square flex items-center justify-center text-sm font-black rounded-xl transition-all relative cursor-pointer",
                      isToday 
                        ? "bg-brand-primary text-primary-foreground" 
                        : "text-text-primary hover:bg-muted"
                    )}
                  >
                    {day}
                    {hasEvent && (
                      <div 
                        className={cn(
                          "absolute bottom-1 w-1 h-1 rounded-full", 
                          isToday ? "bg-surface" : "bg-brand-primary"
                        )} 
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Snapshot Container */}
          <div className="bg-surface rounded-[2.5rem] border border-border p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <CalendarIcon className="text-text-primary" size={20} />
              <h2 className="text-[11px] font-black text-text-primary uppercase tracking-widest">Upcoming</h2>
            </div>
            
            <div className="space-y-3">
              {upcoming.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-2xl border border-border hover:bg-muted transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn("text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest", typeColors[event.type])}>
                      {event.type}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-text-primary mb-1">{event.title}</h4>
                  <p className="text-[10px] font-bold text-text-secondary">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {event.startTime && ` • ${event.startTime}`}
                    {event.venue && ` • ${event.venue}`}
                  </p>
                </motion.div>
              ))}
            </div>
            
            <button className="w-full mt-6 py-3 bg-brand-primary/10 border border-brand-primary text-brand-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/20 transition-all">
              View Full Calendar
            </button>
          </div>
        </div>

        {/* Global Master Agenda List */}
        <div className="mt-8 bg-surface rounded-[2.5rem] border border-border p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="text-text-primary" size={18} />
              <h2 className="text-[11px] font-black text-text-primary uppercase tracking-widest">All Scheduled Events</h2>
            </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-dark transition-all shadow-lg">
              <Plus size={14} /> New Event
            </button>
          </div>
          
          <div className="grid gap-3">
            {EVENTS.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-[10px] font-black text-text-primary text-center leading-tight">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div>
                    <p className="text-sm font-black text-text-primary">{event.title}</p>
                    <p className="text-[10px] font-bold text-text-secondary">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      {event.startTime && ` • ${event.startTime} - ${event.endTime}`}
                      {event.venue && ` • ${event.venue}`}
                    </p>
                  </div>
                </div>
                <span className={cn("text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest", typeColors[event.type])}>
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}