import { ScoreLevel } from '../../interfaces/assessment'

export const getLevelConfig = (level: ScoreLevel) => {
  switch (level) {
    case 'novice':
      return {
        title: 'Novice',
        color: 'border-blue-500',
        textColor: 'text-blue-700',
        selectedBg: 'bg-blue-100',
        icon: '🔵',
      }
    case 'intermediate':
      return {
        title: 'Intermediate',
        color: 'border-green-500',
        textColor: 'text-green-700',
        selectedBg: 'bg-green-100',
        icon: '🟢',
      }
    case 'advanced':
      return {
        title: 'Advanced',
        color: 'border-orange-600',
        textColor: 'text-orange-700',
        selectedBg: 'bg-orange-100',
        icon: '🟠',
      }
    case 'expert':
      return {
        title: 'Expert',
        color: 'border-purple-500',
        textColor: 'text-purple-700',
        selectedBg: 'bg-purple-100',
        icon: '🟣',
      }
  }
}
