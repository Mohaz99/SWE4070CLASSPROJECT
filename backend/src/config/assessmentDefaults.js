/**
 * Default maximum scores for different assessment types
 * These values are used when creating or updating assessments
 */
const ASSESSMENT_DEFAULTS = {
  // Case-insensitive matching for assessment names
  'assignment': 10,
  'assignments': 10,
  'quiz': 15,
  'quizzes': 15,
  'project': 25,
  'projects': 25,
  'midsem': 20,
  'mid-sem': 20,
  'mid-semester': 20,
  'midsemester': 20,
  'endsem': 30,
  'end-sem': 30,
  'end-semester': 30,
  'endsemester': 30,
  'final': 30,
  'final exam': 30
};

/**
 * Get the default maxScore for an assessment type based on its name
 * @param {string} assessmentName - The name of the assessment
 * @returns {number|null} - The default maxScore or null if no default exists
 */
const getDefaultMaxScore = (assessmentName) => {
  if (!assessmentName) return null;
  
  const normalizedName = assessmentName.toLowerCase().trim();
  return ASSESSMENT_DEFAULTS[normalizedName] || null;
};

/**
 * Apply default maxScores to assessments if they are not provided
 * @param {Array} assessments - Array of assessment objects with name, weight, and optionally maxScore
 * @returns {Array} - Array of assessments with maxScores applied
 */
const applyAssessmentDefaults = (assessments) => {
  if (!Array.isArray(assessments)) {
    return assessments;
  }

  return assessments.map(assessment => {
    // If maxScore is already provided, use it
    if (assessment.maxScore !== undefined && assessment.maxScore !== null) {
      return assessment;
    }

    // Otherwise, try to get default from assessment name
    const defaultMaxScore = getDefaultMaxScore(assessment.name);
    if (defaultMaxScore !== null) {
      return {
        ...assessment,
        maxScore: defaultMaxScore
      };
    }

    // If no default found, return as-is (will need to be provided manually)
    return assessment;
  });
};

module.exports = {
  ASSESSMENT_DEFAULTS,
  getDefaultMaxScore,
  applyAssessmentDefaults
};


