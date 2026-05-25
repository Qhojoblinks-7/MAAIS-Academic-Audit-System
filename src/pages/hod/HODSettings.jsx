import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Key, Clock, Bell, Save, RefreshCw, 
  AlertCircle, CheckCircle, ShieldAlert, MonitorCheck, Laptop 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { LoadingSpinner } from '../../components/molecules';

const SettingsSection = React.memo(({ icon: Icon, title, children, className }) => (
  <div className={cn("bg-white rounded-xl border border-slate-200/70 shadow-3xs p-5 lg:p-6", className)}>
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
        <Icon size={18} />
      </div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">{title}</h3>
    </div>
    {children}
  </div>
));
SettingsSection.displayName = 'SettingsSection';

const Toggle = React.memo(({ checked, onChange, label, description, disabled }) => (
  <label className={cn(
    "flex items-center justify-between py-3 border-b border-slate-100 last:border-0 select-none",
    disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
  )}>
    <div className="pr-4">
      <p className="text-xs font-bold text-slate-900">{label}</p>
      {description && <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{description}</p>}
    </div>
    <div className="relative shrink-0">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className={cn(
        "w-9 h-5 rounded-full transition-all duration-200",
        checked ? "bg-emerald-600" : "bg-slate-200"
      )}>
        <div className={cn(
          "w-4 h-4 bg-white rounded-full shadow-xs transition-transform duration-200 absolute top-0.5",
          checked ? "left-[18px]" : "left-0.5"
        )} />
      </div>
    </div>
  </label>
));
Toggle.displayName = 'Toggle';

