import { api } from './client';

export const usersApi = {
  createStaff: async (dto) => api.post('/users/staff', dto),

  createStudent: async (dto) => api.post('/users/students', dto),

  createParent: async (dto) => api.post('/users/parents', dto),

  getAllStudents: async () => api.get('/users/students'),

  getStudentProfile: async (id) => api.get(`/users/students/${id}`),

  getAllStaff: async () => api.get('/users/staff'),

  deactivateUser: async (id) => api.patch(`/users/${id}/deactivate`),
};

export const academicApi = {
  createYear: async (dto) => api.post('/academic/years', dto),

  activateYear: async (id) => api.patch(`/academic/years/${id}/activate`),

  getActiveYear: async () => api.get('/academic/years/active'),

  createTerm: async (dto) => api.post('/academic/terms', dto),

  activateTerm: async (id) => api.patch(`/academic/terms/${id}/activate`),

  createDepartment: async (dto) => api.post('/academic/departments', dto),

  getAllDepartments: async () => api.get('/academic/departments'),

  createSubject: async (dto) => api.post('/academic/subjects', dto),

  getAllSubjects: async () => api.get('/academic/subjects'),

  createClass: async (dto) => api.post('/academic/classes', dto),

  getAllClasses: async () => api.get('/academic/classes'),

  assignClassTeacher: async (id, dto) => api.patch(`/academic/classes/${id}/teacher`, dto),

  assignTeacher: async (dto) => api.post('/academic/assignments', dto),

  getTeacherAssignments: async (teacherId) => api.get(`/academic/assignments/teacher/${teacherId}`),

  getMyAssignments: async () => api.get('/academic/my-assignments'),
};

export default { usersApi, academicApi };
