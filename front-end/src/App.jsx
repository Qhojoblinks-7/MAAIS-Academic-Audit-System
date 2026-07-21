import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Toaster } from "./components/ui/toast.tsx";
import {
  AdminSidebar,
  HODSidebar,
  StudentSidebar,
  TeacherSidebar,
} from "./components/layout";
import {
  Topbar,
  RightPanel,
  MobileDrawer,
  StudentMobileDrawer,
} from "./components/shared";
import {
  Dashboard,
} from "./pages/shared/Dashboard";
import {
  AcademicArchitect, AcademicArchitectErrorBoundary, AdminHome, AdminManagement,
  AdminSettings, AdminSupport, ArchiveView, AuditLogsView, CommsView,
  DepartmentManagement, EventCalendarView, ExtendedLogsView, GradingRulesView,
  MasterTimetable, ParentRegistry, ReportGeneratorView, SchedulingView,
  StaffRegistry, StudentRegistry, NewApprovalRequestView, ApprovalInspectView,
  ApprovalsView, SupportTicketDetailView,
  HODDashboard, HODAudit, HODInterventions, HODReview, HODSettings,
  HODSettingsPage, HODSupportPage, HODTeachers, HODAnalytics, HODArchiveView,
  HODArchiveDetailView, HODMissingObservations, Unauthorized, BroadsheetGenerator,
  HODCertification, HODStudentRegistry, HODParentRegistry,
   TeacherDashboard, TeacherTimetableView, TeacherSettings, TeacherSupport,
   TeacherArchiveView, TeacherArchiveDetailView, TeacherGradingView,
   TeacherAnalyticsView, TeacherMissingObservations, TeacherRevisionsFeed,
   TeacherStudents, MobileTimetableView,
  StudentPortal, StudentSettings, StudentSupport, StudentTimetable, StudentProfile,
  GradingSheet, HOD_JourneyHistoryAudit, TeacherProfile, NotificationsPage,
} from "./router/lazyPages";
import { Error401View } from "./pages/errors/Error401View";
import { Error403View } from "./pages/errors/Error403View";
import { Error500View } from "./pages/errors/Error500View";
import { LoginPage } from "./pages/auth/LoginPage";
import { SUBJECT_CONFIG } from "./constants/subjectConfig";
import { gradingService } from "./services/gradingService";
import { teacherService } from "./services/teacherService";
import { TooltipProvider } from './components/ui/tooltip'
import { PWAInstallPrompt } from './components/pwa/PWAInstallPrompt'
import { OfflineBanner } from './components/pwa/OfflineStatus'
import { UIProvider, useUI } from "./context/UIContext";
import { useRole } from "./context/RoleContext";
import { HODProvider } from "./context/HODContext";
import { BreadcrumbProvider } from "./context/BreadcrumbContext";
import { RequireRole } from "./components/auth/RequireRole";
import { PasswordChangeProvider } from "./components/auth/PasswordChangeProvider";
import { X, Lock } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectivityBanner } from "./pages/shared/ConnectivityBanner";
import { useSystemFreeze, useActiveYear } from "./lib/hooks";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";
import { formatFormNumber } from "./lib/types";

// Helper Component for Dynamic Missing Observations Layout
function RoleBasedMissingObservations() {
  const { user } = useRole();
  return user?.role === "TEACHER" ? (

    <TeacherMissingObservations />
  ) : (
    <HODMissingObservations />
  );
}

