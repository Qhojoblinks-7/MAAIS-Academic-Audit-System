import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText, FileCheck, Menu, Plus, Database,
  History, Activity, CheckCircle2, Search, ArrowRight, Shield,
} from 'lucide-react';
import { cn } from '../lib/utils';

export function ArchiveView() {
  const [selectedYear, setSelectedYear] = React.useState('2025/2026');
  const [searchQuery, setSearchQuery] = React.useState('');

  const archivedStudents = [
    { id: 'a1', name: 'Abena Serwaa', index: '2024-0891', class: 'SHS 3 Home Econ', finalGrade: 'B2', year: '2024/2025' },
    { id: 'a2', name: 'Kofi Mensah', index: '2024-0312', class: 'SHS 3 Science', finalGrade: 'B3', year: '2024/2025' },
    { id: 'a3', name: 'Ama Darko', index: '2024-0445', class: 'SHS 2 Agric', finalGrade: 'C4', year: '2024/2025' },
    { id: 'a4', name: 'Yaw Boafo', index: '2023-1201', class: 'SHS 3 Gen Arts', finalGrade: 'C5', year: '2023/2024' },
    { id: 'a5', name: 'Efua Owusu', index: '2023-0899', class: 'SHS 3 Visual Arts', finalGrade: 'B2', year: '2023/2024' },
  ];

  const filtered = archivedStudents.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.index.includes(searchQuery)
  );

  const gradeColor = (g) => {
    if (['A1', 'B2'].includes(g)) return 'bg-emerald-100 text-emerald-800';
    if (['B3', 'C4', 'C5'].includes(g)) return 'bg-blue-50 text-blue-700';
    return 'bg-amber-50 text-amber-700';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
              <Database size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-1">The Vault</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Historical archive · GES audit-ready records</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search archive..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 w-48" />
            </div>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest focus:outline-none cursor-pointer">
              <option>2025/2026</option>
              <option>2024/2025</option>
              <option>2023/2024</option>
            </select>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total Archived', value: '847', icon: Archive?: FileText, color: 'bg-blue-50 text-blue-600' },
            { label: 'Graduated', value: '312', icon: GraduationCap, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Pending Review', value: '5', icon: AlertCircle, color: 'bg-amber-50 text-amber-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", stat.color)}>
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
            <FileText className="text-gray-900" size={18} />
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Archived Records — {selectedYear}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-black text-gray-700 text-sm">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{s.name}</p>
                    <p className="text-[10px] font-bold text-gray-400">{s.index} • {s.class}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn("text-[10px] font-black px-3 py-1.5 rounded-lg", gradeColor(s.finalGrade))}>{s.finalGrade}</span>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-emerald-600">
                    <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
