import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'

import { Form, cn } from '@tumaet/prompt-ui-components'

import { Competency } from '../../../../interfaces/competency'
import { Evaluation, CreateOrUpdateEvaluationRequest } from '../../../../interfaces/evaluation'
import { ScoreLevel } from '../../../../interfaces/scoreLevel'

import { CompetencyHeader } from '../../../components/CompetencyHeader'
import { DeleteAssessmentDialog } from '../../../components/DeleteAssessmentDialog'
import { ScoreLevelSelector } from '../../../components/ScoreLevelSelector'

import { useCreateOrUpdateEvaluation } from './hooks/useCreateOrUpdateEvaluation'
import { useDeleteEvaluation } from './hooks/useDeleteEvaluation'

interface EvaluationFormProps {
  courseParticipationID: string
  authorCourseParticipationID: string
  competency: Competency
  evaluation?: Evaluation
  completed?: boolean
}

export const EvaluationForm = ({
  courseParticipationID,
  authorCourseParticipationID,
  competency,
  evaluation,
  completed = false,
}: EvaluationFormProps) => {
  const [error, setError] = useState<string | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const form = useForm<CreateOrUpdateEvaluationRequest>({
    mode: 'onChange',
    defaultValues: {
      courseParticipationID,
      authorCourseParticipationID: authorCourseParticipationID,
      competencyID: competency.id,
      scoreLevel: evaluation?.scoreLevel,
    },
  })

  const { mutate: createOrUpdateEvaluation } = useCreateOrUpdateEvaluation(setError)
  const deleteEvaluation = useDeleteEvaluation(setError)
  const selectedScoreLevel = form.watch('scoreLevel')

  useEffect(() => {
    if (completed) return

    const subscription = form.watch(async (_, { name }) => {
      if (name) {
        const data = form.getValues()
        createOrUpdateEvaluation(data)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, createOrUpdateEvaluation, completed])

  const handleScoreChange = (value: ScoreLevel) => {
    if (completed) return
    form.setValue('scoreLevel', value, { shouldValidate: true })
  }

  const handleDelete = () => {
    if (evaluation?.id) {
      deleteEvaluation.mutate(evaluation.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false)

          form.reset({
            courseParticipationID: courseParticipationID,
            authorCourseParticipationID: authorCourseParticipationID,
            competencyID: competency.id,
            scoreLevel: undefined,
          })
        },
      })
    }
  }

  return (
    <Form {...form}>
      <div
        className={cn(
          'grid grid-cols-1 lg:grid-cols-2 gap-4 items-start p-4 border rounded-md relative',
          completed ?? 'bg-gray-700 border-gray-700',
        )}
      >
        <CompetencyHeader
          className='lg:col-span-2'
          competency={competency}
          competencyScore={evaluation}
          completed={completed}
          onResetClick={() => setDeleteDialogOpen(true)}
        />

        <ScoreLevelSelector
          className='lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-1'
          competency={competency}
          selectedScore={selectedScoreLevel}
          onScoreChange={handleScoreChange}
          completed={completed}
          isEvaluation={true}
        />

        {error && !completed && (
          <div className='flex items-center gap-2 text-destructive text-xs p-2 mt-2 bg-destructive/10 rounded-md'>
            <AlertCircle className='h-3 w-3' />
            <p>{error}</p>
          </div>
        )}

        {evaluation && (
          <div className='col-span-full'>
            <DeleteAssessmentDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              onConfirm={handleDelete}
              isDeleting={deleteEvaluation.isPending}
            />
          </div>
        )}
      </div>
    </Form>
  )
}
