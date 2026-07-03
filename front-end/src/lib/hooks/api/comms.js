import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commsApi } from '../../../lib/api';

// ── Queries ──────────────────────────────────────────────────────────────────
export function useStudentNotifications(studentId, unreadOnly) {
  return useQuery({
    queryKey: ['comms', 'notifications', studentId, unreadOnly],
    queryFn: () => commsApi.getStudentNotifications(studentId, unreadOnly),
    enabled: !!studentId,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useAnalyticsPulse(academicYearId) {
  return useQuery({
    queryKey: ['comms', 'analytics', 'pulse', academicYearId],
    queryFn: () => commsApi.getAnalyticsPulse(academicYearId),
    staleTime: 1000 * 60 * 5,
  });
}

// ── Mutations ────────────────────────────────────────────────────────────────
export function useSendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dto, userId }) => commsApi.sendNotification(dto, userId),
    // FIX: Destructure userId from the actual variables passed to mutationFn
    onSuccess: (_, { userId }) => {
      if (userId) {
        // Correctly matches the prefix key hierarchy for that user
        queryClient.invalidateQueries({ queryKey: ['comms', 'notifications', userId] });
      }
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    // FIX: Pass studentId context down along with the notification id
    mutationFn: ({ notificationId }) => commsApi.markNotificationRead(notificationId),
    onSuccess: (_, { studentId }) => {
      if (studentId) {
        // FIX: Scopes invalidation strictly to the active user's stream
        queryClient.invalidateQueries({ queryKey: ['comms', 'notifications', studentId] });
      } else {
        // Fallback catch-all if mutation is invoked globally without context
        queryClient.invalidateQueries({ queryKey: ['comms', 'notifications'] });
      }
    },
  });
}

export function useEmergencyBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dto, userId }) => commsApi.emergencyBroadcast(dto, userId),
    onSuccess: () => {
      // An emergency broadcast alters the system state globally. 
      // Wipe the whole comms tree to force global UI banners to synchronize.
      queryClient.invalidateQueries({ queryKey: ['comms'] });
    }
  });
}