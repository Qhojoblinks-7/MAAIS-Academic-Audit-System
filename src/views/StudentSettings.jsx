import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, BookOpen, Save, CheckCircle2, ArrowRight, FileText,
  DollarSign, GraduationCap, Shield, Bell, Smartphone, Fingerprint,
  Edit3, Eye, EyeOff, Phone, Plus, Star, Clock, Lock,
} from 'lucide-react';
import { cn } from '../lib/utils';

const studentStats = [
  { label: 'Current CGPA', value: '3.82', sub: 'Term 2', color: 'text-emerald-700' },
  { label: 'Attendance', value: '96%', sub: '94/98 days', color: 'text-blue-600' },
  { label: 'Class Rank', value: '#8', sub: 'of 42 students', color: 'text-amber-600' },
  { label: 'Owed Fees', value: '₵0', sub: 'Account clear', color: 'text-emerald-700' },
];

export function StudentSettings() {
  const navigate = useNavigate();
  const [name, setName] = React.useState('Angela Efia Owusu');
  const [bio, setBio] = React.useState('SHS 3 Agric B student interested in agritech.');

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 md:p-8 lg:p-12 pb-32 lg:pb-24">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display uppercase">My Identity</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Academic profile, credentials &amp; preferences</p>
          </div>
        </header>

        <div className="grid gap-6 mb-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {studentStats.map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center">
                <p className={cn("text-2xl font-black tracking-tighter", stat.color)}>{stat.value}</p>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                <p className="text-[9px] font-medium text-gray-500 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Profile Section */}
          <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
              <User className="text-gray-900" size={20} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Student Profile</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10" />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Index Number</label>
                  <div className="px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black font-mono text-gray-800">10001</div>
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Current Class</label>
                  <div className="px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black text-gray-800">SHS 3 Agric B</div>
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Program</label>
                  <div className="px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black text-gray-800">General Agriculture</div>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Bio / About</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 resize-none" />
              </div>
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Fingerprint className="text-gray-700" size={20} />
                  <div>
                    <p className="text-sm font-black text-gray-900">Two-Factor Auth</p>
                    <p className="text-[10px] font-medium text-gray-400">Require PIN on login</p>
                  </div>
                </div>
                <button className="w-12 h-7 bg-emerald-600 rounded-full relative p-1 shadow-lg shadow-emerald-600/20"><motion.div className="w-5 h-5 bg-white rounded-full shadow-sm" animate={{ x: 20 }} /></button>
              </div>
              <button className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-gray-900/20 flex items-center justify-center gap-2">
                <Save size={16} /> Save Changes
              </button>
            </div>
          </section>

          {/* Appearance / Preferences */}
          <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
              <Bell className="text-gray-900" size={20} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Notification Preferences</h2>
            </div>
            <div className="p-8 space-y-4">
              {[
                { label: 'SMS Alerts', desc: 'Receive SMS when results are published', enabled: true },
                { label: 'Push App', desc: 'In-app notification banner', enabled: true },
                { label: 'Bi-weekly Summary', desc: 'Academic pulse digest via SMS', enabled: false },
              ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="text-sm font-black text-gray-900">{pref.label}</p>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">{pref.desc}</p>
                  </div>
                  <button className={cn("w-12 h-7 rounded-full relative p-1", pref.enabled ? "bg-emerald-600 shadow-lg shadow-emerald-600/20" : "bg-gray-300")}>
                    <motion.div className="w-5 h-5 bg-white rounded-full shadow-sm" animate={{ x: pref.enabled ? 20 : 0 }} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
