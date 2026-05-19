import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, ShieldCheck, Users, BookOpen, Calendar, FileText,
  CheckCircle2, Target, Eye, Trash2, Lock, ArrowRight, Download, Sparkles, Shield, BarChart3, QrCode,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export function AdminHome() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
              <GraduationCap size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none italic font-display">Admin Command Center</h1>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1">Institutional Overview & System Vault</p>
            </div>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Active Students', value: '1,247', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Staff Onboard', value: '84', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Classes Tracked', value: '32', icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Reports Generated', value: '256', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", stat.bg, stat.color)}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Academic Architect', desc: 'Configure courses, grading rules & academic structure', icon: Cpu, color: 'bg-blue-600', path: '/academic-architect' },
            { title: 'Staff & Student Registry', desc: 'Manage identities, roles & departmental hierarchy', icon: Users, color: 'bg-emerald-600', path: '/identity/students' },
            { title: 'Timetable Manager', desc: 'Master schedule, event calendar & substitutions', icon: Calendar, color: 'bg-amber-600', path: '/timetable' },
            { title: 'Finance & Procurement', desc: 'Fee collection, expenses & asset management', icon: Target, color: 'bg-rose-600', path: '/finance' },
            { title: 'Comms & Reporting', desc: 'SMS, notices, batch reports & transcript generation', icon: FileText, color: 'bg-purple-600', path: '/comms' },
            { title: 'The Vault', desc: 'Archive access, audit trails & system forensics', icon: Lock, color: 'bg-slate-800', path: '/audit' },
          ].map((mod, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(mod.path)}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0", mod.color)}>
                  <mod.icon size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="text-[15px] font-black text-gray-900 tracking-tight group-hover:text-emerald-700 transition-colors">{mod.title}</h3>
                  <p className="text-[11px] font-medium text-gray-400 mt-1 leading-relaxed">{mod.desc}</p>
                </div>
                <ArrowRight size={18} className="text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0 mt-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
