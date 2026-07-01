import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Key, Users, Clock, Bell, Settings as SettingsIcon,
  Save, RefreshCw, CheckCircle, AlertCircle, Smartphone,
  QrCode, Monitor, PhoneIcon, Globe, User, Mail, Lock, Trash2,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { useBreadcrumb } from '../../context/BreadcrumbContext';
import { 
  ConfirmationDialog, LoadingSpinner, EmptyState, StatusBadge,
  ActionButtonGroup, HODCommentInput
} from '../../components/molecules';

const TABS = [
  { id: 'profile',        label: 'Profile',       icon: User },
  { id: 'security',       label: 'Security',      icon: Shield },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'department',     label: 'Department',    icon: Users },
  { id: 'sessions',       label: 'Sessions',      icon: Clock },
];

const SettingsSection = React.memo(({ icon: Icon, title, children, className }) => (
  <div className={cn("bg-white rounded-2xl border border-gray-100 p-6 shadow-xs", className)}>
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
        <Icon size={20} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </div>
));
SettingsSection.displayName = 'SettingsSection';

const Toggle = React.memo(({ checked, onChange, label, description }) => (
  <label className="flex items-center justify-between py-3.5 cursor-pointer border-b border-gray-50 last:border-0 select-none">
    <div className="pr-4">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      {description && <p className="text-xs text-gray-400 mt-0.5 leading-normal">{description}</p>}
    </div>
    <div className="relative shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <div className={cn(
        "w-10 h-5 rounded-full transition-all duration-200",
        checked ? "bg-emerald-600" : "bg-gray-200"
      )}>
        <div className={cn(
          "w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 absolute top-0.5",
          checked ? "left-5" : "left-0.5"
        )} />
      </div>
    </div>
  </label>
));
Toggle.displayName = 'Toggle';

// Fixed DisplayName block utility component declaration
const ProfileField = React.memo(({ label, value }) => (
  <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-medium text-gray-900 mt-1">{value}</p>
  </div>
));
ProfileField.displayName = 'ProfileField';

