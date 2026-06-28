import { adminApi } from '../lib/api/admin';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export function exportDepartmentDossier(department) {
  const dossierData = {
    id: department.id,
    name: department.name,
    description: department.description,
    hod: {
      name: department.hodName,
      id: department.hodId,
    },
    metrics: {
      teacherCount: department.teacherCount,
      validationStatus: department.validationStatus,
      programs: department.programs,
    },
    staff: department.staff || [],
    exportedAt: new Date().toISOString(),
    exportVersion: '1.0',
  };

  const blob = new Blob([JSON.stringify(dossierData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${department.name.replace(/\s+/g, '-').toLowerCase()}-dossier-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { success: true, message: `Dossier exported for ${department.name}` };
}

export async function freezeDepartment(department) {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 800));

    const freezeRecord = {
      departmentId: department.id,
      departmentName: department.name,
      frozenAt: new Date().toISOString(),
      frozenBy: 'Admin',
      status: 'frozen',
    };

    const existingFreezes = JSON.parse(localStorage.getItem('departmentFreezes') || '[]');
    const alreadyFrozen = existingFreezes.find(f => f.departmentId === department.id);

    if (alreadyFrozen) {
      return { success: false, message: `${department.name} is already frozen.` };
    }

    existingFreezes.push(freezeRecord);
    localStorage.setItem('departmentFreezes', JSON.stringify(existingFreezes));

    return {
      success: true,
      message: `${department.name} cluster frozen. Assessment operations suspended.`,
      freezeRecord,
    };
  }

  try {
    const response = await adminApi.freezeDepartment(department.id);
    return {
      success: true,
      message: `${department.name} cluster frozen. Assessment operations suspended.`,
      freezeRecord: response,
    };
  } catch (error) {
    return { success: false, message: 'Freeze operation failed.' };
  }
}

export async function transferTeacher(departments, setDepartments, staffId, toDeptId) {
  const fromDept = departments.find(d => d.staff?.some(s => s.id === staffId));
  const toDept = departments.find(d => d.id === toDeptId);

  if (!fromDept || !toDept || fromDept.id === toDept.id) {
    return { success: false, message: 'Invalid transfer operation.' };
  }

  const staffMember = fromDept.staff.find(s => s.id === staffId);
  if (!staffMember) {
    return { success: false, message: 'Staff member not found.' };
  }

  setDepartments(prev =>
    prev.map(dept => {
      if (dept.id === fromDept.id) {
        return {
          ...dept,
          staff: dept.staff.filter(s => s.id !== staffId),
          teacherCount: dept.teacherCount - 1,
        };
      }
      if (dept.id === toDept.id) {
        return {
          ...dept,
          staff: [...dept.staff, { ...staffMember, isHOD: false }],
          teacherCount: dept.teacherCount + 1,
        };
      }
      return dept;
    }),
  );

  if (!USE_MOCK) {
    try {
      await adminApi.transferTeacher(toDeptId, staffId, fromDept.id);
    } catch (error) {
      return { success: false, message: 'Transfer operation failed on server.' };
    }
  }

  return {
    success: true,
    message: `Teacher transferred to cluster successfully.`,
  };
}

export async function authorizeTemplate(deptId, template) {
  if (USE_MOCK) {
    const updateRecord = {
      id: `TPL-${Date.now()}`,
      deptId,
      template,
      authorizedAt: new Date().toISOString(),
      status: 'authorized',
    };

    const existingUpdates = JSON.parse(localStorage.getItem('templateUpdates') || '[]');
    existingUpdates.push(updateRecord);
    localStorage.setItem('templateUpdates', JSON.stringify(existingUpdates));
    return { success: true, message: 'Template update authorized.', updateRecord };
  }

  try {
    const response = await adminApi.authorizeTemplate(deptId, template);
    return { success: true, message: 'Template update authorized.', updateRecord: response };
  } catch (error) {
    return { success: false, message: 'Template authorization failed.' };
  }
}

export async function uploadStrategyPulseFile(files, deptId = null) {
  if (!files || files.length === 0) {
    return { success: false, message: 'No files selected.' };
  }

  const pulseRecord = {
    id: `PULSE-${Date.now()}`,
    uploadedAt: new Date().toISOString(),
    files: Array.from(files).map(f => ({
      name: f.name,
      size: f.size,
      type: f.type,
    })),
    status: 'uploaded',
  };

  if (USE_MOCK) {
    const existingPulses = JSON.parse(localStorage.getItem('strategyPulses') || '[]');
    existingPulses.push(pulseRecord);
    localStorage.setItem('strategyPulses', JSON.stringify(existingPulses));
    return {
      success: true,
      message: `${files.length} strategy pulse file(s) uploaded successfully.`,
      pulseRecord,
    };
  }

  try {
    const response = await adminApi.uploadStrategyPulse(deptId);
    return {
      success: true,
      message: `${files.length} strategy pulse file(s) uploaded successfully.`,
      pulseRecord: response,
    };
  } catch (error) {
    return { success: false, message: 'Strategy pulse upload failed.' };
  }
}

export async function resetTeacherCredentials(staffId, staffName) {
  const resetRecord = {
    id: `CRED-${Date.now()}`,
    staffId,
    staffName,
    resetAt: new Date().toISOString(),
    resetBy: 'Admin',
    temporaryKey: `TMP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
    status: 'completed',
  };

  if (USE_MOCK) {
    const existingResets = JSON.parse(localStorage.getItem('credentialResets') || '[]');
    existingResets.push(resetRecord);
    localStorage.setItem('credentialResets', JSON.stringify(existingResets));

    return {
      success: true,
      message: `Credential reset initiated for "${staffName}". Temporary access key generated.`,
      resetRecord,
    };
  }

  try {
    const response = await adminApi.resetStaffCredentials(staffId);
    return {
      success: true,
      message: `Credential reset initiated for "${staffName}". Temporary access key generated.`,
      resetRecord: response,
    };
  } catch (error) {
    return { success: false, message: 'Credential reset failed.' };
  }
}

function createRealService() {
  return {
    exportDepartmentDossier,
    freezeDepartment,
    transferTeacher,
    authorizeTemplate,
    uploadStrategyPulseFile,
    resetTeacherCredentials,
  };
}

export const departmentService =  createRealService();