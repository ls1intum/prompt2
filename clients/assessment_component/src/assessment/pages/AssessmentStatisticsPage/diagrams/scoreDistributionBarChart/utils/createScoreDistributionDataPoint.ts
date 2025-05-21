import { ScoreLevel, mapScoreLevelToNumber } from '../../../../../interfaces/scoreLevel'

import { ScoreDistributionDataPoint } from '../interfaces/ScoreDistributionDataPoint'

export const createScoreDistributionDataPoint = (
  name: string,
  scoreLevels: ScoreLevel[],
): ScoreDistributionDataPoint => {
  scoreLevels = scoreLevels.sort((a, b) => {
    const scoreA = mapScoreLevelToNumber(a)
    const scoreB = mapScoreLevelToNumber(b)
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
    scoreLevels.reduce((sum, scoreLevel) => {
      const score = mapScoreLevelToNumber(scoreLevel)
      return sum + score
    }, 0) / scoreLevels.length

  const computeQuartile = (sortedScores: ScoreLevel[], quartile: number): number => {
    const pos = (sortedScores.length - 1) * quartile
    const base = Math.floor(pos)
    const rest = pos - base

    const scoreBase = mapScoreLevelToNumber(sortedScores[base])
    const scoreNext = sortedScores[base + 1]
      ? mapScoreLevelToNumber(sortedScores[base + 1])
      : scoreBase

    return scoreBase + rest * (scoreNext - scoreBase)
  }

  return {
    name,
    average: average,
    lowerQuartile: computeQuartile(scoreLevels, 0.25),
    median: scoreLevels[Math.floor(scoreLevels.length / 2)],
    upperQuartile: computeQuartile(scoreLevels, 0.75),
    counts: {
      novice: scoreLevels.filter((sco) => sco === ScoreLevel.Novice).length,
      intermediate: scoreLevels.filter((sco) => sco === ScoreLevel.Intermediate).length,
      advanced: scoreLevels.filter((sco) => sco === ScoreLevel.Advanced).length,
      expert: scoreLevels.filter((sco) => sco === ScoreLevel.Expert).length,
    },
  }
}
