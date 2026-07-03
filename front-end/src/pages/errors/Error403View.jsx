import React, { useState } from 'react';
import { ShieldAlert, ArrowLeft, Send, CheckCircle, ShieldCheck, Compass, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Error403View() {
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [errorDetail, setErrorDetail] = useState('');

  const handleRequestAccess = async () => {
    setRequesting(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const reason = params.get('error') || 'Access denied to protected resource';
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('accessToken');
      if (token) {
        await fetch('/api/v1/comms/tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          credentials: 'include',
          body: JSON.stringify({
            subject: 'Access Clearance Request',
            message: `User was denied access to a protected resource. Reason: ${reason}. Please review and grant appropriate permissions.`,
            priority: 'MEDIUM',
          }),
        });
      }
    } catch {
      setErrorDetail('Failed to submit request. Please contact the administrator directly.');
    } finally {
      setRequesting(false);
      setRequestSent(true);
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div id="error_403_container" className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 selection:bg-amber-100 selection:text-amber-900">
      <div className="max-w-xl w-full text-center space-y-8" id="error_403_content">
        
        {/* Animated Badge & Icon */}
        <div className="relative flex justify-center" id="error_403_badge_wrapper">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.05, 1], opacity: 1 }}
            transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
            className="w-24 h-24 bg-amber-50 border border-amber-200 text-amber-600 rounded-[2rem] flex items-center justify-center shadow-md"
          >
            <Lock size={44} />
          </motion.div>
          
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute -bottom-3 px-4 py-1.5 bg-amber-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-600/20"
          >
            RESTRICTED REALM
          </motion.span>
        </div>

        {/* Error Typography */}
        <div className="space-y-3" id="error_403_text">
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-7xl font-black text-slate-900 font-display italic tracking-tighter"
          >
            403
          </motion.h1>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-black text-slate-950 italic font-display leading-tight"
          >
            Access Denied / Forbidden
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-sm font-semibold text-slate-500 max-w-md mx-auto leading-relaxed"
          >
            Your current security credentials do not grant read or write privileges for this administrative module. Authorized staff permission is required.
          </motion.p>
        </div>

        {/* Warning Indicator Details Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white border border-slate-200 rounded-[2rem] p-6 text-left shadow-sm space-y-4"
          id="error_403_info_card"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none mb-1">Security Clearance Breach</p>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Attempted to query encrypted student records, system logs, or staff wage sheets. These domains require explicit Level 3 (HOD/Admin) administrative clearance.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
          id="error_403_actions"
        >
          <AnimatePresence mode="wait">
            {requestSent ? (
              <motion.div 
                key="sent"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-[10px] font-bold uppercase tracking-wider"
              >
                <CheckCircle size={14} className="text-emerald-600" />
                Clearance Audit Requested
              </motion.div>
            ) : (
              <button 
                id="error_403_request_btn"
                onClick={handleRequestAccess}
                disabled={requesting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/15 transition-all outline-none cursor-pointer border-none"
              >
                {requesting ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4.5 h-4.5 border-2 border-white/20 border-t-white rounded-full"
                    />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send size={14} className="text-amber-400" />
                    Request Clearance Audit
                  </>
                )}
              </button>
            )}
          </AnimatePresence>
          
          <button 
            id="error_403_home_btn"
            onClick={handleGoHome}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700 transition-all shadow-sm outline-none cursor-pointer"
          >
            <ArrowLeft size={14} className="text-slate-400" />
            Go back to Safety
          </button>
        </motion.div>

        {/* Footer Info */}
        <p className="text-[10px] text-slate-400 uppercase tracking-widest italic" id="error_403_footer">
          Required Clearance: <span className="font-mono text-slate-600 font-bold">LEVEL_3_GOVERNANCE_PRIVILEGE</span>
        </p>

      </div>
    </div>
  );
}

export default Error403View;
