import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Cpu,
  Clock,
  ShieldCheck,
  LifeBuoy,
  Settings,
  LogOut,
  X,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { useUI } from '../../context/UIContext';
import { adminService } from '../../services';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export function AdminSidebar() {
  const location = useLocation();
  const { user } = useRole();
  const { setSettingsModalOpen, setSupportModalOpen } = useUI();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [activeSubMenu, setActiveSubMenu] = React.useState(null);
  const [pendingAdminItems, setPendingAdminItems] = React.useState(0);
  const sidebarRef = React.useRef(null);

  const fetchPendingAdminItems = React.useCallback(async () => {
    try {
      const [ticketsRes, approvalsRes] = await Promise.all([
        adminService.listTickets(),
        adminService.getApprovals(),
      ]);
      const tickets = Array.isArray(ticketsRes?.data ?? ticketsRes) ? (ticketsRes.data || ticketsRes) : [];
      const approvals = Array.isArray(approvalsRes?.data ?? approvalsRes) ? (approvalsRes.data || approvalsRes) : [];
      setPendingAdminItems(tickets.length + approvals.length);
    } catch {
      setPendingAdminItems(0);
    }
  }, []);

  React.useEffect(() => {
    fetchPendingAdminItems();
    const interval = setInterval(fetchPendingAdminItems, 30000);
    return () => clearInterval(interval);
  }, [fetchPendingAdminItems]);

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
      label: 'Dashboard', 
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
        { label: 'Student Records', path: '/identity/students' },
        { label: 'Parent Records', path: '/identity/parents' }
      ]
    },
    { 
      icon: Cpu, 
      label: 'Curriculum', 
      id: 'architect', 
      subItems: [
        { label: 'Subject Curriculum', path: '/academic-architect' },
        { label: 'Grading Rules', path: '/grading' }
      ]
    },
    { 
      icon: Clock, 
      label: 'Scheduling', 
      id: 'scheduling', 
      path: '/timetable'
    },
    { 
      icon: ShieldCheck, 
      label: 'Administration', 
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
      <aside ref={sidebarRef} className="w-20 h-screen bg-background border-r border-border flex flex-col items-center py-8 gap-8 z-[60] select-none shrink-0 print:hidden font-sans">
        <Link to="/" className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-surface font-semibold text-xl shadow-lg shadow-brand-primary/20 transition-transform active:scale-95">
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
                        ? "bg-surface text-brand-primary shadow-md ring-1 ring-border" 
                        : "text-text-secondary hover:bg-surface hover:text-text-primary"
                    )}
                    title={item.label}
                  >
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && <div className="absolute left-0 w-1 h-5 bg-brand-secondary rounded-r-full" />}
                  </button>
                ) : (
                  <Link
                    to={item.path || '#'}
                    onClick={() => setActiveSubMenu(null)}
                    className={cn(
                      "rounded-2xl transition-all duration-200 relative w-12 h-12 flex items-center justify-center shrink-0",
                      isActive
                        ? "bg-surface text-brand-primary shadow-md ring-1 ring-border"
                        : "text-text-secondary hover:bg-surface hover:text-text-primary"
                    )}
                    title={item.label}
                  >
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && <div className="absolute left-0 w-1 h-5 bg-brand-secondary rounded-r-full" />}
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
                      className="fixed left-24 w-48 bg-surface rounded-2xl shadow-xl border border-border py-3 px-2 z-[9999] ring-1 ring-text-primary/5"
                    >
                      <div className="mb-2 px-2.5">
                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest opacity-80">
                          {item.label}
                        </p>
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
                                  ? "bg-brand-primary text-surface shadow-sm"
                                  : "text-text-secondary hover:bg-muted hover:text-text-primary"
                              )}
                            >
                              <span className="text-sm font-medium tracking-wide truncate">{sub.label}</span>
                              <ChevronRight size={12} className={cn(
                                "transition-transform shrink-0",
                                isSubActive ? "text-surface/80" : "text-text-secondary/60 group-hover/item:translate-x-0.5"
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
            className="p-3 rounded-2xl text-text-secondary hover:bg-surface hover:text-text-primary transition-all duration-200 w-12 h-12 flex items-center justify-center"
            title="Help & Support"
          >
            <LifeBuoy size={22} />
          </button>
          
          <button 
            onClick={() => setSettingsModalOpen(true)}
            className="p-3 rounded-2xl text-text-secondary hover:bg-surface hover:text-text-primary transition-all duration-200 w-12 h-12 flex items-center justify-center"
            title="Settings"
          >
            <Settings size={22} />
          </button>

          <button 
            onClick={() => setShowLogoutModal(true)}
            className="p-3 rounded-2xl text-text-secondary hover:bg-danger/10 hover:text-danger transition-all duration-200 w-12 h-12 flex items-center justify-center" 
            title="Logout"
          >
            <LogOut size={22} />
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-md"
            >
              <Card className="rounded-3xl shadow-2xl overflow-hidden border border-border bg-surface">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-danger/10 rounded-2xl flex items-center justify-center text-danger">
                      <AlertTriangle size={24} />
                    </div>
                    <Button
                      variant="ghost"
                      className="p-2 h-auto text-text-secondary hover:text-text-primary"
                      onClick={() => setShowLogoutModal(false)}
                      aria-label="Close"
                    >
                      <X size={20} />
                    </Button>
                  </div>

                  <h3 className="text-xl font-semibold text-text-primary tracking-tight mb-2">Terminate Session?</h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-6">
                    Are you sure you want to log out? Your access tokens will be cleared from this browser session.
                  </p>

                  {pendingAdminItems > 0 && (
                    <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 mb-6 flex gap-3.5">
                      <div className="text-warning shrink-0 mt-0.5">
                        <AlertTriangle size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-text-primary">Pending Administrative Tasks</p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          You have {pendingAdminItems} open ticket{pendingAdminItems !== 1 ? 's' : ''} and pending approval{pendingAdminItems !== 1 ? 's' : ''} awaiting your action.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 py-3 border-border text-text-primary hover:bg-muted"
                      onClick={() => setShowLogoutModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 py-3 bg-danger text-surface hover:bg-danger/90"
                      onClick={handleLogout}
                    >
                      Log Out
                    </Button>
                  </div>
                </div>
                <div className="bg-muted py-3.5 text-center border-t border-border">
                   <p className="text-xs font-bold text-text-secondary uppercase tracking-widest opacity-80">Secure Session</p>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
