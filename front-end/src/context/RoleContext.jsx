import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { clearAuthToken, getAuthToken, setAuthToken } from '../services/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const RoleContext = createContext(undefined);

// Pure mapper utility to extract profile layouts without duplicating code shells
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
    role: data?.role || payload.role,
    departmentId,
    departmentName: data?.department?.name || null,
    avatar,
    currentTerm: '2026',
  };
};

export function RoleProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Synchronized Session Mounting ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchMe = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          if (!cancelled) {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
          }
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

                if (refreshRes.ok && !cancelled) {
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

                    if (newRes.ok && !cancelled) {
                      const data = await newRes.json();
                      const payload = (() => {
                        try { return JSON.parse(atob(refreshData.accessToken.split('.')[1])); }
                        catch { return {}; }
                      })();

                      // FIX: Guard statement protects against out-of-order state updates
                      setUser(parseUserProfile(data, payload));
                      setIsAuthenticated(true);
                      setLoading(false);
                      return;
                    }
                  }
                }
              } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
              }
            }

            // Fall through to cleanup if token refresh logic fails
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
        }
      } catch (e) {
        console.error('Auth check failed:', e);
        if (!cancelled) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMe();
    return () => {
      cancelled = true;
    };
  }, []);

  console.log('[RoleContext] Mount - loading state:', loading, 'user:', user, 'isAuthenticated:', isAuthenticated);

  // ── Authentication Actions ────────────────────────────────────────────────
  const setRole = useCallback((role) => {
    // Determined purely by authoritative backend validation
  }, []);

  const logout = useCallback(() => {
    console.group('[RoleContext] logout()');
    console.log('[RoleContext] Clearing auth tokens and user state');
    clearAuthToken();
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('userId');
    }
    setUser(null);
    setIsAuthenticated(false);
    console.groupEnd();
  }, []);

  const login = useCallback((credentials) => {
    console.log('[RoleContext] login() called with credentials:', {
      hasToken: !!credentials?.token,
      hasUser: !!credentials?.user,
      userRole: credentials?.user?.role,
      tokenLength: credentials?.token?.length
    });
    if (!credentials?.token) {
      console.warn('[RoleContext] login() rejected - missing token');
      return false;
    }
    try {
      const payload = JSON.parse(atob(credentials.token.split('.')[1]));
      const profile = parseUserProfile(credentials.user, payload);
      console.log('[RoleContext] login() parsed profile:', profile);
      setUser(profile);
      setIsAuthenticated(true);
      console.log('[RoleContext] login() completed successfully');
      return true;
    } catch (e) {
      console.error('[RoleContext] Token validation failed:', e);
      return false;
    }
  }, []);

  // FIX: Memoize context object value to prevent full-tree re-render cascades
  const contextValue = useMemo(() => ({
    user,
    setRole,
    logout,
    login,
    isAuthenticated
  }), [user, logout, login, isAuthenticated]);

  if (loading) {
    console.log('[RoleContext] Still loading, returning null');
    return null; // Holds app frame painting until fallback session validation settles
  }

  console.log('[RoleContext] Providing context - user:', user, 'isAuthenticated:', isAuthenticated);

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