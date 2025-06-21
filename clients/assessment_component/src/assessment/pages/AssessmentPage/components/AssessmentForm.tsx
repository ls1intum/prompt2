import { useState } from 'react'
import { AlertCircle, ClipboardCheck, LockIcon } from 'lucide-react'
import { format } from 'date-fns'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Textarea,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  cn,
} from '@tumaet/prompt-ui-components'
import { useAuthStore } from '@tumaet/prompt-shared-state'

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
      scoreLevel: assessment?.scoreLevel,
      comment: assessment ? assessment.comment : '',
      examples: assessment ? assessment.examples : '',
      author: userName,
    },
  })

  const updateAssessment = useUpdateAssessment(setError)
  const createAssessment = useCreateAssessment(setError)
  const { mutate } = assessment ? updateAssessment : createAssessment
  const selectedScore = form.watch('scoreLevel')

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
    form.setValue('scoreLevel', value, { shouldValidate: true })
  }

  return (
    <Form {...form}>
      <div
        className={cn(
          'grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-7 gap-4 items-start p-4 border rounded-md',
          completed ?? 'bg-gray-700 border-gray-700',
        )}
      >
        <div className='relative'>
          <div className='flex items-center gap-2 mb-2'>
            <ClipboardCheck className='h-4 w-4 text-muted-foreground flex-shrink-0' />
            <h3 className='text-base font-medium'>{competency.name}</h3>
          </div>
          <p className='text-xs text-muted-foreground line-clamp-2'>{competency.description}</p>
        </div>

        <div className='lg:col-span-2 2xl:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1'>
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

        <div className='flex flex-col h-full'>
          <FormField
            control={form.control}
            name='examples'
            render={({ field }) => (
              <FormItem className='flex flex-col flex-grow'>
                <FormControl className='flex-grow'>
                  <Textarea
                    placeholder={completed ? '' : 'Example'}
                    className={cn(
                      'resize-none text-xs h-full',
                      form.formState.errors.comment &&
                        'border border-destructive focus-visible:ring-destructive',
                      completed && 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-80',
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
        </div>

        <div className='flex flex-col h-full'>
          <FormField
            control={form.control}
            name='comment'
            render={({ field }) => (
              <FormItem className='flex flex-col flex-grow'>
                <FormControl className='flex-grow'>
                  <Textarea
                    placeholder={completed ? '' : 'Additional comments'}
                    className={cn(
                      'resize-none text-xs h-full',
                      form.formState.errors.comment &&
                        'border border-destructive focus-visible:ring-destructive',
                      completed && 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-80',
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
    </Form>
  )
}
