import { create } from 'zustand';

export const useStudentStore = create((set, get) => ({
  // Portal / profile
  portalData: null,
  portalLoading: false,
  portalError: null,

  setPortalData: (data) => set({ portalData: data, portalError: null }),
  setPortalLoading: (loading) => set({ portalLoading: loading }),
  setPortalError: (error) => {
    if (error) {
      set({ portalError: error, portalData: null });
    } else {
      set({ portalError: null });
    }
  },

  // Grades
  grades: [],
  gradesLoading: false,
  gradesError: null,

  setGrades: (grades) => set({ grades, gradesError: null }),
  setGradesLoading: (loading) => set({ gradesLoading: loading }),
  setGradesError: (error) => set({ gradesError: error }),

  // Notifications
  notifications: [],
  unreadCount: 0,
  notificationsLoading: false,
  notificationsError: null,

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    set({ notifications, unreadCount, notificationsError: null });
  },
  setNotificationsLoading: (loading) => set({ notificationsLoading: loading }),
  setNotificationsError: (error) => set({ notificationsError: error }),

  // Support tickets
  tickets: [],
  ticketsLoading: false,
  ticketsError: null,

  setTickets: (tickets) => set({ tickets, ticketsError: null }),
  setTicketsLoading: (loading) => set({ ticketsLoading: loading }),
  setTicketsError: (error) => set({ ticketsError: error }),

  // Behavior
  behavior: { logs: [], traits: null },
  behaviorLoading: false,
  behaviorError: null,

  setBehavior: (behavior) => set({ behavior, behaviorError: null }),
  setBehaviorLoading: (loading) => set({ behaviorLoading: loading }),
  setBehaviorError: (error) => set({ behaviorError: error }),

  // Interventions
  interventions: [],
  interventionsLoading: false,
  interventionsError: null,

  setInterventions: (interventions) => set({ interventions, interventionsError: null }),
  setInterventionsLoading: (loading) => set({ interventionsLoading: loading }),
  setInterventionsError: (error) => set({ interventionsError: error }),

  // Timetable
  timetable: [],
  timetableLoading: false,
  timetableError: null,

  setTimetable: (timetable) => set({ timetable, timetableError: null }),
  setTimetableLoading: (loading) => set({ timetableLoading: loading }),
  setTimetableError: (error) => set({ timetableError: error }),

  // Support form state
  supportTitle: '',
  supportMessage: '',
  supportCategory: 'General',
  supportPriority: 'MEDIUM',
  submittingTicket: false,

  setSupportTitle: (title) => set({ supportTitle: title }),
  setSupportMessage: (message) => set({ supportMessage: message }),
  setSupportCategory: (category) => set({ supportCategory: category }),
  setSupportPriority: (priority) => set({ supportPriority: priority }),
  setSubmittingTicket: (submitting) => set({ submittingTicket: submitting }),
  resetSupportForm: () => set({
    supportTitle: '',
    supportMessage: '',
    supportCategory: 'General',
    supportPriority: 'MEDIUM',
  }),
}));
