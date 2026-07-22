import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Calendar, Users, BarChart3, MoreHorizontal,
  AlertCircle, ClipboardCheck, Database, User, Settings, LifeBuoy
} from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useRole } from '../../context/RoleContext';
import { cn } from '../../lib/utils';

const ITEMS = [
  { icon: BookOpen, label: 'Grades', id: 'grades', path: '/teacher/grading-mobile' },
  { icon: Calendar, label: 'Timetable', id: 'timetable', path: '/teacher/timetable' },
  { icon: Users, label: 'People', id: 'people', path: '/teacher/students' },
  { icon: BarChart3, label: 'Analytics', id: 'analytics', path: '/teacher/analytics' },
  { icon: MoreHorizontal, label: 'More', id: 'more' },
];

export function TeacherMobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useRole();
  const [moreOpen, setMoreOpen] = React.useState(false);
  const { revisionCount, missingObservationCount, setSettingsModalOpen, setSupportModalOpen } = useUI();

  const isActive = (item) => {
    if (item.id === 'more') return false;
    if (item.id === 'grades') return location.pathname === '/teacher/grading-mobile';
    return location.pathname === item.path;
  };

  const handleMore = () => setMoreOpen((prev) => !prev);
  const closeMore = () => setMoreOpen(false);

  React.useEffect(() => {
    if (!moreOpen) return;
    const handleEsc = (e) => { if (e.key === 'Escape') closeMore(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [moreOpen]);

  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-surface/90 backdrop-blur-xl border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-2 pb-safe">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            if (item.id === 'more') {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={handleMore}
                  className={cn(
                    'flex flex-col items-center justify-center flex-1 py-2 min-w-[56px]',
                    'transition-all relative'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-2xl flex items-center justify-center transition-all',
                    moreOpen ? 'bg-brand-primary text-surface' : 'text-text-secondary hover:text-text-primary'
                  )}>
                    <Icon size={20} strokeWidth={moreOpen ? 2.5 : 2} />
                  </div>
                  <span className={cn('text-[10px] font-black mt-1 uppercase tracking-wider', moreOpen ? 'text-brand-primary' : 'text-text-secondary')}>
                    {item.label}
                  </span>
                  {moreOpen && (
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-primary rounded-full" />
                  )}
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 py-2 min-w-[56px]',
                  'transition-all relative'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-2xl flex items-center justify-center transition-all',
                  active
                    ? 'bg-brand-primary text-surface shadow-lg shadow-brand-primary/25'
                    : 'text-text-secondary hover:text-text-primary'
                )}>
                  <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className={cn('text-[10px] font-black mt-1 uppercase tracking-wider', active ? 'text-brand-primary' : 'text-text-secondary')}>
                  {item.label}
                </span>
                {active && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm"
              onClick={closeMore}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80) closeMore();
              }}
              className="fixed bottom-0 inset-x-0 z-[60] bg-surface rounded-t-[2rem] border-t border-border shadow-2xl overflow-hidden"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-border rounded-full" />
              </div>
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <MoreHorizontal size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-primary">More</p>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{user?.name}</p>
                </div>
              </div>
              <div className="p-2">
                <MoreNavItem label="Revisions" icon={AlertCircle} badge color="bg-destructive" count={revisionCount} onClick={() => { closeMore(); navigate('/revisions'); }} />
                <MoreNavItem label="Missing Obs" icon={ClipboardCheck} badge color="bg-warning" count={missingObservationCount} onClick={() => { closeMore(); navigate('/missing-observations'); }} />
                <MoreNavItem label="Archive" icon={Database} onClick={() => { closeMore(); navigate('/archive'); }} />
                <MoreNavItem label="Profile" icon={User} onClick={() => { closeMore(); navigate('/teacher/profile'); }} />
                <MoreNavItem label="Settings" icon={Settings} onClick={() => { closeMore(); setSettingsModalOpen(true); }} />
                <MoreNavItem label="Support" icon={LifeBuoy} onClick={() => { closeMore(); setSupportModalOpen(true); }} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MoreNavItem({ label, icon: Icon, onClick, count, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-muted transition-all text-left"
    >
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-text-secondary shrink-0">
        <Icon size={18} />
      </div>
      <span className="flex-1 text-sm font-black tracking-tight">{label}</span>
      {count > 0 && (
        <span className={cn('px-2.5 py-0.5 text-[10px] font-black text-background rounded-full', color || 'bg-destructive')}>
          {count}
        </span>
      )}
    </button>
  );
}
