import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, RefreshCw, Eye, Key, AlertTriangle, 
  X, BookOpen, Mail, Phone, Shield, ClipboardCheck, Check,
  SlidersHorizontal, ArrowLeft, ClipboardList, ChevronDown, UserCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { LoadingSpinner } from '../../components/molecules';
import { auditTrail } from '../../services/auditTrailService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

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
      transition={{ type: 'spring', damping: 30, stiffness: 280 }}
      className="fixed top-0 right-0 bottom-0 w-full sm:w-[440px] bg-white border-l border-slate-200/80 shadow-2xl overflow-y-auto z-50 flex flex-col justify-between"
    >
      <div className="p-6 space-y-6">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Faculty Dossier</h3>
            <p className="text-sm font-bold text-slate-900 tracking-tight mt-0.5">Profile Operational Index</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full border border-slate-200/60 text-slate-500 hover:text-slate-800"
          >
            <X size={14} />
          </Button>
        </div>

        {/* Identity Profile Node */}
        <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-6 flex flex-col items-center justify-center relative shadow-3xs">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-indigo-50 border-2 border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-2xl shadow-3xs">
              {(teacher.name || '?').charAt(0).toUpperCase()}
            </div>
            {/* Soft Floating Communication Actions */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white border border-slate-200/80 rounded-full px-2.5 py-1 flex items-center gap-2 shadow-2xs">
              <button title="Call Record" className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"><Phone size={12} /></button>
              <button title="Email Record" className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"><Mail size={12} /></button>
              <button title="Syllabus Scope" className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"><BookOpen size={12} /></button>
            </div>
          </div>

          <div className="text-center mt-2">
            <p className="text-base font-bold tracking-tight text-slate-900">{teacher.name || 'Unknown Faculty'}</p>
            <p className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-md mt-1.5 inline-block">
              UID Block: #{teacher.id || '—'}
            </p>
          </div>
        </div>

        {/* Parameter Fields Grid Matrix */}
        <div className="space-y-3">
          {[
            { icon: Mail, title: 'Mail Record Address', value: teacher.email || 'No record mapped' },
            { icon: BookOpen, title: 'Instructional Core Assignment', value: teacher.subjects?.[0] || teacher.subject || 'Not Configured' },
            { icon: Users, title: 'Active Track Streams', value: Array.isArray(teacher.classes) ? `${teacher.classes.length} Core Rooms Assigned` : '0 Classes Assigned' }
          ].map((field, idx) => (
            <div key={idx} className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-200/60 shadow-3xs">
                <field.icon size={13} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{field.title}</span>
                <span className="text-xs font-semibold text-slate-800 truncate block mt-0.5">{field.value}</span>
              </div>
            </div>
          ))}

          <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 border border-slate-200/60 shadow-3xs">
              <Shield size={13} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">System Permission Context</span>
              <span className={cn("text-xs font-bold block mt-0.5", teacher.active ? 'text-emerald-700' : 'text-slate-500')}>
                {teacher.active ? 'Active Core Permission' : 'Suspended Workspace Access'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Action Rails */}
      <div className="p-6 bg-slate-50/80 border-t border-slate-200/80 flex flex-col gap-2">
        <Button 
          onClick={() => { onImpersonate?.(teacher); onClose(); }}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <Eye size={13} /> View Portal Session
        </Button>
        <Button 
          onClick={() => { onResetPassword?.(teacher); onClose(); }}
          variant="outline"
          className="w-full py-2.5 bg-white text-slate-700 border-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 shadow-3xs transition-colors"
        >
          <Key size={13} /> Reset Security Key
        </Button>
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

  useEffect(() => {
    auditTrail.setUseHodApi(true);
  }, []);

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

  useEffect(() => {
    refreshDepartmentTeachers();
  }, [refreshDepartmentTeachers]);

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
      const hodId = auditTrail.getCurrentUserId();
      if (typeof impersonateTeacherAction === 'function') {
        await impersonateTeacherAction(impersonatingTeacher.id, {
          reason: impersonateReason.trim(),
          timestamp: new Date().toISOString()
         });
        try {
          await auditTrail.logImpersonation(impersonatingTeacher.id, hodId, impersonateReason.trim());
          await auditTrail.logHODAction('IMPERSONATION_START', hodId, impersonatingTeacher.id, {
            reason: impersonateReason.trim(),
            teacherName: impersonatingTeacher.name,
            securityWarning: 'HOD impersonation session started'
          });
        } catch (e) {
          console.warn('Audit logging failed:', e);
        }
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
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50/40 font-sans antialiased pb-12">
      
      {/* Top Header Application Controls Bar */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-4 sticky top-0 z-10 backdrop-blur-md bg-white/95 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-200 bg-white hover:bg-slate-50 shadow-3xs text-slate-600">
              <ArrowLeft size={14} />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Faculty Registry</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Centralized operations control and authorization mapping matrix</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 border-slate-200 text-slate-600 shadow-3xs hidden sm:flex">
              <SlidersHorizontal size={13} className="mr-1.5 text-slate-400" /> Controls
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={refreshing || isLoading}
              variant="outline"
              size="sm"
              className="h-8 text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-3xs"
            >
              <RefreshCw size={12} className={cn("text-slate-400 mr-1.5", refreshing && 'animate-spin text-indigo-600')} />
              Synchronize Directory
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container Canvas Frame Layout */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-5">
        
        {/* Dynamic Filter Context Shell Block */}
        <div className="bg-white rounded-xl p-3 flex items-center shadow-3xs border border-slate-200/80">
          <Search size={14} className="text-slate-400 ml-2 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search faculty profile records by structural parameters or catalog mail IDs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400 font-medium"
          />
        </div>

        {/* Runtime Intercept Danger Overlay */}
        {viewAsTeacherId && (
          <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex items-center justify-between gap-4 shadow-3xs animate-fade-in">
            <div className="flex items-center gap-3 min-w-0">
              <AlertTriangle size={15} className="text-amber-600 shrink-0" />
              <span className="text-xs font-semibold text-amber-900 truncate">
                Context Intercept Triggered: Active routing context delegated to targeted View State.
              </span>
            </div>
            <Button
              onClick={stopImpersonationAction}
              className="h-7 px-3 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors shrink-0"
            >
              Terminate Session
            </Button>
          </div>
        )}

        {/* Execution Content Framework Container */}
        {isLoading && departmentTeachers.length === 0 ? (
          <div className="bg-white rounded-xl flex flex-col items-center justify-center p-20 border border-slate-200/80 shadow-3xs">
            <LoadingSpinner size="md" className="text-slate-800" />
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider mt-3">Re-indexing Local Matrix...</span>
          </div>
        ) : filteredTeachers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTeachers.map((teacher) => (
              <Card 
                key={teacher.id} 
                onClick={() => setSelectedTeacher(teacher)} 
                className="bg-white hover:border-slate-300 border-slate-200/80 rounded-xl p-5 shadow-3xs group hover:shadow-2xs transition-all relative flex flex-col justify-between cursor-pointer"
              >
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-md shadow-3xs">
                     ★ {teacher.rating || '—'}
                  </span>
                </div>

                <div className="flex flex-col items-center text-center pt-2 pb-5">
                  <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 text-slate-600 font-bold flex items-center justify-center text-base shadow-3xs group-hover:scale-105 transition-transform duration-200">
                    {(teacher.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-3.5 tracking-tight group-hover:text-indigo-600 transition-colors">{teacher.name || 'Faculty Member'}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {teacher.id || 'No ID mapped'}</p>
                  
                  <span className="mt-3.5 inline-block px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 font-semibold uppercase tracking-wider text-[9px] rounded-md">
                     {teacher.subjects?.[0] || 'General Studies'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 mt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImpersonateInitiate(teacher);
                    }}
                    className="py-1.5 px-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 text-[10px] font-bold text-slate-600 hover:text-indigo-700 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Eye size={11} /> Session
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePasswordReset(teacher);
                    }}
                    className="py-1.5 px-2 bg-slate-50 hover:bg-amber-50 border border-slate-200/60 text-[10px] font-bold text-slate-600 hover:text-amber-700 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Key size={11} /> Access
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/80 p-20 text-center shadow-3xs flex flex-col items-center justify-center">
            <div className="p-3 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl mb-3">
              <Users size={28} />
            </div>
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">No Catalogued Records Mapped</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-medium">Try widening filter strings or dispatching a localized refresh command.</p>
          </div>
        )}
      </main>

      {/* Slide-over Profile Drawer Canvas Overlay */}
      <AnimatePresence>
        {selectedTeacher && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTeacher(null)}
              className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-40"
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

      {/* Authorization Verification Modal Window */}
      <AnimatePresence>
        {impersonatingTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/30 backdrop-blur-xs"
              onClick={() => setImpersonatingTeacher(null)}
            />
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 z-10 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg flex items-center justify-center shadow-3xs">
                    <UserCheck size={14} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Authorize Context Delegation</h3>
                </div>
                <Button
                  onClick={() => setImpersonatingTeacher(null)}
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X size={12} />
                </Button>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  You are staging a temporary runtime access session mapped to <span className="font-bold text-slate-900">{impersonatingTeacher.name}</span>. Actions deployed log back directly to local infrastructure security trails.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-0.5">Override Reference Ticket Reason</label>
                <textarea
                  placeholder="State operational ticket parameters or directive context here..."
                  value={impersonateReason}
                  onChange={(e) => setImpersonateReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50/50 resize-none text-slate-800 font-medium"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={() => setImpersonatingTeacher(null)}
                  variant="outline"
                  className="flex-1 py-2 text-xs font-semibold rounded-xl text-slate-600 border-slate-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExecuteImpersonation}
                  disabled={!impersonateReason.trim()}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-40"
                >
                  Instantiate Session
                </Button>
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
              className="absolute inset-0 bg-slate-950/30 backdrop-blur-xs"
              onClick={() => setGeneratedPassword(null)}
            />
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 p-6 z-10 text-center space-y-4"
            >
              <div className="w-9 h-9 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-3xs">
                <Key size={14} />
              </div>

              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Credentials Mutated</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Target Identity: <span className="text-slate-600 font-bold">{generatedPassword.teacherName}</span>
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1 shadow-3xs">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Disposable Plaintext Token</span>
                <p className="text-base font-mono font-bold text-slate-900 tracking-wider select-all break-all px-2">
                  {generatedPassword.password}
                </p>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl text-left border border-amber-100/50">
                <p className="text-[10px] leading-relaxed text-amber-800 font-semibold">
                  Security Lock Pattern: This reference is transient and completely decoupled from internal data frameworks. Transfer securely immediately.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={() => handleCopyToken(generatedPassword.password)}
                  className={cn(
                    "flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all text-white shadow-xs",
                    copied ? "bg-emerald-700 hover:bg-emerald-700" : "bg-indigo-600 hover:bg-indigo-700"
                  )}
                >
                  {copied ? <Check size={13} /> : <ClipboardCheck size={13} />}
                  {copied ? "Copied!" : "Copy Token"}
                </Button>
                <Button
                  onClick={() => setGeneratedPassword(null)}
                  variant="outline"
                  className="px-4 py-2 border-slate-200 text-slate-600 font-semibold text-xs rounded-xl"
                >
                  Dismiss
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HODTeachers;