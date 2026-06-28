import React from 'react';
import { GradingTabContent } from './components/GradingTabContent';
import { VaultTabContent } from './components/VaultTabContent';

export function DepartmentTabs({ selectedDept, activeTab, setActiveTab, handleNodeOperation }) {
  return (
    <div>
      {activeTab === 'staff' && <div>Staff tab content is handled by StaffTab component</div>}
      {activeTab === 'grading' && (
        <GradingTabContent dept={selectedDept} handleNodeOperation={handleNodeOperation} />
      )}
      {activeTab === 'vault' && (
        <VaultTabContent selectedDept={selectedDept} />
      )}
    </div>
  );
 }