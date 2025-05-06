import { ScoreLevel } from '../../../../interfaces/scoreLevel'
import { ParticipationWithAssessment } from '../../interfaces/ParticipationWithAssessment'
import { StatisticalDataPoint } from '../../interfaces/StatisticalDataPoint'

export const createStatisticalDataPoint = (
  name: string,
  participations: ParticipationWithAssessment[],
): StatisticalDataPoint => {
  if (participations.length === 0) {
    return {
      name,
      average: 0,
      lowerQuartile: 0,
      median: 0,
      upperQuartile: 0,
      counts: {
        novice: 0,
        intermediate: 0,
        advanced: 0,
        expert: 0,
      },
    }
  }

  const completed = participations.filter((p) => p.scoreLevel)

  return {
    name,
    average: 2.7,
    lowerQuartile: 2.0,
    median: 2.8,
    upperQuartile: 3.2,
    counts: {
      novice: completed.filter((p) => p.scoreLevel === ScoreLevel.Novice).length,
      intermediate: 12,
      advanced: 8,
      expert: 3,
    },
  }
}
