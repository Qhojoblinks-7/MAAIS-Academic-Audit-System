import mockApiData from "../data/mockApiData.json";

let mockData = JSON.parse(JSON.stringify(mockApiData));

const simulateDelay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const createMockService = () => ({
  getPortalData: async (studentId, params = {}) => {
    await simulateDelay();
    const students = mockData.student.portalStudents || [];
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }
    return student;
  },

  getStudentByIndex: async (indexNumber) => {
    await simulateDelay();
    const students = mockData.student.portalStudents || [];
    const student = students.find((s) => String(s.indexNumber) === String(indexNumber));
    return student || null;
  },

  getStudentByIndexOrId: async (identifier) => {
    await simulateDelay();
    const students = mockData.student.portalStudents || [];
    return (
      students.find((s) => s.id === identifier) ||
      students.find((s) => String(s.indexNumber) === String(identifier)) ||
      null
    );
  },

  getStudentAcademicHistory: async (studentId) => {
    await simulateDelay();
    const history = mockData.studentAcademicHistory?.items || [];
    return history.find((h) => h.studentId === studentId) || null;
  },

  getNotifications: async (studentId) => {
    await simulateDelay();
    const student = mockData.student.portalStudents?.find((s) => s.id === studentId);
    return student?.notifications || [];
  },

  getTerminalResults: async (studentId) => {
    await simulateDelay();
    const student = mockData.student.portalStudents?.find((s) => s.id === studentId);
    return student?.terminalResults || [];
  },

  getAcademicHistory: async (studentId) => {
    await simulateDelay();
    const student = mockData.student.portalStudents?.find((s) => s.id === studentId);
    return student?.academicHistory || [];
  },

  getAllPortalStudents: async () => {
    await simulateDelay();
    return mockData.student.portalStudents || [];
  }
});

export const mockStudentService = createMockService();

export default mockStudentService;