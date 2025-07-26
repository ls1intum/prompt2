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

interface ScoreLevelSelectorProps {
  className: string
  competency: Competency
  selectedScore?: ScoreLevel
  onScoreChange: (value: ScoreLevel) => void
  completed: boolean
  isEvaluation?: boolean
  selfEvaluationCompetency?: Competency
  selfEvaluationScoreLevel?: ScoreLevel
  selfEvaluationStudentAnswers?: (() => JSX.Element)[]
  peerEvaluationCompetency?: Competency
  peerEvaluationScoreLevel?: ScoreLevel
  peerEvaluationStudentAnswers?: (() => JSX.Element)[]
}

export const ScoreLevelSelector = ({
  className,
  competency,
  selectedScore,
  onScoreChange,
  completed,
  isEvaluation = false,
  selfEvaluationCompetency,
  selfEvaluationScoreLevel,
  selfEvaluationStudentAnswers,
  peerEvaluationCompetency,
  peerEvaluationScoreLevel,
  peerEvaluationStudentAnswers,
}: ScoreLevelSelectorProps) => {
  return (
    <div className={className}>
      {Object.values(ScoreLevel).map((level) => {
        const config = getLevelConfig(level)
        const isSelected = selectedScore === level
        const descriptionID = `score-level-${level}-description`

        return (
          <div
            key={level}
            className={cn('relative', selectedScore && !isSelected && 'hidden lg:flex')}
          >
            <div className='absolute -top-6 left-0 w-full'>
              <div className='flex justify-center items-center text-left gap-2'>
                {selfEvaluationCompetency &&
                  selfEvaluationScoreLevel &&
                  level === selfEvaluationScoreLevel && (
                    <TooltipProvider key={`self-evaluation-${level}-${competency.id}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <User size={20} className='text-blue-500 dark:text-blue-300' />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className='font-semibold'>Self Evaluation Results</div>
                          <div className='text-sm text-muted-foreground'>
                            <span className='font-semibold'>Statement:</span>{' '}
                            {selfEvaluationCompetency.name}
                          </div>
                          {selfEvaluationStudentAnswers &&
                          selfEvaluationStudentAnswers.length > 0 ? (
                            <div className='mt-2 space-y-1'>
                              {selfEvaluationStudentAnswers.map((studentAnswer, index) => (
                                <div key={index}>{studentAnswer()}</div>
                              ))}
                            </div>
                          ) : null}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                {peerEvaluationCompetency &&
                  peerEvaluationScoreLevel &&
                  level === peerEvaluationScoreLevel && (
                    <TooltipProvider key={`peer-evaluation-${level}-${competency.id}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Users size={20} className='text-green-500 dark:text-green-300' />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className='font-semibold'>Peer Evaluation Results</div>
                          <div className='text-sm text-muted-foreground'>
                            <span className='font-semibold'>Statement:</span>{' '}
                            {peerEvaluationCompetency.name}
                          </div>
                          {peerEvaluationStudentAnswers && peerEvaluationStudentAnswers.length > 0
                            ? peerEvaluationStudentAnswers.map((studentAnswer) => studentAnswer())
                            : undefined}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
                !isSelected && 'hover:bg-gray-100',
                isSelected
                  ? cn(config.textColor, config.selectedBg)
                  : 'bg-gray-50 dark:bg-gray-900',
                !completed && 'focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
                completed && 'opacity-80 cursor-not-allowed',
                (selfEvaluationScoreLevel || peerEvaluationScoreLevel) && 'mt-2',
                !selectedScore && config.border,
              )}
            >
              <div className='flex justify-between mb-1'>
                <span className='font-semibold'>
                  {isEvaluation ? config.evaluationTitle : config.title}
                </span>

                {completed && isSelected && (
                  <span className='flex items-center gap-1'>
                    <LockIcon
                      className={cn(
                        'line-clamp-3 text-muted-foreground',
                        isSelected && 'dark:text-gray-200',
                        'h-4 w-4',
                      )}
                    />
                  </span>
                )}
              </div>

              <p
                id={descriptionID}
                className={cn(
                  'line-clamp-3 text-muted-foreground',
                  isSelected && 'dark:text-gray-200',
                )}
              >
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
