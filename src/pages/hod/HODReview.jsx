import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, GraduationCap, CheckCircle2, XCircle,
  RefreshCw, AlertTriangle, ChevronRight, BookOpen, X, ShieldAlert
} from 'lucide-react';

import { cn } from '../../lib/utils';
import { useHOD } from '../../context/HODContext';
import { hodService } from '../../services/hodService';
import { auditTrail } from '../../services/auditTrailService';
import { notification } from '../../services/notificationService';
import { eventBus } from '../../services/eventBus';
import { HODCommentInput, ActionButtonGroup, StatusBadge, SubmissionProgressSparkline, ConfirmationDialog }
    from '../../components/molecules';
import { CurrentPreviousTermComparisonView, GradeDiscussionThread } from '../../components/organisms';

function SubjectRow({ subject, studentName, onAddRemark, onReject }) {
  const [remark, setRemark] = useState('');

  const handleAction = (callback, payload) => {
    if (typeof callback === 'function') {
      callback(payload);
      setRemark('');
    }
  };

  return (
    <div className="border border-gray-200/60 rounded-xl p-3 bg-white shadow-3xs transition-all hover:border-gray-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <BookOpen size={12} className="text-gray-400 shrink-0" />
            <p className="text-xs font-bold text-gray-900">{subject?.subject || subject?.name || 'Unassigned Curriculum'}</p>
            <SubmissionProgressSparkline value={subject?.progress || 0} size="sm" />
          </div>
          
          <div className="grid grid-cols-3 gap-2 max-w-xs bg-slate-50 p-2 rounded-lg border border-gray-200/40">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">SBA</p>
              <p className="text-xs font-bold text-gray-700">{subject?.sba ?? '—'}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">Exam</p>
              <p className="text-xs font-bold text-gray-700">{subject?.exam ?? '—'}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wider text-gray-400">Final</p>
              <p className="text-xs font-bold text-gray-950">{subject?.final ?? '—'}</p>
            </div>
          </div>
          
          <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
            Status Boundary: <StatusBadge status={subject?.grade || 'N/A'} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-2 shrink-0">
          <input
            type="text"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Add override details..."
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder-gray-400 font-medium w-full sm:w-44"
          />
          <ActionButtonGroup
            actions={[
              {
                label: 'Approve',
                variant: 'primary',
                icon: CheckCircle2,
                onClick: () => handleAction(onAddRemark, { subjectId: subject?.id, remark }),
              },
              {
                label: 'Reject',
                variant: 'danger',
                icon: XCircle,
                onClick: () => handleAction(onReject, {
                  subjectId: subject?.id,
                  subjectName: subject?.subject || subject?.name,
                  remark,
                }),
              },
            ]}
            className="gap-1 justify-end"
          />
        </div>
      </div>
    </div>
  );
}

