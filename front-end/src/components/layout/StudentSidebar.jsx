import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  LifeBuoy,
  Settings,
  LogOut,
  GraduationCap,
  BarChart3,
  Bell,
  BookOpen,
  Award,
  LineChart,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';

export function StudentSidebar() {
  const location = useLocation();
  const { user } = useRole();

  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [unsavedMarks] = React.useState(12);
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
        className="w-20 h-screen bg-background border-r border-border flex flex-col items-center py-8 gap-8 z-30 select-none shrink-0 print:hidden"
      >
        <Link to="/" className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-surface font-semibold text-xl shadow-lg shadow-brand-primary/20 transition-transform active:scale-95" title="Home">
          M
        </Link>

        <nav
          className="flex-1 flex flex-col gap-4 w-full px-3 overflow-y-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path || '#'}
                className={cn(
                  "rounded-2xl transition-all duration-200 relative w-12 h-12 flex items-center justify-center shrink-0",
                  isActive ? "bg-surface text-brand-primary shadow-md" : "text-text-secondary hover:bg-surface hover:text-text-primary"
                )}
                title={item.label}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && <motion.div layoutId="activeIndicator" className="absolute left-0 w-1 h-5 bg-brand-secondary rounded-r-full" />}
              </Link>
            );
          })}

          <div className="border-t border-border my-2 shrink-0" />

          {portalTabs.map((tab) => {
            const isActive = (location.hash || '#overview') === tab.hash && location.pathname === '/student/portal';
            return (
              <Link
                key={tab.id}
                to={`/student/portal${tab.hash}`}
                className={cn(
                  "rounded-2xl transition-all duration-200 relative w-12 h-12 flex items-center justify-center shrink-0",
                  isActive ? "bg-surface text-brand-primary shadow-md" : "text-text-secondary hover:bg-surface hover:text-text-primary"
                )}
                title={tab.label}
              >
                <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && <motion.div layoutId="activeTabIndicator" className="absolute left-0 w-1 h-5 bg-brand-primary rounded-r-full" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-4 mt-auto px-3 w-full items-center shrink-0">
          <Link to="/support" className="w-12 h-12 rounded-2xl transition-all duration-200 relative flex items-center justify-center shrink-0 text-text-secondary hover:bg-surface hover:text-text-primary" title="ICT Support">
            <LifeBuoy size={22} />
          </Link>
          <Link to="/settings" className="w-12 h-12 rounded-2xl transition-all duration-200 relative flex items-center justify-center shrink-0 text-text-secondary hover:bg-surface hover:text-text-primary" title="Settings">
            <Settings size={22} />
          </Link>
          <button type="button" onClick={() => setShowLogoutModal(true)} className="w-12 h-12 rounded-2xl transition-all duration-200 relative flex items-center justify-center shrink-0 text-text-secondary hover:text-danger hover:bg-danger/10" title="Logout">
            <LogOut size={22} />
          </button>
        </div>
      </aside>

      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogoutModal(false)} className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-surface rounded-3xl p-8 border border-border">
              <h3 className="text-xl font-semibold text-text-primary tracking-tight mb-2">Terminate Session?</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">Are you sure you want to log out?</p>

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

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 border rounded-xl">Cancel</button>
                <button type="button" onClick={handleLogout} className="flex-1 py-3 bg-danger text-surface rounded-xl">Log Out</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default StudentSidebar;