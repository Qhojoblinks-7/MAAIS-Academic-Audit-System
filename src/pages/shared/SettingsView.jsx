import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings, Bell, Lock, Eye, EyeOff, GraduationCap, User, Shield,
  Smartphone, CheckCircle2, AlertCircle, Zap, Fingerprint, ChevronRight,
  Activity, Globe, Database, Database as Db, BellOff, Moon, Sun,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';

export function SettingsView() {
  const { user } = useRole();
  const navigate = useNavigate();

  const alertLevel = 'HIGH';
  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12 pb-32 lg:pb-24">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
              <Settings size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display uppercase">System Vault</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Core protocols · identity · communications config</p>
            </div>
          </div>
        </header>

        <div className="grid gap-8">
          {/* Identity & Access */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
              <Fingerprint className="text-gray-900" size={20} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Identity &amp; Access Node</h2>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Smartphone size={20} className="text-gray-700" />
                  <div>
                    <p className="text-sm font-black text-gray-900">Two-Factor Authentication</p>
                    <p className="text-[10px] font-medium text-gray-400">Requires app-based PIN on sensitive operations</p>
                  </div>
                </div>
                <button className="w-12 h-7 bg-emerald-600 rounded-full relative p-1 shadow-lg shadow-emerald-600/20">
                  <motion.div className="w-5 h-5 bg-white rounded-full shadow-sm" animate={{ x: 20 }} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Lock size={20} className="text-gray-700" />
                  <div>
                    <p className="text-sm font-black text-gray-900">Session Controller</p>
                    <p className="text-[10px] font-medium text-gray-400">Auto-logout after 15 minutes of inactivity</p>
                  </div>
                </div>
                <button className="w-12 h-7 bg-emerald-600 rounded-full relative p-1 shadow-lg shadow-emerald-600/20">
                  <motion.div className="w-5 h-5 bg-white rounded-full shadow-sm" animate={{ x: 20 }} />
                </button>
              </div>
            </div>
          </section>

          {/* Comms Scripts */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
              <Bell className="text-gray-900" size={20} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Comms Scripts</h2>
              <span className="ml-auto text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded">{alertLevel} intensity active</span>
            </div>
            <div className="p-8 space-y-4">
              {[
                { label: 'SMS Default Tone', desc: 'Formal, Ghanaian English, concise', active: true },
                { label: 'Emergency Broadcast', desc: 'All channels · Override flag active', active: true },
                { label: 'SMS Disabled Channels', desc: 'Email only (legacy)', active: false },
              ].map((script, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-black text-gray-900">{script.label}</p>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">{script.desc}</p>
                  </div>
                  <button className={cn("w-12 h-7 rounded-full relative p-1", script.active ? "bg-emerald-600 shadow-lg shadow-emerald-600/20" : "bg-gray-300")}>
                    <motion.div className="w-5 h-5 bg-white rounded-full shadow-sm" animate={{ x: script.active ? 20 : 0 }} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Smart AI Gates */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
              <Zap className="text-amber-500" size={20} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Smart AI Gates</h2>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Activity size={20} className="text-gray-700" />
                  <div>
                    <p className="text-sm font-black text-gray-900">Smart Remarks Engine</p>
                    <p className="text-[10px] font-medium text-gray-400">Auto-generate remarks from grade categories</p>
                  </div>
                </div>
                <button className="w-12 h-7 bg-emerald-600 rounded-full relative p-1 shadow-lg shadow-emerald-600/20">
                  <motion.div className="w-5 h-5 bg-white rounded-full shadow-sm" animate={{ x: 20 }} />
                </button>
              </div>
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-gray-700" />
                  <div>
                    <p className="text-sm font-black text-gray-900">Audit Anomaly Detection</p>
                    <p className="text-[10px] font-medium text-gray-400">Flag grade jumps &gt;30% between consecutive terms</p>
                  </div>
                </div>
                <button className="w-12 h-7 bg-emerald-600 rounded-full relative p-1 shadow-lg shadow-emerald-600/20">
                  <motion.div className="w-5 h-5 bg-white rounded-full shadow-sm" animate={{ x: 20 }} />
                </button>
              </div>
            </div>
          </section>

          {/* Data Integrity */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
              <Db className="text-gray-900" size={20} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Data Integrity Corridors</h2>
            </div>
            <div className="p-8 space-y-4">
              <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-black text-emerald-900">Database Hash Verified</p>
                  <p className="text-[10px] font-medium text-emerald-700/70 mt-0.5">All 3 active databases match master hash 0x7f3a…</p>
                </div>
              </div>
              <button className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-900 hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                <Db size={18} /> Run Immediate Integrity Check
              </button>
            </div>
          </section>

          {/* Desktop Log */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
              <Activity className="text-gray-900" size={20} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Local Server Log (Last 8 Lines)</h2>
            </div>
            <div className="p-8 font-mono text-[10px] text-gray-500 space-y-1 leading-relaxed">
              <p><span className="text-emerald-600 font-black">[INFO]</span>  MAAIS Core 2.4.1 · Node 22.x · Port 3000</p>
              <p><span className="text-emerald-600 font-black">[INFO]</span>  Connected to localStorage adapter · 3 schemas loaded</p>
              <p><span className="text-amber-600 font-black">[WARN]</span>  express module loaded — Dev-only server detected</p>
              <p><span className="text-emerald-600 font-black">[INFO]</span>  Connected to SQLite primary database · schema v6</p>
              <p><span className="text-emerald-600 font-black">[INFO]</span>  Express API server started on port 3001 — test mode</p>
              <p><span className="text-emerald-600 font-black">[INFO]</span>  Auth node initialized · JWT issued for user: admin</p>
              <p><span className="text-blue-600 font-black">[HMR]</span>  Reloading: context changes detected in UIContext</p>
            </div>
            <div className="bg-gray-50 py-4 px-6 border-t border-gray-100 text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em]">Local dev server — not production grade</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
