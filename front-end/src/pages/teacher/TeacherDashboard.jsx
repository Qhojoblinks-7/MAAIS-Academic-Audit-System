import React from 'react';
import { ClassCard } from '../../components/shared/ClassCard';
import { useRole } from '../../context/RoleContext';
import { useUI } from '../../context/UIContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Percent, GraduationCap, Layers, AlertTriangle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { teacherService } from '../../services';
import { NotificationBell } from '../../components/shared/NotificationBell';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export function TeacherDashboard() {
  const { user } = useRole();
  const { rightPanelVisible } = useUI();
  const navigate = useNavigate();

  const [rolloverBannerVisible, setRolloverBannerVisible] = React.useState(false);
  const [rolloverChanges, setRolloverChanges] = React.useState([]);
  const [teacherClasses, setTeacherClasses] = React.useState([]);

  const teacherId = user?.profileId || user?.id;
  const ROLLOVER_STORAGE_KEY = `maais_rollover_subjects.${teacherId}`;
  const SESSION_SEEN_KEY = `maais_seen_rollover.${teacherId}`;

  const fetchBackendClasses = async () => {
    if (!teacherId) {
      return [];
    }
    return teacherService.getClasses(teacherId);
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

  const handleEnterMarks = (cls) => {
    if (user?.role !== 'STUDENT') {
      navigate(`/grading?subject=${encodeURIComponent(cls.subject)}&class=${encodeURIComponent(cls.className)}`); 
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
            <p className="text-xs font-black text-secondary uppercase tracking-widest mt-2 flex items-center gap-1.5">
              <Layers size={10} className="text-secondary" />
              Academic Workspace & Assessment Matrix
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          
          <Card className="p-5 rounded-2xl shadow-sm flex flex-col gap-3 ring-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-primary border border-border shrink-0">
                <BookOpen size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-secondary uppercase tracking-widest leading-none">Assigned Classes</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-primary leading-none">{teacherClasses.length}</span>
                  <span className="text-xs font-bold text-secondary">active tracks</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl shadow-sm flex flex-col gap-3 ring-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center text-success border border-success/30 shrink-0">
                <Percent size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-secondary uppercase tracking-widest leading-none">Grading Operations</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-success leading-none">{avgProgress}%</span>
                  <span className="text-xs font-bold text-success/70">total complete</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl shadow-sm flex flex-col gap-3 ring-0 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-primary border border-border shrink-0">
                <GraduationCap size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-secondary uppercase tracking-widest leading-none">Student Scope</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-primary leading-none">{totalStudents}</span>
                  <span className="text-xs font-bold text-secondary">total roster count</span>
                </div>
              </div>
            </div>
          </Card>

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
