import React, { createContext, useContext, useRef } from 'react';
import { useAdminStore } from '../../stores';

// The Context now strictly carries the stable Zustand store hook reference itself
const AdminStoreContext = createContext(undefined);

/**
 * AdminProvider protects your dashboard from unoptimized re-renders.
 * It encapsulates the store instance and passes its reference down safely.
 */
export function AdminProvider({ children }) {
  // If useAdminStore is a global store hook, we capture its reference directly.
  // (If you change your store to a factory function later, swap this line out)
  const storeRef = useRef(useAdminStore);

  return (
    <AdminStoreContext.Provider value={storeRef.current}>
      {children}
    </AdminStoreContext.Provider>
  );
}

/**
 * Custom hook to pull optimized atomic states out of the admin module scope.
 * * @example
 * // Component only re-renders when filters change:
 * const filters = useAdmin((state) => state.filters);
 * const updateFilter = useAdmin((state) => state.updateFilter);
 * * @param {Function} selector - Zustand state selector function
 */
export function useAdmin(selector) {
  const storeHook = useContext(AdminStoreContext);
  
  if (storeHook === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }

  // If a developer forgets to pass a selector, give them the entire state safely,
  // though explicit selectors should be used for optimal performance.
  const fallbackSelector = (state) => state;
  const activeSelector = selector || fallbackSelector;

  // Execute the selector logic inside Zustand's hook runtime environment
  return storeHook(activeSelector);
}