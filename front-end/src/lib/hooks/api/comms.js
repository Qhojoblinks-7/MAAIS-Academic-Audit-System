import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commsApi } from '../../../lib/api';

export function useStudentNotifications(studentId, unreadOnly) {
  return useQuery({
    queryKey: ['comms', 'notifications', studentId, unreadOnly],
    queryFn: () => commsApi.getStudentNotifications(studentId, unreadOnly),
    enabled: !!studentId,
    staleTime: 1000 * 60,
  });
}

export function useAnalyticsPulse(academicYearId) {
  return useQuery({
    queryKey: ['comms', 'analytics', 'pulse', academicYearId],
    queryFn: () => commsApi.getAnalyticsPulse(academicYearId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dto, userId }) => commsApi.sendNotification(dto, userId),
    onSuccess: (_, { studentId }) => {
      if (studentId) {
        queryClient.invalidateQueries({ queryKey: ['comms', 'notifications', studentId] });
      }
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => commsApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comms', 'notifications'] });
    },
  });
}

export function useEmergencyBroadcast() {
  return useMutation({
    mutationFn: ({ dto, userId }) => commsApi.emergencyBroadcast(dto, userId),
  });
}
