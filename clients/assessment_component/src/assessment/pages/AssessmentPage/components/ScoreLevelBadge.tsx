import React from 'react'
import { Badge } from '@/components/ui/badge'

import { ScoreLevel } from '../../../interfaces/scoreLevel'
import { getLevelConfig } from '../../utils/getLevelConfig'
interface ScoreLevelBadgeProps {
  score: number
  scoreLevel: ScoreLevel
}

const ScoreLevelBadge: React.FC<ScoreLevelBadgeProps> = ({ score, scoreLevel }) => {
  const config = getLevelConfig(scoreLevel)

  return (
    <Badge className={`${config.textColor} ${config.selectedBg} hover:${config.selectedBg}`}>
      {config.icon} {config.title} - avg. Score: {score.toFixed(2)}
    </Badge>
  )
}

export default ScoreLevelBadge
