import React, { createContext, useContext, useState } from 'react';

const RoleContext = createContext(undefined);

const mockUsers = {
  TEACHER: {
    id: 't1',
    username: 'hackman.a',
    name: 'Mr. Anthony Hackman',
    role: 'TEACHER',
    departmentId: 'agric',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hackman',
    currentTerm: '2026',
  },
  HOD: {
    id: 'h1',
    username: 'baah.m',
    name: 'Martha Baah',
    role: 'HOD',
    departmentId: 'home-ec',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Martha',
    currentTerm: '2026',
  },
  ADMIN: {
    id: 'a1',
    username: 'admin',
    name: 'System Administrator',
    role: 'ADMIN',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    currentTerm: '2026',
  },
  STUDENT: {
    id: 's1',
    username: '10001',
    name: 'Angela Efia Owusu',
    role: 'STUDENT',
    departmentId: 'agric',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Angela',
    currentTerm: '2026',
  },
};

export function RoleProvider({ children }) {
  const [user, setUser] = useState(mockUsers.TEACHER);

  const setRole = (role) => {
    setUser(mockUsers[role]);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <RoleContext.Provider value={{ user, setRole, logout }}>
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
