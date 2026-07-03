import React, { useEffect, useState, useMemo, useCallback } from 'react';

const UIContext = React.createContext(undefined);

export function UIProvider({ children }) {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTermFinalized, setIsTermFinalized] = useState(false);
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [revisionCount, setRevisionCount] = useState(0);
  const [missingObservationCount, setMissingObservationCount] = useState(0);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);

  const [isDraftMode, setIsDraftMode] = useState(() => {
    try {
      const saved = localStorage.getItem('draftMode');
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Calculate initial window states safely to avoid SSR layout mismatch crashes
  const [deviceType, setDeviceType] = useState(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      width
    };
  });

  // ── Sync Draft Settings ──────────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem('draftMode', JSON.stringify(isDraftMode));
    } catch (e) {
      console.warn('Failed to persist draftMode state to localStorage:', e);
    }
  }, [isDraftMode]);

  // ── Network Connectivity Monitor ──────────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ── Throttled Layout Breakpoint Engine ────────────────────────────────────
  useEffect(() => {
    let timeoutId = null;
    
    const handleResize = () => {
      // Use a lightweight debounce macro to avoid choking UI threads during window scaling
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const currentWidth = window.innerWidth;
        setDeviceType((prev) => {
          const nextMobile = currentWidth < 768;
          const nextTablet = currentWidth >= 768 && currentWidth < 1024;
          const nextDesktop = currentWidth >= 1024;

          // Prevent state commitment if the breakpoint zone remains unaltered
          if (
            prev.isMobile === nextMobile &&
            prev.isTablet === nextTablet &&
            prev.isDesktop === nextDesktop &&
            prev.width === currentWidth
          ) {
            return prev;
          }

          return {
            isMobile: nextMobile,
            isTablet: nextTablet,
            isDesktop: nextDesktop,
            width: currentWidth
          };
        });
      }, 100); // 100ms processing buffer
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // ── Memoized Context Payload ──────────────────────────────────────────────
  const contextValue = useMemo(() => ({
    settingsModalOpen,
    setSettingsModalOpen,
    supportModalOpen,
    setSupportModalOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
    isDraftMode,
    setIsDraftMode,
    isTermFinalized,
    setIsTermFinalized,
    isOnline,
    setIsOnline,
    screenWidth: deviceType.width,
    isMobile: deviceType.isMobile,
    isTablet: deviceType.isTablet,
    isDesktop: deviceType.isDesktop,
    revisionCount,
    setRevisionCount,
    missingObservationCount,
    setMissingObservationCount,
    rightPanelVisible,
    setRightPanelVisible,
  }), [
    settingsModalOpen,
    supportModalOpen,
    mobileMenuOpen,
    isDraftMode,
    isTermFinalized,
    isOnline,
    deviceType,
    revisionCount,
    missingObservationCount,
    rightPanelVisible
  ]);

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = React.useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}