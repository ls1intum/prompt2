import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

import { ErrorPage, ManagementPageHeader } from '@tumaet/prompt-ui-components'

import { Assessment, AssessmentCompletion } from '../../interfaces/assessment'

import { useCategoryStore } from '../../zustand/useCategoryStore'
import { useParticipationStore } from '../../zustand/useParticipationStore'
import { useScoreLevelStore } from '../../zustand/useScoreLevelStore'

import { getAllAssessmentsInPhase } from '../../network/queries/getAllAssessmentsInPhase'
import { getAllAssessmentCompletionsinPhase } from '../../network/queries/getAllAssessmentCompletionsInPhase'

import { useGetParticipantionsWithAssessment } from './hooks/useGetParticipantWithAssessment'

import { AssessmentDiagram } from './diagrams/AssessmentDiagram'
import { AssessmentScoreLevelDiagram } from './diagrams/AssessmentScoreLevelDiagram'
import { GenderDiagram } from './diagrams/GenderDiagram'
import { AuthorDiagram } from './diagrams/AuthorDiagram'
import { CategoryDiagram } from './diagrams/CategoryDiagram'
import { NationalityDiagram } from './diagrams/NationalityDiagram'

export const AssessmentStatisticsPage = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const { categories } = useCategoryStore()
  const { participations } = useParticipationStore()
  const { scoreLevels } = useScoreLevelStore()

  const {
    data: assessments,
    isPending: isAssessmentsPending,
    isError: isAssessmentsError,
    refetch: refetchAssessments,
  } = useQuery<Assessment[]>({
    queryKey: ['assessments', phaseId],
    queryFn: () => getAllAssessmentsInPhase(phaseId ?? ''),
  })

  const {
    data: assessmentCompletions,
    isPending: isAssessmentCompletionsPending,
    isError: isAssessmentCompletionsError,
    refetch: refetchAssessmentCompletions,
  } = useQuery<AssessmentCompletion[]>({
    queryKey: ['assessmentCompletions', phaseId],
    queryFn: () => getAllAssessmentCompletionsinPhase(phaseId ?? ''),
  })

  const participationsWithAssessments = useGetParticipantionsWithAssessment(
    participations || [],
    scoreLevels || [],
    assessmentCompletions || [],
  )

  console.log('participationsWithAssessments', participationsWithAssessments)

  const isError = isAssessmentsError || isAssessmentCompletionsError
  const isPending = isAssessmentsPending || isAssessmentCompletionsPending

  const refetch = () => {
    refetchAssessments()
    refetchAssessmentCompletions()
  }

  if (isError) {
    return <ErrorPage message='Error loading assessments' onRetry={refetch} />
  }
  if (isPending) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <ManagementPageHeader>Assessment Statistics</ManagementPageHeader>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6'>
        <AssessmentDiagram participations={participations} scoreLevels={scoreLevels} />
        <AssessmentScoreLevelDiagram participations={participations} scoreLevels={scoreLevels} />
        <GenderDiagram participationsWithAssessment={participationsWithAssessments} />
        <AuthorDiagram participationsWithAssessment={participationsWithAssessments} />
        <CategoryDiagram categories={categories} assessments={assessments} />
        <NationalityDiagram participationsWithAssessment={participationsWithAssessments} />
      </div>
    </div>
  )
}
