# MAAIS Academic Audit & Intervention System
## User Acceptance Testing (UAT) Questionnaire

**Project:** Mando SHTS Academic Audit & Intervention System (MAAIS)
**Version:** 1.0
**Date:** 2026-07-17
**Prepared For:** QA Team / UAT Facilitators / School Stakeholders

---

## 1. UAT OVERVIEW

### 1.1 Purpose
This document contains the User Acceptance Testing questionnaire for MAAIS. UAT is the final phase of testing before production release, where actual end-users (Admin, HODs, Teachers, Students) validate that the system meets business requirements and is ready for live operation.

### 1.2 Test Scope
- Role-based access and dashboards
- Grade entry, audit middleware, and locking workflows
- HOD oversight, review, and WAEC export
- Intervention engine and student alerts
- Student portal and longitudinal academic tracking
- System freeze, promotion cycle, and archive
- Ticket system, notifications, and revision workflows

### 1.3 Test Environment
| Item | Value |
|------|-------|
| URL | `http://localhost:3000` (frontend) / `http://localhost:3001` (backend) |
| Database | PostgreSQL (Neon serverless) |
| Browser | Chrome / Firefox / Edge (latest stable) |
| Test Data | Seeded demo accounts per role (see `docs/REQUIREMENTS_TRACEABILITY.md`) |

### 1.4 Demo Accounts
| Role | Email | Password | Notes |
|------|-------|----------|-------|
| SUPER_ADMIN | admin@mandoshts.edu.gh | Admin@2024! | Full system authority |
| HOD | hod@mandoshts.edu.gh | Hod@2024! | Department oversight |
| TEACHER | teacher@mandoshts.edu.gh | Teacher@2024! | Grade entry and observations |
| STUDENT | student@mandoshts.edu.gh | Student@2024! | Portal access |

---

## 2. UAT TEST CASES BY ROLE

---

### 2.1 SUPER_ADMIN / HEADMASTER

#### TC-ADM-01: Login & Authentication
**Priority:** Critical | **Type:** Functional
1. Navigate to login page.
2. Enter admin credentials.
3. Verify JWT access token and refresh token are issued.
4. Verify redirect to Admin Dashboard.
5. Logout and confirm token invalidation.

**Expected Result:** Admin logs in successfully and lands on the Admin Dashboard with full sidebar navigation (User Vault, Academic Architect, System Freeze, Batch Reports).

---

#### TC-ADM-02: Academic Year & Term Setup
**Priority:** Critical | **Type:** Functional
1. As Admin, create a new Academic Year (e.g., `2025/2026`).
2. Create three terms (Term 1, Term 2, Term 3) with start/end dates.
3. Verify terms appear in the active term selector across the system.

**Expected Result:** Academic year and terms are created and active. All role dashboards reflect the new term.

---

#### TC-ADM-03: User & Department Management
**Priority:** Critical | **Type:** Functional
1. Create a new Department (e.g., "Automotive").
2. Create a new Subject linked to the department.
3. Create a new Staff user (Teacher) and assign to the department.
4. Create a new Class Section (e.g., "Form 1A").
5. Create a Student and assign to the class.
6. Create a Parent and link to the student.

**Expected Result:** All users are created with correct roles. Teaching assignments can be made. Student-parent linkage works.

---

#### TC-ADM-04: System Freeze (Emergency Lock)
**Priority:** Critical | **Type:** Functional / Security
1. As Admin, click "Emergency Freeze" in the action panel.
2. Enter a freeze reason (e.g., "Exam security incident").
3. Submit and confirm the freeze activates.
4. Log in as Teacher and attempt to save a grade.
5. Observe the freeze modal and the 403 error on save.
6. As Admin, lift the freeze ("Lift Institutional Freeze").
7. Verify the 24-hour override window begins.
8. Confirm Teacher can save grades again within the window.

**Expected Result:** Freeze blocks all grading writes globally. Admin sees a dismissible banner. Teachers see a freeze acknowledgment modal. Unfreezing creates a 24-hour override window.

---

#### TC-ADM-05: Promotion Cycle (Archive & Vault)
**Priority:** High | **Type:** Functional
1. Ensure all terms for the current academic year are locked.
2. As Admin, trigger the Promotion Cycle.
3. Verify Form 1 students move to Form 2, Form 2 to Form 3, and Form 3 students graduate (archived).
4. Search "The Vault" for a graduated student by index number.
5. Verify archived records are retrieved with full grade history.

