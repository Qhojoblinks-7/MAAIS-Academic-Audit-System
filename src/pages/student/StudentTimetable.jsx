import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, GraduationCap, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

const studentTimetable = [
  { id: 't1', day: 'Monday', periods: [
    { time: '07:45', subject: 'Core Mathematics', venue: 'Room A1', type: 'CLASS' },
    { time: '08:45', subject: 'English Language', venue: 'Room A1', type: 'CLASS' },
    { time: '09:45', subject: 'General Knowledge', venue: 'Hall B', type: 'CLASS' },
    { time: '10:30', subject: 'Break', venue: '-', type: 'BREAK' },
    { time: '11:00', subject: 'Social Studies', venue: 'Room A1', type: 'CLASS' },
    { time: '12:00', subject: 'ICT', venue: 'Comp Lab', type: 'LAB' },
    { time: '13:00', subject: 'Lunch', venue: '-', type: 'BREAK' },
    { time: '14:00', subject: 'Sports Culture', venue: 'Field', type: 'SPORTS' },
  ]},
];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const daySchedule = [
  { day: 'Monday', items: [
    { time: '7:45 AM', subject: 'Core Mathematics', room: 'Room A1', teacher: null, type: 'CLASS' },
    { time: '8:45 AM', subject: 'English Language', room: 'Room A1', teacher: null, type: 'CLASS' },
    { time: '9:45 AM', subject: 'General Science', room: 'Lab 1', teacher: null, type: 'LAB' },
    { time: '10:30 AM', subject: 'Break', room: '-', teacher: null, type: 'BREAK' },
    { time: '11:00 AM', subject: 'Social Studies', room: 'Room A1', teacher: null, type: 'CLASS' },
    { time: '12:00 PM', subject: 'Elective Physics', room: 'Lab 2', teacher: null, type: 'LAB' },
    { time: '1:00 PM', subject: 'Lunch', room: '-', teacher: null, type: 'BREAK' },
    { time: '2:00 PM', subject: 'Sports & Culture', room: 'Field', teacher: null, type: 'SPORTS' },
  ]},
  { day: 'Tuesday', items: [
    { time: '7:45 AM', subject: 'Economics', room: 'Room B3', teacher: null, type: 'CLASS' },
    { time: '8:45 AM', subject: 'Elective Geography', room: 'Room B3', teacher: null, type: 'CLASS' },
    { time: '9:45 AM', subject: 'ICT', room: 'Comp Lab', teacher: null, type: 'LAB' },
    { time: '10:30 AM', subject: 'Break', room: '-', teacher: null, type: 'BREAK' },
    { time: '11:00 AM', subject: 'RME', room: 'Hall A', teacher: null, type: 'CLASS' },
    { time: '12:00 PM', subject: 'Art &amp; Culture', room: 'Art Studio', teacher: null, type: 'CLASS' },
    { time: '1:00 PM', subject: 'Lunch', room: '-', teacher: null, type: 'BREAK' },
    { time: '2:00 PM', subject: 'Home Study', room: 'Room B3', teacher: null, type: 'STUDY' },
  ]},
  { day: 'Wednesday', items: [
    { time: '7:45 AM', subject: 'Core Mathematics', room: 'Room B3', teacher: null, type: 'CLASS' },
    { time: '8:45 AM', subject: 'English Language', room: 'Room A1', teacher: null, type: 'CLASS' },
    { time: '9:45 AM', subject: 'Chemistry', room: 'Lab 1', teacher: null, type: 'LAB' },
    { time: '10:30 AM', subject: 'Break', room: '-', teacher: null, type: 'BREAK' },
    { time: '11:00 AM', subject: 'Elective Physics', room: 'Lab 2', teacher: null, type: 'LAB' },
    { time: '12:00 PM', subject: 'Social Studies', room: 'Room B3', teacher: null, type: 'CLASS' },
    { time: '1:00 PM', subject: 'Lunch', room: '-', teacher: null, type: 'BREAK' },
    { time: '2:00 PM', subject: 'Computing', room: 'Comp Lab', teacher: null, type: 'LAB' },
  ]},
  { day: 'Thursday', items: [
    { time: '7:45 AM', subject: 'Physics', room: 'Lab 3', teacher: null, type: 'LAB' },
    { time: '8:45 AM', subject: 'Biology', room: 'Lab 2', teacher: null, type: 'LAB' },
    { time: '9:45 AM', subject: 'English Language', room: 'Room A1', teacher: null, type: 'CLASS' },
    { time: '10:30 AM', subject: 'Break', room: '-', teacher: null, type: 'BREAK' },
    { time: '11:00 AM', subject: 'Elective Eco', room: 'Room B3', teacher: null, type: 'CLASS' },
    { time: '12:00 PM', subject: 'Music / Art', room: 'Studio', teacher: null, type: 'CLASS' },
    { time: '1:00 PM', subject: 'Lunch', room: '-', teacher: null, type: 'BREAK' },
    { time: '2:00 PM', subject: 'Tutorial', room: 'Room B3', teacher: null, type: 'STUDY' },
  ]},
  { day: 'Friday', items: [
    { time: '7:45 AM', subject: 'General Science', room: 'Lab 1', teacher: null, type: 'LAB' },
    { time: '8:45 AM', subject: 'English Language', room: 'Hall A', teacher: null, type: 'CLASS' },
    { time: '9:45 AM', subject: 'Sociology', room: 'Room B3', teacher: null, type: 'CLASS' },
    { time: '10:30 AM', subject: 'Break', room: '-', teacher: null, type: 'BREAK' },
    { time: '11:00 AM', subject: 'Assembly', room: 'Hall B', teacher: null, type: 'ASSEMBLY' },
    { time: '12:00 PM', subject: 'Social Studies', room: 'Room B3', teacher: null, type: 'CLASS' },
    { time: '1:00 PM', subject: 'Lunch', room: '-', teacher: null, type: 'BREAK' },
    { time: '2:00 PM', subject: 'Career Planning', room: 'Room B3', teacher: null, type: 'CLASS' },
  ]},
];

