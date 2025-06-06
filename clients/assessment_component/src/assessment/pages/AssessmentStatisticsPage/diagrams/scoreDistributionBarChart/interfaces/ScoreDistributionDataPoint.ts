import { ScoreLevel } from '../../../../../interfaces/scoreLevel'

export interface ScoreDistributionDataPoint {
  shortLabel: string
  label: string
  average: number
  lowerQuartile: number
  median: ScoreLevel
  upperQuartile: number
  counts: Record<string, number>
}
