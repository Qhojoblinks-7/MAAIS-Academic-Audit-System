import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { Shield, Eye, EyeOff, BookOpen, Users, BarChart3 } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { setAuthToken } from '../../services/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const LOGIN_TIMEOUT = 30000;

async function fetchWithTimeout(url, init, timeoutMs = LOGIN_TIMEOUT) {
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

export function LoginPage() {
  const { login, setRole, isAuthenticated } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const { setMobileMenuOpen } = useUI();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  console.log('[LoginPage] mounted, pathname:', location.pathname, 'isAuthenticated:', isAuthenticated);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.group('[LoginPage] handleSubmit');
      console.log('[LoginPage] email:', email);
      console.log('[LoginPage] target:', `${API_BASE_URL}/auth/login`);

      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('[LoginPage] response status:', response.status, 'ok:', response.ok);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.warn('[LoginPage] login rejected:', data);
        setError(data?.message || 'Invalid credentials');
        console.groupEnd();
        return;
      }

      const data = await response.json();
      console.log('[LoginPage] response keys:', Object.keys(data));
      console.log('[LoginPage] role:', data.user?.role);

      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;
      const userId = data.userId;
      if (!accessToken) {
        console.error('[LoginPage] missing accessToken in response');
        setError('Authentication failed');
        console.groupEnd();
        return;
      }

      setAuthToken(accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (userId) localStorage.setItem('userId', userId);
      console.log('[LoginPage] tokens stored');

      console.log('[LoginPage] calling RoleContext.login()');
      const success = login({ token: accessToken, refreshToken, user: data.user });
      console.log('[LoginPage] RoleContext.login() returned:', success);

      if (success) {
        if (data.user?.role === 'PARENT') {
          setError('Parent portal access is not available. Please contact the school administration.');
          console.warn('[LoginPage] blocked PARENT role');
          return;
        }
        console.log('[LoginPage] navigating to:', from);
        setMobileMenuOpen(false);
        navigate(from, { replace: true });
      } else {
        console.error('[LoginPage] login() returned false');
        setError('Invalid role assignment');
      }
      console.groupEnd();
    } catch (err) {
      console.error('[LoginPage] exception:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If user is already authenticated, redirect to dashboard
  console.log('[LoginPage] Auth check - isAuthenticated:', isAuthenticated, 'pathname:', location.pathname);
  if (isAuthenticated) {
    console.warn('[LoginPage] Redirecting to / because user is authenticated');
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-background font-sans antialiased">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-primary via-brand-primary to-brand-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Shield size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">MAAIS</h1>
                <p className="text-white/70 text-sm font-medium">Academic Audit System</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-black leading-tight mb-4">
                Streamline academic<br />
                excellence with<br />
                precision.
              </h2>
              <p className="text-white/80 text-lg leading-relaxed max-w-md">
                Comprehensive audit, grading, and performance management for modern educational institutions.
              </p>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <BookOpen size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm">Academic Records</p>
                  <p className="text-white/60 text-xs">Complete audit trail</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm">Multi-Role Access</p>
                  <p className="text-white/60 text-xs">Admin, HOD, Staff, Student</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <BarChart3 size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm">Analytics</p>
                  <p className="text-white/60 text-xs">Real-time insights</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-white/50 text-xs">© 2025 MAAIS. All rights reserved.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-surface p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black text-lg">
              M
            </div>
            <div>
              <h1 className="text-xl font-black text-text-primary tracking-tight">MAAIS</h1>
              <p className="text-text-secondary text-xs font-medium">Academic Audit System</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-text-primary mb-2">Welcome Back</h2>
                <p className="text-text-secondary text-sm">Sign in to access your dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-danger/10 border border-danger/20 rounded-xl p-3 text-sm text-danger font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                    placeholder="Enter your email"
                    required
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all pr-12"
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-text-secondary hover:text-text-primary transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-primary/20 text-sm uppercase tracking-wider"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.03 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-text-secondary text-center">
                  Contact your administrator for access credentials
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}