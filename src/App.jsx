import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout';
import { Topbar, RightPanel, MobileDrawer, MobileBottomNav } from './components/shared';
import { Dashboard } from './pages/shared';
import { GradingSheet, GRADE_SCALE } from './pages/shared';
import {
  AuditLogsView, ArchiveView, AdminManagement, StaffRegistry,
  DepartmentManagement, StudentRegistry, ParentRegistry,
  ExtendedLogsView, AdminSettings, AdminSupport,
  SchedulingView, FinanceView, CommsView, MasterTimetable, EventCalendarView,
  AcademicArchitect, ReportGeneratorView, GradingRulesView,
} from './pages/admin';
import { HODCertification, HODDashboard, HODArchiveView, HODSettings, HODSupport, HODTeacherManagement } from './pages/hod';
import { StudentJourney, StudentDashboard, StudentTimetable, StudentSettings, StudentSupport } from './pages/student';
import { TeacherTimetableView, TeacherDashboard, TeacherGradingView, TeacherObservationsView, TeacherAnalyticsView, TeacherArchiveView, TeacherArchiveDetailView, TeacherSettings, TeacherSupport } from './pages/teacher';
import { HOD_JourneyHistoryAudit, RevisionsFeed, MissingObservations, SettingsView, SupportView } from './pages/shared';
import { UIProvider, useUI } from './context/UIContext';
import { useRole, RoleProvider } from './context/RoleContext';
import { HODProvider } from './context/HODContext';
import { RequireRole } from './components/auth/RequireRole';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Standalone wrapper for /grading route ─────────────────────────────────────
// Provides the default data sources (mock students, SUBJECT_CONFIG) that
// GradingSheet requires when accessed directly without a container.
function StandaloneGradingWrapper() {
  const SUBJECT_CONFIG_STANDALONE = {
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

  const STANDALONE_MOCK_STUDENTS = [
    { id: '001', name: 'Angela Owusu', index: '001', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture'], secA: 35, secB: 50, secC: 38, sba: 28.5, exam: 61.5, final: 90.0, grade: 'A1', auditStatus: 'MISSING' },
    { id: '002', name: 'Kwame Mensah', index: '002', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture'], secA: 20, secB: 30, secC: 15, sba: 15.2, exam: 32.5, final: 47.7, grade: 'D7', auditStatus: 'MISSING' },
    { id: '003', name: 'Yaw Boateng', index: '003', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture'], secA: 35, secB: 50, secC: 38, sba: 28.5, exam: 61.5, final: 90.0, grade: 'A1', auditStatus: 'COMPLETE' },
    { id: '004', name: 'Esi Ansah', index: '004', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture'], secA: 32, secB: 48, secC: 35, sba: 26.0, exam: 55.0, final: 81.0, grade: 'A1', auditStatus: 'COMPLETE' },
    { id: '005', name: 'Kofi Appiah', index: '005', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture'], secA: 28, secB: 42, secC: 32, sba: 22.0, exam: 46.0, final: 68.0, grade: 'B3', auditStatus: 'COMPLETE' },
    { id: '009', name: 'Ama Serwaa', index: '009', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture'], secA: 30, secB: 40, secC: 35, sba: 25.0, exam: 50.0, final: 75.0, grade: 'A1', auditStatus: 'ACTIVE' },
  ];

  const DEFAULT_STANDALONE_CLASSINFO = {
    id: 'STANDALONE-CLASS',
    subject: 'General Agriculture',
    className: 'SHS 1 Agric B',
    programme: 'AGRICULTURE',
    studentCount: 38,
    form: 'SHS 1',
    academicYear: '2025/2026',
  };

  const STP_STANDALONE = [
    { check: (s) => s.final > 100, message: 'Final score exceeds 100%' },
    { check: (s) => s.sba > 30, message: 'SBA exceeds 30% limit' },
    { check: (s) => s.exam > 70, message: 'Exam exceeds 70% limit' },
    { check: (s) => s.auditStatus === 'MISSING', message: 'Missing behavioral observations' },
  ];

  return (
    <GradingSheet
      classInfo={DEFAULT_STANDALONE_CLASSINFO}
      students={STANDALONE_MOCK_STUDENTS}
      subjectConfig={SUBJECT_CONFIG_STANDALONE}
      stpRules={STP_STANDALONE}
      isTermFinalized={false}
    />
  );
}

function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <h3 className="text-xl font-black text-gray-900">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const RoleBasedArchiveView = () => {
  const { user } = useRole();
  if (user?.role === 'ADMIN') return <ArchiveView />;
  if (user?.role === 'HOD') return <HODArchiveView />;
  if (user?.role === 'TEACHER') return <TeacherArchiveView />;
  return <ArchiveView />;
};

function AppContent() {
  const location = useLocation();
  const { user } = useRole();
  const isDashboard = location.pathname === '/';
  const { settingsModalOpen, setSettingsModalOpen, supportModalOpen, setSupportModalOpen } = useUI();

  React.useEffect(() => {
    let timeout;
    const resetTimer = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
      }, 15 * 60 * 1000);
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);
    resetTimer();
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="flex h-screen bg-[#F9F9F7] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {location.pathname !== '/journey-audit' && <Topbar />}
        <main className="flex-1 flex overflow-hidden relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/journey" element={
              <RequireRole allowedRoles={['STUDENT']}><StudentJourney /></RequireRole>
            } />
            <Route path="/student-dashboard" element={
              <RequireRole allowedRoles={['STUDENT']}><StudentDashboard /></RequireRole>
            } />
            <Route path="/timetable" element={
              <RequireRole allowedRoles={['TEACHER', 'STUDENT', 'ADMIN']}>
                {user?.role === 'STUDENT' ? <StudentTimetable /> :
                 user?.role === 'ADMIN' ? <SchedulingView /> : <TeacherTimetableView />}
              </RequireRole>
            } />
            <Route path="/grading" element={
              <RequireRole allowedRoles={['TEACHER', 'HOD', 'ADMIN']}>
                {user?.role === 'ADMIN' ? <GradingRulesView /> : <StandaloneGradingWrapper />}
              </RequireRole>
            } />
            <Route path="/teacher-dashboard" element={
              <RequireRole allowedRoles={['TEACHER']}><TeacherDashboard /></RequireRole>
            } />
            <Route path="/teacher/grading" element={
              <RequireRole allowedRoles={['TEACHER']}><TeacherGradingView /></RequireRole>
            } />
            <Route path="/teacher/observations" element={
              <RequireRole allowedRoles={['TEACHER']}><TeacherObservationsView /></RequireRole>
            } />
    <Route path="/teacher/analytics" element={
      <RequireRole allowedRoles={['TEACHER']}><TeacherAnalyticsView /></RequireRole>
    } />
<Route path="/teacher/archive" element={
       <RequireRole allowedRoles={['TEACHER']}><TeacherArchiveView /></RequireRole>
     } />
     <Route path="/archive/teacher/:id" element={
       <RequireRole allowedRoles={['TEACHER']}><TeacherArchiveDetailView /></RequireRole>
     } />
            <Route path="/hod-teachers" element={
              <RequireRole allowedRoles={['HOD']}><HODTeacherManagement /></RequireRole>
            } />
            <Route path="/certification" element={
              <RequireRole allowedRoles={['HOD']}><HODCertification /></RequireRole>
            } />
            <Route path="/hod-dashboard" element={
              <RequireRole allowedRoles={['HOD']}><HODDashboard /></RequireRole>
            } />
            <Route path="/system" element={
              <RequireRole allowedRoles={['ADMIN']}><AdminManagement /></RequireRole>
            } />
            <Route path="/finance" element={
              <RequireRole allowedRoles={['ADMIN']}><FinanceView /></RequireRole>
            } />
            <Route path="/comms" element={
              <RequireRole allowedRoles={['ADMIN']}><CommsView /></RequireRole>
            } />
            <Route path="/academic-architect" element={
              <RequireRole allowedRoles={['ADMIN']}><AcademicArchitect /></RequireRole>
            } />
            <Route path="/audit" element={
              <RequireRole allowedRoles={['HOD', 'ADMIN']}><AuditLogsView /></RequireRole>
            } />
            <Route path="/audit/extended" element={
              <RequireRole allowedRoles={['ADMIN']}><ExtendedLogsView /></RequireRole>
            } />
            <Route path="/archive" element={
              <RequireRole allowedRoles={['ADMIN', 'TEACHER', 'HOD']}><RoleBasedArchiveView /></RequireRole>
            } />
            <Route path="/revisions" element={
              <RequireRole allowedRoles={['TEACHER', 'HOD']}><RevisionsFeed /></RequireRole>
            } />
            <Route path="/missing-observations" element={
              <RequireRole allowedRoles={['TEACHER', 'HOD']}><MissingObservations /></RequireRole>
            } />
            <Route path="/journey-audit" element={
              <RequireRole allowedRoles={['HOD']}><HOD_JourneyHistoryAudit /></RequireRole>
            } />
            <Route path="/identity/staff" element={
              <RequireRole allowedRoles={['ADMIN']}><StaffRegistry /></RequireRole>
            } />
            <Route path="/identity/departments" element={
              <RequireRole allowedRoles={['ADMIN']}><DepartmentManagement /></RequireRole>
            } />
            <Route path="/identity/students" element={
              <RequireRole allowedRoles={['ADMIN']}><StudentRegistry /></RequireRole>
            } />
            <Route path="/identity/parents" element={
              <RequireRole allowedRoles={['ADMIN']}><ParentRegistry /></RequireRole>
            } />
            <Route path="/settings" element={
              <RequireRole allowedRoles={['STUDENT', 'HOD', 'ADMIN', 'TEACHER']}>
                {user?.role === 'STUDENT' ? <StudentSettings /> :
                 user?.role === 'HOD' ? <HODSettings /> :
                 user?.role === 'ADMIN' ? <AdminSettings /> : <TeacherSettings />}
              </RequireRole>
            } />
            <Route path="/support" element={
              <RequireRole allowedRoles={['STUDENT', 'HOD', 'ADMIN', 'TEACHER']}>
                {user?.role === 'STUDENT' ? <StudentSupport /> :
                 user?.role === 'HOD' ? <HODSupport /> :
                 user?.role === 'ADMIN' ? <AdminSupport /> : <TeacherSupport />}
              </RequireRole>
            } />
          </Routes>

          {isDashboard && user?.role !== 'ADMIN' && (
            <div className="hidden xl:block">
              <RightPanel />
            </div>
          )}
        </main>
      </div>

      <MobileDrawer />
      <MobileBottomNav />

      <Modal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        title="Identity & Security Control"
      >
        {user?.role === 'STUDENT' ? <StudentSettings /> :
         user?.role === 'HOD' ? <HODSettings /> :
         user?.role === 'ADMIN' ? <AdminSettings /> : <SettingsView />}
      </Modal>

      <Modal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        title="ICT Support Desk"
      >
        {user?.role === 'STUDENT' ? <StudentSupport /> :
         user?.role === 'HOD' ? <HODSupport /> :
         user?.role === 'ADMIN' ? <AdminSupport /> : <SupportView />}
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <RoleProvider>
        <HODProvider>
          <UIProvider>
            <AppContent />
          </UIProvider>
        </HODProvider>
      </RoleProvider>
    </Router>
  );
}