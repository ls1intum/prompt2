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
    case ScoreLevel.Novice:
      return {
        title: 'Novice',
        textColor: 'text-red-700',
        selectedBg: 'bg-red-100',
        icon: '🔴',
        border: 'border-red-300',
      }
    case ScoreLevel.Intermediate:
      return {
        title: 'Intermediate',
        textColor: 'text-yellow-700',
        selectedBg: 'bg-yellow-100',
        icon: '🟡',
        border: 'border-yellow-300',
      }
    case ScoreLevel.Advanced:
      return {
        title: 'Advanced',
        textColor: 'text-green-700',
        selectedBg: 'bg-green-100',
        icon: '🟢',
        border: 'border-green-300',
      }
    case ScoreLevel.Expert:
      return {
        title: 'Expert',
        textColor: 'text-blue-700',
        selectedBg: 'bg-blue-100',
        icon: '🔵',
        border: 'border-blue-300',
      }
  }
}
