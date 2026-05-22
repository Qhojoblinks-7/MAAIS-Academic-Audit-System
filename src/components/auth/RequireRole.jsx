import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';

export function RequireRole({ allowedRoles = [], children, redirectTo = '/' }) {
  const { user } = useRole();
  const location = useLocation();

  if (!user?.role) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return children;
}

