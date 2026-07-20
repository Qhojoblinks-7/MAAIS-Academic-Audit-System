/**
 * @typedef { 'ADMIN' | 'HOD' | 'TEACHER' | 'STUDENT' } Role
 * @typedef { 'MALE' | 'FEMALE' } Gender
 * @typedef { 'CORE' | 'ELECTIVE' } SubjectType
 * @typedef { 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'CREDIT' | 'PASS' | 'WEAK_PASS' | 'FAILURE' } GradeRemark
 * @typedef { 'TERM_1' | 'TERM_2' | 'TERM_3' | 'SEMESTER_1' | 'SEMESTER_2' } TermNumber
 * @typedef { 'FORM_1' | 'FORM_2' | 'FORM_3' } ClassLevel
 * @typedef { 'PROMOTED' | 'REPEATED' | 'GRADUATED' | 'WITHDRAWN' } PromotionStatus
 * @typedef { 'REPORT_CARD' | 'TRANSCRIPT' } DocumentType
 * @typedef { 'APP' | 'SMS' | 'EMAIL' } NotificationChannel
 * @typedef { 'CREATE' | 'UPDATE' | 'DELETE' | 'LOCK' | 'UNLOCK' | 'PROMOTE' | 'GRADE_CORRECTION' } AuditAction
 */

