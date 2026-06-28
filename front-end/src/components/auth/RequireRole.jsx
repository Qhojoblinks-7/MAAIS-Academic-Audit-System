import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';

async function fetchDepartmentForUser(userId) {
  try {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('accessToken');
    if (!token) return null;
    
    const res = await fetch('/api/v1/departments', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    const dept = data?.items?.find(d => d.hodId === userId);
    return dept?.id || null;
  } catch {
    return null;
  }
}

export function RequireRole({ allowedRoles = [], children, redirectTo = '/login' }) {
  const { user } = useRole();
  const location = useLocation();

  // Normalize roles: SUPER_ADMIN and HEADMASTER have admin privileges
  const normalizedRole = user?.role === 'SUPER_ADMIN' || user?.role === 'HEADMASTER' ? 'ADMIN' : user?.role;
  
  if (!normalizedRole) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // SUPER_ADMIN and HEADMASTER can access admin routes
  const isAdminUser = user?.role === 'SUPER_ADMIN' || user?.role === 'HEADMASTER';
  const hasAccess = allowedRoles.includes(normalizedRole) || (isAdminUser && allowedRoles.includes('ADMIN'));
  
  if (!hasAccess) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (user.role === 'HOD') {
    if (!user.departmentId) {
      return <Navigate to="/unauthorized" replace state={{ error: 'HOD not assigned to any department' }} />;
    }
  }

  return children;
}

export function withHODValidation(WrappedComponent) {
  return function HODValidatedComponent(props) {
    const { user } = useRole();
    const location = useLocation();
    
    if (!user?.role || user.role !== 'HOD') {
      return <Navigate to="/login" replace />;
    }
    
    if (!user.departmentId) {
      return <Navigate to="/unauthorized" replace state={{ error: 'HOD not assigned to any department' }} />;
    }
    
    return <WrappedComponent {...props} hodDepartmentId={user.departmentId} />;
  };
}