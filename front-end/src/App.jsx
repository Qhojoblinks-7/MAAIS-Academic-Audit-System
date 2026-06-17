import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AdminSidebar, HODSidebar, StudentSidebar, TeacherSidebar } from './components/layout';
import { Topbar, RightPanel, MobileDrawer, StudentMobileDrawer } from './components/shared';
import { Dashboard, GradingSheet, HOD_JourneyHistoryAudit, SettingsView, SupportView } from './pages/shared';
import {
  AuditLogsView, ArchiveView, AdminManagement, StaffRegistry,
  DepartmentManagement, StudentRegistry, ParentRegistry,
  ExtendedLogsView, AdminSettings, AdminSupport,
  SchedulingView, CommsView, MasterTimetable, EventCalendarView,
  AcademicArchitect, ReportGeneratorView, GradingRulesView,
  ApprovalsView, ApprovalInspectView, NewApprovalRequestView,
  SupportTicketDetailView
} from './pages/admin';
import { 
  HODDashboard, HODAudit, HODInterventions, HODReview, 
  HODLockExport, HODSettings, HODSettingsPage, HODSupportPage, 
  HODTeachers, HODAnalytics, HODArchiveView, HODArchiveDetailView, 
  Unauthorized, BroadsheetGenerator, HODCertification, HODRevisionsFeed,
  HODMissingObservations 
} from './pages/hod';
import { StudentTimetable, StudentSettings, StudentSupport, StudentPortal, StudentProfile } from './pages/student';
import { 
  TeacherTimetableView, TeacherDashboard, TeacherGradingView, 
  TeacherObservationsView, TeacherAnalyticsView, TeacherArchiveView, 
  TeacherArchiveDetailView, TeacherSettings, TeacherSupport, 
  TeacherRevisionsFeed, TeacherMissingObservations 
} from './pages/teacher';
import { LoginPage } from './pages/auth/LoginPage';
import { TooltipProvider } from './components/ui/tooltip';
import { UIProvider, useUI } from './context/UIContext';
import { useRole } from './context/RoleContext';
import { HODProvider } from './context/HODContext';
import { RequireRole } from './components/auth/RequireRole';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationsPage } from './pages/NotificationsPage';

// Helper Component for Dynamic Missing Observations Layout
function RoleBasedMissingObservations() {
  const { user } = useRole();
  return user?.role === 'TEACHER' ? <TeacherMissingObservations /> : <HODMissingObservations />;
}

