import { ScoreLevel } from '../../interfaces/scoreLevel'

export const getLevelConfig = (level: ScoreLevel, unknown?: boolean) => {
  if (unknown) {
    return {
      title: 'Unknown',
      textColor: 'text-gray-700',
      selectedBg: 'bg-gray-100',
      icon: '⚪',
      border: 'border-gray-300',
    }
  }

  switch (level) {
    case ScoreLevel.VeryBad:
      return {
        title: 'Very Bad',
        textColor: 'text-red-700',
        selectedBg: 'bg-red-100',
        icon: '🔴',
        border: 'border-red-300',
      }
    case ScoreLevel.Bad:
      return {
        title: 'Bad',
        textColor: 'text-orange-700',
        selectedBg: 'bg-orange-100',
        icon: '🟠',
        border: 'border-orange-300',
      }
    case ScoreLevel.Ok:
      return {
        title: 'Ok',
        textColor: 'text-yellow-700',
        selectedBg: 'bg-yellow-100',
        icon: '🟡',
        border: 'border-yellow-300',
      }
    case ScoreLevel.Good:
      return {
        title: 'Good',
        textColor: 'text-green-700',
        selectedBg: 'bg-green-100',
        icon: '🟢',
        border: 'border-green-300',
      }
    case ScoreLevel.VeryGood:
      return {
        title: 'Very Good',
        textColor: 'text-blue-700',
        selectedBg: 'bg-blue-100',
        icon: '🔵',
        border: 'border-blue-300',
      }
  }
}
