# Teacher Dashboard - Functional Specification

## 1. Overview

### 1.1 Purpose
Design a scalable teacher dashboard that displays individual subject/class cards based on teacher assignments, enabling navigation to subject-specific grading sheets or class broadsheets.

### 1.2 Scope
Platform-wide functionality supporting all subjects and teachers across the educational management system.

---

## 2. User Stories

### 2.1 As a Teacher
- I want to see all my assigned classes at a glance
- I want to click on any class to enter marks or view results
- I want the grading sheet to be specific to the subject's scoring criteria
- I want to view a broadsheet summary for my class

---

## 3. Core Features

### 3.1 Dashboard Layout
```
[Header: Welcome Message + Quick Stats]
[Grid of Class Cards]
  ├─ Subject + Form/Stream (e.g., "Core Maths - SHS 1 Business A")
  ├─ Student Count
  ├─ Progress Indicator (%)
  ├─ Status Badge (Draft/In Progress/Submitted)
  └─ Programmatic Color Coding
```

### 3.2 Class Card Component
**Props:**
- `subject`: string (e.g., "Core Maths")
- `className`: string (e.g., "SHS 1 Business A")
- `form`: string (e.g., "SHS 1")
- `stream`: string (e.g., "Business A")
- `studentCount`: number
- `progress`: number (0-100)
- `status`: "draft" | "in-progress" | "submitted"
- `hasRevision`: boolean
- `hasMissingObservation`: boolean
- `onClick`: navigation handler

### 3.3 Navigation Flow
```
Dashboard → Class Card Click → GradingSheet.jsx
                                    ├─ Subject-specific route: /grading?subject=core-maths&class=shs1-business-a
                                    ├─ Displays appropriate grading template
                                    └─ Shows student roster for that class
```

---

## 4. Data Models

### 4.1 TeacherAssignment
```javascript
{
  teacherId: string,
  academicYear: string,
  assignments: [
    {
      id: "subject-class-id",     // Unique composite key
      subjectId: "subj-001",      // Links to subject master
      subjectName: "Core Maths",
      classId: "class-001",       // Links to class master
      className: "Business A",
      form: "SHS 1",
      stream: "A",
      studentCount: 42,
      programme: "BUSINESS"
    }
  ]
}
```

### 4.2 SubjectDefinition
```javascript
{
  id: "core-maths",
  name: "Core Mathematics",
  category: "Core",              // Core | Elective | Technical
  scorableComponents: ["sba", "exam"], // SBA (30%), Exam (70%)
  maxSbaScore: 30,
  maxExamScore: 70,
  gradeThresholds: {
    A1: { min: 75 }, B2: { min: 70 }, B3: { min: 65 },
    C4: { min: 60 }, C5: { min: 55 }, C6: { min: 50 },
    D7: { min: 45 }, E8: { min: 40 }
  }
}
```

### 4.3 ClassRoster
```javascript
{
  classId: "shs1-business-a",
  students: [
    {
      id: "stu-001",
      index: "001",
      name: "Angela Owusu",
      subjects: ["Core Maths", "English", "..."] // All registered
    }
  ]
}
```

---

## 5. Routing Structure

### 5.1 Dashboard Routes
```
/teacher/dashboard          → Main dashboard (all classes)
/grading                    → Grading sheet (via class card click)
/grading?subject={id}&class={id} → Subject-class specific view
/broadsheet?class={id}      → Class performance overview
```

### 5.2 URL Parameters
- `subject`: Subject identifier (e.g., "core-maths", "agriculture")
- `class`: Class identifier (e.g., "shs1-business-a")
- `view`: "grading" | "broadsheet"

---

## 6. Component Architecture

### 6.1 Dashboard.jsx
```jsx
// Data fetching
const assignments = useTeacherAssignments(teacherId);

// Render grid
<div className="grid grid-cols-2 gap-6">
  {assignments.map(cls => (
    <ClassCard 
      key={cls.id}
      {...cls}
      onClick={() => navigate(`/grading?subject=${cls.subjectId}&class=${cls.classId}`)}
    />
  ))}
</div>
```

### 6.2 GradingSheet.jsx (Enhanced)
```jsx
// Read URL params
const queryParams = new URLSearchParams(location.search);
const subjectId = queryParams.get('subject');
const classId = queryParams.get('class');

// Fetch subject-specific data
const subjectDef = SUBJECT_DEFINITIONS[subjectId];
const classRoster = useClassRoster(classId);

// Render appropriate template
<ScoringTemplate subject={subjectDef} />
<StudentTable students={classRoster.students} />
```

---

## 7. Scoring Templates by Subject Type

### 7.1 Core Subjects (English, Math, Science, Social)
- **Paper 1**: Objective (Multiple Choice) - contributes to SBA (30%)
- **Paper 2 Section A**: Compulsory elementary questions (e.g., Math: 5 questions/40 marks, English: Essay/50 marks, Social: 5 questions/40 marks)
- **Paper 2 Section B**: Longer/difficult questions (e.g., Math: answer 5/60 marks, English: Comprehension/20 + Summary/30)
- Total Exam (70%): Derived from internal assessment

### 7.2 Technical Subjects (Auto Mech, Woodwork, etc.)
- SBA (30%) + Practical/Theory Exam (70%)
- Components: Project, Written, Oral

### 7.3 Vocational Subjects (Home Econ, Visual Arts)
- SBA (30%) + Theory/Practical (70%)
- Components: Project Work, Portfolio, Exam

---

## 8. Scalability Requirements

### 8.1 New Subject Addition
1. Add to `SUBJECT_DEFINITIONS` config
2. Define `scorableComponents` and `gradeThresholds`
3. No code changes needed in components

### 8.2 New Teacher Assignment
1. Admin assigns subject-class via `TeacherAssignment` model
2. Dashboard automatically displays new card
3. All functionality inherits from subject definition

### 8.3 Multi-Term Support
```javascript
// Term-aware routing
/grading?subject={id}&class={id}&term=1
```

---

## 9. Technical Implementation

### 9.1 State Management
```javascript
// Context for current class/subject
const ClassContext = createContext({
  subject: null,
  class: null,
  students: [],
  updateMark: (studentId, field, value) => {}
});
```

### 9.2 API Endpoints (Proposed)
```
GET /api/teacher/{id}/assignments
GET /api/subject/{id}/definition
GET /api/class/{id}/roster
POST /api/grade/update
POST /api/stp/validate
```

---

## 10. UI/UX Specifications

### 10.1 Progress Indicators
- 0-49%: Red/Orange (Draft)
- 50-99%: Yellow (In Progress)
- 100%: Green (Completed)

### 10.2 Status Badges
- **Submitted**: Finalized, no edits
- **In Review**: Has revisions to address
- **Missing**: Observations incomplete

### 10.3 Responsive Grid
- Large screens: 4 cards per row
- Medium: 2-3 cards per row
- Mobile: 1 card per row

---

## 11. Validation & Error Handling

### 11.1 STP Validation Rules
- Final score ≤ 100%
- SBA ≤ 30%
- Exam ≤ 70%
- All students have minimum 7 subjects
- Required observations logged

### 11.2 Error States
- Missing assignments: "No classes assigned"
- Data fetch failure: Retry option
- Invalid class: Redirect to dashboard

---

## 12. Future Extensions

### 12.1 Bulk Operations
- Copy marks between terms
- Apply grade templates
- Import from CSV

### 12.2 Analytics Integration
- Class performance trends
- Subject comparison
- STP compliance dashboard