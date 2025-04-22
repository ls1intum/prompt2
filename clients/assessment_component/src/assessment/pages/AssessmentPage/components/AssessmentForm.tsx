import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { AlertCircle, ClipboardCheck, LockIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@tumaet/prompt-shared-state'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'

import { getLevelConfig } from '../../utils/getLevelConfig'

import { useUpdateAssessment } from '../hooks/useUpdateAssessment'
import { useCreateAssessment } from '../hooks/useCreateAssessment'

import type { Assessment, CreateOrUpdateAssessmentRequest } from '../../../interfaces/assessment'
import type { Competency } from '../../../interfaces/competency'
import { ScoreLevel } from '../../../interfaces/scoreLevel'

interface AssessmentFormProps {
  courseParticipationID: string
  competency: Competency
  assessment?: Assessment
  completed?: boolean
}

export const AssessmentForm = ({
  courseParticipationID,
  competency,
  assessment,
  completed = false,
}: AssessmentFormProps) => {
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuthStore()
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User'

  const form = useForm<CreateOrUpdateAssessmentRequest>({
    mode: 'onChange',
    defaultValues: {
      courseParticipationID,
      competencyID: competency.id,
      score: assessment?.score,
      comment: assessment ? assessment.comment : '',
      assessedAt: assessment
        ? format(new Date(assessment.assessedAt), "yyyy-MM-dd'T'HH:mm:ss'Z'")
        : format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
      author: userName,
    },
  })

  const updateAssessment = useUpdateAssessment(setError)
  const createAssessment = useCreateAssessment(setError)
  const { mutate } = assessment ? updateAssessment : createAssessment
  const selectedScore = form.watch('score')

  useEffect(() => {
    if (completed) return

    const subscription = form.watch(async (_, { name }) => {
      if (name) {
        const isValid = await form.trigger('comment')
        if (isValid) {
          const data = form.getValues()
          mutate(data)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form, mutate, completed])

  const handleScoreChange = (value: ScoreLevel) => {
    if (completed) return
    form.setValue('score', value, { shouldValidate: true })
  }

  return (
    <Form {...form}>
      <div
        className={cn(
          'grid grid-cols-4 gap-4 items-start p-4 border rounded-md',
          completed ?? 'bg-gray-700 border-gray-700',
        )}
      >
        <div>
          <div className='flex items-center gap-2 mb-2'>
            <ClipboardCheck className='h-4 w-4 text-muted-foreground flex-shrink-0' />
            <h3 className='text-base font-medium'>{competency.name}</h3>
          </div>
          <p className='text-xs text-muted-foreground line-clamp-2'>{competency.description}</p>
          {completed && (
            <div className='flex items-center gap-1 mt-2 text-xs text-muted-foreground'>
              <LockIcon className='h-3 w-3' />
              <span>Assessment completed</span>
            </div>
          )}
        </div>

        <div className='col-span-3 grid grid-cols-4 gap-4'>
          <div className='col-span-3 grid grid-cols-4 gap-1'>
            {Object.values(ScoreLevel).map((level) => {
              const config = getLevelConfig(level)
              const isSelected = selectedScore === level

              return (
                <button
                  key={level}
                  type='button'
                  onClick={() => handleScoreChange(level)}
                  disabled={completed}
                  className={cn(
                    'w-full text-sm border-2 rounded-lg p-3 transition-all text-left',
                    isSelected ? config.selectedBg : '',
                    isSelected && config.textColor,
                    !completed &&
                      'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
                    completed && 'opacity-80 cursor-not-allowed',
                  )}
                >
                  <div className='flex justify-between mb-1'>
                    <span className='font-semibold'>{config.title}</span>
                    <span>{config.icon}</span>
                  </div>

                  <p className='line-clamp-3 text-muted-foreground'>{competency[level]}</p>
                </button>
              )
            })}
          </div>

          <div className='col-span-1 flex flex-col h-full'>
            <FormField
              control={form.control}
              name='comment'
              rules={{ required: 'Comment is required.' }}
              render={({ field }) => (
                <FormItem className='flex flex-col flex-grow'>
                  <FormControl className='flex-grow'>
                    <Textarea
                      placeholder={completed ? '' : 'additional comments'}
                      className={cn(
                        'resize-none text-xs h-full',
                        form.formState.errors.comment &&
                          'border border-destructive focus-visible:ring-destructive',
                        completed && 'bg-gray-100 cursor-not-allowed opacity-80',
                      )}
                      disabled={completed}
                      readOnly={completed}
                      {...field}
                    />
                  </FormControl>
                  {!completed && <FormMessage />}
                </FormItem>
              )}
            />

            {assessment && (
              <div className='text-xs text-muted-foreground mt-2'>
                <div>
                  Last assessed by {assessment.author} at{' '}
                  {format(new Date(assessment.assessedAt), "MMM d, yyyy 'at' HH:mm")}
                </div>
              </div>
            )}

            {error && !completed && (
              <div className='flex items-center gap-2 text-destructive text-xs p-2 mt-2 bg-destructive/10 rounded-md'>
                <AlertCircle className='h-3 w-3' />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Form>
  )
}
