# HOD (Head of Department) Roles and Responsibilities
## MAAIS Academic Audit System

Based on requirements analysis and code examination, the HOD in the MAAIS system has the following core responsibilities:

## I. Functional Roles

### 1. Audit & Oversight (HOD-AR-2.x)
- **Real-time Audit Monitoring**: View audit trail of system adjustments with filtering capabilities
- **Justification Quality Control**: Identify and highlight grade changes with insufficient justification (<10 characters)
- **Submission Tracking**: Monitor teacher submission completion percentages for all classes
- **Term Management**: View and manage locked terms and archived class data
- **Intervention Monitoring**: Track system-generated academic risk markers and unresolved alert clusters

### 2. Review & Feedback (HOD-AR-3.x)
- **Student Result Remarks**: Add final comments/remarks on every student result sheet via the HOD comment functionality
- **Grade Revision Control**: Review and reject inappropriate grade revisions
- **Performance Comparison**: Compare current term marks with previous term's marks for trend analysis
- **Feedback Loop**: Provide corrective feedback to teachers through the correction workflow system

### 3. Final Lock & Export (HOD-AR-4.x)
- **Grading Finalization**: Apply final lock to prevent further edits once all marks are complete and verified
- **Teacher Access Control**: Disable teacher edit functions after final lock activation
- **WAEC Compliance**: Generate WAEC-compliant CSV exports only when 100% of marks are properly locked
- **Export Validation**: Ensure exported data meets WAEC STP specifications before generation

### 4. Intervention Management (HOD-AR-5.x)
- **Performance Aggregation**: Automatically aggregate low performance flags onto the HOD dashboard
- **Intervention Tracking**: Require documentation of counseling actions taken before finalizing interventions
- **Student Support**: Monitor and track intervention history for at-risk students
- **Alert Management**: Sort and prioritize intervention alerts by severity and resolution status

### 5. Administrative Functions (HOD-AR-1.x, 6.x, 7.x)
- **Access Control**: Restrict dashboard access to authorized HOD personnel only
- **Teacher Management**: Reset teacher passwords within the department when needed
- **Troubleshooting**: Utilize "View-As" mode to impersonate teachers for issue diagnosis and support
- **System Administration**: Manage HOD-specific settings, configurations, and department parameters
- **Support Ticket Handling**: Create, track, and escalate department-wide support tickets
- **System Health Monitoring**: Monitor system performance metrics and service availability
- **Contact Management**: Maintain and update preferred communication channels for the department

## II. Technical Implementation Points

### Key API Endpoints Utilized by HOD:
- `updateHODComment(recordId, comment)` - PATCH `/api/hod/records/:recordId/comment`
- `getAuditLogs()` - GET `/api/hod/audit-logs`
- `getInterventionAlerts()` - GET `/api/hod/intervention-alerts`
- `getTeacherSubmissionStatus()` - GET `/api/hod/teachers/submissions`
- `lockDepartmentMatrix(termId)` - POST `/api/hod/lock-matrix/:termId`
- `unlockDepartmentMatrix(termId)` - POST `/api/hod/unlock-matrix/:termId`
- `exportWAECCSVDownload(termId, className)` - POST `/api/hod/export-waec/:termId`
- `getGradeComparison(subjectId, termA, termB)` - GET `/api/hod/grades/compare`
- `rejectGradeRevision(recordId, reason)` - POST `/api/hod/records/:recordId/reject`
- `impersonateTeacher(teacherId, body)` - POST `/api/hod/impersonate/:teacherId`

### UI Components Involved:
- **HODDashboard.jsx**: Main dashboard showing audit logs, intervention alerts, submission progress
- **ObservationSidebar.jsx**: Displays HOD feedback and enables teacher responses in correction mode
- **CorrectionMode.jsx**: Shows HOD feedback messages and collects teacher explanations
- **GradingSheet.jsx**: Main grading interface where HOD can initiate corrections
- **HODSettings.jsx**: Manages department-specific HOD configurations
- **HODSupport.jsx**: Handles support ticket creation and management
- **HODTeacherManagement.jsx**: Manages teacher information and impersonation capabilities

## III. Workflow for HOD-Initiated Corrections

1. **Access Grading Interface**: HOD navigates to grading section via "Grade Submission" button
2. **Select Class/Student**: Chooses specific class and student record to review
3. **Initiate Mark Edit**: Selects a student's mark field to modify (triggers FR3 justification requirement)
4. **Provide Justification**: Enters reason for mark change (required for edits to existing records)
5. **Save Changes**: System saves the edit and creates a revision record
6. **Add HOD Feedback**: HOD adds corrective feedback via the comment system
7. **Teacher Notification**: Feedback appears in teacher's ObservationSidebar in correction mode
8. **Teacher Response**: Teacher can provide explanation or implement fixes and submit to HOD
9. **Review & Close**: HOD reviews teacher response and closes the correction cycle

## IV. Current Implementation Status (from Gap Analysis)

While some requirements show gaps in the analysis, key implemented features include:
- Partial audit trail functionality with basic filtering
- Intervention alert display (though from mock data)
- Submission progress tracking (basic implementation)
- Final lock mechanism (exists but lacks full validation)
- Export functionality (button present but needs CSV generation)
- Comment/feedback system via updateHODComment API
- View-As/impersonation capability for troubleshooting
- Support ticket and system health monitoring
- Department teacher management functions

The HOD serves as the central authority responsible for maintaining academic record integrity, ensuring WAEC compliance, providing instructional feedback to teachers, managing student interventions, and administering department-level academic processes within the MAAIS system.