import { useState, useEffect, useCallback, useRef } from 'react';
import { useStudentStore } from '../../stores/useStudentStore';
import { studentApi } from '../../services/api/studentApi';

export function useStudentPortalData(studentId) {
   const { portalData, portalError, setPortalData, setPortalError } = useStudentStore();
   const hasFetchedRef = useRef(false);

   const [loading, setLoading] = useState(!!studentId);

   const fetchPortalData = useCallback(async (profileId) => {
     const idToFetch = profileId || studentId;
     if (!idToFetch) {
       setPortalError('No student identifier available');
       setPortalData(null);
       setLoading(false);
       return;
     }
     try {
       const data = await studentApi.getPortalData(idToFetch);
       if (!data) {
         setPortalError('No profile context matches found');
         setPortalData(null);
       } else {
         setPortalData(data);
       }
     } catch (error) {
       setPortalError(error.message || 'Failed to load portal data');
       setPortalData(null);
     } finally {
       setLoading(false);
     }
   }, [studentId, setPortalData, setPortalError]);

   useEffect(() => {
     hasFetchedRef.current = false;
   }, [studentId]);

   useEffect(() => {
     if (!studentId) {
       setPortalError('No student identifier available');
       setPortalData(null);
       setLoading(false);
       return;
     }
     if (hasFetchedRef.current) return;
     hasFetchedRef.current = true;
     setLoading(true);
     setPortalError(null);
     fetchPortalData();
   }, [studentId, fetchPortalData, setPortalData, setPortalError]);

   return {
     data: portalData,
     loading,
     error: portalError,
     refetch: fetchPortalData,
   };
 }

export function useStudentGrades(studentId, termId) {
  const { grades, gradesLoading, gradesError, setGrades, setGradesLoading, setGradesError } = useStudentStore();
  const hasFetched = useRef(false);

  const fetchGrades = useCallback(async () => {
    if (!studentId || !termId) return;
    hasFetched.current = true;
    setGradesLoading(true);
    setGradesError(null);
    try {
      const data = await studentApi.getStudentGrades(studentId, termId);
      setGrades(Array.isArray(data) ? data : []);
    } catch (error) {
      setGradesError(error.message || 'Failed to load grades');
    } finally {
      setGradesLoading(false);
    }
  }, [studentId, termId, setGrades, setGradesLoading, setGradesError]);

  useEffect(() => {
    if (studentId && termId) {
      hasFetched.current = false;
    }
  }, [studentId, termId]);

  useEffect(() => {
    if (studentId && termId && !hasFetched.current) {
      hasFetched.current = true;
      setGradesLoading(true);
      setGradesError(null);
      fetchGrades();
    }
  }, [studentId, termId, fetchGrades, setGradesLoading, setGradesError]);

  return {
    grades,
    loading: gradesLoading,
    error: gradesError,
    refetch: fetchGrades,
  };
}

export function useStudentNotifications(studentId) {
  const { notifications, unreadCount, notificationsLoading, notificationsError, setNotifications, setNotificationsLoading, setNotificationsError } = useStudentStore();
  const hasFetched = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!studentId) return;
    hasFetched.current = true;
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const data = await studentApi.getNotifications(studentId);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotificationsError(error.message || 'Failed to load notifications');
    } finally {
      setNotificationsLoading(false);
    }
  }, [studentId, setNotifications, setNotificationsLoading, setNotificationsError]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      setNotificationsLoading(true);
      setNotificationsError(null);
      fetchNotifications();
    }
  }, [fetchNotifications, setNotificationsLoading, setNotificationsError]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await studentApi.markNotificationRead(notificationId);
      setNotifications(prev => prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [setNotifications]);

  return {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    error: notificationsError,
    markAsRead,
    refetch: fetchNotifications,
  };
}

export function useStudentTickets() {
  const { tickets, ticketsLoading, ticketsError, setTickets, setTicketsLoading, setTicketsError } = useStudentStore();
  const hasFetched = useRef(false);

  const fetchTickets = useCallback(async () => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    setTicketsLoading(true);
    setTicketsError(null);
    try {
      const data = await studentApi.getMyTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      setTicketsError(error.message || 'Failed to load tickets');
    } finally {
      setTicketsLoading(false);
    }
  }, [setTickets, setTicketsLoading, setTicketsError]);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      setTicketsLoading(true);
      setTicketsError(null);
      fetchTickets();
    }
  }, [fetchTickets, setTicketsLoading, setTicketsError]);

  return {
    tickets,
    loading: ticketsLoading,
    error: ticketsError,
    refetch: fetchTickets,
  };
}

