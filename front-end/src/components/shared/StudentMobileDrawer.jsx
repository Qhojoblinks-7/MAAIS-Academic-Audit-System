import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  X, Calendar, LogOut, LifeBuoy, Settings, BarChart3, Bell, BookOpen, Award, LineChart, GraduationCap
} from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useRole } from '../../context/RoleContext';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { User as UserIcon } from "lucide-react";

export function StudentMobileDrawer() {
  const { mobileMenuOpen, setMobileMenuOpen } = useUI();
  const { user } = useRole();
  const location = useLocation();

  const studentNavItems = [
    { icon: GraduationCap, label: 'Dashboard', id: 'dashboard', path: '/student/portal' },
    { icon: Calendar, label: 'Timetable', id: 'timetable', path: '/timetable' },
  ];

  const studentPortalTabs = [
    { icon: BarChart3, label: 'Academic', hash: '#academic', id: 'academic' },
    { icon: Bell, label: 'Interventions', hash: '#interventions', id: 'interventions' },
    { icon: BookOpen, label: 'History', hash: '#history', id: 'history' },
    { icon: Award, label: 'Grading Scale', hash: '#gradingScale', id: 'gradingScale' },
    { icon: BookOpen, label: 'Academic Journey', hash: '#academicJourney', id: 'academicJourney' },
    { icon: LineChart, label: 'Broadsheet Comparison', hash: '#broadsheetComparison', id: 'broadsheetComparison' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const avatarSrc = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'default')}`;

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] lg:hidden"
          />

          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-[280px] bg-white z-[120] lg:hidden flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-800/20">
                  M
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 tracking-tight">MAAIS</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Student Portal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 overscroll-contain">
              <nav className="space-y-1">
                {studentNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all cursor-pointer",
                        isActive
                          ? "bg-slate-50 text-emerald-800 font-bold"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                      )}
                    >
                      <item.icon size={20} className={isActive ? "text-emerald-800" : "text-slate-400"} />
                      <span className="flex-1 text-[14px] tracking-tight">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Portal Sections</p>
                <nav className="space-y-1">
                  {studentPortalTabs.map((tab) => {
                    const tabHash = tab.hash.slice(1);
                    const currentHash = location.hash.slice(1) || 'overview';
                    const isActive = currentHash === tabHash;
                    return (
                      <Link
                        key={tab.id}
                        to={`/student/portal${tab.hash}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-[14px] tracking-tight cursor-pointer",
                          isActive
                            ? "bg-emerald-50/60 text-emerald-900 font-black"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        )}
                      >
                        <tab.icon size={20} className={isActive ? "text-emerald-800" : "text-slate-400"} />
                        {tab.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 space-y-1">
                <Link
                  to="/support"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-[14px] tracking-tight cursor-pointer font-medium",
                    location.pathname === '/support' ? "bg-slate-50 text-emerald-800 font-bold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <LifeBuoy size={20} className={location.pathname === '/support' ? "text-emerald-800" : "text-slate-400"} />
                  ICT Support
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-[14px] tracking-tight cursor-pointer font-medium",
                    location.pathname === '/settings' ? "bg-slate-50 text-emerald-800 font-bold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Settings size={20} className={location.pathname === '/settings' ? "text-emerald-800" : "text-slate-400"} />
                  Settings
                </Link>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto shrink-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden shrink-0">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={avatarSrc} alt="User Profile" />
                    <AvatarFallback className="bg-brand-secondary/10 text-brand-secondary">
                      <UserIcon size={20} />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-900 tracking-tight truncate">{user?.name || 'System User'}</p>
                  <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">{user?.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-600 font-bold rounded-2xl text-xs hover:bg-rose-100 transition-all border border-rose-100 cursor-pointer"
              >
                <LogOut size={16} />
                Terminate Session
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default StudentMobileDrawer;