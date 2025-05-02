import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

import { ErrorPage, ManagementPageHeader } from '@tumaet/prompt-ui-components'

import { Assessment } from '../../interfaces/assessment'

import { useParticipationStore } from '../../zustand/useParticipationStore'
import { useCategoryStore } from '../../zustand/useCategoryStore'
import { useScoreLevelStore } from '../../zustand/useScoreLevelStore'

import { getAllAssessmentsInPhase } from '../../network/queries/getAllAssessmentsInPhase'

import { AssessmentDiagram } from './diagrams/AssessmentDiagram'

export const AssessmentStatisticsPage = (): JSX.Element => {
  const { phaseId } = useParams<{ phaseId: string }>()

  const { participations } = useParticipationStore()
  const { categories } = useCategoryStore()
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

  const isError = isAssessmentsError
  const isPending = isAssessmentsPending

  const refetch = () => {
    refetchAssessments()
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

      <AssessmentDiagram participations={participations} scoreLevels={scoreLevels} />
      {/* Add your statistics components here */}
    </div>
  )
}
