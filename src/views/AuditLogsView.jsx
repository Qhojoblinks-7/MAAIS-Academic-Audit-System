import React from 'react';
import { motion } from 'framer-motion';
import { Database, CheckCircle2, AlertCircle, History, MessageSquare, Send, Clock, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

const auditLogs = [
  { id: 'l1', user: 'Anthony Hackman', action: 'UPDATE', target: 'Angela Owusu - Sec B', time: '14 min ago', status: 'RESOLVED' },
  { id: 'l2', user: 'Martha Baah', action: 'LOCK', target: 'SHS 2 Agric Matrix', time: '1h ago', status: 'LOCKED' },
  { id: 'l3', user: 'System', action: 'AUTO_SAVE', target: 'SHS 1 Science Draft', time: '3h ago', status: 'DRAFT' },
  { id: 'l4', user: 'Anthony Hackman', action: 'CREATE', target: 'New: Missing Obs Alert', time: '5h ago', status: 'FLAGGED' },
  { id: 'l5', user: 'Martha Baah', action: 'DELETE', target: 'Old: H1 T1 SBA Entry', time: '1d ago', status: 'ARCHIVED' },
  { id: 'l6', user: 'System', action: 'SYSTEM', target: 'Daily Integrity Check', time: '1d ago', status: 'PASS' },
];

export function AuditLogsView() {
  const [filter, setFilter] = React.useState('all');

  const filtered = filter === 'all' ? auditLogs : auditLogs.filter(l => l.action === filter || l.status === filter);

  const statusColors = {
    RESOLVED: 'bg-emerald-50 text-emerald-700',
    LOCKED: 'bg-blue-50 text-blue-700',
    DRAFT: 'bg-gray-50 text-gray-500',
    FLAGGED: 'bg-amber-50 text-amber-700',
    ARCHIVED: 'bg-purple-50 text-purple-700',
    PASS: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-1">Academic Audit Logs</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trace all modifications, locks & submissions</p>
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'RESOLVED', 'FLAGGED'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filter === f ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50")}>
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </header>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
            <Database className="text-gray-900" size={18} />
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{filtered.length} Records Found</span>
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 hover:bg-gray-50/50 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", log.status === 'RESOLVED' ? "bg-emerald-50" : log.status === 'FLAGGED' ? "bg-amber-50" : log.status === 'LOCKED' ? "bg-blue-50" : "bg-gray-50")}>
                    {log.status === 'RESOLVED' ? <CheckCircle2 className="text-emerald-600" size={18} /> :
                     log.status === 'FLAGGED' ? <AlertCircle className="text-amber-600" size={18} /> :
                     log.status === 'LOCKED' ? <CheckCircle2 className="text-blue-600" size={18} /> : <Clock className="text-gray-400" size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 mb-0.5">{log.action} — {log.target}</p>
                    <p className="text-[10px] font-bold text-gray-400">{log.user} • {log.time}</p>
                  </div>
                </div>
                <span className={cn("text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest", statusColors[log.status])}>{log.status}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
