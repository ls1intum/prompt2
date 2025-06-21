import { Loader2 } from 'lucide-react'

import { ManagementPageHeader, ErrorPage } from '@tumaet/prompt-ui-components'

import { useCategoryStore } from '../../zustand/useCategoryStore'
import { useParticipationStore } from '../../zustand/useParticipationStore'
import { useScoreLevelStore } from '../../zustand/useScoreLevelStore'

import { useGetAllAssessments } from '../hooks/useGetAllAssessments'

import { CategoryDiagram } from '../components/diagrams/CategoryDiagram'
import { AssessmentScoreLevelDiagram } from '../components/diagrams/AssessmentScoreLevelDiagram'

import { AssessmentTemplateSelection } from './components/AssessmentTemplateSelection/AssessmentTemplateSelection'
import { CategoryList } from './components/CategoryList'
import { CreateCategoryForm } from './components/CreateCategoryForm'

export const SettingsPage = (): JSX.Element => {
  const { participations } = useParticipationStore()
  const { categories } = useCategoryStore()
  const { scoreLevels } = useScoreLevelStore()

  const {
    data: assessments,
    isPending: isAssessmentsPending,
    isError: isAssessmentsError,
    refetch: refetchAssessments,
  } = useGetAllAssessments()

  return (
    <div className='space-y-4'>
      <ManagementPageHeader>Assessment Settings</ManagementPageHeader>

      {isAssessmentsError ? (
        <div>
          <ErrorPage onRetry={refetchAssessments} description='Could not fetch assessments' />
        </div>
      ) : isAssessmentsPending ? (
        <div className='flex justify-center items-center h-64'>
          <Loader2 className='h-12 w-12 animate-spin text-primary' />
        </div>
      ) : (
        <div className='grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:col-span-4mb-4'>
          <AssessmentScoreLevelDiagram participations={participations} scoreLevels={scoreLevels} />
          <CategoryDiagram categories={categories} assessments={assessments} />
        </div>
      )}

      <AssessmentTemplateSelection />
      <CategoryList />
      <CreateCategoryForm />
    </div>
  )
}
