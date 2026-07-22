import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertTriangle, X, Activity, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export function ConnectivityBanner() {
  const [status, setStatus] = useState('online');
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [latency, setLatency] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const pingServer = useCallback(async () => {
    try {
      const start = performance.now();
      const res = await fetch(`${API_BASE}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined,
      });
      const ms = Math.round(performance.now() - start);
      setLatency(ms);
      setLastChecked(new Date().toLocaleTimeString());
      setStatus(ms > 1500 ? 'degraded' : 'online');
    } catch {
      setStatus('offline');
      setLatency(null);
    }
  }, []);

  useEffect(() => {
    pingServer();
    const interval = setInterval(pingServer, 15000);
    return () => clearInterval(interval);
  }, [pingServer]);

  useEffect(() => {
    if (status === 'online') {
      setIsVisible(true);
      setIsExpanded(false);
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
      setIsExpanded(true);
    }
  }, [status]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const statusMeta = {
    online: {
      icon: Wifi,
      label: 'Connected',
      subtitle: 'Academic server reachable',
      gradient: 'from-emerald-600 via-emerald-700 to-teal-800',
      border: 'border-emerald-500/30',
      shadow: 'shadow-emerald-900/20',
      iconBg: 'bg-emerald-400/20',
      iconColor: 'text-emerald-300',
      dotColor: 'bg-emerald-400',
      textMain: 'text-white',
      textSub: 'text-emerald-100/90',
      textMuted: 'text-emerald-200/70',
      buttonClass: 'bg-white/15 hover:bg-white/25 border-white/20 text-emerald-100',
    },
    degraded: {
      icon: AlertTriangle,
      label: 'Unstable',
      subtitle: 'Elevated server latency',
      gradient: 'from-amber-500 via-amber-600 to-orange-700',
      border: 'border-amber-400/30',
      shadow: 'shadow-amber-900/20',
      iconBg: 'bg-amber-400/20',
      iconColor: 'text-amber-200',
      dotColor: 'bg-amber-400',
      textMain: 'text-white',
      textSub: 'text-amber-100/90',
      textMuted: 'text-amber-200/70',
      buttonClass: 'bg-white/15 hover:bg-white/25 border-white/20 text-amber-100',
    },
    offline: {
      icon: WifiOff,
      label: 'Offline',
      subtitle: 'Server unreachable',
      gradient: 'from-rose-500 via-rose-600 to-red-700',
      border: 'border-rose-400/30',
      shadow: 'shadow-rose-900/20',
      iconBg: 'bg-rose-400/20',
      iconColor: 'text-rose-200',
      dotColor: 'bg-rose-400',
      textMain: 'text-white',
      textSub: 'text-rose-100/90',
      textMuted: 'text-rose-200/70',
      buttonClass: 'bg-white/15 hover:bg-white/25 border-white/20 text-rose-100',
    },
  };

  const meta = statusMeta[status] || statusMeta.online;
  const StatusIcon = meta.icon;

  return (
    <div
      id="global_network_banner_wrapper"
      className="relative"
      style={{ zIndex: 200 }}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            id="network_connectivity_banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 340,
              damping: 28,
              mass: 0.8,
            }}
            className="overflow-hidden"
          >
            <div
              className={`
                relative overflow-hidden
                bg-gradient-to-r ${meta.gradient}
                backdrop-blur-md
                ${meta.border} border-b
                ${meta.shadow} shadow-lg
              `}
            >
              {/* Mobile compact / expandable view */}
              {isMobile ? (
                <div className="w-full">
                  <motion.button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer"
                    animate={{ paddingTop: 12, paddingBottom: isExpanded ? 12 : 12 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: meta.dotColor.replace('bg-', '') }} />
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${meta.dotColor}`} />
                      </span>
                      <span className={`${meta.iconColor} shrink-0`}>
                        <StatusIcon size={18} strokeWidth={2.5} />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className={`${meta.textMain} text-[11px] font-black uppercase tracking-widest leading-tight truncate`}>
                        {meta.label}
                      </p>
                      <p className={`${meta.textSub} text-[10px] font-medium leading-tight truncate`}>
                        {meta.subtitle}
                      </p>
                    </div>
                    {latency ? (
                      <span className={`${meta.textMuted} text-[10px] font-mono font-bold tabular-nums shrink-0`}>
                        {latency}ms
                      </span>
                    ) : null}
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      className={`${meta.textMuted} shrink-0`}
                    >
                      <ChevronDown size={14} />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key="mobile-expanded"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 24, mass: 0.6 }}
                        className="overflow-hidden"
                      >
                        <div className={`${meta.textSub} px-4 pb-3 flex items-center gap-2 flex-wrap`}>
                          {lastChecked && (
                            <span className={`text-[9px] ${meta.textMuted} font-mono`}>
                              {lastChecked}
                            </span>
                          )}
                          <div className="flex items-center gap-2 ml-auto">
                            {status !== 'online' && (
                              <button
                                id={status === 'offline' ? 'retry_offline_btn' : 'retry_degraded_btn'}
                                onClick={(e) => { e.stopPropagation(); pingServer(); }}
                                className={`
                                  ${meta.buttonClass}
                                  px-3.5 py-2 rounded-xl
                                  border
                                  text-[10px] font-black uppercase tracking-wider
                                  backdrop-blur-sm
                                  active:scale-[0.97]
                                  transition-all
                                  cursor-pointer
                                `}
                              >
                                Retry Now
                              </button>
                            )}
                            <button
                              id={
                                status === 'online'
                                  ? 'dismiss_banner_online_btn'
                                  : status === 'degraded'
                                  ? 'dismiss_banner_unstable_btn'
                                  : 'dismiss_banner_offline_btn'
                              }
                              onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
                              className={`
                                ${meta.textMuted}
                                w-9 h-9
                                rounded-full
                                flex items-center justify-center
                                hover:bg-white/15
                                active:scale-[0.92]
                                transition-all
                                cursor-pointer
                              `}
                              aria-label="Dismiss"
                            >
                              <X size={15} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4 px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: meta.dotColor.replace('bg-', '') }} />
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${meta.dotColor}`} />
                    </span>
                    <StatusIcon size={14} className={meta.iconColor} />
                  </div>
                  <span className={`${meta.textMain} text-[11px] font-black uppercase tracking-widest`}>
                    {meta.label}
                  </span>
                  <span className={`${meta.textSub} text-[10px] font-medium hidden sm:inline`}>
                    {meta.subtitle}
                  </span>
                  {latency ? (
                    <span className={`${meta.textMuted} text-[10px] font-mono font-bold tabular-nums`}>
                      {latency}ms
                    </span>
                  ) : null}
                  {status !== 'online' && (
                    <button
                      id={status === 'offline' ? 'retry_offline_btn' : 'retry_degraded_btn'}
                      onClick={pingServer}
                      className={`
                        ${meta.buttonClass}
                        px-2.5 py-1 rounded-lg
                        border
                        text-[9px] font-black uppercase tracking-wider
                        hover:shadow-md active:scale-95
                        transition-all cursor-pointer
                      `}
                    >
                      Retry
                    </button>
                  )}
                  <button
                    id={
                      status === 'online'
                        ? 'dismiss_banner_online_btn'
                        : status === 'degraded'
                        ? 'dismiss_banner_unstable_btn'
                        : 'dismiss_banner_offline_btn'
                    }
                    onClick={() => setIsVisible(false)}
                    className={`${meta.textMuted} hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-white/10 active:scale-90`}
                    aria-label="Dismiss"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating recall pill when banner is dismissed but not online */}
      {!isVisible && status !== 'online' && (
        <motion.button
          id="recall_connectivity_banner_pill"
          initial={{ scale: 0.7, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22, mass: 0.7 }}
          onClick={() => { setIsVisible(true); pingServer(); }}
          className={`
            fixed z-[220]
            px-4 py-3 rounded-2xl
            text-[9px] font-black uppercase tracking-wider
            flex items-center gap-2.5
            shadow-xl border backdrop-blur-lg
            cursor-pointer
            active:scale-[0.96]
            ${isMobile ? 'bottom-6 right-4' : 'bottom-4 right-4'}
            ${
              status === 'offline'
                ? 'bg-rose-600/95 border-rose-500/40 text-white shadow-rose-900/30'
                : 'bg-amber-600/95 border-amber-500/40 text-white shadow-amber-900/30'
            }
          `}
        >
          <span className={`relative flex h-2 w-2 shrink-0`}>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: status === 'offline' ? '#fda4af' : '#fcd34d' }} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'offline' ? 'bg-rose-200' : 'bg-amber-200'}`} />
          </span>
          <Activity size={12} className="shrink-0 animate-pulse" />
          <span className="hidden sm:inline">
            {status === 'offline' ? 'Server Unreachable' : 'Degraded'} • {latency ? `${latency}ms` : '—'}
          </span>
          <span className="sm:hidden">
            {status === 'offline' ? 'Offline' : 'Slow'} • {latency ? `${latency}ms` : '—'}
          </span>
        </motion.button>
      )}
    </div>
  );
}

export default ConnectivityBanner;
