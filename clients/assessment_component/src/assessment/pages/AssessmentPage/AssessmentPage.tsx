import { Loader2 } from 'lucide-react'

import { Card } from '@/components/ui/card'

import { useGetAllCategoriesWithCompetencies } from '../hooks/useGetAllCategoriesWithCompetencies'
import { useGetAllStudentAssessmentsInPhase } from './hooks/useGetAllStudentAssessmentsInPhase'
import AssessmentStatusBadge from './components/AssessmentStatusBadge'
import { ErrorPage } from '@/components/ErrorPage'
import { useRemainingAssessmentsForStudent } from './hooks/useRemainingAssessmentsForStudent'
import { CategoryAssessment } from './components/CategoryAssessment'
import { useGetRemainingAssessmentsForStudentPerCategory } from './hooks/useGetRemainingAssessmentsForStudentPerCategory'

export const AssessmentPage = (): JSX.Element => {
  const {
    data: categories,
    isPending: isCategoriesPending,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useGetAllCategoriesWithCompetencies()

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
  } = useRemainingAssessmentsForStudent()

  const {
    data: categoriesWithRemainingAssessments,
    isPending: isCategoriesWithRemainingAssessmentsPending,
    isError: isCategoriesWithRemainingAssessmentsError,
    refetch: refetchCategoriesWithRemainingAssessments,
  } = useGetRemainingAssessmentsForStudentPerCategory()

  const handleRefetch = () => {
    refetchCategories()
    refetchAssessments()
    refetchRemainingAssessments()
    refetchCategoriesWithRemainingAssessments()
  }

  const isError =
    isCategoriesError ||
    isAssessmentsError ||
    isRemainingAssessmentsError ||
    isCategoriesWithRemainingAssessmentsError
  const isPending =
    isCategoriesPending ||
    isAssessmentsPending ||
    isRemainingAssessmentsPending ||
    isCategoriesWithRemainingAssessmentsPending

  if (isError) return <ErrorPage onRetry={handleRefetch} />
  if (isPending)
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )

  if (!categories || categories.length === 0)
    return (
      <Card className='p-6 text-center text-muted-foreground'>
        <p>No categories found. Create your first category to get started.</p>
      </Card>
    )

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-semibold tracking-tight'>Assess Competencies</h1>
      <AssessmentStatusBadge remainingAssessments={remainingAssessments} />

      {categories.map((category) => {
        return (
          <CategoryAssessment
            category={category}
            remainingAssessments={
              categoriesWithRemainingAssessments.find((item) => item.categoryID === category.id)
                ?.remainingAssessments ?? 0
            }
            assessments={assessments}
          />
        )
      })}
    </div>
  )
}
