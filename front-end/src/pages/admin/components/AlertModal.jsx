import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function AlertModal({ isOpen, onClose, title, message, type = 'info', actions }) {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle size={24} className="text-emerald-500" />,
    warning: <AlertTriangle size={24} className="text-amber-500" />,
    danger: <AlertTriangle size={24} className="text-rose-500" />,
    info: <Info size={24} className="text-blue-500" />
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
              {icons[type]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-black italic text-slate-900 mb-1">{title}</h3>
              <p className="text-slate-500 text-[11px] font-medium leading-normal">{message}</p>
            </div>
            <button onClick={onClose} className="p-1 text-slate-300 hover:text-slate-900 rounded-md hover:bg-slate-50 transition-all shrink-0">
              <X size={16} />
            </button>
          </div>
          <div className="flex gap-2.5">
            {actions || (
              <button onClick={onClose} className="flex-1 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all">
                Acknowledge
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default AlertModal;