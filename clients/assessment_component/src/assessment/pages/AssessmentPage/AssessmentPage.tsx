import { useParams } from 'react-router-dom'
import { useMemo, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

import { ErrorPage } from '@tumaet/prompt-ui-components'

import { useCategoryStore } from '../../zustand/useCategoryStore'
import { useParticipationStore } from '../../zustand/useParticipationStore'
import { useStudentAssessmentStore } from '../../zustand/useStudentAssessmentStore'

import { useGetStudentAssessment } from './hooks/useGetStudentAssessment'

import { AssessmentProfile } from './components/AssessmentProfile'
import { CategoryAssessment } from './components/CategoryAssessment'
import { AssessmentCompletion } from './components/AssessmentCompletion/AssessmentCompletion'
import { FeedbackItemsPanel } from './components/FeedbackItemsPanel/FeedbackItemsPanel'

export const AssessmentPage = (): JSX.Element => {
  const { courseParticipationID } = useParams<{ courseParticipationID: string }>()

  const { setStudentAssessment, setAssessmentParticipation } = useStudentAssessmentStore()
  const { categories } = useCategoryStore()
  const { participations } = useParticipationStore()
  const participant = participations.find(
    (participation) => participation.courseParticipationID === courseParticipationID,
  )

  const {
    data: studentAssessment,
    isPending: isStudentAssessmentPending,
    isError: isStudentAssessmentError,
    refetch: refetchStudentAssessment,
  } = useGetStudentAssessment()

  const remainingAssessments = useMemo(() => {
    return (
      categories.reduce((acc, category) => {
        return acc + category.competencies.length
      }, 0) - (studentAssessment?.assessments?.length || 0)
    )
  }, [categories, studentAssessment?.assessments?.length])

  useEffect(() => {
    if (studentAssessment) {
      setStudentAssessment(studentAssessment)
    }
  }, [studentAssessment, setStudentAssessment])

  useEffect(() => {
    if (participant) {
      setAssessmentParticipation(participant)
    }
  }, [participant, setAssessmentParticipation])

  if (isStudentAssessmentError) return <ErrorPage onRetry={refetchStudentAssessment} />
  if (isStudentAssessmentPending)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )

  if (!studentAssessment) {
    return (
      <ErrorPage
        title='No participant found for this course participation ID'
        description='We like what you are doing. To contribute, checkout https://github.com/ls1intum/prompt2'
      />
    )
  }

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold tracking-tight'>Assess Competencies</h1>

      {participant && (
        <AssessmentProfile
          participant={participant}
          studentAssessment={studentAssessment}
          remainingAssessments={remainingAssessments}
        />
      )}

      {categories.map((category) => (
        <CategoryAssessment
          key={category.id}
          category={category}
          assessments={studentAssessment.assessments.filter((assessment) =>
            category.competencies
              .map((competency) => competency.id)
              .includes(assessment.competencyID),
          )}
          completed={studentAssessment.assessmentCompletion.completed}
        />
      ))}

      <FeedbackItemsPanel courseParticipationID={courseParticipationID ?? ''} />

      <AssessmentCompletion />
    </div>
  )
}
