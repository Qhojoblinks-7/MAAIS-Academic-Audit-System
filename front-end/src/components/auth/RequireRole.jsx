import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';

export function RequireRole({ allowedRoles = [], children, redirectTo = '/401' }) {
  const { user } = useRole();
  const location = useLocation();

  // Not authenticated at all → 401
  if (!user?.role) {
    return <Navigate to="/401" replace state={{ from: location, reason: 'no_session' }} />;
  }

  // SUPER_ADMIN and HEADMASTER can access admin routes
  const isAdminUser = user?.role === 'SUPER_ADMIN' || user?.role === 'HEADMASTER';
  const hasAccess = allowedRoles.includes(user?.role) || (isAdminUser && allowedRoles.some(r => ['ADMIN', 'SUPER_ADMIN', 'HEADMASTER'].includes(r)));

  // Authenticated but insufficient permissions → 403
  if (!hasAccess) {
    return <Navigate to="/403" replace state={{ from: location, requiredRoles: allowedRoles, currentRole: user?.role }} />;
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