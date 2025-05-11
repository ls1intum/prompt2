import { ScoreLevel, mapScoreLevelToNumber } from '../../../../interfaces/scoreLevel'
import { ParticipationWithAssessment } from '../../interfaces/ParticipationWithAssessment'
import { StatisticalDataPoint } from '../../interfaces/StatisticalDataPoint'

export const createStatisticalDataPoint = (
  name: string,
  participations: ParticipationWithAssessment[],
): StatisticalDataPoint => {
  const scoreLevels = participations
    .filter((p) => p.scoreLevel)
    .sort((a, b) => {
      const scoreA = mapScoreLevelToNumber({ score: a.scoreLevel ?? ScoreLevel.Novice })
      const scoreB = mapScoreLevelToNumber({ score: b.scoreLevel ?? ScoreLevel.Novice })
      return scoreA - scoreB
    })

  if (scoreLevels.length === 0) {
    return {
      name,
      average: 0,
      lowerQuartile: 0,
      median: ScoreLevel.Novice,
      upperQuartile: 0,
      counts: {
        novice: 0,
        intermediate: 0,
        advanced: 0,
        expert: 0,
      },
    }
  }

  const average =
    scoreLevels.reduce((sum, p) => {
      const score = mapScoreLevelToNumber({ score: p.scoreLevel ?? ScoreLevel.Novice })
      return sum + score
    }, 0) / scoreLevels.length

  const computeQuartile = (
    sortedScores: ParticipationWithAssessment[],
    quartile: number,
  ): number => {
    const pos = (sortedScores.length - 1) * quartile
    const base = Math.floor(pos)
    const rest = pos - base

    const scoreBase = mapScoreLevelToNumber({
      score: sortedScores[base].scoreLevel ?? ScoreLevel.Novice,
    })
    const scoreNext = sortedScores[base + 1]
      ? mapScoreLevelToNumber({ score: sortedScores[base + 1].scoreLevel ?? ScoreLevel.Novice })
      : scoreBase

    return scoreBase + rest * (scoreNext - scoreBase)
  }

  return {
    name,
    average: average,
    lowerQuartile: computeQuartile(scoreLevels, 0.25),
    median: scoreLevels[Math.floor(scoreLevels.length / 2)].scoreLevel ?? ScoreLevel.Novice,
    upperQuartile: computeQuartile(scoreLevels, 0.75),
    counts: {
      novice: scoreLevels.filter((p) => p.scoreLevel === ScoreLevel.Novice).length,
      intermediate: scoreLevels.filter((p) => p.scoreLevel === ScoreLevel.Intermediate).length,
      advanced: scoreLevels.filter((p) => p.scoreLevel === ScoreLevel.Advanced).length,
      expert: scoreLevels.filter((p) => p.scoreLevel === ScoreLevel.Expert).length,
    },
  }
}
