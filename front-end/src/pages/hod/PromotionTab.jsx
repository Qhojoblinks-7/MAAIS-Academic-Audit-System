import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRole } from '@/context/RoleContext';
import { usePromotionMetrics, useTriggerPromotion } from '@/lib/hooks/api/hod';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatTime(isoMonth) {
  if (!isoMonth) return '';
  const [y, m] = isoMonth.split('-');
  return `${MONTHS[parseInt(m, 10) - 1] || m} ${y}`;
}

export function PromotionTab({ 
  isPromoting: externalIsPromoting,
  promotionProgress = 0,
  promotionLogged: externalPromotionLogged,
  handleGlobalPromotion: externalHandleGlobalPromotion 
}) {
  const { user } = useRole();
  const isAuthorized = user?.role === 'SUPER_ADMIN' || user?.role === 'HEADMASTER';

  const {
    data: metrics = { seniorSize: 0, clearedCount: 0, clearanceRate: 0 },
    isLoading: metricsLoading,
    error: metricsError,
  } = usePromotionMetrics();

  const promotionMutation = useTriggerPromotion();
  const [isPromoting, setIsPromoting] = React.useState(externalIsPromoting || false);
  const [promotionLogged, setPromotionLogged] = React.useState(externalPromotionLogged || false);
  const [promotionProgress, setPromotionProgress] = React.useState(promotionProgress);

  React.useEffect(() => {
    setIsPromoting(externalIsPromoting || false);
    setPromotionLogged(externalPromotionLogged || false);
  }, [externalIsPromoting, externalPromotionLogged]);

  const handleGlobalPromotion = React.useCallback(async () => {
    if (!isAuthorized) return;

    setIsPromoting(true);
    setPromotionProgress(0);

    const interval = setInterval(() => {
      setPromotionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const activeYearRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/academic/years/active`, {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!activeYearRes.ok) throw new Error('Failed to fetch active academic year');
      const activeYear = await activeYearRes.json();

      await promotionMutation.mutateAsync(activeYear.id || activeYear.data?.id);

      setTimeout(() => {
        setIsPromoting(false);
        setPromotionLogged(true);
      }, 400);
    } catch (err) {
      console.error('Promotion failed:', err);
      setIsPromoting(false);
      setPromotionProgress(0);
    }
  }, [isAuthorized, promotionMutation]);

  return (
    <motion.div 
      key="promotion"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8"
    >
      <Card className="rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-10 shadow-sm space-y-6 sm:space-y-8">
        
        {/* Component Header Block */}
        <header className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-border pb-6">
          <div className="w-12 h-12 rounded-2xl bg-foreground text-white flex items-center justify-center shadow-sm shrink-0">
            <RefreshCw size={22} className={cn(isPromoting && "animate-spin")} />
          </div>
          <div className="space-y-1">
            <span className="inline-block text-[9px] font-black text-muted-foreground bg-muted border border-border px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              End-Of-Year Cycle Process
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Central Promotion Terminal
            </h3>
          </div>
        </header>

        {/* Narrative Operational Warning Context */}
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
          Executing the Promotion Cycle permanently finalizes the current term's grades, seals student outcomes, and dispatches the senior class (SHS 3) into <strong>"The Vault of Historical Archives"</strong>. It also promotes SHS 1 to SHS 2 and SHS 2 to SHS 3, completely setting the slate clean for the next active academic session.
        </p>

        {/* Promotion Metrics Operational Block */}
        <div className="border border-border p-4 sm:p-6 rounded-2xl bg-muted space-y-4">
          <h4 className="text-[10px] sm:text-xs font-black text-foreground uppercase tracking-widest">
            Active Senior Class Promotion Metrics
          </h4>
          
          {metricsError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              <AlertCircle size={14} />
              Failed to load promotion metrics.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Current SHS 3 Senior Size</p>
              <p className="text-lg sm:text-xl font-black text-foreground mt-1">
                {metricsLoading ? '--' : `${metrics.seniorSize} Students`}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Clearances Approved</p>
              <p className="text-lg sm:text-xl font-black text-success mt-1">
                {metricsLoading ? '--' : `${metrics.clearedCount} Cleared`}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Seals Frozen</p>
              <p className="text-lg sm:text-xl font-black text-foreground mt-1">
                {metricsLoading ? '--' : `${metrics.clearanceRate}% Approved`}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Interactive State Flow Handling */}
        <div className="space-y-4">
          {isPromoting ? (
            <div className="space-y-3 bg-muted border border-border p-4 rounded-2xl">
              <div className="flex justify-between text-[10px] sm:text-xs font-black text-foreground uppercase tracking-wider">
                <span>Sealing &amp; Archiving Portfolios...</span>
                <span>{promotionProgress}%</span>
              </div>
              <div className="w-full bg-border h-3 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-foreground h-full rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${promotionProgress}%` }}
                  transition={{ ease: "easeInOut", duration: 0.2 }}
                />
              </div>
            </div>
          ) : (
            <div className="flex w-full">
              <Button
                onClick={handleGlobalPromotion}
                disabled={promotionLogged || !isAuthorized || metricsLoading}
                className={cn(
                  "w-full py-4 px-6 font-black text-xs uppercase tracking-widest rounded-xl shadow-sm",
                  (promotionLogged || !isAuthorized) && "opacity-50 cursor-not-allowed"
                )}
              >
                {promotionLogged ? "Promotion Cycle Executed Successfully" : !isAuthorized ? "Promotion Requires Admin Role" : "Initiate Global Promotion & Archive Cycle"}
              </Button>
            </div>
          )}

          {/* Verification Banner Trigger */}
          {promotionLogged && (
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-success/10 border border-success/30 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4"
            >
              <div className="w-10 h-10 bg-success rounded-xl flex items-center justify-center text-white shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xs font-black text-success uppercase tracking-widest leading-none">
                  Global Transition Authenticated
                </h4>
                <p className="text-xs font-medium text-success/90 leading-relaxed">
                  Senior Class has been compiled, sealed, and successfully synchronized into <strong>The Vault</strong>. All folders frozen, gradebooks reset for next cycle.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}