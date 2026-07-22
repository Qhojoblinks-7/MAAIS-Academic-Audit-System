import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, BookOpen, Award, Calendar, Shield, Bell,
  Camera, ChevronRight, LogOut, Save, Send, LifeBuoy, Settings as SettingsIcon, UserCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRole } from '../../context/RoleContext';
import { useUI } from '../../context/UIContext';
import { teacherService } from '../../services';
import { Button } from '../../components/ui/button';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
  { id: 'support', label: 'Support', icon: LifeBuoy },
];

export function MobileTeacherProfile() {
  const navigate = useNavigate();
  const { user, setRole } = useRole();
  const { setSettingsModalOpen, setSupportModalOpen } = useUI();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ name: '', department: '', email: '', phone: '', staffId: '', role: '' });
  const [classes, setClasses] = useState([]);
  const [prefs, setPrefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState('');
  const [supportError, setSupportError] = useState('');

  const [supportTitle, setSupportTitle] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportCategory, setSupportCategory] = useState('General');

  const TabIcon = TABS.find((t) => t.id === activeTab)?.icon || User;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, classesData, prefsData] = await Promise.all([
          teacherService.getProfile(),
          teacherService.getSettingsClasses(),
          teacherService.getNotificationPreferences(),
        ]);
        setProfile(profileData || {});
        setClasses(classesData || []);
        setPrefs(prefsData || []);
      } catch (err) {
        console.error('Failed to load profile data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setSupportLoading(true);
    setSupportSuccess('');
    setSupportError('');
    try {
      await teacherService.submitSupportTicket({
        title: supportTitle,
        message: supportMessage,
        category: supportCategory,
      });
      setSupportSuccess('Ticket submitted successfully');
      setSupportTitle('');
      setSupportMessage('');
      setSupportCategory('General');
    } catch (err) {
      setSupportError('Failed to submit ticket');
    } finally {
      setSupportLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-success/30 border-t-success rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-primary">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background no-scrollbar">
      <div className="flex-1 overflow-y-auto pb-28">
        <header className="bg-surface border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center shrink-0">
              <ChevronRight size={20} className="text-primary rotate-180" />
            </button>
            <div>
              <h1 className="text-lg font-black text-primary">My Profile</h1>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Account & Preferences</p>
            </div>
          </div>
        </header>

        <div className="p-4">
          <div className="bg-card rounded-[2rem] border border-border p-5 flex items-center gap-4 mb-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
              <User size={28} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-black text-primary truncate">{profile.name || user?.name || 'Teacher'}</p>
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">{profile.role || 'TEACHER'}</p>
              <p className="text-[11px] font-medium text-text-secondary mt-0.5 truncate">{profile.email}</p>
            </div>
          </div>

          <div className="bg-card rounded-[2rem] border border-border overflow-hidden shadow-sm">
            <div className="flex border-b border-border">
              {TABS.map((tab) => {
                const TabIconComp = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all',
                      isActive ? 'border-b-2 border-brand-primary bg-brand-primary/5' : 'text-text-secondary hover:text-text-primary'
                    )}
                  >
                    <TabIconComp size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span className={cn('text-[10px] font-black uppercase tracking-wider', isActive ? 'text-brand-primary' : 'text-text-secondary')}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-4">
              {activeTab === 'profile' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <ProfileRow icon={User} label="Full Name" value={profile.name} />
                  <ProfileRow icon={Mail} label="Email" value={profile.email} />
                  <ProfileRow icon={Phone} label="Phone" value={profile.phone} />
                  <ProfileRow icon={Award} label="Staff ID" value={profile.staffId} />
                  <ProfileRow icon={BookOpen} label="Department" value={profile.department} />
                  <ProfileRow icon={Shield} label="Role" value={profile.role} />
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">My Classes</p>
                    <div className="space-y-2">
                      {classes.map((cls) => (
                        <div key={cls.id} className="flex items-center justify-between p-4 bg-muted rounded-2xl">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-success/10 rounded-xl flex items-center justify-center text-success">
                              <BookOpen size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-primary">{cls.subject}</p>
                              <p className="text-[11px] font-bold text-text-secondary">{cls.className} • {cls.studentCount} students</p>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => navigate(`/teacher/grading-mobile?subject=${encodeURIComponent(cls.subject)}&class=${encodeURIComponent(cls.className)}`)} className="h-8 text-[10px] font-black uppercase tracking-widest">
                            Marks
                          </Button>
                        </div>
                      ))}
                      {classes.length === 0 && (
                        <p className="text-xs font-medium text-text-secondary text-center py-4">No classes assigned</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Notifications</p>
                    <div className="space-y-2">
                      {prefs.map((pref, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-2xl">
                          <div>
                            <p className="text-sm font-black text-primary">{pref.label}</p>
                            <p className="text-[11px] font-medium text-text-secondary">{pref.desc}</p>
                          </div>
                          <div className={cn('w-10 h-6 rounded-full transition-all', pref.enabled ? 'bg-success' : 'bg-border')}>
                            <div className={cn('w-4 h-4 rounded-full bg-white shadow-sm mt-1 transition-all', pref.enabled ? 'ml-5' : 'ml-1')} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'support' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  {supportSuccess && (
                    <div className="p-3 bg-success/10 border border-success/20 rounded-2xl text-xs font-black text-success">
                      {supportSuccess}
                    </div>
                  )}
                  {supportError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-2xl text-xs font-black text-destructive">
                      {supportError}
                    </div>
                  )}
                  <form onSubmit={handleSupportSubmit} className="space-y-3">
                    <div>
                      <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 block">Category</label>
                      <div className="flex flex-wrap gap-2">
                        {['Grade Entry', 'Observation', 'Technical', 'General'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSupportCategory(t)}
                            className={cn(
                              'px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all',
                              supportCategory === t ? 'bg-brand-primary text-surface border-brand-primary' : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 block">Title</label>
                      <input
                        type="text"
                        value={supportTitle}
                        onChange={(e) => setSupportTitle(e.target.value)}
                        placeholder="Brief description"
                        className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1 block">Message</label>
                      <textarea
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        placeholder="Include class, subject, student details..."
                        rows={4}
                        className="w-full px-4 py-3 bg-surface border border-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-primary/30 resize-none"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={supportLoading || !supportTitle.trim()} className="w-full py-3 font-black uppercase tracking-widest shadow-lg">
                      {supportLoading ? 'Submitting...' : 'Submit Ticket'}
                    </Button>
                  </form>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-muted rounded-2xl">
      <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-text-secondary shrink-0">
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-primary truncate">{value || '—'}</p>
      </div>
    </div>
  );
}