**Expected Result:** Promotion cycle executes only when all terms are locked. Students are promoted/graduated correctly. Archived records remain searchable.

---

#### TC-ADM-06: Batch Report Card Generation
**Priority:** High | **Type:** Functional
1. As Admin, select a class and trigger batch report card generation.
2. Verify reports include: student name, term, subjects, scores, grades (WAEC Roman), QR code, and SHA256 hash.
3. Verify class positions are calculated.
4. Verify a student with a performance drop has an InterventionAlert.

**Expected Result:** Batch report cards are generated for all students in the selected class with correct WAEC formatting and QR verification.

---

#### TC-ADM-07: Department Freeze
**Priority:** Medium | **Type:** Functional
1. As Admin, freeze a specific department (e.g., "Automotive").
2. Log in as a Teacher in that department and attempt to save a grade.
3. Log in as a Teacher in a different department and attempt to save a grade.

**Expected Result:** Teachers in the frozen department receive a 403 error with department-specific reason. Teachers in other departments can save normally.

---

#### TC-ADM-08: Curriculum Mapping & Teaching Assignments
**Priority:** Medium | **Type:** Functional
1. As Admin, map a subject to a class section for a specific academic year.
2. Assign a teacher to that subject-class combination.
3. Verify the teacher sees the assignment in their dashboard.

**Expected Result:** Curriculum mappings and teaching assignments are persisted and reflected in teacher dashboards.

---

#### TC-ADM-09: View-As / Impersonation (HOD Feature)
**Priority:** Low | **Type:** Functional
1. As Admin (or HOD with permissions), use "View As" to impersonate a teacher.
2. Verify the impersonation banner appears.
3. Verify audit log captures the impersonation event with reason and timestamp.
4. Stop impersonation and verify the original role is restored.

**Expected Result:** Impersonation works with full audit logging. No data leakage between roles.

---

### 2.2 HOD (HEAD OF DEPARTMENT)

#### TC-HOD-01: Login & Department Dashboard
**Priority:** Critical | **Type:** Functional
1. Log in as HOD.
2. Verify dashboard loads with KPI cards: Audit Log Items, Total Alerts, Locked Terms, At-Risk Students.
3. Verify department progress (submission %, locked terms) is displayed.

**Expected Result:** HOD sees their department-specific dashboard with real-time metrics.

---

#### TC-HOD-02: Audit Trail Review
**Priority:** Critical | **Type:** Functional
1. As HOD, navigate to the Audit Logs view.
2. Filter audit logs by date range, teacher name, and action type.
3. Verify each log entry shows: user, timestamp, old value, new value, reason.
4. Verify the immutable insert-only nature (no delete option).

**Expected Result:** HOD can review all grade changes in their department with full context. Audit logs cannot be modified or deleted.

---

#### TC-HOD-03: HOD Review & Grade Rejection
**Priority:** Critical | **Type:** Functional
1. As HOD, open a teacher's grading sheet for review.
2. Identify a grade that requires correction.
3. Reject the grade with a comment (e.g., "Score does not match broadsheet").
4. Verify the rejection triggers a notification to the teacher.

**Expected Result:** HOD can reject grades with comments. Teacher receives a real-time notification.

---

#### TC-HOD-04: Grade Revision Workflow
**Priority:** High | **Type:** Functional
1. As HOD, initiate a grade revision targeting a specific teacher.
2. Verify the revision appears in the teacher's revisions feed.
3. As Teacher, fulfill the revision with corrected marks and justification.
4. As HOD, review the revision and approve it.

**Expected Result:** Revision workflow completes end-to-end. Status changes from PENDING to RESOLVED. Notifications sent to both parties.

---

#### TC-HOD-05: Lock Class Matrix
**Priority:** Critical | **Type:** Functional
1. As HOD, navigate to Lock/Export view.
2. Verify 100% submission completion before locking is enforced.
3. Lock a class matrix.
4. Verify grade entries become read-only.
5. Verify WAEC CSV export becomes available only for locked classes.

