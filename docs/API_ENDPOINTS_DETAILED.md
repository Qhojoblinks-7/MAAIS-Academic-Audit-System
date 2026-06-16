# API Endpoints - Detailed Data Schemas by Role

## ADMIN (System Administrator)

### POST /api/v1/auth/login
**Request Body:**
```json
{
  "email": "admin@mandoshts.edu.gh",
  "password": "Admin@2024!"
}
```
**Response:**
```json
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": { "id": "...", "email": "...", "role": "ADMIN" }
}
```

### POST /api/v1/auth/refresh
**Request Body:**
```json
{
  "userId": "uuid_string",
  "refreshToken": "refresh_token_string"
}
```
**Response:**
```json
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

### POST /api/v1/auth/logout
**Response:** `{ success: true }`

### GET /api/v1/auth/me
**Response:**
```json
{
  "id": "...",
  "email": "...",
  "role": "ADMIN",
  "staffProfile": { "firstName": "...", "lastName": "..." }
}
```

### POST /api/v1/users/staff
**Request Body:**
```json
{
  "email": "teacher@mandoshts.edu.gh",
  "password": "Teacher@2024!",
  "role": "TEACHER",
  "staffId": "TCH-2024-001",
  "firstName": "Ama",
  "lastName": "Owusu",
  "middleName": "Abena",
  "gender": "FEMALE",
  "phone": "+233244000000",
  "departmentId": "dept_uuid"
}
```
**Response:** Created user object with staffProfile

### POST /api/v1/users/students
**Request Body:**
```json
{
  "indexNumber": "MSHTS/2024/001",
  "firstName": "Kwame",
  "lastName": "Mensah",
  "middleName": "Kofi",
  "gender": "MALE",
  "dateOfBirth": "2008-01-15",
  "password": "Student@2024!",
  "currentClassId": "class_uuid",
  "departmentId": "dept_uuid",
  "parentFirstName": "John",
  "parentLastName": "Mensah",
  "parentPhone": "+233244000000",
  "parentEmail": "parent@email.com",
  "parentRelationship": "Father"
}
```

### GET /api/v1/users/students/{id}
**Response:**
```json
{
  "id": "...",
  "firstName": "...",
  "lastName": "...",
  "indexNumber": "...",
  "currentClass": { "id": "...", "name": "1A" },
  "department": { "id": "...", "name": "Science" },
  "grades": [{ "subject": { "name": "..." }, "term": {...} }],
  "reportCards": [...]
}
```

### POST /api/v1/users/parents
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Mensah",
  "phone": "+233244000000",
  "email": "parent@email.com",
  "occupation": "Engineer"
}
```

### DELETE /api/v1/users/{id}/deactivate
**Response:** `{ "success": true }`

### POST /api/v1/academic/years
**Request Body:**
```json
{
  "label": "2024/2025",
  "startDate": "2024-09-02",
  "endDate": "2025-07-31"
}
```

### POST /api/v1/academic/terms
**Request Body:**
```json
{
  "academicYearId": "year_uuid",
  "termNumber": "TERM_1",
  "startDate": "2024-09-02",
  "endDate": "2024-12-20"
}
```

### POST /api/v1/academic/departments
**Request Body:**
```json
{
  "name": "Science",
  "code": "SCI",
  "description": "Science Department"
}
```

### POST /api/v1/academic/subjects
**Request Body:**
```json
{
  "name": "Core Mathematics",
  "code": "CMATH",
  "type": "CORE",
  "departmentId": "dept_uuid",
  "description": "Core mathematics for all students"
}
```

### POST /api/v1/academic/classes
**Request Body:**
```json
{
  "name": "1A",
  "level": "YEAR_1",
  "capacity": 40
}
```

### PATCH /api/v1/academic/classes/{id}/teacher
**Request Body:**
```json
{
  "staffId": "staff_uuid"
}
```

### POST /api/v1/academic/assignments
**Request Body:**
```json
{
  "teacherId": "teacher_uuid",
  "subjectId": "subject_uuid",
  "classSectionId": "class_uuid",
  "academicYearId": "year_uuid"
}
```

