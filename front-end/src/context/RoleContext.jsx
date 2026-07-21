import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { clearAuthToken, getAuthToken, setAuthToken } from '../services/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const AUTH_TIMEOUT = 30000;

async function fetchWithTimeout(url, init, timeoutMs = AUTH_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

const RoleContext = createContext(undefined);

const BACKEND_TO_FRONTEND_ROLE = {
  SUPER_ADMIN: 'ADMIN',
  HEADMASTER: 'ADMIN',
  HOD: 'HOD',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  PARENT: null,
};

function normalizeRole(role) {
  const mapped = BACKEND_TO_FRONTEND_ROLE[role];
  if (mapped !== undefined) return mapped;
  return null;
}

const parseUserProfile = (data, jwtPayload) => {
  const payload = jwtPayload || {};
  const userId = data?.id || payload.sub || payload.id;
  const profileId = data?.studentProfile?.id || data?.staffProfile?.id || data?.parentProfile?.id || payload.profileId || null;
  
  const name = data?.name || payload.name ||
    (data?.studentProfile ? `${data.studentProfile.firstName} ${data.studentProfile.lastName}` : '') ||
    (data?.staffProfile ? `${data.staffProfile.firstName} ${data.staffProfile.lastName}` : '') ||
    (data?.parentProfile ? `${data.parentProfile.firstName} ${data.parentProfile.lastName}` : '');

  const departmentId = data?.departmentId || data?.staffProfile?.departmentId || data?.studentProfile?.departmentId || payload.departmentId || null;
  const avatar = data?.studentProfile?.photoUrl || data?.staffProfile?.photoUrl || data?.avatar || payload.avatar || null;

  return {
    id: userId,
    profileId,
    name,
    role: normalizeRole(data?.role || payload.role),
    departmentId,
    departmentName: data?.department?.name || null,
    avatar,
    currentTerm: '2026',
    mustChangePassword: Boolean(data?.mustChangePassword),
    passwordChangedAt: data?.passwordChangedAt || null,
  };
};

export function RoleProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchMe = async () => {
      try {
        const token = getAuthToken();
        console.log('[RoleContext] fetchMe start, token present:', !!token);
        if (!token) {
          if (!cancelled) {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
          }
          return;
        }

        const res = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });

        console.log('[RoleContext] /auth/me status:', res.status, 'ok:', res.ok);

        if (!res.ok) {
          if (res.status === 401) {
            const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
            const userId = localStorage.getItem('userId');
            
            if (refreshToken && userId) {
              try {
                const refreshRes = await fetchWithTimeout(`${API_BASE_URL}/auth/refresh`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId, refreshToken }),
                  credentials: 'include',
                });

                console.log('[RoleContext] /auth/refresh status:', refreshRes.status, 'ok:', refreshRes.ok);

                if (refreshRes.ok && !cancelled) {
                  const refreshData = await refreshRes.json();
                  console.log('[RoleContext] refresh data keys:', Object.keys(refreshData));
                  if (refreshData.accessToken) {
                    setAuthToken(refreshData.accessToken);
                    
                    const newRes = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, {
                      method: 'GET',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${refreshData.accessToken}`,
                      },
                      credentials: 'include',
                    });

                    console.log('[RoleContext] post-refresh /auth/me status:', newRes.status, 'ok:', newRes.ok);

                    if (newRes.ok && !cancelled) {
                      const data = await newRes.json();
                      const payload = (() => {
                        try { return JSON.parse(atob(refreshData.accessToken.split('.')[1])); }
                        catch { return {}; }
                      })();

                      setUser(parseUserProfile(data, payload));
                      setIsAuthenticated(true);
                      setLoading(false);
                      console.log('[RoleContext] user restored after refresh:', data?.name, data?.role);
                      return;
                    }
                  }
                }
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
              }
            }

            if (!cancelled) {
              clearAuthToken();
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('userId');
              if (typeof sessionStorage !== 'undefined') {
                sessionStorage.removeItem('refreshToken');
                sessionStorage.removeItem('userId');
              }
              setUser(null);
              setIsAuthenticated(false);
              setLoading(false);
              console.warn('[RoleContext] cleared auth — 401 with no refresh');
            }
            return;
          }
          throw new Error(`auth/me failed: ${res.status}`);
        }

        const data = await res.json();
        const payload = (() => {
          try { return JSON.parse(atob(token.split('.')[1])); }
          catch { return {}; }
        })();

        if (!cancelled) {
          setUser(parseUserProfile(data, payload));
          setIsAuthenticated(true);
          console.log('[RoleContext] /auth/me success:', data?.name, 'role:', data?.role);
        }
      } catch (e) {
        console.error('[RoleContext] fetchMe exception:', e);
        if (e.message?.includes('timed out')) {
          console.warn('[RoleContext] auth check timed out — backend may be cold-starting');
        }
        if (!cancelled) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
        console.log('[RoleContext] fetchMe finished, loading:', false);
      }
    };

    fetchMe();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();
      const payload = (() => {
        try { return JSON.parse(atob(token.split('.')[1])); }
        catch { return {}; }
      })();
      setUser(parseUserProfile(data, payload));
    } catch (e) {
      console.error('refreshUser failed:', e);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('userId');
    }
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/401';
  }, []);

  const login = useCallback((credentials) => {
    if (!credentials?.token) {
      console.warn('[RoleContext] login called without token');
      return false;
    }
    try {
      const payload = JSON.parse(atob(credentials.token.split('.')[1]));
      const profile = parseUserProfile(credentials.user, payload);
      setUser(profile);
      setIsAuthenticated(true);
      console.log('[RoleContext] login success:', profile.name, profile.role);

      fetchWithTimeout(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${credentials.token}`,
        },
        credentials: 'include',
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setUser(parseUserProfile(data, payload));
        })
        .catch(() => {});

      return true;
    } catch (e) {
      console.error('Token validation failed:', e);
      return false;
    }
  }, []);

  const contextValue = useMemo(() => ({
    user,
    setRole: () => {},
    logout,
    login,
    refreshUser,
    isAuthenticated
  }), [user, logout, login, refreshUser, isAuthenticated]);

  if (loading) {
    return null;
  }

  return (
    <RoleContext.Provider value={contextValue}>
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
