import { LockIcon } from 'lucide-react'
import { cn } from '@tumaet/prompt-ui-components'

import { getLevelConfig } from '../../../../utils/getLevelConfig'
import { Competency } from '../../../../../interfaces/competency'
import { ScoreLevel } from '../../../../../interfaces/scoreLevel'

interface ScoreLevelSelectorProps {
  competency: Competency
  selectedScore?: ScoreLevel
  onScoreChange: (value: ScoreLevel) => void
  completed: boolean
}

export const ScoreLevelSelector = ({
  competency,
  selectedScore,
  onScoreChange,
  completed,
}: ScoreLevelSelectorProps) => {
  return (
    <div className='lg:col-span-2 2xl:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1'>
      {Object.values(ScoreLevel).map((level) => {
        const config = getLevelConfig(level)
        const isSelected = selectedScore === level

        return (
          <button
            key={level}
            type='button'
            onClick={() => onScoreChange(level)}
            disabled={completed}
            className={cn(
              'w-full text-sm border-2 rounded-lg p-3 transition-all text-left flex flex-col justify-start',
              isSelected ? config.selectedBg : '',
              isSelected && config.textColor,
              !completed &&
                'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
              completed && 'opacity-80 cursor-not-allowed',
              // Hide non-selected items on small screens (< lg) only when a selection exists
              selectedScore && !isSelected && 'hidden lg:flex',
            )}
          >
            <div className='flex justify-between mb-1'>
              <span className='font-semibold'>{config.title}</span>
              <div>
                <span className='flex items-center gap-1'>
                  {completed && isSelected && (
                    <LockIcon className='h-4 w-4 text-muted-foreground' />
                  )}
                  {config.icon}
                </span>
              </div>
            </div>

            <p className='line-clamp-3 text-muted-foreground'>
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
