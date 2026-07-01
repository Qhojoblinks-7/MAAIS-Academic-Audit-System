import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, RefreshCw, Key, UserCheck, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthToken } from '../../services/auth';

export function Error401View() {
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleVerifySession = async () => {
    setChecking(true);
    setChecked(false);
    try {
      const token = getAuthToken();
      if (!token) {
        setChecked(true);
        return;
      }
      const res = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        setVerified(true);
        setTimeout(() => window.location.href = '/', 1500);
      } else {
        setChecked(true);
      }
    } catch {
      setChecked(true);
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <div id="error_401_container" className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-xl w-full text-center space-y-8" id="error_401_content">
        
        {/* Animated Badge & Icon */}
        <div className="relative flex justify-center" id="error_401_badge_wrapper">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.05, 1], opacity: 1 }}
            transition={{ duration: 1.1, repeat: Infinity, repeatType: 'reverse' }}
            className="w-24 h-24 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-[2rem] flex items-center justify-center shadow-md"
          >
            <Key size={44} />
          </motion.div>
          
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute -bottom-3 px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20"
          >
            MUTED IDENTiTY
          </motion.span>
        </div>

        {/* Error Typography */}
        <div className="space-y-3" id="error_401_text">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-7xl font-black text-slate-900 font-display italic tracking-tighter"
          >
            401
          </motion.h1>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-black text-slate-950 italic font-display leading-tight"
          >
            Session Unauthorized
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm font-semibold text-slate-500 max-w-md mx-auto leading-relaxed"
          >
            Your login token has expired or is invalid. Secure authentication signatures are required to decrypt academic database endpoints.
          </motion.p>
        </div>

        {/* Dynamic checking status box */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white border border-slate-200 rounded-[2rem] p-6 text-left shadow-sm space-y-4"
          id="error_401_info_card"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck size={18} className="text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Session Integrity Status</p>
              
              <AnimatePresence mode="wait">
                {checking ? (
                  <motion.p 
                    key="checking" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="text-[11px] text-indigo-600 font-bold tracking-wider uppercase mt-1.5 flex items-center gap-1.5"
                  >
                    <RefreshCw size={12} className="animate-spin" />
                    Auditing security tokens...
                  </motion.p>
                ) : verified ? (
                  <motion.p 
                    key="verified" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="text-[11px] text-emerald-600 font-bold tracking-wider uppercase mt-1.5 flex items-center gap-1.5"
                  >
                    <CheckCircle size={12} />
                    Session valid — redirecting to dashboard...
                  </motion.p>
                ) : checked ? (
                  <motion.p 
                    key="checked" 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="text-[11px] text-emerald-600 font-bold tracking-wider uppercase mt-1.5 flex items-center gap-1.5"
                  >
                    <CheckCircle size={12} />
                    Audit Complete: Active session signature is corrupt. Please sign in again.
                  </motion.p>
                ) : (
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                    To safeguard student compliance logs, sessions automatically expire after 15 minutes of user inactivity. Please re-authenticate your identity.
                  </p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Action Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          id="error_401_actions"
        >
          <button 
            id="error_401_signin_btn"
            onClick={handleSignOut}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/15 transition-all outline-none cursor-pointer border-none"
          >
            <UserCheck size={14} className="text-indigo-400" />
            Sign In with Fresh Credentials
          </button>

          <button 
            id="error_401_verify_btn"
            onClick={handleVerifySession}
            disabled={checking}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 transition-all shadow-sm outline-none cursor-pointer"
          >
            <RefreshCw size={14} className={checking ? "animate-spin text-slate-500" : "text-slate-400"} />
            Verify Active Token
          </button>
        </motion.div>

        {/* Footer Info */}
        <p className="text-[10px] text-slate-400 uppercase tracking-widest italic" id="error_401_footer">
          Auth Signature: <span className="font-mono text-slate-600 font-bold">MUTED_TOKEN_EXPIRED_OR_REVOKED</span>
        </p>

      </div>
    </div>
  );
}

export default Error401View;
