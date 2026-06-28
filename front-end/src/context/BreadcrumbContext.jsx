import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const BreadcrumbContext = createContext(undefined);

/**
 * BreadcrumbProvider manages semantic application trail nodes.
 * Uses strict reference memoization to block nested layout re-rendering pipelines.
 */
export function BreadcrumbProvider({ children }) {
  const [crumbs, setCrumbs] = useState([]);

  // Retains stable structural identity
  const setBreadcrumb = useCallback((items) => {
    // Expects an array or an updater callback function
    setCrumbs(items);
  }, []);

  // FIX: Memoize the object literal shell. Consumers will now bypass 
  // evaluation triggers unless the layout crumbs contents explicitly shift.
  const contextValue = useMemo(() => ({
    crumbs,
    setBreadcrumb
  }), [crumbs, setBreadcrumb]);

  return (
    <BreadcrumbContext.Provider value={contextValue}>
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