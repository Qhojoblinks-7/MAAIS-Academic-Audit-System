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
     if (user?.role !== 'TEACHER') return;
     teacherService.getMissingObservations?.()
       .then((data) => {
         const missing = Array.isArray(data)
           ? data.filter((item) => item.status === 'Missing').length
           : 0;
         setMissingObservationCount(missing);
       })
       .catch(() => setMissingObservationCount(0));
   }, [setMissingObservationCount, user?.role]);

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
    { icon: AlertCircle, label: 'Revisions', id: 'revisions', path: '/revisions', roles: ['TEACHER'], badge: revisionCount || 0, badgeColor: 'bg-destructive' },
     { icon: ClipboardCheck, label: 'Missing Obs', id: 'missing-obs', path: '/missing-observations', roles: ['TEACHER'], badge: missingObservationCount || 0, badgeColor: 'bg-warning' },
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

  const isAdminUser = user?.role === 'SUPER_ADMIN' || user?.role === 'HEADMASTER';
  const filteredItems = navItems.filter(item => user && (item.roles.includes(user.role) || (isAdminUser && item.roles.includes('ADMIN'))));
  const filteredStudentTabs = studentPortalTabs.filter(item => user && (item.roles.includes(user.role) || (isAdminUser && item.roles.includes('ADMIN'))));

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
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-[110] lg:hidden"
          />

          {/* Drawer Wrapper */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-[280px] bg-surface z-[120] lg:hidden flex flex-col shadow-2xl"
          >
            {/* Header Branding Container */}
             <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center text-background font-black text-xl shadow-lg shadow-foreground/20">
                  M
                </div>
                <div>
                   <p className="text-sm font-black text-foreground tracking-tight">MAAIS</p>
                   <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Security Node</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                 className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer"
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
                           ? "bg-muted text-foreground shadow-inner font-bold"
                           : "text-text-secondary hover:bg-muted hover:text-foreground font-medium"
                      )}
                    >
                       <item.icon size={20} className={cn(isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")} strokeWidth={isActive ? 2.5 : 2} />
                       <span className="flex-1 text-sm tracking-tight">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                           "px-2 py-0.5 text-xs font-bold text-background rounded-full",
                           item.badgeColor || "bg-destructive"
                        )}>
                          {item.badge}
                        </span>
                      )}
                       {isActive && <ChevronRight size={14} className="text-muted-foreground" />}
                    </Link>
                  );
                })}
</nav>

              {/* Dynamic Child Anchors for Student Dashboards */}
              {user?.role === 'STUDENT' && filteredStudentTabs.length > 0 && location.pathname.includes('/student/portal') && (
                 <div className="mt-6 pt-6 border-t border-border">
                   <p className="px-4 text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Portal Sections</p>
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
                              "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-sm tracking-tight cursor-pointer",
                              isActive
                                ? "bg-success/5 text-success font-black"
                                : "text-text-secondary hover:bg-muted hover:text-foreground font-medium"
                            )}
                          >
                            <tab.icon size={20} className={cn(isActive ? "text-success" : "text-muted-foreground")} />
                           {tab.label}
                         </Link>
                      );
                    })}
                  </nav>
                </div>
              )}

{/* Support & System Action Toggles */}
              <div className="mt-8 pt-8 border-t border-border space-y-1">
                {user?.role === 'STUDENT' ? (
                  <>
                    <Link
                      to="/support"
                      onClick={() => setMobileMenuOpen(false)}
                       className={cn(
                         "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-sm tracking-tight cursor-pointer font-medium",
                         location.pathname === '/support' ? "bg-muted text-foreground font-bold" : "text-text-secondary hover:bg-muted hover:text-foreground"
                       )}
                     >
                       <LifeBuoy size={20} className={cn(location.pathname === '/support' ? "text-foreground" : "text-muted-foreground")} />
                      ICT Support
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                       className={cn(
                         "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-sm tracking-tight cursor-pointer font-medium",
                         location.pathname === '/settings' ? "bg-muted text-foreground font-bold" : "text-text-secondary hover:bg-muted hover:text-foreground"
                       )}
                     >
                       <Settings size={20} className={cn(location.pathname === '/settings' ? "text-foreground" : "text-muted-foreground")} />
                      Settings
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => { setMobileMenuOpen(false); setSupportModalOpen(true); }}
                       className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-text-secondary hover:bg-muted hover:text-foreground transition-all font-medium text-sm tracking-tight cursor-pointer"
                     >
                       <LifeBuoy size={20} className="text-muted-foreground" />
                      ICT Support
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMobileMenuOpen(false); setSettingsModalOpen(true); }}
                       className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-text-secondary hover:bg-muted hover:text-foreground transition-all font-medium text-sm tracking-tight cursor-pointer"
                     >
                       <Settings size={20} className="text-muted-foreground" />
                      Settings
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Account Profile Block */}
            <div className="p-6 bg-muted border-t border-border mt-auto shrink-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-surface border border-border shadow-sm overflow-hidden shrink-0">
                  <img 
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'default')}`} 
                    alt="User Profile" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold text-foreground tracking-tight truncate">{user?.name || 'System User'}</p>
                   <p className="text-xs font-black text-success uppercase tracking-widest">{user?.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                 className="w-full flex items-center justify-center gap-2 py-4 bg-destructive/10 text-destructive font-bold rounded-2xl text-xs hover:bg-destructive/20 transition-all border border-destructive/20 cursor-pointer"
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