### POST /api/v1/grading/entries
**Request Body:**
```json
{
  "studentId": "student_uuid",
  "subjectId": "subject_uuid",
  "termId": "term_uuid",
  "classScore": 25,
  "examScore": 55,
  "remark": "Outstanding performance",
  "hasObservation": true,
  "observationText": "Consistently performs well in class"
}
```

### POST /api/v1/grading/entries/bulk
**Request Body:**
```json
{
  "entries": [
    {
      "studentId": "student_uuid",
      "subjectId": "subject_uuid",
      "termId": "term_uuid",
      "classScore": 25,
      "examScore": 55
    }
  ]
}
```

### POST /api/v1/grading/corrections
**Request Body:**
```json
{
  "gradeEntryId": "entry_uuid",
  "fieldChanged": "classScore",
  "newValue": "30",
  "reason": "Score was incorrectly entered"
}
```

### POST /api/v1/reports/report-cards/generate
**Request Body:**
```json
{
  "studentId": "student_uuid",
  "termId": "term_uuid"
}
```

### POST /api/v1/reports/report-cards/batch
**Request Body:**
```json
{
  "classSectionId": "class_uuid",
  "termId": "term_uuid"
}
```

### POST /api/v1/reports/transcripts/generate
**Request Body:**
```json
{
  "studentIdOrIndex": "MSHTS/2024/001"
}
```

### POST /api/v1/archive/promote
**Request Body:**
```json
{
  "academicYearId": "year_uuid"
}
```

### POST /api/v1/comms/notify
**Request Body:**
```json
{
  "studentIds": ["student_uuid1", "student_uuid2"],
  "title": "Term 2 Results Ready",
  "body": "Your Term 2 report cards are now available.",
  "channel": "SMS"
}
```

### POST /api/v1/comms/emergency
**Request Body:**
```json
{
  "title": "School Closure",
  "message": "School is closed tomorrow due to weather."
}
```

### POST /api/v1/timetable
**Request Body:**
```json
{
  "classId": "class_uuid",
  "subjectId": "subject_uuid",
  "teacherId": "teacher_uuid",
  "dayOfWeek": "MONDAY",
  "startTime": "08:00",
  "endTime": "09:30",
  "room": "Room 12"
}
```

---

## TEACHER

