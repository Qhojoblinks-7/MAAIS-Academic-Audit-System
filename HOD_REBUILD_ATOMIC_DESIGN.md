# MAAIS HOD View - Atomic Design System Rebuild
## Ground-Up Reconstruction Plan for Head of Department Interface

This document details the complete atomic design system for rebuilding the HOD (Head of Department) view from the ground up, based on functional requirements, gap analysis, and authoritative architecture.

---

## I. PAGES (Top-Level Views)

### 1. HOD Dashboard (`/hod`)
**Purpose**: Central command center providing real-time oversight of all departmental activities
**Key Metrics**: Audit log count, intervention clusters, unresolved alerts, locked terms, teacher submission progress

**Layout**:
- Header with role-aware navigation and quick actions
- 5-column KPI cards grid (Audit Items, Alert Clusters, Unresolved, Locked Terms, At-Risk Students)
- Teacher Submission Progress section with at-risk highlighting
- Audit Trail feed (Phase 8.1: red border + badge on short justifications)
- Intervention Alerts panel (Phase 9.2: clustered by student, severity-sorted)

**Data Sources**: Real-time API integration for audit logs, intervention alerts, teacher submissions, locked terms
**Workflow**: Single-glance monitoring → drill-down into specific audit items or alerts → initiate corrective actions

---

### 2. Audit & Oversight Center (`/hod/audit`)
**Purpose**: Comprehensive audit trail review with advanced filtering and justification quality control
**Key Features**: Multi-criteria filtering, justification quality flags, export capabilities, new Archbishop-2.2 compliance

**Layout**:
- Filter toolbar (status: all/RESOLVED/FLAGGED/LOCKED, action type, date range, teacher)
- Paginated audit log list (PageSize: 50)
- Expandable log entries showing old→new value deltas, justification preview
- Bulk actions for status changes, export

**Data Sources**: `GET /api/hod/audit-logs` with query params for filtering
**Workflow**: Filter → Review → Flag if short justification (<10 chars) → Add HOD comment → Export

---

### 3. Intervention Management Hub (`/hod/interventions`)
**Purpose**: Centralized management of student performance alerts and counseling follow-ups
**Key Features**: Student-keyed clustering, severity-based sorting, counseling action documentation

**Layout**:
- Severity filter tabs (ALL / HIGH / MEDIUM / LOW / RESOLVED)
- Alert cluster cards (student-grouped, unresolved first)
- Expandable counseling note composer per cluster
- Resolution workflow with timestamp tracking

**Data Sources**: `GET /api/hod/intervention-alerts`, `addAlertNote()` context action
**Workflow**: Review cluster → Add counseling note (Phase 9.1) → Mark resolved → Monitor outcomes

---

### 4. Grade Review & Approval (`/hod/review`)
**Purpose**: Individual student result review with HOD commenting and grade revision control
**Key Features**: Student-centric view, HOD remark field, grade comparison, rejection workflow

**Layout**:
- Student selector (search + filter by class/performance)
- Full grading sheet with HOD remark column (HOD-AR-3.1)
- Grade comparison view (current vs previous term)
- Action bar: Approve, Reject with reason, Request Revision

**Data Sources**: `GET /api/hod/records/:id`, `updateHODComment()`, `rejectGradeRevision()`
**Workflow**: Select student → Review marks → Add HOD comment → Approve or Reject → Teacher notified

---

### 5. Final Lock & Export (`/hod/lock-export`)
**Purpose**: Department-wide grading finalization and WAEC-compliant export management
**Key Features**: Lock validation, export compliance check, WAEC STP format generation

**Layout**:
- Lock status per class/term with progress indicators
- "Final Lock" button with validation (HOD-AR-4.1)
- WAEC Export Validator (HOD-AR-4.3) - checks 100% lock status, format compliance
- Export format selector (CSV/PDF/Broadsheet)
- Error reporting with remediation steps

**Data Sources**: `lockDepartmentMatrix()`, `exportWAECCSVDownload()`, `getArchivedDepartmentData()`
**Workflow**: Check lock readiness → Validate all marks complete → Apply final lock → Generate WAEC export

---

### 6. HOD Settings (`/hod/settings`)
**Purpose**: Department configuration and personal account management
**Key Features**: MFA enrollment, notification channels, session management, department settings

