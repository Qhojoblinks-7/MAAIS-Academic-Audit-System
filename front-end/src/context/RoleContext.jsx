import React, { createContext, useContext, useState, useEffect } from 'react';

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
          const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
          if (!token) {
            setLoading(false);
            return;
          }
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            id: data.id || payload.id,
            name: data.name || payload.name || `${data?.studentProfile?.firstName || data?.staffProfile?.firstName || ''} ${data?.studentProfile?.lastName || data?.staffProfile?.lastName || ''}`.trim(),
            role: data.role || payload.role,
            departmentId: data?.staffProfile?.departmentId || data?.studentProfile?.departmentId || null,
            departmentName: data?.department?.name,
            avatar: data?.studentProfile?.photoUrl || data?.staffProfile?.photoUrl || null,
            currentTerm: '2026',
          });
          setIsAuthenticated(true);
        }
      } catch (e) {
        // No auth - user must login manually
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const setRole = (role) => {
    // No-op - roles determined by auth
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = (credentials) => {
    if (!credentials?.token) return false;
    try {
      const payload = JSON.parse(atob(credentials.token.split('.')[1]));
      setUser({
        id: payload.id,
        name: payload.name,
        role: payload.role,
        departmentId: payload.departmentId || null,
        departmentName: null,
        avatar: payload.avatar || null,
        currentTerm: '2026',
      });
      setIsAuthenticated(true);
      return true;
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