**Expected Result:** HOD can only lock when all submissions are complete. Locked classes are read-only. Export is gated on lock status.

---

#### TC-HOD-06: WAEC STP Export
**Priority:** Critical | **Type:** Functional / Compliance
1. As HOD, preview the WAEC CSV for a locked class.
2. Verify CSV columns: Index, Student Name, SBA, Exam, Final, Grade, Roman.
3. Verify WAEC subject code validation (only codes 301-330, 103-114, etc.).
4. Download the CSV and open in Excel.
5. Verify Roman grade conversion (A1-F9) and 30/70 weighting.

**Expected Result:** WAEC CSV is correctly formatted and compliant with STP requirements. Invalid subject codes are rejected.

---

#### TC-HOD-07: Intervention Alerts Review
**Priority:** High | **Type:** Functional
1. As HOD, navigate to Intervention Alerts.
2. Verify alerts are shown for students with >= 15% performance drop vs previous term.
3. Verify alert details: previous average, current average, drop percentage.
4. Mark an alert as reviewed/resolved.
5. Verify the alert status changes.

**Expected Result:** HOD can view, filter, and resolve intervention alerts. Students with performance drops are flagged.

---

#### TC-HOD-08: Lock/Unlock Granular Controls
**Priority:** High | **Type:** Functional
1. As HOD, lock a Term.
2. Verify all grade entries in that term become read-only.
3. Unlock the Term and verify edits are re-enabled.
4. Lock a Department Matrix and verify only department subjects are locked.

**Expected Result:** Term, Class Matrix, and Department Matrix locks work independently and cascade correctly.

---

#### TC-HOD-09: Teacher Management & Password Reset
**Priority:** Medium | **Type:** Functional
1. As HOD, view the list of teachers in the department.
2. Reset a teacher's password.
3. Verify the teacher receives the temporary password and can log in.
4. Verify the teacher is forced to change password on next login.

**Expected Result:** HOD can manage teacher accounts and reset passwords securely.

---

#### TC-HOD-10: Support Ticket Escalation
**Priority:** Medium | **Type:** Functional
1. As HOD, view support tickets from teachers.
2. Add a comment to an open ticket.
3. Escalate a ticket to Admin.
4. Verify SLA breach badges appear on overdue tickets.

**Expected Result:** Ticket escalation chain works (Teacher -> HOD -> Admin). SLA monitoring is accurate.

---

#### TC-HOD-11: HOD Settings & Permissions
**Priority:** Medium | **Type:** Functional
1. As HOD, navigate to Settings.
2. Configure department-specific settings (auto-alert threshold, notification channels).
3. Toggle permission flags (e.g., require comment on override).
4. Verify settings persist after page reload.

**Expected Result:** HOD settings are saved and applied to the department.

---

### 2.3 TEACHER

#### TC-TCH-01: Login & Teacher Dashboard
**Priority:** Critical | **Type:** Functional
1. Log in as Teacher.
2. Verify dashboard displays class cards based on teaching assignments.
3. Verify each card shows: subject, class, student count, progress %, status badge.
4. Click a class card and verify navigation to the Grading Sheet.

**Expected Result:** Teacher sees only their assigned classes. Navigation to grading sheet works.

---

#### TC-TCH-02: Grade Entry - Core Subjects (30/70)
**Priority:** Critical | **Type:** Functional
1. As Teacher, open a Core Mathematics grading sheet.
2. Enter Class Score (max 30) and Exam Score (max 70) for multiple students.
3. Verify auto-calculation of Total Score and WAEC Grade (A1-F9).
4. Verify auto-save indicator shows "Last saved" timestamp.
5. Save the grades.

**Expected Result:** Core grades are auto-calculated using 30/70 weighting. Auto-save works.

---

#### TC-TCH-03: Grade Entry - Technical Subjects (Milestones)
**Priority:** Critical | **Type:** Functional
1. As Teacher, open a Technical Subject grading sheet (e.g., Auto Mechanics).
2. Enter milestone scores: Marking out, Assembly, Finishing.
3. Verify auto-calculation of total and grade.
4. Enter Practical and Theory scores where applicable.

**Expected Result:** Technical milestone columns are displayed and auto-calculated correctly.

---

