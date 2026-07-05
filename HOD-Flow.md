# HOD User Flow

## Overview
Detailed workflow for Head of Department (HOD) users in the MAAIS Academic Audit System.

---

## HOD Dashboard Overview

### Entry Point
```
HODDashboard.jsx
  → View Department Progress
  → Access Revisions, Audit, Interventions
```

### Quick Stats Displayed
- Department progress percentage
- Pending revision count
- Intervention alerts count
- Teacher submission completion rate

---

## Grade Revision Review Flow

### Step 1: Load Revisions Feed
```jsx
HODRevisionsFeed.jsx:useEffect
  → hodService.getGradeRevisions()
    → GET /hod/grade-revisions
      → hod-grades.service.ts:13-83 getGradeRevisions()
```

**Filtered by:**
- Department subjects (via `staffProfile.departmentId`)
- Status tabs: "pending", "resolved", "all"
- Search query across student/subject

### Step 2: Review Revision
- Select revision from list
- View issue details, student info, class/subject
- See communication history thread

### Step 3: HOD Actions

#### Approve
```jsx
HODRevisionsFeed.jsx:handleApprove()
  → hodService.updateHODComment(recordId, comment)
  → hodService.approveGradeRevision(recordId, comment)
    → POST /hod/records/{id}/approve
      → hod-grades.service.ts:85-127 approveGradeRevision()
```

**Backend:**
- Sets `status: 'RESOLVED'`
- Adds comment to history
- Sends notification to teacher
- **Toast:** "Grade approved" (success)

#### Reject
```jsx
HODRevisionsFeed.jsx:handleReject()
  → hodService.rejectGradeRevision(recordId, reason)
    → POST /hod/records/{id}/reject
      → hod-grades.service.ts:129-171 rejectGradeRevision()
```

**Backend:**
- Sets `status: 'REJECTED'`
- Adds rejection reason to history
- Sends notification to teacher
- **Toast:** "Grade correction sent" (info)

#### Add Comment
```jsx
hodService.updateHODComment(recordId, comment)
  → PATCH /hod/records/{id}/comment
    → hod-grades.service.ts:195-226 updateHODComment()
```

---

## Term & Class Lock Management

### View Locked Terms
```
GET /hod/locked-terms
  → hod-grades.service.ts:559-584 getLockedTerms()
```

### Lock Term
```jsx
hodService.lockDepartmentMatrix(termId)
  → POST /hod/lock-matrix/{termId}
    → Lock term + cascade lock grade entries
```

### Lock Class Matrix
```jsx
hodService.lockDepartmentMatrix(classId)
  → POST /hod/lock-class/{classId}
    → Lock all grades for that class
```

### Unlock Term
```jsx
hodService.unlockDepartmentMatrix(termId)
  → POST /hod/unlock-matrix/{termId}
```

### Validate Lock Eligibility
```jsx
hodService.validateLock(termId)
  → GET /hod/lock-matrix/{termId}/validate
    → hod-grades.service.ts:454-557 validateLock()
```

**Validation Checks:**
- Grade completion percentage (must be 100%)
- Attendance records above 90%
- All entries signed off by teachers

---

## Teacher Submission Monitoring

### View Submission Status
```jsx
GET /hod/teachers/submissions
  → hod-teachers.service.ts:13-102 getTeacherSubmissionStatus()
```

**Returns per teacher:**
- Name, email
- Status: `SUBMITTED`, `IN_PROGRESS`, `DRAFT`
- Progress percentage

### View Submission Trends
```jsx
GET /hod/teachers/submissions/trends
  → hod-teachers.service.ts:526-633 getTeacherSubmissionTrends()
```

**Returns monthly trend data:**
- Expected vs actual grade entries
- Visualizes department submission velocity

---

## Audit & Compliance

### View Audit Logs
```jsx
GET /hod/audit-logs
  → hod-teachers.service.ts:201-376 getAuditLogs()
```

**Includes:**
- GradeEntry changes (CREATE, UPDATE, LOCK, DELETE)
- GradeCorrection entries
- Filter by date, teacher, action

### Add Audit Log Comment
```jsx
PATCH /hod/audit-logs/{logId}/comment
  → hod-teachers.service.ts:479-524 addAuditLogComment()
```

---

## Intervention Management

### View Intervention Alerts
```jsx
GET /hod/intervention-alerts
  → hod-archive.service.ts:resolveAlert()
```

### Resolve Alert
```jsx
POST /hod/intervention-alerts/{alertId}/resolve
  → hod-archive.service.ts:resolveAlert()
```

### Add Counseling Note
```jsx
POST /hod/intervention-alerts/{alertId}/notes
  → hod-archive.service.ts:addCounselingNote({alertId, text})
```

---

## HOD Impersonation

### Impersonate Teacher
```jsx
POST /hod/impersonate/{teacherId}
  → hod-settings.service.ts:impersonateTeacher()
```

### Stop Impersonation
```jsx
POST /hod/impersonate/stop
  → hod-settings.service.ts:stopImpersonation()
```

---

## HOD Flowchart

```mermaid
flowchart TD
    subgraph HOD[HOD Workflow]
        H1[Login - Role: HOD] --> H2[View Dashboard]
        H2 --> H3{Access Section}
        H3 -->|Revisions| H4[HODRevisionsFeed]
        H3 -->|Teachers| H5[HODTeachers]
        H3 -->|Audit| H6[HODAudit]
        H3 -->|Interventions| H7[HODInterventions]
        H3 -->|Analytics| H8[HODAnalytics]
        
        H4 --> H9[Select Revision]
        H9 --> H10{HOD Action}
        H10 -->|Approve| H11[Status: RESOLVED<br/>Toast: Success]
        H10 -->|Reject| H12[Status: REJECTED<br/>Notify Teacher]
        H10 -->|Comment| H13[Add to Discussion<br/>Notify Teacher]
        H10 -->|Request Revision| H14[Create GradeRevision<br/>Notify Teacher]
        
        H5 --> H15[View Teacher Progress]
        H15 --> H16[Click Teacher - Impersonate]
        H16 --> H17[View as Teacher<br/>(if needed)]
        
        H6 --> H18[View Audit Trail]
        H18 --> H19[Filter by Date/Action]
        
        H7 --> H20[View Intervention Alerts]
        H20 --> H21{Respond}
        H21 -->|Resolve| H22[Mark Resolved<br/>Add Note]
        H21 -->|Escalate| H23[Create Escalation]
    end

    subgraph LOCK[Lock Management]
        L1[Validate Lock<br/>Check Completion]
        L2[Lock Term/Class]
        L3[Teacher Cannot Edit<br/>(Locked Badge)]
        L4{Unlock Needed?}
        L4 -->|Yes| L5[Unlock Action]
        L4 -->|No| L3
    end

    H3 -->|Lock/Unlock| L1

    style HOD fill:#fef3c7
    style LOCK fill:#dbeafe
```