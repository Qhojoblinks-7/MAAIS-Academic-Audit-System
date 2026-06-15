import { api } from './client';

export const commsApi = {
  sendNotification: async (dto, userId) => api.post('/comms/notify', { ...dto, createdById: userId }),

  emergencyBroadcast: async (dto, userId) => api.post('/comms/emergency', { ...dto, userId }),

  getStudentNotifications: async (studentId, unreadOnly = false) =>
    api.get(`/comms/notifications/${studentId}?unreadOnly=${unreadOnly}`),

  markNotificationRead: async (id) => api.patch(`/comms/notifications/${id}/read`),

  getAnalyticsPulse: async (academicYearId) =>
    api.get(`/comms/analytics/pulse?academicYearId=${academicYearId || ''}`),
};

export default commsApi;
