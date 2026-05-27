import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Eye, Key, AlertTriangle, Clock, 
  StopCircle, RefreshCw, XCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { LoadingSpinner, EmptyState, ConfirmationDialog } from '../molecules';
import { useHOD } from '../../context/HODContext';
import { auditTrail } from '../../services/auditTrailService';
import { eventBus } from '../../services/eventBus';

// ==========================================
// IMPERSONATION SYSTEM STATUS BANNER
// ==========================================
function ImpersonationBanner({ teacherName, onStop }) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-purple-50 border border-purple-200/60 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center shrink-0 border border-purple-200/40">
          <Eye size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-purple-900">
            Active Workspace Mirror: Viewing as <span className="font-black uppercase tracking-wide text-purple-700">{teacherName}</span>
          </p>
          <p className="text-[10px] text-purple-600 mt-0.5 flex items-center gap-1.5 font-mono">
            <Clock size={11} className="text-purple-400" />
            Session Duration: {Math.floor(time / 60)}m {String(time % 60).padStart(2, '0')}s
          </p>
        </div>
      </div>

      <button
        onClick={onStop}
        className="px-3 py-1.5 bg-purple-700 text-white text-[10px] font-bold rounded-xl hover:bg-purple-800 flex items-center gap-1.5 shrink-0 shadow-xs transition-colors"
      >
        <StopCircle size={12} />
        Stop Impersonation
      </button>
    </motion.div>
  );
}

