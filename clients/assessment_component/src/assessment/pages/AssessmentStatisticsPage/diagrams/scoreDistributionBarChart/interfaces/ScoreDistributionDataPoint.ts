import { ScoreLevel } from '../../../../../interfaces/scoreLevel'

export interface SkillCounts {
  novice: number
  intermediate: number
  advanced: number
  expert: number
}

export interface ScoreDistributionDataPoint {
  shortLabel: string
  label: string
  average: number
  lowerQuartile: number
  median: ScoreLevel
  upperQuartile: number
  counts: SkillCounts
}
