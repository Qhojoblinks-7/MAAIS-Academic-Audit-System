import React, { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';

// Role-specific dashboards are lazy-loaded so the landing "Dashboard" shell
// stays tiny and each role's dashboard chunk downloads only when needed.
const AdminHome = lazy(() =>
  import('../admin/AdminHome').then((m) => ({ default: m.AdminHome })),
);
const TeacherDashboard = lazy(() =>
  import('../teacher/TeacherDashboard').then((m) => ({ default: m.TeacherDashboard })),
);
const HODDashboard = lazy(() =>
  import('../hod/HODDashboard').then((m) => ({ default: m.HODDashboard })),
);

function DashboardFallback() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-success/30 border-t-success animate-spin" />
    </div>
  );
}

export function Dashboard() {
  const { user, isAuthenticated } = useRole();

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user?.role) {
    return <Navigate to="/login" replace />;
  }

  // Route to the appropriate institutional layout based on security profile roles
  // NOTE: Backend may return SUPER_ADMIN / HEADMASTER; treat them as ADMIN.
  if (user?.role === 'STUDENT') return <Navigate to="/student/portal" replace />;

  return (
    <Suspense fallback={<DashboardFallback />}>
      {user?.role === 'ADMIN' ||
      user?.role === 'SUPER_ADMIN' ||
      user?.role === 'HEADMASTER' ? (
        <AdminHome />
      ) : user?.role === 'TEACHER' ? (
        <TeacherDashboard />
      ) : user?.role === 'HOD' ? (
        <HODDashboard />
      ) : (
        <Navigate to="/login" replace />
      )}
    </Suspense>
  );
}