**Layout**:
- Tabbed interface: Profile, Security, Notifications, Department, Sessions
- MFA QR code enrollment + TOTP verification
- Contact channel preferences (email, SMS, WhatsApp)
- Active session management with revoke capability

**Data Sources**: `getHODSettings()`, `updateHODSettings()`, `mfaEnroll()`, `mfaVerify()`, `getActiveSessions()`
**Workflow**: Configure preferences → Enable MFA → Review active sessions → Save settings

---

### 7. Support Center (`/hod/support`)
**Purpose**: Access ticket tracking and system health monitoring
**Key Features**: Ticket creation/editing, SLA monitoring, escalation workflow, system health dashboard

**Layout**:
- Support Tickets Kanban (OPEN/PENDING/CLOSED columns)
- System Health metrics (uptime, CPU, memory, services)
- Create/Edit ticket modal with priority/severity
- Escalation button with reason capture

**Data Sources**: `getSupportTickets()`, `getSystemHealth()`, `createTicket()`, `escalateTicket()`, `getEscalatedIssues()`
**Workflow**: View tickets → Monitor system health → Create/escalate ticket → Track resolution

---

### 8. Teacher Management (`/hod/teachers`)
**Purpose**: Department staff oversight and administrative functions
**Key Features**: Teacher list with search, password reset, impersonation console, view-as mode

**Layout**:
- Searchable teacher table (name, email, subjects, status)
- Password reset panel (generate temp password / custom)
- "View As Teacher" button (HOD-AR-1.3) with audit trail
- Active impersonations panel with stop button

**Data Sources**: `getDepartmentTeachers()`, `resetTeacherPassword()`, `impersonateTeacher()`, `stopImpersonation()`
**Workflow**: Select teacher → View details → Reset password if needed → Initiate "View As" for troubleshooting

---

### 9. Analytics & Reporting (`/hod/analytics`)
**Purpose**: Data-driven insights for departmental improvement (HOD-AR-3.3)
**Key Features**: Performance trends, subject correlations, longitudinal tracking, promotion recommendations

**Layout**:
- Grade Comparison View (current vs previous term with delta chart)
- Longitudinal Academic Journey tracking (student trend visualization)
- GPA/CGPA calculation table
- Subject correlation matrix (performance relationships)
- Promotion Recommendations panel (PROMOTE/CONDITIONAL/RETAIN)

**Data Sources**: `getGradeComparison()`, `getArchivedDepartmentData()`, `getPromotionRecommendations()`
**Workflow**: Select term range → View trends → Export analysis → Inform department strategy

---

## II. ORGANISMS (Complex UI Components)

### 1. AuditLogTimeline
**Purpose**: Display chronological audit trail with filtering, expansion, and actions
**Composition**: StatusBadge × N, JustificationQualityIndicator × N, ActionButtonGroup, DateRangeFilter
**Key Properties**:
- `auditLogs`: Array<{id, action, target, userId, timestamp, oldValue, newValue, justification, status}>
- `onFlag`: (logId) => void
- `onComment`: (logId, comment) => void
- `onExport`: (logIds) => void
**Variants**: Compact (dashboard), Expanded (full audit page)

---

### 2. InterventionAlertCluster
**Purpose**: Grouped intervention alerts by student with severity sorting and resolution workflow
**Composition**: AlertSeverityChip × N, CounselingNoteComposer, ResolutionButton, StudentInfoCard
**Key Properties**:
- `cluster`: { studentId, studentName, items: Array<{id, severity, reason, subject, resolved, timestamp}> }
- `onAddNote`: (alertId, note) => void
- `onResolve`: (alertId) => void
- `onDrillDown`: (studentId) => void
**Variants**: Compact (dashboard), Expanded (management hub)

---

### 3. TeacherSubmissionMatrix
**Purpose**: Row-per-teacher submission tracking with progress visualization
**Composition**: SubmissionProgressSparkline × N, TeacherInfoCard, StatusBadge, RefreshButton
**Key Properties**:
- `teachers`: Array<{ teacherId, teacherName, subjects: number, graded: number, total: number, pct: number }>
- `onRefresh`: () => void
- `onDrillDown`: (teacherId) => void
**Variants**: Summary (dashboard), Full (official view)

