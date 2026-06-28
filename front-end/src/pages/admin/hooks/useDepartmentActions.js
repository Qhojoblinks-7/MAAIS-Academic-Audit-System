import { useState } from 'react';
import {
  exportDepartmentDossier,
  freezeDepartment,
  transferTeacher,
  authorizeTemplate,
  uploadStrategyPulseFile,
  resetTeacherCredentials,
} from '../../../services/departmentService';
import { useAssignHOD, useTransferTeacher, useDeactivateUser, useDeleteDepartment } from '../../../lib/hooks';

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

  const assignHODMutation = useAssignHOD();
  const transferMutation = useTransferTeacher();
  const deactivateMutation = useDeactivateUser();
  const deleteMutation = useDeleteDepartment();

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

  const transferTeacherToCluster = async (departments, setDepartments, staffId, toDeptId) => {
    const fromDept = departments.find(d => d.staff?.some(s => s.id === staffId));
    const toDept = departments.find(d => d.id === toDeptId);

    if (!fromDept || !toDept || fromDept.id === toDept.id) {
      return { success: false, message: 'Invalid transfer operation.' };
    }

    const staffMember = fromDept.staff.find(s => s.id === staffId);
    if (!staffMember) {
      return { success: false, message: 'Staff member not found.' };
    }

    try {
      await transferMutation.mutateAsync({
        teacherId: staffId,
        fromDeptId: fromDept.id,
        toDeptId,
      });
      return { success: true, message: `Teacher transferred to cluster successfully.` };
    } catch (error) {
      return { success: false, message: 'Transfer operation failed on server.' };
    }
  };

  const assignHOD = async (deptId, staffId) => {
    try {
      const result = await assignHODMutation.mutateAsync({ deptId, staffId });
      return result;
    } catch (error) {
      return { success: false, message: 'Failed to assign HOD.' };
    }
  };

  const revokeHOD = async (deptId) => {
    try {
      const result = await assignHODMutation.mutateAsync({ deptId, staffId: null });
      return result;
    } catch (error) {
      return { success: false, message: 'Failed to revoke HOD.' };
    }
  };

  const deepArchiveStaff = async (staffId) => {
    try {
      await deactivateMutation.mutateAsync(staffId);
      return { success: true, message: 'Staff archived successfully.' };
    } catch (error) {
      return { success: false, message: 'Archive operation failed.' };
    }
  };

  const deleteDepartment = async (deptId) => {
    try {
      const result = await deleteMutation.mutateAsync(deptId);
      return result;
    } catch (error) {
      return { success: false, message: 'Delete operation failed.' };
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