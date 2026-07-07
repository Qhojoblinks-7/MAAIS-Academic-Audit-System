// Shared default subject grading configuration.
// Extracted from TeacherGradingView so route-level code-splitting does not
// drag the entire grading page into the initial bundle.
export const SUBJECT_CONFIG = {
  'General Agriculture': {
    sections: ['Paper 1 (50)', 'Paper 2-Agri (90)', 'Paper 3-Pract (60)'],
    maxRaw: 200, sectionCount: 3, hasPractical: true, practicalMarks: 60,
    sbaLabel: 'SBA (30%)', examLabel: 'Exam (70%)',
  },
  'Core Mathematics': {
    sections: ['Sec A (40)', 'Sec B (60)'],
    maxRaw: 100, sectionCount: 2, hasPractical: false, practicalMarks: 0,
    sbaLabel: 'SBA (30%)', examLabel: 'Exam (70%)',
  },
  'English Language': {
    sections: ['Sec A-Essay (50)', 'Sec B-Comp (20)', 'Sec C-Summary (30)'],
    maxRaw: 100, sectionCount: 3, hasPractical: false, practicalMarks: 0,
    sbaLabel: 'SBA (30%)', examLabel: 'Exam (70%)',
  },
  'Integrated Science': {
    sections: ['Sec A (40)', 'Sec B (60)'],
    maxRaw: 100, sectionCount: 2, hasPractical: false, practicalMarks: 0,
    sbaLabel: 'SBA (30%)', examLabel: 'Exam (70%)',
  },
  'Social Studies': {
    sections: ['Sec A (40)', 'Sec B (60)'],
    maxRaw: 100, sectionCount: 2, hasPractical: false, practicalMarks: 0,
    sbaLabel: 'SBA (30%)', examLabel: 'Exam (70%)',
  },
  'Mathematics': {
    sections: ['Sec A (40)', 'Sec B (60)'],
    maxRaw: 100, sectionCount: 2, hasPractical: false, practicalMarks: 0,
    sbaLabel: 'SBA (30%)', examLabel: 'Exam (70%)',
  },
  'Woodwork': {
    sections: ['Marking out (25)', 'Assembly (30)', 'Finishing (25)'],
    maxRaw: 80, sectionCount: 3, hasPractical: true, practicalMarks: 80,
    sbaLabel: 'SBA (30%)', examLabel: 'Exam (70%)',
  },
  'Metalwork': {
    sections: ['Marking out (25)', 'Assembly (30)', 'Finishing (25)'],
    maxRaw: 80, sectionCount: 3, hasPractical: true, practicalMarks: 80,
    sbaLabel: 'SBA (30%)', examLabel: 'Exam (70%)',
  },
  'Technical Drawing': {
    sections: ['Geometric Construction (50)', 'Projection (50)'],
    maxRaw: 100, sectionCount: 2, hasPractical: true, practicalMarks: 100,
    sbaLabel: 'SBA (30%)', examLabel: 'Exam (70%)',
  },
  'Auto Mechanics': {
    sections: ['Engine Systems (35)', 'Diagnostics (35)', 'Practical Task (30)'],
    maxRaw: 100, sectionCount: 3, hasPractical: true, practicalMarks: 100,
    sbaLabel: 'SBA (30%)', examLabel: 'Exam (70%)',
  },
  'Electrical': {
    sections: ['Circuit Construction (40)', 'Wiring (30)', 'Testing (30)'],
    maxRaw: 100, sectionCount: 3, hasPractical: true, practicalMarks: 100,
    sbaLabel: 'SBA (30%)', examLabel: 'Exam (70%)',
  },
};
