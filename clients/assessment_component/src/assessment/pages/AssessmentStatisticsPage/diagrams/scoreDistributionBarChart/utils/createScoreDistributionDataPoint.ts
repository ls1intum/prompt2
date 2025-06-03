import { ScoreLevel, mapScoreLevelToNumber } from '../../../../../interfaces/scoreLevel'

import { ScoreDistributionDataPoint } from '../interfaces/ScoreDistributionDataPoint'

export const createScoreDistributionDataPoint = (
  shortLabel: string,
  label: string,
  scores: ScoreLevel[],
  scoreLevels: ScoreLevel[],
): ScoreDistributionDataPoint => {
  const sortedScores = [...scores].sort((a, b) => {
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
    sortedScores.reduce((sum, scoreLevel) => {
      const score = mapScoreLevelToNumber(scoreLevel)
      return sum + score
    }, 0) / sortedScores.length

  const computeQuartile = (sortedSco: ScoreLevel[], quartile: number): number => {
    const pos = (sortedSco.length - 1) * quartile
    const base = Math.floor(pos)
    const rest = pos - base

    const scoreBase = mapScoreLevelToNumber(sortedSco[base])
    const scoreNext = sortedSco[base + 1] ? mapScoreLevelToNumber(sortedSco[base + 1]) : scoreBase

    return scoreBase + rest * (scoreNext - scoreBase)
  }

  return {
    shortLabel,
    label,
    average: average,
    lowerQuartile: computeQuartile(sortedScores, 0.25),
    median: sortedScores[Math.floor(sortedScores.length / 2)],
    upperQuartile: computeQuartile(sortedScores, 0.75),
    counts: scoreLevels.reduce(
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
