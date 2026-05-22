import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  User,
  Shield,
  Lock,
  Bell,
  CheckCircle2,
  Fingerprint,
  Eye,
  EyeOff,
  Building2,
  ClipboardCheck,
  History,
  Key,
  Save,
  RotateCcw,
  ChevronDown,
  Database,
  Clock,
  Smartphone,
  Monitor,
  LogOut,
  AlertCircle,
  CheckCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { useHOD } from '../../context/HODContext';

// ── Toast helper ──────────────────────────────────────────────────────────────
function useToast(timeout = 3500) {
  const [toast, setToast] = useState(null);

  const show = useCallback(
    (msg, type = 'success') => {
      setToast({ msg, type, id: Date.now() });
      setTimeout(() => setToast(null), timeout);
    },
    [timeout],
  );

  return { toast, showToast: show };
}

// ── Password strength meter ───────────────────────────────────────────────────
function strength(pass) {
  if (!pass) return 0;
  let s = 0;
  if (pass.length >= 10) s++;
  if (/[A-Z]/.test(pass)) s++;
  if (/[0-9]/.test(pass)) s++;
  if (/[^A-Za-z0-9]/.test(pass)) s++;
  return s;
}

// ── Confirm modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <AlertCircle size={20} className="text-amber-600" />
          </div>
          <h3 className="text-base font-black text-gray-900 italic font-display">{title}</h3>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest bg-emerald-900 text-white hover:bg-emerald-950 transition-all shadow-lg shadow-emerald-900/20"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Toast banner ──────────────────────────────────────────────────────────────
function ToastBanner({ toast }) {
  if (!toast) return null;
  const isOk = toast.type === 'success';
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className={cn(
        'fixed top-4 right-4 z-[60] px-5 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2',
        isOk
          ? 'bg-emerald-900 text-white shadow-emerald-900/20'
          : 'bg-red-600 text-white shadow-red-600/20',
      )}
    >
      {isOk ? <CheckCheck size={14} /> : <AlertCircle size={14} />}
      {toast.msg}
    </motion.div>
  );
}