---

### 4. GradeComparisonView
**Purpose**: Side-by-side comparison of current vs previous term grades with delta visualization
**Composition**: ComparisonTable, DeltaIndicator × N, TermSelector, ExportButton
**Key Properties**:
- `subjectId`: string
- `termA`: string (previous)
- `termB`: string (current)
- `comparisonData`: Array<{ studentId, name, markA, markB, delta, gradeA, gradeB }>
**Variants**: Table (detailed), Chart (visual delta)

---

### 5. WAECExportValidator
**Purpose**: Pre-export validation ensuring compliance with WAEC STP specifications
**Composition**: ValidationChecklist × N, ErrorList, ProgressIndicator, ExportButton
**Key Properties**:
- `classId`: string
- `termId`: string
- `onValidate`: () => ValidationResult
- `onExport`: (format) => void
**Validation Rules**:
- All marks entered (100% completion)
- No missing behavioral observations
- All justifications ≥10 characters
- Term is locked
---

### 6. HODCommentThread
**Purpose**: Bidirectional feedback exchange between HOD and teacher with threading
**Composition**: CommentBubble × N, TimeAgoLabel × N, HODAvatar, TeacherAvatar, ReplyInput
**Key Properties**:
- `recordId`: string
- `comments`: Array<{ id, authorRole, authorName, text, timestamp, isHod }>
- `onAddComment`: (text) => void
- `hodName`: string
**Variants**: Inline (sidebar), Modal (detailed thread)

---

### 7. SupportTicketKanban
**Purpose**: Drag-and-drop ticket workflow with status columns and SLA tracking
**Composition**: TicketCard × N, ColumnHeader × N, CreateTicketButton, SLAIndicator
**Key Properties**:
- `tickets`: Array<{ id, subject, description, status, priority, createdAt, assignedTo }>
- `onCreate`: (ticket) => void
- `onUpdate`: (ticketId, patch) => void
- `onEscalate`: (ticketId, reason) => void
**Columns**: OPEN → IN PROGRESS → PENDING → CLOSED

---

### 8. TeacherImpersonationConsole
**Purpose**: Secure "View As" functionality with audit trail and session controls
**Composition**: TeacherSelector, ImpersonateButton, SessionTimer, StopButton, AuditLog
**Key Properties**:
- `teachers`: Array<{ id, name, email, subjects }>
- `activeSession`: { teacherId, teacherName, startedAt, reason } | null
- `onImpersonate`: (teacherId, reason) => void
- `onStop`: () => void
**Variants**: Modal (confirmation), Inline (teacher list)

---

### 9. SystemHealthMonitor
**Purpose**: Real-time system metrics display with service status
**Composition**: MetricCard × N, ServiceStatusList × N, LastUpdatedLabel, RefreshButton
**Key Properties**:
- `health`: { status, uptime, cpu, memory, disk, services: Array<{name, status}> }
- `refreshInterval`: number (ms)
- `onRefresh`: () => void
**Variants**: Dashboard widget, Full-page diagnostics

---

## III. MOLECULES (Reusable UI Components)

### 1. StatusBadge
```jsx
<StatusBadge status="RESOLVED" variant="colored" size="sm" />
```
**Purpose**: Display status with color coding (RESOLVED=emerald, FLAGGED=amber, LOCKED=blue, DRAFT=slate)
**Props**: `status`, `variant` (colored|minimal), `size` (sm|md|lg), `className`
**Accessibility**: `aria-label` with status text, color-independent meaning

---

### 2. JustificationQualityIndicator
```jsx
<JustificationQualityIndicator text="Fixed typo" threshold={10} />
```
**Purpose**: Visual indicator for Archbishop-2.2 compliance (<10 chars triggers warning)
**Props**: `text`, `threshold` (default: 10), `showWarning` (boolean)
**Visual States**:
- Normal (≥10 chars) → Gray checkmark
- Short (<10 chars) → Red octagon + "HOD-AR-2.2 Short" badge

---

### 3. SubmissionProgressSparkline
```jsx
<SubmissionProgressSparkline graded={75} total={100} threshold={80} />
```
**Purpose**: Compact progress visualization for submission tracking
**Props**: `graded`, `total`, `threshold` (at-risk threshold, default: 80%), `showLabel`
**Visual States**:
- ≥95% → Emerald fill
- 80-94% → Amber fill  
- <80% → Red fill + "⚠ At-Risk" label