#### TC-TCH-04: Mandatory Justification on Grade Edit
**Priority:** Critical | **Type:** Security / Audit
1. As Teacher, enter and save a grade.
2. Edit the same grade without entering a reason.
3. Verify the system blocks the save and shows the Justification Popup.
4. Enter a justification reason and save.
5. Verify an AuditLog entry is created with old value, new value, reason, user, and timestamp.

**Expected Result:** Grade edits without justification are blocked. Audit trail is created atomically with the grade update.

---

#### TC-TCH-05: Behavioral & Safety Logging
**Priority:** High | **Type:** Functional
1. As Teacher, open the Observation Sidebar in the grading sheet.
2. Log attitudinal ratings (1-5) for: respect, punctuality, teamwork.
3. Log a workshop safety compliance flag for a student.
4. Save and verify the ratings persist.

**Expected Result:** Behavioral ratings and safety flags are saved and visible in the grading sheet sidebar.

---

#### TC-TCH-06: System Freeze Experience
**Priority:** High | **Type:** Functional
1. As Admin, trigger a System Freeze.
2. As Teacher, reload the grading sheet.
3. Verify the freeze acknowledgment modal appears with the freeze reason.
4. Click "Understood" and verify the modal is dismissed (stored in sessionStorage).
5. Attempt to save a grade and verify the 403 error.

**Expected Result:** Teacher sees the freeze modal. Grades cannot be saved during freeze.

---

#### TC-TCH-07: Grade Revision Request
**Priority:** High | **Type:** Functional
1. As Teacher, view teacher-initiated revisions.
2. Submit a self-revision request with justification.
3. Verify the revision appears in the HOD's revisions feed.
4. Verify a notification is sent to HOD.

**Expected Result:** Teacher can request grade revisions. HOD is notified.

---

#### TC-TCH-08: WAEC CSV Preview & Export
**Priority:** Medium | **Type:** Functional
1. As Teacher, preview the WAEC CSV before export.
2. Verify the preview matches the expected STP format.
3. Export the CSV and open in Excel.
4. Verify data integrity: index numbers, names, scores, grades.

**Expected Result:** Teacher can preview and export WAEC-compliant CSV.

---

#### TC-TCH-09: Notifications & Discussion Threads
**Priority:** Medium | **Type:** Functional
1. As Teacher, click the notification bell.
2. Verify recent notifications are displayed (e.g., HOD rejection, revision approval).
3. Navigate to a grade discussion thread.
4. Post a message and verify it appears in real-time.
5. Verify HOD sees the message in their view.

**Expected Result:** Real-time notifications and discussion threads work bidirectionally between Teacher and HOD.

---

#### TC-TCH-10: Student Support Ticket Creation
**Priority:** Medium | **Type:** Functional
1. As Teacher, create a support ticket for a student issue.
2. Verify the ticket appears in the HOD's ticket queue.
3. As HOD, add a reply to the ticket.
4. Verify the Teacher sees the reply in their ticket view.

**Expected Result:** Ticket escalation and reply workflow works across roles.

---

### 2.4 STUDENT

#### TC-STU-01: Login & Student Portal
**Priority:** Critical | **Type:** Functional
1. Log in as Student.
2. Verify redirect to Student Portal.
3. Verify dashboard panels load: Overview, Academic, Interventions, History, Journey.

**Expected Result:** Student sees their personalized portal with all academic data.

---

#### TC-STU-02: View Terminal Results & Grades
**Priority:** Critical | **Type:** Functional
1. As Student, view terminal results for the current term.
2. Verify subjects, CA scores, exam scores, totals, and grades are displayed.
3. Verify core and technical results are separated correctly.

**Expected Result:** Student can view accurate, up-to-date results.

---

#### TC-STU-03: Academic Journey (Longitudinal Trends)
**Priority:** High | **Type:** Functional
1. As Student, navigate to the "Academic Journey" panel.
2. Verify 3-year grade history is displayed (SHS 1-3).
3. Verify trend visualization (charts) shows performance over time.
4. Verify the "Journey" view shows progression from Form 1 to current form.

**Expected Result:** Student sees longitudinal academic trends with visualizations.

---

#### TC-STU-04: Intervention Alerts
**Priority:** High | **Type:** Functional
1. As a student with a >= 15% performance drop, log in.
2. Verify the intervention alert is visible in the Interventions panel.
3. Verify alert details: previous average, current average, drop percentage.
4. Verify the student sees counseling/notification options.

