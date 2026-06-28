import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  AlertCircle,
  ClipboardCheck,
  GraduationCap,
  Database,
  ShieldCheck,
  LifeBuoy,
  Settings,
  LogOut,
  X,
  AlertTriangle,
  Users,
  BookOpen,
  BarChart3,
  Award,
  Activity,
  FolderOpen,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { useUI } from '../../context/UIContext';
import { useHOD } from '../../context/HODContext';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

export function HODSidebar() {
  const location = useLocation();
  const { user } = useRole();
  const { setSettingsModalOpen, setSupportModalOpen } = useUI();
  const { totalAlerts, revisions, activeSessions } = useHOD();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [activeSubMenu, setActiveSubMenu] = React.useState(null);
  const sidebarRef = useRef(null);
  const pendingRevisionsCount = Array.isArray(revisions) 
    ? revisions.filter(r => r.status === 'PENDING').length 
    : 0;
  
  const unsavedMarks = React.useMemo(() => {
    try {
      const drafts = JSON.parse(localStorage.getItem('hodDraftRecords') || '{}');
      return Object.keys(drafts || {}).length;
    } catch {
      return 0;
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setActiveSubMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveSubMenu(null);
  }, [location.pathname]);

  const hodMenu = [
    {
      icon: LayoutDashboard,
      label: 'Departmental Pulse',
      id: 'hod-dashboard',
      path: '/',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      id: 'hod-analytics',
      path: '/hod/analytics',
    },
    ...(pendingRevisionsCount > 0 ? [{
      icon: AlertCircle,
      label: 'Revision Approvals',
      id: 'hod-revisions',
      path: '/revisions',
      badge: pendingRevisionsCount
    }] : [{
      icon: AlertCircle,
      label: 'Revision Approvals',
      id: 'hod-revisions',
      path: '/revisions',
    }]),
    {
      icon: FileText,
      label: 'Audit Log',
      id: 'hod-audit',
      path: '/hod/audit'
    },
    {
      icon: Users,
      label: 'Teachers',
      id: 'hod-teachers',
      path: '/hod/teachers'
    },
    {
      icon: BookOpen,
      label: 'Interventions',
      id: 'hod-interventions',
      path: '/hod/interventions'
    },
    {
      icon: Activity,
      label: 'Grade Review',
      id: 'hod-review',
      path: '/hod/review'
    },
    {
      icon: Database,
      label: 'Lock & Export',
      id: 'hod-lock-export',
      path: '/hod/lock-export'
    },
    {
      icon: FolderOpen,
      label: 'Broadsheet',
      id: 'hod-broadsheet',
      path: '/hod/broadsheet'
    },
    ...(totalAlerts > 0 ? [{
      icon: Award,
      label: 'Certification Desk',
      id: 'hod-certification',
      path: '/certification',
      badge: totalAlerts,
      badgeColor: 'bg-emerald-600'
    }] : [{
      icon: Award,
      label: 'Certification Desk',
      id: 'hod-certification',
      path: '/certification',
    }]),
    {
      icon: Database,
      label: 'Department Archives',
      id: 'hod-archive',
      path: '/archive'
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <>
      <aside ref={sidebarRef} className="w-20 h-screen bg-background border-r border-border flex flex-col items-center py-8 gap-8 z-[60] select-none shrink-0 print:hidden">
        <Link to="/" className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-surface font-semibold text-xl shadow-lg shadow-brand-primary/20 transition-transform active:scale-95" title="Home">
          H
        </Link>

        <nav className="flex-1 flex flex-col gap-4 w-full px-3 overflow-y-auto no-scrollbar">
          {hodMenu.map((item) => {
            const isActive = location.pathname === item.path || (item.subItems?.some(s => location.pathname === s.path));
            const hasSubMenu = !!item.subItems;
            const isSubMenuOpen = activeSubMenu === item.id;

            return (
              <div key={item.id} className="relative flex justify-center w-full">
                {hasSubMenu ? (
                  <button
                    onClick={() => setActiveSubMenu(isSubMenuOpen ? null : item.id)}
                    className={cn(
                      "p-3 rounded-2xl transition-all duration-200 relative w-12 h-12 flex items-center justify-center",
                      isActive || isSubMenuOpen
                        ? "bg-surface text-brand-primary shadow-md ring-1 ring-border"
                        : "text-text-secondary hover:bg-surface hover:text-text-primary"
                    )}
                    title={item.label}
                  >
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && <div className="absolute left-0 w-1 h-5 bg-brand-primary rounded-r-full" />}
                  </button>
                ) : (
                  <Link
                    to={item.path || '#'}
                    className={cn(
                      "rounded-2xl transition-all duration-200 relative w-12 h-12 flex items-center justify-center shrink-0",
                      isActive
                        ? "bg-surface text-brand-primary shadow-md ring-1 ring-border"
                        : "text-text-secondary hover:bg-surface hover:text-text-primary"
                    )}
                    title={item.label}
                  >
                    <div className="relative flex items-center justify-center w-6 h-6">
                      <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />

                      {item.badge > 0 && (
                        <div className={cn(
                          "absolute -top-2 -right-2 px-1.5 min-w-[1.25rem] h-5 text-surface text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-background shadow-sm pointer-events-none",
                          item.badgeColor || "bg-danger"
                        )}>
                          {item.badge}
                        </div>
                      )}
                    </div>
                    {isActive && <div className="absolute left-0 w-1 h-5 bg-brand-primary rounded-r-full" />}
                  </Link>
                )}

                <AnimatePresence>
                  {isSubMenuOpen && item.subItems && (
                    <motion.div
                      initial={{ opacity: 0, x: -8, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -8, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute left-[calc(100%+14px)] top-0 w-48 bg-surface rounded-2xl shadow-xl border border-border py-3 px-2 z-[60] ring-1 ring-brand-dark/5"
                    >
                      <div className="mb-2 px-2.5">
                        <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">{item.label}</p>
                        <h4 className="text-[13px] font-semibold text-text-primary tracking-tight">{item.subHeader || 'Options'}</h4>
                      </div>
                      <div className="space-y-0.5">
                        {item.subItems.map((sub, idx) => {
                          const isSubActive = location.pathname === sub.path;
                          return (
                            <Link
                              key={idx}
                              to={sub.path}
                              className={cn(
                                "flex items-center justify-between p-2 rounded-xl transition-all group/item",
                                isSubActive
                                  ? "bg-brand-primary text-surface shadow-sm"
                                  : "text-text-secondary hover:bg-muted hover:text-text-primary"
                              )}
                            >
                              <span className="text-[11px] font-medium tracking-wide truncate">{sub.label}</span>
                              <ChevronRight size={12} className={cn(
                                "transition-transform shrink-0",
                                isSubActive ? "text-text-secondary" : "text-border group-hover/item:translate-x-0.5"
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
            title="ICT Managerial Desk"
          >
            <LifeBuoy size={22} />
          </button>
          <button
            onClick={() => setSettingsModalOpen(true)}
            className="p-3 rounded-2xl text-text-secondary hover:bg-surface hover:text-text-primary transition-all duration-200 w-12 h-12 flex items-center justify-center"
            title="Authority Settings"
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

      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              className="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl overflow-hidden border border-border"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-warning/10 rounded-2xl flex items-center justify-center text-warning">
                    <AlertTriangle size={24} />
                  </div>
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="p-2 hover:bg-muted rounded-xl transition-all text-text-secondary hover:text-text-primary"
                  >
                    <X size={20} />
                  </button>
                </div>

                <h3 className="text-xl font-semibold text-text-primary tracking-tight mb-2">Terminate Session?</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">
                  Are you sure you want to log out? Your access tokens will be cleared from this browser session.
                </p>

                {unsavedMarks > 0 && (
                  <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 mb-6 flex gap-3.5">
                    <div className="text-warning shrink-0 mt-0.5">
                      <AlertCircle size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-text-primary">Unsaved Data Discovered</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        There are {unsavedMarks} data nodes currently sitting in your local cache.
                      </p>
                    </div>
                  </div>
                )}

                {Array.isArray(activeSessions) && activeSessions.length > 0 && (
                  <div className="bg-surface border border-border rounded-2xl p-4 mb-6">
                    <p className="text-xs font-semibold text-text-primary mb-2">Active Sessions</p>
                    <p className="text-xs text-text-secondary">{activeSessions.length} other session(s) active</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 py-3 bg-muted text-text-primary font-medium rounded-xl text-sm hover:bg-border transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-3 bg-danger text-surface font-medium rounded-xl text-sm hover:bg-danger/80 transition-all"
                  >
                    Log Out
                  </button>
                </div>
              </div>
              <div className="bg-muted py-3.5 text-center border-t border-border">
                <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Technical Protocol Secure</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default HODSidebar;