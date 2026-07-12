import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function AlertModal({ isOpen, onClose, title, message, type = 'info', actions }) {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle size={24} className="text-success" />,
    warning: <AlertTriangle size={24} className="text-warning" />,
    danger: <AlertTriangle size={24} className="text-destructive" />,
    info: <Info size={24} className="text-brand-primary" />
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-foreground/40 backdrop-blur-xs"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-sm bg-surface rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center shrink-0">
              {icons[type]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-black text-foreground mb-1">{title}</h3>
              <p className="text-muted-foreground text-xs font-medium leading-normal">{message}</p>
            </div>
             <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-all shrink-0">
              <X size={16} />
            </button>
          </div>
          <div className="flex gap-2.5">
            {actions || (
               <button onClick={onClose} className="flex-1 py-2.5 bg-foreground text-background rounded-xl text-xs font-black uppercase tracking-wider transition-all">
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