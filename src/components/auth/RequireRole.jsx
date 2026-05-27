import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import mockApiData from '../../data/mockApiData.json';

const DEPARTMENTS = mockApiData.departments?.items || [];

function validateHODAccess(user) {
  if (!user || user.role !== 'HOD') return { valid: true };
  const department = DEPARTMENTS.find(d => d.hodId === user.id);
  if (!department) {
    return { valid: false, error: 'HOD not assigned to any department' };
  }
  return { valid: true, departmentId: department.id };
}

export function RequireRole({ allowedRoles = [], children, redirectTo = '/' }) {
  const { user } = useRole();
  const location = useLocation();

  if (!user?.role) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (user.role === 'HOD') {
    const validation = validateHODAccess(user);
    if (!validation.valid) {
      console.warn('[Auth] HOD validation failed:', validation.error);
      return <Navigate to="/unauthorized" replace state={{ error: validation.error }} />;
    }
  }

  return children;
}

export function withHODValidation(WrappedComponent) {
  return function HODValidatedComponent(props) {
    const { user } = useRole();
    const location = useLocation();
    
    if (!user?.role || user.role !== 'HOD') {
      return <Navigate to="/" replace />;
    }
    
    if (user.role === 'HOD') {
      const validation = validateHODAccess(user);
      if (!validation.valid) {
        return <Navigate to="/unauthorized" replace state={{ error: validation.error }} />;
      }
    }
    
    return <WrappedComponent {...props} hodDepartmentId={validateHODAccess(user)?.departmentId} />;
  };
}

