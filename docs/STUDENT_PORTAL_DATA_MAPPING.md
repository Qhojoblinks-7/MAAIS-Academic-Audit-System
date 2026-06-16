# Student Portal Data Mapping

## Backend → Frontend Data Flow Analysis

### Updated Backend Endpoint (IMPLEMENTED)

**GET `/api/v1/portal/students/{id}/portal-data`** (`portal.service.ts`)

```json
{
  "student": { "id": "...", "firstName": "...", "lastName": "...", "indexNumber": "...", "currentClassId": "...", "currentClass": { "name": "1A" } },
  "cgpa": 3.5,
  "classRank": 5,
  "approvalStatus": "APPROVED",
  "attendancePercentage": 95.5,
  "yearForm": "2024-2025",
  "semester": "Term 2",
  "terminalResults": [{ "subject": "Core Mathematics", "caScore": 25, "examScore": 55, "totalScore": 80, "grade": "A" }],
  "coreResults": [{ "subject": "Core Mathematics", "caScore": 25, "examScore": 55, "totalScore": 80, "grade": "A" }],
  "technicalResults": [{ "subject": "Elective Mathematics", "caScore": 22, "examScore": 48, "totalScore": 70, "grade": "B3" }],
  "academicHistory": [{ "year": "2024/2025", "term": "Term 1", "subjects": [{ "name": "Core Mathematics", "score": 80, "grade": "A" }] }],
  "behaviorRating": 4.0,
  "behaviorComments": "Consistent improvement and excellent class participation.",
  "characterTraits": { "characterQualities": 4.5, "leadership": 4, "discipline": 4, "teamwork": 5, "ethics": 5 },
  "notifications": [...],
  "activeInterventions": [...]
}
```

### Frontend Panel Requirements (All Complete)

| Panel | Required Fields | Status |
|-------|-----------------|--------|
| **OverviewPanel** | `cgpa`, `classRank`, `attendancePercentage`, `coreResults`, `technicalResults`, `behaviorRating`, `characterTraits` | ✅ |
| **AcademicPanel** | `academicHistory` | ✅ |
| **InterventionsPanel** | `notifications`, `academicHistory` | ✅ |
| **HistoryPanel** | `academicHistory` | ✅ |
| **AcademicJourneyPanel** | `academicHistory`, `yearForm`, `semester` | ✅ |
| **BroadsheetComparisonPanel** | `academicHistory`, `yearForm`, `semester` | ✅ |

---

## Additional Student Pages (Now Connected to Backend)

| Page | Required Data | Status |
|------|---------------|--------|
| **StudentTimetable.jsx** | Weekly schedule | ✅ `/api/v1/timetable/student-schedule` |
| **StudentSupport.jsx** | Observations, tickets | ✅ `/api/v1/students/{id}/behavior`, `/api/v1/comms/tickets/my` |
| **StudentSettings.jsx** | Stats, profile data, Notification Preferences | ✅ `/api/v1/portal/students/{id}/portal-data` |

---

## Files Modified

| File | Change |
|------|--------|
| `maais-backend/src/portal/portal.service.ts` | Extended portal endpoint |
| `maais-backend/src/timetable/timetable.service.ts` | Added `getStudentScheduleForClass()` |
| `maais-backend/src/timetable/timetable.controller.ts` | Added student timetable endpoint |
| `front-end/src/pages/student/StudentPortal.jsx` | API integration |
| `front-end/src/pages/student/StudentTimetable.jsx` | API integration |
| `front-end/src/pages/student/StudentSupport.jsx` | API integration |
| `front-end/src/pages/student/StudentSettings.jsx` | API integration, removed fees card |
| `front-end/src/pages/student/portal/panels/InterventionsPanel.jsx` | Fixed notification mapping |
| `front-end/src/services/studentService.js` | Fixed endpoint path |
| `docs/API_ENDPOINTS_DETAILED.md` | Updated response schema |