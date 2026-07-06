import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, BookOpen, Save, CheckCircle2, Clock, Shield, Bell, Smartphone, Fingerprint, Edit3, Eye, EyeOff, Phone, Plus, Calendar, Award, Users,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { teacherService } from '../../services';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';

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
        const profileData = await teacherService.getProfile();
        const classes = await teacherService.getSettingsClasses();
        const prefs = await teacherService.getNotificationPreferences();
        
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
        await teacherService.updateProfile(profile);
        setMessage('Profile saved successfully');
        setMessageType('success');

        const fresh = await teacherService.getProfile();
        setProfile(fresh || {});

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
      <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 lg:p-12 pb-32 lg:pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6 md:p-8 lg:p-12 pb-32 lg:pb-24">
      <div className="max-w-3xl mx-auto">
        {message && (
          <div className={cn("mb-4 p-4 rounded-2xl flex items-center gap-3",
            messageType === 'success' ? 'bg-success/10 border border-success/20 text-success' : 'bg-destructive/10 border border-destructive/20 text-destructive'
          )}>
            <CheckCircle2 size={20} className={cn(messageType === 'success' ? 'text-success' : 'text-destructive')} />
            <span>{message}</span>
          </div>
        )}
          <header className="mb-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-foreground rounded-2xl flex items-center justify-center text-background shadow-xl shadow-foreground/10">
              <User size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-foreground tracking-tighter leading-none italic font-display uppercase">My Identity</h1>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Professional profile & academic credentials</p>
            </div>
          </header>

          <div className="grid gap-6 mb-6">
            <section className="bg-card rounded-[2rem] border border-border p-8 shadow-sm">
              <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3">
                <User className="text-foreground" size={20} />
                <h2 className="text-[11px] font-black text-foreground uppercase tracking-widest">Personal Details</h2>
              </div>
              <div className="p-8 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block">Full Name</label>
                          {profile.role === 'TEACHER' ? (
                             <Input
                               name="name"
                               value={profile.name}
                               onChange={handleChange}
                               className={cn(
                                 "font-black",
                                 errors.name && "border-destructive"
                               )}
                             />
                           ) : (
                             <p className="w-full px-5 py-3.5 bg-muted border border-border rounded-2xl text-[14px] font-black text-foreground">
                               {profile.name || '—'}
                             </p>
                           )}
                          {errors.name && <p className="text-[9px] text-destructive mt-1">{errors.name}</p>}
                        </div>
                      <div>
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block">Staff ID</label>
                        <div className="px-5 py-3.5 bg-muted border border-border rounded-2xl text-[14px] font-black font-mono text-muted-foreground">
                          {profile.staffId ? profile.staffId : '—'}
                        </div>
                      </div>
                        <div>
                          <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block">Department</label>
                          {profile.role === 'TEACHER' ? (
                             <Input
                               name="department"
                               value={profile.department}
                               onChange={handleChange}
                               className={cn(
                                 "w-full font-black",
                                 errors.department && "border-destructive"
                               )}
                             />
                           ) : (
                             <p className="w-full px-5 py-3.5 bg-muted border border-border rounded-2xl text-[14px] font-black text-foreground">
                               {profile.department || '—'}
                             </p>
                           )}
                          {errors.department && <p className="text-[9px] text-destructive mt-1">{errors.department}</p>}
                        </div>
                      <div>
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block">Email</label>
                          {profile.role === 'TEACHER' ? (
                             <Input
                               type="email"
                               name="email"
                               value={profile.email}
                               onChange={handleChange}
                               className={cn(
                                 "w-full font-black",
                                 errors.email && "border-destructive"
                               )}
                             />
                           ) : (
                             <p className="w-full px-5 py-3.5 bg-muted border border-border rounded-2xl text-[14px] font-black text-foreground">
                               {profile.email || '—'}
                             </p>
                           )}
                        {errors.email && <p className="text-[9px] text-destructive mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block">Phone</label>
                          {profile.role === 'TEACHER' ? (
                             <Input
                               type="tel"
                               name="phone"
                               value={profile.phone}
                               onChange={handleChange}
                               className={cn(
                                 "w-full font-black",
                                 errors.phone && "border-destructive"
                               )}
                             />
                           ) : (
                             <p className="w-full px-5 py-3.5 bg-muted border border-border rounded-2xl text-[14px] font-black text-foreground">
                               {profile.phone || '—'}
                             </p>
                           )}
                        {errors.phone && <p className="text-[9px] text-destructive mt-1">{errors.phone}</p>}
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2 block">Role</label>
                        <div className="px-5 py-3.5 bg-muted border border-border rounded-2xl text-[14px] font-black text-muted-foreground">
                          {profile.role ? profile.role : '—'}
                        </div>
                      </div>
                     </div>
                     <Button
                       type="submit"
                       disabled={!canSave}
                       className="w-full py-4 font-black uppercase tracking-widest shadow-2xl"
                     >
                       <Save size={16} /> Save Changes
                     </Button>
                </form>
              </div>
            </section>

            <section className="bg-card rounded-[2rem] border border-border p-8 shadow-sm">
              <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3">
                <BookOpen className="text-foreground" size={20} />
                <h2 className="text-[11px] font-black text-foreground uppercase tracking-widest">My Classes</h2>
              </div>
              <div className="p-8 space-y-4">
                {settingsClasses.map((cls, i) => (
                  <div key={cls.id} className="flex items-center justify-between p-4 bg-muted rounded-2xl hover:bg-muted/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                        <BookOpen className="text-success" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground">{cls.subject}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">{cls.className} • {cls.studentCount} students</p>
                      </div>
                    </div>
                     <button 
                       className="text-[9px] font-black text-brand-primary uppercase tracking-widest hover:underline"
                       onClick={() => navigate(`/grading?subject=${encodeURIComponent(cls.subject)}&class=${encodeURIComponent(cls.className)}`)}
                     >
                       Enter Marks
                     </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-card rounded-[2rem] border border-border p-8 shadow-sm">
              <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-3">
                <Bell className="text-foreground" size={20} />
                <h2 className="text-[11px] font-black text-foreground uppercase tracking-widest">Notification Preferences</h2>
              </div>
              <div className="p-8 space-y-4">
                {notificationPreferences.map((pref, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-muted rounded-2xl">
                    <div>
                      <p className="text-sm font-black text-foreground">{pref.label}</p>
                      <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{pref.desc}</p>
                    </div>
                     <Switch checked={pref.enabled} onCheckedChange={() => {}} />
                  </div>
                ))}
              </div>
            </section>
          </div>
      </div>
    </div>
   );
}