**Expected Result:** At-risk students see their intervention alerts in the portal.

---

#### TC-STU-05: Behavior & Character Traits
**Priority:** Medium | **Type:** Functional
1. As Student, view behavior ratings.
2. Verify attitudinal ratings (respect, punctuality, teamwork) are displayed.
3. Verify character traits scores are shown.
4. Verify behavior comments from teachers are visible.

**Expected Result:** Student can view their behavior and character assessment data.

---

#### TC-STU-06: Support Ticket Creation
**Priority:** Medium | **Type:** Functional
1. As Student, create a support ticket.
2. Verify the ticket is routed to the appropriate teacher/HOD.
3. Verify the student can track ticket status (Open, In Progress, Resolved).

**Expected Result:** Student can create and track support tickets.

---

#### TC-STU-07: Timetable & Profile
**Priority:** Medium | **Type:** Functional
1. As Student, view the class timetable.
2. Verify the timetable displays the correct weekly schedule.
3. View and update profile settings.
4. Verify notification preferences can be configured.

**Expected Result:** Student can view timetable and manage profile settings.

---

### 2.5 PARENT

#### TC-PAR-01: Parent Login & Linked Student View
**Priority:** Critical | **Type:** Functional
1. Log in as Parent.
2. Verify the parent can view linked student(s).
3. Verify the parent can see the student's results, attendance, and behavior.

**Expected Result:** Parent has read-only access to linked student data.

---

#### TC-PAR-02: Parent Notifications
**Priority:** Medium | **Type:** Functional
1. As Parent, verify notifications are received for student events (e.g., intervention alerts, report cards).
2. Verify the parent cannot modify any data.

**Expected Result:** Parent receives relevant notifications and has read-only access.

---

## 3. CROSS-CUTTING UAT TEST CASES

---

### TC-XC-01: Security - Role-Based Access Control (RBAC)
**Priority:** Critical | **Type:** Security
1. Attempt to access HOD routes as a Teacher.
2. Attempt to access Admin routes as a Student.
3. Verify unauthorized access returns 403 Forbidden.
4. Verify route guards on the frontend block navigation.
5. Verify backend `@Roles()` decorators enforce access control on every endpoint.

**Expected Result:** No user can access resources outside their role. Both frontend and backend enforce RBAC.

---

### TC-XC-02: Security - Password Hashing & Token Rotation
**Priority:** Critical | **Type:** Security
1. Verify passwords are hashed with Argon2id (not stored in plaintext).
2. Log in and verify JWT access token (15min) and refresh token (7d) are issued.
3. Use the refresh token to obtain a new access token.
4. Verify the old refresh token is invalidated (rotation).

**Expected Result:** Passwords are securely hashed. Refresh tokens are rotated on use.

---

### TC-XC-03: Data Integrity - ACID Transactions
**Priority:** Critical | **Type:** Data Integrity
1. As Teacher, edit a grade and provide a justification.
2. Simulate a database failure during the transaction (if possible in test environment).
3. Verify that either both the grade update AND audit log are saved, OR neither is saved.
4. Verify no orphaned audit logs exist without corresponding grade changes.

**Expected Result:** Grade updates and audit logs are saved atomically. No partial writes.

---

### TC-XC-04: Audit Trail - Immutability
**Priority:** Critical | **Type:** Security / Audit
1. As Admin, attempt to delete or modify an existing audit log entry.
2. Verify the operation is blocked at the database level (insert-only trigger).
3. Verify audit logs capture: user ID, timestamp, old value, new value, reason, IP address, user-agent.

**Expected Result:** Audit logs are immutable. All required fields are captured.

---

### TC-XC-05: Performance - Export Generation
**Priority:** High | **Type:** Performance
1. As HOD, export a departmental broadsheet with 200+ students.
2. As Teacher, export a WAEC CSV for a class of 50 students.
3. Measure the time for both operations.
4. Verify exports complete in under 5 seconds.

**Expected Result:** All exports complete within the 5-second performance target.

---

