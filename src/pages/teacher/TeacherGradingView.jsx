import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, BookOpen, Percent, GraduationCap, Clock, ChevronRight, Star, PenLine, ClipboardCheck, X, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import MOCK from '../../data/teacherMockData.json';
import { GradingSheet } from '../shared/GradingSheet';

const {
  skeletonGradingClasses,
  gradingStatusMeta,
  gradingFilterOptions,
} = MOCK;

const SKELETON_CLASSES = skeletonGradingClasses.items;
const statusMeta = gradingStatusMeta.mapping;
const filterOptions = gradingFilterOptions.options;

// ── Subject config — drives GradingSheet column layout ────────────────────────
const SUBJECT_CONFIG = {
  'General Agriculture': {
    sections: ['Paper 1 (50)', 'Paper 2-Agri (90)', 'Paper 3-Pract (60)'],
    maxRaw: 200, sectionCount: 3, hasPractical: true, practicalMarks: 60,
    sbaLabel: 'SBA (30%)', examLabel: 'Exam (70%)',
  },
  'Core Mathematics': {
    sections: ['Sec A (40)', 'Sec B (60)'],
    maxRaw: 100, sectionCount: 2, hasPractical: false, practicalMarks: 0,
    sbaLabel: 'SBA (30%)', examLabel: 'Exam (70%)',
  },
  'English Language': {
    sections: ['Sec A-Essay (50)', 'Sec B-Comp (20)', 'Sec C-Summary (30)'],
    maxRaw: 100, sectionCount: 3, hasPractical: false, practicalMarks: 0,
    sbaLabel: 'SBA (30%)', examLabel: 'Exam (70%)',
  },
  'Integrated Science': {
    sections: ['Sec A (40)', 'Sec B (60)'],
    maxRaw: 100, sectionCount: 2, hasPractical: false, practicalMarks: 0,
    sbaLabel: 'SBA (30%)', examLabel: 'Exam (70%)',
  },
  'Social Studies': {
    sections: ['Sec A (40)', 'Sec B (60)'],
    maxRaw: 100, sectionCount: 2, hasPractical: false, practicalMarks: 0,
    sbaLabel: 'SBA (30%)', examLabel: 'Exam (70%)',
  },
  'Mathematics': {
    sections: ['Sec A (40)', 'Sec B (60)'],
    maxRaw: 100, sectionCount: 2, hasPractical: false, practicalMarks: 0,
    sbaLabel: 'SBA (30%)', examLabel: 'Exam (70%)',
  },
};

