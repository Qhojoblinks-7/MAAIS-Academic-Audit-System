// Type definitions - for JSDoc type checking only

/**
 * @typedef {'ADMIN' | 'HOD' | 'TEACHER' | 'STUDENT'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string} name
 * @property {UserRole} role
 * @property {string} [departmentId]
 * @property {string} [avatar]
 */

/**
 * @typedef {Object} Revision
 * @property {string} id
 * @property {string} studentId
 * @property {string} studentName
 * @property {string} classId
 * @property {string} className
 * @property {string} section
 * @property {string} hodComment
 * @property {string} timestamp
 * @property {number} oldValue
 * @property {'PENDING' | 'RESOLVED'} status
 */

/**
 * @typedef {Object} HistoricalTerm
 * @property {string} year
 * @property {string} term
 * @property {number} finalGrade
 * @property {number} behaviorRating
 * @property {string} department
 * @property {string} [hodComment]
 */

/**
 * @typedef {Object} HistoricalObservation
 * @property {string} id
 * @property {string} date
 * @property {string} type
 * @property {string} comment
 * @property {string} teacherName
 */

/**
 * @typedef {Object} ArchiveStudent
 * @property {string} id
 * @property {string} name
 * @property {string} index
 * @property {string} currentClass
 * @property {string} department
 * @property {HistoricalTerm[]} history
 * @property {HistoricalObservation[]} observations
 */

/**
 * @typedef {Object} MissingObservation
 * @property {string} id
 * @property {string} studentId
 * @property {string} studentName
 * @property {string} classId
 * @property {string} className
 * @property {'Lab Safety' | 'Behavioral' | 'Resource Economy' | 'Hygienic Practices'} missingType
 * @property {'Science' | 'Home Economics' | 'General'} department
 */

/**
 * @typedef {'MISSING' | 'COMPLETE'} AuditStatus
 */

/**
 * @typedef {'DRAFT' | 'LOCKED' | 'RESOLVED' | 'FLAGGED'} AuditLogStatus
 */

/**
 * @typedef {Object} AuditLogEntry
 * @property {string} id
 * @property {string} [recordId]
 * @property {string} userId
 * @property {string} user
 * @property {'CREATE' | 'UPDATE' | 'DELETE' | 'LOCK' | 'AUTO_SAVE' | 'INTERVENTION_ALERT' | 'OVERRIDE'} action
 * @property {string} target
 * @property {string} [oldValue]
 * @property {string} [newValue]
 * @property {string} justification
 * @property {AuditLogStatus} status
 * @property {string} time
 * @property {string} [hodComment]
 */

/**
 * @typedef {'LOW' | 'MEDIUM' | 'HIGH'} AlertSeverity
 */

/**
 * @typedef {Object} InterventionAlertEntry
 * @property {string} id
 * @property {string} studentId
 * @property {string} studentName
 * @property {string} studentIndex
 * @property {string} subject
 * @property {string} reason
 * @property {AlertSeverity} severity
 * @property {string} timestamp
 * @property {boolean} resolved
 */

/**
 * @typedef {'LOCKED' | 'UNLOCKED' | 'SUBMITTED' | 'DRAFT'} MatrixLockStatus
 */

/**
 * @typedef {Object} SubmissionProgress
 * @property {string} teacherId
 * @property {string} teacherName
 * @property {string} subjectName
 * @property {string} className
 * @property {number} studentCount
 * @property {number} gradedCount
 * @property {number} progress
 * @property {MatrixLockStatus} status
 */

/**
 * @typedef {number} LockedTermsCount
 */

export {};