import React from 'react'
import {
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@tumaet/prompt-ui-components'

import { getLevelConfig } from '../../utils/getLevelConfig'
import { mapNumberToScoreLevel } from '../../../interfaces/scoreLevel'

interface GradeSuggestionBadgeProps {
  gradeSuggestion: number | undefined
  text?: boolean
}

export const GradeSuggestionBadge = ({
  gradeSuggestion,
  text = false,
}: GradeSuggestionBadgeProps) => {
  if (!gradeSuggestion) {
    return undefined
  }

  const config = getLevelConfig(mapNumberToScoreLevel(gradeSuggestion))
  const tooltipText = 'This is the grade you propose to the course instructor.'

  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger>
          <Badge
            className={`${config.textColor} ${config.selectedBg} hover:${config.selectedBg} cursor-help`}
            style={{ whiteSpace: 'nowrap' }}
          >
            {text ? 'Grade Suggestion:' : ''} {gradeSuggestion.toFixed(1)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side='top'>
          <p className='max-w-lg text-center'>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