// Grading Route Data Loader
function GradingRouteLoader() {
  const location = useLocation();
  const { user } = useRole();
  const searchParams = new URLSearchParams(location.search);
  const subjectParam = searchParams.get("subject");
  const classParam = searchParams.get("class");
  const getMissingObsId = searchParams.get("missing");
  const getTargetStudentId = searchParams.get("studentId");
  const getTargetStudentName = searchParams.get("studentName");
  const getTargetStudentIndex = searchParams.get("index");
  const isAtRisk = searchParams.get("atRisk") === "true";

  const [gradingData, setGradingData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [teacherClasses, setTeacherClasses] = React.useState([]);
  const [selectedSubject, setSelectedSubject] = React.useState(subjectParam || "");
  const [selectedClass, setSelectedClass] = React.useState(null);

  const activeYearQuery = useActiveYear();
  const activeTerm = activeYearQuery.data?.terms?.find(t => t.isActive);
  const isTermFinalized = activeTerm?.isLocked ?? false;

  React.useEffect(() => {
    const interval = setInterval(() => {
      activeYearQuery.refetch();
    }, 60000);
    return () => clearInterval(interval);
  }, [activeYearQuery]);

  React.useEffect(() => {
    let cancelled = false;
    const fetchGradingData = async () => {
      if (!subjectParam || !classParam) {
        setLoading(false);
        return;
      }
      try {
        const gradingIds = await gradingService.getGradingIds(
          subjectParam,
          classParam,
        );
        if (cancelled) return;
        const [students, subjectConfigResult] = await Promise.all([
          gradingService.getStudentsForGrading({
            subjectId: gradingIds?.subjectId,
            classId: gradingIds?.classId,
            termId: gradingIds?.termId,
          }),
          teacherService.getSubjectConfig().catch(() => ({})),
        ]);
        if (cancelled) return;

        const subjectConfigMap = { ...SUBJECT_CONFIG };
        if (Array.isArray(subjectConfigResult)) {
          subjectConfigResult.forEach((s) => {
            if (!subjectConfigMap[s.name]) {
              subjectConfigMap[s.name] = {
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

        setGradingData({
          students: students || [],
          subjectConfig: subjectConfigMap,
          subjectId: gradingIds?.subjectId,
          classId: gradingIds?.classId,
          termId: gradingIds?.termId,
        });
      } catch (err) {
        if (!cancelled) {
          console.error(
            "[GradingRouteLoader] failed to load grading data:",
            err,
          );
          setError(err.message || "Failed to load grading data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchGradingData();
    return () => {
      cancelled = true;
    };
  }, [subjectParam, classParam]);

  React.useEffect(() => {
    let cancelled = false;
    const fetchTeacherClasses = async () => {
      if (!user?.id) return;
      try {
        const teacherId = user.profileId || user.id;
        const classes = await teacherService.getClasses(teacherId);
        if (!cancelled) {
          setTeacherClasses(classes || []);
          if (!selectedClass && classes?.length > 0) {
            const match = classes.find(c => c.subject === subjectParam && c.className === classParam);
            setSelectedClass(match || classes[0]);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[GradingRouteLoader] failed to load teacher classes:", err);
        }
      }
    };
    fetchTeacherClasses();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.profileId, subjectParam, classParam]);

  React.useEffect(() => {
    setSelectedSubject(subjectParam || "");
  }, [subjectParam]);

  React.useEffect(() => {
    if (!classParam) {
      setSelectedClass(null);
      return;
    }
    const match = teacherClasses.find(c => c.className === classParam);
    if (match) {
      setSelectedClass(match);
    }
  }, [classParam, teacherClasses]);

  React.useEffect(() => {
    if (!selectedClass || !gradingData) return;
    if (selectedClass.id === gradingData.classId) return;
    
    let cancelled = false;
    const fetchStudentsForClass = async () => {
      if (!user?.id) return;
      try {
        const gradingIds = await gradingService.getGradingIds(
          selectedClass.subject,
          selectedClass.className,
        );
        if (cancelled) return;
        const [students, subjectConfigResult] = await Promise.all([
          gradingService.getStudentsForGrading({
            subjectId: gradingIds?.subjectId,
            classId: gradingIds?.classId,
            termId: gradingIds?.termId,
          }),
          teacherService.getSubjectConfig().catch(() => ({})),
        ]);
        if (cancelled) return;

        const subjectConfigMap = { ...SUBJECT_CONFIG };
        if (Array.isArray(subjectConfigResult)) {
          subjectConfigResult.forEach((s) => {
            if (!subjectConfigMap[s.name]) {
              subjectConfigMap[s.name] = {
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

        setGradingData({
          students: students || [],
          subjectConfig: subjectConfigMap,
          subjectId: gradingIds?.subjectId,
          classId: gradingIds?.classId,
          termId: gradingIds?.termId,
        });
      } catch (err) {
        if (!cancelled) {
          console.error("[GradingRouteLoader] failed to fetch students for class:", err);
        }
      }
    };
    fetchStudentsForClass();
    return () => {
      cancelled = true;
    };
  }, [selectedClass?.id, gradingData?.classId, user?.id]);

  const uniqueSubjects = React.useMemo(() => {
    if (!Array.isArray(teacherClasses)) return [];
    const subjects = [...new Set(teacherClasses.map(c => c.subject).filter(Boolean))];
    return subjects.sort();
  }, [teacherClasses]);

  const availableClasses = React.useMemo(() => {
    if (!Array.isArray(teacherClasses)) return [];
    if (!selectedSubject) return teacherClasses;
    return teacherClasses.filter(c => c.subject === selectedSubject);
  }, [teacherClasses, selectedSubject]);

  const handleSubjectChange = React.useCallback((e) => {
    const subject = e.target.value;
    setSelectedSubject(subject);
    if (!subject) {
      setSelectedClass(null);
      return;
    }
    const firstMatch = teacherClasses.find(c => c.subject === subject);
    if (firstMatch) {
      setSelectedClass(firstMatch);
    }
  }, [teacherClasses]);

  const handleClassChange = React.useCallback((e) => {
    const classId = e.target.value;
    const cls = teacherClasses.find(c => c.id === classId);
    if (cls) {
      setSelectedClass(cls);
    }
  }, [teacherClasses]);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24">
          <p className="text-sm font-medium text-muted-foreground">
            Loading grading sheet from server…
          </p>
        </div>
      </div>
    );
  }

  if (error || !gradingData) {
    return (
      <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-24">
          <p className="text-sm text-destructive">
            {error || "No class selected for grading"}
          </p>
        </div>
      </div>
    );
  }

   const { students, subjectConfig } = gradingData;
   const targetStudentId = getTargetStudentId || null;

    const DEFAULT_CLASS_INFO = {
      id: selectedClass ? selectedClass.id : (gradingData.classId || subjectParam),
      subject: selectedSubject || subjectParam,
      className: selectedClass ? selectedClass.className : classParam,
      programme: selectedClass ? (selectedClass.department || 'GENERAL') : "AGRICULTURE",
      studentCount: students.length,
      form: selectedClass ? formatFormNumber(selectedClass.level) : "1",
      academicYear: "2025/2026",
    };

   const STP_RULES = [
     { check: (s) => s.final > 100, message: "Final score exceeds 100%" },
     { check: (s) => s.sba > 30, message: "SBA exceeds 30% limit" },
     { check: (s) => s.exam > 70, message: "Exam exceeds 70% limit" },
     {
       check: (s) => s.auditStatus === "MISSING",
       message: "Missing behavioral observations",
     },
   ];

   return (
     <GradingSheet
       classInfo={DEFAULT_CLASS_INFO}
       teacherId={user?.id || user?.staffId}
       students={students}
       subjectConfig={subjectConfig}
       stpRules={STP_RULES}
       isTermFinalized={isTermFinalized}
       missingObsId={getMissingObsId}
       targetStudentId={targetStudentId}
       targetStudentName={getTargetStudentName}
       targetStudentIndex={getTargetStudentIndex}
       noAssignmentWarning={!students.length && !!getTargetStudentId}
       isAtRisk={isAtRisk}
       selectedSubject={selectedSubject}
       selectedClass={selectedClass}
       availableClasses={availableClasses}
       uniqueSubjects={uniqueSubjects}
       onSubjectChange={handleSubjectChange}
       onClassChange={(e) => {
         const cls = availableClasses.find(c => c.id === e.target.value);
         if (cls) setSelectedClass(cls);
       }}
     />
   );
}

// Standalone Grading Context Wrapper
function StandaloneGradingWrapper() {
  return <GradingRouteLoader />;
}

// Global Modal Wrapper Component
function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm transition-opacity duration-200 opacity-100" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-surface rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-surface shrink-0">
              <h3 className="text-xl font-black text-text-primary">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-background rounded-xl transition-all text-text-secondary hover:text-text-primary"
              >
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
  if (user?.role === "ADMIN") return <ArchiveView />;
  if (user?.role === "HOD") return <HODArchiveView />;
  if (user?.role === "TEACHER") return <TeacherArchiveView />;
  return <ArchiveView />;
};

// Route-level loading fallback (shown while a lazily-loaded page chunk downloads)
function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-success/30 border-t-success animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const { user } = useRole();
  const isDashboard = location.pathname === "/";
  const isLoginPage = location.pathname === "/login";
  const {
    settingsModalOpen,
    setSettingsModalOpen,
    supportModalOpen,
    setSupportModalOpen,
    rightPanelVisible,
  } = useUI();
  const systemFreezeQuery = useSystemFreeze();
  const isSystemFrozen = systemFreezeQuery.data?.systemFrozen ?? false;
  const prevSystemFrozen = React.useRef(isSystemFrozen);

  React.useEffect(() => {
    if (isSystemFrozen && !prevSystemFrozen.current) {
      sessionStorage.removeItem('freezeAck');
      setFreezeAck(null);
    }
    prevSystemFrozen.current = isSystemFrozen;
  }, [isSystemFrozen]);

  const [freezeAck, setFreezeAck] = React.useState(() => {
    const saved = sessionStorage.getItem('freezeAck');
    return saved && saved !== '' ? new Date(saved) : null;
  });

  const ackExpiry = freezeAck ? new Date(freezeAck.getTime() + 24 * 60 * 60 * 1000) : null;
  const isAckExpired = ackExpiry ? new Date() > ackExpiry : true;

  // Inactivity Timeout Auto Log-Out Handler (15 Mins)
  React.useEffect(() => {
    let timeout;
    const resetTimer = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(
        () => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = "/login";
        },
        15 * 60 * 1000,
      );
    };
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);
    resetTimer();
    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  const isErrorPage = location.pathname === "/401" || location.pathname === "/403" || location.pathname === "/500";

  if (isLoginPage) {
    return (
      <div className="w-full min-h-screen bg-background font-sans antialiased">
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </Suspense>
      </div>
    );
  }

  if (isErrorPage) {
    return (
      <div className="w-full min-h-screen bg-background font-sans antialiased">
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/401" element={<Error401View />} />
          <Route path="/403" element={<Error403View />} />
          <Route path="/500" element={<Error500View />} />
        </Routes>
        </Suspense>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background font-sans selection:bg-success/20 selection:text-success">
      {isSystemFrozen && user?.role !== "STUDENT" && (!freezeAck || isAckExpired) && (
        <>
          {user?.role === "ADMIN" ? (
            <div className="fixed top-0 left-0 right-0 z-[300] bg-rose-600 text-white px-4 py-2.5 flex items-center justify-center gap-3 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Emergency System Freeze Active</span>
              {systemFreezeQuery.data?.systemFreezeReason && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">
                  {systemFreezeQuery.data.systemFreezeReason}
                </span>
              )}
              <button
                onClick={() => {
                  const now = new Date();
                  sessionStorage.setItem('freezeAck', now.toISOString());
                  setFreezeAck(now);
                }}
                className="ml-2 p-1 hover:bg-white/20 rounded-md transition-colors"
                aria-label="Dismiss freeze banner"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl text-center p-6 border-2 border-rose-100">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm bg-rose-50 text-rose-600">
                  <Lock size={28} />
                </div>
                <h3 className="text-xl font-black italic font-display text-slate-900 mb-2">
                  Emergency System Freeze Active
                </h3>
                <p className="text-slate-500 text-[11px] font-medium leading-normal mb-2">
                  Immediate administrative intervention activated. All write operations are currently suspended.
                </p>
                {systemFreezeQuery.data?.systemFreezeReason && (
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-4 bg-rose-50 px-3 py-2 rounded-lg">
                    Reason: {systemFreezeQuery.data.systemFreezeReason}
                  </p>
                )}
                <p className="text-[10px] font-medium text-slate-400 mb-4">
                  Read-only access remains available. Contact your administrator for more information.
                </p>
                <Button 
                  onClick={() => {
                    const now = new Date();
                    sessionStorage.setItem('freezeAck', now.toISOString());
                    setFreezeAck(now);
                  }}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Understood
                </Button>
              </motion.div>
            </div>
          )}
        </>
      )}
      {/* Sidebar Context */}
      <div className="hidden lg:block">
        {user?.role === "STUDENT" ? (
          <StudentSidebar />
        ) : user?.role === "HOD" ? (
          <HODSidebar />
        ) : user?.role === "TEACHER" ? (
          <TeacherSidebar />
        ) : user?.role === "ADMIN" ? (
          <AdminSidebar />
        ) : null}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <ConnectivityBanner />
        {/* Topbar Context */}
        <Topbar />

        <main className="flex-1 flex overflow-hidden relative">
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Base Routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route
              path="/notifications"
              element={
                <RequireRole
                  allowedRoles={["TEACHER", "HOD", "ADMIN", "STUDENT"]}
                >
                  <NotificationsPage />
                </RequireRole>
              }
            />

            {/* Student Specific Routes */}
            <Route
              path="/student/portal"
              element={
                <RequireRole allowedRoles={["STUDENT"]}>
                  <StudentPortal />
                </RequireRole>
              }
            />
            <Route
              path="/student-dashboard"
              element={
                <RequireRole allowedRoles={["STUDENT"]}>
                  <Navigate to="/" replace />
                </RequireRole>
              }
            />

            {/* Matrix View & Master Timetabling */}
            <Route
              path="/timetable"
              element={
                <RequireRole allowedRoles={["TEACHER", "STUDENT", "ADMIN"]}>
                  {user?.role === "STUDENT" ? (
                    <StudentTimetable />
                  ) : user?.role === "TEACHER" ? (
                    <TeacherTimetableView />
                  ) : (
                    <SchedulingView />
                  )}
                </RequireRole>
              }
            />

            {/* Shared Performance Registers */}
            <Route
              path="/grading"
              element={
                <RequireRole allowedRoles={["TEACHER", "ADMIN"]}>
          {user?.role === "ADMIN" ? (
                    <GradingRulesView />
                  ) : (
                    <StandaloneGradingWrapper />
                  )}
                </RequireRole>
              }
            />
            <Route
              path="/student-profile"
              element={
                <RequireRole allowedRoles={["TEACHER", "HOD", "ADMIN"]}>
                  <StudentProfile />
                </RequireRole>
              }
            />
            <Route
              path="/teacher-profile"
              element={
                <RequireRole allowedRoles={["TEACHER", "HOD", "ADMIN"]}>
                  <TeacherProfile />
                </RequireRole>
              }
            />
            <Route
              path="/revisions"
              element={
                <RequireRole allowedRoles={["TEACHER", "HOD"]}>
                  {user?.role === "HOD" ? (
                    <Navigate to="/hod/review?view=revisions" replace />
                  ) : (
                    <TeacherRevisionsFeed />
                  )}
                </RequireRole>
              }
            />

            {/* Teacher Console Routes */}
            <Route
              path="/teacher-dashboard"
              element={
                <RequireRole allowedRoles={["TEACHER"]}>
                  <TeacherDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/teacher/grading"
              element={
                <RequireRole allowedRoles={["TEACHER"]}>
                  <TeacherGradingView />
                </RequireRole>
              }
            />
            <Route
              path="/teacher/analytics"
              element={
                <RequireRole allowedRoles={["TEACHER"]}>
                  <TeacherAnalyticsView />
                </RequireRole>
              }
            />
            <Route
              path="/teacher/archive"
              element={
                <RequireRole allowedRoles={["TEACHER"]}>
                  <TeacherArchiveView />
                </RequireRole>
              }
            />
            <Route
              path="/teacher/students"
              element={
                <RequireRole allowedRoles={["TEACHER"]}>
                  <TeacherStudents />
                </RequireRole>
              }
            />
            <Route
              path="/archive/teacher/:id"
              element={
                <RequireRole allowedRoles={["TEACHER"]}>
                  <TeacherArchiveDetailView />
                </RequireRole>
              }
            />

            {/* HOD Console Routes */}
            <Route
              path="/hod"
              element={
                <RequireRole allowedRoles={["HOD"]}>
                  <HODDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/hod/audit"
              element={
                <RequireRole allowedRoles={["HOD"]}>
                  <HODAudit />
                </RequireRole>
              }
            />
            <Route
              path="/hod/interventions"
              element={
                <RequireRole allowedRoles={["HOD"]}>
                  <HODInterventions />
                </RequireRole>
              }
            />
            <Route
              path="/hod/review"
              element={
                <RequireRole allowedRoles={["HOD"]}>
                  <HODReview />
                </RequireRole>
              }
            />
            <Route
              path="/hod/lock-export"
              element={
                <RequireRole allowedRoles={["HOD"]}>
                  <Navigate to="/hod/review?view=lock" replace />
                </RequireRole>
              }
            />
            <Route
              path="/hod/teachers"
              element={
                <RequireRole allowedRoles={["HOD"]}>
                  <HODTeachers />
                </RequireRole>
              }
            />
            <Route
              path="/hod/students"
              element={
                <RequireRole allowedRoles={["HOD"]}>
                  <HODStudentRegistry />
                </RequireRole>
              }
            />
            <Route
              path="/hod/parents"
              element={
                <RequireRole allowedRoles={["HOD"]}>
                  <HODParentRegistry />
                </RequireRole>
              }
            />
            <Route
              path="/hod/analytics"
              element={
                <RequireRole allowedRoles={["HOD"]}>
                  <HODAnalytics />
                </RequireRole>
              }
            />
            <Route
              path="/hod/archive"
              element={
                <RequireRole allowedRoles={["HOD"]}>
                  <HODArchiveView />
                </RequireRole>
              }
            />
            <Route
              path="/hod/archive/:id"
              element={
                <RequireRole allowedRoles={["HOD"]}>
                  <HODArchiveDetailView />
                </RequireRole>
              }
            />
            <Route
              path="/hod/settings"
              element={
                <RequireRole allowedRoles={["HOD"]}>
                  <HODSettingsPage />
                </RequireRole>
              }
            />
            <Route
              path="/hod/support"
              element={
                <RequireRole allowedRoles={["HOD"]}>
                  <HODSupportPage />
                </RequireRole>
              }
            />
            <Route
              path="/hod/broadsheet"
              element={
                <RequireRole allowedRoles={["HOD"]}>
                  <BroadsheetGenerator />
                </RequireRole>
              }
            />
            <Route
              path="/certification"
              element={
                <RequireRole allowedRoles={["HOD"]}>
                  <HODCertification />
                </RequireRole>
              }
            />
            <Route
              path="/journey-audit"
              element={
                <RequireRole allowedRoles={["HOD"]}>
                  <HOD_JourneyHistoryAudit />
                </RequireRole>
              }
            />
            <Route
              path="/missing-observations"
              element={
                <RequireRole allowedRoles={["TEACHER", "HOD"]}>
                  <RoleBasedMissingObservations />
                </RequireRole>
              }
            />

            {/* Admin Architecture & Identity Contexts */}
            <Route
              path="/admin/home"
              element={
                <RequireRole allowedRoles={["ADMIN"]}>
                  <AdminHome />
                </RequireRole>
              }
            />

            <Route
              path="/comms"
              element={
                <RequireRole allowedRoles={["ADMIN"]}>
                  <CommsView />
                </RequireRole>
              }
            />

            <Route
              path="/academic-architect"
              element={
                <RequireRole allowedRoles={["ADMIN"]}>
                  <AcademicArchitectErrorBoundary>
                    <AcademicArchitect />
                  </AcademicArchitectErrorBoundary>
                </RequireRole>
              }
            />
            <Route
              path="/department/:id"
              element={
                <RequireRole allowedRoles={["ADMIN"]}>
                  <DepartmentManagement />
                </RequireRole>
              }
            />
            <Route
              path="/audit"
              element={
                <RequireRole allowedRoles={["HOD", "ADMIN"]}>
                  <AuditLogsView />
                </RequireRole>
              }
            />
            <Route
              path="/audit/extended"
              element={
                <RequireRole allowedRoles={["ADMIN"]}>
                  <ExtendedLogsView />
                </RequireRole>
              }
            />
            <Route
              path="/system"
              element={
                <RequireRole allowedRoles={["ADMIN"]}>
                  <AdminSettings />
                </RequireRole>
              }
            />
            <Route
              path="/identity/staff"
              element={
                <RequireRole allowedRoles={["ADMIN"]}>
                  <StaffRegistry />
                </RequireRole>
              }
            />
            <Route
              path="/identity/departments"
              element={
                <RequireRole allowedRoles={["ADMIN"]}>
                  <DepartmentManagement />
                </RequireRole>
              }
            />
            <Route
              path="/identity/students"
              element={
                <RequireRole allowedRoles={["ADMIN"]}>
                  <StudentRegistry />
                </RequireRole>
              }
            />
            <Route
              path="/identity/parents"
              element={
                <RequireRole allowedRoles={["ADMIN"]}>
                  <ParentRegistry />
                </RequireRole>
              }
            />

            {/* Dynamic Archive Mapping */}
            <Route
              path="/archive"
              element={
                <RequireRole allowedRoles={["ADMIN", "TEACHER", "HOD"]}>
                  <RoleBasedArchiveView />
                </RequireRole>
              }
            />

            {/* Helpdesk & Ticketing Subsystems */}
            <Route
              path="/settings"
              element={
                <RequireRole
                  allowedRoles={["STUDENT", "HOD", "ADMIN", "TEACHER"]}
                >
                  {user?.role === "STUDENT" ? (
                    <StudentSettings />
                  ) : user?.role === "HOD" ? (
                    <HODSettings />
                  ) : user?.role === "TEACHER" ? (
                    <AdminSettings />
                  ) : (
                    <TeacherSettings />
                  )}
                </RequireRole>
              }
            />
            <Route
              path="/support"
              element={
                <RequireRole
                  allowedRoles={["STUDENT", "HOD", "ADMIN", "TEACHER"]}
                >
                  {user?.role === "STUDENT" ? (
                    <StudentSupport />
                  ) : user?.role === "HOD" ? (
                    <HODSupportPage />
                  ) : user?.role === "TEACHER" ? (
                    <AdminSupport />
                  ) : (
                    <TeacherSupport />
                  )}
                </RequireRole>
              }
            />
            <Route
              path="/support/new"
              element={
                <RequireRole
                  allowedRoles={["STUDENT", "HOD", "ADMIN", "TEACHER"]}
                >
                  {user?.role === "STUDENT" ? (
                    <StudentSupport />
                  ) : user?.role === "HOD" ? (
                    <HODSupportPage />
                  ) : user?.role === "TEACHER" ? (
                    <AdminSupport />
                  ) : (
                    <TeacherSupport />
                  )}
                </RequireRole>
              }
            />
            <Route
              path="/support/ticket/:id"
              element={
                <RequireRole allowedRoles={["ADMIN", "HOD"]}>
                  <SupportTicketDetailView />
                </RequireRole>
              }
            />

            {/* Structural Approval Triggers */}
            <Route
              path="/approvals/all"
              element={
                <RequireRole allowedRoles={["ADMIN", "HOD"]}>
                  <ApprovalsView />
                </RequireRole>
              }
            />
            <Route
              path="/approvals/inspect/:id"
              element={
                <RequireRole allowedRoles={["ADMIN", "HOD"]}>
                  <ApprovalInspectView />
                </RequireRole>
              }
            />
            <Route
              path="/approvals/new"
              element={
                <RequireRole allowedRoles={["ADMIN", "HOD"]}>
                  <NewApprovalRequestView />
                </RequireRole>
              }
            />

            {/* Catch-All Safe Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>

          {isDashboard &&
            user?.role &&
            ["TEACHER", "HOD"].includes(user.role) &&
            rightPanelVisible && (
              <div className="hidden xl:block">
                <RightPanel />
              </div>
            )}
        </main>
      </div>

      {/* Drawers and Modals */}
      {user?.role === "STUDENT" ? <StudentMobileDrawer /> : <MobileDrawer />}

      <Suspense fallback={null}>
      <Modal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        title="Identity & Security Control"
      >
        {user?.role === "STUDENT" ? (
          <StudentSettings />
        ) : user?.role === "HOD" ? (
          <HODSettings />
        ) : user?.role === "ADMIN" ? (
          <AdminSettings />
        ) : (
          <TeacherSettings />
        )}
      </Modal>

      <Modal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        title="ICT Support Desk"
      >
        {user?.role === "STUDENT" ? (
          <StudentSupport />
        ) : user?.role === "HOD" ? (
          <HODSupportPage />
        ) : user?.role === "ADMIN" ? (
          <AdminSupport />
        ) : (
          <TeacherSupport />
        )}
      </Modal>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <UIProvider>
        <OfflineBanner />
        <TooltipProvider>
          <HODProvider>
            <BreadcrumbProvider>
              <PasswordChangeProvider>
                <AppContent />
              </PasswordChangeProvider>
            </BreadcrumbProvider>
          </HODProvider>
        </TooltipProvider>
        <Toaster />
        <PWAInstallPrompt />
      </UIProvider>
    </Router>
  );
}