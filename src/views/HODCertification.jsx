import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, Users, Clock, BookOpen, Plus, Search, Eye, Edit3,
  Star, Award, TrendingUp, Calendar, FileText, ArrowRight,
} from 'lucide-react';
import { cn } from '../lib/utils';

const mockStudentsCert = [
  { id: 's1', name: 'Angela Efia Owusu', index: '10001', program: 'General Agric', performance: 82, attendance: 96, pending: false },
  { id: 's2', name: 'Kwame Boateng', index: '10002', program: 'Gen Science', performance: 75, attendance: 89, pending: true },
  { id: 's3', name: 'Ama Dankwa', index: '10003', program: 'Home Economics', performance: 90, attendance: 98, pending: false },
  { id: 's4', name: 'Yaw Afriyie', index: '10004', program: 'General Arts', performance: 68, attendance: 82, pending: true },
  { id: 's5', name: 'Efua Serwaa', index: '10005', program: 'Visual Arts', performance: 85, attendance: 95, pending: false },
];

export function HODCertification() {
  const navigate = useNavigate();
  const [filter, setFilter] = React.useState('all');

  const filtered = filter === 'all' ? mockStudentsCert : mockStudentsCert.filter(s => filter === 'pending' ? s.pending : !s.pending);

  const getGrade = (score) => {
    if (score >= 80) return 'A1';
    if (score >= 75) return 'B2';
    if (score >= 70) return 'B3';
    if (score >= 65) return 'C4';
    if (score >= 60) return 'C5';
    if (score >= 55) return 'C6';
    if (score >= 50) return 'D7';
    return 'E8+';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
              <Award size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-1">HOD Certification Desk</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Final review &amp; sign-off batch matrix</p>
            </div>
          </div>
        </header>

        <div className="flex gap-3 mb-8">
          {[
            { key: 'all', label: 'All Entries' },
            { key: 'pending', label: 'Pending Review', badge: mockStudentsCert.filter(s => s.pending).length },
            { key: 'certified', label: 'Certified' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setFilter(tab.key)} className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filter === tab.key ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50")}>
              {tab.label}
              {tab.badge && <span className="w-5 h-5 flex items-center justify-center text-[8px] font-black rounded-full bg-amber-500/20 text-amber-600">{tab.badge}</span>}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[1.5rem] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-black text-sm">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-gray-900 tracking-tight">{student.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.program} · Index {student.index}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {student.pending && <span className="px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-lg">Action Required</span>}
                  {!student.pending && <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1"><Star size={10} /> Certified</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Performance</p>
                  <p className="text-2xl font-black text-gray-900">{student.performance}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Final Grade</p>
                  <p className="text-2xl font-black text-emerald-700">{getGrade(student.performance)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Attendance</p>
                  <p className="text-2xl font-black text-gray-900">{student.attendance}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Observation</p>
                  <p className="text-sm font-black text-gray-500 uppercase mt-1">{student.pending ? 'Incomplete' : 'Complete'}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/grading?revision=${student.id}`)}
                  className={cn("flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", student.pending ? "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20" : "bg-gray-900 text-white hover:bg-black shadow-lg")}
                >
                  <Award size={16} /> {student.pending ? 'Review &amp; Sign-Off' : 'View Report'}
                </button>
                <button className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-black text-gray-500 hover:bg-gray-100 transition-all">
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
