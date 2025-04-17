import { Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { ErrorPage } from '@/components/ErrorPage'
import { useGetStudentAssessment } from './hooks/useGetStudentAssessment'
import { CategoryAssessment } from './components/CategoryAssessment'
import { useCategoryStore } from '../../zustand/useCategoryStore'
import { useParticipationStore } from '../../zustand/useParticipationStore'
import { AssessmentProfile } from './components/AssessmentProfile'

export const AssessmentPage = (): JSX.Element => {
  const { courseParticipationID } = useParams<{ courseParticipationID: string }>()

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

  if (!studentAssessment) {
    return (
      <ErrorPage
        title='No participant found for this course participation ID'
        description='We like what you are doing. To contribute, checkout https://github.com/ls1intum/prompt2'
      />
    )
  }

  if (isStudentAssessmentError) return <ErrorPage onRetry={refetchStudentAssessment} />
  if (isStudentAssessmentPending)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold tracking-tight'>Assess Competencies</h1>

      {participant && (
        <AssessmentProfile participant={participant} studentAssessment={studentAssessment} />
      )}

      {categories.map((category) => (
        <CategoryAssessment
          key={category.id}
          category={category}
          remainingAssessments={
            studentAssessment.remainingAssessments.categories?.find(
              (item) => item.categoryID === category.id,
            )?.remainingAssessments ?? 0
          }
          assessments={studentAssessment.assessments}
          completed={studentAssessment.assessmentCompletion.completed}
        />
      ))}
    </div>
  )
}
