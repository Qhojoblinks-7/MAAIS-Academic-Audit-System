import React from 'react';
import { cn } from '../../../lib/utils';
import { 
  Database, 
  Search, 
  Filter, 
  ChevronRight, 
  TrendingUp, 
  Activity, 
  History, 
  FileText, 
  Download, 
  Printer,
  Calendar,
  User,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Trash2,
  Users,
  GraduationCap,
  Sparkles,
  RefreshCw,
  Lock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { toast } from '../../../components/ui/toast';

export function PromotionTab({ onExecutePromotion, isPromoting, onLockAllTerms, unlockedCount }) {
  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="bg-surface rounded-[3rem] border border-border p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
           <GraduationCap size={150} className="text-foreground/5" />
        </div>
        <div className="relative">
          <h2 className="text-4xl font-black text-foreground mb-4 tracking-tighter">End-of-Year Promotion Cycle</h2>
          <p className="text-sm font-medium text-text-secondary leading-relaxed max-w-2xl uppercase tracking-tight">
            Executing the promotion trigger moves students to their next academic form. SHS 3 students are automatically migrated to the Alumni Database (The Vault). 
            <span className="block mt-2 text-destructive font-black">Warning: This action is irreversible for the current academic session.</span>
          </p>
        </div>

        {unlockedCount > 0 && (
          <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-warning" />
              <span className="text-xs font-black text-foreground uppercase tracking-widest">
                {unlockedCount} term(s) still unlocked — lock them before promoting
              </span>
            </div>
            {onLockAllTerms && (
              <button
                onClick={onLockAllTerms}
                className="px-4 py-2 bg-warning text-background rounded-lg text-xs font-black uppercase tracking-widest hover:bg-warning/90 transition-all"
              >
                Lock All Terms
              </button>
            )}
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
             { title: 'Form 1 → Form 2', count: '450 Students', icon: Users, color: 'success' },
             { title: 'Form 2 → Form 3', count: '425 Students', icon: Users, color: 'brand' },
             { title: 'Form 3 → Alumni', count: '410 Students', icon: GraduationCap, color: 'brand-primary' },
           ].map((card, i) => (
             <div key={i} className="p-8 bg-muted rounded-[2rem] border border-border flex flex-col items-center text-center">
               <div className={cn(
                 "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-background",
                 card.color === 'success' ? "bg-success" : card.color === 'brand' ? "bg-brand-primary" : "bg-brand-primary"
               )}>
                <card.icon size={20} />
              </div>
               <p className="text-sm font-black text-foreground">{card.title}</p>
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">{card.count}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button 
            onClick={onExecutePromotion}
            disabled={isPromoting}
            className="px-12 py-5 bg-success text-background rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-success/90 transition-all shadow-2xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap size={20} className="text-warning" />
            {isPromoting ? 'Executing...' : 'Execute Global Promotion'}
          </button>
        </div>
      </div>

      <div className="bg-success/5 rounded-[2.5rem] border border-success/20 p-10 flex items-center justify-between">
         <div className="max-w-md">
           <h4 className="text-sm font-black text-success uppercase tracking-widest mb-2 flex items-center gap-2">
             <Sparkles size={16} />
             Automated Cleansing Logic
           </h4>
           <p className="text-xs font-bold text-text-secondary leading-relaxed uppercase">
            This process will automatically clear the current Timetable, Attendance logs, and Assessment sheets to prepare for the new intake.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => toast.info('Clear Logs feature coming soon')}
            className="px-6 py-4 bg-surface border border-success/20 text-success rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-success/10 transition-all"
          >
            <Trash2 size={14} /> Clear Logs Only
          </button>
        </div>
      </div>
    </div>
  );
}

export function MaintenanceTab({ onExecuteMaintenance, onDeepClean }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-surface rounded-[2.5rem] border border-border p-10 shadow-sm">
        <h3 className="text-xl font-black text-foreground mb-8">Database Maintenance & Safety</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-muted rounded-2xl border border-border">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-warning rounded-xl flex items-center justify-center text-background">
                <RefreshCw size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-foreground tracking-tight">Regenerate Audit Hashes</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Ensures data integrity for all archived terms</p>
              </div>
            </div>
            <button 
              onClick={onExecuteMaintenance}
              className="px-4 py-2 bg-foreground text-background rounded-lg text-xs font-black uppercase tracking-widest"
            >
              Execute
            </button>
          </div>

          <div className="flex items-center justify-between p-6 bg-muted rounded-2xl border border-border">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-destructive rounded-xl flex items-center justify-center text-background">
                <Trash2 size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-foreground tracking-tight">Purge Orphaned Records</p>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Deletes data for students not linked to any form</p>
              </div>
            </div>
            <button 
              onClick={onDeepClean}
              className="px-4 py-2 border border-border text-text-secondary rounded-lg text-xs font-black uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
            >
              Deep Clean
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}