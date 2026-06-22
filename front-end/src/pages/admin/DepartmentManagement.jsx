import React from "react";
import {
  buildInitialDepartments,
} from "./hooks/useDepartments";
import { useDepartmentActions } from "./hooks/useDepartmentActions";
import DepartmentManagementView from "./components/DepartmentManagementView";
import { AlertModal } from "./components/AlertModal";
import { authorizeTemplate } from "../../services/departmentService";
import { auditTrail } from "../../services/auditTrailService";
import { useAllDepartments } from "../../lib/hooks";

const DEPARTMENT_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-purple-500",
  "bg-amber-500",
];

export function DepartmentManagement() {
  const departmentsQuery = useAllDepartments();
  const apiDepartments = departmentsQuery.data || [];

  const [departments, setDepartments] = React.useState(() => {
    if (apiDepartments.length > 0) {
      return apiDepartments.map((d, idx) => ({
        id: d.id || `dept-${idx}`,
        name: d.name || 'Unknown',
        code: d.code || '',
        head: d.head || null,
        teacherCount: d.teacherCount || 0,
        staff: d.staff || [],
        color: DEPARTMENT_COLORS[idx % DEPARTMENT_COLORS.length],
      }));
    }
    return buildInitialDepartments();
  });
  const [selectedDeptId, setSelectedDeptId] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState("staff");
  const [viewType, setViewType] = React.useState("grid");
  const [assigningHOD, setAssigningHOD] = React.useState(null);
  const [showSpawnModal, setShowSpawnModal] = React.useState(false);
  const [spawnForm, setSpawnForm] = React.useState({
    name: "",
    description: "",
  });
  const [openKebabId, setOpenKebabId] = React.useState(null);
  const [activeOperation, setActiveOperation] = React.useState(null);
  const [alertState, setAlertState] = React.useState({ isOpen: false, title: '', message: '', type: 'info' });

  const {
    exportDossier,
    initiateFreeze,
    openTransferModal: openTransferModalFromHook,
    handleCredentialReset,
  } = useDepartmentActions();

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

  const executeTransfer = (staffId, toDeptId) => {
    const staffToTransfer = transferModal.availableStaff.find(s => s.id === staffId);
    if (!staffToTransfer) return;

    setDepartments((prev) => {
      const fromDept = prev.find((d) => d.id === staffToTransfer.currentDeptId);
      const toDept = prev.find((d) => d.id === toDeptId);
      if (!fromDept || !toDept) return prev;

      return prev.map((dept) => {
        if (dept.id === fromDept.id) {
          return {
            ...dept,
            staff: dept.staff.filter((s) => s.id !== staffId),
            teacherCount: dept.teacherCount - 1,
          };
        }
        if (dept.id === toDept.id) {
          return {
            ...dept,
            staff: [...dept.staff, { ...staffToTransfer, isHOD: false }],
            teacherCount: dept.teacherCount + 1,
          };
        }
        return dept;
      });
    });

    setAlertState({ 
      isOpen: true, 
      title: 'Transfer Complete', 
      message: `${staffToTransfer.name} transferred from ${staffToTransfer.currentDept} to ${transferModal.deptName}.`, 
      type: 'success' 
    });
    closeTransferModal();
  };

  React.useEffect(() => {
    const closeMenu = () => setOpenKebabId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const selectedDept = departments.find((d) => d.id === selectedDeptId);

  const toggleKebab = (e, id) => {
    e.stopPropagation();
    setOpenKebabId(openKebabId === id ? null : id);
  };

  const handleSpawnSubmit = () => {
    if (!spawnForm.name.trim()) {
      setAlertState({ isOpen: true, title: 'Validation Error', message: 'Department name is required.', type: 'danger' });
      return;
    }
    const nextId = String(departments.length + 1);
    const newColorIndex = departments.length % DEPARTMENT_COLORS.length;
    const newDepartment = {
      id: nextId,
      name: spawnForm.name,
      description:
        spawnForm.description ||
        `${spawnForm.name} department covering various academic disciplines.`,
      hodName: "Unassigned",
      hodId: null,
      teacherCount: 0,
      validationStatus: 0,
      color: DEPARTMENT_COLORS[newColorIndex],
      iconColor: DEPARTMENT_COLORS[newColorIndex].replace("bg-", "text-"),
      programs: [`${spawnForm.name} Program`],
      staff: [],
    };
    setDepartments([...departments, newDepartment]);
    setSpawnForm({ name: "", description: "" });
    setShowSpawnModal(false);
  };

  const handleNodeOperation = (operation, staffId, staffName, deptId) => {
    setActiveOperation({ type: operation, staffId, staffName, deptId });
  };

  const handleRegistryTransfer = (toDeptId) => {
    if (!activeOperation) return;
    const { staffId, staffName } = activeOperation;
    setDepartments((prev) => {
      const fromDept = prev.find((d) => d.staff?.some((s) => s.id === staffId));
      const toDept = prev.find((d) => d.id === toDeptId);
      if (!fromDept || !toDept || fromDept.id === toDept.id) return prev;
      const staffMember = fromDept.staff.find((s) => s.id === staffId);
      if (!staffMember) return prev;
      return prev.map((dept) => {
        if (dept.id === fromDept.id) {
          return {
            ...dept,
            staff: dept.staff.filter((s) => s.id !== staffId),
            teacherCount: dept.teacherCount - 1,
          };
        }
        if (dept.id === toDept.id) {
          const updatedStaff = dept.staff.map((s) => ({ ...s, isHOD: false }));
          return {
            ...dept,
            staff: [...updatedStaff, { ...staffMember, isHOD: false }],
            teacherCount: dept.teacherCount + 1,
          };
        }
        return dept;
      });
    });
    setAlertState({ isOpen: true, title: 'Registry Transfer', message: `Staff "${staffName}" transferred to ${departments.find((d) => d.id === toDeptId)?.name} cluster.`, type: 'success' });
    setActiveOperation(null);
  };

  const performCredentialReset = async () => {
    if (!activeOperation) return;
    const { staffId, staffName } = activeOperation;
    const result = await handleCredentialReset(staffId, staffName);
    setAlertState({ isOpen: true, title: 'Credential Reset', message: result.message, type: 'info' });
    setActiveOperation(null);
  };

  const handleRevokeAuthority = () => {
    if (!activeOperation) return;
    const { staffId, staffName } = activeOperation;
    setDepartments((prev) =>
      prev.map((dept) => {
        const isHOD = dept.staff?.some((s) => s.id === staffId && s.isHOD);
        if (!isHOD) return dept;
        const hod = dept.staff.find((s) => s.id === staffId);
        return {
          ...dept,
          staff: dept.staff.map((s) => ({ ...s, isHOD: false })),
          hodName: dept.hodName === hod?.name ? "Unassigned" : dept.hodName,
          hodId: dept.hodId === staffId ? null : dept.hodId,
        };
      }),
    );
    setAlertState({ isOpen: true, title: 'Revoke Authority', message: `Authority revoked for "${staffName}".`, type: 'info' });
    setActiveOperation(null);
  };

  const handleDeepArchive = () => {
    if (!activeOperation) return;
    const { staffId, staffName } = activeOperation;
    setDepartments((prev) =>
      prev.map((dept) => {
        const staffMember = dept.staff?.find((s) => s.id === staffId);
        if (!staffMember) return dept;
        const isHOD = staffMember.isHOD;
        return {
          ...dept,
          staff: dept.staff.filter((s) => s.id !== staffId),
          teacherCount: dept.teacherCount - 1,
          hodName: isHOD ? "Unassigned" : dept.hodName,
          hodId: isHOD ? null : dept.hodId,
        };
      }),
    );
    setAlertState({ isOpen: true, title: 'Deep Archive', message: `Staff "${staffName}" archived. Account deactivated.`, type: 'warning' });
    setActiveOperation(null);
  };

  const handleAuthorizeTemplateUpdate = async () => {
    if (!activeOperation) return;
    const { deptId, staffName } = activeOperation;
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

  const confirmAssignment = () => {
    if (!assigningHOD) return;
    const { staffId, deptId, staffName, deptName } = assigningHOD;

    setDepartments((prev) =>
      prev.map((dept) => {
        if (dept.id !== deptId) return dept;
        const updatedStaff = dept.staff.map((member) => ({
          ...member,
          isHOD: member.id === staffId,
        }));
        const newHOD = updatedStaff.find((m) => m.id === staffId);
        return {
          ...dept,
          staff: updatedStaff,
          hodName: newHOD?.name || dept.hodName,
          hodId: staffId,
        };
      }),
    );

    setAlertState({ isOpen: true, title: 'Authority Assigned', message: `Institutional Authority Dispatched: ${staffName} is now certified HOD for ${deptName}.`, type: 'success' });
    setAssigningHOD(null);
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
        setSelectedDeptId={setSelectedDeptId}
        onSpawnClick={handleOpenSpawnModal}
        exportDossier={exportDossier}
        initiateFreeze={initiateFreeze}
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