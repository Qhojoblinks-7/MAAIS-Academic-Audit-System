import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Save, Fingerprint, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';

const STUDENT_STATS = [
  { label: 'Current CGPA', value: '3.82', sub: 'Term 2', color: 'text-emerald-700' },
  { label: 'Attendance', value: '96%', sub: '94/98 days', color: 'text-blue-600' },
  { label: 'Class Rank', value: '#8', sub: 'of 42 students', color: 'text-amber-600' },
  { label: 'Owed Fees', value: '₵0', sub: 'Account clear', color: 'text-emerald-700' }, // Fixed string character issue
];

export function StudentSettings() {
  const navigate = useNavigate();
  const [name, setName] = React.useState('Angela Owusu');
  const [bio, setBio] = React.useState('SHS 3 Agric B student interested in agritech.');
  const [isTwoFactor, setIsTwoFactor] = React.useState(true);

  // Local state array allows toggle interactions to function realistically
  const [notifications, setNotifications] = React.useState([
    { id: 'sms', label: 'SMS Alerts', desc: 'Receive SMS when results are published', enabled: true },
    { id: 'push', label: 'Push App', desc: 'In-app notification banner', enabled: true },
    { id: 'summary', label: 'Bi-weekly Summary', desc: 'Academic pulse digest via SMS', enabled: false },
  ]);

  const toggleNotification = (id) => {
    setNotifications(prev => prev.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-4 sm:p-6 md:p-8 lg:p-12 pb-24">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Block */}
        <header className="flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gray-900 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-gray-900/10">
            <User size={24} className="sm:hidden" />
            <User size={28} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase italic">
              My Identity
            </h1>
            <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5 truncate">
              Academic profile, credentials &amp; preferences
            </p>
          </div>
        </header>
        
        {/* Dashboard Metric Matrix Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {STUDENT_STATS.map((stat, i) => (
            <div key={i} className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm text-center flex flex-col justify-center min-w-0">
              <span className={cn("text-xl sm:text-2xl font-black tracking-tight block truncate", stat.color)}>
                {stat.value}
              </span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider mt-1 block truncate">
                {stat.label}
              </span>
              <span className="text-[9px] font-medium text-gray-500 mt-0.5 block truncate">
                {stat.sub}
              </span>
            </div>
          ))}
        </div>
        
        {/* Profile Settings Block */}
        <section className="bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2.5">
            <User className="text-gray-900 shrink-0" size={18} />
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest">
              Student Profile
            </h2>
          </div>
          
          <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1.5 block">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all" 
                />
              </div>
              
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1.5 block">Index Number</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black font-mono text-gray-500 select-all">
                  10001
                </div>
              </div>
              
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1.5 block">Current Class</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black text-gray-500">
                  SHS 3 Agric B
                </div>
              </div>
              
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1.5 block">Program</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black text-gray-500">
                  General Agriculture
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1.5 block">Bio / About</label>
              <textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                rows={3} 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/10 resize-none transition-all" 
              />
            </div>
            
            {/* Two-Factor Toggle Interaction Panel */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Fingerprint className="text-gray-700 shrink-0" size={20} />
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate">Two-Factor Auth</p>
                  <p className="text-[10px] font-medium text-gray-400 truncate">Require PIN on login</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsTwoFactor(!isTwoFactor)}
                className={cn(
                  "w-11 h-6 rounded-full relative p-0.5 shrink-0 transition-colors duration-200 cursor-pointer",
                  isTwoFactor ? "bg-emerald-600" : "bg-gray-300"
                )}
              >
                <motion.div 
                  layout
                  className="w-5 h-5 bg-white rounded-full shadow-md" 
                  animate={{ x: isTwoFactor ? 20 : 0 }} 
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
            
            {/* Submission Primary Controls */}
            <button className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all active:scale-[0.99] flex items-center justify-center gap-2 select-none cursor-pointer shadow-md">
              <Save size={15} /> Save Changes
            </button>
          </div>
        </section>
        
        {/* Preferences Block */}
        <section className="bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2.5">
            <Bell className="text-gray-900 shrink-0" size={18} />
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest">
              Notification Preferences
            </h2>
          </div>
          
          <div className="p-4 sm:p-6 md:p-8 space-y-3">
            {notifications.map((pref) => (
              <div key={pref.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate">{pref.label}</p>
                  <p className="text-[10px] font-medium text-gray-400 mt-0.5 whitespace-normal leading-tight">
                    {pref.desc}
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={() => toggleNotification(pref.id)}
                  className={cn(
                    "w-11 h-6 rounded-full relative p-0.5 shrink-0 transition-colors duration-200 cursor-pointer", 
                    pref.enabled ? "bg-emerald-600" : "bg-gray-300"
                  )}
                >
                  <motion.div 
                    layout
                    className="w-5 h-5 bg-white rounded-full shadow-md" 
                    animate={{ x: pref.enabled ? 20 : 0 }} 
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>
        
      </div>
    </div>
  );
}