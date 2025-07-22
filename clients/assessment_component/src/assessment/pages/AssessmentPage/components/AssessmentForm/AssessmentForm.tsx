import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'

import { useAuthStore } from '@tumaet/prompt-shared-state'
import {
  Textarea,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  cn,
} from '@tumaet/prompt-ui-components'

import { useStudentAssessmentStore } from '../../../../zustand/useStudentAssessmentStore'
import { useTeamStore } from '../../../../zustand/useTeamStore'

import { Assessment, CreateOrUpdateAssessmentRequest } from '../../../../interfaces/assessment'
import { Competency } from '../../../../interfaces/competency'
import {
  ScoreLevel,
  mapNumberToScoreLevel,
  mapScoreLevelToNumber,
} from '../../../../interfaces/scoreLevel'

import { CompetencyHeader } from '../../../components/CompetencyHeader'
import { DeleteAssessmentDialog } from '../../../components/DeleteAssessmentDialog'
import { ScoreLevelSelector } from '../../../components/ScoreLevelSelector'

import { useCreateOrUpdateAssessment } from './hooks/useCreateOrUpdateAssessment'
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

  const { mutate: createOrUpdateAssessment } = useCreateOrUpdateAssessment(setError)
  const deleteAssessment = useDeleteAssessment(setError)
  const selectedScore = form.watch('scoreLevel')

  useEffect(() => {
    if (completed) return

    const subscription = form.watch(async (_, { name }) => {
      if (name) {
        const isValid = await form.trigger('comment')
        if (isValid) {
          const data = form.getValues()
          createOrUpdateAssessment(data)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form, createOrUpdateAssessment, completed])

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

  const { selfEvaluations: allSelfEvaluations, peerEvaluations: allPeerEvaluations } =
    useStudentAssessmentStore()
  const { teams } = useTeamStore()
  const teamMembers = teams.find((t) =>
    t.members.map((m) => m.courseParticipationID).includes(courseParticipationID ?? ''),
  )?.members

  const selfEvaluations = allSelfEvaluations.filter((se) =>
    competency.mappedFromCompetencies.includes(se.competencyID),
  )
  const peerEvaluations = allPeerEvaluations.filter((pe) =>
    competency.mappedFromCompetencies.includes(pe.competencyID),
  )

  const selfEvaluationScore = selfEvaluations?.length
    ? mapNumberToScoreLevel(
        selfEvaluations.reduce((acc, se) => acc + mapScoreLevelToNumber(se.scoreLevel), 0),
      )
    : undefined

  const peerEvaluationScore = peerEvaluations?.length
    ? mapNumberToScoreLevel(
        peerEvaluations.reduce((acc, pe) => acc + mapScoreLevelToNumber(pe.scoreLevel), 0),
      )
    : undefined

  const teamMembersWithScores =
    teamMembers
      ?.map((member) => {
        const memberEvaluations = peerEvaluations.filter(
          (pe) => pe.authorCourseParticipationID === member.courseParticipationID,
        )
        const averageScore =
          memberEvaluations.length > 0
            ? mapNumberToScoreLevel(
                memberEvaluations.reduce(
                  (acc, pe) => acc + mapScoreLevelToNumber(pe.scoreLevel),
                  0,
                ) / memberEvaluations.length,
              )
            : undefined
        return averageScore !== undefined
          ? {
              firstName: member.firstName,
              lastName: member.lastName,
              scoreLevel: averageScore,
            }
          : undefined
      })
      .filter((item) => item !== undefined) ?? []

  return (
    <Form {...form}>
      <div
        className={cn(
          'grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-7 gap-4 items-start p-4 border rounded-md',
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
          className='lg:col-span-2 2xl:col-span-4 grid grid-cols-1 lg:grid-cols-5 gap-1'
          competency={competency}
          selectedScore={selectedScore}
          onScoreChange={handleScoreChange}
          completed={completed}
          selfEvaluationScoreLevel={selfEvaluationScore}
          peerEvaluationScoreLevel={peerEvaluationScore}
          teamMembersWithScores={teamMembersWithScores}
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

          {error && !completed && (
            <div className='flex items-center gap-2 text-destructive text-xs p-2 mt-2 bg-destructive/10 rounded-md'>
              <AlertCircle className='h-3 w-3' />
              <p>{error}</p>
            </div>
          )}
        </div>

        {assessment && (
          <DeleteAssessmentDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={handleDelete}
            isDeleting={deleteAssessment.isPending}
          />
        )}
      </div>
    </Form>
  )
}