### GET /api/v1/users/students
**Response:** Array of student profiles (filtered by teacher's assignments)

### GET /api/v1/academic/my-assignments
**Response:**
```json
[
  {
    "id": "...",
    "subject": { "id": "...", "name": "Mathematics" },
    "classSection": { "id": "...", "name": "1A" },
    "academicYear": { "id": "...", "label": "2024/2025" }
  }
]
```

### GET /api/v1/grading/class-summary/{classId}
**Query:** `termId`
**Response:**
```json
{
  "classId": "...",
  "className": "...",
  "studentCount": 45,
  "averageScore": 78.5,
  "highestScore": 95,
  "lowestScore": 45,
  "gradeDistribution": { "A": 10, "B": 20, "C": 15 }
}
```

### GET /api/v1/grading/students/{studentId}/terms/{termId}
**Response:**
```json
[
  {
    "subject": { "name": "Mathematics" },
    "classScore": 25,
    "examScore": 55,
    "total": 80,
    "grade": "A",
    "remark": "Excellent"
  }
]
```

### GET /api/v1/timetable/my-schedule
**Response:** Array of timetable entries for current teacher

---

## HOD (Head of Department)

### GET /api/v1/users/staff
**Response:** Array of staff profiles in HOD's department

### GET /api/v1/grading/audit-tray
**Query:** `termId`
**Response:**
```json
[
  {
    "gradeEntryId": "...",
    "studentName": "John Doe",
    "subjectName": "Mathematics",
    "hasObservation": false
  }
]
```

---

## STUDENT

### GET /api/v1/portal/students/{id}/portal-data
**Response:**
```json
{
  "student": {
    "id": "...",
    "firstName": "...",
    "lastName": "...",
    "indexNumber": "...",
    "currentClassId": "...",
    "currentClass": { "id": "...", "name": "1A" }
  },
  "cgpa": 3.5,
  "classRank": 5,
  "approvalStatus": "APPROVED",
  "attendancePercentage": 95.5,
  "yearForm": "2024-2025",
  "semester": "Term 2",
  "terminalResults": [
    {
      "subject": "Core Mathematics",
      "caScore": 25,
      "examScore": 55,
      "totalScore": 80,
      "grade": "A",
      "remarks": "Excellent"
    }
  ],
  "coreResults": [
    { "subject": "Core Mathematics", "caScore": 25, "examScore": 55, "totalScore": 80, "grade": "A" }
  ],
  "technicalResults": [
    { "subject": "Elective Mathematics", "caScore": 22, "examScore": 48, "totalScore": 70, "grade": "B3" }
  ],
  "academicHistory": [
    {
      "year": "2024/2025",
      "term": "Term 1",
      "subjects": [
        { "name": "Core Mathematics", "score": 80, "grade": "A" }
      ]
    }
  ],
  "behaviorRating": 4.0,
  "behaviorComments": "Consistent improvement and excellent class participation.",
  "characterTraits": {
    "characterQualities": 4.5,
    "leadership": 4,
    "discipline": 4,
    "teamwork": 5,
    "ethics": 5
  },
  "notifications": [
    {
      "id": "...",
      "title": "Term Results Ready",
      "body": "Your report card is available",
      "channel": "APP",
      "isRead": false,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "activeInterventions": [
    {
      "id": "...",
      "previousAverage": 4.2,
      "currentAverage": 3.1,
      "dropPercentage": 26.2,
      "status": "ACTIVE",
      "notes": "Academic intervention required"
    }
  ]
}
```

### POST /api/v1/students/{id}/behavior
**Request Body:**
```json
{
  "punctuality": 5,
  "conduct": 4,
  "attitude": 5,
  "remarks": "Well behaved student"
}
```
**Response:**
```json
{
  "id": "...",
  "studentId": "...",
  "punctuality": 5,
  "conduct": 4,
  "attitude": 5,
  "remarks": "Well behaved student",
  "recordedById": "...",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### GET /api/v1/students/{id}/behavior
**Response:**
```json
[
  {
    "id": "...",
    "punctuality": 5,
    "conduct": 4,
    "attitude": 5,
    "remarks": "Well behaved student",
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### GET /api/v1/students/{id}/interventions
**Response:**
```json
[
  {
    "id": "...",
    "previousAverage": 4.2,
    "currentAverage": 3.1,
    "dropPercentage": 26.2,
    "status": "ACTIVE",
    "notes": "Academic intervention required",
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### POST /api/v1/timetable
**Request Body:**
```json
{
  "classId": "class_uuid",
  "subjectId": "subject_uuid",
  "teacherId": "teacher_uuid",
  "dayOfWeek": "MONDAY",
  "startTime": "08:00",
  "endTime": "09:30",
  "room": "Room 12"
}
```
**Response:**
```json
{
  "id": "...",
  "classSection": { "id": "...", "name": "1A" },
  "subject": { "id": "...", "name": "Mathematics" },
  "teacher": { "id": "...", "firstName": "Ama", "lastName": "Owusu" },
  "dayOfWeek": "MONDAY",
  "startTime": "08:00",
  "endTime": "09:30",
  "room": "Room 12"
}
```

### GET /api/v1/timetable
**Query Parameters:** `teacherId`, `classId`, `dayOfWeek` (optional)
**Response:**
```json
[
  {
    "id": "...",
    "classSection": { "id": "...", "name": "1A", "level": "FORM_1" },
    "subject": { "id": "...", "name": "Mathematics", "department": { "name": "Science" } },
    "teacher": { "id": "...", "firstName": "Ama", "lastName": "Owusu" },
    "dayOfWeek": "MONDAY",
    "startTime": "08:00",
    "endTime": "09:30",
    "room": "Room 12"
  }
]
```

### GET /api/v1/timetable/my-schedule
**Response:**
```json
[
  {
    "id": "...",
    "subject": { "name": "Mathematics" },
    "dayOfWeek": "MONDAY",
    "startTime": "08:00",
    "endTime": "09:30"
  }
]
```

### GET /api/v1/timetable/teacher/{teacherId}
**Response:**
```json
[
  {
    "id": "...",
    "classSection": { "name": "1A" },
    "subject": { "name": "Mathematics" },
    "dayOfWeek": "MONDAY",
    "startTime": "08:00",
    "endTime": "09:30"
  }
]
```

### GET /api/v1/timetable/class/{classId}
**Response:**
```json
[
  {
    "id": "...",
    "subject": { "name": "Mathematics" },
    "teacher": { "firstName": "Ama", "lastName": "Owusu" },
    "dayOfWeek": "MONDAY",
    "startTime": "08:00",
    "endTime": "09:30",
    "room": "Room 12"
  }
]
```

### GET /api/v1/timetable/weekly/{teacherId}
**Response:**
```json
{
  "MONDAY": [
    {
      "id": "...",
      "subject": { "name": "Mathematics" },
      "dayOfWeek": "MONDAY",
      "startTime": "08:00",
      "endTime": "09:30"
    }
  ],
  "TUESDAY": [],
  "WEDNESDAY": [],
  "THURSDAY": [],
  "FRIDAY": []
}
```

### GET /api/v1/timetable/clashes/{teacherId}
**Response:**
```json
[
  {
    "a": { "id": "...", "dayOfWeek": "MONDAY", "startTime": "08:00", "endTime": "09:30" },
    "b": { "id": "...", "dayOfWeek": "MONDAY", "startTime": "09:00", "endTime": "10:30" }
  }
]
```

### GET /api/v1/timetable/{id}
**Response:**
```json
{
  "id": "...",
  "classSection": { "id": "...", "name": "1A" },
  "subject": { "id": "...", "name": "Mathematics" },
  "teacher": { "id": "...", "firstName": "Ama", "lastName": "Owusu" },
  "dayOfWeek": "MONDAY",
  "startTime": "08:00",
  "endTime": "09:30",
  "room": "Room 12"
}
```

### PUT /api/v1/timetable/{id}
**Request Body:**
```json
{
  "classId": "class_uuid",
  "subjectId": "subject_uuid",
  "teacherId": "teacher_uuid",
  "dayOfWeek": "MONDAY",
  "startTime": "08:00",
  "endTime": "09:30",
  "room": "Room 12"
}
```
**Response:** Updated timetable entry object

### DELETE /api/v1/timetable/{id}
**Response:** `{ "success": true }`

### PATCH /api/v1/grading/entries/{id}/lock
**Response:**
```json
{
  "id": "...",
  "isLocked": true,
  "lockedAt": "2024-01-15T10:00:00Z",
  "lockedById": "..."
}
```

### PATCH /api/v1/grading/entries/{id}/approve
**Response:**
```json
{
  "id": "...",
  "isApproved": true,
  "approvedAt": "2024-01-15T10:00:00Z",
  "approvedById": "..."
}
```

### POST /api/v1/grading/entries/bulk-approve
**Request Body:**
```json
["entry_uuid1", "entry_uuid2"]
```
**Response:**
```json
{ "approvedCount": 5 }
```

### GET /api/v1/grading/smart-remarks/{grade}
**Response:**
```json
{
  "grade": "A",
  "remarks": ["Excellent work", "Outstanding performance", "Keep it up!"]
}
```

### POST /api/v1/reports/report-cards/generate
**Response:**
```json
{
  "id": "...",
  "studentId": "...",
  "termId": "...",
  "pdfUrl": "...",
  "generatedAt": "2024-01-15T10:00:00Z",
  "releasedAt": null
}
```

### POST /api/v1/reports/report-cards/batch
**Response:**
```json
{ "generatedCount": 45, "failedCount": 0 }
```

### POST /api/v1/reports/transcripts/generate
**Response:**
```json
{
  "id": "...",
  "studentId": "...",
  "indexNumber": "MSHTS/2024/001",
  "pdfUrl": "...",
  "generatedAt": "2024-01-15T10:00:00Z",
  "purpose": "University Application"
}
```

### POST /api/v1/archive/promote
**Response:**
```json
{
  "academicYear": "2024/2025",
  "totalProcessed": 450,
  "promoted": 400,
  "graduated": 50
}
```

### GET /api/v1/archive/vault/search
**Query Parameters:** `indexNumber`, `firstName`, `lastName`, `academicYearId`, `classLevel` (optional)
**Response:**
```json
[
  {
    "id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "indexNumber": "MSHTS/2024/001",
    "grades": [
      {
        "subject": { "name": "Mathematics" },
        "term": { "termNumber": "TERM_1", "academicYear": { "label": "2024/2025" } },
        "totalScore": 80,
        "grade": "A"
      }
    ],
    "promotions": [...]
  }
]
```

### PATCH /api/v1/archive/terms/{id}/lock
**Response:**
```json
{
  "id": "...",
  "isLocked": true
}
```

### GET /api/v1/archive/health
**Response:**
```json
{
  "status": "healthy",
  "checkedAt": "2024-01-15T10:00:00Z",
  "counts": {
    "totalStudents": 500,
    "activeStudents": 450,
    "archivedStudents": 50,
    "totalGrades": 12000,
    "totalReportCards": 2250,
    "totalTranscripts": 150,
    "pendingObservations": 25
  }
}
```

### POST /api/v1/comms/notify
**Response:**
```json
{ "sentCount": 45, "failedCount": 0 }
```

### POST /api/v1/comms/emergency
**Response:**
```json
{ "deliveredCount": 120, "failedCount": 2, "message": "Emergency broadcast sent" }
```

### GET /api/v1/comms/notifications/{studentId}
**Query Parameters:** `unreadOnly` (optional boolean)
**Response:**
```json
[
  {
    "id": "...",
    "title": "Term Results Ready",
    "body": "Your report card is available",
    "channel": "APP",
    "isRead": false,
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### PATCH /api/v1/comms/notifications/{id}/read
**Response:**
```json
{
  "id": "...",
  "isRead": true
}
```

### GET /api/v1/comms/analytics/pulse
**Response:**
```json
{
  "totalStudents": 450,
  "averageAttendance": 92.5,
  "pendingGrades": 12,
  "pendingObservations": 8,
  "activeInterventions": 5
}
```

### GET /api/v1/reports/verify/{hash}
**Response:**
```json
{
  "valid": true,
  "documentType": "REPORT_CARD",
  "student": { "indexNumber": "MSHTS/2024/001" },
  "term": { "termNumber": "TERM_1", "academicYear": { "label": "2024/2025" } }
}
```

### GET /api/v1/academic/years/active
**Response:**
```json
{
  "id": "...",
  "label": "2024/2025",
  "startDate": "2024-09-02T00:00:00Z",
  "endDate": "2025-07-31T00:00:00Z",
  "isActive": true,
  "terms": [
    { "id": "...", "termNumber": "TERM_1", "isActive": false }
  ]
}
```

### GET /api/v1/academic/departments
**Response:**
```json
[
  {
    "id": "...",
    "name": "Science",
    "code": "SCI",
    "description": "Science Department",
    "hodId": "..."
  }
]
```

### GET /api/v1/academic/subjects
**Response:**
```json
[
  {
    "id": "...",
    "name": "Core Mathematics",
    "code": "CMATH",
    "type": "CORE",
    "department": { "id": "...", "name": "Science" }
  }
]
```

### GET /api/v1/academic/classes
**Response:**
```json
[
  {
    "id": "...",
    "name": "1A",
    "level": "FORM_1",
    "capacity": 40,
    "classTeacher": { "id": "...", "firstName": "Ama", "lastName": "Owusu" }
  }
]
```