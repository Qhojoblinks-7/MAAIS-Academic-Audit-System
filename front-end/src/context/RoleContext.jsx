import React, { createContext, useContext, useState, useEffect } from 'react';
import mockApiData from '../data/mockApiData.json';

const RoleContext = createContext(undefined);

export function RoleProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/v1/auth/me', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser({
            id: data.id,
            name: data.name || `${data?.studentProfile?.firstName || data?.staffProfile?.firstName || ''} ${data?.studentProfile?.lastName || data?.staffProfile?.lastName || ''}`.trim(),
            role: data.role,
            departmentId: data?.staffProfile?.departmentId || data?.studentProfile?.departmentId || null,
            departmentName: data?.department?.name,
            avatar: data?.studentProfile?.photoUrl || data?.staffProfile?.photoUrl || null,
            currentTerm: '2026',
          });
          setIsAuthenticated(true);
        }
      } catch (e) {
        // Will use mock data as fallback
      } finally {
        setLoading(false);
      }
    };

    const hodUser = mockApiData.users?.hodUsers?.[0];
    const teacher = mockApiData.users?.teacherUsers?.[0];
    const admin = mockApiData.users?.adminUsers?.[0];
    const student = mockApiData.students?.items?.[0];
    const departments = mockApiData.departments?.items || [];
    const getStudentDepartment = (deptName) => departments.find(d => d.name === deptName);

    const mockUsers = {
      TEACHER: {
        id: teacher?.id || 'teacher001',
        username: teacher?.username || 'mensah.agric',
        name: teacher?.name || 'Mr. Kwame Mensah',
        role: 'TEACHER',
        departmentId: teacher?.departmentId || '1',
        currentTerm: '2026',
      },
      HOD: (() => {
        const dept = getStudentDepartment(hodUser?.department);
        return {
          id: hodUser?.id || 'hod001',
          username: hodUser?.username || 'hod.agric',
          name: hodUser?.name || 'Mr. Kwame Asante',
          role: 'HOD',
          departmentId: dept?.id || '1',
          departmentName: dept?.name || 'Agriculture',
          currentTerm: '2026',
        };
      })(),
      ADMIN: {
        id: admin?.id || 'admin001',
        username: admin?.username || 'admin.system',
        name: admin?.name || 'System Admin',
        role: 'ADMIN',
        departmentId: null,
        currentTerm: '2026',
      },
      STUDENT: (() => {
        const dept = getStudentDepartment(student?.department);
        return {
          id: student?.id || 'stud001',
          username: student?.index || '001',
          name: student?.name || 'Angela Owusu',
          role: 'STUDENT',
          departmentId: dept?.id || '1',
          currentTerm: '2026',
        };
      })(),
    };

    window.mockUsers = mockUsers;
    
    // Set mock user for development/demo (comment out when backend is available)
    fetchMe().then(() => {
      if (!user) {
        setUser(mockUsers.STUDENT);
        setIsAuthenticated(true);
      }
    });
  }, []);

  const setRole = (role) => {
    if (window.mockUsers?.[role]) {
      setUser(window.mockUsers[role]);
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
      if (payload.role && window.mockUsers?.[payload.role]) {
        setUser({ ...window.mockUsers[payload.role], ...payload });
        setIsAuthenticated(true);
        return true;
      }
    } catch (e) {
      console.error('Token validation failed:', e);
    }
    return false;
  };

  if (loading) {
    return null;
  }

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