/**
 * @typedef { Object} UserWithoutPassword
 * @property {string} id
 * @property {string} email
 * @property {string} [phone]
 * @property {Role} role
 * @property {boolean} isActive
 * @property {string} [lastLoginAt]
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {StaffProfile} [staffProfile]
 * @property {StudentProfile} [studentProfile]
 * @property {ParentProfile} [parentProfile]
 *
 * @typedef {Object} StaffProfile
 * @property {string} id
 * @property {string} userId
 * @property {string} staffId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} [middleName]
 * @property {Gender} gender
 * @property {string} [dateOfBirth]
 * @property {string} [phone]
 * @property {string} [photoUrl]
 * @property {string} hiredAt
 * @property {string} [departmentId]
 * @property {Department} [department]
 *
 * @typedef {Object} StudentProfile
 * @property {string} id
 * @property {string} userId
 * @property {string} indexNumber
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} [middleName]
 * @property {Gender} gender
 * @property {string} [dateOfBirth]
 * @property {string} [photoUrl]
 * @property {string} admissionDate
 * @property {string} [currentClassId]
 * @property {ClassSection} [currentClass]
 * @property {string} [departmentId]
 * @property {Department} [department]
 * @property {string} [archivedAt]
 *
 * @typedef {Object} ParentProfile
 * @property {string} id
 * @property {string} userId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} phone
 * @property {string} [email]
 * @property {string} [occupation]
 *
 * @typedef {Object} Department
 * @property {string} id
 * @property {string} name
 * @property {string} code
 * @property {string} [description]
 * @property {string} createdAt
 *
 * @typedef {Object} Subject
 * @property {string} id
 * @property {string} name
 * @property {string} code
 * @property {SubjectType} type
 * @property {string} [departmentId]
 * @property {Department} [department]
 * @property {string} [description]
 * @property {boolean} isActive
 * @property {string} createdAt
 *
 * @typedef {Object} ClassSection
 * @property {string} id
 * @property {string} name
 * @property {ClassLevel} level
 * @property {number} capacity
 * @property {string} [classTeacherId]
 * @property {StaffProfile} [classTeacher]
 *
 * @typedef {Object} TeachingAssignment
 * @property {string} id
 * @property {string} teacherId
 * @property {StaffProfile} teacher
 * @property {string} subjectId
 * @property {Subject} subject
 * @property {string} classSectionId
 * @property {ClassSection} classSection
 * @property {string} academicYearId
 *
 * @typedef {Object} AcademicYear
 * @property {string} id
 * @property {string} label
 * @property {string} startDate
 * @property {string} endDate
 * @property {boolean} isActive
 * @property {string} [termSystem]
 * @property {string} createdAt
 * @property {Term[]} [terms]
 *
 * @typedef {Object} Term
 * @property {string} id
 * @property {string} academicYearId
 * @property {AcademicYear} academicYear
 * @property {TermNumber} termNumber
 * @property {string} startDate
 * @property {string} endDate
 * @property {boolean} isActive
 * @property {boolean} isLocked
 *
 * @typedef {Object} GradeEntry
 * @property {string} id
 * @property {string} studentId
 * @property {StudentProfile} student
 * @property {string} subjectId
 * @property {Subject} subject
 * @property {string} termId
 * @property {Term} term
 * @property {number} [classScore]
 * @property {number} [examScore]
 * @property {number} [totalScore]
 * @property {string} [grade]
 * @property {string} [remark]
 * @property {number} [position]
 * @property {boolean} hasObservation
 * @property {string} [observationText]
 * @property {boolean} isLocked
 * @property {string} [lockedById]
 * @property {string} [lockedAt]
 * @property {string} [submittedById]
 * @property {string} [submittedAt]
 * @property {boolean} isApproved
 * @property {string} [approvedById]
 * @property {string} [approvedAt]
 * @property {GradeCorrection[]} corrections
 * @property {string} createdAt
 * @property {string} updatedAt
 *
 * @typedef {Object} GradeCorrection
 * @property {string} id
 * @property {string} gradeEntryId
 * @property {GradeEntry} gradeEntry
 * @property {string} changedById
 * @property {'classScore'|'examScore'|'remark'} fieldChanged
 * @property {string} [oldValue]
 * @property {string} newValue
 * @property {string} reason
 * @property {string} createdAt
 *
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} [studentId]
 * @property {StudentProfile} [student]
 * @property {string} title
 * @property {string} body
 * @property {NotificationChannel} channel
 * @property {boolean} isRead
 * @property {string} [deliveredAt]
 * @property {string} [failedAt]
 * @property {string} [errorMsg]
 * @property {string} createdAt
 * @property {string} [createdById]
 *
 * @typedef {Object} AuditLog
 * @property {string} id
 * @property {string} userId
 * @property {UserWithoutPassword} user
 * @property {AuditAction} action
 * @property {string} entity
 * @property {string} entityId
 * @property {Object} [payload]
 * @property {string} [ipAddress]
 * @property {string} [userAgent]
 * @property {string} createdAt
 *
 * @typedef {Object} PromotionRecord
 * @property {string} id
 * @property {string} studentId
 * @property {StudentProfile} student
 * @property {string} academicYearId
 * @property {AcademicYear} academicYear
 * @property {ClassLevel} fromClass
 * @property {ClassLevel} [toClass]
 * @property {PromotionStatus} status
 * @property {string} [notes]
 * @property {string} performedById
 * @property {string} performedAt
 *
 * @typedef {Object} ReportCard
 * @property {string} id
 * @property {string} studentId
 * @property {StudentProfile} student
 * @property {string} termId
 * @property {Term} term
 * @property {DocumentType} documentType
 * @property {string} systemHash
 * @property {string} [qrCodeUrl]
 * @property {string} [verificationUrl]
 * @property {number} [totalScore]
 * @property {number} [averageScore]
 * @property {number} [classPosition]
 * @property {number} [classSize]
 * @property {string} [conductGrade]
 * @property {string} [headmasterRemarks]
 * @property {string} [classTeacherRemarks]
 * @property {string} [pdfUrl]
 * @property {string} [generatedAt]
 * @property {string} [releasedAt]
 * @property {string} createdAt
 * @property {string} updatedAt
 *
 * @typedef {Object} Transcript
 * @property {string} id
 * @property {string} studentId
 * @property {string} indexNumber
 * @property {string} systemHash
 * @property {string} [qrCodeUrl]
 * @property {string} [verificationUrl]
 * @property {string} [pdfUrl]
 * @property {string} [purpose]
 * @property {string} [requestedById]
 * @property {string} generatedAt
 *
 * @typedef {Object} AuthResponse
 * @property {string} accessToken
 * @property {string} refreshToken
 * @property {UserWithoutPassword} user
 *
 * @typedef {Object} ApiError
 * @property {string} message
 * @property {number} statusCode
 *
 * @typedef {Object} LoginInput
 * @property {string} email
 * @property {string} password
 *
 * @typedef {Object} UpsertGradeInput
 * @property {string} studentId
 * @property {string} subjectId
 * @property {string} termId
 * @property {number} [classScore]
 * @property {number} [examScore]
 * @property {string} [remark]
 * @property {boolean} [hasObservation]
 * @property {string} [observationText]
 *
 * @typedef {Object} CorrectGradeInput
 * @property {string} gradeEntryId
 * @property {'classScore'|'examScore'|'remark'} fieldChanged
 * @property {string} newValue
 * @property {string} reason
 *
 * @typedef {Object} SendNotificationInput
 * @property {string[]} [studentIds]
 * @property {string} [classSectionId]
 * @property {string} title
 * @property {string} body
 * @property {NotificationChannel} [channel]
 *
 * @typedef {Object} AnalyticsPulse
 * @property {number} totalStudents
 * @property {number} activeTerms
 * @property {number} pendingGrades
 * @property {number} lockedGrades
 * @property {number} pendingApprovals
 * @property {number} interventionAlerts
 */

