export interface SkillCounts {
  novice: number
  intermediate: number
  advanced: number
  expert: number
}

export interface StatisticalDataPoint {
  name: string
  average: number
  lowerQuartile: number
  median: number
  upperQuartile: number
  counts: SkillCounts
}
