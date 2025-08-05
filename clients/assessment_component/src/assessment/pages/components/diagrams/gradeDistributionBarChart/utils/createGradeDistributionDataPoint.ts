import { GradeDistributionDataPoint } from '../interfaces/GradeDistributionDataPoint'
import { VALID_GRADE_VALUES } from '../../../../utils/gradeConfig'

export const createGradeDistributionDataPoint = (
  shortLabel: string,
  label: string,
  grades: number[],
): GradeDistributionDataPoint => {
  const sortedGrades = [...grades].sort((a, b) => a - b)

  if (grades.length === 0) {
    const emptyCounts = VALID_GRADE_VALUES.reduce(
      (acc, grade) => {
        acc[grade.toFixed(1)] = 0
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      shortLabel,
      label,
      average: 0,
      lowerQuartile: 0,
      median: 0,
      upperQuartile: 0,
      counts: emptyCounts,
    }
  }

  const average = sortedGrades.reduce((sum, grade) => sum + grade, 0) / sortedGrades.length

  const computeQuartile = (sGrades: number[], quartile: number): number => {
    const pos = (sGrades.length - 1) * quartile
    const base = Math.floor(pos)
    const rest = pos - base

    const gradeBase = sGrades[base]
    const gradeNext = sGrades[base + 1] ? sGrades[base + 1] : gradeBase

    return gradeBase + rest * (gradeNext - gradeBase)
  }

  // Count occurrences of each grade
  const counts = VALID_GRADE_VALUES.reduce(
    (acc, gradeValue) => {
      const count = grades.filter((grade) => Math.abs(grade - gradeValue) < 0.01).length
      acc[gradeValue.toFixed(1)] = count
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    shortLabel,
    label,
    average,
    lowerQuartile: computeQuartile(sortedGrades, 0.25),
    median: sortedGrades[Math.floor(sortedGrades.length / 2)],
    upperQuartile: computeQuartile(sortedGrades, 0.75),
    counts,
  }
}
