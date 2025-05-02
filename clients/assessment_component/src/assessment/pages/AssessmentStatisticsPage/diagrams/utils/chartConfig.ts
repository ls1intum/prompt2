import { ChartConfig } from '@tumaet/prompt-ui-components'

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
