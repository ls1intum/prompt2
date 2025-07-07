import { LockIcon } from 'lucide-react'
import { cn } from '@tumaet/prompt-ui-components'

import { getLevelConfig } from '../utils/getLevelConfig'
import { Competency } from '../../interfaces/competency'
import { ScoreLevel } from '../../interfaces/scoreLevel'

interface ScoreLevelSelectorProps {
  className: string
  competency: Competency
  selectedScore?: ScoreLevel
  onScoreChange: (value: ScoreLevel) => void
  completed: boolean
  isEvaluation?: boolean
}

export const ScoreLevelSelector = ({
  className,
  competency,
  selectedScore,
  onScoreChange,
  completed,
  isEvaluation = false,
}: ScoreLevelSelectorProps) => {
  return (
    <div className={className}>
      {Object.values(ScoreLevel).map((level) => {
        const config = getLevelConfig(level)
        const isSelected = selectedScore === level
        const descriptionId = `score-level-${level}-description`

        return (
          <button
            key={level}
            type='button'
            onClick={() => onScoreChange(level)}
            disabled={completed}
            aria-pressed={isSelected}
            aria-disabled={completed}
            aria-label={`Select ${config.title} score level`}
            aria-describedby={descriptionId}
            className={cn(
              'w-full text-sm border-2 rounded-lg p-3 transition-all text-left flex flex-col justify-start',
              isSelected && config.selectedBg,
              isSelected && config.textColor,
              !completed && 'focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
              completed && 'opacity-80 cursor-not-allowed',
              // Hide non-selected items on small screens (< lg) only when a selection exists
              selectedScore && !isSelected && 'hidden lg:flex',
            )}
          >
            <div className='flex justify-between mb-1'>
              <span className='font-semibold'>
                {isEvaluation ? config.evaluationTitle : config.title}
              </span>
              <div>
                <span className='flex items-center gap-1'>
                  {completed && isSelected && (
                    <LockIcon className='h-4 w-4 text-muted-foreground' />
                  )}
                  {config.icon}
                </span>
              </div>
            </div>

            <p id={descriptionId} className='line-clamp-3 text-muted-foreground'>
              {(() => {
                const key =
                  `description${level.charAt(0).toUpperCase()}${level.slice(1)}` as keyof Competency
                return competency[key] as string
              })()}
            </p>
          </button>
        )
      })}
    </div>
  )
}
