import { ScoreLevel } from '../../interfaces/assessment'

export const getLevelConfig = (level: ScoreLevel) => {
  switch (level) {
    case ScoreLevel.Novice:
      return {
        title: 'Novice',
        textColor: 'text-red-700',
        selectedBg: 'bg-red-100',
        icon: '🔴',
      }
    case ScoreLevel.Intermediate:
      return {
        title: 'Intermediate',
        textColor: 'text-yellow-700',
        selectedBg: 'bg-yellow-100',
        icon: '🟡',
      }
    case ScoreLevel.Advanced:
      return {
        title: 'Advanced',
        textColor: 'text-green-700',
        selectedBg: 'bg-green-100',
        icon: '🟢',
      }
    case ScoreLevel.Expert:
      return {
        title: 'Expert',
        textColor: 'text-blue-700',
        selectedBg: 'bg-blue-100',
        icon: '🔵',
      }
  }
}
