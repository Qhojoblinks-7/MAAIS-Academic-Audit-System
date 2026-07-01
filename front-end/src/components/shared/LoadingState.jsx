import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, Cpu, Database } from 'lucide-react';

/**
 * Premium, highly reusable Loading State component.
 * Fits into any view, card, full-screen portal, or container.
 */
export function LoadingState({
  title = "Securing Academic Handshake",
  description = "Synchronizing system state and establishing a secure connection to the database layer...",
  variant = "default", // "default" | "fullscreen" | "card" | "mini"
  showSkeletons = false,
  skeletonCount = 3
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  // Mini inline indicator
  if (variant === "mini") {
    return (
      <div id="loading_mini_container" className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm border border-slate-150 rounded-xl">
        <Loader2 size={16} className="text-teal-600 animate-spin" />
        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{title}</span>
      </div>
    );
  }

  return (
    <div 
      id={`loading_${variant}_container`} 
      className={cn(
        "flex flex-col items-center justify-center text-center p-8",
        variant === "fullscreen" && "min-h-screen bg-[#F8FAFC]",
        variant === "card" && "bg-white border border-slate-200/80 rounded-[2.5rem] shadow-sm py-12 px-6",
        variant === "default" && "w-full py-16"
      )}
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full flex flex-col items-center space-y-6"
      >
        {/* Animated loader core */}
        <motion.div 
          variants={itemVariants} 
          className="relative flex items-center justify-center"
        >
          {/* Pulsing ring outer */}
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-20 h-20 bg-teal-100 rounded-full"
          />
          
          {/* Rotating spinner center */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 bg-white border-2 border-slate-100 border-t-teal-650 rounded-full flex items-center justify-center shadow-md relative z-10"
          >
            <Database size={20} className="text-teal-650" />
          </motion.div>
          
          {/* Dynamic orbiting particle */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute w-20 h-20"
          >
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-md shadow-indigo-500/50" />
          </motion.div>
        </motion.div>

        {/* Text information hierarchy */}
        <div className="space-y-2">
          <motion.h3 
            variants={itemVariants}
            className="text-sm font-black text-slate-900 uppercase tracking-[0.15em] italic font-display"
          >
            {title}
          </motion.h3>
          
          <motion.p 
            variants={itemVariants}
            className="text-xs font-semibold text-slate-450 leading-relaxed max-w-sm mx-auto"
          >
            {description}
          </motion.p>
        </div>

        {/* Shimmering item list skeleton fallback */}
        {showSkeletons && (
          <motion.div 
            variants={itemVariants}
            className="w-full space-y-3 pt-4 border-t border-slate-100 mt-2 text-left"
          >
            {Array.from({ length: skeletonCount }).map((_, idx) => (
              <div 
                key={idx} 
                className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-between animate-pulse"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 bg-slate-200 rounded-md w-1/3" />
                  <div className="h-2.5 bg-slate-150 rounded-md w-2/3" />
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-lg shrink-0" />
              </div>
            ))}
          </motion.div>
        )}

        {/* System telemetry line */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-1.5 text-[8px] font-mono text-slate-400 uppercase tracking-widest pt-2"
        >
          <Cpu size={10} />
          <span>SYS_CORE_SYNC_ACTIVE_OK</span>
        </motion.div>

      </motion.div>
    </div>
  );
}

export default LoadingState;
