import { Loader2 } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { useGetAllStudentAssessmentsInPhase } from './hooks/useGetAllStudentAssessmentsInPhase'
import { ErrorPage } from '@/components/ErrorPage'
import { useGetRemainingAssessmentsForStudent } from './hooks/useGetRemainingAssessmentsForStudent'
import { CategoryAssessment } from './components/CategoryAssessment'
import { useGetRemainingAssessmentsForStudentPerCategory } from './hooks/useGetRemainingAssessmentsForStudentPerCategory'
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
    data: assessments,
    isPending: isAssessmentsPending,
    isError: isAssessmentsError,
    refetch: refetchAssessments,
  } = useGetAllStudentAssessmentsInPhase()

  const {
    data: remainingAssessments,
    isPending: isRemainingAssessmentsPending,
    isError: isRemainingAssessmentsError,
    refetch: refetchRemainingAssessments,
  } = useGetRemainingAssessmentsForStudent()

  const {
    data: categoriesWithRemainingAssessments,
    isPending: isCategoriesWithRemainingAssessmentsPending,
    isError: isCategoriesWithRemainingAssessmentsError,
    refetch: refetchCategoriesWithRemainingAssessments,
  } = useGetRemainingAssessmentsForStudentPerCategory()

  const handleRefetch = () => {
    refetchAssessments()
    refetchRemainingAssessments()
    refetchCategoriesWithRemainingAssessments()
  }

  const isError =
    isAssessmentsError || isRemainingAssessmentsError || isCategoriesWithRemainingAssessmentsError
  const isPending =
    isAssessmentsPending ||
    isRemainingAssessmentsPending ||
    isCategoriesWithRemainingAssessmentsPending

  if (!participant) {
    return (
      <ErrorPage
        title='No participant found for this course participation ID'
        description='We like what you are doing. To contribute, checkout https://github.com/ls1intum/prompt2'
      />
    )
  }

  if (isError) return <ErrorPage onRetry={handleRefetch} />
  if (isPending)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold tracking-tight'>Assess Competencies</h1>

      {participant && (
        <AssessmentProfile
          participant={participant}
          remainingAssessments={remainingAssessments}
          assessments={assessments}
        />
      )}

      {categories.map((category) => {
        return (
          <CategoryAssessment
            key={category.id}
            category={category}
            remainingAssessments={
              categoriesWithRemainingAssessments?.find((item) => item.categoryID === category.id)
                ?.remainingAssessments ?? 0
            }
            assessments={assessments}
          />
        )
      })}
    </div>
  )
}
