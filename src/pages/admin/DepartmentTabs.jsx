import React from 'react';
import { GradingTabContent } from './components/GradingTabContent';
import { VaultTabContent } from './components/VaultTabContent';

export function DepartmentTabs({ selectedDept, activeTab, setActiveTab }) {
  return (
    <div>
      {activeTab === 'staff' && <div>Staff tab content is handled by StaffTab component</div>}
      {activeTab === 'grading' && (
        <GradingTabContent dept={selectedDept} />
      )}
      {activeTab === 'vault' && (
        <VaultTabContent />
      )}
    </div>
  );
}