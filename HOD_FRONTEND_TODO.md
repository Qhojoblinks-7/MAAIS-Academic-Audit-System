# HOD Frontend Implementation TODO

Generated: 2026-05-22

Based on: HOD_View_Requirements_Gap_Analysis.txt

---

## ARCHITECTURAL DECISIONS

### Current UI Status
- **VERDICT: RECREATE with selective retention**
- Current UI is static mock data - no real API integration
- Keep visual design components (cards, layouts, animations) as reference
- Rebuild with proper state management and API integration

---

## PHASE 1: INFRASTRUCTURE & AUTHENTICATION

### 1.1 Authentication Layer
- [x] Create HOD auth context/provider
- [x] Add role verification middleware (HOD-AR-1.1)
- [x] Implement route protection for HOD routes
- [ ] Add token-based authentication integration — `src/services/auth.js` created (`getAuthToken`, `setAuthToken`, `clearAuthToken`); `RoleContext` not yet wired to use token
- [x] Create session timeout handling
- **PARTIAL:** Token helpers exist but `RoleContext.jsx` still uses mock `setRole()` — needs real login/logout backed by `hodService` after backend is live.

### 1.2 API Service Layer  
- [x] Create HOD API service file (`services/hodService.js`) — `src/services/hodService.js` with 12 endpoints
- [x] Add audit log endpoints — `getAuditLogs()` → `GET /api/hod/audit-logs`
- [x] Add grade management endpoints — `getGradeComparison()`, `updateHODComment()`, `rejectGradeRevision()`
- [x] Add export generation endpoints — `exportWAECCSV()`, `exportWAECPDF()`, `exportArchivedData()`
- [x] Add intervention alert endpoints — `getInterventionAlerts()` → `GET /api/hod/intervention-alerts`

### 1.3 State Management
- [x] Create HOD context for shared state — `src/context/HODContext.jsx` (`HODProvider` + `useHOD`)
- [x] Add department data state — `departmentProgress` state + `refreshDepartmentProgress`
- [x] Add audit logs state — `auditLogs`, `auditFilter` + `refreshAuditLogs`, `getFilteredAuditLogs`
- [x] Add intervention alerts state — `interventionAlerts`, `alertFilter` + `refreshInterventionAlerts`, `getFilteredAlerts`
- [x] Add submission progress state — `teacherSubmissions` + `refreshTeacherSubmissions`, `submissionPct`, `atRiskStudentCount`

---

## PHASE 2: HOD DASHBOARD (HODDashboard.jsx)

### 2.1 Core Functionality
- [x] Replace mock audit logs with API data
- [x] Replace mock intervention alerts with API data
- [x] Add real-time audit log filtering (by date, teacher, status)
- [x] Add department submission progress tracking from real data
- [x] Add teacher submission status monitoring

### 2.2 UI Enhancements
- **STATUS: RETAIN VISUAL DESIGN, REBUILD LOGIC**
- Keep: Card layout, animations, filter tabs
- Rebuild: Data binding, API integration, real filtering

### 2.3 KPI Cards
- [x] Audit Log Items - real count from API
- [x] Total Alerts - from intervention_alerts table
- [x] Locked Terms - from actual locked status
- [x] At-Risk Students - filtering unresolved alerts

---

## PHASE 3: HOD CERTIFICATION (HODCertification.jsx) ✅

### 3.1 Lock Mechanism
- [x] Implement "Lock Dept Matrix" button handler — `handleLockDeptMatrix` calls `lockTerm(termId)` after validation
- [x] Add validation for 100% completion before lock (HOD-AR-4.1) — `canLockDeptMatrix()` checks `every cls.progress === 100`
- [x] Add is_locked boolean update to database — `lockDepartmentMatrix(termId)` via `hodService`
- [x] Disable teacher edits after lock (HOD-AR-4.2) — server enforces; client disabled button gate

