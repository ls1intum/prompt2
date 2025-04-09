import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { AlertCircle, ClipboardCheck } from 'lucide-react'
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
import { debounceMutate } from '../../utils/debounceMutate'

interface AssessmentFormProps {
  courseParticipationID: string
  competency: Competency
  assessment?: Assessment
}

export const AssessmentForm = ({
  courseParticipationID,
  competency,
  assessment,
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

  const { mutate, isPending } = assessment
    ? useUpdateAssessment(setError)
    : useCreateAssessment(setError)
  const selectedScore = form.watch('score')

  useEffect(() => {
    const subscription = form.watch(async (_, { name }) => {
      if (name) {
        const isValid = await form.trigger('comment')
        if (isValid) {
          const data = form.getValues()
          debounceMutate(mutate, data)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form, mutate])

  const handleScoreChange = (value: ScoreLevel) => {
    form.setValue('score', value, { shouldValidate: true })
  }

  return (
    <Form {...form}>
      <div className='grid grid-cols-4 gap-4 items-start p-4 border rounded-md'>
        <div>
          <div className='flex items-center gap-2 mb-2'>
            <ClipboardCheck className='h-4 w-4 text-muted-foreground flex-shrink-0' />
            <h3 className='text-base font-medium'>{competency.name}</h3>
          </div>
          <p className='text-xs text-muted-foreground line-clamp-2'>{competency.description}</p>
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
                  disabled={isPending}
                  className={cn(
                    'w-full text-sm border-2 rounded-lg p-3 transition-all text-left',
                    isSelected ? config.selectedBg : 'bg-blue-50',
                    isSelected && config.textColor,
                    'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400',
                  )}
                >
                  <div className='flex justify-between mb-1'>
                    <span className='font-semibold'>{config.title}</span>
                    <span>
                      {isPending && isSelected ? (
                        <span className='animate-pulse'>⏳</span>
                      ) : (
                        config.icon
                      )}
                    </span>
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
                      placeholder='additional comments'
                      className={cn(
                        'resize-none text-xs h-full',
                        form.formState.errors.comment &&
                          'border border-destructive focus-visible:ring-destructive',
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {assessment && (
              <div className='text-xs text-muted-foreground mt-2'>
                <div>
                  Last assessed by {assessment.author} at{' '}
                  {format(new Date(assessment.assessedAt), 'MMM d, yyyy')}
                </div>
              </div>
            )}

            {error && (
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
