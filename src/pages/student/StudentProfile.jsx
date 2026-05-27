import React, { useState, useEffect, useMemo } from 'react';
import { GraduationCap, Lock, Unlock, ArrowLeft, User, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { GradingSheet } from '../../pages/shared/GradingSheet';

const MOCK_STUDENT = {
  id: 'stud001',
  index: '001',
  name: 'Angela Owusu',
  classForm: 'SHS 1 Agric B',
  department: 'Agriculture',
};

const MOCK_TERM_HISTORY = [
  { term: '2023/24 Term 1', gpa: 2.85, grade: 'B2' },
  { term: '2023/24 Term 2', gpa: 3.12, grade: 'B2' },
  { term: '2023/24 Term 3', gpa: 3.25, grade: 'B2' },
  { term: '2024/25 Term 1', gpa: 3.45, grade: 'A1' },
  { term: '2024/25 Term 2', gpa: 3.62, grade: 'A1' },
];

const MOCK_SUBJECT_PERFORMANCE = [
  { subject: 'General Agriculture', grades: ['B3', 'B2', 'B2', 'A1'], trend: 'improving' },
  { subject: 'Mathematics', grades: ['C5', 'C4', 'B3', 'B2'], trend: 'improving' },
  { subject: 'English', grades: ['B2', 'B2', 'B2', 'B2'], trend: 'stable' },
  { subject: 'Science', grades: ['B3', 'B3', 'B2', 'C4'], trend: 'stable' },
];

const MOCK_BEHAVIORAL_LOGS = [
  { date: '2026-05-14', type: 'Lab Safety', comment: 'Exhibited high safety protocol compliance' },
  { date: '2026-04-28', type: 'Academic', comment: 'Near top percentile in mid-term practical' },
];

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
};

