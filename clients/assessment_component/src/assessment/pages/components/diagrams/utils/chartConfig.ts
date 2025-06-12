import { ChartConfig } from '@tumaet/prompt-ui-components'

import { ScoreLevel } from '../../../../interfaces/scoreLevel'

export const chartConfig: ChartConfig = {
  notAssessed: {
    label: 'Unknown',
    color: '#d4d4d8', // gray-300
  },
  veryBad: {
    label: 'Very Bad',
    color: '#fca5a5', // red-500
  },
  bad: {
    label: 'Bad',
    color: '#f97316', // orange-500
  },
  ok: {
    label: 'Ok',
    color: '#fde68a', // yellow-500
  },
  good: {
    label: 'Good',
    color: '#86efac', // green-500
  },
  veryGood: {
    label: 'Very Good',
    color: '#93c5fd', // blue-500
  },
}

export function getBarColor(scoreLevel: ScoreLevel): string {
  switch (scoreLevel) {
    case ScoreLevel.VeryBad:
      return chartConfig.veryBad.color || '#ffffff' // Novice color
    case ScoreLevel.Bad:
      return chartConfig.bad.color || '#ffffff' // Intermediate color
    case ScoreLevel.Ok:
      return chartConfig.ok.color || '#ffffff' // Advanced color
    case ScoreLevel.Good:
      return chartConfig.good.color || '#ffffff' // Expert color
    case ScoreLevel.VeryGood:
      return chartConfig.veryGood.color || '#ffffff' // Expert color
    default:
      return chartConfig.notAssessed.color || '#ffffff' // Default color
  }
}
