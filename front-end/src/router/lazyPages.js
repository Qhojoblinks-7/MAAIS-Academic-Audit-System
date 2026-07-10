import { lazy } from 'react';

/**
 * Route-level code splitting. Each page is dynamically imported so it lands in
 * its own chunk and is only fetched when the user navigates to that route.
 * This keeps the initial bundle small (critical on poor connections).
 *
 * Helper: `l(loader, name)` wraps a dynamic import of a *named* export.
 * The import path must be a literal string so the bundler can split it.
 */
const l = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })));

// ── Admin ────────────────────────────────────────────────────────────────────
export const AcademicArchitect = l(() => import('../pages/admin/AcademicArchitect'), 'AcademicArchitect');
export const AcademicArchitectErrorBoundary = l(
  () => import('../pages/admin/components/AcademicErrorBoundary'),
  'AcademicArchitectErrorBoundary',
);
export const AdminHome = l(() => import('../pages/admin/AdminHome'), 'AdminHome');
export const AdminManagement = l(() => import('../pages/admin/AdminManagement'), 'AdminManagement');
export const AdminSettings = l(() => import('../pages/admin/AdminSettings'), 'AdminSettings');
export const AdminSupport = l(() => import('../pages/admin/AdminSupport'), 'AdminSupport');
export const ArchiveView = l(() => import('../pages/admin/ArchiveView'), 'ArchiveView');
export const AuditLogsView = l(() => import('../pages/admin/AuditLogsView'), 'AuditLogsView');
export const CommsView = l(() => import('../pages/admin/CommsView'), 'CommsView');
export const DepartmentManagement = l(() => import('../pages/admin/DepartmentManagement'), 'DepartmentManagement');
export const EventCalendarView = l(() => import('../pages/admin/EventCalendarView'), 'EventCalendarView');
export const ExtendedLogsView = l(() => import('../pages/admin/ExtendedLogsView'), 'ExtendedLogsView');
export const GradingRulesView = l(() => import('../pages/admin/GradingRulesView'), 'GradingRulesView');
export const MasterTimetable = l(() => import('../pages/admin/MasterTimetable'), 'MasterTimetable');
export const ParentRegistry = l(() => import('../pages/admin/ParentRegistry'), 'ParentRegistry');
export const ReportGeneratorView = l(() => import('../pages/admin/ReportGeneratorView'), 'ReportGeneratorView');
export const SchedulingView = l(() => import('../pages/admin/SchedulingView'), 'SchedulingView');
export const StaffRegistry = l(() => import('../pages/admin/StaffRegistry'), 'StaffRegistry');
export const StudentRegistry = l(() => import('../pages/admin/StudentRegistry'), 'StudentRegistry');
export const NewApprovalRequestView = l(() => import('../pages/admin/NewApprovalRequestView'), 'NewApprovalRequestView');
export const ApprovalInspectView = l(() => import('../pages/admin/ApprovalInspectView'), 'ApprovalInspectView');
export const ApprovalsView = l(() => import('../pages/admin/ApprovalsView'), 'ApprovalsView');
export const SupportTicketDetailView = l(() => import('../pages/admin/SupportTicketDetailView'), 'SupportTicketDetailView');

// ── HOD ──────────────────────────────────────────────────────────────────────
export const HODDashboard = l(() => import('../pages/hod/HODDashboard'), 'HODDashboard');
export const HODAudit = l(() => import('../pages/hod/HODAudit'), 'HODAudit');
export const HODInterventions = l(() => import('../pages/hod/HODInterventions'), 'HODInterventions');
export const HODReview = l(() => import('../pages/hod/HODReview'), 'HODReview');
export const HODSettings = l(() => import('../pages/hod/HODSettings'), 'HODSettings');
export const HODSettingsPage = l(() => import('../pages/hod/HODSettingsPage'), 'HODSettingsPage');
export const HODSupportPage = l(() => import('../pages/hod/HODSupportPage'), 'HODSupportPage');
export const HODTeachers = l(() => import('../pages/hod/HODTeachers'), 'HODTeachers');
export const HODAnalytics = l(() => import('../pages/hod/HODAnalytics'), 'HODAnalytics');
export const HODArchiveView = l(() => import('../pages/hod/HODArchiveView'), 'HODArchiveView');
export const HODArchiveDetailView = l(() => import('../pages/hod/HODArchiveDetailView'), 'HODArchiveDetailView');
export const HODMissingObservations = l(() => import('../pages/hod/HODMissingObservations'), 'HODMissingObservations');
export const Unauthorized = l(() => import('../pages/hod/Unauthorized'), 'Unauthorized');
export const BroadsheetGenerator = l(() => import('../pages/hod/BroadsheetGenerator'), 'BroadsheetGenerator');
export const HODCertification = l(() => import('../pages/hod/HODCertification'), 'HODCertification');

// ── Teacher ─────────────────────────────────────────────────────────────────
export const TeacherDashboard = l(() => import('../pages/teacher/TeacherDashboard'), 'TeacherDashboard');
export const TeacherTimetableView = l(() => import('../pages/teacher/TeacherTimetableView'), 'TeacherTimetableView');
export const TeacherSettings = l(() => import('../pages/teacher/TeacherSettings'), 'TeacherSettings');
export const TeacherSupport = l(() => import('../pages/teacher/TeacherSupport'), 'TeacherSupport');
export const TeacherArchiveView = l(() => import('../pages/teacher/TeacherArchiveView'), 'TeacherArchiveView');
export const TeacherArchiveDetailView = l(() => import('../pages/teacher/TeacherArchiveDetailView'), 'TeacherArchiveDetailView');
export const TeacherGradingView = l(() => import('../pages/teacher/TeacherGradingView'), 'TeacherGradingView');
export const TeacherAnalyticsView = l(() => import('../pages/teacher/TeacherAnalyticsView'), 'TeacherAnalyticsView');
export const TeacherMissingObservations = l(() => import('../pages/teacher/TeacherMissingObservations'), 'TeacherMissingObservations');
export const TeacherRevisionsFeed = l(() => import('../pages/teacher/TeacherRevisionsFeed'), 'TeacherRevisionsFeed');
export const MobileTimetableView = l(() => import('../pages/teacher/MobileTimetableView'), 'MobileTimetableView');

// ── Student ──────────────────────────────────────────────────────────────────
export const StudentPortal = l(() => import('../pages/student/StudentPortal'), 'StudentPortal');
export const StudentSettings = l(() => import('../pages/student/StudentSettings'), 'StudentSettings');
export const StudentSupport = l(() => import('../pages/student/StudentSupport'), 'StudentSupport');
export const StudentTimetable = l(() => import('../pages/student/StudentTimetable'), 'StudentTimetable');
export const StudentProfile = l(() => import('../pages/student/StudentProfile'), 'StudentProfile');

// ── Shared ──────────────────────────────────────────────────────────────────
export const GradingSheet = l(() => import('../pages/shared/GradingSheet'), 'GradingSheet');
export const HOD_JourneyHistoryAudit = l(() => import('../pages/shared/HOD_JourneyHistoryAudit'), 'HOD_JourneyHistoryAudit');
export const TeacherProfile = l(() => import('../pages/shared/TeacherProfile'), 'TeacherProfile');

// ── Misc ────────────────────────────────────────────────────────────────────
export const NotificationsPage = l(() => import('../pages/NotificationsPage'), 'NotificationsPage');
