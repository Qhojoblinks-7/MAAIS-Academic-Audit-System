import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { AdminHome } from '../admin/AdminHome';
import { TeacherDashboard } from '../teacher/TeacherDashboard';

import { HODDashboard } from '../hod';

export function Dashboard() {
  const { user, isAuthenticated } = useRole();

  console.log('[Dashboard] Render - isAuthenticated:', isAuthenticated, 'user:', user);

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user?.role) {
    console.warn('[Dashboard] Not authenticated or missing role, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  console.log('[Dashboard] Routing to role:', user?.role);

  // Route to the appropriate institutional layout based on security profile roles
  // NOTE: Backend may return SUPER_ADMIN / HEADMASTER; treat them as ADMIN.
  if (user?.role === 'STUDENT') return <Navigate to="/student/portal" replace />;

  if (
    user?.role === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'HEADMASTER'
  ) {
    return <AdminHome />;
  }

  if (user?.role === 'TEACHER') return <TeacherDashboard />;
  if (user?.role === 'HOD') return <HODDashboard />;


  console.warn('[Dashboard] Unknown role, redirecting to /login');
  // Default fallback state configuration
  return <Navigate to="/login" replace />;
}