export function HODSettingsPage() {
  const {
    hodSettings, saveSettings, changePassword, activeSessions = [],
    refreshSettings, refreshActiveSessions,
    mfaEnroll, mfaVerify, revokeSession,
    isLoading,
  } = useHOD();
  const { setBreadcrumb } = useBreadcrumb();

  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [mfaCode, setMfaCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  
  const [contactChannels, setContactChannels] = useState({
    email: true, sms: false, whatsapp: false,
  });
  
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [filterRecency, setFilterRecency] = useState('all');

  const mfaInputRef = useRef(null);

  // Sync internal layout state safely when core server payload matches
  useEffect(() => {
    if (hodSettings && Object.keys(hodSettings).length > 0) {
      setSettings(hodSettings);
      if (hodSettings.contactChannels) {
        setContactChannels(hodSettings.contactChannels);
      }
      if (hodSettings.mfaEnabled !== undefined) {
        setMfaEnabled(hodSettings.mfaEnabled);
      }
    }
  }, [hodSettings]);

  // Handle baseline initial ingestion loops safely
  useEffect(() => {
    if (typeof refreshSettings === 'function') refreshSettings();
    if (typeof refreshActiveSessions === 'function') refreshActiveSessions();
  }, []);

  useEffect(() => {
    const tabLabel = TABS.find(t => t.id === activeTab)?.label || activeTab;
    setBreadcrumb([{ label: 'Settings', path: '/hod/settings' }, { label: tabLabel, path: null }]);
  }, [activeTab, setBreadcrumb]);

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      if (typeof saveSettings === 'function') {
        const structuralPayload = {
          ...settings,
          contactChannels,
          mfaEnabled
        };
        await saveSettings(structuralPayload);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      setErrorMsg(err?.message || "Failed to sync platform configurations.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.new !== passwordForm.confirm || passwordForm.new.length < 8) return;
    setErrorMsg(null);
    try {
      if (typeof changePassword === 'function') {
        await changePassword(passwordForm.current, passwordForm.new);
        setPasswordForm({ current: '', new: '', confirm: '' });
        alert("Security string changed successfully!");
      }
    } catch (err) {
      setErrorMsg(err?.message || "Verification of password authorization chain rejected.");
    }
  };

  const handleMFAEnroll = async () => {
    setEnrolling(true);
    setErrorMsg(null);
    try {
      if (typeof mfaEnroll === 'function') {
        const result = await mfaEnroll();
        setQrCodeUrl(result?.qrCode || null);
        setVerifyOpen(true);
      }
    } catch (err) {
      setErrorMsg(err?.message || "Error building security keys.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleMFAVerify = async () => {
    if (mfaCode.length !== 6) return;
    setErrorMsg(null);
    try {
      if (typeof mfaVerify === 'function') {
        await mfaVerify(mfaCode);
        setMfaEnabled(true);
        setQrCodeUrl(null);
        setMfaCode('');
        setVerifyOpen(false);
      }
    } catch (err) {
      setErrorMsg(err?.message || "Invalid OTP sequence.");
    }
  };

  const handleRevoke = async (sessionId) => {
    if (typeof revokeSession === 'function') {
      try {
        await revokeSession(sessionId);
        if (typeof refreshActiveSessions === 'function') refreshActiveSessions();
      } catch (err) {
        setErrorMsg(err?.message || "Failed terminal revocation process.");
      }
    }
  };

  const getPasswordStrength = (password) => {
    if (!password || password.length < 8) return 0;
    let strength = 0;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const recentProfileFields = [
    { category: 'Security', field: 'Password', action: 'Changed', date: '2026-05-15', actor: 'HOD' },
    { category: 'Profile',  field: 'Name',     action: 'Updated', date: '2026-05-10', actor: 'HOD' },
    { category: 'Notifications', field: 'Grading Alerts', action: 'Enabled', date: '2026-05-01', actor: 'System' },
    { category: 'Security', field: 'MFA',      action: 'Disabled', date: '2026-04-20', actor: 'HOD' },
    { category: 'Department', field: 'Department', action: 'Created', date: '2026-01-15', actor: 'Registry' },
  ];

  const filteredProfileChanges = recentProfileFields.filter(change => {
    if (filterRecency === 'all') return true;
    const diffDays = Math.floor((Date.now() - new Date(change.date).getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= (filterRecency === 'recent' ? 7 : 30);
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/30">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-5">

          {/* Header Dashboard Level Row */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">HOD Settings</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage your profile, security levels, notifications, and core department metrics</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || isLoading}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all cursor-pointer shadow-xs",
                saved ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
              )}
            >
              {saved ? <CheckCircle size={16} /> : <Save size={16} />}
              {saved ? 'Changes Saved' : saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Inline Notification Banner Layer */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="p-4 bg-rose-50 border border-rose-100 text-rose-900 text-xs font-medium rounded-xl flex items-center gap-2.5"
              >
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <p>{errorMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Navigation Hub */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                    activeTab === tab.id ? "bg-emerald-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Core App View Tabs Wrapper Context */}
          <div className="min-h-0">
            {/* Profile Tab View */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <SettingsSection icon={User} title="Personal Information">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ProfileField label="Authorized Identity Name" value={settings.name || 'Head of Department'} />
                    <ProfileField label="Secure Routing Email" value={settings.email || 'hod@maais.edu.gh'} />
                  </div>
                </SettingsSection>

                <SettingsSection icon={SettingsIcon} title="Recent Operational Trails">
                  <div className="flex items-center gap-1.5 mb-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Filter Block:</span>
                    {['all', '30', 'recent'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setFilterRecency(v)}
                        className={cn(
                          "text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                          filterRecency === v ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" : "text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        {v === 'all' ? 'All History' : v === 'recent' ? 'Last 7 Days' : 'Last 30 Days'}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {filteredProfileChanges.length === 0 ? (
                      <EmptyState icon={SettingsIcon} title="No modifications logged" description="No structural profile adjustments matched your filter context." />
                    ) : filteredProfileChanges.map((change, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50/40 border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-bold">
                            {(change.action || 'X').charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900">{change.category}: {change.field}</p>
                            <p className="text-[10px] text-gray-400">Modified by {change.actor}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-gray-700">{change.action}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{change.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </SettingsSection>
              </motion.div>
            )}

            {/* Security Tab View */}
            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <SettingsSection icon={Smartphone} title="Two-Factor Infrastructure (TOTP)">
                  {!mfaEnabled && !qrCodeUrl && (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Secure your system routing privileges by activating Time-Based One-Time Password (TOTP) protocols.
                      </p>
                      <button
                        onClick={handleMFAEnroll}
                        disabled={enrolling}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {enrolling ? <LoadingSpinner size="sm" /> : <QrCode size={14} />}
                        {enrolling ? 'Provisioning Device Token...' : 'Enroll Authenticator App'}
                      </button>
                    </div>
                  )}

                  {qrCodeUrl && (
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row items-center gap-5">
                        <div className="p-2 bg-white border border-gray-200 rounded-xl shrink-0">
                          <img src={qrCodeUrl} alt="MFA Token Integration Graph" className="w-36 h-36" />
                        </div>
                        <div className="space-y-3 flex-1 w-full">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Manual Entry Sequence</p>
                            <p className="text-xs font-mono font-bold bg-white px-2.5 py-1.5 border border-gray-100 rounded-lg text-gray-800 mt-1 select-all inline-block">JBSWY3DPEHPK3PXP</p>
                          </div>
                          
                          {/* Secure Box Input Matrix Handling */}
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Verification Hash String</label>
                            <div className="relative w-full max-w-[240px]">
                              <input
                                ref={mfaInputRef}
                                type="text"
                                maxLength={6}
                                value={mfaCode}
                                placeholder="000000"
                                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                                className="w-full tracking-[0.5em] font-mono text-center font-bold px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-200/50">
                        <button
                          onClick={handleMFAVerify}
                          disabled={mfaCode.length !== 6}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-40 cursor-pointer"
                        >
                          Confirm & Authorize
                        </button>
                        <button
                          onClick={() => { setQrCodeUrl(null); setMfaCode(''); }}
                          className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {mfaEnabled && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                      <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-emerald-900">MFA Validation Active</p>
                        <p className="text-[11px] text-emerald-700 mt-0.5">Biometric or software keys are mandatory during profile token generation events.</p>
                      </div>
                    </div>
                  )}
                </SettingsSection>

                <SettingsSection icon={Lock} title="Credential Restructure">
                  <div className="space-y-3.5 max-w-md">
                    <input
                      type="password"
                      placeholder="Current administrative credential"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                    />
                    <input
                      type="password"
                      placeholder="New credential target hash"
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                    />
                    <input
                      type="password"
                      placeholder="Confirm matching structural string"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                    />
                    
                    {passwordForm.new && (
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Entropy Complexity Score</p>
                        <div className="flex gap-1">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "flex-1 h-1 rounded-full transition-colors duration-200",
                                i < getPasswordStrength(passwordForm.new) ? "bg-emerald-500" : "bg-gray-200"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={handlePasswordChange}
                      disabled={!passwordForm.current || !passwordForm.new || passwordForm.new !== passwordForm.confirm || passwordForm.new.length < 8}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-40 transition-all cursor-pointer"
                    >
                      Update Security Lock Key
                    </button>
                  </div>
                </SettingsSection>
              </motion.div>
            )}

            {/* Notifications Tab View */}
            {activeTab === 'notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <SettingsSection icon={Bell} title="Academic Workflow & Registry Events">
                  <div className="divide-y divide-gray-50">
                    <Toggle
                      label="Faculty Grading Alerts"
                      description="Receive real-time notifications when academic staffs finalize and submit term course marks."
                      checked={settings.notifications?.grading ?? true}
                      onChange={(val) => setSettings({ ...settings, notifications: { ...settings.notifications, grading: val } })}
                    />
                    <Toggle
                      label="National Assessment / Certification Alerts"
                      description="Triggers system warnings nearing national verification or software export target criteria thresholds."
                      checked={settings.notifications?.certification ?? true}
                      onChange={(val) => setSettings({ ...settings, notifications: { ...settings.notifications, certification: val } })}
                    />
                  </div>
                </SettingsSection>
                
                <SettingsSection icon={Shield} title="Auditing & Communication Interrupts">
                  <div className="divide-y divide-gray-50">
                    <Toggle
                      label="Security Exception Hooks"
                      description="Forwards alert notifications during account lockouts, API profile shifts, or structural parameter reads."
                      checked={settings.notifications?.security ?? true}
                      onChange={(val) => setSettings({ ...settings, notifications: { ...settings.notifications, security: val } })}
                    />
                    <Toggle
                      label="Staff Appraisal Comment Loops"
                      description="Receive immediate system notification updates when a teacher files an evaluation response."
                      checked={settings.notifications?.commentReply ?? true}
                      onChange={(val) => setSettings({ ...settings, notifications: { ...settings.notifications, commentReply: val } })}
                    />
                  </div>
                </SettingsSection>

                <SettingsSection icon={Globe} title="Contact Access Routing Triggers">
                  <div className="space-y-4 pt-1">
                    {[
                      { id: 'email', label: 'Email Server Access', icon: Mail, value: settings.email || 'hod@maais.edu.gh' },
                      { id: 'sms', label: 'SMS Carrier Pipeline', icon: PhoneIcon, value: settings.phone || '+233 XX XXX XXXX' },
                      { id: 'whatsapp', label: 'WhatsApp Secure Portal', icon: Globe, value: 'WhatsApp Business API Channel' }
                    ].map((channel) => {
                      const ChannelIcon = channel.icon;
                      return (
                        <div key={channel.id} className="flex items-center justify-between p-3 bg-gray-50/50 border border-gray-100 rounded-xl">
                          <div className="flex items-center gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={contactChannels[channel.id]}
                              onChange={(e) => setContactChannels({ ...contactChannels, [channel.id]: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                            />
                            <div className="p-1.5 bg-white border border-gray-200/60 rounded-lg text-gray-400 shrink-0">
                              <ChannelIcon size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">{channel.label}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">{channel.value}</p>
                            </div>
                          </div>
                          <StatusBadge status={contactChannels[channel.id] ? 'LOCKED' : 'DRAFT'} />
                        </div>
                      );
                    })}
                  </div>
                </SettingsSection>
              </motion.div>
            )}

            {/* Department Tab View */}
            {activeTab === 'department' && (
              <motion.div key="department" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <SettingsSection icon={Users} title="Structural Unit Metrics">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ProfileField label="Department Allocation Tag" value={settings.departmentName || 'Agriculture Engineering'} />
                    <ProfileField label="Active Academic Staff" value={`${settings.teacherCount ?? 12} Registered Lecturers`} />
                    <ProfileField label="Student Ingestion Matrix" value={`${settings.studentCount ?? 245} Enrolled Candidates`} />
                  </div>
                </SettingsSection>
                <SettingsSection icon={SettingsIcon} title="Administrative Tasks Data Export">
                  <ActionButtonGroup
                    actions={[
                      { label: 'Export Structural CSV Data', variant: 'secondary', icon: Save, onClick: () => {} },
                      { label: 'Dispatch Global Group Notice', variant: 'secondary', icon: Mail, onClick: () => {} },
                    ]}
                  />
                </SettingsSection>
              </motion.div>
            )}

            {/* Sessions Tab View */}
            {activeTab === 'sessions' && (
              <motion.div key="sessions" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <SettingsSection icon={Clock} title="Active Access Tokens">
                  <div className="space-y-2">
                    {activeSessions.length > 0 ? (
                      activeSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-50/80 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                              {session.userAgent?.includes('Mobile') || session.userAgent?.includes('iPhone') ? (
                                <PhoneIcon size={14} />
                              ) : (
                                <Monitor size={14} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">{session.device || session.userAgent || 'Remote Access Node'}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">
                                {session.ip || '0.0.0.0'} · Heartbeat: {session.lastActive || session.createdAt || 'Instant'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            {session.current ? (
                              <StatusBadge status="LOCKED" />
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRevoke(session.id)}
                                className="px-3 py-1.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 size={11} /> Evacuate Session
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState icon={Clock} title="No extra access tokens found" description="No secondary operational footprints are attached to this specific user signature." />
                    )}
                  </div>
                </SettingsSection>
                <SettingsSection icon={Clock} title="Session Lifecycle Parameters">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <span className="text-xs font-medium text-gray-500 shrink-0">Force Account Logout Sequence after Inactivity:</span>
                    <select
                      value={settings.sessionTimeout ?? 15}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value, 10) })}
                      className="flex-1 max-w-xs px-3 py-2 text-xs border border-gray-200 rounded-xl bg-white text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                    >
                      <option value={15}>15 minutes (Hardened Target Profile)</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={0}>Persistent Validation Override (Unsafe)</option>
                    </select>
                  </div>
                </SettingsSection>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={verifyOpen}
        title="Authorize 2FA Profile Token Mapping"
        message="Please provide the generation string shown inside your phone authenticator application to pair security states safely."
        onConfirm={handleMFAVerify}
        onCancel={() => { setVerifyOpen(false); setQrCodeUrl(null); setMfaCode(''); }}
        confirmLabel="Activate Key Pair"
        variant="primary"
      />
    </div>
  );
}