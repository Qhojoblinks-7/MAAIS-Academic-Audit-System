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
            className="staff-row-node p-2 sm:p-2.5 bg-white border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-xs transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            {/* Staff Profile Node Info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 font-black text-[10px] shrink-0 select-none group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-900 leading-tight truncate">
                  {member.name}
                </p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate font-mono mt-0.5">
                  {member.role}
                </p>
              </div>
            </div>

            {/* Context Action Matrix */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t border-slate-50 sm:border-0 pt-1.5 sm:pt-0">
              {/* Hierarchical Authorization Badging */}
              {member.isHOD ? (
                <div className="px-1.5 py-0.5 bg-amber-50/80 text-amber-700 rounded border border-amber-100/60 flex items-center gap-1">
                  <Crown size={9} className="fill-amber-500 text-amber-500 shrink-0" />
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
                  className="p-1 text-slate-300 hover:text-amber-500 hover:bg-amber-50/60 rounded-md transition-all group-hover:text-slate-400 cursor-pointer" 
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
                      ? "bg-slate-900 text-white shadow-xs" 
                      : "text-slate-300 hover:text-slate-900 hover:bg-slate-50 group-hover:text-slate-400"
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
                        "absolute w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-[250] overflow-hidden",
                        dropdownCoords.positionBelow ? "origin-top-right mt-1" : "origin-bottom-right mb-1"
                      )}
                    >
                      <div className="p-1 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-[7.5px] font-black uppercase tracking-wider text-slate-400 px-2 py-0.5 font-mono">
                          System Operational Protocol
                        </p>
                      </div>
<div className="p-1 space-y-0.5">
{[
                           { label: 'Registry Transfer', icon: ArrowRight, color: 'hover:text-blue-600 hover:bg-blue-50/80' },
                           { label: 'Credential Reset', icon: RotateCcw, color: 'hover:text-amber-600 hover:bg-amber-50/80' },
                           { label: 'Audit Trail View', icon: Search, color: 'hover:text-indigo-600 hover:bg-indigo-50/80' },
                           { label: 'Revoke Authority', icon: ShieldCheck, color: 'hover:text-rose-600 hover:bg-rose-50/80' },
                           { label: 'Authorize Template Update', icon: FileText, color: 'hover:text-blue-600 hover:bg-blue-50/80', useDeptId: true },
                         ].map((item) => (
                           <button
                             key={item.label}
                             onClick={(e) => {
                               e.stopPropagation();
                               handleNodeOperation(item.label, item.useDeptId ? dept.id : member.id, member.name, dept.id);
                             }}
                             className={cn(
                               "w-full flex items-center gap-2 px-2 py-1.5 text-[10px] font-bold text-slate-600 rounded-lg transition-all text-left cursor-pointer",
                               item.color
                             )}
                           >
                             <item.icon size={11} className="shrink-0 opacity-70" />
                             <span className="truncate">{item.label}</span>
                           </button>
                         ))}
                      </div>
                      <div className="p-1 bg-slate-50/60 border-t border-slate-100">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNodeOperation('Deep Archive', member.id, member.name);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-[10px] font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-lg transition-all text-left cursor-pointer"
                        >
                          <Trash2 size={11} className="shrink-0" />
                          <span className="truncate">Deep Archive</span>
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
         <button onClick={onAddTeacher} className="w-full h-8 px-3 border border-dashed border-slate-200 rounded-xl text-[8.5px] font-bold text-slate-400 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 mt-1 cursor-pointer group">
           <Plus size={11} className="shrink-0 transition-transform group-hover:rotate-90" />
           <span className="truncate">Transfer Teacher to Cluster</span>
         </button>
       )}
    </div>
  );
}