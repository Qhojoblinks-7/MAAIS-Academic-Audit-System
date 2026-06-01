import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';

export const ActionModal = ({ isOpen, onClose, title, description, actions, footer, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
          className={cn("relative w-full bg-white rounded-2xl shadow-xl", sizeClasses[size])}
        >
          {title && (
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black italic font-display">{title}</h3>
                {description && <p className="text-[8px] font-black uppercase text-white/50 tracking-wider mt-0.5">{description}</p>}
              </div>
              <X size={18} className="cursor-pointer hover:text-rose-500 transition-all" onClick={onClose} />
            </div>
          )}
          <div className="p-5 space-y-4">
            {actions}
          </div>
          {footer && (
            <div className="p-5 border-t border-slate-100">{footer}</div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = "Confirm", 
  cancelLabel = "Abort",
  confirmVariant = "danger"
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 text-center"
          >
            <h3 className="text-lg font-black italic font-display text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 text-[11px] font-medium leading-normal mb-6">{message}</p>
            <div className="flex gap-2.5">
              <button onClick={onClose} className="flex-1 py-2.5 bg-slate-50 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-wider">
                {cancelLabel}
              </button>
              <button onClick={onConfirm} className={cn(
                "flex-1 py-2.5 text-white rounded-xl text-[9px] font-black uppercase tracking-wider",
                confirmVariant === 'danger' ? "bg-rose-600 hover:bg-rose-700" : "bg-slate-900 hover:bg-black"
              )}>
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};