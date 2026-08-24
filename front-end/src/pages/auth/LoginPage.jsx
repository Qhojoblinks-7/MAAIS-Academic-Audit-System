import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { setAuthToken } from '../../services/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

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

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.message || 'Invalid credentials');
        return;
      }

      const data = await response.json();

      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;
      const userId = data.userId;
      if (!accessToken) {
        setError('Authentication failed');
        return;
      }

      setAuthToken(accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('refreshToken', refreshToken);
        }
      }
      if (userId) {
        localStorage.setItem('userId', userId);
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('userId', userId);
        }
      }

      const success = login({ token: accessToken, refreshToken, user: data.user });

      if (success) {
        if (data.user?.role === 'PARENT') {
          setError('Parent portal access is not available. Please contact the school administration.');
          return;
        }
        setMobileMenuOpen(false);
        navigate(from, { replace: true });
      } else {
        setError('Invalid role assignment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans antialiased">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center h-full" style={{ background: 'linear-gradient(135deg, #022c22 0%, #0f766e 25%, #14b8a6 50%, #22c55e 75%, #bbf7d0 100%)' }}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #a7f3d0 0%, transparent 50%), radial-gradient(circle at 80% 20%, #5eead4 0%, transparent 40%), radial-gradient(circle at 60% 80%, #38bdf8 0%, transparent 45%)' }}></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white w-full">
          <div className="flex flex-col items-center gap-12 w-full max-w-2xl">
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg">
                <Shield size={32} className="text-white" />
              </div>
              <div>
                <h1 className="font-black tracking-tight text-white" style={{ fontSize: 'clamp(1.75rem, 1.2rem + 2vw, 3rem)' }}>MAAIS</h1>
                <p className="text-white/80 font-medium" style={{ fontSize: 'clamp(0.875rem, 0.7rem + 0.4vw, 1.125rem)' }}>Academic Audit System</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20 shadow-2xl max-w-lg w-full text-center">
              <div className="flex flex-col items-center gap-8">
                <div className="text-center w-full">
                  <p className="text-white leading-relaxed italic" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.25rem, 0.9rem + 1vw, 2rem)' }}>
                    Ndaamba Kunyimdzi Ntsi
                  </p>
                  <p className="text-white/70 mt-3" style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(0.875rem, 0.7rem + 0.4vw, 1.125rem)' }}>
                    Together we build excellence
                  </p>
                </div>

                <div className="w-full h-px bg-white/20"></div>

                <p className="text-center w-full" style={{ fontFamily: 'var(--font-script)', fontSize: 'clamp(1.5rem, 1rem + 1.5vw, 2.5rem)' }}>
                  Any good thing you have, show it now, Tomorrow may be too late!!!
                </p>
              </div>
            </div>

            <p className="text-white/60 text-center w-full" style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(0.75rem, 0.55rem + 0.35vw, 0.875rem)' }}>© 2026 MAAIS. All rights reserved.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-surface p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.25rem, 1rem + 1vw, 1.75rem)' }}>
              M
            </div>
            <div>
              <h1 className="font-black text-text-primary tracking-tight" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.25rem, 1rem + 1vw, 1.75rem)' }}>MAAIS</h1>
              <p className="text-text-secondary font-medium" style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(0.75rem, 0.6rem + 0.35vw, 0.9rem)' }}>Academic Audit System</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="font-bold text-text-primary mb-2" style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1.5rem, 1rem + 1vw, 2rem)' }}>Welcome back!</h2>
                <p className="text-text-secondary" style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(0.875rem, 0.7rem + 0.4vw, 1.125rem)' }}>Let's continue building excellence</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-danger/10 border border-danger/20 rounded-xl p-3 text-sm text-danger font-medium" style={{ fontFamily: 'var(--font-body)' }}>
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-body)' }}>
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
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-body)' }}>
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
                      style={{ fontFamily: 'var(--font-body)' }}
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
                  style={{ fontFamily: 'var(--font-body)' }}
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

              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <p className="text-[11px] text-text-secondary text-center" style={{ fontFamily: 'var(--font-body)' }}>
                  Need an account? Contact your administrator
                </p>
                <p className="text-[11px] text-text-secondary text-center" style={{ fontFamily: 'var(--font-body)' }}>
                  Forgot password?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/forgot-password');
                    }}
                    className="text-brand-primary font-black hover:underline"
                  >
                    Click here to reset it
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
