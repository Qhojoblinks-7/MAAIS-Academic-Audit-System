import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { useUI } from '../../context/UIContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setMobileMenuOpen } = useUI();

  const token = new URLSearchParams(window.location.search).get('token') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || 'Something went wrong');
        return;
      }

      setSuccess(data?.message || 'Password reset successful');
      setTimeout(() => {
        setMobileMenuOpen(false);
        navigate('/login');
      }, 2000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background font-sans antialiased">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-primary via-brand-primary to-brand-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Lock size={28} className="text-white" />
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
                Create a new<br />password
              </h2>
              <p className="text-white/80 text-lg leading-relaxed max-w-md">
                Choose a strong password to secure your account.
              </p>
            </div>
          </div>

          <p className="text-white/50 text-xs">© 2025 MAAIS. All rights reserved.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-surface p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black text-lg">M</div>
            <div>
              <h1 className="text-xl font-black text-text-primary tracking-tight">MAAIS</h1>
              <p className="text-text-secondary text-xs font-medium">Academic Audit System</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-text-primary mb-2">Reset Password</h2>
                <p className="text-text-secondary text-sm">Enter your new password</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-danger/10 border border-danger/20 rounded-xl p-3 text-sm text-danger font-medium">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-success/10 border border-success/20 rounded-xl p-3 text-sm text-success font-medium">
                    {success}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                    placeholder="Repeat your password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full py-3.5 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-primary/20 text-sm uppercase tracking-wider"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-xs font-bold text-brand-primary hover:underline"
                >
                  <ArrowLeft size={14} /> Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