// Standalone Grading Context Wrapper
function StandaloneGradingWrapper() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const getMissingObsId = searchParams.get('missing');
  const getTargetStudentIndex = searchParams.get('student');
  
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
    { id: 'stud001', name: 'Angela Owusu', index: '001', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture'], secA: 35, secB: 50, secC: 38, sba: 28.5, exam: 61.5, final: 90.0, grade: 'A1', auditStatus: 'MISSING' },
    { id: 'stud002', name: 'Kwame Mensah', index: '002', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture'], secA: 20, secB: 30, secC: 15, sba: 15.2, exam: 32.5, final: 47.7, grade: 'D7', auditStatus: 'MISSING' },
    { id: 'stud003', name: 'Yaw Boateng', index: '003', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture'], secA: 35, secB: 50, secC: 38, sba: 28.5, exam: 61.5, final: 90.0, grade: 'A1', auditStatus: 'COMPLETE' },
    { id: 'stud004', name: 'Esi Ansah', index: '004', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture'], secA: 32, secB: 48, secC: 35, sba: 26.0, exam: 55.0, final: 81.0, grade: 'A1', auditStatus: 'COMPLETE' },
    { id: 'stud005', name: 'Kofi Appiah', index: '005', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture'], secA: 28, secB: 42, secC: 32, sba: 22.0, exam: 46.0, final: 68.0, grade: 'B3', auditStatus: 'COMPLETE' },
    { id: 'stud006', name: 'Yaw Boateng', index: '006', form: 'SHS 1', programme: 'AGRICULTURE', subjects: ['General Agriculture'], secA: 30, secB: 40, secC: 35, sba: 25.0, exam: 50.0, final: 75.0, grade: 'A1', auditStatus: 'ACTIVE' },
  ];

  const targetStudentId = getTargetStudentIndex ? `stud${getTargetStudentIndex}` : null;

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
      missingObsId={getMissingObsId}
      targetStudentId={targetStudentId}
    />
  );
}

// Global Modal Wrapper Component
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
            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-surface rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-surface shrink-0">
              <h3 className="text-xl font-black text-text-primary">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-background rounded-xl transition-all text-text-secondary hover:text-text-primary">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Router Switcher for Layout Consistency
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
  const isLoginPage = location.pathname === '/login';
  const { settingsModalOpen, setSettingsModalOpen, supportModalOpen, setSupportModalOpen } = useUI();

  // Inactivity Timeout Auto Log-Out Handler (15 Mins)
  React.useEffect(() => {
    let timeout;
    const resetTimer = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
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

  // ULTIMATE FIX: If it is the login page, return it immediately in a clean container 
  // bypassing the sidebars, grid systems, margins, topbars, and right layouts completely.
  if (isLoginPage) {
    return (
      <div className="w-full min-h-screen bg-background font-sans antialiased">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background font-sans selection:bg-success/20 selection:text-success">
      {/* Sidebar Context */}
      <div className="hidden lg:block">
        {user?.role === 'STUDENT' ? <StudentSidebar /> :
         user?.role === 'HOD' ? <HODSidebar /> :
         user?.role === 'TEACHER' ? <TeacherSidebar /> : <AdminSidebar />}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Context */}
        {location.pathname !== '/journey-audit' && <Topbar />}
        
        <main className="flex-1 flex overflow-hidden relative">
          <Routes>
            {/* Base Routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/notifications" element={
              <RequireRole allowedRoles={['TEACHER', 'HOD', 'ADMIN', 'STUDENT']}><NotificationsPage /></RequireRole>
            } />

            {/* Student Specific Routes */}
            <Route path="/student/portal" element={
              <RequireRole allowedRoles={['STUDENT']}><StudentPortal /></RequireRole>
            } />
            <Route path="/student-dashboard" element={
              <RequireRole allowedRoles={['STUDENT']}><Navigate to="/" replace /></RequireRole>
            } />

            {/* Matrix View & Master Timetabling */}
            <Route path="/timetable" element={
              <RequireRole allowedRoles={['TEACHER', 'STUDENT', 'ADMIN']}>
                {user?.role === 'STUDENT' ? <StudentTimetable /> :
                 user?.role === 'ADMIN' ? <SchedulingView /> : <TeacherTimetableView />}
              </RequireRole>
            } />

            {/* Shared Performance Registers */}
            <Route path="/grading" element={
              <RequireRole allowedRoles={['TEACHER', 'ADMIN']}>
                {user?.role === 'ADMIN' ? <GradingRulesView /> : <StandaloneGradingWrapper />}
              </RequireRole>
            } />
            <Route path="/student-profile" element={
              <RequireRole allowedRoles={['TEACHER', 'HOD']}><StudentProfile /></RequireRole>
            } />
            <Route path="/revisions" element={
              <RequireRole allowedRoles={['TEACHER', 'HOD']}>
                {user?.role === 'HOD' ? <HODRevisionsFeed /> : <TeacherRevisionsFeed />}
              </RequireRole>
            } />

            {/* Teacher Console Routes */}
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

            {/* HOD Console Routes */}
            <Route path="/hod" element={<RequireRole allowedRoles={['HOD']}><HODDashboard /></RequireRole>} />
            <Route path="/hod/audit" element={<RequireRole allowedRoles={['HOD']}><HODAudit /></RequireRole>} />
            <Route path="/hod/interventions" element={<RequireRole allowedRoles={['HOD']}><HODInterventions /></RequireRole>} />
            <Route path="/hod/review" element={<RequireRole allowedRoles={['HOD']}><HODReview /></RequireRole>} />
            <Route path="/hod/lock-export" element={<RequireRole allowedRoles={['HOD']}><HODLockExport /></RequireRole>} />
            <Route path="/hod/teachers" element={<RequireRole allowedRoles={['HOD']}><HODTeachers /></RequireRole>} />
            <Route path="/hod/analytics" element={<RequireRole allowedRoles={['HOD']}><HODAnalytics /></RequireRole>} />
            <Route path="/hod/archive" element={<RequireRole allowedRoles={['HOD']}><HODArchiveView /></RequireRole>} />
            <Route path="/hod/archive/:id" element={<RequireRole allowedRoles={['HOD']}><HODArchiveDetailView /></RequireRole>} />
            <Route path="/hod/settings" element={<RequireRole allowedRoles={['HOD']}><HODSettingsPage /></RequireRole>} />
            <Route path="/hod/support" element={<RequireRole allowedRoles={['HOD']}><HODSupportPage /></RequireRole>} />
            <Route path="/hod/broadsheet" element={<RequireRole allowedRoles={['HOD']}><BroadsheetGenerator /></RequireRole>} />
            <Route path="/certification" element={<RequireRole allowedRoles={['HOD']}><HODCertification /></RequireRole>} />
            <Route path="/journey-audit" element={<RequireRole allowedRoles={['HOD']}><HOD_JourneyHistoryAudit /></RequireRole>} />
            <Route path="/missing-observations" element={
              <RequireRole allowedRoles={['TEACHER', 'HOD']}><RoleBasedMissingObservations /></RequireRole>
            } />

            {/* Admin Architecture & Identity Contexts */}
            <Route path="/comms" element={<RequireRole allowedRoles={['ADMIN']}><CommsView /></RequireRole>} />
            <Route path="/academic-architect" element={<RequireRole allowedRoles={['ADMIN']}><AcademicArchitect /></RequireRole>} />
            <Route path="/audit" element={<RequireRole allowedRoles={['HOD', 'ADMIN']}><AuditLogsView /></RequireRole>} />
            <Route path="/audit/extended" element={<RequireRole allowedRoles={['ADMIN']}><ExtendedLogsView /></RequireRole>} />
            <Route path="/system" element={<RequireRole allowedRoles={['ADMIN']}><AdminSettings /></RequireRole>} />
            <Route path="/identity/staff" element={<RequireRole allowedRoles={['ADMIN']}><StaffRegistry /></RequireRole>} />
            <Route path="/identity/departments" element={<RequireRole allowedRoles={['ADMIN']}><DepartmentManagement /></RequireRole>} />
            <Route path="/identity/students" element={<RequireRole allowedRoles={['ADMIN']}><StudentRegistry /></RequireRole>} />
            <Route path="/identity/parents" element={<RequireRole allowedRoles={['ADMIN']}><ParentRegistry /></RequireRole>} />

            {/* Dynamic Archive Mapping */}
            <Route path="/archive" element={
              <RequireRole allowedRoles={['ADMIN', 'TEACHER', 'HOD']}><RoleBasedArchiveView /></RequireRole>
            } />

            {/* Helpdesk & Ticketing Subsystems */}
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
                 user?.role === 'HOD' ? <HODSupportPage /> :
                 user?.role === 'ADMIN' ? <AdminSupport /> : <TeacherSupport />}
              </RequireRole>
            } />
            <Route path="/support/new" element={
              <RequireRole allowedRoles={['STUDENT', 'HOD', 'ADMIN', 'TEACHER']}>
                {user?.role === 'STUDENT' ? <StudentSupport /> :
                 user?.role === 'HOD' ? <HODSupportPage /> :
                 user?.role === 'ADMIN' ? <AdminSupport /> : <TeacherSupport />}
              </RequireRole>
            } />
            <Route path="/support/ticket/:id" element={
              <RequireRole allowedRoles={['ADMIN', 'HOD']}><SupportTicketDetailView /></RequireRole>
            } />

            {/* Structural Approval Triggers */}
            <Route path="/approvals/all" element={
              <RequireRole allowedRoles={['ADMIN', 'HOD']}><ApprovalsView /></RequireRole>
            } />
            <Route path="/approvals/inspect/:id" element={
              <RequireRole allowedRoles={['ADMIN', 'HOD']}><ApprovalInspectView /></RequireRole>
            } />
            <Route path="/approvals/new" element={
              <RequireRole allowedRoles={['ADMIN', 'HOD']}><NewApprovalRequestView /></RequireRole>
            } />

            {/* Catch-All Safe Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {isDashboard && user?.role !== 'ADMIN' && (
            <div className="hidden xl:block">
              <RightPanel />
            </div>
          )}
        </main>
      </div>

      {/* Drawers and Modals */}
      {user?.role === 'STUDENT' ? <StudentMobileDrawer /> : <MobileDrawer />}

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
         user?.role === 'HOD' ? <HODSupportPage /> :
         user?.role === 'ADMIN' ? <AdminSupport /> : <SupportView />}
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <UIProvider>
        <TooltipProvider>
          <HODProvider>
            <AppContent />
          </HODProvider>
        </TooltipProvider>
      </UIProvider>
    </Router>
  );
}