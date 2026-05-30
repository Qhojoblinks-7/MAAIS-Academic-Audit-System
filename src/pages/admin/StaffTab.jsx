import React from 'react';
import { StaffTabContent } from './components/StaffTabContent';

export function StaffTab({ 
  selectedDept, 
  departments,
  openKebabId, 
  toggleKebab, 
  handleAssignHOD, 
  handleNodeOperation,
  onTransferTeacher 
}) {
  if (!selectedDept) return null;
  
  const handleAddTeacher = () => {
    if (onTransferTeacher) {
      onTransferTeacher(selectedDept.id, selectedDept.name, departments);
    }
  };

  return (
    <StaffTabContent
      dept={selectedDept}
      departments={departments}
      openKebabId={openKebabId}
      toggleKebab={toggleKebab}
      handleAssignHOD={handleAssignHOD}
      handleNodeOperation={handleNodeOperation}
      onAddTeacher={handleAddTeacher}
    />
  );
}