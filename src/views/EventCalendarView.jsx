import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock,
  MapPin, Users, BookOpen, AlertCircle, Bell, GraduationCap,
} from 'lucide-react';
import { cn } from '../lib/utils';

const EVENTS = [
  { id: '1', title: 'Term 2 Resumption', date: '2026-05-10', type: 'ACADEMIC', allDay: true },
  { id: '2', title: 'Mid-Term Exams', date: '2026-06-15', type: 'EXAM', allDay: true, end: '2026-06-20' },
  { id: '3', title: 'Sports Gala', date: '2026-06-28', type: 'EVENT', startTime: '08:00', endTime: '16:00', venue: 'Sports Field' },
  { id: '4', title: 'Parent-Teacher Conference', date: '2026-07-03', type: 'MEETING', startTime: '09:00', endTime: '15:00', venue: 'Hall A' },
  { id: '5', title: 'End of Term 2', date: '2026-07-24', type: 'ACADEMIC', allDay: true },
  { id: '6', title: 'Industrial Attachment', date: '2026-08-10', type: 'CAREER', allDay: true, end: '2026-08-21' },
];

const typeColors = {
  ACADEMIC: 'bg-blue-50 border-blue-200 text-blue-700',
  EXAM: 'bg-rose-50 border-rose-200 text-rose-700',
  EVENT: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  MEETING: 'bg-purple-50 border-purple-200 text-purple-700',
  CAREER: 'bg-amber-50 border-amber-200 text-amber-700',
};

function CalendarGrid() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = today.getDate();

  const blanks = Array.from({ length: firstDay }, (_, i) => React.createElement('div', { key: `blank-${i}` }));
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const isToday = day === todayDate;
    const hasEvent = EVENTS.some(e => new Date(e.date).getDate() === day);
    return React.createElement('div', { key: day, className: cn("aspect-square flex items-center justify-center text-sm font-black rounded-xl transition-all relative", isToday ? "bg-emerald-900 text-white" : "text-gray-700 hover:bg-gray-100") },
      day,
      hasEvent && React.createElement('div', { className: cn("absolute bottom-1 w-1 h-1 rounded-full", isToday ? "bg-white" : "bg-emerald-500") })
    );
  });

  return React.createElement('div', { className: "grid grid-cols-7 gap-2" },
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => React.createElement('div', { key: d, className: "text-center text-[9px] font-black text-gray-400 uppercase tracking-widest py-2" }, d)),
    ...(blanks || []),
    ...(dayCells || [])
  );
}

export function EventCalendarView() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const upcoming = EVENTS.slice(0, 4);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-2">Academic Calendar</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Term structure · event deadline · schedule overview</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-gray-900 italic font-display">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400"><ChevronLeft size={18} /></button>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400"><ChevronRight size={18} /></button>
              </div>
            </div>
            <CalendarGrid />
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <CalendarIcon className="text-gray-900" size={20} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Upcoming</h2>
            </div>
            <div className="space-y-3">
              {upcoming.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn("text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest", typeColors[event.type])}>{event.type}</span>
                  </div>
                  <h4 className="text-sm font-black text-gray-900 mb-1">{event.title}</h4>
                  <p className="text-[10px] font-bold text-gray-400">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {event.startTime && ` · ${event.startTime}`}
                    {event.venue && ` · ${event.venue}`}
                  </p>
                </motion.div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">
              View Full Calendar
            </button>
          </div>
        </div>

        {/* Event List */}
        <div className="mt-8 bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="text-gray-900" size={18} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">All Scheduled Events</h2>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-lg">
              <Plus size={14} /> New Event
            </button>
          </div>
          <div className="grid gap-3">
            {EVENTS.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-[10px] font-black text-gray-700 text-center leading-tight">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{event.title}</p>
                    <p className="text-[10px] font-bold text-gray-400">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      {event.startTime && ` · ${event.startTime} - ${event.endTime}`}
                      {event.venue && ` · ${event.venue}`}
                    </p>
                  </div>
                </div>
                <span className={cn("text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest", typeColors[event.type])}>{event.type}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
