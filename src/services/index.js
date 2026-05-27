export { dataSync } from './dataSyncLayer';
export { auditTrail } from './auditTrailService';
export { notification } from './notificationService';
export { reportEngine } from './reportEngine';
export { cacheLayer } from './cacheLayer';
export { eventBus } from './eventBus';

// Mock services (for development/testing)
export { mockHodService } from './mockHodService';
export { mockTeacherService } from './mockTeacherService';
export { mockStudentService } from './mockStudentService';

// Real services (with mock fallback)
export { hodService } from './hodService';
export { teacherService } from './teacherService';
export { studentService } from './studentService';