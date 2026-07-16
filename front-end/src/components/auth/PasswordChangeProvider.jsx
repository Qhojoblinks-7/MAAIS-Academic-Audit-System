import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { KeyRound, X } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { useRole } from '@/context/RoleContext';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PasswordChangeContext = createContext(undefined);

export function PasswordChangeProvider({ children }) {
  const { user, refreshUser } = useRole();
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('pwReminderDismissed') === '1';
    } catch {
      return false;
    }
  });

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem('pwReminderDismissed', '1');
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }, []);

  const openChangePassword = useCallback(() => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirm('');
    setError('');
    setShow(false);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    if (loading) return;
    setOpen(false);
  }, [loading]);

  const submit = useCallback(async () => {
    setError('');
    if (!currentPassword || !newPassword || !confirm) {
      setError('All fields are required.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirm) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully.');
      setOpen(false);
      await refreshUser();
    } catch (err) {
      setError(err?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPassword, newPassword, confirm, loading, refreshUser]);

  // Reset dismissal whenever the signed-in user changes (e.g. a new login).
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('pwReminderDismissed') === '1';
      setDismissed(stored);
    } catch {
      setDismissed(false);
    }
  }, [user?.id]);

  const mustChange = Boolean(user?.mustChangePassword);
  const showReminder = mustChange && !dismissed;

  return (
    <PasswordChangeContext.Provider value={{ openChangePassword }}>
      {children}

      {showReminder && !open && (
        <div className="fixed top-0 left-0 right-0 z-[120] flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-amber-950 shadow-lg">
          <KeyRound size={16} className="shrink-0" />
          <span className="text-xs font-semibold">
            For your security, please change your password.
          </span>
          <Button
            size="sm"
            onClick={openChangePassword}
            className="h-7 bg-amber-950 text-amber-50 hover:bg-amber-900"
          >
            Change password
          </Button>
          <button
            onClick={dismiss}
            title="Remind me later"
            aria-label="Dismiss reminder"
            className="ml-1 rounded-md p-1 hover:bg-amber-950/20"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={close}
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-popover p-6 shadow-2xl ring-1 ring-foreground/10">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <KeyRound size={18} />
              </div>
              <h3 className="text-base font-semibold text-popover-foreground">
                Change your password
              </h3>
              <button
                onClick={close}
                className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {mustChange && (
              <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
                You are using a temporary password. Please set a new password to
                secure your account.
              </p>
            )}

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Current password
                </label>
                <Input
                  type={show ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoFocus
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  New password
                </label>
                <Input
                  type={show ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Confirm new password
                </label>
                <Input
                  type={show ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter new password"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submit();
                  }}
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={show}
                  onChange={(e) => setShow(e.target.checked)}
                />
                Show passwords
              </label>

              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={close} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={submit} disabled={loading}>
                  {loading ? 'Changing…' : 'Change password'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PasswordChangeContext.Provider>
  );
}

export function useChangePassword() {
  const context = useContext(PasswordChangeContext);
  if (context === undefined) {
    throw new Error(
      'useChangePassword must be used within a PasswordChangeProvider',
    );
  }
  return context;
}
