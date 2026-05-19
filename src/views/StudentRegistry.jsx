import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, User, Pencil, Clock, ShieldCheck, Phone, Trash2,
  Search, GraduationCap, BookOpen, ChevronRight, Star, Target,
  GraduationCap as Grad, BookOpen as Book, School2, Activity,
  Save, History, ClipboardCheck, Bell, AlertCircle, Database,
  BarChart3, ClockPm as ClockIcon, ClockA as ClockPm, Timer,
} from 'lucide-react';
import { cn } from '../lib/utils';

const studentRegistry = [
  { id: 's1', name: 'Angela Efia Owusu', index: '10001', class: 'SHS 3 Agric B', dept: 'General Agric', gender: 'F', boarding: 'Boarder', track: 'Agric', atRisk: false },
  { id: 's2', name: 'Kwame Gyan Boateng', index: '10002', class: 'SHS 2 Science A', dept: 'General Science', gender: 'M', boarding: 'Day', track: 'General', atRisk: false },
  { id: 's3', name: 'Ama Nkansah', index: '10003', class: 'SHS 1 Home Econ', dept: 'Home Economics', gender: 'F', boarding: 'Boarder', track: 'Vocational', atRisk: true },
  { id: 's4', name: 'Yaw Asare-Bediako', index: '10004', class: 'SHS 3 Gen Arts', dept: 'General Arts', gender: 'M', boarding: 'Day', track: 'General', atRisk: false },
  { id: 's5', name: 'Efua Oye Mensah', index: '10005', class: 'SHS 2 Agric B', dept: 'General Agric', gender: 'F', boarding: 'Boarder', track: 'Agric', atRisk: true },
  { id: 's6', name: 'Kojo Asante', index: '10006', class: 'SHS 1 Science A', dept: 'General Science', gender: 'M', boarding: 'Day', track: 'General', atRisk: false },
  { id: 's7', name: 'Abena Serwaa Boatemaa', index: '10007', class: 'SHS 3 Home Econ', dept: 'Home Economics', gender: 'F', boarding: 'Boarder', track: 'Vocational', atRisk: false },
];

export function StudentRegistry() {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');
  const [filterDept, setFilterDept] = React.useState('all');

  const filtered = studentRegistry.filter(s =>
    (filterDept === 'all' || s.dept === filterDept) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.index.includes(search))
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-1">Student Registry</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">All enrolled students · biographical &amp; academic data</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by name or index..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 w-52" />
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-950 transition-all shadow-lg">
              <Users size={16} /> New Student
            </button>
          </div>
        </header>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All Dept.' },
            { key: 'General Agric', label: 'General Agric' },
            { key: 'General Science', label: 'General Science' },
            { key: 'General Arts', label: 'General Arts' },
            { key: 'Home Economics', label: 'Home Economics' },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilterDept(f.key)} className={cn("px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all", filterDept === f.key ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50")}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{filtered.length} Students</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Index</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Class</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Dept</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-700">{s.name.charAt(0)}</div>
                        <span className="text-sm font-black text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold font-mono text-gray-500">{s.index}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{s.class}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{s.dept}</td>
                    <td className="px-6 py-4">
                      {s.atRisk ? (
                        <span className="text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest bg-rose-50 text-rose-700 border border-rose-100">At Risk</span>
                      ) : (
                        <span className="text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => navigate(`/journey?student=${s.id}`)} className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-700"><ChevronRight size={16} /></button>
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
