import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';

const DAY_SCHEDULES = [
  { day: 'Monday', items: [
    { time: '7:45 AM', subject: 'Core Mathematics', room: 'Room A1', type: 'CLASS' },
    { time: '8:45 AM', subject: 'English Language', room: 'Room A1', type: 'CLASS' },
    { time: '9:45 AM', subject: 'General Science', room: 'Lab 1', type: 'LAB' },
    { time: '10:30 AM', subject: 'Break', room: '-', type: 'BREAK' },
    { time: '11:00 AM', subject: 'Social Studies', room: 'Room A1', type: 'CLASS' },
    { time: '12:00 PM', subject: 'Elective Physics', room: 'Lab 2', type: 'LAB' },
    { time: '1:00 PM', subject: 'Lunch', room: '-', type: 'BREAK' },
    { time: '2:00 PM', subject: 'Sports & Culture', room: 'Field', type: 'SPORTS' },
  ]},
  { day: 'Tuesday', items: [
    { time: '7:45 AM', subject: 'Economics', room: 'Room B3', type: 'CLASS' },
    { time: '8:45 AM', subject: 'Elective Geography', room: 'Room B3', type: 'CLASS' },
    { time: '9:45 AM', subject: 'ICT', room: 'Comp Lab', type: 'LAB' },
    { time: '10:30 AM', subject: 'Break', room: '-', type: 'BREAK' },
    { time: '11:00 AM', subject: 'RME', room: 'Hall A', type: 'CLASS' },
    { time: '12:00 PM', subject: 'Art & Culture', room: 'Art Studio', type: 'CLASS' },
    { time: '1:00 PM', subject: 'Lunch', room: '-', type: 'BREAK' },
    { time: '2:00 PM', subject: 'Home Study', room: 'Room B3', type: 'STUDY' },
  ]},
  { day: 'Wednesday', items: [
    { time: '7:45 AM', subject: 'Core Mathematics', room: 'Room B3', type: 'CLASS' },
    { time: '8:45 AM', subject: 'English Language', room: 'Room A1', type: 'CLASS' },
    { time: '9:45 AM', subject: 'Chemistry', room: 'Lab 1', type: 'LAB' },
    { time: '10:30 AM', subject: 'Break', room: '-', type: 'BREAK' },
    { time: '11:00 AM', subject: 'Elective Physics', room: 'Lab 2', type: 'LAB' },
    { time: '12:00 PM', subject: 'Social Studies', room: 'Room B3', type: 'CLASS' },
    { time: '1:00 PM', subject: 'Lunch', room: '-', type: 'BREAK' },
    { time: '2:00 PM', subject: 'Computing', room: 'Comp Lab', type: 'LAB' },
  ]},
  { day: 'Thursday', items: [
    { time: '7:45 AM', subject: 'Physics', room: 'Lab 3', type: 'LAB' },
    { time: '8:45 AM', subject: 'Biology', room: 'Lab 2', type: 'LAB' },
    { time: '9:45 AM', subject: 'English Language', room: 'Room A1', type: 'CLASS' },
    { time: '10:30 AM', subject: 'Break', room: '-', type: 'BREAK' },
    { time: '11:00 AM', subject: 'Elective Eco', room: 'Room B3', type: 'CLASS' },
    { time: '12:00 PM', subject: 'Music / Art', room: 'Studio', type: 'CLASS' },
    { time: '1:00 PM', subject: 'Lunch', room: '-', type: 'BREAK' },
    { time: '2:00 PM', subject: 'Tutorial', room: 'Room B3', type: 'STUDY' },
  ]},
  { day: 'Friday', items: [
    { time: '7:45 AM', subject: 'General Science', room: 'Lab 1', type: 'LAB' },
    { time: '8:45 AM', subject: 'English Language', room: 'Hall A', type: 'CLASS' },
    { time: '9:45 AM', subject: 'Sociology', room: 'Room B3', type: 'CLASS' },
    { time: '10:30 AM', subject: 'Break', room: '-', type: 'BREAK' },
    { time: '11:00 AM', subject: 'Assembly', room: 'Hall B', type: 'ASSEMBLY' },
    { time: '12:00 PM', subject: 'Social Studies', room: 'Room B3', type: 'CLASS' },
    { time: '1:00 PM', subject: 'Lunch', room: '-', type: 'BREAK' },
    { time: '2:00 PM', subject: 'Career Planning', room: 'Room B3', type: 'CLASS' },
  ]},
];

