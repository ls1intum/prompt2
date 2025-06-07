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
      median: ScoreLevel.VeryBad,
      upperQuartile: 0,
      counts: {
        veryBad: 0,
        bad: 0,
        ok: 0,
        good: 0,
        veryGood: 0,
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
          case ScoreLevel.VeryBad:
            counts.veryBad++
            break
          case ScoreLevel.Bad:
            counts.bad++
            break
          case ScoreLevel.Ok:
            counts.ok++
            break
          case ScoreLevel.Good:
            counts.good++
            break
          case ScoreLevel.VeryGood:
            counts.veryGood++
            break
        }
        return counts
      },
      { veryBad: 0, bad: 0, ok: 0, good: 0, veryGood: 0 } as Record<ScoreLevel, number>,
    ),
  }
}
