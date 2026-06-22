import React, { useEffect } from 'react';

const UIContext = React.createContext(undefined);

export function UIProvider({ children }) {
  const [settingsModalOpen, setSettingsModalOpen] = React.useState(false);
  const [supportModalOpen, setSupportModalOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isDraftMode, setIsDraftMode] = React.useState(() => {
    const saved = localStorage.getItem('draftMode');
    return saved ? JSON.parse(saved) : true;
  });
  const [isTermFinalized, setIsTermFinalized] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [screenWidth, setScreenWidth] = React.useState(window.innerWidth);
  const [revisionCount, setRevisionCount] = React.useState(0);
  const [missingObservationCount, setMissingObservationCount] = React.useState(0);
  const [rightPanelVisible, setRightPanelVisible] = React.useState(true);

  useEffect(() => {
    localStorage.setItem('draftMode', JSON.stringify(isDraftMode));
  }, [isDraftMode]);

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

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;

  return (
<UIContext.Provider value={{
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
        screenWidth,
        isMobile,
        isTablet,
        isDesktop,
        revisionCount,
        setRevisionCount,
        missingObservationCount,
        setMissingObservationCount,
        rightPanelVisible,
        setRightPanelVisible,
      }}>
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
