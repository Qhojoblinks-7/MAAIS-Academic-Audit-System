import React from 'react';
import { GradingTabContent } from './components/GradingTabContent';
import { DepartmentGradingSheet } from './components/DepartmentGradingSheet';
import { SubjectsTab } from './components/SubjectsTab';

export function DepartmentTabs({ selectedDept, activeTab, setActiveTab, handleNodeOperation }) {
  return (
    <div>
      {activeTab === 'staff' && <div>Staff tab content is handled by StaffTab component</div>}
      {activeTab === 'subjects' && <SubjectsTab selectedDept={selectedDept} />}
      {activeTab === 'grading' && (
        <GradingTabContent dept={selectedDept} handleNodeOperation={handleNodeOperation} />
      )}
      {activeTab === 'vault' && (
        <DepartmentGradingSheet dept={selectedDept} />
      )}
    </div>
  );
 }