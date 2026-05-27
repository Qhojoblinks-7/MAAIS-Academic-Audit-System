import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Cpu, 
  Clock, 
  Wallet, 
  MessageSquare, 
  ShieldCheck, 
  LifeBuoy, 
  Settings, 
  LogOut, 
  X, 
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { useUI } from '../../context/UIContext';

export function AdminSidebar() {
   const location = useLocation();
   const { user } = useRole();
   const { setSettingsModalOpen, setSupportModalOpen } = useUI();
   const [showLogoutModal, setShowLogoutModal] = React.useState(false);
   const [activeSubMenu, setActiveSubMenu] = React.useState(null);
   const sidebarRef = React.useRef(null);

   React.useEffect(() => {
     function handleClickOutside(event) {
       if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
         setActiveSubMenu(null);
       }
     }
     document.addEventListener('mousedown', handleClickOutside);
     return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   React.useEffect(() => {
     setActiveSubMenu(null);
   }, [location.pathname]);

  const adminMenu = [
    { 
      icon: LayoutDashboard, 
      label: 'Pulse', 
      id: 'dashboard', 
      path: '/' 
    },
    { 
      icon: Users, 
      label: 'People', 
      id: 'people', 
      subItems: [
        { label: 'Staff Directory', path: '/identity/staff' },
        { label: 'Department Structure', path: '/identity/departments' },
        { label: 'Student Registry', path: '/identity/students' },
        { label: 'Parent Registry', path: '/identity/parents' }
      ]
    },
    { 
      icon: Cpu, 
      label: 'Engine Room', 
      id: 'architect', 
      subItems: [
        { label: 'Class/Form Manager', path: '/identity/classes' },
        { label: 'Subject Curriculum', path: '/academic-architect' },
        { label: 'Grading Rules', path: '/grading' }
      ]
    },
    { 
      icon: Clock, 
      label: 'Scheduling', 
      id: 'scheduling', 
      subItems: [
        { label: 'Master Timetable', path: '/timetable' },
        { label: 'Event Calendar', path: '/calendar' }
      ]
    },
    { 
      icon: Wallet, 
      label: 'Finance', 
      id: 'finance', 
      path: '/finance'
    },
    { 
      icon: MessageSquare, 
      label: 'Comms', 
      id: 'comms', 
      path: '/comms'
    },
    { 
      icon: ShieldCheck, 
      label: 'Vault', 
      id: 'vault', 
      subItems: [
        { label: 'User Permissions', path: '/system' },
        { label: 'Academic Archive', path: '/archive' },
        { label: 'System Forensics', path: '/audit/extended' },
        { label: 'Academic Audit', path: '/audit' }
      ]
    }
  ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <>
      <aside ref={sidebarRef} className="w-20 h-screen bg-slate-50 border-r border-slate-200/60 flex flex-col items-center py-8 gap-8 z-[60] select-none shrink-0 print:hidden">
        <Link to="/" className="w-12 h-12 bg-brand-teal rounded-2xl flex items-center justify-center text-white font-semibold text-xl shadow-lg shadow-brand-teal/20 transition-transform active:scale-95">
          A
        </Link>
        
        <nav className="flex-1 flex flex-col gap-4 w-full px-3 overflow-y-auto no-scrollbar">
          {adminMenu.map((item) => {
            const isActive = location.pathname === item.path || (item.subItems?.some(s => location.pathname === s.path));
            const hasSubMenu = !!item.subItems;
            
            return (
              <div key={item.id} className="relative flex justify-center w-full">
                {hasSubMenu ? (
                  <button
                    onClick={() => setActiveSubMenu(activeSubMenu === item.id ? null : item.id)}
                    className={cn(
                      "p-3 rounded-2xl transition-all duration-200 relative w-12 h-12 flex items-center justify-center",
                      isActive 
                        ? "bg-white text-brand-teal shadow-md shadow-slate-200/40 ring-1 ring-slate-100/80" 
                        : "text-slate-400 hover:bg-white hover:text-slate-900"
                    )}
                    title={item.label}
                  >
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && <div className="absolute left-0 w-1 h-5 bg-brand-teal rounded-r-full" />}
                  </button>
                ) : (
                  <Link
                    to={item.path || '#'}
                    onClick={() => setActiveSubMenu(null)}
                    className={cn(
                      "rounded-2xl transition-all duration-200 relative w-12 h-12 flex items-center justify-center shrink-0",
                      isActive
                        ? "bg-white text-brand-teal shadow-md shadow-slate-200/40 ring-1 ring-slate-100/80"
                        : "text-slate-400 hover:bg-white hover:text-slate-900"
                    )}
                    title={item.label}
                  >
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && <div className="absolute left-0 w-1 h-5 bg-brand-teal rounded-r-full" />}
                  </Link>
                )}

                {/* Popout Submenu */}
                <AnimatePresence>
                  {activeSubMenu === item.id && item.subItems && (
                    <motion.div
                      initial={{ opacity: 0, x: -8, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -8, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="fixed left-24 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 px-2 z-[9999] ring-1 ring-slate-900/5"
                    >
                      <div className="mb-2 px-2.5">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                      </div>
                      <div className="space-y-0.5">
                        {item.subItems.map((sub, idx) => {
                          const isSubActive = location.pathname === sub.path;
                          return (
                            <Link
                              key={idx}
                              to={sub.path}
                              onClick={() => setActiveSubMenu(null)}
                              className={cn(
                                "flex items-center justify-between p-2 rounded-xl transition-all group/item",
                                isSubActive
                                  ? "bg-slate-900 text-white shadow-sm"
                                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                              )}
                            >
                              <span className="text-[11px] font-medium tracking-wide truncate">{sub.label}</span>
                              <ChevronRight size={12} className={cn(
                                "transition-transform shrink-0",
                                isSubActive ? "text-slate-400" : "text-slate-300 group-hover/item:translate-x-0.5"
                              )} />
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="flex flex-col gap-4 mt-auto px-3 w-full items-center">
          <button 
            onClick={() => setSupportModalOpen(true)}
            className="p-3 rounded-2xl text-slate-400 hover:bg-white hover:text-slate-600 transition-all duration-200 w-12 h-12 flex items-center justify-center"
            title="ICT System Help"
          >
            <LifeBuoy size={22} />
          </button>
          
          <button 
            onClick={() => setSettingsModalOpen(true)}
            className="p-3 rounded-2xl text-slate-400 hover:bg-white hover:text-slate-600 transition-all duration-200 w-12 h-12 flex items-center justify-center"
            title="System Configuration"
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

      {/* Logout Confirmation Modal */}
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