const DAY_TYPE_STYLES = {
  CLASS: 'bg-blue-50 border-blue-200/60 text-blue-900',
  LAB: 'bg-purple-50 border-purple-200/60 text-purple-900',
  BREAK: 'bg-gray-50 border-gray-200/60 text-gray-500',
  SPORTS: 'bg-emerald-50 border-emerald-200/60 text-emerald-800',
  STUDY: 'bg-slate-50 border-slate-200 text-slate-600',
  ASSEMBLY: 'bg-amber-50 border-amber-200/60 text-amber-800',
};

export function StudentTimetable() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-4 sm:p-6 md:p-8 lg:p-12 pb-24">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Module Title Area */}
        <header className="flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gray-900 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-gray-900/10">
            <Calendar size={24} className="sm:hidden" />
            <Calendar size={28} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase italic">
              My Timetable
            </h1>
            <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5 truncate">
              Weekly class &amp; lab schedule
            </p>
          </div>
        </header>

        {/* Schedule List */}
        <div className="space-y-4 sm:space-y-6">
          {DAY_SCHEDULES.map(({ day, items }, dIdx) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dIdx * 0.04 }}
              className="bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Day Section Header */}
              <div className="bg-gray-50/50 px-4 sm:px-6 py-3.5 border-b border-gray-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400 shrink-0" />
                  <span className="text-sm font-black text-gray-900 uppercase tracking-wide italic">
                    {day}
                  </span>
                </div>
                <span className="text-[9px] font-black text-gray-400 bg-white border border-gray-200/60 px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                  {items.filter(i => i.type !== 'BREAK' && i.type !== 'ASSEMBLY').length} Sessions
                </span>
              </div>

              {/* Day Card Timings Rows */}
              <div className="divide-y divide-gray-50">
                {items.map((item, idx) => {
                  const isBreak = item.type === 'BREAK';
                  
                  if (isBreak) {
                    return (
                      <div 
                        key={idx} 
                        className="flex flex-col xs:flex-row xs:items-center gap-1.5 xs:gap-4 px-4 sm:px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50/30 min-w-0"
                      >
                        <span className="font-mono text-gray-400 shrink-0">{item.time}</span>
                        <span className="text-gray-500 truncate">{item.subject}</span>
                        {item.room !== '-' && <span className="text-gray-400 font-normal normal-case truncate xs:ml-auto">@{item.room}</span>}
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={idx} 
                      className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-gray-50/30 transition-all min-w-0"
                    >
                      {/* Period Clock Component Block */}
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono shrink-0 sm:min-w-[75px]">
                        {item.time}
                      </div>
                      
                      {/* Data Meta Wrapper Capsule */}
                      <div className={cn(
                        "flex-1 px-4 py-3 rounded-xl border flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 min-w-0", 
                        DAY_TYPE_STYLES[item.type] || DAY_TYPE_STYLES.CLASS
                      )}>
                        <div className="min-w-0">
                          <p className="text-[13px] font-black tracking-tight text-inherit truncate leading-snug">
                            {item.subject}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-inherit opacity-75 min-w-0">
                            <MapPin size={11} className="shrink-0" />
                            <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                              {item.room}
                            </span>
                          </div>
                        </div>
                        
                        <div className="shrink-0 self-start xs:self-center">
                          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/60 border border-current/10 rounded-md">
                            {item.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}