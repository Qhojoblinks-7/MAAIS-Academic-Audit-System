import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { RefreshCw, ShieldCheck, Users } from 'lucide-react';

export function HODPromotionTerminal({ 
  isPromoting, 
  promotionProgress, 
  promotionLogged, 
  onInitiatePromotion,
  seniorCount = 410,
  clearedCount = 398
}) {
  const clearancePercentage = seniorCount > 0 ? Math.round((clearedCount / seniorCount) * 100) : 0;

  return (
    <motion.div 
      key="promotion"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="max-w-4xl mx-auto p-3 sm:p-6 md:p-8 space-y-6"
    >
      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-200 p-4 sm:p-8 md:p-10 shadow-md space-y-6">
        
        {/* Header Block */}
        <header className="flex items-center gap-3 sm:gap-4 border-b border-slate-100 pb-4 sm:pb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-sm shrink-0">
            <RefreshCw size={18} className={cn("sm:w-5 sm:h-5", isPromoting && "animate-spin")} />
          </div>
          <div className="min-w-0">
            <span className="inline-block text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
              End-Of-Year Cycle Process
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight mt-1 truncate">
              Central Promotion Terminal
            </h3>
          </div>
        </header>

        {/* Informational Text Context */}
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Executing the Promotion Cycle permanently finalizes the current term's grades, seals student outcomes, and dispatches the senior class (SHS 3) into <strong>"The Vault of Historical Archives"</strong>. It also promotes SHS 1 to SHS 2 and SHS 2 to SHS 3, resetting gradebooks for the next session.
        </p>

        {/* Metrics Matrix Block */}
        <div className="border border-slate-100 p-4 sm:p-6 rounded-xl bg-slate-50/50 space-y-3 sm:space-y-4">
          <h4 className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-widest">
            Active Senior Class Promotion Metrics
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Total Size */}
            <div className="bg-white border border-slate-150 rounded-xl p-3 sm:p-4 flex sm:flex-col items-center sm:justify-center justify-between gap-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users size={12} className="text-slate-400 shrink-0" />
                Senior Size
              </p>
              <p className="text-sm sm:text-lg font-bold text-slate-900 font-mono">
                {seniorCount} Students
              </p>
            </div>

            {/* Total Cleared */}
            <div className="bg-white border border-slate-150 rounded-xl p-3 sm:p-4 flex sm:flex-col items-center sm:justify-center justify-between gap-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Cleared Students
              </p>
              <p className="text-sm sm:text-lg font-bold text-emerald-600 font-mono">
                {clearedCount} Cleared
              </p>
            </div>

            {/* Percentage Finished */}
            <div className="bg-white border border-slate-150 rounded-xl p-3 sm:p-4 flex sm:flex-col items-center sm:justify-center justify-between gap-2 sm:col-span-1 col-span-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Clearance Rate
              </p>
              <p className="text-sm sm:text-lg font-bold text-slate-900 font-mono">
                {clearancePercentage}% Approved
              </p>
            </div>
          </div>
        </div>

        {/* Functional Progress & Interactive Row Actions */}
        <div className="space-y-4">
          {isPromoting ? (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-tight">
                <span>Sealing &amp; Archiving Portfolios...</span>
                <span className="font-mono">{promotionProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 sm:h-4 rounded-full overflow-hidden border border-slate-200">
                <motion.div 
                  className="bg-slate-900 h-full rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${promotionProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          ) : (
            <div className="flex gap-3 sm:gap-4">
              <button 
                onClick={onInitiatePromotion}
                disabled={promotionLogged}
                className={cn(
                  "w-full py-3.5 sm:py-4 bg-slate-900 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-sm outline-none disabled:opacity-50 select-none",
                  promotionLogged && "cursor-not-allowed bg-slate-500"
                )}
              >
                {promotionLogged ? "Cycle Executed Successfully" : "Initiate Global Promotion & Archive Cycle"}
              </button>
            </div>
          )}

          {/* Execution Logging Banner */}
          {promotionLogged && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-4 flex gap-3 sm:gap-4"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] sm:text-xs font-black text-emerald-950 uppercase tracking-widest leading-none">
                  Global Transition Authenticated
                </h4>
                <p className="text-xs font-semibold text-emerald-800 mt-2 leading-relaxed">
                  Senior Class has been compiled, sealed, and synchronized into <strong>The Vault</strong>. All folders frozen, gradebooks reset for next cycle.
                </p>
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </motion.div>
  );
}