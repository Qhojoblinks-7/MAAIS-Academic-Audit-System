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
  FileText 
} from 'lucide-react';
import { cn } from '../../../lib/utils';

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
  const rowRefs = useRef({});

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
                            { label: 'Audit Trail View', icon: Search, color: 'hover:text-brand-primary hover:bg-brand-primary/10', isDeptLevel: true },
                            { label: 'Revoke Authority', icon: ShieldCheck, color: 'hover:text-destructive hover:bg-destructive/5', isDeptLevel: false },
                            { label: 'Authorize Template Update', icon: FileText, color: 'hover:text-brand-primary hover:bg-brand-primary/10', isDeptLevel: true },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={(e) => {
                                e.stopPropagation();
                                // For department-level operations, pass dept info; for staff-level, pass member info
                                const targetId = item.isDeptLevel ? dept.id : member.id;
                                const targetName = item.isDeptLevel ? dept.name : member.name;
                                handleNodeOperation(item.label, targetId, targetName, dept.id);
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
    </div>
  );
}
