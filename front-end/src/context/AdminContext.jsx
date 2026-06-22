import React, { createContext, useContext } from 'react';
import { useAdminStore } from '../../stores';

const AdminContext = createContext(undefined);

export function AdminProvider({ children }) {
  const store = useAdminStore();
  const value = {
    filters: store.filters,
    setFilters: store.setFilters,
    updateFilter: store.updateFilter,
    resetFilters: store.resetFilters,
    selectedStudents: store.selectedStudents,
    setSelectedStudents: store.setSelectedStudents,
    toggleStudentSelection: store.toggleStudentSelection,
    clearSelection: store.clearSelection,
    adminSettings: store.adminSettings,
    updateAdminSettings: store.updateAdminSettings,
    globalLoading: store.globalLoading,
    setGlobalLoading: store.setGlobalLoading,
    globalError: store.globalError,
    setGlobalError: store.setGlobalError,
    clearError: store.clearError,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
