import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Download, Calendar, Target, BookOpen, Activity, Star, CheckCircle2, Lock, History, Database as DbIcon } from 'lucide-react';
import { cn } from '../lib/utils';

const historyData = [
  { id: 's1', name: 'Angela Owusu', index: '10001', year: '2025/2026', term: 'Term 2', final: 78.5, status: 'IN PROGRESS' },
  { id: 's2', name: 'Kwame Mensah', index: '10002', year: '2025/2026', term: 'Term 2', final: 72.3, status: 'IN PROGRESS' },
  { id: 's3', name: 'Yaw Boateng', index: '10003', year: '2024/2025', term: 'Term 3', final: 84.1, status: 'GRADUATED' },
  { id: 's4', name: 'Ama Darko', index: '10004', year: '2024/2025', term: 'Term 3', final: 69.7, status: 'GRADUATED' },
  { id: 's5', name: 'Abena Serwaa', index: '10007', year: '2023/2024', term: 'Term 3', final: 91.2, status: 'GRADUATED' },
];

const terms = ['SHS 1 Term 1', 'SHS 1 Term 2', 'SHS 1 Term 3', 'SHS 2 Term 1', 'SHS 2 Term 2', 'SHS 2 Term 3'];
const journeyData = [
  { term: 'SHS1 T1', score: 68, classAvg: 62 },
  { term: 'SHS1 T2', score: 72, classAvg: 65 },
  { term: 'SHS1 T3', score: 70, classAvg: 68 },
  { term: 'SHS2 T1', score: 78, classAvg: 67 },
  { term: 'SHS2 T2', score: 75, classAvg: 70 },
  { term: 'SHS2 T3', score: 82.4, classAvg: 72 },
];

export function StudentJourney() {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportStep, setExportStep] = React.useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    setExportStep(1);
    await new Promise(r => setTimeout(r, 800));
    setExportStep(2);
    await new Promise(r => setTimeout(r, 1200));
    setExportStep(3);
    await new Promise(r => setTimeout(r, 1000));
    setIsExporting(false);
    setExportStep(0);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] font-sans p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2 font-display italic tracking-tight">Journey View — Archival &amp; Historical Record</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Terminal audit path · reveals grading history for any registered student</p>
          </div>
        </header>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
          <div className="flex gap-4 items-center bg-gray-50 rounded-xl px-5 py-3">
            <input type="text" placeholder="Search student by index number or name..." className="flex-1 bg-transparent text-sm font-black text-gray-900 placeholder-gray-400 focus:outline-none" />
            <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg">
              Search
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Archived', value: '847', icon: DbIcon, color: 'bg-blue-50 text-blue-700' },
            { label: 'Graduated', value: '312', icon: GraduationCap, color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Pending Review', value: '5', icon: AlertCircle, color: 'bg-amber-50 text-amber-700' },
            { label: 'Audit Failures', value: '0', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", stat.color)}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* History Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Deep History Archive — 5 Year Period</span>
            <div className="flex gap-2">
              <button className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all text-gray-500"><Download size={16} /></button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Index</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Year</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Term</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Final Grade</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {historyData.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-700">{s.name.charAt(0)}</div>
                        <span className="text-sm font-black text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold font-mono text-gray-500">{s.index}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{s.year}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{s.term}</td>
                    <td className="px-6 py-4 text-sm font-black text-emerald-700 text-right">{s.final}%</td>
                    <td className="px-6 py-4">
                      <span className={cn("text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest", s.status === 'GRADUATED' ? 'bg-gray-50 text-gray-500 border border-gray-200' : 'bg-emerald-50 text-emerald-700')}>{s.status}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