export function HODReview() {
  const {
    departmentProgress = [], 
    refreshDepartmentProgress, 
    isLoading,
    rejectRevision,
  } = useHOD();

  const [search, setSearch] = useState('');
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [rejectConfirm, setRejectConfirm] = useState(null);

  useEffect(() => {
    if (typeof refreshDepartmentProgress === 'function') {
      refreshDepartmentProgress();
    }
  }, [refreshDepartmentProgress]);

  // Flatten students safely across classes
  const allStudents = useMemo(() => {
    if (!Array.isArray(departmentProgress)) return [];
    const list = [];
    departmentProgress.forEach(cls => {
      if (!cls) return;
      const studentArray = Array.isArray(cls.students) ? cls.students : [];
      studentArray.forEach(s => {
        if (!s) return;
        list.push({
          ...s,
          className: cls.className || s.className || 'Unknown Class Matrix',
          subject: cls.subject || s.subject,
          subjects: Array.isArray(cls.subjects) ? cls.subjects : (Array.isArray(s.subjects) ? s.subjects : []),
          status: cls.status || s.status || 'PENDING',
          form: cls.form || s.form,
          programme: cls.programme || s.programme,
        });
      });
    });
    return list;
  }, [departmentProgress]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    const students = !query ? allStudents : allStudents.filter(s =>
      String(s?.name || '').toLowerCase().includes(query) ||
      String(s?.indexNumber || '').toLowerCase().includes(query) ||
      String(s?.className || '').toLowerCase().includes(query)
    );

    if (students.length > 0 && !activeStudentId) {
      setActiveStudentId(students[0].id);
    }
    return students;
  }, [allStudents, search, activeStudentId]);

  const selectedStudent = useMemo(() => {
    return allStudents.find(s => s.id === activeStudentId) || filteredStudents[0] || null;
  }, [allStudents, activeStudentId, filteredStudents]);

  const handleAddRemark = async ({ studentId, studentName, remark }) => {
    if (!remark || remark.trim().length < 10) { 
      alert('Validation Error: Remarks must meet a 10-character threshold.'); 
      return; 
    }
    try {
      const oldVal = typeof auditTrail?.captureSnapshot === 'function' ? auditTrail.captureSnapshot({}) : {};
      const result = await hodService.updateHODComment(studentId, remark);
      const newVal = typeof auditTrail?.captureSnapshot === 'function' ? auditTrail.captureSnapshot({ comment: remark }) : { comment: remark };
      
      if (auditTrail?.logChange) {
        await auditTrail.logChange('student_result', studentId, oldVal, newVal, remark);
      }
      if (eventBus?.emit) {
        eventBus.emit('hod-comment-added', { studentId, studentName, remark });
      }
      if (notification?.notifyTeacherOfHODAction) {
        await notification.notifyTeacherOfHODAction(studentId, 'COMMENT_ADDED', result?.id || studentId, remark);
      }
    } catch (e) {
      console.error('Failed to append comment payload:', e);
    }
  };

  const handleReject = async ({ subjectId, studentName, remark, subjectName }) => {
    if (!subjectId || typeof rejectRevision !== 'function') return;
    setRejectConfirm({
      studentName: studentName || 'this student',
      subjectName: subjectName || subjectId,
      onConfirm: async () => {
        try {
          const oldVal = typeof auditTrail?.captureSnapshot === 'function' ? auditTrail.captureSnapshot({ rejected: false }) : {};
          await rejectRevision(subjectId, remark || 'No verification description supplied.');
          const newVal = typeof auditTrail?.captureSnapshot === 'function' ? auditTrail.captureSnapshot({ rejected: true }) : {};
          
          if (auditTrail?.logChange) {
            await auditTrail.logChange(
              'grade_revision', subjectId, oldVal, newVal, `HOD rejected revision for ${studentName}: ${remark}`
            );
          }
          if (eventBus?.emit) {
            eventBus.emit('grade-revision-rejected', { recordId: subjectId, studentName, reason: remark });
          }
          if (notification?.notifyTeacherOfHODAction) {
            await notification.notifyTeacherOfHODAction(subjectId, 'GRADE_REVISION_REJECTED', subjectId, remark);
          }
        } catch (e) {
          console.error('Rejection flow termination exception:', e);
        } finally {
          setRejectConfirm(null);
        }
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 font-sans antialiased">

      {/* Roster View Header */}
      <header className="bg-white border-b border-gray-200/80 px-6 py-4 sticky top-0 z-10 backdrop-blur-md bg-white/95">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-base font-bold text-gray-900 tracking-tight">Grade Review Pipeline</h1>
            <p className="text-xs text-gray-400 mt-0.5">Approve grade revisions, append override signatures, and handle approvals.</p>
          </div>
          <button 
            onClick={refreshDepartmentProgress} 
            disabled={isLoading}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2 shadow-3xs transition-all active:scale-95 disabled:opacity-40"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            Sync Ledger
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 overflow-hidden max-w-6xl w-full mx-auto p-6 flex gap-6 items-start">
        
        {/* Master Panel Side Roster */}
        <div className="w-full md:w-80 shrink-0 flex flex-col space-y-3 h-full overflow-hidden">
          
          {/* Roster Search Input */}
          <div className="bg-white rounded-xl border border-gray-200/70 shadow-3xs p-3">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter student list..."
                className="w-full pl-8.5 pr-8 py-1.5 text-xs bg-gray-50 border border-gray-200/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 placeholder-gray-400 font-medium"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Student Selection List */}
          <div className="bg-white rounded-xl border border-gray-200/70 shadow-3xs p-2 flex-1 overflow-y-auto space-y-0.5">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs italic">No matched profiles.</div>
            ) : (
              filteredStudents.map((s) => {
                const active = activeStudentId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveStudentId(s.id)}
                    className={cn(
                      "w-full text-left p-2.5 rounded-lg text-xs transition-all border group flex items-center gap-3",
                      active
                        ? "bg-slate-900 text-white border-slate-900 shadow-3xs font-medium"
                        : "bg-white border-transparent text-gray-700 hover:bg-slate-50/80 hover:text-gray-900"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-black shrink-0",
                      active ? "bg-slate-800 text-indigo-400" : "bg-slate-100 text-slate-700"
                    )}>
                      {(s.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold truncate">{s.name || 'Anonymous Log'}</p>
                        <ChevronRight size={12} className={cn("shrink-0 transition-transform", active ? "text-indigo-400 translate-x-0.5" : "text-gray-300 group-hover:text-gray-400")} />
                      </div>
                      <p className={cn("text-[10px] truncate mt-0.5", active ? "text-slate-400" : "text-gray-400")}>
                        {s.indexNumber || '—'} · {s.className}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Detail Panel Focused Interactive Feed */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200/70 shadow-3xs h-full flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedStudent ? (
              <motion.div
                key={selectedStudent.id}
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.12 }}
                className="flex flex-col h-full overflow-hidden"
              >
                {/* Selected Student Information Banner */}
                <div className="px-5 py-4 border-b border-gray-200/60 bg-gray-50/40 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-950 tracking-tight">{selectedStudent.name}</h3>
                      <span className="text-[10px] font-mono font-bold bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500">
                        {selectedStudent.indexNumber || 'No Index'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
                      Class Group Anchor: <span className="text-gray-700 font-semibold">{selectedStudent.className}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600">
                    <StatusBadge status={selectedStudent.status || 'PENDING'} />
                  </div>
                </div>

                {/* Submodule Review Presentation Space */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  
                  {/* Delta Variance Interactive Engine Graph */}
                  {Array.isArray(selectedStudent.subjects) && selectedStudent.subjects.length > 0 && (
                    <div className="border border-gray-200/60 rounded-xl p-4 bg-slate-50/40">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={13} className="text-indigo-600" />
                        <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-wide">Comparative Evaluation Delta</h4>
                      </div>
                       <CurrentPreviousTermComparisonView
                         subjects={selectedStudent.subjects.slice(0, 6)}
                         currentTerm="Term 3"
                         previousTerm="Term 2"
                         className="w-full bg-white p-3 rounded-lg border border-gray-200/40 shadow-3xs"
                       />
                    </div>
                  )}

                  {/* Subject Scores Breakdown Stream */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Course Matrices Override Channels</h4>
                    {Array.isArray(selectedStudent.subjects) && selectedStudent.subjects.map((s, i) => (
                      <SubjectRow 
                        key={s?.id || i} 
                        subject={s} 
                        studentName={selectedStudent.name}
                        onAddRemark={(payload) => handleAddRemark({ studentId: selectedStudent.id, studentName: selectedStudent.name, ...payload })}
                        onReject={(payload) => handleReject({ studentName: selectedStudent.name, ...payload })}
                      />
                    ))}
                  </div>

                   {/* Overall Institutional Comment Node */}
                   <div className="border-t border-gray-100 pt-4">
                     <HODCommentInput
                       onSubmit={(remark) => handleAddRemark({ studentId: selectedStudent.id, studentName: selectedStudent.name, remark })}
                       placeholder={`Compile institutional HOD remark envelope for ${selectedStudent.name}...`}
                       maxLength={500}
                     />
                   </div>
                   {/* Grade Discussion Thread */}
                   <div className="border-t border-gray-100 pt-6">
                     <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                       Grade Discussion
                     </h4>
                     <GradeDiscussionThread 
                       subjectId={selectedStudent.subjects?.[0]?.id || 'unknown'} 
                       studentId={selectedStudent.id} 
                     />
                   </div>

                </div>
              </motion.div>
            ) : (
              <div className="m-auto text-center py-12 max-w-xs">
                <GraduationCap size={32} className="text-gray-200 mx-auto mb-3" />
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Empty Ledger Pipeline</h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                  No active student evaluation forms are queued for your review constraints.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Confirmation Dialog Box */}
      <ConfirmationDialog
        open={!!rejectConfirm}
        title="Reject Grade Revision Request"
        message={`Confirm rejection declaration path targeting ${rejectConfirm?.studentName}? Associated operations nodes will receive this notification map update.`}
        confirmLabel="Verify Record Rejection"
        variant="danger"
        onConfirm={() => rejectConfirm?.onConfirm?.()}
        onCancel={() => setRejectConfirm(null)}
      />
    </div>
  );
}