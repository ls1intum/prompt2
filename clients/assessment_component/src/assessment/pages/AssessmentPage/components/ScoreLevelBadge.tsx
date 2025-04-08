import React from 'react'
import { Badge } from '@/components/ui/badge'

import { mapNumberToScoreLevel } from '../../../interfaces/scoreLevel'
import { getLevelConfig } from '../../utils/getLevelConfig'
interface ScoreLevelBadgeProps {
  score: number
}

const ScoreLevelBadge: React.FC<ScoreLevelBadgeProps> = ({ score }) => {
  const config = getLevelConfig(mapNumberToScoreLevel(score), score < 1 ? true : false)

  return (
    <Badge className={`${config.textColor} ${config.selectedBg} hover:${config.selectedBg}`}>
      {config.icon} {config.title} - {score.toFixed(2)}
    </Badge>
  )
}

export default ScoreLevelBadge
