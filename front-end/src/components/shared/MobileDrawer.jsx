import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  X, LayoutDashboard, Calendar, AlertCircle, ClipboardCheck,
  GraduationCap, Database, ShieldCheck, LogOut, ChevronRight,
  Users, Cpu, MessageSquare, BarChart3, Bell, BookOpen, Award, LineChart,
  LifeBuoy, Settings
} from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useRole } from '../../context/RoleContext';
import { cn } from '../../lib/utils';
import { teacherService } from '../../services';

export function MobileDrawer() {
  const { mobileMenuOpen, setMobileMenuOpen, setSettingsModalOpen, setSupportModalOpen, revisionCount, missingObservationCount, setMissingObservationCount } = useUI();
  const { user } = useRole();
  const location = useLocation();

  React.useEffect(() => {
    teacherService.getMissingObservations?.()
      .then((data) => {
        const missing = Array.isArray(data)
          ? data.filter((item) => item.status === 'Missing').length
          : 0;
        setMissingObservationCount(missing);
      })
      .catch(() => setMissingObservationCount(0));
  }, [setMissingObservationCount]);

  // Root Navigation Matrix
  const navItems = [
    { icon: LayoutDashboard, label: 'Pulse (Dashboard)', id: 'dashboard', path: '/', roles: ['TEACHER', 'HOD', 'ADMIN', 'STUDENT'] },
    { icon: Users, label: 'Staff Registry', id: 'staff', path: '/identity/staff', roles: ['ADMIN'] },
    { icon: Users, label: 'Student Registry', id: 'students', path: '/identity/students', roles: ['ADMIN'] },
    { icon: Users, label: 'Parent Registry', id: 'parents', path: '/identity/parents', roles: ['ADMIN'] },
    { icon: Cpu, label: 'Academic Blueprint', id: 'architect', path: '/academic-architect', roles: ['ADMIN'] },
    { icon: GraduationCap, label: 'Grading Rules', id: 'grading-admin', path: '/grading', roles: ['ADMIN'] },
    { icon: Calendar, label: 'Timetable', id: 'timetable', path: '/timetable', roles: ['TEACHER', 'STUDENT', 'ADMIN'] },
    { icon: Database, label: 'Finance & Assets', id: 'finance', path: '/finance', roles: ['ADMIN'] },
    { icon: MessageSquare, label: 'Notice Board', id: 'comms', path: '/comms', roles: ['ADMIN'] },
    { icon: ShieldCheck, label: 'User Roles', id: 'system', path: '/system', roles: ['ADMIN'] },
    { icon: Database, label: 'Extended Logs', id: 'audit-ext', path: '/audit/extended', roles: ['ADMIN'] },
    { icon: AlertCircle, label: 'Academic Audit', id: 'audit', path: '/audit', roles: ['HOD', 'ADMIN'] },
    { icon: AlertCircle, label: 'Revisions', id: 'revisions', path: '/revisions', roles: ['TEACHER'], badge: revisionCount || 0, badgeColor: 'bg-rose-500' },
     { icon: ClipboardCheck, label: 'Missing Obs', id: 'missing-obs', path: '/missing-observations', roles: ['TEACHER'], badge: missingObservationCount || 0, badgeColor: 'bg-amber-500' },
     { icon: GraduationCap, label: 'Grading', id: 'grading', path: '/grading', roles: ['TEACHER'] },
    { icon: GraduationCap, label: 'Teacher Hub', id: 'teacher-dashboard', path: '/teacher-dashboard', roles: ['TEACHER'] },
    { icon: Database, label: 'Archive', id: 'archive', path: '/archive', roles: ['TEACHER', 'HOD'] },
    { icon: ShieldCheck, label: 'Certification', id: 'certification', path: '/certification', roles: ['HOD'] },
    { icon: Users, label: 'Student Registry', id: 'students-mobile', path: '/identity/students', roles: ['HOD'] },
  ];

// Section Tabs for deep-linking Student data views without losing query identifiers
  const studentPortalTabs = [
    { icon: BarChart3, label: 'Academic', id: 'academic', hash: '#academic', roles: ['STUDENT'] },
    { icon: Bell, label: 'Interventions', id: 'interventions', hash: '#interventions', roles: ['STUDENT'] },
    { icon: BookOpen, label: 'History', id: 'history', hash: '#history', roles: ['STUDENT'] },
    { icon: Award, label: 'Grading Scale', id: 'gradingScale', hash: '#gradingScale', roles: ['STUDENT'] },
    { icon: BookOpen, label: 'Academic Journey', id: 'academicJourney', hash: '#academicJourney', roles: ['STUDENT'] },
    { icon: LineChart, label: 'Broadsheet Comparison', id: 'broadsheetComparison', hash: '#broadsheetComparison', roles: ['STUDENT'] },
  ];

const filteredItems = navItems.filter(item => user && item.roles.includes(user.role));
  const filteredStudentTabs = studentPortalTabs.filter(item => user && item.roles.includes(user.role));

const handleLogout = () => {
     localStorage.clear();
     sessionStorage.clear();
     window.location.href = '/';
   };

   return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Overlay Dimmer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] lg:hidden"
          />

          {/* Drawer Wrapper */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-[280px] bg-white z-[120] lg:hidden flex flex-col shadow-2xl"
          >
            {/* Header Branding Container */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-800/20">
                  M
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 tracking-tight">MAAIS</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Security Node</p>
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

            {/* Scrollable Navigation Nodes */}
            <div className="flex-1 overflow-y-auto py-6 px-4 overscroll-contain">
              <nav className="space-y-1">
                {filteredItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.id}
                      to={item.id === 'dashboard' && user?.role === 'STUDENT' ? `/student/portal` : item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group cursor-pointer",
                        isActive
                          ? "bg-slate-50 text-emerald-800 shadow-inner font-bold"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                      )}
                    >
                      <item.icon size={20} className={cn(isActive ? "text-emerald-800" : "text-slate-400 group-hover:text-slate-900")} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="flex-1 text-[14px] tracking-tight">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-bold text-white rounded-full",
                          item.badgeColor || "bg-rose-500"
                        )}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight size={14} className="text-emerald-800/40" />}
                    </Link>
                  );
                })}