// ── Mock student data keyed by subject+class ──────────────────────────────────
const MOCK_STUDENTS_BY_CLASS = {
  'General Agriculture|SHS 1 Agric B': [
    { id: '001', name: 'Angela Owusu', index: '001', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture', 'English Language'], secA: 35, secB: 50, secC: 38, sba: 28.5, exam: 61.5, final: 90.0, grade: 'A1', auditStatus: 'MISSING', subjectType: 'Core' },
    { id: '002', name: 'Kwame Mensah', index: '002', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture', 'English Language'], secA: 20, secB: 30, secC: 15, sba: 15.2, exam: 32.5, final: 47.7, grade: 'D7', auditStatus: 'MISSING', subjectType: 'Core' },
    { id: '003', name: 'Yaw Boateng', index: '003', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture', 'English Language'], secA: 35, secB: 50, secC: 38, sba: 28.5, exam: 61.5, final: 90.0, grade: 'A1', auditStatus: 'COMPLETE', subjectType: 'Core' },
    { id: '004', name: 'Esi Ansah', index: '004', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture', 'English Language'], secA: 32, secB: 48, secC: 35, sba: 26.0, exam: 55.0, final: 81.0, grade: 'A1', auditStatus: 'COMPLETE', subjectType: 'Core' },
    { id: '005', name: 'Kofi Appiah', index: '005', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture', 'English Language'], secA: 28, secB: 42, secC: 32, sba: 22.0, exam: 46.0, final: 68.0, grade: 'B3', auditStatus: 'COMPLETE', subjectType: 'Core' },
    { id: '009', name: 'Ama Serwaa', index: '009', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture', 'English Language'], secA: 30, secB: 40, secC: 35, sba: 25.0, exam: 50.0, final: 75.0, grade: 'A1', auditStatus: 'ACTIVE', subjectType: 'Core' },
  ],
  'Core Mathematics|SHS 1 Agric B': [
    { id: '001', name: 'Angela Owusu', index: '001', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['Core Mathematics'], secA: 35, secB: 50, sba: 27, exam: 59.5, final: 86.5, grade: 'A1', auditStatus: 'MISSING' },
    { id: '002', name: 'Kwame Mensah', index: '002', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['Core Mathematics'], secA: 18, secB: 28, sba: 12.5, exam: 32.2, final: 44.7, grade: 'E8', auditStatus: 'MISSING' },
    { id: '003', name: 'Yaw Boateng', index: '003', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['Core Mathematics'], secA: 38, secB: 55, sba: 28, exam: 65.1, final: 93.1, grade: 'A1', auditStatus: 'COMPLETE' },
    { id: '004', name: 'Esi Ansah', index: '004', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['Core Mathematics'], secA: 30, secB: 45, sba: 22, exam: 52.5, final: 74.5, grade: 'B2', auditStatus: 'COMPLETE' },
  ],
};

const getMockStudentsForClass = (subject, className) => {
  return MOCK_STUDENTS_BY_CLASS[`${subject}|${className}`] || MOCK_STUDENTS_BY_CLASS['General Agriculture|SHS 1 Agric B'];
};

export function TeacherGradingView() {
  const { user } = useRole();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  /* ── WAEC STP T-AR-4.2 — fetch live class list on mount ── */
  const [gradingClasses, setGradingClasses] = useState(SKELETON_CLASSES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* ── Embedded sheet state ── */
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/teacher/classes/${user.id}/analytics`);
        if (!response.ok) throw new Error('Failed to fetch grading classes');
        const data = await response.json();
        setGradingClasses(data.classProgress || data || SKELETON_CLASSES);
      } catch (err) {
        setGradingClasses(SKELETON_CLASSES);
        setError('Failed to load grading data');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [user?.id]);

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
    { label: 'Assigned Classes', value: gradingClasses.length, icon: BookOpen, color: 'bg-slate-50 text-slate-700 border-slate-100' },
    { label: 'Average Progress', value: `${avgProgress}%`, icon: Percent, color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { label: 'Class Graded', value: `${completedCount}/${gradingClasses.length}`, icon: Star, color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { label: 'Total Students', value: totalStudents, icon: GraduationCap, color: 'bg-slate-50 text-slate-700 border-slate-100' },
  ];

  /* ── Class selection: no route change, just state ── */
  const handleSelectClass = useCallback((cls) => {
    setSelectedClass(cls);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedClass(null);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#FBFBFA] p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24">
          <p className="text-sm font-medium text-gray-400">Loading grading summary…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#FBFBFA] p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  /* ── Two-panel layout: list (no selection) or list+embed (class selected) ── */
  return (
    <div className="flex-1 flex overflow-hidden bg-[#FBFBFA]">
      {/* ── LEFT PANEL: Class list ── */}
      <motion.div
        layout
        className={cn(
          "flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 select-none transition-all duration-300",
          selectedClass ? "hidden lg:block lg:flex-[0_0_420px] lg:overflow-y-auto" : ""
        )}
      >
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <header className="mb-8 border-b border-gray-100 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">
                Grading Summary
              </h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 flex items-center gap-1.5">
                <ClipboardCheck size={10} className="text-gray-300" />
                Score Entry · Progress Tracking · Submission Control
              </p>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
              <Clock size={11} /> Last Sync: just now
            </div>
          </header>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm flex items-center gap-4"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border", s.color)}>
                  <s.icon size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                  <p className="text-2xl font-black text-gray-900 leading-none">{s.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick-nav banner */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-emerald-900/5 border border-emerald-100 rounded-2xl px-6 py-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center text-white shrink-0">
                <PenLine size={18} />
              </div>
              <div>
                <p className="text-xs font-black text-gray-800 uppercase tracking-widest">Enter Marks</p>
                <p className="text-[10px] font-medium text-gray-500 mt-0.5">Select a class sheet below</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-emerald-700 uppercase tracking-widest">
              <Star size={11} /> {completedCount} complete · {pendingCount} pending
            </div>
          </div>

          {/* Filter + Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
              <input
                type="text"
                placeholder="Search by subject or class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[12px] font-medium text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-900/10 shadow-sm"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {filterOptions.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border",
                    activeFilter === f ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Class sheets table */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30 flex items-center gap-3">
              <Filter size={14} className="text-gray-400" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Assigned Class Sheets · {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {filtered.map((cls, i) => {
                  const sm = statusMeta[cls.status] || statusMeta['Not Started'];
                  return (
                    <motion.div
                      key={cls.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => handleSelectClass(cls)}
                      className={cn(
                        "p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer transition-all",
                        "hover:bg-emerald-50/30 active:bg-emerald-50/50",
                        selectedClass?.id === cls.id && "bg-emerald-50/50 border-l-4 border-emerald-500"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate">{cls.subject}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{cls.className}</p>
                      </div>

                      {/* Progress bar */}
                      <div className="flex flex-col items-center min-w-0 w-full sm:w-32">
                        <div className="flex items-center gap-2 mb-1 w-full">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${cls.progress}%` }}
                              transition={{ delay: i * 0.04 + 0.2, duration: 0.6 }}
                              className={cn("h-full rounded-full", cls.progress === 100 ? 'bg-emerald-500' : 'bg-brand-teal')}
                            />
                          </div>
                          <span className="text-[9px] font-black text-gray-500 w-8 text-right">{cls.progress}%</span>
                        </div>
                      </div>

                      {/* Students + Status */}
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest shrink-0">{cls.studentCount} students</span>
                        <span className={cn("text-[8px] font-black px-2.5 py-1 uppercase tracking-widest rounded-lg border shrink-0 flex items-center gap-1.5", sm.badge)}>
                          <span className={cn("w-2 h-2 rounded-full shrink-0", sm.dot)} />
                          {cls.status}
                        </span>
                        <ChevronRight size={16} className={cn("shrink-0 transition-transform", selectedClass?.id === cls.id && "rotate-90 text-emerald-600")} />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filtered.length === 0 && (
                <div className="py-16 text-center text-gray-400 text-sm font-medium uppercase tracking-tight">
                  No class sheets match your search.
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── RIGHT PANEL: Embedded GradingSheet ── */}
      <AnimatePresence>
        {selectedClass && (
          <motion.div
            key={selectedClass.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col overflow-hidden border-l border-gray-200 bg-slate-100"
          >
            {/* Panel header with back button */}
            <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0">
              <button
                onClick={handleCloseSheet}
                className="flex items-center gap-2 text-[11px] font-black text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg px-3 py-2 transition-all uppercase tracking-widest"
              >
                <ArrowLeft size={14} />
                Back to List
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1" />
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-emerald-700" />
                <div>
                  <p className="text-xs font-black text-gray-900 leading-none">{selectedClass.subject}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{selectedClass.className}</p>
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
                  programme: 'AGRICULTURE',
                  studentCount: selectedClass.studentCount,
                  form: 'SHS 1',
                  academicYear: '2025/2026',
                }}
                students={getMockStudentsForClass(selectedClass.subject, selectedClass.className)}
                subjectConfig={SUBJECT_CONFIG}
                stpRules={[
                  { check: (s) => s.final > 100, message: 'Final score exceeds 100%' },
                  { check: (s) => s.sba > 30, message: 'SBA exceeds 30% limit' },
                  { check: (s) => s.exam > 70, message: 'Exam exceeds 70% limit' },
                  { check: (s) => s.auditStatus === 'MISSING', message: 'Missing behavioral observations' },
                ]}
                isTermFinalized={false}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}