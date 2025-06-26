import React from 'react'
import { Badge } from '@tumaet/prompt-ui-components'

import { getLevelConfig } from '../utils/getLevelConfig'
import { ScoreLevel } from '../../interfaces/scoreLevel'

interface GradeSuggestionBadgeProps {
  gradeSuggestion: number | null
  text?: boolean
}

export const GradeSuggestionBadge: React.FC<GradeSuggestionBadgeProps> = ({
  gradeSuggestion,
  text = true,
}) => {
  if (gradeSuggestion === null) {
    return null
  }

  const scoreLevel =
    gradeSuggestion <= 1.5
      ? ScoreLevel.VeryGood
      : gradeSuggestion <= 2.5
        ? ScoreLevel.Good
        : gradeSuggestion <= 3.5
          ? ScoreLevel.Ok
          : gradeSuggestion <= 4.5
            ? ScoreLevel.Bad
            : ScoreLevel.VeryBad

  const config = getLevelConfig(scoreLevel)

  return (
    <Badge className={`${config.textColor} ${config.selectedBg} hover:${config.selectedBg}`}>
      {text ? 'Grade Suggestion:' : ''} {gradeSuggestion.toFixed(1)}
    </Badge>
  )
}
