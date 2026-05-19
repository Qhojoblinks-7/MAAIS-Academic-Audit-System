import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, Users, Plus, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const departments = [
  { id: 'd1', name: 'General Agriculture', head: 'Martha Baah', teacherCount: 4, studentCount: 128, color: 'bg-emerald-600' },
  { id: 'd2', name: 'Home Economics', head: 'Abena Serwaa', teacherCount: 3, studentCount: 96, color: 'bg-purple-600' },
  { id: 'd3', name: 'General Science', head: 'Dr. Stephen Addo', teacherCount: 5, studentCount: 145, color: 'bg-blue-600' },
  { id: 'd4', name: 'Technical Drawing', head: 'Kwadwo Mensah', teacherCount: 2, studentCount: 72, color: 'bg-amber-600' },
];

export function DepartmentManagement() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
                <GraduationCap size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic">Departmental Map</h1>
              </div>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Assign heads, map subjects, oversee personnel distribution</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-emerald-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-lg">
            <Plus size={16} /> New Department
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept, i) => (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white", dept.color)}>
                  <BookOpen size={22} />
                </div>
                <div>
                  <p className="text-[15px] font-black text-gray-900 tracking-tight">{dept.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{dept.head}</p>
                </div>
              </div>
              <div className="flex gap-6 mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-500">
                  <Users size={16} />
                  <div>
                    <p className="text-lg font-black text-gray-900">{dept.teacherCount}</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Teachers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <GraduationCap size={16} />
                  <div>
                    <p className="text-lg font-black text-gray-900">{dept.studentCount}</p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Students</p>
                  </div>
                </div>
              </div>
              <button className="mt-6 w-full py-3 bg-gray-50 text-gray-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                Manage <ArrowRight size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
