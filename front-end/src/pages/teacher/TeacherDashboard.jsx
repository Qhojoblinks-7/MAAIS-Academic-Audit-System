import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ClassCard } from '../../components/shared/ClassCard';
import { useRole } from '../../context/RoleContext';
import { useUI } from '../../context/UIContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Percent, GraduationCap, Layers, AlertTriangle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { teacherService } from '../../services';

export function TeacherDashboard() {
  const { user } = useRole();
  const { rightPanelVisible } = useUI();
  const navigate = useNavigate();

  const [rolloverBannerVisible, setRolloverBannerVisible] = React.useState(false);
  const [rolloverChanges, setRolloverChanges] = React.useState([]);
  const [teacherClasses, setTeacherClasses] = React.useState([]);

  const teacherId = user?.profileId || user?.id;
  const staffProfileId = user?.profileId;
  const ROLLOVER_STORAGE_KEY = `maais_rollover_subjects.${teacherId}`;
  const SESSION_SEEN_KEY = `maais_seen_rollover.${teacherId}`;

  const fetchBackendClasses = async () => {
    if (!staffProfileId) {
      return [];
    }
    return teacherService.getClasses(staffProfileId);
  };

  React.useEffect(() => {
    if (!teacherId) return;
    fetchBackendClasses()
      .then(setTeacherClasses)
      .catch((err) => console.error('[TeacherDashboard] failed to load classes:', err));
  }, [teacherId]);

  React.useEffect(() => {
    if (!teacherId || !teacherClasses || teacherClasses.length === 0) return;

    const currentSubjects = [...new Set(teacherClasses.map(c => c.subject))].sort();
    const hasSeenThisSession = sessionStorage.getItem(SESSION_SEEN_KEY);
    if (hasSeenThisSession) return;

    const storedSnapshot = localStorage.getItem(ROLLOVER_STORAGE_KEY);

    if (storedSnapshot !== null) {
      try {
        const priorSnapshot = JSON.parse(storedSnapshot) || [];
        
        const added = currentSubjects.filter(s => !priorSnapshot.includes(s));
        const removed = priorSnapshot.filter(s => !currentSubjects.includes(s));
        
        const changes = [
          ...added.map(s => ({ action: 'added', subject: s })),
          ...removed.map(s => ({ action: 'removed', subject: s })),
        ].sort((a, b) => a.subject.localeCompare(b.subject));

        if (changes.length > 0) {
          setRolloverChanges(changes);
          setRolloverBannerVisible(true);
        }
      } catch (error) {
        console.error('Error parsing historical subject snapshot:', error);
      }
    }

    localStorage.setItem(ROLLOVER_STORAGE_KEY, JSON.stringify(currentSubjects));
  }, [teacherId, ROLLOVER_STORAGE_KEY, SESSION_SEEN_KEY, teacherClasses]);

  const handleDismissBanner = () => {
    setRolloverBannerVisible(false);
    sessionStorage.setItem(SESSION_SEEN_KEY, 'true');
  };

  const totalStudents = teacherClasses.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  const avgProgress = teacherClasses.length > 0
    ? Math.round(teacherClasses.reduce((sum, c) => sum + (c.progress || 0), 0) / teacherClasses.length)
    : 0;

  const kpiStats = useMemo(() => ([
    {
      label: 'Assigned Classes',
      value: teacherClasses.length,
      icon: 'BookOpen',
      bg: 'bg-brand-primary/5',
      color: 'text-brand-primary',
      subtext: `${teacherClasses.length} active tracks`,
    },
    {
      label: 'Grading Operations',
      value: `${avgProgress}%`,
      icon: 'Percent',
      bg: 'bg-success/10',
      color: 'text-success',
      subtext: 'Grading complete',
    },
    {
      label: 'Student Scope',
      value: totalStudents,
      icon: 'GraduationCap',
      bg: 'bg-brand-primary/5',
      color: 'text-brand-primary',
      subtext: `${totalStudents} total roster`,
    },
  ]), [teacherClasses.length, avgProgress, totalStudents]);

  const handleEnterMarks = (cls) => {
    if (user?.role !== 'STUDENT') {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        navigate(`/teacher/grading-mobile?subject=${encodeURIComponent(cls.subject)}&class=${encodeURIComponent(cls.className)}`);
      } else {
        navigate(`/grading?subject=${encodeURIComponent(cls.subject)}&class=${encodeURIComponent(cls.className)}`);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 select-none no-scrollbar">
      <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">

        {rolloverBannerVisible && (
          <div className="mb-8 rounded-2xl bg-warning/10 border border-warning/30 px-6 py-4 flex flex-col sm:flex-row sm:items-start gap-4 animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="shrink-0 w-10 h-10 bg-warning/20 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-black text-primary">
                Your subject rollover is pending approval
              </h3>
              <p className="text-xs font-medium text-warning mt-1">
                The following subject assignment{rolloverChanges.length === 1 ? '' : 's'} {rolloverChanges.length === 1 ? 'has' : 'have'} changed since your last term:
              </p>
              <ul className="mt-2 space-y-0.5">
                {rolloverChanges.map((ch, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-bold text-warning">
                    {ch.action === 'added' ? (
                      <CheckCircle2 size={12} className="text-success" />
                    ) : (
                      <RefreshCw size={12} className="text-secondary" />
                    )}
                    <span className="capitalize">{ch.action}</span> — {ch.subject}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              onClick={handleDismissBanner}
              variant="ghost"
              size="icon"
              className="shrink-0 text-warning hover:bg-warning/20 hover:text-warning"
              aria-label="Dismiss rollover banner"
            >
              <AlertTriangle size={16} />
            </Button>
          </div>
        )}

        <header className="mb-8 border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tight leading-none">
              Welcome back, <span className="text-success">{user?.name?.split(' ')[0] || 'Teacher'}</span>!
            </h1>
            <p className="text-xs font-black text-primary/70 uppercase tracking-widest mt-2 flex items-center gap-1.5">
              <Layers size={10} className="text-primary/70" />
              Academic Workspace & Assessment Matrix
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {kpiStats.map((card, i) => {
            const iconMap = { BookOpen, Percent, GraduationCap };
            const CardIcon = iconMap[card.icon] || BookOpen;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface p-4 rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all relative group"
              >
                <div className="flex items-center justify-between h-full gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shrink-0", card.bg, card.color)}>
                      <CardIcon size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1 whitespace-nowrap">{card.label}</p>
                      <p className="text-[11px] font-medium text-text-secondary leading-tight whitespace-nowrap">{card.subtext}</p>
                    </div>
                  </div>
                  <div className="text-right pl-4 shrink-0">
                    {String(card.value).endsWith('%') ? (
                      <p className="text-5xl font-bold tracking-tighter leading-none whitespace-nowrap">
                        {String(card.value).slice(0, -1)}<span className="text-2xl font-bold align-baseline">{String(card.value).slice(-1)}</span>
                      </p>
                    ) : (
                      <p className="text-5xl font-bold tracking-tighter leading-none whitespace-nowrap">{card.value}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 ${rightPanelVisible ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6`}>
          {teacherClasses.map((cls, idx) => (
            <div
              key={cls.id}
              style={{ animationDelay: `${idx * 40}ms` }}
              onClick={() => handleEnterMarks(cls)}
              className="h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-success/20 rounded-2xl animate-in fade-in zoom-in-97 duration-200"
            >
              <ClassCard {...cls} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
