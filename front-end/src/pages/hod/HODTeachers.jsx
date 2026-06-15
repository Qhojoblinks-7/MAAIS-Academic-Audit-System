import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, RefreshCw, Eye, Key, AlertTriangle, 
  X, BookOpen, Mail, Phone, Shield, ClipboardCheck, Check,
  SlidersHorizontal, ArrowLeft, Maximize2, MessageSquare, Plus,
  MapPin, Briefcase, ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { LoadingSpinner } from '../../components/molecules';
import { TeacherCard } from '../../components/organisms/TeacherImpersonationConsole';
import { auditTrail } from '../../services/auditTrailService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

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
      transition={{ type: 'spring', damping: 30, stiffness: 250 }}
      className="absolute top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white border-l border-slate-200/40 shadow-2xl overflow-y-auto z-20 flex flex-col justify-between"
    >
      <div className="p-6 space-y-6">
        {/* Panel Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Faculty Dossier</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-full flex items-center justify-center border border-slate-200/40 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Identity Section matching image aesthetic */}
        <div className="bg-[#F3F2EA]/40 border border-slate-200/30 rounded-[32px] p-5 flex flex-col items-center justify-center relative shadow-3xs">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full bg-[#FFDE4D] border-4 border-white shadow-sm flex items-center justify-center text-slate-900 font-black text-2xl">
              {(teacher.name || '?').charAt(0).toUpperCase()}
            </div>
            {/* Soft floating pill actions from reference dashboard */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white border border-slate-200/60 rounded-full px-3 py-1 flex items-center gap-2.5 shadow-xs">
              <button className="p-1 text-slate-500 hover:text-slate-900 transition-colors"><Phone size={12} /></button>
              <button className="p-1 text-slate-500 hover:text-slate-900 transition-colors"><Mail size={12} /></button>
              <button className="p-1 text-slate-500 hover:text-slate-900 transition-colors"><BookOpen size={12} /></button>
            </div>
          </div>

          <div className="text-center mt-2">
            <p className="text-lg font-black tracking-tight text-slate-900">{teacher.name || 'Unknown Faculty'}</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">UID Block: #{teacher.id || '—'}</p>
          </div>
        </div>

        {/* Informational Parameter Layout Mesh */}
        <div className="space-y-3">
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-200/40 shadow-3xs"><Mail size={13} /></div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 block font-medium">Mail Record Address</span>
              <span className="text-xs font-bold text-slate-800 truncate block">{teacher.email || 'No record mapped'}</span>
            </div>
          </div>

          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-200/40 shadow-3xs"><BookOpen size={13} /></div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 block font-medium">Instructional Core Assignment</span>
              <span className="text-xs font-bold text-slate-800 truncate block">{teacher.subject || 'Not Configured'}</span>
            </div>
          </div>

          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-200/40 shadow-3xs"><Users size={13} /></div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 block font-medium">Active Track Streams</span>
              <span className="text-xs font-bold text-slate-800 block">
                {teacher.classes ? `${teacher.classes.length} Core Rooms Assigned` : '0 Classes Assigned'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-200/40 shadow-3xs"><Shield size={13} /></div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 block font-medium">System Permission Context</span>
              <span className={cn("text-xs font-bold block", teacher.active ? 'text-emerald-700' : 'text-slate-500')}>
                {teacher.active ? 'Active Core Permission' : 'Suspended Workspace Access'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Bottom Drawer Control Rails */}
      <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-2">
        <button 
          onClick={() => { onImpersonate?.(teacher); onClose(); }}
          className="w-full px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Eye size={12} /> View Portal Session
        </button>
        <button 
          onClick={() => { onResetPassword?.(teacher); onClose(); }}
          className="w-full px-4 py-2.5 bg-white text-slate-700 border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 shadow-3xs transition-colors cursor-pointer"
        >
          <Key size={12} /> Reset Security Key
        </button>
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
    <div className="w-full h-screen bg-[#F3F2EA] text-[#1C1C1E] p-6 font-sans antialiased flex flex-col overflow-hidden select-none">
      
      {/* Top Application Bar Controls - Derived directly from the uploaded blueprint */}
      <header className="flex items-center justify-between mb-5 shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#1C1C1E] mr-2">Faculty Registry</h1>
          <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-xs text-slate-700 hover:bg-slate-50 transition-colors">
            <ArrowLeft size={16} />
          </button>
          <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-xs text-slate-700 hover:bg-slate-50 transition-colors">
            <SlidersHorizontal size={15} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
            className="px-4 py-2 bg-white border border-white hover:bg-slate-50 text-xs font-bold text-slate-800 rounded-full shadow-xs flex items-center gap-2 transition-all disabled:opacity-40"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-purple-600' : 'text-slate-400'} />
            <span>Synchronize Directory</span>
          </button>
        </div>
      </header>

      {/* Work Canvas Segment Splitting Workspace */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-5 overflow-hidden">
        
        {/* Core Profile Container Frame Panel */}
        <div className="col-span-12 lg:col-span-9 flex flex-col space-y-4 overflow-y-auto pr-1">
          
          {/* Fluid Modern Filter Interface Bar */}
          <div className="bg-white rounded-[32px] p-4 flex items-center shadow-xs border border-white/40">
            <Search size={14} className="text-slate-400 ml-2 mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search faculty profile records by structural parameters or catalog mail IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Context Interference Dynamic Warning Banner */}
          {viewAsTeacherId && (
            <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-3xs animate-fade-in">
              <div className="flex items-center gap-3 min-w-0">
                <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                <span className="text-xs font-bold text-amber-900 truncate">
                  Context Intercept Triggered: Active routing context delegated to targeted View State.
                </span>
              </div>
              <button
                onClick={stopImpersonationAction}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors shrink-0"
              >
                Terminate Session
              </button>
            </div>
          )}

          {/* Core Grid Matrix Workspace Framework */}
          {isLoading && departmentTeachers.length === 0 ? (
            <div className="flex-1 bg-white rounded-[32px] flex flex-col items-center justify-center p-12 gap-2 border border-white/40 shadow-xs">
              <LoadingSpinner size="md" className="text-slate-900" />
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider mt-1">Re-indexing Local Matrix...</span>
            </div>
          ) : filteredTeachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTeachers.map((teacher) => (
                <div 
                  key={teacher.id} 
                  onClick={() => setSelectedTeacher(teacher)} 
                  className="bg-white hover:bg-slate-50/50 border border-white rounded-[32px] p-5 shadow-xs transition-all relative flex flex-col justify-between group cursor-pointer"
                >
                  <div className="absolute top-4 left-4 flex items-center gap-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#98FF98] text-emerald-800 rounded-full shadow-3xs">
                      ★ {teacher.rating || '4.8'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center pt-2 pb-4">
                    <div className="w-16 h-16 rounded-full bg-[#F3F2EA] border-2 border-white shadow-3xs flex items-center justify-center font-black text-slate-700 text-lg group-hover:scale-105 transition-transform">
                      {(teacher.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mt-3 tracking-tight">{teacher.name || 'Faculty Member'}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{teacher.id || 'No ID mapped'}</p>
                    
                    <span className="mt-3 inline-block px-3 py-1 bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[9px] rounded-lg">
                      {teacher.subject || 'General Studies'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImpersonateInitiate(teacher);
                      }}
                      className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/30 text-[10px] font-bold text-slate-700 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye size={11} /> Session
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePasswordReset(teacher);
                      }}
                      className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/30 text-[10px] font-bold text-slate-700 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Key size={11} /> Access
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-[32px] border border-white/40 p-12 text-center shadow-xs flex flex-col items-center justify-center">
              <Users size={32} className="text-slate-300 mb-3" />
              <p className="text-xs font-black text-slate-800 uppercase tracking-wider">No Catalogued Records Mapped</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">Try widening filter strings or dispatching a localized refresh command.</p>
            </div>
          )}
        </div>

        

      </div>

      {/* Slide-over Profile Drawer Canvas Overlay */}
      <AnimatePresence>
        {selectedTeacher && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTeacher(null)}
              className="fixed inset-0 bg-slate-950/10 backdrop-blur-xs z-10"
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
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-xs"
              onClick={() => setImpersonatingTeacher(null)}
            />
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-white/40 p-6 z-10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#FFDE4D] rounded-xl flex items-center justify-center text-slate-900 shadow-3xs">
                    <Eye size={15} />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Authorize Context Delegation</h3>
                </div>
                <button
                  onClick={() => setImpersonatingTeacher(null)}
                  className="w-7 h-7 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full flex items-center justify-center border border-slate-200/50 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>

              <div className="bg-[#F3F2EA]/60 border border-slate-200/30 rounded-2xl p-4">
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  You are staging a temporary runtime access session mapped to <span className="font-black text-slate-900">{impersonatingTeacher.name}</span>. Actions deployed log back directly to local infrastructure security trails.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-0.5">Override Reference Ticket Reason</label>
                <textarea
                  placeholder="State operational ticket parameters or directive context here..."
                  value={impersonateReason}
                  onChange={(e) => setImpersonateReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 text-xs border border-slate-200/60 rounded-xl focus:outline-none bg-slate-50/50 resize-none text-slate-800 font-medium"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setImpersonatingTeacher(null)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteImpersonation}
                  disabled={!impersonateReason.trim()}
                  className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-40"
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
              className="absolute inset-0 bg-slate-950/20 backdrop-blur-xs"
              onClick={() => setGeneratedPassword(null)}
            />
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-white/40 p-6 z-10 text-center space-y-4"
            >
              <div className="w-10 h-10 bg-[#98FF98] rounded-full flex items-center justify-center text-emerald-900 mx-auto shadow-3xs">
                <Key size={16} />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Credentials Mutated</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Target Identity: <span className="text-slate-700 font-bold">{generatedPassword.teacherName}</span>
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-1 shadow-3xs">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Disposable Plaintext Token</span>
                <p className="text-base font-mono font-black text-slate-950 tracking-wider select-all break-all px-2">
                  {generatedPassword.password}
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-left border border-amber-100/50">
                <p className="text-[10px] leading-relaxed text-amber-800 font-bold">
                  Security Lock Pattern: This reference is transient and completely decoupled from internal data frameworks. Transfer securely immediately.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => handleCopyToken(generatedPassword.password)}
                  className={cn(
                    "flex-1 px-4 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-white border",
                    copied ? "bg-emerald-700 border-emerald-700" : "bg-emerald-600 border-emerald-600 hover:bg-emerald-700"
                  )}
                >
                  {copied ? <Check size={13} /> : <ClipboardCheck size={13} />}
                  {copied ? "Copied Plaintext!" : "Copy Token"}
                </button>
                <button
                  onClick={() => setGeneratedPassword(null)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl transition-colors"
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

export default HODTeachers;