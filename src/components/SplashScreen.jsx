import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';

export function SplashScreen({ onComplete }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(true);

  const handleStart = () => {
    setHasStarted(true);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      setProgress(Math.min(currentProgress, 100));
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setShow(false);
          setTimeout(() => onComplete?.(), 500);
        }, 300);
      }
    }, 100);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="mb-12"
            >
              <div className="w-28 h-28 mx-auto bg-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-600/30 mb-6">
                <BookOpen size={56} className="text-white" />
              </div>
              <h1 className="text-5xl font-black text-white tracking-tight mb-3">
                MAAIS
              </h1>
              <p className="text-emerald-200 font-medium text-xl mb-1">
                Academic Audit System
              </p>
              <p className="text-slate-400 text-sm">
                Akim Technical University
              </p>
            </motion.div>

            {!hasStarted ? (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={handleStart}
                className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 mx-auto"
              >
                Launch Application
                <ArrowRight size={18} />
              </motion.button>
            ) : (
              <>
                <div className="w-72 h-1.5 bg-slate-700 rounded-full overflow-hidden mx-auto mb-4">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <p className="text-slate-300 text-xs">
                  Initializing system... {Math.round(progress)}%
                </p>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}