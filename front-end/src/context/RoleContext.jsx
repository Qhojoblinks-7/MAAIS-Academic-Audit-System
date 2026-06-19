import React, { createContext, useContext, useState, useEffect } from 'react';
import { clearAuthToken, getAuthToken, setAuthToken } from '../services/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const RoleContext = createContext(undefined);

export function RoleProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchMe = async () => {
      try {
        const token = getAuthToken();
        console.groupCollapsed('[Auth] checking session');
        console.log('[Auth] token present:', Boolean(token));
        if (!token || cancelled) {
          if (!cancelled) {
            console.warn('[Auth] no auth token available; user session cleared');
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
          }
          console.groupEnd();
          return;
        }
        console.groupEnd();

        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!res.ok) {
          if (res.status === 401) {
            const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
            const userId = localStorage.getItem('userId');
            if (refreshToken && userId) {
              try {
                const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId, refreshToken }),
                  credentials: 'include',
                });

                if (refreshRes.ok) {
                  const refreshData = await refreshRes.json();
                  if (refreshData.accessToken) {
                    setAuthToken(refreshData.accessToken);
                    const newRes = await fetch(`${API_BASE_URL}/auth/me`, {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${refreshData.accessToken}`,
                      },
                      credentials: 'include',
                    });

                    if (newRes.ok) {
                      const data = await newRes.json();
                      const payload = (() => {
                        try { return JSON.parse(atob(refreshData.accessToken.split('.')[1])); }
                        catch { return {}; }
                      })();

const newUserId = data.id || payload.sub || payload.id;
                       const profileId = data?.studentProfile?.id || data?.staffProfile?.id || data?.parentProfile?.id || null;
                       setUser({
                         id: newUserId,
                         profileId,
                         name: data.name || payload.name ||
                           (data?.studentProfile ? `${data.studentProfile.firstName} ${data.studentProfile.lastName}` : '') ||
                           (data?.staffProfile ? `${data.staffProfile.firstName} ${data.staffProfile.lastName}` : '') ||
                           (data?.parentProfile ? `${data.parentProfile.firstName} ${data.parentProfile.lastName}` : ''),
                         role: data.role || payload.role,
                         departmentId: data?.staffProfile?.departmentId || data?.studentProfile?.departmentId || null,
                         departmentName: data?.department?.name,
                         avatar: data?.studentProfile?.photoUrl || data?.staffProfile?.photoUrl || null,
                         currentTerm: '2026',
                       });
                      setIsAuthenticated(true);
                      if (!cancelled) setLoading(false);
                      return;
                    }
                  }
                }
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
              }
            }

            clearAuthToken();
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.removeItem('refreshToken');
              sessionStorage.removeItem('userId');
            }
            setUser(null);
            setIsAuthenticated(false);
            if (!cancelled) setLoading(false);
            return;
          }

          throw new Error(`auth/me failed: ${res.status}`);
        }

        const data = await res.json();
        const payload = (() => {
          try { return JSON.parse(atob(token.split('.')[1])); }
          catch { return {}; }
        })();

        const userId = data.id || payload.sub || payload.id;
        const profileId = data?.studentProfile?.id || data?.staffProfile?.id || data?.parentProfile?.id || null;
        setUser({
          id: userId,
          profileId,
          name: data.name || payload.name ||
            (data?.studentProfile ? `${data.studentProfile.firstName} ${data.studentProfile.lastName}` : '') ||
            (data?.staffProfile ? `${data.staffProfile.firstName} ${data.staffProfile.lastName}` : '') ||
            (data?.parentProfile ? `${data.parentProfile.firstName} ${data.parentProfile.lastName}` : ''),
          role: data.role || payload.role,
          departmentId: data?.staffProfile?.departmentId || data?.studentProfile?.departmentId || null,
          departmentName: data?.department?.name,
          avatar: data?.studentProfile?.photoUrl || data?.staffProfile?.photoUrl || null,
          currentTerm: '2026',
        });
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Auth check failed:', e);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMe();
    return () => {
      cancelled = true;
    };
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
      const profileId = credentials.user?.studentProfile?.id || credentials.user?.staffProfile?.id || credentials.user?.parentProfile?.id || payload.profileId || null;
      setUser({
        id: userId,
        profileId: profileId,
        name: credentials.user?.name || payload.name ||
          (credentials.user?.studentProfile ? `${credentials.user.studentProfile.firstName} ${credentials.user.studentProfile.lastName}` : '') ||
          (credentials.user?.staffProfile ? `${credentials.user.staffProfile.firstName} ${credentials.user.staffProfile.lastName}` : '') ||
          (credentials.user?.parentProfile ? `${credentials.user.parentProfile.firstName} ${credentials.user.parentProfile.lastName}` : ''),
        role: credentials.user?.role || payload.role,
        departmentId: credentials.user?.departmentId || credentials.user?.staffProfile?.departmentId || credentials.user?.studentProfile?.departmentId || payload.departmentId || null,
        departmentName: null,
        avatar: credentials.user?.studentProfile?.photoUrl || credentials.user?.staffProfile?.photoUrl || credentials.user?.avatar || payload.avatar || null,
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