export const mockDepartments = [
  { 
    id: '1', 
    name: 'Science', 
    hodName: 'Samuel Boateng', 
    hodId: 'STF-003', 
    teacherCount: 14, 
    description: 'Core and Elective Science nodes including Physics, Biology, and Chemistry.', 
    validationStatus: 85, 
    color: 'bg-blue-500',
    iconColor: 'text-blue-600',
    programs: ['General Science', 'Agricultural Science'],
    staff: [
      { id: 'STF-003', name: 'Samuel Boateng', role: 'Senior Physics Tutor', isHOD: true },
      { id: 'STF-010', name: 'Dr. Mensah', role: 'Biology Lead', isHOD: false },
      { id: 'STF-011', name: 'Kwadwo Asare', role: 'Chemistry Specialist', isHOD: false },
    ]
  },
  { 
    id: '2', 
    name: 'Mathematics', 
    hodName: 'Elizabeth Osei', 
    hodId: 'STF-006', 
    teacherCount: 12, 
    description: 'Core Mathematics and Elective Mathematics institutional units.', 
    validationStatus: 100, 
    color: 'bg-emerald-500',
    iconColor: 'text-emerald-600',
    programs: ['All Programs'],
    staff: [
      { id: 'STF-006', name: 'Elizabeth Osei', role: 'Core Math Lead', isHOD: true },
      { id: 'STF-012', name: 'Isaac Tetteh', role: 'Elective Math Tutor', isHOD: false },
    ]
  },
  { 
    id: '3', 
    name: 'Languages', 
    hodName: 'John Mensah', 
    hodId: 'STF-005', 
    teacherCount: 18, 
    description: 'English, French, and local dialect linguistic nodes.', 
    validationStatus: 45, 
    color: 'bg-purple-500',
    iconColor: 'text-purple-600',
    programs: ['All Programs'],
    staff: [
      { id: 'STF-005', name: 'John Mensah', role: 'English Literature Node', isHOD: true },
    ]
  },
  { 
    id: '4', 
    name: 'Business', 
    hodName: 'Anthony Hackman', 
    hodId: 'STF-001', 
    teacherCount: 10, 
    description: 'Accounting, Business Management, and Costing nodes.', 
    validationStatus: 70, 
    color: 'bg-amber-500',
    iconColor: 'text-amber-600',
    programs: ['Business'],
    staff: [
       { id: 'STF-001', name: 'Anthony Hackman', role: 'Accounting Lead', isHOD: true },
    ]
  },
];

export const distributionData = [
  { name: 'Science', teachers: 14 },
  { name: 'Math', teachers: 12 },
  { name: 'Languages', teachers: 18 },
  { name: 'Business', teachers: 10 },
  { name: 'Vocational', teachers: 6 },
];