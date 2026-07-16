import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Shield, 
  Lock, 
  Fingerprint, 
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { adminApi } from '../../lib/api/admin';
import { adminService } from '../../services/adminService';

export function AdminSettings() {
  const { user } = useRole();
  const [mfaEnabled, setMfaEnabled] = React.useState(true);
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const handleMaintenanceToggle = async () => {
    const newValue = !maintenanceMode;
    try {
      await adminService.toggleMaintenanceMode(newValue);
      setMaintenanceMode(newValue);
    } catch (e) {
      console.error('Failed to toggle maintenance mode:', e);
    }
  };

  const handleMfaToggle = async () => {
    const newValue = !mfaEnabled;
    try {
      if (newValue) {
        await adminApi.updateAdminMfa(true);
      }
      setMfaEnabled(newValue);
    } catch (e) {
      console.error('Failed to toggle MFA:', e);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!password.trim()) return;
    setSaving(true);
    try {
      await adminApi.updateAdminCredentials({ newPassword: password });
      setPassword('');
    } catch (e) {
      console.error('Failed to update password:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-8 lg:p-12 pb-32 lg:pb-24 scrollbar-hide">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-dark rounded-2xl flex items-center justify-center text-primary-foreground shadow-xl shadow-brand-dark/10">
              <Settings size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-text-primary tracking-tighter leading-none italic font-display italic uppercase">Executive Identity & Settings</h1>
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mt-1">High-level institutional security & protocol management</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
             <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Authority Tier: ALPHA</span>
          </div>
        </header>

        <div className="grid gap-8">
          {/* Admin Identity */}
          <section className="bg-surface rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3">
              <User className="text-text-primary" size={20} />
              <h2 className="text-[11px] font-black text-text-primary uppercase tracking-widest">System Administrator Profile</h2>
            </div>
            <div className="p-8 grid grid-cols-2 gap-8">
              <div>
                <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 block">Executive Name</label>
                <div className="px-5 py-3.5 bg-muted border border-border rounded-2xl text-[14px] font-black text-text-primary tracking-tight">
                  {user?.name || '—'}
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 block">Executive ID</label>
                <div className="px-5 py-3.5 bg-muted border border-border rounded-2xl text-[14px] font-black text-text-primary tracking-tight">
                  {user?.profileId || '—'}
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 block">Primary Focus</label>
                <div className="px-5 py-3.5 bg-muted border border-border rounded-2xl text-[14px] font-black text-text-primary tracking-tight">
                  {user?.role === 'ADMIN' ? 'System Administrator' : 'Institutional Operations'}
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2 block">Assigned Role</label>
                <div className="px-5 py-3.5 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl text-[11px] font-black text-brand-primary uppercase tracking-widest flex items-center gap-2">
                  <Shield size={14} />
                  {user?.role || '—'}
                </div>
              </div>
            </div>
          </section>

          {/* Global Protocols */}
          <section className="bg-surface rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3">
              <Zap className="text-warning" size={20} />
              <h2 className="text-[11px] font-black text-text-primary uppercase tracking-widest">Global Protocol Management</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between p-6 bg-destructive/5 rounded-3xl border border-destructive/20 group transition-all hover:bg-destructive/10">
                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center text-destructive shadow-sm ring-1 ring-inset ring-destructive/20">
                    <AlertCircle size={28} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-black text-text-primary tracking-tight">Maintenance Mode (Global Interruption)</h3>
                    <p className="text-[10px] font-bold text-text-secondary mt-1 max-w-sm">Divert all biological nodes to maintenance sub-page. Restricted to system technicians.</p>
                  </div>
                </div>
                <button 
                  onClick={handleMaintenanceToggle}
                  className={cn(
                    "w-14 h-8 rounded-full transition-all relative p-1.5",
                    maintenanceMode ? "bg-destructive shadow-lg shadow-destructive/20" : "bg-muted"
                  )}
                >
                  <motion.div 
                    animate={{ x: maintenanceMode ? 24 : 0 }}
                    className="w-5 h-5 bg-surface rounded-full shadow-sm"
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/20 group transition-all hover:bg-brand-primary/10">
                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center text-brand-primary shadow-sm ring-1 ring-inset ring-brand-primary/20">
                    <Fingerprint size={28} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-black text-text-primary tracking-tight">Alpha-Level Biometrics</h3>
                    <p className="text-[10px] font-bold text-text-secondary mt-1 max-w-sm">Enforce cryptographic verification for all certification locks institution-wide.</p>
                  </div>
                </div>
                <button 
                  onClick={handleMfaToggle}
                  className={cn(
                    "w-14 h-8 rounded-full transition-all relative p-1.5",
                    mfaEnabled ? "bg-brand-primary shadow-lg shadow-brand-primary/20" : "bg-muted"
                  )}
                >
                  <motion.div 
                    animate={{ x: mfaEnabled ? 24 : 0 }}
                    className="w-5 h-5 bg-surface rounded-full shadow-sm"
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Security Node Audit */}
          <section className="bg-surface rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3">
              <Lock className="text-text-primary" size={20} />
              <h2 className="text-[11px] font-black text-text-primary uppercase tracking-widest">Administrative Vault</h2>
            </div>
            <div className="p-8">
               <div className="mb-6">
                 <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] mb-3 block">New Administrative Password</label>
                 <div className="relative">
                   <input 
                     type={showPassword ? "text" : "password"}
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="Enter high-entropy credential..."
                     className="w-full h-14 bg-muted border border-border rounded-2xl px-6 text-[14px] font-black text-text-primary tracking-tight focus:outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all"
                   />
                   <button 
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-5 top-1/2 -translate-y-1/2 text-muted hover:text-text-primary transition-colors"
                   >
                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                   </button>
                 </div>
               </div>
               <button 
                 onClick={handlePasswordUpdate}
                 disabled={saving || !password.trim()}
                 className="w-full h-14 bg-brand-dark text-primary-foreground rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-brand-dark/90 transition-all shadow-2xl shadow-brand-dark/20 disabled:opacity-50"
               >
                 {saving ? 'Saving...' : 'Synchronize Alpha Credentials'}
               </button>
            </div>
          </section>
        </div>

        <footer className="mt-16 text-center pb-20">
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] flex items-center justify-center gap-3">
            <ShieldCheck size={14} className="text-success" />
            MAAIS Core Protocol 8.4.2 • Admin Auth Node 001
          </p>
        </footer>
      </div>
    </div>
  );
}