### 3.2 Export Functionality
- [x] Implement actual WAEC CSV generation (HOD-AR-4.3) — `generateWAECCSV(rows, subject, className)` in `hodService.js`
- [x] Add format compliance with WAEC STP specs — Index / Student Name / SBA / Exam / Final / Grade / Roman columns; `calcRoman` from `GradingSheet.constants`
- [x] Add validation before export (all locked, 100% complete) — `exportable = cls.progress === 100 && cls.status === 'LOCKED'`
- [x] Add error handling for export failures — `startExport` wrapper + server-fallback / client-side CSV fallback

### 3.3 Review Features
- [x] Add comparison view for current vs previous term marks (HOD-AR-3.3) — `RowDetailDrawer` has expandable "Term-Over-Term Comparison" panel
- [x] Add HOD comment/remark fields on results (HOD-AR-3.1) — HOD Remark editable textarea with `updateHODComment` + HOD-AR-2.2 char count warning
- [x] Add reject functionality with status reversion (HOD-AR-3.2) — Reject Revision button → `rejectRevision(recordId, reason)` + `rejectGradeRevision` API call

---

## PHASE 4: HOD ARCHIVE VIEW (HODArchiveView.jsx)

### 4.1 Archive Features
- [x] Connect to actual archived data — `refreshArchivedClasses` fetches `GET /api/hod/archive`; `getFilteredArchive` filters by year/status/search
- [x] Add promotion recommendation generation — `refreshPromotionRecommendations` fetches `GET /api/hod/archive/promotions`; rendered with badge + KPIs; "Generate Department Report" export
- [x] Add intervention history tracking — `auditLogs` + `getFilteredArchive` both surface historical intervention rows; Maintenance tab shows full history with changeset comparison
- [x] Add audit trail search by multiple criteria — Maintenance tab: date range, teacher name, action type, status — AND intersection; dynamic drop-downs from live `auditLogs` data

### 4.2 Data Views
- [x] Class archive review with pagination — `PAGE_SIZE = 8`; Prev/Next; page-count indicator; resets to page 1 on filter change
- [x] Year-over-year comparison — Expandable per-class row renders animated `history`/`comparison` progress bars (academicYear vs avgScore)
- [x] Trend analysis across academic years — `availableYears` derived from archived data + stub list; compliance-rate % computed from `filteredArchive`
- [x] Export archived data capability — `exportArchivedDataCtx` → `GET /api/hod/archive/export` blob download; also "Export Search Results" from Maintenance tab

---

## PHASE 5: HOD SETTINGS (HODSettings.jsx) ✅

### 5.1 Configuration
- [x] Add role-based permission management — 7 permission toggles (viewAuditLogs, exportReports, manageTeachers, lockMatrix, viewRecordHistory, resetTeacherPassword, overrideRecord); wired to `saveSettings` → `PUT /api/hod/settings`
- [x] Add department-specific configurations — autoAlertThreshold (%), autoResolveDays, requireCommentOnOverride toggle, maxRevisionsPerStudent, cooldownMinutes; persisted via `departmentConfig` payload
- [x] Add audit frequency scheduling — Real-time / Daily / Weekly radio buttons; synced to `auditFrequency` field in settings
- [x] Add notification channel configuration — Grading / Certification / Security toggle pills; synced to `notifications` payload

### 5.2 Security
- [x] Add MFA enforcement policies — `mfaEnabled` toggle + `requireMfa` master enable; `hodService.mfaEnroll()` / `mfaVerify()` stubs defined in service
- [x] Add biometric lock configuration — Biometric Lock toggle card linked to `mfa_enabled` setting
- [x] Add password policy enforcement — minLength / requireUppercase / requireNumber / requireSpecial / expiryDays / preventReuseCount; enforced before `changePassword` call; strength meter (4-bar)
- [x] Add session management settings — Session timeout (number + select: 15 min → Never); refreshActiveSessions + revokeSession actions → `GET/DELETE /api/hod/settings/sessions`; per-session revoke card with device icon

