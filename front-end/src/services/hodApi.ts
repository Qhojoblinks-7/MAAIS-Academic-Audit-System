import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuthToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function getHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// API functions using fetch directly
const hodApi = {
  // Get HOD context (teaching vs oversight mode)
  getContext: async () => {
    const res = await fetch(`${BASE_URL}/users/me/context`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to get context: ${res.status}`);
    return res.json();
  },

  // Teaching view - get my teaching assignments
  getMyTeachingAssignments: async () => {
    const res = await fetch(`${BASE_URL}/hod/me/teaching`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to get teaching assignments: ${res.status}`);
    return res.json();
  },

  // Oversight view - get department progress
  getDepartmentProgress: async (params?: { page?: number; limit?: number }) => {
    const qs = params ? `?${new URLSearchParams(params)}` : '';
    const res = await fetch(`${BASE_URL}/hod/department-progress${qs}`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to get department progress: ${res.status}`);
    return res.json();
  },

  // Oversight view - grade revisions
  getGradeRevisions: async () => {
    const res = await fetch(`${BASE_URL}/hod/grade-revisions`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to get grade revisions: ${res.status}`);
    return res.json();
  },

  // Oversight view - audit logs
  getAuditLogs: async (params?: any) => {
    const qs = params ? `?${new URLSearchParams(params)}` : '';
    const res = await fetch(`${BASE_URL}/hod/audit-logs${qs}`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to get audit logs: ${res.status}`);
    return res.json();
  },

  // Oversight view - intervention alerts
  getInterventionAlerts: async (params?: any) => {
    const qs = params ? `?${new URLSearchParams(params)}` : '';
    const res = await fetch(`${BASE_URL}/hod/intervention-alerts${qs}`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to get intervention alerts: ${res.status}`);
    return res.json();
  },

  // Oversight action - approve grade
  approveGradeRevision: async (recordId: string, comment?: string) => {
    const res = await fetch(`${BASE_URL}/hod/records/${recordId}/approve`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ comment }),
    });
    if (!res.ok) throw new Error(`Failed to approve revision: ${res.status}`);
    return res.json();
  },

  // Oversight action - reject grade
  rejectGradeRevision: async (recordId: string, reason?: string) => {
    const res = await fetch(`${BASE_URL}/hod/records/${recordId}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error(`Failed to reject revision: ${res.status}`);
    return res.json();
  },

  // Oversight action - update HOD comment
  updateHODComment: async (recordId: string, comment: string) => {
    const res = await fetch(`${BASE_URL}/hod/records/${recordId}/comment`, {
      method: 'PATCH',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ comment }),
    });
    if (!res.ok) throw new Error(`Failed to update comment: ${res.status}`);
    return res.json();
  },

  // Oversight action - lock term
  lockTerm: async (termId: string) => {
    const res = await fetch(`${BASE_URL}/hod/lock-matrix/${termId}`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to lock term: ${res.status}`);
    return res.json();
  },

  // Oversight action - unlock term
  unlockTerm: async (termId: string) => {
    const res = await fetch(`${BASE_URL}/hod/unlock-matrix/${termId}`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to unlock term: ${res.status}`);
    return res.json();
  },

  // Oversight - department teachers
  getDepartmentTeachers: async (params?: any) => {
    const qs = params ? `?${new URLSearchParams(params)}` : '';
    const res = await fetch(`${BASE_URL}/hod/teachers${qs}`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to get teachers: ${res.status}`);
    return res.json();
  },

  // Oversight - impersonation
  impersonateTeacher: async (teacherId: string, body?: any) => {
    const res = await fetch(`${BASE_URL}/hod/impersonate/${teacherId}`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(body || {}),
    });
    if (!res.ok) throw new Error(`Failed to impersonate: ${res.status}`);
    return res.json();
  },

  stopImpersonation: async () => {
    const res = await fetch(`${BASE_URL}/hod/impersonate/stop`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to stop impersonation: ${res.status}`);
    return res.json();
  },

  // Additional endpoints for completeness
  getLockedTerms: async () => {
    const res = await fetch(`${BASE_URL}/hod/locked-terms`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to get locked terms: ${res.status}`);
    return res.json();
  },

  getTeacherSubmissionStatus: async () => {
    const res = await fetch(`${BASE_URL}/hod/teachers/submissions`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to get submission status: ${res.status}`);
    return res.json();
  },

  getHODSettings: async () => {
    const res = await fetch(`${BASE_URL}/hod/settings`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to get HOD settings: ${res.status}`);
    return res.json();
  },

  updateHODSettings: async (settings: any) => {
    const res = await fetch(`${BASE_URL}/hod/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error(`Failed to update settings: ${res.status}`);
    return res.json();
  },

  getArchivedDepartmentData: async (params?: any) => {
    const qs = params ? `?${new URLSearchParams(params)}` : '';
    const res = await fetch(`${BASE_URL}/hod/archive${qs}`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to get archived data: ${res.status}`);
    return res.json();
  },

  getPromotionRecommendations: async (params?: any) => {
    const qs = params ? `?${new URLSearchParams(params)}` : '';
    const res = await fetch(`${BASE_URL}/hod/archive/promotions${qs}`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to get promotions: ${res.status}`);
    return res.json();
  },

  getGradeComparison: async (subjectId: string, termA: string, termB: string) => {
    const qs = `?subjectId=${subjectId}&termA=${termA}&termB=${termB}`;
    const res = await fetch(`${BASE_URL}/hod/grades/compare${qs}`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to compare grades: ${res.status}`);
    return res.json();
  },

  validateLock: async (termId: string) => {
    const res = await fetch(`${BASE_URL}/hod/lock-matrix/${termId}/validate`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`Failed to validate lock: ${res.status}`);
    return res.json();
  },

  exportWAECCSV: async (termId: string, className: string) => {
    const res = await fetch(`${BASE_URL}/hod/export-waec/${termId}?class=${encodeURIComponent(className)}&format=csv`, {
      headers: getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('csv') || contentType?.includes('text/')) {
        return res.text();
      }
      const data = await res.json();
      if (data?.csv) return data.csv;
      throw new Error(`Export failed: ${res.status}`);
    }
    return res.text();
  },

  resetTeacherPassword: async (teacherId: string, newPassword: string) => {
    const res = await fetch(`${BASE_URL}/hod/teachers/${teacherId}/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ newPassword }),
    });
    if (!res.ok) throw new Error(`Failed to reset password: ${res.status}`);
    return res.json();
  },
};

export { hodApi };

// Query keys
export const hodKeys = {
  all: ['hod'] as const,
  context: () => [...hodKeys.all, 'context'] as const,
  teaching: () => [...hodKeys.all, 'teaching'] as const,
  departmentProgress: (page = 1, limit = 50) => [...hodKeys.all, 'department-progress', page, limit] as const,
  revisions: () => [...hodKeys.all, 'revisions'] as const,
  auditLogs: (params?: any) => [...hodKeys.all, 'audit-logs', params] as const,
  interventionAlerts: (params?: any) => [...hodKeys.all, 'intervention-alerts', params] as const,
  teachers: (params?: any) => [...hodKeys.all, 'teachers', params] as const,
};

// Hooks
export const useHODContext = () => {
  return useQuery({
    queryKey: hodKeys.context(),
    queryFn: hodApi.getContext,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useMyTeachingAssignments = () => {
  return useQuery({
    queryKey: hodKeys.teaching(),
    queryFn: hodApi.getMyTeachingAssignments,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useDepartmentProgress = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: hodKeys.departmentProgress(page, limit),
    queryFn: () => hodApi.getDepartmentProgress({ page, limit }),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useGradeRevisions = () => {
  return useQuery({
    queryKey: hodKeys.revisions(),
    queryFn: hodApi.getGradeRevisions,
    staleTime: 60 * 1000,
  });
};

export const useAuditLogs = (params?: any) => {
  return useQuery({
    queryKey: hodKeys.auditLogs(params),
    queryFn: () => hodApi.getAuditLogs(params),
    staleTime: 60 * 1000,
  });
};

export const useInterventionAlerts = (params?: any) => {
  return useQuery({
    queryKey: hodKeys.interventionAlerts(params),
    queryFn: () => hodApi.getInterventionAlerts(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useDepartmentTeachers = (params?: any) => {
  return useQuery({
    queryKey: hodKeys.teachers(params),
    queryFn: () => hodApi.getDepartmentTeachers(params),
    staleTime: 5 * 60 * 1000,
  });
};

// Mutation hooks
export const useApproveRevision = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, comment }: { recordId: string; comment: string }) =>
      hodApi.approveGradeRevision(recordId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hodKeys.revisions() });
      queryClient.invalidateQueries({ queryKey: hodKeys.departmentProgress() });
    },
  });
};

export const useRejectRevision = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, reason }: { recordId: string; reason: string }) =>
      hodApi.rejectGradeRevision(recordId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hodKeys.revisions() });
      queryClient.invalidateQueries({ queryKey: hodKeys.departmentProgress() });
    },
  });
};

export const useUpdateHODComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, comment }: { recordId: string; comment: string }) =>
      hodApi.updateHODComment(recordId, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hodKeys.auditLogs() });
    },
  });
};

export const useLockTerm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (termId: string) => hodApi.lockTerm(termId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hodKeys.departmentProgress() });
    },
  });
};

export const useUnlockTerm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (termId: string) => hodApi.unlockTerm(termId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hodKeys.departmentProgress() });
    },
  });
};