import React from 'react'
import { Badge } from '@/components/ui/badge'

import { StudentScore } from '../../../interfaces/studentScore'
import { getLevelConfig } from '../../utils/getLevelConfig'
interface ScoreLevelBadgeProps {
  studentScore: StudentScore
}

const StudentScoreBadge: React.FC<ScoreLevelBadgeProps> = ({ studentScore }) => {
  const config = getLevelConfig(studentScore.scoreLevel)

  return (
    <Badge className={`${config.textColor} ${config.selectedBg} hover:${config.selectedBg}`}>
      {config.icon} {config.title} - Score: {studentScore.score.toFixed(2)}
    </Badge>
  )
}

export default StudentScoreBadge
