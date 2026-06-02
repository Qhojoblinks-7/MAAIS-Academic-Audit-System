import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Save, Fingerprint, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';

const STUDENT_STATS = [
  { label: 'Current CGPA', value: '3.82', sub: 'Term 2', color: 'text-success' },
  { label: 'Attendance', value: '96%', sub: '94/98 days', color: 'text-brand-primary' },
  { label: 'Class Rank', value: '#8', sub: 'of 42 students', color: 'text-warning' },
  { label: 'Owed Fees', value: '₵0', sub: 'Account clear', color: 'text-success' },
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
     <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 md:p-8 lg:p-12 pb-24 no-scrollbar">
       <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 no-scrollbar">
         
         {/* Header Block */}
         <header className="flex items-center gap-3 sm:gap-4">
           <div className="w-11 h-11 sm:w-12 sm:h-12 bg-brand-dark rounded-xl sm:rounded-2xl flex items-center justify-center text-surface shrink-0 shadow-lg shadow-brand-dark/10">
             <User size={24} className="sm:hidden" />
             <User size={28} className="hidden sm:block" />
           </div>
           <div className="min-w-0">
             <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight uppercase italic">
               My Identity
             </h1>
             <p className="text-[9px] sm:text-[10px] font-black text-text-secondary uppercase tracking-widest mt-0.5 truncate">
               Academic profile, credentials &amp; preferences
             </p>
           </div>
         </header>
         
         {/* Dashboard Metric Matrix Row */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
           {STUDENT_STATS.map((stat, i) => (
             <div key={i} className="bg-surface p-4 sm:p-5 rounded-2xl border border-border shadow-sm text-center flex flex-col justify-center min-w-0">
               <span className={cn("text-xl sm:text-2xl font-black tracking-tight block truncate", stat.color)}>
                 {stat.value}
               </span>
               <span className="text-[9px] font-black text-text-secondary uppercase tracking-wider mt-1 block truncate">
                 {stat.label}
               </span>
               <span className="text-[9px] font-medium text-text-secondary mt-0.5 block truncate">
                 {stat.sub}
               </span>
             </div>
           ))}
         </div>
         
         {/* Profile Settings Block */}
         <section className="bg-surface rounded-2xl sm:rounded-[2rem] border border-border shadow-sm overflow-hidden">
           <div className="p-4 sm:p-6 border-b border-border bg-background/50 flex items-center gap-2.5">
             <User className="text-text-primary shrink-0" size={18} />
             <h2 className="text-xs font-black text-text-primary uppercase tracking-widest">
               Student Profile
             </h2>
           </div>
           
           <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
               <div>
                 <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.15em] mb-1.5 block">Full Name</label>
                 <input 
                   type="text" 
                   value={name} 
                   onChange={(e) => setName(e.target.value)} 
                   className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-black text-text-primary focus:outline-none focus:bg-surface focus:ring-2 focus:ring-brand-primary/10 transition-all" 
                 />
               </div>
               
               <div>
                 <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.15em] mb-1.5 block">Index Number</label>
                 <div className="px-4 py-3 bg-background border border-border rounded-xl text-sm font-black font-mono text-text-secondary select-all">
                   10001
                 </div>
               </div>
               
               <div>
                 <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.15em] mb-1.5 block">Current Class</label>
                 <div className="px-4 py-3 bg-background border border-border rounded-xl text-sm font-black text-text-secondary">
                   SHS 3 Agric B
                 </div>
               </div>
               
               <div>
                 <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.15em] mb-1.5 block">Program</label>
                 <div className="px-4 py-3 bg-background border border-border rounded-xl text-sm font-black text-text-secondary">
                   General Agriculture
                 </div>
               </div>
             </div>
             
             <div>
               <label className="text-[9px] font-black text-text-secondary uppercase tracking-[0.15em] mb-1.5 block">Bio / About</label>
               <textarea 
                 value={bio} 
                 onChange={(e) => setBio(e.target.value)} 
                 rows={3} 
                 className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm font-medium text-text-primary focus:outline-none focus:bg-surface focus:ring-2 focus:ring-brand-primary/10 resize-none transition-all" 
               />
             </div>
             
             {/* Two-Factor Toggle Interaction Panel */}
             <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border gap-4">
               <div className="flex items-center gap-3 min-w-0">
                 <Fingerprint className="text-text-secondary shrink-0" size={20} />
                 <div className="min-w-0">
                   <p className="text-sm font-black text-text-primary truncate">Two-Factor Auth</p>
                   <p className="text-[10px] font-medium text-text-secondary truncate">Require PIN on login</p>
                 </div>
               </div>
               <button 
                 type="button"
                 onClick={() => setIsTwoFactor(!isTwoFactor)}
                 className={cn(
                   "w-11 h-6 rounded-full relative p-0.5 shrink-0 transition-colors duration-200 cursor-pointer",
                   isTwoFactor ? "bg-success" : "bg-border"
                 )}
               >
                 <motion.div 
                   layout
                   className="w-5 h-5 bg-surface rounded-full shadow-md" 
                   animate={{ x: isTwoFactor ? 20 : 0 }} 
                   transition={{ type: "spring", stiffness: 500, damping: 30 }}
                 />
               </button>
             </div>
             
             {/* Submission Primary Controls */}
             <button className="w-full py-3.5 bg-brand-dark text-surface rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-dark/90 transition-all active:scale-[0.99] flex items-center justify-center gap-2 select-none cursor-pointer shadow-md">
               <Save size={15} /> Save Changes
             </button>
           </div>
         </section>
         
         {/* Preferences Block */}
         <section className="bg-surface rounded-2xl sm:rounded-[2rem] border border-border shadow-sm overflow-hidden">
           <div className="p-4 sm:p-6 border-b border-border bg-background/50 flex items-center gap-2.5">
             <Bell className="text-text-primary shrink-0" size={18} />
             <h2 className="text-xs font-black text-text-primary uppercase tracking-widest">
               Notification Preferences
             </h2>
           </div>
           
           <div className="p-4 sm:p-6 md:p-8 space-y-3">
             {notifications.map((pref) => (
               <div key={pref.id} className="flex items-center justify-between p-4 bg-background rounded-xl border border-border gap-4">
                 <div className="min-w-0">
                   <p className="text-sm font-black text-text-primary truncate">{pref.label}</p>
                   <p className="text-[10px] font-medium text-text-secondary mt-0.5 whitespace-normal leading-tight">
                     {pref.desc}
                   </p>
                 </div>
                 <button 
                   type="button"
                   onClick={() => toggleNotification(pref.id)}
                   className={cn(
                     "w-11 h-6 rounded-full relative p-0.5 shrink-0 transition-colors duration-200 cursor-pointer", 
                     pref.enabled ? "bg-success" : "bg-border"
                   )}
                 >
                   <motion.div 
                     layout
                     className="w-5 h-5 bg-surface rounded-full shadow-md" 
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

export default StudentSettings;