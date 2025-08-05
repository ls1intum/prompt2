export interface GradeDistributionDataPoint {
  shortLabel: string
  label: string
  average: number
  lowerQuartile: number
  median: number
  upperQuartile: number
  counts: Record<string, number>
}
