import React, { useState, useEffect, useMemo } from 'react';
import { GraduationCap, Lock, Unlock, ArrowLeft, User, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHOD } from '../../context/HODContext';
import { useRole } from '../../context/RoleContext';
import { GradingSheet } from '../../pages/shared/GradingSheet';
import { studentService } from '../../services/studentService';
import '@/index.css';

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
  const { user } = useRole();
  const [student, setStudent] = useState(null);
  const [academicHistory, setAcademicHistory] = useState([]);
  const [terminalResults, setTerminalResults] = useState([]);
  const [isArchived, setIsArchived] = useState(false);
  const [isEnteringGrade, setIsEnteringGrade] = useState(false);
  const [gradeSubject, setGradeSubject] = useState(null);
  const [loading, setLoading] = useState(false);

  const allStudents = useMemo(() => {
    const students = [];
    if (archivedClasses && Array.isArray(archivedClasses)) {
      archivedClasses.forEach(archived => {
        if (archived.students && Array.isArray(archived.students)) {
          archived.students.forEach(s => {
            students.push({
              id: s.id,
              name: s.name,
              index: s.indexNumber || s.index,
              classForm: archived.className || archived.class,
              archived: archived.status === 'LOCKED' || archived.status === 'ARCHIVED',
            });
          });
        }
      });
    }
    return students;
  }, [archivedClasses]);

  const studentAlerts = useMemo(() => {
    if (!student || !Array.isArray(interventionAlerts)) return [];
    return interventionAlerts.filter(a => a.studentId === student.id || a.studentName === student.name);
  }, [interventionAlerts, student]);

  const fetchStudentFullProfile = React.useCallback(async (studentId) => {
    if (!studentId) return;
    setLoading(true);
    try {
      const portalData = await studentService.getPortalData(studentId);
      const studentInfo = {
        id: portalData?.student?.id || studentId,
        name: `${portalData?.student?.firstName || ''} ${portalData?.student?.lastName || ''}`.trim() || 'Unknown Student',
        index: portalData?.student?.indexNumber || '—',
        classForm: portalData?.student?.currentClass?.name || '—',
        department: portalData?.student?.department?.name || '—',
      };
      setStudent(studentInfo);
      setAcademicHistory(portalData?.academicHistory || []);
      setTerminalResults(portalData?.terminalResults || []);
    } catch (e) {
      console.error('Failed to fetch student profile:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const studentId = params.get('id');

    if (!studentId) {
      const foundFromHOD = allStudents[0];
      if (foundFromHOD) {
        setStudent(foundFromHOD);
        setIsArchived(foundFromHOD.archived || false);
      }
      return;
    }

    const found = allStudents.find(s => s.id === studentId);
    if (found) {
      setStudent(found);
      setIsArchived(found.archived || false);
    } else {
      fetchStudentFullProfile(studentId);
    }
  }, [allStudents, fetchStudentFullProfile]);

  const handleEnterGrade = (subject) => {
    if (!subject) return;
    setGradeSubject(subject);
    setIsEnteringGrade(true);
  };

  const handleCloseGradeEntry = () => {
    setIsEnteringGrade(false);
    setGradeSubject(null);
  };

  if (loading || !student) {
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
  const latestGPA = academicHistory.length > 0 
    ? academicHistory[academicHistory.length - 1]?.gpa || 0 
    : 0;

  return (
    <div className="w-full h-screen bg-[#F4F3EA] text-[#1C1C1E] p-5 font-sans antialiased flex flex-col overflow-hidden">
      <header className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="text-xl font-semibold tracking-tight text-[#1C1C1E]">Student Profile</h1>
        <div className="flex items-center gap-2">
          {isArchived ? (
            <span className="px-3 py-1.5 bg-slate-100 text-xs font-medium rounded-xl flex items-center gap-2 text-slate-600">
              <Lock size={13} /> Archived Record
            </span>
          ) : (
            <button 
              onClick={() => handleEnterGrade(availableSubjects[0])}
              className="px-3 py-1.5 bg-white text-xs font-medium rounded-xl shadow-sm border border-slate-200/60 flex items-center gap-2 text-emerald-700 hover:bg-emerald-50 transition"
            >
              <Unlock size={13} /> <span>Quick Grade Entry</span>
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 bg-white/60 border border-white/80 rounded-[24px] p-4 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[12px] bg-slate-100 border border-white flex items-center justify-center text-slate-400 shrink-0">
                <GraduationCap size={28} />
              </div>
              <div>
                <h2 className="text-lg font-bold leading-tight">{student.name}</h2>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">Index: {student.index}</p>
                <p className="text-[10px] text-gray-500">{student.classForm}</p>
                <p className="text-[10px] font-semibold text-emerald-700 mt-1">GPA: {latestGPA.toFixed(2)}</p>
              </div>
            </div>

            {isArchived && (
              <div className="p-2.5 bg-amber-50/60 border border-amber-200/40 rounded-xl">
                <p className="text-[11px] text-amber-800 font-medium">Record archived. Grades are read-only.</p>
              </div>
            )}

            {studentAlerts.length > 0 && !isArchived && (
              <div className="p-3 bg-rose-50/60 border border-rose-200/40 rounded-xl">
                <p className="text-[10px] font-bold uppercase mb-1.5 flex items-center gap-1 text-rose-800">
                  <AlertTriangle size={11} /> Interventions Required
                </p>
                <div className="space-y-1">
                  {studentAlerts.slice(0, 2).map((alert, idx) => (
                    <p key={idx} className="text-[11px] text-rose-900 leading-tight">
                      <span className="font-medium">{alert.subject}:</span> {alert.reason}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {!isArchived && (
              <div className="mt-auto pt-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                  Select Subject for Entry:
                </label>
                <select 
                  onChange={(e) => handleEnterGrade(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  value={gradeSubject || ""}
                >
                  <option value="" disabled>Choose a configuration setup...</option>
                  {availableSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white/40 border border-white/80 rounded-[24px] p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1 text-gray-600">
                <TrendingUp size={12} /> Performance History (Cumulative)
              </h3>
              <div className="divide-y divide-gray-200/40">
                {academicHistory.length > 0 ? (
                  academicHistory.map((term, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 text-xs implementation-row">
                      <span className="text-gray-500 font-medium">{term.year} {term.term}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono w-8 text-right font-semibold">
                          {term.subjects?.reduce((avg, s) => avg + (s.score || 0), 0) / (term.subjects?.length || 1) / 100 || 0}
                        </span>
                        <span className="w-4">
                          {idx > 0 && term.subjects?.length > 0 ? (
                            <TrendingUp size={13} className="text-emerald-600" />
                          ) : null}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 py-4 text-center">No academic history available</p>
                )}
              </div>
            </div>

            <div className="bg-white/40 border border-white/80 rounded-[24px] p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-gray-600">Subject Tracker</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {terminalResults.length > 0 ? (
                  [...new Set(terminalResults.map(r => r.subject))].map((subject, idx) => {
                    const grades = terminalResults.filter(r => r.subject === subject);
                    const latestGrade = grades[grades.length - 1]?.grade || 'N/A';
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/80 border border-slate-100 rounded-xl">
                        <span className="text-xs font-medium text-gray-700">{subject}</span>
                        <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md">
                          {latestGrade}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400 col-span-2 py-4 text-center">No subjects available</p>
                )}
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
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={handleCloseGradeEntry}
          >
            <motion.div
              initial={{ scale: 0.98, y: 8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: 8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[24px] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Assessment Sheet</h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">Subject Focus: {gradeSubject}</p>
                </div>
                <button 
                  onClick={handleCloseGradeEntry} 
                  className="p-2 hover:bg-slate-200/60 rounded-xl transition text-gray-500"
                >
                  <ArrowLeft size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-white">
                <GradingSheet
                  classInfo={{
                    id: 'standalone',
                    subject: gradeSubject,
                    className: student.classForm,
                    programme: student.department?.toUpperCase() || 'GENERAL',
                    studentCount: 1,
                    form: 'SHS 1',
                    academicYear: '2025/2026',
                  }}
                  students={[{
                    id: student.id,
                    name: student.name,
                    index: student.index,
                    form: 'SHS 1',
                    programme: student.department?.toUpperCase() || 'GENERAL',
                    subjects: [gradeSubject],
                    secA: '', secB: '', secC: '', sba: '', exam: '', final: '', grade: '',
                    auditStatus: 'ACTIVE', subjectType: 'Core'
                  }]}
                  subjectConfig={SUBJECT_CONFIG}
                  stpRules={[
                    { check: (s) => Number(s.final) > 100, message: 'Final score exceeds 100%' },
                    { check: (s) => Number(s.sba) > 30, message: 'SBA exceeds 30% limit' },
                    { check: (s) => Number(s.exam) > 70, message: 'Exam exceeds 70% limit' },
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