// ==========================================
// TEACHER GRID DETAIL CARD 
// ==========================================
// ==========================================
// TEACHER GRID DETAIL CARD (REDESIGNED)
// ==========================================
export function TeacherCard({ teacher, onImpersonate, onResetPassword }) {
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleResetPassword = async (e) => {
    e?.stopPropagation(); // Block bubbling if card has a parent click handler
    if (onResetPassword) {
      await onResetPassword(teacher);
    }
    setShowResetDialog(false);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-150 p-5 flex flex-col justify-between gap-5 hover:border-purple-200 hover:shadow-md hover:shadow-purple-500/[0.02] transition-all duration-200">
      
      {/* Top Section: Identity Details */}
      <div className="flex items-start gap-4">
        {/* Avatar Container with Integrated Status Dot Ring */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100/80 border border-purple-100 flex items-center justify-center text-lg font-bold text-purple-700 shadow-3xs group-hover:scale-102 transition-transform duration-200">
            {(teacher.name || '?').charAt(0).toUpperCase()}
          </div>
          {/* Status Indicator Pill Rim */}
          <span className={cn(
            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-3xs flex items-center justify-center",
            teacher.active ? "bg-emerald-500" : "bg-gray-300"
          )} title={teacher.active ? "Active" : "Inactive"} />
        </div>

        {/* Identity & Curricula Block */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-purple-950 transition-colors">
              {teacher.name || 'Unknown Faculty'}
            </h4>
            <p className="text-[10px] font-mono font-medium text-gray-400 tracking-wider mt-0.5">
              {teacher.id || 'ID—UNASSIGNED'}
            </p>
          </div>

          {/* Target Subject Tags Container */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="px-2 py-0.5 bg-gray-50 text-gray-600 border border-gray-200/60 text-[10px] font-semibold rounded-md truncate max-w-[140px]">
              {teacher.subject || 'General Curricula'}
            </span>
            <span className={cn(
              "px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md",
              teacher.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
            )}>
              {teacher.active ? "Active" : "Suspended"}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Section: Secure Contact Information Details */}
      <div className="bg-slate-50/60 rounded-xl px-3 py-2.5 space-y-1.5 border border-slate-100">
        <div className="flex items-center justify-between text-[11px] min-w-0 gap-3">
          <span className="text-gray-400 font-medium">Secure Email</span>
          <span className="text-gray-600 font-medium truncate max-w-[180px]" title={teacher.email}>
            {teacher.email || '—'}
          </span>
        </div>
      </div>

      {/* Bottom Section: Dedicated Component Control Triggers */}
      <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3.5">
        <button
          onClick={(e) => {
            e?.stopPropagation();
            onImpersonate?.(teacher, e);
          }}
          disabled={!teacher.active}
          className="w-full px-3 py-2 bg-purple-600 text-white text-[11px] font-bold rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:hover:bg-purple-600 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Eye size={12} className="shrink-0" />
          <span>View Portal</span>
        </button>
        
        <button
          onClick={(e) => {
            e?.stopPropagation();
            setShowResetDialog(true);
          }}
          className="w-full px-3 py-2 bg-white text-gray-700 border border-gray-200 text-[11px] font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Key size={12} className="shrink-0 text-gray-400" />
          <span>Reset Auth</span>
        </button>
      </div>

      {/* Structural Backdrop Modals */}
      <ConfirmationDialog
        open={showResetDialog}
        title="Reset Account Credentials"
        message={`Are you sure you want to initialize password reset protocols for ${teacher.name || 'this instructor'}? A dynamic randomized credential key will override current tokens.`}
        confirmLabel="Confirm System Overwrite"
        onConfirm={handleResetPassword}
        onCancel={(e) => {
          e?.stopPropagation();
          setShowResetDialog(false);
        }}
        variant="warning"
      />
    </div>
  );
}

// ==========================================
// PARENT WORKSPACE MANAGEMENT CONSOLE
// ==========================================
export function TeacherImpersonationConsole({
  teachers: controlledTeachers,
  viewAsTeacherId,
  viewAsTeacherName,
  onImpersonate,
  onStop,
  onResetPassword,
  showBanner = true,
  className,
}) {
  const { departmentTeachers = [], refreshDepartmentTeachers, isLoading } = useHOD();
  const teachers = controlledTeachers ?? departmentTeachers;
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const list = teachers || [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (t) =>
        (t.name || '').toLowerCase().includes(q) ||
        (t.id || '').toLowerCase().includes(q) ||
        (t.subject || '').toLowerCase().includes(q)
    );
  }, [teachers, search]);

const handleImpersonate = async (teacher) => {
     const hodId = auditTrail.getCurrentUserId();
     const oldVal = auditTrail.captureSnapshot({ impersonating: null });
     await onImpersonate?.(teacher);
     const newVal = auditTrail.captureSnapshot({ impersonating: teacher.id });
     
     try {
       await auditTrail.logImpersonation(teacher.id, hodId, `HOD administrative session mirror initialized`);
       await auditTrail.logChange(
         'impersonation_session', 
         teacher.id, 
         oldVal, 
         newVal, 
         `HOD administrative session mirror initialized for targeting block: ${teacher.name}`
       );
     } catch (e) {
       console.warn('Audit logging failed:', e);
     }
     
     eventBus.emit('impersonation-started', { teacherId: teacher.id, teacherName: teacher.name });
     setSearch('');
   };

  const isImpersonating = Boolean(viewAsTeacherId);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Active administrative reflection token overlay banner */}
      <AnimatePresence mode="wait">
        {showBanner && isImpersonating && viewAsTeacherName && (
          <ImpersonationBanner
            teacherName={viewAsTeacherName}
            onStop={() => onStop?.()}
          />
        )}
      </AnimatePresence>

      {/* Query Search Filter Input Bar */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assigned instructors using signature strings, metrics, or subject fields..."
          className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 placeholder-gray-400"
        />
        {search && (
          <button 
            onClick={() => setSearch('')} 
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle size={13} />
          </button>
        )}
      </div>

      {/* Master Data Render Gateway */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <LoadingSpinner size="md" className="text-purple-600" />
          <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Fetching Department Registries...</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Instructor Found"
          description={search ? 'The query expression did not match any loaded staff metadata registries.' : 'No registered instructors occupy this structural block domain.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((teacher, i) => (
            <TeacherCard
              key={teacher.id || i}
              teacher={teacher}
              onImpersonate={handleImpersonate}
              onResetPassword={onResetPassword}
            />
          ))}
        </div>
      )}

      {/* System Integrity Notification Ledger */}
      {isImpersonating && (
        <div className="flex items-center gap-2 text-[10px] text-purple-700 bg-purple-50/50 border border-purple-100 rounded-xl px-3 py-2 font-medium">
          <AlertTriangle size={12} className="text-purple-500 shrink-0" />
          <span>Security Protocol Warning: Administrative mirroring operations write analytical tracking snapshots to persistent system logs.</span>
        </div>
      )}
    </div>
  );
}