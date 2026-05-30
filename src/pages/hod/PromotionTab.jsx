import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export function PromotionTab({ 
  isPromoting, 
  promotionProgress = 0, 
  promotionLogged, 
  handleGlobalPromotion 
}) {
  return (
    <motion.div 
      key="promotion"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8"
    >
      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-200 p-5 sm:p-8 md:p-10 shadow-sm space-y-6 sm:space-y-8">
        
        {/* Component Header Block */}
        <header className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm shrink-0">
            <RefreshCw size={22} className={cn(isPromoting && "animate-spin")} />
          </div>
          <div className="space-y-1">
            <span className="inline-block text-[9px] font-black text-slate-500 bg-slate-100 border border-slate-200/60 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              End-Of-Year Cycle Process
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Central Promotion Terminal
            </h3>
          </div>
        </header>

        {/* Narrative Operational Warning Context */}
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Executing the Promotion Cycle permanently finalizes the current term's grades, seals student outcomes, and dispatches the senior class (SHS 3) into <strong>"The Vault of Historical Archives"</strong>. It also promotes SHS 1 to SHS 2 and SHS 2 to SHS 3, completely setting the slate clean for the next active academic session.
        </p>

        {/* Promotion Metrics Operational Block */}
        <div className="border border-slate-200/60 p-4 sm:p-6 rounded-2xl bg-slate-50 space-y-4">
          <h4 className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-widest">
            Active Senior Class Promotion Metrics
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white border border-slate-200/60 rounded-xl p-4 text-center shadow-xs">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Current SHS 3 Senior Size</p>
              <p className="text-lg sm:text-xl font-black text-slate-900 mt-1">410 Students</p>
            </div>
            <div className="bg-white border border-slate-200/60 rounded-xl p-4 text-center shadow-xs">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Clearances Approved</p>
              <p className="text-lg sm:text-xl font-black text-emerald-600 mt-1">398 Cleared</p>
            </div>
            <div className="bg-white border border-slate-200/60 rounded-xl p-4 text-center shadow-xs">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Seals Frozen</p>
              <p className="text-lg sm:text-xl font-black text-slate-900 mt-1">100.0% Approved</p>
            </div>
          </div>
        </div>

        {/* Action Controls & Interactive State Flow Handling */}
        <div className="space-y-4">
          {isPromoting ? (
            <div className="space-y-3 bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
              <div className="flex justify-between text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-wider">
                <span>Sealing &amp; Archiving Portfolios...</span>
                <span>{promotionProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  className="bg-slate-900 h-full rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${promotionProgress}%` }}
                  transition={{ ease: "easeInOut", duration: 0.2 }}
                />
              </div>
            </div>
          ) : (
            <div className="flex w-full">
              <button 
                onClick={handleGlobalPromotion}
                disabled={promotionLogged}
                className={cn(
                  "w-full py-4 px-6 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 transition-all shadow-sm",
                  promotionLogged && "opacity-50 cursor-not-allowed bg-slate-400 hover:bg-slate-400"
                )}
              >
                {promotionLogged ? "Promotion Cycle Executed Successfully" : "Initiate Global Promotion & Archive Cycle"}
              </button>
            </div>
          )}

          {/* Verification Banner Trigger */}
          {promotionLogged && (
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4"
            >
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs">
                <ShieldCheck size={20} />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xs font-black text-emerald-950 uppercase tracking-widest leading-none">
                  Global Transition Authenticated
                </h4>
                <p className="text-xs font-medium text-emerald-800 leading-relaxed">
                  Senior Class of 2024 has been compiled, sealed, and successfully synchronized into <strong>The Vault</strong>. All student folders have been frozen, and student gradebooks have been reset for the next division cycle.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}