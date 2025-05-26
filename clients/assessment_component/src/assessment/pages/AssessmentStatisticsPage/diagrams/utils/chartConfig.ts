import { ChartConfig } from '@tumaet/prompt-ui-components'

import { ScoreLevel } from '../../../../interfaces/scoreLevel'

export const chartConfig: ChartConfig = {
  notAssessed: {
    label: 'Unknown',
    color: '#d4d4d8', // neutral
  },
  novice: {
    label: 'Novice',
    color: '#fca5a5', // red-100
  },
  intermediate: {
    label: 'Intermediate',
    color: '#fde68a', // yellow-100
  },
  advanced: {
    label: 'Advanced',
    color: '#86efac', // green-100
  },
  expert: {
    label: 'Expert',
    color: '#93c5fd', // blue-100
  },
}

export function getBarColor(scoreLevel: ScoreLevel): string {
  switch (scoreLevel) {
    case ScoreLevel.Novice:
      return chartConfig.novice.color || '#ffffff' // Novice color
    case ScoreLevel.Intermediate:
      return chartConfig.intermediate.color || '#ffffff' // Intermediate color
    case ScoreLevel.Advanced:
      return chartConfig.advanced.color || '#ffffff' // Advanced color
    case ScoreLevel.Expert:
      return chartConfig.expert.color || '#ffffff' // Expert color
    default:
      return chartConfig.notAssessed.color || '#ffffff' // Default color
  }
}
