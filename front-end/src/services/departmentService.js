import { adminApi } from '../lib/api/admin';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

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

  try {
    await adminApi.transferTeacher(toDeptId, staffId, fromDept.id);
  } catch (error) {
    return { success: false, message: 'Transfer operation failed on server.' };
  }

  return {
    success: true,
    message: `Teacher transferred to cluster successfully.`,
  };
}

export async function authorizeTemplate(deptId, template) {
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