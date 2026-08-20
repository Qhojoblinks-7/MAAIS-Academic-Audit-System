import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  MoreVertical, 
  ArrowRight, 
  RotateCcw, 
  Search, 
  ShieldCheck, 
  Trash2, 
  Plus,
  FileText,
  BookOpen
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useAssignTeacher, useAllSubjects, useAllClasses, useAcademicYears } from '../../../lib/hooks';
import { toast } from '../../../components/ui/toast';

export function StaffTabContent({
  dept,
  departments,
  openKebabId,
  toggleKebab,
  handleAssignHOD,
  handleNodeOperation,
  onAddTeacher
}) {
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, right: 0, positionBelow: true });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningStaff, setAssigningStaff] = useState(null);
  const [assignForm, setAssignForm] = useState({ staffId: '', subjectId: '', classSectionId: '', academicYearId: '' });
  const rowRefs = useRef({});

  const assignTeacher = useAssignTeacher();
  const { data: subjects = [] } = useAllSubjects();
  const { data: classes = [] } = useAllClasses();
  const { data: academicYears = [] } = useAcademicYears();

  const openAssignModal = (member) => {
    setAssigningStaff(member);
    setAssignForm({ staffId: member.id, subjectId: '', classSectionId: '', academicYearId: academicYears[0]?.id || '' });
    setShowAssignModal(true);
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    if (!assignForm.staffId || !assignForm.subjectId || !assignForm.classSectionId || !assignForm.academicYearId) return;
    try {
      await assignTeacher.mutateAsync(assignForm);
      toast.success('Teacher assigned to class');
      setShowAssignModal(false);
      setAssigningStaff(null);
      setAssignForm({ staffId: '', subjectId: '', classSectionId: '', academicYearId: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to assign teacher');
    }
  };

  // Recalculate dropdown positioning window clearance dynamically on invocation
  useEffect(() => {
    if (openKebabId && rowRefs.current[openKebabId]) {
      const triggerEl = rowRefs.current[openKebabId];
      const rect = triggerEl.getBoundingClientRect();
      const parentRow = triggerEl.closest('.staff-row-node');
      const parentRect = parentRow ? parentRow.getBoundingClientRect() : { right: rect.right, bottom: rect.bottom };
      
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const requiresUpwardFlip = spaceBelow < 220; // Estimated depth parameter of full action menu

      setDropdownCoords({
        top: requiresUpwardFlip ? 'auto' : '100%',
        bottom: requiresUpwardFlip ? '100%' : 'auto',
        right: 0,
        positionBelow: !requiresUpwardFlip
      });
    }
  }, [openKebabId]);

  return (
    <div className="space-y-1.5 px-1 sm:px-0">
      {dept?.staff?.map((member) => {
        const initials = member.name
          ? member.name.trim().split(/\s+/).map(n => n[0]).join('').slice(0, 2).toUpperCase()
          : 'ST';

        return (
          <div 
            key={member.id} 
            className="staff-row-node p-2 sm:p-2.5 bg-surface border border-border rounded-xl hover:border-border hover:shadow-xs transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            {/* Staff Profile Node Info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg bg-muted/20 border border-border flex items-center justify-center text-foreground/50 font-black text-[10px] sm:text-[12px] lg:text-[14px] shrink-0 select-none group-hover:bg-success/10 group-hover:text-success transition-colors">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-[clamp(12px,1vw+8px,15px)] font-bold text-foreground leading-tight truncate">
                  {member.name}
                </p>
                <p className="text-[clamp(9px,0.7vw+6px,12px)] font-bold text-muted-foreground uppercase tracking-wider truncate font-mono mt-0.5">
                  {member.role}
                </p>
                {member.subjects && member.subjects.length > 0 ? (
                  <p className="text-[clamp(9px,0.6vw+7px,11px)] font-medium text-muted-foreground truncate mt-1">
                    Teaches: {member.subjects.map((sub) => sub.name).join(', ')}
                  </p>
                ) : (
                  <p className="text-[clamp(9px,0.6vw+7px,11px)] font-medium text-muted-foreground/70 italic truncate mt-1">
                    No subjects assigned
                  </p>
                )}
              </div>
            </div>

            {/* Context Action Matrix */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t border-border sm:border-0 pt-1.5 sm:pt-0">
              {/* Hierarchical Authorization Badging */}
              {member.isHOD ? (
                <div className="px-1.5 py-0.5 bg-warning/10 text-warning rounded border border-warning/20 flex items-center gap-1">
                  <Crown size={9} className="fill-warning text-warning shrink-0" />
                  <span className="text-[7.5px] font-black uppercase tracking-wider leading-none whitespace-nowrap font-mono">
                    HOD
                  </span>
                </div>
              ) : (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAssignHOD(e, member.id, member.name, dept.id, dept.name);
                  }}
                  className="p-1 text-muted-foreground hover:text-warning hover:bg-warning/10 rounded-md transition-all group-hover:text-muted-foreground cursor-pointer" 
                  title="Assign HOD Token"
                >
                  <Crown size={12} />
                </button>
              )}

              {/* Operations Dropdown Controller */}
              <div className="relative" ref={el => rowRefs.current[member.id] = el}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleKebab(e, member.id);
                  }}
                  className={cn(
                    "p-1 rounded-md transition-all cursor-pointer",
                    openKebabId === member.id 
                      ? "bg-brand-primary text-primary-foreground shadow-xs" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/20 group-hover:text-muted-foreground"
                  )}
                >
                  <MoreVertical size={12} />
                </button>

                <AnimatePresence>
                  {openKebabId === member.id && (
                    <motion.div
                      initial={{ 
                        opacity: 0, 
                        scale: 0.98, 
                        y: dropdownCoords.positionBelow ? 3 : -3 
                      }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ 
                        opacity: 0, 
                        scale: 0.98, 
                        y: dropdownCoords.positionBelow ? 3 : -3 
                      }}
                      transition={{ duration: 0.1 }}
                      style={{
                        top: dropdownCoords.top,
                        bottom: dropdownCoords.bottom,
                        right: dropdownCoords.right
                      }}
                      className={cn(
                        "absolute w-44 bg-surface border border-border rounded-xl shadow-xl z-[250] overflow-hidden",
                        dropdownCoords.positionBelow ? "origin-top-right mt-1" : "origin-bottom-right mb-1"
                      )}
                    >
                      <div className="p-1 border-b border-border bg-muted/20">
                        <p className="text-[7.5px] font-black uppercase tracking-wider text-muted-foreground px-2 py-0.5 font-mono">
                          Staff Actions
                        </p>
                      </div>
<div className="p-1 space-y-0.5">
{[
                            { label: 'Transfer', icon: ArrowRight, color: 'hover:text-brand-primary hover:bg-brand-primary/10', isDeptLevel: false },
                            { label: 'Credential Reset', icon: RotateCcw, color: 'hover:text-warning hover:bg-warning/10', isDeptLevel: false },
                            { label: 'Assign to Class', icon: BookOpen, color: 'hover:text-success hover:bg-success/10', isDeptLevel: false, action: 'assign' },
                            { label: 'Audit Trail View', icon: Search, color: 'hover:text-brand-primary hover:bg-brand-primary/10', isDeptLevel: true },
                            { label: 'Revoke Authority', icon: ShieldCheck, color: 'hover:text-destructive hover:bg-destructive/5', isDeptLevel: false },
                            { label: 'Authorize Template Update', icon: FileText, color: 'hover:text-brand-primary hover:bg-brand-primary/10', isDeptLevel: true },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.action === 'assign') {
                                  openAssignModal(member);
                                } else {
                                  // For department-level operations, pass dept info; for staff-level, pass member info
                                  const targetId = item.isDeptLevel ? dept.id : member.id;
                                  const targetName = item.isDeptLevel ? dept.name : member.name;
                                  handleNodeOperation(item.label, targetId, targetName, dept.id);
                                }
                              }}
                              className={cn(
                                "w-full flex items-center gap-2 px-2 py-1.5 text-[10px] font-bold text-foreground/60 rounded-lg transition-all text-left cursor-pointer",
                                item.color
                              )}
                            >
                              <item.icon size={11} className="shrink-0 opacity-70" />
                              <span className="truncate">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      <div className="p-1 bg-muted/20 border-t border-border">
<button 
                           onClick={(e) => {
                             e.stopPropagation();
                             handleNodeOperation('Deactivate Staff', member.id, member.name, dept.id);
                           }}
                           className="w-full flex items-center gap-2 px-2 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all text-left cursor-pointer"
                         >
                           <Trash2 size={11} className="shrink-0" />
                            <span className="truncate">Deactivate Staff</span>
                         </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        );
      })}
      
