import { ScoreLevel, mapScoreLevelToNumber } from '../../../../../interfaces/scoreLevel'

import { ScoreDistributionDataPoint } from '../interfaces/ScoreDistributionDataPoint'

export const createScoreDistributionDataPoint = (
  shortLabel: string,
  label: string,
  scoreLevels: ScoreLevel[],
): ScoreDistributionDataPoint => {
  const sortedScoreLevels = [...scoreLevels].sort((a, b) => {
    const scoreA = mapScoreLevelToNumber(a)
    const scoreB = mapScoreLevelToNumber(b)
    return scoreA - scoreB
  })

  if (scoreLevels.length === 0) {
    return {
      shortLabel,
      label,
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
    sortedScoreLevels.reduce((sum, scoreLevel) => {
      const score = mapScoreLevelToNumber(scoreLevel)
      return sum + score
    }, 0) / sortedScoreLevels.length

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
    shortLabel,
    label,
    average: average,
    lowerQuartile: computeQuartile(sortedScoreLevels, 0.25),
    median: sortedScoreLevels[Math.floor(sortedScoreLevels.length / 2)],
    upperQuartile: computeQuartile(sortedScoreLevels, 0.75),
    counts: sortedScoreLevels.reduce(
      (counts, scoreLevel) => {
        switch (scoreLevel) {
          case ScoreLevel.Novice:
            counts.novice++
            break
          case ScoreLevel.Intermediate:
            counts.intermediate++
            break
          case ScoreLevel.Advanced:
            counts.advanced++
            break
          case ScoreLevel.Expert:
            counts.expert++
            break
        }
        return counts
      },
      { novice: 0, intermediate: 0, advanced: 0, expert: 0 },
    ),
  }
}