### TC-XC-06: Usability - Responsive Design
**Priority:** Medium | **Type:** Usability
1. Open the Grading Sheet on a tablet (iPad) and a smartphone.
2. Verify touch-friendly input controls.
3. Verify the layout adapts to smaller screens.
4. Verify the grading sheet can be used in a workshop environment (tablet).

**Expected Result:** Interface is responsive and usable on tablets and smartphones.

---

### TC-XC-07: Notifications - Real-time Delivery
**Priority:** Medium | **Type:** Functional
1. As HOD, reject a teacher's grade revision.
2. Verify the teacher receives an immediate notification (without page refresh).
3. Verify the notification bell shows an unread count.
4. Verify toast notifications appear for major actions.

**Expected Result:** Notifications are delivered in real-time via EventBus.

---

### TC-XC-08: System Freeze - Layering with HOD Locks
**Priority:** High | **Type:** Functional
1. As Admin, trigger a System Freeze.
2. As HOD, attempt to lock a class matrix.
3. Verify the freeze takes precedence.
4. Lift the freeze and verify HOD locks work again.
5. As HOD, lock a term.
6. As Teacher, attempt to edit a grade.
7. Verify the "Term is locked" error is shown.
8. Verify System Freeze error takes precedence over Term Lock error.

**Expected Result:** Freeze > Term Lock > Grade Entry Lock precedence is enforced correctly.

---

### TC-XC-09: Data Privacy - Student/Parent Isolation
**Priority:** High | **Type:** Security
1. As Student, attempt to access another student's portal data.
2. As Parent, attempt to access a non-linked student's data.
3. Verify both are blocked with 403 Forbidden.
4. Verify students can only see their own grades and behavior.

**Expected Result:** Student and parent data access is strictly isolated to their own records.

---

### TC-XC-10: WAEC Compliance - Grade Conversion
**Priority:** Critical | **Type:** Compliance
1. Enter a score of 100 and verify grade = A1.
2. Enter a score of 75 and verify grade = B2.
3. Enter a score of 50 and verify grade = C6.
4. Enter a score of 0 and verify grade = F9.
5. Verify WAEC Roman grades are used in all exports and report cards.

**Expected Result:** WAEC grading scale (A1-F9) is correctly applied across the system.

---

## 4. UAT SIGN-OFF

### 4.1 Test Execution Summary

| Role | Test Cases Executed | Passed | Failed | Blocked | Notes |
|------|--------------------:|-------:|-------:|--------:|-------|
| SUPER_ADMIN | | | | | |
| HOD | | | | | |
| TEACHER | | | | | |
| STUDENT | | | | | |
| PARENT | | | | | |
| CROSS-CUTTING | | | | | |

### 4.2 Defect Log

| ID | Test Case | Severity | Description | Status |
|----|-----------|----------|-------------|--------|
| | | High/Medium/Low | | Open/In Progress/Resolved |

### 4.3 Sign-Off

| Stakeholder | Name | Role | Signature | Date |
|-------------|------|------|-----------|------|
| | | Project Lead | | |
| | | QA Lead | | |
| | | Headmaster / School Rep | | |
| | | HOD Representative | | |
| | | Teacher Representative | | |
| | | Student Representative | | |

---

## 5. APPENDIX

### 5.1 Glossary
- **WAEC STP:** West African Examinations Council Student Transcript Portal
- **RBAC:** Role-Based Access Control
- **SBA:** School-Based Assessment (30% of core grade)
- **CA:** Class Assessment
- **NHU:** Nearest Health Unit (medical records)
- **OCC:** Optimistic Concurrency Control

### 5.2 Related Documents
- `docs/REQUIREMENTS_TRACEABILITY.md` — Functional & Non-Functional Requirements mapping
- `docs/API_ENDPOINTS_DETAILED.md` — Backend API schemas by role
- `SYSTEM-FLOWS.md` — System Freeze & HOD Lock flows
- `docs/requirement and specs.txt` — Original project specification
- `QA_AUDIT_REPORT.md` — Automated QA audit (78/78 tests passing)

### 5.3 UAT Execution Notes
- Execute test cases in the order presented for each role.
- Cross-cutting test cases (TC-XC) should be executed after role-specific tests.
- Any "Failed" or "Blocked" test cases must be logged in the Defect Log before sign-off.
- UAT is considered complete when all Critical and High priority test cases pass.