const dayTypeStyles = {
  CLASS: 'bg-blue-50 border-blue-200/60 text-blue-900',
  LAB: 'bg-purple-50 border-purple-200/60 text-purple-900',
  BREAK: 'bg-gray-50 border-gray-200 text-gray-500',
  SPORTS: 'bg-emerald-50 border-emerald-200/60 text-emerald-800',
  STUDY: 'bg-slate-50 border-slate-200 text-slate-600',
  ASSEMBLY: 'bg-amber-50 border-amber-200/60 text-amber-800',
};

export function StudentTimetable() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Calendar size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-1">My Timetable</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weekly class &amp; lab schedule</p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {daySchedule.map(({ day, items }, dIdx) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dIdx * 0.08 }}
              className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="bg-[#F9F9F7] px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-[13px] font-black text-gray-900 italic font-display">{day}</span>
                </div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{items.filter(i => i.type !== 'BREAK' && i.type !== 'ASSEMBLY').length} sessions</span>
              </div>
              <div className="divide-y divide-gray-50">
{items.map((item, idx) => {
  if (item.type === 'BREAK') return (
    <div key={idx} className="flex items-center gap-4 px-6 py-3 text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50/30">
      <span>{item.time}</span>
      <span className="flex-1">{item.subject}</span>
      <span className="italic">{item.room}</span>
    </div>
  );
  return (
    <div key={idx} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-all">
      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest min-w-[70px] font-mono pt-1">
        {item.time}
      </div>
      <div className={cn("flex-1 px-4 py-2.5 rounded-xl border border", dayTypeStyles[item.type] || dayTypeStyles.CLASS)}>
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-black text-inherit">{item.subject}</p>
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{item.type}</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[9px] font-bold text-inherit opacity-60 uppercase tracking-widest">{item.room}</span>
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

