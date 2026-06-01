import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { AdminHome } from '../admin/AdminHome';
import { TeacherDashboard } from '../teacher/TeacherDashboard';

// Importing from the barrel file to get the named export
import { HODDashboard } from '../hod';

export function Dashboard() {
  const { user } = useRole();

  // Route to the appropriate institutional layout based on security profile roles
  if (user?.role === 'STUDENT') return <Navigate to="/student/portal" replace />;
  if (user?.role === 'ADMIN')   return <AdminHome />;
  if (user?.role === 'TEACHER') return <TeacherDashboard />;
  if (user?.role === 'HOD')     return <HODDashboard />;

  // Default fallback state configuration
  return <Navigate to="/student/portal" replace />;
}