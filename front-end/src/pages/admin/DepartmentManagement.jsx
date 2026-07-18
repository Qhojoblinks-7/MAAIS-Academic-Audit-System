import React from "react";
import { useParams } from "react-router-dom";
import {
  normalizeDeptFromApi,
  buildInitialDepartments,
} from "./hooks/useDepartments";
import { useDepartmentActions } from "./hooks/useDepartmentActions";
import DepartmentManagementView from "./components/DepartmentManagementView";
import { AlertModal } from "./components/AlertModal";
import { authorizeTemplate } from "../../services/departmentService";
import { auditTrail } from "../../services/auditTrailService";
import { useBreadcrumb } from "../../context/BreadcrumbContext";
import {
  useAllDepartments,
  useCreateDepartment,
  useAssignHOD,
  useDeleteDepartment,
  useTransferTeacher,
  useDeactivateUser,
  useCreateStaff,
} from "../../lib/hooks";

export function DepartmentManagement() {
  const { id: routeDeptId } = useParams();
  const departmentsQuery = useAllDepartments();
  const apiDepartments = departmentsQuery.data || [];

  const [selectedDeptId, setSelectedDeptId] = React.useState(null);
  const [selectedDeptName, setSelectedDeptName] = React.useState(null);

  const departments = React.useMemo(() => {
    if (apiDepartments.length > 0) {
      return apiDepartments.map((d, idx) => normalizeDeptFromApi(d, idx));
    }
    return buildInitialDepartments();
  }, [apiDepartments]);

  const departmentsRef = React.useRef(departments);
  departmentsRef.current = departments;

  const handleSelectDept = React.useCallback((deptId) => {
    if (deptId == null) {
      setSelectedDeptId(null);
      setSelectedDeptName(null);
      return;
    }
    setSelectedDeptId(deptId);
    const dept = departmentsRef.current.find((d) => d.id === deptId);
    if (dept) setSelectedDeptName(dept.name);
  }, []);

  // When navigated from global search (/department/:id), auto-open that department.
  React.useEffect(() => {
    if (!routeDeptId) return;
    const dept = departments.find((d) => d.id === routeDeptId);
    if (dept && !selectedDeptId) {
      handleSelectDept(routeDeptId);
    }
  }, [routeDeptId, departments, selectedDeptId, handleSelectDept]);

  const selectedDept = React.useMemo(() => {
    if (!selectedDeptName) return null;
    return departments.find((d) => d.name === selectedDeptName);
  }, [selectedDeptName, departments]);

  const [activeTab, setActiveTab] = React.useState("staff");
  const { setBreadcrumb } = useBreadcrumb();

  // Breadcrumb: drive it directly from the route param so the department name
  // shows immediately (even before selection state settles) and we never fall
  // back to rendering the raw :id segment in the URL trail.
  React.useEffect(() => {
    if (routeDeptId) {
      const dept = departments.find((d) => d.id === routeDeptId);
      if (dept) {
        setBreadcrumb([
          { label: 'Departments', path: '/identity/departments' },
          { label: dept.name, path: null },
        ]);
        return;
      }
    }
    setBreadcrumb([{ label: 'Departments', path: '/identity/departments' }]);
  }, [routeDeptId, departments, setBreadcrumb]);

  React.useEffect(() => {
    if (selectedDept) {
      const tabLabel = activeTab === 'staff' ? selectedDept.name : activeTab === 'classes' ? 'Classes' : activeTab === 'academic' ? 'Academic Profile' : activeTab === 'grading' ? 'Grade Entry' : activeTab;
      setBreadcrumb([
        { label: 'Departments', path: '/identity/departments' },
        { label: tabLabel, path: null },
      ]);
    }
  }, [selectedDept, activeTab, setBreadcrumb]);
  const [viewType, setViewType] = React.useState("grid");
  const [assigningHOD, setAssigningHOD] = React.useState(null);
  const [showSpawnModal, setShowSpawnModal] = React.useState(false);
  const [spawnForm, setSpawnForm] = React.useState({
    name: "",
    description: "",
    hodName: "",
  });
  const [openKebabId, setOpenKebabId] = React.useState(null);
  const [activeOperation, setActiveOperation] = React.useState(null);
  const [alertState, setAlertState] = React.useState({ isOpen: false, title: '', message: '', type: 'info' });

  const {
    exportDossier,
    initiateFreeze: initiateFreezeFromHook,
    handleCredentialReset,
  } = useDepartmentActions();

  const createDepartmentMutation = useCreateDepartment();
  const createStaffMutation = useCreateStaff();
  const assignHODMutation = useAssignHOD();
  const deleteDepartmentMutation = useDeleteDepartment();
  const transferMutation = useTransferTeacher();
  const deactivateMutation = useDeactivateUser();

  const [transferModal, setTransferModal] = React.useState({ isOpen: false, deptId: null, deptName: '', availableStaff: [] });

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

  const closeTransferModal = () => {
    setTransferModal({ isOpen: false, deptId: null, deptName: '', availableStaff: [] });
  };

  const executeTransfer = async (staffId, toDeptId) => {
    const staffToTransfer = transferModal.availableStaff.find(s => s.id === staffId);
    if (!staffToTransfer) return;

    try {
      await transferMutation.mutateAsync({
        teacherId: staffId,
        fromDeptId: staffToTransfer.currentDeptId,
        toDeptId,
      });
      setAlertState({ 
        isOpen: true, 
        title: 'Transfer Complete', 
        message: `${staffToTransfer.name} transferred from ${staffToTransfer.currentDept} to ${transferModal.deptName}.`, 
        type: 'success' 
      });
      closeTransferModal();
    } catch (error) {
      setAlertState({ 
        isOpen: true, 
        title: 'Transfer Failed', 
        message: error?.response?.data?.message || 'Transfer operation failed.', 
        type: 'danger' 
      });
    }
  };

  React.useEffect(() => {
    const closeMenu = () => setOpenKebabId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const toggleKebab = (e, id) => {
    e.stopPropagation();
    setOpenKebabId(openKebabId === id ? null : id);
  };

  const handleSpawnSubmit = async () => {
    if (!spawnForm.name.trim()) {
      setAlertState({ isOpen: true, title: 'Validation Error', message: 'Department name is required.', type: 'danger' });
      return;
    }
    try {
      const created = await createDepartmentMutation.mutateAsync({
        name: spawnForm.name,
        code: spawnForm.name.substring(0, 4).toUpperCase(),
        description: spawnForm.description || `${spawnForm.name} department covering various academic disciplines.`,
        hodName: spawnForm.hodName || null,
      });
      const deptId = created?.data?.id || created?.id;
      if (spawnForm.hodName.trim() && deptId) {
        const staffParts = spawnForm.hodName.trim().split(/\s+/);
        const firstName = staffParts[0] || '';
        const lastName = staffParts.slice(1).join(' ') || '';
        await Promise.all([
          createStaffMutation.mutateAsync({
            firstName,
            lastName,
            staffId: `HOD-${Date.now()}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '.')}@maais.edu`,
            role: 'HOD',
            departmentId: deptId,
          }),
          createStaffMutation.mutateAsync({
            firstName: 'Auto',
            lastName: 'Teacher 1',
            staffId: `TCH-${Date.now()}-1`,
            email: `auto.teacher1@maais.edu`,
            role: 'TEACHER',
            departmentId: deptId,
          }),
          createStaffMutation.mutateAsync({
            firstName: 'Auto',
            lastName: 'Teacher 2',
            staffId: `TCH-${Date.now()}-2`,
            email: `auto.teacher2@maais.edu`,
            role: 'TEACHER',
            departmentId: deptId,
          }),
        ]);
      }
      setSpawnForm({ name: "", description: "", hodName: "" });
      setShowSpawnModal(false);
      setAlertState({
        isOpen: true,
        title: 'Department Spawned',
        message: `${spawnForm.name} department created successfully.${spawnForm.hodName.trim() ? ` Initial team of 3 staff profiles generated.` : ''}`,
        type: 'success',
      });
    } catch (error) {
      setAlertState({
        isOpen: true,
        title: 'Creation Failed',
        message: error?.response?.data?.message || 'Failed to create department.',
        type: 'danger',
      });
    }
  };

  const handleNodeOperation = (operation, staffId, staffName, deptId) => {
    setActiveOperation({ type: operation, staffId, staffName, deptId });
  };

  const handleRegistryTransfer = async (toDeptId) => {
    if (!activeOperation) return;
    const { staffId, staffName } = activeOperation;
    try {
      await transferMutation.mutateAsync({
        teacherId: staffId,
        fromDeptId: selectedDeptId,
        toDeptId,
      });
      setAlertState({ isOpen: true, title: 'Transfer', message: `Staff "${staffName}" transferred to the ${departments.find((d) => d.id === toDeptId)?.name} department.`, type: 'success' });
      setActiveOperation(null);
    } catch (error) {
      setAlertState({ isOpen: true, title: 'Transfer Failed', message: error?.response?.data?.message || 'Transfer failed.', type: 'danger' });
    }
  };

  const performCredentialReset = async () => {
    if (!activeOperation) return;
    const { staffId, staffName } = activeOperation;
    const result = await handleCredentialReset(staffId, staffName);
    setAlertState({ isOpen: true, title: 'Credential Reset', message: result.message, type: 'info' });
    setActiveOperation(null);
  };

  const handleRevokeAuthority = async () => {
    if (!activeOperation) return;
    const { deptId } = activeOperation;
    try {
      await assignHODMutation.mutateAsync({ deptId, staffId: null });
      setAlertState({ isOpen: true, title: 'Revoke Authority', message: 'Authority revoked successfully.', type: 'info' });
      setActiveOperation(null);
    } catch (error) {
      setAlertState({ isOpen: true, title: 'Revoke Failed', message: error?.response?.data?.message || 'Failed to revoke authority.', type: 'danger' });
    }
  };

  const handleDeepArchive = async () => {
    if (!activeOperation) return;
    const { staffId, staffName } = activeOperation;
    try {
      await deactivateMutation.mutateAsync(staffId);
      setAlertState({ isOpen: true, title: 'Deactivate Staff', message: `Staff "${staffName}" has been deactivated and removed from active records.`, type: 'warning' });
      setActiveOperation(null);
    } catch (error) {
      setAlertState({ isOpen: true, title: 'Archive Failed', message: error?.response?.data?.message || 'Archive operation failed.', type: 'danger' });
    }
  };

  const handleAuthorizeTemplateUpdate = async () => {
    if (!activeOperation) return;
    const { deptId } = activeOperation;
    const template = "20% threshold update";
    const result = await authorizeTemplate(deptId, template);
    setAlertState({ isOpen: true, title: 'Template Update Authorized', message: result.message, type: result.success ? 'success' : 'info' });
    setActiveOperation(null);
  };

  const generateFullForensicReport = async (deptId, deptName) => {
    try {
      const history = await auditTrail.getHistory('department', deptId);
      if (history && Array.isArray(history) && history.length > 0) {
        const reportData = {
          department: deptName,
          generatedAt: new Date().toISOString(),
          totalEntries: history.length,
          entries: history,
        };
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forensic-report-${deptName?.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return { success: true, message: `Forensic report for ${deptName} has been downloaded.` };
      }
      return { success: true, message: `No audit trail entries found for ${deptName}. Empty report generated.` };
    } catch (error) {
      return { success: false, message: `Failed to generate forensic report: ${error.message}` };
    }
  };

  const handleAssignHOD = (e, staffId, staffName, deptId, deptName) => {
    e.stopPropagation();
    setAssigningHOD({ staffId, staffName, deptId, deptName });
  };

  const confirmAssignment = async () => {
    if (!assigningHOD) return;
    const { staffId, deptId } = assigningHOD;

    try {
      const result = await assignHODMutation.mutateAsync({ deptId, staffId });
      setAlertState({ isOpen: true, title: 'Authority Assigned', message: result.message, type: 'success' });
      setAssigningHOD(null);
    } catch (error) {
      setAlertState({ isOpen: true, title: 'Assignment Failed', message: error?.response?.data?.message || 'Failed to assign HOD.', type: 'danger' });
    }
  };

  const handleOpenSpawnModal = () => {
    setShowSpawnModal(true);
  };

  const closeSpawnModal = () => {
    setShowSpawnModal(false);
  };

  const closeAlert = () => {
    setAlertState({ ...alertState, isOpen: false });
  };

  return (
    <>
      <DepartmentManagementView
        departments={departments}
        selectedDept={selectedDept}
        viewType={viewType}
        setViewType={setViewType}
        setSelectedDeptId={handleSelectDept}
        onSpawnClick={handleOpenSpawnModal}
        exportDossier={exportDossier}
        initiateFreeze={initiateFreezeFromHook}
        setAlert={setAlertState}
        setAssigningHOD={setAssigningHOD}
        assigningHOD={assigningHOD}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleAssignHOD={handleAssignHOD}
        handleNodeOperation={handleNodeOperation}
        openKebabId={openKebabId}
        toggleKebab={toggleKebab}
        openTransferModal={openTransferModal}
        activeOperation={activeOperation}
        setActiveOperation={setActiveOperation}
        performCredentialReset={performCredentialReset}
        handleRegistryTransfer={handleRegistryTransfer}
        handleRevokeAuthority={handleRevokeAuthority}
        handleDeepArchive={handleDeepArchive}
        handleAuthorizeTemplateUpdate={handleAuthorizeTemplateUpdate}
        showSpawnModal={showSpawnModal}
        spawnForm={spawnForm}
        setSpawnForm={setSpawnForm}
        handleSpawnSubmit={handleSpawnSubmit}
        confirmAssignment={confirmAssignment}
        generateFullForensicReport={generateFullForensicReport}
        closeSpawnModal={closeSpawnModal}
        transferModal={transferModal}
        closeTransferModal={closeTransferModal}
        executeTransfer={executeTransfer}
      />
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </>
  );
}
