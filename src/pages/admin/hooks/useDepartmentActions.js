import { useState } from 'react';
import {
  exportDepartmentDossier,
  freezeDepartment,
  transferTeacher,
  authorizeTemplate,
  uploadStrategyPulseFile,
  resetTeacherCredentials,
} from '../../../services/departmentService';

export function useDepartmentActions() {
  const [isExporting, setIsExporting] = useState(false);
  const [isFreezing, setIsFreezing] = useState(false);
  const [transferModal, setTransferModal] = useState({
    isOpen: false,
    deptId: null,
    deptName: '',
    availableStaff: [],
  });
  const [templateUpdateModal, setTemplateUpdateModal] = useState({
    isOpen: false,
    deptId: null,
    deptName: '',
    template: '',
  });
  const [strategyPulseModal, setStrategyPulseModal] = useState({
    isOpen: false,
    deptId: null,
    files: null,
  });

  const exportDossier = async (department) => {
    setIsExporting(true);
    try {
      const result = exportDepartmentDossier(department);
      return { ...result, exportRecord: { departmentId: department.id, exportedAt: new Date().toISOString() } };
    } catch (error) {
      return { success: false, message: 'Export failed. Please try again.' };
    } finally {
      setIsExporting(false);
    }
  };

  const initiateFreeze = async (department) => {
    setIsFreezing(true);
    try {
      const result = await freezeDepartment(department);
      return result;
    } catch (error) {
      return { success: false, message: 'Freeze operation failed.' };
    } finally {
      setIsFreezing(false);
    }
  };

  const openTransferModal = (deptId, deptName, allDepartments) => {
    const otherDepartments = allDepartments.filter(d => d.id !== deptId);
    const availableStaff = otherDepartments.flatMap(dept => 
      (dept.staff || []).map(s => ({
        ...s,
        currentDept: dept.name,
        currentDeptId: dept.id,
      }))
    ).filter(s => !s.isHOD);

    setTransferModal({
      isOpen: true,
      deptId,
      deptName,
      availableStaff,
    });
  };

  const transferTeacherToCluster = (departments, setDepartments, staffId, toDeptId) => {
    try {
      return transferTeacher(departments, setDepartments, staffId, toDeptId);
    } catch (error) {
      return { success: false, message: 'Transfer operation failed.' };
    }
  };

  const authorizeTemplateUpdate = (deptId, template) => {
    return authorizeTemplate(deptId, template);
  };

  const uploadStrategyPulse = async (files) => {
    return uploadStrategyPulseFile(files);
  };

  const handleCredentialReset = async (staffId, staffName) => {
    return resetTeacherCredentials(staffId, staffName);
  };

  const closeTransferModal = () => {
    setTransferModal({ isOpen: false, deptId: null, deptName: '', availableStaff: [] });
  };

  const closeTemplateUpdateModal = () => {
    setTemplateUpdateModal({ isOpen: false, deptId: null, deptName: '', template: '' });
  };

  const closeStrategyPulseModal = () => {
    setStrategyPulseModal({ isOpen: false, deptId: null, files: null });
  };

  return {
    isExporting,
    isFreezing,
    transferModal,
    templateUpdateModal,
    strategyPulseModal,
    exportDossier,
    initiateFreeze,
    openTransferModal,
    transferTeacherToCluster,
    authorizeTemplateUpdate,
    uploadStrategyPulse,
    closeTransferModal,
    closeTemplateUpdateModal,
    closeStrategyPulseModal,
    setTemplateUpdateModal,
    setStrategyPulseModal,
    handleCredentialReset,
  };
}