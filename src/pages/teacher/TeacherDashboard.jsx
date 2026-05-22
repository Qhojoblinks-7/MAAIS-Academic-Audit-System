import React from 'react';
import { ClassCard } from '../../components/shared/ClassCard';
import { motion } from 'framer-motion';
import { useRole } from '../../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Percent, GraduationCap, Layers, AlertTriangle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import MOCK from '../../data/teacherMockData.json';

const { items: teacherClasses } = MOCK.teacherClasses;

export function TeacherDashboard() {
  const { user } = useRole();
  const navigate = useNavigate();

  const [rolloverBannerVisible, setRolloverBannerVisible] = React.useState(false);
  const [rolloverChanges, setRolloverChanges] = React.useState([]);

  const staffId = user?.staffId || user?.id || 'unknown';
  const ROLLOVER_STORAGE_KEY = `maais_rollover_subjects.${staffId}`;
  const SESSION_SEEN_KEY = `maais_seen_rollover.${staffId}`;

  React.useEffect(() => {
    if (!staffId || !teacherClasses || teacherClasses.length === 0) return;

    // 1. Gather distinct current subjects
    const currentSubjects = [...new Set(teacherClasses.map(c => c.subject))].sort();
    
    // 2. Check if the user has already dealt with the banner during this active session
    const hasSeenThisSession = sessionStorage.getItem(SESSION_SEEN_KEY);
    if (hasSeenThisSession) return;

    // 3. Pull historical baseline from previous term
    const storedSnapshot = localStorage.getItem(ROLLOVER_STORAGE_KEY);

    if (storedSnapshot !== null) {
      try {
        const priorSnapshot = JSON.parse(storedSnapshot) || [];
        
        // Compute delta across terms
        const added = currentSubjects.filter(s => !priorSnapshot.includes(s));
        const removed = priorSnapshot.filter(s => !currentSubjects.includes(s));
        
        const changes = [
          ...added.map(s => ({ action: 'added', subject: s })),
          ...removed.map(s => ({ action: 'removed', subject: s })),
        ].sort((a, b) => a.subject.localeCompare(b.subject));

        // If a real mismatch exists, surface it safely
        if (changes.length > 0) {
          setRolloverChanges(changes);
          setRolloverBannerVisible(true);
        }
      } catch (error) {
        console.error('Error parsing historical subject snapshot:', error);
      }
    }

    // Always update baseline historical record for upcoming terms
    localStorage.setItem(ROLLOVER_STORAGE_KEY, JSON.stringify(currentSubjects));
  }, [staffId, ROLLOVER_STORAGE_KEY, SESSION_SEEN_KEY]);

  // Handle manual dismissal of banner alert
  const handleDismissBanner = () => {
    setRolloverBannerVisible(false);
    sessionStorage.setItem(SESSION_SEEN_KEY, 'true');
  };

  // Derive statistical summaries safely
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
    <div className="flex-1 overflow-y-auto bg-[#FBFBFA] p-6 md:p-8 select-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >

        {/* ROLLOVER BANNER ALERT */}
        {rolloverBannerVisible && (
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8 rounded-2xl bg-amber-50 border border-amber-200 px-6 py-4 flex flex-col sm:flex-row sm:items-start gap-4"
          >
            <div className="shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-black text-amber-900">
                Your subject rollover is pending approval
              </h3>
              <p className="text-xs font-medium text-amber-700 mt-1">
                The following subject assignment{rolloverChanges.length === 1 ? '' : 's'} {rolloverChanges.length === 1 ? 'has' : 'have'} changed since your last term:
              </p>
              <ul className="mt-2 space-y-0.5">
                {rolloverChanges.map((ch, i) => (
                  <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-amber-800">
                    {ch.action === 'added' ? (
                      <CheckCircle2 size={12} className="text-emerald-600" />
                    ) : (
                      <RefreshCw size={12} className="text-gray-400" />
                    )}
                    <span className="capitalize">{ch.action}</span> — {ch.subject}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={handleDismissBanner}
              className="shrink-0 text-amber-700 hover:bg-amber-100 rounded-lg p-1.5 transition-colors self-start"
              aria-label="Dismiss rollover banner"
            >
              <AlertTriangle size={16} />
            </button>
          </motion.div>
        )}

        {/* 1. HEADER HERO FRAME */}
        <header className="mb-8 border-b border-gray-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">
              Welcome back, <span className="text-emerald-800">{user?.name?.split(' ')[0] || 'Teacher'}</span>!
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-1.5">
              <Layers size={10} className="text-gray-300" />
              Academic Workspace & Assessment Matrix
            </p>
          </div>
        </header>

        {/* 2. STATISTICAL SNAPSHOT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          
          {/* Active Classes Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 border border-gray-100 shrink-0">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Assigned Classes</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-900 leading-none">{teacherClasses.length}</span>
                <span className="text-[11px] font-bold text-gray-400">active tracks</span>
              </div>
            </div>
          </div>

          {/* Overall Completion Progress */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-800 border border-emerald-100/50 shrink-0">
              <Percent size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Grading Operations</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-800 leading-none">{avgProgress}%</span>
                <span className="text-[11px] font-bold text-emerald-600/70">total complete</span>
              </div>
            </div>
          </div>

          {/* Enrolled Students Accumulator */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 border border-gray-100 shrink-0">
              <GraduationCap size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Student Scope</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-900 leading-none">{totalStudents}</span>
                <span className="text-[11px] font-bold text-gray-400">total roster count</span>
              </div>
            </div>
          </div>

        </div>

        {/* 3. DYNAMIC CLASS SHEETS SELECTION MATRIX */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherClasses.map((cls, idx) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04, duration: 0.2 }}
              onClick={() => handleEnterMarks(cls)}
              className="h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 rounded-2xl"
            >
              <ClassCard {...cls} />
            </motion.div>
          ))}
        </div>

      </motion.div>
    </div>
  );
}