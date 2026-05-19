import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Settings, Lock, Eye, EyeOff, Users, Smartphone, CheckCircle2,
  Clock, Fingerprint, Send, BookOpen, ChevronRight, QrCode, Bell,
  Handshake, Verified, UserCheck, PhoneCall, Activity, RotateCw,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';
import { useUI } from '../context/UIContext';

export function HODSettings() {
  const navigate = useNavigate();
  const { user } = useRole();
  const { setSettingsModalOpen } = useUI();
  const [mfaEnabled, setMfaEnabled] = React.useState(true);
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 md:p-8 lg:p-12 pb-32 lg:pb-24">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
              <Settings size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display uppercase">HOD Identity</h1>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1">Departmental authority &amp; monitoring</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-purple-50 rounded-xl border border-purple-100">
            <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Authority: {user?.role}</span>
          </div>
        </header>

        <div className="grid gap-8">
          {/* HOD Identity */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
              <Users className="text-gray-900" size={20} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">HOD Profile</h2>
            </div>
            <div className="p-8 grid grid-cols-2 gap-8">
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Name</label>
                <div className="px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black text-gray-900">{user?.name}</div>
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Role</label>
                <div className="px-5 py-3.5 bg-purple-50 border border-purple-100 rounded-2xl text-[11px] font-black text-purple-700 uppercase tracking-widest">{user?.role}</div>
              </div>
              <div className="col-span-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Department</label>
                <div className="px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black text-gray-900">{user?.departmentId}</div>
              </div>
            </div>
          </section>

          {/* Global Protocols */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
              <Fingerprint className="text-gray-900" size={20} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Global Protocols</h2>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Fingerprint className="text-gray-700" size={24} />
                  <div>
                    <p className="text-sm font-black text-gray-900">Two-Factor Authentication</p>
                    <p className="text-[10px] font-medium text-gray-400">Require PIN on grade lock &amp; signature</p>
                  </div>
                </div>
                <button className={cn("w-14 h-8 rounded-full relative p-1.5", mfaEnabled ? "bg-emerald-600 shadow-lg shadow-emerald-900/20" : "bg-gray-200")}>
                  <motion.div className="w-5 h-5 bg-white rounded-full shadow-sm" animate={{ x: mfaEnabled ? 24 : 0 }} />
                </button>
              </div>
            </div>
          </section>

          {/* Smart AI Gates */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
              <Activity className="text-gray-900" size={20} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Smart AI Gates</h2>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Clock className="text-gray-700" size={20} />
                  <div>
                    <p className="text-sm font-black text-gray-900">Grade Change Window</p>
                    <p className="text-[10px] font-medium text-gray-400">24-hour reconsideration window after submission</p>
                  </div>
                </div>
                <button className={cn("w-14 h-8 rounded-full relative p-1.5", true ? "bg-emerald-600 shadow-lg shadow-emerald-900/20" : "bg-gray-200")}>
                  <motion.div className="w-5 h-5 bg-white rounded-full shadow-sm" animate={{ x: true ? 24 : 0 }} />
                </button>
              </div>
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <QrCode className="text-gray-700" size={20} />
                  <div>
                    <p className="text-sm font-black text-gray-900">QR Grade-Certificate Gate</p>
                    <p className="text-[10px] font-medium text-gray-400">Lock grades after QR cert is issued</p>
                  </div>
                </div>
                <button className={cn("w-14 h-8 rounded-full relative p-1.5", true ? "bg-emerald-600 shadow-lg shadow-emerald-900/20" : "bg-gray-200")}>
                  <motion.div className="w-5 h-5 bg-white rounded-full shadow-sm" animate={{ x: true ? 24 : 0 }} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
