import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
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

import { Assessment, CreateOrUpdateAssessmentRequest } from '../../../../interfaces/assessment'
import { Competency } from '../../../../interfaces/competency'
import { ScoreLevel } from '../../../../interfaces/scoreLevel'

import { CompetencyHeader } from '../../../components/CompetencyHeader'
import { DeleteAssessmentDialog } from '../../../components/DeleteAssessmentDialog'
import { ScoreLevelSelector } from '../../../components/ScoreLevelSelector'

import { useUpdateAssessment } from './hooks/useUpdateAssessment'
import { useCreateAssessment } from './hooks/useCreateAssessment'
import { useDeleteAssessment } from './hooks/useDeleteAssessment'

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
  const [error, setError] = useState<string | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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
  const deleteAssessment = useDeleteAssessment(setError)
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

  const handleDelete = () => {
    if (assessment?.id) {
      deleteAssessment.mutate(assessment.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)

          form.reset({
            courseParticipationID,
            competencyID: competency.id,
            scoreLevel: undefined,
            comment: '',
            examples: '',
            author: userName,
          })
        },
      })
    }
  }

  return (
    <Form {...form}>
      <div
        className={cn(
          'grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-7 gap-4 items-start p-4 border rounded-md relative',
          completed ?? 'bg-gray-700 border-gray-700',
        )}
      >
        <CompetencyHeader
          className='lg:col-span-2 2xl:col-span-1'
          competency={competency}
          competencyScore={assessment}
          completed={completed}
          onResetClick={() => setDeleteDialogOpen(true)}
        />

        <ScoreLevelSelector
          className='lg:col-span-2 2xl:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1'
          competency={competency}
          selectedScore={selectedScore}
          onScoreChange={handleScoreChange}
          completed={completed}
        />

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

        {assessment && (
          <div className='col-span-full'>
            <DeleteAssessmentDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              onConfirm={handleDelete}
              isDeleting={deleteAssessment.isPending}
            />
          </div>
        )}
      </div>
    </Form>
  )
}
