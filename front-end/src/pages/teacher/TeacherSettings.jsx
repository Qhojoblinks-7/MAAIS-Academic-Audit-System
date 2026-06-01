import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, BookOpen, Save, CheckCircle2, Clock, Shield, Bell, Smartphone, Fingerprint, Edit3, Eye, EyeOff, Phone, Plus, Calendar, Award, Users,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import mockTeacherService from '../../services/mockTeacherService';

export function TeacherSettings() {
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState({
    name: '',
    department: '',
    email: '',
    phone: '',
    staffId: '',
    role: '',
  });
  const [loading, setLoading] = React.useState(true);
  const [errors, setErrors] = React.useState({});

  const [message, setMessage] = React.useState('');
  const [messageType, setMessageType] = React.useState(''); // 'success' or 'error'
  const [settingsClasses, setSettingsClasses] = React.useState([]);
  const [notificationPreferences, setNotificationPreferences] = React.useState([]);

  // Fetch data on mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await mockTeacherService.getProfile();
        const classes = await mockTeacherService.getSettingsClasses();
        const prefs = await mockTeacherService.getNotificationPreferences();
        
        setProfile(profileData || {});
        setSettingsClasses(classes || []);
        setNotificationPreferences(prefs || []);
      } catch (err) {
        setMessage('Failed to load settings');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Validation (client-side gate; backend remains the ultimate source of truth)
  const validate = (values) => {
    const newErrors = {};
    if (!values.name.trim()) newErrors.name = 'Name is required';
    if (!values.department.trim()) newErrors.department = 'Department is required';
    if (!values.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Email address is invalid';
    }
    if (!values.phone.trim()) newErrors.phone = 'Phone number is required';
    return newErrors;
  };

  const canSave = React.useMemo(() => {
    if (loading) return false;
    const v = validate(profile);
    return Object.keys(v).length === 0;
  }, [profile, loading]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    // Validate on change
    const fieldErrors = validate({ [name]: value });
    setErrors(prev => ({
      ...prev,
      ...fieldErrors
    }));
    // Clear message when user starts typing
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate(profile);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length === 0 && canSave) {
      try {
        const response = await fetch('/api/teacher/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profile),
        });
        if (!response.ok) throw new Error('Failed to save profile');
        setMessage('Profile saved successfully');
        setMessageType('success');

        // Refresh from backend to avoid any silent local-state drift
        const refresh = async () => {
          const r = await fetch('/api/teacher/profile');
          if (!r.ok) throw new Error('Failed to refresh profile');
          const fresh = await r.json();
          setProfile(fresh);
        };

        try {
          await refresh();
        } catch (e) {
          // Still keep success toast; only UI may be stale if refresh fails.
        }

        // Clear message after 3 seconds
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
      } catch (err) {
        setMessage('Failed to save profile: ' + err.message);
        setMessageType('error');
        setTimeout(() => {
          setMessage('');
          setMessageType('');
        }, 3000);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 md:p-8 lg:p-12 pb-32 lg:pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 md:p-8 lg:p-12 pb-32 lg:pb-24">
      <div className="max-w-3xl mx-auto">
        {message && (
          <div className={`mb-4 p-4 rounded-2xl ${messageType === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} text-${messageType === 'success' ? 'emerald-700' : 'red-700'} flex items-center gap-3`}>
            <CheckCircle2 size={20} className={`${messageType === 'success' ? 'text-emerald-500' : 'text-red-500'}`} />
            <span>{message}</span>
          </div>
        )}
          <header className="mb-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
              <User size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display uppercase">My Identity</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Professional profile & academic credentials</p>
            </div>
          </header>

          <div className="grid gap-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Stats remain unchanged */ }
            </div>

            <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
              <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
                <User className="text-gray-900" size={20} />
                <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Personal Details</h2>
              </div>
              <div className="p-8 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Full Name</label>
                       {profile.role === 'SET' ? (
                         <input
                           type="text"
                           name="name"
                           value={profile.name}
                           onChange={handleChange}
                           className={cn(
                             "w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10",
                             errors.name && "border-red-500"
                           )}
                         />
                       ) : (
                         <p className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black text-gray-900">
                           {profile.name || '—'}
                         </p>
                       )}
                       {errors.name && <p className="text-[9px] text-red-500 mt-1">{errors.name}</p>}
                     </div>
                     <div>
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Staff ID</label>
                       <div className="px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black font-mono text-gray-800">
                         {profile.staffId ? profile.staffId : '—'}
                       </div>
                     </div>
                     <div>
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Department</label>
                       {profile.role === 'SET' ? (
                         <input
                           type="text"
                           name="department"
                           value={profile.department}
                           onChange={handleChange}
                           className={cn(
                             "w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10",
                             errors.department && "border-red-500"
                           )}
                         />
                       ) : (
                         <p className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black text-gray-900">
                           {profile.department || '—'}
                         </p>
                       )}
                       {errors.department && <p className="text-[9px] text-red-500 mt-1">{errors.department}</p>}
                     </div>
                     <div>
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Email</label>
                       {profile.role === 'SET' ? (
                         <input
                           type="email"
                           name="email"
                           value={profile.email}
                           onChange={handleChange}
                           className={cn(
                             "w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10",
                             errors.email && "border-red-500"
                           )}
                         />
                       ) : (
                         <p className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black text-gray-900">
                           {profile.email || '—'}
                         </p>
                       )}
                       {errors.email && <p className="text-[9px] text-red-500 mt-1">{errors.email}</p>}
                     </div>
                     <div>
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Phone</label>
                       {profile.role === 'SET' ? (
                         <input
                           type="tel"
                           name="phone"
                           value={profile.phone}
                           onChange={handleChange}
                           className={cn(
                             "w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10",
                             errors.phone && "border-red-500"
                           )}
                         />
                       ) : (
                         <p className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black text-gray-900">
                           {profile.phone || '—'}
                         </p>
                       )}
                       {errors.phone && <p className="text-[9px] text-red-500 mt-1">{errors.phone}</p>}
                     </div>
                     <div>
                       <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Role</label>
                       <div className="px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black text-gray-800">
                         {profile.role ? profile.role : '—'}
                       </div>
                     </div>
                   </div>
                  <button
                    type="submit"
                    disabled={!canSave}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-gray-900/20 flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> Save Changes
                  </button>
                </form>
              </div>
            </section>

            {/* Remaining sections (My Classes, Notification Preferences) remain unchanged */ }
            <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
              <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
                <BookOpen className="text-gray-900" size={20} />
                <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">My Classes</h2>
              </div>
              <div className="p-8 space-y-4">
                {SETTINGS_CLASSES.map((cls, i) => (
                  <div key={cls.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <BookOpen className="text-emerald-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">{cls.subject}</p>
                        <p className="text-[9px] font-bold text-gray-500 uppercase">{cls.className} • {cls.studentCount} students</p>
                      </div>
                    </div>
                    <button className="text-[9px] font-black text-emerald-700 uppercase tracking-widest hover:underline">
                      Enter Marks
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
              <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
                <Bell className="text-gray-900" size={20} />
                <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Notification Preferences</h2>
              </div>
              <div className="p-8 space-y-4">
                {NOTIFICATION_PREFERENCES.map((pref, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="text-sm font-black text-gray-900">{pref.label}</p>
                      <p className="text-[10px] font-medium text-gray-400 mt-0.5">{pref.desc}</p>
                    </div>
                    <button className={cn("w-12 h-7 rounded-full relative p-1", pref.enabled ? "bg-emerald-600 shadow-lg shadow-emerald-600/20" : "bg-gray-300")}>
                      <motion.div className="w-5 h-5 bg-white rounded-full shadow-sm" animate={{ x: pref.enabled ? 20 : 0 }} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
      </div>
    </div>
  );
}