export function HODSettings() {
  const { 
    hodSettings, 
    saveSettings, 
    changePassword, 
    activeSessions = [],
    refreshSettings,
    refreshActiveSessions,
    isLoading 
  } = useHOD();

  // Primary operational state parameters
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Password payload track matrix
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ success: false, error: null });

  // Sync state loop to counter asynchronous loading delays
  useEffect(() => {
    if (hodSettings && Object.keys(hodSettings).length > 0) {
      setSettings(hodSettings);
    }
  }, [hodSettings]);

  // Initial registry ingestion loop
  useEffect(() => {
    if (typeof refreshSettings === 'function') refreshSettings();
    if (typeof refreshActiveSessions === 'function') refreshActiveSessions();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      if (typeof saveSettings === 'function') {
        await saveSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (error) {
      setErrorMessage(error?.message || "Failed synchronization of administrative settings.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm || passwordForm.new.length < 8) return;

    setUpdatingPassword(true);
    setPasswordStatus({ success: false, error: null });
    
    try {
      if (typeof changePassword === 'function') {
        await changePassword(passwordForm.current, passwordForm.new);
        setPasswordStatus({ success: true, error: null });
        setPasswordForm({ current: '', new: '', confirm: '' });
        setTimeout(() => setPasswordStatus({ success: false, error: null }), 4000);
      }
    } catch (error) {
      setPasswordStatus({ success: false, error: error?.message || "Authentication credentials rejection error." });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const getPasswordStrengthScore = (password) => {
    if (!password) return 0;
    if (password.length < 8) return 1;
    let score = 1;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const handleRevokeSessionToken = async (sessionId) => {
    // Pipeline implementation reference placeholder linked to provider context layer
    console.warn(`Dispatched immediate termination routine for session token: ${sessionId}`);
  };

  const passwordStrength = getPasswordStrengthScore(passwordForm.new);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/40 font-sans antialiased">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Dashboard Control Node Identification Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 pb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">System Configuration</h1>
              <p className="text-xs text-gray-400 mt-0.5">Control administrative overrides, interface routing hooks, and infrastructure tokens.</p>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={saving || isLoading}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-3xs",
                saved 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                  : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40"
              )}
            >
              {saved ? <CheckCircle size={13} /> : <Save size={13} />}
              {saved ? 'Changes Saved' : saving ? 'Syncing...' : 'Save Changes'}
            </button>
          </div>

          {/* Action Network Error Output Notification Banner */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="p-3.5 bg-rose-50 border border-rose-200/60 text-rose-900 text-xs font-medium rounded-xl flex items-center gap-2.5 shadow-3xs"
              >
                <AlertCircle size={14} className="text-rose-600 shrink-0" />
                <p>{errorMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings Matrix Sections View */}
          <div className="space-y-4">
            
            {/* Identity Profile Section */}
            <SettingsSection icon={Shield} title="Identity Parameters">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 border border-slate-200/40 rounded-xl p-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Authorized Name</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block">{settings.name || 'Head of Department'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Secure Mail Access routing</span>
                  <span className="text-xs font-mono font-semibold text-slate-600 mt-0.5 block">{settings.email || 'hod@maais.edu.gh'}</span>
                </div>
              </div>
            </SettingsSection>

            {/* Password Mutation & Security Credentials Section */}
            <SettingsSection icon={Key} title="Authentication Override">
              <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Current credential string"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    disabled={updatingPassword}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 bg-white font-medium placeholder:text-gray-400"
                    required
                  />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Target credential matrix"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    disabled={updatingPassword}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 bg-white font-medium placeholder:text-gray-400"
                    required
                  />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm validation match"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    disabled={updatingPassword}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 bg-white font-medium placeholder:text-gray-400"
                    required
                  />
                </div>
                
                {/* Real-time Dynamic Password Complexity Feed Indicator */}
                {passwordForm.new && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-gray-400">Complexity Index Rating</span>
                      <span className={cn(
                        passwordStrength === 4 ? "text-emerald-600" : passwordStrength >= 2 ? "text-indigo-600" : "text-amber-600"
                      )}>
                        {passwordStrength === 4 ? 'Hardened Security' : passwordStrength >= 2 ? 'Compliant' : 'Weak Constraints'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 h-1 rounded-full transition-colors duration-300",
                            i < passwordStrength 
                              ? passwordStrength === 4 ? "bg-emerald-500" : passwordStrength >= 2 ? "bg-indigo-500" : "bg-amber-500"
                              : "bg-slate-200"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Localized Inline Feedback Block Layer */}
                {passwordStatus.error && (
                  <div className="p-2.5 bg-rose-50 text-rose-800 text-[11px] font-semibold rounded-lg flex items-center gap-2">
                    <ShieldAlert size={12} className="text-rose-600 shrink-0" />
                    <p>{passwordStatus.error}</p>
                  </div>
                )}
                {passwordStatus.success && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-lg flex items-center gap-2">
                    <CheckCircle size={12} className="text-emerald-600 shrink-0" />
                    <p>Security hash sequence restructured successfully.</p>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={updatingPassword || !passwordForm.current || !passwordForm.new || passwordForm.new !== passwordForm.confirm || passwordForm.new.length < 8}
                  className="px-3.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 disabled:opacity-40 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {updatingPassword ? <LoadingSpinner size="sm" /> : 'Authorize Key Change'}
                </button>
              </form>
            </SettingsSection>

            {/* Notification Stream Controls Section */}
            <SettingsSection icon={Bell} title="Event Notification Routing Hooks">
              <div className="divide-y divide-slate-100">
                <Toggle
                  label="Academic Evaluation Hooks"
                  description="Receive system events when grades are processed or modified by subordinate faculty units."
                  checked={settings.notifications?.grading ?? true}
                  disabled={saving}
                  onChange={(val) => setSettings({ 
                    ...settings, 
                    notifications: { ...settings?.notifications, grading: val } 
                  })}
                />
                <Toggle
                  label="Regulatory Compliance Gateways"
                  description="Receive critical alerts detailing oncoming curriculum sign-off thresholds."
                  checked={settings.notifications?.certification ?? true}
                  disabled={saving}
                  onChange={(val) => setSettings({ 
                    ...settings, 
                    notifications: { ...settings?.notifications, certification: val } 
                  })}
                />
                <Toggle
                  label="Security Context Interrupts"
                  description="Enforce out-of-band notification events when structural profile metadata parameters are accessed."
                  checked={settings.notifications?.security ?? true}
                  disabled={saving}
                  onChange={(val) => setSettings({ 
                    ...settings, 
                    notifications: { ...settings?.notifications, security: val } 
                  })}
                />
              </div>
            </SettingsSection>

            {/* Token Lifetime & Remote Session Management */}
            <SettingsSection icon={Clock} title="Token Expiry & Live Access Sessions">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Administrative Idle Timeouts</label>
                  <select
                    value={settings.sessionTimeout ?? 15}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value, 10) })}
                    disabled={saving}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-gray-700 font-semibold"
                  >
                    <option value={15}>15 minutes (Standard Profile)</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour (Hardened Terminal)</option>
                    <option value={0}>Persistent Override (Not Recommended)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Authorized Device Registry Link</span>
                  {activeSessions.length > 0 ? (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {activeSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/50 rounded-xl hover:bg-slate-100/50 transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 bg-white text-slate-500 border border-slate-200/40 rounded-lg shrink-0">
                              {session.device?.toLowerCase().includes('phone') ? <MonitorCheck size={13} /> : <Laptop size={13} />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{session.device || 'Remote API Terminal Access'}</p>
                              <p className="text-[10px] font-medium text-slate-400 mt-0.5">Last interaction event trail: {session.lastActive || 'Instantaneous'}</p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRevokeSessionToken(session.id)}
                            className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors shrink-0 cursor-pointer ml-2"
                          >
                            Revoke Token
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 font-medium">
                      No supplementary device profiles matched to database identifiers.
                    </div>
                  )}
                </div>
              </div>
            </SettingsSection>
          </div>
        </div>
      </div>
    </div>
  );
}