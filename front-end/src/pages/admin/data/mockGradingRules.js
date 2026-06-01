export const DEFAULT_REMARK_POOL = {
  Distinction: ['Exceptional performance.', 'Outstanding academic rigor.', 'A masterclass in the subject.'],
  Credit: ['Good work, stay focused.', 'Solid performance with room for growth.', 'Commendable effort.'],
  Pass: ['Satisfactory, but needs more practice.', 'Meeting minimum requirements.', 'Steady progress.'],
  Fail: ['Requires urgent intervention.', 'Inadequate mastery of concepts.', 'Needs intensive remedial support.']
};

export const DEFAULT_BOUNDARIES = [
  { id: '1', min: 80, max: 100, grade: 'A1', remark: 'Excellent: Exceptional performance in all components.', suggestionPool: DEFAULT_REMARK_POOL.Distinction },
  { id: '2', min: 70, max: 79, grade: 'B2', remark: 'Very Good: Highly commendable effort and focus.', suggestionPool: DEFAULT_REMARK_POOL.Distinction },
  { id: '3', min: 65, max: 69, grade: 'B3', remark: 'Good: Solid understanding of core concepts.', suggestionPool: DEFAULT_REMARK_POOL.Credit },
  { id: '4', min: 60, max: 64, grade: 'C4', remark: 'Credit: Satisfactory performance with consistent results.', suggestionPool: DEFAULT_REMARK_POOL.Credit },
  { id: '5', min: 55, max: 59, grade: 'C5', remark: 'Credit: Can do better with more effort.', suggestionPool: DEFAULT_REMARK_POOL.Credit },
  { id: '6', min: 50, max: 54, grade: 'C6', remark: 'Credit: Average performance; needs steady improvement.', suggestionPool: DEFAULT_REMARK_POOL.Credit },
  { id: '7', min: 45, max: 49, grade: 'D7', remark: 'Pass: Meeting minimum standards for the subject.', suggestionPool: DEFAULT_REMARK_POOL.Pass },
  { id: '8', min: 40, max: 44, grade: 'E8', remark: 'Pass: Weak performance; requires reinforcement.', suggestionPool: DEFAULT_REMARK_POOL.Pass },
  { id: '9', min: 0, max: 39, grade: 'F9', remark: 'Fail: Poor performance; remedial sessions highly recommended.', suggestionPool: DEFAULT_REMARK_POOL.Fail },
];

export const SYSTEM_WARNINGS = [
  { msg: '7 Subject Classes have unentered CA marks.', severity: 'high' },
  { msg: 'WASSCE Boundary calibration differs from 2025 standard.', severity: 'low' },
  { msg: 'Normalisation active for raw marks (Base 100).', severity: 'info' }
];