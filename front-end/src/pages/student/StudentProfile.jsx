import React, { useState, useEffect, useMemo } from 'react';
import { GraduationCap, Lock, Unlock, User, FileText, BookOpen, TrendingUp, Bell, Heart, HeartPulse, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHOD } from '../../context/HODContext';
import { useRole } from '../../context/RoleContext';
import { useBreadcrumb } from '../../context/BreadcrumbContext';
import { EmptyState } from '../../components/molecules';
import { GradingSheet } from '../../pages/shared/GradingSheet';
import { studentService } from '../../services/studentService';
import '@/index.css';
import { SUBJECT_CONFIG } from './subjectConfig';
import { StudentSidebar } from './StudentSidebar';
import { OverviewTab } from './OverviewTab';
import { HistoryTab } from './HistoryTab';
import { RecentResultsTab } from './RecentResultsTab';
import { WASSCETab } from './WASSCETab';
import { NotificationsTab } from './NotificationsTab';
import { BehaviorTab } from './BehaviorTab';
import { MedicalTab } from './MedicalTab';

function formatDOB(dob) {
  if (!dob) return '—';
  try { const d = new Date(dob); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return '—'; }
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try { const d = new Date(dateStr); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return '—'; }
}

export function StudentProfile() {
  const { archivedClasses } = useHOD();
  const { user } = useRole();
  const { setBreadcrumb } = useBreadcrumb();
  const [portalData, setPortalData] = useState(null);
  const [isArchived, setIsArchived] = useState(false);
  const [isEnteringGrade, setIsEnteringGrade] = useState(false);
  const [gradeSubject, setGradeSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddingMedical, setIsAddingMedical] = useState(false);
  const [medicalForm, setMedicalForm] = useState({ condition: '', onsetDate: '', resolvedAt: '', treatment: '', medication: '', dosage: '', notes: '', status: 'ACTIVE' });
  const [medicalSubmitting, setMedicalSubmitting] = useState(false);

  const allStudents = useMemo(() => {
    const students = [];
    if (archivedClasses && Array.isArray(archivedClasses)) {
      archivedClasses.forEach(archived => {
        if (archived.students && Array.isArray(archived.students)) {
          archived.students.forEach(s => {
            students.push({ id: s.id, name: s.name, index: s.indexNumber || s.index, classForm: archived.className || archived.class, archived: archived.status === 'LOCKED' || archived.status === 'ARCHIVED' });
          });
        }
      });
    }
    return students;
  }, [archivedClasses]);

  const backendStudent = portalData?.student;
  const studentName = portalData ? `${backendStudent?.firstName || ''} ${backendStudent?.lastName || ''}`.trim() || 'Unknown Student' : null;
  const studentIndex = backendStudent?.indexNumber || '—';
  const classForm = backendStudent?.currentClass?.name || '—';
  const department = backendStudent?.department?.name || '—';
  const academicHistory = portalData?.academicHistory || [];
  const terminalResults = portalData?.terminalResults || [];
  const recentResults = portalData?.recentResults || [];
  const notifications = portalData?.notifications || [];
  const activeInterventions = portalData?.activeInterventions || [];
  const wassceResults = portalData?.wassceResults || [];
  const behavioralLogs = portalData?.behavioralLogs || [];
  const characterTraits = portalData?.characterTraits || null;
  const latestGPA = academicHistory.length > 0 ? Number(academicHistory[academicHistory.length - 1]?.gpa || 0) : Number(portalData?.cgpa || 0);

  const fetchStudentFullProfile = React.useCallback(async (studentId) => {
    if (!studentId) return;
    setLoading(true); setApiError(null);
    try { const data = await studentService.getPortalData(studentId); setPortalData(data || null); }
    catch (e) { console.error('Failed to fetch student profile:', e); setApiError(e?.message || 'Failed to load student profile'); }
    finally { setLoading(false); }
  }, []);

  const PROFILE_TABS = [
    { id: 'overview', label: 'Subject Tracker', icon: BookOpen },
    { id: 'history', label: 'Academic History', icon: TrendingUp },
    { id: 'recent', label: 'Recent Results', icon: FileText },
    ...(user?.role === 'STUDENT' ? [{ id: 'notifications', label: 'Notifications', icon: Bell }] : []),
    { id: 'wasce', label: 'WASSCE', icon: GraduationCap },
    { id: 'behavior', label: 'Behavior Logs', icon: Heart },
    { id: 'medical', label: 'Medical Records', icon: HeartPulse },
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
          student: { id: foundFromHOD.id, firstName: foundFromHOD.name, lastName: '', indexNumber: foundFromHOD.index, currentClass: { name: foundFromHOD.classForm } },
          academicHistory: [], terminalResults: [], coreResults: [], technicalResults: [], recentResults: [], notifications: [], activeInterventions: [], wassceResults: [], behavioralLogs: [], characterTraits: null, cgpa: 0,
        });
        setIsArchived(foundFromHOD.archived || false);
      }
      return;
    }
    fetchStudentFullProfile(studentId);
  }, [allStudents, fetchStudentFullProfile]);

  const handleEnterGrade = (subject) => { if (!subject) return; setGradeSubject(subject); setIsEnteringGrade(true); };

  const handleAddMedicalRecord = async () => {
    if (!medicalForm.condition.trim()) return;
    setMedicalSubmitting(true);
    try {
      await studentService.createMedicalRecord(backendStudent.id, medicalForm);
      setIsAddingMedical(false);
      setMedicalForm({ condition: '', onsetDate: '', resolvedAt: '', treatment: '', medication: '', dosage: '', notes: '', status: 'ACTIVE' });
      fetchStudentFullProfile(backendStudent.id);
    } catch (e) { alert(e.message || 'Failed to add medical record'); }
    finally { setMedicalSubmitting(false); }
  };

  const handleUpdateMedicalRecord = async (recordId, data) => {
    try { await studentService.updateMedicalRecord(backendStudent.id, recordId, data); fetchStudentFullProfile(backendStudent.id); }
    catch (e) { alert(e.message || 'Failed to update medical record'); }
  };

  const handleDeleteMedicalRecord = async (recordId) => {
    if (!confirm('Delete this medical record?')) return;
    try { await studentService.deleteMedicalRecord(backendStudent.id, recordId); fetchStudentFullProfile(backendStudent.id); }
    catch (e) { alert(e.message || 'Failed to delete medical record'); }
  };

  const handleCloseGradeEntry = () => { setIsEnteringGrade(false); setGradeSubject(null); };

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
          {apiError ? (<div><p className="text-xs font-medium text-red-500 mb-1">Error loading profile</p><p className="text-[10px] text-gray-400">{apiError}</p></div>) : <EmptyState context="students" />}
        </div>
      </div>
    );
  }

  const availableSubjects = Object.keys(SUBJECT_CONFIG);

  return (
    <div className="w-full h-screen bg-[#F4F3EA] text-[#1C1C1E] p-5 font-sans antialiased flex flex-col overflow-hidden">
      <header className="flex items-center justify-between mb-4 shrink-0">
        <h1 className="text-xl font-semibold tracking-tight text-[#1C1C1E]">Student Profile</h1>
        <div className="flex items-center gap-2">
          {isArchived ? (<span className="px-3 py-1.5 bg-slate-100 text-xs font-medium rounded-xl flex items-center gap-2 text-slate-600"><Lock size={13} /> Archived Record</span>)
          : (<button onClick={() => handleEnterGrade(availableSubjects[0])} className="px-3 py-1.5 bg-white text-xs font-medium rounded-xl shadow-sm border border-slate-200/60 flex items-center gap-2 text-emerald-700 hover:bg-emerald-50 transition"><Unlock size={13} /> <span>Quick Grade Entry</span></button>)}
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <StudentSidebar portalData={portalData} backendStudent={backendStudent} isArchived={isArchived} characterTraits={characterTraits} activeInterventions={activeInterventions} />

          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white/40 border border-white/80 rounded-[24px] p-4">
              <div className="flex items-center gap-4 border-b border-gray-200/40 mb-4">
                {PROFILE_TABS.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 pb-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === tab.id ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-gray-600'}`}>
                    <tab.icon size={11} />
                    {tab.label}
                    {tab.id === 'notifications' && notifications.length > 0 && (<span className="ml-1 px-1.5 py-0.5 bg-brand-secondary text-white text-[9px] rounded-full font-black">{notifications.length}</span>)}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && <OverviewTab terminalResults={terminalResults} />}
              {activeTab === 'history' && <HistoryTab academicHistory={academicHistory} />}
              {activeTab === 'recent' && <RecentResultsTab recentResults={recentResults} />}
              {activeTab === 'notifications' && user?.role === 'STUDENT' && <NotificationsTab notifications={notifications} formatDate={formatDate} />}
              {activeTab === 'wasce' && <WASSCETab wassceResults={wassceResults} />}
              {activeTab === 'behavior' && <BehaviorTab behavioralLogs={behavioralLogs} formatDate={formatDate} />}
              {activeTab === 'medical' && (
                <MedicalTab user={user} isAddingMedical={isAddingMedical} setIsAddingMedical={setIsAddingMedical} medicalForm={medicalForm} setMedicalForm={setMedicalForm} medicalSubmitting={medicalSubmitting} portalData={portalData} backendStudent={backendStudent} handleAddMedicalRecord={handleAddMedicalRecord} handleUpdateMedicalRecord={handleUpdateMedicalRecord} handleDeleteMedicalRecord={handleDeleteMedicalRecord} formatDate={formatDate} />
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isEnteringGrade && gradeSubject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" onClick={handleCloseGradeEntry}>
            <motion.div initial={{ scale: 0.98, y: 8, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.98, y: 8, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[24px] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Assessment Sheet</h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">Subject Focus: {gradeSubject}</p>
                </div>
                <button onClick={handleCloseGradeEntry} className="p-2 hover:bg-slate-200/60 rounded-xl transition text-gray-500">
                  <ArrowLeft size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 bg-white">
                <GradingSheet
                  classInfo={{ id: 'standalone', subject: gradeSubject, className: classForm, programme: department?.toUpperCase() || 'GENERAL', studentCount: 1, form: 'SHS 1', academicYear: '2025/2026' }}
                  students={[{ id: backendStudent.id, name: studentName, index: studentIndex, form: 'SHS 1', programme: department?.toUpperCase() || 'GENERAL', subjects: [gradeSubject], secA: '', secB: '', secC: '', sba: '', exam: '', final: '', grade: '', auditStatus: 'ACTIVE', subjectType: 'Core' }]}
                  subjectConfig={SUBJECT_CONFIG}
                  stpRules={[{ check: (s) => Number(s.final) > 100, message: 'Final score exceeds 100%' }, { check: (s) => Number(s.sba) > 30, message: 'SBA exceeds 30% limit' }, { check: (s) => Number(s.exam) > 70, message: 'Exam exceeds 70% limit' }]}
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