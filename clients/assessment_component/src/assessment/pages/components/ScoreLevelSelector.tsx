import { LockIcon, User, Users } from 'lucide-react'
import {
  cn,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@tumaet/prompt-ui-components'

import { Competency } from '../../interfaces/competency'
import { ScoreLevel } from '../../interfaces/scoreLevel'

import { getLevelConfig } from '../utils/getLevelConfig'

import { AvatarStack } from './AvatarStack'
import { StudentScoreBadge } from './StudentScoreBadge'

interface ScoreLevelSelectorProps {
  className: string
  competency: Competency
  selectedScore?: ScoreLevel
  onScoreChange: (value: ScoreLevel) => void
  completed: boolean
  isEvaluation?: boolean
  selfEvaluationScoreLevel?: ScoreLevel
  peerEvaluationScoreLevel?: ScoreLevel
  teamMembersWithScores?: { name: string; scoreLevel: ScoreLevel }[]
}

export const ScoreLevelSelector = ({
  className,
  competency,
  selectedScore,
  onScoreChange,
  completed,
  isEvaluation = false,
  selfEvaluationScoreLevel,
  peerEvaluationScoreLevel,
  teamMembersWithScores,
}: ScoreLevelSelectorProps) => {
  return (
    <div className={className}>
      {Object.values(ScoreLevel).map((level) => {
        const config = getLevelConfig(level)
        const isSelected = selectedScore === level
        const descriptionID = `score-level-${level}-description`

        const avatars = [
          ...(selfEvaluationScoreLevel && level === selfEvaluationScoreLevel
            ? [<User key='self-evaluation-icon' size={20} className='text-blue-500' />]
            : []),
          ...(peerEvaluationScoreLevel && level === peerEvaluationScoreLevel
            ? [
                <TooltipProvider key='peer-evaluation-icon'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Users key='peer-evaluation-icon' size={20} className='text-green-500' />
                    </TooltipTrigger>
                    <TooltipContent>
                      {teamMembersWithScores && teamMembersWithScores.length > 0
                        ? teamMembersWithScores.map((member) => (
                            <div key={member.name} className='flex items-center gap-1'>
                              <span className='font-semibold'>{member.name}:</span>
                              <StudentScoreBadge scoreLevel={member.scoreLevel} />
                            </div>
                          ))
                        : undefined}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>,
              ]
            : []),
        ]

        return (
          <div
            key={level}
            className={cn('relative', selectedScore && !isSelected && 'hidden lg:flex')}
          >
            <div className='absolute -top-6 left-0 w-full'>
              <div className='flex justify-center items-center gap-2'>
                {(selfEvaluationScoreLevel || peerEvaluationScoreLevel) && (
                  <AvatarStack avatars={avatars} size={20} overlap={0.7} />
                )}
              </div>
            </div>

            <button
              type='button'
              onClick={() => onScoreChange(level)}
              disabled={completed}
              aria-pressed={isSelected}
              aria-disabled={completed}
              aria-label={`Select ${config.title} score level`}
              aria-describedby={descriptionID}
              className={cn(
                'w-full h-full text-sm border-2 rounded-lg p-3 transition-all text-left flex flex-col justify-start',
                isSelected && config.selectedBg,
                isSelected && config.textColor,
                !completed && 'focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
                completed && 'opacity-80 cursor-not-allowed',
                (selfEvaluationScoreLevel || peerEvaluationScoreLevel) && 'mt-2',
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

              <p id={descriptionID} className='line-clamp-3 text-muted-foreground'>
                {(() => {
                  const key =
                    `description${level.charAt(0).toUpperCase()}${level.slice(1)}` as keyof Competency
                  return competency[key] as string
                })()}
              </p>
            </button>
          </div>
        )
      })}
    </div>
  )
}