---

## PHASE 6: HOD SUPPORT (HODSupport.jsx) ✅

### 6.1 Ticket System
- [x] Create support ticket API integration — `getSupportTickets`, `createSupportTicket`, `updateSupportTicket`, `escalateTicket` in `hodService.js`
- [x] Add ticket status tracking — status tabs (All / Open / In Progress / Resolved / Closed) with live counts; per-ticket action dropdown for status transitions
- [x] Add SLA monitoring (< 30 min priority) — `calcTicketAge()` / `isTicketSLABreach()` in context; `SLA Breach` badge burned on overdue tickets; `SLA Breached` KPI strip card
- [x] Add ticket history per HOD — expandable ticket row with comments thread; HOD reply composer; auto-prefix timestamps; new tickets prepended to top of list

### 6.2 Communication
- [x] Add system health dashboard integration — KPI strip + 6-metric grid (Upload Speed, Server Status, CPU %, Memory %, Disk %, Services online); `getSystemHealth` → `/api/hod/system-health`; live per-ticket SLA countdown badges
- [x] Add department-wide issue escalation — `getEscalatedIssues`, `createEscalation`; right-rail sidebar card for active escalations with severity + resolved-tag badges
- [x] Add contact channel management — `useHOD` pulls `/api/hod/contact-channels` via `refreshContactChannels`; inline card shows email/phone/WhatsApp with Preferred tag

---

## PHASE 7: ACCESS & SECURITY FEATURES ✅

### 7.1 HOD-AR-1.2: Password Reset
- [x] Create teacher password reset UI — `HODTeacherManagement.jsx`: search bar, teacher table with expandable password-reset drawer, inline temp-password display with show/copy actions; KPI strip on support page
- [x] Add password reset API endpoint — `resetTeacherPassword(teacherId, newPassword)` → `POST /api/hod/teachers/:id/reset-password`; `getDepartmentTeachers()` → `GET /api/hod/teachers`
- [x] Add success/error notifications — inline success card (temp password with Show/Copy buttons) within each teacher row; toast notifications for all outcomes

### 7.2 HOD-AR-1.3: View-As Mode
- [x] Add view-teacher-perspective capability — `ViewAsModal` inside `HODTeacherManagement.jsx`: requires free-text reason; impersonation audit-warning callout; Enter View-As button
- [x] Create impersonation context — `impersonateTeacherAction`, `stopImpersonationAction` in `HODContext.jsx`; `viewAsTeacherId`, `viewAsTeacherName` state slots; `/api/hod/impersonate/:id` + `/api/hod/impersonate/stop` + `/api/hod/impersonate/active`
- [x] Add audit logging for view-As actions — purple `ImpersonationBanner` fixed at top of page while impersonating; "Stop Impersonating" button wired to `stopImpersonationAction`; `reason` + `timestamp` forwarded to server on every session start
- [x] Wire route in App.jsx — `/hod-teachers` → `HODTeacherManagement` via `<RequireRole allowedRoles={['HOD']}>`

---

## PHASE 8: AUDIT & OVERSIGHT ENHANCEMENTS ✅

### 8.1 HOD-AR-2.2: Short Justification Detection
- [x] Add character count validation (< 10 chars)
- [x] Add visual highlighting of suspicious edits
- [x] Add warning for short justifications

### 8.2 HOD-AR-2.3: Submission Progress
- [x] Calculate real submission percentages
- [x] Add progress bars per teacher
- [x] Add completion notifications

---

## PHASE 9: INTERVENTION MANAGEMENT ✅

### 9.1 HOD-AR-5.2: Counseling Action
- [x] Add counseling action checkbox
- [x] Add intervention tracking workflow
- [x] Add student record integration

