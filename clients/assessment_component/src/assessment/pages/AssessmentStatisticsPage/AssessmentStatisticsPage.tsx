import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

import { ErrorPage, ManagementPageHeader } from '@tumaet/prompt-ui-components'

import { AssessmentCompletion } from '../../interfaces/assessmentCompletion'

import { useCategoryStore } from '../../zustand/useCategoryStore'
import { useParticipationStore } from '../../zustand/useParticipationStore'
import { useScoreLevelStore } from '../../zustand/useScoreLevelStore'

import { getAllAssessmentCompletionsInPhase } from '../../network/queries/getAllAssessmentCompletionsInPhase'

import { useGetAllAssessments } from '../hooks/useGetAllAssessments'

import { useGetParticipationsWithAssessment } from '../components/diagrams/hooks/useGetParticipantWithAssessment'

import { AssessmentDiagram } from '../components/diagrams/AssessmentDiagram'
import { AssessmentScoreLevelDiagram } from '../components/diagrams/AssessmentScoreLevelDiagram'
import { GenderDiagram } from '../components/diagrams/GenderDiagram'
import { AuthorDiagram } from '../components/diagrams/AuthorDiagram'
import { CategoryDiagram } from '../components/diagrams/CategoryDiagram'
import { NationalityDiagram } from '../components/diagrams/NationalityDiagram'

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
  } = useGetAllAssessments()

  const {
    data: assessmentCompletions,
    isPending: isAssessmentCompletionsPending,
    isError: isAssessmentCompletionsError,
    refetch: refetchAssessmentCompletions,
  } = useQuery<AssessmentCompletion[]>({
    queryKey: ['assessmentCompletions', phaseId],
    queryFn: () => getAllAssessmentCompletionsInPhase(phaseId ?? ''),
  })

  const participationsWithAssessments = useGetParticipationsWithAssessment(
    participations || [],
    scoreLevels || [],
    assessmentCompletions || [],
    assessments || [],
  )

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

      <div className='grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 mb-6'>
        <AssessmentDiagram
          participations={participations}
          scoreLevels={scoreLevels}
          completions={assessmentCompletions}
        />
        <AssessmentScoreLevelDiagram participations={participations} scoreLevels={scoreLevels} />
        <GenderDiagram participationsWithAssessment={participationsWithAssessments} />
        <CategoryDiagram categories={categories} assessments={assessments} />
        <AuthorDiagram participationsWithAssessment={participationsWithAssessments} />
        <NationalityDiagram participationsWithAssessment={participationsWithAssessments} />
      </div>
    </div>
  )
}
