import { ScoreLevel } from '@tumaet/prompt-shared-state'

export const getLevelConfig = (level: ScoreLevel, unknown?: boolean) => {
  if (unknown) {
    return {
      title: 'Unknown',
      textColor: 'text-gray-700 dark:text-gray-100',
      selectedBg: 'bg-gray-100 dark:bg-gray-600',
      border: 'border-gray-200 dark:border-gray-200',
    }
  }

  switch (level) {
    case ScoreLevel.VeryBad:
      return {
        title: 'Strongly Disagree',
        textColor: 'text-red-700 dark:text-red-100',
        selectedBg: 'bg-red-200 dark:bg-red-600',
        border: 'border-red-200 dark:border-red-200',
      }
    case ScoreLevel.Bad:
      return {
        title: 'Disagree',
        textColor: 'text-orange-700 dark:text-orange-100',
        selectedBg: 'bg-orange-200 dark:bg-orange-600',
        border: 'border-orange-200 dark:border-orange-200',
      }
    case ScoreLevel.Ok:
      return {
        title: 'Neutral',
        textColor: 'text-yellow-700 dark:text-yellow-100',
        selectedBg: 'bg-yellow-200 dark:bg-yellow-600',
        border: 'border-yellow-200 dark:border-yellow-200',
      }
    case ScoreLevel.Good:
      return {
        title: 'Agree',
        textColor: 'text-green-700 dark:text-green-100',
        selectedBg: 'bg-green-200 dark:bg-green-600',
        border: 'border-green-200 dark:border-green-200',
      }
    case ScoreLevel.VeryGood:
      return {
        title: 'Strongly Agree',
        textColor: 'text-blue-700 dark:text-blue-100',
        selectedBg: 'bg-blue-200 dark:bg-blue-600',
        border: 'border-blue-200 dark:border-blue-200',
      }
  }
}
