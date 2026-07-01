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
      <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <GraduationCap size={150} className="text-emerald-950" />
        </div>
        <div className="relative">
          <h2 className="text-4xl font-black italic font-display text-slate-900 mb-4 tracking-tighter">End-of-Year Promotion Cycle</h2>
          <p className="text-[13px] font-medium text-slate-500 leading-relaxed max-w-2xl uppercase tracking-tight">
            Executing the promotion trigger moves students to their next academic form. SHS 3 students are automatically migrated to the Alumni Database (The Vault). 
            <span className="block mt-2 text-rose-500 font-black">Warning: This action is irreversible for the current academic session.</span>
          </p>
        </div>

        {unlockedCount > 0 && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-amber-600" />
              <span className="text-[11px] font-black text-amber-900 uppercase tracking-widest">
                {unlockedCount} term(s) still unlocked — lock them before promoting
              </span>
            </div>
            {onLockAllTerms && (
              <button
                onClick={onLockAllTerms}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all"
              >
                Lock All Terms
              </button>
            )}
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Form 1 → Form 2', count: '450 Students', icon: Users, color: 'emerald' },
            { title: 'Form 2 → Form 3', count: '425 Students', icon: Users, color: 'blue' },
            { title: 'Form 3 → Alumni', count: '410 Students', icon: GraduationCap, color: 'purple' },
          ].map((card, i) => (
            <div key={i} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white",
                card.color === 'emerald' ? "bg-emerald-600" : card.color === 'blue' ? "bg-blue-600" : "bg-purple-600"
              )}>
                <card.icon size={20} />
              </div>
              <p className="text-[14px] font-black text-slate-900 italic font-display">{card.title}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{card.count}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button 
            onClick={onExecutePromotion}
            disabled={isPromoting}
            className="px-12 py-5 bg-emerald-900 text-white rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap size={20} className="text-amber-400" />
            {isPromoting ? 'Executing...' : 'Execute Global Promotion'}
          </button>
        </div>
      </div>

      <div className="bg-emerald-50 rounded-[2.5rem] border border-emerald-100 p-10 flex items-center justify-between">
        <div className="max-w-md">
          <h4 className="text-[14px] font-black text-emerald-900 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Sparkles size={16} />
            Automated Cleansing Logic
          </h4>
          <p className="text-[11px] font-bold text-emerald-700/70 leading-relaxed italic uppercase">
            This process will automatically clear the current Timetable, Attendance logs, and Assessment sheets to prepare for the new intake.
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => toast.info('Clear Logs feature coming soon')}
            className="px-6 py-4 bg-white border border-emerald-200 text-emerald-900 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-100 transition-all"
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
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
        <h3 className="text-xl font-black italic font-display text-slate-900 mb-8 font-sans">Database Maintenance & Safety</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                <RefreshCw size={18} />
              </div>
              <div>
                <p className="text-[12px] font-black text-slate-900 tracking-tight">Regenerate Audit Hashes</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ensures data integrity for all archived terms</p>
              </div>
            </div>
            <button 
              onClick={onExecuteMaintenance}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest"
            >
              Execute
            </button>
          </div>

          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white">
                <Trash2 size={18} />
              </div>
              <div>
                <p className="text-[12px] font-black text-slate-900 tracking-tight">Purge Orphaned Records</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deletes data for students not linked to any form</p>
              </div>
            </div>
            <button 
              onClick={onDeepClean}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all"
            >
              Deep Clean
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}