---

### 4. AlertSeverityChip
```jsx
<AlertSeverityChip severity="HIGH" onClick={handleClick} />
```
**Purpose**: Color-coded severity indicator with optional interaction
**Props**: `severity` (HIGH|MEDIUM|LOW), `size`, `onClick`, `className`
**Color Mapping**:
- HIGH → Rose/red palette
- MEDIUM → Amber/orange palette
- LOW → Blue/slate palette

---

### 5. HODCommentInput
```jsx
<HODCommentInput 
  value={comment} 
  onChange={setComment} 
  onSubmit={handleSubmit}
  maxLength={500}
  showCharCount
/>
```
**Purpose**: Text input for HOD remarks with character limit and submit action
**Props**: `value`, `onChange`, `onSubmit`, `maxLength`, `showCharCount`, `placeholder`
**Features**: Character counter, submit button, clear button, validation feedback

---

### 6. DateRangeFilter
```jsx
<DateRangeFilter 
  value={range} 
  onChange={setRange} 
  presets={['Today', 'Week', 'Month', 'Term']}
  allowCustom
/>
```
**Purpose**: Date range selection with preset options and custom picker
**Props**: `value`, `onChange`, `presets`, `allowCustom`, `format`
**Variants**: Inline (compact), Dropdown (expanded), Modal (custom range)

---

### 7. MultiSelectSubjectFilter
```jsx
<MultiSelectSubjectFilter 
  subjects={subjectList}
  selected={selectedSubjects}
  onChange={setSelectedSubjects}
  showCounts
/>
```
**Purpose**: Multi-select checkbox group for filtering by subject
**Props**: `subjects`, `selected`, `onChange`, `showCounts` (shows student count per subject)
**Features**: Search/filter subjects, select all/clear all, counts per subject

---

### 8. ExportFormatSelector
```jsx
<ExportFormatSelector 
  formats={['CSV', 'PDF', 'Broadsheet']}
  selected={selectedFormat}
  onChange={setSelectedFormat}
  disabled={!canExport}
/>
```
**Purpose**: Radio button group for export format selection with validation state
**Props**: `formats`, `selected`, `onChange`, `disabled`, `validationStatus`
**Validation**: Disabled until validation passes, shows error reason when disabled

---

### 9. ActionButtonGroup
```jsx
<ActionButtonGroup 
  actions={[
    { label: 'Approve', variant: 'primary', onClick: handleApprove },
    { label: 'Reject', variant: 'danger', onClick: handleReject },
    { label: 'Flag', variant: 'secondary', onClick: handleFlag }
  ]}
  loading={isSubmitting}
/>
```
**Purpose**: Grouped action buttons with consistent styling and loading states
**Props**: `actions` (array of button configs), `loading`, `align` (left|center|right)
**Button Variants**: primary, secondary, danger, ghost

---

### 10. LoadingSpinner
```jsx
<LoadingSpinner size="md" label="Loading audit logs..." />
```
**Purpose**: Accessible loading indicator with optional label
**Props**: `size` (sm|md|lg), `label`, `centered`, `overlay`
**Features**: `aria-busy`, screen reader support, optional backdrop

---

### 11. EmptyState
```jsx
<EmptyState 
  icon={ClipboardList}
  title="No audit logs found"
  description="Audit entries will appear here once adjustments are made"
  action={{ label: 'Refresh', onClick: handleRefresh }}
/>
```
**Purpose**: Consistent empty state display with optional action
**Props**: `icon`, `title`, `description`, `action`, `illustration` (optional)
**Use Cases**: Audit log empty, no alerts, no tickets, no results

---

