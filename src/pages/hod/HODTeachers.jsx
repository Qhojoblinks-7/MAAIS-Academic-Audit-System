import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, RefreshCw, Eye, Key, AlertTriangle, 
  X, BookOpen, Mail, Phone, Shield, ClipboardCheck, Check 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { LoadingSpinner } from '../../components/molecules';
import { TeacherCard } from '../../components/organisms/TeacherImpersonationConsole';

// ==========================================
// COMPONENT: SLIDE-OVER DETAIL PROFILE PANEL
// ==========================================
function TeacherProfileDetails({ teacher, onClose, onImpersonate, onResetPassword }) {
  if (!teacher) return null;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 26, stiffness: 220 }}
      className="absolute top-0 right-0 bottom-0 w-full sm:w-96 bg-white border-l border-gray-200/60 shadow-2xl overflow-y-auto z-20"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-gray-900">Teacher Profile</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center text-purple-700 font-bold text-xl">
            {(teacher.name || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">{teacher.name || 'Unknown User'}</p>
            <p className="text-[10px] text-gray-400 font-mono tracking-wider">{teacher.id || '—'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Contact Information</p>
            <div className="space-y-2">
              {teacher.email && (
                <div className="flex items-center gap-2 text-xs">
                  <Mail size={12} className="text-gray-400 shrink-0" />
                  <span className="text-gray-700 truncate">{teacher.email}</span>
                </div>
              )}
              {teacher.phone && (
                <div className="flex items-center gap-2 text-xs">
                  <Phone size={12} className="text-gray-400 shrink-0" />
                  <span className="text-gray-700">{teacher.phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-b border-gray-100 pb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Teaching Details</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <BookOpen size={12} className="text-gray-400 shrink-0" />
                <span className="text-gray-700">Subject: {teacher.subject || 'Not Configured'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Users size={12} className="text-gray-400 shrink-0" />
                <span className="text-gray-700">
                  {teacher.classes ? `${teacher.classes.length} Classes Assigned` : '0 Classes Assigned'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Account Status</p>
            <div className="flex items-center gap-2 text-xs">
              <Shield size={12} className={teacher.active ? 'text-emerald-600' : 'text-gray-400'} />
              <span className={teacher.active ? 'text-emerald-700 font-medium' : 'text-gray-500'}>
                {teacher.active ? 'Active Core Permission' : 'Suspended Workspace Access'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-100 space-y-2">
          <button 
            onClick={() => { onImpersonate?.(teacher); onClose(); }}
            className="w-full px-3 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Eye size={12} /> View Portal Session
          </button>
          <button 
            onClick={() => { onResetPassword?.(teacher); onClose(); }}
            className="w-full px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold rounded-xl hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Key size={12} /> Reset Security Key
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// MAIN WORKSPACE INTERFACE: HODTEACHERS
// ==========================================
export function HODTeachers() {
  const {
    departmentTeachers = [],
    refreshDepartmentTeachers,
    resetTeacherPasswordAction,
    impersonateTeacherAction,
    viewAsTeacherId,
    stopImpersonationAction,
    isLoading
  } = useHOD();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [impersonatingTeacher, setImpersonatingTeacher] = useState(null);
  const [impersonateReason, setImpersonateReason] = useState('');
  const [copied, setCopied] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (typeof refreshDepartmentTeachers === 'function') {
        await refreshDepartmentTeachers();
      }
    } catch (error) {
      console.error("Failed synchronizing department teachers matrix:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredTeachers = useMemo(() => {
    const list = Array.isArray(departmentTeachers) ? departmentTeachers : [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(t =>
      (t?.name || '').toLowerCase().includes(q) ||
      (t?.email || '').toLowerCase().includes(q) ||
      (t?.id || '').toLowerCase().includes(q)
    );
  }, [departmentTeachers, searchQuery]);

  const handlePasswordReset = async (teacher) => {
    if (!teacher?.id) return;
    
    // Explicit crypto-safe placeholder or clean math generation pattern
    const newPassword = Math.random().toString(36).slice(2, 11) +
                        Math.random().toString(36).slice(2, 11).toUpperCase();
    try {
      if (typeof resetTeacherPasswordAction === 'function') {
        await resetTeacherPasswordAction(teacher.id, newPassword);
        setGeneratedPassword({
          teacherId: teacher.id,
          teacherName: teacher.name || 'Faculty Member',
          password: newPassword
        });
      }
    } catch (error) {
      console.error("Critical credential alteration routine failure:", error);
    }
  };

  const handleImpersonateInitiate = (teacher) => {
    setImpersonatingTeacher(teacher);
    setImpersonateReason('');
  };

  const handleExecuteImpersonation = async () => {
    if (!impersonatingTeacher?.id || !impersonateReason.trim()) return;
    try {
      if (typeof impersonateTeacherAction === 'function') {
        await impersonateTeacherAction(impersonatingTeacher.id, {
          reason: impersonateReason.trim(),
          timestamp: new Date().toISOString()
        });
        setImpersonatingTeacher(null);
      }
    } catch (error) {
      console.error("Context assignment interop violation:", error);
    }
  };

  const handleCopyToken = (str) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/40 antialiased font-sans relative">
      <div className="flex-1 overflow-auto p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/60 pb-5">
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Faculty Control Console</h1>
              <p className="text-xs text-gray-400 mt-0.5">Audit department personnel accounts, trace permission states, and authorize structural overrides.</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              className="px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-xs transition-all disabled:opacity-40 shrink-0 self-start sm:self-center cursor-pointer"
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              Synchronize Directory
            </button>
          </div>

          {/* Core Lookup Search input bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Filter active registry records by profile identity string or metadata mail records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/10 bg-white placeholder:text-gray-400 text-gray-800"
            />
          </div>

          {/* Active Framework Interception Alert Banner */}
          {viewAsTeacherId && (
            <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-4 flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                <span className="text-xs font-semibold text-amber-900 truncate">
                  Active Context Intercept: Redirecting state updates to targeted Faculty Authorization View.
                </span>
              </div>
              <button
                onClick={stopImpersonationAction}
                className="px-3 py-1.5 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-amber-700 transition-colors shrink-0 cursor-pointer"
              >
                Terminate Session
              </button>
            </div>
          )}

          {/* Registry Data Grid Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoading && departmentTeachers.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center p-12 gap-2">
                <LoadingSpinner size="md" className="text-purple-600" />
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Syncing Local Records...</span>
              </div>
            ) : filteredTeachers.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <div 
                  key={teacher.id} 
                  onClick={() => setSelectedTeacher(teacher)} 
                  className="cursor-pointer group"
                >
                  <TeacherCard
                    teacher={teacher}
                    onImpersonate={(t, e) => {
                      e?.stopPropagation(); // Block slide-over pipeline triggering
                      handleImpersonateInitiate(t);
                    }}
                    onResetPassword={(t, e) => {
                      e?.stopPropagation(); // Block slide-over pipeline triggering
                      handlePasswordReset(t);
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-xl border border-gray-200/60 p-12 text-center shadow-xs">
                <Users size={36} className="text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">No Registered Records Found</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Try widening your search terms or pull fresh directory parameters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-over Profile Drawer Canvas */}
      <AnimatePresence>
        {selectedTeacher && (
          <>
            {/* Component Backdrop Layer overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTeacher(null)}
              className="fixed inset-0 bg-slate-900/10 backdrop-blur-3xs z-10"
            />
            <TeacherProfileDetails
              teacher={selectedTeacher}
              onClose={() => setSelectedTeacher(null)}
              onImpersonate={handleImpersonateInitiate}
              onResetPassword={handlePasswordReset}
            />
          </>
        )}
      </AnimatePresence>

      {/* Context Delegation Modal Window Overlay */}
      <AnimatePresence>
        {impersonatingTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setImpersonatingTeacher(null)}
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 4 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 4 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                    <Eye size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Authorize Context Delegation</h3>
                </div>
                <button
                  onClick={() => setImpersonatingTeacher(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3.5">
                <p className="text-[11px] text-purple-950 leading-relaxed">
                  You are logging into the data framework under the credential context of <span className="font-bold text-purple-700">{impersonatingTeacher.name}</span>. Mutable actions taken will register your account signature to security compliance trails.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Reason for Request Override</label>
                <textarea
                  placeholder="Describe your tracking context or administrative directive ticket reference here..."
                  value={impersonateReason}
                  onChange={(e) => setImpersonateReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/10 bg-slate-50/30 resize-none text-gray-800"
                />
              </div>

              <div className="flex gap-2 pt-1.5">
                <button
                  onClick={() => setImpersonatingTeacher(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteImpersonation}
                  disabled={!impersonateReason.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  Instantiate Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Mutation Notification Overlay */}
      <AnimatePresence>
        {generatedPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setGeneratedPassword(null)}
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 4 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 4 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-10 text-center space-y-4"
            >
              <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
                <Key size={18} />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-gray-900">Credentials Mutated Successfully</h3>
                <p className="text-[11px] text-gray-400">
                  Target Identity Profile: <span className="text-gray-700 font-semibold">{generatedPassword.teacherName}</span>
                </p>
              </div>

              <div className="bg-slate-50 border border-gray-200/70 rounded-xl p-4 space-y-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Disposable Plaintext Key</span>
                <p className="text-base font-mono font-bold text-slate-900 tracking-wider select-all break-all px-2">
                  {generatedPassword.password}
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200/50 rounded-xl text-left">
                <p className="text-[10px] leading-relaxed text-amber-800 font-medium">
                  <strong>Security Rule Enforced:</strong> This reference is decoupled from local data caches. It will not persist inside future state logs. Copy and pipe it to the target recipient immediately.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleCopyToken(generatedPassword.password)}
                  className={cn(
                    "flex-1 px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs border text-white",
                    copied ? "bg-emerald-700 border-emerald-700" : "bg-emerald-600 border-emerald-600 hover:bg-emerald-700"
                  )}
                >
                  {copied ? <Check size={13} /> : <ClipboardCheck size={13} />}
                  {copied ? "Copied Plaintext!" : "Copy Key String"}
                </button>
                <button
                  onClick={() => setGeneratedPassword(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}