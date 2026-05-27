import React, { createContext, useContext, useState } from 'react';
import mockApiData from '../data/mockApiData.json';

const RoleContext = createContext(undefined);

const getHODUser = () => {
  const hodUser = mockApiData.users?.hodUsers?.[0];
  const department = mockApiData.departments?.items?.find(d => d.hodId === hodUser?.id);
  return {
    id: hodUser?.id || 'hod001',
    username: hodUser?.username || 'hod.agric',
    name: hodUser?.name || 'Mr. Kwame Asante',
    role: 'HOD',
    departmentId: department?.id || 'dept001',
    departmentName: department?.name || 'Agriculture',
    avatar: hodUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=HOD',
    currentTerm: '2026',
  };
};

const getTeacherUser = () => {
  const teacher = mockApiData.users?.teacherUsers?.[0];
  return {
    id: teacher?.id || 'teacher001',
    username: teacher?.username || 'mensah.agric',
    name: teacher?.name || 'Mr. Kwame Mensah',
    role: 'TEACHER',
    departmentId: teacher?.departmentId || 'dept001',
    avatar: teacher?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hackman',
    currentTerm: '2026',
  };
};

const getAdminUser = () => {
  const admin = mockApiData.users?.adminUsers?.[0];
  return {
    id: admin?.id || 'admin001',
    username: admin?.username || 'admin.system',
    name: admin?.name || 'System Admin',
    role: 'ADMIN',
    departmentId: null, // Admin not tied to a specific department
    avatar: admin?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    currentTerm: '2026',
  };
};

const getStudentUser = () => {
  const student = mockApiData.students?.items?.[0];
  const department = mockApiData.departments?.items?.find(d => d.name === student?.department);
  return {
    id: student?.id || 'stud001',
    username: student?.index || '001',
    name: student?.name || 'Angela Owusu',
    role: 'STUDENT',
    departmentId: department?.id || 'dept001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Angela',
    currentTerm: '2026',
  };
};

const mockUsers = {
  TEACHER: getTeacherUser(),
  HOD: getHODUser(),
  ADMIN: getAdminUser(),
  STUDENT: getStudentUser(),
};

export function RoleProvider({ children }) {
  const [user, setUser] = useState(mockUsers.STUDENT);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setRole = (role) => {
    if (mockUsers[role]) {
      setUser(mockUsers[role]);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = (credentials) => {
    if (!credentials?.token) return false;
    try {
      const payload = JSON.parse(atob(credentials.token.split('.')[1]));
      if (payload.role && mockUsers[payload.role]) {
        setUser({ ...mockUsers[payload.role], ...payload });
        setIsAuthenticated(true);
        return true;
      }
    } catch (e) {
      console.error('Token validation failed:', e);
    }
    return false;
  };

  return (
    <RoleContext.Provider value={{ user, setRole, logout, login, isAuthenticated }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}