// Valid grade values used throughout the application
export const VALID_GRADE_VALUES = [1.0, 1.3, 1.7, 2.0, 2.3, 2.7, 3.0, 3.3, 3.7, 4.0, 5.0] as const

// Grade type for type safety
export type GradeValue = (typeof VALID_GRADE_VALUES)[number]

// Chart configuration for recharts components
export const GRADE_CHART_CONFIG = {
  '1.0': { label: '1.0', color: '#60a5fa' },
  '1.3': { label: '1.3', color: '#93c5fd' },
  '1.7': { label: '1.7', color: '#4ade80' },
  '2.0': { label: '2.0', color: '#86efac' },
  '2.3': { label: '2.3', color: '#bbf7d0' },
  '2.7': { label: '2.7', color: '#fef08a' },
  '3.0': { label: '3.0', color: '#fde68a' },
  '3.3': { label: '3.3', color: '#fcd34d' },
  '3.7': { label: '3.7', color: '#fb923c' },
  '4.0': { label: '4.0', color: '#f97316' },
  '5.0': { label: '5.0', color: '#fca5a5' },
  'No Grade': { label: 'No Grade', color: '#d4d4d8' },
}

// Utility function to get color for a specific grade
export const getGradeColor = (grade: number): string => {
  // Find the nearest upper value in VALID_GRADE_VALUES
  const gradeKey =
    VALID_GRADE_VALUES.find((validGrade) => grade <= validGrade)?.toFixed(1) || 'No Grade'
  return GRADE_CHART_CONFIG[gradeKey]?.color || '#d4d4d8' // gray-300 as fallback
}

// Utility function to check if a grade is valid
export const isValidGrade = (grade: number): grade is GradeValue => {
  return VALID_GRADE_VALUES.includes(grade as GradeValue)
}

// Grade range constants
export const GRADE_RANGE = {
  MIN: 1.0,
  MAX: 5.0,
  TOTAL_RANGE: 4.0, // 5.0 - 1.0
} as const
