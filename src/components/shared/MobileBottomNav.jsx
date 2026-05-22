import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, Cpu, MessageSquare, MoreHorizontal,
  ClipboardCheck, GraduationCap, ShieldCheck, TrendingUp, Calendar,
} from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useRole } from '../../context/RoleContext';
import { cn } from '../../lib/utils';

const baseItems = [
  { icon: LayoutDashboard, label: 'Pulse', path: '/', roles: ['TEACHER', 'HOD', 'ADMIN', 'STUDENT'] },
];

const roleExtraItems = {
  TEACHER: [
    { icon: GraduationCap, label: 'Grade', path: '/grading', roles: ['TEACHER'] },
    { icon: ClipboardCheck, label: 'Revisions', path: '/revisions', roles: ['TEACHER'] },
    { icon: Calendar, label: 'Timetable', path: '/timetable', roles: ['TEACHER'] },
  ],
  HOD: [
    { icon: GraduationCap, label: 'Grade', path: '/grading', roles: ['HOD'] },
    { icon: ShieldCheck, label: 'Certify', path: '/certification', roles: ['HOD'] },
    { icon: ClipboardCheck, label: 'Revisions', path: '/revisions', roles: ['HOD'] },
  ],
  STUDENT: [
    { icon: TrendingUp, label: 'Journey', path: '/journey', roles: ['STUDENT'] },
    { icon: Calendar, label: 'Timetable', path: '/timetable', roles: ['STUDENT'] },
    { icon: MoreHorizontal, label: 'More', isMenu: true, roles: ['STUDENT'] },
  ],
  ADMIN: [
    { icon: Users, label: 'People', path: '/identity/staff', roles: ['ADMIN'] },
    { icon: Cpu, label: 'Engine', path: '/academic-architect', roles: ['ADMIN'] },
    { icon: MessageSquare, label: 'Comms', path: '/comms', roles: ['ADMIN'] },
  ],
};

export function MobileBottomNav() {
  const { setMobileMenuOpen } = useUI();
  const { user } = useRole();

  if (!user) return null;

  const extra = roleExtraItems[user.role] || [];
  const navItems = [...baseItems, ...extra].filter(item => item.roles.includes(user.role));

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-lg border-t border-slate-200 lg:hidden flex items-center justify-around px-1 z-[90] pb-safe">
      {navItems.map((item) =>
        item.isMenu ? (
          <button
            key={item.label}
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-slate-400 transition-all active:scale-95"
          >
            <item.icon size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ) : (
          <Link
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all",
              isActive ? "text-brand-teal" : "text-slate-400"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </Link>
        )
      )}
    </nav>
  );
}
