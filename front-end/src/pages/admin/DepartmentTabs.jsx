import React from 'react';
import { GradingTabContent } from './components/GradingTabContent';
import { DepartmentGradingSheet } from './components/DepartmentGradingSheet';

export function DepartmentTabs({ selectedDept, activeTab, setActiveTab, handleNodeOperation }) {
  return (
    <div>
      {activeTab === 'staff' && <div>Staff tab content is handled by StaffTab component</div>}
      {activeTab === 'grading' && (
        <GradingTabContent dept={selectedDept} handleNodeOperation={handleNodeOperation} />
      )}
      {activeTab === 'vault' && (
        <DepartmentGradingSheet dept={selectedDept} />
      )}
    </div>
  );
 }