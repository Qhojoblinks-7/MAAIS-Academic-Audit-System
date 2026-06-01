import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Calendar, 
  AlertCircle, 
  ClipboardCheck, 
  GraduationCap, 
  Database, 
  LifeBuoy, 
  Settings, 
  LogOut, 
  X, 
  AlertTriangle,
  BarChart3,
  Eye
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { useUI } from '../../context/UIContext';

export function TeacherSidebar() {
  const location = useLocation();
  const { user } = useRole();
  const { setSettingsModalOpen, setSupportModalOpen } = useUI();
  
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [unsavedMarks] = React.useState(12);

  const teacherMenu = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      id: 'dashboard', 
      path: '/' 
    },
    { 
      icon: Calendar, 
      label: 'Timetable', 
      id: 'timetable', 
      path: '/timetable' 
    },
    { 
      icon: AlertCircle, 
      label: 'Revisions', 
      id: 'revisions', 
      path: '/revisions',
      badge: 3 
    },
    { 
      icon: ClipboardCheck, 
      label: 'Missing Obs', 
      id: 'missing-obs', 
      path: '/missing-observations',
      badge: 5, 
      badgeColor: 'bg-amber-500' 
    },
    { 
      icon: GraduationCap, 
      label: 'Grading', 
      id: 'grading', 
      path: '/grading' 
    },
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      id: 'analytics', 
      path: '/teacher/analytics' 
    },
    { 
      icon: Eye, 
      label: 'Observations', 
      id: 'observations', 
      path: '/teacher/observations' 
    },
    { 
      icon: Database, 
      label: 'Archive', 
      id: 'archive', 
      path: '/archive' 
    }
  ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <>
      <aside className="w-20 h-screen bg-slate-50 border-r border-slate-200/60 flex flex-col items-center py-8 gap-8 z-[60] select-none shrink-0 print:hidden">
        <Link to="/" className="w-12 h-12 bg-brand-teal rounded-2xl flex items-center justify-center text-white font-semibold text-xl shadow-lg shadow-brand-teal/20 transition-transform active:scale-95">
          M
        </Link>
        
        <nav className="flex-1 flex flex-col gap-4 w-full px-3 overflow-y-auto no-scrollbar">
          {teacherMenu.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <div key={item.id} className="relative flex justify-center w-full">
                <Link
                  to={item.path}
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
                    
                    {item.badge && (
                      <div className={cn(
                        "absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[1.15rem] h-4.5 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-slate-50 shadow-sm pointer-events-none",
                        item.badgeColor || "bg-rose-500"
                      )}>
                        {item.badge}
                      </div>
                    )}
                  </div>
                  {isActive && <div className="absolute left-0 w-1 h-5 bg-brand-teal rounded-r-full" />}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="flex flex-col gap-4 mt-auto px-3 w-full items-center">
          <button
            onClick={() => setSupportModalOpen(true)}
            className="p-3 rounded-2xl text-slate-400 hover:bg-white hover:text-slate-600 transition-all duration-200 w-12 h-12 flex items-center justify-center"
            title="ICT Support"
          >
            <LifeBuoy size={22} />
          </button>
          
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="p-3 rounded-2xl text-slate-400 hover:bg-white hover:text-slate-600 transition-all duration-200 w-12 h-12 flex items-center justify-center"
            title="Settings"
          >
            <Settings size={22} />
          </button>

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

                {unsavedMarks > 0 && (
                  <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 mb-6 flex gap-3.5">
                    <div className="text-amber-600 shrink-0 mt-0.5">
                      <AlertCircle size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-900">Unsaved Data Discovered</p>
                      <p className="text-xs text-amber-700/80 mt-0.5">
                        There are {unsavedMarks} data nodes currently sitting in your local cache (SHS 2 Science).
                      </p>
                    </div>
                  </div>
                )}

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
