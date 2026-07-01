import React, { useState, useEffect, useMemo } from 'react';
import { GraduationCap, Lock, Unlock, ArrowLeft, User, TrendingUp, TrendingDown, AlertTriangle, Calendar, Mail, Phone, MapPin, BookOpen, Award, BarChart3, Bell, FileText, ClipboardList, CheckCircle, XCircle, GraduationCap as GradCap, Heart, Home, Building2, CalendarDays, Hash, School } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHOD } from '../../context/HODContext';
import { useRole } from '../../context/RoleContext';
import { useBreadcrumb } from '../../context/BreadcrumbContext';
import { EmptyState } from '../../components/molecules';
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

function formatDOB(dob) {
  if (!dob) return '—';
  try {
    const d = new Date(dob);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return '—'; }
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return '—'; }
}

function SimpleBar({ value, max = 100, color = 'bg-brand-secondary' }) {
  const pct = Math.min(100, Math.max(0, (Number(value) || 0) / max * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono font-bold text-gray-600 w-8 text-right">{value ?? 0}</span>
    </div>
  );
}

export function StudentProfile() {
  const { archivedClasses, interventionAlerts } = useHOD();
  const { user } = useRole();
  const { setBreadcrumb } = useBreadcrumb();
  const [portalData, setPortalData] = useState(null);
  const [isArchived, setIsArchived] = useState(false);
  const [isEnteringGrade, setIsEnteringGrade] = useState(false);
  const [gradeSubject, setGradeSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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

  const backendStudent = portalData?.student;
  const studentName = portalData
    ? `${backendStudent?.firstName || ''} ${backendStudent?.lastName || ''}`.trim() || 'Unknown Student'
    : null;
  const studentIndex = backendStudent?.indexNumber || '—';
  const classForm = backendStudent?.currentClass?.name || '—';
  const department = backendStudent?.department?.name || '—';

  const academicHistory = portalData?.academicHistory || [];
  const terminalResults = portalData?.terminalResults || [];
  const coreResults = portalData?.coreResults || [];
  const technicalResults = portalData?.technicalResults || [];
  const recentResults = portalData?.recentResults || [];
  const notifications = portalData?.notifications || [];
  const activeInterventions = portalData?.activeInterventions || [];
  const wassceResults = portalData?.wassceResults || [];
  const behavioralLogs = portalData?.behavioralLogs || [];
  const characterTraits = portalData?.characterTraits || null;

  const latestGPA = academicHistory.length > 0
    ? Number(academicHistory[academicHistory.length - 1]?.gpa || 0)
    : Number(portalData?.cgpa || 0);

  const fetchStudentFullProfile = React.useCallback(async (studentId) => {
    if (!studentId) return;
    setLoading(true);
    setApiError(null);
    try {
      const data = await studentService.getPortalData(studentId);
      setPortalData(data || null);
    } catch (e) {
      console.error('Failed to fetch student profile:', e);
      setApiError(e?.message || 'Failed to load student profile from server');
    } finally {
      setLoading(false);
    }
  }, []);

  const PROFILE_TABS = [
    { id: 'overview', label: 'Subject Tracker' },
    { id: 'history', label: 'Academic History' },
    { id: 'recent', label: 'Recent Results' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'wasce', label: 'WASSCE' },
    { id: 'behavior', label: 'Behavior Logs' },
  ];

  useEffect(() => {
    const tabLabel = PROFILE_TABS.find(t => t.id === activeTab)?.label || activeTab;
    setBreadcrumb([{ label: 'Student Profile', path: '/student-profile' }, { label: tabLabel, path: null }]);
  }, [activeTab, setBreadcrumb]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const studentId = params.get('id');

    if (!studentId) {
      const foundFromHOD = allStudents[0];
      if (foundFromHOD) {
        setPortalData({
          student: {
            id: foundFromHOD.id,
            firstName: foundFromHOD.name,
            lastName: '',
            indexNumber: foundFromHOD.index,
            currentClass: { name: foundFromHOD.classForm },
          },
          academicHistory: [],
          terminalResults: [],
          coreResults: [],
          technicalResults: [],
          recentResults: [],
          notifications: [],
          activeInterventions: [],
          wassceResults: [],
          behavioralLogs: [],
          characterTraits: null,
          cgpa: 0,
        });
        setIsArchived(foundFromHOD.archived || false);
      }
      return;
    }

    fetchStudentFullProfile(studentId);
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F4F3EA] p-6">
        <div className="text-center">
          <User size={48} className="text-gray-300 mx-auto mb-3 animate-pulse" />
          <p className="text-xs font-medium text-gray-500">Loading student profile...</p>
        </div>
      </div>
    );
  }

  if (!portalData || !backendStudent) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F4F3EA] p-6">
        <div className="text-center">
          <User size={48} className="text-gray-300 mx-auto mb-3" />
          {apiError ? (
            <div>
              <p className="text-xs font-medium text-red-500 mb-1">Error loading profile</p>
              <p className="text-[10px] text-gray-400">{apiError}</p>
            </div>
          ) : (
            <EmptyState context="students" />
          )}
        </div>
      </div>
    );
  }

  const availableSubjects = Object.keys(SUBJECT_CONFIG);
  const fullName = `${backendStudent?.firstName || ''} ${backendStudent?.middleName || ''} ${backendStudent?.lastName || ''}`.replace(/\s+/g, ' ').trim() || 'Unknown Student';

  const overviewStats = [
    { label: 'CGPA', value: latestGPA.toFixed(2), icon: Award, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Attendance', value: `${portalData?.attendancePercentage ?? 0}%`, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'SBA Avg', value: `${portalData?.sbaScore ?? 0}%`, icon: BarChart3, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Exam Avg', value: `${portalData?.waecExamScore ?? 0}%`, icon: GraduationCap, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

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
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white/60 border border-white/80 rounded-[24px] p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[12px] bg-slate-100 border border-white flex items-center justify-center text-slate-400 shrink-0">
                  <GraduationCap size={28} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold leading-tight truncate">{fullName}</h2>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">Index: {studentIndex}</p>
                  <p className="text-[10px] text-gray-500">{classForm}</p>
                  <p className="text-[10px] text-gray-500">{department}</p>
                </div>
              </div>

              {isArchived && (
                <div className="p-2.5 bg-amber-50/60 border border-amber-200/40 rounded-xl">
                  <p className="text-[11px] text-amber-800 font-medium">Record archived. Grades are read-only.</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <Mail size={11} className="text-gray-400" />
                  <span className="truncate">{backendStudent?.user?.email || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <Calendar size={11} className="text-gray-400" />
                  <span>DOB: {formatDOB(backendStudent?.dateOfBirth)}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <BookOpen size={11} className="text-gray-400" />
                  <span>Gender: {backendStudent?.gender || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <CalendarDays size={11} className="text-gray-400" />
                  <span>Admitted: {formatDate(portalData?.enrollmentDate || backendStudent?.admissionDate)}</span>
                </div>
                {portalData?.completionDate && (
                  <div className="flex items-center gap-2 text-[11px] text-gray-600">
                    <GraduationCap size={11} className="text-gray-400" />
                    <span>Completed: {formatDate(portalData.completionDate)}</span>
                  </div>
                )}
                {portalData?.house && (
                  <div className="flex items-center gap-2 text-[11px] text-gray-600">
                    <Home size={11} className="text-gray-400" />
                    <span>House: {portalData.house}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/60 border border-white/80 rounded-[24px] p-4">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Academic Overview</h3>
              <div className="grid grid-cols-2 gap-2">
                {overviewStats.map((stat) => (
                  <div key={stat.label} className={`p-3 rounded-xl border ${stat.color}`}>
                    <p className="text-[9px] font-black uppercase tracking-wider opacity-70">{stat.label}</p>
                    <p className="text-sm font-black">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-gray-500">Year / Term</span>
                  <span className="font-bold text-gray-800">{portalData?.yearForm || '—'} / {portalData?.semester || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-gray-500">Class</span>
                  <span className="font-bold text-gray-800">{classForm}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-gray-500">Program</span>
                  <span className="font-bold text-gray-800">{portalData?.programName || department || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-gray-500">Learning Area</span>
                  <span className="font-bold text-gray-800">{portalData?.learningArea || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-gray-500">Approval</span>
                  <span className={`font-black uppercase ${portalData?.approvalStatus === 'APPROVED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {portalData?.approvalStatus || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>

            {characterTraits && (
              <div className="bg-white/60 border border-white/80 rounded-[24px] p-4">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Character & Behavior</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-gray-500">Overall Quality</span>
                    <span className="font-black text-gray-800">{characterTraits.characterQualities?.toFixed(1) ?? 0}</span>
                  </div>
                  {['leadership', 'discipline', 'teamwork', 'ethics', 'communication', 'responsibility'].map((trait) => (
                    <div key={trait} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-medium text-gray-600 capitalize">{trait}</span>
                        <span className="font-mono font-bold text-gray-700">{characterTraits[trait] ?? 0}</span>
                      </div>
                      <SimpleBar value={characterTraits[trait] ?? 0} max={5} color="bg-brand-secondary" />
                    </div>
                  ))}
                </div>
                {portalData?.behaviorComments && (
                  <div className="mt-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-gray-600 italic">"{portalData.behaviorComments}"</p>
                  </div>
                )}
              </div>
            )}

            {activeInterventions.length > 0 && (
              <div className="bg-rose-50/60 border border-rose-200/40 rounded-[24px] p-4">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-rose-800 mb-3 flex items-center gap-1">
                  <AlertTriangle size={11} /> Active Interventions ({activeInterventions.length})
                </h3>
                <div className="space-y-2">
                  {activeInterventions.map((alert, idx) => (
                    <div key={idx} className="p-2 bg-white/60 rounded-lg border border-rose-100">
                      <p className="text-[10px] font-bold text-rose-900 uppercase">{alert.subject || 'General'}</p>
                      <p className="text-[10px] text-rose-800">{alert.reason || alert.description || 'Intervention required'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white/40 border border-white/80 rounded-[24px] p-4">
              <div className="flex items-center gap-4 border-b border-gray-200/40 mb-4">
                {[
                  { id: 'overview', label: 'Subject Tracker', icon: BookOpen },
                  { id: 'history', label: 'Academic History', icon: TrendingUp },
                  { id: 'recent', label: 'Recent Results', icon: ClipboardList },
                  ...(user?.role === 'STUDENT' ? [{ id: 'notifications', label: 'Notifications', icon: Bell }] : []),
                  { id: 'wasce', label: 'WASSCE', icon: GraduationCap },
                  { id: 'behavior', label: 'Behavior Logs', icon: Heart },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 pb-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      activeTab === tab.id ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <tab.icon size={11} />
                    {tab.label}
                    {tab.id === 'notifications' && notifications.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-brand-secondary text-white text-[9px] rounded-full font-black">{notifications.length}</span>
                    )}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {terminalResults.length > 0 ? (
                      [...new Set(terminalResults.map(r => r.subject))].map((subject, idx) => {
                        const grades = terminalResults.filter(r => r.subject === subject);
                        const latest = grades[grades.length - 1];
                        return (
                          <div key={idx} className="p-4 bg-white/80 border border-slate-100 rounded-xl">
                            <p className="text-xs font-bold text-gray-800 mb-2">{subject}</p>
                            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
                              <div>
                                <p className="text-gray-400 uppercase">SBA</p>
                                <p className="font-bold text-gray-900">{latest?.sbaScore ?? latest?.classScore ?? 0}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 uppercase">Exam</p>
                                <p className="font-bold text-gray-900">{latest?.examScore ?? 0}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 uppercase">Final</p>
                                <p className="font-bold text-gray-900">{latest?.finalScore ?? latest?.totalScore ?? 0}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 uppercase">Grade</p>
                                <p className="font-black text-emerald-700">{latest?.grade || '—'}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <EmptyState context="results" variant="compact" />
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="bg-white/40 border border-white/80 rounded-[24px] p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1 text-gray-600">
                    <TrendingUp size={12} /> Performance History (Cumulative)
                  </h3>
                  <div className="divide-y divide-gray-200/40">
                    {academicHistory.length > 0 ? (
                      academicHistory.map((term, idx) => (
                        <div key={idx} className="py-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-700">{term.year} {term.term}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold text-gray-600">
                                Avg: {term.subjects?.length ? (term.subjects.reduce((a, s) => a + (s.score || 0), 0) / term.subjects.length).toFixed(1) : 0}
                              </span>
                              {term.approvalStatus === 'APPROVED' ? (
                                <CheckCircle size={11} className="text-emerald-500" />
                              ) : (
                                <XCircle size={11} className="text-amber-500" />
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
                            {term.subjects?.map((sub, si) => (
                              <div key={si} className="flex items-center justify-between p-1.5 bg-slate-50 rounded-md border border-slate-100">
                                <span className="text-[9px] font-medium text-gray-600 truncate">{sub.name}</span>
                                <span className="text-[9px] font-black text-gray-900">{sub.grade || sub.score?.toFixed(0) || '—'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState context="results" variant="compact" />
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'recent' && (
                <div className="overflow-hidden">
                  {recentResults.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="text-left text-[9px] font-black uppercase text-gray-400 border-b border-gray-200/60">
                            <th className="pb-2 pr-4">Subject</th>
                            <th className="pb-2 pr-4">Term</th>
                            <th className="pb-2 pr-4">SBA</th>
                            <th className="pb-2 pr-4">Exam</th>
                            <th className="pb-2 pr-4">Total</th>
                            <th className="pb-2 pr-4">Grade</th>
                            <th className="pb-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/40">
                          {recentResults.map((r, i) => (
                            <tr key={i}>
                              <td className="py-2 pr-4 font-medium text-gray-800">{r.subject?.name || '—'}</td>
                              <td className="py-2 pr-4 font-mono text-gray-600">{r.term?.termNumber || '—'}</td>
                              <td className="py-2 pr-4 font-mono">{r.classScore ?? 0}</td>
                              <td className="py-2 pr-4 font-mono">{r.examScore ?? 0}</td>
                              <td className="py-2 pr-4 font-mono font-bold">{r.totalScore ?? 0}</td>
                              <td className="py-2 pr-4 font-black text-emerald-700">{r.grade || '—'}</td>
                              <td className="py-2">
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                                  r.auditStatus === 'LOCKED' ? 'bg-slate-100 text-slate-600' :
                                  r.auditStatus === 'AUDITED' ? 'bg-amber-100 text-amber-700' :
                                  'bg-emerald-100 text-emerald-700'
                                }`}>{r.auditStatus || '—'}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-6 text-center">No recent results</p>
                  )}
                </div>
              )}

              {              activeTab === 'notifications' && user?.role === 'STUDENT' && (
                <div className="space-y-2">
                  {notifications.length > 0 ? (
                    notifications.map((n, idx) => (
                      <div key={idx} className={`p-3 rounded-xl border ${n.isRead ? 'bg-white/40 border-gray-200/60' : 'bg-brand-secondary/5 border-brand-secondary/20'}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-bold text-gray-900">{n.title || n.message || 'Notification'}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{n.body || n.message || ''}</p>
                          </div>
                          {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-secondary mt-1 shrink-0" />}
                        </div>
                        <p className="text-[9px] font-mono text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                      </div>
                    ))
                  ) : (
                      <EmptyState context="notifications" variant="compact" />
                  )}
                </div>
              )}

              {activeTab === 'wasce' && (
                <div>
                  {wassceResults.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="text-left text-[9px] font-black uppercase text-gray-400 border-b border-gray-200/60">
                            <th className="pb-2 pr-4">Subject</th>
                            <th className="pb-2 pr-4">Grade</th>
                            <th className="pb-2 pr-4">Raw Score</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/40">
                          {wassceResults.map((r, i) => (
                            <tr key={i}>
                              <td className="py-2 pr-4 font-medium text-gray-800">{r.subject || r.subjectName || '—'}</td>
                              <td className="py-2 pr-4 font-black text-emerald-700">{r.grade || '—'}</td>
                              <td className="py-2 pr-4 font-mono">{r.score ?? r.rawScore ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 py-6 text-center">No WASSCE results on file</p>
                  )}
                </div>
              )}

              {activeTab === 'behavior' && (
                <div className="space-y-3">
                  {behavioralLogs.length > 0 ? (
                    behavioralLogs.map((log, idx) => (
                      <div key={idx} className="p-3 bg-white/60 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase text-gray-500">Rating: {log.attitude ?? log.rating ?? '—'}</span>
                          <span className="text-[9px] font-mono text-gray-400">{formatDate(log.createdAt)}</span>
                        </div>
                        <p className="text-[11px] text-gray-700">{log.remarks || log.comments || 'No comments recorded.'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 py-6 text-center">No behavioral logs recorded</p>
                  )}
                </div>
              )}
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
                    className: classForm,
                    programme: department?.toUpperCase() || 'GENERAL',
                    studentCount: 1,
                    form: 'SHS 1',
                    academicYear: '2025/2026',
                  }}
                  students={[{
                    id: backendStudent.id,
                    name: studentName,
                    index: studentIndex,
                    form: 'SHS 1',
                    programme: department?.toUpperCase() || 'GENERAL',
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
                  targetStudentId={backendStudent.id}
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
