import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings, Lock, Eye, EyeOff, Users, Smartphone, CheckCircle2, Clock,
  Fingerprint, Send, BookOpen, ChevronRight, QrCode, Bell, Globe, Database, Phone, Settings2,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';
import { useUI } from '../context/UIContext';

const allTickets = [
  { id: 't1', subject: 'Term 2 grading discrepancy — SHS 2 Science', status: 'OPEN', priority: 'HIGH', date: '2026-05-17' },
  { id: 't2', subject: 'Student end-of-term average rounding error', status: 'IN_PROGRESS', priority: 'MEDIUM', date: '2026-05-15' },
  { id: 't3', subject: 'Archive integrity mismatch — batch 4', status: 'RESOLVED', priority: 'HIGH', date: '2026-04-28' },
  { id: 't4', subject: 'Bulk report not loading for 2022 cohort', status: 'OPEN', priority: 'LOW', date: '2026-05-12' },
  { id: 't5', subject: 'Missing observations unbanked for 3 classes', status: 'RESOLVED', priority: 'MEDIUM', date: '2026-03-10' },
  { id: 't6', subject: 'Lock override requested by Assistant Headmistress', status: 'IN_PROGRESS', priority: 'HIGH', date: '2026-05-18' },
  { id: 't7', subject: 'SMS delivery receipt failure — batch 7', status: 'RESOLVED', priority: 'MEDIUM', date: '2026-02-22' },
];

const faqs = [
  { q: 'How do I promote students to the next class?', a: 'Go to Vault → Promotion Cycle and select the target transition.' },
  { q: 'How do I reset my password?', a: 'Go to Settings → Identity & Access and choose Change Password.' },
  { q: 'What causes audit log mismatches?', a: 'Grade edits outside the 24h reconciliation window will generate mismatch entries explained in the log.' },
  { q: 'How do I issue a transcript for an alumnus?', a: 'Through Vault → Graduated Records then use the Export button.' },
];

const statusStyles = {
  OPEN: 'bg-amber-50 text-amber-700 border-amber-100',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-100',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};
const priorityStyles = {
  CRITICAL: 'bg-rose-50 text-rose-700 border-rose-100',
  HIGH: 'bg-rose-50 text-rose-700 border-rose-100',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-100',
  LOW: 'bg-blue-50 text-blue-700 border-blue-100',
};

export function AdminSupport() {
  const navigate = useNavigate();
  const { user } = useRole();
  const { setSupportModalOpen } = useUI();
  const [roleFilter, setRoleFilter] = React.useState('all');

  const filtered = roleFilter === 'all' ? allTickets : allTickets.filter(t => t.priority === (roleFilter === 'open' ? 'HIGH' : roleFilter === 'medium' ? 'MEDIUM' : t.status));

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter font-display italic mb-1">ICT Support Desk</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin epic — ticket triage · platform escalation</p>
          </div>
          <div className="flex gap-2">
            {['all', 'high', 'medium', 'resolved'].map(f => (
              <button key={f} onClick={() => setRoleFilter(f)} className={cn("px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", roleFilter === f ? "bg-gray-900 text-white" : "bg-white text-gray-500 border border-gray-200")}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Tickets', value: '47', icon: Settings, color: 'bg-blue-50 text-blue-700' },
            { label: 'Open', value: '12', icon: Bell, color: 'bg-amber-50 text-amber-700' },
            { label: 'Resolved', value: '31', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700' },
            { label: 'Critical', value: '2', icon: AlertCircle, color: 'bg-rose-50 text-rose-700' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", stat.color)}>
                <stat.icon size={16} />
              </div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tickets */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
            <QrCode className="text-gray-900" size={18} />
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{filtered.length} Tickets</span>
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map((ticket, i) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-all cursor-pointer"
              >
                <div>
                  <p className="text-sm font-black text-gray-900 mb-0.5">{ticket.subject}</p>
                  <p className="text-[10px] font-bold text-gray-400">{ticket.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-widest border", statusStyles[ticket.status] || 'bg-gray-50 text-gray-500')}>{ticket.status.replace('_', ' ')}</span>
                  <span className={cn("text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest", priorityStyles[ticket.priority] || 'bg-gray-50')}>{ticket.priority}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3 mb-6">
            <BookOpen className="text-gray-900" size={20} />
            <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Quick Reference FAQ</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 bg-gray-50 rounded-2xl"
              >
                <p className="text-[11px] font-black text-gray-900 mb-2 uppercase tracking-widest">{i + 1}. {faq.q}</p>
                <p className="text-sm font-medium text-gray-600 italic leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
