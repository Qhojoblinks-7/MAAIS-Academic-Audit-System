export const GRADE_POINTS = {
  'A1': 4.0,
  'B2': 3.5,
  'B3': 3.0,
  'C4': 2.5,
  'C5': 2.0,
  'C6': 1.5,
  'D7': 1.0,
  'E8': 0.5,
  'F9': 0.0,
};

export const CREDIT_HOURS = {
  'Core': 1,
  'Elective': 1,
  'Science': 1,
  'Mathematics': 1,
  'English': 1,
};

/**
 * Calculate GPA for a single student based on their grades and subject credits.
 * Assumes all subjects have equal weight (1 credit each) if credits not provided.
 * @param {Array<{grade: string, credits?: number}>} subjects - Array of subject objects with grade and optional credits
 * @returns {number} GPA rounded to 2 decimal places
 */
export function calculateGPA(subjects) {
  if (!subjects || subjects.length === 0) return 0.0;

  let totalPoints = 0;
  let totalCredits = 0;

  subjects.forEach(subject => {
    const gradePoint = GRADE_POINTS[subject.grade] || 0.0;
    const credits = subject.credits || 1;
    totalPoints += gradePoint * credits;
    totalCredits += credits;
  });

  return totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0.0;
}

/**
 * Calculate CGPA (Cumulative GPA) for a student across multiple terms.
 * @param {Array<{termGPA: number, termCredits: number}>} terms - Array of term objects with GPA and credits
 * @returns {number} CGPA rounded to 2 decimal places
 */
export function calculateCGPA(terms) {
  if (!terms || terms.length === 0) return 0.0;

  let totalPoints = 0;
  let totalCredits = 0;

  terms.forEach(term => {
    totalPoints += term.termGPA * term.termCredits;
    totalCredits += term.termCredits;
  });

  return totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0.0;
}

/**
 * Calculate class ranking for students based on GPA.
 * @param {Array<{id: string, gpa: number}>} students - Array of student objects with GPA
 * @returns {Array<{id: string, rank: number, percentile: number}>} Students with ranking info
 */
export function calculateClassRanking(students) {
  if (!students || students.length === 0) return [];
  
  const sorted = [...students].sort((a, b) => b.gpa - a.gpa);
  let currentRank = 1;
  let currentGPA = null;
  let rankCount = 0;
  
  return sorted.map((student, idx) => {
    if (student.gpa !== currentGPA) {
      currentRank = idx + 1;
      rankCount = 1;
      currentGPA = student.gpa;
    } else {
      rankCount++;
    }
    
    return {
      id: student.id,
      rank: currentRank,
      percentile: Math.round((1 - (currentRank - 1) / students.length) * 100),
      tieCount: rankCount > 1 ? rankCount : undefined
    };
  });
}

/**
 * Calculate trend direction and magnitude for student GPA over time.
 * @param {Array<{term: string, gpa: number}>} termHistory - Array of GPA data by term
 * @returns {{trend: 'improving'|'declining'|'stable', change: number, slope: number}}
 */
export function calculateGPATrend(termHistory) {
  if (!termHistory || termHistory.length < 2) {
    return { trend: 'stable', change: 0, slope: 0 };
  }
  
  const sorted = [...termHistory].sort((a, b) => 
    new Date(a.term).getTime() - new Date(b.term).getTime()
  );
  
  const firstGPA = sorted[0].gpa;
  const lastGPA = sorted[sorted.length - 1].gpa;
  const change = lastGPA - firstGPA;
  const slope = change / (sorted.length - 1);
  
  let trend = 'stable';
  if (change >= 0.3) trend = 'improving';
  else if (change <= -0.3) trend = 'declining';
  
  return { trend, change: parseFloat(change.toFixed(2)), slope: parseFloat(slope.toFixed(3)) };
}

/**
 * Calculate cumulative statistics for a student's academic journey.
 * @param {Array<{term: string, gpa: number, credits: number}>} terms - Term data
 * @returns {{cgpa: number, totalCredits: number, bestTerm: string, worstTerm: string}}
 */
export function calculateAcademicJourneyStats(terms) {
  if (!terms || terms.length === 0) {
    return { cgpa: 0, totalCredits: 0, bestTerm: null, worstTerm: null };
  }
  
  let totalPoints = 0;
  let totalCredits = 0;
  let bestTerm = terms[0];
  let worstTerm = terms[0];
  
  terms.forEach(term => {
    totalPoints += term.gpa * (term.credits || 1);
    totalCredits += term.credits || 1;
    
    if (term.gpa > bestTerm.gpa) bestTerm = term;
    if (term.gpa < worstTerm.gpa) worstTerm = term;
  });
  
  const cgpa = totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
  
  return {
    cgpa,
    totalCredits,
    bestTerm: bestTerm.term,
    worstTerm: worstTerm.term
  };
}

/**
 * Convert numeric grade point to letter grade (approximate)
 * @param {number} gpa - GPA value (0.0 to 4.0)
 * @returns {string} Approximate letter grade
 */
export function gpaToLetterGrade(gpa) {
  if (gpa >= 3.75) return 'A1';
  if (gpa >= 3.5) return 'B2';
  if (gpa >= 3.0) return 'B3';
  if (gpa >= 2.5) return 'C4';
  if (gpa >= 2.0) return 'C5';
  if (gpa >= 1.5) return 'C6';
  if (gpa >= 1.0) return 'D7';
  if (gpa >= 0.5) return 'E8';
  return 'F9';
}