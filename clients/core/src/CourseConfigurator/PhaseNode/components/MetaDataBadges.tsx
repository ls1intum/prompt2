import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MetaDataItem } from '@/interfaces/course_phase_type'
import { getMetaDataStatus } from './utils/getBadgeStatus'

interface MetaDataBadgesProps {
  metaData: MetaDataItem[]
  icon: React.ReactNode
  label: string
  providedMetaData?: MetaDataItem[]
  isApplicationPhase?: boolean
}

export const MetaDataBadges = ({
  metaData,
  icon,
  label,
  providedMetaData,
}: MetaDataBadgesProps): JSX.Element => {
  return (
    <div className='flex items-start space-x-2 mb-2'>
      <div className='mt-1'>{icon}</div>
      <div>
        <div className='text-xs font-semibold text-secondary-foreground mb-1'>{label}</div>
        <div className='flex flex-wrap gap-1'>
          {metaData.map((item, index) => {
            const {
              color,
              icon: statusIcon,
              tooltip,
            } = getMetaDataStatus(item.name, item.type, providedMetaData)
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge
                      key={index}
                      variant='secondary'
                      className={`text-xs font-normal ${color} flex items-center gap-1`}
                    >
                      {statusIcon}
                      {item.name}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {item.name === 'applicationAnswers' ? (
                      tooltip ? (
                        <p>{tooltip}</p>
                      ) : (
                        <div>
                          {(() => {
                            try {
                              // Parse the item.type; if it fails, fallback to showing the raw string.
                              const questions = JSON.parse(item.type) as {
                                key: string
                                type: string
                              }[]
                              return (
                                <div>
                                  <span className='font-bold'>
                                    {!providedMetaData ? 'Exported' : 'Expected'} Questions:
                                  </span>
                                  <ul className='list-disc pl-5'>
                                    {questions.map((question, qIndex) => (
                                      <li key={qIndex}>
                                        <span className='font-bold'>{question.key}:</span>{' '}
                                        {question.type}
                                      </li>
                                    ))}
                                  </ul>
                                  {providedMetaData &&
                                    questions.length === 0 &&
                                    'No specific questions expected'}
                                </div>
                              )
                            } catch (error) {
                              return <div>{`Name: ${item.name}, Type: ${item.type}`}</div>
                            }
                          })()}
                        </div>
                      )
                    ) : item.name === 'additionalScores' ? (
                      tooltip ? (
                        <p>{tooltip}</p>
                      ) : (
                        <div>
                          {(() => {
                            try {
                              const scores = JSON.parse(item.type) as string[]
                              return (
                                <div>
                                  <span className='font-bold'>
                                    {!providedMetaData ? 'Exported' : 'Expected'} Scores:
                                  </span>
                                  <ul className='list-disc pl-5'>
                                    {scores.map((score, idx) => (
                                      <li key={idx}>{score}</li>
                                    ))}
                                  </ul>
                                  {providedMetaData &&
                                    scores.length === 0 &&
                                    'No specific scores expected'}
                                </div>
                              )
                            } catch (error) {
                              return <div>{`Name: ${item.name}, Type: ${item.type}`}</div>
                            }
                          })()}
                        </div>
                      )
                    ) : (
                      <p>{tooltip || `Name: ${item.name}, Type: ${item.type}`}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>
      </div>
    </div>
  )
}
