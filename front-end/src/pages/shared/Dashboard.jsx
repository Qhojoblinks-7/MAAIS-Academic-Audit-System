import React, { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { useUI } from '../../context/UIContext';

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
  const { isMobile } = useUI();

  if (!isAuthenticated || !user?.role) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'STUDENT') return <Navigate to="/student/portal" replace />;

  if (user?.role === 'TEACHER' && isMobile) {
    return <Navigate to="/teacher/grading-mobile" replace />;
  }

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
