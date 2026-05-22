import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Key, Users, Clock, Bell, Settings as SettingsIcon,
  Save, RefreshCw, CheckCircle, AlertCircle, Smartphone,
  QrCode, Monitor, PhoneIcon, Globe, User, Mail, Lock, Trash2,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { ConfirmationDialog, LoadingSpinner, EmptyState, StatusBadge,
  ActionButtonGroup, HODCommentInput
} from '../../components/molecules';

const TABS = [
  { id: 'profile',    label: 'Profile',    icon: User },
  { id: 'security',   label: 'Security',   icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'department', label: 'Department', icon: Users },
  { id: 'sessions',   label: 'Sessions',   icon: Clock },
];

function SettingsSection({ icon: Icon, title, children, className }) {
  return (
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
}

const Toggle = ({ checked, onChange, label, description }) => {
  return (
    <label className="flex items-center justify-between py-3 cursor-pointer border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="relative shrink-0">
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
};

export function HODSettingsPage() {
  const {
    hodSettings, saveSettings, changePassword, activeSessions,
    refreshSettings, refreshActiveSessions,
    mfaEnroll, mfaVerify,
    isLoading,
  } = useHOD();

  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState(hodSettings || {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [mfaCode, setMfaCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [contactChannels, setContactChannels] = useState({
    email: true, sms: false, whatsapp: false,
  });
  const [sessionTab, setSessionTab] = useState('active');
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [recentChanges, setRecentChanges] = useState([]);
  const [filterRecency, setFilterRecency] = useState('all');

  useEffect(() => {
    refreshSettings();
    refreshActiveSessions();
  }, []);

  useEffect(() => {
    if (hodSettings) setSettings(hodSettings);
  }, [hodSettings]);

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
    if (passwordForm.new !== passwordForm.confirm) return;
    if (passwordForm.new.length < 8) return;
    await changePassword(passwordForm.current, passwordForm.new);
    setPasswordForm({ current: '', new: '', confirm: '' });
  };

  const handleMFAEnroll = async () => {
    setEnrolling(true);
    try {
      const result = await mfaEnroll();
      setQrCodeUrl(result.qrCode);
      setVerifyOpen(true);
    } finally {
      setEnrolling(false);
    }
  };

  const handleMFAVerify = async () => {
    if (mfaCode.length < 6) return;
    await mfaVerify(mfaCode);
    setMfaEnabled(true);
    setQrCodeUrl(null);
    setMfaCode('');
    setVerifyOpen(false);
  };

  const getPasswordStrength = (password) => {
    if (password.length < 8) return 0;
    let strength = 0;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const displayName = ({ children, label }) => (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-gray-900">{children}</p>
    </div>
  );

  const recentProfileFields = [
    { category: 'Security', field: 'Password', action: 'Changed', date: '2026-05-15', actor: 'HOD' },
    { category: 'Profile',  field: 'Name',    action: 'Updated', date: '2026-05-10', actor: 'HOD' },
    { category: 'Notifications', field: 'Grading Alerts', action: 'Enabled', date: '2026-05-01', actor: 'System' },
    { category: 'Security', field: 'MFA',     action: 'Disabled', date: '2026-04-20', actor: 'HOD' },
    { category: 'Department', field: 'Department', action: 'Created', date: '2026-01-15', actor: 'Registry' },
  ];

  const filteredProfileChanges = filterRecency === 'all'
    ? recentProfileFields
    : recentProfileFields.filter(change => {
        const diffDays = Math.floor((Date.now() - new Date(change.date).getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= (filterRecency === 'recent' ? 7 : 30);
      });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">HOD Settings</h1>
              <p className="text-sm text-gray-500 mt-1">Manage your profile, security, notifications, and department preferences</p>
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
              {saved ? 'Saved' : saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <SettingsSection icon={Shield} title="Personal Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayName(settings.name || 'Head of Department')}
                  {displayName(settings.email || 'hod@maais.edu.gh')}
                </div>
              </SettingsSection>
              <SettingsSection icon={SettingsIcon} title="Recent Profile Changes">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Filter by:</span>
                  {['all', '30', 'recent'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setFilterRecency(v)}
                      className={cn(
                        "text-[10px] font-medium px-2.5 py-1 rounded-lg transition-all",
                        filterRecency === v ? "bg-emerald-50 text-emerald-700" : "text-gray-500 hover:bg-gray-100"
                      )}
                    >
                      {v === 'all' ? 'All Time' : v === 'recent' ? 'Last 7 Days' : 'Last 30 Days'}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  {filteredProfileChanges.length === 0 ? (
                    <EmptyState icon={SettingsIcon} title="No changes" description="No profile changes match your filter." />
                  ) : filteredProfileChanges.map((change, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50/80 transition-colors border border-transparent">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-bold">
                          {(change.action || 'X').charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{change.category}: {change.field}</p>
                          <p className="text-[10px] text-gray-500">by {change.actor}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-medium text-gray-600">{change.action}</p>
                        <p className="text-[9px] text-gray-400">{change.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SettingsSection>
            </motion.div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* MFA Enrollment Flow */}
              <SettingsSection icon={Smartphone} title="Multi-Factor Authentication (MFA)">
                {!mfaEnabled && !qrCodeUrl && (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Protect your account with Time-Based One-Time Password (TOTP) authentication.
                      Scan a QR code with your authenticator app once enrolled.
                    </p>
                    <button
                      onClick={handleMFAEnroll}
                      disabled={enrolling}
                      className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      {enrolling ? <LoadingSpinner size="sm" /> : <QrCode size={16} />}
                      {enrolling ? 'Generating QR Code…' : 'Enroll MFA'}
                    </button>
                  </div>
                )}
                {qrCodeUrl && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="shrink-0">
                        <img src={qrCodeUrl} alt="MFA QR Code" className="w-40 h-40 rounded-xl border border-gray-200 bg-white" />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Secret Key</p>
                          <p className="text-sm font-mono font-bold text-gray-900 mt-0.5">JBSWY3DPEHPK3PXP</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Enter TOTP Code</p>
                          <div className="flex gap-2">
                            {[...Array(6)].map((_, i) => (
                              <input
                                key={i}
                                type="text"
                                maxLength={1}
                                value={mfaCode[i] || ''}
                                onChange={(e) => {
                                  const v = e.target.value.replace(/\D/g, '');
                                  setMfaCode(mfaCode.substring(0, i) + v + mfaCode.substring(i + 8));
                                }}
                                className="w-9 h-10 text-center text-sm font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                              />
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={handleMFAVerify}
                          disabled={mfaCode.length !== 6}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Verify &amp; Enable
                        </button>
                        <button
                          onClick={() => { setQrCodeUrl(null); setMfaCode(''); }}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {mfaEnabled && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200/60 rounded-2xl">
                    <CheckCircle size={20} className="text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">MFA Enabled</p>
                      <p className="text-xs text-emerald-700 mt-0.5">TOTP authentication is active on this account.</p>
                    </div>
                  </div>
                )}
              </SettingsSection>

              {/* Password */}
              <SettingsSection icon={Lock} title="Password">
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="Current password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  {passwordForm.new && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Password Strength</p>
                      <div className="flex gap-1.5">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "flex-1 h-1.5 rounded-full transition-all",
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
                    className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all"
                  >
                    Update Password
                  </button>
                </div>
              </SettingsSection>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <motion.div key="notifications" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <SettingsSection icon={Bell} title="Grading & Certification">
                <Toggle
                  label="Grading Alerts"
                  description="Receive alerts when teachers submit grades"
                  checked={settings.notifications?.grading ?? true}
                  onChange={(val) => setSettings({ ...settings, notifications: { ...settings.notifications, grading: val } })}
                />
                <Toggle
                  label="Certification Alerts"
                  description="Get alerted about certification / WAEC export deadlines"
                  checked={settings.notifications?.certification ?? true}
                  onChange={(val) => setSettings({ ...settings, notifications: { ...settings.notifications, certification: val } })}
                />
              </SettingsSection>
              <SettingsSection icon={Bell} title="Security & Actions">
                <Toggle
                  label="Security Alerts"
                  description="Alerts for lock/unlock and impersonation events"
                  checked={settings.notifications?.security ?? true}
                  onChange={(val) => setSettings({ ...settings, notifications: { ...settings.notifications, security: val } })}
                />
                <Toggle
                  label="Teacher Comment Notifications"
                  description="Notify when teachers respond to HOD feedback"
                  checked={settings.notifications?.commentReply ?? true}
                  onChange={(val) => setSettings({ ...settings, notifications: { ...settings.notifications, commentReply: val } })}
                />
              </SettingsSection>
              <SettingsSection icon={Bell} title="Contact Channels">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 py-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactChannels.email}
                      onChange={(e) => setContactChannels({ ...contactChannels, email: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <Mail size={14} className="text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-[10px] text-gray-500">{settings.email || 'hod@maais.edu.gh'}</p>
                    </div>
                    <StatusBadge status={contactChannels.email ? 'LOCKED' : 'DRAFT'} />
                  </label>
                  <label className="flex items-center gap-3 py-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactChannels.sms}
                      onChange={(e) => setContactChannels({ ...contactChannels, sms: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <PhoneIcon size={14} className="text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">SMS</p>
                      <p className="text-[10px] text-gray-500">{settings.phone || '+233 XX XXX XXXX'}</p>
                    </div>
                    <StatusBadge status={contactChannels.sms ? 'LOCKED' : 'DRAFT'} />
                  </label>
                  <label className="flex items-center gap-3 py-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={contactChannels.whatsapp}
                      onChange={(e) => setContactChannels({ ...contactChannels, whatsapp: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <Globe size={14} className="text-gray-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                      <p className="text-[10px] text-gray-500">WhatsApp Business</p>
                    </div>
                    <StatusBadge status={contactChannels.whatsapp ? 'LOCKED' : 'DRAFT'} />
                  </label>
                </div>
              </SettingsSection>
            </motion.div>
          )}

          {/* Department Tab */}
          {activeTab === 'department' && (
            <motion.div key="department" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <SettingsSection icon={Users} title="Department Overview">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {displayName(settings.departmentName || 'Agriculture')}
                  {displayName(`${settings.teacherCount ?? 12} Teachers`)}
                  {displayName(`${settings.studentCount ?? 245} Students`)}
                </div>
              </SettingsSection>
              <SettingsSection icon={SettingsIcon} title="Department Actions">
                <ActionButtonGroup
                  actions={[
                    { label: 'Export Department Data', variant: 'secondary', icon: Save, onClick: () => {} },
                    { label: 'Send Bulk Notification', variant: 'secondary', icon: Mail, onClick: () => {} },
                  ]}
                />
              </SettingsSection>
            </motion.div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <motion.div key="sessions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <SettingsSection icon={Clock} title="Active Sessions">
                <div className="space-y-2">
                  {activeSessions.length > 0 ? (
                    activeSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            {session.userAgent?.includes('Mobile') || session.userAgent?.includes('iPhone') ? (
                              <PhoneIcon size={14} />
                            ) : (
                              <Monitor size={14} />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900">{session.device || session.userAgent || 'Unknown Device'}</p>
                            <p className="text-[10px] text-gray-500">{session.ip || 'Unknown IP'} · Last active: {session.lastActive || session.createdAt || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.current && <StatusBadge status="LOCKED" />}
                          {!session.current && (
                            <button
                              onClick={() => {/* TODO: revoke session API */}}
                              className="px-3 py-1.5 text-[10px] font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-all flex items-center gap-1"
                            >
                              <Trash2 size={11} /> Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState icon={Clock} title="No active sessions" description="No other sessions are currently active." />
                  )}
                </div>
              </SettingsSection>
              <SettingsSection icon={Clock} title="Session Timeout">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 shrink-0">Auto-logout after inactivity:</span>
                  <select
                    value={settings.sessionTimeout || 15}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={0}>Never</option>
                  </select>
                </div>
              </SettingsSection>
            </motion.div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        open={verifyOpen}
        title="Confirm MFA Code"
        message="Enter the 6-digit code from your authenticator app to verify MFA enrollment."
        onConfirm={handleMFAVerify}
        onCancel={() => { setVerifyOpen(false); setQrCodeUrl(null); setMfaCode(''); }}
        confirmLabel="Verify"
        variant="primary"
      />
    </div>
  );
}