### 12. ConfirmationDialog
```jsx
<ConfirmationDialog 
  isOpen={showDialog}
  title="Lock Department Grades?"
  message="This will prevent all teachers from making further edits. Are you sure?"
  confirmLabel="Lock Now"
  cancelLabel="Cancel"
  onConfirm={handleLock}
  onCancel={handleClose}
  variant="danger"
/>
```
**Purpose**: Confirmation dialog with destructive action styling
**Props**: `isOpen`, `title`, `message`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`, `variant`

---

## IV. ATOMS (Basic Building Blocks)

### Typography Atoms
```
<H1>HOD Dashboard</H1>
<H2>Audit Trail</H2>
<H3>Intervention Alerts</H3>
<Body>Regular text content</Body>
<Label>Form field label</Label>
<Caption>Helper text or timestamp</Caption>
<Tiny>Very small contextual text</Tiny>
```
**Design Tokens**: Font sizes, weights, line heights from design system

---

### Layout Atoms
```
<Container maxWidth="7xl" padding="lg">...</Container>
<Grid cols={3} gap={4}>...</Grid>
<Flex gap={4} align="center">...</Flex>
<Stack gap={3}>...</Stack>
<Divider orientation="horizontal|vertical" />
<Spacer size={4} />
```
**Responsive**: Breakpoints at 375px, 768px, 1024px, 1440px

---

### Form Atoms
```
<Input 
  type="text|email|password|number" 
  value={value} 
  onChange={handler}
  placeholder=""
  error={errorMessage}
  disabled={isDisabled}
/>
<Textarea 
  rows={4} 
  value={value} 
  onChange={handler}
  maxLength={500}
/>
<Select 
  options={[{ value, label }]} 
  value={value} 
  onChange={handler}
/>
<Checkbox 
  checked={isChecked} 
  onChange={handler}
  label="Label text"
/>
<Toggle 
  checked={isOn} 
  onChange={handler}
  label="Feature label"
/>
```
**Validation**: Inline error display, helper text, disabled states

---

### Feedback Atoms
```
<Toast type="success|error|warning|info" message="..." duration={4000} />
<Tooltip content="Helpful tip" position="top|right|bottom|left" />
<Badge count={5} max={99} />
<ProgressBar value={65} max={100} color="emerald|amber|rose" />
<Alert type="info|warning|error|success" message="..." dismissible />
```
**Accessibility**: `aria-live` regions for toasts, focus management

---

### Navigation Atoms
```
<Breadcrumb items={[{ label: 'HOD', href: '/hod' }, { label: 'Audit' }]} />
<TabList tabs={[{ id, label, icon, count }]} activeId={activeTab} onChange={setActive} />
<Pagination total={100} pageSize={10} currentPage={1} onChange={setPage} />
<Button variant="primary|secondary|ghost|danger" size="sm|md|lg" loading={isLoading} disabled={isDisabled}>
  <Icon name={iconName} />
  Button Label
</Button>
<Link href="/path" external={false}>Link Text</Link>
```
**Button Hierarchy**: Primary (emerald-900), Secondary (white with border), Ghost (transparent), Danger (rose-600)

---

### Indicator Atoms
```
<StatusDot status="online|offline|busy|away" />
<Spinner size="sm|md|lg" />
<Skeleton width={100} height={24} borderRadius={4} />
<Avatar src={url} name="Name" size={32|48|64} />
<Icon name={iconName} size={16|20|24} color="currentColor" />
```
**Skeleton Loading**: Pulse animation, matches content dimensions

---

### Color Atoms
**Semantic Palette**:
```
Primary:   #015D34 (emerald-900), #10B981 (emerald-500), #D1E9E0 (emerald-100)
Secondary: #64748B (slate-500), #E2E8F0 (slate-200)
Success:   #059669 (emerald-600), #ECFDF5 (emerald-50)
Warning:   #D97706 (amber-600), #FFFBEB (amber-50)
Error:     #DC2626 (rose-600), #FEF2F2 (rose-50)
Info:      #3B82F6 (blue-600), #EFF6FF (blue-50)
```
**Text Colors**: Gray-900 (headings), Gray-600 (body), Gray-500 (muted), Gray-400 (captions)

---

### Spacing Atoms
**Scale**: 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), 6 (24px), 8 (32px), 12 (48px), 16 (64px), 24 (96px)

---

## V. SYSTEM COMPONENTS (Non-UI Infrastructure)

### 1. AuthService
```typescript
class AuthService {
  // Role verification (HOD-AR-1.1)
  async verifyHODRole(): Promise<boolean>
  
  // Session management
  async getCurrentUser(): Promise<User>
  async refreshToken(): Promise<string>
  
