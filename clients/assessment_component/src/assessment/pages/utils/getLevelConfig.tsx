import { ScoreLevel } from '../../interfaces/scoreLevel'

export const getLevelConfig = (level: ScoreLevel, unknown?: boolean) => {
  if (unknown) {
    return {
      title: 'Unknown',
      evaluationTitle: 'Unknown',
      textColor: 'text-gray-700 dark:text-gray-100',
      selectedBg: 'bg-gray-100 dark:bg-gray-600',
      icon: '⚪',
      border: 'border-gray-300',
    }
  }

  switch (level) {
    case ScoreLevel.VeryBad:
      return {
        title: 'Very Bad',
        evaluationTitle: 'Strongly Disagree',
        textColor: 'text-red-700 dark:text-red-100',
        selectedBg: 'bg-red-200 dark:bg-red-600',
        icon: '🔴',
        border: 'border-red-300',
      }
    case ScoreLevel.Bad:
      return {
        title: 'Bad',
        evaluationTitle: 'Disagree',
        textColor: 'text-orange-700 dark:text-orange-100',
        selectedBg: 'bg-orange-200 dark:bg-orange-600',
        icon: '🟠',
        border: 'border-orange-300',
      }
    case ScoreLevel.Ok:
      return {
        title: 'Ok',
        evaluationTitle: 'Neutral',
        textColor: 'text-yellow-700 dark:text-yellow-100',
        selectedBg: 'bg-yellow-200 dark:bg-yellow-600',
        icon: '🟡',
        border: 'border-yellow-300',
      }
    case ScoreLevel.Good:
      return {
        title: 'Good',
        evaluationTitle: 'Agree',
        textColor: 'text-green-700 dark:text-green-100',
        selectedBg: 'bg-green-200 dark:bg-green-600',
        icon: '🟢',
        border: 'border-green-300',
      }
    case ScoreLevel.VeryGood:
      return {
        title: 'Very Good',
        evaluationTitle: 'Strongly Agree',
        textColor: 'text-blue-700 dark:text-blue-100',
        selectedBg: 'bg-blue-200 dark:bg-blue-600',
        icon: '🔵',
        border: 'border-blue-300',
      }
  }
}