// ── Toggle pill ───────────────────────────────────────────────────────────────
function Toggle({ enabled, onToggle, label }) {
  return (
    <button
      onClick={onToggle}
      className={cn('w-11 h-6 rounded-full relative p-1 transition-all shrink-0', enabled ? 'bg-emerald-600' : 'bg-gray-200')}
      aria-label={label}
    >
      <motion.div animate={{ x: enabled ? 20 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
    </button>
  );
}

// ── Select control ────────────────────────────────────────────────────────────
function Select({ value, onChange, options, full }) {
  return (
    <div className={cn('relative', full && 'w-full')}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-gray-50 border border-gray-100 rounded-2xl text-[12px] font-black text-gray-900 px-4 py-3 pr-9 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-gray-900">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

const FREQUENCY_OPTIONS = [
  { value: 'realtime', label: 'Real-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

const SESSION_TIMEOUT_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 0, label: 'Never' },
];

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
      <Icon size={18} className="text-emerald-900" />
      <div>
        <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">{title}</h2>
        {subtitle && <p className="text-[9px] font-medium text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </header>
  );
}

export function HODSettings() {
  const { toast, showToast } = useToast();
  const { user } = useRole();

  // ── Context ───────────────────────────────────────────────────────────────
  const {
    isLoading,
    hodSettings,
    saveSettings,
    changePassword,
    refreshSettings,
    activeSessions,
    refreshActiveSessions,
    revokeSession,
    mfaEnroll,
    mfaVerify,
  } = useHOD();

  // ── Derived from settings payload (from API or defaults) ───────────────────
  const settings = hodSettings ?? {};

  const auditFrequency = settings.auditFrequency ?? 'daily';
  const mfaEnabled = settings.mfa_enabled ?? true;
  const notifications = settings.notifications ?? {
    grading: true,
    certification: true,
    security: true,
  };
  const sessionTimeout = settings.sessionTimeout ?? 30;
  const requireMfa = settings.require_mfa ?? mfaEnabled;

  const permissions = settings.permissions ?? {
    viewAuditLogs: true,
    exportReports: true,
    manageTeachers: false,
    lockMatrix: true,
    viewRecordHistory: true,
    resetTeacherPassword: false,
    overrideRecord: false,
  };

  const departmentConfig = settings.departmentConfig ?? {
    autoAlertThreshold: 60,
    autoResolveDays: 30,
    requireCommentOnOverride: true,
    maxRevisionsPerStudent: 3,
    cooldownMinutes: 30,
  };

  const passwordPolicy = settings.passwordPolicy ?? {
    minLength: 10,
    requireUppercase: true,
    requireNumber: true,
    requireSpecial: true,
    expiryDays: 90,
    preventReuseCount: 5,
  };

  // ── Local editable state ───────────────────────────────────────────────────
  const [editAuditFreq, setEditAuditFreq] = useState(auditFrequency);
  const [editMfa, setEditMfa] = useState(mfaEnabled);
  const [editRequireMfa, setEditRequireMfa] = useState(requireMfa);
  const [editNotifications, setEditNotifications] = useState(notifications);
  const [editTimeout, setTimeoutEdit] = useState(sessionTimeout);
  const [editPermissions, setEditPermissions] = useState(permissions);
  const [editDeptConfig, setEditDeptConfig] = useState(departmentConfig);
  const [editPasswordPolicy, setEditPasswordPolicy] = useState(passwordPolicy);

  // ── Password change ────────────────────────────────────────────────────────
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // ── Save handlers ──────────────────────────────────────────────────────────
  const handleSaveSettings = useCallback(async () => {
    setIsSavingSettings(true);
    try {
      await saveSettings({
        auditFrequency: editAuditFreq,
        mfa_enabled: editMfa,
        require_mfa: editRequireMfa,
        notifications: editNotifications,
        sessionTimeout: editTimeout,
        permissions: editPermissions,
        departmentConfig: editDeptConfig,
        passwordPolicy: editPasswordPolicy,
      });
      showToast('Settings saved successfully');
    } catch (e) {
      showToast(e.message || 'Failed to save settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  }, [
    editAuditFreq,
    editMfa,
    editRequireMfa,
    editNotifications,
    editTimeout,
    editPermissions,
    editDeptConfig,
    editPasswordPolicy,
    saveSettings,
    showToast,
  ]);

  const handleChangePassword = useCallback(async () => {
    if (!currentPw || !newPw) { setPwError('Fill both fields'); return; }
    if (newPw.length < (editPasswordPolicy.minLength ?? 10)) {
      setPwError(`Password must be at least ${editPasswordPolicy.minLength ?? 10} characters`); return;
    }
    if (editPasswordPolicy.requireUppercase && !/[A-Z]/.test(newPw)) {
      setPwError('Password requires at least one uppercase letter'); return;
    }
    if (editPasswordPolicy.requireNumber && !/[0-9]/.test(newPw)) {
      setPwError('Password requires at least one digit'); return;
    }
    if (editPasswordPolicy.requireSpecial && !/[^A-Za-z0-9]/.test(newPw)) {
      setPwError('Password requires at least one special character'); return;
    }
    try {
      await changePassword(currentPw, newPw);
      setCurrentPw('');
      setNewPw('');
      setPwError('');
      showToast('Password updated successfully');
    } catch (e) {
      setPwError(e.message || 'Password change failed');
    }
  }, [currentPw, newPw, editPasswordPolicy, changePassword, showToast]);

  const permLabel = {
    viewAuditLogs: 'View Audit Logs',
    exportReports: 'Export Reports',
    manageTeachers: 'Manage Teachers',
    lockMatrix: 'Lock / Unlock Matrix',
    viewRecordHistory: 'View Record History',
    resetTeacherPassword: 'Reset Teacher Password',
    overrideRecord: 'Override Student Record',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 lg:p-12 pb-32 lg:pb-24">
      {toast && <ToastBanner toast={toast} />}

      <div className="max-w-4xl mx-auto">
        {/* ── Page header ─────────────────────────────────────────────────── */}
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/10">
              <Settings size={28} />
            </div>
            <div className="flex-1">
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display">
                Command Settings
              </h1>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1">
                Role · Permissions · Audit Protocol · Security Profile
              </p>
            </div>
            <button
              onClick={() => {
                setEditAuditFreq(settings.auditFrequency ?? 'daily');
                setEditMfa(settings.mfa_enabled ?? true);
                setEditRequireMfa(settings.require_mfa ?? settings.mfa_enabled ?? true);
                setEditNotifications(settings.notifications ?? { grading: true, certification: true, security: true });
                setTimeoutEdit(settings.sessionTimeout ?? 30);
                setEditPermissions(settings.permissions ?? { viewAuditLogs: true, exportReports: true, manageTeachers: false, lockMatrix: true, viewRecordHistory: true, resetTeacherPassword: false, overrideRecord: false });
                setEditDeptConfig(settings.departmentConfig ?? { autoAlertThreshold: 60, autoResolveDays: 30, requireCommentOnOverride: true, maxRevisionsPerStudent: 3, cooldownMinutes: 30 });
                setEditPasswordPolicy(settings.passwordPolicy ?? { minLength: 10, requireUppercase: true, requireNumber: true, requireSpecial: true, expiryDays: 90, preventReuseCount: 5 });
                setCurrentPw('');
                setNewPw('');
                setPwError('');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </header>

        <div className="grid gap-12">
          {/* ── §1 Executive Identity (read-only, user context) ──────────────── */}
          <section className="space-y-6">
            <SectionHeader
              icon={User}
              title="Executive Identity"
              subtitle="Authenticated role profile — read-only"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Staff Name', content: user?.name, mono: false },
                { label: 'Manager ID', content: (user?.id ?? 'MAAIS-HOD').toUpperCase(), mono: true },
                { label: 'Primary Department', content: settings.departmentName ?? 'Science Department', icon: Building2 },
                { label: 'Authority Tier', content: 'Senior Management (HOD)', icon: Shield, accent: true },
              ].map((row) => (
                <div key={row.label} className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">{row.label}</label>
                  <div
                    className={cn(
                      'px-5 py-4 bg-white border border-gray-100 rounded-2xl text-[14px] font-black shadow-sm flex items-center gap-2.5',
                      row.accent ? 'text-emerald-900 bg-emerald-50/20 border-emerald-100/50 italic font-display' : 'text-gray-900',
                      row.mono ? 'font-mono tracking-tighter' : '',
                    )}
                  >
                    {row.icon && (
                      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center', row.accent ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 text-gray-500')}>
                        <row.icon size={16} />
                      </div>
                    )}
                    {row.content || '—'}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── §2 Role & Permissions ──────────────────────────────────────── */}
          <section className="space-y-6">
            <SectionHeader
              icon={Lock}
              title="Role-Based Permissions"
              subtitle="Capability matrix for this HOD account"
            />
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
              {Object.entries(permLabel).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between p-3.5 hover:bg-gray-50/50 rounded-2xl transition-all">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', editPermissions[key] ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400')}>
                      {editPermissions[key] ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    </div>
                    <span className="text-[12px] font-black text-gray-800">{label}</span>
                  </div>
                  <Toggle
                    enabled={editPermissions[key]}
                    onToggle={() => setEditPermissions((p) => ({ ...p, [key]: !p[key] }))}
                    label={label}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ── §3 Audit & Oversight Config ────────────────────────────────── */}
          <section className="space-y-6">
            <SectionHeader
              icon={ClipboardCheck}
              title="Audit &amp; Oversight Config"
              subtitle="Revision frequency and logging protocols"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Frequency */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <History size={16} className="text-gray-400" />
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Revision Frequency</h3>
                </div>
                <div className="flex gap-2">
                  {FREQUENCY_OPTIONS.map((freq) => (
                    <button
                      key={freq.value}
                      onClick={() => setEditAuditFreq(freq.value)}
                      className={cn(
                        'flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                        editAuditFreq === freq.value
                          ? 'bg-emerald-900 text-white shadow-xl shadow-emerald-900/20'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100',
                      )}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* MFA toggle */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700">
                    <Fingerprint size={22} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-black text-gray-900 italic font-display">Biometric Lock</h3>
                    <p className="text-[9px] font-medium text-gray-500 uppercase tracking-widest">Grading approval MFA</p>
                  </div>
                </div>
                <Toggle
                  enabled={editMfa}
                  onToggle={() => setEditMfa((v) => !v)}
                  label="Biometric Lock"
                />
              </div>
            </div>
          </section>

          {/* ── §4 Department Config ────────────────────────────────────────── */}
          <section className="space-y-6">
            <SectionHeader
              icon={Building2}
              title="Department-Specific Configurations"
              subtitle="Alert thresholds and operational controls"
            />
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    label: 'Auto-Alert Threshold (%)',
                    key: 'autoAlertThreshold',
                    type: 'number',
                    min: 0,
                    max: 100,
                  },
                  {
                    label: 'Auto-Resolve After (days)',
                    key: 'autoResolveDays',
                    type: 'number',
                    min: 1,
                    max: 365,
                  },
                  {
                    label: 'Max Revisions / Student',
                    key: 'maxRevisionsPerStudent',
                    type: 'number',
                    min: 1,
                    max: 99,
                  },
                  {
                    label: 'Override Cooldown (min)',
                    key: 'cooldownMinutes',
                    type: 'number',
                    min: 5,
                    max: 1440,
                  },
                ].map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">
                      {field.label}
                    </label>
                    <input
                      type="number"
                      min={field.min}
                      max={field.max}
                      value={editDeptConfig[field.key] ?? ''}
                      onChange={(e) =>
                        setEditDeptConfig((prev) => ({
                          ...prev,
                          [field.key]: Number(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all"
                    />
                  </div>
                ))}
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50/50 transition-all">
                    <div>
                      <span className="text-[12px] font-black text-gray-800">Require Comment on Override</span>
                      <p className="text-[9px] font-medium text-gray-400 mt-0.5">
                        Force teacher to write a justification when overriding a grade
                      </p>
                    </div>
                    <Toggle
                      enabled={editDeptConfig.requireCommentOnOverride}
                      onToggle={() =>
                        setEditDeptConfig((p) => ({ ...p, requireCommentOnOverride: !p.requireCommentOnOverride }))
                      }
                      label="Require Comment on Override"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── §5 Password Policy ──────────────────────────────────────────── */}
          <section className="space-y-6">
            <SectionHeader
              icon={Key}
              title="Password Policy Enforcement"
              subtitle="Minimum standards for all staff credentials"
            />
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Minimum Length', key: 'minLength', type: 'number', sub: 'Characters required' },
                  {
                    label: 'Password Expiry (days)',
                    key: 'expiryDays',
                    type: 'number',
                    sub: 'Force change after N days (0 = never)',
                  },
                  {
                    label: 'History Reuse Count',
                    key: 'preventReuseCount',
                    type: 'number',
                    sub: 'Prevent reusing last N passwords',
                  },
                ].map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">{field.label}</label>
                    <input
                      type="number"
                      min={field.key === 'minLength' ? 4 : 0}
                      max={field.key === 'expiryDays' ? 365 : 20}
                      value={editPasswordPolicy[field.key]}
                      onChange={(e) =>
                        setEditPasswordPolicy((p) => ({
                          ...p,
                          [field.key]: Number(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all"
                    />
                    {field.sub && (
                      <p className="text-[9px] text-gray-400 font-medium ml-0.5">{field.sub}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {
                    key: 'requireUppercase',
                    label: 'Uppercase Letter',
                  },
                  {
                    key: 'requireNumber',
                    label: 'Numeric Digit',
                  },
                  {
                    key: 'requireSpecial',
                    label: 'Special Character',
                  },
                ].map((rule) => (
                  <div
                    key={rule.key}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-50"
                  >
                    <span className="text-[11px] font-black text-gray-700">{rule.label}</span>
                    <Toggle
                      enabled={editPasswordPolicy[rule.key]}
                      onToggle={() =>
                        setEditPasswordPolicy((p) => ({
                          ...p,
                          [rule.key]: !p[rule.key],
                        }))
                      }
                      label={rule.label}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── §6 Advanced Security / Change Password ─────────────────────── */}
          <section className="space-y-6">
            <SectionHeader
              icon={Shield}
              title="Management Security"
              subtitle="Master credential sync and session policy"
            />
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
              <div className="flex items-center gap-2">
                <Monitor size={16} className="text-gray-400" />
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Master Credential Sync</h3>
              </div>

              {/* Session timeout in seconds */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">
                    Session Timeout
                  </label>
                  <div className="grid grid-cols-[1fr_auto] gap-3">
                    <div className="relative">
                      <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        min={0}
                        max={1440}
                        step={5}
                        value={editTimeout}
                        onChange={(e) => setTimeoutEdit(Number(e.target.value) || 0)}
                        className="w-full pl-9 pr-3.5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[13px] font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="shrink-0">
                      <Select
                        value={editTimeout}
                        onChange={setTimeoutEdit}
                        options={SESSION_TIMEOUT_OPTIONS}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Change password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">
                      Current Executive Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCur ? 'text' : 'password'}
                        value={currentPw}
                        onChange={(e) => { setCurrentPw(e.target.value); setPwError(''); }}
                        placeholder="Enter current password"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all font-mono"
                      />
                      <button
                        onClick={() => setShowCur((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showCur ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">
                      New Executive Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPw}
                        onChange={(e) => { setNewPw(e.target.value); setPwError(''); }}
                        placeholder={`Min ${editPasswordPolicy.minLength ?? 10} chars`}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all font-mono"
                      />
                      <button
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {/* Strength meter */}
                    <div className="mt-2.5 flex gap-1 px-0.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={cn(
                            'h-1 flex-1 rounded-full transition-all',
                            strength(newPw) >= step ? 'bg-emerald-500' : 'bg-gray-100',
                          )}
                        />
                      ))}
                    </div>
                    {pwError && (
                      <p className="text-[9px] font-black text-red-500 uppercase tracking-wider mt-1">{pwError}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleChangePassword}
                  className="h-[108px] px-6 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-2"
                >
                  <Key size={14} />
                  Propagate Credentials
                </button>
              </div>
            </div>
          </section>

          {/* ── §7 Notification Channels ────────────────────────────────────── */}
          <section className="space-y-6">
            <SectionHeader
              icon={Bell}
              title="Managerial Alert Channels"
              subtitle="Push and email alert preferences"
            />
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-4 md:p-6">
              {[
                {
                  id: 'grading',
                  label: 'Department Grading Alerts',
                  desc: 'Notify when unauthorized mark revisions are detected.',
                },
                {
                  id: 'certification',
                  label: 'Certification Batch Alerts',
                  desc: 'Sync when report card batches are ready for audit.',
                },
                {
                  id: 'security',
                  label: 'System Access Audits',
                  desc: 'Alerts for after-hours vault entry or concurrent logins.',
                },
              ].map((pref) => (
                <div
                  key={pref.id}
                  className={cn(
                    'flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-2xl transition-all group',
                    pref.id !== 'security' && 'mb-1',
                  )}
                >
                  <div>
                    <h4 className="text-[13px] font-black text-gray-900 italic font-display">{pref.label}</h4>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">{pref.desc}</p>
                  </div>
                  <button
                    onClick={() =>
                      setEditNotifications((prev) => ({
                        ...prev,
                        [pref.id]: !prev[pref.id],
                      }))
                    }
                    className={cn(
                      'w-12 h-6 rounded-full relative p-1 transition-all shrink-0',
                      editNotifications[pref.id] ? 'bg-emerald-600' : 'bg-gray-200',
                    )}
                  >
                    <motion.div
                      animate={{ x: editNotifications[pref.id] ? 24 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ── §8 Session Management ───────────────────────────────────────── */}
          <section className="space-y-6">
            <SectionHeader
              icon={Clock}
              title="Session Management"
              subtitle="Active device sessions — revoke any session"
            />
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-4 md:p-6">
              <AnimatePresence>
                {activeSessions.length === 0 ? (
                  <div className="py-8 text-center">
                    <Smartphone size={28} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No active sessions</p>
                  </div>
                ) : (
                  activeSessions.map((sess, idx) => {
                    const isCurrent = sess.isCurrent ?? false;
                    return (
                      <motion.div
                        key={sess.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className={cn(
                          'flex items-center justify-between p-4 rounded-2xl transition-all',
                          isCurrent ? 'bg-emerald-50/50' : 'hover:bg-gray-50/50',
                          idx !== activeSessions.length - 1 && 'mb-2',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-9 h-9 rounded-xl flex items-center justify-center',
                              isCurrent ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500',
                            )}
                          >
                            {sess.device === 'mobile' ? (
                              <Smartphone size={16} />
                            ) : (
                              <Monitor size={16} />
                            )}
                          </div>
                          <div>
                            <p className="text-[12px] font-black text-gray-900">
                              {sess.label || sess.device || 'Unknown device'}
                            </p>
                            <p className="text-[9px] font-medium text-gray-400 tracking-wide">
                              {sess.ip ? `${sess.ip} · ` : ''}
                              {sess.lastActive ? `Last active ${new Date(sess.lastActive).toLocaleString()}` : 'Never'}
                            </p>
                          </div>
                        </div>
                        {!isCurrent && (
                          <button
                            onClick={async () => {
                              if (!window.confirm('Revoke this session?')) return;
                              try {
                                await revokeSession(sess.id);
                                showToast('Session revoked');
                              } catch (e) {
                                showToast(e.message || 'Failed to revoke', 'error');
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                          >
                            <LogOut size={11} /> Revoke
                          </button>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        {/* ── Sticky save bar ───────────────────────────────────────────────── */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Changes are staged locally — click save to persist
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                <RotateCcw size={13} /> Discard
              </button>
              <button
                disabled={isSavingSettings || isLoading}
                onClick={handleSaveSettings}
                className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-900 text-white hover:bg-emerald-950 transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingSettings ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    >
                      <Save size={13} />
                    </motion.div>
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    Save All Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