  // Permission checks
  hasPermission(permission: string): boolean
}
```
**Usage**: Protected routes, API request headers, permission-gated UI

---

### 2. DataSyncLayer
```typescript
class DataSyncLayer {
  // Real-time updates
  subscribeToAuditLogs(callback: (logs) => void): Unsubscribe
  subscribeToInterventionAlerts(callback: (alerts) => void): Unsubscribe
  
  // Polling fallback
  startPolling(intervalMs: number): void
  stopPolling(): void
}
```
**Usage**: Live dashboard updates, notification triggers

---

### 3. AuditTrailService
```typescript
class AuditTrailService {
  // Capture before/after states
  captureEdit(recordId: string, oldValue: any, newValue: any, justification: string): Promise<void>
  
  // Query audit history
  getRecordHistory(recordId: string): Promise<AuditEntry[]>
  
  // HOD comment functionality
  addHODComment(recordId: string, comment: string): Promise<void>
  getHODComments(recordId: string): Promise<Comment[]>
}
```
**Usage**: Mark edit tracking, justification persistence, comment threading

---

### 4. NotificationService
```typescript
class NotificationService {
  // Teacher notifications
  notifyHODCommentAdded(teacherId: string, studentName: string, comment: string): Promise<void>
  notifyGradeRejected(teacherId: string, className: string, reason: string): Promise<void>
  notifyLockApplied(teacherId: string, className: string): Promise<void>
  
  // HOD notifications
  notifySubmissionComplete(teacherId: string, className: string): Promise<void>
}
```
**Usage**: Backend-triggered notifications, in-app toast display

---

### 5. ReportEngine
```typescript
class ReportEngine {
  // WAEC STP CSV generation (HOD-AR-4.3)
  generateWAECCSV(termId: string, className: string, students: Student[]): Blob
  
  // Broadsheet generation
  generateBroadsheet(termId: string, department: string): Blob
  
  // Validation
  validateExportReady(termId: string, className: string): Promise<ValidationResult>
  
  // PDF generation (if server-side)
  generatePDF(termId: string, className: string): Promise<Blob>
}
```
**Usage**: Grade export, WAEC compliance formatting, error reporting

---

### 6. PermissionMiddleware
```typescript
class PermissionMiddleware {
  // Route protection
  requireHOD(): (req, res, next) => void
  
  // API endpoint guards
  requireDepartmentMatch(departmentId: string): (req, res, next) => void
  
  // Resource permissions
  canViewStudent(studentId: string): Promise<boolean>
  canEditAuditLog(logId: string): Promise<boolean>
}
```
**Usage**: Backend route protection, frontend permission checks

---

### 7. CacheLayer
```typescript
class CacheLayer {
  // TTL-based caching
  get<T>(key: string): T | null
  set<T>(key: string, value: T, ttlMs: number): void
  
  // Invalidation
  invalidatePattern(pattern: string): void
  
  // Pre-built methods
  getAuditLogs(params: FilterParams): Promise<AuditLog[]>
  getInterventionAlerts(): Promise<Alert[]>
  getTeacherSubmissions(): Promise<Submission[]>
}
```
**Usage**: Dashboard performance, reduce API load, faster page loads

---

### 8. ErrorHandler
```typescript
class ErrorHandler {
  // Centralized error processing
  handle(error: Error, context: string): void
  
  // User-friendly messages
  getUserMessage(error: Error): string
  
  // Retry logic
  async retry<T>(operation: () => Promise<T>, maxRetries: number): Promise<T>
}
```
**Usage**: API error handling, user feedback, logging

---

### 9. APIClient
```typescript
class APIClient {
  // Authenticated requests
  async get<T>(path: string, params?: object): Promise<T>
  async post<T>(path: string, body: object): Promise<T>
  async patch<T>(path: string, body: object): Promise<T>
  
  // Interceptors
  addAuthToken(token: string): void
  addRequestInterceptor(interceptor: RequestInterceptor): void
  addResponseInterceptor(interceptor: ResponseInterceptor): void
}
```
**Usage**: All HTTP requests, auth token management, request/response transformation

---

### 10. EventBus
```typescript
class EventBus {
  // Pub/sub pattern
  subscribe(event: string, handler: Function): Unsubscribe
  publish(event: string, data: any): void
  
