import { api } from './client';

export const commsApi = {
  sendNotification: async (dto, userId) => api.post('/comms/notify', { ...dto, createdById: userId }),

  emergencyBroadcast: async (dto, userId) => api.post('/comms/emergency', { ...dto, userId }),

  getStudentNotifications: async (studentId, unreadOnly = false) =>
    api.get(`/comms/notifications/${studentId}?unreadOnly=${unreadOnly}`),

  markNotificationRead: async (id) => api.patch(`/comms/notifications/${id}/read`),

  getAnalyticsPulse: async ({ academicYearId, termId, level } = {}) => {
    const params = new URLSearchParams();
    if (academicYearId) params.set('academicYearId', academicYearId);
    if (termId) params.set('termId', termId);
    if (level) params.set('level', level);
    const qs = params.toString();
    return api.get(`/comms/analytics/pulse${qs ? `?${qs}` : ''}`);
  },
};

export default commsApi;
