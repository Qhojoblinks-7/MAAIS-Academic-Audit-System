import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, MoreHorizontal, Trash2, Edit3,
  Plus, BookOpen, GraduationCap, Users, Target, Search,
  Clock as ClockIcon, CheckCircle2, AlertCircle, Bell,
  RotateCcw, Archive, Database, Eye, Zap, FileText,
  Download, Eye as EyeIcon, Lock, LockIcon, Menu, Phone,
  Upload, Play, Shuffle, MapPin, ArrowRight, X, Check,
} from 'lucide-react';
import { cn } from '../lib/utils';

const teacherClasses = Array.from({ length: 8 }, (_, i) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = Array.from({ length: 8 }, (_, pIdx) => {
    const baseSubj = ['Mathematics', 'English', 'Integrated Science', 'Social Studies', 'Core Math', 'French', 'Ghanaian Lang', 'General Knowledge'][pIdx];
    if (pIdx === 3) return { id: `p${pIdx}`, subject: 'Break', class: '-', venue: '-', type: 'FREE' };
    const isSub = Math.random() > 0.85;
    return {
      id: `p${pIdx}`,
      subject: isSub ? `[SUB] ${['Mrs. Boatemaa', 'Mr. Hackman', 'Ms. Adu'][i % 3]}` : baseSubj,
      class: `SHS ${1 + i % 3} ${['Agric', 'Science', 'Arts'][i % 3]}`,
      venue: `Room ${String.fromCharCode(65 + ((i + pIdx) % 6))}`,
      type: isSub ? 'SUBSTITUTION' : 'REGULAR',
    };
  });
  return { day: days[i] || 'Monday', periods };
});

export function MasterTimetable() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = React.useState('grid');
  const [selectedTeacher, setSelectedTeacher] = React.useState('All Teachers');

  const teachers = ['All Teachers', 'Anthony Hackman', 'Rita Owusu', 'Martha Baah', 'Marshal Eshun'];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-full">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
              <Menu size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-1">Master Timetable Grid</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Teacher clash detection &amp; substitution squad</p>
            </div>
          </div>
          <div className="flex gap-3">
            <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest focus:outline-none">
              {teachers.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-lg">
              <Upload size={16} /> Import
            </button>
          </div>
        </header>

        <div className="flex gap-3 mb-8">
          {['grid', 'teacher', 'heatmap'].map((tab) => (
            <button key={tab} onClick={() => setActiveView(tab)} className={cn("px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeView === tab ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50")}>
              {tab === 'grid' ? 'Grid View' : tab === 'teacher' ? 'Teacher View' : 'Heatmap'}
            </button>
          ))}
        </div>

        {/* Alert Bar */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-center gap-4">
          <AlertCircle size={20} className="text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-[11px] font-black text-amber-900 mb-0.5 uppercase tracking-widest">Squad Alert</p>
            <p className="text-xs font-medium text-amber-800">1 collision detected between Mr. Mensah and Mr. Mireku at Tues P3 (Room B3). Resolve manually.</p>
          </div>
          <button className="p-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-all text-xs font-black uppercase tracking-widest whitespace-nowrap">Fix</button>
        </div>

        {/* Timetable */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-4 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-100 min-w-[80px]">Period</th>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => (
                  <th key={d} className="px-2 py-4 text-[10px] font-black text-gray-900 uppercase tracking-widest text-center whitespace-nowrap">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teacherClasses.length > 0 && teacherClasses[0]?.periods.map((period, pIdx) => (
                <tr key={period.id || pIdx}>
                  <td className="px-4 py-4 text-[10px] font-black text-gray-900 uppercase tracking-widest border-r border-gray-100 whitespace-nowrap">P{pIdx + 1}</td>
                  {teacherClasses.map((day, dIdx) => {
                    const entry = day.periods[pIdx];
                    if (!entry) return React.createElement('td', { key: `${dIdx}-${pIdx}` });
                    const isSub = entry.type === 'SUBSTITUTION';
                    const isBreak = entry.type === 'FREE';
                    const cellClass = isBreak ? 'bg-gray-50 border-dashed border-gray-200' :
                                     isSub ? 'bg-amber-50/50 border-amber-200/60' :
                                     'bg-white';
                    const textClass = isBreak ? 'text-gray-300 italic' :
                                     isSub ? 'text-amber-800' :
                                     'text-gray-900';
                    return (
                      <td key={dIdx} className="px-2 py-2 text-center align-middle">
                        <div className={cn("px-2 py-2.5 rounded-xl border text-[9px] font-black transition-all cursor-pointer hover:shadow-md", cellClass)}>
                          {isBreak ? (
                            <p className={textClass}>—</p>
                          ) : (
                            <>
                              <p className={cn("truncate", textClass)}>{entry.subject}</p>
                              <p className={cn("text-[8px] font-bold uppercase tracking-widest mt-0.5 italic truncate", isSub ? 'text-amber-500' : 'text-gray-400')}>{entry.class}</p>
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Bar */}
        <div className="mt-8 flex gap-4">
          <button className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2">
            <Upload size={16} /> Upload Class Data
          </button>
          <button className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl text-[11px] font-black text-gray-900 uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            <EyeIcon size={16} /> Print View
          </button>
          <button className="flex-1 py-4 bg-emerald-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
            <LockIcon size={16} /> Lock Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
