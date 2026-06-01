// Rich HOD Mock dataset representing both current student badges and graduated historical alumni - perfectly mirroring the Teacher's source dataset for truth consistency
export const mockHODAlumni = [
  {
    id: 't_s_f3_01',
    name: 'Kingsley Boateng',
    index: 'MAAIS-2026-F3-01',
    graduationYear: '2026',
    currentClass: 'SHS 3 Science A',
    department: 'Science',
    consistencyScore: 'High Steady',
    status: 'Archive Inbound',
    hodComment: 'Active student file. Past longitudinal cycles (Form 1 & 2) certified & sealed in registry.',
    finalWassce: 'Pending',
    history: [
      { term: 'SHS 1-T1', finalGrade: 78, behaviorRating: 4 },
      { term: 'SHS 1-T2', finalGrade: 80, behaviorRating: 5 },
      { term: 'SHS 1-T3', finalGrade: 83, behaviorRating: 5 },
      { term: 'SHS 2-T1', finalGrade: 81, behaviorRating: 4 },
      { term: 'SHS 2-T2', finalGrade: 85, behaviorRating: 4 },
      { term: 'SHS 2-T3', finalGrade: 87, behaviorRating: 5 }
    ],
    observations: [
      { id: 'obs_f3_1', date: '2025-05-12', type: 'Practicals', comment: 'Demonstrates exceptional grasp of laboratory preparation controls.', teacherName: 'Mr. Boateng' }
    ],
    interventions: []
  },
  {
    id: 't_s_f2_01',
    name: 'Priscilla Baah',
    index: 'MAAIS-2027-F2-01',
    graduationYear: '2027',
    currentClass: 'SHS 2 Science B',
    department: 'Science',
    consistencyScore: 'Steady Climb',
    status: 'Archive Inbound',
    hodComment: 'Active student file. First-year longitudinal cycle (Form 1) certified and sealed in registry.',
    finalWassce: 'Pending',
    history: [
      { term: 'SHS 1-T1', finalGrade: 70, behaviorRating: 4 },
      { term: 'SHS 1-T2', finalGrade: 73, behaviorRating: 4 },
      { term: 'SHS 1-T3', finalGrade: 75, behaviorRating: 5 }
    ],
    observations: [
      { id: 'obs_f2_1', date: '2024-11-10', type: 'Academic', comment: 'Resilient approach to soil chemistry theory.', teacherName: 'Mr. Appiah' }
    ],
    interventions: []
  },
  {
    id: 't_s_f1_01',
    name: 'Emmanuel Eshun',
    index: 'MAAIS-2028-F1-01',
    graduationYear: '2028',
    currentClass: 'SHS 1 Agric B',
    department: 'Science',
    consistencyScore: 'No Record',
    status: 'Empty Archive',
    hodComment: 'Active SHS 1 student. Historical record begins compiling upon completion of Form 1.',
    finalWassce: 'Building',
    history: [],
    observations: [],
    interventions: []
  },
  {
    id: 't_s01',
    name: 'Angela Owusu',
    index: 'MAAIS-2024-001',
    graduationYear: '2024',
    currentClass: 'Class of 2024 (Science)',
    department: 'Science',
    consistencyScore: 'High Steady',
    status: 'Archived & Verified',
    hodComment: 'Continuous assessment values audited. Certified successfully for terminal WAEC dispatch and archived in The Vault.',
    finalWassce: 'A1',
    history: [
      { term: 'SHS 1-T1', finalGrade: 85, behaviorRating: 5 },
      { term: 'SHS 1-T2', finalGrade: 88, behaviorRating: 5 },
      { term: 'SHS 1-T3', finalGrade: 90, behaviorRating: 4 },
      { term: 'SHS 2-T1', finalGrade: 82, behaviorRating: 4 },
      { term: 'SHS 2-T2', finalGrade: 78, behaviorRating: 3 },
      { term: 'SHS 2-T3', finalGrade: 92, behaviorRating: 5 },
      { term: 'SHS 3-T1', finalGrade: 90, behaviorRating: 5 },
      { term: 'SHS 3-T2', finalGrade: 89, behaviorRating: 5 },
      { term: 'SHS 3-T3', finalGrade: 94, behaviorRating: 5 }
    ],
    observations: [
      { id: 'obs1', date: '2024-03-15', type: 'Lab Safety', comment: 'Excellent handling of agricultural soil testing equipment.', teacherName: 'Mr. Boateng' },
      { id: 'obs2', date: '2024-06-10', type: 'Behavioral', comment: 'Active leader in our hands-on field experiments.', teacherName: 'Mrs. Mensah' }
    ],
    interventions: [
      { 
        id: 'int1', 
        term: 'SHS 2-T2', 
        year: '2023', 
        reason: 'Decline in practical exams', 
        action: 'Assigned to remedial microscope drills', 
        outcome: 'Practical assessment score improved by 14% peak' 
      }
    ]
  },
  {
    id: 't_s02',
    name: 'Samuel Larbi Owusu',
    index: 'MAAIS-2024-002',
    graduationYear: '2024',
    currentClass: 'Class of 2024 (Science)',
    department: 'Science',
    consistencyScore: 'Steady Climb',
    status: 'Archived & Verified',
    hodComment: 'Qualitative diaries resolved. Transcripts locked under final compliance guidelines.',
    finalWassce: 'B2',
    history: [
      { term: 'SHS 1-T1', finalGrade: 51, behaviorRating: 3 },
      { term: 'SHS 1-T2', finalGrade: 55, behaviorRating: 4 },
      { term: 'SHS 1-T3', finalGrade: 58, behaviorRating: 4 },
      { term: 'SHS 2-T1', finalGrade: 62, behaviorRating: 4 },
      { term: 'SHS 2-T2', finalGrade: 68, behaviorRating: 5 },
      { term: 'SHS 2-T3', finalGrade: 72, behaviorRating: 5 },
      { term: 'SHS 3-T1', finalGrade: 75, behaviorRating: 5 },
      { term: 'SHS 3-T2', finalGrade: 78, behaviorRating: 5 },
      { term: 'SHS 3-T3', finalGrade: 82, behaviorRating: 5 }
    ],
    observations: [
      { id: 'obs3', date: '2023-11-20', type: 'Resource Economy', comment: 'Strong leadership improvements and stellar lab report writing.', teacherName: 'Mr. Appiah' }
    ],
    interventions: [
      { 
        id: 'int2', 
        term: 'SHS 1-T3', 
        year: '2022', 
        reason: 'Initial average below 60%', 
        action: 'Mandatory clinical study hall', 
        outcome: 'Began progressive upwards transition over remaining periods' 
      }
    ]
  },
  {
    id: 't_s03',
    name: 'Esmeralda Kyeiwaa',
    index: 'MAAIS-2023-001',
    graduationYear: '2023',
    currentClass: 'Class of 2023 (Science)',
    department: 'Science',
    consistencyScore: 'Highly Stable',
    status: 'Archived & Verified',
    hodComment: 'Stellar academic posture sustained. Verified clear by department. Transcripts frozen.',
    finalWassce: 'A1',
    history: [
      { term: 'SHS 1-T1', finalGrade: 89, behaviorRating: 5 },
      { term: 'SHS 1-T2', finalGrade: 91, behaviorRating: 5 },
      { term: 'SHS 1-T3', finalGrade: 90, behaviorRating: 5 },
      { term: 'SHS 2-T1', finalGrade: 93, behaviorRating: 5 },
      { term: 'SHS 2-T2', finalGrade: 92, behaviorRating: 5 },
      { term: 'SHS 2-T3', finalGrade: 94, behaviorRating: 5 },
      { term: 'SHS 3-T1', finalGrade: 95, behaviorRating: 5 },
      { term: 'SHS 3-T2', finalGrade: 96, behaviorRating: 5 },
      { term: 'SHS 3-T3', finalGrade: 95, behaviorRating: 5 }
    ],
    observations: [
      { id: 'obs_e1', date: '2023-04-12', type: 'Academic Drive', comment: 'Stellar performance throughout the physics lab series.', teacherName: 'Mr. Appiah' }
    ],
    interventions: []
  },
  {
    id: 't_s04',
    name: 'Kwame Mensah',
    index: 'MAAIS-2023-002',
    graduationYear: '2023',
    currentClass: 'Class of 2023 (Agric Science)',
    department: 'Science',
    consistencyScore: 'Recovered',
    status: 'Archived & Verified',
    hodComment: 'Board certified. Satisfied and cleared academic requirements with remarkable perseverance.',
    finalWassce: 'B3',
    history: [
      { term: 'SHS 1-T1', finalGrade: 45, behaviorRating: 3 },
      { term: 'SHS 1-T2', finalGrade: 48, behaviorRating: 3 },
      { term: 'SHS 1-T3', finalGrade: 42, behaviorRating: 3 },
      { term: 'SHS 2-T1', finalGrade: 55, behaviorRating: 4 },
      { term: 'SHS 2-T2', finalGrade: 60, behaviorRating: 4 },
      { term: 'SHS 2-T3', finalGrade: 65, behaviorRating: 4 },
      { term: 'SHS 3-T1', finalGrade: 68, behaviorRating: 5 },
      { term: 'SHS 3-T2', finalGrade: 72, behaviorRating: 5 },
      { term: 'SHS 3-T3', finalGrade: 75, behaviorRating: 5 }
    ],
    observations: [
      { id: 'obs4', date: '2022-11-20', type: 'Safety First', comment: 'Constant growth and adherence to chemistry safety measures.', teacherName: 'Mr. Appiah' }
    ],
    interventions: [
      { 
        id: 'int3', 
        term: 'SHS 1-T3', 
        year: '2021', 
        reason: 'Weighted Average below 45%', 
        action: 'Mandatory clinical study hall', 
        outcome: 'Began upward transition over next three periods' 
      }
    ]
  }
];