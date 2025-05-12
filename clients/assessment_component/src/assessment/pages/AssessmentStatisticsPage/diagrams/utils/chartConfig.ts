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
      return 'var(--color-novice)' // Novice color
    case ScoreLevel.Intermediate:
      return 'var(--color-intermediate)' // Intermediate color
    case ScoreLevel.Advanced:
      return 'var(--color-advanced)' // Advanced color
    case ScoreLevel.Expert:
      return 'var(--color-expert)' // Expert color
    default:
      return 'var(--color-default)' // Default color
  }
}
