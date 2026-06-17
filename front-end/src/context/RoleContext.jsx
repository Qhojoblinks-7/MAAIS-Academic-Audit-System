import React, { createContext, useContext, useState, useEffect } from 'react';
import { clearAuthToken, getAuthToken } from '../services/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const RoleContext = createContext(undefined);

export function RoleProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = data.id || payload.sub || payload.id;
          const profileId = data?.studentProfile?.id || data?.staffProfile?.id || null;
          setUser({
            id: userId,
            profileId: profileId,
            name: data.name || payload.name || 
              (data?.studentProfile ? `${data.studentProfile.firstName} ${data.studentProfile.lastName}` : '') ||
              (data?.staffProfile ? `${data.staffProfile.firstName} ${data.staffProfile.lastName}` : ''),
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
    clearAuthToken();
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('userId');
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = (credentials) => {
    if (!credentials?.token) return false;
    try {
      const payload = JSON.parse(atob(credentials.token.split('.')[1]));
      const userId = credentials.user?.id || payload.sub || payload.id;
      const profileId = credentials.user?.studentProfile?.id || credentials.user?.staffProfile?.id || payload.profileId || null;
      setUser({
        id: userId,
        profileId: profileId,
        name: credentials.user?.name || payload.name,
        role: credentials.user?.role || payload.role,
        departmentId: credentials.user?.departmentId || payload.departmentId || null,
        departmentName: null,
        avatar: credentials.user?.avatar || payload.avatar || null,
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