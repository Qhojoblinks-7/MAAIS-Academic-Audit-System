import React, { createContext, useContext, useState, useCallback } from 'react';

const BreadcrumbContext = createContext(undefined);

export function BreadcrumbProvider({ children }) {
  const [crumbs, setCrumbs] = useState([]);

  const setBreadcrumb = useCallback((items) => {
    setCrumbs(items);
  }, []);

  return (
    <BreadcrumbContext.Provider value={{ crumbs, setBreadcrumb }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
}