{/* Append/Transfer Trigger */}
       {dept.id && onAddTeacher && (
         <button onClick={onAddTeacher} className="w-full h-8 px-3 border border-dashed border-border rounded-xl text-[8.5px] font-bold text-muted-foreground hover:text-foreground/80 hover:border-border hover:bg-muted/20 uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 mt-1 cursor-pointer group">
           <Plus size={11} className="shrink-0 transition-transform group-hover:rotate-90" />
            <span className="truncate">Transfer Teacher to Department</span>
         </button>
        )}

      {/* Assign Teacher Modal */}
      <AnimatePresence>
        {showAssignModal && assigningStaff && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAssignModal(false)} className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-surface rounded-2xl shadow-2xl p-6 z-10 space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-sm font-black text-foreground tracking-tight">Assign Teacher to Class</h3>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{assigningStaff.name}</p>
                </div>
                <button onClick={() => setShowAssignModal(false)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"><Trash2 size={14} /></button>
              </div>
              <form onSubmit={handleAssignTeacher} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 mb-1.5">Subject</label>
                  <select value={assignForm.subjectId} onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none bg-surface" required>
                    <option value="">Select Subject</option>
                    {subjects.filter((s) => s.departmentId === dept?.id).map((s) => (<option key={s.id} value={s.id}>{s.name} ({s.code})</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 mb-1.5">Class</label>
                  <select value={assignForm.classSectionId} onChange={(e) => setAssignForm({ ...assignForm, classSectionId: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none bg-surface" required>
                    <option value="">Select Class</option>
                    {classes.filter((c) => c.program === dept?.name || c.departmentId === dept?.id).map((c) => (<option key={c.id} value={c.id}>{c.name} — {c.level}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-foreground/60 mb-1.5">Academic Year</label>
                  <select value={assignForm.academicYearId} onChange={(e) => setAssignForm({ ...assignForm, academicYearId: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none bg-surface" required>
                    <option value="">Select Year</option>
                    {academicYears.map((y) => (<option key={y.id} value={y.id}>{y.label || y.id}</option>))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={assignTeacher.isPending} className="flex-1 px-4 py-2.5 bg-brand-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/90 transition-all disabled:opacity-50">
                    {assignTeacher.isPending ? 'Assigning…' : 'Assign'}
                  </button>
                  <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2.5 bg-muted/30 text-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-muted/20 transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
