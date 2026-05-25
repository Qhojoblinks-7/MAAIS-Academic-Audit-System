import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  LifeBuoy,
  Settings,
  LogOut,
  GraduationCap,
  AlertTriangle,
  X,
  BarChart3,
  Bell,
  BookOpen,
  Award,
  LineChart,
  Clock,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';

export function StudentSidebar() {
  const location = useLocation();
  const { user } = useRole();
  
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const sidebarRef = useRef(null);

const navItems = [
    {
      icon: GraduationCap,
      label: 'Dashboard',
      id: 'dashboard',
      path: '/student/portal',
      roles: ['STUDENT'],
    },
    {
      icon: Calendar,
      label: 'Timetable',
      id: 'timetable',
      path: '/timetable',
      roles: ['STUDENT'],
    },
  ];

  const portalTabs = [
    { icon: BarChart3, label: 'Academic', hash: '#academic', id: 'academic' },
    { icon: Bell, label: 'Interventions', hash: '#interventions', id: 'interventions' },
    { icon: BookOpen, label: 'History', hash: '#history', id: 'history' },
    { icon: Award, label: 'Grading Scale', hash: '#gradingScale', id: 'gradingScale' },
    { icon: BookOpen, label: 'Academic Journey', hash: '#academicJourney', id: 'academicJourney' },
    { icon: LineChart, label: 'Broadsheet Comparison', hash: '#broadsheetComparison', id: 'broadsheetComparison' },
  ];


  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        // No submenus to close in student sidebar
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = navItems.filter(item => user && item.roles.includes(user.role));

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <>
<aside 
        ref={sidebarRef}
        className="w-20 h-screen bg-slate-50 border-r border-slate-200/60 flex flex-col items-center py-8 gap-8 z-30 select-none shrink-0 print:hidden"
      >
        <Link to="/" className="w-12 h-12 bg-brand-teal rounded-2xl flex items-center justify-center text-white font-semibold text-xl shadow-lg shadow-brand-teal/20 transition-transform active:scale-95">
          M
        </Link>

        <nav className="flex-1 flex flex-col gap-4 w-full px-3 overflow-y-auto no-scrollbar">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path || '#'}
                className={cn(
                  "rounded-2xl transition-all duration-200 relative w-12 h-12 flex items-center justify-center shrink-0",
                  isActive
                    ? "bg-white text-brand-teal shadow-md shadow-slate-200/40 ring-1 ring-slate-100/80"
                    : "text-slate-400 hover:bg-white hover:text-slate-900"
                )}
                title={item.label}
              >
                <div className="relative flex items-center justify-center w-6 h-6">
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {isActive && <div className="absolute left-0 w-1 h-5 bg-brand-teal rounded-r-full" />}
              </Link>
            );
          })}

          <div className="border-t border-slate-200 my-2" />

           {portalTabs.map((tab) => {
             const currentHash = location.hash || '#academic';
             const isActive = currentHash === tab.hash;
             return (
               <Link
                 key={tab.id}
                 to={`/student/portal${tab.hash}`}
                 className={cn(
                   "rounded-2xl transition-all duration-200 relative w-12 h-12 flex items-center justify-center shrink-0",
                   isActive
                     ? "bg-white text-brand-teal shadow-md shadow-slate-200/40 ring-1 ring-slate-100/80"
                     : "text-slate-400 hover:bg-white hover:text-slate-900"
                 )}
                 title={tab.label}
               >
                 <div className="relative flex items-center justify-center w-6 h-6">
                   <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                 </div>
                 {isActive && <div className="absolute left-0 w-1 h-5 bg-brand-teal rounded-r-full" />}
               </Link>
             );
           })}
        </nav>

        <div className="flex flex-col gap-4 mt-auto px-3 w-full items-center">
          <Link
            to="/support"
            className={cn(
              "p-3 rounded-2xl transition-all duration-200 w-12 h-12 flex items-center justify-center",
              location.pathname === '/support' ? "bg-white text-brand-teal shadow-md" : "text-slate-400 hover:bg-white hover:text-slate-600"
            )}
            title="ICT Support"
          >
            <LifeBuoy size={22} strokeWidth={location.pathname === '/support' ? 2.5 : 2} />
          </Link>
          <Link
            to="/settings"
            className={cn(
              "p-3 rounded-2xl transition-all duration-200 w-12 h-12 flex items-center justify-center",
              location.pathname === '/settings' ? "bg-white text-brand-teal shadow-md" : "text-slate-400 hover:bg-white hover:text-slate-600"
            )}
            title="Settings"
          >
            <Settings size={22} strokeWidth={location.pathname === '/settings' ? 2.5 : 2} />
          </Link>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="p-3 rounded-2xl text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 w-12 h-12 flex items-center justify-center"
            title="Logout"
          >
            <LogOut size={22} />
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                    <AlertTriangle size={24} />
                  </div>
                  <button 
                    onClick={() => setShowLogoutModal(false)} 
                    className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-600"
                  >
                    <X size={20} />
                  </button>
                </div>

                <h3 className="text-xl font-semibold text-slate-900 tracking-tight mb-2">Terminate Session?</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Are you sure you want to log out? Your access tokens will be cleared from this browser session.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 py-3 bg-slate-50 text-slate-700 font-medium rounded-xl text-sm hover:bg-slate-100 transition-all border border-slate-200/40"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-3 bg-rose-600 text-white font-medium rounded-xl text-sm hover:bg-rose-700 transition-all shadow-md shadow-rose-600/10"
                  >
                    Log Out
                  </button>
                </div>
              </div>
              <div className="bg-slate-50 py-3.5 text-center border-t border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Technical Protocol Secure</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}