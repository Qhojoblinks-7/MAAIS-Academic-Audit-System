import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, BookOpen, Percent, GraduationCap, Clock, ChevronRight, Star, PenLine, ClipboardCheck, X, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { GradingSheet } from '../shared/GradingSheet';
import { teacherService } from '../../services';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { NotificationBell } from '../../components/shared/NotificationBell';
import { useTeacherSubjectConfig, useActiveYear } from '../../lib/hooks';
import { SUBJECT_CONFIG } from '../../constants/subjectConfig';

export { SUBJECT_CONFIG };

export function TeacherGradingView() {
  const { user } = useRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [gradingClasses, setGradingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [gradingStudents, setGradingStudents] = useState([]);
  const [statusMeta, setStatusMeta] = useState({});
  const [filterOptions, setFilterOptions] = useState([]);
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
        const classes = await teacherService.getClasses(user.id || user.profileId);
        const meta = await teacherService.getGradingStatusMeta();
        const filters = await teacherService.getGradingFilterOptions();
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
        
        setGradingClasses(classes || []);
        setStatusMeta(meta || {});
        setFilterOptions(filters || {});
        setDynamicSubjectConfig(configMap);
        console.log('[TeacherGradingView] Dynamic subject configs loaded:', Object.keys(configMap).length, configMap);
      } catch (err) {
        setError('Failed to load grading data');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [user?.id, user?.profileId]);

  const subjectConfig = useMemo(() => ({ ...SUBJECT_CONFIG, ...dynamicSubjectConfig }), [dynamicSubjectConfig]);

  /* ── Filtered class list ── */
  const totalStudents = gradingClasses.reduce((sum, c) => sum + (c.studentCount || 0), 0);
  const avgProgress = gradingClasses.length > 0
    ? Math.round(gradingClasses.reduce((sum, c) => sum + (c.progress || 0), 0) / gradingClasses.length)
    : 0;
  const completedCount = gradingClasses.filter(c => (c.progress || 0) === 100).length;
  const pendingCount = gradingClasses.filter(c => (c.progress || 0) < 100).length;

  const filtered = gradingClasses.filter((c) => {
    const matchesSearch =
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.className.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || c.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const statCards = [
    { label: 'Assigned Classes', value: gradingClasses.length, icon: BookOpen, color: 'bg-muted text-muted-foreground border-border' },
    { label: 'Average Progress', value: `${avgProgress}%`, icon: Percent, color: 'bg-success/10 text-success border-success/20' },
    { label: 'Class Graded', value: `${completedCount}/${gradingClasses.length}`, icon: Star, color: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20' },
    { label: 'Total Students', value: totalStudents, icon: GraduationCap, color: 'bg-muted text-muted-foreground border-border' },
  ];

  /* ── Class selection: no route change, just state ── */
  const handleSelectClass = useCallback(async (cls) => {
    setSelectedClass(cls);
    const students = await teacherService.getGradingStudents(cls.subject, cls.className);
    setGradingStudents(students || []);
  }, []);

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
      <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24">
          <p className="text-sm font-medium text-muted-foreground">Loading grading summary…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    );
  }

/* ── Two-panel layout: list (no selection) or list+embed (class selected) ── */
  return (
    <div className="flex-1 flex overflow-hidden bg-background">
      {/* ── LEFT PANEL: Class list ── */}
       <div
         className={cn(
           "flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 select-none transition-all duration-300",
           selectedClass ? "hidden lg:block lg:flex-[0_0_420px] lg:overflow-y-auto" : ""
         )}
       >
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <header className="mb-8 border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight leading-none">
                Grading Summary
              </h1>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-2 flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <ClipboardCheck size={10} className="text-muted-foreground" />
                  Score Entry · Progress Tracking · Submission Control
                </span>
                {Object.keys(dynamicSubjectConfig).length > 0 && (
                  <span className="px-2 py-0.5 bg-success/10 text-success border border-success/20 rounded-md">
                    {Object.keys(dynamicSubjectConfig).length} dynamic configs loaded
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-black text-brand-primary uppercase tracking-widest">
              <NotificationBell />
            </div>
          </header>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((s, i) => (
               <div
                 key={s.label}
                 style={{ animationDelay: `${i * 40}ms` }}
                 className="bg-card p-5 rounded-2xl border border-border/60 shadow-sm flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2"
               >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border", s.color)}>
                  <s.icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{s.label}</p>
                  <p className="text-2xl font-black text-foreground leading-none">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick-nav banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl px-6 py-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-primary-foreground shrink-0">
                <PenLine size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-foreground uppercase tracking-widest">Enter Marks</p>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">Select a class sheet below</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-black text-brand-primary uppercase tracking-widest">
              <Star size={11} /> {completedCount} complete · {pendingCount} pending
            </div>
          </div>

          {/* Filter + Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <Input
                type="text"
                placeholder="Search by subject or class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm font-medium text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary/10 shadow-sm"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {filterOptions.map((f) => (
                <Button
                  key={f}
                  variant={activeFilter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(f)}
                  className="text-xs font-black uppercase tracking-widest"
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          {/* Class sheets table */}
          <Card className="rounded-[2rem] border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
              <Filter size={14} className="text-muted-foreground" />
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                Assigned Class Sheets · {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

             <div className="divide-y divide-border">
                 {filtered.map((cls, i) => {
                   const sm = statusMeta[cls.status] || statusMeta['Not Started'] || {};
                   return (
                     <div
                       key={cls.id}
                       style={{ animationDelay: `${i * 30}ms` }}
                       onClick={() => handleSelectClass(cls)}
                       className={cn(
                         "p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer transition-all animate-in fade-in slide-in-from-bottom-2",
                         "hover:bg-brand-primary/5 active:bg-brand-primary/10",
                         selectedClass?.id === cls.id && "bg-brand-primary/10 border-l-4 border-brand-primary"
                       )}
                     >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-foreground truncate">{cls.subject}</p>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{cls.className}</p>
                      </div>

                      {/* Progress bar */}
                      <div className="flex flex-col items-center min-w-0 w-full sm:w-32">
                        <div className="flex items-center gap-2 mb-1 w-full">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                           <div
                             style={{ width: `${cls.progress}%` }}
                             className={cn("h-full rounded-full transition-all duration-700", cls.progress === 100 ? 'bg-success' : 'bg-brand-primary')}
                           />
                          </div>
                          <span className="text-xs font-black text-muted-foreground w-8 text-right">{cls.progress}%</span>
                        </div>
                      </div>

                      {/* Students + Status */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-black text-muted-foreground uppercase tracking-widest shrink-0">{cls.studentCount} students</span>
                        <span className={cn("text-xs font-black px-2.5 py-1 uppercase tracking-widest rounded-lg border shrink-0 flex items-center gap-1.5", sm.badge)}>
                          <span className={cn("w-2 h-2 rounded-full shrink-0", sm.dot)} />
                          {cls.status}
                        </span>
                        <ChevronRight size={16} className={cn("shrink-0 transition-transform", selectedClass?.id === cls.id && "rotate-90 text-brand-primary")} />
                      </div>
                    </div>
                   );
                 })}

               {filtered.length === 0 && (
                <div className="py-16 text-center text-muted-foreground text-sm font-medium uppercase tracking-tight">
                  No class sheets match your search.
           </div>
         )}
     </div>
          </Card>
        </div>
      </div>

      {/* ── RIGHT PANEL: Embedded GradingSheet ── */}
         {selectedClass && (
           <div
             className="flex-1 flex flex-col overflow-hidden border-l border-border bg-muted animate-in fade-in slide-in-from-right-4"
           >
            {/* Panel header with back button */}
            <div className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseSheet}
                className="flex items-center gap-2 text-xs font-black text-muted-foreground hover:text-foreground uppercase tracking-widest"
              >
                <ArrowLeft size={14} />
                Back to List
              </Button>
              <div className="w-px h-6 bg-border mx-1" />
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-brand-primary" />
                <div>
                  <p className="text-xs font-black text-foreground leading-none">{selectedClass.subject}</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {selectedClass.className}
                    <span className="mx-1.5 text-border">|</span>
                    <span className="text-success">{selectedClass.department || 'GENERAL'}</span>
                    <span className="mx-1.5 text-border">|</span>
                    <span className="text-brand-secondary">{selectedClass.level || 'SHS 1'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* GradingSheet — fully controlled by this container */}
            <div className="flex-1 overflow-hidden">
              <GradingSheet
                classInfo={{
                  id: selectedClass.id,
                  subject: selectedClass.subject,
                  className: selectedClass.className,
                  programme: selectedClass.department || 'GENERAL',
                  studentCount: selectedClass.studentCount,
                  form: selectedClass.level || 'SHS 1',
                  academicYear: '2025/2026',
                }}
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
              />
            </div>
          </div>
         )}
    </div>
  );
}