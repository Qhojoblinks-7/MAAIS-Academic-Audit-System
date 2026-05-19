import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, Users, GraduationCap, RotateCcw, Shield, FileText, History, Database, AlertTriangle, Sparkles, ArrowRight, QrCode, Download, Eye, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function AdminManagement() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
              <Settings size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display uppercase">System Administration</h1>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1">User permissions & system controls</p>
            </div>
          </div>
          <Link to="/settings" className="flex items-center gap-2 text-xs font-black text-gray-600 hover:text-emerald-700 transition-colors uppercase tracking-[0.15em]">
            <Settings size={14} /> Config Panel
          </Link>
        </header>

        <div className="grid gap-6">
          {/* User Overview */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Users className="text-gray-900" size={20} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Active Nodes</h2>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded">84 Total</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Anthony Hackman', role: 'TEACHER', dept: 'General Agric', status: 'ONLINE', avatar: 'Hackman' },
                { name: 'Martha Baah', role: 'HOD', dept: 'Home Economics', status: 'ONLINE', avatar: 'Martha' },
                { name: 'System Administrator', role: 'ADMIN', dept: 'Global', status: 'ONLINE', avatar: 'Admin' },
                { name: 'Angela Owusu', role: 'STUDENT', dept: 'General Agric', status: 'ONLINE', avatar: 'Angela' },
              ].map((u, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.avatar}`} alt={u.name} className="w-10 h-10 rounded-xl bg-emerald-50" />
                  <div className="flex-1">
                    <p className="text-sm font-black text-gray-900">{u.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{u.role} • {u.dept}</p>
                  </div>
                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded uppercase tracking-widest">{u.status}</span>
                </div>
              ))}
            </div>
          </section>

          {/* System Node Controls */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="text-gray-900" size={20} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">System Node Controls</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Maintenance Mode', desc: 'Lock all teacher interface globally', icon: Settings, color: 'rose' },
                { label: 'Bulk Grade Export', desc: 'Extract all historical grades to JSON', icon: Download, color: 'blue' },
                { label: 'Session Purge', desc: 'Force logout all non-admin sessions', icon: Trash2, color: 'amber' },
              ].map((ctrl, i) => (
                <button key={i} className={cn("p-6 rounded-2xl border border-gray-100 text-left transition-all group", ctrl.color === 'rose' ? "hover:bg-rose-50" : ctrl.color === 'blue' ? "hover:bg-blue-50" : "hover:bg-amber-50")}>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", ctrl.color === 'rose' ? "bg-rose-100 text-rose-600" : ctrl.color === 'blue' ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600")}>
                    <ctrl.icon size={20} />
                  </div>
                  <p className="text-[13px] font-black text-gray-900 mb-1">{ctrl.label}</p>
                  <p className="text-[10px] font-bold text-gray-400">{ctrl.desc}</p>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
