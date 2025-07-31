import { useState, useEffect, useRef } from 'react'
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
import { useSelfEvaluationCategoryStore } from '../../../../zustand/useSelfEvaluationCategoryStore'
import { usePeerEvaluationCategoryStore } from '../../../../zustand/usePeerEvaluationCategoryStore'

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

import { EvaluationScoreDescriptionBadge } from './components/EvaluationScoreDescriptionBadge'

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    form.reset({
      courseParticipationID,
      competencyID: competency.id,
      scoreLevel: assessment?.scoreLevel,
      comment: assessment ? assessment.comment : '',
      examples: assessment ? assessment.examples : '',
      author: userName,
    })
  }, [form, courseParticipationID, competency.id, assessment, userName])

  useEffect(() => {
    if (completed) return

    const subscription = form.watch(async (_, { name }) => {
      if (name) {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        // Set a new timeout to debounce the API call
        timeoutRef.current = setTimeout(async () => {
          const isValid = await form.trigger('comment')
          if (isValid) {
            const data = form.getValues()
            createOrUpdateAssessment(data)
          }
        }, 500) // 500ms debounce delay
      }
    })

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      subscription.unsubscribe()
    }
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

  const selfEvaluationCompetency =
    useSelfEvaluationCategoryStore().allSelfEvaluationCompetencies.find((c) =>
      competency.mappedFromCompetencies.includes(c.id),
    )
  const peerEvaluationCompetency =
    usePeerEvaluationCategoryStore().allPeerEvaluationCompetencies.find((c) =>
      competency.mappedFromCompetencies.includes(c.id),
    )

  const {
    selfEvaluations: allSelfEvaluationsForThisStudent,
    peerEvaluations: allPeerEvaluationsForThisStudent,
    assessmentParticipation,
  } = useStudentAssessmentStore()

  const { teams } = useTeamStore()
  const teamMembers = teams.find((t) =>
    t.members.map((m) => m.id).includes(courseParticipationID ?? ''),
  )?.members

  const selfEvaluationScoreLevel = allSelfEvaluationsForThisStudent.find(
    (se) => se.competencyID === selfEvaluationCompetency?.id,
  )?.scoreLevel

  const selfEvaluationStudentAnswers = [
    () => (
      <EvaluationScoreDescriptionBadge
        key={'self'}
        competency={selfEvaluationCompetency}
        scoreLevel={selfEvaluationScoreLevel}
        name={assessmentParticipation?.student.firstName ?? 'This Person'}
      />
    ),
  ]

  const peerEvaluations = allPeerEvaluationsForThisStudent.filter(
    (pe) => pe.competencyID === peerEvaluationCompetency?.id,
  )

  const peerEvaluationScore = peerEvaluations?.length
    ? mapNumberToScoreLevel(
        peerEvaluations.reduce((acc, pe) => acc + mapScoreLevelToNumber(pe.scoreLevel), 0) /
          peerEvaluations.length,
      )
    : undefined

  const peerEvaluationStudentAnswers =
    teamMembers
      ?.map((member) => {
        const memberScoreLevel = peerEvaluations.find(
          (pe) => pe.authorCourseParticipationID === member.id,
        )?.scoreLevel

        return memberScoreLevel !== undefined && peerEvaluationCompetency
          ? () => (
              <EvaluationScoreDescriptionBadge
                key={member.id}
                competency={peerEvaluationCompetency}
                scoreLevel={memberScoreLevel}
                name={`${member.firstName} ${member.lastName}`}
              />
            )
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
          selfEvaluationCompetency={selfEvaluationCompetency}
          selfEvaluationScoreLevel={selfEvaluationScoreLevel}
          selfEvaluationStudentAnswers={selfEvaluationStudentAnswers}
          peerEvaluationCompetency={
            peerEvaluationCompetency && peerEvaluationCompetency.id
              ? {
                  ...peerEvaluationCompetency,
                  name:
                    peerEvaluationCompetency.name.replace(
                      /This person|this person/g,
                      assessmentParticipation?.student.firstName ?? 'This Person',
                    ) ?? '',
                }
              : undefined
          }
          peerEvaluationScoreLevel={peerEvaluationScore}
          peerEvaluationStudentAnswers={peerEvaluationStudentAnswers}
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
