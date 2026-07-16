import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  RotateCcw, 
  Search, 
  ShieldCheck, 
  Trash2, 
  X, 
  ChevronRight,
  Plus,
  FileText  // Adding FileText for template authorization icon
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export function OperationModal({ 
  activeOperation, 
  setActiveOperation, 
  departments = [], 
  selectedDeptId,
  onRegistryTransfer,
  onCredentialReset,
  onRevokeAuthority,
  onDeepArchive,
  onAddTeacher,
  onAuthorizeTemplateUpdate
}) {
  if (!activeOperation) return null;

  const { type, staffName, staffId, deptId } = activeOperation;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setActiveOperation(null)}
        className="absolute inset-0 bg-brand-dark/50 backdrop-blur-sm"
      />

      <motion.div 
        initial={{ scale: 0.98, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 8 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="relative w-full max-w-md bg-surface rounded-xl shadow-2xl overflow-hidden z-10 border border-border"
      >
        <div className="p-4 sm:p-5">
          
          <header className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0">
               <div className="w-9 h-9 bg-brand-primary text-primary-foreground rounded-lg flex items-center justify-center shrink-0">
                 {type === 'Registry Transfer' && <ArrowRight size={16} />}
                 {type === 'Credential Reset' && <RotateCcw size={16} />}
                 {type === 'Audit Trail View' && <Search size={16} />}
                 {type === 'Revoke Authority' && <ShieldCheck size={16} />}
                 {type === 'Deep Archive' && <Trash2 size={16} />}
                 {type === 'Add Teacher' && <Plus size={16} />}
                 {type === 'Authorize Template Update' && <FileText size={16} />}
               </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black italic text-foreground leading-tight truncate">
                  {type}
                </h3>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate font-mono mt-0.5">
                  {type === 'Add Teacher' ? `Target: ${staffName}` : `Node: ${staffName}`}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setActiveOperation(null)} 
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/30 transition-all shrink-0"
            >
              <X size={16} />
            </button>
          </header>

          {type === 'Registry Transfer' && (
            <div className="space-y-4">
              <p className="text-xs font-medium text-foreground/50 leading-normal">
                Select the destination cluster for this faculty node to relocate all associated history and current assessment permissions.
              </p>
              <div className="grid grid-cols-1 gap-1.5 max-h-[220px] overflow-y-auto pr-0.5 custom-scrollbar">
                {departments.filter(d => d.id !== selectedDeptId).map(d => (
                  <button 
                    key={d.id} 
                    onClick={() => onRegistryTransfer && onRegistryTransfer(d.id)}
                    className="p-2.5 border border-border rounded-xl text-left hover:border-border hover:bg-muted/20 transition-all group flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn("w-1 h-4 rounded-full shrink-0", d.color)} />
                      <span className="text-xs font-bold italic text-foreground truncate">
                        {d.name} Cluster
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:text-foreground transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {type === 'Credential Reset' && (
            <div className="space-y-4">
              <div className="p-3 bg-warning/10 rounded-xl border border-warning/20">
                <p className="text-xs font-medium text-warning leading-normal">
                  This will invalidate current session tokens and generate a temporary institutional access key for <span className="font-black italic underline">{staffName}</span>.
                </p>
              </div>
              <div className="space-y-2">
                 <p className="text-[8px] font-black text-muted-foreground uppercase tracking-wider text-center font-mono">Authentication Required</p>
                 <button 
                   onClick={onCredentialReset}
                   className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm"
                 >
                   Authorize Reset Protocol
                 </button>
              </div>
            </div>
          )}

          {type === 'Audit Trail View' && (
            <div className="space-y-4">
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-0.5">
                {[
                  { action: 'Mark Validation', time: '2 hours ago', status: 'Success' },
                  { action: 'Registry Entry', time: 'Yesterday, 14:20', status: 'Verified' },
                  { action: 'Login Attempt', time: 'Oct 22, 09:12', status: 'Authenticated' },
                ].map((log, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 bg-muted/30 border border-border/50 rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold italic text-foreground leading-tight">{log.action}</p>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider font-mono mt-0.5">{log.time} • {log.status}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full py-2.5 border border-border text-foreground/80 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-muted/30 transition-all">
                Generate Full Forensic Report
              </button>
            </div>
          )}

          {type === 'Revoke Authority' && (
            <div className="space-y-4 text-center">
              <p className="text-foreground/50 text-xs font-medium leading-normal italic px-2">
                Confirmed: strip <span className="text-foreground font-black italic">"{staffName}"</span> of all HOD management tokens and administrative oversight?
              </p>
              <div className="flex gap-2">
                <button onClick={() => setActiveOperation(null)} className="flex-1 py-2.5 bg-muted/40 text-foreground/80 font-bold rounded-xl text-xs uppercase tracking-wider transition-all">Cancel</button>
                <button onClick={onRevokeAuthority} className="flex-1 py-2.5 bg-destructive hover:bg-destructive/80 text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm">Revoke Authority</button>
              </div>
            </div>
          )}

          {type === 'Deep Archive' && (
            <div className="space-y-4 text-center">
               <div className="p-3 bg-brand-primary text-primary-foreground rounded-xl text-left">
                 <p className="text-[8px] font-black text-primary-foreground/40 uppercase tracking-wider font-mono mb-2">Protocol Implications</p>
                 <ul className="space-y-1.5">
                   {['Preservation of academic records', 'Inactivation of login permissions', 'Node removal from active registry'].map((text, i) => (
                     <li key={i} className="flex items-center gap-2 text-xs font-bold italic text-muted-foreground">
                       <ShieldCheck size={12} className="text-success shrink-0" />
                       <span className="truncate">{text}</span>
                     </li>
                   ))}
                 </ul>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => setActiveOperation(null)} className="flex-1 py-2.5 bg-muted/40 text-foreground/80 font-bold rounded-xl text-xs uppercase tracking-wider transition-all">Abort</button>
                 <button onClick={onDeepArchive} className="flex-1 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-wider transition-all">Initiate Archive</button>
               </div>
            </div>
          )}

           {type === 'Add Teacher' && (
             <div className="space-y-4">
               <p className="text-xs font-medium text-foreground/50 leading-normal">
                 Select a source cluster to import a faculty member. Teachers from other departments will be transferred to {staffName}.
               </p>
               <div className="grid grid-cols-1 gap-1.5 max-h-[220px] overflow-y-auto pr-0.5">
                 {departments.filter(d => d.id !== selectedDeptId && d.staff?.length > 0).map(d => (
                   <div key={d.id} className="border border-border rounded-xl p-2">
                     <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-1">{d.name} Cluster</p>
                     <div className="space-y-1">
                       {d.staff.map(member => (
                         <button key={member.id} onClick={() => onAddTeacher && onAddTeacher(d.id, member)} className="w-full flex items-center justify-between px-2 py-1.5 text-left text-xs font-bold text-foreground/60 hover:bg-muted/30 rounded-lg transition-all">
                           <span className="truncate">{member.name}</span>
                           <span className="text-[8px] text-muted-foreground shrink-0">{member.role}</span>
                         </button>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
           
           {type === 'Authorize Template Update' && (
             <div className="space-y-4">
               <div className="p-3 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
                 <p className="text-xs font-medium text-brand-primary leading-normal">
                   Authorize template updates for <span className="font-black italic underline">{staffName}</span> at the 20% threshold level. This will permit limited template modifications while maintaining audit trail integrity.
                 </p>
               </div>
               <div className="space-y-2">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-wider text-center font-mono">Authorization Required</p>
                  <button 
                    onClick={onAuthorizeTemplateUpdate}
                    className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm"
                  >
                    Authorize Template Update (20%)
                  </button>
               </div>
             </div>
           )}

        </div>

        <div className="bg-muted/30 py-2.5 text-center border-t border-border">
           <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest font-mono">Institutional Protocol: L4 Auth</p>
        </div>
      </motion.div>
    </div>
  );
}
