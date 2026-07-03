import React, { useState, useEffect } from 'react';
import { ServerCrash, ArrowLeft, RefreshCw, Terminal, ChevronDown, ChevronUp, Copy, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Error500View() {
  const [showStack, setShowStack] = useState(false);
  const [copied, setCopied] = useState(false);
  const [serverInfo, setServerInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  useEffect(() => {
    const fetchServerInfo = async () => {
      try {
        const res = await fetch('/api/v1/health', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setServerInfo(data);
        }
      } catch {
        setServerInfo(null);
      } finally {
        setLoadingInfo(false);
      }
    };
    fetchServerInfo();
  }, []);

  const errorId = `ERR-500-${Date.now().toString(36).toUpperCase()}`;
  const timestamp = new Date().toISOString();

  const diagnostics = serverInfo
    ? `[System Status]
    Timestamp: ${timestamp}
    Incident ID: ${errorId}
    Server Status: ${JSON.stringify(serverInfo, null, 2)}`
    : `[System Status]
    Timestamp: ${timestamp}
    Incident ID: ${errorId}
    Server Status: UNREACHABLE

    The academic engine is not responding. The event has been logged automatically.
    Please retry or contact the system administrator if the issue persists.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(diagnostics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div id="error_500_container" className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 selection:bg-rose-100 selection:text-rose-900">
      <div className="max-w-xl w-full text-center space-y-8" id="error_500_content">
        
        {/* Animated Icon and Status Badge */}
        <div className="relative flex justify-center" id="error_500_badge_wrapper">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.05, 1], opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
            className="w-24 h-24 bg-rose-50 border border-rose-200 text-rose-600 rounded-[2rem] flex items-center justify-center shadow-md"
          >
            <ServerCrash size={44} />
          </motion.div>
          
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute -bottom-3 px-4 py-1.5 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-600/20"
          >
            SYSTEM OVERFLOW
          </motion.span>
        </div>

        {/* Error Typography */}
        <div className="space-y-3" id="error_500_text">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-7xl font-black text-slate-900 font-display italic tracking-tighter"
          >
            500
          </motion.h1>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-black text-slate-950 italic font-display leading-tight"
          >
            Internal Server Error
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm font-semibold text-slate-500 max-w-md mx-auto leading-relaxed"
          >
            The unified academic engine encountered an unhandled execution panic while processing database correlations. The event was automatically logged.
          </motion.p>
        </div>

        {/* Action Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          id="error_500_actions"
        >
          <button 
            id="error_500_reload_btn"
            onClick={handleReload}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/15 transition-all outline-none cursor-pointer border-none"
          >
            <RefreshCw size={14} className="text-teal-400" />
            Retry Core Handshake
          </button>
          
          <button 
            id="error_500_home_btn"
            onClick={handleGoHome}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 transition-all shadow-sm outline-none cursor-pointer"
          >
            <ArrowLeft size={14} className="text-slate-400" />
            Go back to Dashboard
          </button>
        </motion.div>

        {/* Collapsible Diagnostics Panel */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="border border-slate-200 rounded-[2rem] overflow-hidden bg-white shadow-sm"
          id="error_500_diagnostics"
        >
          <button
            id="error_500_toggle_stack_btn"
            onClick={() => setShowStack(!showStack)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-all outline-none border-none cursor-pointer"
          >
            <span className="flex items-center gap-2.5 text-[10px] font-black text-slate-800 uppercase tracking-widest">
              <Terminal size={14} className="text-slate-500" />
              Developer Diagnostic logs
            </span>
            {showStack ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>

          <AnimatePresence>
            {showStack && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-100 overflow-hidden"
              >
                <div className="p-6 bg-slate-950 text-left text-[11px] font-mono text-slate-300 leading-relaxed overflow-x-auto relative max-h-60">
                  <pre className="pr-12">{diagnostics}</pre>
                  
                  <button 
                    id="error_500_copy_stack_btn"
                    onClick={handleCopy}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all outline-none border-none cursor-pointer"
                    title="Copy Stack Trace"
                  >
                    {copied ? <CheckCircle size={14} className="text-teal-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer info */}
        <p className="text-[10px] text-slate-400 uppercase tracking-widest italic" id="error_500_footer">
          SLA Incident Ticket ID: <span className="font-mono text-slate-600 font-bold">#ERR-500-SYS-091E</span>
        </p>

      </div>
    </div>
  );
}

export default Error500View;
