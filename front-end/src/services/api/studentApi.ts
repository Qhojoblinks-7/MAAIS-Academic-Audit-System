const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

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
    let errorMessage = `Request failed: ${res.status} ${method} ${path}`;
    try {
      const errorText = await res.text();
      if (errorText.includes('<!doctype') || errorText.includes('<html')) {
        errorMessage = `API endpoint not found (${res.status})`;
      }
    } catch {
      // Ignore text parsing errors
    }
    const err = new Error(errorMessage);
    err.status = res.status;
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';
  if (res.status === 204) return undefined;
  if (!contentType.includes('application/json')) {
    throw new Error('Invalid response: expected JSON');
  }
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