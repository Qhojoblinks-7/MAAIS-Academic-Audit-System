import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Users, Clock, Bell, Settings as SettingsIcon, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { LoadingSpinner } from '../../components/molecules';

const SettingsSection = ({ icon: Icon, title, children, className }) => (
  <div className={cn("bg-white rounded-2xl border border-gray-100 p-6", className)}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
        <Icon size={20} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
);

const Toggle = ({ checked, onChange, label, description }) => (
  <label className="flex items-center justify-between py-3 cursor-pointer">
    <div>
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className={cn(
        "w-10 h-5 rounded-full transition-all",
        checked ? "bg-emerald-600" : "bg-gray-200"
      )}>
        <div className={cn(
          "w-4 h-4 bg-white rounded-full shadow-sm transition-transform mt-0.5",
          checked ? "ml-5" : "ml-0.5"
        )} />
      </div>
    </div>
  </label>
);

export function HODSettings() {
  const { 
    hodSettings, 
    saveSettings, 
    changePassword, 
    activeSessions,
    refreshSettings,
    refreshActiveSessions,
    isLoading 
  } = useHOD();

  const [settings, setSettings] = useState(hodSettings || {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new === passwordForm.confirm && passwordForm.new.length >= 8) {
      await changePassword(passwordForm.current, passwordForm.new);
      setPasswordForm({ current: '', new: '', confirm: '' });
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length < 8) return 0;
    let strength = 0;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HOD Settings</h1>
              <p className="text-sm text-gray-500 mt-1">Configure department preferences and security</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all",
                saved ? "bg-emerald-50 text-emerald-700" : "bg-emerald-600 text-white hover:bg-emerald-700"
              )}
            >
              {saved ? <CheckCircle size={16} /> : <Save size={16} />}
              {saved ? 'Saved' : saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="space-y-4">
            <SettingsSection icon={Shield} title="Identity">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Name</p>
                  <p className="text-sm font-medium text-gray-900">{settings.name || 'Head of Department'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-medium text-gray-900">{settings.email || 'hod@maais.edu.gh'}</p>
                </div>
              </div>
            </SettingsSection>

            <SettingsSection icon={Key} title="Password & Security">
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Current password"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                
                {passwordForm.new && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1.5">Password Strength</p>
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "flex-1 h-1 rounded-full",
                            i < getPasswordStrength(passwordForm.new) ? "bg-emerald-500" : "bg-gray-200"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handlePasswordChange}
                  disabled={!passwordForm.current || !passwordForm.new || passwordForm.new !== passwordForm.confirm}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  Change Password
                </button>
              </div>
            </SettingsSection>

            <SettingsSection icon={Bell} title="Notifications">
              <Toggle
                label="Grading Alerts"
                description="Receive alerts when grades are submitted"
                checked={settings.notifications?.grading ?? true}
                onChange={(val) => setSettings({ 
                  ...settings, 
                  notifications: { ...settings.notifications, grading: val } 
                })}
              />
              <Toggle
                label="Certification Alerts"
                description="Receive alerts for certification deadlines"
                checked={settings.notifications?.certification ?? true}
                onChange={(val) => setSettings({ 
                  ...settings, 
                  notifications: { ...settings.notifications, certification: val } 
                })}
              />
              <Toggle
                label="Security Alerts"
                description="Receive alerts for security-related events"
                checked={settings.notifications?.security ?? true}
                onChange={(val) => setSettings({ 
                  ...settings, 
                  notifications: { ...settings.notifications, security: val } 
                })}
              />
            </SettingsSection>

            <SettingsSection icon={Clock} title="Session Management">
              <div className="space-y-3">
                <select
                  value={settings.sessionTimeout || 15}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={0}>Never</option>
                </select>
                
                <p className="text-xs text-gray-500 uppercase tracking-wider">Active Sessions</p>
                {activeSessions.length > 0 ? (
                  <div className="space-y-2">
                    {activeSessions.slice(0, 3).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs font-medium text-gray-900">{session.device}</p>
                          <p className="text-[10px] text-gray-500">{session.lastActive}</p>
                        </div>
                        <button className="text-[10px] text-rose-600 hover:text-rose-700">Revoke</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No active sessions</p>
                )}
              </div>
            </SettingsSection>
          </div>
        </div>
      </div>
    </div>
  );
}