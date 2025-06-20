import React from 'react'
import { Badge } from '@tumaet/prompt-ui-components'

import { getLevelConfig } from '../utils/getLevelConfig'
import { mapNumberToScoreLevel } from '../../interfaces/scoreLevel'

interface GradeSuggestionBadgeProps {
  gradeSuggestion: number | undefined
}

export const GradeSuggestionBadge: React.FC<GradeSuggestionBadgeProps> = ({ gradeSuggestion }) => {
  if (gradeSuggestion === undefined) {
    return undefined
  }

  const config = getLevelConfig(mapNumberToScoreLevel(gradeSuggestion))

  return (
    <Badge className={`${config.textColor} ${config.selectedBg} hover:${config.selectedBg}`}>
      Grade Suggestion: {gradeSuggestion.toFixed(1)}
    </Badge>
  )
}
