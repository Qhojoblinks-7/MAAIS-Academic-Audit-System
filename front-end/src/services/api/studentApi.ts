const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function getHeaders() {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: getHeaders(),
    credentials: 'include',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = new Error(`Request failed: ${res.status} ${method} ${path}`);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return undefined;
  return res.json();
}

export const studentApi = {
  getPortalData: (studentId) =>
    request('GET', `/portal/students/${studentId}/portal-data`),

  getStudentGrades: (studentId, termId) =>
    request('GET', `/grading/students/${studentId}/terms/${termId}`),

  createTicket: (data) =>
    request('POST', `/comms/tickets`, data),

  getMyTickets: () =>
    request('GET', `/comms/tickets/my`),

  getNotifications: (studentId) =>
    request('GET', `/comms/notifications/${studentId}`),

  markNotificationRead: (notificationId) =>
    request('PATCH', `/comms/notifications/${notificationId}/read`),

  getBehavior: (studentId) =>
    request('GET', `/students/${studentId}/behavior`),

  getInterventions: (studentId) =>
    request('GET', `/students/${studentId}/interventions`),

  getClassTimetable: (classId) =>
    request('GET', `/timetable/class/${classId}`),
};

export default studentApi;
