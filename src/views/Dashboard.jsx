import React from 'react';
import { ClassCard } from '../components/ClassCard';
import { motion } from 'framer-motion';
import { useRole } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
  TrendingUp, AlertCircle, CheckCircle2, Clock, Users, BookOpen,
  ShieldAlert, GraduationCap, Database, Calendar, Settings,
} from 'lucide-react';
import { StudentDashboard } from './StudentDashboard';
import { AdminHome } from './AdminHome';

const teacherClasses = [
  { id: '1', subject: "General Agric - SHS 1 Agric B", className: "Lab Practical Ready", status: "Lab Practical Ready", progress: 100, studentCount: 42, hasRevision: false, hasMissingObservation: false },
  { id: '2', subject: "General Agric - SHS 1 Agric B", className: "Lab Practical Ready", status: "Lab Practical Ready", progress: 45, studentCount: 42, color: "#f59e0b", hasRevision: true, hasMissingObservation: false },
  { id: '3', subject: "General Agric - SHS 1 Agric B", className: "Lab Practical Ready", status: "Lab Practical Ready", progress: 0, studentCount: 42, color: "#cbd5e1", hasRevision: false, hasMissingObservation: true },
  { id: '4', subject: "General Agric - SHS 1 Agric B", className: "Lab Practical Ready", status: "Lab Practical Ready", progress: 60, studentCount: 42, color: "#f59e0b", hasRevision: true, hasMissingObservation: true },
];

export function Dashboard() {
  const { user } = useRole();
  const navigate = useNavigate();

  const handleEnterMarks = (cls) => { if (user?.role !== 'STUDENT') navigate('/grading'); };

  const renderTeacherDashboard = () => (
    <>
      <div className="flex gap-6 mb-10">
        <div className="bg-white px-8 py-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-8">
          <div className="flex items-center gap-3"><span className="text-3xl font-black text-gray-900">4</span><span className="text-sm font-bold text-gray-500">Active Classes</span></div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex items-center gap-3"><span className="text-3xl font-black text-emerald-700">86%</span><span className="text-sm font-bold text-gray-500">Overall Progress</span></div>
        </div>
        <div className="bg-white px-8 py-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <span className="text-3xl font-black text-gray-900">124</span><span className="text-sm font-bold text-gray-500">Students Total</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {teacherClasses.map((cls, idx) => (
          <motion.div
            key={cls.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => handleEnterMarks(cls)}
            className="cursor-pointer"
          >
            <ClassCard {...cls} />
          </motion.div>
        ))}
      </div>
    </>
  );

  const renderHODDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Certification', value: '12', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Verified Matrices', value: '45', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Variance Alerts', value: '8', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Audit Flags', value: '3', icon: ShieldAlert, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md group">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
            <p className="text-[24px] font-black text-gray-900 tracking-tighter">{stat.value}</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">Submission Pipeline</h3>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-widest">Live Sync</span>
          </div>
          <div className="space-y-6">
            {[
              { name: 'General Agric', progress: 85, teacher: 'H. Eshun', status: 'In Progress' },
              { name: 'Animal Science', progress: 100, teacher: 'S. K. Mensah', status: 'SUBMITTED' },
              { name: 'Crop Science', progress: 45, teacher: 'A. B. Boateng', status: 'Drafting' },
              { name: 'Soil Science', progress: 100, teacher: 'R. Appiah', status: 'SUBMITTED' },
            ].map((dept, i) => (
              <div key={i} className="group">
                <div className="flex justify-between text-sm mb-2 px-1">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-1.5 h-1.5 rounded-full", dept.progress === 100 ? "bg-emerald-500" : dept.progress > 50 ? "bg-amber-400" : "bg-gray-300")} />
                    <span className="text-[13px] font-black text-gray-900 tracking-tight">{dept.name}</span>
                    <span className="text-[10px] font-bold text-gray-300 italic">({dept.teacher})</span>
                  </div>
                  <span className={cn("text-[11px] font-black tracking-tight", dept.progress === 100 ? "text-emerald-600" : "text-gray-400")}>{dept.progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${dept.progress}%` }} transition={{ duration: 1, delay: i * 0.1 }} className={cn("h-full rounded-full", dept.progress === 100 ? "bg-emerald-500" : "bg-emerald-500/40")} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">Audit Pulse</h3>
            <button onClick={() => navigate('/audit')} className="text-[10px] font-black text-emerald-700 uppercase tracking-widest hover:underline">Full Log</button>
          </div>
          <div className="space-y-4">
            {[
              { teacher: 'H. Eshun', action: 'Revised Math SBA (Section B)', time: '12m ago', type: 'revision' },
              { teacher: 'S. K. Mensah', action: 'Certified SHS 2 Animal Matrix', time: '45m ago', type: 'lock' },
              { teacher: 'System', action: "Auto-saved SHS 3 Crop Draft", time: '1h ago', type: 'system' },
              { teacher: 'R. Appiah', action: 'Flagged 2 Missing Observations', time: '3h ago', type: 'alert' },
            ].map((pulse, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 group cursor-pointer hover:px-2 transition-all rounded-xl">
                <div className="flex gap-4 items-center">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    pulse.type === 'revision' ? "bg-amber-50 text-amber-600" :
                    pulse.type === 'lock' ? "bg-emerald-50 text-emerald-600" :
                    pulse.type === 'alert' ? "bg-rose-50 text-rose-600" : "bg-gray-50 text-gray-400"
                  )}>
                    {pulse.type === 'revision' && <Database size={14} />}
                    {pulse.type === 'lock' && <ShieldAlert size={14} />}
                    {pulse.type === 'alert' && <AlertCircle size={14} />}
                    {pulse.type === 'system' && <Clock size={14} />}
                  </div>
                  <div>
                    <p className="text-[12px] font-black text-gray-900 tracking-tight leading-none mb-1">{pulse.action}</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{pulse.teacher}</p>
                  </div>
                </div>
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{pulse.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (user?.role === 'STUDENT') return <StudentDashboard />;
  if (user?.role === 'ADMIN') return <AdminHome />;

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2 font-display italic tracking-tight">
            {user?.role === 'TEACHER' && `Welcome, ${user.name.split(' ')[0]}!`}
            {user?.role === 'HOD' && `Departmental Pulse`}
          </h1>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
            {user?.role === 'TEACHER' && 'Classroom Authority & Assessment Matrix'}
            {user?.role === 'HOD' && 'Integrity monitoring & submission audit'}
          </p>
        </header>
        {user?.role === 'TEACHER' && renderTeacherDashboard()}
        {user?.role === 'HOD' && renderHODDashboard()}
      </motion.div>
    </div>
  );
}
