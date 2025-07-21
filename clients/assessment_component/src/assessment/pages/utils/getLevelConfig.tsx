import { ScoreLevel } from '../../interfaces/scoreLevel'

export const getLevelConfig = (level: ScoreLevel, unknown?: boolean) => {
  if (unknown) {
    return {
      title: 'Unknown',
      evaluationTitle: 'Unknown',
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
        evaluationTitle: 'Strongly Disagree',
        textColor: 'text-red-700',
        selectedBg: 'bg-red-200',
        icon: '🔴',
        border: 'border-red-300',
      }
    case ScoreLevel.Bad:
      return {
        title: 'Bad',
        evaluationTitle: 'Disagree',
        textColor: 'text-orange-700',
        selectedBg: 'bg-orange-200',
        icon: '🟠',
        border: 'border-orange-300',
      }
    case ScoreLevel.Ok:
      return {
        title: 'Ok',
        evaluationTitle: 'Neutral',
        textColor: 'text-yellow-700',
        selectedBg: 'bg-yellow-200',
        icon: '🟡',
        border: 'border-yellow-300',
      }
    case ScoreLevel.Good:
      return {
        title: 'Good',
        evaluationTitle: 'Agree',
        textColor: 'text-green-700',
        selectedBg: 'bg-green-200',
        icon: '🟢',
        border: 'border-green-300',
      }
    case ScoreLevel.VeryGood:
      return {
        title: 'Very Good',
        evaluationTitle: 'Strongly Agree',
        textColor: 'text-blue-700',
        selectedBg: 'bg-blue-200',
        icon: '🔵',
        border: 'border-blue-300',
      }
  }
}
