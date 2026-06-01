import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock, Calendar, MoreHorizontal, Trash2, Edit3, Copy,
  Plus, Search, Filter, Users, BookOpen, GraduationCap,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const mockTimetable = Array.from({ length: 7 }, (_, i) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  return {
    day: days[i] || 'Monday',
    periods: [
      { id: 'p1', subject: 'General Agric', class: 'SHS 1A', venue: 'Lab 1', type: 'REGULAR' },
      { id: 'p2', subject: 'Biology', class: 'SHS 2A', venue: 'Lab 2', type: 'REGULAR' },
      { id: 'p3', subject: '-', class: '-', venue: '-', type: 'FREE' },
      { id: 'p4', subject: 'Home Econ', class: 'SHS 3B', venue: 'Cookery Lab', type: 'REGULAR' },
      { id: 'p5', subject: 'Physics', class: 'SHS 3A', venue: 'Science Block', type: 'REGULAR' },
      { id: 'p6', subject: 'Study Hall', class: 'SHS 2B', venue: 'Library', type: 'FREE' },
      { id: 'p7', subject: 'Substitution', class: 'SHS 1E', venue: 'Class B4', type: 'SUBSTITUTION' },
      { id: 'p8', subject: 'Gen. Arts', class: 'SHS 2A', venue: 'Hall', type: 'LAB' },
    ],
  };
});

export function Timetable() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('grid');

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-full">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
              <Calendar size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-1">Master Timetable</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Weekly schedule overview · substitutions · lab sessions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2"><Calendar size={14} /> Term 2</button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-lg"><Plus size={16} /> Add Entry</button>
          </div>
        </header>

        <div className="flex gap-3 mb-8">
          {['grid', 'class-view', 'teacher-view'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === tab ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50")}>
              {tab === 'grid' ? 'Grid' : tab === 'class-view' ? 'By Class' : 'By Teacher'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-4 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-100 min-w-[110px]">Time</th>
                {mockTimetable.map((d) => (
                  <th key={d.day} className="px-2 py-4 text-[10px] font-black text-gray-900 uppercase tracking-widest text-center whitespace-nowrap">{d.day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockTimetable[0]?.periods.map((period, pIdx) => (
                <tr key={period.id}>
                  <td className="px-4 py-4 text-[10px] font-black text-gray-900 uppercase tracking-widest border-r border-gray-100 whitespace-nowrap">P{pIdx + 1}</td>
                  {mockTimetable.map((day, dIdx) => {
                    const entry = day.periods[pIdx];
                    const typeColor = entry.type === 'SUBSTITUTION' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                                      entry.type === 'LAB' ? 'bg-purple-50 border-purple-200 text-purple-800' :
                                      entry.type === 'FREE' ? 'bg-gray-50 border-gray-200 text-gray-400' :
                                      'bg-white border-gray-200 text-gray-900';
                    return (
                      <td key={dIdx} className="px-2 py-2 text-center align-middle">
                        <div className={cn("px-2 py-2.5 rounded-xl border text-[10px] font-black transition-all cursor-pointer hover:shadow-md", typeColor)}>
                          {entry.subject !== '-' ? (
                            <>
                              <p className="truncate">{entry.subject}</p>
                              <p className="text-[8px] font-bold uppercase tracking-widest mt-0.5">{entry.class}</p>
                            </>
                          ) : (
                            <p className="font-bold italic">Free</p>
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
      </div>
    </div>
  );
}
