import { ClipboardCheck, RotateCcw } from 'lucide-react'
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@tumaet/prompt-ui-components'

import { Competency } from '../../interfaces/competency'
import { CompetencyScore } from '../../interfaces/competencyScore'

interface CompetencyHeaderProps {
  className: string
  competency: Competency
  competencyScore?: CompetencyScore
  completed: boolean
  onResetClick: () => void
}

export const CompetencyHeader = ({
  className,
  competency,
  competencyScore,
  completed,
  onResetClick,
}: CompetencyHeaderProps) => {
  return (
    <div className={className}>
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-2'>
          <ClipboardCheck className='h-4 w-4 text-muted-foreground flex-shrink-0' />
          <h3 className='text-base font-medium'>{competency.name}</h3>
        </div>
        {competencyScore && !completed && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='sm' onClick={onResetClick}>
                  <RotateCcw className='h-4 w-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset this assessment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <p className='text-xs text-muted-foreground line-clamp-2'>{competency.description}</p>
    </div>
  )
}