export function useStudentBehavior(studentId) {
   const { behavior, behaviorLoading, behaviorError, setBehavior, setBehaviorLoading, setBehaviorError } = useStudentStore();
   const hasFetched = useRef(false);

   const fetchBehavior = useCallback(async () => {
     if (!studentId) return;
     hasFetched.current = true;
     setBehaviorLoading(true);
     setBehaviorError(null);
     try {
       const data = await studentApi.getBehavior(studentId);
       setBehavior(Array.isArray(data?.logs) ? { logs: data.logs, traits: data.traits } : { logs: [], traits: null });
     } catch (error) {
       setBehaviorError(error.message || 'Failed to load behavior records');
     } finally {
       setBehaviorLoading(false);
     }
   }, [studentId, setBehavior, setBehaviorLoading, setBehaviorError]);

   useEffect(() => {
     if (studentId) {
       hasFetched.current = false;
     }
   }, [studentId]);

   useEffect(() => {
     if (studentId && !hasFetched.current) {
       hasFetched.current = true;
       setBehaviorLoading(true);
       setBehaviorError(null);
       fetchBehavior();
     }
   }, [studentId, fetchBehavior, setBehaviorLoading, setBehaviorError]);

   return {
     behavior,
     loading: behaviorLoading,
     error: behaviorError,
     refetch: () => fetchBehavior(),
   };
 }

export function useStudentInterventions(studentId) {
  const { interventions, interventionsLoading, interventionsError, setInterventions, setInterventionsLoading, setInterventionsError } = useStudentStore();
  const hasFetched = useRef(false);

  const fetchInterventions = useCallback(async () => {
    if (!studentId) return;
    hasFetched.current = true;
    setInterventionsLoading(true);
    setInterventionsError(null);
    try {
      const data = await studentApi.getInterventions(studentId);
      setInterventions(Array.isArray(data) ? data : []);
    } catch (error) {
      setInterventionsError(error.message || 'Failed to load interventions');
    } finally {
      setInterventionsLoading(false);
    }
  }, [studentId, setInterventions, setInterventionsLoading, setInterventionsError]);

  useEffect(() => {
    if (studentId) {
      hasFetched.current = false;
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId && !hasFetched.current) {
      hasFetched.current = true;
      setInterventionsLoading(true);
      setInterventionsError(null);
      fetchInterventions();
    }
  }, [studentId, fetchInterventions, setInterventionsLoading, setInterventionsError]);

  return {
    interventions,
    loading: interventionsLoading,
    error: interventionsError,
    refetch: fetchInterventions,
  };
}

export function useStudentTimetable(classId) {
  const { timetable, timetableLoading, timetableError, setTimetable, setTimetableLoading, setTimetableError } = useStudentStore();
  const hasFetched = useRef(false);

  const fetchTimetable = useCallback(async () => {
    if (!classId) return;
    hasFetched.current = true;
    setTimetableLoading(true);
    setTimetableError(null);
    try {
      const data = await studentApi.getClassTimetable(classId);
      setTimetable(Array.isArray(data) ? data : []);
    } catch (error) {
      setTimetableError(error.message || 'Failed to load timetable');
    } finally {
      setTimetableLoading(false);
    }
  }, [classId, setTimetable, setTimetableLoading, setTimetableError]);

  useEffect(() => {
    if (classId) {
      hasFetched.current = false;
    }
  }, [classId]);

  useEffect(() => {
    if (classId && !hasFetched.current) {
      hasFetched.current = true;
      setTimetableLoading(true);
      setTimetableError(null);
      fetchTimetable();
    }
  }, [classId, fetchTimetable, setTimetableLoading, setTimetableError]);

  return {
    timetable,
    loading: timetableLoading,
    error: timetableError,
    refetch: fetchTimetable,
  };
}