import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertTriangle, X, Activity } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export function ConnectivityBanner() {
  const [status, setStatus] = useState('online');
  const [isVisible, setIsVisible] = useState(false);
  const [latency, setLatency] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const pingServer = async () => {
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
      if (res.ok) {
        setStatus(ms > 1500 ? 'degraded' : 'online');
      } else {
        setStatus('degraded');
      }
    } catch {
      setStatus('offline');
      setLatency(null);
    }
  };

  useEffect(() => {
    pingServer();
    const interval = setInterval(pingServer, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status === 'online') {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 4000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [status]);

  return (
    <div id="global_network_banner_wrapper" className="relative z-[200]">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            id="network_connectivity_banner"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            {status === 'online' && (
              <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white px-4 py-2 text-center text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-md relative border-b border-emerald-800">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Wifi size={14} className="text-emerald-400" />
                </div>
                 <span>Network Stable • Connected to the academic server. Changes are synced instantly in real-time.</span>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-[9px] font-mono text-emerald-300/80">{latency ? `${latency}ms` : '—'}</span>
                  <button
                    id="dismiss_banner_online_btn"
                    onClick={() => setIsVisible(false)}
                    className="text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            {status === 'degraded' && (
              <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2.5 text-center text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-md border-b border-amber-500">
                <div className="flex items-center gap-2">
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <AlertTriangle size={14} className="text-amber-200" />
                  </motion.div>
                </div>
                <span>Degraded Response • Server latency is elevated. Operations may be slower than usual.</span>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-[9px] font-mono text-amber-100/80">{latency ? `${latency}ms` : '—'}</span>
                  <button
                    id="dismiss_banner_unstable_btn"
                    onClick={() => setIsVisible(false)}
                    className="text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            {status === 'offline' && (
              <div className="bg-gradient-to-r from-rose-700 to-rose-850 text-white px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-md border-b border-rose-650">
                <div className="flex items-center gap-2">
                  <WifiOff size={14} className="text-rose-200 animate-pulse" />
                </div>
                <span>Server Unreachable • Cannot reach the academic engine. Please check your connection and retry.</span>
                <div className="flex items-center gap-3 ml-4">
                  <button
                    id="retry_offline_btn"
                    onClick={pingServer}
                    className="px-2 py-0.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-md text-[8px] font-bold text-rose-100 transition-all cursor-pointer"
                  >
                    Retry
                  </button>
                  <button
                    id="dismiss_banner_offline_btn"
                    onClick={() => setIsVisible(false)}
                    className="text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating recall pill when banner is dismissed but not online */}
      {!isVisible && status !== 'online' && (
        <motion.button
          id="recall_connectivity_banner_pill"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsVisible(true)}
          className={`fixed bottom-4 right-4 z-[220] px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg border cursor-pointer ${
            status === 'offline' 
              ? 'bg-rose-600 border-rose-500 text-white shadow-rose-650/20' 
              : 'bg-amber-600 border-amber-500 text-white shadow-amber-650/20'
          }`}
        >
          <Activity size={12} className="animate-pulse" />
          <span>Status Alert: {status === 'offline' ? 'Server Unreachable' : 'Degraded Response'} • {latency ? `${latency}ms` : '—'}</span>
        </motion.button>
      )}
    </div>
  );
}

export default ConnectivityBanner;