  // Pre-defined events
  static ALERT_RESOLVED = 'alert:resolved'
  static COMMENT_ADDED = 'comment:added'
  static LOCK_APPLIED = 'lock:applied'
  static GRADE_REJECTED = 'grade:rejected'
}
```
**Usage**: Decoupled component communication, audit trail triggers, notification dispatch

---

## VI. ATOMIC DESIGN HIERARCHY VISUALIZATION

```
┌─────────────────────────────────────────────────────────────┐
│                         PAGES                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌──────────┐        │
│  │Dashboard│ │  Audit  │ │Lock/    │ │Analytics │        │
│  │         │ │ Center  │ │Export   │ │          │        │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬─────┘        │
│       │           │           │           │               │
│       ▼           ▼           ▼           ▼               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     ORGANISMS                       │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐     │   │
│  │  │ AuditLog   │ │Intervention│ │  Teacher   │     │   │
│  │  │  Timeline  │ │   Cluster  │ │ Submission │     │   │
│  │  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘     │   │
│  │        │              │              │              │   │
│  │        ▼              ▼              ▼              │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │               MOLECULES                     │   │   │
│  │  │  ┌────────┐┌──────────┐┌──────────────┐   │   │   │
│  │  │  │ Status ││ Progress ││  Comment     │   │   │   │
│  │  │  │ Badge  ││ Sparkline││  Input       │   │   │   │
│  │  │  └───┬────┘└────┬─────┘└──────┬───────┘   │   │   │
│  │  │      │         │             │            │   │   │
│  │  │      ▼         ▼             ▼            │   │   │
│  │  │  ┌───────────────────────────────────────┐   │   │   │
│  │  │  │               ATOMS                   │   │   │   │
│  │  │  │  ┌─────┐┌─────┐┌─────┐┌──────────┐ │   │   │   │
│  │  │  │  │ Text ││Icon ││Badge││  Spacer  │ │   │   │   │
│  │  │  │  └─────┘└─────┘└─────┘└──────────┘ │   │   │   │
│  │  │  └───────────────────────────────────────┘   │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## VII. IMPLEMENTATION PRIORITIES

### Phase 1: Foundation (Critical)
1. AuthService + PermissionMiddleware (HOD-AR-1.1)
2. APIClient + ErrorHandler + CacheLayer
3. Core Atoms (Typography, Layout, Form)
4. HOD Dashboard skeleton with real data integration

### Phase 2: Core Features (High)
1. Audit & Oversight Center (HOD-AR-2.1, HOD-AR-2.2)
2. Grade Review & Approval (HOD-AR-3.1, HOD-AR-3.2)
3. HOD commenting functionality (updateHODComment integration)
4. Intervention Management Hub (HOD-AR-5.1, HOD-AR-5.2)

### Phase 3: Completion (Medium)
1. Final Lock & Export (HOD-AR-4.x)
2. Teacher Management (HOD-AR-1.2, HOD-AR-1.3)
3. Analytics & Reporting (HOD-AR-3.3)
4. Support Center (Phase 6 requirements)

### Phase 4: Polish (Low)
1. Skeleton loading states
2. Advanced filtering and search
3. Performance optimizations
4. Accessibility audits and ARIA enhancements

---

## VIII. REQUIRED DATA STRUCTURES (Student Cross-Subject Visibility)

```typescript
interface StudentAcademicProfile {
  studentId: string
  name: string
  indexNumber: string
  programme: string
  form: string
  className: string
  
  // All subjects studied (core + elective + cross-department)
  subjects: Array<{
    subjectId: string
    subjectName: string
    department: string
    type: 'CORE' | 'ELECTIVE' | 'CROSS_DEPT'
    teacherId: string
    teacherName: string
    currentMark: number | null
    previousMark: number | null
    grade: string
    auditStatus: 'MISSING' | 'COMPLETE' | 'ACTIVE' | 'FLAGGED'
    lastUpdated: string
  }>
  
  // Aggregated metrics
  overallAverage: number
  waecReadiness: 'READY' | 'AT_RISK' | 'NOT_READY'
  interventionCount: number
}
```

---

This atomic design system provides a complete foundation for rebuilding the HOD view with proper separation of concerns, reusability, and scalability while addressing all documented requirements and identified gaps.