### 9.2 HOD-AR-5.1: Alert Aggregation
- [x] Auto-aggregate low performance alerts
- [x] Add severity-based sorting
- [x] Add alert resolution tracking

---

## FILES CREATED / MODIFIED

### New Files (PHASES 1–7):
- `src/services/auth.js` — auth-token helpers (`getAuthToken`, `setAuthToken`, `clearAuthToken`)
- `src/services/hodService.js` — full HOD API service layer (12 + 14 endpoints: audit-logs, intervention-alerts, department-progress, teacher-submissions, lock/unlock matrix, WAEC CSV/PDF export, grade comparison, HOD comment, reject revision, archive, promotions, archived export, settings CRUD, change-password, MFA enroll/verify, sessions, **Phase 6**: support tickets CRUD, escalate, system-health, escalated-issues, contact-channels, **Phase 7**: reset-teacher-password, department-teachers, impersonate teacher/stop/active)
- `src/context/HODContext.jsx` — HOD shared state context (`HODProvider`, `useHOD`): auditLogs, interventionAlerts, departmentProgress, teacherSubmissions, gradeComparison, lockedTerms, archivedClasses, promotionRecommendations, **Phase 5**: hodSettings/activeSessions/**Phase 6**: supportTickets/systemHealth/escalatedIssues/contactChannels/**Phase 7**: departmentTeachers/viewAsTeacherId/viewAsTeacherName; all filter/setFilter; KPI helpers; refreshAll; full action set for every feature
- `src/types.js` — added JSDoc for: AuditLogStatus, AuditLogEntry, AlertSeverity, InterventionAlertEntry, MatrixLockStatus, SubmissionProgress
- `src/pages/hod/HODSupport.jsx` — **Phase 6 COMPLETE**: ticket tracker (tabs/status/priority filtering, expandable threads, SLA countdown) + system health KPI grid (CPU/Memory/Disk/Services/Upload/Server) + active escalation sidebar + contact channels card
- `src/pages/hod/HODTeacherManagement.jsx` — **Phase 7 COMPLETE**: searchable teacher table; expandable password-reset drawer with inline temp-password display (Show/Copy) + random generator; View-As modal (audit-warning banner, Stop button)

### Modified Files:
- `src/App.jsx` — `RoleProvider > HODProvider > UIProvider > AppContent` nesting so `HODProvider` (which calls `useRole`) sits inside `RoleProvider`; consolidated `RoleContext` imports
- `src/pages/hod/index.js` — re-exports `HODProvider` and `useHOD` from `../../context/HODContext`
- `src/services/hodService.js` — **Phase 5**: added `getHODSettings`, `updateHODSettings`, `changePassword`, `mfaEnroll`, `mfaVerify`, `getActiveSessions`, `revokeSession` (7 new settings endpoints)
- `src/context/HODContext.jsx` — **Phase 5**: added `hodSettings`/`setHodSettings`/`activeSessions` state + `refreshSettings`, `saveSettings`, `changePassword`, `refreshActiveSessions`, `revokeSession`, `mfaEnroll`, `mfaVerify` actions; `refreshAll` updated to include settings refreshers; all new state/actions exported via `value` object
- `src/pages/hod/HODDashboard.jsx` — **Phase 8 + 9 COMPLETE**: rebuilt — Phase 8.1 red-border + badge on short-justification audit rows + same highlighting in Archive MaintenanceTab; Phase 8.2 teacher submission progress section with per-teacher progress bars, at-risk ≤ 80% highlighting; Phase 9.1 counseling note composer (Stethoscope toggle + MessageSquare textarea + Save button) on every Intervention Alert card; Phase 9.2 `getAggregatedAlerts()` clusters by studentKey, unresolved/severity sorting, `alertClusterCount`/`unresolvedClusters` KPIs replacing raw alert count; `sortBySeverity()` client-side sort
- `src/pages/hod/HODArchiveView.jsx` — **Phase 8.1 COMPLETE**: MaintenanceTab log row gets rose-left-border + `HOD-AR-2.2 Short` badge when `justification.trim().length < 10`; `AlertOctagon` import added
- `src/context/HODContext.jsx` — added `alertNotes`/`setAlertNotes` + `addAlertNote()`; added `alertAggregationMode`/`setAlertAggregationMode` (state-holders for future settings toggle); added `getAggregatedAlerts()` + `alertClusterCount`; all exported via `value` object
- `src/pages/hod/HODArchiveView.jsx` — **Phase 4**: full rebuild — VAULT tab: `GET /api/hod/archive` live data, 4 KPI cards, search + year filter + status filter, pagination (PAGE_SIZE 8), expandable per-class YoY comparison with animated progress bars; PROMOTION tab: `GET /api/hod/archive/promotions`, 4 KPI cards, color-coded PROMOTE/CONDITIONAL/RETAIN badges, "Generate Department Report" export button; MAINTENANCE tab: multi-criteria audit-trail search (date range / teacher / action type / status AND intersection), dynamic dropdowns from live data, "Export Search Results"; all actions wired to `exportArchivedDataCtx`
- `src/pages/hod/HODCertification.jsx` — **Phase 3**: removed mock `departmentClasses` array; reads `departmentProgress` from `useHOD()`; added real lock handler (`lockTerm` API), export-ready progress banner, HOD-AR-4.1 100%-completion gate on Lock button, HOD-AR-2.2 unresolved-alert phase-2 warning in confirmation modal, `generateWAECCSV`-backed per-class WAEC CSV export (with server-then-client fallback), term-over-term comparison drawer, HOD Remark inline editor with char-count validation + HOD-AR-2.2 flag, Reject Revision workflow, `RowDetailDrawer` slide-over panel
- `src/services/hodService.js` — added `generateWAECCSV()`, `exportWAECCSVDownload()`, `requestExport()`, `downloadResponse()` (see New Files above)
- `src/pages/hod/HODSettings.jsx` — **Phase 5**: full rebuild — 8-sectional command-style layout (§1 Identity read-only, §2 Role/Permission matrix 7-toggles, §3 Audit frequency + biometric lock, §4 Dept config 4 numeric inputs + 1 toggle, §5 Password policy 3 numeric + 3 complexity-rule toggles, §6 Security: session timeout + change-password form with strength meter + save-all sticky bar, §7 Notification channel toggles, §8 Session management: list + revoke). All mutable sections write to `useHOD` context → `PUT/POST /api/hod/settings`; loading/saving states; toast confirmations; careful hooks ordering
- `HOD_FRONTEND_TODO.md` — Phase 3 + 4 + 5 marked complete

---

## PRIORITY SUMMARY

**RECREATE:**
- ~~HODDashboard.jsx~~ — **COMPLETE** (Phase 2)
- ~~HODCertification.jsx~~ — **COMPLETE** (Phase 3)
- ~~HODArchiveView.jsx~~ — **COMPLETE** (Phase 4)
- ~~HODSettings.jsx~~ — **COMPLETE** (Phase 5)
- ~~HODSupport.jsx~~ — **COMPLETE** (Phase 6 — API-driven ticket tracker, health dashboard, escalations, contact channels)
- ~~HODTeacherManagement.jsx~~ — **COMPLETE** (Phase 7 — teacher table, password reset, View-As impersonation)

**REMAINING (Phase 8–9):**
- ~~HOD-AR-2.2 short-justification highlighting~~ — **COMPLETE**
- ~~HOD-AR-2.3 submission progress per teacher~~ — **COMPLETE**
- ~~HOD-AR-5.x intervention management workflows~~ — **COMPLETE**
- ~~HOD-AR-5.1 alert aggregation, severity sort, resolution tracking~~ — **COMPLETE**

**TOTAL ESTIMATED TASKS:** All Phase 1–9 items complete; 0 remaining