import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, BookOpen, Percent, GraduationCap, ChevronRight, Star, PenLine, ClipboardCheck, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { useRole } from '../../context/RoleContext';
import { useUI } from '../../context/UIContext';
import { MobileGradingSheet } from './MobileGradingSheet';
import { teacherService } from '../../services';
import { useActiveYear } from '../../lib/hooks';
import { SUBJECT_CONFIG } from '../../constants/subjectConfig';
import { formatFormNumber } from '../../lib/types';
import { useNavigate } from 'react-router-dom';

export { SUBJECT_CONFIG };

export function MobileGradingView() {
  const { user } = useRole();
  const navigate = useNavigate();
  const { setIsGradingSheetActive } = useUI();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');
  const [gradingClasses, setGradingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    setIsGradingSheetActive(!!selectedClass);
  }, [selectedClass, setIsGradingSheetActive]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [gradingStudents, setGradingStudents] = useState([]);
  const [statusMeta, setStatusMeta] = useState({});
  const [dynamicSubjectConfig, setDynamicSubjectConfig] = useState({});

  const activeYearQuery = useActiveYear();
  const activeTerm = activeYearQuery.data?.terms?.find(t => t.isActive);
  const isTermFinalized = activeTerm?.isLocked ?? false;

  useEffect(() => {
    const interval = setInterval(() => {
      activeYearQuery.refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [activeYearQuery]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const [classes, meta, subjectConfig] = await Promise.all([
          teacherService.getClasses(user.profileId || user.id),
          teacherService.getGradingStatusMeta(),
          teacherService.getSubjectConfig().catch(() => []),
        ]);

        const configMap = {};
        if (Array.isArray(subjectConfig)) {
          subjectConfig.forEach((s) => {
            if (!configMap[s.name]) {
              configMap[s.name] = {
                sections: s.type === 'CORE' ? ['Sec A (40)', 'Sec B (60)'] : ['Practical (40)', 'Theory (60)'],
                maxRaw: 100,
                sectionCount: 2,
                hasPractical: s.type === 'ELECTIVE',
                practicalMarks: 0,
                sbaLabel: 'SBA (30%)',
                examLabel: 'Exam (70%)',
              };
            }
          });
        }

        const statusMetaMap = {};
        const statusColors = (meta?.colors) || {
          COMPLETE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          'IN PROGRESS': 'bg-blue-50 text-blue-700 border-blue-200',
          'NOT STARTED': 'bg-amber-50 text-amber-700 border-amber-200',
        };
        const statusDots = {
          COMPLETE: 'bg-emerald-500',
          'IN PROGRESS': 'bg-blue-500',
          'NOT STARTED': 'bg-amber-500',
        };
        ['COMPLETE', 'IN PROGRESS', 'NOT STARTED'].forEach((s) => {
          const color = statusColors[s] || 'bg-muted text-muted-foreground border-border';
          statusMetaMap[s] = { badge: color, dot: statusDots[s] || 'bg-muted' };
        });

        setGradingClasses(classes || []);
        setStatusMeta(statusMetaMap);
      } catch (err) {
        setError('Failed to load grading data');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user?.id, user?.profileId]);

  const subjectConfig = useMemo(() => ({ ...SUBJECT_CONFIG, ...dynamicSubjectConfig }), [dynamicSubjectConfig]);

  const uniqueClasses = useMemo(() => {
    if (!Array.isArray(gradingClasses)) return [];
    const classes = [...new Set(gradingClasses.map(c => c.className).filter(Boolean))];
    const sorted = classes.sort();
    if (!selectedClassFilter) return sorted;
    return [selectedClassFilter, ...sorted.filter(c => c !== selectedClassFilter)];
  }, [gradingClasses, selectedClassFilter]);

  const uniqueSubjects = useMemo(() => {
    if (!Array.isArray(gradingClasses)) return [];
    const pool = selectedClass?.classId
      ? gradingClasses.filter(c => c.classId === selectedClass.classId)
      : selectedClassFilter
        ? gradingClasses.filter(c => c.className === selectedClassFilter)
        : gradingClasses;
    const subjects = [...new Set(pool.map(c => c.subject).filter(Boolean))];
    const sorted = subjects.sort();
    if (!selectedSubjectFilter) return sorted.length ? sorted : [...new Set(gradingClasses.map(c => c.subject).filter(Boolean))].sort();
    return [selectedSubjectFilter, ...sorted.filter(s => s !== selectedSubjectFilter)];
  }, [gradingClasses, selectedClass, selectedClassFilter, selectedSubjectFilter]);

  const availableClasses = useMemo(() => {
    if (!Array.isArray(gradingClasses)) return [];
    if (!selectedClass) return gradingClasses;
    const rest = gradingClasses.filter(c => c.id !== selectedClass.id);
    return rest.length ? [selectedClass, ...rest] : gradingClasses;
  }, [gradingClasses, selectedClass]);

  const avgProgress = useMemo(() => {
    const source = gradingClasses;
    if (!source.length) return 0;
    return Math.round(source.reduce((sum, c) => sum + (c.progress || 0), 0) / source.length);
  }, [gradingClasses]);

  const totalStudents = useMemo(() => {
    return gradingClasses.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  }, [gradingClasses]);

  const filtered = useMemo(() => {
    if (!Array.isArray(gradingClasses)) return [];
    const matchesClass = selectedClassFilter === '' || gradingClasses.some(c => c.className === selectedClassFilter);
    const base = selectedClassFilter ? gradingClasses.filter(c => c.className === selectedClassFilter) : gradingClasses;
    const matchesSubject = selectedSubjectFilter === '' || base.some(c => c.subject === selectedSubjectFilter);
    if (!matchesClass || !matchesSubject) return [];
    return selectedSubjectFilter ? base.filter(c => c.subject === selectedSubjectFilter) : base;
  }, [gradingClasses, selectedClassFilter, selectedSubjectFilter]);

  const fetchGradingStudents = useCallback(async (subject, className) => {
    const students = await teacherService.getGradingStudents(subject || '', className || '');
    setGradingStudents(students || []);
  }, []);

  const handleSelectClass = useCallback(async (cls) => {
    if (!cls) {
      setSelectedClass(null);
      setGradingStudents([]);
      return;
    }
    setSelectedClass(cls);
    setSelectedSubject(cls.subject);
    await fetchGradingStudents(cls.subject, cls.className);
  }, [fetchGradingStudents]);

  const handleSubjectChange = useCallback(async (e) => {
    const subject = e.target.value;
    setSelectedSubject(subject);
    if (!subject) {
      setSelectedClass(null);
      setGradingStudents([]);
      return;
    }
    const firstMatch = gradingClasses.find(c => c.subject === subject);
    if (firstMatch) {
      await fetchGradingStudents(firstMatch.subject, firstMatch.className);
      setSelectedClass(firstMatch);
    }
  }, [gradingClasses, fetchGradingStudents]);

  const handleClassChange = useCallback(async (e) => {
    const classId = e.target.value;
    const cls = gradingClasses.find(c => c.id === classId);
    if (!cls) {
      setSelectedClass(null);
      setGradingStudents([]);
      return;
    }
    await handleSelectClass(cls);
  }, [gradingClasses, handleSelectClass]);

  useEffect(() => {
    if (!selectedClass) return;
    const interval = setInterval(async () => {
      const students = await teacherService.getGradingStudents(selectedClass.subject, selectedClass.className);
      setGradingStudents(students || []);
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedClass]);

  const handleCloseSheet = useCallback(() => {
    setSelectedClass(null);
    setGradingStudents([]);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-success/30 border-t-success rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-primary">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-6">
        <div className="text-center">
          <p className="text-sm font-bold text-primary">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-success text-white rounded-xl text-xs font-bold">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!selectedClass) {
    return (
      <div className="flex-1 flex flex-col bg-background no-scrollbar min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="px-4 pt-5 pb-3">
          <div className="min-w-0">
            <h1 className="text-lg font-black text-primary tracking-tight leading-none truncate">
              Welcome back, <span className="text-success">{user?.name?.split(' ')[0] || 'Teacher'}</span>!
            </h1>
            <p className="text-[9px] font-bold text-primary/70 uppercase tracking-widest mt-1 truncate">Academic Workspace & Assessment Matrix</p>
          </div>
        </header>

        <div className="flex-1 px-4 py-4 overflow-y-auto overflow-x-hidden pb-24 min-w-0">
          {/* KPI Cards */}
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 mb-6 scrollbar-hide scroll-smooth" style={{ scrollPadding: '1rem', WebkitOverflowScrolling: 'touch' }}>
            {[
              { label: 'Assigned Classes', value: gradingClasses.length, subtext: 'Active tracks' },
              { label: 'Grading Operations', value: `${avgProgress}%`, subtext: 'Grading complete' },
              { label: 'Student Scope', value: totalStudents, subtext: 'Total roster' },
            ].map((card, i) => {
              return (
                <div key={i} className="snap-start shrink-0 w-52 bg-surface p-4 rounded-2xl border border-border/50 shadow-sm transition-all relative group">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider mb-0.5">{card.label}</p>
                      <p className="text-[10px] font-medium text-text-secondary leading-tight">{card.subtext}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {String(card.value).endsWith('%') ? (
                        <p className="text-2xl font-bold tracking-tighter leading-none whitespace-nowrap">
                          {String(card.value).slice(0, -1)}<span className="text-sm font-bold align-baseline">{String(card.value).slice(-1)}</span>
                        </p>
                      ) : (
                        <p className="text-2xl font-bold tracking-tighter leading-none whitespace-nowrap">{card.value}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div id="filter-row" className="flex gap-2 mb-4">
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground focus:outline-none focus:ring-2 focus:ring-success/10 shrink-0"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground focus:outline-none focus:ring-2 focus:ring-success/10 shrink-0"
            >
              <option value="">All Subjects</option>
              {uniqueSubjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Class List */}
          <div className="space-y-3">
            {filtered.map((cls, i) => {
              const sm = statusMeta[cls.status] || statusMeta['Not Started'] || {};
              return (
                <motion.div
                  key={cls.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleSelectClass(cls)}
                  className="bg-card rounded-2xl p-4 border border-border shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-foreground truncate">{cls.subject}</p>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest truncate">{cls.className}</p>
                    </div>
                    <span className={cn("text-[10px] font-black px-2 py-1 uppercase tracking-widest rounded-lg border shrink-0 ml-2", sm.badge)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full inline-block mr-1", sm.dot)} />
                      {cls.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        style={{ width: `${cls.progress}%` }}
                        className={cn("h-full rounded-full transition-all duration-700", cls.progress === 100 ? 'bg-success' : 'bg-brand-primary')}
                      />
                    </div>
                    <span className="text-xs font-black text-muted-foreground w-10 text-right">{cls.progress}%</span>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-bold text-muted-foreground">{cls.studentCount} students</span>
                    <span className="text-xs font-black text-brand-primary uppercase tracking-widest flex items-center gap-1">
                      Enter Marks <ChevronRight size={12} />
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-16 text-center text-muted-foreground text-sm font-medium uppercase tracking-tight">
                No class sheets match your search.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const DEFAULT_CLASS_INFO = {
    id: selectedClass ? selectedClass.id : '',
    subject: selectedSubject || '',
    className: selectedClass ? selectedClass.className : '',
    programme: selectedClass ? (selectedClass.department || 'GENERAL') : 'GENERAL',
    studentCount: gradingStudents.length,
    form: selectedClass ? formatFormNumber(selectedClass.level) : '1',
    academicYear: '2025/2026',
  };

  return (
    <MobileGradingSheet
      classInfo={DEFAULT_CLASS_INFO}
      teacherId={user?.id || user?.staffId}
      students={gradingStudents}
      subjectConfig={subjectConfig}
      stpRules={[
        { check: (s) => s.final > 100, message: 'Final score exceeds 100%' },
        { check: (s) => s.sba > 30, message: 'SBA exceeds 30% limit' },
        { check: (s) => s.exam > 70, message: 'Exam exceeds 70% limit' },
        { check: (s) => s.auditStatus === 'MISSING', message: 'Missing behavioral observations' },
      ]}
      isTermFinalized={isTermFinalized}
      selectedSubject={selectedSubject}
      selectedClass={selectedClass}
      availableClasses={availableClasses}
      uniqueSubjects={uniqueSubjects}
      onSubjectChange={handleSubjectChange}
      onClassChange={(e) => {
        const cls = availableClasses.find(c => c.id === e.target.value);
        if (cls) handleSelectClass(cls);
      }}
    />
  );
}

export default MobileGradingView;