</nav>

              {/* Dynamic Child Anchors for Student Dashboards */}
              {user?.role === 'STUDENT' && filteredStudentTabs.length > 0 && location.pathname.includes('/student/portal') && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Portal Sections</p>
                  <nav className="space-y-1">
                    {filteredStudentTabs.map((tab) => {
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
                           <tab.icon size={20} className={cn(isActive ? "text-emerald-800" : "text-slate-400")} />
                           {tab.label}
                         </Link>
                      );
                    })}
                  </nav>
                </div>
              )}

{/* Support & System Action Toggles */}
              <div className="mt-8 pt-8 border-t border-slate-100 space-y-1">
                {user?.role === 'STUDENT' ? (
                  <>
                    <Link
                      to="/support"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-[14px] tracking-tight cursor-pointer font-medium",
                        location.pathname === '/support' ? "bg-slate-50 text-emerald-800 font-bold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <LifeBuoy size={20} className={cn(location.pathname === '/support' ? "text-emerald-800" : "text-slate-400")} />
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
                      <Settings size={20} className={cn(location.pathname === '/settings' ? "text-emerald-800" : "text-slate-400")} />
                      Settings
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => { setMobileMenuOpen(false); setSupportModalOpen(true); }}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all font-medium text-[14px] tracking-tight cursor-pointer"
                    >
                      <LifeBuoy size={20} className="text-slate-400" />
                      ICT Support
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMobileMenuOpen(false); setSettingsModalOpen(true); }}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all font-medium text-[14px] tracking-tight cursor-pointer"
                    >
                      <Settings size={20} className="text-slate-400" />
                      Settings
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Account Profile Block */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto shrink-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden shrink-0">
                  <img 
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'default')}`} 
                    alt="User Profile" 
                    className="w-full h-full object-cover" 
                  />
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

export default MobileDrawer;