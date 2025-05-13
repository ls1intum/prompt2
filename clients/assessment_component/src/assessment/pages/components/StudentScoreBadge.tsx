import React from 'react'
import { Badge } from '@tumaet/prompt-ui-components'

import { getLevelConfig } from '../utils/getLevelConfig'
import { ScoreLevel } from '../../interfaces/scoreLevel'

interface ScoreLevelBadgeProps {
  scoreLevel: ScoreLevel
  score?: number
}

const StudentScoreBadge: React.FC<ScoreLevelBadgeProps> = ({ scoreLevel }) => {
  const config = getLevelConfig(scoreLevel)

  return (
    <Badge className={`${config.textColor} ${config.selectedBg} hover:${config.selectedBg}`}>
      {config.title}
    </Badge>
  )
}

export default StudentScoreBadge
