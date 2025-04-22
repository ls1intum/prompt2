import React from 'react'
import { Badge } from '@/components/ui/badge'

import { getLevelConfig } from '../utils/getLevelConfig'
import { ScoreLevel } from '../../interfaces/scoreLevel'

interface ScoreLevelBadgeProps {
  scoreLevel: ScoreLevel
  score?: number
}

const StudentScoreBadge: React.FC<ScoreLevelBadgeProps> = ({ scoreLevel, score }) => {
  const config = getLevelConfig(scoreLevel)

  return (
    <Badge className={`${config.textColor} ${config.selectedBg} hover:${config.selectedBg}`}>
      {config.title}
      {score !== undefined ? ` - Score: ${score.toFixed(2)}` : ''}
    </Badge>
  )
}

export default StudentScoreBadge
