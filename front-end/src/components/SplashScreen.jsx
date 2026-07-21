import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import LogoImage from '../../assets/mando.png'; 

// --- Internal Components & Styling for Background ---
const iconBackgroundData = [
  { path: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5", label: "Book/Curriculum" }, 
  { path: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8", label: "Analytics/Report" }, 
  { path: "M20 16V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12m16 0a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2m16 0v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4", label: "Server/System" }, 
  { path: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z", label: "Folder/Records" }, 
  { path: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75", label: "Users/Collaboration" }, 
];

function EdTechIconBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden opacity-[0.04]"> 
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="edTechPattern" x="0" y="0" width="180" height="180" patternUnits="userSpaceOnUse">
            {iconBackgroundData.map((icon, index) => {
              const xPos = (index * 38 + 20) % 180;
              const yPos = (index * 32 + 25) % 180;
              const scale = 1.5 + (index * 0.15); 
              
              return (
                <g 
                  key={index} 
                  transform={`translate(${xPos}, ${yPos}) scale(${scale})`} 
                  fill="none" 
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-brand-primary"
                >
                  <path d={icon.path} />
                </g>
              );
            })}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#edTechPattern)" />
      </svg>
    </div>
  );
}
// ---------------------------------------------------

export function SplashScreen({ onComplete }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!hasStarted) return;

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 14 + 6;
      setProgress(Math.min(currentProgress, 100));

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setVisible(false);
          setTimeout(() => onComplete?.(), 500);
        }, 300);
      }
    }, 90);

    return () => clearInterval(interval);
  }, [hasStarted, onComplete]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      onClick={() => !hasStarted && setHasStarted(true)}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-12 bg-background select-none font-sans ${
        !hasStarted ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      {/* Outlined Icons Background */}
      <EdTechIconBackground />

      <div className="hidden sm:block h-12" />

      {/* Hero Branding Section */}
      <div className="flex flex-col items-center my-auto w-full px-4 sm:px-6 text-center z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-24 h-24 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 mb-4 sm:mb-6 flex items-center justify-center"
        >
          <img 
            src={LogoImage} 
            alt="MAAIS Logo" 
            className="w-full h-full object-contain filter drop-shadow-[0_16px_36px_rgba(26,63,47,0.12)]" 
            draggable="false"
          />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-text-primary tracking-[0.2em] uppercase pl-[0.2em] mb-3 sm:mb-4"
        >
          MAAIS
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="space-y-1 sm:space-y-2"
        >
          <p className="text-brand-primary font-bold tracking-[0.25em] text-xs uppercase">
            Academic Audit System
          </p>
          <p className="text-text-secondary tracking-wide text-xs font-medium opacity-90">
            Mando Senior High Technical School
          </p>
        </motion.div>
      </div>

      {/* Bottom Interface Area */}
      <div className="w-full max-w-xs h-16 flex flex-col justify-end items-center z-10">
        <AnimatePresence mode="wait">
          {!hasStarted ? (
            <motion.p
              key="tap-prompt"
              initial={{ opacity: 0, y: 5 }}
              animate={{ 
                opacity: [0.4, 0.8, 0.4],
                y: 0,
                transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
              }}
              exit={{ opacity: 0, y: -5 }}
              className="text-text-secondary text-xs font-semibold tracking-[0.3em] uppercase pl-[0.3em]"
            >
              Tap anywhere to enter
            </motion.p>
          ) : (
            <motion.div
              key="loading-ui"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center"
            >
              <div className="w-full h-[3px] bg-muted rounded-full overflow-hidden mb-2.5">
                <motion.div
                  className="h-full bg-brand-primary rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>
              <span className="text-text-secondary font-mono text-xs tracking-widest font-bold tabular-nums">
                {Math.round(progress)}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