export function StudentProfile() {
  const { archivedClasses, interventionAlerts } = useHOD();
  const [student, setStudent] = useState(null);
  const [isArchived, setIsArchived] = useState(false);
  const [isEnteringGrade, setIsEnteringGrade] = useState(false);
  const [gradeSubject, setGradeSubject] = useState(null);

  const allStudents = useMemo(() => {
    const students = [];
    archivedClasses.forEach(archived => {
      if (archived.students && Array.isArray(archived.students)) {
        archived.students.forEach(s => {
          students.push({
            id: s.id,
            name: s.name,
            index: s.indexNumber,
            classForm: archived.className || archived.class,
            archived: archived.status === 'LOCKED' || archived.status === 'ARCHIVED',
          });
        });
      }
    });
    if (students.length === 0) {
      students.push(MOCK_STUDENT);
    }
    return students;
  }, [archivedClasses]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const studentId = params.get('id');
    if (studentId) {
      const found = allStudents.find(s => s.id === studentId);
      if (found) {
        setStudent(found);
        setIsArchived(found.archived);
      }
    }
  }, [allStudents]);

  const handleEnterGrade = (subject) => {
    setGradeSubject(subject);
    setIsEnteringGrade(true);
  };

  const handleCloseGradeEntry = () => {
    setIsEnteringGrade(false);
    setGradeSubject(null);
  };

  const studentAlerts = useMemo(() => {
    if (!student) return [];
    return Array.isArray(interventionAlerts) 
      ? interventionAlerts.filter(a => a.studentId === student.id || a.studentName === student.name)
      : [];
  }, [interventionAlerts, student]);

  if (!student) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F4F3EA] p-6">
        <div className="text-center">
          <User size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-xs font-medium text-gray-500">No student selected. Use search to find a student.</p>
        </div>
      </div>
    );
  }

  const availableSubjects = Object.keys(SUBJECT_CONFIG);
  const latestGPA = MOCK_TERM_HISTORY[MOCK_TERM_HISTORY.length - 1]?.gpa || 0;

  return (
    <div className="w-full h-screen bg-[#F4F3EA] text-[#1C1C1E] p-5 font-sans antialiased selection:bg-yellow-200 flex flex-col overflow-hidden">
      <header className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="text-xl font-semibold tracking-tight text-[#1C1C1E]">Student Profile</h1>
        <div className="flex items-center gap-2">
          {isArchived ? (
            <span className="px-3 py-1.5 bg-slate-100 text-xs font-medium rounded-xl flex items-center gap-2 text-slate-600">
              <Lock size={13} /> Archived Record
            </span>
          ) : (
            <button 
              onClick={() => handleEnterGrade('General Agriculture')}
              className="px-3 py-1.5 bg-white text-xs font-medium rounded-xl shadow-3xs border border-white/60 flex items-center gap-2 text-emerald-700 hover:bg-emerald-50 transition"
            >
              <Unlock size={13} /> <span>Enter Grade</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 bg-white/60 border border-white/80 rounded-[24px] p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-[12px] bg-slate-100 border border-white flex items-center justify-center text-slate-400">
                <GraduationCap size={28} />
              </div>
              <div>
                <h2 className="text-lg font-bold">{student.name}</h2>
                <p className="text-[10px] text-[#A1A1A1] font-mono">Index: {student.index}</p>
                <p className="text-[10px] text-[#7A7A7A]">{student.classForm}</p>
                <p className="text-[9px] text-emerald-700">GPA: {latestGPA.toFixed(2)}</p>
              </div>
            </div>

            {isArchived && (
              <div className="mb-3 p-2 bg-amber-50/50 border border-amber-200/50 rounded-lg">
                <p className="text-[10px] text-[#7A7A7A]">Record archived. Grades read-only.</p>
              </div>
            )}

            {studentAlerts.length > 0 && !isArchived && (
              <div className="mb-3 p-2 bg-amber-50/50 border border-amber-200/50 rounded-lg">
                <p className="text-[9px] font-bold uppercase mb-1 flex items-center gap-1">
                  <AlertTriangle size={10} className="text-amber-600" /> Interventions
                </p>
                {studentAlerts.slice(0, 2).map((alert, idx) => (
                  <p key={idx} className="text-[9px] leading-tight">{alert.subject}: {alert.reason}</p>
                ))}
              </div>
            )}

            {!isArchived && (
              <div>
                <p className="text-[9px] font-bold uppercase mb-1">Enter Grade For:</p>
                <select 
                  onChange={(e) => e.target.value && handleEnterGrade(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  defaultValue=""
                >
                  <option value="">Select subject...</option>
                  {availableSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 space-y-3">
            <div className="bg-white/40 border border-white/80 rounded-[24px] p-4">
              <h3 className="text-xs font-bold uppercase mb-2 flex items-center gap-1">
                <TrendingUp size={12} className="text-[#1C1C1E]" /> Performance Trend (SHS 1-3)
              </h3>
              <div className="space-y-2">
                {MOCK_TERM_HISTORY.map((term, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-[#7A7A7A]">{term.term}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">{term.grade}</span>
                      <span className="font-mono">{term.gpa.toFixed(2)}</span>
                      {idx > 0 && MOCK_TERM_HISTORY[idx-1] && (
                        term.gpa > MOCK_TERM_HISTORY[idx-1].gpa
                          ? <TrendingUp size={12} className="text-emerald-600" />
                          : <TrendingDown size={12} className="text-amber-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/40 border border-white/80 rounded-[24px] p-4">
              <h3 className="text-xs font-bold uppercase mb-2">Subject Performance</h3>
              <div className="space-y-2">
                {MOCK_SUBJECT_PERFORMANCE.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    <span className="text-xs font-medium">{item.subject}</span>
                    <span className="text-xs font-mono text-emerald-700">{item.grades[item.grades.length-1] || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isEnteringGrade && gradeSubject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={handleCloseGradeEntry}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[24px] w-full max-w-4xl max-h-[90vh] flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold">Enter Grade: {gradeSubject}</h3>
                <button onClick={handleCloseGradeEntry} className="p-2 hover:bg-slate-100 rounded-lg">
                  <ArrowLeft size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <GradingSheet
                  classInfo={{
                    id: 'standalone',
                    subject: gradeSubject,
                    className: student.classForm,
                    programme: 'AGRICULTURE',
                    studentCount: 1,
                    form: 'SHS 1',
                    academicYear: '2025/2026',
                  }}
                  students={[{
                    id: student.id,
                    name: student.name,
                    index: student.index,
                    form: 'SHS 1',
                    programme: 'AGRICULTURE',
                    subjects: [gradeSubject],
                    secA: '', secB: '', secC: '', sba: '', exam: '', final: '', grade: '',
                    auditStatus: 'ACTIVE', subjectType: 'Core'
                  }]}
                  subjectConfig={SUBJECT_CONFIG}
                  stpRules={[
                    { check: (s) => s.final > 100, message: 'Final score exceeds 100%' },
                    { check: (s) => s.sba > 30, message: 'SBA exceeds 30% limit' },
                    { check: (s) => s.exam > 70, message: 'Exam exceeds 70% limit' },
                  ]}
                  isTermFinalized={false}
                  targetStudentId={student.id}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StudentProfile;