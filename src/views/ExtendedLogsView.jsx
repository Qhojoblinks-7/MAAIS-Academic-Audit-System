import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, FileText, Database, Users, Clock, GraduationCap,
  Search, Lock, Eye, Download, ChevronRight, ArrowUpDown, ArrowDown,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';

const allLogs = [
  { id: 'l1', timestamp: '2026-05-19 08:30:00', user: 'Anthony Hackman', role: 'TEACHER', action: 'UPDATE', target: 'Angela Owusu — Sec B (Agric)', ip: '192.168.1.101', risk: 'low' },
  { id: 'l2', timestamp: '2026-05-19 07:45:00', user: 'Martha Baah', role: 'HOD', action: 'LOCK', target: 'SHS 2 Science Matrix', ip: '192.168.1.105', risk: 'medium' },
  { id: 'l3', timestamp: '2026-05-18 18:12:00', user: 'System', role: 'SYSTEM', action: 'AUTO_SAVE', target: 'SHS 1 Blob Draft', ip: 'localhost', risk: 'low' },
  { id: 'l4', timestamp: '2026-05-18 14:00:00', user: 'Anthony Hackman', role: 'TEACHER', action: 'CREATE', target: 'New Missing Obs Alert', ip: '192.168.1.101', risk: 'medium' },
  { id: 'l5', timestamp: '2026-05-17 23:00:00', user: 'System', role: 'SYSTEM', action: 'ARCHIVE', target: '2024/2025 Year End Batch', ip: 'localhost', risk: 'low' },
  { id: 'l6', timestamp: '2026-05-16 11:30:00', user: 'Martha Baah', role: 'HOD', action: 'DELETE', target: 'Old H1 T1 SBA Entry', ip: '192.168.1.105', risk: 'high' },
  { id: 'l7', timestamp: '2026-05-15 09:00:00', user: 'Admin', role: 'SYSTEM', action: 'SYSTEM', target: 'Daily Integrity Check', ip: 'localhost', risk: 'low' },
  { id: 'l8', timestamp: '2026-05-14 16:45:00', user: 'Anthony Hackman', role: 'TEACHER', action: 'UPDATE', target: 'Kofi Mensah — Exam Score', ip: '192.168.1.101', risk: 'low' },
];

export function ExtendedLogsView() {
  const { user } = useRole();
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const [riskFilter, setRiskFilter] = React.useState('all');

  const filtered = allLogs.filter(log =>
    (riskFilter === 'all' || log.risk === riskFilter) &&
    (log.user.toLowerCase().includes(query.toLowerCase()) || log.target.toLowerCase().includes(query.toLowerCase()))
  );

  const riskBadge = (risk) => ({
    low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    medium: 'bg-amber-50 text-amber-700 border-amber-100',
    high: 'bg-rose-50 text-rose-700 border-rose-100',
  }[risk] || 'bg-gray-50 text-gray-500 border-gray-100');

  const actionBadge = (action) => ({
    UPDATE: 'bg-blue-50 text-blue-700 border-blue-100',
    LOCK: 'bg-purple-50 text-purple-700 border-purple-100',
    DELETE: 'bg-rose-50 text-rose-700 border-rose-100',
    CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    AUTO_SAVE: 'bg-gray-50 text-gray-500 border-gray-100',
    ARCHIVE: 'bg-amber-50 text-amber-700 border-amber-100',
    SYSTEM: 'bg-slate-50 text-slate-600 border-slate-100',
  }[action] || 'bg-gray-50 text-gray-500');

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
              <FileText size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-1">Extended Forensic Logs</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deep audit · forensics · anomaly detection engine</p>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {[
            { label: 'Total Events', value: '2,456', icon: Database, color: 'bg-blue-50 text-blue-700' },
            { label: 'Updates', value: '832', icon: FileText, color: 'bg-amber-50 text-amber-700' },
            { label: 'Locks', value: '145', icon: Lock, color: 'bg-purple-50 text-purple-700' },
            { label: 'Deletes', value: '12', icon: ArrowDown, color: 'bg-rose-50 text-rose-700' },
            { label: 'Users Active', value: '14', icon: Users, color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Anomalies', value: '3', icon: AlertCircle, color: 'bg-amber-50 text-amber-700' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", stat.color)}>
                <stat.icon size={16} />
              </div>
              <p className="text-xl font-black text-gray-900">{stat.value}</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by user or target..." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10" />
          </div>
          {['all', 'low', 'medium', 'high'].map(r => (
            <button key={r} onClick={() => setRiskFilter(r)} className={cn("px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", riskFilter === r ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50")}>
              {r === 'all' ? 'All Risks' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* Logs */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
            <ShieldCheck className="text-gray-900" size={18} />
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{filtered.length} Records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:text-gray-700">
                    Timestamp <ArrowUpDown size={10} className="inline ml-1" />
                  </th>
                  <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                  <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Target</th>
                  <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((log, i) => (
                  <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-4 text-[11px] font-bold text-gray-500 font-mono whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900">{log.user}</td>
                    <td className="px-6 py-4 text-[11px] font-bold text-gray-500">{log.role}</td>
                    <td className="px-6 py-4">
                      <span className={cn("text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border", actionBadge(log.action))}>{log.action}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{log.target}</td>
                    <td className="px-6 py-4">
                      <span className={cn("text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest", riskBadge(log.risk))}>{log.risk}</span>
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
