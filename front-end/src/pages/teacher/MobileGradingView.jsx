import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, BookOpen, Percent, GraduationCap, ChevronRight, Star, PenLine, ClipboardCheck, X, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { useRole } from '../../context/RoleContext';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');
  const [gradingClasses, setGradingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
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
        const classes = await teacherService.getClasses(user.profileId || user.id);
        const meta = await teacherService.getGradingStatusMeta();
        const subjectConfig = await teacherService.getSubjectConfig().catch(() => []);

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

  const filtered = gradingClasses.filter((c) => {
    const matchesSearch =
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.className.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClassFilter === '' || c.className === selectedClassFilter;
    const matchesSubject = selectedSubjectFilter === '' || c.subject === selectedSubjectFilter;
    return matchesSearch && matchesClass && matchesSubject;
  });

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
      <div className="flex-1 flex flex-col bg-background">
        <header className="bg-surface border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
              <ArrowLeft size={20} className="text-primary" />
            </button>
            <div>
              <h1 className="text-xl font-black text-primary">Grade Entry</h1>
              <p className="text-xs font-bold text-success uppercase tracking-widest">Select a class</p>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 py-4 overflow-y-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-card rounded-2xl p-4 border border-border">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Classes</p>
              <p className="text-2xl font-black text-foreground">{filtered.length}</p>
            </div>
            <div className="bg-card rounded-2xl p-4 border border-border">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Students</p>
              <p className="text-2xl font-black text-foreground">{filtered.reduce((sum, c) => sum + (c.studentCount || 0), 0)}</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-success/10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground focus:outline-none focus:ring-2 focus:ring-success/10"
              >
                <option value="">All Classes</option>
                {uniqueClasses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-foreground focus:outline-none focus:ring-2 focus:ring-success/10"
              >
                <option value="">All Subjects</option>
                {uniqueSubjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
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
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{cls.className}</p>
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