/**
 * Format term number for display (handles both 3-term and 2-semester systems)
 * @param {TermNumber|string} termNumber
 * @returns {string}
 */
const formatTermNumber = (termNumber) => {
  if (!termNumber) return '—';
  const upperValue = String(termNumber).toUpperCase();
  const numericMatch = upperValue.match(/_(\d+)$/);
  
  if (upperValue.startsWith('SEMESTER_')) {
    return numericMatch ? `${getOrdinal(Number(numericMatch[1]))} Semester` : '—';
  }
  if (upperValue.startsWith('TERM_')) {
    return numericMatch ? `${getOrdinal(Number(numericMatch[1]))} Term` : '—';
  }
  return termNumber;
};

const getOrdinal = (num) => {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const mod100 = num % 100;
  const suffix = mod100 > 10 && mod100 < 14 ? 'th' : (suffixes[num % 10] || 'th');
  return `${num}${suffix}`;
};

export const ROLES = {
  ADMIN: 'ADMIN',
  HOD: 'HOD',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
};
export const GENDERS = { MALE: 'MALE', FEMALE: 'FEMALE' };
export const SUBJECT_TYPES = { CORE: 'CORE', ELECTIVE: 'ELECTIVE' };
export const GRADE_REMARKS = {
  EXCELLENT: 'EXCELLENT',
  VERY_GOOD: 'VERY_GOOD',
  GOOD: 'GOOD',
  CREDIT: 'CREDIT',
  PASS: 'PASS',
  WEAK_PASS: 'WEAK_PASS',
  FAILURE: 'FAILURE',
};
export const TERM_NUMBERS = { 
  TERM_1: 'TERM_1', 
  TERM_2: 'TERM_2', 
  TERM_3: 'TERM_3',
  SEMESTER_1: 'SEMESTER_1',
  SEMESTER_2: 'SEMESTER_2',
};
export const TERM_SYSTEMS = {
  THREE_TERMS: 'THREE_TERMS',
  TWO_SEMESTERS: 'TWO_SEMESTERS',
};
export const CLASS_LEVELS = { FORM_1: 'Form 1', FORM_2: 'Form 2', FORM_3: 'Form 3' };
export const formatClassLevel = (level) => CLASS_LEVELS[level] || level || 'SHS 1';
export const formatFormNumber = (level) => {
  if (!level) return '1';
  const match = String(level).match(/(\d+)/);
  return match ? match[1] : '1';
};
export const PROMOTION_STATUSES = {
  PROMOTED: 'PROMOTED',
  REPEATED: 'REPEATED',
  GRADUATED: 'GRADUATED',
  WITHDRAWN: 'WITHDRAWN',
};
export const DOCUMENT_TYPES = { REPORT_CARD: 'REPORT_CARD', TRANSCRIPT: 'TRANSCRIPT' };
export const NOTIFICATION_CHANNELS = { APP: 'APP', SMS: 'SMS', EMAIL: 'EMAIL' };
export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOCK: 'LOCK',
  UNLOCK: 'UNLOCK',
  PROMOTE: 'PROMOTE',
  GRADE_CORRECTION: 'GRADE_CORRECTION',
};
export { formatTermNumber, getOrdinal };