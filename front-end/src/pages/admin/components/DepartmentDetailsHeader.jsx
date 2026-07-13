import React from 'react';
import { 
  Folder,
  ChevronLeft,
  Download,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export function DepartmentDetailsHeader({ selectedDept, onBack, onExport, onFreeze, activeTab, setActiveTab }) {
  const isFrozen = selectedDept?.isFrozen;
  const headerBg = selectedDept?.dark || 'bg-brand-dark';
  return (
    <div className={cn("p-6 text-primary-foreground shrink-0 relative overflow-hidden transition-colors duration-500", headerBg)}>
      <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none">
        <ShieldCheck size={200} />
      </div>
      
      <div className="flex justify-between items-start mb-6 relative">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2.5 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-xl transition-all shadow-lg backdrop-blur-md flex items-center gap-2">
            <ChevronLeft size={16} />
            <span className="text-[9px] font-black uppercase tracking-widest">Back to Registry</span>
          </button>
          <p className="hidden sm:block text-[10px] font-black uppercase tracking-[0.4em] text-primary-foreground/50 italic">Management Hub Authorized</p>
        </div>

        <div className="flex flex-col items-end gap-2">
           <div className="flex gap-2">
             <button onClick={onExport} className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary-foreground/20 transition-all shadow-sm backdrop-blur-sm">
               <Download size={14} />
               Export Dossier
             </button>
              <button 
                onClick={onFreeze} 
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg transition-all",
                  isFrozen
                    ? "bg-brand-primary text-primary-foreground shadow-brand-primary/20 hover:bg-brand-dark"
                    : "bg-destructive text-primary-foreground shadow-destructive/20 hover:bg-destructive/90"
                )}
              >
                {isFrozen ? <ShieldCheck size={14} /> : <Lock size={14} />}
                {isFrozen ? 'Lift Department Freeze' : 'Initiate Freeze'}
              </button>
           </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab('staff')} className={cn("text-[9px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg cursor-pointer", activeTab === 'staff' ? "text-primary-foreground bg-primary-foreground/15" : "text-primary-foreground/60 hover:text-primary-foreground bg-primary-foreground/5 hover:bg-primary-foreground/10")}>Faculty Registry</button>
            <button onClick={() => setActiveTab('grading')} className={cn("text-[9px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg cursor-pointer", activeTab === 'grading' ? "text-primary-foreground bg-primary-foreground/15" : "text-primary-foreground/60 hover:text-primary-foreground bg-primary-foreground/5 hover:bg-primary-foreground/10")}>Grading Protocol</button>
            <button onClick={() => setActiveTab('vault')} className={cn("text-[9px] font-black uppercase tracking-widest transition-all px-3 py-1.5 rounded-lg cursor-pointer", activeTab === 'vault' ? "text-primary-foreground bg-primary-foreground/15" : "text-primary-foreground/60 hover:text-primary-foreground bg-primary-foreground/5 hover:bg-primary-foreground/10")}>Minutes Vault</button>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-foreground/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-primary-foreground ring-1 ring-primary-foreground/30 shadow-xl">
            <Folder size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black italic font-display tracking-tight leading-none mb-1">{selectedDept.name} Cluster</h2>
            <div className="flex items-center gap-3">
               <div className="px-3 py-1 bg-primary-foreground/10 rounded-full text-[8px] font-black uppercase tracking-widest text-primary-foreground ring-1 ring-primary-foreground/20">
                 {selectedDept.validationStatus}% Marks Validated
               </div>
               <div className="w-1 h-1 rounded-full bg-primary-foreground/30" />
               <span className="text-[9px] font-bold text-primary-foreground/60 uppercase tracking-[0.2em]">{selectedDept.teacherCount} Personnel Nodes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DepartmentDetailsHeader;