import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRole } from '../../context/RoleContext';
import { useBreadcrumb } from '../../context/BreadcrumbContext';
import { adminService } from '../../services/adminService';
import { EmptyState } from '../../components/molecules';
import '@/index.css';
import {
  User, Mail, Phone, BookOpen, Users, Award, Calendar, Shield, GraduationCap,
  TrendingUp, Bell, ChevronRight, Activity, School, Hash, MapPin, UserCheck,
  CheckCircle2, XCircle, Clock, FileText, BarChart3
} from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return '—'; }
}

function SimpleBar({ value, max = 100, color = 'bg-brand-secondary' }) {
  const pct = Math.min(100, Math.max(0, (Number(value) || 0) / max * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono font-bold text-gray-600 w-8 text-right">{value ?? 0}</span>
    </div>
  );
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: UserCheck },
  { id: 'assignments', label: 'Teaching Load', icon: BookOpen },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'activity', label: 'Activity', icon: Activity },
];

export function TeacherProfile() {
  const { user: currentUser } = useRole();
  const { setBreadcrumb } = useBreadcrumb();
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const userId = new URLSearchParams(window.location.search).get('id');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setApiError(null);
    adminService.getStaffProfile(userId)
      .then((data) => {
        setTeacherData(data || null);
      })
      .catch((e) => {
        console.error('Failed to fetch teacher profile:', e);
        setApiError(e?.message || 'Failed to load teacher profile');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    const tabLabel = TABS.find(t => t.id === activeTab)?.label || activeTab;
    setBreadcrumb([{ label: 'Teacher Profile', path: '/teacher-profile' }, { label: tabLabel, path: null }]);
  }, [activeTab, setBreadcrumb]);

  const teacher = teacherData;
  const userName = teacher
    ? `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Unknown'
    : null;
  const staffId = teacher?.staffId || teacher?.id || '—';
  const role = teacher?.user?.role || 'TEACHER';
  const department = teacher?.department?.name || '—';
  const email = teacher?.user?.email || '—';
  const phone = teacher?.user?.phone || '—';
  const isActive = teacher?.user?.isActive ?? true;
  const lastLogin = teacher?.user?.lastLoginAt || null;
  const teachingAssignments = teacher?.teachingAssignments || [];
  const subjectCount = new Set(teachingAssignments.map(a => a.subject?.id)).size;
  const classCount = new Set(teachingAssignments.map(a => a.classSection?.id)).size;
  const studentCount = useMemo(() => {
    const unique = new Set(teachingAssignments.map(a => a.classSection?.id));
    return unique.size;
  }, [teachingAssignments]);

  const notifications = useMemo(() => {
    // Teacher profile page doesn't expose private notification inbox
    // Staff notifications come from the Topbar bell
    return [];
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F4F3EA] p-6">
        <div className="text-center">
          <User size={48} className="text-gray-300 mx-auto mb-3 animate-pulse" />
          <p className="text-xs font-medium text-gray-500">Loading teacher profile...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F4F3EA] p-6">
        <div className="text-center">
          <User size={48} className="text-gray-300 mx-auto mb-3" />
          {apiError ? (
            <div>
              <p className="text-xs font-medium text-red-500 mb-1">Error loading profile</p>
              <p className="text-[10px] text-gray-400">{apiError}</p>
            </div>
          ) : (
            <EmptyState context="teachers" />
          )}
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Subjects', value: subjectCount, icon: BookOpen, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Classes', value: classCount, icon: School, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { label: 'Status', value: isActive ? 'Active' : 'Inactive', icon: isActive ? CheckCircle2 : XCircle, color: isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200' },
  ];

  return (
    <div className="w-full h-screen bg-[#F4F3EA] text-[#1C1C1E] p-5 font-sans antialiased flex flex-col overflow-hidden">
      <header className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#1C1C1E]">Teacher Profile</h1>
          <p className="text-[10px] text-gray-400 font-medium">{department}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 text-xs font-medium rounded-xl flex items-center gap-2 ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            {isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white/60 border border-white/80 rounded-[24px] p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[12px] bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
                  <UserCheck size={28} />
                </div>
                <div>
                  <h2 className="text-lg font-bold leading-tight">{userName}</h2>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {staffId}</p>
                  <p className="text-[10px] text-gray-500">{role}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <Mail size={11} className="text-gray-400" />
                  <span className="truncate">{email}</span>
                </div>
                {phone && (
                  <div className="flex items-center gap-2 text-[11px] text-gray-600">
                    <Phone size={11} className="text-gray-400" />
                    <span className="truncate">{phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <MapPin size={11} className="text-gray-400" />
                  <span className="truncate">{department}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-600">
                  <Calendar size={11} className="text-gray-400" />
                  <span>Last login: {lastLogin ? formatDate(lastLogin) : 'Never'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/60 border border-white/80 rounded-[24px] p-4">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Performance Stats</h3>
              <div className="grid grid-cols-1 gap-2">
                {stats.map((stat) => (
                  <div key={stat.label} className={`p-3 rounded-xl border ${stat.color}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-wider opacity-70">{stat.label}</p>
                        <p className="text-sm font-black">{stat.value}</p>
                      </div>
                      <stat.icon size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white/40 border border-white/80 rounded-[24px] p-4">
              <div className="flex items-center gap-4 border-b border-gray-200/40 mb-4">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 pb-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      activeTab === tab.id ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <tab.icon size={11} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div className="bg-white/40 border border-white/80 rounded-[24px] p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1 text-gray-600">
                    <BookOpen size={12} /> Teaching Assignments Summary
                  </h3>
                  {teachingAssignments.length > 0 ? (
                    <div className="space-y-2">
                      {teachingAssignments.map((assignment, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white/80 border border-slate-100 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 border border-indigo-100">
                              <BookOpen size={14} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-800">{assignment.subject?.name || 'Subject'}</p>
                              <p className="text-[10px] text-gray-500">{assignment.classSection?.name || 'Class'}</p>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-gray-400" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState context="teachers" variant="compact" />
                  )}
                </div>
              )}

              {activeTab === 'assignments' && (
                <div className="bg-white/40 border border-white/80 rounded-[24px] p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1 text-gray-600">
                    <BarChart3 size={12} /> Detailed Class Load
                  </h3>
                  {teachingAssignments.length > 0 ? (
                    <div className="space-y-3">
                      {teachingAssignments.map((assignment, idx) => (
                        <div key={idx} className="p-4 bg-white/80 border border-slate-100 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-800">{assignment.subject?.name || 'Unknown Subject'}</span>
                            <span className="text-[9px] font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                              {assignment.term || 'Term'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500">
                            <School size={10} />
                            <span>{assignment.classSection?.name || 'Unassigned'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState context="teachers" variant="compact" />
                  )}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 py-6 text-center">Notifications are available in the Topbar bell for this view.</p>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="bg-white/40 border border-white/80 rounded-[24px] p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1 text-gray-600">
                    <Activity size={12} /> Recent Account Activity
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 text-xs border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-gray-400" />
                        <span className="font-medium text-gray-700">Last Login</span>
                      </div>
                      <span className="font-mono text-gray-600">{lastLogin ? formatDate(lastLogin) : 'Never'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 text-xs border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <FileText size={12} className="text-gray-400" />
                        <span className="font-medium text-gray-700">Account Status</span>
                      </div>
                      <span className={`font-black uppercase ${isActive ? 'text-emerald-700' : 'text-slate-500'}`}>{isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 text-xs border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <BookOpen size={12} className="text-gray-400" />
                        <span className="font-medium text-gray-700">Teaching Assignments</span>
                      </div>
                      <span className="font-mono text-gray-600">{teachingAssignments.length}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Shield size={12} className="text-gray-400" />
                        <span className="font-medium text-gray-700">Role</span>
                      </div>
                      <span className="font-black uppercase text-gray-800">{teacher?.user?.role || 'TEACHER'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherProfile;
